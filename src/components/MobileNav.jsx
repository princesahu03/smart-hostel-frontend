import { NavLink } from 'react-router-dom'
import { useAuth } from
  '../context/AuthContext'

export default function MobileNav() {
  const { user } = useAuth()

  const adminItems = [
    { path: '/admin', icon: '⊞',
      label: 'Home' },
    { path: '/admin/rooms', icon: '🏠',
      label: 'Rooms' },
    { path: '/admin/complaints', icon: '📋',
      label: 'Complaints' },
    { path: '/admin/visitors', icon: '👥',
      label: 'Visitors' },
    { path: '/admin/notices', icon: '📢',
      label: 'Notices' },
  ]

  const studentItems = [
    { path: '/student', icon: '⊞',
      label: 'Home' },
    { path: '/student/room', icon: '🏠',
      label: 'Room' },
    { path: '/student/complaints', icon: '📋',
      label: 'Complaints' },
    { path: '/student/visitors', icon: '👥',
      label: 'Visitors' },
  ]

  const items =
    user?.role === 'admin'
      ? adminItems
      : studentItems

  return (
    <nav
      className="mobile-nav"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop:
          '1px solid var(--border)',
        padding: '8px 0',
        zIndex: 40
      }}
    >
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={
            item.path === '/admin' ||
            item.path === '/student'
          }
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            flex: 1,
            textDecoration: 'none',
            color: isActive
              ? 'var(--primary)'
              : '#94A3B8',
            fontSize: '10px',
            fontWeight: isActive
              ? '600' : '400'
          })}
        >
          <span style={{ fontSize: '22px' }}>
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}