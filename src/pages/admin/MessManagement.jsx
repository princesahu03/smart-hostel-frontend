import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const DAYS = [
  'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday', 'sunday'
]

const MEALS = [
  'breakfast', 'lunch', 'dinner'
]

const MEAL_ICONS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙'
}

const MEAL_TIMES = {
  breakfast: '7:00 AM - 9:00 AM',
  lunch: '12:00 PM - 2:00 PM',
  dinner: '7:00 PM - 9:00 PM'
}

const emptyMenu = () => {
  const menu = {}
  DAYS.forEach(day => {
    menu[day] = {}
    MEALS.forEach(meal => {
      menu[day][meal] = {
        items: [''],
        timing: MEAL_TIMES[meal],
        calories: ''
      }
    })
  })
  return menu
}

export default function MessManagement() {
  const [currentMenu, setCurrentMenu] =
    useState(null)
  const [analytics, setAnalytics] =
    useState(null)
  const [mealLeaves, setMealLeaves] =
    useState([])
  const [loading, setLoading] =
    useState(true)
  const [activeTab, setActiveTab] =
    useState('menu')
  const [showCreateModal, setShowCreateModal] =
    useState(false)
  const [menuForm, setMenuForm] = useState({
    weekStartDate: new Date()
      .toISOString().split('T')[0],
    ...emptyMenu(),
    specialNotice: ''
  })
  const [activeDay, setActiveDay] =
    useState('monday')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [menuRes, analyticsRes,
        leavesRes] = await Promise.all([
        api.get('/mess/menu/current'),
        api.get('/mess/feedback/analytics'),
        api.get('/mess/meal-leaves')
      ])
      setCurrentMenu(menuRes.data.data)
      setAnalytics(analyticsRes.data.data)
      setMealLeaves(leavesRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMenu = async () => {
    setSaving(true)
    try {
      await api.post('/mess/menu', menuForm)
      toast.success('Weekly menu saved! 🍽️')
      setShowCreateModal(false)
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

  const updateMenuItem = (
    day, meal, index, value
  ) => {
    setMenuForm(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: {
          ...prev[day][meal],
          items: prev[day][meal].items
            .map((item, i) =>
              i === index ? value : item
            )
        }
      }
    }))
  }

  const addMenuItem = (day, meal) => {
    setMenuForm(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: {
          ...prev[day][meal],
          items: [...prev[day][meal].items, '']
        }
      }
    }))
  }

  const removeMenuItem = (
    day, meal, index
  ) => {
    setMenuForm(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: {
          ...prev[day][meal],
          items: prev[day][meal].items
            .filter((_, i) => i !== index)
        }
      }
    }))
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#16A34A'
    if (rating >= 3) return '#D97706'
    return '#DC2626'
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating))
  }

  if (loading) return (
    <Loader text="Loading mess data..." />
  )

  const todayName = [
    'sunday', 'monday', 'tuesday',
    'wednesday', 'thursday',
    'friday', 'saturday'
  ][new Date().getDay()]

  const todayMenu = currentMenu?.menu
    ?.[todayName]

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
            🍽️ Mess Management
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            Weekly menu + feedback analytics
          </p>
        </div>
        <button
          onClick={() =>
            setShowCreateModal(true)}
          className="btn-primary"
        >
          + Create Weekly Menu
        </button>
      </div>

      {/* Today's Menu Banner */}
      {todayMenu && (
        <div style={{
          background:
            'linear-gradient(135deg, #1a3c5e, #2d5f8a)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '700',
              fontFamily: 'Space Grotesk'
            }}>
              🍽️ Today's Menu —{' '}
              {todayName.charAt(0)
                .toUpperCase() +
                todayName.slice(1)}
            </h2>
            {currentMenu?.menu
              ?.specialNotice && (
              <span style={{
                background:
                  'rgba(245,158,11,0.3)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#FCD34D'
              }}>
                📢 {currentMenu.menu
                  .specialNotice}
              </span>
            )}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, 1fr)',
            gap: '12px'
          }}
            className="grid-3">
            {MEALS.map(meal => (
              <div key={meal} style={{
                background:
                  'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{
                  fontSize: '20px',
                  marginBottom: '6px'
                }}>
                  {MEAL_ICONS[meal]}
                </div>
                <div style={{
                  fontWeight: '700',
                  fontSize: '13px',
                  textTransform: 'capitalize',
                  marginBottom: '4px'
                }}>
                  {meal}
                </div>
                <div style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  marginBottom: '6px'
                }}>
                  {MEAL_TIMES[meal]}
                </div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.9,
                  lineHeight: 1.5
                }}>
                  {todayMenu[meal]?.items
                    ?.filter(i => i)
                    .join(' • ') ||
                    'Not set'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: 'menu',
            label: '📋 Weekly Menu' },
          { value: 'feedback',
            label: '⭐ Feedback' },
          { value: 'leaves',
            label: '🏖️ Meal Leaves' },
          { value: 'counts',
            label: '📊 Meal Counts' },
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

      {/* Weekly Menu Tab */}
      {activeTab === 'menu' && (
        <div>
          {!currentMenu?.menu ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                🍽️
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '12px'
              }}>
                No menu created yet!
              </p>
              <button
                onClick={() =>
                  setShowCreateModal(true)}
                className="btn-primary"
                style={{ marginTop: '16px' }}
              >
                + Create Weekly Menu
              </button>
            </div>
          ) : (
            <div>
              {/* Day selector */}
              <div style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() =>
                      setActiveDay(day)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background:
                        activeDay === day
                          ? 'var(--primary)'
                          : day === todayName
                          ? '#DCFCE7'
                          : 'white',
                      color:
                        activeDay === day
                          ? 'white'
                          : day === todayName
                          ? '#16A34A'
                          : 'var(--text-muted)',
                      border:
                        activeDay === day
                          ? '1.5px solid var(--primary)'
                          : '1.5px solid var(--border)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {day === todayName
                      ? `✨ ${day}`
                      : day}
                  </button>
                ))}
              </div>

              {/* Day menu cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(3, 1fr)',
                gap: '12px'
              }}
                className="grid-3">
                {MEALS.map(meal => {
                  const mealData =
                    currentMenu.menu
                      ?.[activeDay]?.[meal]
                  return (
                    <div key={meal}
                      className="card"
                      style={{
                        padding: '16px'
                      }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <span style={{
                          fontSize: '22px'
                        }}>
                          {MEAL_ICONS[meal]}
                        </span>
                        <div>
                          <p style={{
                            fontWeight: '700',
                            fontSize: '14px',
                            color: 'var(--text)',
                            textTransform:
                              'capitalize'
                          }}>
                            {meal}
                          </p>
                          <p style={{
                            fontSize: '11px',
                            color:
                              'var(--text-muted)'
                          }}>
                            {MEAL_TIMES[meal]}
                          </p>
                        </div>
                      </div>

                      {mealData?.items
                        ?.filter(i => i)
                        .length ? (
                        <ul style={{
                          listStyle: 'none',
                          padding: 0
                        }}>
                          {mealData.items
                            .filter(i => i)
                            .map((item, i) => (
                            <li key={i}
                              style={{
                                fontSize: '13px',
                                color: 'var(--text)',
                                padding:
                                  '4px 0',
                                borderBottom:
                                  '1px dashed var(--border)',
                                display: 'flex',
                                alignItems:
                                  'center',
                                gap: '6px'
                              }}>
                              <span style={{
                                color: '#10b981',
                                fontSize: '10px'
                              }}>
                                ●
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{
                          color:
                            'var(--text-muted)',
                          fontSize: '13px',
                          fontStyle: 'italic'
                        }}>
                          Not set
                        </p>
                      )}

                      {mealData?.calories && (
                        <p style={{
                          fontSize: '11px',
                          color: '#D97706',
                          marginTop: '8px',
                          fontWeight: '600'
                        }}>
                          🔥 {mealData.calories}
                          kcal
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Average Ratings */}
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, 1fr)',
            gap: '12px'
          }}
            className="grid-3">
            {analytics?.avgRatings?.map(
              (r, i) => (
              <div key={i} className="card"
                style={{ padding: '16px' }}>
                <div style={{
                  fontSize: '24px',
                  marginBottom: '8px'
                }}>
                  {MEAL_ICONS[r._id]}
                </div>
                <div style={{
                  fontSize: '13px',
                  textTransform: 'capitalize',
                  color: 'var(--text-muted)',
                  marginBottom: '4px'
                }}>
                  {r._id}
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: getRatingColor(
                    r.avgRating
                  ),
                  fontFamily: 'Space Grotesk'
                }}>
                  {r.avgRating.toFixed(1)}
                </div>
                <div style={{
                  fontSize: '14px',
                  marginTop: '2px'
                }}>
                  {renderStars(r.avgRating)}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '4px'
                }}>
                  {r.totalFeedbacks} reviews
                </div>

                {/* Sub ratings */}
                <div style={{
                  marginTop: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {[
                    {
                      label: 'Taste',
                      val: r.avgTaste
                    },
                    {
                      label: 'Quality',
                      val: r.avgQuality
                    },
                    {
                      label: 'Quantity',
                      val: r.avgQuantity
                    },
                  ].map(sub => sub.val && (
                    <div key={sub.label}
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        fontSize: '11px'
                      }}>
                      <span style={{
                        color:
                          'var(--text-muted)'
                      }}>
                        {sub.label}
                      </span>
                      <span style={{
                        fontWeight: '600',
                        color: getRatingColor(
                          sub.val
                        )
                      }}>
                        {sub.val.toFixed(1)}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Comments */}
          <div className="card"
            style={{ padding: '20px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              💬 Recent Student Comments
            </h2>
            {analytics?.recentComments
              ?.length === 0 ? (
              <p style={{
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '20px'
              }}>
                No comments yet!
              </p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {analytics?.recentComments
                  ?.map((c, i) => (
                  <div key={i} style={{
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    borderLeft: `3px solid ${
                      getRatingColor(c.rating)
                    }`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>
                        {c.student?.name}
                      </span>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        fontSize: '12px'
                      }}>
                        <span style={{
                          textTransform:
                            'capitalize',
                          color:
                            'var(--text-muted)'
                        }}>
                          {c.mealType}
                        </span>
                        <span style={{
                          color: getRatingColor(
                            c.rating
                          ),
                          fontWeight: '700'
                        }}>
                          {c.rating}/5 ⭐
                        </span>
                      </div>
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      {c.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meal Leaves Tab */}
      {activeTab === 'leaves' && (
        <div className="card"
          style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom:
              '1px solid var(--border)',
            fontWeight: '700',
            fontSize: '15px'
          }}>
            🏖️ Upcoming Meal Leaves
          </div>
          {mealLeaves.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text-muted)'
            }}>
              No meal leaves!
            </div>
          ) : (
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
                    'From', 'To',
                    'Skip Meals']
                    .map(h => (
                    <th key={h} style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      color: 'var(--text-muted)',
                      fontWeight: '600',
                      fontSize: '11px',
                      textTransform: 'uppercase'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mealLeaves.map(leave => (
                  <tr key={leave._id}
                    className="table-row"
                    style={{
                      borderBottom:
                        '1px solid var(--border)'
                    }}>
                    <td style={{
                      padding: '12px 16px',
                      fontWeight: '600'
                    }}>
                      {leave.student?.name}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      color: 'var(--text-muted)'
                    }}>
                      {leave.student
                        ?.roomNumber || '—'}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      color: 'var(--text-muted)'
                    }}>
                      {new Date(leave.fromDate)
                        .toLocaleDateString(
                          'en-IN'
                        )}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      color: 'var(--text-muted)'
                    }}>
                      {new Date(leave.toDate)
                        .toLocaleDateString(
                          'en-IN'
                        )}
                    </td>
                    <td style={{
                      padding: '12px 16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '4px',
                        flexWrap: 'wrap'
                      }}>
                        {leave.skipMeals
                          .map(m => (
                          <span key={m}
                            style={{
                              padding:
                                '2px 8px',
                              background:
                                '#FEF3C7',
                              color: '#D97706',
                              borderRadius:
                                '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform:
                                'capitalize'
                            }}>
                            {MEAL_ICONS[m]}
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Meal Counts Tab */}
      {activeTab === 'counts' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, 1fr)',
          gap: '16px'
        }}
          className="grid-3">
          {analytics?.todayMealCounts
            ?.map((m, i) => (
            <div key={i} className="card"
              style={{ padding: '20px' }}>
              <div style={{
                fontSize: '32px',
                marginBottom: '8px'
              }}>
                {MEAL_ICONS[m._id]}
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: 'var(--primary)',
                fontFamily: 'Space Grotesk'
              }}>
                {m.count}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                textTransform: 'capitalize',
                marginTop: '4px'
              }}>
                {m._id} today
              </div>
            </div>
          ))}

          {(!analytics?.todayMealCounts
            ?.length) && (
            <div style={{
              gridColumn: 'span 3',
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                🍽️
              </div>
              <p style={{
                marginTop: '12px',
                fontSize: '14px'
              }}>
                No meal scans today yet!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Menu Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '700px',
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
                🍽️ Create Weekly Menu
              </h2>
              <button
                onClick={() =>
                  setShowCreateModal(false)}
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

            {/* Week Start Date */}
            <div style={{
              marginBottom: '16px'
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}>
                Week Start Date
              </label>
              <input
                type="date"
                value={menuForm.weekStartDate}
                onChange={e =>
                  setMenuForm({
                    ...menuForm,
                    weekStartDate: e.target.value
                  })}
                className="input"
              />
            </div>

            {/* Day Selector */}
            <div style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setActiveDay(day)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background:
                      activeDay === day
                        ? 'var(--primary)'
                        : '#F1F5F9',
                    color:
                      activeDay === day
                        ? 'white'
                        : 'var(--text-muted)',
                    border: 'none',
                    textTransform: 'capitalize'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Meal inputs */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              maxHeight: '350px',
              overflowY: 'auto',
              padding: '4px'
            }}>
              {MEALS.map(meal => (
                <div key={meal}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '14px'
                  }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}>
                    <span style={{
                      fontSize: '18px'
                    }}>
                      {MEAL_ICONS[meal]}
                    </span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '14px',
                      textTransform:
                        'capitalize'
                    }}>
                      {meal}
                    </span>
                  </div>

                  {menuForm[activeDay][meal]
                    .items.map((item, idx) => (
                    <div key={idx}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '6px'
                      }}>
                      <input
                        type="text"
                        value={item}
                        onChange={e =>
                          updateMenuItem(
                            activeDay, meal,
                            idx, e.target.value
                          )}
                        placeholder={`Item ${idx + 1}...`}
                        className="input"
                        style={{
                          fontSize: '13px'
                        }}
                      />
                      {menuForm[activeDay][meal]
                        .items.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeMenuItem(
                              activeDay,
                              meal, idx
                            )}
                          style={{
                            padding: '0 10px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      addMenuItem(
                        activeDay, meal
                      )}
                    style={{
                      fontSize: '12px',
                      color: 'var(--primary)',
                      fontWeight: '600',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0'
                    }}
                  >
                    + Add Item
                  </button>
                </div>
              ))}
            </div>

            {/* Special Notice */}
            <div style={{
              marginTop: '14px'
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}>
                Special Notice (Optional)
              </label>
              <input
                type="text"
                value={menuForm.specialNotice}
                onChange={e =>
                  setMenuForm({
                    ...menuForm,
                    specialNotice: e.target.value
                  })}
                placeholder="e.g. Festival special menu on Sunday!"
                className="input"
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '16px'
            }}>
              <button
                onClick={() =>
                  setShowCreateModal(false)}
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
                onClick={handleSaveMenu}
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
                  : '💾 Save Weekly Menu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}