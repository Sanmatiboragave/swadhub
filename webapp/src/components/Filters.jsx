import React from 'react'

export default function Filters() {
  return (
    <div className="bg-white py-4 border-b">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-4 flex-wrap">
          <select className="px-3 py-2 border rounded">
            <option>Sort By</option>
            <option>Rating</option>
            <option>Delivery Time</option>
            <option>Price: Low to High</option>
          </select>
          <select className="px-3 py-2 border rounded">
            <option>Filter</option>
            <option>Open Now</option>
            <option>Offers</option>
            <option>New</option>
          </select>
        </div>
      </div>
    </div>
  )
}
