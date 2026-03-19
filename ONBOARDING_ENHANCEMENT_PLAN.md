# Onboarding Enhancement Plan

## Issues to Fix
1. **State Persistence**: Onboarding state is lost on page refresh
2. **UX Improvement**: Add pre-seeded task and reward suggestions for quick selection

## Implementation Plan

### Phase 1: State Persistence (15 min)
- Add localStorage persistence for onboarding state
- Save/restore: currentStep, childProfile, childData, welcomeBonus, rewards, tasks
- Clear localStorage on completion

### Phase 2: Reward Suggestions (30 min)
- Create a curated list of common rewards
- Update Step 3 UI to show clickable reward cards
- Allow custom rewards alongside suggestions

### Phase 3: Task Suggestions (30 min)
- Fetch tasks from library API
- Update Step 4 UI to show clickable task cards
- Allow custom tasks alongside suggestions

## Reward Suggestions List
```javascript
const REWARD_SUGGESTIONS = [
  { title: '30 min screen time', pointCost: 5, icon: '📱' },
  { title: '1 hour screen time', pointCost: 10, icon: '📱' },
  { title: 'Stay up 30 min late', pointCost: 8, icon: '🌙' },
  { title: 'Choose dinner', pointCost: 12, icon: '🍕' },
  { title: 'Movie night pick', pointCost: 15, icon: '🎬' },
  { title: 'Friend sleepover', pointCost: 25, icon: '🏠' },
  { title: 'Trip to park', pointCost: 10, icon: '🎡' },
  { title: 'Ice cream treat', pointCost: 8, icon: '🍦' },
  { title: 'New book', pointCost: 20, icon: '📚' },
  { title: 'Small toy ($10)', pointCost: 30, icon: '🎁' },
  { title: 'Skip one chore', pointCost: 15, icon: '✨' },
  { title: 'Game with parent', pointCost: 10, icon: '🎮' },
];
```

## UI Design

### Step 3: Rewards
```
What can [Child] earn?

[Suggested Rewards - Click to Add]
┌─────────────┬─────────────┬─────────────┐
│ 📱 30 min   │ 🌙 Stay up  │ 🍕 Choose   │
│ screen time │ 30 min late │ dinner      │
│ 5 points    │ 8 points    │ 12 points   │
└─────────────┴─────────────┴─────────────┘

[+ Add Custom Reward]

Added Rewards:
- 30 min screen time (5 points) [Remove]
- Choose dinner (12 points) [Remove]
```

### Step 4: Tasks
```
Tasks for [Child]

[Suggested Tasks - Click to Add]
┌─────────────┬─────────────┬─────────────┐
│ 🍽️ Load     │ 🗑️ Take out │ 🛏️ Make bed │
│ dishwasher  │ trash       │             │
│ 2 pts done  │ 1 pt done   │ 1 pt done   │
│ 3 pts extra │ 2 pts extra │ 2 pts extra │
└─────────────┴─────────────┴─────────────┘

[+ Add Custom Task]

Added Tasks:
- Load dishwasher (2/3 points) [Remove]
- Make bed (1/2 points) [Remove]
```

## Files to Modify
1. `frontend/src/pages/ParentOnboarding.jsx` - Add state persistence and new UI
2. `frontend/src/services/library.js` - Already exists, just need to use it

## Testing Checklist
- [ ] State persists across page refresh
- [ ] Can click reward suggestions to add them
- [ ] Can click task suggestions to add them
- [ ] Can still add custom rewards/tasks
- [ ] Can remove added items
- [ ] localStorage clears on completion
- [ ] Onboarding completes successfully
