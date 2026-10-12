import { Product } from "./Product";
import { OrderStatus } from "./OrderStatus";

export class Order {
    id: string;
    products: Product[];
    total: number;
    status: (typeof OrderStatus)[keyof typeof OrderStatus];
    createdAt: Date;
    updatedAt: Date;

    constructor(id: string, products: {product: Product, quantity: number}[]) {
        this.id = id;
        this.products = products.map(product => product.product);
        this.total = products.reduce((acc, {product, quantity}) => acc + product.price * quantity, 0);
        this.status = OrderStatus.PENDING;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    setStatus(status: (typeof OrderStatus)[keyof typeof OrderStatus]) {
        this.status = status;
    }

    setCreatedAt(createdAt: Date) {
        this.createdAt = createdAt;
    }

    setUpdatedAt(updatedAt: Date) {
        this.updatedAt = updatedAt;
    }

    getStatus(): (typeof OrderStatus)[keyof typeof OrderStatus] {
        return this.status;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }

    getTotal(): number {
        return this.total;
    }

    getProducts(): Product[] {
        return this.products;
    }
    
    getId(): string {
        return this.id;
    }

    getOrder(): Order {
        return this;
    }
}