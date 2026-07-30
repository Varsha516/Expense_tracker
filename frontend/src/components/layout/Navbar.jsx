import {
  Bell,
  Moon,
  LogOut,
  UserCircle2
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {

  const navigate = useNavigate()

  const { logout } = useAuth()

  const handleLogout = () => {

    logout()

    navigate('/login')
  }

  return (
    <div className="sticky top-0 z-50 px-6 pt-6">

      {/* Floating Navbar */}
      <div className="bg-white/30 backdrop-blur-2xl border bg-white/[0.05] rounded-3xl shadow-2xl">

        <div className="flex items-center justify-between px-8 py-5">

          {/* Left */}
          <div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              Expense Tracker
            </h1>

            <p className="text-slate-400 text-sm mt-1">
              Smart financial management
            </p>

          </div>

          {/* Right */}
          <div className="flex items-center gap-4">

            {/* Notification */}
            <button className="relative w-12 h-12 rounded-2xl bg-white/30 border bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.08] transition-all duration-300">

              <Bell className="w-5 h-5 text-slate-300" />

              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>

            </button>

            {/* Theme */}
            <button className="w-12 h-12 rounded-2xl bg-white/30 border bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.08] transition-all duration-300">

              <Moon className="w-5 h-5 text-slate-300" />

            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500/20 to-red-400/20 border border-red-500/20 hover:border-red-400/40 hover:bg-red-500/20 transition-all duration-300 px-5 py-3 rounded-2xl text-red-400 flex items-center gap-2"
            >

              <LogOut className="w-5 h-5" />

              Logout

            </button>

            {/* Profile */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">

              <UserCircle2 className="text-white w-8 h-8" />

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Navbar