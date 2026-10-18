import type { MachineState } from './types'

function isMachineState(value: unknown): value is MachineState {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'products' in value &&
      Array.isArray((value as MachineState).products),
  )
}

async function request(path: string, body?: unknown): Promise<MachineState> {
  let response: Response
  try {
    response = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('The vending machine API is not running.')
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error('The vending machine API is not running.')
  }

  if (!isMachineState(data)) {
    const message = data && typeof data === 'object' && 'error' in data
      ? String((data as { error: unknown }).error)
      : 'The vending machine API is not running.'
    throw new Error(message)
  }

  return data
}

export function getMachine() {
  return request('/api/machine')
}

export function selectProduct(position: number, quantity: number) {
  return request('/api/select', { position, quantity })
}

export function insertMoney(amount: number) {
  return request('/api/insert', { amount })
}

export function buyProduct() {
  return request('/api/buy', {})
}

export function cancelTransaction() {
  return request('/api/cancel', {})
}

export function createProduct(name: string, price: number, quantity: number) {
  return request('/api/products', { name, price, quantity })
}

export function restockProduct(id: string, quantity: number) {
  return request('/api/inventory', { id, quantity })
}
