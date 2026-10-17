import console from "node:console";
import { Product } from "./Product";
import { Inventory } from "./Inventory";

export class VendingMachineHardware{

    private inventory: Inventory;
    public constructor() {
        this.inventory = new Inventory();
    }

    public getInventory() {
        return this.inventory;
    }

    public bulkUpdateInventory() {
        // TODO: Make these user input based
        const product1 = new Product("Product_1", "Pepsi", 1);
        product1.setProductQuantity(10);
        const product2 = new Product("Product_2", "Coke", 1);
        product2.setProductQuantity(10);
        const product3 = new Product("Product_3", "Lays", 1);
        product3.setProductQuantity(10);
        const product4 = new Product("Product_4", "Soda", 1);
        product4.setProductQuantity(10);
        const product5 = new Product("Product_5", "Bisleri", 1);
        product5.setProductQuantity(10);
    
        this.inventory.addProduct(product1);
        this.inventory.addProduct(product2);
        this.inventory.addProduct(product3);
        this.inventory.addProduct(product4);
        this.inventory.addProduct(product5);
    }


    static despenseProduct({product, quantity}: {product: Product, quantity: number}) {
        console.log(`Despensing ${quantity} ${product.getProductName()}`);
    }

    static returnExchange({amount}: {amount: number}) {
        console.log(`Returning ${amount} exchange`);
    }

}