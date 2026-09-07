import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

export default function MyVisitors() {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] =
    useState(false)
  const [filterStatus, setFilterStatus] =
    useState('')
  const [submitting, setSubmitting] =
    useState(false)
  const [idProof, setIdProof] = useState(null)

  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    relation: 'parent',
    purpose: '',
    visitDate: '',
    expectedTime: ''
  })

  useEffect(() => {
    fetchVisitors()
  }, [filterStatus])

  const fetchVisitors = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus
      const res = await api.get(
        '/visitors/my', { params }
      )
      setVisitors(
        res.data.data.visitors || []
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
      if (idProof)
        data.append('idProof', idProof)

      await api.post('/visitors/request', data)
      toast.success(
        'Visitor request submitted! ✅'
      )
      setShowModal(false)
      setFormData({
        visitorName: '',
        visitorPhone: '',
        relation: 'parent',
        purpose: '',
        visitDate: '',
        expectedTime: ''
      })
      setIdProof(null)
      fetchVisitors()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: '#FEF3C7',
          color: '#D97706',
          label: '⏳ Pending Approval'
        }
      case 'approved':
        return {
          bg: '#DCFCE7',
          color: '#16A34A',
          label: '✅ Approved'
        }
      case 'rejected':
        return {
          bg: '#FEE2E2',
          color: '#DC2626',
          label: '❌ Rejected'
        }
      case 'checked_in':
        return {
          bg: '#DBEAFE',
          color: '#2563EB',
          label: '🏠 Checked In'
        }
      case 'checked_out':
        return {
          bg: '#F3E8FF',
          color: '#7C3AED',
          label: '🚶 Checked Out'
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
    <Loader text="Loading visitors..." />
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
            👥 My Visitors
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {visitors.length} requests
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Request Visitor
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
          { value: 'approved',
            label: '✅ Approved' },
          { value: 'checked_in',
            label: '🏠 Checked In' },
          { value: 'checked_out',
            label: '🚶 Done' },
          { value: 'rejected',
            label: '❌ Rejected' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() =>
              setFilterStatus(f.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '12px',
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

      {/* Visitors List */}
      {visitors.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>
            👥
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No visitor requests!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {visitors.map(v => {
            const statusStyle =
              getStatusStyle(v.status)
            return (
              <div key={v._id}
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
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'center',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        👤
                      </div>
                      <div>
                        <h3 style={{
                          fontWeight: '700',
                          fontSize: '16px',
                          color: 'var(--text)'
                        }}>
                          {v.visitorName}
                        </h3>
                        <p style={{
                          fontSize: '13px',
                          color:
                            'var(--text-muted)'
                        }}>
                          📞 {v.visitorPhone} •
                          {v.relation}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(3, 1fr)',
                      gap: '12px',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        padding: '10px',
                        background: '#F8FAFC',
                        borderRadius: '8px'
                      }}>
                        <p style={{
                          fontSize: '11px',
                          color:
                            'var(--text-muted)',
                          fontWeight: '600',
                          textTransform:
                            'uppercase'
                        }}>
                          Visit Date
                        </p>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          marginTop: '2px'
                        }}>
                          {new Date(v.visitDate)
                            .toLocaleDateString(
                              'en-IN'
                            )}
                        </p>
                      </div>
                      <div style={{
                        padding: '10px',
                        background: '#F8FAFC',
                        borderRadius: '8px'
                      }}>
                        <p style={{
                          fontSize: '11px',
                          color:
                            'var(--text-muted)',
                          fontWeight: '600',
                          textTransform:
                            'uppercase'
                        }}>
                          Expected Time
                        </p>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          marginTop: '2px'
                        }}>
                          {v.expectedTime}
                        </p>
                      </div>
                      <div style={{
                        padding: '10px',
                        background: '#F8FAFC',
                        borderRadius: '8px'
                      }}>
                        <p style={{
                          fontSize: '11px',
                          color:
                            'var(--text-muted)',
                          fontWeight: '600',
                          textTransform:
                            'uppercase'
                        }}>
                          Purpose
                        </p>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {v.purpose}
                        </p>
                      </div>
                    </div>

                    {/* OTP Info */}
                    {v.status === 'approved' && (
                      <div style={{
    padding: '16px',
    background: '#DCFCE7',
    borderRadius: '12px',
    marginTop: '12px',
    border: '1px solid #BBF7D0'
  }}>
    <p style={{
      fontWeight: '700',
      color: '#16A34A',
      fontSize: '14px',
      marginBottom: '8px'
    }}>
      ✅ Visitor Approved!
    </p>
    {v.otp ? (
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '12px',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#64748b',
          marginBottom: '6px'
        }}>
          🔐 Entry OTP —
          Share with your visitor:
        </p>
        <p style={{
          fontSize: '32px',
          fontWeight: '800',
          color: 'var(--primary)',
          letterSpacing: '8px',
          fontFamily: 'Space Grotesk'
        }}>
          {v.otp}
        </p>
        <p style={{
          fontSize: '11px',
          color: '#ef4444',
          marginTop: '6px',
          fontWeight: '600'
        }}>
          ⏰ Valid for 24 hours only!
        </p>
      </div>
    ) : (
      <p style={{
        fontSize: '13px',
        color: '#16A34A'
      }}>
        Security will verify
        your visitor at gate!
      </p>
    )}
                      </div>
                    )}
                    {/* Rejection reason */}
                    {v.status === 'rejected' &&
                      v.rejectionReason && (
                      <div style={{
                        padding: '12px 16px',
                        background: '#FEF2F2',
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: '#DC2626',
                        marginTop: '8px'
                      }}>
                        ❌ Rejected:{' '}
                        {v.rejectionReason}
                      </div>
                    )}

                    {/* Duration */}
                    {v.duration && (
                      <p style={{
                        fontSize: '12px',
                        color:
                          'var(--text-muted)',
                        marginTop: '8px'
                      }}>
                        ⏱️ Visit duration:
                        {v.duration} minutes
                      </p>
                    )}
                  </div>

                  <span style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    whiteSpace: 'nowrap'
                  }}>
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Request Visitor Modal */}
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
                👥 Request Visitor
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
                    Visitor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.visitorName}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        visitorName:
                          e.target.value
                      })}
                    placeholder="Full name"
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
                    value={formData.visitorPhone}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        visitorPhone:
                          e.target.value
                      })}
                    placeholder="10 digit"
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
                    Relation *
                  </label>
                  <select
                    value={formData.relation}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        relation: e.target.value
                      })}
                    required
                    className="input"
                  >
                    {[
                      'parent',
                      'sibling',
                      'relative',
                      'friend',
                      'guardian',
                      'other'
                    ].map(r => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase()
                          + r.slice(1)}
                      </option>
                    ))}
                  </select>
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
                    Purpose *
                  </label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        purpose: e.target.value
                      })}
                    placeholder="Reason for visit"
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
                    Visit Date *
                  </label>
                  <input
                    type="date"
                    value={formData.visitDate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        visitDate: e.target.value
                      })}
                    min={new Date()
                      .toISOString()
                      .split('T')[0]}
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
                    Expected Time *
                  </label>
                  <input
                    type="text"
                    value={formData.expectedTime}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        expectedTime:
                          e.target.value
                      })}
                    placeholder="e.g. 2:00 PM"
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
                    Visitor ID Proof
                    (Optional — AWS S3)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e =>
                      setIdProof(
                        e.target.files[0]
                      )}
                    className="input"
                    style={{ padding: '8px' }}
                  />
                  {idProof && (
                    <p style={{
                      fontSize: '12px',
                      color: '#10b981',
                      marginTop: '4px'
                    }}>
                      ✅ {idProof.name}
                    </p>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '10px'
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
                    : '👥 Request Visitor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}