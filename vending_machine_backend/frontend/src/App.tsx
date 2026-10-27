import { useEffect, useState } from 'react'
import {
  acknowledge,
  buyProduct,
  cancelTransaction,
  createProduct,
  finishMaintenance,
  getMachine,
  insertMoney,
  quitInventoryLoad,
  restockProduct,
  selectProduct,
  startInventoryLoad,
  startMaintenance,
  subscribe,
} from './api'
import type { MachineSnapshot } from '../../MachineSnapshot'
import { Status } from '../../states/statuses'
import './App.css'

type ProductSlot = MachineSnapshot['products'][number]

function rupees(amount: number) {
  return `₹${amount}`
}

function artClass(name: string) {
  const key = name.toLowerCase()
  if (key.includes('lays') || key.includes('chip')) return 'art bag lays'
  if (key.includes('bisleri') || key.includes('water')) return 'art bottle water'
  if (key.includes('pepsi')) return 'art can pepsi'
  if (key.includes('coke')) return 'art can coke'
  if (key.includes('soda')) return 'art can soda'
  return 'art can plain'
}

function ProductArt({ name }: { name: string }) {
  const kind = artClass(name)
  return (
    <span className={kind} aria-hidden="true">
      {kind.includes('can') && <span className="band" />}
      {kind.includes('bottle') && <span className="cap" />}
      {kind.includes('bag') && <span className="seal" />}
    </span>
  )
}

function wholeNumber(value: string) {
  if (!/^\d+$/.test(value)) return null
  return Number(value)
}

function statusLabel(state: MachineSnapshot) {
  if (state.status === Status.ERROR && state.errorType) {
    return `ERROR · ${state.errorType.replaceAll('_', ' ')}`
  }
  return state.status.replaceAll('_', ' ')
}

export default function App() {
  const [state, setState] = useState<MachineSnapshot | null>(null)
  const [offline, setOffline] = useState(false)
  const [busy, setBusy] = useState(false)
  const [draftQty, setDraftQty] = useState(1)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('8')
  const [newQuantity, setNewQuantity] = useState('4')
  const [newPosition, setNewPosition] = useState('')
  const [restockId, setRestockId] = useState('')
  const [restockQty, setRestockQty] = useState('5')
  const [password, setPassword] = useState('')

  function rememberStock(next: MachineSnapshot) {
    setRestockId((current) => current || next.products.find((product) => product.id)?.id || '')
    setNewPosition((current) => current || String(next.products.find((product) => product.empty)?.position ?? ''))
  }

  useEffect(() => {
    const apply = (next: MachineSnapshot) => {
      setState(next)
      rememberStock(next)
    }
    void getMachine().then(apply)
    return subscribe(apply)
  }, [])

  async function run(action: () => Promise<MachineSnapshot>) {
    setBusy(true)
    try {
      const next = await action()
      setState(next)
      setOffline(false)
      rememberStock(next)
      return next
    } catch {
      setOffline(true)
      return null
    } finally {
      setBusy(false)
    }
  }

  const order = state?.order?.status === 'inprogress' ? state.order : null
  const selectedName = order?.products[0]?.name
  const idle = state?.status === Status.IDLE
  const paying = state?.status === Status.PROCESSING_ORDER
  const loading = state?.status === Status.BULK_INVENTORY_UPDATE
  const maxQuantity = state?.maxQuantity ?? 20
  const canCancel = paying || (state?.status === Status.ERROR && (state.insertedAmount > 0 || order !== null))
  const trayOpen = state?.status === Status.DISPENSING_ORDER || Boolean(state?.dispensed) || (state?.changeAmount ?? 0) > 0

  function onSlot(product: ProductSlot) {
    if (loading && product.empty) {
      setNewPosition(String(product.position))
      return
    }
    if (idle && !product.empty) {
      void run(() => selectProduct(product.position, draftQty))
    }
  }

  return (
    <main className="page">
      <header className="intro">
        <p className="eyebrow">Simulated counter</p>
        <h1>Vending machine</h1>
        <p className="lede">Select a slot, insert rupees, then buy or cancel. Change drops into the tray.</p>
      </header>

      {offline && (
        <p className="banner" role="alert">
          The machine failed to start.
        </p>
      )}

      {state?.status === Status.ERROR && (
        <p className="banner with-action" role="alert">
          <span>{state.message}</span>
          <button type="button" disabled={busy} onClick={() => run(() => acknowledge())}>Continue</button>
        </p>
      )}

      {state?.status === Status.UNDER_MAINTENANCE && (
        <p className="banner" role="status">
          Machine is under maintenance. Product selection, payment, and inventory loading are off.
        </p>
      )}

      <section className="cabinet" aria-label="Vending machine">
        <div className="glass">
          <div className="glass-bar">
            <span>{state ? statusLabel(state) : 'Slots'}</span>
            <span>{state ? `${state.products.filter((product) => !product.empty).length} products` : '—'}</span>
          </div>
          <div className="slots">
            {state?.products.map((product) => {
              const selected = !product.empty && state.selection?.position === product.position
              const chosen = loading && product.empty && String(product.position) === newPosition
              const soldOut = !product.empty && product.quantity === 0
              const enabled = !busy && ((idle && !product.empty) || (loading && product.empty))
              return (
                <button
                  key={product.position}
                  type="button"
                  className={`slot${selected || chosen ? ' selected' : ''}${soldOut ? ' sold-out' : ''}${product.empty ? ' empty' : ''}`}
                  disabled={!enabled}
                  onClick={() => onSlot(product)}
                >
                  <span className="slot-no">{product.position + 1}</span>
                  {product.name && <ProductArt name={product.name} />}
                  <span className="slot-name">{product.empty ? 'Empty' : product.name}</span>
                  <span className="slot-meta">
                    <span>{product.price === null ? '—' : rupees(product.price)}</span>
                    <span>{product.empty ? 'Open slot' : soldOut ? 'Sold out' : `${product.quantity} left`}</span>
                  </span>
                </button>
              )
            })}
            {!state && <p className="slot-wait">{offline ? 'API offline' : 'Powering on…'}</p>}
          </div>
        </div>

        <div className="controls">
          <div className="display" aria-live="polite">
            <p key={state?.message}>{state?.message ?? 'Powering on…'}</p>
            <dl>
              <div>
                <dt>Item</dt>
                <dd>{selectedName ? `${selectedName} × ${order?.quantity}` : 'None'}</dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>{order ? rupees(order.total) : '—'}</dd>
              </div>
              <div>
                <dt>Credit</dt>
                <dd>{rupees(state?.insertedAmount ?? 0)}</dd>
              </div>
            </dl>
          </div>

          <div className="qty" aria-label="Quantity">
            <span>Qty</span>
            <button type="button" disabled={busy || draftQty <= 1} onClick={() => setDraftQty((qty) => qty - 1)} aria-label="Decrease quantity">−</button>
            <strong>{draftQty}</strong>
            <button type="button" disabled={busy || draftQty >= maxQuantity} onClick={() => setDraftQty((qty) => qty + 1)} aria-label="Increase quantity">+</button>
          </div>

          <div className="keypad" aria-label="Product keypad">
            {state?.products.filter((product) => !product.empty).map((product) => (
              <button
                key={product.id}
                type="button"
                disabled={busy || !idle}
                className={state.selection?.position === product.position ? 'lit' : ''}
                onClick={() => run(() => selectProduct(product.position, draftQty))}
              >
                {product.position + 1}
              </button>
            ))}
          </div>

          <div className="bills" aria-label="Insert money">
            {(state?.acceptedBills ?? []).map((bill) => (
              <button
                key={bill}
                type="button"
                disabled={busy || !paying}
                onClick={() => run(() => insertMoney(bill))}
              >
                {rupees(bill)}
              </button>
            ))}
          </div>

          <div className="actions">
            <button type="button" className="buy" disabled={busy || !paying} onClick={() => run(() => buyProduct())}>
              Buy
            </button>
            <button type="button" className="cancel" disabled={busy || !canCancel} onClick={() => run(() => cancelTransaction())}>
              Cancel
            </button>
          </div>
        </div>

        <div className={`tray${trayOpen ? ' open' : ''}`}>
          <div className="flap" aria-hidden="true" />
          <div className="tray-body">
            {state?.dispensed ? (
              <div className="taken">
                <ProductArt name={state.dispensed.name} />
                <p>{state.dispensed.quantity} {state.dispensed.name}</p>
              </div>
            ) : (
              <p className="tray-empty">{(state?.changeAmount ?? 0) > 0 ? 'Change returned' : 'Collect items here'}</p>
            )}
            {(state?.changeAmount ?? 0) > 0 && (
              <p className="change">Exchange {rupees(state?.changeAmount ?? 0)}</p>
            )}
            {state?.status === Status.DISPENSING_ORDER && (
              <button type="button" className="buy" disabled={busy} onClick={() => run(() => acknowledge())}>
                Collect
              </button>
            )}
          </div>
        </div>
      </section>

      {state && state.events.length > 0 && (
        <section className="notices" aria-label="Machine notices">
          <h2>Notices</h2>
          <ul>
            {state.events.map((event, index) => (
              <li key={`${event.type}-${index}`}>
                <span>{event.type.replaceAll('_', ' ')}</span>
                {event.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="stock">
        <h2>Stock room</h2>
        {loading ? (
          <>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const position = wholeNumber(newPosition)
                const price = wholeNumber(newPrice)
                const quantity = wholeNumber(newQuantity)
                if (!newName.trim() || position === null || price === null || price < 1 || quantity === null) return
                void run(() => createProduct(position, newName.trim(), price, quantity)).then((next) => {
                  if (next && !next.error) setNewName('')
                })
              }}
            >
              <h3>Add product</h3>
              <label>
                Empty slot
                <select value={newPosition} onChange={(event) => setNewPosition(event.target.value)}>
                  {state?.products.filter((product) => product.empty).map((product) => (
                    <option key={product.position} value={product.position}>{product.position + 1}</option>
                  ))}
                </select>
              </label>
              <label>
                Name
                <input value={newName} onChange={(event) => setNewName(event.target.value)} required />
              </label>
              <label>
                Price
                <input inputMode="numeric" value={newPrice} onChange={(event) => setNewPrice(event.target.value)} required />
              </label>
              <label>
                Quantity
                <input inputMode="numeric" value={newQuantity} onChange={(event) => setNewQuantity(event.target.value)} required />
              </label>
              <button type="submit" disabled={busy || !state?.products.some((product) => product.empty)}>Add</button>
            </form>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                const quantity = wholeNumber(restockQty)
                if (!restockId || quantity === null || quantity < 1) return
                void run(() => restockProduct(restockId, quantity))
              }}
            >
              <h3>Add inventory</h3>
              <label>
                Product
                <select value={restockId} onChange={(event) => setRestockId(event.target.value)}>
                  {state?.products.filter((product) => product.id && product.name).map((product) => (
                    <option key={product.id} value={product.id ?? ''}>
                      {product.position + 1}. {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity
                <input inputMode="numeric" value={restockQty} onChange={(event) => setRestockQty(event.target.value)} required />
              </label>
              <button type="submit" disabled={busy || !state}>Restock</button>
            </form>
            <div className="stock-actions">
              <button type="button" disabled={busy} onClick={() => run(() => quitInventoryLoad())}>Quit inventory loading</button>
            </div>
          </>
        ) : state?.status === Status.UNDER_MAINTENANCE ? (
          <div className="stock-actions">
            <p>Maintenance disables selection, payment, and inventory loading.</p>
            <button type="button" disabled={busy} onClick={() => run(() => finishMaintenance())}>Finish maintenance</button>
          </div>
        ) : (
          <>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void run(() => startInventoryLoad(password)).then((next) => {
                  if (next?.status === Status.BULK_INVENTORY_UPDATE) setPassword('')
                })
              }}
            >
              <h3>Load inventory</h3>
              <p className="hint">Demo password is 1234. A wrong password stays on the idle machine.</p>
              <label>
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              <button type="submit" disabled={busy || !idle}>Unlock</button>
            </form>
            <div className="stock-panel">
              <h3>Maintenance</h3>
              <p className="hint">Takes the machine out of order until maintenance is finished.</p>
              <button type="button" disabled={busy || !idle} onClick={() => run(() => startMaintenance())}>Start maintenance</button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
