import { EventType } from "../Event";
import { Product } from "../Product";
import type { VendingMachine } from "../VendingMachine";
import { isWhole } from "../guards";
import type { StateDefinition } from "./StateDefinition";
import { Status } from "./statuses";
import { VendingMachineState } from "./VendingMachineState";

export class BulkInventoryState extends VendingMachineState {
    selectProduct(machine: VendingMachine): boolean {
        return machine.refuse(EventType.SELECT_PRODUCT, "Quit inventory loading before selecting a product.");
    }

    insertMoney(machine: VendingMachine): boolean {
        return machine.refuse(EventType.SELECT_MONEY, "Quit inventory loading before inserting money.");
    }

    buy(machine: VendingMachine): boolean {
        return machine.refuse(EventType.COMPLETE_ORDER, "Quit inventory loading before buying.");
    }

    addProduct(machine: VendingMachine, position: unknown, name: unknown, price: unknown, quantity: unknown): boolean {
        if (!isWhole(position) || position < 0) {
            return machine.refuse(EventType.NOTIFY_USER, "Choose an empty slot.");
        }
        if (typeof name !== "string" || name.trim().length === 0) {
            return machine.refuse(EventType.NOTIFY_USER, "Product name is required.");
        }
        if (!isWhole(price) || price <= 0) {
            return machine.refuse(EventType.NOTIFY_USER, "Price must be a positive whole number of rupees.");
        }
        if (!isWhole(quantity) || quantity < 0) {
            return machine.refuse(EventType.NOTIFY_USER, "Quantity must be zero or more.");
        }

        const slot = machine.getInventory().at(position);
        if (slot === undefined) return machine.refuse(EventType.NOTIFY_USER, "Choose an empty slot.");
        if (slot !== null) return machine.refuse(EventType.NOTIFY_USER, "That position already has a product.");

        const product = new Product(machine.nextProductId(), name.trim(), price, quantity);
        machine.getInventory().place(position, product);
        machine.notify(EventType.NOTIFY_USER, `Added ${product.getProductName()} at ${product.getProductPrice()} rupees.`);
        return true;
    }

    addInventory(machine: VendingMachine, id: unknown, quantity: unknown): boolean {
        if (typeof id !== "string" || id.length === 0) {
            return machine.refuse(EventType.NOTIFY_USER, "Choose a product to restock.");
        }
        if (!isWhole(quantity) || quantity < 1) {
            return machine.refuse(EventType.NOTIFY_USER, "Add at least 1 item.");
        }

        const product = machine.getInventory().findById(id);
        if (!product) return machine.refuse(EventType.NOTIFY_USER, "Product not found.");
        product.setProductQuantity(product.getProductQuantity() + quantity);
        machine.notify(EventType.NOTIFY_USER, `Restocked ${product.getProductName()}. Quantity is ${product.getProductQuantity()}.`);
        return true;
    }

    quitInventoryLoad(machine: VendingMachine): boolean {
        machine.transitionTo(Status.IDLE);
        machine.notify(EventType.NOTIFY_USER, "Inventory loading finished. Select a product.");
        return true;
    }
}

export const bulkInventoryDefinition: StateDefinition = {
    status: Status.BULK_INVENTORY_UPDATE,
    transitions: [Status.IDLE],
    create: () => new BulkInventoryState(),
};
