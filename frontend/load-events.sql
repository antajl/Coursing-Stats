
INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2015,
  '2015-03-14',
  '2015-03-15',
  'Национальные сертификатные состязания по курсингу ранга CACL "Мартовский Заяц - 2015"',
  'coursing',
  'CACL',
  'Московская область, деревня Левково',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2015-03-14/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2015,
  '2015-08-08',
  '2015-08-09',
  'Национальные сертификатные состязания по курсингу ранга CACL "Заяц на Ярославке - 2015"',
  'coursing',
  'CACL',
  'Московская область, Сергиево-Посадский р-н',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2015-08-08/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2015,
  '2015-08-08',
  '2015-08-09',
  'Дружественные забеги',
  'unknown',
  'Дружественные',
  'Московская область, Сергиево-Посадский р-н',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2016,
  '2016-02-27',
  '2016-02-28',
  'Национальные сертификатные состязания по курсингу ранга CACL "Мартовский Заяц - 2016"',
  'coursing',
  'CACL',
  'Московская область, Сергиево-Посадский р-н',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2016-02-27/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2016,
  '2016-08-06',
  '2016-08-07',
  'Региональные состязания по курсингу ранга CACL "Заяц на Ярославке - 2016"',
  'coursing',
  'CACL',
  'Московская область, Пушкинский р-н, д. Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2016-08-06/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2016,
  '2016-08-06',
  '2016-08-07',
  'Дружественные забеги',
  'unknown',
  'Дружественные',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2017,
  '2017-02-25',
  '2017-02-26',
  'Чемпионат РКФ по курсингу "Мартовский Заяц - 2017"',
  'coursing',
  'Чемпионат',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-02-25/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2017,
  '2017-05-21',
  'null',
  'Командное состязание "Тройка, птица тройка - 2017"',
  'unknown',
  'Командное',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-05-21/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2017,
  '2017-08-13',
  'null',
  'Региональные состязания по бегам борзых ранга CACL (рейсинг)',
  'racing',
  'CACL',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-08-13/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2017,
  '2017-09-17',
  'null',
  'Чемпионат России по курсингу - 2017',
  'coursing',
  'Чемпионат России',
  'Московская область, Новый Милет',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-09-17/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2017,
  '2017-10-29',
  'null',
  'Тройка, птица осенняя - 2017',
  'unknown',
  'Тройка,',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2017-10-29/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2018,
  '2018-03-09',
  '2018-03-10',
  'Чемпионат РКФ по курсингу "Мартовский Заяц - 2018"',
  'coursing',
  'Чемпионат',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-03-09/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2018,
  '2018-06-03',
  'null',
  'Командное состязание "Тройка, птица весенняя - 2018"',
  'unknown',
  'Командное',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-06-03/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2018,
  '2018-06-11',
  'null',
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  'Чемпионат России',
  'Московская область, Новый Милет',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-06-11/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2018,
  '2018-08-12',
  'null',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  'борзых',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-08-12/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2018,
  '2018-08-25',
  '2018-08-26',
  'Международный чемпионат по курсингу ранга CACIL & Чемпионат РКФ по курсингу',
  'coursing',
  'CAC',
  'Московская область, Ленинский район, деревня Суханово',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-08-26/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2018,
  '2018-09-15',
  'null',
  'Чемпионат РКФ по бегам борзых за механическим зайцем (курсинг)',
  'coursing',
  'зайцем',
  'Московская область, Новый Милет',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-09-15/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2018,
  '2018-09-30',
  'null',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2018"',
  'unknown',
  'Открытый',
  'Московская область, Новый Милет',
  '',
  'Результаты первого раунда (Рейсинг)',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2018,
  '2018-10-21',
  'null',
  'Командное состязание "Тройка, птица осенняя - 2018"',
  'unknown',
  'Командное',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2018-10-21/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-03-02',
  '2019-03-03',
  'Чемпионат РКФ по курсингу "Мартовский заяц - 2019"',
  'coursing',
  'Чемпионат',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-03-02/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-04-14',
  'null',
  'Командное состязание "Тройка, птица весенняя - 2019"',
  'unknown',
  'Командное',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-04-14/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-04-27',
  '2019-04-28',
  'Международный чемпионат по курсингу ранга CACIL & Чемпионат России по курсингу',
  'coursing',
  'Чемпионат России',
  'Московская область, Ленинский район, деревня Суханово',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-04-27/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-06-15',
  'null',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  'борзых',
  'Московская область, Новый Милет',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-06-15/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-08-11',
  'null',
  'Тестовое состязание по рейсингу',
  'racing',
  'Тестовое',
  'Московская область, город Раменское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-08-11/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-08-24',
  '2019-08-25',
  'Чемпионат РКФ по курсингу',
  'coursing',
  'Чемпионат',
  'Московская область, деревня Суханово',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-08-24/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-09-01',
  'null',
  'Кубок России по бегам борзых (рейсинг)',
  'racing',
  'Кубок России',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-09-01/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-09-08',
  'null',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2019"',
  'unknown',
  'Открытый',
  'Московская область, Новый Милет',
  '',
  'Результаты первого раунда (Рейсинг)',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-09-15',
  'null',
  'Кубок России по бегам борзых (курсинг)',
  'coursing',
  'Кубок России',
  'Московская область, Новый Милет',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-09-15/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-09-22',
  'null',
  'Национальные состязания по бегам борзых за механическим зайцем ранга CACL (рейсинг)',
  'racing',
  'CACL',
  'Московская область, город Раменское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-09-22/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-10-05',
  '2019-10-06',
  'Международные состязания по курсингу ранга CACIL & Национальные состязания по курсингу ранга CACL',
  'coursing',
  'CACL',
  'Московская область, город Красноармейск, деревня Михайловское',
  '',
  'Полные результаты состязания: Зачёт CACIL',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2019,
  '2019-11-10',
  'null',
  'Командное состязание "Тройка, птица осенняя - 2019"',
  'unknown',
  'Командное',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2019-11-10/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2020,
  '2020-08-15',
  '2020-08-16',
  'Бега за механической приманкой (курсинг)',
  'coursing',
  'приманкой',
  'Ярославль, АТЦ "Левково"',
  '',
  'Полные результаты состязания по породам и классам',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2020,
  '2020-08-15',
  '2020-08-16',
  'Чемпионат РКФ по бегам борзых (курсинг)',
  'coursing',
  'борзых',
  'Ярославль, АТЦ "Левково"',
  '',
  'Полные результаты состязания по породам и классам',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2020,
  '2020-08-22',
  '2020-08-23',
  'Международный чемпионат по курсингу ранга CACIL & Чемпионат РКФ по курсингу',
  'coursing',
  'CAC',
  'Московская область, деревня Суханово',
  'Полные результаты состязания: Зачёт CACIL',
  'Полные результаты состязания: Зачёт ЧРКФ - CACL',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2020,
  '2020-09-12',
  'null',
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  'Чемпионат России',
  'Московская область, Новый Милет',
  'Положение и каталог',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2020-09-12/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2020,
  '2020-09-20',
  'null',
  'Кубок России по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  'Кубок России',
  'Московская область, город Раменское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2020-09-20/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2020,
  '2020-10-03',
  '2020-10-04',
  'Международный чемпионат по курсингу ранга CACIL & Чемпионат России по курсингу',
  'coursing',
  'Чемпионат России',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2020-10-03/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-04-17',
  '2021-04-18',
  'Чемпионат РКФ по курсингу',
  'coursing',
  'Чемпионат',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-04-18',
  'null',
  'Чемпионат России по бегам за механической приманкой (курсинг)',
  'coursing',
  'Чемпионат России',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-04-24',
  'null',
  'Чемпионат РКФ по курсингу',
  'coursing',
  'Чемпионат',
  'Ярославль, АТЦ "Левково"',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-04-24/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-05-02',
  'null',
  'Чемпионат РКФ по курсингу борзых',
  'coursing',
  'Чемпионат',
  'Московская область, деревня Суханово',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-05-02/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-05-22',
  '2021-05-23',
  'Чемпионат РКФ по курсингу борзых "Зигзаг удачи в лютиках - 2021"',
  'coursing',
  'Чемпионат',
  'Калужская область, б/о Головинка',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-05-22/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-06-13',
  'null',
  'Чемпионат России по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  'Чемпионат России',
  'Московская область, Новый Милет',
  'Положение и каталог',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-06-13/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-06-19',
  'null',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  'борзых',
  'Московская область, город Раменское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-06-19/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-08-07',
  'null',
  'Чемпионат РКФ по бегам борзых за механическим зайцем (рейсинг)',
  'racing',
  'зайцем',
  'Ярославская область, город Любим',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-08-07/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-08-21',
  '2021-08-22',
  'Международные состязания по курсингу ранга CACIL & Чемпионат РКФ по курсингу',
  'coursing',
  'CAC',
  'Московская область, деревня Суханово',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-08-21/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-09-04',
  'null',
  'Национальные состязания по курсингу ранга CACL',
  'coursing',
  'CACL',
  'Калужская область, б/о Головинка',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-09-04',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  'приманкой',
  'Калужская область, б/о Головинка',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-09-18',
  'null',
  'Кубок России по курсингу борзых',
  'coursing',
  'Кубок России',
  'Московская область, Новый Милет',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-09-18/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-09-19',
  'null',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2021"',
  'unknown',
  'Открытый',
  'Московская область, Новый Милет',
  '',
  'Результаты первого раунда (Рейсинг)',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-10-02',
  '2021-10-03',
  'Международные состязания по курсингу ранга CACIL & Национальные состязания по курсингу ранга CACL "Зайчик-листопадничек - 2021"',
  'coursing',
  'CACL',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-10-02/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-10-10',
  'null',
  'Международные состязания по бегам борзых ранга CACIL & Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  'CAC',
  'Московская область, город Раменское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-10-10/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2021,
  '2021-10-24',
  'null',
  'Командное состязание "Тройка, просто птица - 2021"',
  'unknown',
  'Командное',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2021-10-24/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-04-16',
  '2022-04-17',
  'Чемпионат РКФ по курсингу',
  'coursing',
  'Чемпионат',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-04-17',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  'приманкой',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-05-02',
  '2022-05-03',
  'Чемпионат России по курсингу борзых',
  'coursing',
  'Чемпионат России',
  'Московская область, деревня Суханово',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-05-02/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-05-14',
  'null',
  'Чемпионат РКФ по курсингу борзых',
  'coursing',
  'Чемпионат',
  'Ярославская область, село Великое',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-05-14',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  'приманкой',
  'Ярославская область, село Великое',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-05-28',
  '2022-05-29',
  'Чемпионат РКФ по курсингу борзых',
  'coursing',
  'Чемпионат',
  'Калужская область, б/о Головинка',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-05-28',
  '2022-05-29',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  'приманкой',
  'Калужская область, б/о Головинка',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-06-12',
  'null',
  'Чемпионат РКФ по бегам борзых (рейсинг)',
  'racing',
  'борзых',
  'Московская область, деревня Михайловское',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-06-12/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-07-31',
  'null',
  'Кубок котейки Глюка (замеры скорости)',
  'unknown',
  'Кубок',
  'Московская область, деревня Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-07-31/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-08-20',
  '2022-08-21',
  'Чемпионат РКФ по курсингу борзых "Забавы борзых - 2022"',
  'coursing',
  'Чемпионат',
  'Московская область, деревня Суханово',
  '',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-08-20/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-09-03',
  '2022-09-04',
  'Чемпионат РКФ по курсингу "Осенний зигзаг удачи - 2022"',
  'coursing',
  'Чемпионат',
  'Калужская область, б/о Головинка',
  'Каталог',
  'Полные результаты состязаний',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-09-03',
  'null',
  'Кубок России по бегам за механической приманкой "Осенний зигзаг удачи - 2022"',
  'racing',
  'Кубок России',
  'Калужская область, б/о Головинка',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-09-03',
  'null',
  'Кубок России по рейсингу (бегам борзых) "Вологодские кружева - 2022"',
  'racing',
  'Кубок России',
  'Вологодская область, г. Вологда',
  'Положение и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-09-04',
  'null',
  'Чемпионат РКФ по курсингу борзых "Вологодские кружева - 2022"',
  'coursing',
  'Чемпионат',
  'Вологодская область, г. Вологда',
  'Положение и каталог',
  'Полные результаты состязаний',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-09-11',
  'null',
  'Чемпионат РКФ по курсингу',
  'coursing',
  'Чемпионат',
  'Свердловская область, Большое Седельниково',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-09-11',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Свердловская область, Большое Седельниково',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-09-18',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых за механическим зайцем (круг)',
  'racing',
  'CACL',
  'Московская область, г. Раменское',
  'Положение и каталог',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-09-18/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-09-24',
  'null',
  'Кубок России по курсингу',
  'coursing',
  'Кубок России',
  'Санкт-Петербург',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-09-24/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-10-02',
  'null',
  'Чемпионат РКФ - CACL по курсингу "Зайчик-листопадничек - 2022"',
  'coursing',
  'CACL',
  'Московская область, деревня Михайловское',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  'http://procoursing.ru/results/2022-10-02/',
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-10-08',
  'null',
  'Чемпионат РКФ по курсингу',
  'coursing',
  'Чемпионат',
  'Ярославская область',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-10-08',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой (курсинг)',
  'coursing',
  'приманкой',
  'Ярославская область',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2022,
  '2022-11-06',
  'null',
  'Состязание свор "Тройка - 2022"',
  'unknown',
  'Состязание',
  'Московская область, деревня Михайловское',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-04-15',
  '2023-04-16',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Московская область, деревня Михайловское',
  'Положение и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-04-15',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Московская область, деревня Михайловское',
  'Положение и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-04-22',
  'null',
  'Национальные монопородные состязания',
  'unknown',
  'Национальные',
  'Московская область, Балашихинский район',
  'Положение и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-05-01',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Московская область, г. Видное, д. Суханово',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-05-27',
  '2023-05-28',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Калужская область, база отдыха Головинка',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-05-27',
  '2023-05-28',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Калужская область, база отдыха Головинка',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-06-10',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых',
  'racing',
  'CACL',
  'Московская область, деревня Михайловское',
  'Положение и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-07-01',
  'null',
  'Чемпионат РКФ Br по курсингу в породе Уиппет',
  'coursing',
  'Чемпионат',
  'Московская область, г. Видное, д. Суханово',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-07-08',
  'null',
  'Чемпионаты РКФ Br по курсингу в породах Салюки, Родезийский риджбек, Басенджи',
  'coursing',
  'Чемпионаты',
  'Московская область, г. Видное, д. Суханово',
  '',
  'Полные результаты состязаний',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-07-16',
  'null',
  'Кубок котейки Глюка (замеры скорости)',
  'unknown',
  'Кубок',
  'Московская область, д. Михайловское',
  '',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-08-05',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых',
  'racing',
  'CACL',
  'Московская область, Новый Милет',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-08-19',
  'null',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-09-02',
  'null',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Калужская обл., б/о Головинка',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-09-02',
  'null',
  'Чемпионат России по бегам борзых (рейсингу)',
  'racing',
  'Чемпионат России',
  'Вологодская обл.',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-09-03',
  'null',
  'Чемпионат РКФ - CACL по курсингу',
  'coursing',
  'CACL',
  'Вологодская обл.',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-09-17',
  'null',
  'Кубок России по бегам за механической приманкой',
  'racing',
  'Кубок России',
  'Московская обл., Ленинский р-н, д. Суханово',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-09-23',
  'null',
  'Кубок России - CACL по бегам борзых за механическим зайцем (круг)',
  'racing',
  'Кубок России',
  'Московская обл., Раменский р-н, д. Донино',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-09-24',
  'null',
  'Открытый чемпионат НКП "Русская псовая борзая" "Осенний Марафон - 2023"',
  'unknown',
  'Открытый',
  'Московская область, Купавна',
  'Участники',
  'Курсинг',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-10-07',
  '2023-10-08',
  'Кубок России по курсингу',
  'coursing',
  'Кубок России',
  'Московская обл., д. Михайловское',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-10-22',
  'null',
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Г. Ставрополь',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-10-22',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Г. Ставрополь',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2023,
  '2023-11-11',
  'null',
  'Состязание свор "Тройка - 2023"',
  'unknown',
  'Состязание',
  'Московская область, деревня Михайловское',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-04-07',
  'null',
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Г. Ставрополь',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-04-07',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Г. Ставрополь',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-04-29',
  '2024-04-30',
  'Чемпионат России - CACL по курсингу борзых',
  'coursing',
  'Чемпионат России',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-05-11',
  'null',
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:БасенджиФараонова собакаЧирнеко дель ЭтнаРодезийский риджбекРусская псовая борзаяСалюкиУиппет',
  'coursing',
  'Монопородные',
  'Московская обл., д. Михайловское',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-05-11',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Московская обл., д. Михайловское',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-05-25',
  '2024-05-26',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-05-26',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-06-09',
  'null',
  'Монопородные чемпионаты РКФ по бегам борзых в породах:БасенджиРодезийский риджбекУиппет',
  'racing',
  'Монопородные',
  'Московская обл., д. Михайловское',
  'Каталоги:БасенджиРодезийский риджбекУиппет',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-06-15',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых за механическим зайцем (круг)',
  'racing',
  'CACL',
  'Московская обл., г. Раменское, д. Донино',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-06-16',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Московская обл., г. Раменское, д. Донино',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-06-16',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Московская обл., г. Раменское, д. Донино',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-06-29',
  'null',
  'Монородные чемпионаты РКФ по курсингу борзых в породах:БасенджиРодезийский риджбекСалюкиУиппетЧирнеко дель Этна',
  'coursing',
  'Монородные',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-08-03',
  'null',
  'Монородные чемпионаты РКФ по курсингу борзых в породах:БасенджиРодезийский риджбекУиппет',
  'coursing',
  'Монородные',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Каталоги:БасенджиРодезийский риджбекУиппет',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-08-10',
  'null',
  'Чемпионат РКФ - CACL по бегам борзых',
  'racing',
  'CACL',
  'Московская обл., Богородский округ, д. Колонтаево',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-08-24',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-08-24',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Московская обл., г. Видное, д. Суханово',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-08-31',
  'null',
  'Кубок России - CACL по бегам борзых',
  'racing',
  'Кубок России',
  'Вологодская обл., г. Вологда',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-09-01',
  'null',
  'Кубок России - CACL по курсингу борзых',
  'coursing',
  'Кубок России',
  'Вологодская обл., г. Вологда',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-09-08',
  'null',
  'Чемпионат России - CACL по бегам борзых',
  'racing',
  'Чемпионат России',
  'Московская обл., д. Михайловское',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-09-14',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Калужская обл., Жуковский р-н, с. Спас-Прогнанье, база отдыха Иволга',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-09-21',
  'null',
  'Монопородные чемпионаты РКФ по бегам борзых в породах:БасенджиМалая итальянская борзаяУиппет',
  'racing',
  'Монопородные',
  'Московская обл., Раменский городской округ, д. Донино',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-09-22',
  'null',
  'Чемпионат РКФ - CACL по курсингу борзых',
  'coursing',
  'CACL',
  'Московская обл., Раменский городской округ, д. Донино',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-09-22',
  'null',
  'Чемпионат РКФ по бегам за механической приманкой',
  'racing',
  'Чемпионат',
  'Московская обл., Раменский городской округ, д. Донино',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-09-29',
  'null',
  'Чемпионат России по бегам за механической приманкой',
  'racing',
  'Чемпионат России',
  'Московская обл., д. Михайловское',
  'Регламент и каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-09-29',
  'null',
  'Монопородные чемпионаты РКФ по курсингу борзых в породах:БасенджиРодезийский риджбекРусская псовая борзаяСалюкиУиппетФараонова собакаЧирнеко дель Этна',
  'coursing',
  'Монопородные',
  'Московская обл., д. Михайловское',
  'Регламенты и каталоги:БасенджиРодезийский риджбекРусская псовая борзаяСалюкиУиппетФараонова собакаЧирнеко дель Этна',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-10-27',
  'null',
  'Состязание по курсингу борзых ранга CACL',
  'coursing',
  'CACL',
  'Ставрополь',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2024,
  '2024-10-27',
  'null',
  'Кубок России по бегам за механической приманкой',
  'racing',
  'Кубок России',
  'Ставрополь',
  'Каталог',
  'Полные результаты состязания',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-03-08',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  'Положение и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-05',
  '2025-04-06',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, с. Первитино',
  'Положение и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-05',
  '2025-04-06',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, с. Первитино',
  'Положение и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-06',
  'null',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-06',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-19',
  'null',
  'Чемпионат России(Курсинг борзых)',
  'coursing',
  'Чемпионат России',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, с.п. Царёвское',
  'Положение и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-19',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, с.п. Царёвское',
  'Положение и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-19',
  '2025-04-20',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, пгт. Высокая Гора',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-19',
  '2025-04-20',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, пгт. Высокая Гора',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-26',
  '2025-04-27',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-04-26',
  '2025-04-27',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-01',
  '2025-05-04',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'ОО "Приморский краевой клуб служебного собаководства"',
  'Приморский край, Владивосток',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-01',
  '2025-05-04',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'ОО "Приморский краевой клуб служебного собаководства"',
  'Приморский край, Владивосток',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-03',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  'Положение и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-11',
  'null',
  'ПЧРКФЧирнеко дель этна, Малая итальянская борзая, Уиппет, Родезийский риджбек, Басенджи(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'Кубок России(Бега за механической приманкой)',
  'racing',
  'Кубок России',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-17',
  '2025-05-18',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-24',
  '2025-05-25',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  'Регламент и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-24',
  '2025-05-25',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  'Регламент и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-05-31',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'МОКО "Кеннел-клуб Санкт-Петербурга"',
  'Санкт-Петербург, г. Петергоф',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-06-01',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'МОКО "Кеннел-клуб Санкт-Петербурга"',
  'Санкт-Петербург, г. Петергоф',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-06-08',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'ОООК "Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  'Регламент и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-06-14',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Городецкий район, д. Курцево',
  'Регламент и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-06-14',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Городецкий район, д. Курцево',
  'Регламент и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-06-29',
  'null',
  'ПЧРКФБасенджи, Родезийский риджбек, Русская псовая борзая, Салюки, Уиппет, Чирнеко дель Этна(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  'Регламент и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-07-06',
  'null',
  'Кубок Котейки Глюка',
  'unknown',
  'Кубок',
  'Клуб "Курсинг на Ярославке"',
  'Московская область, д. Михайловское',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-07-19',
  '2025-07-20',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-08-03',
  'null',
  'ПЧРКФПоденко Ибиценко, Родезийский риджбек, Уиппет, Фараонова собака(Курсинг борзых)Американский стаффордширский терьер(БЗМП)',
  'coursing',
  'ПЧРКФ',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская обл., д. Донино',
  'Каталог с результатами',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-08-16',
  '2025-08-17',
  'Кубок России(Бега борзых)',
  'racing',
  'Кубок России',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-08-16',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Головинка',
  'Регламент и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-08-16',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  'Регламент и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-08-23',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  'Регламент и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-08-30',
  'null',
  'ПЧРКФУиппет, Русская псовая борзая, Родезийский риджбек, Басенджи [отменён](Бега борзых)',
  'racing',
  'ПЧРКФ',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  'Регламент и каталог (РПБ)Регламент и каталог (РР)Регламент и каталог (Уиппеты)',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-08-31',
  'null',
  'ПЧРКФРодезийский риджбек, Русская псовая борзая, Уиппет, Басенджи [отменён](Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  'Регламент и каталог (РР)Регламент и каталог (РПБ)Регламент и каталог (Уиппеты)',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-09-06',
  'null',
  'Чемпионат России(Бега борзых)',
  'racing',
  'Чемпионат России',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-09-13',
  '2025-09-14',
  'Кубок России(Курсинг борзых)',
  'coursing',
  'Кубок России',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, с. Кадниково',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-09-13',
  'null',
  'ПЧРКФМалая итальянская борзая, Уиппет, Чирнеко дель Этна(Бега борзых)',
  'racing',
  'ПЧРКФ',
  'ОООК "Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-09-20',
  '2025-09-21',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-09-20',
  '2025-09-21',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-09-20',
  'null',
  'CACMB(Бега за механической приманкой)',
  'racing',
  'CACMB',
  'НГОО Клуб собаководства "Виннер"',
  'Новосибирская область, п. Степной',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-09-21',
  'null',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'НГОО Клуб собаководства "Виннер"',
  'Новосибирская область, п. Степной',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-09-27',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Большесельский р-н',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-09-27',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Большесельский р-н',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-10-04',
  '2025-10-05',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-10-04',
  'null',
  'ЧРКФ(Бега за механической приманкой)',
  'racing',
  'ЧРКФ',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-10-11',
  'null',
  'ПЧРКФРодезийский риджбек, Уиппет, Русская псовая борзая, Афганская борзая, Фараонова собака, Басенджи(Курсинг борзых)',
  'coursing',
  'ПЧРКФ',
  'РООКО Кинологический союз "Арта"',
  'Калужская обл., Жуковский р-н, c. Спас-Прогнанье, База отдыха Иволга',
  '',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-10-25',
  '2025-10-26',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-10-25',
  '2025-10-26',
  'Чемпионат России(Бега за механической приманкой)',
  'racing',
  'Чемпионат России',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'Каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2025,
  '2025-11-08',
  'null',
  'Тройки - Состязания свор',
  'unknown',
  'Тройки',
  'Клуб "Курсинг на Ярославке"',
  'Московская область, д. Михайловское',
  'Положение и каталог',
  NULL,
  NULL,
  0
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-04',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг Ярославль',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Ярославль',
  'http://procoursing.ru/2026/2026-04-04_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-04',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Ярославль',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Ярославль',
  'http://procoursing.ru/2026/2026-04-04_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-04_Complete_Results_BZMP.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-12',
  'null',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  'Курсинг Ставрополь',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2026/2026-04-12_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-12_Complete_Results_Coursing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-12',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Ставрополь',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  'http://procoursing.ru/2026/2026-04-12_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-12_Complete_Results_BZMP.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-18',
  '2026-04-19',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг Казань',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, Зеленодольский район',
  'http://procoursing.ru/2026/2026-04-18_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-18_Complete_Results_Coursing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-18',
  '2026-04-19',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Казань',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, Зеленодольский район',
  'http://procoursing.ru/2026/2026-04-18_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-18_Complete_Results_BZMP.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-18',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Владивосток',
  'РСОО "Федерация спортивно-прикладного собаководства Приморского края"',
  'Приморский край, Владивосток',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-19',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-04-19_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-19_Complete_Results_Coursing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-19',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-04-19_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-19_Complete_Results_BZMP.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-19',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг Владивосток',
  'РСОО "Федерация спортивно-прикладного собаководства Приморского края"',
  'Приморский край, Владивосток',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-25',
  '2026-04-26',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  'http://procoursing.ru/2026/2026-04-25_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-04-25_Complete_Results_Coursing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-04-25',
  '2026-04-26',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  'http://procoursing.ru/2026/2026-04-25_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-04-25_Complete_Results_BZMP.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-05-02',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  'http://procoursing.ru/2026/2026-05-02_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-02_Complete_Results_Coursing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-05-02',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  'http://procoursing.ru/2026/2026-05-02_Catalog_BZMP.pdf',
  'http://procoursing.ru/2026/2026-05-02_Complete_Results_BZMP.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-05-03',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Русский Простор',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  'http://procoursing.ru/2026/2026-05-03_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-03_Complete_Results_Coursing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-05-10',
  'null',
  'ПЧРКФ(Курсинг борзых)Родезийский риджбекЧирнеко дель этнаРусская псовая борзаяУиппетБасенджиМалая итальянская борзая',
  'coursing',
  'ПЧРКФ',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-05-10_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-10_Complete_Results_Coursing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-05-16',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Уральский беговой клуб',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, д. Большое Седельниково',
  NULL,
  'http://procoursing.ru/2026/2026-05-16_Complete_Results_Racing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-05-23',
  '2026-05-24',
  'Чемпионат России(Курсинг борзых)',
  'coursing',
  'Чемпионат России',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  'http://procoursing.ru/2026/2026-05-23_Catalog_Coursing.pdf',
  'http://procoursing.ru/2026/2026-05-23_Complete_Results_Coursing.html',
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-06-13',
  '2026-06-14',
  'ПЧРКФ(Бега борзых)УиппетБасенджиМалая итальянская борзаяРодезийский риджбекЧирнеко дель Этна',
  'racing',
  'ПЧРКФ',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  'http://procoursing.ru/2026/2026-06-13_Catalog_Racing.pdf',
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-06-20',
  '2026-06-21',
  'ПЧРКФ(Бега борзых)УиппетФараонова собакаБасенджи',
  'racing',
  'ПЧРКФ',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Москва, Раменское(Московская область, д. Донино)',
  'http://procoursing.ru/2026/2026-06-20_Catalog_Racing.pdf',
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-06-20',
  '2026-06-21',
  'ПЧРКФ(Курсинг борзых)Фараонова собакаУиппетСалюкиБасенджиПоденко ибиценко',
  'coursing',
  'ПЧРКФ',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Москва, Раменское',
  'http://procoursing.ru/2026/2026-06-21_Catalog_Coursing.pdf',
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-06-27',
  '2026-06-28',
  'ПЧРКФ(Курсинг борзых)УиппетСалюкиБасенджиРодезийский риджбекЧирнеко дель Этна',
  'coursing',
  'ПЧРКФ',
  'Русский Простор',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-06-28',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг в Нижегородской области',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Нижний Новгород',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-06-28',
  'null',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг в Нижегородской области',
  'МОО "Клуб Охотничьего Собаководства "Артемида"',
  'Нижегородская область, Нижний Новгород',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-07-18',
  '2026-07-19',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Уральский беговой клуб. Бега собак',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-01',
  '2026-08-02',
  'ПЧРКФ(Курсинг борзых)УиппетПоденко ибиценкоФараонова собака',
  'coursing',
  'ПЧРКФ',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-01',
  '2026-08-02',
  'ПЧРКФ(БЗМП)Немецкая овчаркаАмериканский стаффордширский терьер',
  'bzmp',
  'ПЧРКФ',
  'Курсинг Донино',
  'МОРОО "Федерация спортивно-прикладного собаководства"',
  'Московская область, д. Донино',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-08',
  '2026-08-09',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг Казань',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, Казань',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-08',
  '2026-08-09',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Казань',
  'РОО "Республиканский Клуб Собаководов и Охотников"',
  'Республика Татарстан, Казань',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-15',
  '2026-08-16',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-15',
  '2026-08-16',
  'Чемпионат России(БЗМП)',
  'bzmp',
  'Чемпионат России',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-15',
  '2026-08-16',
  'Кубок России(Бега борзых)',
  'racing',
  'Кубок России',
  'Уральский беговой клуб. Бега собак',
  'СРОКО "Уральский беговой клуб"',
  'Челябинская область, с. Воскресенское',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-22',
  '2026-08-23',
  'Кубок России(Курсинг борзых)',
  'coursing',
  'Кубок России',
  'Русский Простор',
  'МОКО "Русский простор"',
  'Московская область, д. Суханово',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-29',
  'null',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Курсинг в Вологде',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-29',
  '2026-08-30',
  'ЧРКФ(Бега борзых)',
  'racing',
  'ЧРКФ',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-08-30',
  'null',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг в Вологде',
  'ВГОО - Клуб собаководства "Сириус"',
  'Вологодская область, Вологда',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-12',
  '2026-09-13',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг и рейсинг Екатеринбург',
  'РОО "Союз охотников и рыболовов Свердловской области"',
  'Свердловская область, д. Большое Седельниково',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-12',
  '2026-09-13',
  'Чемпионат России(Бега борзых)',
  'racing',
  'Чемпионат России',
  'Курсинг на Ярославке',
  'ОООК «Кинологический центр "Элита" (РАЛББ)',
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ПЧРКФ(Курсинг борзых)УиппетРодезийский риджбекБасенджиРусская псовая борзаяСалюки',
  'coursing',
  'ПЧРКФ',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Беговой клуб "Раздолье"',
  'РООКО Кинологический союз "Арта"',
  'Калужская область, Жуковский р-н, БО Иволга',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг Ярославль',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Ярославль',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Ярославль',
  'ОО "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"',
  'Ярославская область, Ярославль',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Пермь',
  'РСОО "Федерация спортивно-прикладного собаководства Пермского края"',
  'Пермский край, Пермь',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'CACL(Курсинг борзых)',
  'coursing',
  'CACL',
  '',
  'ОО "Хабаровское городское общество охотников рыболовов"',
  'Хабаровский край, Хабаровск',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-09-26',
  '2026-09-27',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  '',
  'ОО "Хабаровское городское общество охотников рыболовов"',
  'Хабаровский край, Хабаровск',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-10-03',
  '2026-10-04',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных "Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-10-03',
  '2026-10-04',
  'Кубок России(БЗМП)',
  'bzmp',
  'Кубок России',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных «Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-10-03',
  '2026-10-04',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг на Ярославке',
  'СПГОО "Общество любителей животных «Радонежье"',
  'Московская область, д. Михайловское',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-10-17',
  '2026-10-18',
  'ЧРКФ(Курсинг борзых)',
  'coursing',
  'ЧРКФ',
  'Курсинг Ставрополь',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;

INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind,
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  2026,
  '2026-10-17',
  '2026-10-18',
  'ЧРКФ(БЗМП)',
  'bzmp',
  'ЧРКФ',
  'Курсинг Ставрополь',
  'ОО Региональное кинологическое общество Ставропольского края "Альянс"',
  'Ставропольский край, Ставрополь',
  NULL,
  NULL,
  1
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed;