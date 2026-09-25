import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const DAYS = [
  'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday', 'sunday'
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

export default function MessMenu() {
  const [menuData, setMenuData] =
    useState(null)
  const [loading, setLoading] =
    useState(true)
  const [activeTab, setActiveTab] =
    useState('today')
  const [activeDay, setActiveDay] =
    useState('monday')
  const [showFeedback, setShowFeedback] =
    useState(false)
  const [showLeave, setShowLeave] =
    useState(false)
  const [feedbackData, setFeedbackData] =
    useState({
      mealType: 'lunch',
      rating: 0,
      tasteRating: 0,
      qualityRating: 0,
      quantityRating: 0,
      comment: ''
    })
  const [leaveData, setLeaveData] =
    useState({
      fromDate: '',
      toDate: '',
      skipMeals: [],
      reason: ''
    })
  const [myFeedbacks, setMyFeedbacks] =
    useState([])
  const [submitting, setSubmitting] =
    useState(false)

  useEffect(() => {
    fetchMenu()
    fetchMyFeedbacks()
    const todayIdx = new Date().getDay()
    const days = [
      'sunday', 'monday', 'tuesday',
      'wednesday', 'thursday',
      'friday', 'saturday'
    ]
    setActiveDay(days[todayIdx])
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await api.get(
        '/mess/menu/current'
      )
      setMenuData(res.data.data)
    } catch {
      toast.error('Failed to load menu!')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyFeedbacks = async () => {
    try {
      const res = await api.get(
        '/mess/feedback'
      )
      setMyFeedbacks(res.data.data)
    } catch {}
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (feedbackData.rating === 0) {
      toast.error('Please give a rating!')
      return
    }
    setSubmitting(true)
    try {
      await api.post(
        '/mess/feedback',
        feedbackData
      )
      toast.success('Feedback submitted! 🙏')
      setShowFeedback(false)
      setFeedbackData({
        mealType: 'lunch',
        rating: 0,
        tasteRating: 0,
        qualityRating: 0,
        quantityRating: 0,
        comment: ''
      })
      fetchMyFeedbacks()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    if (!leaveData.skipMeals.length) {
      toast.error('Select meals to skip!')
      return
    }
    setSubmitting(true)
    try {
      await api.post(
        '/mess/meal-leave',
        leaveData
      )
      toast.success('Meal leave marked! ✅')
      setShowLeave(false)
      setLeaveData({
        fromDate: '',
        toDate: '',
        skipMeals: [],
        reason: ''
      })
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            fontSize: '24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: star <= value ? 1 : 0.3,
            transition: 'opacity 0.15s'
          }}
        >
          ⭐
        </button>
      ))}
    </div>
  )

  if (loading) return (
    <Loader text="Loading mess menu..." />
  )

  const todayDay = menuData?.todayDay
  const todayMenu = menuData?.todayMenu

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
            🍽️ Mess Menu
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            Weekly menu + feedback
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() =>
              setShowLeave(true)}
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
            🏖️ Mark Leave
          </button>
          <button
            onClick={() =>
              setShowFeedback(true)}
            className="btn-primary"
          >
            ⭐ Give Feedback
          </button>
        </div>
      </div>

      {/* Special Notice */}
      {menuData?.menu?.specialNotice && (
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #FDE68A',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>
            📢
          </span>
          <p style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#92400E'
          }}>
            {menuData.menu.specialNotice}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {[
          { value: 'today', label: "🌟 Today" },
          { value: 'week', label: '📅 This Week' },
          { value: 'feedback',
            label: '⭐ My Feedback' },
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

      {/* Today Tab */}
      {activeTab === 'today' && (
        <div>
          {!todayMenu ? (
            <div style={{
              textAlign: 'center',
              padding: '80px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '56px'
              }}>
                🍽️
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '16px'
              }}>
                No menu for today!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {['breakfast', 'lunch', 'dinner']
                .map(meal => (
                <div key={meal} className="card"
                  style={{ padding: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        fontSize: '28px'
                      }}>
                        {MEAL_ICONS[meal]}
                      </span>
                      <div>
                        <h3 style={{
                          fontWeight: '700',
                          fontSize: '16px',
                          color: 'var(--text)',
                          textTransform:
                            'capitalize'
                        }}>
                          {meal}
                        </h3>
                        <p style={{
                          fontSize: '12px',
                          color:
                            'var(--text-muted)'
                        }}>
                          🕐 {MEAL_TIMES[meal]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {todayMenu[meal]?.items
                      ?.filter(i => i)
                      .map((item, i) => (
                      <span key={i} style={{
                        padding: '6px 14px',
                        background: '#F0FDF4',
                        color: '#16A34A',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500',
                        border:
                          '1px solid #BBF7D0'
                      }}>
                        🍛 {item}
                      </span>
                    ))}
                    {!todayMenu[meal]?.items
                      ?.filter(i => i)
                      .length && (
                      <span style={{
                        color:
                          'var(--text-muted)',
                        fontSize: '13px',
                        fontStyle: 'italic'
                      }}>
                        Menu not set
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Week Tab */}
      {activeTab === 'week' && (
        <div>
          {!menuData?.menu ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              No weekly menu set!
            </div>
          ) : (
            <div>
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
                          : day === todayDay
                          ? '#DCFCE7'
                          : 'white',
                      color:
                        activeDay === day
                          ? 'white'
                          : day === todayDay
                          ? '#16A34A'
                          : 'var(--text-muted)',
                      border:
                        activeDay === day
                          ? '1.5px solid var(--primary)'
                          : '1.5px solid var(--border)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {day === todayDay
                      ? `✨ ${day}`
                      : day}
                  </button>
                ))}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {['breakfast', 'lunch',
                  'dinner'].map(meal => {
                  const dayMenu =
                    menuData.menu
                      ?.[activeDay]?.[meal]
                  return (
                    <div key={meal}
                      className="card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        gap: '16px',
                        alignItems:
                          'flex-start'
                      }}>
                      <div style={{
                        fontSize: '28px',
                        flexShrink: 0
                      }}>
                        {MEAL_ICONS[meal]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontWeight: '700',
                          textTransform:
                            'capitalize',
                          marginBottom: '4px'
                        }}>
                          {meal}
                          <span style={{
                            fontSize: '11px',
                            color:
                              'var(--text-muted)',
                            fontWeight: '400',
                            marginLeft: '8px'
                          }}>
                            {MEAL_TIMES[meal]}
                          </span>
                        </p>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px'
                        }}>
                          {dayMenu?.items
                            ?.filter(i => i)
                            .map((item, i) => (
                            <span key={i}
                              style={{
                                padding:
                                  '4px 10px',
                                background:
                                  '#F0FDF4',
                                color:
                                  '#16A34A',
                                borderRadius:
                                  '20px',
                                fontSize: '12px'
                              }}>
                              {item}
                            </span>
                          )) || (
                            <span style={{
                              color:
                                'var(--text-muted)',
                              fontSize: '12px',
                              fontStyle: 'italic'
                            }}>
                              Not set
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Feedback Tab */}
      {activeTab === 'feedback' && (
        <div>
          {myFeedbacks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                fontSize: '48px'
              }}>
                ⭐
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '12px'
              }}>
                No feedback given yet!
              </p>
              <button
                onClick={() =>
                  setShowFeedback(true)}
                className="btn-primary"
                style={{ marginTop: '16px' }}
              >
                Give First Feedback
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {myFeedbacks.map((f, i) => (
                <div key={i} className="card"
                  style={{ padding: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        fontSize: '20px'
                      }}>
                        {MEAL_ICONS[f.mealType]}
                      </span>
                      <span style={{
                        fontWeight: '600',
                        textTransform:
                          'capitalize'
                      }}>
                        {f.mealType}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      <span>
                        {new Date(f.date)
                          .toLocaleDateString(
                            'en-IN'
                          )}
                      </span>
                      <span style={{
                        fontWeight: '700',
                        color: f.rating >= 4
                          ? '#16A34A'
                          : f.rating >= 3
                          ? '#D97706'
                          : '#DC2626'
                      }}>
                        {'⭐'.repeat(f.rating)}
                        {' '}{f.rating}/5
                      </span>
                    </div>
                  </div>
                  {f.comment && (
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic'
                    }}>
                      "{f.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
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
                ⭐ Meal Feedback
              </h2>
              <button
                onClick={() =>
                  setShowFeedback(false)}
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
              onSubmit={handleFeedbackSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
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
                  Meal Type
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {['breakfast', 'lunch',
                    'dinner'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setFeedbackData({
                          ...feedbackData,
                          mealType: m
                        })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          feedbackData
                            .mealType === m
                            ? 'var(--primary)'
                            : '#F1F5F9',
                        color:
                          feedbackData
                            .mealType === m
                            ? 'white'
                            : 'var(--text-muted)',
                        border: 'none',
                        textTransform:
                          'capitalize'
                      }}
                    >
                      {MEAL_ICONS[m]} {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ratings */}
              {[
                {
                  label: 'Overall Rating *',
                  key: 'rating'
                },
                {
                  label: 'Taste',
                  key: 'tasteRating'
                },
                {
                  label: 'Quality',
                  key: 'qualityRating'
                },
                {
                  label: 'Quantity',
                  key: 'quantityRating'
                },
              ].map(item => (
                <div key={item.key}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    {item.label}
                  </label>
                  <StarRating
                    value={
                      feedbackData[item.key]
                    }
                    onChange={val =>
                      setFeedbackData({
                        ...feedbackData,
                        [item.key]: val
                      })}
                  />
                </div>
              ))}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Comment (Optional)
                </label>
                <textarea
                  value={feedbackData.comment}
                  onChange={e =>
                    setFeedbackData({
                      ...feedbackData,
                      comment: e.target.value
                    })}
                  placeholder="How was the food today?"
                  rows={3}
                  className="input"
                  style={{
                    resize: 'none',
                    fontFamily: 'Inter'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setShowFeedback(false)}
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
                  disabled={submitting}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting
                    ? '⏳ Submitting...'
                    : '⭐ Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meal Leave Modal */}
      {showLeave && (
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
                🏖️ Mark Meal Leave
              </h2>
              <button
                onClick={() =>
                  setShowLeave(false)}
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
              background: '#FEF3C7',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#92400E'
            }}>
              💡 Mark leave if you are going
              home or won't be eating in mess.
              This helps reduce food waste!
            </div>

            <form
              onSubmit={handleLeaveSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    From Date *
                  </label>
                  <input
                    type="date"
                    value={leaveData.fromDate}
                    onChange={e =>
                      setLeaveData({
                        ...leaveData,
                        fromDate: e.target.value
                      })}
                    required
                    min={new Date()
                      .toISOString()
                      .split('T')[0]}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    To Date *
                  </label>
                  <input
                    type="date"
                    value={leaveData.toDate}
                    onChange={e =>
                      setLeaveData({
                        ...leaveData,
                        toDate: e.target.value
                      })}
                    required
                    min={leaveData.fromDate}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Skip Which Meals? *
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {['breakfast', 'lunch',
                    'dinner'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        const meals =
                          leaveData.skipMeals
                        setLeaveData({
                          ...leaveData,
                          skipMeals:
                            meals.includes(m)
                              ? meals.filter(
                                  x => x !== m
                                )
                              : [...meals, m]
                        })
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          leaveData.skipMeals
                            .includes(m)
                            ? '#FEE2E2'
                            : '#F1F5F9',
                        color:
                          leaveData.skipMeals
                            .includes(m)
                            ? '#DC2626'
                            : 'var(--text-muted)',
                        border:
                          leaveData.skipMeals
                            .includes(m)
                            ? '1.5px solid #FECACA'
                            : '1.5px solid var(--border)',
                        textTransform:
                          'capitalize'
                      }}
                    >
                      {MEAL_ICONS[m]}{' '}{m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Reason
                </label>
                <input
                  type="text"
                  value={leaveData.reason}
                  onChange={e =>
                    setLeaveData({
                      ...leaveData,
                      reason: e.target.value
                    })}
                  placeholder="Going home / Trip etc."
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
                    setShowLeave(false)}
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
                  disabled={submitting}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting
                    ? '⏳...'
                    : '✅ Mark Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}