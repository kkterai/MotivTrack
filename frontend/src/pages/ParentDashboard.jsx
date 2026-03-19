import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useRewardStore } from '../stores/useRewardStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { COLORS } from '../utils/constants';
import { Button, Card, Input } from '../components/common';

/**
 * ParentDashboard - Main dashboard for parent users
 * Matches the design from screenshots with tabs and management interfaces
 */
export default function ParentDashboard() {
  const { user, logout } = useAuthStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const { rewards, fetchRewards, createReward, updateReward, deleteReward } = useRewardStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState('verify'); // verify, inbox, school, tasks, rewards
  const [loading, setLoading] = useState(true);
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // TODO: Fetch child profiles for this parent from API
        // Child profiles will be created via:
        // 1. Onboarding flow (when parent first logs in)
        // 2. Account settings page (for adding additional children)
        
        // For now, fetch notifications only
        await fetchNotifications();
      } catch (error) {
        console.error('Error loading parent dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: COLORS.background,
      }}>
        <div style={{ fontSize: '18px', color: COLORS.textSecondary }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      {/* Header */}
      <div style={{
        background: COLORS.gradient,
        padding: '20px',
        color: 'white',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              👨‍👩‍👧
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                Parent Dashboard
              </h1>
              <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.9 }}>
                {user?.name || 'Parent'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = COLORS.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.color = 'white';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'white',
        borderBottom: `2px solid ${COLORS.borderLight}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
          padding: '0 20px',
        }}>
          {[
            { id: 'verify', label: '✓ Verify', icon: '✓' },
            { id: 'inbox', label: '📬 Inbox', icon: '📬' },
            { id: 'school', label: '🏫 School', icon: '🏫' },
            { id: 'tasks', label: '✏️ Tasks', icon: '✏️' },
            { id: 'rewards', label: '🎁 Rewards', icon: '🎁' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '16px 8px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary,
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
      }}>
        {activeTab === 'verify' && <VerifyTab />}
        {activeTab === 'inbox' && <InboxTab />}
        {activeTab === 'school' && <SchoolTab />}
        {activeTab === 'tasks' && <TasksTab tasks={tasks} onCreateTask={createTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} />}
        {activeTab === 'rewards' && <RewardsTab rewards={rewards} onCreateReward={createReward} onUpdateReward={updateReward} onDeleteReward={deleteReward} />}
      </div>
    </div>
  );
}

// Verify Tab - Pending claims
function VerifyTab() {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
        Pending Claims
      </h2>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
          No pending claims to verify
        </p>
      </div>
    </div>
  );
}

// Inbox Tab - Pending redemptions
function InboxTab() {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
        Pending Deliveries
      </h2>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📬</div>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
          No pending reward deliveries
        </p>
      </div>
    </div>
  );
}

// School Tab - Teacher management
function SchoolTab() {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
        School & Teachers
      </h2>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏫</div>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
          Teacher management coming soon
        </p>
      </div>
    </div>
  );
}

// Tasks Tab - Task management
function TasksTab({ tasks, onCreateTask, onUpdateTask, onDeleteTask }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: COLORS.textPrimary }}>
          Manage Tasks
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: COLORS.primary,
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + Task
        </button>
      </div>

      {showCreateForm && (
        <TaskForm
          onClose={() => setShowCreateForm(false)}
          onSave={(taskData) => {
            onCreateTask(taskData);
            setShowCreateForm(false);
          }}
        />
      )}

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✏️</div>
          <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
            No tasks yet. Click "+ Task" to create one.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </div>
      )}

      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(taskData) => {
            onUpdateTask(editingTask.id, taskData);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onEdit, onDelete }) {
  return (
    <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ fontSize: '32px' }}>{task.icon || '📋'}</div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
          {task.title}
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: COLORS.textSecondary }}>
          {task.pointsDone} pt{task.pointsExtraWellDone > 0 && ` (+${task.pointsExtraWellDone} extra)`}
        </p>
      </div>
      <button
        onClick={onEdit}
        style={{
          background: COLORS.backgroundLight,
          color: COLORS.primary,
          border: `1px solid ${COLORS.primary}`,
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        ✏️ Edit
      </button>
      <button
        onClick={onDelete}
        style={{
          background: 'white',
          color: COLORS.textSecondary,
          border: `1px solid ${COLORS.borderLight}`,
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        🗑️
      </button>
    </Card>
  );
}

// Task Form Component (Create/Edit)
function TaskForm({ task, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    icon: task?.icon || '📋',
    doneStandard: task?.doneStandard || '',
    extraWellDoneStandard: task?.extraWellDoneStandard || '',
    tips: task?.tips || [],
    pointsDone: task?.pointsDone || 1,
    pointsExtraWellDone: task?.pointsExtraWellDone || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <Card style={{
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '24px',
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: COLORS.textPrimary }}>
          {task ? 'Edit Task' : 'Create a New Task'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Task Name"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Vacuum living room"
            required
          />

          <Input
            label="Completion Criteria"
            type="textarea"
            value={formData.doneStandard}
            onChange={(e) => setFormData({ ...formData, doneStandard: e.target.value })}
            placeholder="e.g. All furniture moved, corners done"
            required
          />

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: COLORS.textPrimary }}>
                Points Value
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.pointsDone}
                onChange={(e) => setFormData({ ...formData, pointsDone: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${COLORS.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: COLORS.primary,
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {task ? 'Save Changes' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: 'white',
                color: COLORS.textSecondary,
                border: `2px solid ${COLORS.borderLight}`,
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Rewards Tab - Reward management
function RewardsTab({ rewards, onCreateReward, onUpdateReward, onDeleteReward }) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: COLORS.textPrimary }}>
          Manage Rewards
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: COLORS.primary,
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + Reward
        </button>
      </div>

      {rewards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎁</div>
          <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
            No rewards yet. Click "+ Reward" to create one.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {rewards.map(reward => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      )}

      {showCreateForm && (
        <RewardForm
          onClose={() => setShowCreateForm(false)}
          onSave={(rewardData) => {
            onCreateReward(rewardData);
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}

// Reward Card Component
function RewardCard({ reward }) {
  return (
    <Card style={{ padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '8px' }}>{reward.icon || '🎁'}</div>
      <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: COLORS.textPrimary }}>
        {reward.title}
      </h3>
      <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.primary }}>
        {reward.pointsCost} pts
      </div>
    </Card>
  );
}

// Reward Form Component
function RewardForm({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    icon: '🎁',
    pointsCost: 10,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <Card style={{
        maxWidth: '500px',
        width: '100%',
        padding: '24px',
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: COLORS.textPrimary }}>
          Create a New Reward
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Reward Name"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Trip to the movies"
            required
          />

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: COLORS.textPrimary }}>
              Points Cost
            </label>
            <input
              type="number"
              min="1"
              value={formData.pointsCost}
              onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${COLORS.borderLight}`,
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: COLORS.primary,
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Add Reward
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: 'white',
                color: COLORS.textSecondary,
                border: `2px solid ${COLORS.borderLight}`,
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
