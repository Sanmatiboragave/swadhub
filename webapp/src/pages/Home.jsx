import React, { useMemo, useRef, useState } from 'react'
import { FiFilter, FiMapPin, FiShoppingBag } from 'react-icons/fi'
import restaurants, { areas, dishesMatch } from '../data/restaurants'
import Navbar from '../components/Navbar'
import Hero3D from '../components/Hero3D'
import CategoryRail from '../components/CategoryRail'
import RestaurantCard3D from '../components/RestaurantCard3D'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'

const PAGE = 24

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'fast', label: 'Under 25 min' },
  { id: 'free', label: 'Free delivery' },
  { id: 'top', label: '4.5+ rating' },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [filter, setFilter] = useState('all')
  const [area, setArea] = useState('all')
  const [visible, setVisible] = useState(PAGE)
  const [cartOpen, setCartOpen] = useState(false)
  const listRef = useRef(null)
  const { count } = useCart()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return restaurants.filter((r) => {
      const matchArea = area === 'all' || r.area === area
      const matchCat = category === 'all' || r.categories.includes(category)
      const matchFilter =
        filter === 'all' ||
        (filter === 'fast' && r.etaMin <= 25) ||
        (filter === 'free' && r.fee === 0) ||
        (filter === 'top' && r.rating >= 4.5)
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        dishesMatch(r, q)
      return matchArea && matchCat && matchFilter && matchSearch
    })
  }, [search, category, filter, area])

  const shown = filtered.slice(0, visible)

  const browse = () => listRef.current?.scrollIntoView({ behavior: 'smooth' })

  const setAndReset = (fn) => (value) => {
    fn(value)
    setVisible(PAGE)
  }

  return (
    <div className="min-h-screen">
      <Navbar search={search} onSearch={(v) => { setSearch(v); setVisible(PAGE) }} />
      <Hero3D onBrowse={browse} total={restaurants.length} areas={areas.length} />
      <CategoryRail active={category} onChange={setAndReset(setCategory)} />

      <div className="section-pad flex flex-wrap items-center gap-2 pb-2" ref={listRef} id="restaurants">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700">
          <FiFilter className="text-zest-500" /> Filters
        </span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => { setFilter(f.id); setVisible(PAGE) }}
            className={`chip ${filter === f.id ? 'chip-active' : ''}`}
          >
            {f.label}
          </button>
        ))}
        <label className="chip cursor-pointer">
          <FiMapPin className="text-zest-500" />
          <select
            value={area}
            onChange={(e) => { setArea(e.target.value); setVisible(PAGE) }}
            className="max-w-[180px] bg-transparent text-sm outline-none"
          >
            <option value="all">All Bengaluru areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>

      <main className="section-pad py-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Restaurants across Bengaluru</h2>
            <p className="mt-1 text-sm text-ink-700/70">
              Showing {shown.length} of {filtered.length.toLocaleString('en-IN')} kitchens
              {area !== 'all' ? ` in ${area}` : ' citywide'}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white/80 py-16 text-center ring-1 ring-zest-100">
            <p className="font-display text-xl font-bold">No matches</p>
            <p className="mt-1 text-ink-700/70">Try another cuisine, area, or clear filters.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((r) => (
                <RestaurantCard3D key={r.id} restaurant={r} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((n) => n + PAGE)}
                  className="btn-primary"
                >
                  Load more kitchens
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer total={restaurants.length} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {count > 0 && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-2xl bg-zest-500 px-5 py-3.5 font-semibold text-white shadow-plate transition hover:-translate-y-1"
        >
          <FiShoppingBag /> View bag · {count}
        </button>
      )}
    </div>
  )
}
