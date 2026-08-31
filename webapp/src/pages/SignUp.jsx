import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight, FiCheck } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import { sendSignUpEmail } from '../utils/emailService'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [emailStatus, setEmailStatus] = useState('')
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = '10-digit number required'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be 6+ characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        // Send confirmation email
        const emailResult = await sendSignUpEmail(formData.name, formData.email)
        setEmailStatus(emailResult.message)
        
        // Simulate API call for account creation
        setTimeout(() => {
          setLoading(false)
          setSuccess(true)
          setTimeout(() => {
            navigate('/login')
          }, 2500)
        }, 1500)
      } catch (error) {
        console.error('Signup error:', error)
        setLoading(false)
        setErrors({ submit: 'An error occurred. Please try again.' })
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zest-500/20 ring-1 ring-zest-500/50">
            <FiCheck size={32} className="text-zest-500" />
          </div>
          <h2 className="font-display text-3xl font-bold text-ink-900">Welcome!</h2>
          <p className="mt-2 text-ink-700">Your account has been created successfully.</p>
          <p className="mt-3 text-sm text-zest-600 font-medium bg-zest-50 px-4 py-2 rounded-lg">
            ✉️ {emailStatus}
          </p>
          <p className="mt-4 text-sm text-ink-700">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      <Navbar showSearch={false} />
      
      <div className="section-pad py-12">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-bold text-ink-900">Join SwadHub</h1>
            <p className="mt-2 text-ink-700">Sign up to order delicious food</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-plate ring-1 ring-zest-100">
            {/* Name */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-ink-900">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3.5 text-zest-500" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={`w-full rounded-xl border-2 bg-white px-4 py-3 pl-10 outline-none transition ${
                    errors.name ? 'border-flame-500' : 'border-zest-100 focus:border-zest-500'
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-flame-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-ink-900">Email</label>
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

            {/* Phone */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-ink-900">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3.5 text-zest-500" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={`w-full rounded-xl border-2 bg-white px-4 py-3 pl-10 outline-none transition ${
                    errors.phone ? 'border-flame-500' : 'border-zest-100 focus:border-zest-500'
                  }`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-flame-500">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-ink-900">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-zest-500" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className={`w-full rounded-xl border-2 bg-white px-4 py-3 pl-10 outline-none transition ${
                    errors.password ? 'border-flame-500' : 'border-zest-100 focus:border-zest-500'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-flame-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-ink-900">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-zest-500" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`w-full rounded-xl border-2 bg-white px-4 py-3 pl-10 outline-none transition ${
                    errors.confirmPassword ? 'border-flame-500' : 'border-zest-100 focus:border-zest-500'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-flame-500">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Sign Up'} {!loading && <FiArrowRight />}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-ink-700">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-zest-600 hover:text-zest-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
