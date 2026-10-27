import { EventType } from "../Event";
import type { VendingMachine } from "../VendingMachine";

export abstract class VendingMachineState {
    onEnter(_machine: VendingMachine): void {}

    onExit(_machine: VendingMachine): void {}

    selectProduct(machine: VendingMachine, _position: unknown, _quantity: unknown): boolean {
        return machine.refuse(EventType.SELECT_PRODUCT, "Product selection is not available right now.");
    }

    insertMoney(machine: VendingMachine, _amount: unknown): boolean {
        return machine.refuse(EventType.SELECT_MONEY, "Inserting money is not available right now.");
    }

    buy(machine: VendingMachine): boolean {
        return machine.refuse(EventType.COMPLETE_ORDER, "Buying is not available right now.");
    }

    cancel(machine: VendingMachine): boolean {
        return machine.refuse(EventType.CANCEL_ORDER, "Nothing to cancel.");
    }

    acknowledge(machine: VendingMachine): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "Nothing to acknowledge.");
    }

    startInventoryLoad(machine: VendingMachine, _password: unknown): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "Inventory loading is not available right now.");
    }

    addProduct(machine: VendingMachine, _position: unknown, _name: unknown, _price: unknown, _quantity: unknown): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "Add a product from inventory loading.");
    }

    addInventory(machine: VendingMachine, _id: unknown, _quantity: unknown): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "Restock from inventory loading.");
    }

    quitInventoryLoad(machine: VendingMachine): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "Inventory loading is not in progress.");
    }

    startMaintenance(machine: VendingMachine): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "Maintenance cannot start right now.");
    }

    finishMaintenance(machine: VendingMachine): boolean {
        return machine.refuse(EventType.NOTIFY_USER, "The machine is not under maintenance.");
    }
}
