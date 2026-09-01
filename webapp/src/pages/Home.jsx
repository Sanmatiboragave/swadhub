import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
import Categories from '../components/Categories'
import Filters from '../components/Filters'
import RestaurantCard from '../components/RestaurantCard'
import CartDrawer from '../components/CartDrawer'
import LoginModal from '../components/LoginModal'
import OrderHistory from '../components/OrderHistory'
import { CartProvider, CartContext } from '../context/CartContext'
import React, { useState, useContext, useEffect } from 'react'
import restaurants from '../data/restaurants'

export default function Home(){
  const API_BASE = 'http://127.0.0.1:8001'
  return (
    <CartProvider>
      <InnerHome apiBase={API_BASE} />
    </CartProvider>
  )
}

function InnerHome({apiBase}){
  const { add } = useContext(CartContext)
  const [token, setToken] = useState(localStorage.getItem('fd_token')||null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const handleLogin = (t)=>{ setToken(t); localStorage.setItem('fd_token', t) }
  const [menu, setMenu] = useState([])

  useEffect(()=>{
    fetch(apiBase + '/order/menu').then(r=>r.json()).then(j=>{
      // normalize fields to id,name,price,desc,img
      const mapped = (Array.isArray(j)?j:[]).map(it=>{
        const name = it.name || it.food_name || it.foodName || it.food_name || 'Dish'
        const id = it.id || it.food_id || it.foodId || name.toLowerCase().replace(/\s+/g,'-')
        const price = it.price || it.amount || 9.99
        const desc = it.desc || it.description || ''
        // prefer explicit img if provided; otherwise map some known names to local images
        let img = it.img || it.image || null
        if(!img){
          if(/pizza/i.test(name)) img = '/images/pizza.svg'
          else if(/wing|chicken/i.test(name)) img = '/images/wings.svg'
          else img = `https://source.unsplash.com/400x300/?${encodeURIComponent(name.split(' ')[0]||'food')}`
        }
        return { id, name, price, desc, img }
      })
      setMenu(mapped)
    }).catch(()=>{
      setMenu(restaurants)
    })
  }, [apiBase])

  return (
    <div>
      <Navbar onLoginClick={()=>{ if(token) setShowOrders(s=>!s); else setLoginOpen(true) }} logged={!!token} />
      <Banner />
      <Categories />
      <Filters />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold mb-4">Recommended</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menu.map(r => <div key={r.id}><RestaurantCard r={r} /><div className="p-2"><button onClick={()=>add({...r, price: r.price || 9.99})} className="px-3 py-2 bg-indigo-600 text-white rounded">Add</button></div></div>)}
        </div>
      </main>
      <CartDrawer apiBase={apiBase} token={token} />
      <LoginModal open={loginOpen} onClose={()=>setLoginOpen(false)} apiBase={apiBase} onLogin={handleLogin} />
      {showOrders && <div className="fixed inset-0 bg-black/30 flex items-start justify-center p-6"><div className="w-full max-w-2xl bg-white rounded shadow overflow-auto max-h-[80vh]"><OrderHistory token={token} apiBase={apiBase} /></div></div>}
    </div>
  )
}
