export type ProductSlot = {
  position: number
  id: string
  name: string
  price: number
  quantity: number
}

export type MachineEvent = {
  type: string
  message: string
}

export type MachineOrder = {
  id: string
  total: number
  status: string
  quantity: number
  products: { id: string; name: string; price: number }[]
}

export type MachineState = {
  products: ProductSlot[]
  selection: { position: number; quantity: number } | null
  insertedAmount: number
  order: MachineOrder | null
  message: string
  events: MachineEvent[]
  dispensed: { name: string; quantity: number } | null
  changeAmount: number | null
  error?: string
}
