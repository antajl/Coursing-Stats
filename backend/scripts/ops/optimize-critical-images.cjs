const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeImages() {
  console.log('[optimize-critical-images] Starting image optimization...');

  // 1. Badges
  const badgesDir = path.resolve(__dirname, '../../../frontend/public/assets/badges');
  const badgesBackup = path.resolve(__dirname, '../../../frontend/src/assets/badges-source');

  for (let rank = 1; rank <= 3; rank++) {
    const backupFile = path.join(badgesBackup, `coursing-stats-${rank}.webp`);
    if (!fs.existsSync(backupFile)) {
      console.warn(`[optimize-critical-images] Source not found for badge ${rank}: ${backupFile}`);
      continue;
    }

    const meta = await sharp(backupFile).metadata();
    const aspect = meta.height / meta.width;

    // 1x (40px)
    const h1x = Math.round(40 * aspect);
    const out40 = path.join(badgesDir, `coursing-stats-${rank}-40.webp`);
    await sharp(backupFile)
      .resize({ width: 40, height: h1x, fit: 'contain' })
      .webp({ quality: 85, effort: 6 })
      .toFile(out40);

    // 2x / default (80px)
    const h2x = Math.round(80 * aspect);
    const outDefault = path.join(badgesDir, `coursing-stats-${rank}.webp`);
    const out2x = path.join(badgesDir, `coursing-stats-${rank}@2x.webp`);

    await sharp(backupFile)
      .resize({ width: 80, height: h2x, fit: 'contain' })
      .webp({ quality: 85, effort: 6 })
      .toFile(outDefault);

    fs.copyFileSync(outDefault, out2x);

    const s40 = (fs.statSync(out40).size / 1024).toFixed(1);
    const s80 = (fs.statSync(outDefault).size / 1024).toFixed(1);
    console.log(`[optimize-critical-images] Badge ${rank}: 40px=${s40}KB, 80px=${s80}KB`);
  }

  // 2. Hero Background Mobile
  const heroDir = path.resolve(__dirname, '../../../frontend/public/assets/hero');
  const heroBackup = path.resolve(__dirname, '../../../frontend/src/assets/hero-source/background-mobile.webp');

  if (fs.existsSync(heroBackup)) {
    // 480w
    const out480 = path.join(heroDir, 'background-mobile-480.webp');
    await sharp(heroBackup)
      .resize({ width: 480, height: 252, fit: 'cover' })
      .webp({ quality: 78, effort: 6 })
      .toFile(out480);

    // 820w
    const out820 = path.join(heroDir, 'background-mobile.webp');
    await sharp(heroBackup)
      .resize({ width: 820, height: 431, fit: 'cover' })
      .webp({ quality: 76, effort: 6 })
      .toFile(out820);

    const s480 = (fs.statSync(out480).size / 1024).toFixed(1);
    const s820 = (fs.statSync(out820).size / 1024).toFixed(1);
    console.log(`[optimize-critical-images] Hero mobile: 480w=${s480}KB, 820w=${s820}KB`);
  }

  console.log('[optimize-critical-images] Done.');
}

optimizeImages().catch((err) => {
  console.error('[optimize-critical-images] Error:', err);
  process.exit(1);
});
