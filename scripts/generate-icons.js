#!/usr/bin/env node

/**
 * App Icon Generator for ElderlyCare
 *
 * Usage:
 *   node scripts/generate-icons.js <path-to-1024x1024-icon.png>
 *
 * This script takes a single 1024x1024 PNG source icon and generates
 * all required icon sizes for both Android and iOS platforms.
 *
 * Requirements:
 *   - Source image should be a 1024x1024 PNG (no transparency for iOS App Store)
 *   - sharp is installed as a dev dependency
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

// ── Android icon sizes (mipmap) ─────────────────────────────────────────
const ANDROID_ICONS = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// ── iOS icon sizes ──────────────────────────────────────────────────────
const IOS_ICONS = [
  { filename: 'icon-20@2x.png', size: 40 },
  { filename: 'icon-20@3x.png', size: 60 },
  { filename: 'icon-29@2x.png', size: 58 },
  { filename: 'icon-29@3x.png', size: 87 },
  { filename: 'icon-40@2x.png', size: 80 },
  { filename: 'icon-40@3x.png', size: 120 },
  { filename: 'icon-60@2x.png', size: 120 },
  { filename: 'icon-60@3x.png', size: 180 },
  { filename: 'icon-1024.png', size: 1024 },
];

// ── iOS Contents.json ───────────────────────────────────────────────────
const IOS_CONTENTS = {
  images: [
    { idiom: 'iphone', scale: '2x', size: '20x20', filename: 'icon-20@2x.png' },
    { idiom: 'iphone', scale: '3x', size: '20x20', filename: 'icon-20@3x.png' },
    { idiom: 'iphone', scale: '2x', size: '29x29', filename: 'icon-29@2x.png' },
    { idiom: 'iphone', scale: '3x', size: '29x29', filename: 'icon-29@3x.png' },
    { idiom: 'iphone', scale: '2x', size: '40x40', filename: 'icon-40@2x.png' },
    { idiom: 'iphone', scale: '3x', size: '40x40', filename: 'icon-40@3x.png' },
    { idiom: 'iphone', scale: '2x', size: '60x60', filename: 'icon-60@2x.png' },
    { idiom: 'iphone', scale: '3x', size: '60x60', filename: 'icon-60@3x.png' },
    { idiom: 'ios-marketing', scale: '1x', size: '1024x1024', filename: 'icon-1024.png' },
  ],
  info: { version: 1, author: 'xcode' },
};

async function generateIcons(sourcePath) {
  if (!sourcePath) {
    console.error(
      'Usage: node scripts/generate-icons.js <path-to-1024x1024-icon.png>',
    );
    process.exit(1);
  }

  const absoluteSource = path.resolve(sourcePath);
  if (!fs.existsSync(absoluteSource)) {
    console.error(`Source icon not found: ${absoluteSource}`);
    process.exit(1);
  }

  const source = sharp(absoluteSource);
  const meta = await source.metadata();
  console.log(`Source icon: ${meta.width}x${meta.height} (${meta.format})`);

  if (meta.width < 1024 || meta.height < 1024) {
    console.warn(
      'Warning: Source icon is smaller than 1024x1024. Results may be blurry.',
    );
  }

  // ── Generate Android icons ──────────────────────────────────────────
  console.log('\n--- Android Icons ---');
  const androidResDir = path.join(
    ROOT,
    'android',
    'app',
    'src',
    'main',
    'res',
  );

  for (const { folder, size } of ANDROID_ICONS) {
    const outDir = path.join(androidResDir, folder);
    fs.mkdirSync(outDir, { recursive: true });

    // Standard icon
    const iconPath = path.join(outDir, 'ic_launcher.png');
    await sharp(absoluteSource)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(iconPath);
    console.log(`  ✓ ${folder}/ic_launcher.png (${size}x${size})`);

    // Round icon
    const roundIconPath = path.join(outDir, 'ic_launcher_round.png');
    const roundMask = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>`,
    );
    await sharp(absoluteSource)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: roundMask, blend: 'dest-in' }])
      .png()
      .toFile(roundIconPath);
    console.log(`  ✓ ${folder}/ic_launcher_round.png (${size}x${size})`);
  }

  // ── Generate iOS icons ──────────────────────────────────────────────
  console.log('\n--- iOS Icons ---');
  const iosIconDir = path.join(
    ROOT,
    'ios',
    'elderlyCare',
    'Images.xcassets',
    'AppIcon.appiconset',
  );
  fs.mkdirSync(iosIconDir, { recursive: true });

  for (const { filename, size } of IOS_ICONS) {
    const iconPath = path.join(iosIconDir, filename);
    await sharp(absoluteSource)
      .resize(size, size, { fit: 'cover' })
      .png({ quality: 100 })
      .toFile(iconPath);
    console.log(`  ✓ ${filename} (${size}x${size})`);
  }

  // Write Contents.json
  const contentsPath = path.join(iosIconDir, 'Contents.json');
  fs.writeFileSync(contentsPath, JSON.stringify(IOS_CONTENTS, null, 2) + '\n');
  console.log('  ✓ Contents.json updated');

  console.log('\n✅ All icons generated successfully!');
  console.log(
    'Rebuild your app to see the new icon: npx react-native run-android / run-ios',
  );
}

generateIcons(process.argv[2]);
