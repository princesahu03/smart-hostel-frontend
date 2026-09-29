import { useState } from 'react'
import api from '../../api/axios'
import { useAuth } from
  '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function TeacherProfile() {
  const { user } = useAuth()
  const [editing, setEditing] =
    useState(false)
  const [form, setForm] = useState({
    designation: user?.designation || '',
    subject: user?.subject || '',
    officeHours: user?.officeHours || '',
    officeRoom: user?.officeRoom || '',
    phone: user?.phone || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(
        '/teachers/profile', form
      )
      toast.success('Profile updated! ✅')
      setEditing(false)
    } catch {
      toast.error('Failed!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: 'var(--text)',
          fontFamily: 'Space Grotesk'
        }}>
          👨‍🏫 My Profile
        </h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}
        className="grid-2">

        {/* Profile Card */}
        <div className="card"
          style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text)',
                fontFamily: 'Space Grotesk'
              }}>
                {user?.name}
              </h2>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Info list */}
          {[
            {
              label: 'Teacher ID',
              value: user?.teacherId || '—'
            },
            {
              label: 'Designation',
              value: user?.designation || '—'
            },
            {
              label: 'Subject',
              value: user?.subject || '—'
            },
            {
              label: 'Floor Assigned',
              value: user?.assignedFloor
                ? `Floor ${user.assignedFloor}`
                : 'Not assigned'
            },
            {
              label: 'Warden Level',
              value: user?.wardenLevel
                ? user.wardenLevel
                  .replace('_', ' ')
                : 'N/A'
            },
            {
              label: 'Office Hours',
              value: user?.officeHours || '—'
            },
            {
              label: 'Office Room',
              value: user?.officeRoom || '—'
            },
            {
              label: 'Phone',
              value: user?.phone || '—'
            },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom:
                i < 7
                  ? '1px solid var(--border)'
                  : 'none',
              fontSize: '13px'
            }}>
              <span style={{
                color: 'var(--text-muted)',
                fontWeight: '600'
              }}>
                {item.label}
              </span>
              <span style={{
                color: 'var(--text)',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {item.value}
              </span>
            </div>
          ))}

          <button
            onClick={() => setEditing(true)}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '10px'
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="card"
            style={{ padding: '24px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              ✏️ Edit Profile
            </h2>

            <form onSubmit={handleSave}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
              {[
                {
                  key: 'designation',
                  label: 'Designation',
                  placeholder:
                    'e.g. Assistant Professor'
                },
                {
                  key: 'subject',
                  label: 'Subject',
                  placeholder:
                    'e.g. Computer Science'
                },
                {
                  key: 'officeHours',
                  label: 'Office Hours',
                  placeholder:
                    'e.g. Mon-Fri 10AM-4PM'
                },
                {
                  key: 'officeRoom',
                  label: 'Office Room',
                  placeholder:
                    'e.g. CS-201'
                },
                {
                  key: 'phone',
                  label: 'Phone',
                  placeholder: '10 digit number'
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
                    value={form[field.key]}
                    onChange={e =>
                      setForm({
                        ...form,
                        [field.key]:
                          e.target.value
                      })}
                    placeholder={
                      field.placeholder
                    }
                    className="input"
                  />
                </div>
              ))}

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setEditing(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border:
                      '1.5px solid var(--border)',
                    borderRadius: '10px',
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
                  disabled={saving}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '10px',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving
                    ? '⏳ Saving...'
                    : '💾 Save'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}