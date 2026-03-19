# MotivTrack UI Overhaul Progress

## Completed Tasks

### 1. ✅ Database Schema Updates
- Added `icon` field to Task model
- Added `icon`, `category`, `needsScheduling`, and `shoppingLink` fields to Reward model
- Added `createdBy` field to Task model
- Ran migration: `20260319092820_add_icon_and_reward_fields`

### 2. ✅ Default Task & Reward Seeding System
- Created `SeedService` with default tasks and rewards
- **Default Tasks** (6 tasks):
  - Take out trash (🗑️) - 1 pt
  - Clean bathroom sink (🚰) - 2 pts
  - Complete homework (📚) - 3 pts
  - Make bed (🛏️) - 1 pt
  - Load dishwasher (🍽️) - 2 pts
  - Feed the dog (🐕) - 1 pt

- **Default Rewards** (6 rewards):
  - Pizza Night (🍕) - 10 pts
  - Extra Screen Time (🎮) - 8 pts
  - Movie Pick (🎬) - 6 pts (needs scheduling)
  - $5 Cash (💵) - 12 pts
  - Hobby Supplies (🎨) - 15 pts
  - Sleep-In Pass (😴) - 5 pts

### 3. ✅ Seed API Endpoints
- Created `SeedController` with 3 endpoints
- Created `seed.routes.ts` with authentication
- Integrated into main app.ts

**Available Endpoints:**
- `POST /api/seed/child/:childProfileId` - Seed both tasks and rewards
- `POST /api/seed/child/:childProfileId/tasks` - Seed tasks only
- `POST /api/seed/child/:childProfileId/rewards` - Rewards only

## Remaining Tasks

### Phase 1: Color System Update (30 min)
- [ ] Update `frontend/src/utils/constants.js` with exact green color scheme
- [ ] Define Google Classroom colors: #25A667, #57BB8A, #F6BB18
- [ ] Define Joyful Holly gradient: #146735 to #EAFDD8
- [ ] Update all color references throughout components

### Phase 2: Common Components Redesign (1 hour)
- [ ] Update Button component with green theme
- [ ] Update Card component with proper shadows and borders
- [ ] Update Input component styling
- [ ] Create new Badge variants for task/reward categories
- [ ] Update ProgressBar with green gradient

### Phase 3: Child Dashboard Rebuild (1.5 hours)
- [ ] Redesign header with avatar and points display
- [ ] Create tab navigation (Tasks, Rewards, School, History)
- [ ] Rebuild TaskCard with icon, description, tips, and action buttons
- [ ] Rebuild RewardCard with icon, category, points, and redeem button
- [ ] Add "No school reports yet" empty state
- [ ] Implement task expansion with "Done" and "Extra Well Done" buttons

### Phase 4: Parent Dashboard Rebuild (2 hours)
- [ ] Redesign header with child selector
- [ ] Create tab navigation (Verify, Inbox, School, Tasks, Rewards)
- [ ] Rebuild PendingClaimsList with approve/redo actions
- [ ] Rebuild TaskManagement with icon picker and form
- [ ] Rebuild RewardManagement with icon picker and scheduling
- [ ] Add teacher management section with expectations
- [ ] Implement "Send reminder" button for pending reports

### Phase 5: Teacher Portal Rebuild (1 hour)
- [ ] Redesign teacher selection screen
- [ ] Create behavior rating form with 4-level scale
- [ ] Add optional comment field
- [ ] Implement "Submit Report" button
- [ ] Add "Rate all expectations to continue" validation

### Phase 6: Integration & Polish (1 hour)
- [ ] Connect seed API to parent dashboard
- [ ] Add "Add default tasks" button for new child profiles
- [ ] Test all flows end-to-end
- [ ] Fix any styling inconsistencies
- [ ] Ensure responsive design on mobile

## Technical Notes

### Color Palette
```javascript
export const COLORS = {
  // Primary green (Google Classroom)
  primary: '#25A667',
  primaryLight: '#57BB8A',
  primaryDark: '#146735',
  
  // Accent (Google Classroom yellow)
  accent: '#F6BB18',
  
  // Gradient (Joyful Holly)
  gradientStart: '#146735',
  gradientEnd: '#EAFDD8',
  gradient: 'linear-gradient(135deg, #146735 0%, #EAFDD8 100%)',
  
  // Background
  background: '#EAFDD8', // Light green from gradient
  backgroundLight: '#F5FFF5',
  
  // Text
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  
  // Status colors
  success: '#25A667',
  warning: '#F6BB18',
  error: '#DC2626',
  
  // UI elements
  border: '#d1d5db',
  cardBg: '#ffffff',
};
```

### Icon System
Tasks and rewards now support emoji icons stored in the database. The UI should display these prominently in cards and lists.

### Seeding Workflow
1. Parent creates child profile
2. Parent clicks "Add default tasks" button
3. System calls `POST /api/seed/child/:childProfileId`
4. 6 tasks and 6 rewards are created automatically
5. Child can immediately start working on tasks

## Next Steps

1. **Immediate**: Update color constants
2. **Short-term**: Redesign common components
3. **Medium-term**: Rebuild all three dashboards
4. **Final**: Integration testing and polish

## Time Estimate
- Remaining work: ~6-7 hours
- Can be broken into smaller sessions
- Prioritize Child Dashboard for immediate user value
