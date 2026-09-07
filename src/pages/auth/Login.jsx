import { useState } from 'react'
import { Link, useNavigate } from
  'react-router-dom'
import { useAuth } from
  '../../context/AuthContext'
import toast from 'react-hot-toast'

const demoAccounts = [
  {
    role: 'Admin',
    icon: '👑',
    email: 'admin@hostel.com',
    password: '123456',
    color: '#1a3c5e',
    bg: '#EFF6FF',
    desc: 'Full access'
  },
  {
    role: 'Student',
    icon: '🎓',
    email: 'student@hostel.com',
    password: '123456',
    color: '#16A34A',
    bg: '#F0FDF4',
    desc: 'Student portal'
  },
  {
    role: 'Security',
    icon: '🔐',
    email: 'security@hostel.com',
    password: '123456',
    color: '#2563EB',
    bg: '#EFF6FF',
    desc: 'Gate management'
  },
]

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(
        formData.email,
        formData.password
      )
      toast.success('Welcome back! 👋')
      navigate('/')
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Login failed!'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (acc) => {
    setLoading(true)
    try {
      await login(acc.email, acc.password)
      toast.success(
        `Logged in as ${acc.role}! 👋`
      )
      navigate('/')
    } catch (err) {
      toast.error('Demo login failed!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background:
        'linear-gradient(135deg, #1a3c5e 0%, #2d5f8a 50%, #1a3c5e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}
        className="grid-2">

        {/* Left — Login Form */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '36px',
          boxShadow:
            '0 25px 50px rgba(0,0,0,0.25)'
        }}>
          {/* Logo */}
          <div style={{
            textAlign: 'center',
            marginBottom: '28px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background:
                'linear-gradient(135deg, #1a3c5e, #2d5f8a)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 14px'
            }}>
              🏠
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: 'Space Grotesk',
              color: 'var(--text)'
            }}>
              Smart Hostel
            </h1>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '13px',
              marginTop: '4px'
            }}>
              Management System
            </p>
          </div>

          <form onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })}
                placeholder="your@email.com"
                required
                className="input"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={e =>
                  setFormData({
                    ...formData,
                    password: e.target.value
                  })}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: '13px',
                fontSize: '15px',
                opacity: loading ? 0.7 : 1,
                marginTop: '4px'
              }}
            >
              {loading
                ? '⏳ Logging in...'
                : '→ Login'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginTop: '20px'
          }}>
            New student?{' '}
            <Link to="/register" style={{
              color: 'var(--primary)',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Register here →
            </Link>
          </p>
        </div>

        {/* Right — Demo Accounts */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            color: 'white',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: 'Space Grotesk',
              marginBottom: '4px'
            }}>
              🎯 Quick Demo Login
            </h2>
            <p style={{
              fontSize: '13px',
              opacity: 0.7
            }}>
              Click to login instantly
            </p>
          </div>

          {demoAccounts.map(acc => (
            <button
              key={acc.role}
              onClick={() =>
                handleDemoLogin(acc)}
              disabled={loading}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => {
                e.currentTarget.style
                  .transform =
                  'translateX(4px)'
                e.currentTarget.style
                  .boxShadow =
                  '0 8px 24px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style
                  .transform = 'translateX(0)'
                e.currentTarget.style
                  .boxShadow = 'none'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: acc.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  {acc.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '15px',
                    color: acc.color
                  }}>
                    {acc.role}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '2px'
                  }}>
                    {acc.email}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginTop: '2px'
                  }}>
                    {acc.desc}
                  </div>
                </div>
                <div style={{
                  fontSize: '20px',
                  color: '#cbd5e1'
                }}>
                  →
                </div>
              </div>
            </button>
          ))}

          {/* Features List */}
          <div style={{
            background:
              'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '16px',
            color: 'white'
          }}>
            <p style={{
              fontWeight: '700',
              fontSize: '13px',
              marginBottom: '10px',
              opacity: 0.9
            }}>
              ✨ System Features:
            </p>
            {[
              '🏠 Room Management',
              '📋 Complaint Tracking',
              '👥 Visitor OTP System',
              '📢 Notice Board',
              '☁️ AWS S3 Storage',
              '🔐 Role-based Access',
            ].map((f, i) => (
              <div key={i} style={{
                fontSize: '12px',
                opacity: 0.8,
                marginBottom: '4px'
              }}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}