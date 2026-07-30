import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'

import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'

const ProtectedLayout = ({ children }) => {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

const AppRoutes = () => {
  const { token } = useAuth()

  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/login"
        element={!token ? <Login /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/signup"
        element={!token ? <Signup /> : <Navigate to="/dashboard" />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />

      {/* Default */}
      <Route
        path="*"
        element={<Navigate to={token ? "/dashboard" : "/login"} />}
      />
    </Routes>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App