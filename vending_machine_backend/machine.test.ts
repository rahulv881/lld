import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { VendingMachine } from "./VendingMachine";
import { STATE_DEFINITIONS } from "./states";
import { MachineStatus, Status } from "./states/statuses";
import { StateGraph } from "./states/StateGraph";
import type { StateDefinition } from "./states/StateDefinition";
import { VendingMachineState } from "./states/VendingMachineState";

function pepsi(machine: VendingMachine) {
    const product = machine.snapshot().products[0];
    assert.equal(product.name, "Pepsi");
    return product;
}

async function main() {
    const happy = new VendingMachine();
    assert.equal(happy.snapshot().status, Status.IDLE);
    assert.equal(happy.insertMoney(1), false);
    assert.equal(happy.snapshot().status, Status.IDLE);
    assert.equal(happy.selectProduct(0, 21), false);
    assert.equal(happy.snapshot().status, Status.IDLE);

    assert.equal(happy.selectProduct(0, 1), true);
    assert.equal(happy.snapshot().status, Status.PROCESSING_ORDER);
    assert.equal(happy.snapshot().order?.status, "inprogress");
    assert.equal(happy.snapshot().order?.total, 18);
    assert.equal(happy.selectProduct(1, 1), false);
    assert.equal(happy.insertMoney(10), true);
    assert.equal(happy.buy(), true);
    assert.equal(happy.snapshot().status, Status.PROCESSING_ORDER);
    assert.equal(happy.snapshot().insertedAmount, 10);
    assert.equal(pepsi(happy).quantity, 10);

    assert.equal(happy.insertMoney(10), true);
    assert.equal(happy.buy(), true);
    assert.equal(happy.snapshot().status, Status.DISPENSING_ORDER);
    assert.equal(happy.snapshot().changeAmount, 2);
    assert.equal(happy.snapshot().dispensed?.name, "Pepsi");
    assert.equal(pepsi(happy).quantity, 9);
    assert.equal(happy.snapshot().order?.status, "completed");
    assert.equal(happy.selectProduct(1, 1), false);
    assert.equal(happy.acknowledge(), true);
    assert.equal(happy.snapshot().status, Status.IDLE);
    assert.equal(happy.snapshot().dispensed, null);

    const exact = new VendingMachine();
    exact.selectProduct(2, 1);
    exact.insertMoney(10);
    assert.equal(exact.buy(), true);
    assert.equal(exact.snapshot().changeAmount, 0);
    assert.equal(exact.snapshot().products[2].quantity, 9);
    exact.acknowledge();

    const cancel = new VendingMachine();
    cancel.selectProduct(3, 1);
    cancel.insertMoney(20);
    assert.equal(cancel.cancel(), true);
    assert.equal(cancel.snapshot().status, Status.IDLE);
    assert.equal(cancel.snapshot().insertedAmount, 0);
    assert.equal(cancel.snapshot().changeAmount, 20);
    assert.equal(cancel.snapshot().order, null);
    assert.equal(cancel.snapshot().products[3].quantity, 10);

    const stock = new VendingMachine();
    assert.equal(stock.selectProduct(2, 11), true);
    assert.equal(stock.snapshot().status, Status.ERROR);
    assert.equal(stock.snapshot().errorType, "OUT_OF_STOCK");
    assert.equal(stock.snapshot().order, null);
    assert.equal(stock.insertMoney(10), false);
    stock.acknowledge();
    assert.equal(stock.snapshot().status, Status.IDLE);

    const currency = new VendingMachine();
    currency.selectProduct(2, 1);
    assert.equal(currency.insertMoney(3), true);
    assert.equal(currency.snapshot().errorType, "INVALID_CURRENCY");
    assert.equal(currency.snapshot().insertedAmount, 0);
    currency.acknowledge();
    assert.equal(currency.snapshot().status, Status.PROCESSING_ORDER);
    currency.cancel();

    const noChange = new VendingMachine({ cash: { 1: 0, 2: 0, 5: 0, 10: 5, 20: 5 } });
    noChange.selectProduct(0, 1);
    noChange.insertMoney(20);
    assert.equal(noChange.buy(), true);
    assert.equal(noChange.snapshot().status, Status.ERROR);
    assert.equal(noChange.snapshot().errorType, "EXCHANGE_NOT_AVAILABLE");
    assert.equal(noChange.snapshot().insertedAmount, 20);
    assert.equal(pepsi(noChange).quantity, 10);
    assert.equal(noChange.cancel(), true);
    assert.equal(noChange.snapshot().status, Status.IDLE);
    assert.equal(noChange.snapshot().changeAmount, 20);
    assert.equal(noChange.snapshot().insertedAmount, 0);

    const inventory = new VendingMachine({ inventoryPassword: "secret" });
    assert.equal(inventory.startInventoryLoad("1234"), false);
    assert.equal(inventory.snapshot().status, Status.IDLE);
    assert.equal(inventory.addProduct(5, "Water", 8, 4), false);
    assert.equal(inventory.startInventoryLoad("secret"), true);
    assert.equal(inventory.snapshot().status, Status.BULK_INVENTORY_UPDATE);
    assert.equal(inventory.selectProduct(2, 1), false);
    assert.equal(inventory.addProduct(0, "Juice", 10, 1), false);
    assert.equal(inventory.snapshot().status, Status.BULK_INVENTORY_UPDATE);
    assert.equal(inventory.addProduct(5, "Water", 8, 4), true);
    assert.equal(inventory.snapshot().products[5].name, "Water");
    assert.equal(inventory.addInventory("Product_1", 2), true);
    assert.equal(pepsi(inventory).quantity, 12);
    assert.equal(inventory.startMaintenance(), false);
    inventory.quitInventoryLoad();
    assert.equal(inventory.snapshot().status, Status.IDLE);
    inventory.selectProduct(5, 1);
    inventory.insertMoney(10);
    assert.equal(inventory.buy(), true);
    assert.equal(inventory.snapshot().changeAmount, 2);
    inventory.acknowledge();

    const maintenance = new VendingMachine();
    maintenance.selectProduct(2, 1);
    assert.equal(maintenance.startMaintenance(), false);
    maintenance.cancel();
    assert.equal(maintenance.startMaintenance(), true);
    assert.equal(maintenance.snapshot().status, Status.UNDER_MAINTENANCE);
    assert.equal(maintenance.selectProduct(2, 1), false);
    assert.equal(maintenance.insertMoney(10), false);
    assert.equal(maintenance.buy(), false);
    assert.equal(maintenance.startInventoryLoad("1234"), false);
    assert.equal(maintenance.finishMaintenance(), true);
    assert.equal(maintenance.snapshot().status, Status.IDLE);
    assert.equal(maintenance.selectProduct(2, 1), true);
    maintenance.cancel();

    const timed = new VendingMachine({ paymentTimeoutMs: 30 });
    let changes = 0;
    const unsubscribe = timed.subscribe(() => changes++);
    timed.selectProduct(2, 1);
    timed.insertMoney(10);
    await delay(80);
    assert.equal(timed.snapshot().status, Status.ERROR);
    assert.equal(timed.snapshot().errorType, "TIMEOUT");
    // two user actions plus the timeout, which no caller triggered
    assert.equal(changes, 3);
    unsubscribe();
    timed.acknowledge();
    assert.equal(changes, 3);
    assert.equal(timed.snapshot().insertedAmount, 0);
    assert.equal(timed.snapshot().changeAmount, 10);
    assert.equal(timed.snapshot().products[2].quantity, 10);
    timed.acknowledge();
    assert.equal(timed.snapshot().status, Status.IDLE);

    // a new state plugs in through its own definition; no existing file changes
    class RefundState extends VendingMachineState {
        acknowledge(machine: VendingMachine): boolean {
            machine.transitionTo(Status.IDLE);
            return true;
        }
    }
    const refund: StateDefinition = {
        status: "REFUNDING" as MachineStatus, // outside the built-in set, so cast
        transitions: [Status.IDLE],
        enteredFrom: [Status.IDLE],
        create: () => new RefundState(),
    };
    const extended = new VendingMachine({ states: [...STATE_DEFINITIONS, refund] });
    extended.transitionTo("REFUNDING" as MachineStatus);
    assert.equal(extended.snapshot().status, "REFUNDING");
    extended.acknowledge();
    assert.equal(extended.snapshot().status, Status.IDLE);

    // moves nobody declared are rejected
    assert.throws(() => extended.transitionTo(Status.DISPENSING_ORDER), /Illegal transition IDLE -> DISPENSING_ORDER/);
    // a definition naming an unknown state fails at startup
    assert.throws(
        () => new StateGraph([{ status: Status.IDLE, transitions: ["NOPE" as MachineStatus], create: () => new RefundState() }]),
        /unknown state/,
    );

    console.log("all vending machine state tests passed");
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
