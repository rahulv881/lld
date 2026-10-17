Functional requirments of a vending machine
1. Add products
2. Add inventory
3. Insert money
4. Return exchange
5. Select product
6. Buy product
7. Handle out-of-stock
8. Cancel transactional
9. Notify user of events


Entities
1. Product
2. Inventory
3. Order
   1. Inprogress
   2. Completed
   3. Cancelled
4. Notification
5. VendingMachine
   2. status
      1. BULK_INVENTORY_UPDATE
      2. PROCESSING_ORDER
      3. DESPENSING_ORDER
      4. UNDER_MAINTAINANCE / OUT_OF_ORDER
      5. ERROR
         1. OUT_OF_STOCK
         2. TIMEOUT
         3. INVALID_CURRENCY
         4. EXCHANGE_NOT_AVAILABLE
6. Dispenser
7. Event
   1. NOTIFY_USER
   2. NOTIFY_DESPENSER
   3. SELECT_PRODUCT
   4. OUT_OF_STOCK
   5. START_ORDER
   6. START_PAYMENT
   7. SELECT_MONEY
   8. CANCEL_PAYMENT
   9. CANCEL_ORDER
   10. EXCHANGE_MONEY
   11. EXCHANGE_NOT_AVAILABLE
   12. INVALID_CURRENCY
   13. TIMEOUT
   14. COMPLETE_ORDER
   15. COMPLETE_PAYMENT
   16. DESPENSE_PRODUCT