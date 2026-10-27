export const ACCEPTED_BILLS = [1, 2, 5, 10, 20] as const;

export type Bill = (typeof ACCEPTED_BILLS)[number];

const DENOMINATIONS = [20, 10, 5, 2, 1];

export function isAcceptedBill(amount: number): amount is Bill {
    return (ACCEPTED_BILLS as readonly number[]).includes(amount);
}

export class CashBox {
    private counts = new Map<number, number>();

    constructor(initial: Partial<Record<Bill, number>>) {
        for (const bill of ACCEPTED_BILLS) {
            this.counts.set(bill, initial[bill] ?? 0);
        }
    }

    canTakePayment(inserted: readonly number[], change: number): boolean {
        if (change < 0) return false;
        return CashBox.dispense(this.withInserted(inserted), change);
    }

    takePayment(inserted: readonly number[], change: number): boolean {
        if (!this.canTakePayment(inserted, change)) return false;
        const next = this.withInserted(inserted);
        CashBox.dispense(next, change);
        this.counts = next;
        return true;
    }

    private withInserted(inserted: readonly number[]): Map<number, number> {
        const next = new Map(this.counts);
        for (const bill of inserted) {
            next.set(bill, (next.get(bill) ?? 0) + 1);
        }
        return next;
    }

    private static dispense(counts: Map<number, number>, amount: number): boolean {
        let left = amount;
        for (const bill of DENOMINATIONS) {
            const have = counts.get(bill) ?? 0;
            const use = Math.min(have, Math.floor(left / bill));
            if (use > 0) {
                counts.set(bill, have - use);
                left -= use * bill;
            }
        }
        return left === 0;
    }
}
