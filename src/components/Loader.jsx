export default function Loader({
  text = 'Loading...'
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh', // ← 60vh se 100vh
      gap: '16px',
      background: 'var(--bg)'
    }}>
      <div style={{
        fontSize: '48px'
      }}>
        🏠
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        border:
          '3px solid var(--border)',
        borderTop:
          '3px solid var(--primary)',
        borderRadius: '50%',
        animation:
          'spin 1s linear infinite'
      }} />
      <p style={{
        color: 'var(--text-muted)',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {text}
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}