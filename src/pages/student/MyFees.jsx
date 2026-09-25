import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loader from '../../components/Loader'

const MONTHS = [
  'January', 'February', 'March',
  'April', 'May', 'June', 'July',
  'August', 'September', 'October',
  'November', 'December'
]

const FEE_TYPE_LABELS = {
  hostel_fee: '🏠 Hostel Fee',
  mess_fee: '🍽️ Mess Fee',
  maintenance_fee: '🔧 Maintenance',
  security_deposit: '🔒 Security Deposit',
  late_fee: '⏰ Late Fee',
  other: '📋 Other'
}

export default function MyFees() {
  const [data, setData] = useState(null)
  const [loading, setLoading] =
    useState(true)
  const [filterStatus, setFilterStatus] =
    useState('')

  useEffect(() => {
    fetchFees()
  }, [filterStatus])

  const fetchFees = async () => {
    try {
      const params = {}
      if (filterStatus)
        params.status = filterStatus
      const res = await api.get(
        '/fees/my', { params }
      )
      setData(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = (fee) =>
    fee.status === 'pending' &&
    new Date(fee.dueDate) < new Date()

  if (loading) return (
    <Loader text="Loading fees..." />
  )

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
          💰 My Fees
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          Fee history and pending payments
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}
        className="grid-3">
        <div className="card"
          style={{
            padding: '20px',
            background:
              'linear-gradient(135deg, #1a3c5e, #2d5f8a)',
            border: 'none'
          }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '6px'
          }}>
            Total Paid
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '800',
            color: 'white',
            fontFamily: 'Space Grotesk'
          }}>
            ₹{(data?.totalPaid || 0)
              .toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card"
          style={{
            padding: '20px',
            background: '#FEF3C7',
            border: '1px solid #FDE68A'
          }}>
          <div style={{
            fontSize: '12px',
            color: '#92400E',
            marginBottom: '6px'
          }}>
            Total Pending
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#D97706',
            fontFamily: 'Space Grotesk'
          }}>
            ₹{(data?.totalPending || 0)
              .toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card"
          style={{ padding: '20px' }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '6px'
          }}>
            Total Records
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '800',
            color: 'var(--text)',
            fontFamily: 'Space Grotesk'
          }}>
            {data?.total || 0}
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {data?.fees?.some(f =>
        isOverdue(f)
      ) && (
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            fontSize: '20px'
          }}>
            ⚠️
          </span>
          <div>
            <p style={{
              fontWeight: '700',
              color: '#DC2626',
              fontSize: '14px'
            }}>
              You have overdue fees!
            </p>
            <p style={{
              fontSize: '12px',
              color: '#DC2626',
              opacity: 0.8
            }}>
              Please pay immediately to
              avoid late fee charges.
              Contact warden for payment.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: '', label: 'All' },
          { value: 'pending',
            label: '⏳ Pending' },
          { value: 'paid', label: '✅ Paid' },
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
      </div>

      {/* Fee List */}
      {!data?.fees?.length ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '48px' }}>
            💰
          </div>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            marginTop: '12px'
          }}>
            No fee records found!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {data.fees.map(fee => (
            <div key={fee._id}
              className="card"
              style={{
                padding: '16px 20px',
                borderLeft: `4px solid ${
                  fee.status === 'paid'
                    ? '#10B981'
                    : isOverdue(fee)
                    ? '#DC2626'
                    : '#F59E0B'
                }`
              }}>
              <div style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '15px',
                      color: 'var(--text)'
                    }}>
                      {FEE_TYPE_LABELS[
                        fee.feeType
                      ] || fee.feeType}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      background:
                        fee.status === 'paid'
                          ? '#DCFCE7'
                          : isOverdue(fee)
                          ? '#FEE2E2'
                          : '#FEF3C7',
                      color:
                        fee.status === 'paid'
                          ? '#16A34A'
                          : isOverdue(fee)
                          ? '#DC2626'
                          : '#D97706',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {fee.status === 'paid'
                        ? '✅ Paid'
                        : isOverdue(fee)
                        ? '⚠️ Overdue'
                        : '⏳ Pending'}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <span>
                      📅{' '}
                      {MONTHS[fee.month - 1]}{' '}
                      {fee.year}
                    </span>
                    <span>
                      Due:{' '}
                      {new Date(fee.dueDate)
                        .toLocaleDateString(
                          'en-IN'
                        )}
                    </span>
                    {fee.status === 'paid' && (
                      <span style={{
                        color: '#16A34A'
                      }}>
                        Paid:{' '}
                        {new Date(fee.paidAt)
                          .toLocaleDateString(
                            'en-IN'
                          )}
                        {fee.paymentMethod &&
                          ` (${fee.paymentMethod
                            .toUpperCase()})`}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: fee.status === 'paid'
                      ? '#16A34A'
                      : isOverdue(fee)
                      ? '#DC2626'
                      : 'var(--primary)',
                    fontFamily: 'Space Grotesk'
                  }}>
                    ₹{fee.amount
                      .toLocaleString('en-IN')}
                  </div>
                  {fee.lateFee > 0 && (
                    <div style={{
                      fontSize: '12px',
                      color: '#DC2626'
                    }}>
                      +₹{fee.lateFee} late fee
                    </div>
                  )}
                  {fee.status !== 'paid' &&
                    !isOverdue(fee) && (
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '4px'
                    }}>
                      Contact warden to pay
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}