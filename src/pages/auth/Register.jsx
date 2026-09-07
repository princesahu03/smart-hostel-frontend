import { useState } from 'react'
import { Link, useNavigate } from
  'react-router-dom'
import { useAuth } from
  '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    studentId: '',
    course: '',
    year: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password.length < 6) {
      toast.error(
        'Password must be 6+ characters!'
      )
      return
    }
    setLoading(true)
    try {
      // Use FormData for file upload:
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          data.append(key, formData[key])
        }
      })
      data.append('role', 'student')

      await register(data)
      toast.success(
        'Registered successfully! Please login.'
      )
      navigate('/login')
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Registration failed!'
      )
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    {
      label: 'Full Name *',
      key: 'name',
      type: 'text',
      placeholder: 'Prince Sahu'
    },
    {
      label: 'Email *',
      key: 'email',
      type: 'email',
      placeholder: 'prince@gmail.com'
    },
    {
      label: 'Password *',
      key: 'password',
      type: 'password',
      placeholder: 'Min 6 characters'
    },
    {
      label: 'Phone *',
      key: 'phone',
      type: 'tel',
      placeholder: '10 digit number'
    },
    {
      label: 'Student ID',
      key: 'studentId',
      type: 'text',
      placeholder: 'ITM2024001'
    },
    {
      label: 'Course',
      key: 'course',
      type: 'text',
      placeholder: 'BCA'
    },
  ]

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
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '460px',
        padding: '36px',
        boxShadow:
          '0 25px 50px rgba(0,0,0,0.25)',
        animation: 'fadeIn 0.4s ease'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <div style={{
            fontSize: '40px',
            marginBottom: '8px'
          }}>
            🏠
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            fontFamily: 'Space Grotesk',
            color: 'var(--text)'
          }}>
            Student Registration
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            marginTop: '4px'
          }}>
            Create your hostel account
          </p>
        </div>

        <form onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {fields.map(field => (
              <div key={field.key}
                style={{
                  gridColumn:
                    field.key === 'name' ||
                    field.key === 'email' ||
                    field.key === 'password'
                      ? 'span 2'
                      : 'span 1'
                }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={formData[field.key]}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      [field.key]: e.target.value
                    })}
                  placeholder={field.placeholder}
                  required={
                    field.label.includes('*')
                  }
                  className="input"
                  style={{ fontSize: '13px' }}
                />
              </div>
            ))}

            {/* Year select */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '5px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}>
                Year
              </label>
              <select
                value={formData.year}
                onChange={e =>
                  setFormData({
                    ...formData,
                    year: e.target.value
                  })}
                className="input"
                style={{ fontSize: '13px' }}
              >
                <option value="">
                  Select year
                </option>
                {[1, 2, 3, 4].map(y => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '13px',
              fontSize: '15px',
              marginTop: '4px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading
              ? '⏳ Registering...'
              : '✓ Register'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginTop: '20px'
        }}>
          Already registered?{' '}
          <Link to="/login" style={{
            color: 'var(--primary)',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Login here →
          </Link>
        </p>
      </div>
    </div>
  )
}