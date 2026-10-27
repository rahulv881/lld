export class Product {
    id: string;
    name: string;
    price: number;
    quantity: number;

    constructor(id: string, name: string, price: number, quantity = 0) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    getProductInfo(): string {
        return `Product: ${this.name}, Price: ${this.price}, Quantity: ${this.quantity}`;
    }

    setProductInfo(name: string, price: number, quantity: number) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    setPrice(price: number) {
        this.price = price;
    }

    getProductId(): string {
        return this.id;
    }

    setProductId(id: string) {
        this.id = id;
    }

    getProductName(): string {
        return this.name;
    }

    setProductName(name: string) {
        this.name = name;
    }

    getProductPrice(): number {
        return this.price;
    }
    
    setProductPrice(price: number) {
        this.price = price;
    }

    getProductQuantity(): number {
        return this.quantity;
    }
    
    setProductQuantity(quantity: number) {
        this.quantity = quantity;
    }
}