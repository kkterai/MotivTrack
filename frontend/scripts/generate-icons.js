#!/usr/bin/env node

/**
 * Icon Generation Script for MotivTrack PWA
 * Generates all required icon sizes from logo.svg
 * 
 * Usage: node scripts/generate-icons.js
 * 
 * Requirements: sharp package
 * Install: npm install --save-dev sharp
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '../public');
const iconsDir = join(publicDir, 'icons');
const logoPath = join(publicDir, 'logo.svg');

// Icon sizes needed for PWA
const iconSizes = [
  // Favicons
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  
  // Apple Touch Icons
  { size: 57, name: 'icon-57x57.png' },
  { size: 60, name: 'icon-60x60.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 76, name: 'icon-76x76.png' },
  { size: 114, name: 'icon-114x114.png' },
  { size: 120, name: 'icon-120x120.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'icon-180x180.png' },
  
  // Android/PWA Icons
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons for MotivTrack...\n');

  // Create icons directory if it doesn't exist
  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true });
    console.log('✅ Created icons directory\n');
  }

  // Check if logo exists
  if (!existsSync(logoPath)) {
    console.error('❌ Error: logo.svg not found at', logoPath);
    console.log('\nPlease create a logo.svg file in the public directory.');
    process.exit(1);
  }

  // Read the SVG file
  const svgBuffer = readFileSync(logoPath);

  // Generate each icon size
  let successCount = 0;
  let errorCount = 0;

  for (const { size, name } of iconSizes) {
    try {
      const outputPath = join(iconsDir, name);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully generated: ${successCount} icons`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount} icons`);
  }
  console.log(`\n🎉 Icon generation complete!`);
  console.log(`\nNext steps:`);
  console.log(`1. Review generated icons in: ${iconsDir}`);
  console.log(`2. Test the PWA: npm run build && npm run preview`);
  console.log(`3. Check Application tab in DevTools`);
}

// Run the script
generateIcons().catch((error) => {
  console.error('❌ Icon generation failed:', error);
  process.exit(1);
});
