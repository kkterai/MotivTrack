# App Icons for MotivTrack PWA

This directory should contain all the app icons needed for the Progressive Web App.

## Required Icon Sizes

### Favicons
- `icon-16x16.png` - Browser favicon
- `icon-32x32.png` - Browser favicon

### Apple Touch Icons (iOS)
- `icon-57x57.png` - iPhone (non-retina)
- `icon-60x60.png` - iPhone
- `icon-72x72.png` - iPad (non-retina)
- `icon-76x76.png` - iPad
- `icon-114x114.png` - iPhone (retina)
- `icon-120x120.png` - iPhone (retina)
- `icon-144x144.png` - iPad (retina)
- `icon-152x152.png` - iPad (retina)
- `icon-180x180.png` - iPhone (retina)

### Android/PWA Icons
- `icon-72x72.png` - Android launcher
- `icon-96x96.png` - Android launcher
- `icon-128x128.png` - Android launcher
- `icon-144x144.png` - Android launcher
- `icon-152x152.png` - Android launcher
- `icon-192x192.png` - Android launcher (standard)
- `icon-384x384.png` - Android launcher
- `icon-512x512.png` - Android launcher (high-res)

## Generating Icons

### Option 1: Using PWA Asset Generator (Recommended)

```bash
npx pwa-asset-generator [source-image] ./frontend/public/icons --icon-only --favicon --type png
```

Replace `[source-image]` with your logo file (preferably 512x512 or larger).

### Option 2: Using RealFaviconGenerator

1. Visit https://realfavicongenerator.net/
2. Upload your logo
3. Configure settings for each platform
4. Download the generated package
5. Extract icons to this directory

### Option 3: Manual Creation

Use an image editor (Photoshop, GIMP, Figma, etc.) to create each size manually:

1. Start with a high-resolution logo (at least 1024x1024)
2. Resize to each required dimension
3. Export as PNG with transparency
4. Ensure the icon looks good at small sizes

## Design Guidelines

### Logo Requirements
- **Format**: PNG with transparency
- **Minimum size**: 512x512 pixels
- **Recommended size**: 1024x1024 pixels
- **Safe zone**: Keep important elements within 80% of the canvas
- **Colors**: Use brand colors from design system
  - Primary: #16324F (Ink Navy)
  - Secondary: #2A6F97 (Ocean Blue)

### Icon Design Tips
- Keep it simple - icons should be recognizable at small sizes
- Use high contrast for visibility
- Avoid fine details that won't be visible when scaled down
- Test at multiple sizes to ensure clarity
- Consider both light and dark backgrounds

## Brand Colors

Use these colors from the MotivTrack design system:

- **Primary**: #16324F (Ink Navy)
- **Secondary**: #2A6F97 (Ocean Blue)
- **Success**: #1FA37A (Emerald Teal)
- **Accent**: #E9C46A (Soft Gold)
- **Reward**: #F4A261 (Reward Orange)

## Testing Icons

After generating icons:

1. Clear browser cache
2. Rebuild the app: `npm run build`
3. Serve the build: `npm run preview`
4. Check in browser DevTools > Application > Manifest
5. Verify all icons load correctly
6. Test install on mobile device
7. Check home screen icon appearance

## Maskable Icons

For better Android support, consider creating maskable icons:
- Add 20% padding around your logo
- Ensure important elements are in the safe zone
- Test with [Maskable.app](https://maskable.app/)

## Current Status

⚠️ **Icons not yet generated** - Please generate icons using one of the methods above.
