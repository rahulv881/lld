import { EventType } from "../Event";
import { Order } from "../Order";
import type { VendingMachine } from "../VendingMachine";
import { isWhole } from "../guards";
import type { StateDefinition } from "./StateDefinition";
import { Status } from "./statuses";
import { VendingMachineState } from "./VendingMachineState";

export class IdleState extends VendingMachineState {
    selectProduct(machine: VendingMachine, position: unknown, quantity: unknown): boolean {
        if (!isWhole(position) || position < 0) {
            return machine.refuse(EventType.SELECT_PRODUCT, "Invalid product selected.");
        }
        if (!isWhole(quantity) || quantity < 1) {
            return machine.refuse(EventType.SELECT_PRODUCT, "Invalid quantity.");
        }
        if (quantity > machine.getMaxQuantity()) {
            return machine.refuse(EventType.SELECT_PRODUCT, `Quantity cannot exceed ${machine.getMaxQuantity()}.`);
        }

        const product = machine.getInventory().at(position);
        if (!product) {
            return machine.refuse(EventType.SELECT_PRODUCT, "Invalid product selected.");
        }
        if (product.getProductQuantity() < quantity) {
            machine.enterError(
                EventType.OUT_OF_STOCK,
                `Out of stock: ${product.getProductName()}.`,
                Status.IDLE,
            );
            return true;
        }

        const order = new Order(machine.nextOrderId(), [{ product, quantity }]);
        machine.sale.begin(position, quantity, order);
        const seconds = Math.round(machine.getPaymentTimeoutMs() / 1000);
        machine.notify(EventType.START_PAYMENT, `Payment started for ${order.getTotal()} rupees.`);
        machine.notify(
            EventType.START_ORDER,
            `Please insert money: ${order.getTotal()} rupees. You have ${seconds} seconds.`,
        );
        machine.transitionTo(Status.PROCESSING_ORDER);
        return true;
    }

    insertMoney(machine: VendingMachine): boolean {
        return machine.refuse(EventType.SELECT_MONEY, "Select a product before inserting money.");
    }

    buy(machine: VendingMachine): boolean {
        return machine.refuse(EventType.COMPLETE_ORDER, "Select a product to buy.");
    }

    cancel(machine: VendingMachine): boolean {
        return machine.refuse(EventType.CANCEL_ORDER, "Nothing to cancel.");
    }

    startInventoryLoad(machine: VendingMachine, password: unknown): boolean {
        if (typeof password !== "string" || password !== machine.getInventoryPassword()) {
            return machine.refuse(EventType.NOTIFY_USER, "Invalid password.");
        }
        machine.transitionTo(Status.BULK_INVENTORY_UPDATE);
        machine.notify(EventType.NOTIFY_USER, "Inventory loading started. Choose an empty slot.");
        return true;
    }

    startMaintenance(machine: VendingMachine): boolean {
        machine.transitionTo(Status.UNDER_MAINTENANCE);
        machine.notify(EventType.NOTIFY_USER, "Machine is under maintenance.");
        return true;
    }
}

export const idleDefinition: StateDefinition = {
    status: Status.IDLE,
    transitions: [Status.PROCESSING_ORDER, Status.BULK_INVENTORY_UPDATE, Status.UNDER_MAINTENANCE, Status.ERROR],
    create: () => new IdleState(),
};
