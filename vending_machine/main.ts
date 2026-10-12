import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Inventory } from "./Inventory";
import { Order } from "./Order";
import { Product } from "./Product";
import { OrderStatus } from './OrderStatus';

(async () => {

    // * 0. FILL UP VENDING MACHINE INVENTORY
    const inventory = new Inventory("1");
    const product1 = new Product("Product_1", "Pepsi", 1);
    product1.setProductQuantity(10);
    const product2 = new Product("Product_2", "Coke", 1);
    product2.setProductQuantity(10);
    const product3 = new Product("Product_3", "Lays", 1);
    product3.setProductQuantity(10);
    const product4 = new Product("Product_3", "Soda", 1);
    product4.setProductQuantity(10);
    const product5 = new Product("Product_3", "Bisleri", 1);
    product5.setProductQuantity(10);

    inventory.addProduct(product1);
    inventory.addProduct(product2);
    inventory.addProduct(product3);
    inventory.addProduct(product4);
    inventory.addProduct(product5);

    // * 1. Select Product
    inventory.getProductById("Product_1");
    // * 2. Create Order
    const purchasedQty = 1; // * Input Quantity via hardware / user
    const productId = "Product_1"; // * Input Product ID via hardware / user
    const product = inventory.getProductById(productId);
    // inventory.removeProduct(product, qty);
    const productQty = product.getProductQuantity();
    if(purchasedQty > productQty) { 
        console.log(`
        Invetory out of stock: 
        Available qty for ${product.getProductName()}: ${product.getProductName()}
        `); 
    }
    const order = new Order("ORDER_1",[product]);
    // * 3. Insert Money
    // * 3.1 Notify User via display message: Show please insert money
    console.log(`Please insert money: ${order.getTotal()} ruppess
    Note: Press q to quit
    `);
    // * 3.2 Command : VALIDATE_INSERTED_MONEY
    let insertedAmount = 0;  // * Input Money via hardware / user
    const rl = readline.createInterface({ input, output });
    while (true) {
        const line = await rl.question(`INSERTED AMOUNT: `);
        if (line === 'q') break;
        else insertedAmount += parseInt(line);
        // handle move
    }
    rl.close();
    if(insertedAmount != order.getTotal()) {order.setStatus(OrderStatus.CANCELLED); return ;}
    // * 4. Process Order
    order.setStatus(OrderStatus.COMPLETED);

    // * 5. Despense Product
    
    // * 6. Return Exchange
    // * 7. Update Inventory

})();