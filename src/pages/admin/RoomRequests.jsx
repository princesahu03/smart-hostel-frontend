import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const REQUEST_TYPES = {
  room_change: {
    icon: '🔄',
    label: 'Room Change'
  },
  roommate_preference: {
    icon: '👥',
    label: 'Roommate Preference'
  },
  room_checkout: {
    icon: '🚪',
    label: 'Room Checkout'
  },
  room_swap: {
    icon: '🔀',
    label: 'Room Swap'
  }
}

const STATUS_STYLES = {
  pending: {
    bg: '#FEF3C7',
    color: '#D97706',
    label: '⏳ Pending'
  },
  approved: {
    bg: '#DCFCE7',
    color: '#16A34A',
    label: '✅ Approved'
  },
  rejected: {
    bg: '#FEE2E2',
    color: '#DC2626',
    label: '❌ Rejected'
  },
  completed: {
    bg: '#DBEAFE',
    color: '#2563EB',
    label: '🎉 Completed'
  },
  cancelled: {
    bg: '#F1F5F9',
    color: '#64748B',
    label: '✕ Cancelled'
  }
}

export default function RoomRequests() {
  const [requests, setRequests] =
    useState([])
  const [loading, setLoading] =
    useState(true)
  const [filterStatus, setFilterStatus] =
    useState('pending')
  const [filterType, setFilterType] =
    useState('')
  const [showModal, setShowModal] =
    useState(false)
  const [selected, setSelected] =
    useState(null)
  const [processForm, setProcessForm] =
    useState({
      status: 'approved',
      adminRemarks: ''
    })
  const [processing, setProcessing] =
    useState(false)

  useEffect(() => {
    fetchRequests()
  }, [filterStatus, filterType])

  const fetchRequests = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus
      if (filterType)
        params.requestType = filterType

      const res = await api.get(
        '/room-requests/all',
        { params }
      )
      setRequests(
        res.data.data.requests
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async (e) => {
    e.preventDefault()
    setProcessing(true)
    try {
      await api.patch(
        `/room-requests/${selected._id}/process`,
        processForm
      )
      toast.success(
        `Request ${processForm.status}! ✅`
      )
      setShowModal(false)
      fetchRequests()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <Loader text="Loading requests..." />
  )

  const pendingCount = requests.filter(
    r => r.status === 'pending'
  ).length

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
            🏠 Room Requests
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {requests.length} requests
            {pendingCount > 0 && (
              <span style={{
                marginLeft: '8px',
                background: '#FEF3C7',
                color: '#D97706',
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Status filter */}
        {['', 'pending', 'approved',
          'rejected', 'completed']
          .map(s => (
          <button
            key={s}
            onClick={() =>
              setFilterStatus(s)}
            style={{
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              background:
                filterStatus === s
                  ? 'var(--primary)'
                  : 'white',
              color:
                filterStatus === s
                  ? 'white'
                  : 'var(--text-muted)',
              border:
                filterStatus === s
                  ? '1.5px solid var(--primary)'
                  : '1.5px solid var(--border)'
            }}
          >
            {s === ''
              ? 'All'
              : STATUS_STYLES[s]?.label
              || s}
          </button>
        ))}

        {/* Type filter */}
        <select
          value={filterType}
          onChange={e =>
            setFilterType(e.target.value)}
          className="input"
          style={{
            width: 'auto',
            padding: '7px 14px',
            fontSize: '12px'
          }}
        >
          <option value="">All Types</option>
          {Object.entries(REQUEST_TYPES)
            .map(([key, type]) => (
            <option key={key} value={key}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '48px' }}>
            🏠
          </div>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            marginTop: '12px'
          }}>
            No {filterStatus} requests!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {requests.map(req => {
            const typeInfo =
              REQUEST_TYPES[req.requestType]
            const statusStyle =
              STATUS_STYLES[req.status] ||
              STATUS_STYLES.pending

            return (
              <div key={req._id}
                className="card"
                style={{
                  padding: '16px 20px',
                  borderLeft: `4px solid ${statusStyle.color}`
                }}>
                <div style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        fontSize: '20px'
                      }}>
                        {typeInfo?.icon}
                      </span>
                      <span style={{
                        fontWeight: '700',
                        fontSize: '15px',
                        color: 'var(--text)'
                      }}>
                        {typeInfo?.label}
                      </span>
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background:
                          statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {statusStyle.label}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background:
                          req.priority === 'high'
                            ? '#FEE2E2'
                            : req.priority ===
                              'medium'
                            ? '#FEF3C7'
                            : '#DCFCE7',
                        color:
                          req.priority === 'high'
                            ? '#DC2626'
                            : req.priority ===
                              'medium'
                            ? '#D97706'
                            : '#16A34A'
                      }}>
                        {req.priority}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div style={{
                      padding: '8px 12px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      fontSize: '13px'
                    }}>
                      <span style={{
                        fontWeight: '700'
                      }}>
                        👤 {req.student?.name}
                      </span>
                      <span style={{
                        color:
                          'var(--text-muted)',
                        marginLeft: '8px'
                      }}>
                        ID:{' '}
                        {req.student?.studentId}
                        {' • '}Room:{' '}
                        {req.student
                          ?.roomNumber || '—'}
                        {' • '}
                        {req.student?.phone}
                      </span>
                    </div>

                    {/* Request Details */}
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <span>
                        📋 {req.reason}
                      </span>
                      {req.currentRoom && (
                        <span>
                          🏠 Current Room:{' '}
                          {req.currentRoom}
                        </span>
                      )}
                      {req.preferredRoomNumber && (
                        <span style={{
                          color: '#2563EB',
                          fontWeight: '600'
                        }}>
                          🎯 Wants Room:{' '}
                          {req.preferredRoomNumber}
                        </span>
                      )}
                      {req.preferredRoommate && (
                        <span style={{
                          color: '#7C3AED',
                          fontWeight: '600'
                        }}>
                          👥 Roommate:{' '}
                          {req.preferredRoommate
                            ?.name}{' '}
                          (Room{' '}
                          {req.preferredRoommate
                            ?.roomNumber})
                        </span>
                      )}
                      {req.swapWithStudent && (
                        <span style={{
                          color: '#D97706',
                          fontWeight: '600'
                        }}>
                          🔀 Swap with:{' '}
                          {req.swapWithStudent
                            ?.name}{' '}
                          (Room{' '}
                          {req.swapWithRoom})
                        </span>
                      )}
                      {req.checkoutDate && (
                        <span>
                          📅 Checkout:{' '}
                          {new Date(
                            req.checkoutDate
                          ).toLocaleDateString(
                            'en-IN'
                          )}
                        </span>
                      )}
                      <span style={{
                        fontSize: '11px'
                      }}>
                        🕐{' '}
                        {new Date(
                          req.createdAt
                        ).toLocaleString(
                          'en-IN'
                        )}
                      </span>
                    </div>

                    {req.adminRemarks && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#7C3AED',
                        fontWeight: '600'
                      }}>
                        💬 Admin:{' '}
                        {req.adminRemarks}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {req.status === 'pending' && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <button
                        onClick={() => {
                          setSelected(req)
                          setProcessForm({
                            status: 'approved',
                            adminRemarks: ''
                          })
                          setShowModal(true)
                        }}
                        style={{
                          padding: '7px 16px',
                          background: '#DCFCE7',
                          color: '#16A34A',
                          border:
                            '1px solid #BBF7D0',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelected(req)
                          setProcessForm({
                            status: 'rejected',
                            adminRemarks: ''
                          })
                          setShowModal(true)
                        }}
                        style={{
                          padding: '7px 16px',
                          background: '#FEE2E2',
                          color: '#DC2626',
                          border:
                            '1px solid #FECACA',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Process Modal */}
      {showModal && selected && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '420px',
              padding: '28px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                {processForm.status ===
                  'approved'
                  ? '✅ Approve Request'
                  : '❌ Reject Request'}
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

            {/* Request Summary */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontWeight: '700',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                {REQUEST_TYPES[
                  selected.requestType
                ]?.icon}{' '}
                {REQUEST_TYPES[
                  selected.requestType
                ]?.label}
              </p>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}>
                By: {selected.student?.name}
                {' • '}Room:{' '}
                {selected.student
                  ?.roomNumber || '—'}
              </p>
              {selected.preferredRoomNumber && (
                <p style={{
                  fontSize: '12px',
                  color: '#2563EB',
                  fontWeight: '600',
                  marginTop: '4px'
                }}>
                  🎯 Wants:{' '}
                  Room{' '}
                  {selected.preferredRoomNumber}
                </p>
              )}
              {selected.swapWithStudent && (
                <p style={{
                  fontSize: '12px',
                  color: '#D97706',
                  fontWeight: '600',
                  marginTop: '4px'
                }}>
                  🔀 Swap with:{' '}
                  {selected.swapWithStudent
                    ?.name}
                </p>
              )}

              {/* Warning for room change */}
              {processForm.status ===
                'approved' &&
                (selected.requestType ===
                  'room_change' ||
                  selected.requestType ===
                  'room_swap' ||
                  selected.requestType ===
                  'room_checkout') && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: '#FEF3C7',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#92400E',
                  fontWeight: '600'
                }}>
                  ⚠️ Approving this will
                  automatically update
                  room assignments!
                </div>
              )}
            </div>

            <form onSubmit={handleProcess}
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
                  Remarks{' '}
                  {processForm.status ===
                    'rejected'
                    ? '(Required)'
                    : '(Optional)'}
                </label>
                <textarea
                  value={
                    processForm.adminRemarks
                  }
                  onChange={e =>
                    setProcessForm({
                      ...processForm,
                      adminRemarks:
                        e.target.value
                    })}
                  placeholder={
                    processForm.status ===
                      'rejected'
                      ? 'Reason for rejection...'
                      : 'Any additional notes...'
                  }
                  rows={3}
                  required={
                    processForm.status ===
                    'rejected'
                  }
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
                  disabled={processing}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background:
                      processForm.status ===
                        'approved'
                        ? '#10B981'
                        : '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                    opacity:
                      processing ? 0.7 : 1
                  }}
                >
                  {processing
                    ? '⏳ Processing...'
                    : processForm.status ===
                      'approved'
                    ? '✅ Confirm Approve'
                    : '❌ Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}