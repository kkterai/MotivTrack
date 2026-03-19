import { ProgressBar } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * PointsDisplay - Shows current points, goal progress, and streak
 * Preserves exact styling from original App.jsx
 * 
 * @param {number} points - Current point balance
 * @param {number} goal - Goal points for next reward
 * @param {number} streak - Current streak count
 * @param {boolean} bonusAwarded - Whether welcome bonus was awarded
 */
export default function PointsDisplay({ points, goal = 20, streak = 0, bonusAwarded = false }) {
  const percentage = Math.min((points / goal) * 100, 100);
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    }}>
      {/* Points Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '4px' }}>
            Your Points
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.primary }}>
            {Number.isInteger(points) ? points : points.toFixed(1)}
          </div>
        </div>
        
        {/* Streak Display */}
        {streak > 0 && (
          <div style={{
            background: COLORS.gradient,
            borderRadius: '12px',
            padding: '8px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px' }}>🔥</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>
              {streak}
            </div>
            <div style={{ fontSize: '11px', color: 'white', opacity: 0.9 }}>
              day streak
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '8px' }}>
        <ProgressBar
          current={points}
          max={goal}
          color={COLORS.gradient}
          height={24}
          showLabel={true}
          animated={true}
        />
      </div>

      {/* Goal Text */}
      <div style={{ fontSize: '13px', color: COLORS.textSecondary, textAlign: 'center' }}>
        {points >= goal ? (
          <span style={{ color: COLORS.primary, fontWeight: '600' }}>
            🎉 Goal reached! You can redeem a reward!
          </span>
        ) : (
          <>
            {goal - points} more {goal - points === 1 ? 'point' : 'points'} to reach your goal
          </>
        )}
      </div>

      {/* Welcome Bonus Badge */}
      {bonusAwarded && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: COLORS.background,
          borderRadius: '8px',
          fontSize: '13px',
          color: COLORS.textSecondary,
          textAlign: 'center',
        }}>
          ✨ Welcome bonus applied!
        </div>
      )}
    </div>
  );
}
