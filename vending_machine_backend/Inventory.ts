import { randomUUID } from "node:crypto";
import { Product } from "./Product";

export type ProductUpdate = Pick<Product, 'id'> & Partial<Omit<Product, 'id'>>;
export class Inventory {
    id: string;
    products: Product[];

    constructor(id: string = randomUUID()) {
        this.id = id;
        this.products = [];
    }

    addProduct(product: Product) {
        this.products?.push(product);
    }

    // updateProduct(product: Partial<Product>) {
    // updateProduct(product:Pick<Product, 'id'> & Partial<Omit<Product,'id'>>) {


    updateProduct(product: ProductUpdate) {
        const productToUpdate = this.products?.find(p => p.id === product.id) ?? null;
        if(!productToUpdate) throw new Error("Product not found");
        if(product.quantity !== undefined) productToUpdate.setProductQuantity(product.quantity);
        return productToUpdate;
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