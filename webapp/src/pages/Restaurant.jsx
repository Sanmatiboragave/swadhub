import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiClock, FiMapPin, FiStar, FiTruck } from 'react-icons/fi'
import { getRestaurant } from '../data/restaurants'
import Navbar from '../components/Navbar'
import FoodCard3D from '../components/FoodCard3D'
import CartDrawer from '../components/CartDrawer'
import { useCart } from '../context/CartContext'
import { inr } from '../utils/money'

export default function Restaurant() {
  const { id } = useParams()
  const restaurant = getRestaurant(id)
  const [onlyVeg, setOnlyVeg] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { count } = useCart()

  const menu = useMemo(() => {
    if (!restaurant) return []
    return onlyVeg ? restaurant.menu.filter((m) => m.veg) : restaurant.menu
  }, [restaurant, onlyVeg])

  if (!restaurant) {
    return (
      <div className="section-pad py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Kitchen not found</h1>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <Navbar showSearch={false} />

      <div className="relative h-56 overflow-hidden sm:h-72 md:h-80">
        <img src={restaurant.hero || restaurant.img} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
        <div className="section-pad absolute inset-x-0 bottom-0 pb-6 text-white">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-white/85 hover:text-citrus-400">
            <FiArrowLeft /> All kitchens
          </Link>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl">{restaurant.name.split(' — ')[0]}</h1>
          <p className="mt-1 text-white/80">{restaurant.cuisine} · {restaurant.area}, Bengaluru</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 backdrop-blur">
              <FiStar className="text-citrus-400" /> {restaurant.rating} ({restaurant.reviews.toLocaleString('en-IN')})
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 backdrop-blur">
              <FiClock /> {restaurant.eta}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 backdrop-blur">
              <FiTruck /> {restaurant.fee === 0 ? 'Free delivery' : `${inr(restaurant.fee)} fee`}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 backdrop-blur">
              <FiMapPin /> {restaurant.distance}
            </span>
          </div>
        </div>
      </div>

      <div className="section-pad py-6">
        {restaurant.offer && (
          <div className="mb-5 rounded-2xl bg-citrus-500/15 px-4 py-3 text-sm font-semibold text-ink-800 ring-1 ring-citrus-500/30">
            {restaurant.offer} · {restaurant.distance} away
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">Menu</h2>
          <label className="chip cursor-pointer">
            <input type="checkbox" checked={onlyVeg} onChange={(e) => setOnlyVeg(e.target.checked)} className="accent-zest-500" />
            Veg only
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {menu.map((item) => (
            <FoodCard3D key={item.id} item={item} restaurant={restaurant} />
          ))}
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {count > 0 && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-2xl bg-ink-900 px-6 py-3.5 font-semibold text-white shadow-plate"
        >
          View bag · {count} items
        </button>
      )}
    </div>
  )
}
