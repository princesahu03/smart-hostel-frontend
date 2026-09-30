import { useState } from 'react'
import { Link, useNavigate } from
  'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] =
    useState(false)
  const [selectedRole, setSelectedRole] =
    useState('student')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Student fields:
    studentId: '',
    course: '',
    year: '',
    gender: '',
    department: '',
    parentPhone: '',
    // Teacher fields:
    teacherId: '',
    designation: '',
    subject: '',
    officeHours: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.phone) {
      toast.error('Fill all required fields!')
      return
    }

    setLoading(true)
    try {
      // Build payload:
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: selectedRole
      }

      // Add role-specific fields:
      if (selectedRole === 'student') {
        if (formData.studentId)
          payload.studentId =
            formData.studentId
        if (formData.course)
          payload.course = formData.course
        if (formData.year)
          payload.year = formData.year
        if (formData.gender)
          payload.gender = formData.gender
        if (formData.department)
          payload.department =
            formData.department
        if (formData.parentPhone)
          payload.parentPhone =
            formData.parentPhone
      }

      if (selectedRole === 'teacher') {
        if (formData.teacherId)
          payload.teacherId =
            formData.teacherId
        if (formData.designation)
          payload.designation =
            formData.designation
        if (formData.subject)
          payload.subject = formData.subject
        if (formData.officeHours)
          payload.officeHours =
            formData.officeHours
      }

      await api.post('/auth/register', payload)
      toast.success('Registered! Please login!')
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

  return (
    <div style={{
      minHeight: '100vh',
      background:
        'linear-gradient(135deg, #1a3c5e 0%, #2d5f8a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '36px',
        width: '100%',
        maxWidth: '520px',
        boxShadow:
          '0 25px 50px rgba(0,0,0,0.25)'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background:
              'linear-gradient(135deg, #1a3c5e, #2d5f8a)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 12px'
          }}>
            🏠
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            fontFamily: 'Space Grotesk',
            color: 'var(--text)'
          }}>
            Create Account
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            marginTop: '4px'
          }}>
            Smart Hostel Management System
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}>
            Register As
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, 1fr)',
            gap: '8px'
          }}>
            {[
              { value: 'student',
                icon: '🎓',
                label: 'Student' },
              { value: 'teacher',
                icon: '👨‍🏫',
                label: 'Teacher' },
              { value: 'staff',
                icon: '👷',
                label: 'Staff' },
            ].map(role => (
              <button
                key={role.value}
                type="button"
                onClick={() =>
                  setSelectedRole(role.value)}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background:
                    selectedRole === role.value
                      ? 'var(--primary)'
                      : '#F1F5F9',
                  color:
                    selectedRole === role.value
                      ? 'white'
                      : 'var(--text-muted)',
                  border:
                    selectedRole === role.value
                      ? '2px solid var(--primary)'
                      : '2px solid #E2E8F0'
                }}
              >
                {role.icon} {role.label}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>

          {/* Common Fields */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '5px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="input"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '5px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              marginBottom: '5px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
              className="input"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '5px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}>
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10 digit number"
              required
              className="input"
            />
          </div>

          {/* Student Specific Fields */}
          {selectedRole === 'student' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="ITM2024001"
                    className="input"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">
                      Select
                    </option>
                    <option value="male">
                      Male
                    </option>
                    <option value="female">
                      Female
                    </option>
                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Course
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="BCA, BTech etc"
                    className="input"
                  />
                </div>

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
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">
                      Select
                    </option>
                    {[1, 2, 3, 4].map(y => (
                      <option
                        key={y}
                        value={y}
                      >
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="CSE, AI/ML, Cyber etc"
                  className="input"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Parent Phone
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  placeholder="Parent contact number"
                  className="input"
                />
              </div>
            </>
          )}

          {/* Teacher Specific Fields */}
          {selectedRole === 'teacher' && (
            <>
              <div style={{
                background: '#EFF6FF',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '12px',
                color: 'var(--primary)',
                fontWeight: '600'
              }}>
                💡 Admin will assign your
                floor and warden level
                after registration!
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Teacher ID
                </label>
                <input
                  type="text"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  placeholder="TCH2024001"
                  className="input"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Assistant Professor etc"
                  className="input"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Computer Science etc"
                  className="input"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Office Hours
                </label>
                <input
                  type="text"
                  name="officeHours"
                  value={formData.officeHours}
                  onChange={handleChange}
                  placeholder="Mon-Fri 10AM-4PM"
                  className="input"
                />
              </div>
            </>
          )}

          {/* Staff fields */}
          {selectedRole === 'staff' && (
            <div style={{
              background: '#F0FDF4',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '12px',
              color: '#16A34A',
              fontWeight: '600'
            }}>
              💡 Staff accounts are for
              maintenance workers.
              Admin will assign your
              skill category after
              registration!
            </div>
          )}

          {/* Submit */}
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
              ? '⏳ Registering...'
              : `✓ Register as ${
                  selectedRole.charAt(0)
                    .toUpperCase() +
                  selectedRole.slice(1)
                }`}
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