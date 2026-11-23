// Handler registration hub
import { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { registerStartHandler } from './start.js';
import { registerHelpHandler } from './help.js';
import { registerStatusHandler } from './status.js';
import { registerAuthHandler } from './auth.js';
import { registerApplicationsHandler } from './applications.js';
import { registerCompetitionsHandler } from './competitions.js';

export function createBotComposer(): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  registerStartHandler(composer);
  registerHelpHandler(composer);
  registerStatusHandler(composer);
  registerAuthHandler(composer);
  registerApplicationsHandler(composer);
  registerCompetitionsHandler(composer);

  return composer;
}
