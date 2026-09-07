import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from
  '../../context/AuthContext'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import StatCard from
  '../../components/StatCard'

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    complaints: [],
    visitors: [],
    notices: [],
    room: null
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [
        complaintsRes,
        visitorsRes,
        noticesRes
      ] = await Promise.all([
        api.get('/complaints/my'),
        api.get('/visitors/my'),
        api.get('/notices')
      ])

      setData({
        complaints:
          complaintsRes.data.data
            .complaints || [],
        visitors:
          visitorsRes.data.data
            .visitors || [],
        notices: noticesRes.data.data || []
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Loader text="Loading dashboard..." />
  )

  // Greeting:
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? '🌅 Good Morning'
    : hour < 17 ? '☀️ Good Afternoon'
    : hour < 21 ? '🌆 Good Evening'
    : '🌙 Good Night'

  // Stats:
  const pendingComplaints =
    data.complaints.filter(
      c => c.status === 'pending'
    ).length

  const resolvedComplaints =
    data.complaints.filter(
      c => c.status === 'resolved'
    ).length

  const pendingVisitors =
    data.visitors.filter(
      v => v.status === 'pending'
    ).length

  const approvedVisitors =
    data.visitors.filter(
      v => v.status === 'approved'
    ).length

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
            {greeting},{' '}
            {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {new Date().toLocaleDateString(
              'en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }
            )}
          </p>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="card" style={{
        padding: '20px',
        background:
          'linear-gradient(135deg, #1a3c5e, #2d5f8a)',
        color: 'white',
        border: 'none'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background:
              'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: '700',
            flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: 'Space Grotesk'
            }}>
              {user?.name}
            </h2>
            <p style={{
              opacity: 0.8,
              fontSize: '14px',
              marginTop: '2px'
            }}>
              {user?.course || 'BCA'} •
              Year {user?.year || '—'} •
              {user?.studentId || 'Student'}
            </p>
            <p style={{
              opacity: 0.7,
              fontSize: '13px',
              marginTop: '2px'
            }}>
              📧 {user?.email} •
              📞 {user?.phone}
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{
              background:
                'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '12px 20px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                Room Number
              </p>
              <p style={{
                fontSize: '28px',
                fontWeight: '800',
                fontFamily: 'Space Grotesk'
              }}>
                {user?.roomNumber || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(4, 1fr)',
        gap: '16px'
      }}
        className="grid-4">
        <StatCard
          label="Pending Complaints"
          value={pendingComplaints}
          icon="⏳"
          color="#D97706"
          bg="#FEF3C7"
          onClick={() =>
            navigate('/student/complaints')}
        />
        <StatCard
          label="Resolved"
          value={resolvedComplaints}
          icon="✅"
          color="#16A34A"
          bg="#DCFCE7"
          onClick={() =>
            navigate('/student/complaints')}
        />
        <StatCard
          label="Visitor Requests"
          value={pendingVisitors}
          icon="⏳"
          color="#2563EB"
          bg="#DBEAFE"
          onClick={() =>
            navigate('/student/visitors')}
        />
        <StatCard
          label="Approved Visitors"
          value={approvedVisitors}
          icon="✅"
          color="#7C3AED"
          bg="#F3E8FF"
          onClick={() =>
            navigate('/student/visitors')}
        />
      </div>

      {/* Quick Actions */}
      <div className="card"
        style={{ padding: '20px' }}>
        <h2 style={{
          fontSize: '15px',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '16px'
        }}>
          ⚡ Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, 1fr)',
          gap: '12px'
        }}
          className="grid-3">
          {[
            {
              icon: '📋',
              label: 'Raise Complaint',
              path: '/student/complaints',
              color: '#FFF7ED',
              desc: 'Report an issue'
            },
            {
              icon: '👥',
              label: 'Request Visitor',
              path: '/student/visitors',
              color: '#EFF6FF',
              desc: 'Invite someone'
            },
            {
              icon: '🏠',
              label: 'My Room',
              path: '/student/room',
              color: '#F0FDF4',
              desc: 'View room details'
            },
          ].map((action, i) => (
            <div
              key={i}
              onClick={() =>
                navigate(action.path)}
              style={{
                padding: '20px',
                background: action.color,
                borderRadius: '14px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border:
                  '1px solid transparent'
              }}
              onMouseEnter={e => {
                e.currentTarget.style
                  .transform = 'scale(1.02)'
                e.currentTarget.style
                  .borderColor =
                  'var(--border)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style
                  .transform = 'scale(1)'
                e.currentTarget.style
                  .borderColor = 'transparent'
              }}
            >
              <div style={{
                fontSize: '32px',
                marginBottom: '8px'
              }}>
                {action.icon}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text)'
              }}>
                {action.label}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '4px'
              }}>
                {action.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notices + Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}
        className="grid-2">

        {/* Notices */}
        <div className="card"
          style={{ padding: '20px' }}>
          <h2 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '16px'
          }}>
            📢 Notice Board
          </h2>
          {data.notices.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '32px'
              }}>📢</div>
              <p style={{
                marginTop: '8px',
                fontSize: '13px'
              }}>
                No notices!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {data.notices
                .slice(0, 4)
                .map(notice => (
                <div key={notice._id}
                  style={{
                    padding: '12px',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    borderLeft:
                      notice.type === 'urgent'
                        ? '3px solid #ef4444'
                        : notice.type === 'event'
                        ? '3px solid #10b981'
                        : '3px solid var(--primary)'
                  }}>
                  <p style={{
                    fontWeight: '600',
                    fontSize: '13px',
                    color: 'var(--text)'
                  }}>
                    {notice.title}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginTop: '3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {notice.content}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '4px'
                  }}>
                    {new Date(notice.createdAt)
                      .toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Complaints */}
        <div className="card"
          style={{ padding: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text)'
            }}>
              📋 Recent Complaints
            </h2>
            <button
              onClick={() =>
                navigate(
                  '/student/complaints'
                )}
              style={{
                fontSize: '12px',
                color: 'var(--primary)',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View all →
            </button>
          </div>

          {data.complaints.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '32px'
              }}>📋</div>
              <p style={{
                marginTop: '8px',
                fontSize: '13px'
              }}>
                No complaints!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {data.complaints
                .slice(0, 4)
                .map(c => (
                <div key={c._id}
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: '#F8FAFC',
                    borderRadius: '10px'
                  }}>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      fontSize: '13px',
                      color: 'var(--text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '160px'
                    }}>
                      {c.title}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      textTransform: 'capitalize'
                    }}>
                      {c.category}
                    </p>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background:
                      c.status === 'resolved'
                        ? '#DCFCE7'
                        : c.status === 'pending'
                        ? '#FEF3C7'
                        : '#DBEAFE',
                    color:
                      c.status === 'resolved'
                        ? '#16A34A'
                        : c.status === 'pending'
                        ? '#D97706'
                        : '#2563EB',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap'
                  }}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}