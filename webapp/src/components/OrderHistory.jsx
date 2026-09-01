import React, { useState, useEffect } from 'react'

export default function OrderHistory({ token, apiBase }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    
    fetch(`${apiBase}/order/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token, apiBase])

  if (loading) return <div className="p-4">Loading...</div>
  
  if (orders.length === 0) {
    return <div className="p-4 text-center text-gray-500">No orders yet</div>
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Order History</h3>
      <div className="space-y-4">
        {orders.map((order, idx) => (
          <div key={idx} className="border-b pb-4">
            <div className="flex justify-between">
              <span className="font-semibold">Order #{order.id || idx + 1}</span>
              <span className="text-gray-600">${order.total || 0}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {order.date || new Date().toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
