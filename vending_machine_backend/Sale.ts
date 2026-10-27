import { Order } from "./Order";

export type Selection = { position: number; quantity: number };
export type Dispensed = { name: string; quantity: number };

/** State of the purchase currently in progress, from selection to collection. */
export class Sale {
    order: Order | null = null;
    selection: Selection | null = null;
    dispensed: Dispensed | null = null;
    changeAmount: number | null = null;
    private bills: number[] = [];

    begin(position: number, quantity: number, order: Order): void {
        this.clear();
        this.selection = { position, quantity };
        this.order = order;
    }

    addBill(amount: number): void {
        this.bills.push(amount);
    }

    getBills(): number[] {
        return [...this.bills];
    }

    insertedTotal(): number {
        return this.bills.reduce((sum, bill) => sum + bill, 0);
    }

    takeBills(): number[] {
        const bills = this.bills;
        this.bills = [];
        return bills;
    }

    restoreBills(bills: number[]): void {
        this.bills = bills;
    }

    clear(): void {
        this.order = null;
        this.selection = null;
        this.dispensed = null;
        this.changeAmount = null;
        this.bills = [];
    }
}
