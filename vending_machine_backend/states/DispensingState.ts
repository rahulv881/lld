import { EventType } from "../Event";
import { OrderStatus } from "../OrderStatus";
import type { VendingMachine } from "../VendingMachine";
import type { StateDefinition } from "./StateDefinition";
import { Status } from "./statuses";
import { VendingMachineState } from "./VendingMachineState";

export class DispensingState extends VendingMachineState {
    onEnter(machine: VendingMachine): void {
        const order = machine.sale.order;
        const line = order?.getLines()[0];
        if (!order || !line) {
            machine.enterError(EventType.OUT_OF_STOCK, "Nothing to dispense.", Status.IDLE);
            return;
        }

        const change = machine.sale.insertedTotal() - order.getTotal();
        const bills = machine.sale.takeBills();
        if (!machine.getCashBox().takePayment(bills, change)) {
            machine.sale.restoreBills(bills);
            machine.enterError(
                EventType.EXCHANGE_NOT_AVAILABLE,
                "Exchange is not available for this payment. Continue to try another amount, or cancel for a refund.",
                Status.PROCESSING_ORDER,
            );
            return;
        }

        machine.getInventory().reduce(line.product.getProductId(), line.quantity);
        order.setStatus(OrderStatus.COMPLETED);
        machine.getDispenser().dispense(line.product, line.quantity);
        machine.sale.dispensed = { name: line.product.getProductName(), quantity: line.quantity };
        machine.sale.changeAmount = change;
        if (change > 0) machine.getDispenser().returnExchange(change);

        machine.notify(EventType.NOTIFY_DESPENSER, `Dispense ${line.quantity} ${line.product.getProductName()}.`);
        machine.notify(EventType.COMPLETE_PAYMENT, "Payment completed.");
        machine.notify(EventType.COMPLETE_ORDER, `Order ${order.getId()} completed.`);
        if (change > 0) machine.notify(EventType.EXCHANGE_MONEY, `Returning ${change} exchange.`);
        machine.notify(
            EventType.DESPENSE_PRODUCT,
            change > 0
                ? `Dispensing ${line.quantity} ${line.product.getProductName()}. Returning ${change} exchange.`
                : `Dispensing ${line.quantity} ${line.product.getProductName()}.`,
        );
    }

    selectProduct(machine: VendingMachine): boolean {
        return this.wait(machine);
    }

    insertMoney(machine: VendingMachine): boolean {
        return this.wait(machine);
    }

    buy(machine: VendingMachine): boolean {
        return this.wait(machine);
    }

    cancel(machine: VendingMachine): boolean {
        return this.wait(machine);
    }

    startInventoryLoad(machine: VendingMachine): boolean {
        return this.wait(machine);
    }

    startMaintenance(machine: VendingMachine): boolean {
        return this.wait(machine);
    }

    acknowledge(machine: VendingMachine): boolean {
        machine.sale.clear();
        machine.transitionTo(Status.IDLE);
        machine.notify(EventType.NOTIFY_USER, "Select a product.");
        return true;
    }

    private wait(machine: VendingMachine): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "Collect the item before continuing.");
    }
}

export const dispensingDefinition: StateDefinition = {
    status: Status.DISPENSING_ORDER,
    transitions: [Status.IDLE, Status.ERROR],
    create: () => new DispensingState(),
};
