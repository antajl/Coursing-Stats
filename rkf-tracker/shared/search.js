// Search and Filter Utilities for RKF Competition Calendars

export function filterCalendarEvents(events = [], filters = {}) {
  const {
    query = '',
    discipline = 'all',
    status = 'all',
    city = 'all'
  } = filters;

  const q = (query || '').toLowerCase().trim();

  return events.filter(ev => {
    // Discipline filter
    if (discipline !== 'all' && ev.discipline !== discipline && ev.sheetName !== discipline) {
      return false;
    }

    // Status filter
    if (status !== 'all' && ev.status !== status) {
      return false;
    }

    // City / Location filter
    if (city !== 'all' && !(ev.location || '').toLowerCase().includes(city.toLowerCase())) {
      return false;
    }

    // Fulltext query match
    if (q) {
      const matchText = (
        (ev.club || '') + ' ' +
        (ev.location || '') + ' ' +
        (ev.discipline || '') + ' ' +
        (ev.rank || '') + ' ' +
        (ev.calendarCode || '') + ' ' +
        (ev.judges || '')
      ).toLowerCase();

      if (!matchText.includes(q)) return false;
    }

    return true;
  });
}

export function extractFilterFacets(events = []) {
  const disciplines = new Set();
  const cities = new Set();
  const statuses = new Set();

  for (const ev of events) {
    if (ev.discipline) disciplines.add(ev.discipline);
    if (ev.status) statuses.add(ev.status);
    if (ev.location) {
      // Split location into primary city
      const primaryCity = ev.location.split(/[,(/]/)[0].trim();
      if (primaryCity && primaryCity.length > 2) {
        cities.add(primaryCity);
      }
    }
  }

  return {
    disciplines: Array.from(disciplines).sort((a, b) => a.localeCompare(b, 'ru')),
    cities: Array.from(cities).sort((a, b) => a.localeCompare(b, 'ru')),
    statuses: Array.from(statuses)
  };
}
