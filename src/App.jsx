import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth }from './context/AuthContext'
import Loader from './components/Loader'



// Auth Pages:
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin Pages:
import AdminDashboard from'./pages/admin/Dashboard'
import AdminRooms from'./pages/admin/Rooms'
import AdminStudents from'./pages/admin/Students'
import AdminComplaints from'./pages/admin/Complaints'
import AdminVisitors from'./pages/admin/Visitors'
import AdminNotices from'./pages/admin/Notices'

// Student Pages:
import StudentDashboard from'./pages/student/Dashboard'
import MyRoom from'./pages/student/MyRoom'
import MyComplaints from'./pages/student/MyComplaints'
import MyVisitors from'./pages/student/MyVisitors'
import MyQR from './pages/student/MyQR'


// Security Pages:
import VisitorGate from'./pages/security/VisitorGate'
import QRScanner from'./pages/security/QRScanner'


// Layout:
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'

// ── Protected Route ──
function ProtectedRoute({
  children, allowedRoles
}) {
  const { user, loading } = useAuth()

  if (loading) return (
    <Loader text="Loading Smart Hostel..." />
  )

  if (!user) return (
    <Navigate to="/login" replace />
  )

  if (allowedRoles &&
    !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// ── Layout ──
function Layout({ children }) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg)',
      overflow: 'hidden'
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px',
        paddingBottom: '80px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }} className="fade-in">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}

// ── Role Based Home ──
function Home() {
  const { user } = useAuth()

  if (!user) return (
    <Navigate to="/login" replace />
  )

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />
    case 'student':
      return <Navigate to="/student" replace />
    case 'security':
      return <Navigate to="/security" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

// ── App Routes ──
function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={
        user
          ? <Navigate to="/" replace />
          : <Login />
      } />
      <Route path="/register" element={
        user
          ? <Navigate to="/" replace />
          : <Register />
      } />

      {/* Home → Role redirect */}
      <Route path="/" element={<Home />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute
          allowedRoles={['admin']}>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/rooms" element={
        <ProtectedRoute
          allowedRoles={['admin']}>
          <Layout><AdminRooms /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute
          allowedRoles={['admin']}>
          <Layout><AdminStudents /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/complaints" element={
        <ProtectedRoute
          allowedRoles={['admin', 'staff']}>
          <Layout><AdminComplaints /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/visitors" element={
        <ProtectedRoute
          allowedRoles={['admin']}>
          <Layout><AdminVisitors /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/notices" element={
        <ProtectedRoute
          allowedRoles={['admin']}>
          <Layout><AdminNotices /></Layout>
        </ProtectedRoute>
      } />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute
          allowedRoles={['student']}>
          <Layout><StudentDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/room" element={
        <ProtectedRoute
          allowedRoles={['student']}>
          <Layout><MyRoom /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/complaints"
        element={
        <ProtectedRoute
          allowedRoles={['student']}>
          <Layout><MyComplaints /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/visitors"
        element={
        <ProtectedRoute
          allowedRoles={['student']}>
          <Layout><MyVisitors /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/qr" element={
      <ProtectedRoute
      allowedRoles={['student']}>
      <Layout><MyQR /></Layout>
    </ProtectedRoute>
    } />

      {/* Security Routes */}
      <Route path="/security" element={
        <ProtectedRoute
          allowedRoles={['security']}>
          <Layout><VisitorGate /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/security/scanner" element={
      <ProtectedRoute
      allowedRoles={['security']}>
      <Layout><QRScanner /></Layout>
      </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="/{*path}" element={
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '60px' }}>
            🏠
          </div>
          <h2 style={{ marginTop: '16px' }}>
            Page not found!
          </h2>
          <a href="/" style={{
            color: 'var(--primary)',
            marginTop: '12px',
            display: 'block'
          }}>
            Go Home
          </a>
        </div>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter',
              fontSize: '14px'
            }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}