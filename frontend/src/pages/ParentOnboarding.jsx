import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { childProfileService } from '../services/childProfiles';
import { invitationService } from '../services/invitations';
import { taskService } from '../services/tasks';
import { rewardService } from '../services/rewards';
import { COLORS } from '../utils/constants';
import { Button, Card, Input } from '../components/common';

const STORAGE_KEY = 'motivtrack_onboarding_state';

/**
 * ParentOnboarding - 7-step wizard for Admin Parent onboarding
 * Based on ONBOARDING_FLOW_SPEC.md
 * Features: State persistence via localStorage
 */
export default function ParentOnboarding() {
  const navigate = useNavigate();
  
  // Load state from localStorage or use defaults
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        console.log('[ParentOnboarding] Restored state from localStorage');
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('[ParentOnboarding] Failed to load state:', err);
    }
    return {
      currentStep: 1,
      childData: { name: '', grade: '', age: '', schoolName: '' },
      childProfile: null,
      welcomeBonus: 5,
      rewards: [],
      tasks: [],
      childEmail: '',
      deliveryParentEmail: '',
      invitationData: null,
    };
  };

  const initialState = loadState();
  
  const [currentStep, setCurrentStep] = useState(initialState.currentStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wizard data - initialized from localStorage
  const [childData, setChildData] = useState(initialState.childData);
  const [childProfile, setChildProfile] = useState(initialState.childProfile);
  const [welcomeBonus, setWelcomeBonus] = useState(initialState.welcomeBonus);
  const [rewards, setRewards] = useState(initialState.rewards);
  const [tasks, setTasks] = useState(initialState.tasks);
  const [childEmail, setChildEmail] = useState(initialState.childEmail);
  const [deliveryParentEmail, setDeliveryParentEmail] = useState(initialState.deliveryParentEmail);
  const [invitationData, setInvitationData] = useState(initialState.invitationData);

  const totalSteps = 7;

  // Debug: Log childProfile changes
  useEffect(() => {
    console.log('[ParentOnboarding] childProfile state changed:', childProfile);
    console.log('[ParentOnboarding] childProfile type:', typeof childProfile);
    console.log('[ParentOnboarding] childProfile.id:', childProfile?.id);
  }, [childProfile]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      currentStep,
      childData,
      childProfile,
      welcomeBonus,
      rewards,
      tasks,
      childEmail,
      deliveryParentEmail,
      invitationData,
    };
    console.log('[ParentOnboarding] Saving state to localStorage:', state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentStep, childData, childProfile, welcomeBonus, rewards, tasks, childEmail, deliveryParentEmail, invitationData]);

  // Clear localStorage on unmount if completed
  const clearOnboardingState = () => {
    console.log('[ParentOnboarding] Clearing onboarding state');
    localStorage.removeItem(STORAGE_KEY);
  };

  // Step 1: Your Child
  const handleStep1Submit = async () => {
    if (!childData.name) {
      setError('Please enter your child\'s name');
      return;
    }

    if (!childData.age) {
      setError('Please enter your child\'s age (required for COPPA compliance)');
      return;
    }

    const age = parseInt(childData.age);
    if (isNaN(age) || age < 1 || age > 18) {
      setError('Please enter a valid age between 1 and 18');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[ParentOnboarding] Step 1: Creating child profile with data:', {
        name: childData.name,
        grade: childData.grade || undefined,
        age: childData.age ? parseInt(childData.age) : undefined,
        schoolName: childData.schoolName || undefined,
      });

      const response = await childProfileService.createChildProfile({
        name: childData.name,
        grade: childData.grade || undefined,
        age: childData.age ? parseInt(childData.age) : undefined,
        schoolName: childData.schoolName || undefined,
        welcomeBonusPoints: 0,
      });

      console.log('[ParentOnboarding] Step 1: Full API response:', response);
      console.log('[ParentOnboarding] Step 1: response.data:', response.data);
      console.log('[ParentOnboarding] Step 1: response.data type:', typeof response.data);
      console.log('[ParentOnboarding] Step 1: response.data.id:', response.data?.id);

      // The service returns the child profile directly (already unwrapped by api.js interceptor)
      console.log('[ParentOnboarding] Step 1: About to call setChildProfile with:', response);
      setChildProfile(response);
      
      console.log('[ParentOnboarding] Step 1: Moving to step 2');
      setCurrentStep(2);
      
      console.log('[ParentOnboarding] Step 1: Complete - childProfile should be set in next render');
    } catch (err) {
      console.error('[ParentOnboarding] Step 1 error:', err);
      setError(err.response?.data?.error || 'Failed to create child profile');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Give Head Start
  // Note: Welcome bonus was already awarded in Step 1 during child profile creation
  // This step just allows parents to see/confirm the bonus amount before proceeding
  const handleStep2Submit = () => {
    setError(null);
    setCurrentStep(3);
  };

  // Step 3: What Can [Child] Earn?
  const handleStep3Submit = () => {
    if (rewards.length === 0) {
      setError('Please add at least one reward');
      return;
    }
    setError(null);
    setCurrentStep(4);
  };

  const handleAddReward = async (rewardData) => {
    console.log('[ParentOnboarding.handleAddReward] Called with:', rewardData);
    console.log('[ParentOnboarding.handleAddReward] childProfile:', childProfile);
    console.log('[ParentOnboarding.handleAddReward] childProfile type:', typeof childProfile);
    console.log('[ParentOnboarding.handleAddReward] childProfile.id:', childProfile?.id);
    
    if (!childProfile || !childProfile.id) {
      console.error('[ParentOnboarding.handleAddReward] childProfile validation failed');
      setError('Child profile not found. Please go back to Step 1 and create the child profile again.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...rewardData,
        childProfileId: childProfile.id,
      };
      console.log('[ParentOnboarding.handleAddReward] Calling API with:', payload);
      
      const response = await rewardService.createReward(payload);
      console.log('[ParentOnboarding.handleAddReward] Success:', response);
      
      // The service already unwraps response.data, so response is the reward object
      setRewards([...rewards, response]);
    } catch (err) {
      console.error('[ParentOnboarding.handleAddReward] Error:', err);
      console.error('[ParentOnboarding.handleAddReward] Error response:', err.response);
      setError(err.response?.data?.error || 'Failed to create reward');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Tasks for [Child]
  const handleStep4Submit = () => {
    if (tasks.length === 0) {
      setError('Please add at least one task');
      return;
    }
    setError(null);
    setCurrentStep(5);
  };

  const handleAddTask = async (taskData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.createTask({
        ...taskData,
        childProfileId: childProfile.id,
      });
      // The service already unwraps response.data, so response is the task object
      setTasks([...tasks, response]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Invite Child
  const handleStep5Submit = async () => {
    if (!childEmail) {
      setError('Please enter your child\'s email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await invitationService.createInvitation({
        email: childEmail,
        role: 'child',
        childProfileId: childProfile.id,
        childName: childData.name,
      });
      
      // Store the invitation data (emailText contains subject, body, link)
      setInvitationData(response.emailText);
      setCurrentStep(5.5); // Go to copy invitation step
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Invite Delivery Parent (Optional)
  const handleStep6Submit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (deliveryParentEmail) {
        await invitationService.createInvitation({
          email: deliveryParentEmail,
          role: 'delivery_parent',
          childProfileId: childProfile.id,
        });
      }
      setCurrentStep(7);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  // Step 7: You're All Set
  const handleComplete = () => {
    console.log('[ParentOnboarding] handleComplete called');
    console.log('[ParentOnboarding] Clearing onboarding state...');
    clearOnboardingState();
    console.log('[ParentOnboarding] Navigating to /parent...');
    navigate('/parent');
    console.log('[ParentOnboarding] Navigate called');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1YourChild data={childData} setData={setChildData} onNext={handleStep1Submit} />;
      case 2:
        return <Step2HeadStart childName={childData.name} bonus={welcomeBonus} setBonus={setWelcomeBonus} onNext={handleStep2Submit} onBack={() => setCurrentStep(1)} />;
      case 3:
        return <Step3Rewards childName={childData.name} rewards={rewards} onAddReward={handleAddReward} onNext={handleStep3Submit} onBack={() => setCurrentStep(2)} />;
      case 4:
        return <Step4Tasks childName={childData.name} tasks={tasks} onAddTask={handleAddTask} onNext={handleStep4Submit} onBack={() => setCurrentStep(3)} />;
      case 5:
        return <Step5InviteChild childName={childData.name} email={childEmail} setEmail={setChildEmail} rewards={rewards} tasks={tasks} welcomeBonus={welcomeBonus} onNext={handleStep5Submit} onBack={() => setCurrentStep(4)} />;
      case 5.5:
        return <Step5bCopyInvitation childName={childData.name} invitationData={invitationData} onNext={() => setCurrentStep(6)} onBack={() => setCurrentStep(5)} />;
      case 6:
        return <Step6InviteDeliveryParent childName={childData.name} email={deliveryParentEmail} setEmail={setDeliveryParentEmail} onNext={handleStep6Submit} onSkip={() => setCurrentStep(7)} onBack={() => setCurrentStep(5.5)} />;
      case 7:
        return <Step7AllSet childName={childData.name} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textPrimary }}>
              Step {currentStep} of {totalSteps}
            </span>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div style={{
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: COLORS.gradient,
              width: `${(currentStep / totalSteps) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#991b1b',
          }}>
            {error}
          </div>
        )}

        {/* Current Step */}
        {renderStep()}

        {/* Loading Overlay */}
        {loading && (
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
          }}>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
            }}>
              Loading...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function Step1YourChild({ data, setData, onNext }) {
  return (
    <Card>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.textPrimary }}>
        Tell us about your child
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
        We'll use this to personalize their experience
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Child's Name "
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder="e.g., Alex"
          fullWidth
        />
        <Input
          label="Age"
          type="number"
          value={data.age}
          onChange={(e) => setData({ ...data, age: e.target.value })}
          placeholder="e.g., 12"
          fullWidth
        />
        <Input
          label="Grade (Optional)"
          value={data.grade}
          onChange={(e) => setData({ ...data, grade: e.target.value })}
          placeholder="e.g., 6th"
          fullWidth
        />
        <Input
          label="School Name (Optional)"
          value={data.schoolName}
          onChange={(e) => setData({ ...data, schoolName: e.target.value })}
          placeholder="e.g., Lincoln Middle School"
          fullWidth
        />
      </div>

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onNext} variant="primary">
          Continue
        </Button>
      </div>
    </Card>
  );
}

function Step2HeadStart({ childName, bonus, setBonus, onNext, onBack }) {
  return (
    <Card>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.textPrimary }}>
        Give {childName} a head start
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
        Award bonus points to get them excited! They'll see this when they first log in.
      </p>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: COLORS.textPrimary }}>
          Bonus Points: {bonus}
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={bonus}
          onChange={(e) => setBonus(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: COLORS.textSecondary, marginTop: '4px' }}>
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onNext} variant="primary">
          Continue
        </Button>
      </div>
    </Card>
  );
}

function Step3Rewards({ childName, rewards, onAddReward, onNext, onBack }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointsCost: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.pointsCost) return;
    
    await onAddReward({
      title: formData.title,
      description: formData.description,
      pointsCost: parseInt(formData.pointsCost),
      isActive: true,
    });
    
    setFormData({ title: '', description: '', pointsCost: '' });
    setShowForm(false);
  };

  return (
    <Card>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.textPrimary }}>
        What can {childName} earn?
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
        Add at least one reward. You can add more later.
      </p>

      {/* Rewards List */}
      <div style={{ marginBottom: '16px' }}>
        {rewards.map((reward, index) => (
          <div key={index} style={{
            padding: '12px',
            background: '#f9fafb',
            borderRadius: '8px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: '600', color: COLORS.textPrimary }}>{reward.title}</div>
              {reward.description && (
                <div style={{ fontSize: '13px', color: COLORS.textSecondary, marginTop: '2px' }}>{reward.description}</div>
              )}
              <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>{reward.pointsCost} points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reward Form */}
      {showForm ? (
        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
          <Input
            label="Reward Name"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., $20 cash"
            fullWidth
            style={{ marginBottom: '12px' }}
          />
          <Input
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., For saving up"
            fullWidth
            style={{ marginBottom: '12px' }}
          />
          <Input
            label="Point Cost"
            type="number"
            value={formData.pointsCost}
            onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
            placeholder="e.g., 20"
            fullWidth
            style={{ marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={handleSubmit} variant="primary">Add Reward</Button>
            <Button onClick={() => setShowForm(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="outline" fullWidth>
          + Add Reward
        </Button>
      )}

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onNext} variant="primary" disabled={rewards.length === 0}>
          Continue
        </Button>
      </div>
    </Card>
  );
}

function Step4Tasks({ childName, tasks, onAddTask, onNext, onBack }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    doneStandard: '',
    pointsDone: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.pointsDone) return;
    
    await onAddTask({
      title: formData.title,
      doneStandard: formData.doneStandard,
      pointsDone: parseFloat(formData.pointsDone),
      pointsExtraWellDone: 0,
    });
    
    setFormData({ title: '', doneStandard: '', pointsDone: '' });
    setShowForm(false);
  };

  return (
    <Card>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.textPrimary }}>
        Tasks for {childName}
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
        Add at least one task. You can add more later.
      </p>

      {/* Tasks List */}
      <div style={{ marginBottom: '16px' }}>
        {tasks.map((task, index) => (
          <div key={index} style={{
            padding: '12px',
            background: '#f9fafb',
            borderRadius: '8px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: '600', color: COLORS.textPrimary }}>{task.title}</div>
              <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>{task.pointsDone} points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Form */}
      {showForm ? (
        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
          <Input
            label="Task Name"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Take out trash"
            fullWidth
            style={{ marginBottom: '12px' }}
          />
          <Input
            label="What does 'done' look like? (Optional)"
            value={formData.doneStandard}
            onChange={(e) => setFormData({ ...formData, doneStandard: e.target.value })}
            placeholder="e.g., Bag tied, taken outside, new liner in"
            fullWidth
            style={{ marginBottom: '12px' }}
          />
          <Input
            label="Points"
            type="number"
            value={formData.pointsDone}
            onChange={(e) => setFormData({ ...formData, pointsDone: e.target.value })}
            placeholder="e.g., 1"
            fullWidth
            style={{ marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={handleSubmit} variant="primary">Add Task</Button>
            <Button onClick={() => setShowForm(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="outline" fullWidth>
          + Add Task
        </Button>
      )}

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onNext} variant="primary" disabled={tasks.length === 0}>
          Continue
        </Button>
      </div>
    </Card>
  );
}

function Step5InviteChild({ childName, email, setEmail, rewards, tasks, welcomeBonus, onNext, onBack }) {
  return (
    <Card>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.textPrimary }}>
        Invite {childName}
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
        We'll send {childName} an email to create their account
      </p>

      {/* Summary */}
      <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: COLORS.textPrimary }}>
          Here's what {childName} will see:
        </div>
        <ul style={{ fontSize: '14px', color: COLORS.textSecondary, paddingLeft: '20px', margin: 0 }}>
          <li>{welcomeBonus} welcome bonus points</li>
          <li>{rewards.length} reward{rewards.length !== 1 ? 's' : ''} to earn</li>
          <li>{tasks.length} task{tasks.length !== 1 ? 's' : ''} to complete</li>
        </ul>
      </div>

      <Input
        label={`${childName}'s Email`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="e.g., alex@example.com"
        fullWidth
      />

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onNext} variant="primary">
          Send Invitation
        </Button>
      </div>
    </Card>
  );
}

function Step5bCopyInvitation({ childName, invitationData, onNext, onBack }) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!invitationData) {
    return (
      <Card>
        <p style={{ color: COLORS.textSecondary }}>Loading invitation...</p>
      </Card>
    );
  }

  const handleCopyMessage = () => {
    const fullMessage = `${invitationData.subject}\n\n${invitationData.body}`;
    navigator.clipboard.writeText(fullMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationData.link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Card>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.textPrimary }}>
        Invite {childName}
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
        Send this message from your own email or text app.
      </p>

      {/* Invitation Card */}
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        {/* Subject */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '6px',
            color: COLORS.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Subject
          </label>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.textPrimary,
            margin: 0,
          }}>
            {invitationData.subject}
          </p>
        </div>

        {/* Message Preview */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '6px',
            color: COLORS.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Message
          </label>
          <textarea
            readOnly
            value={invitationData.body}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              color: COLORS.textPrimary,
              background: 'white',
              resize: 'vertical',
            }}
          />
        </div>
      </div>

      {/* Copy Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <Button onClick={handleCopyMessage} variant="primary" style={{ flex: 1 }}>
          {copiedMessage ? '✓ Copied!' : 'Copy message'}
        </Button>
        <Button onClick={handleCopyLink} variant="outline" style={{ flex: 1 }}>
          {copiedLink ? '✓ Copied!' : 'Copy link'}
        </Button>
      </div>

      {/* Instructions */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '24px',
      }}>
        <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
          💡 <strong>Tip:</strong> Copy the message and paste it into your email or text app to send to {childName}.
        </p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onNext} variant="primary">
          Continue
        </Button>
      </div>
    </Card>
  );
}

function Step6InviteDeliveryParent({ childName, email, setEmail, onNext, onSkip, onBack }) {
  return (
    <Card>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.textPrimary }}>
        Want to share with another parent?
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
        Optional: Invite another parent to help deliver rewards
      </p>

      <Input
        label="Delivery Parent's Email (Optional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="e.g., parent@example.com"
        fullWidth
      />

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={onSkip} variant="outline">
            Skip
          </Button>
          <Button onClick={onNext} variant="primary">
            {email ? 'Send Invitation' : 'Continue'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Step7AllSet({ childName, onComplete }) {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', color: COLORS.textPrimary }}>
          You're all set!
        </h2>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary, marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
          When {childName} marks a task done, we'll let you know. No more remembering to check in — we've got you covered.
        </p>
        <Button onClick={onComplete} variant="primary" size="large">
          Go to Dashboard
        </Button>
      </div>
    </Card>
  );
}
