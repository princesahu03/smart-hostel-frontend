import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

export default function MyComplaints() {
  const [complaints, setComplaints] =
    useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] =
    useState(false)
  const [filterStatus, setFilterStatus] =
    useState('')
  const [formData, setFormData] = useState({
    category: 'maintenance',
    title: '',
    description: '',
    priority: 'medium'
  })
  const [photo, setPhoto] = useState(null)
  const [submitting, setSubmitting] =
    useState(false)

  useEffect(() => {
    fetchComplaints()
  }, [filterStatus])

  const fetchComplaints = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus
      const res = await api.get(
        '/complaints/my', { params }
      )
      setComplaints(
        res.data.data.complaints || []
      )
    } catch {
      toast.error('Failed to fetch!')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key])
      })
      if (photo) data.append('photo', photo)

      await api.post('/complaints', data)
      toast.success('Complaint raised! 📋')
      setShowModal(false)
      setFormData({
        category: 'maintenance',
        title: '',
        description: '',
        priority: 'medium'
      })
      setPhoto(null)
      fetchComplaints()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this complaint?'))
      return
    try {
      await api.delete(`/complaints/${id}`)
      toast.success('Deleted!')
      fetchComplaints()
    } catch {
      toast.error('Failed!')
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: '#FEF3C7',
          color: '#D97706',
          label: '⏳ Pending'
        }
      case 'in_progress':
        return {
          bg: '#DBEAFE',
          color: '#2563EB',
          label: '🔄 In Progress'
        }
      case 'resolved':
        return {
          bg: '#DCFCE7',
          color: '#16A34A',
          label: '✅ Resolved'
        }
      case 'rejected':
        return {
          bg: '#FEE2E2',
          color: '#DC2626',
          label: '❌ Rejected'
        }
      default:
        return {
          bg: '#F1F5F9',
          color: '#64748B',
          label: status
        }
    }
  }

  if (loading) return (
    <Loader text="Loading complaints..." />
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
            📋 My Complaints
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {complaints.length} complaints
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Raise Complaint
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: '', label: 'All' },
          { value: 'pending',
            label: '⏳ Pending' },
          { value: 'in_progress',
            label: '🔄 In Progress' },
          { value: 'resolved',
            label: '✅ Resolved' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() =>
              setFilterStatus(f.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              background:
                filterStatus === f.value
                  ? 'var(--primary)'
                  : 'white',
              color:
                filterStatus === f.value
                  ? 'white'
                  : 'var(--text-muted)',
              border:
                filterStatus === f.value
                  ? '1.5px solid var(--primary)'
                  : '1.5px solid var(--border)'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>
            📋
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No complaints!
          </p>
          <p style={{ fontSize: '13px' }}>
            Raise a complaint if you
            have any issues
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {complaints.map(c => {
            const statusStyle =
              getStatusStyle(c.status)
            return (
              <div key={c._id}
                className="card"
                style={{ padding: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      <h3 style={{
                        fontWeight: '700',
                        fontSize: '16px',
                        color: 'var(--text)'
                      }}>
                        {c.title}
                      </h3>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background:
                          statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {statusStyle.label}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      marginBottom: '10px',
                      lineHeight: 1.5
                    }}>
                      {c.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        textTransform:
                          'capitalize'
                      }}>
                        📁 {c.category}
                      </span>
                      <span style={{
                        textTransform:
                          'capitalize',
                        color:
                          c.priority === 'high'
                            ? '#DC2626'
                            : c.priority ===
                              'medium'
                            ? '#D97706'
                            : '#16A34A'
                      }}>
                        🔴 {c.priority} priority
                      </span>
                      <span>
                        📅{' '}
                        {new Date(c.createdAt)
                          .toLocaleDateString(
                            'en-IN'
                          )}
                      </span>
                      {c.photo && (
                        <a
                          href={c.photo}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color:
                              'var(--primary)',
                            fontWeight: '600'
                          }}
                        >
                          📷 View Photo
                        </a>
                      )}
                    </div>

                    {/* Remarks if resolved */}
                    {c.remarks && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px 12px',
                        background: '#F0FDF4',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#16A34A',
                        borderLeft:
                          '3px solid #16A34A'
                      }}>
                        <strong>
                          Staff remark:
                        </strong>{' '}
                        {c.remarks}
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  {c.status === 'pending' && (
                    <button
                      onClick={() =>
                        handleDelete(c._id)}
                      style={{
                        padding: '6px 12px',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Raise Complaint Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '500px',
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
                📋 Raise Complaint
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
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        category: e.target.value
                      })}
                    className="input"
                  >
                    {[
                      'maintenance',
                      'plumbing',
                      'internet',
                      'cleanliness',
                      'mess',
                      'security',
                      'other'
                    ].map(c => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase()
                          + c.slice(1)}
                      </option>
                    ))}
                  </select>
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
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        priority: e.target.value
                      })}
                    className="input"
                  >
                    <option value="low">
                      🟢 Low
                    </option>
                    <option value="medium">
                      🟡 Medium
                    </option>
                    <option value="high">
                      🔴 High
                    </option>
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
                  placeholder="Brief title..."
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
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      description:
                        e.target.value
                    })}
                  placeholder="Describe the issue..."
                  required
                  rows={3}
                  className="input"
                  style={{
                    resize: 'none',
                    fontFamily: 'Inter'
                  }}
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
                  Photo (Optional — AWS S3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    setPhoto(
                      e.target.files[0]
                    )}
                  className="input"
                  style={{ padding: '8px' }}
                />
                {photo && (
                  <p style={{
                    fontSize: '12px',
                    color: '#10b981',
                    marginTop: '4px'
                  }}>
                    ✅ {photo.name} selected
                  </p>
                )}
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
                  disabled={submitting}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting
                    ? '⏳ Submitting...'
                    : '📋 Raise Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}