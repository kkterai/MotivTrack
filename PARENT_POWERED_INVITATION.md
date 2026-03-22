# Parent-Powered Invitation Feature

## Overview

The "Parent-Powered Invitation" feature allows parents to invite their children to MotivTrack without requiring backend email infrastructure. Parents receive a pre-formatted invitation message that they can copy and send through their own email or messaging app.

## User Flow

### Sequence Diagram

```
Parent (Onboarding) → Backend → Child (Email & Onboarding)

1. Parent enters child's email in Step 5
2. Backend generates secure registration token (using Invitation model)
3. Backend returns pre-formatted email text with unique "magic link"
4. Parent copies the email text
5. Parent pastes and sends it from their own email client
6. Child receives email from Parent, clicks the magic link
7. Browser opens link, sending token to backend
8. Backend verifies token, shows Child Onboarding/Registration page
9. Child sets their own password and completes onboarding
10. Child account is created and linked to the parent
```

## Implementation Details

### Backend Changes

#### 1. Invitation Service (`backend/src/services/invitation.service.ts`)

**Updated Method:** `generateInvitationEmailText()`

- **Returns:** Object with `{ subject, body, link }` instead of plain string
- **Purpose:** Provides structured data for frontend to display and copy separately

```typescript
static (
  childName: string,
  parentName: string,
  token: string,
  appUrl: string = process.env.FRONTEND_URL || 'http://localhost:5173'
): { subject: string; body: string; link: string }
```

#### 2. Invitation Controller (`backend/src/api/controllers/invitation.controller.ts`)

**Existing Behavior:**
- Creates invitation with secure token
- Returns invitation data including `emailText` object
- No email sending required

**Response Format:**
```json
{
  "success": true,
  "data": {
    "invitation": { /* invitation object */ },
    "emailText": {
      "subject": "You're invited to MotivTrack!",
      "body": "Hi [Child]!...",
      "link": "http://localhost:5173/claim-account?token=abc123..."
    }
  }
}
```

### Frontend Changes

#### 1. Parent Onboarding (`frontend/src/pages/ParentOnboarding.jsx`)

**New Step 5.5:** Copy Invitation

- **Location:** Between Step 5 (Invite Child) and Step 6 (Invite Delivery Parent)
- **Components:**
  - Subject display
  - Message preview (read-only textarea)
  - "Copy message" button (copies subject + body)
  - "Copy link" button (copies just the registration link)
  - Helpful tip for parents

**State Management:**
- Added `invitationData` state to store the email text object
- Persisted in localStorage for recovery

**UX Features:**
- Visual feedback when copy buttons are clicked (✓ Copied!)
- Clear instructions for parents
- Professional card layout with proper spacing

#### 2. Claim Account Page (`frontend/src/pages/ClaimAccount.jsx`)

**New Public Route:** `/claim-account`

**Features:**
- Token validation on page load
- Error handling for invalid/expired tokens
- Child registration form:
  - First name (pre-filled from child profile if available)
  - Email (read-only, from invitation)
  - Password creation
  - Password confirmation
- Uses dedicated `/auth/register-child` endpoint
- Automatic login after successful registration
- Redirects to child dashboard

**Validation:**
- Token must be valid and not expired
- Password must be at least 6 characters
- Passwords must match
- First name is required

#### 3. App Routing (`frontend/src/App.jsx`)

**New Route:**
```jsx
<Route path="/claim-account" element={<ClaimAccount />} />
```

- Public route (no authentication required)
- Accessible via magic link from invitation

## Security Features

1. **Secure Token Generation:** 64-character random hex string
2. **Token Expiration:** 72 hours by default
3. **One-time Use:** Token is marked as "accepted" after registration
4. **Email Validation:** Token is tied to specific email address
5. **Role Verification:** Backend ensures invitation is for child role

## User Experience

### Parent Flow

1. **Step 5:** Enter child's email address
2. **Step 5.5:** See formatted invitation with:
   - Clear subject line
   - Friendly message explaining MotivTrack
   - Registration link
   - Easy copy buttons
3. **Action:** Copy and paste into their preferred email/messaging app
4. **Continue:** Proceed to optional delivery parent invitation

### Child Flow

1. **Receive:** Email/message from parent with invitation
2. **Click:** Magic link in the message
3. **Arrive:** At `/claim-account` page with welcoming design
4. **Register:**
   - Confirm first name
   - See email (read-only)
   - Create password
   - Confirm password
5. **Success:** Automatically logged in and redirected to child onboarding flow
   - Survey 1: "Dream a little" - What would you like to earn?
   - Survey 2: Specific reward preferences
   - Transition screen showing earned onboarding points
   - Finally arrives at child dashboard

## Benefits

✅ **No Email Infrastructure:** Parents use their own email/messaging apps
✅ **Secure:** Token-based authentication with expiration
✅ **Simple UX:** Clear copy buttons and instructions
✅ **Child Autonomy:** Child sets their own password
✅ **COPPA Compliant:** Parent initiates and controls the invitation
✅ **Flexible:** Works with email, text, or any messaging platform

## Testing Checklist

- [ ] Parent can create invitation and see formatted message
- [ ] Copy message button works correctly
- [ ] Copy link button works correctly
- [ ] Invalid token shows appropriate error
- [ ] Expired token shows appropriate error
- [ ] Child can register with valid token
- [ ] Password validation works correctly
- [ ] Child is automatically logged in after registration
- [ ] Child is redirected to child onboarding flow (not dashboard)
- [ ] Token cannot be reused after acceptance
- [ ] State persists in localStorage during parent onboarding

## Future Enhancements

1. **SMS Support:** Add phone number option for text message invitations
2. **QR Code:** Generate QR code for easy mobile scanning
3. **Multiple Children:** Batch invitation creation
4. **Reminder System:** Allow parents to resend invitations
5. **Custom Messages:** Let parents personalize the invitation text
6. **Preview Mode:** Show parents what child will see

## Files Modified

### Backend
- `backend/src/services/invitation.service.ts` - Updated email text generation
- `backend/src/api/controllers/invitation.controller.ts` - Already supported
- `backend/src/api/routes/auth.routes.ts` - Already had register-child endpoint

### Frontend
- `frontend/src/pages/ParentOnboarding.jsx` - Added Step 5.5 with copy functionality
- `frontend/src/pages/ClaimAccount.jsx` - New child registration page
- `frontend/src/App.jsx` - Added /claim-account route
- `frontend/src/pages/index.js` - Exported ClaimAccount component

## API Endpoints Used

### Create Invitation
```
POST /api/invitations
Body: { email, role: 'child', childProfileId, childName }
Response: { invitation, emailText: { subject, body, link } }
```

### Validate Token
```
GET /api/invitations/validate/:token
Response: { invitation with inviter and childProfile data }
```

### Register Child
```
POST /api/auth/register-child
Body: { token, password, name }
Response: { user, token }
```

## Environment Variables

- `FRONTEND_URL` - Used to generate the registration link (defaults to `http://localhost:5173`)

## Notes

- The invitation token is stored in the URL query parameter: `?token=...`
- Parent onboarding state is persisted in localStorage under key `motivtrack_onboarding_state`
- Child authentication token is stored in localStorage under key `motivtrack_auth_token`
- Step 5.5 is a "half-step" to maintain the 7-step progress bar while adding the copy functionality
