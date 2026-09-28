import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from
  '../../context/AuthContext'
import Loader from '../../components/Loader'

export default function MyCurfew() {
  const { user } = useAuth()
  const [violations, setViolations] =
    useState([])
  const [settings, setSettings] =
    useState(null)
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [violationsRes, settingsRes] =
        await Promise.all([
          api.get('/curfew/my-violations'),
          api.get('/curfew/settings')
        ])
      setViolations(
        violationsRes.data.data.violations
      )
      setSettings(settingsRes.data.data)
    } catch {}
    finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Loader text="Loading curfew info..." />
  )

  const totalViolations =
    violationsRes?.data?.data?.total ||
    violations.length

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
          🌙 Curfew Info
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          Your curfew status and violations
        </p>
      </div>

      {/* Curfew Times */}
      {settings && (
        <div style={{
          background:
            'linear-gradient(135deg, #1a3c5e, #2d5f8a)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '16px',
            fontFamily: 'Space Grotesk'
          }}>
            🌙 Current Curfew Times
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div style={{
              background:
                'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '12px',
                opacity: 0.7,
                marginBottom: '6px'
              }}>
                📅 Weekdays (Mon-Fri)
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                fontFamily: 'Space Grotesk'
              }}>
                {settings.weekdayTime}
              </div>
            </div>
            <div style={{
              background:
                'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '12px',
                opacity: 0.7,
                marginBottom: '6px'
              }}>
                🎉 Weekends (Sat-Sun)
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                fontFamily: 'Space Grotesk'
              }}>
                {settings.weekendTime}
              </div>
            </div>
          </div>
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            opacity: 0.8,
            textAlign: 'center'
          }}>
            ⏱️ Grace period:{' '}
            {settings.gracePeriod} minutes
            after curfew time
          </div>
        </div>
      )}

      {/* Violation Count */}
      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '20px'
      }}
        className="grid-3">
        <div className="card"
          style={{
            padding: '16px',
            textAlign: 'center',
            background:
              user?.curfewViolations >= 3
                ? '#FFF5F5' : 'white',
            border:
              user?.curfewViolations >= 3
                ? '1px solid #FECACA'
                : '1px solid var(--border)'
          }}>
          <div style={{ fontSize: '28px' }}>
            {user?.curfewViolations >= 5
              ? '🚨'
              : user?.curfewViolations >= 3
              ? '⚠️'
              : '✅'}
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '800',
            color:
              user?.curfewViolations >= 3
                ? '#DC2626'
                : '#16A34A',
            fontFamily: 'Space Grotesk',
            marginTop: '6px'
          }}>
            {user?.curfewViolations || 0}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            Total Violations
          </div>
        </div>

        <div className="card"
          style={{
            padding: '16px',
            textAlign: 'center'
          }}>
          <div style={{ fontSize: '28px' }}>
            ⏳
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#D97706',
            fontFamily: 'Space Grotesk',
            marginTop: '6px'
          }}>
            {violations.filter(v =>
              v.status === 'pending'
            ).length}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            Pending Review
          </div>
        </div>

        <div className="card"
          style={{
            padding: '16px',
            textAlign: 'center'
          }}>
          <div style={{ fontSize: '28px' }}>
            🏠
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '800',
            color:
              user?.currentStatus === 'inside'
                ? '#16A34A'
                : '#DC2626',
            fontFamily: 'Space Grotesk',
            marginTop: '6px'
          }}>
            {user?.currentStatus === 'inside'
              ? 'IN'
              : 'OUT'}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            Current Status
          </div>
        </div>
      </div>

      {/* Alert if many violations */}
      {(user?.curfewViolations || 0) >= 3 && (
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '20px'
        }}>
          <p style={{
            fontWeight: '700',
            color: '#DC2626',
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            ⚠️ Warning!
          </p>
          <p style={{
            fontSize: '13px',
            color: '#DC2626',
            opacity: 0.9
          }}>
            You have{' '}
            {user?.curfewViolations}{' '}
            curfew violations. Further
            violations may result in
            disciplinary action and
            parent notification.
            Please return before curfew!
          </p>
        </div>
      )}

      {/* Violation List */}
      <h2 style={{
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '12px'
      }}>
        📋 My Violations
      </h2>

      {violations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '48px' }}>
            🌟
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '12px'
          }}>
            No violations! Great job! 🎉
          </p>
          <p style={{
            fontSize: '13px',
            marginTop: '6px'
          }}>
            Keep returning before curfew!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {violations.map((v, i) => (
            <div key={v._id} className="card"
              style={{
                padding: '14px 16px',
                borderLeft:
                  `4px solid ${
                    v.status === 'excused'
                      ? '#16A34A'
                      : v.status === 'actioned'
                      ? '#7C3AED'
                      : '#DC2626'
                  }`
              }}>
              <div style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontSize: '16px'
                    }}>
                      🌙
                    </span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '14px',
                      color: '#DC2626'
                    }}>
                      {v.minutesLate} min late
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background:
                        v.status === 'excused'
                          ? '#DCFCE7'
                          : v.status ===
                            'actioned'
                          ? '#F3E8FF'
                          : v.status ===
                            'warned'
                          ? '#DBEAFE'
                          : '#FEF3C7',
                      color:
                        v.status === 'excused'
                          ? '#16A34A'
                          : v.status ===
                            'actioned'
                          ? '#7C3AED'
                          : v.status ===
                            'warned'
                          ? '#2563EB'
                          : '#D97706'
                    }}>
                      {v.status === 'pending'
                        ? '⏳ Pending'
                        : v.status === 'warned'
                        ? '⚠️ Warned'
                        : v.status ===
                          'actioned'
                        ? '🎯 Actioned'
                        : '✓ Excused'}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}>
                    Entry at:{' '}
                    {new Date(v.entryTime)
                      .toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    {' • '}Curfew was:{' '}
                    {v.curfewTime}
                  </p>
                  {v.actionTaken && (
                    <p style={{
                      fontSize: '12px',
                      color: '#7C3AED',
                      marginTop: '4px',
                      fontWeight: '600'
                    }}>
                      🎯 {v.actionTaken}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}