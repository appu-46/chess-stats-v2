interface SpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  className?: string
}

function Spinner({
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
      className={`${sizeClasses[size]} border-gray-200 border-t-transparent rounded-full animate-spin ${className}`}
      style={{
        borderTopColor: color,
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
      }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Spinner
