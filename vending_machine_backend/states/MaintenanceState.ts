import { EventType } from "../Event";
import type { VendingMachine } from "../VendingMachine";
import type { StateDefinition } from "./StateDefinition";
import { Status } from "./statuses";
import { VendingMachineState } from "./VendingMachineState";

export class MaintenanceState extends VendingMachineState {
    selectProduct(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    insertMoney(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    buy(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    cancel(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    startInventoryLoad(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    addProduct(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    addInventory(machine: VendingMachine): boolean {
        return this.blocked(machine);
    }

    finishMaintenance(machine: VendingMachine): boolean {
        machine.transitionTo(Status.IDLE);
        machine.notify(EventType.NOTIFY_USER, "Maintenance complete. Select a product.");
        return true;
    }

    private blocked(machine: VendingMachine): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "Machine is under maintenance.");
    }
}

export const maintenanceDefinition: StateDefinition = {
    status: Status.UNDER_MAINTENANCE,
    transitions: [Status.IDLE],
    create: () => new MaintenanceState(),
};
