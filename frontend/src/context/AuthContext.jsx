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

  const [user, setUser] = useState(null)

  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  )

  // Restore user
  useEffect(() => {

    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

  }, [])

  // Login
  const login = (data) => {

    setUser(data.user)

    setToken(data.token)

    localStorage.setItem(
      'token',
      data.token
    )

    localStorage.setItem(
      'user',
      JSON.stringify(data.user)
    )
  }

  // Logout
  const logout = () => {

    setUser(null)

    setToken(null)

    localStorage.removeItem('token')

    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)