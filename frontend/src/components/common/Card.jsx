/**
 * Reusable Card component
 * Preserves exact styling from original App.jsx
 */
export default function Card({ 
  children, 
  onClick, 
  hoverable = false,
  className = '',
  style = {},
}) {
  const baseStyles = {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
    cursor: onClick || hoverable ? 'pointer' : 'default',
    ...style,
  };

  const hoverStyles = (onClick || hoverable) ? {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  } : {};

  return (
    <div
      onClick={onClick}
      className={className}
      style={baseStyles}
      onMouseEnter={(e) => {
        if (onClick || hoverable) {
          Object.assign(e.target.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (onClick || hoverable) {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
      }}
    >
      {children}
    </div>
  );
}
