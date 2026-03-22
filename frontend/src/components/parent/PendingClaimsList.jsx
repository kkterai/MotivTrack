import { useState } from 'react';
import { Card, Button } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * PendingClaimsList - Display and manage pending task claims
 * Allows parents to approve as "Done" or "Extra Well Done", or request redo
 */
export default function PendingClaimsList({ claims, onVerify, loading, onInteractionStart, onInteractionEnd }) {
  const [verifying, setVerifying] = useState(null);
  const [redoNote, setRedoNote] = useState('');
  const [showRedoInput, setShowRedoInput] = useState(null);

  const handleApprove = async (claimId, approvalType) => {
    setVerifying(claimId);
    try {
      await onVerify(claimId, { status: 'verified', approvalType });
    } finally {
      setVerifying(null);
    }
  };

  const handleRequestRedo = async (claimId) => {
    setVerifying(claimId);
    try {
      await onVerify(claimId, { 
        status: 'redo_requested', 
        redoNote: redoNote || 'Please try again' 
      });
      setRedoNote('');
      setShowRedoInput(null);
    } finally {
      setVerifying(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textSecondary }}>
        Loading pending claims...
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPrimary, marginBottom: '8px' }}>
          No pending claims
        </h3>
        <p style={{ fontSize: '14px', color: COLORS.textSecondary }}>
          When your child completes a task, it will show up here for you to verify.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
        Pending Claims ({claims.length})
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {claims.map(claim => (
          <ClaimCard
            key={claim.id}
            claim={claim}
            onApprove={handleApprove}
            onRequestRedo={handleRequestRedo}
            verifying={verifying === claim.id}
            showRedoInput={showRedoInput === claim.id}
            setShowRedoInput={setShowRedoInput}
            redoNote={redoNote}
            setRedoNote={setRedoNote}
            onInteractionStart={onInteractionStart}
            onInteractionEnd={onInteractionEnd}
          />
        ))}
      </div>
    </div>
  );
}

function ClaimCard({
  claim,
  onApprove,
  onRequestRedo,
  verifying,
  showRedoInput,
  setShowRedoInput,
  redoNote,
  setRedoNote,
  onInteractionStart,
  onInteractionEnd
}) {
  const task = claim.task;
  const isExtraWellDone = claim.claimType === 'extra_well_done';
  const pointsAwarded = isExtraWellDone ? task.pointsExtraWellDone : task.pointsDone;

  return (
    <Card style={{
      padding: '20px',
      borderLeft: `4px solid ${isExtraWellDone ? COLORS.accent : COLORS.primary}`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '40px', flexShrink: 0 }}>
          {task.icon || '📋'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: COLORS.textPrimary }}>
              {task.title}
            </h3>
            {isExtraWellDone && (
              <span style={{
                background: COLORS.accent,
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
              }}>
                ⭐ EXTRA WELL DONE
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: COLORS.textSecondary }}>
            {claim.childProfile?.name || claim.child?.name} • {new Date(claim.claimedAt).toLocaleString()}
          </p>
        </div>
        <div style={{
          background: COLORS.backgroundLight,
          padding: '8px 16px',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.primary }}>
            +{pointsAwarded}
          </div>
          <div style={{ fontSize: '11px', color: COLORS.textSecondary, fontWeight: '600' }}>
            POINTS
          </div>
        </div>
      </div>

      {/* Standards */}
      <div style={{
        background: COLORS.backgroundLight,
        padding: '12px',
        borderRadius: '12px',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.textSecondary, marginBottom: '8px' }}>
          {isExtraWellDone ? '⭐ EXTRA WELL DONE STANDARD:' : '✓ DONE STANDARD:'}
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: COLORS.textPrimary, lineHeight: '1.5' }}>
          {isExtraWellDone ? task.extraWellDoneStandard : task.doneStandard}
        </p>
      </div>

      {/* Actions */}
      {!showRedoInput ? (
        <div style={{ display: 'flex', gap: '12px' }}>
          {isExtraWellDone && (
            <Button
              onClick={() => onApprove(claim.id, 'extra_well_done')}
              disabled={verifying}
              style={{
                flex: 1,
                background: COLORS.accent,
                padding: '14px',
                fontSize: '15px',
                fontWeight: '700',
              }}
            >
              {verifying ? 'Approving...' : `⭐ Approve Extra Well Done`}
            </Button>
          )}
          <Button
            onClick={() => onApprove(claim.id, 'done')}
            disabled={verifying}
            style={{
              flex: 1,
              background: COLORS.primary,
              padding: '14px',
              fontSize: '15px',
              fontWeight: '700',
            }}
          >
            {verifying ? 'Approving...' : `✓ Approve as Done`}
          </Button>
          <Button
            onClick={() => setShowRedoInput(claim.id)}
            disabled={verifying}
            style={{
              background: '#FFE5E5',
              color: '#C0392B',
              padding: '14px 20px',
              fontSize: '15px',
              fontWeight: '700',
            }}
          >
            ✗ Send Back
          </Button>
        </div>
      ) : (
        <div>
          <textarea
            value={redoNote}
            onChange={(e) => setRedoNote(e.target.value)}
            onFocus={onInteractionStart}
            onBlur={onInteractionEnd}
            placeholder="Optional: Let them know what needs improvement..."
            style={{
              width: '100%',
              padding: '12px',
              border: `2px solid ${COLORS.borderLight}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '80px',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={() => onRequestRedo(claim.id)}
              disabled={verifying}
              style={{
                flex: 1,
                background: '#C0392B',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '700',
              }}
            >
              {verifying ? 'Sending...' : 'Send Back to Redo'}
            </Button>
            <Button
              onClick={() => {
                setShowRedoInput(null);
                setRedoNote('');
              }}
              disabled={verifying}
              style={{
                background: COLORS.backgroundLight,
                color: COLORS.textSecondary,
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '700',
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
