import { Product } from "./Product";

export class Inventory {
    private readonly slots: (Product | null)[];

    constructor(size: number) {
        this.slots = Array.from({ length: size }, () => null);
    }

    at(position: number): Product | null | undefined {
        if (!Number.isInteger(position) || position < 0 || position >= this.slots.length) return undefined;
        return this.slots[position];
    }

    entries(): { position: number; product: Product | null }[] {
        return this.slots.map((product, position) => ({ position, product }));
    }

    findById(id: string): Product | null {
        return this.slots.find((product) => product?.getProductId() === id) ?? null;
    }

    place(position: number, product: Product): void {
        this.slots[position] = product;
    }

    reduce(id: string, quantity: number): void {
        const product = this.findById(id);
        if (!product || product.getProductQuantity() < quantity) {
            throw new Error("Out of stock");
        }
        product.setProductQuantity(product.getProductQuantity() - quantity);
    }
}
