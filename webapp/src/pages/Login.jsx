import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import { sendLoginEmail } from '../utils/emailService'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required'
    if (!formData.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        // Send login confirmation email
        const emailResult = await sendLoginEmail('User', formData.email)
        setLoginMessage(emailResult.message)
        
        // Simulate API call for login
        setTimeout(() => {
          setLoading(false)
          // Mock successful login
          localStorage.setItem('user', JSON.stringify({ email: formData.email, loggedIn: true }))
          
          // Show success message briefly then redirect
          setTimeout(() => {
            navigate('/')
          }, 2000)
        }, 1500)
      } catch (error) {
        console.error('Login error:', error)
        setLoading(false)
        setErrors({ submit: 'Login failed. Please try again.' })
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="min-h-screen pb-12">
      <Navbar showSearch={false} />
      
      <div className="section-pad py-16">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-zest-500 to-zest-600">
              <FiLock size={28} className="text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-ink-900">Welcome Back</h1>
            <p className="mt-2 text-ink-700">Log in to continue ordering</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-plate ring-1 ring-zest-100">
            {/* Email */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-ink-900">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-zest-500" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`w-full rounded-xl border-2 bg-white px-4 py-3 pl-10 outline-none transition ${
                    errors.email ? 'border-flame-500' : 'border-zest-100 focus:border-zest-500'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-flame-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-ink-900">Password</label>
                <Link to="/forgot-password" className="text-xs text-zest-600 hover:text-zest-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-zest-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full rounded-xl border-2 bg-white px-4 py-3 pl-10 outline-none transition pr-10 ${
                    errors.password ? 'border-flame-500' : 'border-zest-100 focus:border-zest-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zest-500 hover:text-zest-600"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-flame-500">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="accent-zest-500"
                defaultChecked
              />
              <label htmlFor="remember" className="text-sm text-ink-700">
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Logging in...' : 'Log In'} {!loading && <FiArrowRight />}
            </button>

            {/* Login Message */}
            {loginMessage && (
              <div className="mt-4 rounded-lg bg-zest-50 px-4 py-3 text-sm text-zest-700 border border-zest-200">
                ✉️ {loginMessage}
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zest-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-ink-700">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-zest-100 bg-white px-4 py-3 font-medium text-ink-900 transition hover:bg-zest-50"
            >
              <span className="text-xl">🍎</span>
              <span className="hidden xs:inline text-sm">Apple</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-zest-100 bg-white px-4 py-3 font-medium text-ink-900 transition hover:bg-zest-50"
            >
              <span className="text-xl">🔵</span>
              <span className="hidden xs:inline text-sm">Google</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-ink-700">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-zest-600 hover:text-zest-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
