# MotivTrack — User Onboarding Flow Specification

## Overview
This document defines the complete onboarding experience for all four MotivTrack user personas, from first link click to fully operational dashboard.

## User Personas

1. **Admin Parent (Jordan)** - Primary account holder, sets up children, tasks, and rewards
2. **Child (Alex)** - Completes tasks, earns points, redeems rewards
3. **Delivery Parent** - Delivers rewards, can propose new rewards for approval
4. **Teacher** - Provides daily behavior feedback (Phase 2)

## Notation Guide

- `[START]` = Entry point
- `[SCREEN: name]` = User-visible screen
- `[ACTION: ...]` = User input
- `[SYSTEM: ...]` = Automatic system event
- `[GATE: ...]` = Enforced condition/checkpoint
- `[BRANCH: yes/no]` = Flow split
- `[END: ...]` = User ready to use product
- `(ASYNC)` = Background event
- `(PHASE 2)` = Not in MVP/prototype

## Color Key

- **Blue**: Admin Parent
- **Green**: Child
- **Orange**: Delivery Parent
- **Purple**: Teacher
- **Red**: GATE/condition
- **Grey**: System event

---

## Flow 1 — Admin Parent (Jordan)

### Entry Point
Jordan visits MotivTrack's site or signup link.

### Flow Steps

1. **Account Creation**
   - Email, password (strength indicator), ToS + Privacy links
   - **GATE**: ToS consent must be checked before proceeding
   - **SYSTEM**: Creates `admin_parent` user, logs ToS acceptance, issues JWT

2. **Step 1 — Your Child**
   - Child name (required), grade (6-12), age (for COPPA), school (optional)
   - **BRANCH**: If child under 13 → COPPA Consent Flow required
   - **SYSTEM**: Creates `ChildProfile` record

3. **Step 2 — Give [Child] a Head Start**
   - Slider: 1-10 points (default: 5)
   - Optional skip
   - **SYSTEM**: If awarded, creates `PointTransaction` with type `daily_bonus`

4. **Step 3 — What Can [Child] Earn?**
   - Reward chips, form for custom rewards, point cost calculator
   - **GATE**: Must create ≥1 Reward before continuing
   - **SYSTEM**: Creates `Reward` records

5. **Step 4 — Tasks for [Child]**
   - Task library, category tabs, weekly estimator, custom task creation
   - **GATE**: Must create ≥1 Task before continuing
   - **SYSTEM**: Creates `Task` records

6. **Step 5 — Invite [Child]**
   - Review: head start, rewards, tasks
   - Enter child's email, send invitation
   - **SYSTEM**: Generates unique 72h token, sends email linked to `childProfileId`
   - **ASYNC**: Jordan email verification (doesn't block flow)

7. **Step 6 — Want to Share With Another Parent? (Optional)**
   - Optional Delivery Parent invitation
   - **SYSTEM**: If invited, generates token and sends email

8. **Step 7 — You're All Set**
   - Success message, preview child dashboard (read-only)
   - **END**: Parent Dashboard with pending queue (empty initially)

### Resumability
If Jordan exits before Step 5, wizard progress is saved. On return: "Resume setup →" at last incomplete step.

---

## Flow 2 — Child (Alex)

### Entry Point
Receives invitation email from Jordan, clicks unique link.

### Flow Steps

1. **Token Validation**
   - **SYSTEM**: Checks token expiry and valid `childProfileId`
   - **BRANCH**: If invalid → "Invitation Expired" screen, notify Jordan

2. **Account Creation**
   - Email (pre-filled/locked), password, confirm password
   - ToS acceptance (child-appropriate)
   - **SYSTEM**: Creates `child` user, links to `childProfileId`, creates session

3. **Survey 1 — Dream**
   - "If you could earn anything..." with chips (money, screen time, hobby, food, experience, other)
   - Free text for "other"

4. **Survey 2 — Specific**
   - "What specifically would you love to earn?" (free text)
   - **SYSTEM**: 
     - Saves `RewardPreference`
     - **Auto-awards 3 onboarding points** (immutable `PointTransaction`)
     - Sends notification to Jordan: "[Child] has joined and told you what they'd love to earn"
     - Matches survey keywords with reward catalog
   - **BRANCH**: If match found → Set as dashboard goal; else → Default to lowest point reward

5. **Transition Screen**
   - "Your rewards are ready. Let's go."
   - "You already earned 3 points just for getting here. 🎉"
   - 3-second auto-advance

6. **Dashboard — First Login**
   - Points display (onboarding + welcome bonus)
   - Reward progress bar
   - Task list with Done/Extra Well Done selectors
   - **Banner (once only)**: "You already have [X] points. Tap Done on a task when you finish it — [Jordan's name] will confirm and your points will update."
   - **END**: Alex dashboard, ready to claim first task

### Resumability
If Alex stops before finishing survey, it's shown on next login. Dashboard is gated until survey is submitted.

---

## Flow 3 — Delivery Parent

### Entry Point
Receives invitation from Jordan at Step 6. Can join before or after Alex.

### Flow Steps

1. **Token Validation**
   - **SYSTEM**: Validates token and `childProfileId`
   - **BRANCH**: If invalid → "Invitation Expired" screen, notify Jordan

2. **Account Creation**
   - Email (pre-filled/locked), password, confirm password, ToS
   - **SYSTEM**: Creates `delivery_parent` user, updates `childProfile.deliveryParentId`

3. **Delivery Parent Dashboard**
   - **Banner (once only)**: "Welcome. When [child name] earns a reward, you'll see it here. You can also suggest new rewards for [Jordan's name] to approve. That's your role — [Jordan's name] handles everything else."
   - View: child point total, pending reward deliveries
   - **No edit controls** for tasks/rewards
   - **BRANCH**: If pending deliveries → Show queue; else → Empty state

4. **Reward Proposal Feature**
   - **ACTION**: Tap "Suggest a reward for [child name]"
   - **SCREEN**: Reward Proposal Form
     - Reward name, type icon selector, suggested point cost
     - Optional note to Jordan
   - **SYSTEM**: 
     - Creates `Reward` with `isActive: false`, `proposedBy: deliveryParentId`, `status: pending_approval`
     - **Reward is NOT visible to child** (hidden until approved)
     - Sends notification to Jordan
   - **SCREEN**: Proposal Confirmation
     - "Sent! [Jordan's name] will review your suggestion"
     - "My suggestions" section shows all proposals with status:
       - **Pending**: "Waiting for [Jordan's name] to review"
       - **Approved**: "[Jordan's name] approved this! [child name] can now earn [reward name]"
       - **Declined**: "[Jordan's name] passed on this one" (+ optional reason)

5. **Jordan's Review Process**
   - **SCREEN**: Jordan's Reward Catalog — Pending Approval section
   - Shows: reward name, type, cost, Delivery Parent's note
   - **Three actions**:
     - **Approve**: Sets `isActive: true`, `status: approved`, reward visible to child
     - **Edit and Approve**: Jordan adjusts details, then approves
     - **Decline**: Sets `status: declined`, remains invisible to child, optional reason sent to Delivery Parent
   - **SYSTEM**: If no action in 7 days → Reminder notification to Jordan

### No Resumability Needed
Two-screen flow, no wizard.

---

## Flow 4 — Teacher (Phase 2)

### Entry Point
Teacher receives child-specific invitation after parent configures class expectations.

### Flow Steps

1. **Token Validation**
   - **SYSTEM**: Validates token, checks `TeacherAssignment` exists
   - **BRANCH**: If invalid → "Invitation Expired" screen, notify Jordan

2. **Existing Teacher Check**
   - **BRANCH**: Already a MotivTrack teacher?
     - **YES** → Login, add `TeacherAssignment` for new child
     - **NO** → Continue to account creation

3. **Context Screen (Pre-Account)**
   - 3 bullets: what, how quick, not official school system
   - CTA: "Set up account"

4. **Account Creation**
   - Email (pre-filled/locked)
   - **SYSTEM**: Domain validation (silent)
   - **BRANCH**: Domain mismatch → Error screen, notify Jordan
   - Password, ToS for teachers
   - **SYSTEM**: Creates `teacher` user, `TeacherAssignment` link

5. **Meet [Child]**
   - Shows expectations and rating scale (1-4)
   - "Once a day, you'll rate each of these. Done in 60 seconds."
   - **BRANCH**: Is it a school day & feedback not submitted?
     - **YES** → Show Daily Feedback Form
     - **NO** → "Got it — I'll submit tomorrow"

6. **Daily Feedback Form**
   - Rate each expectation (1-4 scale)
   - Optional per-expectation comments
   - **GATE**: All expectations must be rated before submit
   - **SYSTEM**: 
     - Creates `BehaviorRatings` (immutable)
     - Creates `PointTransactions`
     - Updates child points
     - Updates parent dashboard
   - **SCREEN**: Confirmation — "Submitted for [date]. Thank you."
   - **END**: TeacherView, returns tomorrow

### Daily Return
Teacher logs in, sees eligibility/status, submits or reviews rating as needed.

---

## Cross-Flow Dependency Map

### Sequencing

```
[JORDAN completes Steps 0-4]
  ⇓
[JORDAN sends Alex's invitation (Step 5)]
  ⇓
[ALEX flow begins]
  ⇓
[JORDAN reaches 'You're all set' (Step 7)]
  ↘
 [Post-survey update for Jordan]

[JORDAN invites Delivery Parent (Step 6, optional)]
  → [DELIVERY PARENT flow starts — can be before/after Alex]

[JORDAN configs class expectations (Phase 2)]
  → [TEACHER flow starts — independent]
```

### Dependency Table

| Flow | Depends On | Unlocks |
|------|-----------|---------|
| Admin Parent Steps 0-4 | — (entry point) | Step 5 + 6 |
| Admin Parent Step 5 | Steps 0-4 done, ≥1 Reward, ≥1 Task | Child flow begins |
| Admin Parent Step 6 | Step 5 (optional for Delivery Parent) | Delivery Parent flow begins |
| Admin Parent Step 7 | Child accepted invitation | 'You're all set' state for parent |
| Child flow | Step 5 complete, valid token | Child dashboard, parent Aha! |
| Delivery Parent flow | Step 6 complete, valid token | Delivery Parent dashboard |
| Teacher flow (Phase 2) | Class expectations set, valid token/domain | Teacher feedback/points to child |

### Hard Gates

1. **Parent must add ≥1 Reward and Task** before inviting child
2. **Child cannot access dashboard** before completing survey
3. **PointTransaction/BehaviorRating are immutable** (no edits after creation)
4. **Teacher's domain must match** for onboarding
5. **Invitations expire in 72h** and cannot be reused
6. **Delivery Parent cannot add rewards directly** — all proposals require Admin Parent approval before becoming visible to child

---

## Error States & Recovery Paths

### Parent Errors

| Error | Message | Recovery |
|-------|---------|----------|
| Email exists | "An account with this email already exists. Log in instead?" | Redirect to login |
| Password too weak | Inline tips as you type | Real-time validation |
| COPPA consent required | Re-presented with instruction | Must complete to proceed |
| Exits mid-setup | "Welcome back. Pick up where you left off →" | Resume at last incomplete step |
| Child invite not received/expired | "Didn't receive it? Resend [child]'s invitation." | Regenerate token |

### Child Errors

| Error | Message | Recovery |
|-------|---------|----------|
| Invite expired | "This invitation has expired. Ask [Jordan] to send a new one." | Jordan must resend |
| Password mismatch | Inline — "Passwords don't match. Try again." | Real-time validation |
| Survey not done | Survey re-appears on next login | Dashboard gated until complete |
| No rewards (edge) | "Your rewards are being set up. [Jordan] will add them soon…" | Wait for Jordan |

### Delivery Parent Errors

| Error | Message | Recovery |
|-------|---------|----------|
| Invite expired | "This invitation has expired. Ask [Jordan] to send a new one." | Jordan notified, must resend |
| Attempts settings/dashboard | 403 (no error shown, nav not rendered) | Role-based access control |
| Proposal not reviewed (7 days) | Jordan gets reminder notification | Delivery Parent can send nudge from "My suggestions" |
| Jordan declines proposal | "[Jordan's name] passed on this one." (+ optional reason) | Can submit new proposal |

### Teacher Errors (Phase 2)

| Error | Message | Recovery |
|-------|---------|----------|
| Invite expired | "This invitation has expired. Ask [Jordan] to send a new one." | Jordan notified, must resend |
| Domain mismatch | "Use your [domain] school email." | Jordan notified, must use correct email |
| Partial feedback | "Rate all [X] expectations to submit." | Must complete all ratings |
| Attempts wrong role screen | 403/no nav | Role-based access control |
| Edits submitted feedback | Read-only; "You've submitted feedback for today. See you tomorrow." | Immutable after submission |

### Global Error Principles

1. **No error codes/raw stacktraces** shown to users
2. **All blocks have recovery path** with plain-language copy
3. **If Jordan must act to fix**, Jordan is notified automatically
4. **All error events logged server-side** for observability

---

## Implementation Status

### ✅ Completed (Backend)
- User authentication with 4 roles
- Database schema with all required models
- JWT token generation and validation
- Point transaction system
- Reward and task management
- Notification system

### 🚧 To Implement (Frontend)
- [ ] Admin Parent onboarding wizard (Steps 1-7)
- [ ] Child onboarding flow (account creation + survey)
- [ ] Delivery Parent onboarding and dashboard
- [ ] Reward proposal system for Delivery Parent
- [ ] COPPA consent flow
- [ ] Invitation token system
- [ ] Teacher onboarding (Phase 2)
- [ ] Daily behavior feedback form (Phase 2)

### 📋 Backend Additions Needed
- [ ] Invitation token generation and validation API
- [ ] Child profile creation API
- [ ] Reward proposal approval workflow API
- [ ] COPPA consent logging
- [ ] Email service integration for invitations
- [ ] Onboarding progress tracking

---

## Next Steps

1. **Create invitation token system** (backend + frontend)
2. **Build Admin Parent onboarding wizard** (7-step flow)
3. **Implement child survey and onboarding**
4. **Add Delivery Parent reward proposal feature**
5. **Integrate email service** for invitations
6. **Add COPPA consent flow**
7. **Build Teacher onboarding** (Phase 2)

---

*This document serves as the live source of truth for implementation, QA, and onboarding documentation. Update only when onboarding logic changes.*
