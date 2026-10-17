import { Inventory } from "./Inventory";

export class ProductManager {

    private inventory: Inventory;

    public constructor(inventory: Inventory) {
        this.inventory = inventory;
    }

    public getProductByPosition(position: number) {
        try{
            return this.inventory.getProducts()[position];
        }
        catch(error) {
            console.error(`INVALID PRODUCT SELECTED: Product not found`);
            throw error;
        }
    }

    public getProductById(id: string) {
        return this.inventory.getProductById(id);
    }

    public selectProduct(position: number, purchasedQty: number = 1) {
        const product = this.getProductByPosition(position);
        const productId = product.getProductId(); // * Input Product ID via hardware / user
        // inventory.removeProduct(product, qty);
        const productQty = product.getProductQuantity();
        if(purchasedQty > productQty) { 
            console.log(`
                Invetory out of stock: 
                Available qty for ${product.getProductName()}: ${product.getProductName()}
                `); 
            return null;
        }
        return product;
    }
}