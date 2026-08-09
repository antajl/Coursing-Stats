import { InlineKeyboard } from 'grammy';
import { unicodeIcons } from './icons';
import { Dog } from './types';

export function getMainInlineMenu(): InlineKeyboard {
  const keyboard = new InlineKeyboard()
    .text(`${unicodeIcons.search} Найти собаку`, 'search_dog')
    .row()
    .text(`${unicodeIcons.calendar} Соревнования`, 'competitions_menu')
    .text(`${unicodeIcons.shows} Выставки`, 'shows_menu')
    .row()
    .text(`${unicodeIcons.donino} Донино`, 'donino_records')
    .text(`${unicodeIcons.favorites} Избранное`, 'favorites')
    .row()
    .text(`${unicodeIcons.book} Справка`, 'guide_menu')
    .url(`${unicodeIcons.website} Открыть сайт`, 'https://coursing-stats.ru');

  return keyboard;
}

export function getBackButton(): InlineKeyboard {
  return new InlineKeyboard()
    .text(`${unicodeIcons.back} Назад`, 'back')
    .text(`${unicodeIcons.home} На главную`, 'main_menu');
}

// Competitions sub-menu (calendar, ratings, judges)
export function getCompetitionsMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text(`${unicodeIcons.calendar} Календарь`, 'calendar')
    .text(`${unicodeIcons.ratings} Рейтинги`, 'ratings')
    .row()
    .text(`${unicodeIcons.judges} Судьи`, 'judges')
    .row()
    .text(`${unicodeIcons.back} Назад`, 'main_menu');
}

// Shows sub-menu (calendar, ratings, judges)
export function getShowsMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text(`${unicodeIcons.calendar} Календарь`, 'shows_calendar')
    .text(`${unicodeIcons.ratings} Рейтинги`, 'rating_shows_years')
    .row()
    .text(`${unicodeIcons.judges} Судьи`, 'judges_show')
    .row()
    .text(`${unicodeIcons.back} Назад`, 'main_menu');
}

// Guide sub-menu (5 sections)
export function getGuideMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🏆 Соревнования', 'guide_titles')
    .text('🎪 Выставки', 'guide_shows')
    .row()
    .text('📋 Протоколы', 'guide_protocol')
    .text('📊 Рейтинг', 'guide_rating')
    .row()
    .text('ℹ️ О сайте', 'guide_site')
    .row()
    .text(`${unicodeIcons.back} Назад`, 'main_menu');
}

export function getNavigationButtons(backCallback: string, homeCallback: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(`${unicodeIcons.back} Назад`, backCallback)
    .text(`${unicodeIcons.home} На главную`, homeCallback);
}

export function getCategoriesMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text(`${unicodeIcons.ratings} По очкам`, 'rating_score')
    .text(`${unicodeIcons.ratings} По местам`, 'rating_placement')
    .row()
    .text(`${unicodeIcons.back} Назад`, 'main_menu')
    .text(`${unicodeIcons.home} На главную`, 'main_menu');
}

export function getYearsMenu(category: string, includeAllYears: boolean = true): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  // Add "All years" option first (only for competition ratings)
  if (!category.startsWith('rating_shows') && includeAllYears) {
    const discipline = category.replace('rating_', '').replace('_score', '').replace('_placement', '');
    const actualCategory = category.includes('_score') ? 'score' : 'placement';
    keyboard.text('Все года', `rating_${discipline}_${actualCategory}_all`);
  }

  // Generate list of years from current year back to 2015
  for (let year = currentYear; year >= 2015; year--) {
    years.push(year.toString());
  }

  years.forEach((year, index) => {
    if (index % 3 === 0 && index > 0) {
      keyboard.row();
    }
    if (category.startsWith('rating_shows')) {
      keyboard.text(year, `rating_shows_${year}`);
    } else {
      keyboard.text(year, `${category}_${year}_0`);
    }
  });

  keyboard.row();
  keyboard.text(`${unicodeIcons.back} Назад`, 'ratings');
  keyboard.text(`${unicodeIcons.home} На главную`, 'main_menu');
  return keyboard;
}

export function getDogSelectionKeyboard(dogs: Dog[], mode: 'search' | 'compare' = 'search'): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  
  dogs.forEach((dog, index) => {
    const callback = mode === 'compare' ? `compare_select_${dog.id}` : `dog:${dog.id}`;
    keyboard.text(`${index + 1}`, callback);
    
    // 3 buttons per row
    if ((index + 1) % 3 === 0) {
      keyboard.row();
    }
  });
  
  keyboard.row().text(`${unicodeIcons.cancel} Отмена`, 'cancel_search');
  return keyboard;
}

export function getDoninoMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text('Курсинг', 'donino_speed')
    .text('Рейсинг 350м', 'donino_coursing')
    .row()
    .text('← Назад', 'main_menu')
    .text('🏠 На главную', 'main_menu');
}

export function getDoninoKeyboard(currentType: 'speed' | 'coursing'): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (currentType === 'speed') {
    keyboard.text('Рейсинг 350м', 'donino_coursing');
  } else {
    keyboard.text('Курсинг', 'donino_speed');
  }

  keyboard
    .row()
    .url('Открыть Курсинг Донино', 'https://runningdog.ru/')
    .row()
    .url('Открыть на сайте', 'https://coursing-stats.ru/speed-records')
    .row()
    .text('← Назад', 'main_menu')
    .text('🏠 На главную', 'main_menu');

  return keyboard;
}

export function getJudgesMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text('Судьи соревнований', 'judges_competition')
    .text('Судьи выставок', 'judges_show')
    .row()
    .text('← Назад', 'main_menu')
    .text('🏠 На главную', 'main_menu');
}

export function getJudgesKeyboard(currentType: 'competition' | 'shows'): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  // Toggle between competition and shows judges
  if (currentType === 'competition') {
    keyboard.text('Судьи выставок', 'judges_show');
  } else {
    keyboard.text('Судьи соревнований', 'judges_competition');
  }

  keyboard.row();
  if (currentType === 'competition') {
    keyboard.url('🌐 На сайте', 'https://coursing-stats.ru/competitions?tab=judges');
  } else {
    keyboard.url('🌐 На сайте', 'https://coursing-stats.ru/shows?tab=judges');
  }

  keyboard.row();
  keyboard.text('← Назад', 'main_menu');
  keyboard.text('🏠 На главную', 'main_menu');

  return keyboard;
}

export function getRatingKeyboard(discipline: string, category: string, year: string, offset: string | number = 0): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  // Discipline switcher (coursing/racing/shows)
  if (discipline === 'coursing') {
    keyboard.text('Бега борзых', 'rating_racing');
    keyboard.text('Выставки', 'rating_shows');
  } else if (discipline === 'racing') {
    keyboard.text('Курсинг', 'rating_coursing');
    keyboard.text('Выставки', 'rating_shows');
  } else if (discipline === 'shows') {
    keyboard.text('Курсинг', 'rating_coursing');
    keyboard.text('Бега борзых', 'rating_racing');
  }

  keyboard.row();

  // Category toggle (score/placement) - only for coursing (racing = speed index)
  if (discipline === 'coursing' && year !== 'all') {
    const otherCategory = category === 'score' ? 'placement' : 'score';
    const categoryLabel = category === 'score' ? 'По медалям' : 'По очкам';
    keyboard.text(categoryLabel, `rating_${discipline}_${otherCategory}_${year}`);
    keyboard.text('Другой год', `rating_${discipline}_${category}_years`);
  } else if (discipline === 'coursing' && year === 'all') {
    keyboard.text('Другой год', `rating_${discipline}_${category}_years`);
  } else if (discipline === 'racing') {
    keyboard.text('Другой год', `rating_racing_placement_years`);
  } else {
    // For shows, only year selector
    keyboard.text('Другой год', `rating_shows_years`);
  }

  keyboard.row();

  // Pagination — only coursing/racing (shows: top-10 fixed, no handler)
  if (discipline !== 'shows') {
    if (offset === 0) {
      keyboard.text('Ещё 5', `rating_${discipline}_${category}_${year}_5`);
    } else {
      keyboard.text('Назад', `rating_${discipline}_${category}_${year}_0`);
    }
    keyboard.row();
  }

  if (discipline === 'shows') {
    keyboard.url('🌐 На сайте', 'https://coursing-stats.ru/shows?tab=ranking');
  } else if (discipline === 'racing') {
    keyboard.url('🌐 На сайте', 'https://coursing-stats.ru/competitions?tab=ranking');
  } else {
    keyboard.url('🌐 На сайте', 'https://coursing-stats.ru/competitions?tab=ranking');
  }

  keyboard.row();
  keyboard.text('← Назад', 'main_menu');
  keyboard.text('🏠 На главную', 'main_menu');

  return keyboard;
}

export function getCalendarKeyboard(offset: string | number = 0, isShows: boolean = false, currentFilter: string = 'all'): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  // Toggle between competitions and shows calendar
  // Remove this toggle when in competitions sub-menu to avoid confusion
  if (isShows) {
    keyboard.text('Календарь соревнований', 'calendar');
  }
  // Don't show "Календарь выставок" when in competitions (isShows = false)

  // Show filters inline for competitions only
  if (!isShows) {
    keyboard.row();
    
    // Filter buttons with active indicator (✅ or ⬜)
    const allLabel = currentFilter === 'all' ? '✅ Все' : 'Все';
    const coursingLabel = currentFilter === 'coursing' ? '✅ Курсинг' : 'Курсинг';
    const racingLabel = currentFilter === 'racing' ? '✅ Бега борзых' : 'Бега борзых';
    
    keyboard.text(allLabel, 'filter_all');
    keyboard.text(coursingLabel, 'filter_coursing');
    keyboard.text(racingLabel, 'filter_racing');
    keyboard.row();
  } else {
    keyboard.row();
  }

  // Pagination button
  if (offset === 0) {
    keyboard.text('Ещё 10', isShows ? `shows_calendar_10` : `calendar_10`);
  } else {
    keyboard.text('Назад', isShows ? `shows_calendar_0` : `calendar_0`);
  }

  keyboard.row();
  if (isShows) {
    keyboard.url('🌐 На сайте', 'https://coursing-stats.ru/shows?tab=calendar');
  } else {
    keyboard.url('🌐 На сайте', 'https://coursing-stats.ru/competitions?tab=calendar');
  }

  keyboard.row();
  keyboard.text('← Назад', isShows ? 'shows_menu' : 'competitions_menu');
  keyboard.text('🏠 На главную', 'main_menu');

  return keyboard;
}

/** Список избранного: номер → dog:{id} */
export function getFavoritesKeyboard(
  dogs: Array<{ id: number; name_lat?: string; name_ru?: string }>
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  dogs.forEach((dog, index) => {
    const label = `${index + 1}`;
    keyboard.text(label, `dog:${dog.id}`);
    if ((index + 1) % 5 === 0) {
      keyboard.row();
    }
  });

  if (dogs.length % 5 !== 0) {
    keyboard.row();
  }
  keyboard.text(`${unicodeIcons.back} Назад`, 'main_menu');
  keyboard.text(`${unicodeIcons.home} На главную`, 'main_menu');
  return keyboard;
}

export function getDogCardKeyboard(
  dogId: string,
  backCallback: string = 'main_menu',
  options: { isFavorite?: boolean } = {},
): InlineKeyboard {
  const favoriteButton = options.isFavorite
    ? { text: '⭐ В избранном', callback: `remove_favorite:${dogId}` }
    : { text: 'В избранное', callback: `add_favorite:${dogId}` };

  return new InlineKeyboard()
    .text(favoriteButton.text, favoriteButton.callback)
    .url('Профиль на сайте', `https://coursing-stats.ru/dog/${dogId}`)
    .row()
    .text('Сравнить с другой', `compare_start_${dogId}`)
    .row()
    .text('← Назад', backCallback)
    .text('🏠 На главную', 'main_menu');
}

/** Клавиатура для inline-карточки: без «Назад/Главную» (сообщение уходит в чужой чат). */
export function getInlineDogCardKeyboard(
  dogId: string,
  options: { isFavorite?: boolean } = {},
): InlineKeyboard {
  const favoriteButton = options.isFavorite
    ? { text: '⭐ В избранном', callback: `remove_favorite:${dogId}` }
    : { text: 'В избранное', callback: `add_favorite:${dogId}` };

  return new InlineKeyboard()
    .text(favoriteButton.text, favoriteButton.callback)
    .url('Профиль на сайте', `https://coursing-stats.ru/dog/${dogId}`);
}

export function getCompareKeyboard(firstDogId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('Отмена сравнения', 'compare_cancel')
    .row()
    .text('← Назад', 'main_menu')
    .text('🏠 На главную', 'main_menu');
}
