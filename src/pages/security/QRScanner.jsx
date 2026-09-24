import { useState, useEffect, useRef }from 'react'
import { BrowserMultiFormatReader }from '@zxing/library'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function QRScanner() {
  const [scanning, setScanning] =useState(false)
  const [scanType, setScanType] =useState('entry')
  const [mealType, setMealType] =useState('lunch')
  const [lastScan, setLastScan] =useState(null)
  const [manualQR, setManualQR] =useState('')
  const [todayStats, setTodayStats] =useState(null)
  const [loading, setLoading] =useState(false)
  const videoRef = useRef(null)
  const readerRef = useRef(null)

  useEffect(() => {
    fetchTodayStats()
    return () => stopScanner()
  }, [])

  const fetchTodayStats = async () => {
    try {
      const res = await api.get(
        '/qr/today-log'
      )
      setTodayStats(res.data.data.stats)
    } catch {}
  }

  const startScanner = async () => {
    setScanning(true)
    try {
      readerRef.current =
        new BrowserMultiFormatReader()
      const devices = await
        readerRef.current
          .listVideoInputDevices()

      const backCamera = devices.find(d =>
        d.label.toLowerCase()
          .includes('back')
      ) || devices[0]

      await readerRef.current
        .decodeFromVideoDevice(
          backCamera?.deviceId,
          videoRef.current,
          async (result, err) => {
            if (result) {
              await handleScan(
                result.getText()
              )
              stopScanner()
            }
          }
        )
    } catch {
      toast.error(
        'Camera not available!'
      )
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
    setScanning(false)
  }

  const handleScan = async (qrCode) => {
    if (loading) return
    setLoading(true)

    try {
      const body = {
        qrCode,
        type: scanType
      }
      if (scanType === 'meal') {
        body.mealType = mealType
      }

      const res = await api.post(
        '/qr/scan', body
      )

      setLastScan(res.data.data)
      toast.success(res.data.data.message)
      fetchTodayStats()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Scan failed!'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: 'var(--text)',
          fontFamily: 'Space Grotesk'
        }}>
          📷 QR Scanner
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
              month: 'long'
            }
          )}
        </p>
      </div>

      {/* Today Stats */}
      {todayStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}
          className="grid-4">
          {[
            {
              label: 'Entries',
              value: todayStats.totalEntries,
              icon: '🏠',
              bg: '#DCFCE7',
              color: '#16A34A'
            },
            {
              label: 'Exits',
              value: todayStats.totalExits,
              icon: '🚶',
              bg: '#DBEAFE',
              color: '#2563EB'
            },
            {
              label: 'Late Entries',
              value: todayStats.lateEntries,
              icon: '⚠️',
              bg: '#FEE2E2',
              color: '#DC2626'
            },
            {
              label: 'Meal Scans',
              value: todayStats.mealScans,
              icon: '🍽️',
              bg: '#FEF3C7',
              color: '#D97706'
            },
          ].map((s, i) => (
            <div key={i} className="card"
              style={{ padding: '16px' }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '8px'
              }}>
                {s.icon}
              </div>
              <div style={{
                fontSize: '22px',
                fontWeight: '800',
                color: s.color,
                fontFamily: 'Space Grotesk'
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}
        className="grid-2">

        {/* Scanner Section */}
        <div className="card"
          style={{ padding: '20px' }}>

          {/* Scan Type */}
          <div style={{
            marginBottom: '16px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}>
              Scan Type
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {[
                { value: 'entry',
                  label: '🏠 Entry' },
                { value: 'exit',
                  label: '🚶 Exit' },
                { value: 'meal',
                  label: '🍽️ Meal' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() =>
                    setScanType(t.value)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background:
                      scanType === t.value
                        ? 'var(--primary)'
                        : '#F1F5F9',
                    color:
                      scanType === t.value
                        ? 'white'
                        : 'var(--text-muted)',
                    border: 'none'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Type (if meal selected) */}
          {scanType === 'meal' && (
            <div style={{
              marginBottom: '16px'
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}>
                Meal Type
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(3, 1fr)',
                gap: '8px'
              }}>
                {[
                  { value: 'breakfast',
                    label: '🌅 Breakfast' },
                  { value: 'lunch',
                    label: '☀️ Lunch' },
                  { value: 'dinner',
                    label: '🌙 Dinner' },
                ].map(m => (
                  <button
                    key={m.value}
                    onClick={() =>
                      setMealType(m.value)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background:
                        mealType === m.value
                          ? '#D97706'
                          : '#F1F5F9',
                      color:
                        mealType === m.value
                          ? 'white'
                          : 'var(--text-muted)',
                      border: 'none'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Camera Scanner */}
          {scanning ? (
            <div>
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#000',
                marginBottom: '12px'
              }}>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover'
                  }}
                />
                {/* Scan overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '160px',
                    height: '160px',
                    border:
                      '2px solid #F59E0B',
                    borderRadius: '8px',
                    boxShadow:
                      '0 0 0 9999px rgba(0,0,0,0.5)'
                  }} />
                </div>
              </div>
              <button
                onClick={stopScanner}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✕ Stop Scanner
              </button>
            </div>
          ) : (
            <button
              onClick={startScanner}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '16px'
              }}
            >
              📷 Start Camera Scanner
            </button>
          )}

          {/* Manual Entry */}
          <div style={{
            borderTop:
              '1px solid var(--border)',
            paddingTop: '16px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '6px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}>
              Manual QR Entry
            </label>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                value={manualQR}
                onChange={e =>
                  setManualQR(e.target.value)}
                placeholder="Enter QR code..."
                className="input"
                onKeyDown={e => {
                  if (e.key === 'Enter' &&
                      manualQR) {
                    handleScan(manualQR)
                    setManualQR('')
                  }
                }}
              />
              <button
                onClick={() => {
                  if (manualQR) {
                    handleScan(manualQR)
                    setManualQR('')
                  }
                }}
                disabled={!manualQR || loading}
                className="btn-primary"
                style={{
                  whiteSpace: 'nowrap',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳' : 'Scan'}
              </button>
            </div>
          </div>
        </div>

        {/* Last Scan Result */}
        <div>
          {lastScan ? (
            <div className="card"
              style={{ padding: '20px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '16px',
                color: lastScan.isLate
                  ? '#DC2626'
                  : '#16A34A'
              }}>
                {lastScan.isLate
                  ? '⚠️ LATE ENTRY!'
                  : '✅ Scan Successful!'}
              </h2>

              {/* Student Photo */}
              {lastScan.student.photo && (
                <img
                  src={lastScan.student.photo}
                  alt="Student"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `3px solid ${
                      lastScan.isLate
                        ? '#DC2626'
                        : '#16A34A'
                    }`,
                    marginBottom: '12px'
                  }}
                />
              )}

              {/* Student Info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {[
                  {
                    label: 'Name',
                    value:
                      lastScan.student.name
                  },
                  {
                    label: 'Student ID',
                    value:
                      lastScan.student.studentId
                  },
                  {
                    label: 'Room',
                    value:
                      lastScan.student.roomNumber
                      || 'Not Allotted'
                  },
                  {
                    label: 'Status',
                    value:
                      lastScan.student
                        .currentStatus
                        .toUpperCase()
                  },
                ].map((info, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    padding: '8px 12px',
                    background: '#F8FAFC',
                    borderRadius: '8px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      fontWeight: '600'
                    }}>
                      {info.label}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--text)'
                    }}>
                      {info.value}
                    </span>
                  </div>
                ))}

                {/* Late entry warning */}
                {lastScan.isLate && (
                  <div style={{
                    padding: '12px',
                    background: '#FEE2E2',
                    borderRadius: '10px',
                    border: '1px solid #FECACA'
                  }}>
                    <p style={{
                      color: '#DC2626',
                      fontWeight: '700',
                      fontSize: '13px'
                    }}>
                      ⚠️ CURFEW VIOLATION!
                    </p>
                    <p style={{
                      color: '#DC2626',
                      fontSize: '12px',
                      marginTop: '4px'
                    }}>
                      Total Violations:{' '}
                      {lastScan.student
                        .curfewViolations}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card"
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '12px'
              }}>
                📷
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Scan a QR code to see
                student details!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}