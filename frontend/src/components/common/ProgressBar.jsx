import { COLORS } from '../../utils/constants';

/**
 * Animated Progress Bar component
 * Preserves exact styling from original App.jsx
 */
export default function ProgressBar({ 
  current, 
  max, 
  color = COLORS.purpleGradient,
  height = 24,
  showLabel = true,
  animated = true,
}) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          background: COLORS.gray,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: color,
            borderRadius: '12px',
            transition: animated ? 'width 0.5s ease-out' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '8px',
          }}
        >
          {showLabel && percentage > 15 && (
            <span
              style={{
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {current}/{max}
            </span>
          )}
        </div>
      </div>
      {showLabel && percentage <= 15 && (
        <div
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: COLORS.grayDark,
            textAlign: 'right',
          }}
        >
          {current}/{max}
        </div>
      )}
    </div>
  );
}
