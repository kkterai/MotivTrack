import { Button, Card, Badge } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * PendingClaimsList - Shows tasks awaiting parent verification
 * Preserves exact styling from original ParentView
 * 
 * @param {Array} claims - Array of pending claim objects
 * @param {Function} onApprove - Callback when claim is approved
 * @param {Function} onApproveExtra - Callback when claim is approved with bonus
 * @param {Function} onRequestRedo - Callback when redo is requested
 * @param {boolean} readOnly - If true, disables all actions (for delivery_parent without permissions)
 */
export default function PendingClaimsList({ 
  claims, 
  onApprove, 
  onApproveExtra, 
  onRequestRedo,
  readOnly = false 
}) {
  if (claims.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
            All caught up!
          </div>
          <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>
            No tasks awaiting verification
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
        Pending Verification ({claims.length})
      </div>

      {claims.map(claim => (
        <Card key={claim.id} style={{ marginBottom: '12px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '32px' }}>{claim.task.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary }}>
                {claim.task.label}
              </div>
              <div style={{ fontSize: '13px', color: COLORS.textSecondary }}>
                {claim.childName} • {claim.submittedAt}
              </div>
            </div>
            <Badge variant="warning" size="small">
              {claim.submittedQuality === 'extraWellDone' ? '⭐ Extra' : '✓ Done'}
            </Badge>
          </div>

          {/* Quality Details */}
          <div style={{
            padding: '12px',
            background: COLORS.background,
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '14px',
            color: COLORS.textSecondary,
          }}>
            {claim.submittedQuality === 'extraWellDone' 
              ? claim.task.extraWellDone 
              : claim.task.done
            }
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="success"
                onClick={() => onApprove(claim.id)}
                style={{ flex: 1 }}
              >
                ✓ Approve ({claim.task.pts} pts)
              </Button>
              {claim.submittedQuality === 'done' && (
                <Button
                  variant="primary"
                  onClick={() => onApproveExtra(claim.id)}
                  style={{ flex: 1 }}
                >
                  ⭐ Extra ({Math.round(claim.task.pts * 1.5)} pts)
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => onRequestRedo(claim.id)}
                style={{ padding: '12px 16px' }}
              >
                Redo
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
