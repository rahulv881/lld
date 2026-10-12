import console from "node:console";
import { Product } from "./Product";

export class VendingMachineHardware{


    static despenseProduct({product, quantity}: {product: Product, quantity: number}) {
        console.log(`Despensing ${quantity} ${product.getProductName()}`);
    }
    

}