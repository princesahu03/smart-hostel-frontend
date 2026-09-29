import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from
  '../../context/AuthContext'
import Loader from '../../components/Loader'

export default function StaffDashboard() {
  const { user } = useAuth()
  const [complaints, setComplaints] =
    useState([])
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const res = await api.get(
        '/complaints/staff'
      )
      setComplaints(res.data.data)
    } catch {}
    finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Loader text="Loading..." />
  )

  const pending = complaints.filter(
    c => c.status === 'pending' ||
         c.status === 'assigned'
  ).length

  const inProgress = complaints.filter(
    c => c.status === 'in_progress'
  ).length

  const resolved = complaints.filter(
    c => c.status === 'resolved'
  ).length

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: 'var(--text)',
          fontFamily: 'Space Grotesk'
        }}>
          👷 Staff Dashboard
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          Welcome, {user?.name}!
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}
        className="grid-3">
        {[
          {
            label: 'Pending Tasks',
            value: pending,
            icon: '⏳',
            bg: '#FEF3C7',
            color: '#D97706'
          },
          {
            label: 'In Progress',
            value: inProgress,
            icon: '🔄',
            bg: '#DBEAFE',
            color: '#2563EB'
          },
          {
            label: 'Resolved',
            value: resolved,
            icon: '✅',
            bg: '#DCFCE7',
            color: '#16A34A'
          },
        ].map((s, i) => (
          <div key={i} className="card"
            style={{ padding: '20px' }}>
            <div style={{
              fontSize: '28px',
              marginBottom: '8px'
            }}>
              {s.icon}
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              color: s.color,
              fontFamily: 'Space Grotesk'
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '4px'
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <h2 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: 'var(--text)'
      }}>
        📋 My Assigned Tasks
      </h2>

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
            No tasks assigned yet!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {complaints.slice(0, 5).map(c => (
            <div key={c._id}
              className="card"
              style={{
                padding: '16px',
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
                gap: '8px'
              }}>
                <div>
                  <p style={{
                    fontWeight: '700',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}>
                    {c.title}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginTop: '4px'
                  }}>
                    👤 {c.student?.name} •
                    Room {c.roomNumber || '—'}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                    textTransform: 'capitalize'
                  }}>
                    📁 {c.category} •{' '}
                    {c.priority} priority
                  </p>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background:
                    c.status === 'resolved'
                      ? '#DCFCE7'
                      : c.status ===
                        'in_progress'
                      ? '#DBEAFE'
                      : '#FEF3C7',
                  color:
                    c.status === 'resolved'
                      ? '#16A34A'
                      : c.status ===
                        'in_progress'
                      ? '#2563EB'
                      : '#D97706',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap'
                }}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}