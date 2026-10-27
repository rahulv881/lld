import { ACCEPTED_BILLS } from "./CashBox";
import { ErrorType } from "./Event";
import { EventLog } from "./EventLog";
import { Inventory } from "./Inventory";
import { Dispensed, Sale, Selection } from "./Sale";
import type { MachineStatus } from "./states/statuses";

export type { MachineStatus } from "./states/statuses";

export type MachineSnapshot = {
    status: MachineStatus;
    errorType: ErrorType | null;
    products: {
        position: number;
        empty: boolean;
        id: string | null;
        name: string | null;
        price: number | null;
        quantity: number | null;
    }[];
    selection: Selection | null;
    insertedAmount: number;
    order: {
        id: string;
        total: number;
        status: string;
        quantity: number;
        products: { id: string; name: string; price: number }[];
    } | null;
    message: string;
    events: { type: string; message: string }[];
    dispensed: Dispensed | null;
    changeAmount: number | null;
    acceptedBills: readonly number[];
    maxQuantity: number;
    paymentTimeoutMs: number;
    error?: string;
};

type SnapshotSource = {
    status: MachineStatus;
    errorType: ErrorType | null;
    actionError: string | null;
    inventory: Inventory;
    sale: Sale;
    log: EventLog;
    maxQuantity: number;
    paymentTimeoutMs: number;
};

export function buildSnapshot(src: SnapshotSource): MachineSnapshot {
    const { sale } = src;
    const order = sale.order;
    const line = order?.getLines()[0];
    const body: MachineSnapshot = {
        status: src.status,
        errorType: src.errorType,
        products: src.inventory.entries().map(({ position, product }) => product ? {
            position,
            empty: false,
            id: product.getProductId(),
            name: product.getProductName(),
            price: product.getProductPrice(),
            quantity: product.getProductQuantity(),
        } : {
            position,
            empty: true,
            id: null,
            name: null,
            price: null,
            quantity: null,
        }),
        selection: sale.selection,
        insertedAmount: sale.insertedTotal(),
        order: order && line ? {
            id: order.getId(),
            total: order.getTotal(),
            status: order.getStatus(),
            quantity: line.quantity,
            products: order.getLines().map((item) => ({
                id: item.product.getProductId(),
                name: item.product.getProductName(),
                price: item.product.getProductPrice(),
            })),
        } : null,
        message: src.log.message,
        events: src.log.list(),
        dispensed: sale.dispensed,
        changeAmount: sale.changeAmount,
        acceptedBills: ACCEPTED_BILLS,
        maxQuantity: src.maxQuantity,
        paymentTimeoutMs: src.paymentTimeoutMs,
    };
    if (src.actionError) body.error = src.actionError;
    return body;
}
