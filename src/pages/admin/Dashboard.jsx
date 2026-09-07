import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from
  '../../context/AuthContext'
import api from '../../api/axios'
import StatCard from
  '../../components/StatCard'
import Loader from '../../components/Loader'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart,
  Pie, Cell, Legend
} from 'recharts'

const COLORS = [
  '#1a3c5e', '#10b981',
  '#f59e0b', '#ef4444', '#8b5cf6'
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    rooms: null,
    complaints: null,
    visitors: null,
    notices: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [
        roomsRes,
        complaintsRes,
        visitorsRes,
        noticesRes
      ] = await Promise.all([
        api.get('/rooms/analytics'),
        api.get('/complaints/analytics'),
        api.get('/visitors/analytics'),
        api.get('/notices')
      ])

      setData({
        rooms: roomsRes.data.data,
        complaints: complaintsRes.data.data,
        visitors: visitorsRes.data.data,
        notices: noticesRes.data.data
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
  const totalRooms =
    data.rooms?.totalRooms || 0
  const availableRooms =
    data.rooms?.byStatus?.find(
      s => s._id === 'available'
    )?.count || 0
  const fullRooms =
    data.rooms?.byStatus?.find(
      s => s._id === 'full'
    )?.count || 0

  const pendingComplaints =
    data.complaints?.byStatus?.find(
      s => s._id === 'pending'
    )?.count || 0
  const resolvedComplaints =
    data.complaints?.byStatus?.find(
      s => s._id === 'resolved'
    )?.count || 0

  const pendingVisitors =
    data.visitors?.byStatus?.find(
      s => s._id === 'pending'
    )?.count || 0
  const checkedInVisitors =
    data.visitors?.byStatus?.find(
      s => s._id === 'checked_in'
    )?.count || 0

  // Chart data:
  const complaintChartData =
    data.complaints?.byCategory?.map(c => ({
      name: c._id,
      count: c.count
    })) || []

  const roomChartData =
    data.rooms?.byFloor?.map(f => ({
      name: `Floor ${f._id}`,
      rooms: f.rooms,
      occupants: f.occupants
    })) || []

  const visitorPieData =
    data.visitors?.byRelation?.map(v => ({
      name: v._id,
      value: v.count
    })) || []

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

        <button
          onClick={() =>
            navigate('/admin/notices')}
          className="btn-primary"
        >
          + Post Notice
        </button>
      </div>

      {/* Stats Row 1 — Rooms */}
      <div>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          🏠 Room Overview
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, 1fr)',
          gap: '16px'
        }}
          className="grid-3">
          <StatCard
            label="Total Rooms"
            value={totalRooms}
            icon="🏠"
            color="var(--primary)"
            bg="#EFF6FF"
            onClick={() =>
              navigate('/admin/rooms')}
          />
          <StatCard
            label="Available Rooms"
            value={availableRooms}
            icon="✅"
            color="#10b981"
            bg="#DCFCE7"
            onClick={() =>
              navigate('/admin/rooms')}
          />
          <StatCard
            label="Full Rooms"
            value={fullRooms}
            icon="🔴"
            color="#ef4444"
            bg="#FEE2E2"
            onClick={() =>
              navigate('/admin/rooms')}
          />
        </div>
      </div>

      {/* Stats Row 2 — Complaints */}
      <div>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          📋 Complaints Overview
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, 1fr)',
          gap: '16px'
        }}
          className="grid-3">
          <StatCard
            label="Pending"
            value={pendingComplaints}
            icon="⏳"
            color="#f97316"
            bg="#FFF7ED"
            onClick={() =>
              navigate('/admin/complaints')}
          />
          <StatCard
            label="Resolved"
            value={resolvedComplaints}
            icon="✅"
            color="#10b981"
            bg="#DCFCE7"
            onClick={() =>
              navigate('/admin/complaints')}
          />
          <StatCard
            label="Visitors Today"
            value={checkedInVisitors}
            icon="👥"
            color="#8b5cf6"
            bg="#F3E8FF"
            onClick={() =>
              navigate('/admin/visitors')}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}
        className="grid-2">

        {/* Complaints by Category */}
        <div className="card"
          style={{ padding: '20px' }}>
          <h2 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '20px'
          }}>
            📋 Complaints by Category
          </h2>
          {complaintChartData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text-muted)'
            }}>
              No complaints yet!
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={200}>
              <BarChart
                data={complaintChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#1a3c5e"
                  radius={[6, 6, 0, 0]}
                  name="Complaints"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Visitor Relations Pie */}
        <div className="card"
          style={{ padding: '20px' }}>
          <h2 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '20px'
          }}>
            👥 Visitor Relations
          </h2>
          {visitorPieData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text-muted)'
            }}>
              No visitors yet!
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={200}>
              <PieChart>
                <Pie
                  data={visitorPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {visitorPieData.map(
                    (_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i %
                        COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={v => (
                    <span style={{
                      fontSize: '12px'
                    }}>
                      {v}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Floor wise rooms */}
      {roomChartData.length > 0 && (
        <div className="card"
          style={{ padding: '20px' }}>
          <h2 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '20px'
          }}>
            🏠 Floor-wise Occupancy
          </h2>
          <ResponsiveContainer
            width="100%"
            height={200}>
            <BarChart data={roomChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F5F9"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  fontSize: '12px'
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="rooms"
                fill="#1a3c5e"
                name="Rooms"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="occupants"
                fill="#10b981"
                name="Occupants"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pending Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}
        className="grid-2">

        {/* Pending Visitors */}
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
              👥 Pending Visitors
            </h2>
            <span style={{
              background: '#FEF3C7',
              color: '#D97706',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {pendingVisitors} pending
            </span>
          </div>

          {pendingVisitors === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '32px'
              }}>✅</div>
              <p style={{
                marginTop: '8px',
                fontSize: '13px'
              }}>
                No pending visitors!
              </p>
            </div>
          ) : (
            <button
              onClick={() =>
                navigate('/admin/visitors')}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '10px'
              }}
            >
              Review Visitor Requests →
            </button>
          )}
        </div>

        {/* Recent Notices */}
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
              📢 Recent Notices
            </h2>
            <button
              onClick={() =>
                navigate('/admin/notices')}
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
                No notices posted!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {data.notices
                .slice(0, 3)
                .map(notice => (
                <div key={notice._id}
                  style={{
                    padding: '10px 12px',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    borderLeft:
                      `3px solid ${
                        notice.type === 'urgent'
                          ? '#ef4444'
                          : notice.type === 'event'
                          ? '#10b981'
                          : 'var(--primary)'
                      }`
                  }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    {notice.title}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '3px'
                  }}>
                    {new Date(notice.createdAt)
                      .toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
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
            'repeat(4, 1fr)',
          gap: '12px'
        }}
          className="grid-4">
          {[
            {
              icon: '🏠',
              label: 'Add Room',
              path: '/admin/rooms',
              color: '#EFF6FF'
            },
            {
              icon: '👥',
              label: 'Allot Room',
              path: '/admin/rooms',
              color: '#F0FDF4'
            },
            {
              icon: '📋',
              label: 'View Complaints',
              path: '/admin/complaints',
              color: '#FFF7ED'
            },
            {
              icon: '📢',
              label: 'Post Notice',
              path: '/admin/notices',
              color: '#FDF4FF'
            },
          ].map((action, i) => (
            <div
              key={i}
              onClick={() =>
                navigate(action.path)}
              style={{
                padding: '16px',
                background: action.color,
                borderRadius: '14px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style
                  .transform = 'scale(1.02)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style
                  .transform = 'scale(1)'
              }}
            >
              <div style={{
                fontSize: '28px'
              }}>
                {action.icon}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text)',
                marginTop: '8px'
              }}>
                {action.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}