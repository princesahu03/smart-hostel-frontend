import { useState, useEffect, useRef }
  from 'react'
import api from '../api/axios'
import { useAuth } from
  '../context/AuthContext'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'

const ROLE_COLORS = {
  admin: { bg: '#FEF3C7', color: '#D97706' },
  student: { bg: '#DCFCE7', color: '#16A34A' },
  staff: { bg: '#DBEAFE', color: '#2563EB' },
  security: { bg: '#F3E8FF', color: '#7C3AED' }
}

const ROLE_ICONS = {
  admin: '👑',
  student: '🎓',
  staff: '👷',
  security: '🔐'
}

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] =
    useState([])
  const [users, setUsers] = useState([])
  const [messages, setMessages] =
    useState([])
  const [announcements, setAnnouncements] =
    useState([])
  const [selectedUser, setSelectedUser] =
    useState(null)
  const [newMessage, setNewMessage] =
    useState('')
  const [loading, setLoading] =
    useState(true)
  const [sending, setSending] =
    useState(false)
  const [activeTab, setActiveTab] =
    useState('chats')
  const [showNewChat, setShowNewChat] =
    useState(false)
  const [showAnnounce, setShowAnnounce] =
    useState(false)
  const [announceForm, setAnnounceForm] =
    useState({
      content: '',
      targetRole: 'all',
      type: 'announcement'
    })
  const [searchUser, setSearchUser] =
    useState('')
  const [announcing, setAnnouncing] =
    useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    fetchUsers()
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current
      ?.scrollIntoView({
        behavior: 'smooth'
      })
  }

  const fetchConversations = async () => {
    try {
      const res = await api.get(
        '/messages/conversations'
      )
      setConversations(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get(
        '/messages/users'
      )
      setUsers(res.data.data)
    } catch {}
  }

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(
        `/messages/messages/${userId}`
      )
      setMessages(res.data.data.messages)
      // Refresh conversations for unread:
      fetchConversations()
    } catch {}
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get(
        '/messages/announcements'
      )
      setAnnouncements(res.data.data)
    } catch {}
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser)
      return

    setSending(true)
    try {
      const res = await api.post(
        '/messages/send',
        {
          receiverId: selectedUser._id,
          content: newMessage.trim()
        }
      )
      setMessages(prev => [
        ...prev, res.data.data
      ])
      setNewMessage('')
      fetchConversations()
      inputRef.current?.focus()
    } catch (err) {
      toast.error('Failed to send!')
    } finally {
      setSending(false)
    }
  }

  const handleAnnounce = async (e) => {
    e.preventDefault()
    if (!announceForm.content.trim()) {
      toast.error('Content required!')
      return
    }
    setAnnouncing(true)
    try {
      const res = await api.post(
        '/messages/announce',
        announceForm
      )
      const { sent } = res.data.data
      toast.success(
        `Announcement sent to ${sent} users! 📢`
      )
      setShowAnnounce(false)
      setAnnounceForm({
        content: '',
        targetRole: 'all',
        type: 'announcement'
      })
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed!'
      )
    } finally {
      setAnnouncing(false)
    }
  }

  const startNewChat = (chatUser) => {
    setSelectedUser(chatUser)
    setShowNewChat(false)
    setActiveTab('chats')
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase()
      .includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase()
      .includes(searchUser.toLowerCase())
  )

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  )

  const formatTime = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d

    if (diff < 60000)
      return 'just now'
    if (diff < 3600000)
      return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000)
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (loading) return (
    <Loader text="Loading messages..." />
  )

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '0',
      height: 'calc(100vh - 120px)',
      background: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}
      className="messages-grid">

      {/* LEFT SIDEBAR */}
      <div style={{
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px 16px 12px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              fontFamily: 'Space Grotesk',
              color: 'var(--text)'
            }}>
              💬 Messages
              {totalUnread > 0 && (
                <span style={{
                  marginLeft: '8px',
                  background: '#DC2626',
                  color: 'white',
                  borderRadius: '20px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  {totalUnread}
                </span>
              )}
            </h2>
            <div style={{
              display: 'flex',
              gap: '6px'
            }}>
              {user?.role === 'admin' && (
                <button
                  onClick={() =>
                    setShowAnnounce(true)}
                  style={{
                    padding: '6px',
                    background: '#FEF3C7',
                    color: '#D97706',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  title="Send Announcement"
                >
                  📢
                </button>
              )}
              <button
                onClick={() =>
                  setShowNewChat(true)}
                style={{
                  padding: '6px 10px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                + New
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px'
          }}>
            {[
              { value: 'chats',
                label: '💬 Chats' },
              { value: 'announcements',
                label: '📢 Notices' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() =>
                  setActiveTab(tab.value)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background:
                    activeTab === tab.value
                      ? 'var(--primary)'
                      : '#F1F5F9',
                  color:
                    activeTab === tab.value
                      ? 'white'
                      : 'var(--text-muted)',
                  border: 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div style={{
          flex: 1,
          overflowY: 'auto'
        }}>
          {activeTab === 'chats' && (
            <>
              {conversations.length === 0 ? (
                <div style={{
                  padding: '40px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{
                    fontSize: '36px',
                    marginBottom: '8px'
                  }}>
                    💬
                  </div>
                  <p style={{
                    fontSize: '13px'
                  }}>
                    No conversations yet!
                  </p>
                  <button
                    onClick={() =>
                      setShowNewChat(true)}
                    style={{
                      marginTop: '10px',
                      padding: '6px 14px',
                      background:
                        'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    Start Chat
                  </button>
                </div>
              ) : (
                conversations.map(conv => {
                  const roleStyle =
                    ROLE_COLORS[
                      conv.otherUser?.role
                    ] || ROLE_COLORS.student
                  const isSelected =
                    selectedUser?._id ===
                    conv.otherUser?._id

                  return (
                    <button
                      key={conv._id}
                      onClick={() =>
                        setSelectedUser(
                          conv.otherUser
                        )}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: isSelected
                          ? '#EFF6FF'
                          : 'white',
                        border: 'none',
                        borderBottom:
                          '1px solid var(--border)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition:
                          'background 0.15s',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center'
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background:
                          isSelected
                            ? 'var(--primary)'
                            : roleStyle.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'center',
                        fontSize: '18px',
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        {ROLE_ICONS[
                          conv.otherUser?.role
                        ]}
                        {conv.unreadCount > 0 && (
                          <span style={{
                            position:
                              'absolute',
                            top: '-2px',
                            right: '-2px',
                            width: '16px',
                            height: '16px',
                            background:
                              '#DC2626',
                            color: 'white',
                            borderRadius: '50%',
                            fontSize: '9px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center'
                          }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{
                        flex: 1,
                        minWidth: 0
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            fontWeight:
                              conv.unreadCount > 0
                                ? '700'
                                : '600',
                            fontSize: '13px',
                            color: isSelected
                              ? 'var(--primary)'
                              : 'var(--text)'
                          }}>
                            {conv.otherUser
                              ?.name}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            color:
                              'var(--text-muted)'
                          }}>
                            {conv.lastMessageAt &&
                              formatTime(
                                conv.lastMessageAt
                              )}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color:
                            'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: '2px'
                        }}>
                          {conv.lastMessage
                            ?.content ||
                            'Start conversation...'}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </>
          )}

          {activeTab === 'announcements' && (
            <div>
              {announcements.length === 0 ? (
                <div style={{
                  padding: '40px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{
                    fontSize: '36px'
                  }}>
                    📢
                  </div>
                  <p style={{
                    fontSize: '13px',
                    marginTop: '8px'
                  }}>
                    No announcements!
                  </p>
                </div>
              ) : (
                announcements.map((ann, i) => (
                  <div key={i} style={{
                    padding: '12px 16px',
                    borderBottom:
                      '1px solid var(--border)',
                    background:
                      ann.type === 'emergency'
                        ? '#FFF5F5'
                        : 'white'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        {ann.type === 'emergency'
                          ? '🚨'
                          : '📢'}
                      </span>
                      <div>
                        <p style={{
                          fontSize: '12px',
                          color: 'var(--text)',
                          lineHeight: 1.5
                        }}>
                          {ann.content}
                        </p>
                        <p style={{
                          fontSize: '10px',
                          color:
                            'var(--text-muted)',
                          marginTop: '4px'
                        }}>
                          By:{' '}
                          {ann.sender?.name} •{' '}
                          {formatTime(
                            ann.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Chat Area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        {!selectedUser ? (
          // Empty state:
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            padding: '40px'
          }}>
            <div style={{ fontSize: '64px' }}>
              💬
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: 'Space Grotesk',
              color: 'var(--text)',
              marginTop: '16px',
              marginBottom: '8px'
            }}>
              Select a conversation
            </h2>
            <p style={{ fontSize: '14px' }}>
              Choose from your chats or
              start a new one!
            </p>
            <button
              onClick={() =>
                setShowNewChat(true)}
              className="btn-primary"
              style={{
                marginTop: '16px',
                padding: '10px 24px'
              }}
            >
              + New Message
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom:
                '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background:
                  ROLE_COLORS[
                    selectedUser.role
                  ]?.bg || '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {ROLE_ICONS[selectedUser.role]}
              </div>
              <div>
                <p style={{
                  fontWeight: '700',
                  fontSize: '15px',
                  color: 'var(--text)'
                }}>
                  {selectedUser.name}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  textTransform: 'capitalize'
                }}>
                  {selectedUser.role}
                  {selectedUser.roomNumber &&
                    ` • Room ${selectedUser
                      .roomNumber}`}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: '#F8FAFC'
            }}>
              {messages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{
                    fontSize: '40px'
                  }}>
                    👋
                  </div>
                  <p style={{
                    marginTop: '8px',
                    fontSize: '14px'
                  }}>
                    Say hi to{' '}
                    {selectedUser.name}!
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine =
                    msg.sender._id ===
                    user._id ||
                    msg.sender._id?.toString()
                    === user._id?.toString()

                  const showDate =
                    i === 0 ||
                    new Date(msg.createdAt)
                      .toDateString() !==
                    new Date(
                      messages[i - 1]
                        ?.createdAt
                    ).toDateString()

                  return (
                    <div key={msg._id}>
                      {showDate && (
                        <div style={{
                          textAlign: 'center',
                          margin: '8px 0',
                          fontSize: '11px',
                          color:
                            'var(--text-muted)'
                        }}>
                          {new Date(
                            msg.createdAt
                          ).toLocaleDateString(
                            'en-IN', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            }
                          )}
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent:
                          isMine
                            ? 'flex-end'
                            : 'flex-start',
                        alignItems:
                          'flex-end',
                        gap: '6px'
                      }}>
                        {/* Avatar for others */}
                        {!isMine && (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background:
                              ROLE_COLORS[
                                msg.sender
                                  ?.role
                              ]?.bg || '#EFF6FF',
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            fontSize: '14px',
                            flexShrink: 0
                          }}>
                            {ROLE_ICONS[
                              msg.sender?.role
                            ] || '👤'}
                          </div>
                        )}

                        <div style={{
                          maxWidth: '65%'
                        }}>
                          {/* Announcement badge */}
                          {msg.isAnnouncement && (
                            <div style={{
                              fontSize: '10px',
                              color: '#D97706',
                              fontWeight: '700',
                              marginBottom:
                                '3px',
                              textAlign:
                                isMine
                                  ? 'right'
                                  : 'left'
                            }}>
                              📢 ANNOUNCEMENT
                            </div>
                          )}

                          {/* Bubble */}
                          <div style={{
                            padding: '10px 14px',
                            borderRadius:
                              isMine
                                ? '18px 18px 4px 18px'
                                : '18px 18px 18px 4px',
                            background:
                              msg.type ===
                                'emergency'
                                ? '#DC2626'
                                : isMine
                                ? 'var(--primary)'
                                : msg.isAnnouncement
                                ? '#FEF3C7'
                                : 'white',
                            color:
                              msg.type ===
                                'emergency'
                                ? 'white'
                                : isMine
                                ? 'white'
                                : msg.isAnnouncement
                                ? '#92400E'
                                : 'var(--text)',
                            boxShadow:
                              '0 1px 4px rgba(0,0,0,0.08)',
                            border:
                              !isMine &&
                              !msg.isAnnouncement
                                ? '1px solid var(--border)'
                                : 'none'
                          }}>
                            <p style={{
                              fontSize: '13px',
                              lineHeight: 1.5,
                              margin: 0
                            }}>
                              {msg.content}
                            </p>
                          </div>

                          {/* Time + read */}
                          <div style={{
                            fontSize: '10px',
                            color:
                              'var(--text-muted)',
                            marginTop: '3px',
                            textAlign:
                              isMine
                                ? 'right'
                                : 'left',
                            display: 'flex',
                            justifyContent:
                              isMine
                                ? 'flex-end'
                                : 'flex-start',
                            gap: '4px',
                            alignItems:
                              'center'
                          }}>
                            {formatTime(
                              msg.createdAt
                            )}
                            {isMine && (
                              <span style={{
                                color:
                                  msg.isRead
                                    ? '#2563EB'
                                    : '#94A3B8'
                              }}>
                                {msg.isRead
                                  ? '✓✓'
                                  : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: '16px 20px',
              borderTop:
                '1px solid var(--border)',
              background: 'white'
            }}>
              <form onSubmit={handleSend}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={e =>
                    setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedUser.name}...`}
                  className="input"
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '24px',
                    fontSize: '13px'
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' &&
                        !e.shiftKey) {
                      e.preventDefault()
                      handleSend(e)
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={
                    !newMessage.trim() ||
                    sending
                  }
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background:
                      newMessage.trim()
                        ? 'var(--primary)'
                        : '#E2E8F0',
                    color:
                      newMessage.trim()
                        ? 'white'
                        : '#94A3B8',
                    border: 'none',
                    cursor:
                      newMessage.trim()
                        ? 'pointer'
                        : 'not-allowed',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s'
                  }}
                >
                  {sending ? '⏳' : '➤'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '400px',
              padding: '24px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                💬 New Message
              </h2>
              <button
                onClick={() =>
                  setShowNewChat(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              value={searchUser}
              onChange={e =>
                setSearchUser(e.target.value)}
              placeholder="Search by name or email..."
              className="input"
              style={{ marginBottom: '12px' }}
              autoFocus
            />

            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {filteredUsers.length === 0 ? (
                <p style={{
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  padding: '20px',
                  fontSize: '13px'
                }}>
                  No users found!
                </p>
              ) : (
                filteredUsers.map(u => {
                  const roleStyle =
                    ROLE_COLORS[u.role] ||
                    ROLE_COLORS.student
                  return (
                    <button
                      key={u._id}
                      onClick={() =>
                        startNewChat(u)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'white',
                        border:
                          '1px solid var(--border)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition:
                          'background 0.15s'
                      }}
                      onMouseEnter={e =>
                        e.currentTarget
                          .style.background =
                          '#EFF6FF'}
                      onMouseLeave={e =>
                        e.currentTarget
                          .style.background =
                          'white'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background:
                          roleStyle.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        {ROLE_ICONS[u.role]}
                      </div>
                      <div>
                        <p style={{
                          fontWeight: '700',
                          fontSize: '14px',
                          color: 'var(--text)'
                        }}>
                          {u.name}
                        </p>
                        <p style={{
                          fontSize: '11px',
                          color:
                            'var(--text-muted)'
                        }}>
                          {u.email} •{' '}
                          <span style={{
                            color: roleStyle.color,
                            fontWeight: '600',
                            textTransform:
                              'capitalize'
                          }}>
                            {u.role}
                          </span>
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal (Admin) */}
      {showAnnounce && (
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
                📢 Send Announcement
              </h2>
              <button
                onClick={() =>
                  setShowAnnounce(false)}
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

            <form onSubmit={handleAnnounce}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              {/* Type */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Type
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {[
                    { value: 'announcement',
                      label: '📢 Normal' },
                    { value: 'emergency',
                      label: '🚨 Emergency' },
                  ].map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setAnnounceForm({
                          ...announceForm,
                          type: t.value
                        })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          announceForm.type
                            === t.value
                            ? t.value ===
                              'emergency'
                              ? '#DC2626'
                              : 'var(--primary)'
                            : '#F1F5F9',
                        color:
                          announceForm.type
                            === t.value
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

              {/* Target Role */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Send To
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(4, 1fr)',
                  gap: '6px'
                }}>
                  {[
                    { value: 'all',
                      label: '👥 All' },
                    { value: 'student',
                      label: '🎓 Students' },
                    { value: 'staff',
                      label: '👷 Staff' },
                    { value: 'security',
                      label: '🔐 Security' },
                  ].map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() =>
                        setAnnounceForm({
                          ...announceForm,
                          targetRole: r.value
                        })}
                      style={{
                        padding: '7px 4px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background:
                          announceForm
                            .targetRole
                            === r.value
                            ? 'var(--primary)'
                            : '#F1F5F9',
                        color:
                          announceForm
                            .targetRole
                            === r.value
                            ? 'white'
                            : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Message *
                </label>
                <textarea
                  value={announceForm.content}
                  onChange={e =>
                    setAnnounceForm({
                      ...announceForm,
                      content: e.target.value
                    })}
                  placeholder="Type your announcement..."
                  rows={4}
                  required
                  className="input"
                  style={{
                    resize: 'none',
                    fontFamily: 'Inter'
                  }}
                />
              </div>

              {/* Warning */}
              {announceForm.type ===
                'emergency' && (
                <div style={{
                  background: '#FEE2E2',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: '#DC2626',
                  fontWeight: '600'
                }}>
                  🚨 This will be marked as
                  EMERGENCY and highlighted
                  in red for all recipients!
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setShowAnnounce(false)}
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
                  disabled={announcing}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background:
                      announceForm.type ===
                        'emergency'
                        ? '#DC2626'
                        : 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                    opacity: announcing ? 0.7 : 1
                  }}
                >
                  {announcing
                    ? '⏳ Sending...'
                    : `📢 Send to ${
                      announceForm.targetRole
                        === 'all'
                        ? 'Everyone'
                        : announceForm.targetRole
                    }`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}