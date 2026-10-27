import { VendingMachine } from '../../VendingMachine'
import type { MachineSnapshot } from '../../MachineSnapshot'

const machine = new VendingMachine({ paymentTimeoutMs: 60_000, inventoryPassword: '1234' })

type Listener = (snapshot: MachineSnapshot) => void

const listeners = new Set<Listener>()

// Reads the snapshot and clears the last refusal, so an error is delivered once.
function capture(): MachineSnapshot {
  const snapshot = machine.snapshot()
  machine.clearActionError()
  return snapshot
}

let latest = capture()

machine.subscribe(() => {
  latest = capture()
  listeners.forEach((listener) => listener(latest))
})

/** Calls `listener` with a new snapshot after every machine change, including timeouts. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getMachine(): Promise<MachineSnapshot> {
  return Promise.resolve(latest)
}

// Runs a machine action, then returns the new snapshot (which carries any refusal in `error`).
function act(action: () => boolean): Promise<MachineSnapshot> {
  action()
  return getMachine()
}

export const selectProduct = (position: number, quantity: number) => act(() => machine.selectProduct(position, quantity))
export const insertMoney = (amount: number) => act(() => machine.insertMoney(amount))
export const buyProduct = () => act(() => machine.buy())
export const cancelTransaction = () => act(() => machine.cancel())
export const acknowledge = () => act(() => machine.acknowledge())
export const createProduct = (position: number, name: string, price: number, quantity: number) =>
  act(() => machine.addProduct(position, name, price, quantity))
export const restockProduct = (id: string, quantity: number) => act(() => machine.addInventory(id, quantity))
export const startInventoryLoad = (password: string) => act(() => machine.startInventoryLoad(password))
export const quitInventoryLoad = () => act(() => machine.quitInventoryLoad())
export const startMaintenance = () => act(() => machine.startMaintenance())
export const finishMaintenance = () => act(() => machine.finishMaintenance())
