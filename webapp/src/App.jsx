import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import Restaurant from './pages/Restaurant'
import Checkout from './pages/Checkout'
import Tracking from './pages/Tracking'
import Login from './pages/Login'
import SignUp from './pages/SignUp'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track/:orderId" element={<Tracking />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
