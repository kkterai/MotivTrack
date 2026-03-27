# PWA Testing Guide for MotivTrack

This guide will help you test all PWA features to ensure everything works correctly.

## Prerequisites

- ✅ Icons generated (16 icons in `frontend/public/icons/`)
- ✅ Service worker implemented
- ✅ Manifest configured
- ✅ PWA utilities created

## Testing Checklist

### 1. Local Build Testing

#### Build the Application
```bash
cd frontend
npm run build
npm run preview
```

The app should be available at `http://localhost:4173` (or similar).

#### Verify Build Output
Check that the build includes:
- [ ] `manifest.json` in dist folder
- [ ] `sw.js` in dist folder
- [ ] All icons in `dist/icons/` folder
- [ ] HTML includes manifest link and meta tags

### 2. Browser DevTools Testing

#### Chrome/Edge DevTools

1. **Open DevTools** (F12 or Cmd+Option+I)

2. **Application Tab** → **Manifest**
   - [ ] Manifest loads without errors
   - [ ] App name: "MotivTrack - Task & Reward System"
   - [ ] Theme color: #16324F
   - [ ] All icons display correctly
   - [ ] Start URL is correct

3. **Application Tab** → **Service Workers**
   - [ ] Service worker is registered
   - [ ] Status shows "activated and is running"
   - [ ] Scope is correct (/)
   - [ ] No errors in console

4. **Application Tab** → **Storage**
   - [ ] Cache Storage shows caches
   - [ ] Check cache contents (static assets)
   - [ ] Verify API requests are NOT cached

5. **Network Tab**
   - [ ] Reload page
   - [ ] Check that assets are served from service worker
   - [ ] Look for "(from ServiceWorker)" in Size column

### 3. Offline Functionality Testing

#### Test Offline Mode

1. **With DevTools open:**
   - Go to Network tab
   - Check "Offline" checkbox
   - Reload the page
   - [ ] Page loads successfully
   - [ ] Static assets load from cache
   - [ ] UI is functional

2. **Test API Requests Offline:**
   - Try to perform an action that requires API
   - [ ] Should show appropriate offline message
   - [ ] No cached sensitive data displayed

3. **Go back online:**
   - Uncheck "Offline"
   - [ ] App reconnects automatically
   - [ ] Data syncs if background sync is implemented

### 4. Install Prompt Testing

#### Desktop Installation

1. **Chrome/Edge:**
   - Look for install icon in address bar (⊕ or computer icon)
   - [ ] Click to install
   - [ ] App installs as standalone window
   - [ ] App icon appears in applications
   - [ ] App opens in standalone mode (no browser UI)

2. **Custom Install Prompt:**
   - Wait 3 seconds after page load
   - [ ] PWA install banner appears
   - [ ] "Install" button works
   - [ ] "Not now" button dismisses for 30 days

#### Mobile Installation (iOS)

1. **Safari on iOS:**
   - Tap Share button
   - [ ] "Add to Home Screen" option available
   - [ ] Tap to add
   - [ ] Icon appears on home screen
   - [ ] App opens in standalone mode
   - [ ] Status bar color matches theme

#### Mobile Installation (Android)

1. **Chrome on Android:**
   - [ ] Install banner appears automatically
   - [ ] Or tap menu → "Install app"
   - [ ] App installs to home screen
   - [ ] App opens in standalone mode
   - [ ] Splash screen shows (if configured)

### 5. Push Notifications Testing

⚠️ **Note:** Push notifications require HTTPS in production.

#### Request Permission

1. **Trigger notification permission:**
   ```javascript
   // In browser console
   import { requestNotificationPermission } from './utils/pwa.js';
   await requestNotificationPermission();
   ```

2. **Check permission:**
   - [ ] Browser shows permission prompt
   - [ ] Grant permission
   - [ ] Permission status is "granted"

#### Test Notifications (if backend is set up)

1. **Subscribe to push:**
   - [ ] Subscription is created
   - [ ] Subscription is sent to backend

2. **Send test notification:**
   - [ ] Notification appears
   - [ ] Click opens correct URL
   - [ ] Notification can be dismissed

### 6. Performance Testing

#### Lighthouse Audit

1. **Run Lighthouse:**
   - Open DevTools
   - Go to Lighthouse tab
   - Select "Progressive Web App"
   - Click "Generate report"

2. **Check PWA Score:**
   - [ ] PWA score is 90+ (ideally 100)
   - [ ] All PWA criteria pass:
     - [ ] Installable
     - [ ] PWA optimized
     - [ ] Fast and reliable
     - [ ] Works offline

3. **Performance Metrics:**
   - [ ] First Contentful Paint < 2s
   - [ ] Time to Interactive < 3.5s
   - [ ] Speed Index < 4s

### 7. Cross-Browser Testing

Test on multiple browsers:

#### Desktop
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS)

#### Mobile
- [ ] Chrome (Android)
- [ ] Samsung Internet (Android)
- [ ] Safari (iOS)
- [ ] Firefox (Android)

### 8. Privacy Features Testing

#### Cache Management

1. **Check storage usage:**
   ```javascript
   import { getCacheSize } from './utils/pwa.js';
   const size = await getCacheSize();
   console.log(size);
   ```
   - [ ] Returns storage information
   - [ ] Shows usage in MB

2. **Clear caches:**
   ```javascript
   import { clearAllCaches } from './utils/pwa.js';
   await clearAllCaches();
   ```
   - [ ] All caches are cleared
   - [ ] App still works (re-caches on next load)

#### Verify No Sensitive Data Caching

1. **Check Cache Storage in DevTools:**
   - [ ] No API responses cached
   - [ ] No user data in cache
   - [ ] Only static assets cached

2. **Test API requests:**
   - Make authenticated API call
   - Check Network tab
   - [ ] Request goes to network (not cache)
   - [ ] Response is not cached

### 9. Update Testing

#### Service Worker Updates

1. **Make a change to the app:**
   - Update a file
   - Rebuild: `npm run build`

2. **Test update flow:**
   - Reload the page
   - [ ] New service worker installs
   - [ ] Old service worker waits
   - [ ] Page prompts for reload (if implemented)
   - [ ] After reload, new version is active

### 10. Edge Cases Testing

#### Test Various Scenarios

1. **Slow Network:**
   - Throttle network in DevTools
   - [ ] App still loads
   - [ ] Cached content appears quickly

2. **No Network:**
   - Disable network completely
   - [ ] Offline page/message shows
   - [ ] Core functionality still works

3. **First Visit:**
   - Clear all data
   - Visit app for first time
   - [ ] Service worker installs
   - [ ] Assets are cached
   - [ ] Install prompt appears (after delay)

4. **Returning User:**
   - Visit app again
   - [ ] Loads from cache
   - [ ] Fast load time
   - [ ] No install prompt (if dismissed)

## Common Issues and Solutions

### Service Worker Not Registering

**Problem:** Service worker fails to register

**Solutions:**
- Check browser console for errors
- Ensure you're on HTTPS (or localhost)
- Verify `sw.js` is in the correct location
- Check service worker scope

### Install Prompt Not Showing

**Problem:** Install banner doesn't appear

**Solutions:**
- Check manifest is valid (DevTools → Application → Manifest)
- Ensure all required icons exist
- Verify HTTPS is enabled (required except localhost)
- Check browser install criteria (varies by browser)
- Try manually: Chrome menu → "Install MotivTrack"

### Offline Mode Not Working

**Problem:** App doesn't work offline

**Solutions:**
- Verify service worker is active
- Check cache strategy in `sw.js`
- Ensure assets are being cached
- Check Network tab for cache hits

### Icons Not Displaying

**Problem:** Icons don't show in manifest or install

**Solutions:**
- Verify icons exist in `public/icons/`
- Check icon paths in `manifest.json`
- Ensure icons are correct sizes
- Clear browser cache and rebuild

## Production Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Lighthouse PWA score is 90+
- [ ] HTTPS is enabled
- [ ] Icons are optimized
- [ ] Service worker is production-ready
- [ ] Push notification keys configured (if using)
- [ ] Error tracking is set up
- [ ] Analytics configured (privacy-compliant)
- [ ] Tested on real devices
- [ ] Tested on slow networks
- [ ] Privacy policy updated for PWA features

## Monitoring in Production

After deployment, monitor:

1. **Service Worker Registration Rate:**
   - Track how many users have SW installed
   - Monitor registration errors

2. **Install Rate:**
   - Track PWA installations
   - Monitor install prompt acceptance rate

3. **Offline Usage:**
   - Track offline page views
   - Monitor cache hit rates

4. **Update Success Rate:**
   - Track successful SW updates
   - Monitor update errors

5. **Performance Metrics:**
   - Monitor load times
   - Track cache effectiveness
   - Monitor offline functionality

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Lighthouse PWA Audits](https://web.dev/lighthouse-pwa/)
- [Service Worker Testing](https://developers.google.com/web/fundamentals/primers/service-workers/test)
- [PWA Install Criteria](https://web.dev/install-criteria/)
