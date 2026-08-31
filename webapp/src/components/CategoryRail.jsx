import React from 'react'
import { categories } from '../data/restaurants'

export default function CategoryRail({ active, onChange }) {
  return (
    <div className="section-pad py-5">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={`chip whitespace-nowrap ${active === c.id ? 'chip-active' : 'hover:border-zest-400'}`}
          >
            <span className="text-base">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
