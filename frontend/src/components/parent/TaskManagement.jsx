import { useState } from 'react';
import { Button, Card, Input, Modal } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * TaskManagement - Interface for creating and editing tasks
 * Only available to admin_parent
 * 
 * @param {Array} tasks - Array of task objects
 * @param {Function} onAddTask - Callback when new task is created
 * @param {Function} onEditTask - Callback when task is edited
 * @param {Function} onArchiveTask - Callback when task is archived
 */
export default function TaskManagement({ tasks, onAddTask, onEditTask, onArchiveTask }) {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    icon: '📝',
    pts: 1,
    desc: '',
    tips: '',
    done: '',
    extraWellDone: '',
  });

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        label: task.label,
        icon: task.icon,
        pts: task.pts,
        desc: task.desc || '',
        tips: task.tips?.join('\n') || '',
        done: task.done || '',
        extraWellDone: task.extraWellDone || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        label: '',
        icon: '📝',
        pts: 1,
        desc: '',
        tips: '',
        done: '',
        extraWellDone: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    const taskData = {
      ...formData,
      tips: formData.tips.split('\n').filter(t => t.trim()),
    };

    if (editingTask) {
      onEditTask(editingTask.id, taskData);
    } else {
      onAddTask(taskData);
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
          Task Library
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Add Task
        </Button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
              No tasks yet
            </div>
            <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>
              Create your first task to get started
            </div>
          </div>
        </Card>
      ) : (
        tasks.map(task => (
          <Card key={task.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{task.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary }}>
                  {task.label}
                </div>
                <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
                  {task.pts} {task.pts === 1 ? 'point' : 'points'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  onClick={() => handleOpenModal(task)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onArchiveTask(task.id)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Archive
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
        title={editingTask ? 'Edit Task' : 'Add New Task'}
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
              {editingTask ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Task Name"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="e.g., Take out trash"
            required
          />
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input
              label="Icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🗑️"
              style={{ width: '80px' }}
            />
            <Input
              label="Points"
              type="number"
              value={formData.pts}
              onChange={(e) => setFormData({ ...formData, pts: parseInt(e.target.value) || 1 })}
              placeholder="1"
              style={{ width: '100px' }}
            />
          </div>

          <Input
            label="Description"
            type="textarea"
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            placeholder="What needs to be done?"
          />

          <Input
            label="Tips (one per line)"
            type="textarea"
            value={formData.tips}
            onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
            placeholder="Helpful tips for completing this task..."
          />

          <Input
            label="'Done' Criteria"
            type="textarea"
            value={formData.done}
            onChange={(e) => setFormData({ ...formData, done: e.target.value })}
            placeholder="What does 'done' look like?"
          />

          <Input
            label="'Extra Well Done' Criteria"
            type="textarea"
            value={formData.extraWellDone}
            onChange={(e) => setFormData({ ...formData, extraWellDone: e.target.value })}
            placeholder="What does going above and beyond look like?"
          />
        </div>
      </Modal>
    </div>
  );
}
