// Simple check to verify if bot can be deployed locally
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Checking Bot Deployment Status ===\n');

// Check if wrangler is installed
try {
  const wranglerVersion = execSync('npx wrangler --version', { encoding: 'utf-8' });
  console.log('✅ Wrangler installed:', wranglerVersion.trim());
} catch (error) {
  console.log('❌ Wrangler not installed or not accessible');
  console.log('Run: npm install -g wrangler');
  process.exit(1);
}

// Check if wrangler.toml exists
const wranglerToml = path.join(__dirname, 'wrangler.toml');
if (fs.existsSync(wranglerToml)) {
  console.log('✅ wrangler.toml found');
  const wranglerConfig = fs.readFileSync(wranglerToml, 'utf-8');
  console.log('Config:', wranglerConfig.substring(0, 200) + '...');
} else {
  console.log('❌ wrangler.toml not found');
  process.exit(1);
}

// Check if .dev.vars exists (for local secrets)
const devVars = path.join(__dirname, '.dev.vars');
if (fs.existsSync(devVars)) {
  console.log('✅ .dev.vars found (local secrets configured)');
} else {
  console.log('⚠️  .dev.vars not found (will use Cloudflare secrets for production)');
}

// Check if source files exist
const workerFile = path.join(__dirname, 'src/worker.ts');
if (fs.existsSync(workerFile)) {
  console.log('✅ src/worker.ts found');
} else {
  console.log('❌ src/worker.ts not found');
  process.exit(1);
}

const handlersFile = path.join(__dirname, 'src/handlers.ts');
if (fs.existsSync(handlersFile)) {
  console.log('✅ src/handlers.ts found');
  const handlersContent = fs.readFileSync(handlersFile, 'utf-8');
  
  // Check for answerCallbackQuery
  if (handlersContent.includes('await ctx.answerCallbackQuery()')) {
    console.log('✅ answerCallbackQuery() is enabled in handlers.ts');
  } else {
    console.log('❌ answerCallbackQuery() is NOT enabled in handlers.ts');
  }
} else {
  console.log('❌ src/handlers.ts not found');
  process.exit(1);
}

console.log('\n=== Deployment Check Complete ===');
console.log('✅ Bot is ready for deployment');
console.log('\nTo deploy locally:');
console.log('  npx wrangler deploy');
console.log('\nTo test locally:');
console.log('  npx wrangler dev');