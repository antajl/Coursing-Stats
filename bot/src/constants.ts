/**
 * Все callback_data, которые обрабатывают handlers.
 * Контракт-тест keyboards ↔ handlers сверяется с этим списком.
 */
export const HANDLER_CALLBACK_PATTERNS: RegExp[] = [
  /^main_menu$/,
  /^search_dog$/,
  /^about$/,
  /^competitions_menu$/,
  /^shows_menu$/,
  /^guide_menu$/,
  /^back$/,
  /^cancel_search$/,
  /^ratings$/,
  /^rating_(coursing|racing|shows)$/,
  /^rating_(coursing)_(score|placement)$/,
  /^rating_(coursing|racing)_(score|placement)_years$/,
  /^rating_shows_years$/,
  /^rating_shows_\d{4}$/,
  /^rating_(coursing|racing)_(score|placement)_\d{4}$/,
  /^rating_(coursing|racing)_(score|placement)_all$/,
  /^rating_(coursing|racing)_(score|placement)_\d{4}_\d+$/,
  /^rating_(coursing|racing)_(score|placement)_all_\d+$/,
  /^calendar$/,
  /^filter_all$/,
  /^filter_coursing$/,
  /^filter_racing$/,
  /^filter_shows$/,
  /^shows_calendar(?:_\d+)?$/,
  /^calendar_\d+$/,
  /^favorites$/,
  /^donino_records$/,
  /^donino_speed$/,
  /^donino_coursing$/,
  /^compare_start_\d+$/,
  /^compare_cancel$/,
  /^compare_select_\d+$/,
  /^dog:\d+$/,
  /^add_favorite:\d+$/,
  /^remove_favorite:\d+$/,
  /^guide_titles$/,
  /^guide_shows$/,
  /^guide_protocol$/,
  /^guide_rating$/,
  /^guide_site$/,
  /^judges$/,
  /^judges_competition$/,
  /^judges_show$/,
];

export function matchesHandlerCallback(callbackData: string): boolean {
  return HANDLER_CALLBACK_PATTERNS.some((pattern) => pattern.test(callbackData));
}

/** Deep link в личку бота: /start dog_{id} */
export function botStartLink(startParam: string, botUsername = 'coursing_stats_bot'): string {
  return `https://t.me/${botUsername}?start=${encodeURIComponent(startParam)}`;
}

export const BOT_USERNAME = 'coursing_stats_bot';
