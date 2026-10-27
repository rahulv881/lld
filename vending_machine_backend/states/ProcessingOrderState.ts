import { EventType } from "../Event";
import { OrderStatus } from "../OrderStatus";
import type { VendingMachine } from "../VendingMachine";
import { isAcceptedBill } from "../CashBox";
import { isWhole } from "../guards";
import type { StateDefinition } from "./StateDefinition";
import { Status } from "./statuses";
import { VendingMachineState } from "./VendingMachineState";

export class ProcessingOrderState extends VendingMachineState {
    private timer: ReturnType<typeof setTimeout> | null = null;

    onEnter(machine: VendingMachine): void {
        const timer = setTimeout(() => {
            machine.mutate(() => {
                if (machine.getState() !== this) return;
                const amount = machine.releasePayment();
                machine.notify(
                    EventType.CANCEL_ORDER,
                    amount > 0 ? `Transaction cancelled. Returning ${amount}.` : "Transaction cancelled.",
                );
                machine.enterError(
                    EventType.TIMEOUT,
                    amount > 0 ? `Payment timed out. Returning ${amount}.` : "Payment timed out.",
                    Status.IDLE,
                );
            });
        }, machine.getPaymentTimeoutMs());
        // unref exists on Node timers only; keeps the process from hanging on it
        (timer as { unref?: () => void }).unref?.();
        this.timer = timer;
    }

    onExit(): void {
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
    }

    selectProduct(machine: VendingMachine): boolean {
        return machine.refuse(EventType.SELECT_PRODUCT, "Cancel the current order before selecting another product.");
    }

    insertMoney(machine: VendingMachine, amount: unknown): boolean {
        if (!isWhole(amount) || amount <= 0 || !isAcceptedBill(amount)) {
            machine.enterError(
                EventType.INVALID_CURRENCY,
                "Invalid currency. Use 1, 2, 5, 10, or 20.",
                Status.PROCESSING_ORDER,
            );
            return true;
        }

        machine.sale.addBill(amount);
        const order = machine.sale.order;
        const inserted = machine.sale.insertedTotal();
        const due = (order?.getTotal() ?? 0) - inserted;
        machine.notify(
            EventType.SELECT_MONEY,
            due > 0
                ? `Inserted ${amount}. Credit ${inserted}. Need ${due} more.`
                : `Inserted ${amount}. Credit ${inserted}. Press buy.`,
        );
        return true;
    }

    buy(machine: VendingMachine): boolean {
        const order = machine.sale.order;
        const line = order?.getLines()[0];
        if (!order || order.getStatus() !== OrderStatus.IN_PROGRESS || !line) {
            return machine.refuse(EventType.COMPLETE_ORDER, "Select a product to buy.");
        }

        const total = order.getTotal();
        const inserted = machine.sale.insertedTotal();
        if (inserted < total) {
            machine.notify(EventType.START_PAYMENT, `Not enough money. Need ${total - inserted} more.`);
            return true;
        }

        if (line.product.getProductQuantity() < line.quantity) {
            machine.releasePayment();
            machine.notify(EventType.CANCEL_ORDER, "Order cancelled because the item is out of stock.");
            machine.enterError(EventType.OUT_OF_STOCK, `Out of stock: ${line.product.getProductName()}.`, Status.IDLE);
            return true;
        }

        const change = inserted - total;
        if (!machine.getCashBox().canTakePayment(machine.sale.getBills(), change)) {
            machine.enterError(
                EventType.EXCHANGE_NOT_AVAILABLE,
                "Exchange is not available for this payment. Continue to try another amount, or cancel for a refund.",
                Status.PROCESSING_ORDER,
            );
            return true;
        }

        machine.transitionTo(Status.DISPENSING_ORDER);
        return true;
    }

    cancel(machine: VendingMachine): boolean {
        const amount = machine.releasePayment();
        machine.transitionTo(Status.IDLE);
        machine.notify(
            EventType.CANCEL_ORDER,
            amount > 0 ? `Transaction cancelled. Returning ${amount}.` : "Transaction cancelled.",
        );
        return true;
    }
}

export const processingOrderDefinition: StateDefinition = {
    status: Status.PROCESSING_ORDER,
    transitions: [Status.DISPENSING_ORDER, Status.IDLE, Status.ERROR],
    create: () => new ProcessingOrderState(),
};
