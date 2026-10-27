import { Bill, CashBox } from "./CashBox";
import { Dispenser } from "./Dispenser";
import { ErrorType, EventType } from "./Event";
import { Inventory } from "./Inventory";
import { buildSnapshot, MachineSnapshot, MachineStatus } from "./MachineSnapshot";
import { EventLog } from "./EventLog";
import { Sale } from "./Sale";
import { Product } from "./Product";
import { INITIAL_STATUS, STATE_DEFINITIONS } from "./states";
import { Status } from "./states/statuses";
import type { StateDefinition } from "./states/StateDefinition";
import { StateGraph } from "./states/StateGraph";
import { VendingMachineState } from "./states/VendingMachineState";

const DEFAULT_CASH: Record<Bill, number> = { 1: 8, 2: 8, 5: 4, 10: 4, 20: 2 };
const DEFAULT_PASSWORD = "1234";

export type VendingMachineOptions = {
    paymentTimeoutMs?: number;
    inventoryPassword?: string;
    slotCount?: number;
    maxQuantity?: number;
    cash?: Partial<Record<Bill, number>>;
    /** Override the state set, mainly for tests. */
    states?: readonly StateDefinition[];
    initialStatus?: string;
};

export type { MachineSnapshot } from "./MachineSnapshot";

export class VendingMachine {
    private state: VendingMachineState;
    private status: string;
    private readonly graph: StateGraph;
    private readonly listeners = new Set<() => void>();
    private readonly inventory: Inventory;
    private readonly dispenser = new Dispenser();
    private readonly cashBox: CashBox;
    readonly sale = new Sale();
    readonly log = new EventLog();
    private readonly paymentTimeoutMs: number;
    private readonly inventoryPassword: string;
    private readonly maxQuantity: number;
    private orderCounter = 1;
    private productCounter = 6;
    private errorType: ErrorType | null = null;
    private actionError: string | null = null;

    constructor(options: VendingMachineOptions = {}) {
        this.paymentTimeoutMs = options.paymentTimeoutMs ?? 60_000;
        this.inventoryPassword = options.inventoryPassword ?? DEFAULT_PASSWORD;
        this.maxQuantity = options.maxQuantity ?? 20;
        this.inventory = new Inventory(options.slotCount ?? 9);
        this.cashBox = new CashBox(options.cash ?? DEFAULT_CASH);
        this.seed();
        this.graph = new StateGraph(options.states ?? STATE_DEFINITIONS);
        this.status = options.initialStatus ?? INITIAL_STATUS;
        this.state = this.graph.definition(this.status).create();
        this.state.onEnter(this);
    }

    getState(): VendingMachineState {
        return this.state;
    }

    /** Calls `listener` after every change, including ones the machine makes on its own (timeouts). */
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /** Runs a change and then tells subscribers. States use this for work that starts outside a user action. */
    mutate<T>(change: () => T): T {
        try {
            return change();
        } finally {
            this.listeners.forEach((listener) => listener());
        }
    }

    /** Entry point for user actions: resets the last refusal, applies the action, notifies subscribers. */
    private dispatch(action: () => boolean): boolean {
        this.actionError = null;
        return this.mutate(action);
    }

    /** Moves to another state by status label; the graph rejects moves no state declared. */
    transitionTo(next: MachineStatus, arg?: string): void {
        this.graph.assertAllowed(this.status, next);
        const state = this.graph.definition(next).create(arg);
        this.state.onExit(this);
        this.state = state;
        this.status = next;
        state.onEnter(this);
    }

    getInventory(): Inventory {
        return this.inventory;
    }

    getCashBox(): CashBox {
        return this.cashBox;
    }

    getDispenser(): Dispenser {
        return this.dispenser;
    }

    getInventoryPassword(): string {
        return this.inventoryPassword;
    }

    getMaxQuantity(): number {
        return this.maxQuantity;
    }

    getPaymentTimeoutMs(): number {
        return this.paymentTimeoutMs;
    }

    nextOrderId(): string {
        return `ORDER_${this.orderCounter++}`;
    }

    nextProductId(): string {
        return `Product_${this.productCounter++}`;
    }

    notify(type: EventType, message: string): void {
        this.log.notify(type, message);
    }

    refuse(type: EventType, message: string): false {
        this.notify(type, message);
        this.actionError = message;
        return false;
    }

    enterError(type: ErrorType, message: string, resume: MachineStatus): void {
        this.errorType = type;
        this.notify(type, message);
        this.transitionTo(Status.ERROR, resume);
    }

    clearErrorType(): void {
        this.errorType = null;
    }

    clearActionError(): void {
        this.actionError = null;
    }

    releasePayment(): number {
        const amount = this.sale.insertedTotal();
        this.sale.order?.setStatus("cancelled");
        this.sale.clear();
        if (amount > 0) {
            this.dispenser.returnExchange(amount);
            this.sale.changeAmount = amount;
            this.notify(EventType.CANCEL_PAYMENT, "Payment cancelled.");
            this.notify(EventType.EXCHANGE_MONEY, `Returning ${amount} exchange.`);
        }
        return amount;
    }

    selectProduct(position: unknown, quantity: unknown): boolean {
        return this.dispatch(() => this.state.selectProduct(this, position, quantity));
    }

    insertMoney(amount: unknown): boolean {
        return this.dispatch(() => this.state.insertMoney(this, amount));
    }

    buy(): boolean {
        return this.dispatch(() => this.state.buy(this));
    }

    cancel(): boolean {
        return this.dispatch(() => this.state.cancel(this));
    }

    acknowledge(): boolean {
        return this.dispatch(() => this.state.acknowledge(this));
    }

    startInventoryLoad(password: unknown): boolean {
        return this.dispatch(() => this.state.startInventoryLoad(this, password));
    }

    addProduct(position: unknown, name: unknown, price: unknown, quantity: unknown): boolean {
        return this.dispatch(() => this.state.addProduct(this, position, name, price, quantity));
    }

    addInventory(id: unknown, quantity: unknown): boolean {
        return this.dispatch(() => this.state.addInventory(this, id, quantity));
    }

    quitInventoryLoad(): boolean {
        return this.dispatch(() => this.state.quitInventoryLoad(this));
    }

    startMaintenance(): boolean {
        return this.dispatch(() => this.state.startMaintenance(this));
    }

    finishMaintenance(): boolean {
        return this.dispatch(() => this.state.finishMaintenance(this));
    }

    snapshot(): MachineSnapshot {
        return buildSnapshot({
            status: this.status as MachineStatus,
            errorType: this.errorType,
            actionError: this.actionError,
            inventory: this.inventory,
            sale: this.sale,
            log: this.log,
            maxQuantity: this.maxQuantity,
            paymentTimeoutMs: this.paymentTimeoutMs,
        });
    }

    private seed(): void {
        const items: [string, string, number, number][] = [
            ["Product_1", "Pepsi", 18, 10],
            ["Product_2", "Coke", 20, 10],
            ["Product_3", "Lays", 10, 10],
            ["Product_4", "Soda", 15, 10],
            ["Product_5", "Bisleri", 12, 10],
        ];
        items.forEach(([id, name, price, quantity], position) => {
            this.inventory.place(position, new Product(id, name, price, quantity));
        });
    }
}
