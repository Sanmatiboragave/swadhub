import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiCheck, FiMapPin, FiNavigation } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { inr } from '../utils/money'

const STEPS = [
  { id: 'confirmed', label: 'Confirmed', detail: 'Kitchen accepted your order' },
  { id: 'preparing', label: 'Preparing', detail: 'Chefs are plating your meal' },
  { id: 'on_the_way', label: 'On the way', detail: 'Courier picked up the bag' },
  { id: 'delivered', label: 'Delivered', detail: 'Enjoy — leave a tip if you like' },
]

export default function Tracking() {
  const { orderId } = useParams()
  const { lastOrder } = useCart()
  const order = lastOrder?.id === orderId ? lastOrder : lastOrder
  const [step, setStep] = useState(1)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 0),
      setTimeout(() => setStep(2), 4000),
      setTimeout(() => setStep(3), 9000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [orderId])

  const progress = useMemo(() => Math.min(100, (step / (STEPS.length - 1)) * 100), [step])

  if (!order) {
    return (
      <div className="min-h-screen">
        <Navbar showSearch={false} />
        <div className="section-pad py-20 text-center">
          <h1 className="font-display text-3xl font-bold">No active order</h1>
          <Link to="/" className="btn-primary mt-6 inline-flex">Order something</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar showSearch={false} />
      <div className="section-pad py-8">
        <p className="text-sm font-medium uppercase tracking-wider text-zest-600">Live tracking</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">Order {order.id}</h1>
        <p className="mt-2 text-ink-700/70">
          Delivering to {order.address} · ETA ~{order.etaMinutes - step * 6} min
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-zest-100">
            <div className="relative h-56 bg-gradient-to-br from-zest-200 via-zest-100 to-citrus-400/30 sm:h-72">
              <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: 'radial-gradient(circle at 20% 30%, #0d8a5b33 0, transparent 40%), radial-gradient(circle at 70% 60%, #e8a31744 0, transparent 35%)',
              }} />
              <div className="absolute left-[18%] top-[28%] flex flex-col items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-zest-500 text-white shadow-lift">
                  <FiMapPin />
                </span>
                <span className="mt-1 rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold">Kitchen</span>
              </div>
              <div className="absolute bottom-[22%] right-[16%] flex flex-col items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-white shadow-lift">
                  <FiNavigation />
                </span>
                <span className="mt-1 rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold">You</span>
              </div>
              <div
                className="absolute left-[22%] top-[36%] h-1.5 rounded-full bg-zest-500/30"
                style={{ width: '52%', transform: 'rotate(18deg)', transformOrigin: 'left center' }}
              >
                <div className="h-full rounded-full bg-zest-500 transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <div
                className="absolute grid h-12 w-12 place-items-center rounded-2xl bg-citrus-500 text-xl shadow-plate transition-all duration-700"
                style={{
                  left: `calc(18% + ${progress * 0.45}%)`,
                  top: `calc(30% + ${progress * 0.22}%)`,
                  transform: 'rotateY(-12deg)',
                }}
              >
                🛵
              </div>
            </div>

            <ol className="space-y-4 p-5 sm:p-6">
              {STEPS.map((s, i) => {
                const done = i <= step
                const current = i === step
                return (
                  <li key={s.id} className="flex gap-3">
                    <span className={`mt-0.5 grid h-8 w-8 place-items-center rounded-full ${done ? 'bg-zest-500 text-white' : 'bg-zest-50 text-ink-700/40'}`}>
                      {done ? <FiCheck /> : i + 1}
                    </span>
                    <div>
                      <div className={`font-semibold ${current ? 'text-zest-600' : ''}`}>{s.label}</div>
                      <div className="text-sm text-ink-700/65">{s.detail}</div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          <aside className="h-fit rounded-3xl bg-white p-5 shadow-lift ring-1 ring-zest-100 sm:p-6">
            <h2 className="font-display text-xl font-bold">Receipt</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3">
                  <span>{it.name} × {it.qty}</span>
                  <span className="font-medium">{inr(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-zest-100 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-ink-700/60">Delivery</span><span>{order.delivery === 0 ? 'Free' : inr(order.delivery)}</span></div>
              <div className="flex justify-between"><span className="text-ink-700/60">GST</span><span>{inr(order.tax)}</span></div>
              <div className="flex justify-between text-base font-bold"><span>Paid</span><span>{inr(order.total)}</span></div>
            </div>
            <p className="mt-4 text-xs text-ink-700/55">Paid via {order.payment === 'card' ? 'Card' : 'UPI / Wallet'} · {order.name}</p>
            <Link to="/" className="btn-primary mt-6 w-full">Order again</Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
