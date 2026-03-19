import { Button, Card, Badge } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * PendingRedemptionsList - Shows redeemed rewards awaiting delivery
 * Preserves exact styling from original ParentView
 * 
 * @param {Array} redemptions - Array of pending redemption objects
 * @param {Function} onMarkDelivered - Callback when reward is marked as delivered
 * @param {boolean} readOnly - If true, disables all actions
 */
export default function PendingRedemptionsList({ 
  redemptions, 
  onMarkDelivered,
  readOnly = false 
}) {
  if (redemptions.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎁</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
            No pending deliveries
          </div>
          <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>
            Redeemed rewards will appear here
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: '700', 
        color: COLORS.textPrimary,
        marginBottom: '16px',
      }}>
        Pending Deliveries ({redemptions.length})
      </div>

      {redemptions.map(redemption => (
        <Card key={redemption.id} style={{ marginBottom: '12px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '40px' }}>{redemption.reward.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary }}>
                {redemption.reward.label}
              </div>
              <div style={{ fontSize: '13px', color: COLORS.textSecondary }}>
                {redemption.childName} • Redeemed {redemption.redeemedAt}
              </div>
            </div>
            <Badge variant="primary" size="small">
              {redemption.reward.pts} pts
            </Badge>
          </div>

          {/* Scheduling Info */}
          {redemption.needsScheduling && redemption.proposedDate && (
            <div style={{
              padding: '12px',
              background: COLORS.background,
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '14px',
              color: COLORS.textPrimary,
            }}>
              📅 Requested date: <strong>{redemption.proposedDate}</strong>
              {redemption.proposedTime && ` at ${redemption.proposedTime}`}
            </div>
          )}

          {/* Buy Link */}
          {redemption.reward.buyLink && (
            <div style={{
              padding: '12px',
              background: COLORS.background,
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '14px',
            }}>
              <a
                href={redemption.reward.buyLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: COLORS.primary,
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                🔗 View purchase options
              </a>
            </div>
          )}

          {/* Deliver Button */}
          {!readOnly && (
            <Button
              variant="success"
              fullWidth
              onClick={() => onMarkDelivered(redemption.id)}
            >
              ✓ Mark as Delivered
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
