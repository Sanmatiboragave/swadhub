import React from 'react'
import { Link } from 'react-router-dom'
import { FiMinus, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { inr } from '../utils/money'

export default function CartDrawer({ open, onClose }) {
  const { items, subtotal, setQty, remove } = useCart()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-900/45" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col bg-[#f7fbf9] shadow-float animate-riseIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zest-100 px-5 py-4">
          <h3 className="font-display text-2xl font-bold">Your bag</h3>
          <button type="button" onClick={onClose} className="rounded-full bg-white p-2 shadow-sm" aria-label="Close cart">
            <FiX />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {items.length === 0 && (
            <p className="py-10 text-center text-ink-700/70">Your bag is empty. Lift something delicious.</p>
          )}
          {items.map((it) => (
            <div key={it.id} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-zest-100">
              <img src={it.img} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold leading-tight">{it.name}</div>
                <div className="text-xs text-ink-700/60">{it.restaurantName}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-zest-50 px-2 py-1">
                    <button type="button" onClick={() => setQty(it.id, it.qty - 1)} aria-label="Decrease"><FiMinus size={14} /></button>
                    <span className="min-w-4 text-center text-sm font-semibold">{it.qty}</span>
                    <button type="button" onClick={() => setQty(it.id, it.qty + 1)} aria-label="Increase"><FiPlus size={14} /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{inr(it.price * it.qty)}</span>
                    <button type="button" onClick={() => remove(it.id)} className="text-flame" aria-label="Remove"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-zest-100 bg-white px-5 py-4">
          <div className="mb-3 flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{inr(subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            onClick={onClose}
            className={`btn-primary w-full ${items.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
          >
            Go to checkout
          </Link>
        </div>
      </aside>
    </div>
  )
}
