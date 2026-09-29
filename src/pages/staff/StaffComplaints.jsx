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

export default function StaffComplaints() {
  const [complaints, setComplaints] =
    useState([])
  const [loading, setLoading] =
    useState(true)
  const [filterStatus, setFilterStatus] =
    useState('')
  const [showUpdate, setShowUpdate] =
    useState(false)
  const [selected, setSelected] =
    useState(null)
  const [updateForm, setUpdateForm] =
    useState({
      status: 'in_progress',
      remarks: ''
    })
  const [updating, setUpdating] =
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
        '/complaints/staff',
        { params }
      )
      setComplaints(res.data.data)
    } catch {}
    finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      await api.patch(
        `/complaints/${selected._id}/status`,
        updateForm
      )
      toast.success('Task updated! ✅')
      setShowUpdate(false)
      fetchComplaints()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <Loader text="Loading tasks..." />
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
          📋 My Assigned Tasks
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          {complaints.length} tasks assigned
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: '', label: 'All' },
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

      {/* Tasks List */}
      {complaints.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '48px' }}>
            ✅
          </div>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            marginTop: '12px'
          }}>
            No tasks found!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {complaints.map(c => (
            <div key={c._id}
              className="card"
              style={{
                padding: '16px 20px',
                borderLeft: `4px solid ${
                  c.priority === 'high'
                    ? '#DC2626'
                    : c.priority === 'medium'
                    ? '#D97706'
                    : '#16A34A'
                }`
              }}>
              <div style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  {/* Title + Status */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontSize: '20px'
                    }}>
                      {CATEGORY_ICONS[
                        c.category
                      ] || '📋'}
                    </span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '15px',
                      color: 'var(--text)'
                    }}>
                      {c.title}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background:
                        c.status ===
                          'resolved'
                          ? '#DCFCE7'
                          : c.status ===
                            'in_progress'
                          ? '#DBEAFE'
                          : '#FEF3C7',
                      color:
                        c.status ===
                          'resolved'
                          ? '#16A34A'
                          : c.status ===
                            'in_progress'
                          ? '#2563EB'
                          : '#D97706',
                      textTransform:
                        'capitalize'
                    }}>
                      {c.status.replace(
                        '_', ' '
                      )}
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
                      {c.priority}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    lineHeight: 1.5
                  }}>
                    {c.description
                      .slice(0, 100)}
                    {c.description.length > 100
                      ? '...' : ''}
                  </p>

                  {/* Student + Room */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap'
                  }}>
                    <span>
                      👤 {c.student?.name}
                    </span>
                    <span>
                      🏠 Room{' '}
                      {c.roomNumber ||
                        c.student?.roomNumber
                        || '—'}
                    </span>
                    <span>
                      📞 {c.student?.phone}
                    </span>
                    <span>
                      📅{' '}
                      {new Date(c.createdAt)
                        .toLocaleDateString(
                          'en-IN'
                        )}
                    </span>
                    {c.deadline && (
                      <span style={{
                        color:
                          new Date(
                            c.deadline
                          ) < new Date()
                            ? '#DC2626'
                            : '#D97706',
                        fontWeight: '600'
                      }}>
                        ⏰ Deadline:{' '}
                        {new Date(c.deadline)
                          .toLocaleString(
                            'en-IN'
                          )}
                      </span>
                    )}
                  </div>

                  {/* Photo */}
                  {c.photo && (
                    <a
                      href={c.photo}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display:
                          'inline-block',
                        marginTop: '6px',
                        fontSize: '12px',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      📷 View Photo
                    </a>
                  )}

                  {/* Remarks */}
                  {c.remarks && (
                    <div style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      💬 {c.remarks}
                    </div>
                  )}
                </div>

                {/* Update Button */}
                {c.status !== 'resolved' &&
                  c.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      setSelected(c)
                      setUpdateForm({
                        status: 'in_progress',
                        remarks: ''
                      })
                      setShowUpdate(true)
                    }}
                    className="btn-primary"
                    style={{
                      padding: '7px 14px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ✏️ Update
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Modal */}
      {showUpdate && selected && (
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
                ✏️ Update Task
              </h2>
              <button
                onClick={() =>
                  setShowUpdate(false)}
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

            {/* Task info */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontWeight: '700',
                fontSize: '14px'
              }}>
                {selected.title}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '4px'
              }}>
                {selected.student?.name} •
                Room {selected.roomNumber ||
                  selected.student
                    ?.roomNumber || '—'}
              </p>
            </div>

            <form onSubmit={handleUpdate}
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
                  Update Status
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {[
                    {
                      value: 'in_progress',
                      label: '🔄 In Progress'
                    },
                    {
                      value: 'resolved',
                      label: '✅ Resolved'
                    },
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
                        flex: 1,
                        padding: '10px 8px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          updateForm.status
                            === s.value
                            ? 'var(--primary)'
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
                  {updateForm.status ===
                    'resolved' &&
                    ' (What did you fix?)'}
                </label>
                <textarea
                  value={updateForm.remarks}
                  onChange={e =>
                    setUpdateForm({
                      ...updateForm,
                      remarks: e.target.value
                    })}
                  placeholder={
                    updateForm.status ===
                      'resolved'
                      ? 'Describe what was fixed...'
                      : 'Add progress notes...'
                  }
                  rows={3}
                  required={
                    updateForm.status ===
                    'resolved'
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
                    setShowUpdate(false)}
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
                    : updateForm.status ===
                      'resolved'
                    ? '✅ Mark Resolved'
                    : '🔄 Update Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}