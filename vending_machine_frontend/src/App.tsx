import { useEffect, useState } from 'react'
import {
  buyProduct,
  cancelTransaction,
  createProduct,
  getMachine,
  insertMoney,
  restockProduct,
  selectProduct,
} from './api'
import type { MachineState } from './types'
import './App.css'

const BILLS = [1, 2, 5, 10, 20]

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

export default function App() {
  const [state, setState] = useState<MachineState | null>(null)
  const [offline, setOffline] = useState(false)
  const [busy, setBusy] = useState(false)
  const [draftQty, setDraftQty] = useState(1)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('2')
  const [newQuantity, setNewQuantity] = useState('8')
  const [restockId, setRestockId] = useState('')
  const [restockQty, setRestockQty] = useState('5')

  useEffect(() => {
    let active = true
    getMachine()
      .then((next) => {
        if (!active) return
        setState(next)
        setRestockId((current) => current || next.products[0]?.id || '')
      })
      .catch(() => {
        if (active) setOffline(true)
      })
    return () => {
      active = false
    }
  }, [])

  async function run(action: () => Promise<MachineState>) {
    setBusy(true)
    try {
      const next = await action()
      setState(next)
      setOffline(false)
      setRestockId((current) => current || next.products[0]?.id || '')
      return next
    } catch {
      setOffline(true)
      return null
    } finally {
      setBusy(false)
    }
  }

  const order = state?.order?.status === 'pending' ? state.order : null
  const selectedName = order?.products[0]?.name
  const trayOpen = Boolean(state?.dispensed || (state?.changeAmount ?? 0) > 0)

  return (
    <main className="page">
      <header className="intro">
        <p className="eyebrow">Simulated counter</p>
        <h1>Vending machine</h1>
        <p className="lede">Select a slot, insert rupees, then buy or cancel. Change drops into the tray.</p>
      </header>

      {offline && (
        <p className="banner" role="alert">
          The machine API is not running. Start it with <code>npm run api</code> in vending_machine_backend.
        </p>
      )}

      <section className="cabinet" aria-label="Vending machine">
        <div className="glass">
          <div className="glass-bar">
            <span>Slots</span>
            <span>{state ? `${state.products.length} products` : '—'}</span>
          </div>
          <div className="slots">
            {state?.products.map((product) => {
              const selected = state.selection?.position === product.position
              const soldOut = product.quantity === 0
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`slot${selected ? ' selected' : ''}${soldOut ? ' sold-out' : ''}`}
                  disabled={busy}
                  onClick={() => run(() => selectProduct(product.position, draftQty))}
                >
                  <span className="slot-no">{product.position + 1}</span>
                  <ProductArt name={product.name} />
                  <span className="slot-name">{product.name}</span>
                  <span className="slot-meta">
                    <span>{rupees(product.price)}</span>
                    <span>{soldOut ? 'Sold out' : `${product.quantity} left`}</span>
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
            <button type="button" disabled={busy || draftQty >= 20} onClick={() => setDraftQty((qty) => qty + 1)} aria-label="Increase quantity">+</button>
          </div>

          <div className="keypad" aria-label="Product keypad">
            {state?.products.map((product) => (
              <button
                key={product.id}
                type="button"
                disabled={busy}
                className={state.selection?.position === product.position ? 'lit' : ''}
                onClick={() => run(() => selectProduct(product.position, draftQty))}
              >
                {product.position + 1}
              </button>
            ))}
          </div>

          <div className="bills" aria-label="Insert money">
            {BILLS.map((bill) => (
              <button
                key={bill}
                type="button"
                disabled={busy || !order}
                onClick={() => run(() => insertMoney(bill))}
              >
                {rupees(bill)}
              </button>
            ))}
          </div>

          <div className="actions">
            <button type="button" className="buy" disabled={busy || !order} onClick={() => run(() => buyProduct())}>
              Buy
            </button>
            <button
              type="button"
              className="cancel"
              disabled={busy || (!order && (state?.insertedAmount ?? 0) === 0)}
              onClick={() => run(() => cancelTransaction())}
            >
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
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const price = Number(newPrice)
            const quantity = Number(newQuantity)
            if (!newName.trim() || !Number.isFinite(price) || !Number.isFinite(quantity)) return
            void run(() => createProduct(newName.trim(), price, quantity)).then((next) => {
              if (next && !next.error) setNewName('')
            })
          }}
        >
          <h3>Add product</h3>
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
          <button type="submit" disabled={busy || !state}>Add</button>
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
              {state?.products.map((product) => (
                <option key={product.id} value={product.id}>
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
      </section>
    </main>
  )
}
