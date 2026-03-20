import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { childOnboardingService } from '../services/childOnboarding';
import { COLORS } from '../utils/constants';
import { Button, Card } from '../components/common';

const STORAGE_KEY = 'motivtrack_child_onboarding_state';

const REWARD_CATEGORIES = [
  { id: 'money', label: '💵 Money', value: 'money' },
  { id: 'screen_time', label: '📱 Screen Time', value: 'screen_time' },
  { id: 'hobby', label: '🎨 Hobby', value: 'hobby' },
  { id: 'food', label: '🍕 Food', value: 'food' },
  { id: 'experience', label: '🎢 Experience', value: 'experience' },
  { id: 'other', label: '✨ Other', value: 'other' },
];

/**
 * ChildOnboarding - Multi-step onboarding flow for children
 * Steps:
 * 1. Survey 1: "Dream a little" - What would you like to earn?
 * 2. Survey 2: Specific reward preferences
 * 3. Transition: Show earned onboarding points
 * 4. Redirect to dashboard
 */
export default function ChildOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Load state from localStorage or use defaults
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('[ChildOnboarding] Failed to load state:', err);
    }
    return {
      currentStep: 1,
      selectedCategories: [],
      otherCategory: '',
      specificReward: '',
    };
  };

  const initialState = loadState();

  const [currentStep, setCurrentStep] = useState(initialState.currentStep);
  const [selectedCategories, setSelectedCategories] = useState(initialState.selectedCategories);
  const [otherCategory, setOtherCategory] = useState(initialState.otherCategory);
  const [specificReward, setSpecificReward] = useState(initialState.specificReward);
  const [loading, setLoading] = useState(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      currentStep,
      selectedCategories,
      otherCategory,
      specificReward,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentStep, selectedCategories, otherCategory, specificReward]);

  // Clear localStorage when onboarding is complete
  const clearOnboardingState = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('motivtrack_needs_onboarding');
  };

  const handleCategoryToggle = (categoryValue) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryValue)) {
        return prev.filter((c) => c !== categoryValue);
      } else {
        return [...prev, categoryValue];
      }
    });
  };

  const handleStep1Submit = async () => {
    if (selectedCategories.length === 0) {
      return; // Require at least one selection
    }
    
    setLoading(true);

    try {
      // Save reward preferences and award onboarding points
      await childOnboardingService.completeOnboarding({
        categories: selectedCategories,
        otherCategory: selectedCategories.includes('other') ? otherCategory : null,
        specificReward: null, // Removed specific reward step
      });

      // Move to transition screen
      setCurrentStep(2);
    } catch (err) {
      console.error('[ChildOnboarding] Failed to save preferences:', err);
      // Still move to transition screen even if save fails
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    clearOnboardingState();
    // Redirect to dashboard
    navigate('/child');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Dream
            selectedCategories={selectedCategories}
            otherCategory={otherCategory}
            onCategoryToggle={handleCategoryToggle}
            onOtherChange={setOtherCategory}
            onNext={handleStep1Submit}
            loading={loading}
          />
        );
      case 2:
        return <Step2Transition parentName={user?.name || 'Your parent'} onNext={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {renderStep()}
      </div>
    </div>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function Step1Dream({ selectedCategories, otherCategory, onCategoryToggle, onOtherChange, onNext, loading }) {
  const showOtherInput = selectedCategories.includes('other');

  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.textPrimary }}>
          If you could earn anything...
        </h2>
        <p style={{ fontSize: '14px', color: COLORS.textSecondary }}>
          What would you love to work towards? Pick all that interest you!
        </p>
      </div>

      {/* Category Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        {REWARD_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.value);
          return (
            <button
              key={category.id}
              onClick={() => onCategoryToggle(category.value)}
              style={{
                padding: '12px 20px',
                borderRadius: '24px',
                border: isSelected ? `2px solid ${COLORS.primary}` : '2px solid #e5e7eb',
                background: isSelected ? '#eff6ff' : 'white',
                color: isSelected ? COLORS.primary : COLORS.textSecondary,
                fontSize: '14px',
                fontWeight: isSelected ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Other Category Input */}
      {showOtherInput && (
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            value={otherCategory}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Tell us what you'd like to earn..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
        </div>
      )}

      {/* Next Button */}
      <Button
        onClick={onNext}
        variant="primary"
        fullWidth
        disabled={selectedCategories.length === 0 || loading}
      >
        {loading ? 'Saving...' : 'Continue →'}
      </Button>
    </Card>
  );
}

function Step2Transition({ parentName, onNext }) {
  // Auto-advance after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: COLORS.textPrimary }}>
          Your rewards are ready. Let's go.
        </h2>
        <p style={{ fontSize: '18px', color: COLORS.textSecondary, marginBottom: '32px' }}>
          You already earned <strong style={{ color: COLORS.primary }}>3 points</strong> just for getting here! 🎉
        </p>

        {/* Loading Animation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: COLORS.primary,
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.32s',
            }}
          />
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: COLORS.primary,
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.16s',
            }}
          />
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: COLORS.primary,
              animation: 'bounce 1.4s infinite ease-in-out both',
            }}
          />
        </div>

        <style>
          {`
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
              }
              40% {
                transform: scale(1);
              }
            }
          `}
        </style>
      </div>
    </Card>
  );
}
