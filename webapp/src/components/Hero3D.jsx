import React from 'react'
import { FiArrowRight, FiClock, FiStar } from 'react-icons/fi'

export default function Hero3D({ onBrowse, total = 0, areas = 0 }) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(105deg, rgba(7, 91, 62, 0.88) 0%, rgba(13, 138, 91, 0.72) 42%, rgba(20, 34, 28, 0.35) 100%), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-citrus-400/25 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-zest-300/20 blur-3xl" />

      <div className="section-pad relative grid min-h-[78vh] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="animate-riseIn text-white">
          <p className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl" style={{ fontWeight: 800 }}>
            SwadHub
          </p>
          <h1 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl md:text-[2.75rem]">
            Every cuisine in Bengaluru. Delivered hot.
          </h1>
          <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">
            {total.toLocaleString('en-IN')} kitchens across {areas} neighbourhoods — dosa to sushi, biryani to BBQ. Search an area, build your bag, track the courier.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onBrowse} className="inline-flex items-center gap-2 rounded-xl bg-citrus-500 px-6 py-3.5 font-semibold text-ink-900 shadow-float transition hover:-translate-y-1">
              Order now <FiArrowRight />
            </button>
            <div className="flex items-center gap-4 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5"><FiStar className="text-citrus-400" /> 4.8 avg</span>
              <span className="inline-flex items-center gap-1.5"><FiClock /> ~25 min</span>
            </div>
          </div>
        </div>

        <div className="perspective-scene relative mx-auto h-[320px] w-full max-w-md sm:h-[380px] lg:h-[420px]">
          <div className="preserve-3d absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 animate-pulseRing" />
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 animate-pulseRing" style={{ animationDelay: '0.6s' }} />

            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80"
              alt="Signature burger"
              className="food-plate absolute left-[8%] top-[8%] w-[58%] rounded-[2rem] object-cover animate-floaty"
              style={{ transform: 'rotateY(-18deg) rotateX(8deg)' }}
            />
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
              alt="Wood-fired pizza"
              className="food-plate absolute bottom-[6%] right-[2%] w-[52%] rounded-[1.75rem] object-cover animate-floatySlow"
              style={{ transform: 'rotateY(16deg) rotateX(6deg)', animationDelay: '0.8s' }}
            />
            <img
              src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80"
              alt="Fresh sushi"
              className="food-plate absolute right-[10%] top-[12%] w-[36%] rounded-2xl object-cover animate-floaty"
              style={{ transform: 'rotateY(22deg) rotateX(-4deg)', animationDelay: '1.4s' }}
            />
            <img
              src="https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=500&q=80"
              alt="Fresh dessert bowl"
              className="food-plate absolute bottom-[10%] left-[18%] w-[30%] rounded-[1.5rem] object-cover animate-floatySlow"
              style={{ transform: 'rotateY(-22deg) rotateX(10deg)', animationDelay: '1.8s' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
