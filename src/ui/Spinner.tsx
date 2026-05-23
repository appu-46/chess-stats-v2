interface SpinnerProps {
  loadingMsg?: string | ''
  size?: 'small' | 'medium' | 'large'
  color?: string
  className?: string
}

function Spinner({
  loadingMsg = '',
  size = 'medium',
  color = '#233b46',
  className = '',
}: SpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4',
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
      }}
    >
      <span>{loadingMsg}</span>

      <div
        className={`${sizeClasses[size]} border-gray-200 border-t-transparent rounded-full animate-spin ${className}`}
        style={{
          borderTopColor: color,
        }}
        role="status"
        aria-label="Loading"
      ></div>
    </div>
  )
}

export default Spinner
