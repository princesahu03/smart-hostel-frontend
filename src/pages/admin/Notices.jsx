import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

export default function AdminNotices() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] =
    useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    targetRole: 'all',
    expiresAt: ''
  })

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices')
      setNotices(res.data.data)
    } catch {
      toast.error('Failed to fetch!')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/notices', formData)
      toast.success('Notice posted! 📢')
      setShowModal(false)
      setFormData({
        title: '',
        content: '',
        type: 'general',
        targetRole: 'all',
        expiresAt: ''
      })
      fetchNotices()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?'))
      return
    try {
      await api.delete(`/notices/${id}`)
      toast.success('Notice deleted!')
      fetchNotices()
    } catch {
      toast.error('Failed!')
    }
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'urgent':
        return {
          bg: '#FEE2E2',
          color: '#DC2626',
          icon: '🚨'
        }
      case 'event':
        return {
          bg: '#DCFCE7',
          color: '#16A34A',
          icon: '🎉'
        }
      case 'maintenance':
        return {
          bg: '#FEF3C7',
          color: '#D97706',
          icon: '🔧'
        }
      case 'holiday':
        return {
          bg: '#F3E8FF',
          color: '#7C3AED',
          icon: '🏖️'
        }
      default:
        return {
          bg: '#EFF6FF',
          color: '#2563EB',
          icon: '📢'
        }
    }
  }

  if (loading) return (
    <Loader text="Loading notices..." />
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
            📢 Notice Board
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {notices.length} active notices
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Post Notice
        </button>
      </div>

      {/* Notices Grid */}
      {notices.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>
            📢
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No notices posted!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {notices.map(notice => {
            const typeStyle =
              getTypeStyle(notice.type)
            return (
              <div key={notice._id}
                className="card"
                style={{
                  padding: '20px',
                  borderLeft:
                    `4px solid ${typeStyle.color}`
                }}>
                <div style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '20px'
                      }}>
                        {typeStyle.icon}
                      </span>
                      <h3 style={{
                        fontWeight: '700',
                        fontSize: '16px',
                        color: 'var(--text)'
                      }}>
                        {notice.title}
                      </h3>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background:
                          typeStyle.bg,
                        color: typeStyle.color,
                        textTransform:
                          'capitalize'
                      }}>
                        {notice.type}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '10px'
                    }}>
                      {notice.content}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      <span>
                        👤 {notice.postedBy
                          ?.name || 'Admin'}
                      </span>
                      <span>
                        📅{' '}
                        {new Date(
                          notice.createdAt
                        ).toLocaleDateString(
                          'en-IN'
                        )}
                      </span>
                      <span>
                        👥 For:{' '}
                        {notice.targetRole}
                      </span>
                      {notice.expiresAt && (
                        <span>
                          ⏰ Expires:{' '}
                          {new Date(
                            notice.expiresAt
                          ).toLocaleDateString(
                            'en-IN'
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleDelete(notice._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginLeft: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Notice Modal */}
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
                📢 Post Notice
              </h2>
              <button
                onClick={() =>
                  setShowModal(false)}
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      title: e.target.value
                    })}
                  placeholder="Notice title..."
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
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      content: e.target.value
                    })}
                  placeholder="Notice content..."
                  required
                  rows={4}
                  className="input"
                  style={{
                    resize: 'none',
                    fontFamily: 'Inter'
                  }}
                />
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
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        type: e.target.value
                      })}
                    className="input"
                  >
                    <option value="general">
                      📢 General
                    </option>
                    <option value="urgent">
                      🚨 Urgent
                    </option>
                    <option value="event">
                      🎉 Event
                    </option>
                    <option value="maintenance">
                      🔧 Maintenance
                    </option>
                    <option value="holiday">
                      🏖️ Holiday
                    </option>
                  </select>
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
                    For
                  </label>
                  <select
                    value={formData.targetRole}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        targetRole: e.target.value
                      })}
                    className="input"
                  >
                    <option value="all">
                      Everyone
                    </option>
                    <option value="student">
                      Students Only
                    </option>
                    <option value="staff">
                      Staff Only
                    </option>
                  </select>
                </div>
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
                  Expires On (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      expiresAt: e.target.value
                    })}
                  className="input"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)}
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
                  📢 Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}