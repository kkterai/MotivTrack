import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { childProfileService } from '../services/childProfiles';
import { invitationService } from '../services/invitations';
import { taskService } from '../services/tasks';
import { rewardService } from '../services/rewards';
import { libraryService } from '../services/library';
import { COLORS } from '../utils/constants';
import { Button, Card, Input } from '../components/common';

// Reward suggestions for quick selection
const REWARD_SUGGESTIONS = [
  { title: '30 min screen time', pointCost: 5, icon: '📱', description: 'Extra 30 minutes of screen time' },
  { title: '1 hour screen time', pointCost: 10, icon: '📱', description: 'Extra hour of screen time' },
  { title: 'Stay up 30 min late', pointCost: 8, icon: '🌙', description: 'Stay up past bedtime' },
  { title: 'Choose dinner', pointCost: 12, icon: '🍕', description: 'Pick what the family eats' },
  { title: 'Movie night pick', pointCost: 15, icon: '🎬', description: 'Choose the movie' },
  { title: 'Friend sleepover', pointCost: 25, icon: '🏠', description: 'Have a friend stay over' },
  { title: 'Trip to park', pointCost: 10, icon: '🎡', description: 'Special trip to the park' },
  { title: 'Ice cream treat', pointCost: 8, icon: '🍦', description: 'Ice cream outing' },
  { title: 'New book', pointCost: 20, icon: '📚', description: 'Pick a new book' },
  { title: 'Small toy ($10)', pointCost: 30, icon: '🎁', description: 'Small toy or game' },
  { title: 'Skip one chore', pointCost: 15, icon: '✨', description: 'Skip a chore for the day' },
  { title: 'Game with parent', pointCost: 10, icon: '🎮', description: 'Special game time' },
];

const STORAGE_KEY = 'motivtrack_onboarding_state';

/**
 * ParentOnboarding - Enhanced 7-step wizard with state persistence and suggestions
 */
export default function ParentOnboarding() {
  const navigate = useNavigate();
  
  // Load state from localStorage or use defaults
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load onboarding state:', err);
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
    };
  };

  const initialState = loadState();
  const [currentStep, setCurrentStep] = useState(initialState.currentStep);
  const [childData, setChildData] = useState(initialState.childData);
  const [childProfile, setChildProfile] = useState(initialState.childProfile);
  const [welcomeBonus, setWelcomeBonus] = useState(initialState.welcomeBonus);
  const [rewards, setRewards] = useState(initialState.rewards);
  const [tasks, setTasks] = useState(initialState.tasks);
  const [childEmail, setChildEmail] = useState(initialState.childEmail);
  const [deliveryParentEmail, setDeliveryParentEmail] = useState(initialState.deliveryParentEmail);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskSuggestions, setTaskSuggestions] = useState([]);

  const totalSteps = 7;

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
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentStep, childData, childProfile, welcomeBonus, rewards, tasks, childEmail, deliveryParentEmail]);

  // Load task suggestions from library
  useEffect(() => {
    const loadTaskSuggestions = async () => {
      try {
        const response = await libraryService.getAllTasks();
        // Get top 12 most common tasks
        const topTasks = (response.data || []).slice(0, 12);
        setTaskSuggestions(topTasks);
      } catch (err) {
        console.error('Failed to load task suggestions:', err);
      }
    };
    loadTaskSuggestions();
  }, []);

  // Clear localStorage on completion
  const clearOnboardingState = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // Step 1: Your Child
  const handleStep1Submit = async () => {
    if (!childData.name) {
      setError('Please enter your child\'s name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await childProfileService.createChildProfile({
        name: childData.name,
        grade: childData.grade || undefined,
        age: childData.age ? parseInt(childData.age) : undefined,
        schoolName: childData.schoolName || undefined,
        welcomeBonusPoints: welcomeBonus,
      });

      setChildProfile(response.data);
      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create child profile');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Give Head Start (just proceed, bonus was awarded in Step 1)
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

  const handleAddRewardSuggestion = async (suggestion) => {
    if (!childProfile || !childProfile.id) {
      setError('Child profile not found. Please go back to Step 1.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await rewardService.createReward({
        childProfileId: childProfile.id,
        title: suggestion.title,
        description: suggestion.description,
        pointCost: suggestion.pointCost,
      });
      setRewards([...rewards, response.data]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create reward');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomReward = async (rewardData) => {
    if (!childProfile || !childProfile.id) {
      setError('Child profile not found. Please go back to Step 1.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await rewardService.createReward({
        ...rewardData,
        childProfileId: childProfile.id,
      });
      setRewards([...rewards, response.data]);
    } catch (err) {
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

  const handleAddTaskSuggestion = async (suggestion) => {
    if (!childProfile || !childProfile.id) {
      setError('Child profile not found. Please go back to Step 1.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await taskService.createTask({
        childProfileId: childProfile.id,
        title: suggestion.title,
        description: suggestion.description,
        doneStandard: suggestion.doneStandard,
        extraWellDoneStandard: suggestion.extraWellDoneStandard,
        tips: suggestion.tips,
        pointsDone: suggestion.suggestedPointsDone,
        pointsExtraWellDone: suggestion.suggestedPointsExtraWellDone,
        category: suggestion.category,
      });
      setTasks([...tasks, response.data]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomTask = async (taskData) => {
    if (!childProfile || !childProfile.id) {
      setError('Child profile not found. Please go back to Step 1.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await taskService.createTask({
        ...taskData,
        childProfileId: childProfile.id,
      });
      setTasks([...tasks, response.data]);
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
      await invitationService.createInvitation({
        email: childEmail,
        role: 'child',
        childProfileId: childProfile.id,
      });
      setCurrentStep(6);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Invite Delivery Parent (optional)
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

  // Step 7: Complete
  const handleComplete = () => {
    clearOnboardingState();
    navigate('/parent');
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1YourChild childData={childData} setChildData={setChildData} onNext={handleStep1Submit} />;
      case 2:
        return <Step2HeadStart childName={childData.name} bonus={welcomeBonus} setBonus={setWelcomeBonus} onNext={handleStep2Submit} onBack={() => setCurrentStep(1)} />;
      case 3:
        return <Step3RewardsEnhanced childName={childData.name} rewards={rewards} suggestions={REWARD_SUGGESTIONS} onAddSuggestion={handleAddRewardSuggestion} onAddCustom={handleAddCustomReward} onNext={handleStep3Submit} onBack={() => setCurrentStep(2)} />;
      case 4:
        return <Step4TasksEnhanced childName={childData.name} tasks={tasks} suggestions={taskSuggestions} onAddSuggestion={handleAddTaskSuggestion} onAddCustom={handleAddCustomTask} onNext={handleStep4Submit} onBack={() => setCurrentStep(3)} />;
      case 5:
        return <Step5InviteChild childName={childData.name} email={childEmail} setEmail={setChildEmail} onNext={handleStep5Submit} onBack={() => setCurrentStep(4)} />;
      case 6:
        return <Step6InviteDeliveryParent email={deliveryParentEmail} setEmail={setDeliveryParentEmail} onNext={handleStep6Submit} onSkip={() => setCurrentStep(7)} onBack={() => setCurrentStep(5)} />;
      case 7:
        return <Step7Complete childName={childData.name} onFinish={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text }}>
              Step {currentStep} of {totalSteps}
            </span>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: COLORS.gradient,
              width: `${(currentStep / totalSteps) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Card style={{ marginBottom: '24px', padding: '16px', background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
            <p style={{ color: '#991B1B', margin: 0 }}>{error}</p>
          </Card>
        )}

        {/* Current step */}
        {renderStep()}
      </div>
    </div>
  );
}

// Step components will be added in the next part...
// (This file is getting long, so I'll create the step components separately)
