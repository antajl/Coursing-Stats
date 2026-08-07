/**
 * Освобождает :8787 перед npm run dev (Windows: taskkill по netstat).
 */
import { execSync } from 'node:child_process';

const PORT = process.env.PORT || '8787';

function freePortWin(port: string) {
  try {
    const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
      encoding: 'utf-8',
    });
    const pids = new Set<string>();
    for (const line of out.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`Freed port ${port} (PID ${pid})`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* nothing listening */
  }
}

if (process.platform === 'win32') {
  freePortWin(PORT);
}
