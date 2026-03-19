import RewardCard from './RewardCard';
import { COLORS } from '../../utils/constants';

/**
 * RewardList - List of available rewards
 * Preserves exact styling from original App.jsx
 * 
 * @param {Array} rewards - Array of reward objects
 * @param {number} currentPoints - User's current point balance
 * @param {Function} onRedeem - Callback when a reward is redeemed
 * @param {boolean} readOnly - If true, disables all interactions
 */
export default function RewardList({ rewards, currentPoints, onRedeem, readOnly = false }) {
  // Sort rewards: affordable first, then by points ascending
  const sortedRewards = [...rewards].sort((a, b) => {
    const aAffordable = currentPoints >= a.pts;
    const bAffordable = currentPoints >= b.pts;
    
    if (aAffordable && !bAffordable) return -1;
    if (!aAffordable && bAffordable) return 1;
    return a.pts - b.pts;
  });

  const affordableCount = rewards.filter(r => currentPoints >= r.pts).length;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.textPrimary }}>
          Available Rewards
        </div>
        {affordableCount > 0 && (
          <div style={{
            background: COLORS.gradient,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
          }}>
            {affordableCount} ready!
          </div>
        )}
      </div>

      {/* Rewards */}
      {rewards.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: COLORS.textSecondary,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎁</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>No rewards yet</div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {readOnly ? 'Rewards will appear here when added' : 'Ask your parent to add some rewards!'}
          </div>
        </div>
      ) : (
        sortedRewards.map(reward => (
          <RewardCard
            key={reward.id}
            reward={reward}
            currentPoints={currentPoints}
            onRedeem={onRedeem}
            readOnly={readOnly}
          />
        ))
      )}
    </div>
  );
}
