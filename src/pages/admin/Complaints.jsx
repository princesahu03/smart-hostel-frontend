import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

export default function AdminComplaints() {
  const [complaints, setComplaints] =
    useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] =
    useState('')
  const [filterCategory, setFilterCategory] =
    useState('')
  const [selectedComplaint,
    setSelectedComplaint] = useState(null)
  const [showModal, setShowModal] =
    useState(false)
  const [updateData, setUpdateData] = useState({
    status: '',
    remarks: ''
  })

  useEffect(() => {
    fetchComplaints()
  }, [filterStatus, filterCategory])

  const fetchComplaints = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus
      if (filterCategory)
        params.category = filterCategory

      const res = await api.get(
        '/complaints/all', { params }
      )
      setComplaints(
        res.data.data.complaints
      )
    } catch {
      toast.error('Failed to fetch!')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    try {
      await api.patch(
        `/complaints/${selectedComplaint._id}/status`,
        updateData
      )
      toast.success(
        `Complaint ${updateData.status}! ✅`
      )
      setShowModal(false)
      fetchComplaints()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: '#FEF3C7',
          color: '#D97706'
        }
      case 'in_progress':
        return {
          bg: '#DBEAFE',
          color: '#2563EB'
        }
      case 'resolved':
        return {
          bg: '#DCFCE7',
          color: '#16A34A'
        }
      case 'rejected':
        return {
          bg: '#FEE2E2',
          color: '#DC2626'
        }
      default:
        return {
          bg: '#F1F5F9',
          color: '#64748B'
        }
    }
  }

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return { color: '#DC2626' }
      case 'medium':
        return { color: '#D97706' }
      case 'low':
        return { color: '#16A34A' }
      default:
        return { color: '#64748B' }
    }
  }

  const categories = [
    'maintenance', 'plumbing',
    'internet', 'cleanliness',
    'mess', 'security', 'other'
  ]

  if (loading) return (
    <Loader text="Loading complaints..." />
  )

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: '24px'
      }}>
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
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: '', label: 'All' },
          { value: 'pending',
            label: '⏳ Pending' },
          { value: 'in_progress',
            label: '🔄 In Progress' },
          { value: 'resolved',
            label: '✅ Resolved' },
          { value: 'rejected',
            label: '❌ Rejected' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() =>
              setFilterStatus(f.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
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

        <select
          value={filterCategory}
          onChange={e =>
            setFilterCategory(e.target.value)}
          className="input"
          style={{
            width: 'auto',
            padding: '8px 14px'
          }}
        >
          <option value="">
            All Categories
          </option>
          {categories.map(c => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() +
                c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Complaints Table */}
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
            No complaints found!
          </p>
        </div>
      ) : (
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
                    'Category', 'Title',
                    'Priority', 'Status',
                    'Date', 'Action']
                    .map(h => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: 'var(--text-muted)',
                      fontWeight: '600',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => {
                  const statusStyle =
                    getStatusStyle(c.status)
                  const priorityStyle =
                    getPriorityStyle(c.priority)
                  return (
                    <tr key={c._id}
                      className="table-row"
                      style={{
                        borderBottom:
                          '1px solid var(--border)'
                      }}>
                      <td style={{
                        padding: '12px 16px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: 'var(--text)'
                        }}>
                          {c.student?.name}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color:
                            'var(--text-muted)'
                        }}>
                          {c.student?.email}
                        </div>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        color: 'var(--text-muted)'
                      }}>
                        {c.student?.roomNumber
                          || '—'}
                      </td>
                      <td style={{
                        padding: '12px 16px'
                      }}>
                        <span style={{
                          padding: '3px 10px',
                          background: '#EFF6FF',
                          color:
                            'var(--primary)',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform:
                            'capitalize'
                        }}>
                          {c.category}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        maxWidth: '180px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: 'var(--text)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {c.title}
                        </div>
                        {c.photo && (
                          <a
                            href={c.photo}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '11px',
                              color:
                                'var(--primary)'
                            }}
                          >
                            📷 View Photo
                          </a>
                        )}
                      </td>
                      <td style={{
                        padding: '12px 16px'
                      }}>
                        <span style={{
                          fontWeight: '700',
                          textTransform:
                            'capitalize',
                          ...priorityStyle
                        }}>
                          {c.priority}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px'
                      }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background:
                            statusStyle.bg,
                          color: statusStyle.color,
                          textTransform:
                            'capitalize',
                          whiteSpace: 'nowrap'
                        }}>
                          {c.status.replace(
                            '_', ' '
                          )}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        color:
                          'var(--text-muted)',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                      }}>
                        {new Date(c.createdAt)
                          .toLocaleDateString(
                            'en-IN'
                          )}
                      </td>
                      <td style={{
                        padding: '12px 16px'
                      }}>
                        {c.status !==
                          'resolved' &&
                          c.status !==
                          'rejected' && (
                          <button
                            onClick={() => {
                              setSelectedComplaint(c)
                              setUpdateData({
                                status:
                                  c.status,
                                remarks: ''
                              })
                              setShowModal(true)
                            }}
                            style={{
                              padding:
                                '5px 12px',
                              background:
                                '#EFF6FF',
                              color:
                                'var(--primary)',
                              border:
                                '1px solid #BFDBFE',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showModal && selectedComplaint && (
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
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                Update Complaint
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
              <p style={{
                fontWeight: '700',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                {selectedComplaint.title}
              </p>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '4px'
              }}>
                {selectedComplaint.description}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--primary)',
                fontWeight: '600'
              }}>
                By: {selectedComplaint
                  .student?.name} |
                Room: {selectedComplaint
                  .student?.roomNumber}
              </p>
              {selectedComplaint.photo && (
                <a
                  href={selectedComplaint.photo}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '12px',
                    color: 'var(--primary)',
                    display: 'block',
                    marginTop: '6px'
                  }}
                >
                  📷 View Complaint Photo
                  (AWS S3)
                </a>
              )}
            </div>

            <form
              onSubmit={handleUpdateStatus}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
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
                  New Status *
                </label>
                <select
                  value={updateData.status}
                  onChange={e =>
                    setUpdateData({
                      ...updateData,
                      status: e.target.value
                    })}
                  required
                  className="input"
                >
                  <option value="pending">
                    ⏳ Pending
                  </option>
                  <option value="in_progress">
                    🔄 In Progress
                  </option>
                  <option value="resolved">
                    ✅ Resolved
                  </option>
                  <option value="rejected">
                    ❌ Rejected
                  </option>
                </select>
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
                  value={updateData.remarks}
                  onChange={e =>
                    setUpdateData({
                      ...updateData,
                      remarks: e.target.value
                    })}
                  placeholder="Add remarks..."
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
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px'
                  }}
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}