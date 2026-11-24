// Standalone local runner with long-polling for local development and testing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBot } from './bot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageDir = path.resolve(__dirname, '../data');
const storageFile = path.join(storageDir, 'local-kv.json');

let store: Record<string, string> = {};
try {
  if (fs.existsSync(storageFile)) {
    store = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
  }
} catch (err) {
  console.warn('[Local KV] Initializing empty store:', err);
}

function persistStore() {
  try {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    fs.writeFileSync(storageFile, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('[Local KV] Save error:', err);
  }
}

const mockKV: any = {
  async get(key: string): Promise<string | null> {
    return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
  },
  async put(key: string, value: string): Promise<void> {
    store[key] = String(value);
    persistStore();
  },
  async delete(key: string): Promise<void> {
    delete store[key];
    persistStore();
  },
  async list(): Promise<{ keys: { name: string }[] }> {
    return { keys: Object.keys(store).map((name) => ({ name })) };
  },
};

const token =
  process.env.BOT_TOKEN ||
  process.env.TELEGRAM_BOT_TOKEN ||
  '9278827269:AAHAUakH_YNafGBw5kEjBJqlnlfo8mt7IN4';

console.log('--- CoursingStats RKF Tracker Bot Local Runner ---');
console.log('Using bot token:', token.slice(0, 10) + '...' + token.slice(-5));

const bot = createBot(token, {
  KV_STORAGE: mockKV,
  BOT_TOKEN: token,
});

async function main() {
  try {
    console.log('Clearing old Telegram webhooks and pending updates...');
    await bot.api.deleteWebhook({ drop_pending_updates: true });
    console.log('Webhook deleted successfully.');

    // Register bot commands list in Telegram
    try {
      await bot.api.setMyCommands([
        { command: 'start', description: 'Главное меню' },
        { command: 'status', description: 'Статус мониторинга' },
        { command: 'apps', description: 'Список заявок и документов' },
        { command: 'ready', description: 'Готовые к выдаче дипломы' },
        { command: 'competitions', description: 'Отслеживание состязаний' },
        { command: 'track', description: 'Подписаться на состязание' },
        { command: 'auth', description: 'Привязать токен rkf.online' },
        { command: 'logout', description: 'Сбросить авторизацию' },
        { command: 'help', description: 'Справка и инструкция' },
      ]);
      console.log('Bot commands registered in Telegram menu.');
    } catch (cmdErr) {
      console.warn('Could not register bot commands:', cmdErr);
    }

    console.log('Starting long-polling...');
    await bot.start({
      onStart: (botInfo) => {
        console.log(`\n>>> Bot is LIVE: @${botInfo.username} (ID: ${botInfo.id}) <<<`);
        console.log('Ready to receive Telegram messages. Press Ctrl+C to stop.\n');
      },
    });
  } catch (err) {
    console.error('Fatal error starting local bot:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping bot polling...');
  bot.stop();
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('\nStopping bot polling...');
  bot.stop();
  process.exit(0);
});

main();
