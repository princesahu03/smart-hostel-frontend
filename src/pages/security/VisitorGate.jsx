import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

export default function VisitorGate() {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [otp, setOtp] = useState({})
  const [processing, setProcessing] =
    useState('')

  useEffect(() => {
    fetchTodayVisitors()
  }, [])

  const fetchTodayVisitors = async () => {
    try {
      const res = await api.get(
        '/visitors/today'
      )
      setVisitors(res.data.data.visitors || [])
    } catch {
      toast.error('Failed to fetch!')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (visitorId) => {
    if (!otp[visitorId]?.trim()) {
      toast.error('Enter OTP!')
      return
    }
    setProcessing(visitorId)
    try {
      const res = await api.post(
        `/visitors/${visitorId}/checkin`,
        { otp: otp[visitorId] }
      )
      toast.success(
        `✅ ${res.data.message}`
      )
      setOtp({ ...otp, [visitorId]: '' })
      fetchTodayVisitors()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Invalid OTP!'
      )
    } finally {
      setProcessing('')
    }
  }

  const handleCheckOut = async (visitorId) => {
    setProcessing(visitorId)
    try {
      const res = await api.post(
        `/visitors/${visitorId}/checkout`
      )
      toast.success(
        `✅ ${res.data.message}`
      )
      fetchTodayVisitors()
    } catch {
      toast.error('Failed!')
    } finally {
      setProcessing('')
    }
  }

  if (loading) return (
    <Loader text="Loading visitor gate..." />
  )

  const pending = visitors.filter(
    v => v.status === 'approved'
  )
  const checkedIn = visitors.filter(
    v => v.status === 'checked_in'
  )
  const checkedOut = visitors.filter(
    v => v.status === 'checked_out'
  )

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
            🔐 Visitor Gate
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {new Date().toLocaleDateString(
              'en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              }
            )}
          </p>
        </div>
        <button
          onClick={fetchTodayVisitors}
          style={{
            padding: '10px 20px',
            border:
              '1.5px solid var(--primary)',
            borderRadius: '10px',
            background: 'white',
            color: 'var(--primary)',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}
        className="grid-3">
        {[
          {
            label: 'Awaiting Entry',
            value: pending.length,
            icon: '⏳',
            bg: '#FEF3C7',
            color: '#D97706'
          },
          {
            label: 'Inside Hostel',
            value: checkedIn.length,
            icon: '🏠',
            bg: '#DBEAFE',
            color: '#2563EB'
          },
          {
            label: 'Checked Out',
            value: checkedOut.length,
            icon: '✅',
            bg: '#DCFCE7',
            color: '#16A34A'
          },
        ].map((s, i) => (
          <div key={i} className="card"
            style={{ padding: '20px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: s.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              marginBottom: '12px'
            }}>
              {s.icon}
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              color: s.color,
              fontFamily: 'Space Grotesk'
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '4px'
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Awaiting Check In */}
      {pending.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '12px'
          }}>
            ⏳ Awaiting Entry (OTP Verify)
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {pending.map(v => (
              <div key={v._id}
                className="card"
                style={{
                  padding: '20px',
                  borderLeft:
                    '4px solid #f59e0b'
                }}>
                <div style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
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
                      color: 'var(--text-muted)',
                      marginTop: '2px'
                    }}>
                      📞 {v.visitorPhone} •
                      {v.relation} •
                      Student:{' '}
                      <strong>
                        {v.student?.name}
                      </strong> •
                      Room:{' '}
                      <strong>
                        {v.student?.roomNumber
                          || '—'}
                      </strong>
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color:
                        'var(--text-muted)',
                      marginTop: '2px'
                    }}>
                      🕐 Expected:{' '}
                      {v.expectedTime} •
                      Purpose: {v.purpose}
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={
                        otp[v._id] || ''
                      }
                      onChange={e =>
                        setOtp({
                          ...otp,
                          [v._id]: e.target.value
                        })}
                      maxLength={6}
                      className="input"
                      style={{
                        width: '130px',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        letterSpacing: '4px'
                      }}
                    />
                    <button
                      onClick={() =>
                        handleCheckIn(v._id)}
                      disabled={
                        processing === v._id
                      }
                      className="btn-success"
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        opacity:
                          processing === v._id
                            ? 0.7 : 1
                      }}
                    >
                      {processing === v._id
                        ? '⏳'
                        : '✅ Check In'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checked In */}
      {checkedIn.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '12px'
          }}>
            🏠 Currently Inside
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {checkedIn.map(v => (
              <div key={v._id}
                className="card"
                style={{
                  padding: '20px',
                  borderLeft:
                    '4px solid #3b82f6'
                }}>
                <div style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
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
                        'var(--text-muted)',
                      marginTop: '2px'
                    }}>
                      Student:{' '}
                      <strong>
                        {v.student?.name}
                      </strong> •
                      Room:{' '}
                      <strong>
                        {v.student?.roomNumber}
                      </strong>
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#2563EB',
                      fontWeight: '600',
                      marginTop: '4px'
                    }}>
                      ✅ Checked in:{' '}
                      {new Date(v.checkInTime)
                        .toLocaleTimeString(
                          'en-IN'
                        )}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleCheckOut(v._id)}
                    disabled={
                      processing === v._id
                    }
                    className="btn-danger"
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      opacity:
                        processing === v._id
                          ? 0.7 : 1
                    }}
                  >
                    {processing === v._id
                      ? '⏳'
                      : '🚶 Check Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checked Out */}
      {checkedOut.length > 0 && (
        <div>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '12px'
          }}>
            ✅ Checked Out Today
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {checkedOut.map(v => (
              <div key={v._id}
                className="card"
                style={{
                  padding: '16px 20px',
                  borderLeft:
                    '4px solid #10b981',
                  opacity: 0.8
                }}>
                <div style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{
                      fontWeight: '600',
                      fontSize: '15px',
                      color: 'var(--text)'
                    }}>
                      {v.visitorName}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color:
                        'var(--text-muted)'
                    }}>
                      {v.student?.name} •
                      Room {v.student
                        ?.roomNumber}
                    </p>
                  </div>
                  <div style={{
                    textAlign: 'right',
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}>
                    <p>
                      In:{' '}
                      {new Date(v.checkInTime)
                        .toLocaleTimeString(
                          'en-IN'
                        )}
                    </p>
                    <p>
                      Out:{' '}
                      {new Date(v.checkOutTime)
                        .toLocaleTimeString(
                          'en-IN'
                        )}
                    </p>
                    {v.duration && (
                      <p style={{
                        color: '#10b981',
                        fontWeight: '600'
                      }}>
                        ⏱️ {v.duration} min
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {visitors.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>
            🔐
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No visitors today!
          </p>
        </div>
      )}
    </div>
  )
}