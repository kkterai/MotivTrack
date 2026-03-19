import { Button, Badge } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * RewardCard - Individual reward card with redeem functionality
 * Preserves exact styling from original App.jsx
 * 
 * @param {Object} reward - Reward object with id, label, pts, icon, category, needsScheduling
 * @param {number} currentPoints - User's current point balance
 * @param {Function} onRedeem - Callback when reward is redeemed
 * @param {boolean} readOnly - If true, disables redemption
 */
export default function RewardCard({ reward, currentPoints, onRedeem, readOnly = false }) {
  const canAfford = currentPoints >= reward.pts;
  const pointsNeeded = reward.pts - currentPoints;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '12px',
        opacity: canAfford ? 1 : 0.6,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '40px' }}>{reward.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary, marginBottom: '4px' }}>
            {reward.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="primary" size="small">
              {reward.pts} points
            </Badge>
            {reward.category && (
              <Badge variant="default" size="small">
                {reward.category}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Scheduling Notice */}
      {reward.needsScheduling && (
        <div style={{
          background: COLORS.background,
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '12px',
          fontSize: '13px',
          color: COLORS.textSecondary,
        }}>
          📅 Needs scheduling with parent
        </div>
      )}

      {/* Buy Link */}
      {reward.buyLink && (
        <div style={{
          background: COLORS.background,
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '12px',
          fontSize: '13px',
        }}>
          <a
            href={reward.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: COLORS.primary,
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            🔗 View options online
          </a>
        </div>
      )}

      {/* Redeem Button */}
      {canAfford ? (
        <Button
          variant="success"
          fullWidth
          onClick={() => !readOnly && onRedeem(reward)}
          disabled={readOnly}
        >
          {readOnly ? 'Redeem' : `Redeem for ${reward.pts} points`}
        </Button>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '12px',
          background: COLORS.background,
          borderRadius: '12px',
          fontSize: '14px',
          color: COLORS.textSecondary,
        }}>
          Need {pointsNeeded} more {pointsNeeded === 1 ? 'point' : 'points'}
        </div>
      )}
    </div>
  );
}
