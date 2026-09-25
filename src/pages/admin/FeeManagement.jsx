import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

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

export default function FeeManagement() {
  const [activeTab, setActiveTab] =
    useState('overview')
  const [loading, setLoading] =
    useState(true)
  const [analytics, setAnalytics] =
    useState(null)
  const [fees, setFees] = useState([])
  const [defaulters, setDefaulters] =
    useState([])
  const [rates, setRates] = useState(null)
  const [showGenerate, setShowGenerate] =
    useState(false)
  const [showPayModal, setShowPayModal] =
    useState(false)
  const [showRatesModal, setShowRatesModal] =
    useState(false)
  const [selectedFee, setSelectedFee] =
    useState(null)
  const [filterMonth, setFilterMonth] =
    useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] =
    useState(new Date().getFullYear())
  const [filterStatus, setFilterStatus] =
    useState('')
  const [generating, setGenerating] =
    useState(false)
  const [saving, setSaving] = useState(false)

  const [generateForm, setGenerateForm] =
    useState({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      includeMess: true,
      includeMaintenance: true
    })

  const [payForm, setPayForm] = useState({
    paidAmount: '',
    paymentMethod: 'cash',
    transactionId: '',
    remarks: ''
  })

  const [ratesForm, setRatesForm] =
    useState({})

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchFees()
  }, [filterMonth, filterYear, filterStatus])

  const fetchData = async () => {
    try {
      const [analyticsRes, defaultersRes,
        ratesRes] = await Promise.all([
        api.get('/fees/analytics'),
        api.get('/fees/defaulters'),
        api.get('/fees/rates')
      ])
      setAnalytics(analyticsRes.data.data)
      setDefaulters(
        defaultersRes.data.data.defaulters
      )
      setRates(ratesRes.data.data)
      setRatesForm(ratesRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFees = async () => {
    try {
      const params = {
        month: filterMonth,
        year: filterYear
      }
      if (filterStatus)
        params.status = filterStatus

      const res = await api.get(
        '/fees/all', { params }
      )
      setFees(res.data.data.fees)
    } catch {}
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await api.post(
        '/fees/generate', generateForm
      )
      const { generated, skipped } =
        res.data.data
      toast.success(
        `${generated} fees generated!
        ${skipped} skipped.`
      )
      setShowGenerate(false)
      fetchData()
      fetchFees()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setGenerating(false)
    }
  }

  const handleMarkPaid = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(
        `/fees/${selectedFee._id}/pay`,
        payForm
      )
      toast.success('Fee marked as paid! ✅')
      setShowPayModal(false)
      setPayForm({
        paidAmount: '',
        paymentMethod: 'cash',
        transactionId: '',
        remarks: ''
      })
      fetchFees()
      fetchData()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRates = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/fees/rates', ratesForm)
      toast.success('Fee rates updated! ✅')
      setShowRatesModal(false)
      fetchData()
    } catch {
      toast.error('Failed!')
    } finally {
      setSaving(false)
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return {
          bg: '#DCFCE7',
          color: '#16A34A'
        }
      case 'pending':
        return {
          bg: '#FEF3C7',
          color: '#D97706'
        }
      case 'overdue':
        return {
          bg: '#FEE2E2',
          color: '#DC2626'
        }
      case 'waived':
        return {
          bg: '#F3E8FF',
          color: '#7C3AED'
        }
      default:
        return {
          bg: '#F1F5F9',
          color: '#64748B'
        }
    }
  }

  const isOverdue = (fee) =>
    fee.status === 'pending' &&
    new Date(fee.dueDate) < new Date()

  const trendData = analytics?.monthlyTrend
    ?.map(t => ({
      name: `${MONTHS[t._id.month - 1]
        .slice(0, 3)} ${t._id.year}`,
      amount: t.total,
      count: t.count
    })).reverse() || []

  if (loading) return (
    <Loader text="Loading fee data..." />
  )

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
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
            💰 Fee Management
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            Hostel fee tracking &
            collection
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() =>
              setShowRatesModal(true)}
            style={{
              padding: '10px 16px',
              border:
                '1.5px solid var(--primary)',
              borderRadius: '10px',
              background: 'white',
              color: 'var(--primary)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ⚙️ Fee Rates
          </button>
          <button
            onClick={() =>
              setShowGenerate(true)}
            className="btn-primary"
          >
            + Generate Monthly Fees
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}
        className="grid-4">
        {[
          {
            label: 'This Month Collection',
            value: `₹${(analytics
              ?.thisMonthCollection || 0)
              .toLocaleString('en-IN')}`,
            icon: '💰',
            bg: '#DCFCE7',
            color: '#16A34A'
          },
          {
            label: 'Total Pending',
            value: `₹${(analytics
              ?.pendingAmount || 0)
              .toLocaleString('en-IN')}`,
            icon: '⏳',
            bg: '#FEF3C7',
            color: '#D97706'
          },
          {
            label: 'Pending Count',
            value: analytics
              ?.pendingCount || 0,
            icon: '📋',
            bg: '#DBEAFE',
            color: '#2563EB'
          },
          {
            label: 'Overdue Fees',
            value: analytics
              ?.overdueFees || 0,
            icon: '⚠️',
            bg: '#FEE2E2',
            color: '#DC2626'
          },
        ].map((card, i) => (
          <div key={i} className="card"
            style={{ padding: '18px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              marginBottom: '10px'
            }}>
              {card.icon}
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '800',
              color: card.color,
              fontFamily: 'Space Grotesk'
            }}>
              {card.value}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '4px'
            }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: 'overview',
            label: '📊 Overview' },
          { value: 'fees',
            label: '📋 All Fees' },
          { value: 'defaulters',
            label: '⚠️ Defaulters' },
          { value: 'rates',
            label: '⚙️ Rate Card' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() =>
              setActiveTab(tab.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              background:
                activeTab === tab.value
                  ? 'var(--primary)'
                  : 'white',
              color:
                activeTab === tab.value
                  ? 'white'
                  : 'var(--text-muted)',
              border:
                activeTab === tab.value
                  ? '1.5px solid var(--primary)'
                  : '1.5px solid var(--border)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Monthly trend chart */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--text)'
            }}>
              📈 Monthly Collection Trend
            </h2>
            {trendData.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: 'var(--text-muted)'
              }}>
                No collection data yet!
              </div>
            ) : (
              <ResponsiveContainer
                width="100%" height={240}>
                <BarChart data={trendData}>
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
                    tickFormatter={v =>
                      `₹${(v/1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    formatter={v =>
                      [`₹${v.toLocaleString('en-IN')}`,
                        'Collected']}
                    contentStyle={{
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#1a3c5e"
                    radius={[6, 6, 0, 0]}
                    name="Collection"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Collection by type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {analytics?.collectionByType
              ?.map((type, i) => (
              <div key={i} className="card"
                style={{ padding: '16px' }}>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginBottom: '6px'
                }}>
                  {FEE_TYPE_LABELS[type._id]
                    || type._id}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#16A34A',
                  fontFamily: 'Space Grotesk'
                }}>
                  ₹{type.total
                    .toLocaleString('en-IN')}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '2px'
                }}>
                  {type.count} payments
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Fees Tab */}
      {activeTab === 'fees' && (
        <div>
          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <select
              value={filterMonth}
              onChange={e =>
                setFilterMonth(
                  parseInt(e.target.value)
                )}
              className="input"
              style={{
                width: 'auto',
                padding: '8px 14px'
              }}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={e =>
                setFilterYear(
                  parseInt(e.target.value)
                )}
              className="input"
              style={{
                width: 'auto',
                padding: '8px 14px'
              }}
            >
              {[2024, 2025, 2026, 2027]
                .map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {['', 'pending', 'paid',
              'overdue'].map(s => (
              <button
                key={s}
                onClick={() =>
                  setFilterStatus(s)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background:
                    filterStatus === s
                      ? 'var(--primary)'
                      : 'white',
                  color:
                    filterStatus === s
                      ? 'white'
                      : 'var(--text-muted)',
                  border:
                    filterStatus === s
                      ? '1.5px solid var(--primary)'
                      : '1.5px solid var(--border)'
                }}
              >
                {s === '' ? 'All'
                  : s === 'pending' ? '⏳ Pending'
                  : s === 'paid' ? '✅ Paid'
                  : '⚠️ Overdue'}
              </button>
            ))}
          </div>

          {fees.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                💰
              </div>
              <p style={{
                fontSize: '14px',
                marginTop: '12px'
              }}>
                No fees for selected period!
              </p>
              <button
                onClick={() =>
                  setShowGenerate(true)}
                className="btn-primary"
                style={{ marginTop: '16px' }}
              >
                Generate Monthly Fees
              </button>
            </div>
          ) : (
            <div className="card"
              style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px'
                }}>
                  <thead>
                    <tr style={{
                      background: '#F8FAFC',
                      borderBottom:
                        '1px solid var(--border)'
                    }}>
                      {['Student', 'Room',
                        'Fee Type', 'Amount',
                        'Due Date', 'Status',
                        'Action']
                        .map(h => (
                        <th key={h} style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          color:
                            'var(--text-muted)',
                          fontWeight: '600',
                          fontSize: '11px',
                          textTransform:
                            'uppercase',
                          whiteSpace: 'nowrap'
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map(fee => {
                      const statusStyle =
                        getStatusStyle(
                          isOverdue(fee)
                            ? 'overdue'
                            : fee.status
                        )
                      return (
                        <tr key={fee._id}
                          className="table-row"
                          style={{
                            borderBottom:
                              '1px solid var(--border)',
                            background:
                              isOverdue(fee)
                                ? '#FFF5F5'
                                : 'white'
                          }}>
                          <td style={{
                            padding: '12px 16px'
                          }}>
                            <div style={{
                              fontWeight: '700',
                              color: 'var(--text)'
                            }}>
                              {fee.student?.name}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color:
                                'var(--text-muted)'
                            }}>
                              {fee.student
                                ?.studentId}
                            </div>
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            color:
                              'var(--text-muted)'
                          }}>
                            {fee.student
                              ?.roomNumber
                              || fee.room
                                ?.roomNumber
                              || '—'}
                          </td>
                          <td style={{
                            padding: '12px 16px'
                          }}>
                            <span style={{
                              padding: '3px 8px',
                              background:
                                '#EFF6FF',
                              color:
                                'var(--primary)',
                              borderRadius:
                                '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              whiteSpace:
                                'nowrap'
                            }}>
                              {FEE_TYPE_LABELS[
                                fee.feeType
                              ] || fee.feeType}
                            </span>
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            fontWeight: '700',
                            color: 'var(--text)'
                          }}>
                            ₹{fee.amount
                              .toLocaleString(
                                'en-IN'
                              )}
                            {fee.lateFee > 0 && (
                              <div style={{
                                fontSize: '11px',
                                color: '#DC2626'
                              }}>
                                +₹{fee.lateFee}
                                late
                              </div>
                            )}
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            color:
                              isOverdue(fee)
                                ? '#DC2626'
                                : 'var(--text-muted)',
                            fontWeight:
                              isOverdue(fee)
                                ? '700'
                                : '400',
                            fontSize: '12px',
                            whiteSpace: 'nowrap'
                          }}>
                            {new Date(fee.dueDate)
                              .toLocaleDateString(
                                'en-IN'
                              )}
                            {isOverdue(fee) &&
                              ' ⚠️'}
                          </td>
                          <td style={{
                            padding: '12px 16px'
                          }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius:
                                '20px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background:
                                statusStyle.bg,
                              color:
                                statusStyle.color,
                              textTransform:
                                'capitalize'
                            }}>
                              {isOverdue(fee)
                                ? '⚠️ Overdue'
                                : fee.status
                                  === 'paid'
                                ? '✅ Paid'
                                : '⏳ Pending'}
                            </span>
                          </td>
                          <td style={{
                            padding: '12px 16px'
                          }}>
                            {fee.status !==
                              'paid' && (
                              <button
                                onClick={() => {
                                  setSelectedFee(
                                    fee
                                  )
                                  setPayForm({
                                    ...payForm,
                                    paidAmount:
                                      fee.amount
                                  })
                                  setShowPayModal(
                                    true
                                  )
                                }}
                                style={{
                                  padding:
                                    '5px 12px',
                                  background:
                                    '#DCFCE7',
                                  color:
                                    '#16A34A',
                                  border:
                                    '1px solid #BBF7D0',
                                  borderRadius:
                                    '8px',
                                  fontSize:
                                    '12px',
                                  fontWeight:
                                    '600',
                                  cursor:
                                    'pointer',
                                  whiteSpace:
                                    'nowrap'
                                }}
                              >
                                ✅ Mark Paid
                              </button>
                            )}
                            {fee.status ===
                              'paid' && (
                              <span style={{
                                fontSize: '12px',
                                color:
                                  'var(--text-muted)'
                              }}>
                                {new Date(
                                  fee.paidAt
                                ).toLocaleDateString(
                                  'en-IN'
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Defaulters Tab */}
      {activeTab === 'defaulters' && (
        <div>
          {defaulters.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                ✅
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '12px'
              }}>
                No defaulters! All fees paid!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {defaulters.map((d, i) => (
                <div key={i} className="card"
                  style={{
                    padding: '16px',
                    borderLeft:
                      '4px solid #DC2626'
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
                        gap: '10px',
                        marginBottom: '6px'
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#FEE2E2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'center',
                          color: '#DC2626',
                          fontWeight: '700',
                          fontSize: '14px'
                        }}>
                          {d.student?.name?.[0]
                            ?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{
                            fontWeight: '700',
                            fontSize: '15px',
                            color: 'var(--text)'
                          }}>
                            {d.student?.name}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color:
                              'var(--text-muted)'
                          }}>
                            Room:{' '}
                            {d.student
                              ?.roomNumber || '—'}
                            {' '} •{' '}
                            {d.student?.phone}
                          </p>
                        </div>
                      </div>

                      {/* Fee list */}
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap'
                      }}>
                        {d.fees.map((fee, j) => (
                          <span key={j} style={{
                            padding: '3px 8px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {MONTHS[
                              fee.month - 1
                            ].slice(0, 3)}{' '}
                            {fee.year} —{' '}
                            {FEE_TYPE_LABELS[
                              fee.feeType
                            ]?.split(' ')[1]
                            || fee.feeType}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      textAlign: 'right'
                    }}>
                      <div style={{
                        fontSize: '22px',
                        fontWeight: '800',
                        color: '#DC2626',
                        fontFamily:
                          'Space Grotesk'
                      }}>
                        ₹{d.totalDue
                          .toLocaleString(
                            'en-IN'
                          )}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color:
                          'var(--text-muted)'
                      }}>
                        Total due
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rate Card Tab */}
      {activeTab === 'rates' && rates && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--text)'
            }}>
              ⚙️ Current Fee Rate Card
            </h2>
            <button
              onClick={() =>
                setShowRatesModal(true)}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '13px'
              }}
            >
              ✏️ Edit Rates
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, 1fr)',
            gap: '16px'
          }}
            className="grid-2">

            {/* AC Rooms */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--primary)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ❄️ AC Rooms (Monthly)
              </h3>
              {[
                {
                  label: 'Single Room (1 bed)',
                  value: rates.acSingleRoom
                },
                {
                  label: 'Double Room (2 beds)',
                  value: rates.acDoubleRoom
                },
                {
                  label: 'Triple Room (3 beds)',
                  value: rates.acTripleRoom
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  padding: '10px 0',
                  borderBottom:
                    i < 2
                      ? '1px solid var(--border)'
                      : 'none'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontWeight: '700',
                    color: 'var(--primary)',
                    fontSize: '14px'
                  }}>
                    ₹{item.value
                      .toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Non-AC Rooms */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#D97706',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🌡️ Non-AC Rooms (Monthly)
              </h3>
              {[
                {
                  label: 'Single Room (1 bed)',
                  value: rates.nonAcSingleRoom
                },
                {
                  label: 'Double Room (2 beds)',
                  value: rates.nonAcDoubleRoom
                },
                {
                  label: 'Triple Room (3 beds)',
                  value: rates.nonAcTripleRoom
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  padding: '10px 0',
                  borderBottom:
                    i < 2
                      ? '1px solid var(--border)'
                      : 'none'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontWeight: '700',
                    color: '#D97706',
                    fontSize: '14px'
                  }}>
                    ₹{item.value
                      .toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Additional Fees */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                📋 Additional Fees
              </h3>
              {[
                {
                  label: '🍽️ Mess Fee',
                  value: rates.messFee
                },
                {
                  label: '🔧 Maintenance Fee',
                  value: rates.maintenanceFee
                },
                {
                  label: '🔒 Security Deposit',
                  value: rates.securityDeposit
                },
                {
                  label: '⏰ Late Fee/Day',
                  value: rates.lateFeePerDay
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  padding: '10px 0',
                  borderBottom:
                    i < 3
                      ? '1px solid var(--border)'
                      : 'none'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontWeight: '700',
                    color: 'var(--text)',
                    fontSize: '14px'
                  }}>
                    ₹{item.value
                      .toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Policy */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                📜 Fee Policy
              </h3>
              {[
                {
                  label: '📅 Due Date',
                  value: `${rates.dueDateDay}th of every month`
                },
                {
                  label: '✅ Grace Period',
                  value: `${rates.gracePeriodDays} days`
                },
                {
                  label: '⚠️ Late Fee Starts',
                  value: `After ${rates.gracePeriodDays} days`
                },
                {
                  label: '⏰ Late Fee Rate',
                  value: `₹${rates.lateFeePerDay}/day`
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom:
                    i < 3
                      ? '1px solid var(--border)'
                      : 'none'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: 'var(--primary)',
                    fontSize: '13px'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Fees Modal */}
      {showGenerate && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '440px',
              padding: '28px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                Generate Monthly Fees
              </h2>
              <button
                onClick={() =>
                  setShowGenerate(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: '#EFF6FF',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '12px',
              color: 'var(--primary)'
            }}>
              💡 This will generate fee
              records for ALL students
              with allotted rooms for
              the selected month.
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Month
                  </label>
                  <select
                    value={generateForm.month}
                    onChange={e =>
                      setGenerateForm({
                        ...generateForm,
                        month: parseInt(
                          e.target.value
                        )
                      })}
                    className="input"
                  >
                    {MONTHS.map((m, i) => (
                      <option
                        key={i}
                        value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    Year
                  </label>
                  <select
                    value={generateForm.year}
                    onChange={e =>
                      setGenerateForm({
                        ...generateForm,
                        year: parseInt(
                          e.target.value
                        )
                      })}
                    className="input"
                  >
                    {[2025, 2026, 2027]
                      .map(y => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {[
                  {
                    key: 'includeMess',
                    label: '🍽️ Include Mess Fee'
                  },
                  {
                    key: 'includeMaintenance',
                    label: '🔧 Include Maintenance Fee'
                  },
                ].map(item => (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      padding: '10px 12px',
                      background: '#F8FAFC',
                      borderRadius: '8px'
                    }}>
                    <input
                      type="checkbox"
                      checked={
                        generateForm[item.key]
                      }
                      onChange={e =>
                        setGenerateForm({
                          ...generateForm,
                          [item.key]:
                            e.target.checked
                        })}
                      style={{
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--text)'
                    }}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  onClick={() =>
                    setShowGenerate(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border:
                      '1.5px solid var(--border)',
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: 'var(--text-muted)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity:
                      generating ? 0.7 : 1
                  }}
                >
                  {generating
                    ? '⏳ Generating...'
                    : '💰 Generate Fees'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {showPayModal && selectedFee && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '420px',
              padding: '28px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                ✅ Mark Fee Paid
              </h2>
              <button
                onClick={() =>
                  setShowPayModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Fee info */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontWeight: '700',
                fontSize: '14px'
              }}>
                {selectedFee.student?.name}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '2px'
              }}>
                {FEE_TYPE_LABELS[
                  selectedFee.feeType
                ]} •{' '}
                {MONTHS[selectedFee.month - 1]}{' '}
                {selectedFee.year}
              </p>
              <p style={{
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--primary)',
                fontFamily: 'Space Grotesk',
                marginTop: '6px'
              }}>
                ₹{selectedFee.amount
                  .toLocaleString('en-IN')}
              </p>
            </div>

            <form onSubmit={handleMarkPaid}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Amount Paid ₹ *
                </label>
                <input
                  type="number"
                  value={payForm.paidAmount}
                  onChange={e =>
                    setPayForm({
                      ...payForm,
                      paidAmount: e.target.value
                    })}
                  required
                  className="input"
                  style={{ fontSize: '18px' }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Payment Method *
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(4, 1fr)',
                  gap: '6px'
                }}>
                  {[
                    { value: 'cash',
                      label: '💵 Cash' },
                    { value: 'upi',
                      label: '📱 UPI' },
                    { value: 'bank_transfer',
                      label: '🏦 Bank' },
                    { value: 'online',
                      label: '💳 Online' },
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() =>
                        setPayForm({
                          ...payForm,
                          paymentMethod: m.value
                        })}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          payForm
                            .paymentMethod
                            === m.value
                            ? 'var(--primary)'
                            : '#F1F5F9',
                        color:
                          payForm
                            .paymentMethod
                            === m.value
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={payForm.transactionId}
                  onChange={e =>
                    setPayForm({
                      ...payForm,
                      transactionId: e.target.value
                    })}
                  placeholder="UPI/Transaction ID"
                  className="input"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Remarks
                </label>
                <input
                  type="text"
                  value={payForm.remarks}
                  onChange={e =>
                    setPayForm({
                      ...payForm,
                      remarks: e.target.value
                    })}
                  placeholder="Optional..."
                  className="input"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setShowPayModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border:
                      '1.5px solid var(--border)',
                    borderRadius: '12px',
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
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving
                    ? '⏳ Saving...'
                    : '✅ Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Rates Modal */}
      {showRatesModal && rates && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '520px',
              padding: '28px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                ⚙️ Update Fee Rates
              </h2>
              <button
                onClick={() =>
                  setShowRatesModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleUpdateRates}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: '60vh',
                overflowY: 'auto',
                padding: '4px'
              }}>

              {/* AC Rooms */}
              <div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  marginBottom: '8px'
                }}>
                  ❄️ AC Room Rates (Monthly)
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(3, 1fr)',
                  gap: '10px'
                }}>
                  {[
                    { key: 'acSingleRoom',
                      label: 'Single' },
                    { key: 'acDoubleRoom',
                      label: 'Double' },
                    { key: 'acTripleRoom',
                      label: 'Triple' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '4px',
                        color:
                          'var(--text-muted)',
                        textTransform:
                          'uppercase'
                      }}>
                        {f.label} ₹
                      </label>
                      <input
                        type="number"
                        value={
                          ratesForm[f.key] || ''
                        }
                        onChange={e =>
                          setRatesForm({
                            ...ratesForm,
                            [f.key]: parseInt(
                              e.target.value
                            )
                          })}
                        className="input"
                        style={{
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-AC Rooms */}
              <div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#D97706',
                  marginBottom: '8px'
                }}>
                  🌡️ Non-AC Room Rates (Monthly)
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(3, 1fr)',
                  gap: '10px'
                }}>
                  {[
                    { key: 'nonAcSingleRoom',
                      label: 'Single' },
                    { key: 'nonAcDoubleRoom',
                      label: 'Double' },
                    { key: 'nonAcTripleRoom',
                      label: 'Triple' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '4px',
                        color:
                          'var(--text-muted)',
                        textTransform:
                          'uppercase'
                      }}>
                        {f.label} ₹
                      </label>
                      <input
                        type="number"
                        value={
                          ratesForm[f.key] || ''
                        }
                        onChange={e =>
                          setRatesForm({
                            ...ratesForm,
                            [f.key]: parseInt(
                              e.target.value
                            )
                          })}
                        className="input"
                        style={{
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Other fees */}
              <div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  marginBottom: '8px'
                }}>
                  📋 Additional Fee Rates
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px'
                }}>
                  {[
                    { key: 'messFee',
                      label: 'Mess Fee ₹' },
                    { key: 'maintenanceFee',
                      label: 'Maintenance ₹' },
                    { key: 'securityDeposit',
                      label: 'Security Deposit ₹' },
                    { key: 'lateFeePerDay',
                      label: 'Late Fee/Day ₹' },
                    { key: 'dueDateDay',
                      label: 'Due Date (day)' },
                    { key: 'gracePeriodDays',
                      label: 'Grace Period (days)' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '4px',
                        color:
                          'var(--text-muted)',
                        textTransform:
                          'uppercase'
                      }}>
                        {f.label}
                      </label>
                      <input
                        type="number"
                        value={
                          ratesForm[f.key] || ''
                        }
                        onChange={e =>
                          setRatesForm({
                            ...ratesForm,
                            [f.key]: parseInt(
                              e.target.value
                            )
                          })}
                        className="input"
                        style={{
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setShowRatesModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border:
                      '1.5px solid var(--border)',
                    borderRadius: '12px',
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
                    padding: '12px',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving
                    ? '⏳ Saving...'
                    : '💾 Save Rates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}