import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] =
    useState('pending')
  const [showDetails, setShowDetails] =
    useState(false)
  const [selectedVisitor, setSelectedVisitor] =
    useState(null)
  const [rejectionReason, setRejectionReason] =
    useState('')

  useEffect(() => {
    fetchVisitors()
  }, [filterStatus])

  const fetchVisitors = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus
      const res = await api.get(
        '/visitors/all', { params }
      )
      setVisitors(res.data.data.visitors)
    } catch {
      toast.error('Failed to fetch!')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (visitorId) => {
    try {
      const res = await api.patch(
        `/visitors/${visitorId}/status`,
        { status: 'approved' }
      )
      toast.success(
        `✅ Approved! OTP: ${
          res.data.data.otp
        }`
      )
      fetchVisitors()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    }
  }

  const handleReject = async (visitorId) => {
    if (!rejectionReason.trim()) {
      toast.error('Enter rejection reason!')
      return
    }
    try {
      await api.patch(
        `/visitors/${visitorId}/status`,
        {
          status: 'rejected',
          rejectionReason
        }
      )
      toast.success('Visitor rejected!')
      setRejectionReason('')
      setShowDetails(false)
      fetchVisitors()
    } catch {
      toast.error('Failed!')
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: '#FEF3C7',
          color: '#D97706'
        }
      case 'approved':
        return {
          bg: '#DCFCE7',
          color: '#16A34A'
        }
      case 'rejected':
        return {
          bg: '#FEE2E2',
          color: '#DC2626'
        }
      case 'checked_in':
        return {
          bg: '#DBEAFE',
          color: '#2563EB'
        }
      case 'checked_out':
        return {
          bg: '#F3E8FF',
          color: '#7C3AED'
        }
      default:
        return {
          bg: '#F1F5F9',
          color: '#64748B'
        }
    }
  }

  if (loading) return (
    <Loader text="Loading visitors..." />
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: 'var(--text)',
          fontFamily: 'Space Grotesk'
        }}>
          👥 Visitor Management
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          {visitors.length} visitors
        </p>
      </div>

      {/* Status Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: 'pending',
            label: '⏳ Pending' },
          { value: 'approved',
            label: '✅ Approved' },
          { value: 'checked_in',
            label: '🏠 Checked In' },
          { value: 'checked_out',
            label: '🚶 Checked Out' },
          { value: 'rejected',
            label: '❌ Rejected' },
          { value: '',
            label: '📋 All' },
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
            No visitors found!
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
                  {/* Visitor Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                      fontSize: '13px'
                    }}>
                      <div>
                        <p style={{
                          color:
                            'var(--text-muted)',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform:
                            'uppercase'
                        }}>
                          Student
                        </p>
                        <p style={{
                          fontWeight: '600',
                          color: 'var(--text)'
                        }}>
                          {v.student?.name}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color:
                            'var(--text-muted)'
                        }}>
                          Room:{' '}
                          {v.student?.roomNumber
                            || '—'}
                        </p>
                      </div>
                      <div>
                        <p style={{
                          color:
                            'var(--text-muted)',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform:
                            'uppercase'
                        }}>
                          Visit Date
                        </p>
                        <p style={{
                          fontWeight: '600'
                        }}>
                          {new Date(v.visitDate)
                            .toLocaleDateString(
                              'en-IN'
                            )}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color:
                            'var(--text-muted)'
                        }}>
                          {v.expectedTime}
                        </p>
                      </div>
                      <div>
                        <p style={{
                          color:
                            'var(--text-muted)',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform:
                            'uppercase'
                        }}>
                          Purpose
                        </p>
                        <p style={{
                          fontWeight: '600',
                          color: 'var(--text)',
                          fontSize: '13px'
                        }}>
                          {v.purpose}
                        </p>
                      </div>
                    </div>

                    {/* ID Proof */}
                    {v.idProof && (
                      <a
                        href={v.idProof}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display:
                            'inline-block',
                          marginTop: '10px',
                          fontSize: '12px',
                          color: 'var(--primary)',
                          fontWeight: '600'
                        }}
                      >
                        🪪 View ID Proof
                        (AWS S3) →
                      </a>
                    )}

                    {/* Check in/out times */}
                    {v.checkInTime && (
                      <div style={{
                        marginTop: '10px',
                        fontSize: '12px',
                        color:
                          'var(--text-muted)',
                        display: 'flex',
                        gap: '16px'
                      }}>
                        <span>
                          ✅ In:{' '}
                          {new Date(
                            v.checkInTime
                          ).toLocaleTimeString(
                            'en-IN'
                          )}
                        </span>
                        {v.checkOutTime && (
                          <span>
                            🚶 Out:{' '}
                            {new Date(
                              v.checkOutTime
                            ).toLocaleTimeString(
                              'en-IN'
                            )}
                          </span>
                        )}
                        {v.duration && (
                          <span>
                            ⏱️ {v.duration} min
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    alignItems: 'flex-end'
                  }}>
                    <span style={{
                      padding: '5px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background:
                        statusStyle.bg,
                      color: statusStyle.color,
                      textTransform: 'capitalize'
                    }}>
                      {v.status.replace(
                        '_', ' '
                      )}
                    </span>

                    {v.status === 'pending' && (
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button
                          onClick={() =>
                            handleApprove(v._id)}
                          className="btn-success"
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px'
                          }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVisitor(v)
                            setShowDetails(true)
                          }}
                          className="btn-danger"
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px'
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {v.status ===
                      'approved' && (
                      <div style={{
                        background: '#DCFCE7',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#16A34A'
                      }}>
                        🔐 OTP Sent to Student
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      {showDetails && selectedVisitor && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '420px',
              padding: '28px'
            }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: 'Space Grotesk',
              marginBottom: '16px'
            }}>
              ❌ Reject Visitor
            </h2>

            <div style={{
              background: '#FEF2F2',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
              fontSize: '13px'
            }}>
              <strong>
                {selectedVisitor.visitorName}
              </strong>{' '}
              visiting{' '}
              <strong>
                {selectedVisitor.student?.name}
              </strong>
            </div>

            <div style={{
              marginBottom: '16px'
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}>
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={e =>
                  setRejectionReason(
                    e.target.value
                  )}
                placeholder="Enter reason..."
                rows={3}
                className="input"
                style={{
                  resize: 'none',
                  fontFamily: 'Inter'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => {
                  setShowDetails(false)
                  setRejectionReason('')
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
                onClick={() =>
                  handleReject(
                    selectedVisitor._id
                  )}
                className="btn-danger"
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}