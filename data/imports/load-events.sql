
INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2015,
  '2015-03-14',
  '2015-03-15',
  'Национальные сертификатные состязания по курсингу ранга CACL "Мартовский Заяц - 2015"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская область, деревня Левково',
  NULL,
  'http://procoursing.ru/results/2015-03-14/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2015,
  '2015-08-08',
  '2015-08-09',
  'Национальные сертификатные состязания по курсингу ранга CACL "Заяц на Ярославке - 2015"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская область, Сергиево-Посадский р-н',
  NULL,
  'http://procoursing.ru/results/2015-08-08/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2015,
  '2015-08-08',
  '2015-08-09',
  'Дружественные забеги',
  'coursing',
  '',
  '',
  'Дружественные забеги',
  '',
  'Московская область, Сергиево-Посадский р-н',
  NULL,
  'http://procoursing.ru/results/2015-08-08_F/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2016,
  '2016-02-27',
  '2016-02-28',
  'Национальные сертификатные состязания по курсингу ранга CACL "Мартовский Заяц - 2016"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская область, Сергиево-Посадский р-н',
  NULL,
  'http://procoursing.ru/results/2016-02-27/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2016,
  '2016-08-06',
  '2016-08-07',
  'Региональные состязания по курсингу ранга CACL "Заяц на Ярославке - 2016"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская область, Пушкинский р-н, д. Михайловское',
  NULL,
  'http://procoursing.ru/results/2016-08-06/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2016,
  '2016-08-06',
  '2016-08-07',
  'Дружественные забеги',
  'coursing',
  '',
  '',
  'Дружественные забеги',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2016-08-06_F/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2017,
  '2017-02-25',
  '2017-02-26',
  'Чемпионат РКФ по курсингу "Мартовский Заяц - 2017"',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу "Мартовский Заяц - 2017"',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2017-02-25/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2017,
  '2017-05-21',
  NULL,
  'Командное состязание "Тройка, птица тройка - 2017"',
  'other',
  '',
  'Командное состязание "Тройка, птица тройка - 2017"',
  'Командное состязание "Тройка, птица тройка - 2017"',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2017-05-21/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2017,
  '2017-08-13',
  NULL,
  'Региональные состязания по бегам борзых ранга CACL (рейсинг)',
  'coursing',
  'CACL',
  '',
  'Региональные состязания по бегам борзых ранга CACL (рейсинг)',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2017-08-13/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2017,
  '2017-09-17',
  NULL,
  'Чемпионат России по курсингу - 2017',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Чемпионат России (Курсинг борзых)',
  '',
  'Московская область, Новый Милет',
  NULL,
  'http://procoursing.ru/results/2017-09-17_P/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2017,
  '2017-10-29',
  NULL,
  'Тройка, птица осенняя - 2017',
  'other',
  '',
  'Тройка, птица осенняя - 2017',
  'Тройка, птица осенняя - 2017',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2017-10-29/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2018,
  '2018-03-09',
  '2018-03-10',
  'Чемпионат РКФ по курсингу "Мартовский Заяц - 2018"',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу "Мартовский Заяц - 2018"',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2018-03-09/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2018,
  '2018-06-03',
  NULL,
  'Командное состязание "Тройка, птица весенняя - 2018"',
  'other',
  '',
  'Командное состязание "Тройка, птица весенняя - 2018"',
  'Командное состязание "Тройка, птица весенняя - 2018"',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2018-06-03/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2018,
  '2018-06-11',
  NULL,
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  'coursing',
  'Чемпионат России',
  '',
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  '',
  'Московская область, Новый Милет',
  NULL,
  'http://procoursing.ru/results/2018-06-11_P/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2018,
  '2018-08-12',
  NULL,
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'coursing',
  '',
  '',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2018-08-12/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2018,
  '2018-08-25',
  '2018-08-26',
  'Международный чемпионат по курсингу ранга CACIL &amp; Чемпионат РКФ по курсингу',
  'coursing',
  'CAC',
  'Курсинг борзых',
  'CAC (Курсинг борзых)',
  '',
  'Московская область, Ленинский район, деревня Суханово',
  NULL,
  'http://procoursing.ru/results/2018-08-26/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2018,
  '2018-09-15',
  NULL,
  'Чемпионат РКФ по бегам борзых за механическим зайцем (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по бегам борзых за механическим зайцем (курсинг)',
  '',
  'Московская область, Новый Милет',
  NULL,
  'http://procoursing.ru/results/2018-09-15/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2018,
  '2018-09-30',
  NULL,
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2018"',
  'coursing',
  '',
  '',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2018"',
  '',
  'Московская область, Новый Милет',
  NULL,
  'http://procoursing.ru/results/2018-09-30_C/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2018,
  '2018-10-21',
  NULL,
  'Командное состязание "Тройка, птица осенняя - 2018"',
  'other',
  '',
  'Командное состязание "Тройка, птица осенняя - 2018"',
  'Командное состязание "Тройка, птица осенняя - 2018"',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2018-10-21/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-03-02',
  '2019-03-03',
  'Чемпионат РКФ по курсингу "Мартовский заяц - 2019"',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу "Мартовский заяц - 2019"',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2019-03-02/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-04-14',
  NULL,
  'Командное состязание "Тройка, птица весенняя - 2019"',
  'other',
  '',
  'Командное состязание "Тройка, птица весенняя - 2019"',
  'Командное состязание "Тройка, птица весенняя - 2019"',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2019-04-14/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-04-27',
  '2019-04-28',
  'Международный чемпионат по курсингу ранга CACIL &amp; Чемпионат России по курсингу',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Чемпионат России (Курсинг борзых)',
  '',
  'Московская область, Ленинский район, деревня Суханово',
  NULL,
  'http://procoursing.ru/results/2019-04-27/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-06-15',
  NULL,
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'coursing',
  '',
  '',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  '',
  'Московская область, Новый Милет',
  NULL,
  'http://procoursing.ru/results/2019-06-15/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-08-11',
  NULL,
  'Тестовое состязание по рейсингу',
  'coursing',
  '',
  '',
  'Тестовое состязание по рейсингу',
  '',
  'Московская область, город Раменское',
  NULL,
  'http://procoursing.ru/results/2019-08-11/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-08-24',
  '2019-08-25',
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу',
  '',
  'Московская область, деревня Суханово',
  NULL,
  'http://procoursing.ru/results/2019-08-24/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-09-01',
  NULL,
  'Кубок России по бегам борзых (рейсинг)',
  'coursing',
  'Кубок России',
  '',
  'Кубок России по бегам борзых (рейсинг)',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2019-09-01/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-09-08',
  NULL,
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2019"',
  'coursing',
  '',
  '',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2019"',
  '',
  'Московская область, Новый Милет',
  NULL,
  'http://procoursing.ru/results/2019-09-08_C/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-09-15',
  NULL,
  'Кубок России по бегам борзых (курсинг)',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Кубок России (Курсинг борзых)',
  '',
  'Московская область, Новый Милет',
  NULL,
  'http://procoursing.ru/results/2019-09-15/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-09-22',
  NULL,
  'Национальные состязания по бегам борзых за механическим зайцем ранга CACL (рейсинг)',
  'coursing',
  'CACL',
  '',
  'Национальные состязания по бегам борзых за механическим зайцем ранга CACL (рейсинг)',
  '',
  'Московская область, город Раменское',
  NULL,
  'http://procoursing.ru/results/2019-09-22/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-10-05',
  '2019-10-06',
  'Международные состязания по курсингу ранга CACIL &amp; Национальные состязания по курсингу ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская область, город Красноармейск, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2019-10-05_CACL/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2019,
  '2019-11-10',
  NULL,
  'Командное состязание "Тройка, птица осенняя - 2019"',
  'other',
  '',
  'Командное состязание "Тройка, птица осенняя - 2019"',
  'Командное состязание "Тройка, птица осенняя - 2019"',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2019-11-10/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2020,
  '2020-08-15',
  '2020-08-16',
  'Бега за механической приманкой (курсинг)',
  'coursing',
  '',
  'БЗМП',
  'Бега за механической приманкой (курсинг)',
  '',
  'Ярославль, АТЦ "Левково"',
  NULL,
  'http://procoursing.ru/results/2020-08-15_B_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2020,
  '2020-08-15',
  '2020-08-16',
  'Чемпионат РКФ по бегам борзых (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по бегам борзых (курсинг)',
  '',
  'Ярославль, АТЦ "Левково"',
  NULL,
  'http://procoursing.ru/results/2020-08-15_C_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2020,
  '2020-08-22',
  '2020-08-23',
  'Международный чемпионат по курсингу ранга CACIL &amp; Чемпионат РКФ по курсингу',
  'coursing',
  'CAC',
  'Курсинг борзых',
  'CAC (Курсинг борзых)',
  '',
  'Московская область, деревня Суханово',
  NULL,
  'http://procoursing.ru/results/2020-08-22_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2020,
  '2020-09-12',
  NULL,
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  'coursing',
  'Чемпионат России',
  '',
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  '',
  'Московская область, Новый Милет',
  'http://procoursing.ru/results/2020-09-12/Catalog_2020-09-12_Racing_ChRussia.pdf',
  'http://procoursing.ru/results/2020-09-12_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2020,
  '2020-09-20',
  NULL,
  'Кубок России по бегам борзых за механическим зайцем (рейсинг)',
  'coursing',
  'Кубок России',
  '',
  'Кубок России по бегам борзых за механическим зайцем (рейсинг)',
  '',
  'Московская область, город Раменское',
  NULL,
  'http://procoursing.ru/results/2020-09-20_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2020,
  '2020-10-03',
  '2020-10-04',
  'Международный чемпионат по курсингу ранга CACIL &amp; Чемпионат России по курсингу',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Чемпионат России (Курсинг борзых)',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2020-10-03/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-04-17',
  '2021-04-18',
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2021-04-17_C_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-04-18',
  NULL,
  'Чемпионат России по бегам за механической приманкой (курсинг)',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Чемпионат России (Курсинг борзых)',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2021-04-18_B_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-04-24',
  NULL,
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу',
  '',
  'Ярославль, АТЦ "Левково"',
  NULL,
  'http://procoursing.ru/results/2021-04-24_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-05-02',
  NULL,
  'Чемпионат РКФ по курсингу борзых',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу борзых',
  '',
  'Московская область, деревня Суханово',
  NULL,
  'http://procoursing.ru/results/2021-05-02/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-05-22',
  '2021-05-23',
  'Чемпионат РКФ по курсингу борзых "Зигзаг удачи в лютиках - 2021"',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу борзых "Зигзаг удачи в лютиках - 2021"',
  '',
  'Калужская область, б/о Головинка',
  NULL,
  'http://procoursing.ru/results/2021-05-22_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-06-13',
  NULL,
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  'coursing',
  'Чемпионат России',
  '',
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  '',
  'Московская область, Новый Милет',
  'http://procoursing.ru/results/2021-06-13/Catalog_2021-06-13.pdf',
  'http://procoursing.ru/results/2021-06-13_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-06-19',
  NULL,
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'coursing',
  '',
  '',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  '',
  'Московская область, город Раменское',
  NULL,
  'http://procoursing.ru/results/2021-06-19_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-08-07',
  NULL,
  'Чемпионат РКФ по бегам борзых за механическим зайцем (рейсинг)',
  'coursing',
  '',
  '',
  'Чемпионат РКФ по бегам борзых за механическим зайцем (рейсинг)',
  '',
  'Ярославская область, город Любим',
  NULL,
  'http://procoursing.ru/results/2021-08-07_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-08-21',
  '2021-08-22',
  'Международные состязания по курсингу ранга CACIL &amp; Чемпионат РКФ по курсингу',
  'coursing',
  'CAC',
  'Курсинг борзых',
  'CAC (Курсинг борзых)',
  '',
  'Московская область, деревня Суханово',
  NULL,
  'http://procoursing.ru/results/2021-08-21_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-09-04',
  NULL,
  'Национальные состязания по курсингу ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Калужская область, б/о Головинка',
  NULL,
  'http://procoursing.ru/results/2021-09-04_C/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-09-04',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  '',
  'Калужская область, б/о Головинка',
  NULL,
  'http://procoursing.ru/results/2021-09-04_B/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-09-18',
  NULL,
  'Кубок России по курсингу борзых',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Кубок России (Курсинг борзых)',
  '',
  'Московская область, Новый Милет',
  'http://procoursing.ru/results/2021-09-18/Catalog_2021-09-18_Coursing_Cup_Russia.pdf',
  'http://procoursing.ru/results/2021-09-18/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-09-19',
  NULL,
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2021"',
  'coursing',
  '',
  '',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2021"',
  '',
  'Московская область, Новый Милет',
  NULL,
  'http://procoursing.ru/results/2021-09-19_C/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-10-02',
  '2021-10-03',
  'Международные состязания по курсингу ранга CACIL &amp; Национальные состязания по курсингу ранга CACL "Зайчик-листопадничек - 2021"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2021-10-02_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-10-10',
  NULL,
  'Международные состязания по бегам борзых ранга CACIL &amp; Чемпионат РКФ по бегам борзых (рейсинг)',
  'coursing',
  'CAC',
  '',
  'Международные состязания по бегам борзых ранга CACIL &amp; Чемпионат РКФ по бегам борзых (рейсинг)',
  '',
  'Московская область, город Раменское',
  NULL,
  'http://procoursing.ru/results/2021-10-10_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2021,
  '2021-10-24',
  NULL,
  'Командное состязание "Тройка, просто птица - 2021"',
  'other',
  '',
  'Командное состязание "Тройка, просто птица - 2021"',
  'Командное состязание "Тройка, просто птица - 2021"',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2021-10-24/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-04-16',
  '2022-04-17',
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2022-04-16_C/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-04-17',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2022-04-17_B/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-05-02',
  '2022-05-03',
  'Чемпионат России по курсингу борзых',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Чемпионат России (Курсинг борзых)',
  '',
  'Московская область, деревня Суханово',
  NULL,
  'http://procoursing.ru/results/2022-05-02/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-05-14',
  NULL,
  'Чемпионат РКФ по курсингу борзых',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу борзых',
  '',
  'Ярославская область, село Великое',
  NULL,
  'http://procoursing.ru/results/2022-05-14_C_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-05-14',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  '',
  'Ярославская область, село Великое',
  NULL,
  'http://procoursing.ru/results/2022-05-14_B_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-05-28',
  '2022-05-29',
  'Чемпионат РКФ по курсингу борзых',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу борзых',
  '',
  'Калужская область, б/о Головинка',
  NULL,
  'http://procoursing.ru/results/2022-05-28_C_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-05-28',
  '2022-05-29',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  '',
  'Калужская область, б/о Головинка',
  NULL,
  'http://procoursing.ru/results/2022-05-28_B_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-06-12',
  NULL,
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'coursing',
  '',
  '',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  '',
  'Московская область, деревня Михайловское',
  'http://procoursing.ru/results/2022-06-12/Catalog_2022-06-12.pdf',
  'http://procoursing.ru/results/2022-06-12_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-07-31',
  NULL,
  'Кубок котейки Глюка (замеры скорости)',
  'coursing',
  'Кубок',
  '',
  'Кубок котейки Глюка (замеры скорости)',
  '',
  'Московская область, деревня Михайловское',
  NULL,
  'http://procoursing.ru/results/2022-07-31/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-08-20',
  '2022-08-21',
  'Чемпионат РКФ по курсингу борзых "Забавы борзых - 2022"',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу борзых "Забавы борзых - 2022"',
  '',
  'Московская область, деревня Суханово',
  NULL,
  'http://procoursing.ru/results/2022-08-20_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-09-03',
  '2022-09-04',
  'Чемпионат РКФ по курсингу "Осенний зигзаг удачи - 2022"',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу "Осенний зигзаг удачи - 2022"',
  '',
  'Калужская область, б/о Головинка',
  'http://procoursing.ru/results/2022-09-03_K_C/Catalog_Coursing_K_2022-09-03.pdf',
  'http://procoursing.ru/results/2022-09-03_K_C_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-09-03',
  NULL,
  'Кубок России по бегам за механической приманкой "Осенний зигзаг удачи - 2022"',
  'coursing',
  'Кубок России',
  '',
  'Кубок России по бегам за механической приманкой "Осенний зигзаг удачи - 2022"',
  '',
  'Калужская область, б/о Головинка',
  'http://procoursing.ru/results/2022-09-03_K_B/Catalog_Bega_K_2022-09-03.pdf',
  'http://procoursing.ru/results/2022-09-03_K_B_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-09-03',
  NULL,
  'Кубок России по рейсингу (бегам борзых) "Вологодские кружева - 2022"',
  'coursing',
  'Кубок России',
  '',
  'Кубок России по рейсингу (бегам борзых) "Вологодские кружева - 2022"',
  '',
  'Вологодская область, г. Вологда',
  'http://procoursing.ru/results/2022-09-03_V_R/Catalog_Regl_Racing_V_2022-09-03.pdf',
  'http://procoursing.ru/results/2022-09-03_V_R_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-09-04',
  NULL,
  'Чемпионат РКФ по курсингу борзых "Вологодские кружева - 2022"',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу борзых "Вологодские кружева - 2022"',
  '',
  'Вологодская область, г. Вологда',
  'http://procoursing.ru/results/2022-09-04_V_C/Catalog_Regl_Coursing_V_2022-09-04.pdf',
  'http://procoursing.ru/results/2022-09-04_V_C_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-09-11',
  NULL,
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу',
  '',
  'Свердловская область, Большое Седельниково',
  NULL,
  'http://procoursing.ru/results/2022-09-11_C/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-09-11',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'coursing',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Свердловская область, Большое Седельниково',
  NULL,
  'http://procoursing.ru/results/2022-09-11_B/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-09-18',
  NULL,
  'Чемпионат РКФ - CACL по бегам борзых за механическим зайцем (круг)',
  'coursing',
  'CACL',
  '',
  'Чемпионат РКФ - CACL по бегам борзых за механическим зайцем (круг)',
  '',
  'Московская область, г. Раменское',
  'http://procoursing.ru/results/2022-09-18/Catalog_2022-09-18.pdf',
  'http://procoursing.ru/results/2022-09-18_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-09-24',
  NULL,
  'Кубок России по курсингу',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Кубок России (Курсинг борзых)',
  '',
  'Санкт-Петербург',
  'http://procoursing.ru/results/2022-09-24/Catalog_2022-09-24.pdf',
  'http://procoursing.ru/results/2022-09-24_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-10-02',
  NULL,
  'Чемпионат РКФ - CACL по курсингу "Зайчик-листопадничек - 2022"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская область, деревня Михайловское',
  'http://procoursing.ru/results/2022-10-02/Catalog_2022-10-01.pdf',
  'http://procoursing.ru/results/2022-10-02_R/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-10-08',
  NULL,
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по курсингу',
  '',
  'Ярославская область',
  'http://procoursing.ru/Catalog_2022-10-08_C.pdf',
  'http://procoursing.ru/Complete_Results_2022-10-08_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-10-08',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  '',
  'Ярославская область',
  'http://procoursing.ru/results/2022-10-08_B/Catalog_2022-10-08_B.pdf',
  'http://procoursing.ru/results/2022-10-08_B/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2022,
  '2022-11-06',
  NULL,
  'Состязание свор "Тройка - 2022"',
  'other',
  '',
  'Состязание свор "Тройка - 2022"',
  'Состязание свор "Тройка - 2022"',
  '',
  'Московская область, деревня Михайловское',
  'http://procoursing.ru/Catalog_2022-11-06.pdf',
  'http://procoursing.ru/Complete_Results_2022-11-06.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-04-15',
  '2023-04-16',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская область, деревня Михайловское',
  'http://procoursing.ru/Catalog_2023-04-15_C.pdf',
  'http://procoursing.ru/Complete_Results_2023-04-15_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-04-15',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Московская область, деревня Михайловское',
  'http://procoursing.ru/Catalog_2023-04-15_B.pdf',
  'http://procoursing.ru/Complete_Results_2023-04-15_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-04-22',
  NULL,
  'Национальные монопородные состязания',
  'unknown',
  '',
  '',
  'Национальные монопородные состязания',
  '',
  'Московская область, Балашихинский район',
  'http://procoursing.ru/Catalog_2023-04-22.pdf',
  'http://procoursing.ru/Complete_Results_2023-04-22.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-05-01',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Московская область, г. Видное, д. Суханово',
  'http://procoursing.ru/Catalog_2023-05-01_B.pdf',
  'http://procoursing.ru/Complete_Results_2023-05-01_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-05-27',
  '2023-05-28',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Калужская область, база отдыха Головинка',
  'http://procoursing.ru/Catalog_2023-05-27_C.pdf',
  'http://procoursing.ru/Complete_Results_2023-05-27_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-05-27',
  '2023-05-28',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Калужская область, база отдыха Головинка',
  'http://procoursing.ru/Catalog_2023-05-27_B.pdf',
  'http://procoursing.ru/Complete_Results_2023-05-27_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-06-10',
  NULL,
  'Чемпионат РКФ - CACL по бегам борзых',
  'unknown',
  'CACL',
  '',
  'Чемпионат РКФ - CACL по бегам борзых',
  '',
  'Московская область, деревня Михайловское',
  'http://procoursing.ru/Catalog_2023-06-10.pdf',
  'http://procoursing.ru/Complete_Results_2023-06-10.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-07-01',
  NULL,
  'Чемпионат РКФ Br по курсингу в породе Уиппет',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионат РКФ Br по курсингу в породе Уиппет',
  '',
  'Московская область, г. Видное, д. Суханово',
  NULL,
  'http://procoursing.ru/Complete_Results_2023-07-01.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-07-08',
  NULL,
  'Чемпионаты РКФ Br по курсингу в породах Салюки, Родезийский риджбек, Басенджи',
  'coursing',
  '',
  'Курсинг борзых',
  'Чемпионаты РКФ Br по курсингу в породах Салюки, Родезийский риджбек, Басенджи',
  '',
  'Московская область, г. Видное, д. Суханово',
  NULL,
  'http://procoursing.ru/Complete_Results_2023-07-08.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-07-16',
  NULL,
  'Кубок котейки Глюка (замеры скорости)',
  'unknown',
  'Кубок',
  '',
  'Кубок котейки Глюка (замеры скорости)',
  '',
  'Московская область, д. Михайловское',
  NULL,
  'http://procoursing.ru/Complete_Results_2023-07-16.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-08-05',
  NULL,
  'Чемпионат РКФ - CACL по бегам борзых',
  'unknown',
  'CACL',
  '',
  'Чемпионат РКФ - CACL по бегам борзых',
  '',
  'Московская область, Новый Милет',
  'http://procoursing.ru/Catalog_2023-08-05.pdf',
  'http://procoursing.ru/Complete_Results_2023-08-05.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-08-19',
  NULL,
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская обл., г. Видное, д. Суханово',
  'http://procoursing.ru/Catalog_2023-08-19.pdf',
  'http://procoursing.ru/Complete_Results_2023-08-19.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-09-02',
  NULL,
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Калужская обл., б/о Головинка',
  'http://procoursing.ru/Catalog_2023-09-02_K.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-02_K.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-09-02',
  NULL,
  'Чемпионат России по бегам борзых (рейсингу)',
  'racing',
  'Чемпионат России',
  '',
  'Чемпионат России по бегам борзых (рейсингу)',
  '',
  'Вологодская обл.',
  'http://procoursing.ru/Catalog_2023-09-02_V.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-02_V_R.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-09-03',
  NULL,
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Вологодская обл.',
  'http://procoursing.ru/Catalog_2023-09-03_V.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-03_V_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-09-17',
  NULL,
  'Кубок России по бегам за механической приманкой',
  'bzmp',
  'Кубок России',
  '',
  'Кубок России по бегам за механической приманкой',
  '',
  'Московская обл., Ленинский р-н, д. Суханово',
  'http://procoursing.ru/Catalog_2023-09-17.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-17.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-09-23',
  NULL,
  'Кубок России - CACL по бегам борзых за механическим зайцем (круг)',
  'unknown',
  'CACL',
  '',
  'Кубок России - CACL по бегам борзых за механическим зайцем (круг)',
  '',
  'Московская обл., Раменский р-н, д. Донино',
  'http://procoursing.ru/Catalog_2023-09-23.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-23.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-09-24',
  NULL,
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2023"',
  'racing',
  '',
  '',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2023"',
  '',
  'Московская область, Купавна',
  NULL,
  'http://procoursing.ru/Complete_Results_2023-09-24_R.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-10-07',
  '2023-10-08',
  'Кубок России по курсингу',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Кубок России (Курсинг борзых)',
  '',
  'Московская обл., д. Михайловское',
  'http://procoursing.ru/Catalog_2023-10-07.pdf',
  'http://procoursing.ru/Complete_Results_2023-10-07.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-10-22',
  NULL,
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Г. Ставрополь',
  'http://procoursing.ru/Catalog_2023-10-22_C.pdf',
  'http://procoursing.ru/Complete_Results_2023-10-22_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-10-22',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Г. Ставрополь',
  'http://procoursing.ru/Catalog_2023-10-22_B.pdf',
  'http://procoursing.ru/Complete_Results_2023-10-22_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2023,
  '2023-11-11',
  NULL,
  'Состязание свор "Тройка - 2023"',
  'other',
  '',
  'Состязание свор "Тройка - 2023"',
  'Состязание свор "Тройка - 2023"',
  '',
  'Московская область, деревня Михайловское',
  'http://procoursing.ru/Catalog_2023-11-11.pdf',
  'http://procoursing.ru/Complete_Results_2023-11-11.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-04-07',
  NULL,
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Г. Ставрополь',
  'http://procoursing.ru/Catalog_2024-04-07_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-04-07_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-04-07',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Г. Ставрополь',
  'http://procoursing.ru/Catalog_2024-04-07_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-04-07_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-04-29',
  '2024-04-30',
  'Чемпионат России - CACL по курсингу борзых',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Чемпионат России (Курсинг борзых)',
  '',
  'Московская обл., г. Видное, д. Суханово',
  'http://procoursing.ru/Catalog_2024-04-29.pdf',
  'http://procoursing.ru/Complete_Results_2024-04-29.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-05-11',
  NULL,
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:

Басенджи
Фараонова собака
Чирнеко дель Этна
Родезийский риджбек
Русская псовая борзая
Салюки
Уиппет',
  'coursing',
  '',
  'Курсинг борзых',
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:',
  '',
  'Московская обл., д. Михайловское',
  'http://procoursing.ru/Catalog_2024-05-11_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-05-11_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-05-11',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Московская обл., д. Михайловское',
  'http://procoursing.ru/Catalog_2024-05-11_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-05-11_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-05-25',
  '2024-05-26',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'http://procoursing.ru/Catalog_2024-05-25_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-05-25_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-05-26',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'http://procoursing.ru/Catalog_2024-05-26_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-05-26_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-06-09',
  NULL,
  'Монопородные чемпионаты РКФ по бегам борзых в породах:

Басенджи
Родезийский риджбек
Уиппет',
  'unknown',
  '',
  '',
  'Монопородные чемпионаты РКФ по бегам борзых в породах:',
  '',
  'Московская обл., д. Михайловское',
  NULL,
  'http://procoursing.ru/Complete_Results_2024-06-09.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-06-15',
  NULL,
  'Чемпионат РКФ - CACL по бегам борзых за механическим зайцем (круг)',
  'unknown',
  'CACL',
  '',
  'Чемпионат РКФ - CACL по бегам борзых за механическим зайцем (круг)',
  '',
  'Московская обл., г. Раменское, д. Донино',
  'http://procoursing.ru/Catalog_2024-06-15.pdf',
  'http://procoursing.ru/Complete_Results_2024-06-15.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-06-16',
  NULL,
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская обл., г. Раменское, д. Донино',
  'http://procoursing.ru/Catalog_2024-06-16_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-06-16_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-06-16',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Московская обл., г. Раменское, д. Донино',
  'http://procoursing.ru/Catalog_2024-06-16_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-06-16_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-06-29',
  NULL,
  'Монородные чемпионаты РКФ по курсингу борзых в породах:

Басенджи
Родезийский риджбек
Салюки
Уиппет
Чирнеко дель Этна',
  'coursing',
  '',
  'Курсинг борзых',
  'Монородные чемпионаты РКФ по курсингу борзых в породах:',
  '',
  'Московская обл., г. Видное, д. Суханово',
  'http://procoursing.ru/Catalog_2024-06-29.pdf',
  'http://procoursing.ru/Complete_Results_2024-06-29.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-08-03',
  NULL,
  'Монородные чемпионаты РКФ по курсингу борзых в породах:

Басенджи
Родезийский риджбек
Уиппет',
  'coursing',
  '',
  'Курсинг борзых',
  'Монородные чемпионаты РКФ по курсингу борзых в породах:',
  '',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  NULL,
  'http://procoursing.ru/Complete_Results_2024-08-03.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-08-10',
  NULL,
  'Чемпионат РКФ - CACL по бегам борзых',
  'unknown',
  'CACL',
  '',
  'Чемпионат РКФ - CACL по бегам борзых',
  '',
  'Московская обл., Богородский округ, д. Колонтаево',
  'http://procoursing.ru/Catalog_2024-08-10.pdf',
  'http://procoursing.ru/Complete_Results_2024-08-10.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-08-24',
  NULL,
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская обл., г. Видное, д. Суханово',
  'http://procoursing.ru/Catalog_2024-08-24_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-08-24_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-08-24',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Московская обл., г. Видное, д. Суханово',
  'http://procoursing.ru/Catalog_2024-08-24_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-08-24_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-08-31',
  NULL,
  'Кубок России - CACL по бегам борзых',
  'racing',
  'CACL',
  '',
  'Кубок России - CACL по бегам борзых',
  '',
  'Вологодская обл., г. Вологда',
  'http://procoursing.ru/Catalog_2024-08-31_R.pdf',
  'http://procoursing.ru/Complete_Results_2024-08-31_R.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-09-01',
  NULL,
  'Кубок России - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Вологодская обл., г. Вологда',
  'http://procoursing.ru/Catalog_2024-09-01_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-01_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-09-08',
  NULL,
  'Чемпионат России - CACL по бегам борзых',
  'unknown',
  'Чемпионат России',
  '',
  'Чемпионат России - CACL по бегам борзых',
  '',
  'Московская обл., д. Михайловское',
  'http://procoursing.ru/Catalog_2024-09-08.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-08.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-09-14',
  NULL,
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'http://procoursing.ru/Catalog_2024-09-14.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-14.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-09-21',
  NULL,
  'Монопородные чемпионаты РКФ по бегам борзых в породах:

Басенджи
Малая итальянская борзая
Уиппет',
  'unknown',
  '',
  '',
  'Монопородные чемпионаты РКФ по бегам борзых в породах:',
  '',
  'Московская обл., Раменский городской округ, д. Донино',
  'http://procoursing.ru/Catalog_2024-09-21.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-21.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-09-22',
  NULL,
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Московская обл., Раменский городской округ, д. Донино',
  'http://procoursing.ru/Catalog_2024-09-22_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-22_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-09-22',
  NULL,
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Чемпионат РКФ по бегам за механической приманкой',
  '',
  'Московская обл., Раменский городской округ, д. Донино',
  'http://procoursing.ru/Catalog_2024-09-22_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-22_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-09-29',
  NULL,
  'Чемпионат России по бегам за механической приманкой',
  'bzmp',
  'Чемпионат России',
  '',
  'Чемпионат России по бегам за механической приманкой',
  '',
  'Московская обл., д. Михайловское',
  'http://procoursing.ru/Catalog_2024-09-29_BZMP.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-29_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-09-29',
  NULL,
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:

Басенджи
Родезийский риджбек
Русская псовая борзая
Салюки
Уиппет
Фараонова собака
Чирнеко дель Этна',
  'coursing',
  '',
  'Курсинг борзых',
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:',
  '',
  'Московская обл., д. Михайловское',
  NULL,
  'http://procoursing.ru/Complete_Results_2024-09-29_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-10-27',
  NULL,
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  '',
  'Ставрополь',
  'http://procoursing.ru/Catalog_2024-10-27_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-10-27_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2024,
  '2024-10-27',
  NULL,
  'Кубок России по бегам за механической приманкой',
  'bzmp',
  'Кубок России',
  '',
  'Кубок России по бегам за механической приманкой',
  '',
  'Ставрополь',
  'http://procoursing.ru/Catalog_2024-10-27_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-10-27_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-03-08',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РОО "Союз охотников и рыболовов Свердловской области" — ЧРКФ (Курсинг борзых)',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  'http://procoursing.ru/2025/Catalog_2025-03-08.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-03-08.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-05',
  '2025-04-06',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства" — ЧРКФ (Курсинг борзых)',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, с. Первитино',
  'http://procoursing.ru/2025/Catalog_2025-04-06_Coursing.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-05_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-05',
  '2025-04-06',
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства" — ЧРКФ (БЗМП)',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, с. Первитино',
  'http://procoursing.ru/2025/Catalog_2025-04-05_BZMP.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-05_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-06',
  NULL,
  'CACL
(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс" — CACL (Курсинг борзых)',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2025/Catalog_2025-04-06_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-06_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-06',
  NULL,
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс" — ЧРКФ (БЗМП)',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2025/Catalog_2025-04-06_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-06_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-19',
  NULL,
  'Чемпионат России
(Курсинг борзых)',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'СПГОО "Общество любителей животных "Радонежье" — Чемпионат России (Курсинг борзых)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, с.п. Царёвское',
  'http://procoursing.ru/2025/Catalog_2025-04-19_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-19_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-19',
  NULL,
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'СПГОО "Общество любителей животных "Радонежье" — ЧРКФ (БЗМП)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, с.п. Царёвское',
  'http://procoursing.ru/2025/Catalog_2025-04-19_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-19_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-19',
  '2025-04-20',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РОО "Республиканский Клуб Собаководов и Охотников" — ЧРКФ (Курсинг борзых)',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, пгт. Высокая Гора',
  'http://procoursing.ru/2025/Catalog_2025-04-20_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-20_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-19',
  '2025-04-20',
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'РОО "Республиканский Клуб Собаководов и Охотников" — ЧРКФ (БЗМП)',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, пгт. Высокая Гора',
  'http://procoursing.ru/2025/Catalog_2025-04-20_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-20_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-26',
  '2025-04-27',
  'CACL
(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края" — CACL (Курсинг борзых)',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-04-26',
  '2025-04-27',
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края" — ЧРКФ (БЗМП)',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-01',
  '2025-05-04',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО "Приморский краевой клуб служебного собаководства" — ЧРКФ (Курсинг борзых)',
  'ОО "Приморский краевой клуб служебного собаководства"',
  'Приморский край, Владивосток',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-01',
  '2025-05-04',
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'ОО "Приморский краевой клуб служебного собаководства" — ЧРКФ (БЗМП)',
  'ОО "Приморский краевой клуб служебного собаководства"',
  'Приморский край, Владивосток',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-03',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОКО "Русский простор" — ЧРКФ (Курсинг борзых)',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  'http://procoursing.ru/2025/Catalog_2025-05-03.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-03.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-11',
  NULL,
  'ПЧРКФ
Чирнеко дель этна, Малая итальянская борзая, Уиппет, Родезийский риджбек, Басенджи
(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'СПГОО "Общество любителей животных "Радонежье" — ПЧРКФ (Курсинг борзых)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2025/Catalog_2025-05-11.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-11.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства" — ЧРКФ (Курсинг борзых)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  'http://procoursing.ru/2025/Catalog_2025-05-17_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-17_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'Кубок России
(Бега за механической приманкой)',
  'bzmp',
  'Кубок России',
  'БЗМП',
  'МОРОО "Федерация спортивно-прикладного собаководства" — Кубок России (БЗМП)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  'http://procoursing.ru/2025/Catalog_2025-05-17_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-17_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'ЧРКФ
(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'РОО "Союз охотников и рыболовов Свердловской области" — ЧРКФ (Бега борзых)',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-24',
  '2025-05-25',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РООКО Кинологический союз "Арта" — ЧРКФ (Курсинг борзых)',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  'http://procoursing.ru/2025/Catalog_2025-05-24_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-24_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-24',
  '2025-05-25',
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'РООКО Кинологический союз "Арта" — ЧРКФ (БЗМП)',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  'http://procoursing.ru/2025/Catalog_2025-05-24_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-24_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-05-31',
  NULL,
  'ЧРКФ
(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'МОКО "Кеннел-клуб Санкт-Петербурга" — ЧРКФ (Бега борзых)',
  'МОКО "Кеннел-клуб Санкт-Петербурга"',
  'Санкт-Петербург, г. Петергоф',
  'http://procoursing.ru/2025/Catalog_2025-05-31_R.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-31.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-06-01',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОКО "Кеннел-клуб Санкт-Петербурга" — ЧРКФ (Курсинг борзых)',
  'МОКО "Кеннел-клуб Санкт-Петербурга"',
  'Санкт-Петербург, г. Петергоф',
  'http://procoursing.ru/2025/Catalog_2025-06-01_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-01.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-06-08',
  NULL,
  'ЧРКФ
(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'ОООК "Кинологический центр "Элита" (РАЛББ) — ЧРКФ (Бега борзых)',
  'ОООК "Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2025/Catalog_2025-06-08.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-08_Best_Time.pdf',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-06-14',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОО "Клуб Охотничьего Собаководства "Артемида" — ЧРКФ (Курсинг борзых)',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Городецкий район, д. Курцево',
  'http://procoursing.ru/2025/Catalog_2025-06-14_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-14_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-06-14',
  NULL,
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'МОО "Клуб Охотничьего Собаководства "Артемида" — ЧРКФ (БЗМП)',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Городецкий район, д. Курцево',
  'http://procoursing.ru/2025/Catalog_2025-06-14_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-14_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-06-29',
  NULL,
  'ПЧРКФ
Басенджи, Родезийский риджбек, Русская псовая борзая, Салюки, Уиппет, Чирнеко дель Этна
(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'МОКО "Русский простор" — ПЧРКФ (Курсинг борзых)',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  'http://procoursing.ru/2025/Catalog_2025-06-29.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-29.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-07-06',
  NULL,
  'Кубок Котейки Глюка',
  'other',
  'Кубок',
  'Кубок Котейки Глюка',
  'Клуб "Курсинг на Ярославке" — Кубок (Кубок Котейки Глюка)',
  'Клуб "Курсинг на Ярославке"',
  'Московская область, д. Михайловское',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-07-06.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-07-19',
  '2025-07-20',
  'ЧРКФ
(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'СРОКО "Уральский беговой клуб" — ЧРКФ (Бега борзых)',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-08-03',
  NULL,
  'ПЧРКФ
Поденко Ибиценко, Родезийский риджбек, Уиппет, Фараонова собака
(Курсинг борзых)

Американский стаффордширский терьер
(БЗМП)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства" — ПЧРКФ (Курсинг борзых)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская обл., д. Донино',
  'http://procoursing.ru/2025/Catalog_2025-08-03.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-03.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-08-16',
  '2025-08-17',
  'Кубок России
(Бега борзых)',
  'racing',
  'Кубок России',
  'Бега борзых',
  'СРОКО "Уральский беговой клуб" — Кубок России (Бега борзых)',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-08-16',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РООКО Кинологический союз "Арта" — ЧРКФ (Курсинг борзых)',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Головинка',
  'http://procoursing.ru/2025/Catalog_2025-08-16_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-16_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-08-16',
  NULL,
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'РООКО Кинологический союз "Арта" — ЧРКФ (БЗМП)',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  'http://procoursing.ru/2025/Catalog_2025-08-16_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-16_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-08-23',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОКО "Русский простор" — ЧРКФ (Курсинг борзых)',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  'http://procoursing.ru/2025/Catalog_2025-08-23.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-23.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-08-30',
  NULL,
  'ПЧРКФ
Уиппет, Русская псовая борзая, Родезийский риджбек, Басенджи [отменён]
(Бега борзых)',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'ВГОО - Клуб собаководства "Сириус" — ПЧРКФ (Бега борзых)',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  'http://procoursing.ru/2025/Catalog_2025-08-30_Whippet_R.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-30.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-08-31',
  NULL,
  'ПЧРКФ
Родезийский риджбек, Русская псовая борзая, Уиппет, Басенджи [отменён]
(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'ВГОО - Клуб собаководства "Сириус" — ПЧРКФ (Курсинг борзых)',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  'http://procoursing.ru/2025/Catalog_2025-08-31_Whippet_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-31.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-09-06',
  NULL,
  'Чемпионат России
(Бега борзых)',
  'racing',
  'Чемпионат России',
  'Бега борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства" — Чемпионат России (Бега борзых)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-06.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-09-13',
  '2025-09-14',
  'Кубок России
(Курсинг борзых)',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'РОО "Союз охотников и рыболовов Свердловской области" — Кубок России (Курсинг борзых)',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-09-13',
  NULL,
  'ПЧРКФ
Малая итальянская борзая, Уиппет, Чирнеко дель Этна
(Бега борзых)',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'ОООК "Кинологический центр "Элита" (РАЛББ) — ПЧРКФ (Бега борзых)',
  'ОООК "Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-13.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-09-20',
  '2025-09-21',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства" — ЧРКФ (Курсинг борзых)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-20_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-09-20',
  '2025-09-21',
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'МОРОО "Федерация спортивно-прикладного собаководства" — ЧРКФ (БЗМП)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-20_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-09-20',
  NULL,
  'CACMB
(Бега за механической приманкой)',
  'bzmp',
  'CACMB',
  'БЗМП',
  'НГОО Клуб собаководства "Виннер" — CACMB (БЗМП)',
  'НГОО Клуб собаководства "Виннер"',
  'Новосибирская область, п. Степной',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-20_B_NSB.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-09-21',
  NULL,
  'CACL
(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'НГОО Клуб собаководства "Виннер" — CACL (Курсинг борзых)',
  'НГОО Клуб собаководства "Виннер"',
  'Новосибирская область, п. Степной',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-21_C_NSB.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-09-27',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства" — ЧРКФ (Курсинг борзых)',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Большесельский р-н',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-27_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-09-27',
  NULL,
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства" — ЧРКФ (БЗМП)',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Большесельский р-н',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-27_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-10-04',
  '2025-10-05',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'СПГОО "Общество любителей животных "Радонежье" — ЧРКФ (Курсинг борзых)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-10-04_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-10-04',
  NULL,
  'ЧРКФ
(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'СПГОО "Общество любителей животных "Радонежье" — ЧРКФ (БЗМП)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-10-04_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-10-11',
  NULL,
  'ПЧРКФ
Родезийский риджбек, Уиппет, Русская псовая борзая, Афганская борзая, Фараонова собака, Басенджи
(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'РООКО Кинологический союз "Арта" — ПЧРКФ (Курсинг борзых)',
  'РООКО Кинологический союз "Арта"',
  'Калужская обл., Жуковский р-н, c. Спас-Прогнанье, База отдыха Иволга',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-10-11.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-10-25',
  '2025-10-26',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс" — ЧРКФ (Курсинг борзых)',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2025/Catalog_2025-10-25_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-10-25_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-10-25',
  '2025-10-26',
  'Чемпионат России
(Бега за механической приманкой)',
  'bzmp',
  'Чемпионат России',
  'БЗМП',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс" — Чемпионат России (БЗМП)',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2025/Catalog_2025-10-26_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-10-26_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2025,
  '2025-11-08',
  NULL,
  'Тройки - Состязания свор',
  'other',
  '',
  'Тройки - Состязания свор',
  'Клуб "Курсинг на Ярославке"',
  'Клуб "Курсинг на Ярославке"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2025/Catalog_2025-11-08.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-11-08.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-04',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Ярославль — ЧРКФ (Курсинг борзых)',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Ярославль',
  'http://procoursing.ru/2026/2026-04-04_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-04',
  NULL,
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Ярославль — ЧРКФ (БЗМП)',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Ярославль',
  'http://procoursing.ru/2026/2026-04-04_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-04_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-12',
  NULL,
  'CACL
(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Курсинг Ставрополь — CACL (Курсинг борзых)',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2026/2026-04-12_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-12_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-12',
  NULL,
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Ставрополь — ЧРКФ (БЗМП)',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2026/2026-04-12_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-12_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-18',
  '2026-04-19',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Казань — ЧРКФ (Курсинг борзых)',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, Зеленодольский район',
  'http://procoursing.ru/2026/2026-04-18_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-18_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-18',
  '2026-04-19',
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Казань — ЧРКФ (БЗМП)',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, Зеленодольский район',
  'http://procoursing.ru/2026/2026-04-18_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-18_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-18',
  NULL,
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Владивосток — ЧРКФ (БЗМП)',
  'РСОО "Федерация спортивно-прикладного собаководства Приморского края"',
  'Приморский край, Владивосток',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-19',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг на Ярославке — ЧРКФ (Курсинг борзых)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-04-19_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-19_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-19',
  NULL,
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг на Ярославке — ЧРКФ (БЗМП)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-04-19_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-19_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-19',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Владивосток — ЧРКФ (Курсинг борзых)',
  'РСОО "Федерация спортивно-прикладного собаководства Приморского края"',
  'Приморский край, Владивосток',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-25',
  '2026-04-26',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Донино — ЧРКФ (Курсинг борзых)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  'http://procoursing.ru/2026/2026-04-25_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-25_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-04-25',
  '2026-04-26',
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Донино — ЧРКФ (БЗМП)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  'http://procoursing.ru/2026/2026-04-25_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-25_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-05-02',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Пермь — ЧРКФ (Курсинг борзых)',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  'http://procoursing.ru/2026/2026-05-02_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-02_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-05-02',
  NULL,
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Пермь — ЧРКФ (БЗМП)',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  'http://procoursing.ru/2026/2026-05-02_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-05-02_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-05-03',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Русский Простор — ЧРКФ (Курсинг борзых)',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  'http://procoursing.ru/2026/2026-05-03_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-03_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-05-10',
  NULL,
  'ПЧРКФ
(Курсинг борзых)
Родезийский риджбек
Чирнеко дель этна
Русская псовая борзая
Уиппет
Басенджи
Малая итальянская борзая',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Курсинг на Ярославке — ПЧРКФ (Курсинг борзых)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-05-10_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-10_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-05-16',
  NULL,
  'ЧРКФ
(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'Уральский беговой клуб — ЧРКФ (Бега борзых)',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, д. Большое Седельниково',
  NULL,
  'http://procoursing.ru/2026/2026-05-16_Complete_Results_Racing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-05-23',
  '2026-05-24',
  'Чемпионат России
(Курсинг борзых)',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Беговой клуб "Раздолье" — Чемпионат России (Курсинг борзых)',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  'http://procoursing.ru/2026/2026-05-23_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-23_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-06-13',
  '2026-06-14',
  'ПЧРКФ
(Бега борзых)
Уиппет
Басенджи
Малая итальянская борзая
Родезийский риджбек
Чирнеко дель Этна',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'Курсинг на Ярославке — ПЧРКФ (Бега борзых)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-06-13_Catalog_Racing.pdf',
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-06-20',
  '2026-06-21',
  'ПЧРКФ
(Бега борзых)
Уиппет
Фараонова собака
Басенджи',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'Курсинг Донино — ПЧРКФ (Бега борзых)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Москва, Раменское(Московская область, д. Донино)',
  'http://procoursing.ru/2026/2026-06-20_Catalog_Racing.pdf',
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-06-20',
  '2026-06-21',
  'ПЧРКФ
(Курсинг борзых)
Фараонова собака
Уиппет
Салюки
Басенджи
Поденко ибиценко',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Курсинг Донино — ПЧРКФ (Курсинг борзых)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Москва, Раменское',
  'http://procoursing.ru/2026/2026-06-21_Catalog_Coursing.pdf',
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-06-27',
  '2026-06-28',
  'ПЧРКФ
(Курсинг борзых)
Уиппет
Салюки
Басенджи
Родезийский риджбек
Чирнеко дель Этна',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Русский Простор — ПЧРКФ (Курсинг борзых)',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-06-28',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг в Нижегородской области — ЧРКФ (Курсинг борзых)',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Нижний Новгород',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-06-28',
  NULL,
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг в Нижегородской области — ЧРКФ (БЗМП)',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Нижний Новгород',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-07-18',
  '2026-07-19',
  'ЧРКФ
(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'Уральский беговой клуб. Бега собак — ЧРКФ (Бега борзых)',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-01',
  '2026-08-02',
  'ПЧРКФ
(Курсинг борзых)
Уиппет
Поденко ибиценко
Фараонова собака',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Курсинг Донино — ПЧРКФ (Курсинг борзых)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-01',
  '2026-08-02',
  'ПЧРКФ
(БЗМП)
Немецкая овчарка
Американский стаффордширский терьер',
  'bzmp',
  'ПЧРКФ',
  'БЗМП',
  'Курсинг Донино — ПЧРКФ (БЗМП)',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-08',
  '2026-08-09',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Казань — ЧРКФ (Курсинг борзых)',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, Казань',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-08',
  '2026-08-09',
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Казань — ЧРКФ (БЗМП)',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, Казань',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-15',
  '2026-08-16',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Беговой клуб "Раздолье" — ЧРКФ (Курсинг борзых)',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-15',
  '2026-08-16',
  'Чемпионат России
(БЗМП)',
  'bzmp',
  'Чемпионат России',
  'БЗМП',
  'Беговой клуб "Раздолье" — Чемпионат России (БЗМП)',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-15',
  '2026-08-16',
  'Кубок России
(Бега борзых)',
  'racing',
  'Кубок России',
  'Бега борзых',
  'Уральский беговой клуб. Бега собак — Кубок России (Бега борзых)',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-22',
  '2026-08-23',
  'Кубок России
(Курсинг борзых)',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Русский Простор — Кубок России (Курсинг борзых)',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-29',
  NULL,
  'ЧРКФ
(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'Курсинг в Вологде — ЧРКФ (Бега борзых)',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-29',
  '2026-08-30',
  'ЧРКФ
(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'Курсинг Пермь — ЧРКФ (Бега борзых)',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-08-30',
  NULL,
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг в Вологде — ЧРКФ (Курсинг борзых)',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-12',
  '2026-09-13',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг и рейсинг Екатеринбург — ЧРКФ (Курсинг борзых)',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, д. Большое Седельниково',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-12',
  '2026-09-13',
  'Чемпионат России
(Бега борзых)',
  'racing',
  'Чемпионат России',
  'Бега борзых',
  'Курсинг на Ярославке — Чемпионат России (Бега борзых)',
  'ОООК «Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ПЧРКФ
(Курсинг борзых)
Уиппет
Родезийский риджбек
Басенджи
Русская псовая борзая
Салюки',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Беговой клуб "Раздолье" — ПЧРКФ (Курсинг борзых)',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Беговой клуб "Раздолье" — ЧРКФ (БЗМП)',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Ярославль — ЧРКФ (Курсинг борзых)',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Ярославль',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Ярославль — ЧРКФ (БЗМП)',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Ярославль',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Пермь — ЧРКФ (Курсинг борзых)',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Пермь — ЧРКФ (БЗМП)',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'CACL
(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'CACL (Курсинг борзых)',
  'ОО "Хабаровское городское общество охотников рыболовов"',
  'Хабаровский край, Хабаровск',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'ЧРКФ (БЗМП)',
  'ОО "Хабаровское городское общество охотников рыболовов"',
  'Хабаровский край, Хабаровск',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-10-03',
  '2026-10-04',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг на Ярославке — ЧРКФ (Курсинг борзых)',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-10-03',
  '2026-10-04',
  'Кубок России
(БЗМП)',
  'bzmp',
  'Кубок России',
  'БЗМП',
  'Курсинг на Ярославке — Кубок России (БЗМП)',
  'СПГОО "Общество любителей животных «Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-10-03',
  '2026-10-04',
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг на Ярославке — ЧРКФ (БЗМП)',
  'СПГОО "Общество любителей животных «Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-10-17',
  '2026-10-18',
  'ЧРКФ
(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Ставрополь — ЧРКФ (Курсинг борзых)',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  2026,
  '2026-10-17',
  '2026-10-18',
  'ЧРКФ
(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Ставрополь — ЧРКФ (БЗМП)',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;