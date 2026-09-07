import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false) // ← Fix!

  useEffect(() => {
    // Sirf ek baar call ho!
    if (hasFetched.current) return
    hasFetched.current = true
    checkAuth()
  }, []) // ← Empty array — sirf mount pe!

  const checkAuth = async () => {
    try {
      const token = localStorage
        .getItem('token')

      if (token) {
        api.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${token}`
      }

      const res = await api.get('/auth/me')
      setUser(res.data.data)
    } catch {
      setUser(null)
      localStorage.removeItem('token')
      delete api.defaults.headers.common[
        'Authorization'
      ]
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await api.post(
      '/auth/login',
      { email, password }
    )
    const { token, user } = res.data.data

    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`
    }

    setUser(user)
    return res.data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}

    localStorage.removeItem('token')
    delete api.defaults.headers.common[
      'Authorization'
    ]
    setUser(null)
  }

  const register = async (formData) => {
    const res = await api.post(
      '/auth/register',
      formData
    )
    return res.data
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)