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

const STATUS_STYLES = {
  pending: {
    bg: '#F1F5F9',
    color: '#64748B',
    label: '⏳ Pending'
  },
  assigned: {
    bg: '#DBEAFE',
    color: '#2563EB',
    label: '👤 Assigned'
  },
  in_progress: {
    bg: '#FEF3C7',
    color: '#D97706',
    label: '🔄 In Progress'
  },
  resolved: {
    bg: '#DCFCE7',
    color: '#16A34A',
    label: '✅ Resolved'
  },
  rejected: {
    bg: '#FEE2E2',
    color: '#DC2626',
    label: '❌ Rejected'
  },
  reopened: {
    bg: '#F3E8FF',
    color: '#7C3AED',
    label: '🔁 Reopened'
  }
}

export default function MyComplaints() {
  const [complaints, setComplaints] =
    useState([])
  const [loading, setLoading] =
    useState(true)
  const [showForm, setShowForm] =
    useState(false)
  const [filterStatus, setFilterStatus] =
    useState('')
  const [showConfirmModal, setShowConfirmModal] =
    useState(false)
  const [selectedComplaint, setSelectedComplaint] =
    useState(null)
  const [confirmForm, setConfirmForm] =
    useState({
      confirmed: true,
      feedback: '',
      staffRating: 0
    })
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'medium'
  })
  const [photo, setPhoto] = useState(null)
  const [submitting, setSubmitting] =
    useState(false)

  useEffect(() => {
    fetchComplaints()
  }, [filterStatus])

  const fetchComplaints = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus

      const res = await api.get(
        '/complaints/my', { params }
      )
      setComplaints(res.data.data)
    } catch {
      toast.error('Failed to load!')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.category ||
        !formData.title ||
        !formData.description) {
      toast.error('Fill all required fields!')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.keys(formData).forEach(key =>
        fd.append(key, formData[key])
      )
      if (photo) fd.append('photo', photo)

      await api.post('/complaints/create', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Complaint raised! ✅')
      setShowForm(false)
      setFormData({
        category: '',
        title: '',
        description: '',
        priority: 'medium'
      })
      setPhoto(null)
      fetchComplaints()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    try {
      await api.patch(
        `/complaints/${selectedComplaint._id}/confirm`,
        confirmForm
      )
      toast.success(
        confirmForm.confirmed
          ? 'Resolution confirmed! ✅'
          : 'Complaint reopened!'
      )
      setShowConfirmModal(false)
      fetchComplaints()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    }
  }

  const StarRating = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            fontSize: '22px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: star <= value ? 1 : 0.3
          }}
        >
          ⭐
        </button>
      ))}
    </div>
  )

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
            📋 My Complaints
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {complaints.length} complaints
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + Raise Complaint
        </button>
      </div>

      {/* Status Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: '', label: 'All' },
          { value: 'pending',
            label: '⏳ Pending' },
          { value: 'assigned',
            label: '👤 Assigned' },
          { value: 'in_progress',
            label: '🔄 In Progress' },
          { value: 'resolved',
            label: '✅ Resolved' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() =>
              setFilterStatus(f.value)}
            style={{
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              background:
                filterStatus === f.value
                  ? 'var(--primary)'
                  : 'white',
              color:
                filterStatus === f.value
                  ? 'white'
                  : 'var(--text-muted)',
              border:
                filterStatus === f.value
                  ? '1.5px solid var(--primary)'
                  : '1.5px solid var(--border)'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>
            📋
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No complaints yet!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
            style={{ marginTop: '16px' }}
          >
            Raise First Complaint
          </button>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {complaints.map(c => {
            const statusInfo =
              STATUS_STYLES[c.status] ||
              STATUS_STYLES.pending

            return (
              <div key={c._id}
                className="card"
                style={{
                  padding: '18px 20px'
                }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontSize: '20px'
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
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background:
                        statusInfo.bg,
                      color: statusInfo.color
                    }}>
                      {statusInfo.label}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background:
                        c.priority === 'high'
                          ? '#FEE2E2'
                          : c.priority ===
                            'medium'
                          ? '#FEF3C7'
                          : '#DCFCE7',
                      color:
                        c.priority === 'high'
                          ? '#DC2626'
                          : c.priority ===
                            'medium'
                          ? '#D97706'
                          : '#16A34A'
                    }}>
                      {c.priority} priority
                    </span>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}>
                    {new Date(c.createdAt)
                      .toLocaleDateString(
                        'en-IN'
                      )}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginBottom: '10px',
                  lineHeight: 1.5
                }}>
                  {c.description}
                </p>

                {/* Assigned Staff */}
                {c.assignedTo && (
                  <div style={{
                    padding: '8px 12px',
                    background: '#EFF6FF',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#2563EB',
                    fontWeight: '600',
                    marginBottom: '10px'
                  }}>
                    👷 Assigned to:{' '}
                    {c.assignedTo?.name}{' '}
                    {c.assignedTo?.phone &&
                      `• 📞 ${c.assignedTo.phone}`}
                  </div>
                )}

                {/* Remarks */}
                {c.remarks && (
                  <div style={{
                    padding: '8px 12px',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '10px'
                  }}>
                    💬 {c.remarks}
                  </div>
                )}

                {/* Rejection reason */}
                {c.rejectionReason && (
                  <div style={{
                    padding: '8px 12px',
                    background: '#FEE2E2',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#DC2626',
                    marginBottom: '10px'
                  }}>
                    ❌ Reason:{' '}
                    {c.rejectionReason}
                  </div>
                )}

                {/* Photo */}
                {c.photo && (
                  <a
                    href={c.photo}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      fontSize: '12px',
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      fontWeight: '600',
                      marginBottom: '10px'
                    }}
                  >
                    📷 View Photo
                  </a>
                )}

                {/* Confirm Resolution */}
                {c.status === 'resolved' &&
                  c.studentConfirmed ===
                  null && (
                  <div style={{
                    padding: '12px',
                    background: '#F0FDF4',
                    borderRadius: '10px',
                    border: '1px solid #BBF7D0'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#16A34A',
                      marginBottom: '8px'
                    }}>
                      ✅ Complaint marked
                      as resolved!
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#16A34A',
                      marginBottom: '10px'
                    }}>
                      Is the issue actually
                      fixed? Please confirm!
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => {
                          setSelectedComplaint(c)
                          setConfirmForm({
                            confirmed: true,
                            feedback: '',
                            staffRating: 0
                          })
                          setShowConfirmModal(
                            true
                          )
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#DCFCE7',
                          color: '#16A34A',
                          border:
                            '1px solid #BBF7D0',
                          borderRadius: '8px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        ✅ Yes, Fixed!
                      </button>
                      <button
                        onClick={() => {
                          setSelectedComplaint(c)
                          setConfirmForm({
                            confirmed: false,
                            feedback: '',
                            staffRating: 0
                          })
                          setShowConfirmModal(
                            true
                          )
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#FEE2E2',
                          color: '#DC2626',
                          border:
                            '1px solid #FECACA',
                          borderRadius: '8px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        ❌ Not Fixed!
                      </button>
                    </div>
                  </div>
                )}

                {/* Already confirmed */}
                {c.status === 'resolved' &&
                  c.studentConfirmed !==
                  null && (
                  <div style={{
                    padding: '8px 12px',
                    background:
                      c.studentConfirmed
                        ? '#DCFCE7'
                        : '#FEE2E2',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color:
                      c.studentConfirmed
                        ? '#16A34A'
                        : '#DC2626'
                  }}>
                    {c.studentConfirmed
                      ? '✅ You confirmed this resolved'
                      : '❌ You reported not fixed'}
                    {c.staffRating && (
                      <span
                        style={{
                          marginLeft: '8px'
                        }}>
                        {'⭐'.repeat(
                          c.staffRating
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Raise Complaint Modal */}
      {showForm && (
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
                📋 Raise Complaint
              </h2>
              <button
                onClick={() =>
                  setShowForm(false)}
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

            <form onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              {/* Category */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Category *
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(4, 1fr)',
                  gap: '6px'
                }}>
                  {Object.keys(CATEGORY_ICONS)
                    .map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          category: cat
                        })}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          formData.category
                            === cat
                            ? 'var(--primary)'
                            : '#F1F5F9',
                        color:
                          formData.category
                            === cat
                            ? 'white'
                            : 'var(--text-muted)',
                        border: 'none',
                        textTransform:
                          'capitalize'
                      }}
                    >
                      {CATEGORY_ICONS[cat]}
                      {' '}{cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Priority *
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {[
                    { value: 'low',
                      label: '🟢 Low',
                      color: '#16A34A' },
                    { value: 'medium',
                      label: '🟡 Medium',
                      color: '#D97706' },
                    { value: 'high',
                      label: '🔴 High',
                      color: '#DC2626' },
                  ].map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          priority: p.value
                        })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background:
                          formData.priority
                            === p.value
                            ? p.color
                            : '#F1F5F9',
                        color:
                          formData.priority
                            === p.value
                            ? 'white'
                            : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      title: e.target.value
                    })}
                  placeholder="e.g. Fan not working in Room 101"
                  required
                  className="input"
                />
              </div>

              {/* Description */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      description: e.target.value
                    })}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  required
                  className="input"
                  style={{
                    resize: 'none',
                    fontFamily: 'Inter'
                  }}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Photo Evidence (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    setPhoto(e.target.files[0])}
                  className="input"
                  style={{ padding: '8px' }}
                />
                {photo && (
                  <p style={{
                    fontSize: '11px',
                    color: '#16A34A',
                    marginTop: '4px'
                  }}>
                    ✅ {photo.name}
                  </p>
                )}
              </div>

              <div style={{
                background: '#EFF6FF',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '12px',
                color: 'var(--primary)'
              }}>
                💡 Your complaint will be
                automatically assigned to
                the appropriate staff!
              </div>

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)}
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
                  disabled={submitting}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting
                    ? '⏳ Submitting...'
                    : '📋 Raise Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Resolution Modal */}
      {showConfirmModal &&
        selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '400px',
              padding: '28px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                {confirmForm.confirmed
                  ? '✅ Confirm Resolution'
                  : '❌ Report Not Fixed'}
              </h2>
              <button
                onClick={() =>
                  setShowConfirmModal(false)}
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

            <form onSubmit={handleConfirm}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              {/* Rate staff (if confirming) */}
              {confirmForm.confirmed && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Rate the Staff Work
                  </label>
                  <StarRating
                    value={
                      confirmForm.staffRating
                    }
                    onChange={val =>
                      setConfirmForm({
                        ...confirmForm,
                        staffRating: val
                      })}
                  />
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  {confirmForm.confirmed
                    ? 'Feedback (Optional)'
                    : 'What is Still Wrong? *'}
                </label>
                <textarea
                  value={confirmForm.feedback}
                  onChange={e =>
                    setConfirmForm({
                      ...confirmForm,
                      feedback: e.target.value
                    })}
                  placeholder={
                    confirmForm.confirmed
                      ? 'Any feedback for staff?'
                      : 'Describe what is still not fixed...'
                  }
                  rows={3}
                  required={
                    !confirmForm.confirmed
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
                    setShowConfirmModal(false)}
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
                  style={{
                    flex: 2,
                    padding: '12px',
                    background:
                      confirmForm.confirmed
                        ? '#10B981'
                        : '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px'
                  }}
                >
                  {confirmForm.confirmed
                    ? '✅ Confirm Fixed!'
                    : '❌ Report Not Fixed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}