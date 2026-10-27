import { EventType } from "../Event";
import type { VendingMachine } from "../VendingMachine";
import { MachineStatus, Status } from "./statuses";
import type { StateDefinition } from "./StateDefinition";
import { VendingMachineState } from "./VendingMachineState";

export class ErrorState extends VendingMachineState {
    constructor(private readonly resume: MachineStatus) {
        super();
    }

    selectProduct(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    insertMoney(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    buy(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    startInventoryLoad(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    startMaintenance(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    acknowledge(machine: VendingMachine): boolean {
        machine.clearErrorType();
        machine.transitionTo(this.resume);
        machine.notify(
            EventType.NOTIFY_USER,
            this.resume === Status.PROCESSING_ORDER ? "Continue payment." : "Select a product.",
        );
        return true;
    }

    cancel(machine: VendingMachine): boolean {
        const amount = machine.releasePayment();
        machine.clearErrorType();
        machine.transitionTo(Status.IDLE);
        machine.notify(
            EventType.CANCEL_ORDER,
            amount > 0 ? `Transaction cancelled. Returning ${amount}.` : "Transaction cancelled.",
        );
        return true;
    }

    private blocked(machine: VendingMachine): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "Clear the error before continuing.");
    }
}

export const errorDefinition: StateDefinition = {
    status: Status.ERROR,
    transitions: [Status.IDLE, Status.PROCESSING_ORDER],
    create: arg => new ErrorState((arg ?? Status.IDLE) as MachineStatus),
};
