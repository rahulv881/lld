import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Inventory } from "./Inventory";
import { Order } from "./Order";
import { Product } from "./Product";
import { OrderStatus } from './OrderStatus';
import console from 'node:console';
import { VendingMachineHardware } from './VendingMachineHardware';
import { ProductManager } from './ProductManager';
(async () => {

    // * 0. FILL UP VENDING MACHINE INVENTORY
    const vendingMachineHardware = new VendingMachineHardware();
    vendingMachineHardware.bulkUpdateInventory();

    // * 1. Select Product
    const position = 1;
    const productManager = new ProductManager(vendingMachineHardware.getInventory());
    const purchasedQty = 1; // * Input Quantity via hardware / user
    const product = productManager.selectProduct(position, purchasedQty);
    if(!product) return;
    // * 2. Create Order
    const order = new Order("ORDER_1",[{product: product, quantity: purchasedQty}]);
    // * 3. Insert Money
    // * 3.1 Notify User via display message: Show please insert money
    console.log(`Please insert money: ${order.getTotal()} ruppess
    Note: Press q to quit
    `);
    // * 3.2 Command : VALIDATE_INSERTED_MONEY
    let insertedAmount = 0;  // * Input Money via hardware / user
    const rl = readline.createInterface({ input, output });
    while (true) {
        if(insertedAmount == order.getTotal()) break;
        const line = await rl.question(`INSERTED AMOUNT: `);
        if (line === 'q') break;
        else insertedAmount += parseInt(line);
        // handle move
    }
    rl.close();
    if(insertedAmount != order.getTotal()) {order.setStatus(OrderStatus.CANCELLED); return ;}
    // * 4. Process Order
    order.setStatus(OrderStatus.COMPLETED);

    // * 5. Update Inventory
    const productQty = product.getProductQuantity();
    vendingMachineHardware.getInventory().updateProduct({id: product.getProductId(), quantity: productQty - purchasedQty});
    
    // * 6. Despense Product
    VendingMachineHardware.despenseProduct({product: product, quantity: purchasedQty});

    // * 7. TODO: Return Exchange
    VendingMachineHardware.returnExchange({amount: insertedAmount - order.getTotal()});

    // * 9. TODO: Add Timer to insert money
    
    // * 10. TODO: Add Timer to select product (return to initial state on TIMEOUT)
    
    // * 11. TODO: Add QR Code based payment
    
    // * 8. TODO: Add products to inventory with position (row, column)

})();