import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from
  '../../context/AuthContext'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const REQUEST_TYPES = {
  room_change: {
    icon: '🔄',
    label: 'Room Change',
    desc: 'Request to move to a different room'
  },
  roommate_preference: {
    icon: '👥',
    label: 'Roommate Preference',
    desc: 'Request a specific roommate'
  },
  room_checkout: {
    icon: '🚪',
    label: 'Room Checkout',
    desc: 'Vacate your current room'
  },
  room_swap: {
    icon: '🔀',
    label: 'Room Swap',
    desc: 'Swap room with another student'
  }
}

const STATUS_STYLES = {
  pending: {
    bg: '#FEF3C7',
    color: '#D97706',
    label: '⏳ Pending'
  },
  approved: {
    bg: '#DCFCE7',
    color: '#16A34A',
    label: '✅ Approved'
  },
  rejected: {
    bg: '#FEE2E2',
    color: '#DC2626',
    label: '❌ Rejected'
  },
  completed: {
    bg: '#DBEAFE',
    color: '#2563EB',
    label: '🎉 Completed'
  },
  cancelled: {
    bg: '#F1F5F9',
    color: '#64748B',
    label: '✕ Cancelled'
  }
}

export default function RoomService() {
  const { user } = useAuth()
  const [requests, setRequests] =
    useState([])
  const [availableRooms, setAvailableRooms] =
    useState([])
  const [studentsForSwap, setStudentsForSwap] =
    useState([])
  const [loading, setLoading] =
    useState(true)
  const [showForm, setShowForm] =
    useState(false)
  const [selectedType, setSelectedType] =
    useState(null)
  const [formData, setFormData] = useState({
    requestType: '',
    reason: '',
    preferredRoomNumber: '',
    preferredRoommate: '',
    checkoutDate: '',
    swapWithStudent: '',
    swapWithRoom: '',
    priority: 'medium'
  })
  const [submitting, setSubmitting] =
    useState(false)
  const [searchRoom, setSearchRoom] =
    useState('')
  const [searchStudent, setSearchStudent] =
    useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [
        requestsRes,
        roomsRes,
        studentsRes
      ] = await Promise.all([
        api.get('/room-requests/my'),
        api.get(
          '/room-requests/available-rooms'
        ),
        api.get(
          '/room-requests/students-for-swap'
        )
      ])
      setRequests(requestsRes.data.data)
      setAvailableRooms(roomsRes.data.data)
      setStudentsForSwap(studentsRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.reason) {
      toast.error('Reason is required!')
      return
    }
    setSubmitting(true)
    try {
      await api.post(
        '/room-requests/create',
        {
          ...formData,
          requestType: selectedType
        }
      )
      toast.success(
        'Request submitted! ✅'
      )
      setShowForm(false)
      setSelectedType(null)
      resetForm()
      fetchData()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed to submit!'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (requestId) => {
    try {
      await api.patch(
        `/room-requests/${requestId}/cancel`
      )
      toast.success('Request cancelled!')
      fetchData()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    }
  }

  const resetForm = () => {
    setFormData({
      requestType: '',
      reason: '',
      preferredRoomNumber: '',
      preferredRoommate: '',
      checkoutDate: '',
      swapWithStudent: '',
      swapWithRoom: '',
      priority: 'medium'
    })
    setSearchRoom('')
    setSearchStudent('')
  }

  const filteredRooms = availableRooms
    .filter(r =>
      r.roomNumber.toLowerCase()
        .includes(searchRoom.toLowerCase())
    )

  const filteredStudents = studentsForSwap
    .filter(s =>
      s.name.toLowerCase()
        .includes(
          searchStudent.toLowerCase()
        ) ||
      s.roomNumber?.toLowerCase()
        .includes(
          searchStudent.toLowerCase()
        )
    )

  if (loading) return (
    <Loader text="Loading room services..." />
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
          🏠 Room Self-Service
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          Room change, swap, and checkout
          requests
        </p>
      </div>

      {/* Current Room Info */}
      <div style={{
        background:
          'linear-gradient(135deg, #1a3c5e, #2d5f8a)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <p style={{
            fontSize: '12px',
            opacity: 0.7,
            marginBottom: '4px'
          }}>
            Current Room
          </p>
          <p style={{
            fontSize: '28px',
            fontWeight: '800',
            fontFamily: 'Space Grotesk'
          }}>
            {user?.roomNumber
              ? `Room ${user.roomNumber}`
              : 'No Room Allotted'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            background:
              'rgba(255,255,255,0.15)',
            color: 'white',
            border:
              '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          + New Request
        </button>
      </div>

      {/* Service Type Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}
        className="grid-4">
        {Object.entries(REQUEST_TYPES)
          .map(([key, type]) => (
          <div
            key={key}
            className="card"
            style={{
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
            onClick={() => {
              setSelectedType(key)
              setFormData({
                ...formData,
                requestType: key
              })
              setShowForm(true)
            }}
            onMouseEnter={e => {
              e.currentTarget.style
                .transform = 'translateY(-2px)'
              e.currentTarget.style
                .boxShadow =
                '0 8px 24px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style
                .transform = 'translateY(0)'
              e.currentTarget.style
                .boxShadow = 'none'
            }}
          >
            <div style={{
              fontSize: '32px',
              marginBottom: '8px'
            }}>
              {type.icon}
            </div>
            <p style={{
              fontWeight: '700',
              fontSize: '13px',
              color: 'var(--text)',
              marginBottom: '4px'
            }}>
              {type.label}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.4
            }}>
              {type.desc}
            </p>
          </div>
        ))}
      </div>

      {/* My Requests */}
      <h2 style={{
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '12px'
      }}>
        📋 My Requests ({requests.length})
      </h2>

      {requests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '48px' }}>
            🏠
          </div>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            marginTop: '12px'
          }}>
            No requests yet!
          </p>
          <p style={{
            fontSize: '13px',
            marginTop: '6px'
          }}>
            Use cards above to make
            a room request
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {requests.map(req => {
            const typeInfo =
              REQUEST_TYPES[req.requestType]
            const statusStyle =
              STATUS_STYLES[req.status] ||
              STATUS_STYLES.pending

            return (
              <div key={req._id}
                className="card"
                style={{
                  padding: '16px 20px',
                  borderLeft: `4px solid ${statusStyle.color}`
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
                    {/* Type + Status */}
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
                        {typeInfo?.icon}
                      </span>
                      <span style={{
                        fontWeight: '700',
                        fontSize: '15px',
                        color: 'var(--text)'
                      }}>
                        {typeInfo?.label}
                      </span>
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background:
                          statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {statusStyle.label}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background:
                          req.priority ===
                            'high'
                            ? '#FEE2E2'
                            : req.priority ===
                              'medium'
                            ? '#FEF3C7'
                            : '#DCFCE7',
                        color:
                          req.priority ===
                            'high'
                            ? '#DC2626'
                            : req.priority ===
                              'medium'
                            ? '#D97706'
                            : '#16A34A'
                      }}>
                        {req.priority}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{
                      fontSize: '13px',
                      color:
                        'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <span>
                        📋 Reason:{' '}
                        {req.reason}
                      </span>

                      {req.currentRoom && (
                        <span>
                          🏠 From Room:{' '}
                          {req.currentRoom}
                        </span>
                      )}

                      {req.preferredRoomNumber && (
                        <span>
                          🎯 Preferred:{' '}
                          Room{' '}
                          {req.preferredRoomNumber}
                        </span>
                      )}

                      {req.preferredRoommate && (
                        <span>
                          👥 Roommate:{' '}
                          {req.preferredRoommate
                            ?.name}
                        </span>
                      )}

                      {req.swapWithStudent && (
                        <span>
                          🔀 Swap with:{' '}
                          {req.swapWithStudent
                            ?.name}{' '}
                          (Room{' '}
                          {req.swapWithRoom})
                        </span>
                      )}

                      {req.checkoutDate && (
                        <span>
                          📅 Checkout:{' '}
                          {new Date(
                            req.checkoutDate
                          ).toLocaleDateString(
                            'en-IN'
                          )}
                        </span>
                      )}

                      <span style={{
                        fontSize: '11px'
                      }}>
                        📅 Submitted:{' '}
                        {new Date(
                          req.createdAt
                        ).toLocaleDateString(
                          'en-IN'
                        )}
                      </span>
                    </div>

                    {/* Admin remarks */}
                    {req.adminRemarks && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background:
                          req.status ===
                            'rejected'
                            ? '#FEE2E2'
                            : '#DCFCE7',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color:
                          req.status ===
                            'rejected'
                            ? '#DC2626'
                            : '#16A34A',
                        fontWeight: '600'
                      }}>
                        💬 Admin:{' '}
                        {req.adminRemarks}
                      </div>
                    )}
                  </div>

                  {/* Cancel Button */}
                  {req.status === 'pending' && (
                    <button
                      onClick={() =>
                        handleCancel(req._id)}
                      style={{
                        padding: '6px 14px',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border:
                          '1px solid #FECACA',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ✕ Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Request Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '520px',
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
                {selectedType
                  ? `${REQUEST_TYPES[
                      selectedType
                    ]?.icon} ${REQUEST_TYPES[
                      selectedType
                    ]?.label}`
                  : '+ New Request'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedType(null)
                  resetForm()
                }}
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

              {/* Request Type Selector */}
              {!selectedType && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Request Type *
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(2, 1fr)',
                    gap: '8px'
                  }}>
                    {Object.entries(
                      REQUEST_TYPES
                    ).map(([key, type]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedType(key)
                          setFormData({
                            ...formData,
                            requestType: key
                          })
                        }}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          background:
                            selectedType === key
                              ? 'var(--primary)'
                              : '#F1F5F9',
                          color:
                            selectedType === key
                              ? 'white'
                              : 'var(--text)',
                          border: 'none',
                          textAlign: 'left'
                        }}
                      >
                        {type.icon}{' '}
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Change Fields */}
              {selectedType ===
                'room_change' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Preferred Room
                  </label>
                  <input
                    type="text"
                    value={searchRoom}
                    onChange={e =>
                      setSearchRoom(
                        e.target.value
                      )}
                    placeholder="Search room number..."
                    className="input"
                    style={{
                      marginBottom: '8px'
                    }}
                  />
                  {searchRoom && (
                    <div style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      border:
                        '1px solid var(--border)',
                      borderRadius: '8px'
                    }}>
                      {filteredRooms
                        .slice(0, 5)
                        .map(room => (
                        <button
                          key={room._id}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              preferredRoomNumber:
                                room.roomNumber
                            })
                            setSearchRoom(
                              room.roomNumber
                            )
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background:
                              formData
                                .preferredRoomNumber
                              === room.roomNumber
                                ? '#EFF6FF'
                                : 'white',
                            border: 'none',
                            borderBottom:
                              '1px solid var(--border)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '13px'
                          }}
                        >
                          <span style={{
                            fontWeight: '700'
                          }}>
                            Room{' '}
                            {room.roomNumber}
                          </span>
                          <span style={{
                            color:
                              'var(--text-muted)',
                            marginLeft: '8px'
                          }}>
                            Floor {room.floor} •{' '}
                            {room.type} •{' '}
                            {room.occupants
                              ?.length || 0}/
                            {room.capacity}{' '}
                            occupied
                          </span>
                        </button>
                      ))}
                      {filteredRooms.length
                        === 0 && (
                        <p style={{
                          padding: '12px',
                          color:
                            'var(--text-muted)',
                          fontSize: '13px',
                          textAlign: 'center'
                        }}>
                          No available rooms!
                        </p>
                      )}
                    </div>
                  )}
                  {formData.preferredRoomNumber && (
                    <p style={{
                      fontSize: '12px',
                      color: '#16A34A',
                      fontWeight: '600',
                      marginTop: '4px'
                    }}>
                      ✅ Selected: Room{' '}
                      {formData
                        .preferredRoomNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Roommate Preference */}
              {selectedType ===
                'roommate_preference' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Preferred Roommate
                  </label>
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={e =>
                      setSearchStudent(
                        e.target.value
                      )}
                    placeholder="Search student name..."
                    className="input"
                    style={{
                      marginBottom: '8px'
                    }}
                  />
                  {searchStudent && (
                    <div style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      border:
                        '1px solid var(--border)',
                      borderRadius: '8px'
                    }}>
                      {filteredStudents
                        .slice(0, 5)
                        .map(s => (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              preferredRoommate:
                                s._id
                            })
                            setSearchStudent(
                              s.name
                            )
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background:
                              formData
                                .preferredRoommate
                              === s._id
                                ? '#EFF6FF'
                                : 'white',
                            border: 'none',
                            borderBottom:
                              '1px solid var(--border)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '13px'
                          }}
                        >
                          <span style={{
                            fontWeight: '700'
                          }}>
                            {s.name}
                          </span>
                          <span style={{
                            color:
                              'var(--text-muted)',
                            marginLeft: '8px'
                          }}>
                            Room{' '}
                            {s.roomNumber} •{' '}
                            {s.course}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Checkout Date */}
              {selectedType ===
                'room_checkout' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Checkout Date *
                  </label>
                  <input
                    type="date"
                    value={formData.checkoutDate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        checkoutDate:
                          e.target.value
                      })}
                    required
                    min={new Date()
                      .toISOString()
                      .split('T')[0]}
                    className="input"
                  />
                </div>
              )}

              {/* Room Swap */}
              {selectedType ===
                'room_swap' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Swap With Student
                  </label>
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={e =>
                      setSearchStudent(
                        e.target.value
                      )}
                    placeholder="Search student to swap with..."
                    className="input"
                    style={{
                      marginBottom: '8px'
                    }}
                  />
                  {searchStudent && (
                    <div style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      border:
                        '1px solid var(--border)',
                      borderRadius: '8px'
                    }}>
                      {filteredStudents
                        .slice(0, 5)
                        .map(s => (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              swapWithStudent:
                                s._id,
                              swapWithRoom:
                                s.roomNumber
                            })
                            setSearchStudent(
                              `${s.name} — Room ${s.roomNumber}`
                            )
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background:
                              formData
                                .swapWithStudent
                              === s._id
                                ? '#EFF6FF'
                                : 'white',
                            border: 'none',
                            borderBottom:
                              '1px solid var(--border)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '13px'
                          }}
                        >
                          <span style={{
                            fontWeight: '700'
                          }}>
                            {s.name}
                          </span>
                          <span style={{
                            color:
                              'var(--text-muted)',
                            marginLeft: '8px'
                          }}>
                            Room{' '}
                            {s.roomNumber} •{' '}
                            {s.course}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                  Priority
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {[
                    { value: 'low',
                      label: '🟢 Low' },
                    { value: 'medium',
                      label: '🟡 Medium' },
                    { value: 'high',
                      label: '🔴 Urgent' },
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
                            ? 'var(--primary)'
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

              {/* Reason */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Reason *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      reason: e.target.value
                    })}
                  placeholder="Explain why you need this change..."
                  rows={3}
                  required
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
                  onClick={() => {
                    setShowForm(false)
                    setSelectedType(null)
                    resetForm()
                  }}
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
                  disabled={
                    submitting ||
                    !selectedType
                  }
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting
                    ? '⏳ Submitting...'
                    : '📋 Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}