/**
 * Cross-platform wrapper to run tsx scripts with expanded V8 heap memory (12 GB).
 * Sets NODE_OPTIONS before spawning tsx so all worker threads/child processes inherit the limit.
 */
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=12288`.trim();
const { spawnSync } = require('child_process');
const result = spawnSync('node', ['./node_modules/tsx/dist/cli.mjs', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status ?? 0);
