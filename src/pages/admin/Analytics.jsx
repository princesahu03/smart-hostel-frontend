import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart,
  Pie, Cell, Legend
} from 'recharts'

const COLORS = [
  '#1a3c5e', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#06b6d4',
  '#f97316', '#84cc16'
]

export default function Analytics() {
  const [deptData, setDeptData] =
    useState(null)
  const [floorData, setFloorData] =
    useState([])
  const [loading, setLoading] =
    useState(true)
  const [activeTab, setActiveTab] =
    useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [deptRes, floorRes] =
        await Promise.all([
          api.get('/analytics/department'),
          api.get('/analytics/floor')
        ])
      setDeptData(deptRes.data.data)
      setFloorData(floorRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Loader text="Loading analytics..." />
  )

  // Chart data prepare:
  const courseChartData =
    deptData?.courseWise?.map(c => ({
      name: c._id || 'Unknown',
      students: c.count
    })) || []

  const deptChartData =
    deptData?.deptWise?.map(d => ({
      name: d._id || 'Unknown',
      students: d.count
    })) || []

  const genderData = [
    {
      name: 'Boys',
      value: deptData?.totalBoys || 0
    },
    {
      name: 'Girls',
      value: deptData?.totalGirls || 0
    }
  ]

  const yearData =
    deptData?.yearWise?.map(y => ({
      name: `Year ${y._id}`,
      students: y.count
    })) || []

  const floorChartData = floorData.map(f => ({
    name: `Floor ${f._id}`,
    capacity: f.totalCapacity,
    occupied: f.occupied,
    available: f.totalCapacity - f.occupied
  }))

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: 'var(--text)',
          fontFamily: 'Space Grotesk'
        }}>
          📊 Department Analytics
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          Complete student statistics
        </p>
      </div>

      {/* Summary Cards */}
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
            label: 'Total Students',
            value: deptData?.totalStudents || 0,
            icon: '👨‍🎓',
            bg: '#EFF6FF',
            color: '#1a3c5e'
          },
          {
            label: 'Boys',
            value: deptData?.totalBoys || 0,
            icon: '👦',
            bg: '#DBEAFE',
            color: '#2563EB'
          },
          {
            label: 'Girls',
            value: deptData?.totalGirls || 0,
            icon: '👧',
            bg: '#FDF4FF',
            color: '#7C3AED'
          },
          {
            label: 'Without Room',
            value: deptData
              ?.studentsWithoutRoom || 0,
            icon: '🏠',
            bg: '#FEF3C7',
            color: '#D97706'
          },
          {
            label: 'Inside Now',
            value: deptData?.insideCount || 0,
            icon: '✅',
            bg: '#DCFCE7',
            color: '#16A34A'
          },
          {
            label: 'Outside Now',
            value: deptData?.outsideCount || 0,
            icon: '🚶',
            bg: '#FEE2E2',
            color: '#DC2626'
          },
          {
            label: 'Courses',
            value: deptData?.courseWise
              ?.length || 0,
            icon: '📚',
            bg: '#F0FDF4',
            color: '#16A34A'
          },
          {
            label: 'Departments',
            value: deptData?.deptWise
              ?.length || 0,
            icon: '🏫',
            bg: '#FFF7ED',
            color: '#EA580C'
          },
        ].map((card, i) => (
          <div key={i} className="card"
            style={{ padding: '16px' }}>
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
              fontSize: '22px',
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
          { value: 'course',
            label: '📚 Course Wise' },
          { value: 'department',
            label: '🏫 Department Wise' },
          { value: 'floor',
            label: '🏠 Floor Wise' },
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}
          className="grid-2">

          {/* Gender Pie */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              👥 Gender Distribution
            </h2>
            <ResponsiveContainer
              width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {genderData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Year Wise Bar */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              📅 Year Wise Students
            </h2>
            <ResponsiveContainer
              width="100%" height={220}>
              <BarChart data={yearData}>
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
                <Bar
                  dataKey="students"
                  fill="#1a3c5e"
                  radius={[6, 6, 0, 0]}
                  name="Students"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Inside/Outside Status */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              🏠 Current Location Status
            </h2>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <div style={{
                flex: 1,
                padding: '20px',
                background: '#DCFCE7',
                borderRadius: '14px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#16A34A',
                  fontFamily: 'Space Grotesk'
                }}>
                  {deptData?.insideCount || 0}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#16A34A',
                  fontWeight: '600',
                  marginTop: '4px'
                }}>
                  🏠 Inside Hostel
                </div>
              </div>
              <div style={{
                flex: 1,
                padding: '20px',
                background: '#FEE2E2',
                borderRadius: '14px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#DC2626',
                  fontFamily: 'Space Grotesk'
                }}>
                  {deptData?.outsideCount || 0}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#DC2626',
                  fontWeight: '600',
                  marginTop: '4px'
                }}>
                  🚶 Outside Hostel
                </div>
              </div>
            </div>

            {/* Percentage bar */}
            <div style={{
              marginTop: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '6px'
              }}>
                <span>Occupancy</span>
                <span>
                  {deptData?.totalStudents
                    ? Math.round(
                        (deptData.insideCount /
                          deptData.totalStudents)
                        * 100
                      )
                    : 0}%
                </span>
              </div>
              <div style={{
                height: '8px',
                background: '#F1F5F9',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${deptData?.totalStudents
                    ? Math.round(
                        (deptData.insideCount /
                          deptData.totalStudents)
                        * 100
                      )
                    : 0}%`,
                  background: '#16A34A',
                  borderRadius: '4px',
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>
          </div>

          {/* Course Summary Table */}
          <div className="card"
            style={{
              padding: '20px',
              overflow: 'hidden'
            }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              📚 Course Summary
            </h2>
            <div style={{
              overflowX: 'auto'
            }}>
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
                    {['Course',
                      'Students', '%']
                      .map(h => (
                      <th key={h} style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        color:
                          'var(--text-muted)',
                        fontWeight: '600',
                        fontSize: '11px',
                        textTransform:
                          'uppercase'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptData?.courseWise
                    ?.map((c, i) => (
                    <tr key={i}
                      className="table-row"
                      style={{
                        borderBottom:
                          '1px solid var(--border)'
                      }}>
                      <td style={{
                        padding: '8px 12px',
                        fontWeight: '600'
                      }}>
                        {c._id || 'Unknown'}
                      </td>
                      <td style={{
                        padding: '8px 12px',
                        color: 'var(--primary)',
                        fontWeight: '700'
                      }}>
                        {c.count}
                      </td>
                      <td style={{
                        padding: '8px 12px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <div style={{
                            height: '6px',
                            width: `${Math.round(
                              (c.count /
                                deptData
                                  .totalStudents)
                              * 100
                            )}%`,
                            background:
                              COLORS[i % 8],
                            borderRadius: '3px',
                            minWidth: '4px',
                            maxWidth: '80px'
                          }} />
                          <span style={{
                            fontSize: '11px',
                            color:
                              'var(--text-muted)'
                          }}>
                            {Math.round(
                              (c.count /
                                deptData
                                  .totalStudents)
                              * 100
                            )}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'course' && (
        <div className="card"
          style={{ padding: '20px' }}>
          <h2 style={{
            fontSize: '15px',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'var(--text)'
          }}>
            📚 Course Wise Student Count
          </h2>
          <ResponsiveContainer
            width="100%" height={300}>
            <BarChart data={courseChartData}>
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
              <Bar
                dataKey="students"
                radius={[6, 6, 0, 0]}
                name="Students"
              >
                {courseChartData.map(
                  (_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % 8]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'department' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--text)'
            }}>
              🏫 Department Wise Students
            </h2>
            {deptChartData.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: 'var(--text-muted)'
              }}>
                <p>No department data!</p>
                <p style={{
                  fontSize: '12px',
                  marginTop: '8px'
                }}>
                  Update student profiles
                  with department info
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%" height={300}>
                <BarChart
                  data={deptChartData}
                  layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F1F5F9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar
                    dataKey="students"
                    radius={[0, 6, 6, 0]}
                    fill="#1a3c5e"
                    name="Students"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Department Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {deptData?.deptWise?.map(
              (dept, i) => (
              <div key={i} className="card"
                style={{
                  padding: '16px',
                  borderLeft:
                    `4px solid ${COLORS[i % 8]}`
                }}>
                <div style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: COLORS[i % 8],
                  fontFamily: 'Space Grotesk'
                }}>
                  {dept.count}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  marginTop: '4px'
                }}>
                  {dept._id || 'Unknown'}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '2px'
                }}>
                  {Math.round(
                    (dept.count /
                      deptData.totalStudents)
                    * 100
                  )}% of total
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'floor' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--text)'
            }}>
              🏠 Floor Wise Occupancy
            </h2>
            <ResponsiveContainer
              width="100%" height={280}>
              <BarChart
                data={floorChartData}>
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
                  dataKey="capacity"
                  fill="#DBEAFE"
                  name="Total Capacity"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="occupied"
                  fill="#1a3c5e"
                  name="Occupied"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="available"
                  fill="#10b981"
                  name="Available"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Floor Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {floorData.map((floor, i) => {
              const pct = Math.round(
                (floor.occupied /
                  floor.totalCapacity)
                * 100
              )
              return (
                <div key={i} className="card"
                  style={{ padding: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h3 style={{
                      fontWeight: '700',
                      fontSize: '16px',
                      color: 'var(--primary)',
                      fontFamily: 'Space Grotesk'
                    }}>
                      Floor {floor._id}
                    </h3>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: pct > 80
                        ? '#DC2626'
                        : pct > 50
                        ? '#D97706'
                        : '#16A34A'
                    }}>
                      {pct}%
                    </span>
                  </div>

                  <div style={{
                    height: '6px',
                    background: '#F1F5F9',
                    borderRadius: '3px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: pct > 80
                        ? '#DC2626'
                        : pct > 50
                        ? '#D97706'
                        : '#16A34A',
                      borderRadius: '3px',
                      transition: 'width 0.5s'
                    }} />
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <div style={{
                      padding: '8px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontWeight: '700',
                        color: 'var(--primary)'
                      }}>
                        {floor.rooms}
                      </div>
                      <div style={{
                        color:
                          'var(--text-muted)',
                        fontSize: '10px'
                      }}>
                        Rooms
                      </div>
                    </div>
                    <div style={{
                      padding: '8px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontWeight: '700',
                        color: '#10b981'
                      }}>
                        {floor.totalCapacity
                          - floor.occupied}
                      </div>
                      <div style={{
                        color:
                          'var(--text-muted)',
                        fontSize: '10px'
                      }}>
                        Available
                      </div>
                    </div>
                    <div style={{
                      padding: '8px',
                      background: '#DBEAFE',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontWeight: '700',
                        color: '#2563EB'
                      }}>
                        {floor.maleStudents}
                      </div>
                      <div style={{
                        color: '#2563EB',
                        fontSize: '10px'
                      }}>
                        Boys
                      </div>
                    </div>
                    <div style={{
                      padding: '8px',
                      background: '#FDF4FF',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontWeight: '700',
                        color: '#7C3AED'
                      }}>
                        {floor.femaleStudents}
                      </div>
                      <div style={{
                        color: '#7C3AED',
                        fontSize: '10px'
                      }}>
                        Girls
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}