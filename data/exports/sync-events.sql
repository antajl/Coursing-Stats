-- sync-local-to-remote: events
-- events: 302

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2015,
  '2015-03-14',
  '2015-03-15',
  'Национальные сертификатные состязания по курсингу ранга CACL "Мартовский Заяц - 2015"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская область, деревня Левково',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2015-03-14/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2015,
  '2015-08-08',
  '2015-08-09',
  'Национальные сертификатные состязания по курсингу ранга CACL "Заяц на Ярославке - 2015"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская область, Сергиево-Посадский р-н',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2015-08-08/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2015,
  '2015-08-08',
  '2015-08-09',
  'Дружественные забеги',
  'unknown',
  '',
  '',
  'Московская область, Сергиево-Посадский р-н',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2016,
  '2016-02-27',
  '2016-02-28',
  'Национальные сертификатные состязания по курсингу ранга CACL "Мартовский Заяц - 2016"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская область, Сергиево-Посадский р-н',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2016-02-27/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2016,
  '2016-08-06',
  '2016-08-07',
  'Региональные состязания по курсингу ранга CACL "Заяц на Ярославке - 2016"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская область, Пушкинский р-н, д. Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2016-08-06/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2016,
  '2016-08-06',
  '2016-08-07',
  'Дружественные забеги',
  'unknown',
  '',
  '',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2017,
  '2017-02-25',
  '2017-02-26',
  'Чемпионат РКФ по курсингу "Мартовский Заяц - 2017"',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-02-25/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2017,
  '2017-05-21',
  'null',
  'Командное состязание "Тройка, птица тройка - 2017"',
  'unknown',
  '',
  '',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-05-21/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2017,
  '2017-08-13',
  'null',
  'Региональные состязания по бегам борзых ранга CACL (рейсинг)',
  'racing',
  'CACL',
  'Бега борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-08-13/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2017,
  '2017-09-17',
  'null',
  'Чемпионат России по курсингу - 2017',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Московская область, Новый Милет',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-09-17/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2017,
  '2017-10-29',
  'null',
  'Тройка, птица осенняя - 2017',
  'unknown',
  '',
  '',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-10-29/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2018,
  '2018-03-09',
  '2018-03-10',
  'Чемпионат РКФ по курсингу "Мартовский Заяц - 2018"',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-03-09/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2018,
  '2018-06-03',
  'null',
  'Командное состязание "Тройка, птица весенняя - 2018"',
  'unknown',
  '',
  '',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-06-03/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2018,
  '2018-06-11',
  'null',
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  'Чемпионат России',
  'Бега борзых',
  'Московская область, Новый Милет',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-06-11/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2018,
  '2018-08-12',
  'null',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  '',
  'Бега борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-08-12/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2018,
  '2018-08-25',
  '2018-08-26',
  'Международный чемпионат по курсингу ранга CACIL & Чемпионат РКФ по курсингу',
  'coursing',
  'CAC',
  'Курсинг борзых',
  'Московская область, Ленинский район, деревня Суханово',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-08-26/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2018,
  '2018-09-15',
  'null',
  'Чемпионат РКФ по бегам борзых за механическим зайцем (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, Новый Милет',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-09-15/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2018,
  '2018-09-30',
  'null',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2018"',
  'unknown',
  '',
  '',
  'Московская область, Новый Милет',
  '',
  NULL,
  'Результаты первого раунда (Рейсинг)',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2018,
  '2018-10-21',
  'null',
  'Командное состязание "Тройка, птица осенняя - 2018"',
  'unknown',
  '',
  '',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-10-21/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-03-02',
  '2019-03-03',
  'Чемпионат РКФ по курсингу "Мартовский заяц - 2019"',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-03-02/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-04-14',
  'null',
  'Командное состязание "Тройка, птица весенняя - 2019"',
  'unknown',
  '',
  '',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-04-14/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-04-27',
  '2019-04-28',
  'Международный чемпионат по курсингу ранга CACIL & Чемпионат России по курсингу',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Московская область, Ленинский район, деревня Суханово',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-04-27/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-06-15',
  'null',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  '',
  'Бега борзых',
  'Московская область, Новый Милет',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-06-15/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-08-11',
  'null',
  'Тестовое состязание по рейсингу',
  'racing',
  '',
  'Бега борзых',
  'Московская область, город Раменское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-08-11/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-08-24',
  '2019-08-25',
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, деревня Суханово',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-08-24/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-09-01',
  'null',
  'Кубок России по бегам борзых (рейсинг)',
  'racing',
  'Кубок России',
  'Бега борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-09-01/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-09-08',
  'null',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2019"',
  'unknown',
  '',
  '',
  'Московская область, Новый Милет',
  '',
  NULL,
  'Результаты первого раунда (Рейсинг)',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-09-15',
  'null',
  'Кубок России по бегам борзых (курсинг)',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Московская область, Новый Милет',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-09-15/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-09-22',
  'null',
  'Национальные состязания по бегам борзых за механическим зайцем ранга CACL (рейсинг)',
  'racing',
  'CACL',
  'Бега борзых',
  'Московская область, город Раменское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-09-22/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-10-05',
  '2019-10-06',
  'Международные состязания по курсингу ранга CACIL & Национальные состязания по курсингу ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская область, город Красноармейск, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания: Зачёт CACIL',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2019,
  '2019-11-10',
  'null',
  'Командное состязание "Тройка, птица осенняя - 2019"',
  'unknown',
  '',
  '',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-11-10/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2020,
  '2020-08-15',
  '2020-08-16',
  'Бега за механической приманкой (курсинг)',
  'coursing',
  '',
  'Бега за механической приманкой',
  'Ярославль, АТЦ "Левково"',
  '',
  NULL,
  'Полные результаты состязания по породам и классам',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2020,
  '2020-08-15',
  '2020-08-16',
  'Чемпионат РКФ по бегам борзых (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Ярославль, АТЦ "Левково"',
  '',
  NULL,
  'Полные результаты состязания по породам и классам',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2020,
  '2020-08-22',
  '2020-08-23',
  'Международный чемпионат по курсингу ранга CACIL & Чемпионат РКФ по курсингу',
  'coursing',
  'CAC',
  'Курсинг борзых',
  'Московская область, деревня Суханово',
  'Полные результаты состязания: Зачёт CACIL',
  NULL,
  'Полные результаты состязания: Зачёт ЧРКФ - CACL',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2020,
  '2020-09-12',
  'null',
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  'Чемпионат России',
  'Бега борзых',
  'Московская область, Новый Милет',
  'Положение и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2020-09-12/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2020,
  '2020-09-20',
  'null',
  'Кубок России по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  'Кубок России',
  'Бега борзых',
  'Московская область, город Раменское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2020-09-20/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2020,
  '2020-10-03',
  '2020-10-04',
  'Международный чемпионат по курсингу ранга CACIL & Чемпионат России по курсингу',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2020-10-03/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-04-17',
  '2021-04-18',
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-04-18',
  'null',
  'Чемпионат России по бегам за механической приманкой (курсинг)',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-04-24',
  'null',
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Ярославль, АТЦ "Левково"',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-04-24/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-05-02',
  'null',
  'Чемпионат РКФ по курсингу борзых',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, деревня Суханово',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-05-02/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-05-22',
  '2021-05-23',
  'Чемпионат РКФ по курсингу борзых "Зигзаг удачи в лютиках - 2021"',
  'coursing',
  '',
  'Курсинг борзых',
  'Калужская область, б/о Головинка',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-05-22/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-06-13',
  'null',
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  'Чемпионат России',
  'Бега борзых',
  'Московская область, Новый Милет',
  'Положение и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-06-13/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-06-19',
  'null',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  '',
  'Бега борзых',
  'Московская область, город Раменское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-06-19/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-08-07',
  'null',
  'Чемпионат РКФ по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  '',
  'Бега борзых',
  'Ярославская область, город Любим',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-08-07/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-08-21',
  '2021-08-22',
  'Международные состязания по курсингу ранга CACIL & Чемпионат РКФ по курсингу',
  'coursing',
  'CAC',
  'Курсинг борзых',
  'Московская область, деревня Суханово',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-08-21/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-09-04',
  'null',
  'Национальные состязания по курсингу ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Калужская область, б/о Головинка',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-09-04',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Калужская область, б/о Головинка',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-09-18',
  'null',
  'Кубок России по курсингу борзых',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Московская область, Новый Милет',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-09-18/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-09-19',
  'null',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2021"',
  'unknown',
  '',
  '',
  'Московская область, Новый Милет',
  '',
  NULL,
  'Результаты первого раунда (Рейсинг)',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-10-02',
  '2021-10-03',
  'Международные состязания по курсингу ранга CACIL & Национальные состязания по курсингу ранга CACL "Зайчик-листопадничек - 2021"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-10-02/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-10-10',
  'null',
  'Международные состязания по бегам борзых ранга CACIL & Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  'CAC',
  'Бега борзых',
  'Московская область, город Раменское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-10-10/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2021,
  '2021-10-24',
  'null',
  'Командное состязание "Тройка, просто птица - 2021"',
  'unknown',
  '',
  '',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-10-24/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-04-16',
  '2022-04-17',
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-04-17',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-05-02',
  '2022-05-03',
  'Чемпионат России по курсингу борзых',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Московская область, деревня Суханово',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-05-02/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-05-14',
  'null',
  'Чемпионат РКФ по курсингу борзых',
  'coursing',
  '',
  'Курсинг борзых',
  'Ярославская область, село Великое',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-05-14',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Ярославская область, село Великое',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-05-28',
  '2022-05-29',
  'Чемпионат РКФ по курсингу борзых',
  'coursing',
  '',
  'Курсинг борзых',
  'Калужская область, б/о Головинка',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-05-28',
  '2022-05-29',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Калужская область, б/о Головинка',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-06-12',
  'null',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  '',
  'Бега борзых',
  'Московская область, деревня Михайловское',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-06-12/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-07-31',
  'null',
  'Кубок котейки Глюка (замеры скорости)',
  'unknown',
  'Кубок',
  '',
  'Московская область, деревня Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-07-31/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-08-20',
  '2022-08-21',
  'Чемпионат РКФ по курсингу борзых "Забавы борзых - 2022"',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, деревня Суханово',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-08-20/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-09-03',
  '2022-09-04',
  'Чемпионат РКФ по курсингу "Осенний зигзаг удачи - 2022"',
  'coursing',
  '',
  'Курсинг борзых',
  'Калужская область, б/о Головинка',
  'Каталог',
  NULL,
  'Полные результаты состязаний',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-09-03',
  'null',
  'Кубок России по бегам за механической приманкой "Осенний зигзаг удачи - 2022"',
  'racing',
  'Кубок России',
  '',
  'Калужская область, б/о Головинка',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-09-03',
  'null',
  'Кубок России по рейсингу (бегам борзых) "Вологодские кружева - 2022"',
  'racing',
  'Кубок России',
  'Бега борзых',
  'Вологодская область, г. Вологда',
  'Положение и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-09-04',
  'null',
  'Чемпионат РКФ по курсингу борзых "Вологодские кружева - 2022"',
  'coursing',
  '',
  'Курсинг борзых',
  'Вологодская область, г. Вологда',
  'Положение и каталог',
  NULL,
  'Полные результаты состязаний',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-09-11',
  'null',
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Свердловская область, Большое Седельниково',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-09-11',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  '',
  '',
  'Свердловская область, Большое Седельниково',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-09-18',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых за механическим зайцем (круг)',
  'racing',
  'CACL',
  '',
  'Московская область, г. Раменское',
  'Положение и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-09-18/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-09-24',
  'null',
  'Кубок России по курсингу',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Санкт-Петербург',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-09-24/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-10-02',
  'null',
  'Чемпионат РКФ - CACL по курсингу "Зайчик-листопадничек - 2022"',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-10-02/',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-10-08',
  'null',
  'Чемпионат РКФ по курсингу',
  'coursing',
  '',
  'Курсинг борзых',
  'Ярославская область',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-10-08',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  '',
  'Курсинг борзых',
  'Ярославская область',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2022,
  '2022-11-06',
  'null',
  'Состязание свор "Тройка - 2022"',
  'unknown',
  '',
  '',
  'Московская область, деревня Михайловское',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-04-15',
  '2023-04-16',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская область, деревня Михайловское',
  'Положение и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-04-15_C.pdf',
  'http://procoursing.ru/Complete_Results_2023-04-15_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-04-15',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Московская область, деревня Михайловское',
  'Положение и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-04-15_B.pdf',
  'http://procoursing.ru/Complete_Results_2023-04-15_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-04-22',
  'null',
  'Национальные монопородные состязания',
  'coursing',
  '',
  '',
  'Московская область, Балашихинский район',
  'Положение и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-04-22.pdf',
  'http://procoursing.ru/Complete_Results_2023-04-22.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-05-01',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Московская область, г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-05-01_B.pdf',
  'http://procoursing.ru/Complete_Results_2023-05-01_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-05-27',
  '2023-05-28',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Калужская область, база отдыха Головинка',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-05-27_C.pdf',
  'http://procoursing.ru/Complete_Results_2023-05-27_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-05-27',
  '2023-05-28',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Калужская область, база отдыха Головинка',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-05-27_B.pdf',
  'http://procoursing.ru/Complete_Results_2023-05-27_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-06-10',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых',
  'coursing',
  'CACL',
  '',
  'Московская область, деревня Михайловское',
  'Положение и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-06-10.pdf',
  'http://procoursing.ru/Complete_Results_2023-06-10.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-07-01',
  'null',
  'Чемпионат РКФ Br по курсингу в породе Уиппет',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, г. Видное, д. Суханово',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/Complete_Results_2023-07-01.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-07-08',
  'null',
  'Чемпионаты РКФ Br по курсингу в породах Салюки, Родезийский риджбек, Басенджи',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская область, г. Видное, д. Суханово',
  '',
  NULL,
  'Полные результаты состязаний',
  NULL,
  'http://procoursing.ru/Complete_Results_2023-07-08.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-07-16',
  'null',
  'Кубок котейки Глюка (замеры скорости)',
  'coursing',
  'Кубок',
  '',
  'Московская область, д. Михайловское',
  '',
  NULL,
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/Complete_Results_2023-07-16.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-08-05',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых',
  'coursing',
  'CACL',
  '',
  'Московская область, Новый Милет',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-08-05.pdf',
  'http://procoursing.ru/Complete_Results_2023-08-05.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-08-19',
  'null',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-08-19.pdf',
  'http://procoursing.ru/Complete_Results_2023-08-19.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-09-02',
  'null',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Калужская обл., б/о Головинка',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-09-02_K.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-02_K.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-09-02',
  'null',
  'Чемпионат России по бегам борзых (рейсингу)',
  'racing',
  'Чемпионат России',
  'Бега борзых',
  'Вологодская обл.',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-09-02_V.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-02_V_R.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-09-03',
  'null',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Вологодская обл.',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-09-03_V.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-03_V_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-09-17',
  'null',
  'Кубок России по бегам за механической приманкой',
  'coursing',
  'Кубок России',
  '',
  'Московская обл., Ленинский р-н, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-09-17.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-17.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-09-23',
  'null',
  'Кубок России - CACL по бегам борзых за механическим зайцем (круг)',
  'coursing',
  'CACL',
  '',
  'Московская обл., Раменский р-н, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-09-23.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-23.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-09-24',
  'null',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2023"',
  'coursing',
  '',
  '',
  'Московская область, Купавна',
  'Участники',
  NULL,
  'Курсинг',
  'http://procoursing.ru/Catalog_2023-09-24.pdf',
  'http://procoursing.ru/Complete_Results_2023-09-24_R.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-10-07',
  '2023-10-08',
  'Кубок России по курсингу',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Московская обл., д. Михайловское',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-10-07.pdf',
  'http://procoursing.ru/Complete_Results_2023-10-07.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-10-22',
  'null',
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Г. Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-10-22_C.pdf',
  'http://procoursing.ru/Complete_Results_2023-10-22_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-10-22',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Г. Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-10-22_B.pdf',
  'http://procoursing.ru/Complete_Results_2023-10-22_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2023,
  '2023-11-11',
  'null',
  'Состязание свор "Тройка - 2023"',
  'coursing',
  '',
  '',
  'Московская область, деревня Михайловское',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2023-11-11.pdf',
  'http://procoursing.ru/Complete_Results_2023-11-11.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-04-07',
  'null',
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Г. Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-04-07',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  '',
  '',
  'Г. Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-04-07',
  'null',
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Г. Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-04-07_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-04-07_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-04-07',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Г. Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-04-07_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-04-07_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-04-29',
  '2024-04-30',
  'Чемпионат России - CACL по курсингу борзых',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-04-29',
  '2024-04-30',
  'Чемпионат России - CACL по курсингу борзых',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-04-29.pdf',
  'http://procoursing.ru/Complete_Results_2024-04-29.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-05-11',
  'null',
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:БасенджиФараонова собакаЧирнеко дель ЭтнаРодезийский риджбекРусская псовая борзаяСалюкиУиппет',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская обл., д. Михайловское',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-05-11',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  '',
  '',
  'Московская обл., д. Михайловское',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-05-11',
  'null',
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:БасенджиФараонова собакаЧирнеко дель ЭтнаРодезийский риджбекРусская псовая борзаяСалюкиУиппет',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская обл., д. Михайловское',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-05-11_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-05-11_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-05-11',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Московская обл., д. Михайловское',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-05-11_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-05-11_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-05-25',
  '2024-05-26',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-05-25',
  '2024-05-26',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-05-25_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-05-25_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-05-26',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  '',
  '',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-05-26',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-05-26_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-05-26_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-09',
  'null',
  'Монопородные чемпионаты РКФ по бегам борзых в породах:БасенджиРодезийский риджбекУиппет',
  'racing',
  '',
  '',
  'Московская обл., д. Михайловское',
  'Каталоги:БасенджиРодезийский риджбекУиппет',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-09',
  'null',
  'Монопородные чемпионаты РКФ по бегам борзых в породах:БасенджиРодезийский риджбекУиппет',
  'coursing',
  '',
  '',
  'Московская обл., д. Михайловское',
  'Каталоги:БасенджиРодезийский риджбекУиппет',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-06-09_Whippet.pdf',
  'http://procoursing.ru/Complete_Results_2024-06-09.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-15',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых за механическим зайцем (круг)',
  'racing',
  'CACL',
  '',
  'Московская обл., г. Раменское, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-15',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых за механическим зайцем (круг)',
  'coursing',
  'CACL',
  '',
  'Московская обл., г. Раменское, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-06-15.pdf',
  'http://procoursing.ru/Complete_Results_2024-06-15.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-16',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская обл., г. Раменское, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-16',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  '',
  '',
  'Московская обл., г. Раменское, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-16',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская обл., г. Раменское, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-06-16_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-06-16_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-16',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Московская обл., г. Раменское, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-06-16_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-06-16_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-29',
  'null',
  'Монородные чемпионаты РКФ по курсингу борзых в породах:БасенджиРодезийский риджбекСалюкиУиппетЧирнеко дель Этна',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-06-29',
  'null',
  'Монородные чемпионаты РКФ по курсингу борзых в породах:БасенджиРодезийский риджбекСалюкиУиппетЧирнеко дель Этна',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-06-29.pdf',
  'http://procoursing.ru/Complete_Results_2024-06-29.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-03',
  'null',
  'Монородные чемпионаты РКФ по курсингу борзых в породах:БасенджиРодезийский риджбекУиппет',
  'coursing',
  '',
  'Курсинг борзых',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Каталоги:БасенджиРодезийский риджбекУиппет',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-03',
  'null',
  'Монородные чемпионаты РКФ по курсингу борзых в породах:БасенджиРодезийский риджбекУиппет',
  'coursing',
  '',
  'Курсинг борзых',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Каталоги:БасенджиРодезийский риджбекУиппет',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-08-03_Whippet.pdf',
  'http://procoursing.ru/Complete_Results_2024-08-03.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-10',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых',
  'racing',
  'CACL',
  '',
  'Московская обл., Богородский округ, д. Колонтаево',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-10',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых',
  'coursing',
  'CACL',
  '',
  'Московская обл., Богородский округ, д. Колонтаево',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-08-10.pdf',
  'http://procoursing.ru/Complete_Results_2024-08-10.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-24',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-24',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  '',
  '',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-24',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-08-24_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-08-24_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-24',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-08-24_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-08-24_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-31',
  'null',
  'Кубок России - CACL по бегам борзых',
  'racing',
  'CACL',
  '',
  'Вологодская обл., г. Вологда',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-08-31',
  'null',
  'Кубок России - CACL по бегам борзых',
  'racing',
  'CACL',
  '',
  'Вологодская обл., г. Вологда',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-08-31_R.pdf',
  'http://procoursing.ru/Complete_Results_2024-08-31_R.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-01',
  'null',
  'Кубок России - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Вологодская обл., г. Вологда',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-01',
  'null',
  'Кубок России - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Вологодская обл., г. Вологда',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-09-01_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-01_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-08',
  'null',
  'Чемпионат России - CACL по бегам борзых',
  'racing',
  'Чемпионат России',
  '',
  'Московская обл., д. Михайловское',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-08',
  'null',
  'Чемпионат России - CACL по бегам борзых',
  'coursing',
  'Чемпионат России',
  '',
  'Московская обл., д. Михайловское',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-09-08.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-08.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-14',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-14',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-09-14.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-14.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-21',
  'null',
  'Монопородные чемпионаты РКФ по бегам борзых в породах:БасенджиМалая итальянская борзаяУиппет',
  'racing',
  '',
  '',
  'Московская обл., Раменский городской округ, д. Донино',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-21',
  'null',
  'Монопородные чемпионаты РКФ по бегам борзых в породах:БасенджиМалая итальянская борзаяУиппет',
  'coursing',
  '',
  '',
  'Московская обл., Раменский городской округ, д. Донино',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-09-21.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-21.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-22',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская обл., Раменский городской округ, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-22',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  '',
  '',
  'Московская обл., Раменский городской округ, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-22',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Московская обл., Раменский городской округ, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-09-22_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-22_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-22',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'bzmp',
  '',
  '',
  'Московская обл., Раменский городской округ, д. Донино',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-09-22_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-22_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-29',
  'null',
  'Чемпионат России по бегам за механической приманкой',
  'racing',
  'Чемпионат России',
  '',
  'Московская обл., д. Михайловское',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-29',
  'null',
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:БасенджиРодезийский риджбекРусская псовая борзаяСалюкиУиппетФараонова собакаЧирнеко дель Этна',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская обл., д. Михайловское',
  'Регламенты и каталоги:БасенджиРодезийский риджбекРусская псовая борзаяСалюкиУиппетФараонова собакаЧирнеко дель Этна',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-29',
  'null',
  'Чемпионат России по бегам за механической приманкой',
  'bzmp',
  'Чемпионат России',
  '',
  'Московская обл., д. Михайловское',
  'Регламент и каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-09-29_BZMP.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-29_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-09-29',
  'null',
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:БасенджиРодезийский риджбекРусская псовая борзаяСалюкиУиппетФараонова собакаЧирнеко дель Этна',
  'coursing',
  '',
  'Курсинг борзых',
  'Московская обл., д. Михайловское',
  'Регламенты и каталоги:БасенджиРодезийский риджбекРусская псовая борзаяСалюкиУиппетФараонова собакаЧирнеко дель Этна',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-09-29_Chirneco.pdf',
  'http://procoursing.ru/Complete_Results_2024-09-29_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-10-27',
  'null',
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-10-27',
  'null',
  'Кубок России по бегам за механической приманкой',
  'racing',
  'Кубок России',
  '',
  'Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-10-27',
  'null',
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-10-27_C.pdf',
  'http://procoursing.ru/Complete_Results_2024-10-27_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2024,
  '2024-10-27',
  'null',
  'Кубок России по бегам за механической приманкой',
  'bzmp',
  'Кубок России',
  '',
  'Ставрополь',
  'Каталог',
  NULL,
  'Полные результаты состязания',
  'http://procoursing.ru/Catalog_2024-10-27_B.pdf',
  'http://procoursing.ru/Complete_Results_2024-10-27_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-03-08',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  NULL,
  'Положение и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-03-08',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  NULL,
  'Положение и каталог',
  'http://procoursing.ru/2025/Catalog_2025-03-08.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-03-08.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-05',
  '2025-04-06',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, с. Первитино',
  NULL,
  'Положение и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-05',
  '2025-04-06',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, с. Первитино',
  NULL,
  'Положение и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-05',
  '2025-04-06',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, с. Первитино',
  NULL,
  'Положение и каталог',
  'http://procoursing.ru/2025/Catalog_2025-04-06_Coursing.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-05_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-05',
  '2025-04-06',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, с. Первитино',
  NULL,
  'Положение и каталог',
  'http://procoursing.ru/2025/Catalog_2025-04-05_BZMP.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-05_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-06',
  'null',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-06',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-06',
  'null',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-04-06_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-06_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-06',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-04-06_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-06_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-19',
  'null',
  'Чемпионат России(Курсинг борзых)',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, с.п. Царёвское',
  NULL,
  'Положение и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-19',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, с.п. Царёвское',
  NULL,
  'Положение и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-19',
  '2025-04-20',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, пгт. Высокая Гора',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-19',
  '2025-04-20',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, пгт. Высокая Гора',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-19',
  'null',
  'Чемпионат России(Курсинг борзых)',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, с.п. Царёвское',
  NULL,
  'Положение и каталог',
  'http://procoursing.ru/2025/Catalog_2025-04-19_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-19_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-19',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, с.п. Царёвское',
  NULL,
  'Положение и каталог',
  'http://procoursing.ru/2025/Catalog_2025-04-19_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-19_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-19',
  '2025-04-20',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, пгт. Высокая Гора',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-04-20_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-20_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-19',
  '2025-04-20',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, пгт. Высокая Гора',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-04-20_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-04-20_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-26',
  '2025-04-27',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-26',
  '2025-04-27',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-26',
  '2025-04-27',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-04-26',
  '2025-04-27',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-01',
  '2025-05-04',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО "Приморский краевой клуб служебного собаководства"',
  'Приморский край, Владивосток',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-01',
  '2025-05-04',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'ОО "Приморский краевой клуб служебного собаководства"',
  'Приморский край, Владивосток',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-01',
  '2025-05-04',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО "Приморский краевой клуб служебного собаководства"',
  'Приморский край, Владивосток',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-01',
  '2025-05-04',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'ОО "Приморский краевой клуб служебного собаководства"',
  'Приморский край, Владивосток',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-03',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  'Положение и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-03',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  'Положение и каталог',
  'http://procoursing.ru/2025/Catalog_2025-05-03.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-03.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-11',
  'null',
  'ПЧРКФЧирнеко дель этна, Малая итальянская борзая, Уиппет, Родезийский риджбек, Басенджи(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-11',
  'null',
  'ПЧРКФЧирнеко дель этна, Малая итальянская борзая, Уиппет, Родезийский риджбек, Басенджи(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-05-11.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-11.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'Кубок России(Бега за механической приманкой)',
  'racing',
  'Кубок России',
  'Бега за механической приманкой',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-05-17_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-17_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'Кубок России(Бега за механической приманкой)',
  'bzmp',
  'Кубок России',
  'Бега за механической приманкой',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-05-17_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-17_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-24',
  '2025-05-25',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  'Регламент и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-24',
  '2025-05-25',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  'Регламент и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-24',
  '2025-05-25',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  'Регламент и каталог',
  'http://procoursing.ru/2025/Catalog_2025-05-24_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-24_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-24',
  '2025-05-25',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  'Регламент и каталог',
  'http://procoursing.ru/2025/Catalog_2025-05-24_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-24_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-31',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'МОКО "Кеннел-клуб Санкт-Петербурга"',
  'Санкт-Петербург, г. Петергоф',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-05-31',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'МОКО "Кеннел-клуб Санкт-Петербурга"',
  'Санкт-Петербург, г. Петергоф',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-05-31_R.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-05-31.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-01',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОКО "Кеннел-клуб Санкт-Петербурга"',
  'Санкт-Петербург, г. Петергоф',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-01',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОКО "Кеннел-клуб Санкт-Петербурга"',
  'Санкт-Петербург, г. Петергоф',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-06-01_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-01.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-08',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'ОООК "Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  NULL,
  'Регламент и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-08',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'ОООК "Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  NULL,
  'Регламент и каталог',
  'http://procoursing.ru/2025/Catalog_2025-06-08.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-08_Best_Time.pdf',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-14',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Городецкий район, д. Курцево',
  NULL,
  'Регламент и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-14',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Городецкий район, д. Курцево',
  NULL,
  'Регламент и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-14',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Городецкий район, д. Курцево',
  NULL,
  'Регламент и каталог',
  'http://procoursing.ru/2025/Catalog_2025-06-14_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-14_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-14',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Городецкий район, д. Курцево',
  NULL,
  'Регламент и каталог',
  'http://procoursing.ru/2025/Catalog_2025-06-14_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-14_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-29',
  'null',
  'ПЧРКФБасенджи, Родезийский риджбек, Русская псовая борзая, Салюки, Уиппет, Чирнеко дель Этна(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  'Регламент и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-06-29',
  'null',
  'ПЧРКФБасенджи, Родезийский риджбек, Русская псовая борзая, Салюки, Уиппет, Чирнеко дель Этна(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  'Регламент и каталог',
  'http://procoursing.ru/2025/Catalog_2025-06-29.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-06-29.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-07-06',
  'null',
  'Кубок Котейки Глюка',
  'unknown',
  'Кубок',
  '',
  'Клуб "Курсинг на Ярославке"',
  'Московская область, д. Михайловское',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-07-06',
  'null',
  'Кубок Котейки Глюка',
  'unknown',
  'Кубок',
  '',
  'Клуб "Курсинг на Ярославке"',
  'Московская область, д. Михайловское',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-07-06.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-07-19',
  '2025-07-20',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-07-19',
  '2025-07-20',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-03',
  'null',
  'ПЧРКФПоденко Ибиценко, Родезийский риджбек, Уиппет, Фараонова собака(Курсинг борзых)Американский стаффордширский терьер(БЗМП)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская обл., д. Донино',
  NULL,
  'Каталог с результатами',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-03',
  'null',
  'ПЧРКФПоденко Ибиценко, Родезийский риджбек, Уиппет, Фараонова собака(Курсинг борзых)Американский стаффордширский терьер(БЗМП)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская обл., д. Донино',
  NULL,
  'Каталог с результатами',
  'http://procoursing.ru/2025/Catalog_2025-08-03.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-03.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-16',
  '2025-08-17',
  'Кубок России(Бега борзых)',
  'racing',
  'Кубок России',
  'Бега борзых',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-16',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Головинка',
  NULL,
  'Регламент и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-16',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  'Регламент и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-16',
  '2025-08-17',
  'Кубок России(Бега борзых)',
  'racing',
  'Кубок России',
  'Бега борзых',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-16',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Головинка',
  NULL,
  'Регламент и каталог',
  'http://procoursing.ru/2025/Catalog_2025-08-16_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-16_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-16',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  'Регламент и каталог',
  'http://procoursing.ru/2025/Catalog_2025-08-16_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-16_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-23',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  'Регламент и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-23',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  'Регламент и каталог',
  'http://procoursing.ru/2025/Catalog_2025-08-23.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-23.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-30',
  'null',
  'ПЧРКФУиппет, Русская псовая борзая, Родезийский риджбек, Басенджи [отменён](Бега борзых)',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  NULL,
  'Регламент и каталог (РПБ)Регламент и каталог (РР)Регламент и каталог (Уиппеты)',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-30',
  'null',
  'ПЧРКФУиппет, Русская псовая борзая, Родезийский риджбек, Басенджи [отменён](Бега борзых)',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  NULL,
  'Регламент и каталог (РПБ)Регламент и каталог (РР)Регламент и каталог (Уиппеты)',
  'http://procoursing.ru/2025/Catalog_2025-08-30_Whippet_R.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-30.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-31',
  'null',
  'ПЧРКФРодезийский риджбек, Русская псовая борзая, Уиппет, Басенджи [отменён](Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  NULL,
  'Регламент и каталог (РР)Регламент и каталог (РПБ)Регламент и каталог (Уиппеты)',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-08-31',
  'null',
  'ПЧРКФРодезийский риджбек, Русская псовая борзая, Уиппет, Басенджи [отменён](Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  NULL,
  'Регламент и каталог (РР)Регламент и каталог (РПБ)Регламент и каталог (Уиппеты)',
  'http://procoursing.ru/2025/Catalog_2025-08-31_Whippet_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-08-31.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-06',
  'null',
  'Чемпионат России(Бега борзых)',
  'racing',
  'Чемпионат России',
  'Бега борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-06',
  'null',
  'Чемпионат России(Бега борзых)',
  'racing',
  'Чемпионат России',
  'Бега борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-06.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-13',
  '2025-09-14',
  'Кубок России(Курсинг борзых)',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-13',
  'null',
  'ПЧРКФМалая итальянская борзая, Уиппет, Чирнеко дель Этна(Бега борзых)',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'ОООК "Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-13',
  '2025-09-14',
  'Кубок России(Курсинг борзых)',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-13',
  'null',
  'ПЧРКФМалая итальянская борзая, Уиппет, Чирнеко дель Этна(Бега борзых)',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'ОООК "Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-13.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-20',
  '2025-09-21',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-20',
  '2025-09-21',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-20',
  'null',
  'CACMB(Бега за механической приманкой)',
  'racing',
  'CACMB',
  'Бега за механической приманкой',
  'НГОО Клуб собаководства "Виннер"',
  'Новосибирская область, п. Степной',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-20',
  '2025-09-21',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-20_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-20',
  '2025-09-21',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-20_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-20',
  'null',
  'CACMB(Бега за механической приманкой)',
  'racing',
  'CACMB',
  'Бега за механической приманкой',
  'НГОО Клуб собаководства "Виннер"',
  'Новосибирская область, п. Степной',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-20_B_NSB.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-21',
  'null',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'НГОО Клуб собаководства "Виннер"',
  'Новосибирская область, п. Степной',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-21',
  'null',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'НГОО Клуб собаководства "Виннер"',
  'Новосибирская область, п. Степной',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-21_C_NSB.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-27',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Большесельский р-н',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-27',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Большесельский р-н',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-27',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Большесельский р-н',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-27_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-09-27',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Большесельский р-н',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-09-27_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-04',
  '2025-10-05',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-04',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'Бега за механической приманкой',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-04',
  '2025-10-05',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-10-04_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-04',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'bzmp',
  'ЧРКФ',
  'Бега за механической приманкой',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-10-04_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-11',
  'null',
  'ПЧРКФРодезийский риджбек, Уиппет, Русская псовая борзая, Афганская борзая, Фараонова собака, Басенджи(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'РООКО Кинологический союз "Арта"',
  'Калужская обл., Жуковский р-н, c. Спас-Прогнанье, База отдыха Иволга',
  NULL,
  '',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-11',
  'null',
  'ПЧРКФРодезийский риджбек, Уиппет, Русская псовая борзая, Афганская борзая, Фараонова собака, Басенджи(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'РООКО Кинологический союз "Арта"',
  'Калужская обл., Жуковский р-н, c. Спас-Прогнанье, База отдыха Иволга',
  NULL,
  '',
  NULL,
  'http://procoursing.ru/2025/Complete_Results_2025-10-11.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-25',
  '2025-10-26',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-25',
  '2025-10-26',
  'Чемпионат России(Бега за механической приманкой)',
  'racing',
  'Чемпионат России',
  'Бега за механической приманкой',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  'Каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-25',
  '2025-10-26',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-10-25_C.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-10-25_C.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-10-25',
  '2025-10-26',
  'Чемпионат России(Бега за механической приманкой)',
  'bzmp',
  'Чемпионат России',
  'Бега за механической приманкой',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  'Каталог',
  'http://procoursing.ru/2025/Catalog_2025-10-26_B.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-10-26_B.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-11-08',
  'null',
  'Тройки - Состязания свор',
  'unknown',
  '',
  '',
  'Клуб "Курсинг на Ярославке"',
  'Московская область, д. Михайловское',
  NULL,
  'Положение и каталог',
  NULL,
  NULL,
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2025,
  '2025-11-08',
  'null',
  'Тройки - Состязания свор',
  'unknown',
  '',
  '',
  'Клуб "Курсинг на Ярославке"',
  'Московская область, д. Михайловское',
  NULL,
  'Положение и каталог',
  'http://procoursing.ru/2025/Catalog_2025-11-08.pdf',
  'http://procoursing.ru/2025/Complete_Results_2025-11-08.html',
  0,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-04',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Ярославль',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  NULL,
  'Ярославская область, Ярославль',
  'http://procoursing.ru/2026/2026-04-04_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-04',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Ярославль',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  NULL,
  'Ярославская область, Ярославль',
  'http://procoursing.ru/2026/2026-04-04_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-04_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-12',
  'null',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  'Курсинг Ставрополь',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  NULL,
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2026/2026-04-12_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-12_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-12',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Ставрополь',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  NULL,
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2026/2026-04-12_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-12_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-18',
  '2026-04-19',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Казань',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  NULL,
  'Республика Татарстан, Зеленодольский район',
  'http://procoursing.ru/2026/2026-04-18_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-18_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-18',
  '2026-04-19',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Казань',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  NULL,
  'Республика Татарстан, Зеленодольский район',
  'http://procoursing.ru/2026/2026-04-18_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-18_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-18',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Владивосток',
  'РСОО "Федерация спортивно-прикладного собаководства Приморского края"',
  NULL,
  'Приморский край, Владивосток',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-19',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  NULL,
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-04-19_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-19_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-19',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  NULL,
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-04-19_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-19_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-19',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Владивосток',
  'РСОО "Федерация спортивно-прикладного собаководства Приморского края"',
  NULL,
  'Приморский край, Владивосток',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-25',
  '2026-04-26',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  NULL,
  'Московская область, д. Донино',
  'http://procoursing.ru/2026/2026-04-25_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-25_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-04-25',
  '2026-04-26',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  NULL,
  'Московская область, д. Донино',
  'http://procoursing.ru/2026/2026-04-25_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-25_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-05-02',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  NULL,
  'Пермский край, Пермь',
  'http://procoursing.ru/2026/2026-05-02_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-02_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-05-02',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  NULL,
  'Пермский край, Пермь',
  'http://procoursing.ru/2026/2026-05-02_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-05-02_Complete_Results_BZMP.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-05-03',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Русский Простор',
  'МОКО "Русский простор"',
  NULL,
  'Московская область, д. Суханово',
  'http://procoursing.ru/2026/2026-05-03_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-03_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-05-10',
  'null',
  'ПЧРКФ(Курсинг борзых)Родезийский риджбекЧирнеко дель этнаРусская псовая борзаяУиппетБасенджиМалая итальянская борзая',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  NULL,
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-05-10_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-10_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-05-16',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'Уральский беговой клуб',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  NULL,
  'Свердловская область, д. Большое Седельниково',
  NULL,
  'http://procoursing.ru/2026/2026-05-16_Complete_Results_Racing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-05-23',
  '2026-05-24',
  'Чемпионат России(Курсинг борзых)',
  'coursing',
  'Чемпионат России',
  'Курсинг борзых',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  NULL,
  'Калужская область, Жуковский р-н, БО Иволга',
  'http://procoursing.ru/2026/2026-05-23_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-23_Complete_Results_Coursing.html',
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-06-13',
  '2026-06-14',
  'ПЧРКФ(Бега борзых)УиппетБасенджиМалая итальянская борзаяРодезийский риджбекЧирнеко дель Этна',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  NULL,
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-06-13_Catalog_Racing.pdf',
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-06-20',
  '2026-06-21',
  'ПЧРКФ(Бега борзых)УиппетФараонова собакаБасенджи',
  'racing',
  'ПЧРКФ',
  'Бега борзых',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  NULL,
  'Москва, Раменское(Московская область, д. Донино)',
  'http://procoursing.ru/2026/2026-06-20_Catalog_Racing.pdf',
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-06-20',
  '2026-06-21',
  'ПЧРКФ(Курсинг борзых)Фараонова собакаУиппетСалюкиБасенджиПоденко ибиценко',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  NULL,
  'Москва, Раменское',
  'http://procoursing.ru/2026/2026-06-21_Catalog_Coursing.pdf',
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-06-27',
  '2026-06-28',
  'ПЧРКФ(Курсинг борзых)УиппетСалюкиБасенджиРодезийский риджбекЧирнеко дель Этна',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Русский Простор',
  'МОКО "Русский простор"',
  NULL,
  'Московская область, д. Суханово',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-06-28',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг в Нижегородской области',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  NULL,
  'Нижегородская область, Нижний Новгород',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-06-28',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг в Нижегородской области',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  NULL,
  'Нижегородская область, Нижний Новгород',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-07-18',
  '2026-07-19',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'Уральский беговой клуб. Бега собак',
  'СРОКО "Уральский беговой клуб"',
  NULL,
  'Челябинская область, с. Воскресенское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-01',
  '2026-08-02',
  'ПЧРКФ(Курсинг борзых)УиппетПоденко ибиценкоФараонова собака',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  NULL,
  'Московская область, д. Донино',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-01',
  '2026-08-02',
  'ПЧРКФ(БЗМП)Немецкая овчаркаАмериканский стаффордширский терьер',
  'bzmp',
  'ПЧРКФ',
  'БЗМП',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  NULL,
  'Московская область, д. Донино',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-08',
  '2026-08-09',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Казань',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  NULL,
  'Республика Татарстан, Казань',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-08',
  '2026-08-09',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Казань',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  NULL,
  'Республика Татарстан, Казань',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-15',
  '2026-08-16',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  NULL,
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-15',
  '2026-08-16',
  'Чемпионат России(БЗМП)',
  'bzmp',
  'Чемпионат России',
  'БЗМП',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  NULL,
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-15',
  '2026-08-16',
  'Кубок России(Бега борзых)',
  'racing',
  'Кубок России',
  'Бега борзых',
  'Уральский беговой клуб. Бега собак',
  'СРОКО "Уральский беговой клуб"',
  NULL,
  'Челябинская область, с. Воскресенское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-22',
  '2026-08-23',
  'Кубок России(Курсинг борзых)',
  'coursing',
  'Кубок России',
  'Курсинг борзых',
  'Русский Простор',
  'МОКО "Русский простор"',
  NULL,
  'Московская область, д. Суханово',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-29',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'Курсинг в Вологде',
  'ВГОО - Клуб собаководства "Сириус"',
  NULL,
  'Вологодская область, Вологда',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-29',
  '2026-08-30',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Бега борзых',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  NULL,
  'Пермский край, Пермь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-08-30',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг в Вологде',
  'ВГОО - Клуб собаководства "Сириус"',
  NULL,
  'Вологодская область, Вологда',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-12',
  '2026-09-13',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг и рейсинг Екатеринбург',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  NULL,
  'Свердловская область, д. Большое Седельниково',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-12',
  '2026-09-13',
  'Чемпионат России(Бега борзых)',
  'racing',
  'Чемпионат России',
  'Бега борзых',
  'Курсинг на Ярославке',
  'ОООК «Кинологический центр "Элита" (РАЛББ)',
  NULL,
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ПЧРКФ(Курсинг борзых)УиппетРодезийский риджбекБасенджиРусская псовая борзаяСалюки',
  'coursing',
  'ПЧРКФ',
  'Курсинг борзых',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  NULL,
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  NULL,
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Ярославль',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  NULL,
  'Ярославская область, Ярославль',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Ярославль',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  NULL,
  'Ярославская область, Ярославль',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  NULL,
  'Пермский край, Пермь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  NULL,
  'Пермский край, Пермь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг борзых',
  '',
  'ОО "Хабаровское городское общество охотников рыболовов"',
  NULL,
  'Хабаровский край, Хабаровск',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  '',
  'ОО "Хабаровское городское общество охотников рыболовов"',
  NULL,
  'Хабаровский край, Хабаровск',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-10-03',
  '2026-10-04',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  NULL,
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-10-03',
  '2026-10-04',
  'Кубок России(БЗМП)',
  'bzmp',
  'Кубок России',
  'БЗМП',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных «Радонежье"',
  NULL,
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-10-03',
  '2026-10-04',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных «Радонежье"',
  NULL,
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-10-17',
  '2026-10-18',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг борзых',
  'Курсинг Ставрополь',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  NULL,
  'Ставропольский край, Ставрополь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  2026,
  '2026-10-17',
  '2026-10-18',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'БЗМП',
  'Курсинг Ставрополь',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  NULL,
  'Ставропольский край, Ставрополь',
  NULL,
  NULL,
  1,
  NULL
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;