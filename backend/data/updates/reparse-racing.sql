DELETE FROM results WHERE event_id = 1316;
UPDATE events SET judges = 'Главный судья - Минина С.В., судья - Табуева Т.А.' WHERE id = 1316;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДЕРЖАВА',
  'ГРЕЙХАУНД',
  'ДЕРЖАВА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЕРЖАВА' AND breed = 'ГРЕЙХАУНД'),
  1316,
  1,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":21.88,"speed_kmh":59.232},{"heat_number":2,"time":21.83,"speed_kmh":59.368},{"heat_number":3,"time":22.45,"speed_kmh":57.728}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Грейхаунд</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ДЕРЖАВА</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">21.88 с<br>16.45 м/с<br>59.232 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td bgcolor="#ffd700"><font style="font-size:10pt" face="Arial" color="#000000"><abbr title="Лучшее время состязания">21.83 с<br>16.49 м/с<br>59.368 км/ч<abbr></abbr></abbr></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">22.45 с<br>16.04 м/с<br>57.728 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДРАГУН',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ДРАГУН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДРАГУН' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  1316,
  1,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":26.75,"speed_kmh":48.449},{"heat_number":2,"time":26.73,"speed_kmh":48.485},{"heat_number":3,"time":26.41,"speed_kmh":49.072}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'Чемпион РКФ по рабочим качествам собак,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ДРАГУН</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.75 с<br>13.46 м/с<br>48.449 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.73 с<br>13.47 м/с<br>48.485 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.41 с<br>13.63 м/с<br>49.072 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ по рабочим качествам собак,<br>RegCACL</font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДИВНАЯ',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ДИВНАЯ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДИВНАЯ' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  1316,
  2,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":28.46,"speed_kmh":45.538},{"heat_number":2,"time":27.07,"speed_kmh":47.876},{"heat_number":3,"time":26.6,"speed_kmh":48.722}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'CACL,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ДИВНАЯ</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.46 с<br>12.65 м/с<br>45.538 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.07 с<br>13.30 м/с<br>47.876 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.60 с<br>13.53 м/с<br>48.722 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACL,<br>RegCACL</font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДУША ДЕВИЦА',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ДУША ДЕВИЦА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДУША ДЕВИЦА' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  1316,
  3,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":28.17,"speed_kmh":46.006},{"heat_number":2,"time":26.58,"speed_kmh":48.758},{"heat_number":3,"time":27.62,"speed_kmh":46.923}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ДУША-ДЕВИЦА</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.17 с<br>12.78 м/с<br>46.006 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.58 с<br>13.54 м/с<br>48.758 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.62 с<br>13.03 м/с<br>46.923 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">RegCACL</font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АЛЕАЗИС САДИК',
  'САЛЮКИ',
  'АЛЕАЗИС САДИК',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЛЕАЗИС САДИК' AND breed = 'САЛЮКИ'),
  1316,
  1,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":27.45,"speed_kmh":47.213},{"heat_number":2,"time":27.8,"speed_kmh":46.619},{"heat_number":3,"time":28.43,"speed_kmh":45.586}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'Чемпион РКФ по рабочим качествам собак,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Салюки</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АЛЕАЗИС САДИК</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.45 с<br>13.11 м/с<br>47.213 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.80 с<br>12.95 м/с<br>46.619 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.43 с<br>12.66 м/с<br>45.586 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ по рабочим качествам собак,<br>RegCACL</font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АРЬЯ /ARYA',
  'САЛЮКИ',
  'АРЬЯ /ARYA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АРЬЯ /ARYA' AND breed = 'САЛЮКИ'),
  1316,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Салюки</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АРЬЯ /<br>ARYA</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Отстранение</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '9
Салюки
Стандартный
Сука
АРЬЯ /ARYA
360
-
-
Отстранение',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЯЛИККЕ СО ШКОДНОГО ДВОРА',
  'САЛЮКИ',
  'ЯЛИККЕ СО ШКОДНОГО ДВОРА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЯЛИККЕ СО ШКОДНОГО ДВОРА' AND breed = 'САЛЮКИ'),
  1316,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Салюки</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ЯЛИККЕ СО ШКОДНОГО ДВОРА</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Отстранение</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '10
Салюки
Стандартный
Сука
ЯЛИККЕ СО ШКОДНОГО ДВОРА
360
-
-
Отстранение',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УРАЛ СПИРИТ СТОРМ /URAL SPIRIT STORM',
  'УИППЕТ',
  'УРАЛ СПИРИТ СТОРМ /URAL SPIRIT STORM',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УРАЛ СПИРИТ СТОРМ /URAL SPIRIT STORM' AND breed = 'УИППЕТ'),
  1316,
  1,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":23.68,"speed_kmh":54.73},{"heat_number":2,"time":23.88,"speed_kmh":54.271},{"heat_number":3,"time":23.81,"speed_kmh":54.431}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'Чемпион РКФ по рабочим качествам собак,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">УРАЛ СПИРИТ СТОРМ /<br>URAL SPIRIT STORM</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td bgcolor="#c0c0c0"><font style="font-size:10pt" face="Arial" color="#000000"><abbr title="Второе время состязания">23.68 с<br>15.20 м/с<br>54.730 км/ч</abbr></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">23.88 с<br>15.08 м/с<br>54.271 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">23.81 с<br>15.12 м/с<br>54.431 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ по рабочим качествам собак,<br>RegCACL</font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УРАЛ СПИРИТ СЕВЕН /URAL SPIRIT SEVEN',
  'УИППЕТ',
  'УРАЛ СПИРИТ СЕВЕН /URAL SPIRIT SEVEN',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УРАЛ СПИРИТ СЕВЕН /URAL SPIRIT SEVEN' AND breed = 'УИППЕТ'),
  1316,
  2,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":25.19,"speed_kmh":51.449},{"heat_number":2,"time":24.97,"speed_kmh":51.902},{"heat_number":3,"time":25.2,"speed_kmh":51.429}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'CACL,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">УРАЛ СПИРИТ СЕВЕН /<br>URAL SPIRIT SEVEN</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.19 с<br>14.29 м/с<br>51.449 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.97 с<br>14.42 м/с<br>51.902 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.20 с<br>14.29 м/с<br>51.429 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACL,<br>RegCACL</font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЖИЗНЕННЫЙ ПУТЬ ИЗ ПОЛЕТА МЕЧТЫ',
  'УИППЕТ',
  'ЖИЗНЕННЫЙ ПУТЬ ИЗ ПОЛЕТА МЕЧТЫ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЖИЗНЕННЫЙ ПУТЬ ИЗ ПОЛЕТА МЕЧТЫ' AND breed = 'УИППЕТ'),
  1316,
  3,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":28.23,"speed_kmh":45.909},{"heat_number":2,"time":26.26,"speed_kmh":49.353},{"heat_number":3,"time":25.95,"speed_kmh":49.942}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ЖИЗНЕННЫЙ ПУТЬ ИЗ ПОЛЕТА МЕЧТЫ</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.23 с<br>12.75 м/с<br>45.909 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.26 с<br>13.71 м/с<br>49.353 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.95 с<br>13.87 м/с<br>49.942 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">RegCACL</font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РУССКИ ПАРК ТУМАН НАД ВОДОЙ',
  'УИППЕТ',
  'РУССКИ ПАРК ТУМАН НАД ВОДОЙ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РУССКИ ПАРК ТУМАН НАД ВОДОЙ' AND breed = 'УИППЕТ'),
  1316,
  4,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":27.75,"speed_kmh":46.703},{"heat_number":2,"time":27.17,"speed_kmh":47.7},{"heat_number":3,"time":27.39,"speed_kmh":47.317}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">РУССКИ ПАРК ТУМАН НАД ВОДОЙ</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.75 с<br>12.97 м/с<br>46.703 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.17 с<br>13.25 м/с<br>47.700 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.39 с<br>13.14 м/с<br>47.317 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Грейхаунд - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АРГО АСТРУМ /ARGO ASTRUM',
  'УИППЕТ',
  'АРГО АСТРУМ /ARGO ASTRUM',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АРГО АСТРУМ /ARGO ASTRUM' AND breed = 'УИППЕТ'),
  1316,
  1,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":24.53,"speed_kmh":52.833},{"heat_number":2,"time":24.37,"speed_kmh":53.18},{"heat_number":3,"time":24.42,"speed_kmh":53.071}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'Чемпион РКФ по рабочим качествам собак,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АРГО АСТРУМ /<br>ARGO ASTRUM</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.53 с<br>14.68 м/с<br>52.833 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td bgcolor="#cd7f32"><font style="font-size:10pt" face="Arial" color="#000000"><abbr title="Третье время состязания">24.37 с<br>14.77 м/с<br>53.180 км/ч</abbr></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.42 с<br>14.74 м/с<br>53.071 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ по рабочим качествам собак,<br>RegCACL</font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АТОМИК ШТАРКЕ ВИНД /ATOMIC STARKE WIND',
  'УИППЕТ',
  'АТОМИК ШТАРКЕ ВИНД /ATOMIC STARKE WIND',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АТОМИК ШТАРКЕ ВИНД /ATOMIC STARKE WIND' AND breed = 'УИППЕТ'),
  1316,
  2,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":24.51,"speed_kmh":52.876},{"heat_number":2,"time":24.39,"speed_kmh":53.137},{"heat_number":3,"time":24.94,"speed_kmh":51.965}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'CACL,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АТОМИК ШТАРКЕ ВИНД /<br>ATOMIC STARKE WIND</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.51 с<br>14.69 м/с<br>52.876 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.39 с<br>14.76 м/с<br>53.137 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.94 с<br>14.43 м/с<br>51.965 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACL,<br>RegCACL</font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВАЛТТЕРИ СИЛЬВЕР ВИНГС /VALTTERY SILVER WINGS',
  'УИППЕТ',
  'ВАЛТТЕРИ СИЛЬВЕР ВИНГС /VALTTERY SILVER WINGS',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВАЛТТЕРИ СИЛЬВЕР ВИНГС /VALTTERY SILVER WINGS' AND breed = 'УИППЕТ'),
  1316,
  3,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":25.93,"speed_kmh":49.981},{"heat_number":2,"time":25.38,"speed_kmh":51.064},{"heat_number":3,"time":25.68,"speed_kmh":50.467}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ВАЛТТЕРИ СИЛЬВЕР ВИНГС /<br>VALTTERY SILVER WINGS</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.93 с<br>13.88 м/с<br>49.981 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.38 с<br>14.18 м/с<br>51.064 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.68 с<br>14.02 м/с<br>50.467 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">RegCACL</font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВОЯДЖЕР ДЖОЛЛИ РОДЖЕР',
  'УИППЕТ',
  'ВОЯДЖЕР ДЖОЛЛИ РОДЖЕР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВОЯДЖЕР ДЖОЛЛИ РОДЖЕР' AND breed = 'УИППЕТ'),
  1316,
  4,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":26.67,"speed_kmh":48.594},{"heat_number":2,"time":26.27,"speed_kmh":49.334},{"heat_number":3,"time":30.26,"speed_kmh":42.829}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ВОЯДЖЕР ДЖОЛЛИ РОДЖЕР</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.67 с<br>13.50 м/с<br>48.594 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.27 с<br>13.70 м/с<br>49.334 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">30.26 с<br>11.90 м/с<br>42.829 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АЙВИ ЛУННЫЙ СВЕТ /AJVI LUNNYJ SVET',
  'УИППЕТ',
  'АЙВИ ЛУННЫЙ СВЕТ /AJVI LUNNYJ SVET',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЙВИ ЛУННЫЙ СВЕТ /AJVI LUNNYJ SVET' AND breed = 'УИППЕТ'),
  1316,
  1,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":24.87,"speed_kmh":52.111},{"heat_number":2,"time":25.86,"speed_kmh":50.116},{"heat_number":3,"time":25.46,"speed_kmh":50.903}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'Чемпион РКФ по рабочим качествам собак,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АЙВИ ЛУННЫЙ СВЕТ /<br>AJVI LUNNY''J SVET</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.87 с<br>14.48 м/с<br>52.111 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.86 с<br>13.92 м/с<br>50.116 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.46 с<br>14.14 м/с<br>50.903 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ по рабочим качествам собак,<br>RegCACL</font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АСОКА ТАНО /ASHOKA TANO',
  'УИППЕТ',
  'АСОКА ТАНО /ASHOKA TANO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АСОКА ТАНО /ASHOKA TANO' AND breed = 'УИППЕТ'),
  1316,
  2,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":27.08,"speed_kmh":47.858},{"heat_number":2,"time":27.61,"speed_kmh":46.94},{"heat_number":3,"time":27.14,"speed_kmh":47.752}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'CACL,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АСОКА ТАНО /<br>ASHOKA TANO</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.08 с<br>13.29 м/с<br>47.858 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.61 с<br>13.04 м/с<br>46.940 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.14 с<br>13.26 м/с<br>47.752 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACL,<br>RegCACL</font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'А ПАНДА ЭРРОУ /A PANDA ARROW',
  'УИППЕТ',
  'А ПАНДА ЭРРОУ /A PANDA ARROW',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'А ПАНДА ЭРРОУ /A PANDA ARROW' AND breed = 'УИППЕТ'),
  1316,
  3,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":26.56,"speed_kmh":48.795},{"heat_number":2,"time":26.8,"speed_kmh":48.358},{"heat_number":3,"time":27.18,"speed_kmh":47.682}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">А-ПАНДА ЭРРОУ /<br>A-PANDA ARROW</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.56 с<br>13.55 м/с<br>48.795 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.80 с<br>13.43 м/с<br>48.358 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.18 с<br>13.25 м/с<br>47.682 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">RegCACL</font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АРВЕН УНДОМИЭЛЬ /ARWEN UNDOMIEL',
  'УИППЕТ',
  'АРВЕН УНДОМИЭЛЬ /ARWEN UNDOMIEL',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АРВЕН УНДОМИЭЛЬ /ARWEN UNDOMIEL' AND breed = 'УИППЕТ'),
  1316,
  4,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":28.3,"speed_kmh":45.795},{"heat_number":2,"time":28.4,"speed_kmh":45.634},{"heat_number":3,"time":28.53,"speed_kmh":45.426}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АРВЕН УНДОМИЭЛЬ /<br>ARWEN UNDOMIEL</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.30 с<br>12.72 м/с<br>45.795 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.40 с<br>12.68 м/с<br>45.634 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.53 с<br>12.62 м/с<br>45.426 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ATILLA NOTUS',
  'УИППЕТ',
  'ATILLA NOTUS',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ATILLA NOTUS' AND breed = 'УИППЕТ'),
  1316,
  1,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":27.13,"speed_kmh":47.77},{"heat_number":2,"time":26.89,"speed_kmh":48.196},{"heat_number":3,"time":26.91,"speed_kmh":48.161}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ATILLA NOTUS</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.13 с<br>13.27 м/с<br>47.770 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.89 с<br>13.39 м/с<br>48.196 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.91 с<br>13.38 м/с<br>48.161 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Юниоры - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ТАТЬЯНИН ДЕНЬ КОСМОС',
  'УИППЕТ',
  'ТАТЬЯНИН ДЕНЬ КОСМОС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ТАТЬЯНИН ДЕНЬ КОСМОС' AND breed = 'УИППЕТ'),
  1316,
  2,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":27.64,"speed_kmh":46.889},{"heat_number":2,"time":27.26,"speed_kmh":47.542},{"heat_number":3,"time":27.59,"speed_kmh":46.974}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ТАТЬЯНИН ДЕНЬ КОСМОС</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.64 с<br>13.02 м/с<br>46.889 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.26 с<br>13.21 м/с<br>47.542 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.59 с<br>13.05 м/с<br>46.974 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Юниоры - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ТАТЬЯНИН ДЕНЬ КАРЛ',
  'УИППЕТ',
  'ТАТЬЯНИН ДЕНЬ КАРЛ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ТАТЬЯНИН ДЕНЬ КАРЛ' AND breed = 'УИППЕТ'),
  1316,
  3,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":27.63,"speed_kmh":46.906},{"heat_number":2,"time":28.72,"speed_kmh":45.125},{"heat_number":3,"time":27.81,"speed_kmh":46.602}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ТАТЬЯНИН ДЕНЬ КАРЛ</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.63 с<br>13.03 м/с<br>46.906 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.72 с<br>12.53 м/с<br>45.125 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.81 с<br>12.94 м/с<br>46.602 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Юниоры - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЕНИСЕЙ',
  'УИППЕТ',
  'ЕНИСЕЙ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЕНИСЕЙ' AND breed = 'УИППЕТ'),
  1316,
  4,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":27.83,"speed_kmh":46.568},{"heat_number":2,"time":27.8,"speed_kmh":46.619},{"heat_number":3,"time":28.59,"speed_kmh":45.331}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ЕНИСЕЙ</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.83 с<br>12.94 м/с<br>46.568 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">27.80 с<br>12.95 м/с<br>46.619 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.59 с<br>12.59 м/с<br>45.331 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Юниоры - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АНГАВУ МАИША ЧИМЕКА',
  'БАСЕНДЖИ',
  'АНГАВУ МАИША ЧИМЕКА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АНГАВУ МАИША ЧИМЕКА' AND breed = 'БАСЕНДЖИ'),
  1316,
  1,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":32.13,"speed_kmh":40.336},{"heat_number":2,"time":32.72,"speed_kmh":39.609},{"heat_number":3,"time":32.6,"speed_kmh":39.755}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'Чемпион РКФ по рабочим качествам собак,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АНГАВУ МАИША ЧИМЕКА</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">32.13 с<br>11.20 м/с<br>40.336 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">32.72 с<br>11.00 м/с<br>39.609 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">32.60 с<br>11.04 м/с<br>39.755 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ по рабочим качествам собак,<br>RegCACL</font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'НАСЛЕДИЕ ЕТЕРА УИНСТОН ДЖЕЙМС СЕТЛЕР /NASLEDIYE ETERA UINSTON DZHEJMS SETLER',
  'БАСЕНДЖИ',
  'НАСЛЕДИЕ ЕТЕРА УИНСТОН ДЖЕЙМС СЕТЛЕР /NASLEDIYE ETERA UINSTON DZHEJMS SETLER',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'НАСЛЕДИЕ ЕТЕРА УИНСТОН ДЖЕЙМС СЕТЛЕР /NASLEDIYE ETERA UINSTON DZHEJMS SETLER' AND breed = 'БАСЕНДЖИ'),
  1316,
  2,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":32.38,"speed_kmh":40.025},{"heat_number":2,"time":33.18,"speed_kmh":39.06},{"heat_number":3,"time":32.71,"speed_kmh":39.621}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'CACL,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">НАСЛЕДИЕ ЕТЕРА УИНСТОН ДЖЕЙМС СЕТЛЕР /<br>NASLEDIYE ETERA UINSTON DZHEJMS SETLER</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">32.38 с<br>11.12 м/с<br>40.025 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">33.18 с<br>10.85 м/с<br>39.060 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">32.71 с<br>11.01 м/с<br>39.621 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACL,<br>RegCACL</font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ГОЛДИ ГОЛДЕН ДАЛЕН',
  'БАСЕНДЖИ',
  'ГОЛДИ ГОЛДЕН ДАЛЕН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ГОЛДИ ГОЛДЕН ДАЛЕН' AND breed = 'БАСЕНДЖИ'),
  1316,
  3,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":37,"speed_kmh":35.027},{"heat_number":2,"time":36.11,"speed_kmh":35.89},{"heat_number":3,"time":36.96,"speed_kmh":35.065}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ГОЛДИ ГОЛДЕН ДАЛЕН</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">37.00 с<br>9.73 м/с<br>35.027 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">36.11 с<br>9.97 м/с<br>35.890 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">36.96 с<br>9.74 м/с<br>35.065 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">RegCACL</font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФРАНЦУЗСКИЙ ТАЛИСМАН ВАРГ МЭН ИН БЛЭК',
  'БАСЕНДЖИ',
  'ФРАНЦУЗСКИЙ ТАЛИСМАН ВАРГ МЭН ИН БЛЭК',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФРАНЦУЗСКИЙ ТАЛИСМАН ВАРГ МЭН ИН БЛЭК' AND breed = 'БАСЕНДЖИ'),
  1316,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ФРАНЦУЗСКИЙ ТАЛИСМАН ВАРГ МЭН ИН БЛЭК</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Отстранение</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Кобели',
  '30
Басенджи
Стандартный
Кобель
ФРАНЦУЗСКИЙ ТАЛИСМАН ВАРГ МЭН ИН БЛЭК
360
-
-
Отстранение',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АНГАВУ МАИША ФРИЯ /ANGAVU MAISHA FRIA',
  'БАСЕНДЖИ',
  'АНГАВУ МАИША ФРИЯ /ANGAVU MAISHA FRIA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АНГАВУ МАИША ФРИЯ /ANGAVU MAISHA FRIA' AND breed = 'БАСЕНДЖИ'),
  1316,
  1,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":33.49,"speed_kmh":38.698},{"heat_number":2,"time":33.49,"speed_kmh":38.698},{"heat_number":3,"time":32.6,"speed_kmh":39.755}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'Чемпион РКФ по рабочим качествам собак,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АНГАВУ МАИША ФРИЯ /<br>ANGAVU MAISHA FRIA</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">33.49 с<br>10.75 м/с<br>38.698 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">33.49 с<br>10.75 м/с<br>38.698 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">32.60 с<br>11.04 м/с<br>39.755 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ по рабочим качествам собак,<br>RegCACL</font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВИННЕР ТАЙМ РУТТА /WINNER TIME RUTTA',
  'БАСЕНДЖИ',
  'ВИННЕР ТАЙМ РУТТА /WINNER TIME RUTTA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВИННЕР ТАЙМ РУТТА /WINNER TIME RUTTA' AND breed = 'БАСЕНДЖИ'),
  1316,
  2,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":35.02,"speed_kmh":37.007},{"heat_number":2,"time":34.61,"speed_kmh":37.446},{"heat_number":3,"time":34.93,"speed_kmh":37.103}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'CACL,RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ВИННЕР ТАЙМ РУТТА /<br>WINNER TIME RUTTA</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">35.02 с<br>10.28 м/с<br>37.007 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">34.61 с<br>10.40 м/с<br>37.446 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">34.93 с<br>10.31 м/с<br>37.103 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACL,<br>RegCACL</font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'SUNNY PUPS ULLY',
  'БАСЕНДЖИ',
  'SUNNY PUPS ULLY',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'SUNNY PUPS ULLY' AND breed = 'БАСЕНДЖИ'),
  1316,
  3,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":36.37,"speed_kmh":35.634},{"heat_number":2,"time":35.58,"speed_kmh":36.425},{"heat_number":3,"time":35.52,"speed_kmh":36.486}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  'RegCACL',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>35</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">SUNNY PUPS ULLY</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">36.37 с<br>9.90 м/с<br>35.634 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">35.58 с<br>10.12 м/с<br>36.425 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">35.52 с<br>10.14 м/с<br>36.486 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">RegCACL</font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВИННЕР ТАЙМ ГЕРМИОНА /WINNER TIME GERMIONA',
  'БАСЕНДЖИ',
  'ВИННЕР ТАЙМ ГЕРМИОНА /WINNER TIME GERMIONA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВИННЕР ТАЙМ ГЕРМИОНА /WINNER TIME GERMIONA' AND breed = 'БАСЕНДЖИ'),
  1316,
  4,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":35.4,"speed_kmh":36.61},{"heat_number":2,"time":35.37,"speed_kmh":36.641},{"heat_number":3,"time":35.66,"speed_kmh":36.343}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ВИННЕР ТАЙМ ГЕРМИОНА /<br>WINNER TIME GERMIONA</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">35.40 с<br>10.17 м/с<br>36.610 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">35.37 с<br>10.18 м/с<br>36.641 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">35.66 с<br>10.10 м/с<br>36.343 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БОНТАНА ГВЕН СТЕФАНИ',
  'БАСЕНДЖИ',
  'БОНТАНА ГВЕН СТЕФАНИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БОНТАНА ГВЕН СТЕФАНИ' AND breed = 'БАСЕНДЖИ'),
  1316,
  5,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"time":40.59,"speed_kmh":31.929},{"heat_number":2,"time":39.24,"speed_kmh":33.028}],"grand_total":null,"normalized_score":null,"format":"racing"}',
  '',
  '+',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">БОНТАНА ГВЕН СТЕФАНИ</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">360</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">40.59 с<br>8.87 м/с<br>31.929 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><b><font style="font-size:10pt" face="Arial" color="#000000">-</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">39.24 с<br>9.17 м/с<br>33.028 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ОСМАН',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ОСМАН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ОСМАН' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  1316,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ОСМАН</font></td> <td colspan="12"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЧАУС',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ЧАУС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧАУС' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  1316,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ЧАУС</font></td> <td colspan="12"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СИРЕНЬ ДУШИСТАЯ',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'СИРЕНЬ ДУШИСТАЯ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИРЕНЬ ДУШИСТАЯ' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  1316,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">СИРЕНЬ ДУШИСТАЯ</font></td> <td colspan="12"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  ''
);