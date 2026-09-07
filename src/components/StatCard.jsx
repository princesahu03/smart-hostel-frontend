export default function StatCard({
  label, value, icon,
  color, bg, onClick
}) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform =
            'translateY(-2px)'
          e.currentTarget.style.boxShadow =
            '0 8px 24px rgba(0,0,0,0.08)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform =
          'translateY(0)'
        e.currentTarget.style.boxShadow =
          '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        marginBottom: '14px'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '26px',
        fontWeight: '800',
        color: color || 'var(--text)',
        fontFamily: 'Space Grotesk',
        lineHeight: 1
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '13px',
        color: 'var(--text-muted)',
        marginTop: '6px',
        fontWeight: '500'
      }}>
        {label}
      </div>
    </div>
  )
}