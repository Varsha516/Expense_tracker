import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/authApi'

import { useAuth } from '../context/AuthContext'
import {
  Wallet,
  User,
  Mail,
  Lock,
  Phone
} from 'lucide-react'

const Signup = () => {

  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {

    let { name, value } = e.target

    // Mobile validation
    if (name === 'mobile') {

      // allow only numbers
      value = value.replace(/\D/g, '')

      // limit to 10 digits
      if (value.length > 10) return
    }

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const [loading, setLoading] = useState(false)

const handleSubmit = async (e) => {

  e.preventDefault()

  try {

    // Empty fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.password ||
      !formData.confirmPassword
    ) {

      alert('Please fill all fields')

      return
    }

    // Mobile validation
    if (formData.mobile.length !== 10) {

      alert('Mobile number must contain exactly 10 digits')

      return
    }

    // Password validation
    if (formData.password.length < 6) {

      alert('Password must be at least 6 characters')

      return
    }

    // Password match
    if (
      formData.password !==
      formData.confirmPassword
    ) {

      alert('Passwords do not match')

      return
    }

    setLoading(true)

    // Backend API call
    const data = await registerUser({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password
    })

    // Save login
    login(data)

    // Redirect
    navigate('/dashboard')

  } catch (error) {

    console.log(error)

    alert(
      error.response?.data?.error ||
      'Signup failed'
    )

  } finally {

    setLoading(false)
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">

      {/* Glow */}
      <div className="absolute w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full top-10 left-10"></div>

      <div className="absolute w-96 h-96 bg-emerald-400/10 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8"
      >

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">

          <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg mb-4">
            <Wallet className="text-white w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            {
  loading
    ? 'Creating Account...'
    : 'Create Account'
}
          </h1>

          <p className="text-slate-300 mt-2 text-sm text-center">
            Start managing your finances smartly
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Name */}
          <div>

            <label className="text-slate-300 text-sm mb-2 block">
              Full Name
            </label>

            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">

              <User className="text-slate-400 w-5 h-5 mr-3" />

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="bg-transparent outline-none text-white w-full placeholder:text-slate-400"
              />

            </div>
          </div>

          {/* Email */}
          <div>

            <label className="text-slate-300 text-sm mb-2 block">
              Email Address
            </label>

            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">

              <Mail className="text-slate-400 w-5 h-5 mr-3" />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="bg-transparent outline-none text-white w-full placeholder:text-slate-400"
              />

            </div>
          </div>

          {/* Mobile */}
          <div>

            <label className="text-slate-300 text-sm mb-2 block">
              Mobile Number
            </label>

            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">

              <Phone className="text-slate-400 w-5 h-5 mr-3" />

              <input
                type="text"
                name="mobile"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                className="bg-transparent outline-none text-white w-full placeholder:text-slate-400"
              />

            </div>

            <p className="text-xs text-slate-400 mt-1">
              Mobile number must contain 10 digits
            </p>

          </div>

          {/* Password */}
          <div>

            <label className="text-slate-300 text-sm mb-2 block">
              Password
            </label>

            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">

              <Lock className="text-slate-400 w-5 h-5 mr-3" />

              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                className="bg-transparent outline-none text-white w-full placeholder:text-slate-400"
              />

            </div>

            <p className="text-xs text-slate-400 mt-1">
              Minimum 6 characters
            </p>

          </div>

          {/* Confirm Password */}
          <div>

            <label className="text-slate-300 text-sm mb-2 block">
              Confirm Password
            </label>

            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">

              <Lock className="text-slate-400 w-5 h-5 mr-3" />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-transparent outline-none text-white w-full placeholder:text-slate-400"
              />

            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 text-sm text-slate-300">

            <input type="checkbox" required />

            <span>
              I agree to the Terms & Conditions
            </span>

          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 transition-all duration-300 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            Create Account
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">

          Already have an account?{' '}

          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 transition"
          >
            Login
          </Link>

        </p>

      </motion.div>
    </div>
  )
}

export default Signup