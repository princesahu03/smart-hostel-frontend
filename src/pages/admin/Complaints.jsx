import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const CATEGORY_ICONS = {
  maintenance: '🔧',
  plumbing: '🚿',
  internet: '📶',
  cleanliness: '🧹',
  mess: '🍽️',
  security: '🔐',
  electricity: '⚡',
  other: '📋'
}

const PRIORITY_STYLES = {
  high: { bg: '#FEE2E2', color: '#DC2626' },
  medium: { bg: '#FEF3C7', color: '#D97706' },
  low: { bg: '#DCFCE7', color: '#16A34A' }
}

const STATUS_STYLES = {
  pending: { bg: '#F1F5F9', color: '#64748B' },
  assigned: { bg: '#DBEAFE', color: '#2563EB' },
  in_progress: { bg: '#FEF3C7', color: '#D97706' },
  resolved: { bg: '#DCFCE7', color: '#16A34A' },
  rejected: { bg: '#FEE2E2', color: '#DC2626' },
  reopened: { bg: '#F3E8FF', color: '#7C3AED' }
}

export default function AdminComplaints() {
  const [complaints, setComplaints] =
    useState([])
  const [analytics, setAnalytics] =
    useState(null)
  const [staffList, setStaffList] =
    useState([])
  const [loading, setLoading] =
    useState(true)
  const [activeTab, setActiveTab] =
    useState('list')
  const [filterStatus, setFilterStatus] =
    useState('')
  const [filterCategory, setFilterCategory] =
    useState('')
  const [filterPriority, setFilterPriority] =
    useState('')
  const [selectedComplaint, setSelectedComplaint] =
    useState(null)
  const [showModal, setShowModal] =
    useState(false)
  const [updateForm, setUpdateForm] =
    useState({
      status: '',
      remarks: '',
      assignedTo: '',
      rejectionReason: ''
    })
  const [updating, setUpdating] =
    useState(false)

  useEffect(() => {
    fetchData()
  }, [filterStatus, filterCategory,
    filterPriority])

  const fetchData = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus
      if (filterCategory)
        params.category = filterCategory
      if (filterPriority)
        params.priority = filterPriority

      const [complaintsRes,
        analyticsRes, staffRes] =
        await Promise.all([
          api.get('/complaints/all',
            { params }),
          api.get('/complaints/analytics'),
          api.get('/auth/users',
            { params: { role: 'staff' } })
        ])

      setComplaints(
        complaintsRes.data.data.complaints
      )
      setAnalytics(analyticsRes.data.data)
      setStaffList(staffRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!updateForm.status) {
      toast.error('Select a status!')
      return
    }
    setUpdating(true)
    try {
      await api.patch(
        `/complaints/${selectedComplaint._id}/status`,
        updateForm
      )
      toast.success('Status updated! ✅')
      setShowModal(false)
      fetchData()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setUpdating(false)
    }
  }

  const openModal = (complaint) => {
    setSelectedComplaint(complaint)
    setUpdateForm({
      status: complaint.status,
      remarks: complaint.remarks || '',
      assignedTo: complaint.assignedTo
        ?._id || '',
      rejectionReason:
        complaint.rejectionReason || ''
    })
    setShowModal(true)
  }

  const isOverdue = (complaint) => {
    if (!complaint.deadline) return false
    if (['resolved', 'rejected']
        .includes(complaint.status))
      return false
    return new Date(complaint.deadline)
      < new Date()
  }

  if (loading) return (
    <Loader text="Loading complaints..." />
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
            📋 Complaint Management
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {complaints.length} complaints
            {analytics?.todayComplaints > 0 &&
              ` • ${analytics.todayComplaints} today`}
          </p>
        </div>
      </div>

      {/* Stats Row */}
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
            label: 'Total',
            value: complaints.length,
            icon: '📋',
            bg: '#EFF6FF',
            color: '#1a3c5e'
          },
          {
            label: 'Pending',
            value: analytics?.byStatus
              ?.find(s => s._id === 'pending')
              ?.count || 0,
            icon: '⏳',
            bg: '#FEF3C7',
            color: '#D97706'
          },
          {
            label: 'In Progress',
            value: analytics?.byStatus
              ?.find(s =>
                s._id === 'in_progress')
              ?.count || 0,
            icon: '🔄',
            bg: '#DBEAFE',
            color: '#2563EB'
          },
          {
            label: 'Resolved',
            value: analytics?.byStatus
              ?.find(s => s._id === 'resolved')
              ?.count || 0,
            icon: '✅',
            bg: '#DCFCE7',
            color: '#16A34A'
          },
        ].map((s, i) => (
          <div key={i} className="card"
            style={{ padding: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                fontSize: '22px'
              }}>
                {s.icon}
              </span>
              <div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: s.color,
                  fontFamily: 'Space Grotesk'
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
          { value: 'list', label: '📋 List' },
          { value: 'analytics',
            label: '📊 Analytics' },
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

      {activeTab === 'list' && (
        <div>
          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <select
              value={filterStatus}
              onChange={e =>
                setFilterStatus(e.target.value)}
              className="input"
              style={{
                width: 'auto',
                padding: '8px 14px',
                fontSize: '13px'
              }}
            >
              <option value="">All Status</option>
              {['pending', 'assigned',
                'in_progress', 'resolved',
                'rejected', 'reopened']
                .map(s => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')
                    .toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={e =>
                setFilterCategory(
                  e.target.value
                )}
              className="input"
              style={{
                width: 'auto',
                padding: '8px 14px',
                fontSize: '13px'
              }}
            >
              <option value="">
                All Categories
              </option>
              {Object.keys(CATEGORY_ICONS)
                .map(c => (
                <option key={c} value={c}>
                  {CATEGORY_ICONS[c]} {c}
                </option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={e =>
                setFilterPriority(
                  e.target.value
                )}
              className="input"
              style={{
                width: 'auto',
                padding: '8px 14px',
                fontSize: '13px'
              }}
            >
              <option value="">
                All Priority
              </option>
              <option value="high">
                🔴 High
              </option>
              <option value="medium">
                🟡 Medium
              </option>
              <option value="low">
                🟢 Low
              </option>
            </select>
          </div>

          {/* Complaints List */}
          {complaints.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                📋
              </div>
              <p style={{
                fontSize: '14px',
                marginTop: '12px'
              }}>
                No complaints found!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {complaints.map(c => {
                const statusStyle =
                  STATUS_STYLES[c.status] ||
                  STATUS_STYLES.pending
                const priorityStyle =
                  PRIORITY_STYLES[
                    c.priority
                  ] || PRIORITY_STYLES.medium
                const overdue = isOverdue(c)

                return (
                  <div key={c._id}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      borderLeft: `4px solid ${
                        overdue
                          ? '#DC2626'
                          : priorityStyle.color
                      }`,
                      background: overdue
                        ? '#FFF5F5' : 'white'
                    }}>
                    <div style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      {/* Left */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '6px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            fontSize: '18px'
                          }}>
                            {CATEGORY_ICONS[
                              c.category
                            ]}
                          </span>
                          <span style={{
                            fontWeight: '700',
                            fontSize: '15px',
                            color: 'var(--text)'
                          }}>
                            {c.title}
                          </span>

                          {/* Priority */}
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background:
                              priorityStyle.bg,
                            color:
                              priorityStyle.color,
                            textTransform:
                              'uppercase'
                          }}>
                            {c.priority}
                          </span>

                          {/* Status */}
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background:
                              statusStyle.bg,
                            color:
                              statusStyle.color,
                            textTransform:
                              'capitalize'
                          }}>
                            {c.status
                              .replace('_', ' ')}
                          </span>

                          {/* Overdue badge */}
                          {overdue && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius:
                                '20px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background:
                                '#FEE2E2',
                              color: '#DC2626'
                            }}>
                              ⚠️ OVERDUE
                            </span>
                          )}

                          {/* Escalated */}
                          {c.isEscalated && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius:
                                '20px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background:
                                '#F3E8FF',
                              color: '#7C3AED'
                            }}>
                              🚨 Escalated
                            </span>
                          )}
                        </div>

                        <p style={{
                          fontSize: '13px',
                          color:
                            'var(--text-muted)',
                          marginBottom: '8px',
                          lineHeight: 1.5
                        }}>
                          {c.description
                            .slice(0, 120)}
                          {c.description
                            .length > 120
                            ? '...' : ''}
                        </p>

                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '12px',
                          color:
                            'var(--text-muted)',
                          flexWrap: 'wrap'
                        }}>
                          <span>
                            👤 {c.student?.name}
                          </span>
                          <span>
                            🏠 Room{' '}
                            {c.roomNumber ||
                              c.student
                                ?.roomNumber
                              || '—'}
                          </span>
                          {c.assignedTo && (
                            <span style={{
                              color: '#2563EB'
                            }}>
                              👷 Assigned to:{' '}
                              {c.assignedTo
                                ?.name}
                            </span>
                          )}
                          <span>
                            📅{' '}
                            {new Date(
                              c.createdAt
                            ).toLocaleDateString(
                              'en-IN'
                            )}
                          </span>
                          {c.deadline && (
                            <span style={{
                              color: overdue
                                ? '#DC2626'
                                : '#D97706'
                            }}>
                              ⏰ Deadline:{' '}
                              {new Date(
                                c.deadline
                              ).toLocaleString(
                                'en-IN'
                              )}
                            </span>
                          )}
                        </div>

                        {/* Student confirmation */}
                        {c.status ===
                          'resolved' &&
                          c.studentConfirmed !==
                          null && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color:
                              c.studentConfirmed
                                ? '#16A34A'
                                : '#DC2626',
                            fontWeight: '600'
                          }}>
                            {c.studentConfirmed
                              ? '✅ Student confirmed resolution'
                              : '❌ Student rejected — Reopened'}
                            {c.staffRating && (
                              <span style={{
                                marginLeft: '8px'
                              }}>
                                {'⭐'.repeat(
                                  c.staffRating
                                )}
                                {' '}{c.staffRating}/5
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Actions */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'flex-end'
                      }}>
                        {c.photo && (
                          
                            href={c.photo}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '12px',
                              color:
                                'var(--primary)',
                              textDecoration:
                                'none',
                              fontWeight: '600'
                            }}
                          >
                            📷 Photo
                          </a>
                        )}
                        <button
                          onClick={() =>
                            openModal(c)}
                          className="btn-primary"
                          style={{
                            padding: '7px 14px',
                            fontSize: '12px'
                          }}
                        >
                          ✏️ Update
                        </button>
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
      {activeTab === 'analytics' &&
        analytics && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Avg resolution time */}
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, 1fr)',
            gap: '12px'
          }}
            className="grid-3">
            {[
              {
                label: 'Avg Resolution Time',
                value: `${Math.round(
                  analytics
                    ?.avgResolutionTime || 0
                )} hrs`,
                icon: '⏱️',
                color: '#2563EB'
              },
              {
                label: 'Escalated',
                value: analytics
                  ?.escalated || 0,
                icon: '🚨',
                color: '#DC2626'
              },
              {
                label: 'Today',
                value: analytics
                  ?.todayComplaints || 0,
                icon: '📅',
                color: '#16A34A'
              },
            ].map((s, i) => (
              <div key={i} className="card"
                style={{ padding: '16px' }}>
                <div style={{
                  fontSize: '24px',
                  marginBottom: '6px'
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
                  color: 'var(--text-muted)'
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              📊 Complaints by Category
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {analytics.byCategory
                ?.map((cat, i) => {
                const total = analytics
                  .byCategory.reduce(
                    (s, c) => s + c.count, 0
                  )
                const pct = Math.round(
                  (cat.count / total) * 100
                )
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      width: '24px'
                    }}>
                      {CATEGORY_ICONS[cat._id]
                        || '📋'}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      color: 'var(--text)',
                      width: '100px',
                      textTransform: 'capitalize'
                    }}>
                      {cat._id}
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
                        width: `${pct}%`,
                        background:
                          'var(--primary)',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--primary)',
                      width: '40px',
                      textAlign: 'right'
                    }}>
                      {cat.count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Staff performance */}
          {analytics.staffPerformance
            ?.length > 0 && (
            <div className="card"
              style={{ padding: '20px' }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '700',
                marginBottom: '16px',
                color: 'var(--text)'
              }}>
                👷 Staff Performance
              </h2>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {analytics.staffPerformance
                  .map((s, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#F8FAFC',
                    borderRadius: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background:
                          'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '13px'
                      }}>
                        {s.name?.[0]
                          ?.toUpperCase()}
                      </div>
                      <span style={{
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {s.name}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '13px'
                    }}>
                      <span style={{
                        color: '#16A34A',
                        fontWeight: '700'
                      }}>
                        {s.resolved} resolved
                      </span>
                      {s.avgRating && (
                        <span style={{
                          color: '#D97706'
                        }}>
                          ⭐{' '}
                          {s.avgRating
                            .toFixed(1)}/5
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Update Modal */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '500px',
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
                ✏️ Update Complaint
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

            {/* Complaint Info */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <span style={{
                  fontSize: '20px'
                }}>
                  {CATEGORY_ICONS[
                    selectedComplaint.category
                  ]}
                </span>
                <span style={{
                  fontWeight: '700',
                  fontSize: '15px'
                }}>
                  {selectedComplaint.title}
                </span>
              </div>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                By: {selectedComplaint
                  .student?.name} •
                Room: {selectedComplaint
                  .roomNumber ||
                  selectedComplaint.student
                    ?.roomNumber || '—'}
              </p>

              {/* Status timeline */}
              {selectedComplaint.statusHistory
                ?.length > 0 && (
                <div style={{
                  marginTop: '12px'
                }}>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    History:
                  </p>
                  {selectedComplaint
                    .statusHistory
                    .slice(-3)
                    .map((h, i) => (
                    <div key={i} style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      padding: '3px 0',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <span>•</span>
                      <span style={{
                        textTransform:
                          'capitalize',
                        fontWeight: '600',
                        color: STATUS_STYLES[
                          h.status
                        ]?.color ||
                          'var(--text)'
                      }}>
                        {h.status.replace(
                          '_', ' '
                        )}
                      </span>
                      {h.remark && (
                        <span>
                          — {h.remark}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={handleUpdateStatus}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              {/* New Status */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  New Status *
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(3, 1fr)',
                  gap: '6px'
                }}>
                  {[
                    { value: 'pending',
                      label: '⏳ Pending' },
                    { value: 'assigned',
                      label: '👤 Assigned' },
                    { value: 'in_progress',
                      label: '🔄 In Progress' },
                    { value: 'resolved',
                      label: '✅ Resolved' },
                    { value: 'rejected',
                      label: '❌ Rejected' },
                    { value: 'reopened',
                      label: '🔁 Reopened' },
                  ].map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() =>
                        setUpdateForm({
                          ...updateForm,
                          status: s.value
                        })}
                      style={{
                        padding: '8px 6px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          updateForm.status
                            === s.value
                            ? STATUS_STYLES[
                                s.value
                              ]?.color
                            : '#F1F5F9',
                        color:
                          updateForm.status
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

              {/* Assign Staff */}
              {(updateForm.status === 'assigned'
                || updateForm.status ===
                  'in_progress') && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Assign to Staff
                  </label>
                  <select
                    value={updateForm.assignedTo}
                    onChange={e =>
                      setUpdateForm({
                        ...updateForm,
                        assignedTo: e.target.value
                      })}
                    className="input"
                  >
                    <option value="">
                      Select staff...
                    </option>
                    {staffList.map(s => (
                      <option
                        key={s._id}
                        value={s._id}>
                        {s.name} — {s.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Remarks */}
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
                  value={updateForm.remarks}
                  onChange={e =>
                    setUpdateForm({
                      ...updateForm,
                      remarks: e.target.value
                    })}
                  placeholder="Add notes about the update..."
                  rows={3}
                  className="input"
                  style={{
                    resize: 'none',
                    fontFamily: 'Inter'
                  }}
                />
              </div>

              {/* Rejection Reason */}
              {updateForm.status ===
                'rejected' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: '#DC2626',
                    textTransform: 'uppercase'
                  }}>
                    Rejection Reason *
                  </label>
                  <input
                    type="text"
                    value={
                      updateForm.rejectionReason
                    }
                    onChange={e =>
                      setUpdateForm({
                        ...updateForm,
                        rejectionReason:
                          e.target.value
                      })}
                    placeholder="Why is this being rejected?"
                    className="input"
                    required
                  />
                </div>
              )}

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
                  disabled={updating}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity: updating ? 0.7 : 1
                  }}
                >
                  {updating
                    ? '⏳ Updating...'
                    : '✅ Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}