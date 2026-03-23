import { useState, useEffect } from 'react';
import { Button, Card, Input, Modal } from '../common';
import { COLORS } from '../../utils/constants';
import { libraryService } from '../../services/library';

/**
 * TaskManagement - Interface for creating and editing tasks
 * Only available to admin_parent
 * Includes library browser for seeded tasks and custom task creation
 * 
 * @param {Array} tasks - Array of task objects
 * @param {Function} onAddTask - Callback when new task is created
 * @param {Function} onEditTask - Callback when task is edited
 * @param {Function} onArchiveTask - Callback when task is archived
 */
export default function TaskManagement({ tasks, onAddTask, onEditTask, onArchiveTask }) {
  const [showModal, setShowModal] = useState(false);
  const [showLibraryBrowser, setShowLibraryBrowser] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [libraryTasks, setLibraryTasks] = useState([]);
  const [filteredLibraryTasks, setFilteredLibraryTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLibraryTask, setSelectedLibraryTask] = useState(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  
  const [formData, setFormData] = useState({
    label: '',
    icon: '📝',
    pts: 1,
    ptsExtraWellDone: 2,
    desc: '',
    tips: '',
    done: '',
    extraWellDone: '',
    taskType: 'INDIVIDUAL', // INDIVIDUAL or SHARED
  });

  const categories = [
    { value: 'all', label: 'All Tasks', icon: '📋' },
    { value: 'kitchen', label: 'Kitchen', icon: '🍽️' },
    { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
    { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
    { value: 'laundry', label: 'Laundry', icon: '👕' },
    { value: 'outdoor', label: 'Outdoor', icon: '🌳' },
    { value: 'general', label: 'General', icon: '⭐' },
  ];

  useEffect(() => {
    if (showLibraryBrowser && libraryTasks.length === 0) {
      loadLibraryTasks();
    }
  }, [showLibraryBrowser]);

  useEffect(() => {
    filterLibraryTasks();
  }, [libraryTasks, selectedCategory, searchQuery]);

  const loadLibraryTasks = async () => {
    try {
      setLoadingLibrary(true);
      const response = await libraryService.browseTasks();
      setLibraryTasks(response.data || []);
    } catch (err) {
      console.error('Error loading library tasks:', err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const filterLibraryTasks = () => {
    let filtered = [...libraryTasks];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    setFilteredLibraryTasks(filtered);
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : '📝';
  };

  const parseTips = (tipsString) => {
    try {
      return JSON.parse(tipsString);
    } catch {
      return [];
    }
  };

  const handleOpenLibraryBrowser = () => {
    setShowLibraryBrowser(true);
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedLibraryTask(null);
  };

  const handleCloseLibraryBrowser = () => {
    setShowLibraryBrowser(false);
    setSelectedLibraryTask(null);
  };

  const handleSelectLibraryTask = (task) => {
    setSelectedLibraryTask(task);
  };

  const handleUseLibraryTask = () => {
    if (selectedLibraryTask) {
      // Pre-fill form with library task data
      setFormData({
        label: selectedLibraryTask.title,
        icon: getCategoryIcon(selectedLibraryTask.category),
        pts: selectedLibraryTask.suggestedPointsDone,
        ptsExtraWellDone: selectedLibraryTask.suggestedPointsExtraWellDone,
        desc: selectedLibraryTask.description,
        tips: parseTips(selectedLibraryTask.tips).join('\n'),
        done: selectedLibraryTask.doneStandard,
        extraWellDone: selectedLibraryTask.extraWellDoneStandard,
        libraryTaskId: selectedLibraryTask.id,
        taskType: 'INDIVIDUAL', // Default for library tasks
      });
      setShowLibraryBrowser(false);
      setShowModal(true);
    }
  };

  const handleOpenCustomTaskModal = () => {
    setEditingTask(null);
    setFormData({
      label: '',
      icon: '📝',
      pts: 1,
      ptsExtraWellDone: 2,
      desc: '',
      tips: '',
      done: '',
      extraWellDone: '',
      taskType: 'INDIVIDUAL', // Default for new tasks
    });
    setShowModal(true);
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      // Map backend task format to form format
      setFormData({
        label: task.title,
        icon: task.icon || '📝',
        pts: task.pointsDone,
        ptsExtraWellDone: task.pointsExtraWellDone || task.pointsDone + 1,
        desc: task.description || '',
        tips: task.tips || '',
        done: task.doneStandard || '',
        extraWellDone: task.extraWellDoneStandard || '',
        taskType: task.taskType || 'INDIVIDUAL',
      });
    } else {
      handleOpenCustomTaskModal();
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    // Map form data to backend API format
    const taskData = {
      title: formData.label,
      doneStandard: formData.done,
      extraWellDoneStandard: formData.extraWellDone,
      tips: formData.tips.split('\n').filter(t => t.trim()).join('\n'), // Backend expects string
      pointsDone: formData.pts,
      pointsExtraWellDone: formData.ptsExtraWellDone,
      taskType: formData.taskType, // INDIVIDUAL or SHARED
      icon: formData.icon,
      libraryTaskId: formData.libraryTaskId || undefined,
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
          Task Management
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={handleOpenLibraryBrowser}>
            📚 Browse Library
          </Button>
          <Button variant="primary" onClick={handleOpenCustomTaskModal}>
            + Create Custom Task
          </Button>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
              No tasks yet
            </div>
            <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '8px', marginBottom: '16px' }}>
              Choose from our curated library or create your own custom tasks
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={handleOpenLibraryBrowser}>
                📚 Browse Library
              </Button>
              <Button variant="primary" onClick={handleOpenCustomTaskModal}>
                + Create Custom Task
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        tasks.map(task => (
          <Card key={task.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{task.icon || '📝'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary }}>
                  {task.title}
                  {task.taskType === 'SHARED' && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#10b981',
                      backgroundColor: '#d1fae5',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}>
                      👥 Shared
                    </span>
                  )}
                  {task.isFromLibrary && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: COLORS.primary,
                      backgroundColor: COLORS.primaryLight,
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}>
                      📚 Library
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
                  ✅ {task.pointsDone} pts • ⭐ {task.pointsExtraWellDone || task.pointsDone + 1} pts
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

      {/* Library Browser Modal */}
      <Modal
        isOpen={showLibraryBrowser}
        onClose={handleCloseLibraryBrowser}
        title="Task Library"
        size="large"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Info */}
          <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
            Choose from {libraryTasks.length} curated tasks designed for children with ADHD
          </div>

          {/* Search */}
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Category Filter */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto',
            paddingBottom: '8px',
          }}>
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: `2px solid ${selectedCategory === category.value ? COLORS.primary : COLORS.border}`,
                  backgroundColor: selectedCategory === category.value ? COLORS.primaryLight : COLORS.white,
                  color: selectedCategory === category.value ? COLORS.primary : COLORS.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Task Grid */}
          {loadingLibrary ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <div style={{ fontSize: '16px', color: COLORS.textSecondary }}>
                Loading task library...
              </div>
            </div>
          ) : filteredLibraryTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
                No tasks found
              </div>
              <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>
                Try adjusting your search or category filter
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              {filteredLibraryTasks.map(task => (
                <Card 
                  key={task.id}
                  onClick={() => handleSelectLibraryTask(task)}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedLibraryTask?.id === task.id ? `2px solid ${COLORS.primary}` : undefined,
                    backgroundColor: selectedLibraryTask?.id === task.id ? COLORS.primaryLight : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{getCategoryIcon(task.category)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '15px', 
                        color: COLORS.textPrimary,
                        marginBottom: '4px',
                      }}>
                        {task.title}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: COLORS.textSecondary,
                        marginBottom: '8px',
                        lineHeight: '1.4',
                      }}>
                        {task.description.substring(0, 80)}...
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '12px',
                        fontSize: '12px',
                        color: COLORS.textSecondary,
                      }}>
                        <span>✅ {task.suggestedPointsDone} pts</span>
                        <span>⭐ {task.suggestedPointsExtraWellDone} pts</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Selected Task Preview */}
          {selectedLibraryTask && (
            <div style={{ 
              padding: '16px',
              backgroundColor: COLORS.backgroundLight,
              borderRadius: '8px',
              border: `2px solid ${COLORS.primary}`,
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '700', 
                color: COLORS.textPrimary,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ fontSize: '24px' }}>{getCategoryIcon(selectedLibraryTask.category)}</span>
                <span>{selectedLibraryTask.title}</span>
              </div>
              
              <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '12px' }}>
                {selectedLibraryTask.description}
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', marginBottom: '12px' }}>
                <div>
                  <strong>✅ Done:</strong> {selectedLibraryTask.suggestedPointsDone} pts
                </div>
                <div>
                  <strong>⭐ Extra Well Done:</strong> {selectedLibraryTask.suggestedPointsExtraWellDone} pts
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setSelectedLibraryTask(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUseLibraryTask}>
                  Use This Task
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTask ? 'Edit Task' : formData.libraryTaskId ? 'Customize Library Task' : 'Create Custom Task'}
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={!formData.label.trim() || !formData.done.trim()}
            >
              {editingTask ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formData.libraryTaskId && (
            <div style={{ 
              padding: '12px',
              backgroundColor: COLORS.primaryLight,
              borderRadius: '8px',
              fontSize: '14px',
              color: COLORS.primary,
              fontWeight: '600',
            }}>
              📚 Based on library task - customize as needed
            </div>
          )}

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
              label="Done Points"
              type="number"
              value={formData.pts}
              onChange={(e) => setFormData({ ...formData, pts: parseInt(e.target.value) || 1 })}
              placeholder="1"
              style={{ flex: 1 }}
            />
            <Input
              label="Extra Well Done Points"
              type="number"
              value={formData.ptsExtraWellDone}
              onChange={(e) => setFormData({ ...formData, ptsExtraWellDone: parseInt(e.target.value) || 2 })}
              placeholder="2"
              style={{ flex: 1 }}
            />
          </div>

          {/* Task Type Selector */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: COLORS.textPrimary
            }}>
              Task Type
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, taskType: 'INDIVIDUAL' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `2px solid ${formData.taskType === 'INDIVIDUAL' ? COLORS.primary : COLORS.borderLight}`,
                  borderRadius: '8px',
                  background: formData.taskType === 'INDIVIDUAL' ? COLORS.primaryLight : 'white',
                  color: formData.taskType === 'INDIVIDUAL' ? COLORS.primary : COLORS.textSecondary,
                  fontWeight: formData.taskType === 'INDIVIDUAL' ? '600' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                👤 Individual
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                  Each child completes separately
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, taskType: 'SHARED' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `2px solid ${formData.taskType === 'SHARED' ? COLORS.primary : COLORS.borderLight}`,
                  borderRadius: '8px',
                  background: formData.taskType === 'SHARED' ? COLORS.primaryLight : 'white',
                  color: formData.taskType === 'SHARED' ? COLORS.primary : COLORS.textSecondary,
                  fontWeight: formData.taskType === 'SHARED' ? '600' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                👥 Shared
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                  One child completes for all
                </div>
              </button>
            </div>
          </div>

          <Input
            label="Description"
            type="textarea"
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            placeholder="What needs to be done?"
          />

          <Input
            label="'Done' Criteria (Required)"
            type="textarea"
            value={formData.done}
            onChange={(e) => setFormData({ ...formData, done: e.target.value })}
            placeholder="What does 'done' look like?"
            required
          />

          <Input
            label="'Extra Well Done' Criteria"
            type="textarea"
            value={formData.extraWellDone}
            onChange={(e) => setFormData({ ...formData, extraWellDone: e.target.value })}
            placeholder="What does going above and beyond look like?"
          />

          <Input
            label="Tips (one per line)"
            type="textarea"
            value={formData.tips}
            onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
            placeholder="Helpful tips for completing this task..."
          />
        </div>
      </Modal>
    </div>
  );
}
