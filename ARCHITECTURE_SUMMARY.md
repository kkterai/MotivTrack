# MotivTrack Architecture Summary

## Project Overview

MotivTrack is being refactored from a single-file React prototype into a production-grade, scalable application designed to support 100,000+ users. The application helps families with ADHD children (ages 11-18) by removing parents from the "enforcer" role and automating task tracking, verification, and reward systems.

## Current Progress

### ✅ Completed

1. **Project Direction Clarified**
   - Confirmed alignment with MotivTrack PRD v5.0
   - Established goal to preserve existing UI while building scalable backend

2. **Backend Infrastructure Setup**
   - Created backend directory structure
   - Configured TypeScript with proper settings
   - Set up package.json with all required dependencies
   - Installed dependencies (Express, Prisma, Supabase, JWT, bcrypt, etc.)

3. **Database Schema Designed**
   - Complete Prisma schema based on PRD v5.0
   - 15 data models covering all features:
     - User (4 roles: admin_parent, delivery_parent, child, teacher)
     - ChildProfile
     - LibraryTask & Task
     - TaskClaim (with verification workflow)
     - PointTransaction (immutable)
     - Reward & RewardRedemption
     - RewardPreference
     - StreakRecord
     - NotificationLog (for engagement tracking)
     - SchoolExpectation, TeacherAssignment, BehaviorRating

4. **Core Backend Files Created**
   - `src/app.ts` - Express application setup
   - `src/config/database.ts` - Prisma client configuration
   - `src/config/supabase.ts` - Supabase client setup
   - `src/types/index.ts` - TypeScript type definitions
   - Middleware:
     - `auth.middleware.ts` - JWT authentication
     - `role.middleware.ts` - Role-based access control
     - `validation.middleware.ts` - Request validation
   - Services:
     - `auth.service.ts` - User registration, login, password management

5. **Documentation**
   - Backend README with setup instructions
   - Environment variable configuration (.env.example)
   - Architecture summary (this document)

### 🚧 In Progress

- Backend API implementation
- Prisma client generation

### 📋 Next Steps

#### Immediate (Week 1-2)
1. **Complete Backend Foundation**
   - Create remaining service files (task, claim, point, reward, streak, notification)
   - Build API routes and controllers
   - Set up Supabase project and configure RLS policies
   - Create database migrations
   - Seed curated task library

2. **Authentication & Authorization**
   - Implement complete auth flow
   - Add COPPA-compliant parental consent
   - Test role-based access control

#### Short-term (Week 3-4)
3. **Frontend Refactoring**
   - Extract components from monolithic App.jsx
   - Set up React Router
   - Implement Zustand for state management
   - Migrate inline styles to Tailwind CSS
   - Connect to backend API

4. **Core Features**
   - Task claim and verification flow
   - Point calculation and streak mechanics
   - Reward redemption and delivery
   - Notification system (in-app)

#### Medium-term (Week 5-6)
5. **PRD Features**
   - Guided onboarding flows
   - Child reward preference survey
   - Curated task library browser
   - School behavior track (Phase 2)
   - Teacher invitation and rating system

6. **Legal Compliance**
   - COPPA consent implementation
   - Privacy Policy, ToS, data security docs
   - Vendor DPAs

#### Long-term (Week 7-8)
7. **Testing & Optimization**
   - Unit tests for services
   - Integration tests for API
   - E2E tests for critical flows
   - Performance optimization
   - Load testing

8. **Deployment**
   - CI/CD pipeline setup
   - Staging environment
   - Production deployment

## Architecture Decisions

### Backend

**Tech Stack:**
- Node.js + Express + TypeScript
- PostgreSQL via Supabase
- Prisma ORM
- JWT authentication
- Supabase Realtime for live updates

**Key Design Patterns:**
- Service layer for business logic
- Middleware for cross-cutting concerns
- Repository pattern via Prisma
- Immutable audit trails (PointTransaction, BehaviorRating)

**Scalability Considerations:**
- Stateless API design (horizontal scaling)
- Database indexing on high-frequency queries
- Connection pooling via Supabase
- Caching strategy for static data (task library)
- Rate limiting per user

### Frontend

**Tech Stack:**
- React 18 + Vite
- Tailwind CSS (migrating from inline styles)
- React Router v6
- Zustand (global state)
- React Query (server state)

**Key Design Patterns:**
- Component-based architecture
- Feature-based directory structure
- Custom hooks for data fetching
- Context for auth and notifications
- Optimistic updates for better UX

**UI Preservation:**
- Exact color palette maintained
- All emojis and visual elements preserved
- Micro-interactions kept (confetti, animations)
- Mobile-first responsive design

## Data Model Highlights

### User Roles & Permissions

| Role | Can Create Tasks | Can Verify Tasks | Can Deliver Rewards | Can Rate Behavior |
|------|------------------|------------------|---------------------|-------------------|
| Admin Parent | ✅ | ✅ | ✅ | ❌ |
| Delivery Parent | ❌ | ❌ | ✅ | ❌ |
| Child | ❌ | ❌ | ❌ | ❌ |
| Teacher | ❌ | ❌ | ❌ | ✅ |

### Critical Workflows

1. **Aha! Loop (Core Value)**
   - Child marks task complete → TaskClaim created (status: pending)
   - Parent receives notification
   - Parent verifies → PointTransaction created (immutable)
   - Child sees points update within 5 seconds
   - Progress bar animates toward reward

2. **Streak Calculation**
   - Server-side SQL query (not client-side)
   - Daily streak: all tasks verified in one calendar day
   - Weekly streak: 7 consecutive daily streaks
   - Bonus points auto-awarded

3. **Notification Engagement Tracking**
   - Every notification logged with sentAt timestamp
   - openedAt updated when user taps notification
   - NER (Notification Engagement Rate) = opened / sent
   - Critical metric: Parent NER ≥65%, Child NER ≥70%

## Key Metrics (From PRD)

### Speed Metrics
- T2FV-J (Time to First Verification): <48 hours
- T2FV-A (Time to First Points): <24 hours
- T2FR (Time to First Reward): <14 days
- T2FS (Time to First Streak): <7 days

### Durability Metrics (Most Critical)
- FAR-21 (Family Active Rate at 21 days): ≥70%
- FAR-60 (Family Active Rate at 60 days): ≥50%
- FAR-90 (Family Active Rate at 90 days): ≥40%
- VRR (Verification Response Rate): ≥80% within 24h
- NER (Notification Engagement Rate): Parent ≥65%, Child ≥70%

## File Structure

```
MotivTrack/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/          # API endpoints
│   │   │   ├── controllers/     # Request handlers
│   │   │   └── middlewares/     # Auth, validation, etc.
│   │   ├── services/            # Business logic
│   │   ├── config/              # Database, Supabase config
│   │   ├── types/               # TypeScript definitions
│   │   └── app.ts               # Express app
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Version-controlled migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable UI
│   │   │   ├── child/           # Child view components
│   │   │   ├── parent/          # Parent view components
│   │   │   ├── teacher/         # Teacher view components
│   │   │   ├── onboarding/      # Guided setup
│   │   │   └── library/         # Task library browser
│   │   ├── pages/               # Route pages
│   │   ├── contexts/            # React Context
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API client
│   │   └── App.jsx
│   └── package.json
└── ARCHITECTURE_SUMMARY.md      # This file
```

## Legal & Compliance

### COPPA Requirements (Due: April 22, 2026)
- ✅ Verifiable parental consent (not just checkbox)
- ✅ Data security policy with named responsible person
- ✅ Document all data flows
- ✅ Vendor DPAs required
- ⏳ Implement before prototype testing

### CCPA/CPRA Requirements
- ✅ Opt-in consent for users under 16
- ✅ Right to deletion (two-tier model)
- ✅ No geolocation collection
- ✅ No data selling or third-party sharing

## Risk Mitigation

### Technical Risks
1. **Supabase RLS Complexity** → Comprehensive tests, direct dashboard queries
2. **Real-time Sync Failures** → Fallback to polling, retry logic
3. **Notification Delivery** → Prominent badges, engagement tracking

### Product Risks
1. **Parent Abandonment** → Obsessive focus on verification friction, 24h/48h reminders
2. **Notification Fatigue** → Smart batching, time-of-day optimization

### Legal Risks
1. **COPPA Non-Compliance** → Retain counsel, implement before testing
2. **Data Breach** → Supabase RLS, HTTPS only, regular audits

## Success Criteria

### Prototype Sprint (Week 2)
- [ ] One family completes Aha! loop in single evening
- [ ] All flows work on iOS Safari and Android Chrome
- [ ] NotificationLog tracking all events
- [ ] PointTransaction immutability enforced
- [ ] No generic copy ("your child", "a reward")

### Phase 1 Launch (Week 6)
- [ ] FAR-21 ≥70%
- [ ] VRR ≥80% within 24h
- [ ] Child survey completion ≥95%
- [ ] All COPPA requirements met

### Production Ready (Week 8)
- [ ] API p95 response time <500ms
- [ ] Real-time updates <5 seconds
- [ ] Zero data loss incidents
- [ ] Privacy Policy, ToS published
- [ ] Test coverage >80% for critical paths

## Contact & Resources

- **PRD**: MotivTrack PRD v5.0 (March 2026)
- **Engineering Roadmap**: Detailed task breakdown by sprint
- **Prisma Schema**: `backend/prisma/schema.prisma`
- **Backend README**: `backend/README.md`

---

**Last Updated**: March 19, 2026  
**Status**: Backend foundation in progress  
**Next Milestone**: Complete backend API and begin frontend refactoring
