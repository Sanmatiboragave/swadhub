import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { deliveryFee, gst } from '../utils/money'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('swadhub_cart') ?? localStorage.getItem('zestly_cart') ?? '{}'
      return JSON.parse(stored)
    } catch {
      return {}
    }
  })
  const [address, setAddress] = useState(() => {
    const stored = localStorage.getItem('swadhub_address') ?? localStorage.getItem('zestly_address')
    return stored || 'Koramangala 5th Block, Bengaluru'
  })
  const [lastOrder, setLastOrder] = useState(() => {
    try {
      const stored = localStorage.getItem('swadhub_last_order') ?? localStorage.getItem('zestly_last_order') ?? 'null'
      return JSON.parse(stored)
    } catch {
      return null
    }
  })

  useEffect(() => {
    localStorage.setItem('swadhub_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('swadhub_address', address)
  }, [address])

  useEffect(() => {
    if (lastOrder) localStorage.setItem('swadhub_last_order', JSON.stringify(lastOrder))
  }, [lastOrder])

  const add = (item, restaurant) => {
    setCart((prev) => {
      const next = { ...prev }
      const existing = next[item.id]
      next[item.id] = existing
        ? { ...existing, qty: existing.qty + 1 }
        : {
            ...item,
            qty: 1,
            restaurantId: restaurant?.id,
            restaurantName: restaurant?.name,
          }
      return next
    })
  }

  const setQty = (id, qty) => {
    setCart((prev) => {
      const next = { ...prev }
      if (qty <= 0) {
        delete next[id]
      } else if (next[id]) {
        next[id] = { ...next[id], qty }
      }
      return next
    })
  }

  const remove = (id) => {
    setCart((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const clear = () => setCart({})

  const placeOrder = (details) => {
    const items = Object.values(cart)
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const delivery = deliveryFee(subtotal)
    const tax = gst(subtotal)
    const total = subtotal + delivery + tax
    const order = {
      id: 'ZL-' + Date.now().toString(36).toUpperCase(),
      items,
      subtotal,
      delivery,
      tax,
      total,
      address: details.address || address,
      phone: details.phone || '',
      name: details.name || 'Guest',
      payment: details.payment || 'card',
      createdAt: new Date().toISOString(),
      status: 'preparing',
      etaMinutes: 28,
    }
    setLastOrder(order)
    clear()
    return order
  }

  const value = useMemo(() => {
    const items = Object.values(cart)
    const count = items.reduce((s, i) => s + i.qty, 0)
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    return {
      cart,
      items,
      count,
      subtotal,
      add,
      setQty,
      remove,
      clear,
      address,
      setAddress,
      lastOrder,
      setLastOrder,
      placeOrder,
    }
  }, [cart, address, lastOrder])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
