import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

export default function AdminStudents() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] =
    useState(false)
  const [filterRole, setFilterRole] =
    useState('student')
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    role: 'student',
    studentId: '',
    course: '',
    year: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [filterRole])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users',
        { params: { role: filterRole } }
      )
      setUsers(res.data.data)
    } catch {
      toast.error('Failed to fetch!')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post(
        '/auth/create-user', formData
      )
      toast.success(
        `${formData.role} created! ✅`
      )
      setShowModal(false)
      resetForm()
      fetchUsers()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    }
  }

  const handleToggle = async (userId,
    isActive, name) => {
    try {
      await api.patch(
        `/auth/users/${userId}/toggle`
      )
      toast.success(
        isActive
          ? `${name} deactivated!`
          : `${name} activated!`
      )
      fetchUsers()
    } catch {
      toast.error('Failed!')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      phone: '',
      role: 'student',
      studentId: '',
      course: '',
      year: ''
    })
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase()
      .includes(search.toLowerCase()) ||
    u.email.toLowerCase()
      .includes(search.toLowerCase())
  )

  const roleStyles = {
    admin: {
      bg: '#FEF3C7',
      color: '#D97706',
      icon: '👑'
    },
    student: {
      bg: '#DCFCE7',
      color: '#16A34A',
      icon: '🎓'
    },
    security: {
      bg: '#DBEAFE',
      color: '#2563EB',
      icon: '🔐'
    },
    staff: {
      bg: '#F3E8FF',
      color: '#7C3AED',
      icon: '👷'
    }
  }

  if (loading) return (
    <Loader text="Loading users..." />
  )

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: '700',
            color: 'var(--text)',
            fontFamily: 'Space Grotesk'
          }}>
            👥 User Management
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {filteredUsers.length} users
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Add User
        </button>
      </div>

      {/* Role Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: 'student',
            label: '🎓 Students' },
          { value: 'security',
            label: '🔐 Security' },
          { value: 'staff',
            label: '👷 Staff' },
          { value: 'admin',
            label: '👑 Admins' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => {
              setFilterRole(f.value)
              setSearch('')
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              background:
                filterRole === f.value
                  ? 'var(--primary)'
                  : 'white',
              color:
                filterRole === f.value
                  ? 'white'
                  : 'var(--text-muted)',
              border:
                filterRole === f.value
                  ? '1.5px solid var(--primary)'
                  : '1.5px solid var(--border)'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={`Search ${filterRole}s...`}
        value={search}
        onChange={e =>
          setSearch(e.target.value)}
        className="input"
        style={{ marginBottom: '16px' }}
      />

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '48px' }}>
            👥
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '12px'
          }}>
            No {filterRole}s found!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            style={{ marginTop: '16px' }}
          >
            + Add {filterRole}
          </button>
        </div>
      ) : (
        <div className="card"
          style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px'
            }}>
              <thead>
                <tr style={{
                  background: '#F8FAFC',
                  borderBottom:
                    '1px solid var(--border)'
                }}>
                  {['User', 'Contact',
                    'Role', 'Room',
                    'Details', 'Status']
                    .map(h => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: 'var(--text-muted)',
                      fontWeight: '600',
                      fontSize: '11px',
                      textTransform: 'uppercase'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const rs =
                    roleStyles[u.role] ||
                    roleStyles.student
                  return (
                    <tr key={u._id}
                      className="table-row"
                      style={{
                        borderBottom:
                          '1px solid var(--border)',
                        opacity: u.isActive
                          ? 1 : 0.5
                      }}>

                      {/* User */}
                      <td style={{
                        padding: '14px 16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: rs.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                              'center',
                            fontSize: '18px',
                            flexShrink: 0
                          }}>
                            {rs.icon}
                          </div>
                          <div>
                            <p style={{
                              fontWeight: '700',
                              color: 'var(--text)'
                            }}>
                              {u.name}
                            </p>
                            <p style={{
                              fontSize: '11px',
                              color:
                                'var(--text-muted)',
                              fontFamily:
                                'monospace'
                            }}>
                              {u._id
                                .slice(-8)
                                .toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{
                        padding: '14px 16px'
                      }}>
                        <p style={{
                          color: 'var(--text)'
                        }}>
                          {u.email}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color:
                            'var(--text-muted)'
                        }}>
                          📞 {u.phone}
                        </p>
                      </td>

                      {/* Role */}
                      <td style={{
                        padding: '14px 16px'
                      }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: rs.bg,
                          color: rs.color,
                          textTransform:
                            'capitalize'
                        }}>
                          {rs.icon} {u.role}
                        </span>
                      </td>

                      {/* Room */}
                      <td style={{
                        padding: '14px 16px',
                        fontWeight: '600',
                        color: u.roomNumber
                          ? 'var(--primary)'
                          : 'var(--text-muted)'
                      }}>
                        {u.roomNumber || '—'}
                      </td>

                      {/* Details */}
                      <td style={{
                        padding: '14px 16px'
                      }}>
                        {u.studentId && (
                          <p style={{
                            fontSize: '12px',
                            color: 'var(--text)'
                          }}>
                            ID: {u.studentId}
                          </p>
                        )}
                        {u.course && (
                          <p style={{
                            fontSize: '12px',
                            color:
                              'var(--text-muted)'
                          }}>
                            {u.course} •
                            Yr {u.year}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{
                        padding: '14px 16px'
                      }}>
                        <button
                          onClick={() =>
                            handleToggle(
                              u._id,
                              u.isActive,
                              u.name
                            )}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background:
                              u.isActive
                                ? '#DCFCE7'
                                : '#FEE2E2',
                            color:
                              u.isActive
                                ? '#16A34A'
                                : '#DC2626'
                          }}
                        >
                          {u.isActive
                            ? '✅ Active'
                            : '❌ Inactive'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '480px',
              padding: '28px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                + Add User
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              {/* Role Select */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Select Role *
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(4, 1fr)',
                  gap: '8px'
                }}>
                  {[
                    { v: 'student',
                      l: '🎓 Student' },
                    { v: 'security',
                      l: '🔐 Security' },
                    { v: 'staff',
                      l: '👷 Staff' },
                    { v: 'admin',
                      l: '👑 Admin' },
                  ].map(r => (
                    <button
                      key={r.v}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          role: r.v
                        })}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor:
                          formData.role === r.v
                            ? 'var(--primary)'
                            : 'var(--border)',
                        background:
                          formData.role === r.v
                            ? 'var(--primary)'
                            : 'white',
                        color:
                          formData.role === r.v
                            ? 'white'
                            : 'var(--text-muted)'
                      }}
                    >
                      {r.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div style={{
                  gridColumn: 'span 2'
                }}>
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
                    value={formData.name}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        name: e.target.value
                      })}
                    placeholder="Enter name"
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
                    value={formData.email}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        email: e.target.value
                      })}
                    placeholder="email@hostel.com"
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
                    value={formData.phone}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        phone: e.target.value
                      })}
                    placeholder="10 digits"
                    required
                    className="input"
                  />
                </div>

                <div style={{
                  gridColumn: 'span 2'
                }}>
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
                    type="text"
                    value={formData.password}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        password: e.target.value
                      })}
                    required
                    className="input"
                  />
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '4px'
                  }}>
                    💡 User baad mein
                    change kar sakta hai
                  </p>
                </div>

                {/* Student Fields */}
                {formData.role === 'student' && (
                  <>
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
                        value={formData.studentId}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            studentId:
                              e.target.value
                          })}
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
                        Course
                      </label>
                      <input
                        type="text"
                        value={formData.course}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            course: e.target.value
                          })}
                        placeholder="BCA"
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
                        value={formData.year}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            year: e.target.value
                          })}
                        className="input"
                      >
                        <option value="">
                          Select
                        </option>
                        {[1,2,3,4].map(y => (
                          <option
                            key={y}
                            value={y}
                          >
                            Year {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border:
                      '1.5px solid var(--border)',
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: 'var(--text-muted)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px'
                  }}
                >
                  ✅ Create {formData.role}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}