import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMapPin, FiSearch, FiShoppingBag } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

export default function Navbar({ search, onSearch, showSearch = true }) {
  const { count, address, setAddress } = useCart()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(address)
  const navigate = useNavigate()

  const saveAddress = () => {
    setAddress(draft.trim() || address)
    setEditing(false)
  }

  return (
    <header className="glass-nav sticky top-0 z-40">
      <div className="section-pad flex flex-wrap items-center gap-3 py-3 sm:gap-4 sm:py-4">
        <Link to="/" className="font-display text-2xl font-800 tracking-tight text-zest-600 sm:text-3xl" style={{ fontWeight: 800 }}>
          SwadHub
        </Link>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="hidden max-w-[220px] items-center gap-2 truncate rounded-xl bg-white/70 px-3 py-2 text-left text-sm text-ink-700 shadow-sm ring-1 ring-zest-100 md:flex"
        >
          <FiMapPin className="shrink-0 text-zest-500" />
          <span className="truncate">{address}</span>
        </button>

        {showSearch && (
          <div className="order-3 flex w-full flex-1 items-center gap-2 rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-zest-100 sm:order-none sm:min-w-[220px]">
            <FiSearch className="text-zest-500" />
            <input
              value={search || ''}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search area, kitchen, or dish in Bengaluru"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-700/40"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5"
        >
          <FiShoppingBag />
          <span>Bag</span>
          {count > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-citrus-500 px-1.5 text-xs text-ink-900">
              {count}
            </span>
          )}
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4" onClick={() => setEditing(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-float" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold">Delivery address</h3>
            <p className="mt-1 text-sm text-ink-700/70">Where should we drop your order?</p>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="mt-4 w-full rounded-xl border border-zest-200 px-3 py-3 outline-none focus:border-zest-500"
              placeholder="Street, apartment, landmark"
            />
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-xl bg-zest-50 px-4 py-2.5 font-medium">
                Cancel
              </button>
              <button type="button" onClick={saveAddress} className="btn-primary flex-1">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
