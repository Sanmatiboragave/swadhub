import React, { createContext, useState, useEffect } from 'react'

export const CartContext = createContext()

export function CartProvider({children}){
  const API_BASE = 'http://127.0.0.1:8001'
  const [cart, setCart] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('fd_cart')||'{}') }catch(e){return {}}
  })
  useEffect(()=>{ localStorage.setItem('fd_cart', JSON.stringify(cart)) }, [cart])

  // sync to server when logged in
  useEffect(()=>{
    const token = localStorage.getItem('fd_token')
    if(!token) return
    // POST cart to server
    fetch(API_BASE + '/cart', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ token, cart }) }).catch(()=>{})
  }, [cart])
  const add = (item)=>{
    setCart(prev=>{
      const copy = {...prev}
      copy[item.id] = copy[item.id] ? {...copy[item.id], qty: copy[item.id].qty + 1} : {...item, qty:1}
      return copy
    })
  }
  // load server cart (if any)
  useEffect(()=>{
    const token = localStorage.getItem('fd_token')
    if(!token) return
    fetch(API_BASE + `/cart?token=${token}`).then(r=>r.json()).then(j=>{ if(j && j.cart) setCart(j.cart) }).catch(()=>{})
  }, [])
  const remove = (id)=>{ setCart(prev=>{ const c = {...prev}; delete c[id]; return c }) }
  const clear = ()=> setCart({})
  return <CartContext.Provider value={{cart, add, remove, clear, setCart}}>{children}</CartContext.Provider>
}
