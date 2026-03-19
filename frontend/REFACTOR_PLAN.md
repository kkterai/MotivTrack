# Frontend Refactor Plan

## Objective
Refactor the monolithic [`App.jsx`](src/App.jsx) into a production-grade, component-based architecture while **preserving the exact UI design** (colors, emojis, animations, layout).

## Current State Analysis

### Existing App.jsx Structure (1,227 lines)
- **Lines 1-24**: Initial data (INITIAL_TASKS, INITIAL_REWARDS)
- **Lines 25-402**: `ChildView` component (378 lines)
- **Lines 404-998**: `ParentView` component (595 lines)
- **Lines 1001-1051**: `TeacherLoginView` component (51 lines)
- **Lines 1054-1169**: `TeacherFormView` component (116 lines)
- **Lines 1171-1227**: Main `App` component with state management (57 lines)

### Key Features to Preserve
- ✅ Exact color palette (purple, green, yellow, red gradients)
- ✅ All emojis and visual elements
- ✅ Confetti animation on task completion
- ✅ Progress bar animations
- ✅ Mobile-first responsive design
- ✅ All micro-interactions

## Refactor Strategy

### Phase 1: Setup & Infrastructure (30 min)
1. Install required dependencies
2. Create directory structure
3. Set up API client
4. Configure Zustand store
5. Set up React Router

### Phase 2: Extract Common Components (1 hour)
1. Button components
2. Card components
3. Progress bar
4. Modal/Dialog
5. Form inputs
6. Badge/Tag components

### Phase 3: Extract Feature Components (2 hours)
1. **Child View Components**
   - TaskList
   - TaskCard
   - RewardList
   - RewardCard
   - PointsDisplay
   - StreakDisplay
   - TeacherReportCard

2. **Parent View Components**
   - PendingClaimsList
   - TaskManagement
   - RewardManagement
   - DateRequestsList
   - TeacherManagement
   - ExpectationsList

3. **Teacher Components**
   - TeacherLogin
   - BehaviorRatingForm
   - ExpectationsList

### Phase 4: State Management (1 hour)
1. Create Zustand stores:
   - `useAuthStore` - User authentication
   - `useTaskStore` - Tasks and claims
   - `usePointStore` - Points and transactions
   - `useRewardStore` - Rewards and redemptions
   - `useNotificationStore` - Notifications

2. Set up React Query for server state

### Phase 5: API Integration (1.5 hours)
1. Create API service layer
2. Connect all components to backend
3. Replace mock data with real API calls
4. Implement optimistic updates

### Phase 6: Routing & Navigation (30 min)
1. Set up React Router
2. Create route structure:
   - `/` - Landing/Login
   - `/child` - Child dashboard
   - `/parent` - Parent dashboard
   - `/teacher` - Teacher portal
   - `/onboarding` - Guided setup

### Phase 7: Testing & Polish (1 hour)
1. Test all flows
2. Verify UI matches original
3. Test responsive design
4. Performance optimization

## Directory Structure

```
frontend/src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Modal.jsx
│   │   ├── Input.jsx
│   │   └── Badge.jsx
│   ├── child/               # Child view components
│   │   ├── TaskList.jsx
│   │   ├── TaskCard.jsx
│   │   ├── RewardList.jsx
│   │   ├── RewardCard.jsx
│   │   ├── PointsDisplay.jsx
│   │   └── StreakDisplay.jsx
│   ├── parent/              # Parent view components
│   │   ├── PendingClaimsList.jsx
│   │   ├── TaskManagement.jsx
│   │   ├── RewardManagement.jsx
│   │   └── TeacherManagement.jsx
│   ├── teacher/             # Teacher components
│   │   ├── TeacherLogin.jsx
│   │   └── BehaviorRatingForm.jsx
│   └── layout/              # Layout components
│       ├── Header.jsx
│       ├── Navigation.jsx
│       └── Container.jsx
├── pages/                   # Route pages
│   ├── ChildDashboard.jsx
│   ├── ParentDashboard.jsx
│   ├── TeacherPortal.jsx
│   └── Login.jsx
├── services/                # API client
│   ├── api.js              # Axios instance
│   ├── auth.js             # Auth endpoints
│   ├── tasks.js            # Task endpoints
│   ├── claims.js           # Claim endpoints
│   ├── points.js           # Point endpoints
│   ├── rewards.js          # Reward endpoints
│   └── notifications.js    # Notification endpoints
├── stores/                  # Zustand stores
│   ├── useAuthStore.js
│   ├── useTaskStore.js
│   ├── usePointStore.js
│   ├── useRewardStore.js
│   └── useNotificationStore.js
├── hooks/                   # Custom hooks
│   ├── useAuth.js
│   ├── useTasks.js
│   ├── usePoints.js
│   └── useRewards.js
├── utils/                   # Utility functions
│   ├── formatters.js       # Date, number formatting
│   ├── validators.js       # Form validation
│   └── constants.js        # App constants
├── App.jsx                  # Main app with routing
└── main.jsx                # Entry point
```

## Dependencies to Install

```bash
npm install react-router-dom zustand @tanstack/react-query axios
```

## Color Palette (Preserve Exactly)

```javascript
const COLORS = {
  // Gradients
  purpleGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  greenGradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  yellowGradient: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
  redGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
  
  // Solid colors
  purple: '#667eea',
  green: '#84fab0',
  yellow: '#ffeaa7',
  red: '#ff6b6b',
  gray: '#f3f4f6',
  darkGray: '#6b7280',
};
```

## Migration Checklist

### Common Components
- [ ] Button (with variants: primary, secondary, danger)
- [ ] Card (with shadow and hover effects)
- [ ] ProgressBar (with animation)
- [ ] Modal (with backdrop)
- [ ] Input (text, number, textarea)
- [ ] Badge (for status indicators)

### Child View
- [ ] TaskList with filtering
- [ ] TaskCard with submit button
- [ ] RewardList with redemption
- [ ] RewardCard with point cost
- [ ] PointsDisplay with animation
- [ ] StreakDisplay with fire emoji
- [ ] TeacherReportCard

### Parent View
- [ ] PendingClaimsList with approve/redo
- [ ] TaskManagement (add, edit tasks)
- [ ] RewardManagement (add, edit rewards)
- [ ] DateRequestsList
- [ ] TeacherManagement (invite, view)
- [ ] ExpectationsList

### Teacher View
- [ ] TeacherLogin
- [ ] BehaviorRatingForm with scale
- [ ] ExpectationsList (read-only)

### State Management
- [ ] Auth store (user, token, login, logout)
- [ ] Task store (tasks, claims, create, verify)
- [ ] Point store (balance, history, metrics)
- [ ] Reward store (rewards, redemptions, deliver)
- [ ] Notification store (notifications, mark read)

### API Integration
- [ ] Auth API (register, login, me)
- [ ] Task API (CRUD, stats)
- [ ] Claim API (create, verify, list)
- [ ] Point API (balance, history, metrics)
- [ ] Reward API (CRUD, redeem, deliver)
- [ ] Notification API (list, mark opened)

### Routing
- [ ] Set up React Router
- [ ] Create route structure
- [ ] Add navigation
- [ ] Implement protected routes

## Success Criteria

1. ✅ **UI Identical**: Every pixel matches the original design
2. ✅ **All Features Work**: No functionality lost in refactor
3. ✅ **Connected to Backend**: All data from real API
4. ✅ **Performance**: No lag, smooth animations
5. ✅ **Mobile Responsive**: Works on all screen sizes
6. ✅ **Code Quality**: Clean, maintainable, well-documented

## Timeline

- **Phase 1**: 30 minutes
- **Phase 2**: 1 hour
- **Phase 3**: 2 hours
- **Phase 4**: 1 hour
- **Phase 5**: 1.5 hours
- **Phase 6**: 30 minutes
- **Phase 7**: 1 hour

**Total Estimated Time**: 7.5 hours

## Next Steps

1. Install dependencies
2. Create directory structure
3. Start with common components
4. Extract child view components
5. Extract parent view components
6. Set up state management
7. Connect to backend API
8. Test and polish

---

**Status**: Ready to begin  
**Current Phase**: Phase 1 - Setup & Infrastructure
