import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function FloorManagement() {
  const [floorData, setFloorData] =
    useState(null)
  const [activity, setActivity] =
    useState(null)
  const [loading, setLoading] =
    useState(true)
  const [activeTab, setActiveTab] =
    useState('rooms')
  const [noFloor, setNoFloor] =
    useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [floorRes, activityRes] =
        await Promise.all([
          api.get('/teachers/floor-data'),
          api.get('/teachers/floor-activity')
        ])
      setFloorData(floorRes.data.data)
      setActivity(activityRes.data.data)
    } catch (err) {
      if (err.response?.status === 400) {
        setNoFloor(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Loader text="Loading floor..." />
  )

  if (noFloor) return (
    <div style={{
      textAlign: 'center',
      padding: '80px',
      color: 'var(--text-muted)'
    }}>
      <div style={{ fontSize: '56px' }}>
        🏠
      </div>
      <p style={{
        fontSize: '18px',
        fontWeight: '700',
        marginTop: '16px',
        color: 'var(--text)'
      }}>
        No Floor Assigned
      </p>
      <p style={{
        fontSize: '14px',
        marginTop: '8px'
      }}>
        Ask admin to assign
        a floor to you!
      </p>
    </div>
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
          🏠 Floor {floorData?.floor}{' '}
          Management
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          {floorData?.stats.totalStudents}{' '}
          students •{' '}
          {floorData?.stats.totalRooms}{' '}
          rooms
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '20px'
      }}
        className="grid-4">
        {[
          {
            label: 'Inside',
            value: floorData?.stats
              .insideCount,
            icon: '🏠',
            color: '#16A34A'
          },
          {
            label: 'Outside',
            value: floorData?.stats
              .outsideCount,
            icon: '🚶',
            color: '#DC2626'
          },
          {
            label: 'Late Today',
            value: activity?.lateEntries
              .length || 0,
            icon: '⚠️',
            color: '#D97706'
          },
          {
            label: 'Available Rooms',
            value: floorData?.stats
              .availableRooms,
            icon: '🚪',
            color: '#2563EB'
          },
        ].map((s, i) => (
          <div key={i} className="card"
            style={{
              padding: '14px',
              textAlign: 'center'
            }}>
            <span style={{
              fontSize: '22px'
            }}>
              {s.icon}
            </span>
            <div style={{
              fontSize: '24px',
              fontWeight: '800',
              color: s.color,
              fontFamily: 'Space Grotesk',
              marginTop: '4px'
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}>
              {s.label}
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
          { value: 'rooms',
            label: '🏠 Rooms' },
          { value: 'students',
            label: '🎓 Students' },
          { value: 'activity',
            label: '📊 Activity' },
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

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          {floorData?.rooms.map(room => {
            const occupancy =
              room.occupants.length
            const pct = Math.round(
              (occupancy / room.capacity)
              * 100
            )

            return (
              <div key={room._id}
                className="card"
                style={{ padding: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <h3 style={{
                    fontWeight: '800',
                    fontSize: '18px',
                    color: 'var(--primary)',
                    fontFamily:
                      'Space Grotesk'
                  }}>
                    Room {room.roomNumber}
                  </h3>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background:
                      room.status === 'full'
                        ? '#FEE2E2'
                        : room.status ===
                          'maintenance'
                        ? '#FEF3C7'
                        : '#DCFCE7',
                    color:
                      room.status === 'full'
                        ? '#DC2626'
                        : room.status ===
                          'maintenance'
                        ? '#D97706'
                        : '#16A34A',
                    textTransform:
                      'capitalize'
                  }}>
                    {room.status}
                  </span>
                </div>

                {/* Occupancy bar */}
                <div style={{
                  marginBottom: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '4px'
                  }}>
                    <span>Occupancy</span>
                    <span>
                      {occupancy}/
                      {room.capacity}
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    background: '#F1F5F9',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background:
                        pct === 100
                          ? '#DC2626'
                          : pct > 60
                          ? '#D97706'
                          : '#16A34A',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>

                {/* Occupants */}
                {room.occupants.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {room.occupants.map(
                      (occ, i) => (
                      <div key={i} style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        background: '#F8FAFC',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent:
                          'space-between'
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: 'var(--text)'
                        }}>
                          {occ.name}
                        </span>
                        <span style={{
                          color:
                            'var(--text-muted)'
                        }}>
                          {occ.course}
                          {' '}Y{occ.year}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic'
                  }}>
                    Empty room
                  </p>
                )}

                {/* Amenities */}
                {room.amenities?.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap'
                  }}>
                    {room.amenities.map(
                      (a, i) => (
                      <span key={i} style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#EFF6FF',
                        color: 'var(--primary)',
                        borderRadius: '4px'
                      }}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="card"
          style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px'
            }}>
              <thead>
                <tr style={{
                  background: '#F8FAFC',
                  borderBottom:
                    '1px solid var(--border)'
                }}>
                  {['Student', 'Room',
                    'Course', 'Contact',
                    'Status', 'Violations']
                    .map(h => (
                    <th key={h} style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      color:
                        'var(--text-muted)',
                      fontWeight: '600',
                      fontSize: '11px',
                      textTransform:
                        'uppercase',
                      whiteSpace: 'nowrap'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {floorData?.students
                  .map(s => (
                  <tr key={s._id}
                    className="table-row"
                    style={{
                      borderBottom:
                        '1px solid var(--border)'
                    }}>
                    <td style={{
                      padding: '12px 14px'
                    }}>
                      <div style={{
                        fontWeight: '700',
                        color: 'var(--text)'
                      }}>
                        {s.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color:
                          'var(--text-muted)'
                      }}>
                        {s.studentId}
                      </div>
                    </td>
                    <td style={{
                      padding: '12px 14px',
                      fontWeight: '700',
                      color: 'var(--primary)'
                    }}>
                      {s.roomNumber || '—'}
                    </td>
                    <td style={{
                      padding: '12px 14px',
                      color: 'var(--text-muted)'
                    }}>
                      {s.course} Y{s.year}
                    </td>
                    <td style={{
                      padding: '12px 14px',
                      color: 'var(--text-muted)',
                      fontSize: '12px'
                    }}>
                      {s.phone}
                    </td>
                    <td style={{
                      padding: '12px 14px'
                    }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background:
                          s.currentStatus ===
                            'inside'
                            ? '#DCFCE7'
                            : '#FEE2E2',
                        color:
                          s.currentStatus ===
                            'inside'
                            ? '#16A34A'
                            : '#DC2626'
                      }}>
                        {s.currentStatus ===
                          'inside'
                          ? '🏠 Inside'
                          : '🚶 Outside'}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px 14px',
                      fontWeight: '700',
                      color:
                        s.curfewViolations > 0
                          ? '#DC2626'
                          : '#16A34A'
                    }}>
                      {s.curfewViolations || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Late Entries Today */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '14px'
            }}>
              ⚠️ Late Entries Today (
              {activity?.lateEntries
                .length || 0})
            </h2>
            {activity?.lateEntries
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
                  No late entries today!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {activity?.lateEntries
                  .map((e, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    background: '#FFF5F5',
                    borderRadius: '10px',
                    borderLeft:
                      '3px solid #DC2626',
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{
                        fontWeight: '700',
                        fontSize: '13px',
                        color: 'var(--text)'
                      }}>
                        {e.student?.name}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color:
                          'var(--text-muted)'
                      }}>
                        Room{' '}
                        {e.student?.roomNumber}
                      </p>
                    </div>
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <p style={{
                        fontWeight: '700',
                        color: '#DC2626',
                        fontSize: '13px'
                      }}>
                        {new Date(
                          e.scanTime
                        ).toLocaleTimeString(
                          'en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }
                        )}
                      </p>
                      <p style={{
                        fontSize: '10px',
                        color: '#DC2626'
                      }}>
                        Late entry ⚠️
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Today Entries */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '14px'
            }}>
              📋 Today's Entry/Exit Log (
              {activity?.todayEntries
                .length || 0})
            </h2>
            {activity?.todayEntries
              .length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                padding: '20px',
                fontSize: '13px'
              }}>
                No scans today!
              </p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {activity?.todayEntries
                  .map((e, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background:
                      e.isLate
                        ? '#FFF5F5'
                        : '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>
                        {e.type === 'entry'
                          ? '🏠'
                          : e.type === 'exit'
                          ? '🚶'
                          : '🍽️'}
                      </span>
                      <span style={{
                        fontWeight: '600'
                      }}>
                        {e.student?.name}
                      </span>
                      {e.isLate && (
                        <span style={{
                          color: '#DC2626',
                          fontSize: '10px',
                          fontWeight: '700'
                        }}>
                          LATE
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      <span style={{
                        textTransform:
                          'capitalize'
                      }}>
                        {e.type}
                      </span>
                      <span>
                        {new Date(e.scanTime)
                          .toLocaleTimeString(
                            'en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}