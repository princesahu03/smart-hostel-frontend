import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from'../../context/AuthContext'
import Loader from '../../components/Loader'
import toast from 'react-hot-toast'

export default function MyQR() {
  const { user } = useAuth()
  const [qrData, setQrData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] =
    useState('qr')

  useEffect(() => {
    fetchQR()
    fetchHistory()
  }, [])

  const fetchQR = async () => {
    try {
      const res = await api.get('/qr/my-qr')
      setQrData(res.data.data)
    } catch {
      toast.error('Failed to load QR!')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await api.get(
        '/qr/my-history'
      )
      setHistory(res.data.data.history || [])
    } catch {}
  }

  const getTypeStyle = (type, isLate) => {
    if (isLate) return {
      bg: '#FEE2E2',
      color: '#DC2626',
      icon: '⚠️'
    }
    switch (type) {
      case 'entry':
        return {
          bg: '#DCFCE7',
          color: '#16A34A',
          icon: '🏠'
        }
      case 'exit':
        return {
          bg: '#DBEAFE',
          color: '#2563EB',
          icon: '🚶'
        }
      case 'meal':
        return {
          bg: '#FEF3C7',
          color: '#D97706',
          icon: '🍽️'
        }
      default:
        return {
          bg: '#F1F5F9',
          color: '#64748B',
          icon: '📋'
        }
    }
  }

  if (loading) return (
    <Loader text="Loading your QR Code..." />
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
          🔲 My QR Code
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          Scan at gate for entry/exit
          and mess for meals!
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {[
          { value: 'qr', label: '🔲 My QR' },
          { value: 'history',
            label: '📋 Scan History' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() =>
              setActiveTab(tab.value)}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              background:
                activeTab === tab.value
                  ? 'var(--primary)'
                  : 'white',
              color:
                activeTab === tab.value
                  ? 'white'
                  : 'var(--text-muted)',
              border:
                activeTab === tab.value
                  ? '1.5px solid var(--primary)'
                  : '1.5px solid var(--border)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'qr' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}
          className="grid-2">

          {/* QR Code Card */}
          <div className="card"
            style={{ padding: '28px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '20px',
              color: 'var(--text)'
            }}>
              Your Hostel QR Code
            </h2>

            {qrData?.qrImage && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                {/* QR Image */}
                <div style={{
                  padding: '16px',
                  background: 'white',
                  borderRadius: '16px',
                  border:
                    '3px solid var(--primary)',
                  boxShadow:
                    '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                  <img
                    src={qrData.qrImage}
                    alt="Student QR Code"
                    style={{
                      width: '200px',
                      height: '200px'
                    }}
                  />
                </div>

                {/* Student Info */}
                <div style={{
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontWeight: '700',
                    fontSize: '16px',
                    color: 'var(--text)'
                  }}>
                    {qrData.studentName}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)'
                  }}>
                    ID: {qrData.studentId}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--primary)',
                    fontWeight: '600'
                  }}>
                    Room: {qrData.roomNumber
                      || 'Not Allotted'}
                  </p>
                </div>

                {/* Download Button */}
                <a
                  href={qrData.qrImage}
                  download={`QR-${qrData.studentName}.png`}
                  style={{
                    padding: '10px 24px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  ⬇️ Download QR
                </a>
              </div>
            )}
          </div>

          {/* Instructions Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {[
              {
                icon: '🏠',
                title: 'Entry',
                desc: 'Hostel gate pe entry '
                  + 'karte waqt QR scan karo!',
                color: '#DCFCE7',
                border: '#BBF7D0'
              },
              {
                icon: '🚶',
                title: 'Exit',
                desc: 'Bahar jaate waqt '
                  + 'QR scan karo!',
                color: '#DBEAFE',
                border: '#BFDBFE'
              },
              {
                icon: '🍽️',
                title: 'Mess Meal',
                desc: 'Khana lene se pehle '
                  + 'mess mein QR scan karo!',
                color: '#FEF3C7',
                border: '#FDE68A'
              },
              {
                icon: '⚠️',
                title: 'Curfew',
                desc: '10 PM ke baad entry '
                  + 'late entry count hogi!',
                color: '#FEE2E2',
                border: '#FECACA'
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '16px',
                background: item.color,
                borderRadius: '12px',
                border: `1px solid ${item.border}`,
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <span style={{
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  {item.icon}
                </span>
                <div>
                  <p style={{
                    fontWeight: '700',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginTop: '2px'
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Current Status */}
            <div style={{
              padding: '16px',
              background: 'var(--primary)',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                Current Status
              </p>
              <p style={{
                fontSize: '20px',
                fontWeight: '800',
                fontFamily: 'Space Grotesk',
                marginTop: '4px'
              }}>
                {user?.currentStatus
                  === 'inside'
                  ? '🏠 Inside Hostel'
                  : '🚶 Outside Hostel'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        //History Tab
        <div>
          {history.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '56px'
              }}>
                📋
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '16px'
              }}>
                No scan history yet!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {history.map(h => {
                const style = getTypeStyle(
                  h.type, h.isLate
                )
                return (
                  <div key={h._id}
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      padding: '14px 16px',
                      background: style.bg,
                      borderRadius: '12px',
                      border: `1px solid ${style.color}30`
                    }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{
                        fontSize: '24px'
                      }}>
                        {style.icon}
                      </span>
                      <div>
                        <p style={{
                          fontWeight: '600',
                          fontSize: '14px',
                          color: 'var(--text)',
                          textTransform:
                            'capitalize'
                        }}>
                          {h.isLate
                            ? '⚠️ Late '
                            : ''}
                          {h.type}
                          {h.mealType
                            ? ` — ${h.mealType}`
                            : ''}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color:
                            'var(--text-muted)'
                        }}>
                          {h.location}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: style.color
                      }}>
                        {new Date(h.scanTime)
                          .toLocaleTimeString(
                            'en-IN'
                          )}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                      }}>
                        {new Date(h.scanTime)
                          .toLocaleDateString(
                            'en-IN'
                          )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}