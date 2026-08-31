import React, { useRef } from 'react'
import { FiPlus } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { inr } from '../utils/money'

export default function FoodCard3D({ item, restaurant }) {
  const { add } = useCart()
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    el.style.transform = `rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 12}deg)`
  }

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'rotateX(0) rotateY(0)'
  }

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="card-3d flex gap-3 overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-zest-100 sm:gap-4 sm:p-4"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28">
        <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
        {item.popular && (
          <span className="absolute left-1 top-1 rounded bg-flame px-1.5 py-0.5 text-[10px] font-bold text-white">HOT</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display text-lg font-bold leading-tight">{item.name}</h4>
          {item.veg && <span className="mt-1 h-3 w-3 shrink-0 rounded-sm border-2 border-zest-500" title="Veg" />}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-ink-700/70">{item.desc}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-ink-900">{inr(item.price)}</span>
          <button type="button" onClick={() => add(item, restaurant)} className="btn-flame">
            <FiPlus /> Add
          </button>
        </div>
      </div>
    </article>
  )
}
