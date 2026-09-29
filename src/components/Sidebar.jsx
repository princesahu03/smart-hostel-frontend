import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from'react-router-dom'
import { useAuth } from'../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const adminMenu = [
  { path: '/admin',
    icon: '⊞', label: 'Dashboard' },
  { path: '/admin/rooms',
    icon: '🏠', label: 'Rooms' },
  { path: '/admin/students',
    icon: '👨‍🎓', label: 'Students' },
  { path: '/admin/analytics',
    icon: '📊', label: 'Analytics' },
  { path: '/admin/complaints',
    icon: '📋', label: 'Complaints' },
  { path: '/admin/visitors',
    icon: '👥', label: 'Visitors' },
  { path: '/admin/notices',
    icon: '📢', label: 'Notices' },
  { path: '/admin/mess',
    icon: '🍽️', label: 'Mess' },
  { path: '/admin/fees',
    icon: '💰', label: 'Fees' },
  { path: '/admin/curfew',
    icon: '🌙', label: 'Curfew' },
  { path: '/admin/room-requests',
    icon: '🔄', label: 'Room Requests' },
  { path: '/messages',
    icon: '💬', label: 'Messages' },
  { path: '/admin/wardens',
  icon: '👨‍🏫', label: 'Wardens' },
]

const studentMenu = [
  { path: '/student',
    icon: '⊞', label: 'Dashboard' },
  { path: '/student/room',
    icon: '🏠', label: 'My Room' },
  { path: '/student/complaints',
    icon: '📋', label: 'Complaints' },
  { path: '/student/visitors',
    icon: '👥', label: 'My Visitors' },
  { path: '/student/qr',
    icon: '🔲', label: 'My QR' },
  { path: '/student/mess',
    icon: '🍽️', label: 'Mess Menu' },
  { path: '/student/fees',
    icon: '💰', label: 'My Fees' },
  { path: '/student/curfew',
    icon: '🌙', label: 'Curfew Status' },
  { path: '/student/room-service',
    icon: '🔄', label: 'Room Service' },
  { path: '/messages',
    icon: '💬', label: 'Messages' },
]

const securityMenu = [
  { path: '/security',
    icon: '🔐', label: 'Visitor Gate' },
  { path: '/security/scanner',
    icon: '📷', label: 'QR Scanner' },
  { path: '/messages',
    icon: '💬', label: 'Messages' },
]

const staffMenu = [
  { path: '/staff',
    icon: '⊞', label: 'Dashboard' },
  { path: '/staff/complaints',
    icon: '📋', label: 'My Tasks' },
  { path: '/messages',
    icon: '💬', label: 'Messages' },
]

const teacherMenu = [
  { path: '/teacher',
    icon: '⊞', label: 'Dashboard' },
  { path: '/teacher/floor',
    icon: '🏠', label: 'My Floor' },
  { path: '/teacher/profile',
    icon: '👨‍🏫', label: 'My Profile' },
  { path: '/messages',
    icon: '💬', label: 'Messages' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] =
    useState(0)
  const [loggingOut, setLoggingOut] =
    useState(false)

  // Fetch unread messages:
  useEffect(() => {
    if (!user) return

    const fetchUnread = async () => {
      try {
        const res = await api.get(
          '/messages/unread'
        )
        setUnreadCount(
          res.data.data.count || 0
        )
      } catch {}
    }

    fetchUnread()
    const interval = setInterval(
      fetchUnread, 30000
    )
    return () => clearInterval(interval)
  }, [user])

  // Get menu based on role:
  const menuItems =
    user?.role === 'admin'
    ? adminMenu
    : user?.role === 'student'
    ? studentMenu
    : user?.role === 'security'
    ? securityMenu
    : user?.role === 'staff'
    ? staffMenu
    : user?.role === 'teacher'
    ? teacherMenu    
    : []

  // Role colors:
  const roleColor =
  user?.role === 'admin'
    ? '#f59e0b'
    : user?.role === 'student'
    ? '#10b981'
    : user?.role === 'security'
    ? '#60a5fa'
    : user?.role === 'staff'
    ? '#c084fc'
    : user?.role === 'teacher'
    ? '#fb923c'    
    : '#60a5fa'

  // Role labels:
 const roleLabel =
  user?.role === 'admin'
    ? '👑 Admin'
    : user?.role === 'student'
    ? '🎓 Student'
    : user?.role === 'security'
    ? '🔐 Security'
    : user?.role === 'staff'
    ? '👷 Staff'
    : user?.role === 'teacher'
    ? '👨‍🏫 Teacher'   
    : '👤 User'

  // Logout handler:
  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      toast.success('Logged out! 👋')
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
      // Force logout even if API fails:
      localStorage.removeItem('token')
      toast.success('Logged out! 👋')
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <aside style={{
      width: '240px',
      background: 'var(--primary)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom:
          '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: roleColor,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0
          }}>
            🏠
          </div>
          <div>
            <div style={{
              color: 'white',
              fontWeight: '700',
              fontSize: '16px',
              fontFamily: 'Space Grotesk'
            }}>
              Smart Hostel
            </div>
            <div style={{
              fontSize: '11px',
              color: roleColor,
              fontWeight: '600',
              marginTop: '2px'
            }}>
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto'
      }}>
        {menuItems.map((item, index) => (
          <NavLink
            key={`${item.path}-${index}`}
            to={item.path}
            end={
              item.path === '/admin' ||
              item.path === '/student' ||
              item.path === '/security' ||
              item.path === '/staff'
            }
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: isActive
                ? 'white'
                : 'rgba(255,255,255,0.6)',
              background: isActive
                ? 'rgba(255,255,255,0.12)'
                : 'transparent',
              fontWeight: isActive
                ? '600' : '500',
              fontSize: '14px',
              transition: 'all 0.15s',
              borderLeft: isActive
                ? `3px solid ${roleColor}`
                : '3px solid transparent'
            })}
          >
            <span style={{ fontSize: '18px' }}>
              {item.icon}
            </span>
            <span style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.label}
            </span>

            {/* Unread badge for messages */}
            {item.path === '/messages' &&
              unreadCount > 0 && (
              <span style={{
                background: '#DC2626',
                color: 'white',
                borderRadius: '20px',
                padding: '1px 7px',
                fontSize: '10px',
                fontWeight: '800',
                flexShrink: 0,
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {unreadCount > 99
                  ? '99+'
                  : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div style={{
        padding: '16px 12px',
        borderTop:
          '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0
      }}>
        {/* User card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.08)',
          marginBottom: '8px'
        }}>
          {/* Avatar */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: roleColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '800',
            fontSize: '15px',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {user?.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>

          {/* Name + email */}
          <div style={{
            minWidth: 0,
            flex: 1
          }}>
            <div style={{
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.name}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Room number for student */}
        {user?.role === 'student' &&
          user?.roomNumber && (
          <div style={{
            padding: '6px 10px',
            background:
              'rgba(255,255,255,0.06)',
            borderRadius: '8px',
            marginBottom: '8px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)'
          }}>
            🏠 Room {user.roomNumber}
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            background:
              'rgba(239,68,68,0.15)',
            color: '#FCA5A5',
            border:
              '1px solid rgba(239,68,68,0.2)',
            cursor: loggingOut
              ? 'not-allowed'
              : 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s',
            opacity: loggingOut ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => {
            if (!loggingOut) {
              e.currentTarget.style
                .background =
                'rgba(239,68,68,0.25)'
              e.currentTarget.style
                .color = '#FEE2E2'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style
              .background =
              'rgba(239,68,68,0.15)'
            e.currentTarget.style
              .color = '#FCA5A5'
          }}
        >
          {loggingOut
            ? '⏳ Logging out...'
            : '🚪 Logout'}
        </button>
      </div>
    </aside>
  )
}