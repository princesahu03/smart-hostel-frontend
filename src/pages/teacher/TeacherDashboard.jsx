import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/Loader'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [floorData, setFloorData] =
    useState(null)
  const [loading, setLoading] =
    useState(true)
  const [noFloor, setNoFloor] =
    useState(false)

  useEffect(() => {
    fetchFloorData()
  }, [])

  const fetchFloorData = async () => {
    try {
      const res = await api.get(
        '/teachers/floor-data'
      )
      setFloorData(res.data.data)
    } catch (err) {
      if (err.response?.status === 400) {
        setNoFloor(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Loader text="Loading floor data..." />
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
          👨‍🏫 Teacher Dashboard
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          Welcome, {user?.name}!
          {user?.designation &&
            ` • ${user.designation}`}
        </p>
      </div>

      {/* Profile Card */}
      <div style={{
        background:
          'linear-gradient(135deg, #1a3c5e, #2d5f8a)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        color: 'white',
        display: 'grid',
        gridTemplateColumns:
          'repeat(4, 1fr)',
        gap: '16px'
      }}
        className="grid-4">
        {[
          {
            label: 'Designation',
            value: user?.designation
              || 'Not Set',
            icon: '👨‍🏫'
          },
          {
            label: 'Floor Assigned',
            value: user?.assignedFloor
              ? `Floor ${user.assignedFloor}`
              : 'Not Assigned',
            icon: '🏠'
          },
          {
            label: 'Warden Level',
            value: user?.wardenLevel
              ? user.wardenLevel
                .replace('_', ' ')
                .toUpperCase()
              : 'N/A',
            icon: '🎖️'
          },
          {
            label: 'Office Hours',
            value: user?.officeHours
              || 'Not Set',
            icon: '🕐'
          },
        ].map((item, i) => (
          <div key={i}
            style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '4px'
            }}>
              {item.icon}
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              fontFamily: 'Space Grotesk'
            }}>
              {item.value}
            </div>
            <div style={{
              fontSize: '11px',
              opacity: 0.7,
              marginTop: '2px'
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {noFloor ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '48px' }}>
            🏠
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '12px'
          }}>
            No floor assigned yet!
          </p>
          <p style={{
            fontSize: '13px',
            marginTop: '6px'
          }}>
            Contact admin to get
            a floor assigned to you.
          </p>
        </div>
      ) : floorData && (
        <>
          {/* Floor Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}
            className="grid-3">
            {[
              {
                label: 'Total Rooms',
                value: floorData.stats
                  .totalRooms,
                icon: '🏠',
                bg: '#EFF6FF',
                color: '#1a3c5e'
              },
              {
                label: 'Total Students',
                value: floorData.stats
                  .totalStudents,
                icon: '🎓',
                bg: '#DCFCE7',
                color: '#16A34A'
              },
              {
                label: 'Inside Now',
                value: floorData.stats
                  .insideCount,
                icon: '✅',
                bg: '#DBEAFE',
                color: '#2563EB'
              },
              {
                label: 'Outside Now',
                value: floorData.stats
                  .outsideCount,
                icon: '🚶',
                bg: '#FEE2E2',
                color: '#DC2626'
              },
              {
                label: 'Pending Violations',
                value: floorData.violations
                  .length,
                icon: '⚠️',
                bg: '#FEF3C7',
                color: '#D97706'
              },
              {
                label: 'Pending Complaints',
                value: floorData.complaints
                  .length,
                icon: '📋',
                bg: '#F3E8FF',
                color: '#7C3AED'
              },
            ].map((s, i) => (
              <div key={i} className="card"
                style={{ padding: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: s.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginBottom: '10px'
                }}>
                  {s.icon}
                </div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: s.color,
                  fontFamily: 'Space Grotesk'
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '4px'
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}
            className="grid-2">

            {/* Violations */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '14px'
              }}>
                ⚠️ Recent Violations
              </h2>
              {floorData.violations
                .length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{
                    fontSize: '32px'
                  }}>
                    🌟
                  </div>
                  <p style={{
                    fontSize: '13px',
                    marginTop: '8px'
                  }}>
                    No violations on
                    your floor!
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {floorData.violations
                    .slice(0, 5)
                    .map((v, i) => (
                    <div key={i} style={{
                      padding: '10px 12px',
                      background: '#FFF5F5',
                      borderRadius: '10px',
                      borderLeft:
                        '3px solid #DC2626',
                      fontSize: '12px'
                    }}>
                      <p style={{
                        fontWeight: '700',
                        color: 'var(--text)'
                      }}>
                        {v.student?.name}
                      </p>
                      <p style={{
                        color: '#DC2626',
                        fontWeight: '600',
                        marginTop: '2px'
                      }}>
                        ⏰ {v.minutesLate}
                        min late •{' '}
                        {new Date(
                          v.entryTime
                        ).toLocaleDateString(
                          'en-IN'
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complaints */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '14px'
              }}>
                📋 Floor Complaints
              </h2>
              {floorData.complaints
                .length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{
                    fontSize: '32px'
                  }}>
                    ✅
                  </div>
                  <p style={{
                    fontSize: '13px',
                    marginTop: '8px'
                  }}>
                    No pending complaints!
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {floorData.complaints
                    .slice(0, 5)
                    .map((c, i) => (
                    <div key={i} style={{
                      padding: '10px 12px',
                      background: '#FFFBEB',
                      borderRadius: '10px',
                      borderLeft:
                        `3px solid ${
                          c.priority === 'high'
                            ? '#DC2626'
                            : '#D97706'
                        }`,
                      fontSize: '12px'
                    }}>
                      <p style={{
                        fontWeight: '700',
                        color: 'var(--text)'
                      }}>
                        {c.title}
                      </p>
                      <p style={{
                        color:
                          'var(--text-muted)',
                        marginTop: '2px'
                      }}>
                        {c.student?.name} •
                        Room {c.roomNumber}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}