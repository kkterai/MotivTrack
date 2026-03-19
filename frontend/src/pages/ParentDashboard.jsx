import { useState } from 'react';
import { 
  PendingClaimsList, 
  PendingRedemptionsList, 
  TaskManagement, 
  RewardManagement,
  TeacherStatusList 
} from '../components/parent';
import ChildDashboard from './ChildDashboard';
import { Button, Card } from '../components/common';
import { COLORS } from '../utils/constants';

/**
 * ParentDashboard - Main dashboard for parent users
 * Implements switchable view: Management Panel ↔ Read-Only Child Views
 * Preserves exact layout and functionality from original ParentView
 * 
 * @param {Object} props - Component props
 * @param {string} props.userRole - 'admin_parent' or 'delivery_parent'
 * @param {Array} props.children - Array of child profile objects
 * @param {Array} props.pendingClaims - Claims awaiting verification
 * @param {Function} props.onApproveClaim - Callback when claim is approved
 * @param {Function} props.onApproveClaimExtra - Callback when claim is approved with bonus
 * @param {Function} props.onRequestRedo - Callback when redo is requested
 * @param {Array} props.pendingRedemptions - Redemptions awaiting delivery
 * @param {Function} props.onMarkDelivered - Callback when reward is marked delivered
 * @param {Array} props.tasks - All tasks (for management)
 * @param {Function} props.onAddTask - Callback when task is created
 * @param {Function} props.onEditTask - Callback when task is edited
 * @param {Function} props.onArchiveTask - Callback when task is archived
 * @param {Array} props.rewards - All rewards (for management)
 * @param {Function} props.onAddReward - Callback when reward is created
 * @param {Function} props.onEditReward - Callback when reward is edited
 * @param {Function} props.onRetireReward - Callback when reward is retired
 * @param {Array} props.teachers - Array of teacher objects
 * @param {Array} props.teacherReportsToday - Reports submitted today
 * @param {string} props.today - Today's date string
 */
export default function ParentDashboard({
  userRole,
  children = [],
  pendingClaims = [],
  onApproveClaim,
  onApproveClaimExtra,
  onRequestRedo,
  pendingRedemptions = [],
  onMarkDelivered,
  tasks = [],
  onAddTask,
  onEditTask,
  onArchiveTask,
  rewards = [],
  onAddReward,
  onEditReward,
  onRetireReward,
  teachers = [],
  teacherReportsToday = [],
  today,
}) {
  const [currentView, setCurrentView] = useState('management'); // 'management' or child ID
  const [managementTab, setManagementTab] = useState('pending'); // 'pending', 'tasks', 'rewards', 'teachers'

  const isAdminParent = userRole === 'admin_parent';
  const selectedChild = children.find(c => c.id === currentView);

  // Management Panel View
  const renderManagementPanel = () => (
    <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: COLORS.textPrimary,
          marginBottom: '8px',
        }}>
          Parent Dashboard
        </h1>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
          {isAdminParent ? 'Manage tasks, rewards, and verify completions' : 'Verify tasks and deliver rewards'}
        </p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: COLORS.textPrimary }}>
            View Child Dashboard
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {children.map(child => (
              <Button
                key={child.id}
                variant="secondary"
                onClick={() => setCurrentView(child.id)}
              >
                👀 View {child.name}'s Dashboard
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        background: COLORS.background,
        padding: '4px',
        borderRadius: '12px',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setManagementTab('pending')}
          style={{
            flex: '1 0 auto',
            padding: '12px 16px',
            background: managementTab === 'pending' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: managementTab === 'pending' ? COLORS.textPrimary : COLORS.textSecondary,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: managementTab === 'pending' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          ⏳ Pending ({pendingClaims.length + pendingRedemptions.length})
        </button>
        {isAdminParent && (
          <>
            <button
              onClick={() => setManagementTab('tasks')}
              style={{
                flex: '1 0 auto',
                padding: '12px 16px',
                background: managementTab === 'tasks' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: managementTab === 'tasks' ? COLORS.textPrimary : COLORS.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: managementTab === 'tasks' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              📋 Tasks
            </button>
            <button
              onClick={() => setManagementTab('rewards')}
              style={{
                flex: '1 0 auto',
                padding: '12px 16px',
                background: managementTab === 'rewards' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: managementTab === 'rewards' ? COLORS.textPrimary : COLORS.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: managementTab === 'rewards' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              🎁 Rewards
            </button>
          </>
        )}
        <button
          onClick={() => setManagementTab('teachers')}
          style={{
            flex: '1 0 auto',
            padding: '12px 16px',
            background: managementTab === 'teachers' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: managementTab === 'teachers' ? COLORS.textPrimary : COLORS.textSecondary,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: managementTab === 'teachers' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          👩‍🏫 Teachers
        </button>
      </div>

      {/* Tab Content */}
      {managementTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PendingClaimsList
            claims={pendingClaims}
            onApprove={onApproveClaim}
            onApproveExtra={onApproveClaimExtra}
            onRequestRedo={onRequestRedo}
          />
          <PendingRedemptionsList
            redemptions={pendingRedemptions}
            onMarkDelivered={onMarkDelivered}
          />
        </div>
      )}

      {managementTab === 'tasks' && isAdminParent && (
        <TaskManagement
          tasks={tasks}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onArchiveTask={onArchiveTask}
        />
      )}

      {managementTab === 'rewards' && isAdminParent && (
        <RewardManagement
          rewards={rewards}
          onAddReward={onAddReward}
          onEditReward={onEditReward}
          onRetireReward={onRetireReward}
        />
      )}

      {managementTab === 'teachers' && (
        <TeacherStatusList
          teachers={teachers}
          reportsToday={teacherReportsToday}
          today={today}
        />
      )}
    </div>
  );

  // Read-Only Child View
  const renderChildView = () => {
    if (!selectedChild) return null;

    return (
      <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => setCurrentView('management')}
          style={{ marginBottom: '20px' }}
        >
          ← Back to Management
        </Button>

        {/* Child Name Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: COLORS.textPrimary,
            marginBottom: '4px',
          }}>
            {selectedChild.name}'s Dashboard
          </h2>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary }}>
            Read-only view • You cannot interact with tasks or rewards
          </p>
        </div>

        {/* Child Dashboard in Read-Only Mode */}
        <ChildDashboard
          tasks={selectedChild.tasks || []}
          onSubmitTask={() => {}}
          points={selectedChild.points || 0}
          goal={selectedChild.goal || 20}
          streak={selectedChild.streak || 0}
          bonusAwarded={selectedChild.bonusAwarded || false}
          rewards={selectedChild.rewards || []}
          onRedeemReward={() => {}}
          latestTeacherReport={selectedChild.latestTeacherReport}
          readOnly={true}
        />
      </div>
    );
  };

  return currentView === 'management' ? renderManagementPanel() : renderChildView();
}
