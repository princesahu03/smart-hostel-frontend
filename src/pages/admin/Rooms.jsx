import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

export default function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAllotModal, setShowAllotModal] =
    useState(false)
  const [selectedRoom, setSelectedRoom] =
    useState(null)
  const [selectedStudent, setSelectedStudent] =
    useState('')
  const [filterStatus, setFilterStatus] =
    useState('')
  const [filterFloor, setFilterFloor] =
    useState('')

  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    block: 'A',
    type: 'double',
    capacity: '2',
    monthlyRent: '',
    amenities: []
  })

  useEffect(() => {
    fetchRooms()
    fetchStudents()
  }, [filterStatus, filterFloor])

  const fetchRooms = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus
      if (filterFloor)
        params.floor = filterFloor
      const res = await api.get(
        '/rooms', { params }
      )
      setRooms(res.data.data.rooms)
    } catch {
      toast.error('Failed to fetch rooms!')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
  try {
    const res = await api.get(
      '/auth/users',
      { params: { role: 'student' } }
    )
    setStudents(res.data.data)
  } catch {}
}

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          data.append(key,
            JSON.stringify(formData[key]))
        } else if (formData[key]) {
          data.append(key, formData[key])
        }
      })

      await api.post('/rooms', data)
      toast.success('Room created! 🏠')
      setShowModal(false)
      resetForm()
      fetchRooms()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    }
  }

  const handleAllot = async () => {
    if (!selectedStudent) {
      toast.error('Select a student!')
      return
    }
    try {
      await api.post(
        `/rooms/${selectedRoom._id}/allot`,
        { studentId: selectedStudent }
      )
      toast.success('Room allotted! ✅')
      setShowAllotModal(false)
      setSelectedStudent('')
      fetchRooms()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    }
  }

  const handleRemove = async (
    roomId, studentId, studentName
  ) => {
    if (!confirm(
      `Remove ${studentName} from room?`
    )) return
    try {
      await api.post(
        `/rooms/${roomId}/remove`,
        { studentId }
      )
      toast.success('Student removed!')
      fetchRooms()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    }
  }

  const handleStatusUpdate = async (
    roomId, status
  ) => {
    try {
      await api.patch(`/rooms/${roomId}`,
        { status })
      toast.success(`Room ${status}!`)
      fetchRooms()
    } catch {
      toast.error('Failed!')
    }
  }

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      floor: '',
      block: 'A',
      type: 'double',
      capacity: '2',
      monthlyRent: '',
      amenities: []
    })
  }

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities
        .includes(amenity)
        ? prev.amenities.filter(
            a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return {
          bg: '#DCFCE7',
          color: '#16A34A'
        }
      case 'full':
        return {
          bg: '#FEE2E2',
          color: '#DC2626'
        }
      case 'maintenance':
        return {
          bg: '#FEF3C7',
          color: '#D97706'
        }
      default:
        return {
          bg: '#F1F5F9',
          color: '#64748B'
        }
    }
  }

  const amenitiesList = [
    'AC', 'Fan', 'Attached Bathroom',
    'WiFi', 'Geyser', 'Study Table'
  ]

  if (loading) return (
    <Loader text="Loading rooms..." />
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
            🏠 Room Management
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {rooms.length} rooms total
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Add Room
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: '', label: 'All Status' },
          { value: 'available',
            label: '✅ Available' },
          { value: 'full',
            label: '🔴 Full' },
          { value: 'maintenance',
            label: '🔧 Maintenance' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() =>
              setFilterStatus(f.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s',
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
          value={filterFloor}
          onChange={e =>
            setFilterFloor(e.target.value)}
          className="input"
          style={{
            width: 'auto',
            padding: '8px 16px'
          }}
        >
          <option value="">All Floors</option>
          {[1, 2, 3, 4, 5].map(f => (
            <option key={f} value={f}>
              Floor {f}
            </option>
          ))}
        </select>
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>
            🏠
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No rooms found!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {rooms.map(room => {
            const statusStyle =
              getStatusColor(room.status)
            const occupancyPercent =
              (room.currentOccupancy /
                room.capacity) * 100

            return (
              <div key={room._id}
                className="card"
                style={{ padding: '20px' }}>

                {/* Room Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: 'var(--primary)',
                      fontFamily:
                        'Space Grotesk'
                    }}>
                      Room {room.roomNumber}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)'
                    }}>
                      Floor {room.floor} •
                      Block {room.block} •
                      {room.type}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    textTransform: 'capitalize'
                  }}>
                    {room.status}
                  </span>
                </div>

                {/* Occupancy Bar */}
                <div style={{
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '6px'
                  }}>
                    <span>Occupancy</span>
                    <span>
                      {room.currentOccupancy}/
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
                      width: `${occupancyPercent}%`,
                      background:
                        occupancyPercent === 100
                          ? '#ef4444'
                          : occupancyPercent > 50
                          ? '#f59e0b'
                          : '#10b981',
                      borderRadius: '3px',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>

                {/* Rent */}
                {room.monthlyRent > 0 && (
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginBottom: '12px'
                  }}>
                    💰 ₹{room.monthlyRent
                      .toLocaleString('en-IN')}/month
                  </div>
                )}

                {/* Amenities */}
                {room.amenities?.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '16px'
                  }}>
                    {room.amenities.map(a => (
                      <span key={a} style={{
                        padding: '2px 8px',
                        background: '#EFF6FF',
                        color: 'var(--primary)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Occupants */}
                {room.occupants?.length > 0 && (
                  <div style={{
                    marginBottom: '16px'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--text-muted)',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      Students
                    </p>
                    {room.occupants.map(s => (
                      <div key={s._id}
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          background: '#F8FAFC',
                          borderRadius: '8px',
                          marginBottom: '6px'
                        }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background:
                              'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                              'center',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {s.name?.[0]
                              ?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {s.name}
                            </p>
                            <p style={{
                              fontSize: '11px',
                              color:
                                'var(--text-muted)'
                            }}>
                              {s.studentId ||
                                s.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleRemove(
                              room._id,
                              s._id,
                              s.name
                            )}
                          style={{
                            padding: '4px 8px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {room.status !== 'full' &&
                    room.status !==
                      'maintenance' && (
                    <button
                      onClick={() => {
                        setSelectedRoom(room)
                        setShowAllotModal(true)
                      }}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: '13px'
                      }}
                    >
                      + Allot Student
                    </button>
                  )}

                  <select
                    value={room.status}
                    onChange={e =>
                      handleStatusUpdate(
                        room._id,
                        e.target.value
                      )}
                    style={{
                      padding: '8px 10px',
                      border:
                        '1.5px solid var(--border)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: 'Inter',
                      background: 'white'
                    }}
                  >
                    <option value="available">
                      Available
                    </option>
                    <option value="maintenance">
                      Maintenance
                    </option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Room Modal */}
      {showModal && (
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
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                🏠 Add New Room
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
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

            <form onSubmit={handleCreateRoom}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              <div style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '12px'
              }}>
                {[
                  {
                    label: 'Room Number *',
                    key: 'roomNumber',
                    placeholder: '101'
                  },
                  {
                    label: 'Floor *',
                    key: 'floor',
                    placeholder: '1'
                  },
                  {
                    label: 'Block',
                    key: 'block',
                    placeholder: 'A'
                  },
                  {
                    label: 'Monthly Rent ₹',
                    key: 'monthlyRent',
                    placeholder: '3000'
                  },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '5px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={
                        formData[field.key]
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          [field.key]:
                            e.target.value
                        })}
                      placeholder={
                        field.placeholder
                      }
                      required={
                        field.label.includes('*')
                      }
                      className="input"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Room Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        type: e.target.value,
                        capacity:
                          e.target.value ===
                            'single' ? '1'
                          : e.target.value ===
                            'double' ? '2'
                          : '3'
                      })}
                    className="input"
                    style={{ fontSize: '13px' }}
                  >
                    <option value="single">
                      Single (1)
                    </option>
                    <option value="double">
                      Double (2)
                    </option>
                    <option value="triple">
                      Triple (3)
                    </option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        capacity: e.target.value
                      })}
                    min="1"
                    max="4"
                    className="input"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Amenities
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {amenitiesList.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() =>
                        toggleAmenity(a)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background:
                          formData.amenities
                            .includes(a)
                            ? 'var(--primary)'
                            : '#F1F5F9',
                        color:
                          formData.amenities
                            .includes(a)
                            ? 'white'
                            : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
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
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px'
                  }}
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allot Student Modal */}
{showAllotModal && selectedRoom && (
  <div className="modal-overlay">
    <div className="modal"
      style={{
        maxWidth: '440px',
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
          Allot Room {selectedRoom.roomNumber}
        </h2>
        <button
          onClick={() => {
            setShowAllotModal(false)
            setSelectedStudent('')
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

      {/* Room Info */}
      <div style={{
        background: '#EFF6FF',
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '20px',
        fontSize: '13px',
        color: 'var(--primary)',
        fontWeight: '600'
      }}>
        Floor {selectedRoom.floor} •
        Block {selectedRoom.block} •
        {selectedRoom.currentOccupancy}/
        {selectedRoom.capacity} occupied
      </div>

      {/* Student Dropdown */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '600',
          marginBottom: '6px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase'
        }}>
          Select Student *
        </label>
        <select
          value={selectedStudent}
          onChange={e =>
            setSelectedStudent(e.target.value)}
          className="input"
        >
          <option value="">
            Choose student...
          </option>
          {students
            .filter(s => !s.roomNumber)
            .map(s => (
            <option key={s._id} value={s._id}>
              {s.name} —
              {s.studentId || s.email}
            </option>
          ))}
        </select>
        <p style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '4px'
        }}>
          Only students without room shown
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => {
            setShowAllotModal(false)
            setSelectedStudent('')
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
          onClick={handleAllot}
          className="btn-primary"
          style={{ flex: 2, padding: '12px' }}
        >
          ✅ Allot Room
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}