# PWA Implementation Guide for MotivTrack

This document outlines the Progressive Web App (PWA) implementation for MotivTrack, with a strong focus on privacy and user control.

## Overview

MotivTrack is now a fully-functional Progressive Web App that can be installed on mobile devices and desktops without requiring app store distribution. This provides:

- **Offline functionality** - Users can access the app without an internet connection
- **Install to home screen** - Users can install the app like a native app
- **Push notifications** - Optional notifications with explicit user consent
- **Fast loading** - Service worker caching for improved performance
- **Privacy-first** - No tracking, minimal data collection

## Files Created

### 1. Web App Manifest (`frontend/public/manifest.json`)
Defines how the app appears when installed:
- App name, description, and icons
- Theme colors (using design system colors)
- Display mode (standalone for app-like experience)
- Orientation preferences

### 2. Service Worker (`frontend/public/sw.js`)
Handles offline functionality and caching:
- **Cache-first strategy** for static assets
- **Network-first strategy** for API requests (privacy: no caching of sensitive data)
- Push notification handling
- Background sync for offline task submissions

### 3. PWA Utilities (`frontend/src/utils/pwa.js`)
Privacy-focused PWA management functions:
- `registerServiceWorker()` - Registers the service worker
- `requestNotificationPermission()` - Requests permission with user consent
- `subscribeToPushNotifications()` - Subscribes to push (only if permitted)
- `unsubscribeFromPushNotifications()` - Allows users to opt-out
- `clearAllCaches()` - Privacy: users can clear all cached data
- `getCacheSize()` - Transparency: users can see storage usage

### 4. Install Prompt Component (`frontend/src/components/common/PWAInstallPrompt.jsx`)
User-friendly install prompt:
- Shows after 3 seconds (non-intrusive)
- Remembers dismissal for 30 days
- Respects user choice
- Fully styled with design system

### 5. Updated HTML (`frontend/index.html`)
Added PWA meta tags:
- Theme color for browser UI
- Apple-specific meta tags for iOS
- Manifest link
- Multiple icon sizes for different devices

### 6. Updated Main Entry (`frontend/src/main.jsx`)
Registers service worker in production:
- Only registers in production builds
- Sets up install prompt
- Non-blocking initialization

## Privacy Features

### 1. Data Minimization
- **No API caching**: API requests are never cached to prevent sensitive data storage
- **Selective caching**: Only static assets (CSS, JS, images) are cached
- **Clear cache option**: Users can clear all cached data at any time

### 2. User Control
- **Explicit consent**: Push notifications require explicit user permission
- **Easy opt-out**: Users can unsubscribe from notifications anytime
- **Dismissible prompts**: Install prompts can be dismissed and won't show again for 30 days

### 3. Transparency
- **Storage visibility**: Users can see how much storage the app uses
- **No tracking**: Service worker doesn't track user behavior
- **No third-party SDKs**: All PWA functionality is implemented in-house

## Setup Instructions

### 1. Generate App Icons

You'll need to create app icons in various sizes. Place them in `frontend/public/icons/`:

Required sizes:
- 16x16, 32x32 (favicons)
- 57x57, 60x60, 72x72, 76x76, 114x114, 120x120, 144x144, 152x152, 180x180 (Apple)
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 (Android/PWA)

You can use tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 2. Configure Push Notifications (Optional)

If you want to enable push notifications:

1. Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

2. Add the public key to your `.env` file:
```
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

3. Store the private key securely on your backend server

4. Implement backend push notification endpoint (see Backend Setup below)

### 3. Add PWA Install Prompt to App

Add the install prompt component to your main App component:

```jsx
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

function App() {
  return (
    <>
      {/* Your app content */}
      <PWAInstallPrompt />
    </>
  );
}
```

### 4. Test PWA Functionality

#### Local Testing:
1. Build the app: `npm run build`
2. Serve the build: `npm run preview`
3. Open in browser and check:
   - Application tab in DevTools
   - Service Worker registration
   - Manifest validation
   - Cache storage

#### Mobile Testing:
1. Deploy to a server with HTTPS (required for PWA)
2. Open on mobile device
3. Test install prompt
4. Test offline functionality
5. Test push notifications (if enabled)

## Backend Setup for Push Notifications

If implementing push notifications, add this endpoint to your backend:

```javascript
// backend/src/api/routes/notifications.routes.ts
import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Endpoint to send push notification
router.post('/send-notification', async (req, res) => {
  const { subscription, payload } = req.body;
  
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});
```

## Deployment Checklist

- [ ] Generate all required app icons
- [ ] Update manifest.json with production URLs
- [ ] Configure VAPID keys (if using push notifications)
- [ ] Test service worker registration
- [ ] Test offline functionality
- [ ] Test install prompt on mobile devices
- [ ] Verify HTTPS is enabled (required for PWA)
- [ ] Test on multiple browsers (Chrome, Safari, Firefox, Edge)
- [ ] Test on multiple devices (iOS, Android, Desktop)
- [ ] Verify cache size limits
- [ ] Test cache clearing functionality

## Browser Support

### Full PWA Support:
- Chrome/Edge (Desktop & Mobile)
- Samsung Internet
- Firefox (Desktop & Mobile)

### Partial Support:
- Safari (iOS 11.3+) - Limited service worker support
- Safari (macOS) - No install prompt, but can add to dock

### No Support:
- Internet Explorer
- Older browsers

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS is enabled (required except on localhost)
- Clear browser cache and try again
- Check service worker scope

### Install Prompt Not Showing
- Ensure manifest.json is valid
- Check that all required icons exist
- Verify HTTPS is enabled
- Some browsers have specific criteria (e.g., user engagement)

### Offline Mode Not Working
- Check service worker is active in DevTools
- Verify cache strategy in sw.js
- Check network tab to see if requests are served from cache

### Push Notifications Not Working
- Verify user has granted permission
- Check VAPID keys are configured correctly
- Ensure subscription is saved to backend
- Check browser console for errors

## Future Enhancements

- [ ] Add background sync for offline task submissions
- [ ] Implement periodic background sync for updates
- [ ] Add app shortcuts for quick actions
- [ ] Implement share target API
- [ ] Add file handling capabilities
- [ ] Implement badging API for notification counts

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced service worker library
