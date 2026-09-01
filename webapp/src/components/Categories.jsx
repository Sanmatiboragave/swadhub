import React from 'react'

export default function Categories() {
  return (
    <div className="bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {['All', 'Fast Food', 'Chinese', 'Indian', 'Pizza', 'Desserts'].map(cat => (
            <button key={cat} className="px-4 py-2 bg-white rounded-full whitespace-nowrap hover:bg-indigo-100">
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
