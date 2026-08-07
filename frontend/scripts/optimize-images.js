import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directories = [
  path.join(__dirname, '../public/assets'),
  path.join(__dirname, '../../public/bot')
];

async function optimizeImage(inputPath) {
  try {
    const outputPath = inputPath.replace(/\.png$/, '.webp');
    
    // Пропускаем если WebP уже существует
    if (fs.existsSync(outputPath)) {
      const originalSize = fs.statSync(inputPath).size;
      const webpSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      return { 
        path: inputPath, 
        status: 'exists', 
        originalSize, 
        webpSize, 
        savings 
      };
    }

    // Читаем оригинальный размер
    const originalSize = fs.statSync(inputPath).size;

    // Конвертируем в WebP с качеством 85%
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Читаем размер WebP
    const webpSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

    return { 
      path: inputPath, 
      status: 'created', 
      originalSize, 
      webpSize, 
      savings 
    };
  } catch (error) {
    return { path: inputPath, status: 'error', error: error.message };
  }
}

async function findPngFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...await findPngFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.png')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  console.log('🖼️  Optimizing images to WebP format...\n');

  let totalOriginalSize = 0;
  let totalWebpSize = 0;
  let createdCount = 0;
  let existsCount = 0;
  let errorCount = 0;

  for (const dir of directories) {
    console.log(`📁 Processing: ${dir}`);
    const pngFiles = await findPngFiles(dir);
    
    if (pngFiles.length === 0) {
      console.log('   No PNG files found\n');
      continue;
    }

    console.log(`   Found ${pngFiles.length} PNG files`);

    for (const file of pngFiles) {
      const result = await optimizeImage(file);
      
      if (result.status === 'created') {
        createdCount++;
        totalOriginalSize += result.originalSize;
        totalWebpSize += result.webpSize;
        console.log(`   ✅ ${path.basename(file)}: ${formatBytes(result.originalSize)} → ${formatBytes(result.webpSize)} (${result.savings}% saved)`);
      } else if (result.status === 'exists') {
        existsCount++;
        totalOriginalSize += result.originalSize;
        totalWebpSize += result.webpSize;
        console.log(`   ⏭️  ${path.basename(file)}: WebP already exists (${result.savings}% saved)`);
      } else {
        errorCount++;
        console.log(`   ❌ ${path.basename(file)}: ${result.error}`);
      }
    }
    
    console.log();
  }

  const totalSavings = totalOriginalSize - totalWebpSize;
  const totalSavingsPercent = ((totalSavings / totalOriginalSize) * 100).toFixed(1);

  console.log('📊 Summary:');
  console.log(`   Created: ${createdCount} WebP files`);
  console.log(`   Already exists: ${existsCount} WebP files`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total original size: ${formatBytes(totalOriginalSize)}`);
  console.log(`   Total WebP size: ${formatBytes(totalWebpSize)}`);
  console.log(`   Total savings: ${formatBytes(totalSavings)} (${totalSavingsPercent}%)`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

main().catch(console.error);
