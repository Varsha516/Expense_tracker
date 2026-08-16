import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

const AuthContext = createContext()

export const AuthProvider = ({
  children
}) => {

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null
  })

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch (error) {
        console.error('Failed to parse stored user', error)
        return null
      }
    }
    return null
  })

  // Login - saves user and token to state and localStorage
  const login = (data) => {
    if (!data) return

    const userObj = data.user || null
    const tokenStr = data.token || null

    setUser(userObj)
    setToken(tokenStr)

    if (tokenStr) {
      localStorage.setItem('token', tokenStr)
    }
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj))
    }
  }

  // Logout - clears user and token from state and localStorage
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Update User Budget in state and localStorage
  const updateUserBudget = (newBudget) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, budget: newBudget } : { budget: newBudget }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUserBudget
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)