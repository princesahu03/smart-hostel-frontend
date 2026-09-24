import { NavLink, useNavigate } from'react-router-dom'
import { useAuth } from'../context/AuthContext'
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
]

const studentMenu = [
  { path: '/student', icon: '⊞',
    label: 'Dashboard' },
  { path: '/student/room', icon: '🏠',
    label: 'My Room' },
  { path: '/student/complaints', icon: '📋',
    label: 'Complaints' },
  { path: '/student/visitors', icon: '👥',
    label: 'My Visitors' },
  { path: '/student/qr',
  icon: '🔲', label: 'My QR' },

]

const securityMenu = [
  { path: '/security', icon: '🔐',
    label: 'Visitor Gate' },
  { path: '/security/scanner',
  icon: '📷', label: 'QR Scanner' },
  { path: '/security',
  icon: '🔐', label: 'Visitor Gate' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const menuItems =
    user?.role === 'admin' ? adminMenu
    : user?.role === 'student' ? studentMenu
    : securityMenu

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out!')
      navigate('/login')
    } catch {
      toast.error('Logout failed!')
    }
  }

  const roleColor =
    user?.role === 'admin' ? '#f59e0b'
    : user?.role === 'student' ? '#10b981'
    : '#60a5fa'

  const roleLabel =
    user?.role === 'admin' ? '👑 Admin'
    : user?.role === 'student' ? '🎓 Student'
    : '🔐 Security'

  return (
    <aside className="sidebar" style={{
      width: '240px',
      background: 'var(--primary)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom:
          '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'var(--accent)',
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
        gap: '4px'
      }}>
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={
              item.path === '/admin' ||
              item.path === '/student' ||
              item.path === '/security'
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
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div style={{
        padding: '16px 12px',
        borderTop:
          '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.08)',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: roleColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
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

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '9px',
            borderRadius: '10px',
            background:
              'rgba(239,68,68,0.15)',
            color: '#FCA5A5',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}