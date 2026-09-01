import React from 'react'
import { FiMic } from 'react-icons/fi'

export default function Navbar({onLoginClick, logged}){
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
        <h1 className="text-xl font-semibold">Foodie</h1>
        <div className="flex-1 mx-4">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
            <input className="bg-transparent outline-none w-full" placeholder="Search for restaurants or dishes" />
            <FiMic className="text-gray-500" />
          </div>
        </div>
        <div>
          <button onClick={onLoginClick} className="px-3 py-2 bg-indigo-600 text-white rounded-md">{logged? 'Account' : 'Login'}</button>
        </div>
      </div>
    </header>
  )
}
