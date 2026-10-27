import { VendingMachine } from "./VendingMachine";

function show(machine: VendingMachine, label: string) {
    const snap = machine.snapshot();
    const error = snap.errorType ? ` ${snap.errorType}` : "";
    console.log(`${label} -> ${snap.status}${error} | ${snap.message}`);
}

const machine = new VendingMachine();
show(machine, "boot");

machine.selectProduct(0, 1);
show(machine, "select Pepsi");
machine.insertMoney(20);
show(machine, "insert 20");
machine.buy();
show(machine, "buy");
machine.acknowledge();
show(machine, "collect");

machine.selectProduct(2, 11);
show(machine, "select 11 Lays");
machine.acknowledge();

machine.selectProduct(2, 1);
machine.insertMoney(3);
show(machine, "invalid bill");
machine.cancel();
show(machine, "cancel from error");

machine.startInventoryLoad("nope");
show(machine, "wrong password");
machine.startInventoryLoad("1234");
show(machine, "load inventory");
machine.addProduct(5, "Water", 8, 4);
show(machine, "add Water");
machine.addProduct(0, "Juice", 10, 1);
show(machine, "occupied slot");
machine.quitInventoryLoad();
show(machine, "quit inventory");

machine.startMaintenance();
show(machine, "maintenance");
machine.selectProduct(2, 1);
show(machine, "select while down");
machine.finishMaintenance();
show(machine, "maintenance done");
