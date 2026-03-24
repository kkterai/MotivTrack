import React from 'react';
import './RewardCard.css';
import { Card } from '../../ui/Card/Card';
import { Button } from '../../ui/Button/Button';
import { Pill } from '../../ui/Pill/Pill';

/**
 * RewardCard - Displays a reward with redemption action
 * 
 * Used in child dashboard to show available rewards
 */

export function RewardCard({
  reward,
  totalPoints = 0,
  onRedeem,
}) {
  const canAfford = totalPoints >= reward.pointsCost;
  const pointsNeeded = reward.pointsCost - totalPoints;

  return (
    <Card
      variant={canAfford ? 'reward' : 'default'}
      className="reward-card"
    >
      <div className="reward-card__icon">{reward.icon || '🎁'}</div>
      <h3 className="reward-card__title">{reward.title}</h3>
      {reward.category && (
        <div className="reward-card__category">{reward.category}</div>
      )}
      <Pill variant="points" className="reward-card__cost">
        {reward.pointsCost} pts
      </Pill>

      {canAfford ? (
        <>
          {reward.needsScheduling && (
            <div className="reward-card__scheduling">
              🗓️ Needs scheduling
            </div>
          )}
          <Button
            variant="success"
            onClick={() => onRedeem(reward.id)}
            fullWidth
            size="sm"
            className="reward-card__button"
          >
            Redeem
          </Button>
        </>
      ) : (
        <div className="reward-card__insufficient">
          Need {pointsNeeded} more
        </div>
      )}

      {reward.shoppingLink && (
        <a
          href={reward.shoppingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="reward-card__link"
        >
          🔗 Browse online
        </a>
      )}
    </Card>
  );
}

export default RewardCard;
