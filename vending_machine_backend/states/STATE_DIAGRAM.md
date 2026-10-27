# Vending machine state transitions

```mermaid
stateDiagram-v2
    [*] --> IDLE

    IDLE --> PROCESSING_ORDER: selectProduct (valid, in stock)
    IDLE --> ERROR: selectProduct (out of stock)
    IDLE --> BULK_INVENTORY_UPDATE: startInventoryLoad (correct password)
    IDLE --> UNDER_MAINTENANCE: startMaintenance

    PROCESSING_ORDER --> PROCESSING_ORDER: insertMoney (valid bill)
    PROCESSING_ORDER --> ERROR: insertMoney (invalid bill)
    PROCESSING_ORDER --> DISPENSING_ORDER: buy (enough money)
    PROCESSING_ORDER --> ERROR: buy (out of stock / no change)
    PROCESSING_ORDER --> IDLE: cancel (refund)
    PROCESSING_ORDER --> ERROR: payment timeout

    DISPENSING_ORDER --> IDLE: acknowledge (collect item)
    DISPENSING_ORDER --> ERROR: exchange not available
    DISPENSING_ORDER --> ERROR: nothing to dispense

    ERROR --> IDLE: acknowledge (resume: Idle)
    ERROR --> PROCESSING_ORDER: acknowledge (resume: Processing)
    ERROR --> IDLE: cancel (refund)

    BULK_INVENTORY_UPDATE --> BULK_INVENTORY_UPDATE: addProduct / addInventory
    BULK_INVENTORY_UPDATE --> IDLE: quitInventoryLoad

    UNDER_MAINTENANCE --> IDLE: finishMaintenance
```

## ERROR resume target

`ERROR` is entered through `enterError(type, message, resume)`, and `acknowledge` returns to whatever `resume` produced.

| Raised from | Cause | Continue goes to |
|---|---|---|
| IDLE | out of stock on select | IDLE |
| PROCESSING_ORDER | invalid bill | PROCESSING_ORDER |
| PROCESSING_ORDER | out of stock on buy | IDLE |
| PROCESSING_ORDER | cannot make change | PROCESSING_ORDER |
| PROCESSING_ORDER | payment timeout | IDLE |
| DISPENSING_ORDER | exchange not available | PROCESSING_ORDER |
| DISPENSING_ORDER | nothing to dispense | IDLE |

`cancel` in `ERROR` always releases payment and goes to IDLE, and `ERROR` blocks select, insert, buy, inventory load and maintenance.
