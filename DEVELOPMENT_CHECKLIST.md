# MotivTrack Development Checklist

## Progress Overview

**Current Status**: Backend foundation complete, database connected and migrated.

**Next Phase**: Build API routes and services, then begin frontend refactoring.

---

## ✅ Phase 1: Backend Foundation (COMPLETE)

- [x] Project setup and dependencies
- [x] TypeScript configuration
- [x] Prisma schema design (14 models)
- [x] Database connection (Supabase PostgreSQL)
- [x] Database migrations run successfully
- [x] Authentication middleware (JWT)
- [x] Role-based access control middleware
- [x] Validation middleware
- [x] Auth service (register, login, password management)
- [x] Express app setup with CORS and error handling
- [x] Documentation (README, SETUP_GUIDE, ARCHITECTURE_SUMMARY)

---

## 🚧 Phase 2: Backend API Implementation (IN PROGRESS)

### Core Services

- [ ] **Task Service** (`src/services/task.service.ts`)
  - [ ] Create task (from library or custom)
  - [ ] List tasks for child
  - [ ] Update task
  - [ ] Archive task
  - [ ] Get task by ID

- [ ] **Claim Service** (`src/services/claim.service.ts`)
  - [ ] Create task claim (child marks complete)
  - [ ] Verify claim (parent approves)
  - [ ] Request redo (parent rejects)
  - [ ] List pending claims for parent
  - [ ] Get claim history

- [ ] **Point Service** (`src/services/point.service.ts`)
  - [ ] Calculate total points for child
  - [ ] Create point transaction (immutable)
  - [ ] Get point history
  - [ ] Get points by source (task, behavior, streak, bonus)
  - [ ] Award welcome bonus

- [ ] **Streak Service** (`src/services/streak.service.ts`)
  - [ ] Calculate daily streak
  - [ ] Calculate weekly streak
  - [ ] Update streak record
  - [ ] Award streak bonus points
  - [ ] Get streak metrics

- [ ] **Reward Service** (`src/services/reward.service.ts`)
  - [ ] Create reward
  - [ ] List rewards for child
  - [ ] Update reward
  - [ ] Retire reward
  - [ ] Redeem reward
  - [ ] Mark reward as delivered (Admin + Delivery Parent)
  - [ ] Get redemption history

- [ ] **Notification Service** (`src/services/notification.service.ts`)
  - [ ] Send notification (in-app)
  - [ ] Mark notification as opened
  - [ ] Get user notifications
  - [ ] Calculate notification engagement rate (NER)
  - [ ] Track notification metrics

- [ ] **Library Service** (`src/services/library.service.ts`)
  - [ ] Seed curated task library
  - [ ] Browse library by category
  - [ ] Get library task details
  - [ ] Search library tasks

### API Routes & Controllers

- [ ] **Auth Routes** (`src/api/routes/auth.routes.ts`)
  - [ ] POST `/api/auth/register` - Register new user
  - [ ] POST `/api/auth/login` - Login
  - [ ] POST `/api/auth/logout` - Logout
  - [ ] GET `/api/auth/me` - Get current user
  - [ ] PUT `/api/auth/password` - Update password

- [ ] **Task Routes** (`src/api/routes/tasks.routes.ts`)
  - [ ] GET `/api/tasks/:childId` - List tasks
  - [ ] POST `/api/tasks` - Create task
  - [ ] GET `/api/tasks/:id` - Get task details
  - [ ] PUT `/api/tasks/:id` - Update task
  - [ ] DELETE `/api/tasks/:id` - Archive task

- [ ] **Claim Routes** (`src/api/routes/claims.routes.ts`)
  - [ ] POST `/api/claims` - Create claim
  - [ ] GET `/api/claims/pending` - Get pending claims
  - [ ] PUT `/api/claims/:id/verify` - Verify claim
  - [ ] PUT `/api/claims/:id/redo` - Request redo
  - [ ] GET `/api/claims/:childId/history` - Get claim history

- [ ] **Point Routes** (`src/api/routes/points.routes.ts`)
  - [ ] GET `/api/points/:childId` - Get point balance
  - [ ] GET `/api/points/:childId/history` - Get transaction history
  - [ ] GET `/api/points/:childId/metrics` - Get point metrics

- [ ] **Reward Routes** (`src/api/routes/rewards.routes.ts`)
  - [ ] GET `/api/rewards/:childId` - List rewards
  - [ ] POST `/api/rewards` - Create reward
  - [ ] PUT `/api/rewards/:id` - Update reward
  - [ ] POST `/api/rewards/:id/redeem` - Redeem reward
  - [ ] PUT `/api/rewards/:id/deliver` - Mark as delivered
  - [ ] GET `/api/rewards/:childId/history` - Redemption history

- [ ] **Library Routes** (`src/api/routes/library.routes.ts`)
  - [ ] GET `/api/library/tasks` - Browse library
  - [ ] GET `/api/library/tasks/:id` - Get library task
  - [ ] GET `/api/library/categories` - List categories

- [ ] **Notification Routes** (`src/api/routes/notifications.routes.ts`)
  - [ ] GET `/api/notifications` - Get user notifications
  - [ ] PUT `/api/notifications/:id/open` - Mark as opened
  - [ ] GET `/api/notifications/metrics` - Get engagement metrics

### Testing

- [ ] Unit tests for services
- [ ] Integration tests for API routes
- [ ] Test authentication flow
- [ ] Test role-based access control
- [ ] Test immutability of PointTransaction
- [ ] Test streak calculation logic

---

## 📋 Phase 3: Frontend Refactoring (PENDING)

### Setup

- [ ] Install additional dependencies (React Router, Zustand, React Query, Tailwind)
- [ ] Configure Tailwind CSS
- [ ] Set up React Router
- [ ] Create theme file with existing color palette

### Component Extraction

- [ ] Extract `ChildView` → `components/child/ChildDashboard.jsx`
- [ ] Extract `ParentView` → `components/parent/ParentDashboard.jsx`
- [ ] Extract `TeacherView` → `components/teacher/TeacherDashboard.jsx`
- [ ] Create common components:
  - [ ] Button
  - [ ] Card
  - [ ] ProgressBar
  - [ ] Modal
  - [ ] NotificationBanner

### Child Components

- [ ] `TaskCard.jsx` - Individual task display
- [ ] `RewardProgress.jsx` - Progress bar toward reward
- [ ] `StreakDisplay.jsx` - Streak counter
- [ ] `HistoryView.jsx` - Completed tasks + earned rewards

### Parent Components

- [ ] `VerificationQueue.jsx` - Pending task claims
- [ ] `ChildProfileCard.jsx` - Per-child summary
- [ ] `TaskManager.jsx` - Create/edit tasks
- [ ] `RewardManager.jsx` - Create/edit rewards
- [ ] `RewardDelivery.jsx` - Mark rewards as delivered
- [ ] `SettingsDashboard.jsx` - Point calibration, settings

### State Management

- [ ] Set up Zustand stores:
  - [ ] Auth store (user, role, login/logout)
  - [ ] Notification store (in-app notifications)
- [ ] Set up React Query:
  - [ ] Tasks queries
  - [ ] Claims queries
  - [ ] Points queries
  - [ ] Rewards queries
  - [ ] Notifications queries

### API Integration

- [ ] Create API client (`services/api.js`)
- [ ] Create custom hooks:
  - [ ] `useAuth`
  - [ ] `useTasks`
  - [ ] `useTaskClaims`
  - [ ] `usePoints`
  - [ ] `useRewards`
  - [ ] `useNotifications`
- [ ] Connect all components to backend
- [ ] Implement real-time updates (Supabase Realtime)

### Styling Migration

- [ ] Migrate inline styles to Tailwind classes
- [ ] Preserve exact visual design
- [ ] Test responsive design on mobile/tablet/desktop

---

## 🎯 Phase 4: PRD Features (PENDING)

### Onboarding Flows

- [ ] Parent onboarding wizard (multi-step)
- [ ] Child profile creation
- [ ] Delivery Parent invitation
- [ ] Teacher invitation
- [ ] School expectation setup
- [ ] Task selection from library
- [ ] Reward catalog creation
- [ ] Welcome bonus prompt

### Child Reward Survey

- [ ] First-login survey modal
- [ ] Multi-select reward preferences
- [ ] Free text input
- [ ] Store in RewardPreference table
- [ ] Annual re-survey trigger

### Curated Task Library

- [ ] Seed library with tasks from PRD
- [ ] Library browser UI
- [ ] Category filter
- [ ] Task preview modal
- [ ] "Add to child's tasks" button
- [ ] Custom task creation

### Streak Mechanics

- [ ] Server-side streak calculation
- [ ] Daily streak tracking
- [ ] Weekly streak tracking
- [ ] Streak bonus point awards
- [ ] Streak milestone notifications
- [ ] Streak display on child dashboard

### Notification System

- [ ] In-app notification display
- [ ] Notification badge counts
- [ ] Parent notifications:
  - [ ] Task claim pending
  - [ ] Verification reminder (24h/48h)
  - [ ] Reward delivery needed
- [ ] Child notifications:
  - [ ] Points awarded
  - [ ] Streak milestone
  - [ ] Reward available
- [ ] Engagement tracking (sentAt, openedAt)

---

## 🏫 Phase 5: School Behavior Track (PENDING - Phase 2)

### Teacher Management

- [ ] Teacher invitation flow
- [ ] School domain validation
- [ ] Teacher assignment to child
- [ ] Teacher removal

### School Expectations

- [ ] Parent sets universal expectations
- [ ] Expectation CRUD operations
- [ ] Apply to all teachers

### Behavior Ratings

- [ ] Teacher daily rating form (1-4 scale)
- [ ] Rating per expectation
- [ ] Optional comment field
- [ ] Submit all ratings (no partial)
- [ ] Immutable after submission

### Integration

- [ ] Behavior points feed into unified point total
- [ ] Teacher submission reminders
- [ ] Parent view of teacher submissions
- [ ] Child view of behavior ratings

---

## ⚖️ Phase 6: Legal Compliance (PENDING)

### COPPA Compliance

- [ ] Verifiable parental consent flow (not just checkbox)
- [ ] Data security policy document
- [ ] Vendor DPAs (Supabase, Vercel, Railway/Render)
- [ ] Document all data flows
- [ ] Privacy Policy with COPPA disclosures

### Terms of Service

- [ ] Admin Parent ToS (legally binding)
- [ ] Delivery Parent ToS (limited permissions)
- [ ] Child ToS (plain language, not binding)
- [ ] Teacher ToS (individual participation)
- [ ] Limitation of liability clauses

### Data Management

- [ ] Two-tier deletion model:
  - [ ] Active data deletable by Admin Parent
  - [ ] Longitudinal records retained per policy
- [ ] CCPA deletion request handler
- [ ] Data export functionality

---

## 🧪 Phase 7: Testing & Quality (PENDING)

### Backend Testing

- [ ] Unit tests for all services
- [ ] Integration tests for API routes
- [ ] Test authentication and authorization
- [ ] Test data validation
- [ ] Test error handling
- [ ] Test immutability constraints

### Frontend Testing

- [ ] Component unit tests
- [ ] Integration tests for user flows
- [ ] E2E tests for critical paths:
  - [ ] Aha! loop (claim → verify → points)
  - [ ] Reward redemption
  - [ ] Streak calculation
- [ ] Accessibility testing (WCAG AA)
- [ ] Cross-browser testing

### Performance Testing

- [ ] Load testing (k6 or Artillery)
- [ ] API response time benchmarks
- [ ] Database query optimization
- [ ] Frontend bundle size optimization
- [ ] Real-time update latency testing

---

## 🚀 Phase 8: Deployment (PENDING)

### Infrastructure

- [ ] Set up Vercel project (frontend)
- [ ] Set up Railway/Render project (backend)
- [ ] Configure environment variables
- [ ] Set up staging environment
- [ ] Set up production environment

### CI/CD Pipeline

- [ ] GitHub Actions workflow
- [ ] Automated testing on PR
- [ ] Automated deployment to staging
- [ ] Manual approval for production
- [ ] Database migration automation

### Monitoring

- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Database monitoring (Supabase dashboard)
- [ ] Notification engagement dashboard
- [ ] Key metrics tracking (FAR-21, FAR-60, FAR-90, VRR, NER)

### Security

- [ ] HTTPS enforcement
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Supabase RLS policies
- [ ] Security headers
- [ ] Regular dependency updates

---

## 📊 Success Metrics

### Prototype Sprint (Week 2)
- [ ] One family completes Aha! loop in single evening
- [ ] All flows work on iOS Safari and Android Chrome
- [ ] NotificationLog tracking all events
- [ ] PointTransaction immutability enforced
- [ ] No generic copy in UI

### Phase 1 Launch (Week 6)
- [ ] FAR-21 ≥70%
- [ ] VRR ≥80% within 24h
- [ ] Child survey completion ≥95%
- [ ] Welcome bonus adoption ≥60%
- [ ] All COPPA requirements met

### Production Ready (Week 8)
- [ ] API p95 response time <500ms
- [ ] Real-time updates <5 seconds
- [ ] Zero data loss incidents
- [ ] Privacy Policy, ToS published
- [ ] Test coverage >80% for critical paths
- [ ] All vendor DPAs signed

---

## 🎯 Current Priority: Backend API Implementation

**Next Steps:**
1. Create remaining service files (task, claim, point, reward, streak, notification, library)
2. Build API routes and controllers
3. Test API endpoints with Postman or similar
4. Seed curated task library
5. Begin frontend refactoring

**Estimated Time:** 1-2 weeks for complete backend API

---

**Last Updated:** March 19, 2026  
**Current Phase:** Backend API Implementation  
**Overall Progress:** ~25% complete
