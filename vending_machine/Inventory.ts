import { Product } from "./Product";

export class Inventory {
    id: string;
    products: Product[] | null;

    constructor(id: string) {
        this.id = id;
        this.products = null;
    }

    addProduct(product: Product) {
        this.products?.push(product);
    }

    removeProduct(product: Product, qty: number) {
        this.products = this.products?.filter(p => p.id !== product.id) ?? null;
        const productToRemove = this.products?.find(p => p.id === product.id) ?? null;
        if(!productToRemove) throw new Error("Product not found");
        if(productToRemove.quantity < qty) throw new Error(`Out of stock, quantity available is ${product.quantity}`);
        else productToRemove.quantity -= qty;
    }

    getProducts() {
        return this.products;
    }

    getProductById(id: string): Product {
        const product = this.products?.find(product => product.id === id) ?? null;
        if(!product) throw new Error("Product not found");
        return product;
    }   

}