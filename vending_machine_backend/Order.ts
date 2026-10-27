import { OrderStatus } from "./OrderStatus";
import { Product } from "./Product";

export type OrderLine = {
    product: Product;
    quantity: number;
};

export class Order {
    private status: OrderStatus = OrderStatus.IN_PROGRESS;
    private readonly lines: OrderLine[];
    private readonly total: number;

    constructor(private readonly id: string, lines: OrderLine[]) {
        this.lines = lines;
        this.total = lines.reduce((sum, line) => sum + line.product.getProductPrice() * line.quantity, 0);
    }

    getId(): string {
        return this.id;
    }

    getLines(): OrderLine[] {
        return this.lines;
    }

    getTotal(): number {
        return this.total;
    }

    getStatus(): OrderStatus {
        return this.status;
    }

    setStatus(status: OrderStatus): void {
        this.status = status;
    }
}
