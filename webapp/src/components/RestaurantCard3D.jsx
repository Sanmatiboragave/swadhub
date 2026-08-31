import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiClock, FiMapPin, FiStar, FiTruck } from 'react-icons/fi'
import { inr } from '../utils/money'

export default function RestaurantCard3D({ restaurant }) {
  const ref = useRef(null)
  const title = restaurant.name.split(' — ')[0]

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotY = (x - 0.5) * 14
    const rotX = (0.5 - y) * 10
    el.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`
  }

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)'
  }

  return (
    <Link to={`/restaurant/${restaurant.id}`} className="perspective-scene block animate-riseIn">
      <article
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="card-3d overflow-hidden rounded-3xl bg-white ring-1 ring-zest-100"
      >
        <div className="relative h-44 overflow-hidden sm:h-48">
          <img
            src={restaurant.img}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            style={{ transform: 'translateZ(24px)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/55 via-transparent to-transparent" />
          {restaurant.offer && (
            <span className="absolute left-3 top-3 rounded-lg bg-citrus-500 px-2.5 py-1 text-xs font-bold text-ink-900">
              {restaurant.offer}
            </span>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <h3 className="font-display text-xl font-bold">{title}</h3>
              <p className="text-sm text-white/80">{restaurant.cuisine}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/75">
                <FiMapPin /> {restaurant.area}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-xs font-semibold text-ink-900">
              <FiStar className="text-citrus-500" /> {restaurant.rating}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-ink-700">
          <span className="inline-flex items-center gap-1.5"><FiClock className="text-zest-500" /> {restaurant.eta}</span>
          <span className="inline-flex items-center gap-1.5">
            <FiTruck className="text-zest-500" />
            {restaurant.fee === 0 ? 'Free delivery' : inr(restaurant.fee)}
          </span>
        </div>
      </article>
    </Link>
  )
}
