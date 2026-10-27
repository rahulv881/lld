import { Product } from "./Product";

export class Dispenser {
    dispense(product: Product, quantity: number): void {
        console.log(`Despensing ${quantity} ${product.getProductName()}`);
    }

    returnExchange(amount: number): void {
        console.log(`Returning ${amount} exchange`);
    }
}
