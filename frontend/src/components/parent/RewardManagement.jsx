import { useState } from 'react';
import { Button, Card, Input, Modal, Badge } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * RewardManagement - Interface for creating and editing rewards
 * Only available to admin_parent
 * 
 * @param {Array} rewards - Array of reward objects
 * @param {Function} onAddReward - Callback when new reward is created
 * @param {Function} onEditReward - Callback when reward is edited
 * @param {Function} onRetireReward - Callback when reward is retired
 */
export default function RewardManagement({ rewards, onAddReward, onEditReward, onRetireReward }) {
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    icon: '🎁',
    pts: 10,
    category: '',
    buyLink: '',
    needsScheduling: false,
  });

  const handleOpenModal = (reward = null) => {
    if (reward) {
      setEditingReward(reward);
      setFormData({
        label: reward.label,
        icon: reward.icon,
        pts: reward.pts,
        category: reward.category || '',
        buyLink: reward.buyLink || '',
        needsScheduling: reward.needsScheduling || false,
      });
    } else {
      setEditingReward(null);
      setFormData({
        label: '',
        icon: '🎁',
        pts: 10,
        category: '',
        buyLink: '',
        needsScheduling: false,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingReward) {
      onEditReward(editingReward.id, formData);
    } else {
      onAddReward(formData);
    }
    setShowModal(false);
  };

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
          Reward Catalog
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Add Reward
        </Button>
      </div>

      {/* Reward List */}
      {rewards.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎁</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
              No rewards yet
            </div>
            <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>
              Create your first reward to motivate your child
            </div>
          </div>
        </Card>
      ) : (
        rewards.map(reward => (
          <Card key={reward.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  {reward.needsScheduling && (
                    <Badge variant="warning" size="small">
                      📅 Needs scheduling
                    </Badge>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  onClick={() => handleOpenModal(reward)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onRetireReward(reward.id)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Retire
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingReward ? 'Edit Reward' : 'Add New Reward'}
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={!formData.label.trim()}
            >
              {editingReward ? 'Save Changes' : 'Add Reward'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Reward Name"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="e.g., Pizza Night"
            required
          />
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input
              label="Icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🍕"
              style={{ width: '80px' }}
            />
            <Input
              label="Points Cost"
              type="number"
              value={formData.pts}
              onChange={(e) => setFormData({ ...formData, pts: parseInt(e.target.value) || 10 })}
              placeholder="10"
              style={{ width: '120px' }}
            />
          </div>

          <Input
            label="Category (Optional)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Food, Activity, Money"
          />

          <Input
            label="Buy Link (Optional)"
            value={formData.buyLink}
            onChange={(e) => setFormData({ ...formData, buyLink: e.target.value })}
            placeholder="https://..."
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.needsScheduling}
              onChange={(e) => setFormData({ ...formData, needsScheduling: e.target.checked })}
            />
            <span style={{ fontSize: '14px', color: COLORS.textPrimary }}>
              Requires scheduling (e.g., movie night, outing)
            </span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
