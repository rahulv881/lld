import http from "node:http";
import { Order } from "./Order";
import { OrderStatus } from "./OrderStatus";
import { Product } from "./Product";
import { ProductManager } from "./ProductManager";
import { VendingMachineHardware } from "./VendingMachineHardware";

const PORT = Number(process.env.PORT ?? 3040);

const hardware = new VendingMachineHardware();
hardware.bulkUpdateInventory();

type MachineEvent = { type: string; message: string };

type Session = {
    position: number | null;
    quantity: number;
    insertedAmount: number;
    order: Order | null;
    message: string;
    events: MachineEvent[];
    dispensed: { name: string; quantity: number } | null;
    changeAmount: number | null;
};

let orderCounter = 1;
let productCounter = 6;

const session: Session = {
    position: null,
    quantity: 1,
    insertedAmount: 0,
    order: null,
    message: "Select a product",
    events: [],
    dispensed: null,
    changeAmount: null,
};

function notify(type: string, message: string) {
    session.message = message;
    session.events = [{ type, message }, ...session.events].slice(0, 8);
}

function snapshot() {
    const products = hardware.getInventory().getProducts().map((product, position) => ({
        position,
        id: product.getProductId(),
        name: product.getProductName(),
        price: product.getProductPrice(),
        quantity: product.getProductQuantity(),
    }));
    const order = session.order;

    return {
        products,
        selection: session.position === null ? null : {
            position: session.position,
            quantity: session.quantity,
        },
        insertedAmount: session.insertedAmount,
        order: order ? {
            id: order.getId(),
            total: order.getTotal(),
            status: order.getStatus(),
            quantity: session.quantity,
            products: order.getProducts().map((product) => ({
                id: product.getProductId(),
                name: product.getProductName(),
                price: product.getProductPrice(),
            })),
        } : null,
        message: session.message,
        events: session.events,
        dispensed: session.dispensed,
        changeAmount: session.changeAmount,
    };
}

function manager() {
    return new ProductManager(hardware.getInventory());
}

function fail(status: number, message: string, type: string) {
    notify(type, message);
    return { status, body: { ...snapshot(), error: message } };
}

function ok() {
    return { status: 200, body: snapshot() };
}

function note(message: string, type: string) {
    notify(type, message);
    return ok();
}

function selectProduct(body: Record<string, unknown>) {
    const position = body.position;
    const quantity = body.quantity === undefined ? 1 : body.quantity;
    if (typeof position !== "number" || !Number.isInteger(position) || position < 0) {
        return fail(400, "Invalid product selected", "SELECT_PRODUCT");
    }
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
        return fail(400, "Invalid quantity", "SELECT_PRODUCT");
    }

    const products = hardware.getInventory().getProducts();
    if (position >= products.length) {
        return fail(400, "Invalid product selected", "SELECT_PRODUCT");
    }

    let product: Product | null;
    try {
        product = manager().selectProduct(position, quantity);
    } catch {
        return fail(400, "Invalid product selected", "SELECT_PRODUCT");
    }

    if (!product) {
        const name = products[position].getProductName();
        return note(`Out of stock: ${name}`, "OUT_OF_STOCK");
    }

    if (session.order?.getStatus() === OrderStatus.PENDING) {
        session.order.setStatus(OrderStatus.CANCELLED);
    }

    session.position = position;
    session.quantity = quantity;
    session.dispensed = null;
    session.changeAmount = null;
    session.order = new Order(`ORDER_${orderCounter++}`, [{ product, quantity }]);
    notify("START_ORDER", `Please insert money: ${session.order.getTotal()} rupees`);
    return ok();
}

function insertMoney(body: Record<string, unknown>) {
    const amount = body.amount;
    if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
        return fail(400, "Invalid currency", "INVALID_CURRENCY");
    }
    if (!session.order || session.order.getStatus() !== OrderStatus.PENDING) {
        return fail(400, "Select a product before inserting money", "SELECT_MONEY");
    }

    session.insertedAmount += amount;
    const due = session.order.getTotal() - session.insertedAmount;
    const message = due > 0
        ? `Inserted ${amount}. Credit ${session.insertedAmount}. Need ${due} more.`
        : `Inserted ${amount}. Credit ${session.insertedAmount}. Press buy.`;
    notify("SELECT_MONEY", message);
    return ok();
}

function buy() {
    if (!session.order || session.order.getStatus() !== OrderStatus.PENDING || session.position === null) {
        return fail(400, "Select a product to buy", "COMPLETE_ORDER");
    }

    const total = session.order.getTotal();
    if (session.insertedAmount < total) {
        return note(`Not enough money. Need ${total - session.insertedAmount} more.`, "START_PAYMENT");
    }

    const product = session.order.getProducts()[0];
    const quantity = session.quantity;
    if (!product || product.getProductQuantity() < quantity) {
        return note(`Out of stock: ${product?.getProductName() ?? "item"}`, "OUT_OF_STOCK");
    }

    hardware.getInventory().updateProduct({
        id: product.getProductId(),
        quantity: product.getProductQuantity() - quantity,
    });
    session.order.setStatus(OrderStatus.COMPLETED);
    VendingMachineHardware.despenseProduct({ product, quantity });
    const change = session.insertedAmount - total;
    VendingMachineHardware.returnExchange({ amount: change });

    session.dispensed = { name: product.getProductName(), quantity };
    session.changeAmount = change;
    notify(
        "DESPENSE_PRODUCT",
        change > 0
            ? `Dispensing ${quantity} ${product.getProductName()}. Returning ${change} exchange.`
            : `Dispensing ${quantity} ${product.getProductName()}.`,
    );

    session.position = null;
    session.quantity = 1;
    session.insertedAmount = 0;
    session.order = null;
    return ok();
}

function cancel() {
    const refund = session.insertedAmount;
    const hadOrder = session.order?.getStatus() === OrderStatus.PENDING;
    if (!hadOrder && refund === 0) {
        return fail(400, "Nothing to cancel", "CANCEL_ORDER");
    }
    if (session.order && hadOrder) {
        session.order.setStatus(OrderStatus.CANCELLED);
    }
    if (refund > 0) {
        VendingMachineHardware.returnExchange({ amount: refund });
    }

    session.position = null;
    session.quantity = 1;
    session.insertedAmount = 0;
    session.order = null;
    session.dispensed = null;
    session.changeAmount = refund > 0 ? refund : null;
    notify(
        "CANCEL_ORDER",
        refund > 0 ? `Transaction cancelled. Returning ${refund}.` : "Transaction cancelled.",
    );
    return ok();
}

function addProduct(body: Record<string, unknown>) {
    const { name, price, quantity } = body;
    if (typeof name !== "string" || name.trim().length === 0) {
        return fail(400, "Product name is required", "NOTIFY_USER");
    }
    if (typeof price !== "number" || !Number.isInteger(price) || price <= 0) {
        return fail(400, "Price must be a positive whole number of rupees", "NOTIFY_USER");
    }
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0) {
        return fail(400, "Quantity must be zero or more", "NOTIFY_USER");
    }

    const product = new Product(`Product_${productCounter++}`, name.trim(), price, quantity);
    hardware.getInventory().addProduct(product);
    notify("NOTIFY_USER", `Added ${product.getProductName()} at ${product.getProductPrice()} rupees.`);
    return ok();
}

function addInventory(body: Record<string, unknown>) {
    const { id, quantity } = body;
    if (typeof id !== "string" || id.length === 0) {
        return fail(400, "Choose a product to restock", "NOTIFY_USER");
    }
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
        return fail(400, "Add at least 1 item", "NOTIFY_USER");
    }

    let product: Product;
    try {
        product = hardware.getInventory().getProductById(id);
    } catch {
        return fail(404, "Product not found", "NOTIFY_USER");
    }

    const nextQuantity = product.getProductQuantity() + quantity;
    hardware.getInventory().updateProduct({ id, quantity: nextQuantity });
    notify("NOTIFY_USER", `Restocked ${product.getProductName()}. Quantity is ${nextQuantity}.`);
    return ok();
}

const routes: Record<string, (body: Record<string, unknown>) => { status: number; body: unknown }> = {
    "POST /api/select": selectProduct,
    "POST /api/insert": insertMoney,
    "POST /api/buy": () => buy(),
    "POST /api/cancel": () => cancel(),
    "POST /api/products": addProduct,
    "POST /api/inventory": addInventory,
};

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

function send(res: http.ServerResponse, status: number, body: unknown) {
    res.writeHead(status, { ...corsHeaders, "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
}

function readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => {
            if (chunks.length === 0) {
                resolve({});
                return;
            }
            try {
                const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString());
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    resolve(parsed as Record<string, unknown>);
                    return;
                }
                resolve({});
            } catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const key = `${req.method} ${url.pathname}`;

    try {
        if (key === "GET /api/machine") {
            send(res, 200, snapshot());
            return;
        }
        const handler = routes[key];
        if (!handler) {
            send(res, 404, { error: "Not found" });
            return;
        }
        let body: Record<string, unknown>;
        try {
            body = await readBody(req);
        } catch {
            send(res, 400, { error: "Invalid JSON" });
            return;
        }
        const result = handler(body);
        send(res, result.status, result.body);
    } catch {
        send(res, 500, { error: "Unexpected error" });
    }
});

server.listen(PORT, () => {
    console.log(`Vending machine API listening on http://localhost:${PORT}`);
});
