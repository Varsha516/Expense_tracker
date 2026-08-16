import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

import {
  Wallet,
  Mail,
  Lock
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { loginUser } from '../api/authApi'

const Login = () => {

  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    emailOrMobile: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errorMsg) setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.emailOrMobile || !formData.password) {
      setErrorMsg('Please fill all fields')
      return
    }

    try {
      setLoading(true)
      const data = await loginUser({
        emailOrMobile: formData.emailOrMobile,
        password: formData.password
      })

      login(data)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      const message =
        error.response?.data?.error ||
        'Login failed. Please check your credentials.'
      setErrorMsg(message)
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
            Expense Tracker
          </h1>

          <p className="text-slate-300 mt-2 text-sm">
            Manage your finances smartly
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email/Mobile */}
          <div>

            <label className="text-slate-300 text-sm mb-2 block">
              Email or Mobile Number
            </label>

            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">

              <Mail className="text-slate-400 w-5 h-5 mr-3" />

              <input
                type="text"
                name="emailOrMobile"
                placeholder="Enter email or mobile number"
                value={formData.emailOrMobile}
                onChange={handleChange}
                disabled={loading}
                className="bg-transparent outline-none text-white w-full placeholder:text-slate-400"
              />
            </div>
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="bg-transparent outline-none text-white w-full placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Forgot */}
          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" />
              Remember me
            </label>

            <button
              type="button"
              className="text-emerald-400 hover:text-emerald-300 transition"
            >
              Forgot password?
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">

          Don’t have an account?{' '}

          <Link
            to="/signup"
            className="text-emerald-400 hover:text-emerald-300"
          >
            Sign Up
          </Link>

        </p>

      </motion.div>
    </div>
  )
}

export default Login