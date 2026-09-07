import { useState, useEffect } from 'react'
import { useAuth } from
  '../../context/AuthContext'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function MyRoom() {
  const { user } = useAuth()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoom()
  }, [])

  const fetchRoom = async () => {
    try {
      const res = await api.get('/rooms')
      const myRoom = res.data.data.rooms
        .find(r =>
          r.occupants?.some(
            o => o._id === user?._id
          )
        )
      setRoom(myRoom || null)
    } catch {
      console.error('Failed!')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Loader text="Loading room..." />
  )

  return (
    <div>
      <h1 style={{
        fontSize: '26px',
        fontWeight: '700',
        color: 'var(--text)',
        fontFamily: 'Space Grotesk',
        marginBottom: '24px'
      }}>
        🏠 My Room
      </h1>

      {!room || !user?.roomNumber ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>
            🏠
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No room allotted yet!
          </p>
          <p style={{
            fontSize: '13px',
            marginTop: '6px'
          }}>
            Contact admin for room allotment
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Room Header Card */}
          <div className="card" style={{
            padding: '24px',
            background:
              'linear-gradient(135deg, #1a3c5e, #2d5f8a)',
            color: 'white',
            border: 'none'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <p style={{
                  opacity: 0.7,
                  fontSize: '13px'
                }}>
                  Your Room
                </p>
                <h2 style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  fontFamily: 'Space Grotesk',
                  lineHeight: 1
                }}>
                  {room.roomNumber}
                </h2>
                <p style={{
                  opacity: 0.8,
                  fontSize: '14px',
                  marginTop: '4px'
                }}>
                  Floor {room.floor} •
                  Block {room.block} •
                  {room.type} room
                </p>
              </div>
              <div style={{
                textAlign: 'right'
              }}>
                <div style={{
                  background:
                    'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  padding: '16px 24px'
                }}>
                  <p style={{
                    fontSize: '12px',
                    opacity: 0.7
                  }}>
                    Monthly Rent
                  </p>
                  <p style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    fontFamily: 'Space Grotesk'
                  }}>
                    ₹{room.monthlyRent
                      ?.toLocaleString('en-IN')
                      || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}
            className="grid-2">

            {/* Amenities */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '16px'
              }}>
                ✨ Amenities
              </h2>
              {room.amenities?.length === 0 ? (
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}>
                  No amenities listed!
                </p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {room.amenities?.map(a => (
                    <span key={a} style={{
                      padding: '6px 14px',
                      background: '#EFF6FF',
                      color: 'var(--primary)',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      ✅ {a}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Roommates */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '16px'
              }}>
                👥 Roommates (
                {room.occupants?.length}/
                {room.capacity})
              </h2>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {room.occupants?.map(o => (
                  <div key={o._id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    background:
                      o._id === user?._id
                        ? '#EFF6FF'
                        : '#F8FAFC',
                    borderRadius: '10px',
                    border:
                      o._id === user?._id
                        ? '1.5px solid #BFDBFE'
                        : '1.5px solid transparent'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background:
                        'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {o.name?.[0]
                        ?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{
                        fontWeight: '600',
                        fontSize: '13px',
                        color: 'var(--text)'
                      }}>
                        {o.name}
                        {o._id === user?._id &&
                          ' (You)'}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color:
                          'var(--text-muted)'
                      }}>
                        {o.studentId || o.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}