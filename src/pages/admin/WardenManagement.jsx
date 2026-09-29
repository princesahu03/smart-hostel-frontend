import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const WARDEN_LEVELS = {
  chief_warden: {
    label: 'Chief Warden',
    icon: '👑',
    color: '#D97706',
    bg: '#FEF3C7'
  },
  hostel_warden: {
    label: 'Hostel Warden',
    icon: '🏠',
    color: '#2563EB',
    bg: '#DBEAFE'
  },
  floor_warden: {
    label: 'Floor Warden',
    icon: '🎖️',
    color: '#7C3AED',
    bg: '#F3E8FF'
  }
}

export default function WardenManagement() {
  const [teachers, setTeachers] =
    useState([])
  const [hierarchy, setHierarchy] =
    useState(null)
  const [loading, setLoading] =
    useState(true)
  const [showAssign, setShowAssign] =
    useState(false)
  const [selected, setSelected] =
    useState(null)
  const [assignForm, setAssignForm] =
    useState({
      assignedFloor: '',
      wardenLevel: 'floor_warden',
      designation: ''
    })
  const [activeTab, setActiveTab] =
    useState('hierarchy')
  const [saving, setSaving] =
    useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [teachersRes, hierarchyRes] =
        await Promise.all([
          api.get('/teachers/all'),
          api.get('/teachers/hierarchy')
        ])
      setTeachers(teachersRes.data.data)
      setHierarchy(hierarchyRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(
        `/teachers/${selected._id}/assign-floor`,
        assignForm
      )
      toast.success('Floor assigned! ✅')
      setShowAssign(false)
      fetchData()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <Loader text="Loading teachers..." />
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
            👨‍🏫 Warden Management
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {teachers.length} teachers •
            Floor warden assignment
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {[
          { value: 'hierarchy',
            label: '🏛️ Hierarchy' },
          { value: 'teachers',
            label: '👨‍🏫 All Teachers' },
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

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Chief Warden */}
          {hierarchy?.chiefWarden
            .length > 0 && (
            <div>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#D97706',
                marginBottom: '10px'
              }}>
                👑 Chief Warden
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '12px'
              }}>
                {hierarchy.chiefWarden
                  .map(w => (
                  <div key={w._id}
                    className="card"
                    style={{
                      padding: '16px',
                      borderLeft:
                        '4px solid #D97706'
                    }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: '#FEF3C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'center',
                        fontSize: '22px'
                      }}>
                        👑
                      </div>
                      <div>
                        <p style={{
                          fontWeight: '700',
                          fontSize: '15px',
                          color: 'var(--text)'
                        }}>
                          {w.name}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color:
                            'var(--text-muted)'
                        }}>
                          {w.designation
                            || 'Chief Warden'}
                        </p>
                        <p style={{
                          fontSize: '11px',
                          color: '#D97706',
                          fontWeight: '600'
                        }}>
                          {w.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hostel Wardens */}
          {hierarchy?.hostelWardens
            .length > 0 && (
            <div>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#2563EB',
                marginBottom: '10px'
              }}>
                🏠 Hostel Wardens
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '12px'
              }}>
                {hierarchy.hostelWardens
                  .map(w => (
                  <div key={w._id}
                    className="card"
                    style={{
                      padding: '16px',
                      borderLeft:
                        '4px solid #2563EB'
                    }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: '#DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'center',
                        fontSize: '22px'
                      }}>
                        🏠
                      </div>
                      <div>
                        <p style={{
                          fontWeight: '700',
                          fontSize: '15px',
                          color: 'var(--text)'
                        }}>
                          {w.name}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color:
                            'var(--text-muted)'
                        }}>
                          {w.designation
                            || 'Hostel Warden'}
                        </p>
                        <p style={{
                          fontSize: '11px',
                          color: '#2563EB',
                          fontWeight: '600'
                        }}>
                          📞 {w.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floor Wardens */}
          {hierarchy?.floorWardens
            .length > 0 && (
            <div>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#7C3AED',
                marginBottom: '10px'
              }}>
                🎖️ Floor Wardens
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '12px'
              }}>
                {hierarchy.floorWardens
                  .map(w => (
                  <div key={w._id}
                    className="card"
                    style={{
                      padding: '14px',
                      borderLeft:
                        '4px solid #7C3AED'
                    }}>
                    <div style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div>
                        <p style={{
                          fontWeight: '700',
                          fontSize: '14px',
                          color: 'var(--text)'
                        }}>
                          {w.name}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color:
                            'var(--text-muted)',
                          marginTop: '2px'
                        }}>
                          {w.designation}
                        </p>
                        {w.officeHours && (
                          <p style={{
                            fontSize: '11px',
                            color: '#7C3AED',
                            marginTop: '4px'
                          }}>
                            🕐 {w.officeHours}
                          </p>
                        )}
                      </div>
                      {w.assignedFloor && (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background: '#F3E8FF',
                          color: '#7C3AED',
                          fontSize: '12px',
                          fontWeight: '800',
                          whiteSpace: 'nowrap'
                        }}>
                          Floor{' '}
                          {w.assignedFloor}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hierarchy?.total === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                👨‍🏫
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '12px'
              }}>
                No wardens assigned yet!
              </p>
              <p style={{
                fontSize: '13px',
                marginTop: '6px'
              }}>
                Add teachers and assign
                warden levels from the
                Teachers tab.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <div>
          {teachers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                👨‍🏫
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '12px'
              }}>
                No teachers added yet!
              </p>
              <p style={{
                fontSize: '13px',
                marginTop: '6px'
              }}>
                Add teachers from
                Students → Add User page
                with role: teacher
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {teachers.map(t => {
                const level = t.wardenLevel
                  ? WARDEN_LEVELS[
                      t.wardenLevel
                    ]
                  : null

                return (
                  <div key={t._id}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      borderLeft:
                        `4px solid ${
                          level?.color
                          || '#E2E8F0'
                        }`
                    }}>
                    <div style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background:
                            level?.bg || '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'center',
                          fontSize: '20px',
                          flexShrink: 0
                        }}>
                          {level?.icon || '👨‍🏫'}
                        </div>
                        <div>
                          <p style={{
                            fontWeight: '700',
                            fontSize: '15px',
                            color: 'var(--text)'
                          }}>
                            {t.name}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color:
                              'var(--text-muted)'
                          }}>
                            {t.email} •{' '}
                            {t.designation
                              || 'No designation'}
                          </p>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '4px',
                            flexWrap: 'wrap'
                          }}>
                            {level && (
                              <span style={{
                                padding:
                                  '2px 8px',
                                borderRadius:
                                  '20px',
                                fontSize: '11px',
                                fontWeight: '700',
                                background:
                                  level.bg,
                                color:
                                  level.color
                              }}>
                                {level.icon}{' '}
                                {level.label}
                              </span>
                            )}
                            {t.assignedFloor && (
                              <span style={{
                                padding:
                                  '2px 8px',
                                borderRadius:
                                  '20px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background:
                                  '#F3E8FF',
                                color: '#7C3AED'
                              }}>
                                Floor{' '}
                                {t.assignedFloor}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelected(t)
                          setAssignForm({
                            assignedFloor:
                              t.assignedFloor
                              || '',
                            wardenLevel:
                              t.wardenLevel
                              || 'floor_warden',
                            designation:
                              t.designation
                              || ''
                          })
                          setShowAssign(true)
                        }}
                        style={{
                          padding: '7px 16px',
                          background: '#EFF6FF',
                          color: 'var(--primary)',
                          border:
                            '1px solid #BFDBFE',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        🎖️ Assign Floor
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Assign Floor Modal */}
      {showAssign && selected && (
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
                🎖️ Assign Floor
              </h2>
              <button
                onClick={() =>
                  setShowAssign(false)}
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

            {/* Teacher info */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontWeight: '700',
                fontSize: '15px'
              }}>
                👨‍🏫 {selected.name}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '2px'
              }}>
                {selected.email}
              </p>
            </div>

            <form onSubmit={handleAssign}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              {/* Warden Level */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Warden Level
                </label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {Object.entries(
                    WARDEN_LEVELS
                  ).map(([key, level]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setAssignForm({
                          ...assignForm,
                          wardenLevel: key
                        })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          assignForm
                            .wardenLevel === key
                            ? level.bg
                            : 'white',
                        color:
                          assignForm
                            .wardenLevel === key
                            ? level.color
                            : 'var(--text-muted)',
                        border:
                          assignForm
                            .wardenLevel === key
                            ? `1.5px solid ${level.color}`
                            : '1.5px solid var(--border)',
                        textAlign: 'left'
                      }}
                    >
                      {level.icon}{' '}
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floor Number */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Floor Number
                </label>
                <input
                  type="number"
                  value={assignForm.assignedFloor}
                  onChange={e =>
                    setAssignForm({
                      ...assignForm,
                      assignedFloor:
                        e.target.value
                    })}
                  placeholder="e.g. 1, 2, 3"
                  className="input"
                  min="1"
                  max="10"
                />
                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '3px'
                }}>
                  Leave empty for
                  chief/hostel warden
                </p>
              </div>

              {/* Designation */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Designation
                </label>
                <input
                  type="text"
                  value={assignForm.designation}
                  onChange={e =>
                    setAssignForm({
                      ...assignForm,
                      designation:
                        e.target.value
                    })}
                  placeholder="e.g. Assistant Professor"
                  className="input"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setShowAssign(false)}
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
                    : '🎖️ Assign Floor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}