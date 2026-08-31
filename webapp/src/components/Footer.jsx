import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer({ total }) {
  return (
    <footer className="mt-16 border-t border-zest-100 bg-ink-900 text-white">
      <div className="section-pad grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <div className="font-display text-3xl font-extrabold text-zest-300">SwadHub</div>
          <p className="mt-2 max-w-xs text-sm text-white/70">
            Food delivery across Bengaluru — every cuisine, every neighbourhood, with 3D depth and live tracking.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link to="/" className="hover:text-citrus-400">All Bengaluru kitchens</Link></li>
            <li><a href="#restaurants" className="hover:text-citrus-400">Filter by area</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">City coverage</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>{typeof total === 'number' ? total.toLocaleString('en-IN') : 'Thousands of'} restaurants</li>
            <li>Koramangala · Indiranagar · Whitefield · Jayanagar · HSR</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} SwadHub Bengaluru. Demo catalogue — not an official listing of every licensed outlet.
      </div>
    </footer>
  )
}
