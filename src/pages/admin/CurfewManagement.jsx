import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const DAYS = [
  'Sun', 'Mon', 'Tue',
  'Wed', 'Thu', 'Fri', 'Sat'
]

const WARNING_STYLES = {
  1: {
    label: '⚠️ Warning',
    bg: '#FEF3C7',
    color: '#D97706'
  },
  2: {
    label: '🔴 Notice',
    bg: '#FEE2E2',
    color: '#DC2626'
  },
  3: {
    label: '🚨 Action',
    bg: '#F3E8FF',
    color: '#7C3AED'
  }
}

const STATUS_STYLES = {
  pending: {
    bg: '#FEF3C7',
    color: '#D97706',
    label: '⏳ Pending'
  },
  warned: {
    bg: '#DBEAFE',
    color: '#2563EB',
    label: '⚠️ Warned'
  },
  actioned: {
    bg: '#DCFCE7',
    color: '#16A34A',
    label: '✅ Actioned'
  },
  excused: {
    bg: '#F1F5F9',
    color: '#64748B',
    label: '✓ Excused'
  }
}

export default function CurfewManagement() {
  const [settings, setSettings] =
    useState(null)
  const [violations, setViolations] =
    useState([])
  const [analytics, setAnalytics] =
    useState(null)
  const [loading, setLoading] =
    useState(true)
  const [activeTab, setActiveTab] =
    useState('violations')
  const [filterStatus, setFilterStatus] =
    useState('')
  const [showSettings, setShowSettings] =
    useState(false)
  const [showAction, setShowAction] =
    useState(false)
  const [selectedViolation, setSelectedViolation] =
    useState(null)
  const [settingsForm, setSettingsForm] =
    useState({
      weekdayTime: '22:00',
      weekendTime: '23:00',
      gracePeriod: 15,
      parentAlertAfter: 3,
      strictMode: false,
      isActive: true
    })
  const [actionForm, setActionForm] =
    useState({
      status: 'warned',
      actionTaken: '',
      remarks: ''
    })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filterStatus])

  const fetchData = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus

      const [settingsRes,
        violationsRes,
        analyticsRes] =
        await Promise.all([
          api.get('/curfew/settings'),
          api.get('/curfew/violations',
            { params }),
          api.get('/curfew/analytics')
        ])

      setSettings(settingsRes.data.data)
      setSettingsForm(settingsRes.data.data)
      setViolations(
        violationsRes.data.data.violations
      )
      setAnalytics(analyticsRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(
        '/curfew/settings',
        settingsForm
      )
      toast.success(
        'Curfew settings saved! ✅'
      )
      setShowSettings(false)
      fetchData()
    } catch {
      toast.error('Failed!')
    } finally {
      setSaving(false)
    }
  }

  const handleAction = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(
        `/curfew/violations/${selectedViolation._id}/action`,
        actionForm
      )
      toast.success('Action recorded! ✅')
      setShowAction(false)
      fetchData()
    } catch {
      toast.error('Failed!')
    } finally {
      setSaving(false)
    }
  }

  const handleParentNotify = async (
    violationId
  ) => {
    try {
      await api.patch(
        `/curfew/violations/${violationId}/notify-parent`
      )
      toast.success(
        'Parent notification recorded! 📱'
      )
      fetchData()
    } catch {
      toast.error('Failed!')
    }
  }

  if (loading) return (
    <Loader text="Loading curfew data..." />
  )

  // Chart data for day of week:
  const dayData = DAYS.map((day, i) => {
    const found = analytics?.byDayOfWeek
      ?.find(d => d._id === i + 1)
    return {
      day,
      count: found?.count || 0
    }
  })

  const maxCount = Math.max(
    ...dayData.map(d => d.count), 1
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
            🌙 Curfew Management
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            Track and manage late entries
          </p>
        </div>
        <button
          onClick={() =>
            setShowSettings(true)}
          className="btn-primary"
        >
          ⚙️ Curfew Settings
        </button>
      </div>

      {/* Current Settings Banner */}
      {settings && (
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
              label: 'Weekday Curfew',
              value: settings.weekdayTime,
              icon: '📅'
            },
            {
              label: 'Weekend Curfew',
              value: settings.weekendTime,
              icon: '🎉'
            },
            {
              label: 'Grace Period',
              value: `${settings.gracePeriod} min`,
              icon: '⏱️'
            },
            {
              label: 'Status',
              value: settings.isActive
                ? 'Active ✅'
                : 'Disabled ❌',
              icon: '🔔'
            },
          ].map((item, i) => (
            <div key={i}
              style={{
                textAlign: 'center'
              }}>
              <div style={{
                fontSize: '22px',
                marginBottom: '4px'
              }}>
                {item.icon}
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                fontFamily: 'Space Grotesk'
              }}>
                {item.value}
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.7,
                marginTop: '2px'
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '20px'
      }}
        className="grid-4">
        {[
          {
            label: 'Total Violations',
            value: analytics
              ?.totalViolations || 0,
            icon: '📊',
            bg: '#EFF6FF',
            color: '#1a3c5e'
          },
          {
            label: 'Pending Action',
            value: analytics
              ?.pendingViolations || 0,
            icon: '⏳',
            bg: '#FEF3C7',
            color: '#D97706'
          },
          {
            label: 'Today Violations',
            value: violations.filter(v => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return new Date(v.createdAt)
                >= today
            }).length,
            icon: '📅',
            bg: '#FEE2E2',
            color: '#DC2626'
          },
          {
            label: 'Parents Notified',
            value: analytics
              ?.parentNotified || 0,
            icon: '📱',
            bg: '#DCFCE7',
            color: '#16A34A'
          },
        ].map((card, i) => (
          <div key={i} className="card"
            style={{ padding: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              marginBottom: '10px'
            }}>
              {card.icon}
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: '800',
              color: card.color,
              fontFamily: 'Space Grotesk'
            }}>
              {card.value}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '4px'
            }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: 'violations',
            label: '⚠️ Violations' },
          { value: 'analytics',
            label: '📊 Analytics' },
          { value: 'top',
            label: '🏆 Top Violators' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() =>
              setActiveTab(tab.value)}
            style={{
              padding: '8px 16px',
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

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div>
          {/* Filter */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            {['', 'pending', 'warned',
              'actioned', 'excused']
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
          </div>

          {violations.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                🌙
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '12px'
              }}>
                No curfew violations! 🎉
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {violations.map(v => {
                const warnStyle =
                  WARNING_STYLES[
                    v.warningLevel
                  ] || WARNING_STYLES[1]
                const statusStyle =
                  STATUS_STYLES[v.status] ||
                  STATUS_STYLES.pending

                return (
                  <div key={v._id}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      borderLeft:
                        `4px solid ${warnStyle.color}`
                    }}>
                    <div style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      {/* Student Info */}
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background:
                              warnStyle.bg,
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            fontWeight: '800',
                            fontSize: '14px',
                            color:
                              warnStyle.color,
                            flexShrink: 0
                          }}>
                            {v.student?.name?.[0]
                              ?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{
                              fontWeight: '700',
                              fontSize: '15px',
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
                              {v.student
                                ?.roomNumber
                                || '—'} •{' '}
                              {v.student
                                ?.course || '—'}
                            </p>
                          </div>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background:
                              warnStyle.bg,
                            color:
                              warnStyle.color
                          }}>
                            {warnStyle.label}
                          </span>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background:
                              statusStyle.bg,
                            color:
                              statusStyle.color
                          }}>
                            {statusStyle.label}
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '12px',
                          color:
                            'var(--text-muted)',
                          flexWrap: 'wrap'
                        }}>
                          <span>
                            🕐 Entry:{' '}
                            {new Date(
                              v.entryTime
                            ).toLocaleString(
                              'en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short'
                              }
                            )}
                          </span>
                          <span style={{
                            color: '#DC2626',
                            fontWeight: '700'
                          }}>
                            ⏰ {v.minutesLate}{' '}
                            min late
                          </span>
                          <span>
                            Curfew:{' '}
                            {v.curfewTime}
                          </span>
                          <span style={{
                            textTransform:
                              'capitalize'
                          }}>
                            📅 {v.dayType}
                          </span>
                          <span>
                            Total:{' '}
                            {v.student
                              ?.curfewViolations
                              || 0} violations
                          </span>
                        </div>

                        {v.parentNotified && (
                          <div style={{
                            marginTop: '6px',
                            fontSize: '11px',
                            color: '#16A34A',
                            fontWeight: '600'
                          }}>
                            ✅ Parent notified on{' '}
                            {new Date(
                              v.parentNotifiedAt
                            ).toLocaleDateString(
                              'en-IN'
                            )}
                          </div>
                        )}

                        {v.actionTaken && (
                          <div style={{
                            marginTop: '6px',
                            fontSize: '11px',
                            color: '#7C3AED',
                            fontWeight: '600'
                          }}>
                            🎯 Action:{' '}
                            {v.actionTaken}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        alignItems: 'flex-end'
                      }}>
                        {v.status ===
                          'pending' && (
                          <button
                            onClick={() => {
                              setSelectedViolation(
                                v
                              )
                              setActionForm({
                                status: 'warned',
                                actionTaken: '',
                                remarks: ''
                              })
                              setShowAction(
                                true
                              )
                            }}
                            className="btn-primary"
                            style={{
                              padding:
                                '6px 14px',
                              fontSize: '12px'
                            }}
                          >
                            🎯 Take Action
                          </button>
                        )}

                        {!v.parentNotified &&
                          v.student
                            ?.parentPhone && (
                          <button
                            onClick={() =>
                              handleParentNotify(
                                v._id
                              )}
                            style={{
                              padding:
                                '6px 14px',
                              background:
                                '#DCFCE7',
                              color: '#16A34A',
                              border:
                                '1px solid #BBF7D0',
                              borderRadius:
                                '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace:
                                'nowrap'
                            }}
                          >
                            📱 Notify Parent
                          </button>
                        )}

                        {v.student
                          ?.parentPhone && (
                          <span style={{
                            fontSize: '11px',
                            color:
                              'var(--text-muted)'
                          }}>
                            Parent:{' '}
                            {v.student
                              .parentPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Day of week chart */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--text)'
            }}>
              📅 Violations by Day of Week
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              height: '160px'
            }}>
              {dayData.map((d, i) => (
                <div key={i} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--primary)'
                  }}>
                    {d.count > 0
                      ? d.count : ''}
                  </span>
                  <div style={{
                    width: '100%',
                    height: `${Math.max(
                      (d.count / maxCount)
                      * 120, d.count > 0
                        ? 8 : 0
                    )}px`,
                    background:
                      i === 0 || i === 6
                        ? '#10b981'
                        : 'var(--primary)',
                    borderRadius:
                      '6px 6px 0 0',
                    transition:
                      'height 0.3s ease',
                    minHeight:
                      d.count > 0 ? '4px' : '0'
                  }} />
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontWeight: '600'
                  }}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              🟢 Green = Weekend (later curfew)
            </p>
          </div>

          {/* Weekly trend */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              📈 Last 7 Days Trend
            </h2>
            {analytics?.weeklyTrend
              ?.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                padding: '20px'
              }}>
                No violations in last 7 days!
                🎉
              </p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {analytics?.weeklyTrend
                  ?.map((day, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      width: '80px',
                      flexShrink: 0
                    }}>
                      {new Date(day._id)
                        .toLocaleDateString(
                          'en-IN', {
                            day: 'numeric',
                            month: 'short'
                          }
                        )}
                    </span>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      background: '#F1F5F9',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(
                          (day.count /
                            Math.max(
                              ...analytics
                                .weeklyTrend
                                .map(d => d.count)
                            )) * 100,
                          100
                        )}%`,
                        background: '#DC2626',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#DC2626',
                      width: '24px',
                      textAlign: 'right'
                    }}>
                      {day.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Violators Tab */}
      {activeTab === 'top' && (
        <div>
          {analytics?.topViolators
            ?.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                🏆
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '12px'
              }}>
                No repeat violators!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {analytics?.topViolators
                ?.map((v, i) => (
                <div key={i} className="card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    borderLeft:
                      `4px solid ${
                        i === 0
                          ? '#DC2626'
                          : i === 1
                          ? '#D97706'
                          : i === 2
                          ? '#16A34A'
                          : 'var(--border)'
                      }`
                  }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background:
                        i === 0
                          ? '#FEE2E2'
                          : i === 1
                          ? '#FEF3C7'
                          : '#DCFCE7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'center',
                      fontWeight: '800',
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      {i === 0 ? '🥇'
                        : i === 1 ? '🥈'
                        : i === 2 ? '🥉'
                        : `#${i + 1}`}
                    </div>
                    <div>
                      <p style={{
                        fontWeight: '700',
                        fontSize: '14px',
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
                        {v.student
                          ?.roomNumber || '—'} •{' '}
                        Avg {v.avgMinutesLate}
                        min late
                      </p>
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '22px',
                      fontWeight: '800',
                      color: i === 0
                        ? '#DC2626'
                        : i === 1
                        ? '#D97706'
                        : 'var(--text)',
                      fontFamily:
                        'Space Grotesk'
                    }}>
                      {v.totalViolations}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)'
                    }}>
                      violations
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '460px',
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
                ⚙️ Curfew Settings
              </h2>
              <button
                onClick={() =>
                  setShowSettings(false)}
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

            <form
              onSubmit={handleSaveSettings}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
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
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Weekday Curfew *
                  </label>
                  <input
                    type="time"
                    value={
                      settingsForm.weekdayTime
                    }
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        weekdayTime:
                          e.target.value
                      })}
                    className="input"
                  />
                  <p style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    marginTop: '3px'
                  }}>
                    Mon-Fri curfew time
                  </p>
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
                    Weekend Curfew *
                  </label>
                  <input
                    type="time"
                    value={
                      settingsForm.weekendTime
                    }
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        weekendTime:
                          e.target.value
                      })}
                    className="input"
                  />
                  <p style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    marginTop: '3px'
                  }}>
                    Sat-Sun curfew time
                  </p>
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
                    Grace Period (min)
                  </label>
                  <input
                    type="number"
                    value={
                      settingsForm.gracePeriod
                    }
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        gracePeriod: parseInt(
                          e.target.value
                        )
                      })}
                    min="0"
                    max="60"
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
                    Parent Alert After
                  </label>
                  <input
                    type="number"
                    value={
                      settingsForm
                        .parentAlertAfter
                    }
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        parentAlertAfter:
                          parseInt(e.target.value)
                      })}
                    min="1"
                    max="10"
                    className="input"
                  />
                  <p style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    marginTop: '3px'
                  }}>
                    Violations before alert
                  </p>
                </div>
              </div>

              {/* Toggles */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {[
                  {
                    key: 'isActive',
                    label: '🔔 Curfew Active',
                    desc: 'Enable curfew tracking system'
                  },
                  {
                    key: 'strictMode',
                    label: '🔒 Strict Mode',
                    desc: 'Block entry after curfew + grace period'
                  },
                ].map(item => (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}>
                    <input
                      type="checkbox"
                      checked={
                        settingsForm[item.key]
                      }
                      onChange={e =>
                        setSettingsForm({
                          ...settingsForm,
                          [item.key]:
                            e.target.checked
                        })}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor:
                          'var(--primary)'
                      }}
                    />
                    <div>
                      <p style={{
                        fontWeight: '700',
                        fontSize: '13px',
                        color: 'var(--text)'
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color:
                          'var(--text-muted)'
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setShowSettings(false)}
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
                  disabled={saving}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving
                    ? '⏳ Saving...'
                    : '💾 Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showAction && selectedViolation && (
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
                🎯 Take Action
              </h2>
              <button
                onClick={() =>
                  setShowAction(false)}
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

            {/* Violation info */}
            <div style={{
              background: '#FFF5F5',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '4px'
              }}>
                {selectedViolation
                  .student?.name}
              </p>
              <p style={{
                fontSize: '13px',
                color: '#DC2626',
                fontWeight: '600'
              }}>
                ⏰ {selectedViolation
                  .minutesLate} minutes late
                •{' '}
                {new Date(
                  selectedViolation.entryTime
                ).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '4px'
              }}>
                Total violations:{' '}
                {selectedViolation.student
                  ?.curfewViolations || 0}
              </p>
            </div>

            <form onSubmit={handleAction}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              {/* Status */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Action Type
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(3, 1fr)',
                  gap: '6px'
                }}>
                  {[
                    {
                      value: 'warned',
                      label: '⚠️ Warn'
                    },
                    {
                      value: 'actioned',
                      label: '🎯 Action'
                    },
                    {
                      value: 'excused',
                      label: '✓ Excuse'
                    },
                  ].map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() =>
                        setActionForm({
                          ...actionForm,
                          status: s.value
                        })}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          actionForm.status
                            === s.value
                            ? STATUS_STYLES[
                                s.value
                              ]?.color
                            : '#F1F5F9',
                        color:
                          actionForm.status
                            === s.value
                            ? 'white'
                            : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
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
                  Action Description
                </label>
                <input
                  type="text"
                  value={actionForm.actionTaken}
                  onChange={e =>
                    setActionForm({
                      ...actionForm,
                      actionTaken: e.target.value
                    })}
                  placeholder="e.g. Written warning given, Parent called..."
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
                  Remarks
                </label>
                <textarea
                  value={actionForm.remarks}
                  onChange={e =>
                    setActionForm({
                      ...actionForm,
                      remarks: e.target.value
                    })}
                  placeholder="Additional notes..."
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
                  type="button"
                  onClick={() =>
                    setShowAction(false)}
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
                  disabled={saving}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving
                    ? '⏳ Saving...'
                    : '✅ Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}