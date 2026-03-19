# Onboarding Redirect Fix

## Issue
When a new Admin Parent registered, they were not automatically taken through the onboarding flow. Instead, they were redirected directly to the Parent Dashboard at `/parent`.

## Root Cause
The [`getRoleBasedRoute()`](frontend/src/App.jsx:88) function in App.jsx always returned `/parent` for admin parents, without checking if they had completed onboarding (i.e., created at least one child profile).

## Solution
Modified [`ParentDashboard`](frontend/src/pages/ParentDashboard.jsx:13) component to check for child profiles on mount and redirect to onboarding if none exist.

### Changes Made

**File: `frontend/src/pages/ParentDashboard.jsx`**

1. **Added imports:**
   ```javascript
   import { useNavigate } from 'react-router-dom';
   import { childProfileService } from '../services/childProfiles';
   ```

2. **Updated `useEffect` hook:**
   - Fetch child profiles using [`childProfileService.getMyChildProfiles()`](frontend/src/services/childProfiles.js:15)
   - Check if admin parent has 0 child profiles
   - If true, redirect to `/parent/onboarding` with `replace: true`
   - If false, set child profiles state and continue loading dashboard

### Flow After Fix

#### New Admin Parent Registration:
1. User registers as admin_parent
2. Auth successful → redirected to `/parent` (dashboard)
3. ParentDashboard loads → fetches child profiles
4. No child profiles found → **redirects to `/parent/onboarding`**
5. User completes onboarding wizard → creates first child profile
6. Onboarding complete → redirects to `/parent` (dashboard)
7. ParentDashboard loads → fetches child profiles
8. Child profiles found → **shows dashboard**

#### Existing Admin Parent Login:
1. User logs in as admin_parent
2. Auth successful → redirected to `/parent` (dashboard)
3. ParentDashboard loads → fetches child profiles
4. Child profiles found → **shows dashboard immediately**

### Benefits
- ✅ Automatic onboarding detection
- ✅ No changes needed to auth flow
- ✅ Works for both new registrations and existing logins
- ✅ Clean separation of concerns (dashboard checks its own requirements)
- ✅ Uses `replace: true` to prevent back button issues

### Testing Checklist
- [ ] Register new admin parent → should redirect to onboarding
- [ ] Complete onboarding → should redirect to dashboard
- [ ] Login as existing admin parent with children → should show dashboard
- [ ] Verify back button doesn't break flow
- [ ] Verify delivery parents are not affected (they don't need onboarding)

## Related Files
- [`frontend/src/pages/ParentDashboard.jsx`](frontend/src/pages/ParentDashboard.jsx:13) - Main fix location
- [`frontend/src/pages/ParentOnboarding.jsx`](frontend/src/pages/ParentOnboarding.jsx:1) - Onboarding wizard
- [`frontend/src/services/childProfiles.js`](frontend/src/services/childProfiles.js:15) - API service
- [`frontend/src/App.jsx`](frontend/src/App.jsx:88) - Routing configuration

## Next Steps
1. Test the complete flow end-to-end
2. Consider adding a loading state during the redirect
3. Add error handling for API failures
4. Implement similar checks for other roles if needed (Child, Delivery Parent)
