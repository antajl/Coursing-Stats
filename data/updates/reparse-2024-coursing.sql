DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Карелина Н.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Серова Т.Г., судья - Корепанова Т.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Егорова М.А., судья - Козлова И.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Гольдинова Л.М., судья - Петровас Н.Е.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Крылова Е.В., судьи - Вронская О.В., Карелина Н.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Полякова Г.Б., судьи - Куликова Г.В., Крылова Е.В., Богаченко В.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Козлова И.В., судья - Вронская О.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Козлова И.В., судья - Карелина Н.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Вронская О.В., судья - Карелина Н.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Корепанова Т.В., судья - Луговая К.И.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Крылова Е.В., судья - Рубина А.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Первый круг:Уиппет, Фараонова собака, Чирнеко дель Этна, Малая итальянская борзая (Левретка), Поденко Ибиценко г-шГлавный судья - Лукина Д.М., судья - Кузнецова Н.Н.Русская псовая борзая, Афганская борзая, Салюки, Ирландский вольфхаунд, Родезийский риджбек, БасенджиГлавный судья - Серова Т.Г., судья - Куликова Г.В.Второй круг:Русская псовая борзая, Афганская борзая, Салюки, Ирландский вольфхаунд, Родезийский риджбек, БасенджиГлавный судья - Лукина Д.М., судья - Кузнецова Н.Н.Уиппет, Фараонова собака, Чирнеко дель Этна, Малая итальянская борзая (Левретка), Поденко Ибиценко г-шГлавный судья - Серова Т.Г., судья - Куликова Г.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Иванова Г.С., судьи - Гольдинова Л.М., Орлова М.О.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Вронская О.В., судья - Крылова Е.В.' WHERE id = undefined;
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.' WHERE id = undefined;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗАМИР',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗАМИР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗАМИР' AND breed = 'УИППЕТ'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[5,3,null,null,null],"sum":null},{"judge_number":2,"scores":[2,2,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":1,"bib_color":"red","judges":[{"judge_number":2,"scores":[null,5,4,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗАМИР /<br>STANGERS LAND ZAMIR</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td bgcolor="#cd7f32"><font style="font-size:10pt" face="Arial" color="#000000"><abbr title="Третье время состязания">23.89 с<br>14.65 м/с<br>52.742 км/ч</abbr></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.50 с<br>14.29 м/с<br>51.429 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ДАКАР РАЛЛИ',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ДАКАР РАЛЛИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ДАКАР РАЛЛИ' AND breed = 'УИППЕТ'),
  undefined,
  3,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[5,1,null,null,null],"sum":null},{"judge_number":2,"scores":[4,4,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":2,"bib_color":"#00ccff","judges":[{"judge_number":2,"scores":[null,5,2,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ДАКАР РАЛЛИ /<br>STANGERS LAND DAKAR RALLY</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.53 с<br>14.27 м/с<br>51.366 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td bgcolor="#00ccff"><b><font style="font-size:10pt" face="Arial" color="#ffffff">2</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.83 с<br>14.10 м/с<br>50.745 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ' AND breed = 'УИППЕТ'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[1,1,null,null,null],"sum":null},{"judge_number":2,"scores":[2,11,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":2,"bib_color":"#00ccff","judges":[{"judge_number":2,"scores":[null,2,2,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ВАЛЬДИВИЯ /<br>STANGERS LAND VALDIVIA</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.63 с<br>14.21 м/с<br>51.157 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td bgcolor="#00ccff"><b><font style="font-size:10pt" face="Arial" color="#ffffff">2</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.53 с<br>14.27 м/с<br>51.366 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'STANGERS LAND BRATISLAVA',
  'УИППЕТ',
  'STANGERS LAND BRATISLAVA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'STANGERS LAND BRATISLAVA' AND breed = 'УИППЕТ'),
  undefined,
  3,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[2,3,null,null,null],"sum":null},{"judge_number":2,"scores":[4,6,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":4,"bib_color":"#000000","judges":[{"judge_number":2,"scores":[null,1,3,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">STANGERS LAND BRATISLAVA</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.21 с<br>13.88 м/с<br>49.980 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td bgcolor="#000000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">4</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.49 с<br>13.73 м/с<br>49.431 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'SAGITA VOLAT BIS BONITAS',
  'УИППЕТ',
  'SAGITA VOLAT BIS BONITAS',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'SAGITA VOLAT BIS BONITAS' AND breed = 'УИППЕТ'),
  undefined,
  NULL,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[1,2,null,null,null],"sum":null},{"judge_number":2,"scores":[null,10,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"bib_color":null,"judges":[{"judge_number":2,"scores":[null,2,1,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">SAGITA VOLAT BIS BONITAS</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td bgcolor="#00ccff"><b><font style="font-size:10pt" face="Arial" color="#ffffff">2</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Вход в круг)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  'Вход в круг',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УОКИНГ УЭЛШ РУТС',
  'УИППЕТ',
  'УОКИНГ УЭЛШ РУТС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УОКИНГ УЭЛШ РУТС' AND breed = 'УИППЕТ'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[3,1,null,15,1],"sum":null},{"judge_number":2,"scores":[2,14,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":2,"bib_color":"#00ccff","judges":[{"judge_number":2,"scores":[null,3,3,null,14],"sum":1}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">УОКИНГ УЭЛШ РУТС /<br>WALKING WELSH ROUTES</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.80 с<br>14.11 м/с<br>50.806 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.60 с<br>14.23 м/с<br>51.220 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26</font></td> <td bgcolor="#00ccff"><b><font style="font-size:10pt" face="Arial" color="#ffffff">2</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.57 с<br>14.25 м/с<br>51.282 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'DON CORLEONE',
  'УИППЕТ',
  'DON CORLEONE',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'DON CORLEONE' AND breed = 'УИППЕТ'),
  undefined,
  3,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[4,1,null,14,2],"sum":null},{"judge_number":2,"scores":[4,16,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":3,"bib_color":"#f0ffff","judges":[{"judge_number":2,"scores":[null,4,3,null,15],"sum":2}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">DON CORLEONE</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.12 с<br>13.93 м/с<br>50.159 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td bgcolor="#00ccff"><b><font style="font-size:10pt" face="Arial" color="#ffffff">2</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.98 с<br>14.01 м/с<br>50.440 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.15 с<br>13.92 м/с<br>50.099 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АСТИ ХОНЕЙ ДЖОЙ',
  'УИППЕТ',
  'АСТИ ХОНЕЙ ДЖОЙ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АСТИ ХОНЕЙ ДЖОЙ' AND breed = 'УИППЕТ'),
  undefined,
  5,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[4,2,null,14,3],"sum":null},{"judge_number":2,"scores":[6,17,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"bib_color":null,"judges":[{"judge_number":2,"scores":[null,3,4,null,15],"sum":3}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">АСТИ ХОНЕЙ ДЖОЙ /<br>ASTI HONEY JOY</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td bgcolor="#00ccff"><b><font style="font-size:10pt" face="Arial" color="#ffffff">2</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.50 с<br>13.73 м/с<br>49.412 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.65 с<br>13.65 м/с<br>49.123 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗОДИАК',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗОДИАК',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗОДИАК' AND breed = 'УИППЕТ'),
  undefined,
  NULL,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[3,2,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"bib_color":null,"judges":[],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗОДИАК /<br>STANGERS LAND ZODIAK</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td bgcolor="#00ccff"><b><font style="font-size:10pt" face="Arial" color="#ffffff">2</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Не побежал)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  'Не побежал',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'MY WILD ON THE GO',
  'УИППЕТ',
  'MY WILD ON THE GO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'MY WILD ON THE GO' AND breed = 'УИППЕТ'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[6,2,null,null,null],"sum":null},{"judge_number":2,"scores":[2,20,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":1,"bib_color":"red","judges":[{"judge_number":2,"scores":[null,6,3,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">MY WILD ON THE GO</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td bgcolor="#00ccff"><b><font style="font-size:10pt" face="Arial" color="#ffffff">2</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24.91 с<br>14.05 м/с<br>50.582 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td bgcolor="#c0c0c0"><font style="font-size:10pt" face="Arial" color="#000000"><abbr title="Второе время состязания">23.81 с<br>14.70 м/с<br>52.919 км/ч</abbr></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА' AND breed = 'УИППЕТ'),
  undefined,
  3,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[6,1,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":3,"bib_color":"#f0ffff","judges":[],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">21</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗЛАТОСЛАВА /<br>STANGERS LAND ZLATOSLAVA</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.72 с<br>13.61 м/с<br>48.989 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25.52 с<br>13.71 м/с<br>49.373 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УРАЛ СПИРИТ САЛАМАНДР',
  'УИППЕТ',
  'УРАЛ СПИРИТ САЛАМАНДР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УРАЛ СПИРИТ САЛАМАНДР' AND breed = 'УИППЕТ'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[7,1,null,null,null],"sum":null},{"judge_number":2,"scores":[2,null,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":1,"bib_color":"red","judges":[{"judge_number":2,"scores":[null,7,2,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">22</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">УРАЛ СПИРИТ САЛАМАНДР /<br>URAL SPIRIT SALAMANDER</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td bgcolor="#ffd700"><font style="font-size:10pt" face="Arial" color="#000000"><abbr title="Лучшее время состязания">23.38 с<br>14.97 м/с<br>53.892 км/ч</abbr></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">23.62 с<br>14.82 м/с<br>53.345 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Юниоры - Микс',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'LIFT ME UP',
  'УИППЕТ',
  'LIFT ME UP',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'LIFT ME UP' AND breed = 'УИППЕТ'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[8,2,null,null,null],"sum":null},{"judge_number":2,"scores":[2,null,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":1,"bib_color":"red","judges":[{"judge_number":2,"scores":[null,8,1,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Ветераны</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">LIFT ME UP</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td bgcolor="#00ccff"><b><font style="font-size:10pt" face="Arial" color="#ffffff">2</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.40 с<br>13.26 м/с<br>47.727 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">20</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">26.17 с<br>13.37 м/с<br>48.147 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Ветераны - Кобели',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ОДИССЕЙ',
  'БАСЕНДЖИ',
  'ОДИССЕЙ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ОДИССЕЙ' AND breed = 'БАСЕНДЖИ'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[9,1,null,null,null],"sum":null},{"judge_number":2,"scores":[2,1,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":1,"bib_color":"red","judges":[{"judge_number":2,"scores":[null,9,2,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">ОДИССЕЙ /<br>ODISSEY</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">36.39 с<br>9.62 м/с<br>34.625 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">21</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">31.01 с<br>11.29 м/с<br>40.632 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЭЛЕН ВЛАДХИНС ФИНВЕСТ ДИК ДЭЛЬ ТОРРО',
  'БАСЕНДЖИ',
  'ЭЛЕН ВЛАДХИНС ФИНВЕСТ ДИК ДЭЛЬ ТОРРО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЭЛЕН ВЛАДХИНС ФИНВЕСТ ДИК ДЭЛЬ ТОРРО' AND breed = 'БАСЕНДЖИ'),
  undefined,
  NULL,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[9,3,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"bib_color":null,"judges":[],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЭЛЕН ВЛАДХИНС ФИНВЕСТ ДИК ДЭЛЬ ТОРРО</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Снятие (Агрессия на старте)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Кобели',
  'Агрессия на старте',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'НИКОЛЬ САН С КНЯЖЕСКОГО ДВОРА',
  'БАСЕНДЖИ',
  'НИКОЛЬ САН С КНЯЖЕСКОГО ДВОРА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'НИКОЛЬ САН С КНЯЖЕСКОГО ДВОРА' AND breed = 'БАСЕНДЖИ'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[10,4,null,null,null],"sum":null},{"judge_number":2,"scores":[2,7,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":1,"bib_color":"red","judges":[{"judge_number":2,"scores":[null,10,3,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">НИКОЛЬ САН С КНЯЖЕСКОГО ДВОРА /<br>NICOL SAN S KNJAZHESKOGO DVORA</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td bgcolor="#000000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">4</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">31.30 с<br>11.18 м/с<br>40.256 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">22</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">30.53 с<br>11.46 м/с<br>41.271 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЭЛЕН ВЛАДХИНС ФИНВЕСТ ДАША ЭСКОБАР',
  'БАСЕНДЖИ',
  'ЭЛЕН ВЛАДХИНС ФИНВЕСТ ДАША ЭСКОБАР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЭЛЕН ВЛАДХИНС ФИНВЕСТ ДАША ЭСКОБАР' AND breed = 'БАСЕНДЖИ'),
  undefined,
  NULL,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[10,1,null,null,null],"sum":null},{"judge_number":2,"scores":[null,5,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"bib_color":null,"judges":[{"judge_number":2,"scores":[null,10,2,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЭЛЕН ВЛАДХИНС ФИНВЕСТ ДАША ЭСКОБАР</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Снятие (Агрессия)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Суки',
  'Агрессия',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ИТУРИ ПАЗЗЛ ЕКСТРАОРДИНАРИ СМАРТ',
  'БАСЕНДЖИ',
  'ИТУРИ ПАЗЗЛ ЕКСТРАОРДИНАРИ СМАРТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ИТУРИ ПАЗЗЛ ЕКСТРАОРДИНАРИ СМАРТ' AND breed = 'БАСЕНДЖИ'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[11,1,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":1,"bib_color":"red","judges":[],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Ветераны</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">ИТУРИ ПАЗЗЛ ЕКСТРАОРДИНАРИ СМАРТ</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">23</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">33.52 с<br>10.44 м/с<br>37.589 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Ветераны - Кобели',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'GRACE HAUND ELIZABETH HER EXCELLENCE',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)',
  'GRACE HAUND ELIZABETH HER EXCELLENCE',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'GRACE HAUND ELIZABETH HER EXCELLENCE' AND breed = 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[12,1,null,null,null],"sum":null},{"judge_number":2,"scores":[2,1,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":1,"bib_color":"red","judges":[{"judge_number":2,"scores":[null,12,2,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Малая итальянская борзая (Левретка)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">GRACE HAUND ELIZABETH HER EXCELLENCE</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">30.91 с<br>11.32 м/с<br>40.764 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">30.92 с<br>11.32 м/с<br>40.750 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Малая итальянская борзая (Левретка) - Стандартный - Микс',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АПРИОРИ СТАР СИРИУС СУННИ БОЙ',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)',
  'АПРИОРИ СТАР СИРИУС СУННИ БОЙ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АПРИОРИ СТАР СИРИУС СУННИ БОЙ' AND breed = 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)'),
  undefined,
  3,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[12,3,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":3,"bib_color":"#f0ffff","judges":[],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Малая итальянская борзая (Левретка)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">АПРИОРИ СТАР СИРИУС СУННИ БОЙ /<br>APRIORI STAR SIRIUS SUNNI BOY</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">32.75 с<br>10.69 м/с<br>38.473 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">24</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">32.50 с<br>10.77 м/с<br>38.769 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Малая итальянская борзая (Левретка) - Стандартный - Микс',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АГОТИ АДАМАНТЕ ДЕЛ ЕСПАЦИО',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)',
  'АГОТИ АДАМАНТЕ ДЕЛ ЕСПАЦИО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АГОТИ АДАМАНТЕ ДЕЛ ЕСПАЦИО' AND breed = 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)'),
  undefined,
  1,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[13,1,null,null,null],"sum":null},{"judge_number":2,"scores":[2,7,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":1,"bib_color":"red","judges":[{"judge_number":2,"scores":[null,13,2,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Малая итальянская борзая (Левретка)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">АГОТИ АДАМАНТЕ ДЕЛ ЕСПАЦИО /<br>AGOTI ADAMANTE DEL ESPACIO</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.85 с<br>12.13 м/с<br>43.674 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25</font></td> <td bgcolor="#ff0000"><b><font style="font-size:10pt" face="Arial" color="#ffffff">1</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">28.46 с<br>12.30 м/с<br>44.273 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Малая итальянская борзая (Левретка) - Стандартный-спринтеры - Микс',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ПЕРМЬ ВЕЛИКАЯ ЗЕФИР',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)',
  'ПЕРМЬ ВЕЛИКАЯ ЗЕФИР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ПЕРМЬ ВЕЛИКАЯ ЗЕФИР' AND breed = 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)'),
  undefined,
  3,
  NULL,
  3,
  '{"heats":[{"heat_number":1,"bib_number":350,"bib_color":null,"judges":[{"judge_number":1,"scores":[13,3,null,null,null],"sum":null},{"judge_number":2,"scores":[4,4,null,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":3,"bib_color":"#f0ffff","judges":[{"judge_number":2,"scores":[null,13,4,null,null],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'unknown_status_check_raw_text',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Малая итальянская борзая (Левретка)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td align="left"><font style="font-size:10pt" face="Arial" color="#000000">ПЕРМЬ ВЕЛИКАЯ ЗЕФИР /<br>PERM VELIKAYA ZEFIR</font></td> <td align="center"><font style="font-size:10pt" face="Arial" color="#000000">350</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">30.40 с<br>11.51 м/с<br>41.447 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">&nbsp;</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">25</font></td> <td bgcolor="#f0ffff"><b><font style="font-size:10pt" face="Arial" color="#000000">3</font></b></td> <td><font style="font-size:10pt" face="Arial" color="#000000">29.96 с<br>11.68 м/с<br>42.056 км/ч</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Малая итальянская борзая (Левретка) - Стандартный-спринтеры - Микс',
  '',
  'Главный судья - Серова Т.Г., судьи - Крылова Е.В., Богаченко В.В.'
);
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Коршунова И.А., судья - Рубина А.В.' WHERE id = undefined;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ХАУС ЗЭ РЭЙНБОУ УЗОЧИ ЗИКИМО',
  'БАСЕНДЖИ',
  'ХАУС ЗЭ РЭЙНБОУ УЗОЧИ ЗИКИМО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ХАУС ЗЭ РЭЙНБОУ УЗОЧИ ЗИКИМО' AND breed = 'БАСЕНДЖИ'),
  undefined,
  1,
  341,
  2,
  '{"heats":[{"heat_number":1,"bib_number":23,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,17,17,16,17],"sum":85},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":170,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":31,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,18,17],"sum":87},{"judge_number":2,"scores":[17,17,16,17,17],"sum":84}],"total":171,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ХАУС ЗЭ РЭЙНБОУ УЗОЧИ ЗИКИМО /<br>HOUSE THE RAINBOW UZOCHI ZIKIMO</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>341</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'SUNRISE LEUR ADAM',
  'БАСЕНДЖИ',
  'SUNRISE LEUR ADAM',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'SUNRISE LEUR ADAM' AND breed = 'БАСЕНДЖИ'),
  undefined,
  2,
  336,
  2,
  '{"heats":[{"heat_number":1,"bib_number":24,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[17,18,16,17,17],"sum":85}],"total":168,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":30,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,16,16,17,17],"sum":83},{"judge_number":2,"scores":[17,16,17,17,18],"sum":85}],"total":168,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">SUNRISE LEUR ADAM</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>336</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АФРИКАНСКИЙ МОЛЧУН ЗНАМЕНИТЫЙ ЛИС',
  'БАСЕНДЖИ',
  'АФРИКАНСКИЙ МОЛЧУН ЗНАМЕНИТЫЙ ЛИС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АФРИКАНСКИЙ МОЛЧУН ЗНАМЕНИТЫЙ ЛИС' AND breed = 'БАСЕНДЖИ'),
  undefined,
  3,
  316,
  2,
  '{"heats":[{"heat_number":1,"bib_number":24,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,16,17,16,17],"sum":83},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":168,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":31,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,15,16,15,15],"sum":77},{"judge_number":2,"scores":[16,16,15,13,11],"sum":71}],"total":148,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">АФРИКАНСКИЙ МОЛЧУН ЗНАМЕНИТЫЙ ЛИС /<br>AFRIKANSKIY MOLCHUN ZNAMENITYJ LIS</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>148</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>316</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВИННЕР ТАЙМ ЮТУБ',
  'БАСЕНДЖИ',
  'ВИННЕР ТАЙМ ЮТУБ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВИННЕР ТАЙМ ЮТУБ' AND breed = 'БАСЕНДЖИ'),
  undefined,
  NULL,
  NULL,
  2,
  '{"heats":[{"heat_number":1,"bib_number":23,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,17,16,17],"sum":82},{"judge_number":2,"scores":[15,15,16,16,14],"sum":76}],"total":158,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":30,"bib_color":"red","judges":[],"total":null,"disqualified":true,"disqualification_reason":null}]}',
  '',
  '',
  'disqualified',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ВИННЕР ТАЙМ ЮТУБ /<br>WINNER TIME YOUTUBE</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>158</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td colspan="6" rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Снятие (Агрессия)</font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>158</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Кобели',
  'Агрессия',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЭРНА',
  'БАСЕНДЖИ',
  'ЭРНА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЭРНА' AND breed = 'БАСЕНДЖИ'),
  undefined,
  1,
  348,
  2,
  '{"heats":[{"heat_number":1,"bib_number":25,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,16,18],"sum":84},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":32,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,17,17,18],"sum":88},{"judge_number":2,"scores":[18,18,17,17,18],"sum":88}],"total":176,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЭРНА /<br>ERNA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>348</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'НИКА ИЗ ДОМА ПРИНЦЕССЫ ДИАНЫ',
  'БАСЕНДЖИ',
  'НИКА ИЗ ДОМА ПРИНЦЕССЫ ДИАНЫ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'НИКА ИЗ ДОМА ПРИНЦЕССЫ ДИАНЫ' AND breed = 'БАСЕНДЖИ'),
  undefined,
  2,
  337,
  2,
  '{"heats":[{"heat_number":1,"bib_number":25,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,17,17,17],"sum":83},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":169,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":33,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,15,16],"sum":83},{"judge_number":2,"scores":[17,18,17,16,17],"sum":85}],"total":168,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">НИКА ИЗ ДОМА ПРИНЦЕССЫ ДИАНЫ /<br>NIKA IZ DOMA PRINTSESSY DIANY</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>337</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'SUNRISE LEUR ARISHA',
  'БАСЕНДЖИ',
  'SUNRISE LEUR ARISHA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'SUNRISE LEUR ARISHA' AND breed = 'БАСЕНДЖИ'),
  undefined,
  3,
  336,
  2,
  '{"heats":[{"heat_number":1,"bib_number":26,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,16,15,16,15],"sum":77},{"judge_number":2,"scores":[18,17,17,17,18],"sum":87}],"total":164,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":32,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,18,17],"sum":87},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":172,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">SUNRISE LEUR ARISHA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>336</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДЕВУШКА В ИРЛАНДСКОЙ ЮБКЕ',
  'ИРЛАНДСКИЙ ВОЛЬФХАУНД',
  'ДЕВУШКА В ИРЛАНДСКОЙ ЮБКЕ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЕВУШКА В ИРЛАНДСКОЙ ЮБКЕ' AND breed = 'ИРЛАНДСКИЙ ВОЛЬФХАУНД'),
  undefined,
  1,
  337,
  2,
  '{"heats":[{"heat_number":1,"bib_number":2,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,15,15,17,16],"sum":79},{"judge_number":2,"scores":[16,17,17,17,16],"sum":83}],"total":162,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":12,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,18,17,18],"sum":89},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":175,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Ирландский вольфхаунд</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ДЕВУШКА В ИРЛАНДСКОЙ ЮБКЕ /<br>DEVUSHKA V IRLANDSKOY YUBKE</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>337</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Ирландский вольфхаунд - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЕЛАНЬ ЛАНЬ БЫСТРАЯ',
  'ИРЛАНДСКИЙ ВОЛЬФХАУНД',
  'ЕЛАНЬ ЛАНЬ БЫСТРАЯ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЕЛАНЬ ЛАНЬ БЫСТРАЯ' AND breed = 'ИРЛАНДСКИЙ ВОЛЬФХАУНД'),
  undefined,
  2,
  337,
  2,
  '{"heats":[{"heat_number":1,"bib_number":1,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,18,16,17],"sum":85},{"judge_number":2,"scores":[15,16,17,16,17],"sum":81}],"total":166,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":12,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,18,17,17],"sum":86},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":171,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Ирландский вольфхаунд</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЕЛАНЬ ЛАНЬ БЫСТРАЯ /<br>ELAN LAN BYSTRAYA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>337</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Ирландский вольфхаунд - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДЭЙРИНГ КАПИТАН ОРЛИКОВА',
  'ИРЛАНДСКИЙ ВОЛЬФХАУНД',
  'ДЭЙРИНГ КАПИТАН ОРЛИКОВА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЭЙРИНГ КАПИТАН ОРЛИКОВА' AND breed = 'ИРЛАНДСКИЙ ВОЛЬФХАУНД'),
  undefined,
  3,
  322,
  2,
  '{"heats":[{"heat_number":1,"bib_number":1,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,15,16,15,17],"sum":79},{"judge_number":2,"scores":[15,16,17,15,17],"sum":80}],"total":159,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":13,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,15,16,15,16],"sum":78},{"judge_number":2,"scores":[17,18,17,17,16],"sum":85}],"total":163,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Ирландский вольфхаунд</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ДЭЙРИНГ КАПИТАН ОРЛИКОВА /<br>DARING CAPITAN ORLIKOVA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>159</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>322</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Ирландский вольфхаунд - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ПЕРМЬ ВЕЛИКАЯ ЗЕФИР',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)',
  'ПЕРМЬ ВЕЛИКАЯ ЗЕФИР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ПЕРМЬ ВЕЛИКАЯ ЗЕФИР' AND breed = 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)'),
  undefined,
  1,
  347,
  2,
  '{"heats":[{"heat_number":1,"bib_number":27,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,17,18,18],"sum":89},{"judge_number":2,"scores":[16,18,17,17,18],"sum":86}],"total":175,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":34,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,17,17,16,17],"sum":85},{"judge_number":2,"scores":[17,18,17,17,18],"sum":87}],"total":172,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Малая итальянская борзая (Левретка)</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ПЕРМЬ ВЕЛИКАЯ ЗЕФИР /<br>PERM VELIKAYA ZEFIR</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Малая итальянская борзая (Левретка) - Стандартный-спринтеры - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'MIO BELISSIMO ALLEGRA VENTO',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)',
  'MIO BELISSIMO ALLEGRA VENTO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'MIO BELISSIMO ALLEGRA VENTO' AND breed = 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)'),
  undefined,
  2,
  343,
  2,
  '{"heats":[{"heat_number":1,"bib_number":27,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,18,18],"sum":88},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":177,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":34,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,16,16],"sum":84},{"judge_number":2,"scores":[17,18,17,15,15],"sum":82}],"total":166,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Малая итальянская борзая (Левретка)</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">MIO BELISSIMO ALLEGRA VENTO</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>343</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Малая итальянская борзая (Левретка) - Стандартный-спринтеры - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  1,
  354,
  2,
  '{"heats":[{"heat_number":1,"bib_number":8,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,17,18],"sum":89},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":175,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":19,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,19,18,18],"sum":91},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ /<br>ARIES KHAN RIVIERA AL RISHA SANGREAL</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>354</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Родезийский риджбек - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АЙНА ТАНДАЙВ ГРЕЙТ СТАР',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'АЙНА ТАНДАЙВ ГРЕЙТ СТАР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЙНА ТАНДАЙВ ГРЕЙТ СТАР' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  2,
  354,
  2,
  '{"heats":[{"heat_number":1,"bib_number":10,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,18,18,18],"sum":90},{"judge_number":2,"scores":[17,18,17,17,18],"sum":87}],"total":177,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":20,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,19,18,18],"sum":92},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":177,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">АЙНА ТАНДАЙВ ГРЕЙТ СТАР /<br>AINA TANDAIV GREIT STAR</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>354</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Родезийский риджбек - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ARIES KHAN PHREIA PASIPHAE',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'ARIES KHAN PHREIA PASIPHAE',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ARIES KHAN PHREIA PASIPHAE' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  3,
  353,
  2,
  '{"heats":[{"heat_number":1,"bib_number":9,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,18,17],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":179,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":20,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":174,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ARIES KHAN PHREIA PASIPHAE</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Родезийский риджбек - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СОЛАР СПИРИТ АНДРОМЕДА',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'СОЛАР СПИРИТ АНДРОМЕДА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СОЛАР СПИРИТ АНДРОМЕДА' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  4,
  342,
  2,
  '{"heats":[{"heat_number":1,"bib_number":7,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,17,18],"sum":86},{"judge_number":2,"scores":[17,17,17,16,17],"sum":84}],"total":170,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":18,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":172,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СОЛАР СПИРИТ АНДРОМЕДА /<br>SOLAR SPIRIT ANDROMEDA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>342</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Родезийский риджбек - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СОЛАР СПИРИТ АМАРУЛА',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'СОЛАР СПИРИТ АМАРУЛА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СОЛАР СПИРИТ АМАРУЛА' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  5,
  342,
  2,
  '{"heats":[{"heat_number":1,"bib_number":7,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":21,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,16,18,17],"sum":85},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":170,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СОЛАР СПИРИТ АМАРУЛА /<br>SOLAR SPIRIT AMARULA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>342</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Родезийский риджбек - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СОЛАР СПИРИТ АМОН РА',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'СОЛАР СПИРИТ АМОН РА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СОЛАР СПИРИТ АМОН РА' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  6,
  332,
  2,
  '{"heats":[{"heat_number":1,"bib_number":10,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,17,17,18],"sum":88},{"judge_number":2,"scores":[17,17,16,17,16],"sum":83}],"total":171,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":21,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,15,16,17,16],"sum":80},{"judge_number":2,"scores":[16,17,16,16,16],"sum":81}],"total":161,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СОЛАР СПИРИТ АМОН-РА /<br>SOLAR SPIRIT AMON-RA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>332</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Родезийский риджбек - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'КЭЙОД',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'КЭЙОД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КЭЙОД' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  7,
  332,
  2,
  '{"heats":[{"heat_number":1,"bib_number":8,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,17],"sum":87},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":19,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,15,15,15,15],"sum":75},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":160,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">КЭЙОД /<br>KEYOD</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>75</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>332</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Родезийский риджбек - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СОЛАР СПИРИТ АРМОНИ',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'СОЛАР СПИРИТ АРМОНИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СОЛАР СПИРИТ АРМОНИ' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  8,
  318,
  2,
  '{"heats":[{"heat_number":1,"bib_number":9,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,16,15,15,16],"sum":77},{"judge_number":2,"scores":[15,16,15,16,16],"sum":78}],"total":155,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":18,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,16,16,17,17],"sum":82},{"judge_number":2,"scores":[17,16,15,16,17],"sum":81}],"total":163,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">20</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СОЛАР СПИРИТ АРМОНИ /<br>SOLAR SPIRIT ARMONIE</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>155</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>318</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Родезийский риджбек - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СОЛОВЬЕВ ТУЧКА ЗОЛОТАЯ',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'СОЛОВЬЕВ ТУЧКА ЗОЛОТАЯ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СОЛОВЬЕВ ТУЧКА ЗОЛОТАЯ' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  1,
  352,
  2,
  '{"heats":[{"heat_number":1,"bib_number":3,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,18,16,17],"sum":85},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":14,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,18,18,18,18],"sum":91},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">22</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СОЛОВЬЕВ ТУЧКА ЗОЛОТАЯ /<br>SOLOVYEV TUCHKA ZOLOTAYA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>352</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Русская псовая борзая - Юниоры - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БОРЗЫЕ СЕНАВИАН ЕГОР',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'БОРЗЫЕ СЕНАВИАН ЕГОР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БОРЗЫЕ СЕНАВИАН ЕГОР' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  1,
  357,
  2,
  '{"heats":[{"heat_number":1,"bib_number":5,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,17,18],"sum":89},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":175,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":17,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,19,18,19],"sum":93},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":182,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">23</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">БОРЗЫЕ-СЕНАВИАН ЕГОР /<br>BORZIE-SENAVIAN EGOR</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СИМПЛЕ ОБСЕССИОН ЧАПТЕР ОФ МАЙ ЛАЙФ',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'СИМПЛЕ ОБСЕССИОН ЧАПТЕР ОФ МАЙ ЛАЙФ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИМПЛЕ ОБСЕССИОН ЧАПТЕР ОФ МАЙ ЛАЙФ' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  2,
  350,
  2,
  '{"heats":[{"heat_number":1,"bib_number":5,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,18,18,18],"sum":90},{"judge_number":2,"scores":[16,18,17,16,17],"sum":84}],"total":174,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":17,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,18,18,18],"sum":90},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":176,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">29</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СИМПЛЕ ОБСЕССИОН ЧАПТЕР ОФ МАЙ ЛАЙФ /<br>SIMPLE OBSESSION CHAPTER OF MY LIFE</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>350</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БОРЗЫЕ СЕНАВИАН ДОРА',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'БОРЗЫЕ СЕНАВИАН ДОРА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БОРЗЫЕ СЕНАВИАН ДОРА' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  3,
  349,
  2,
  '{"heats":[{"heat_number":1,"bib_number":4,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,17],"sum":87},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":16,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,18,18,18,19],"sum":92},{"judge_number":2,"scores":[17,17,17,16,17],"sum":84}],"total":176,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">25</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">БОРЗЫЕ-СЕНАВИАН ДОРА /<br>BORZIE-SENAVIAN DORA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>349</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЛУННАЯ РАДУГА ЦАРСКИЙ ЧЕРВОНЕЦ',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ЛУННАЯ РАДУГА ЦАРСКИЙ ЧЕРВОНЕЦ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛУННАЯ РАДУГА ЦАРСКИЙ ЧЕРВОНЕЦ' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  4,
  346,
  2,
  '{"heats":[{"heat_number":1,"bib_number":4,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":170,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":15,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,19,18,18],"sum":91},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":176,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">24</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЛУННАЯ РАДУГА ЦАРСКИЙ ЧЕРВОНЕЦ /<br>LUNNAJA RADUGA CZARSKIJ CHERVONECZ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>346</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЛУННАЯ РАДУГА ФАНТАСТИКА',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ЛУННАЯ РАДУГА ФАНТАСТИКА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛУННАЯ РАДУГА ФАНТАСТИКА' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  5,
  343,
  2,
  '{"heats":[{"heat_number":1,"bib_number":6,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[16,16,16,17,17],"sum":82}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":16,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,17,18,17,18],"sum":88},{"judge_number":2,"scores":[16,17,17,15,17],"sum":82}],"total":170,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">27</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЛУННАЯ РАДУГА ФАНТАСТИКА /<br>LUNNAJA RADUGA FANTASTIKA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>343</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЛУННАЯ РАДУГА ТЕРРИТОРИЯ ЛЮБВИ',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ЛУННАЯ РАДУГА ТЕРРИТОРИЯ ЛЮБВИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛУННАЯ РАДУГА ТЕРРИТОРИЯ ЛЮБВИ' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  6,
  311,
  2,
  '{"heats":[{"heat_number":1,"bib_number":6,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,18,17],"sum":87},{"judge_number":2,"scores":[15,15,16,16,16],"sum":78}],"total":165,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":15,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,16,15,15,15],"sum":77},{"judge_number":2,"scores":[15,15,13,13,13],"sum":69}],"total":146,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">28</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЛУННАЯ РАДУГА ТЕРРИТОРИЯ ЛЮБВИ /<br>LUNNAJA RADUGA TERRITORIYA LYUBVI</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>146</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>311</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗАМИР',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗАМИР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗАМИР' AND breed = 'УИППЕТ'),
  undefined,
  1,
  359,
  2,
  '{"heats":[{"heat_number":1,"bib_number":38,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,18,18,19],"sum":92},{"judge_number":2,"scores":[17,18,18,17,17],"sum":87}],"total":179,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":50,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[18,18,17,18,18],"sum":89}],"total":180,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">35</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗАМИР /<br>STANGERS LAND ZAMIR</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>38</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>50</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>359</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗЕНИТ',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗЕНИТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗЕНИТ' AND breed = 'УИППЕТ'),
  undefined,
  2,
  353,
  2,
  '{"heats":[{"heat_number":1,"bib_number":37,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,18,19,18],"sum":91},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":174,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":50,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,18,19,18],"sum":92},{"judge_number":2,"scores":[18,17,17,17,18],"sum":87}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">36</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗЕНИТ /<br>STANGERS LAND ZENIT</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>37</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>50</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'GUY',
  'УИППЕТ',
  'GUY',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'GUY' AND breed = 'УИППЕТ'),
  undefined,
  3,
  351,
  2,
  '{"heats":[{"heat_number":1,"bib_number":38,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":171,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":51,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":180,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">32</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">GUY</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>38</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>51</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>351</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗЛАТАН',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗЛАТАН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗЛАТАН' AND breed = 'УИППЕТ'),
  undefined,
  4,
  349,
  2,
  '{"heats":[{"heat_number":1,"bib_number":39,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,18,17,17],"sum":89},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":51,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,17,17,18],"sum":88},{"judge_number":2,"scores":[18,18,17,18,18],"sum":89}],"total":177,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">37</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗЛАТАН /<br>STANGERS LAND ZLATAN</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>39</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>51</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>349</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН' AND breed = 'УИППЕТ'),
  undefined,
  5,
  347,
  2,
  '{"heats":[{"heat_number":1,"bib_number":39,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,18,17,18],"sum":90},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":49,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,17,18,18],"sum":89},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":174,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">33</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН /<br>STANGERS LAND VERSAILLES CHARMAN</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>39</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>49</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ВИНСЕНТ',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ВИНСЕНТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ВИНСЕНТ' AND breed = 'УИППЕТ'),
  undefined,
  6,
  343,
  2,
  '{"heats":[{"heat_number":1,"bib_number":37,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,17,18,18,18],"sum":89},{"judge_number":2,"scores":[16,17,16,17,17],"sum":83}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":49,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,17,16,17,17],"sum":84}],"total":171,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">34</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ВИНСЕНТ /<br>STANGERS LAND VINCENT</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>37</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>49</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>343</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДЕНСИ МИДНАЙТ САН',
  'УИППЕТ',
  'ДЕНСИ МИДНАЙТ САН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЕНСИ МИДНАЙТ САН' AND breed = 'УИППЕТ'),
  undefined,
  1,
  363,
  2,
  '{"heats":[{"heat_number":1,"bib_number":43,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,19,19,18],"sum":94},{"judge_number":2,"scores":[17,17,18,17,17],"sum":86}],"total":180,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":53,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,19,18,18],"sum":93},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":183,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">39</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ДЕНСИ МИДНАЙТ САН /<br>DENSI MIDNIGHT SUN</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>43</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>94</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>53</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>183</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">363</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'STANGERS LAND BRIZA',
  'УИППЕТ',
  'STANGERS LAND BRIZA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'STANGERS LAND BRIZA' AND breed = 'УИППЕТ'),
  undefined,
  2,
  361,
  2,
  '{"heats":[{"heat_number":1,"bib_number":43,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[19,19,19,18,19],"sum":94},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":179,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":55,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,19,19,19],"sum":95},{"judge_number":2,"scores":[17,18,17,17,18],"sum":87}],"total":182,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">43</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">STANGERS LAND BRIZA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>43</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>94</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>55</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>95</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>361</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ' AND breed = 'УИППЕТ'),
  undefined,
  3,
  358,
  2,
  '{"heats":[{"heat_number":1,"bib_number":41,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,17,18,19,17],"sum":89},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":175,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":54,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,19,19,18],"sum":94},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":183,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">45</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ВАЛЬДИВИЯ /<br>STANGERS LAND VALDIVIA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>41</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>54</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>94</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>183</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>358</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УИТЧ ФО ШЕРВУД',
  'УИППЕТ',
  'УИТЧ ФО ШЕРВУД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УИТЧ ФО ШЕРВУД' AND breed = 'УИППЕТ'),
  undefined,
  4,
  358,
  2,
  '{"heats":[{"heat_number":1,"bib_number":40,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,18,19,18],"sum":93},{"judge_number":2,"scores":[16,18,17,16,18],"sum":85}],"total":178,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":53,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[19,19,19,18,17],"sum":92},{"judge_number":2,"scores":[18,18,17,17,18],"sum":88}],"total":180,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">47</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">УИТЧ ФО ШЕРВУД /<br>WITCH OF SHERWOOD</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>40</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>53</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>358</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД Е ЛАНЬ',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД Е ЛАНЬ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД Е ЛАНЬ' AND breed = 'УИППЕТ'),
  undefined,
  5,
  357,
  2,
  '{"heats":[{"heat_number":1,"bib_number":41,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,19,18],"sum":91},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":176,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":52,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,18,18,18],"sum":92},{"judge_number":2,"scores":[18,18,17,18,18],"sum":89}],"total":181,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">44</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД Е-ЛАНЬ /<br>STANGERS LAND E-LAN''</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>41</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>52</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РУССКИ ПАРК ПАТРИЦИЯ ГРЕЙС',
  'УИППЕТ',
  'РУССКИ ПАРК ПАТРИЦИЯ ГРЕЙС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РУССКИ ПАРК ПАТРИЦИЯ ГРЕЙС' AND breed = 'УИППЕТ'),
  undefined,
  6,
  355,
  2,
  '{"heats":[{"heat_number":1,"bib_number":42,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,19,19,18],"sum":93},{"judge_number":2,"scores":[16,18,17,17,17],"sum":85}],"total":178,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":55,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":177,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">42</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">РУССКИ ПАРК ПАТРИЦИЯ ГРЕЙС /<br>RUSSKI PARK PATRICIYA GREIS</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>42</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>55</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>355</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'LONDONS FOG LANDVAETTIR',
  'УИППЕТ',
  'LONDON’S FOG LANDVAETTIR',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'LONDONS FOG LANDVAETTIR' AND breed = 'УИППЕТ'),
  undefined,
  7,
  351,
  2,
  '{"heats":[{"heat_number":1,"bib_number":40,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,17,18,18],"sum":89},{"judge_number":2,"scores":[17,17,17,16,17],"sum":84}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":54,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,18,19,18],"sum":92},{"judge_number":2,"scores":[17,17,16,18,18],"sum":86}],"total":178,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">40</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">LONDON’S FOG LANDVAETTIR</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>40</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>54</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>351</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'MAJESTIC ZARYA',
  'УИППЕТ',
  'MAJESTIC ZARYA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'MAJESTIC ZARYA' AND breed = 'УИППЕТ'),
  undefined,
  8,
  351,
  2,
  '{"heats":[{"heat_number":1,"bib_number":42,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,18,18,19],"sum":91},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":176,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":52,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,17,18,17],"sum":88},{"judge_number":2,"scores":[17,18,17,17,18],"sum":87}],"total":175,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">41</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">MAJESTIC ZARYA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>42</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>52</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>351</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УОКИНГ УЭЛШ РУТС',
  'УИППЕТ',
  'УОКИНГ УЭЛШ РУТС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УОКИНГ УЭЛШ РУТС' AND breed = 'УИППЕТ'),
  undefined,
  1,
  365,
  2,
  '{"heats":[{"heat_number":1,"bib_number":45,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[19,19,19,19,18],"sum":94},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":182,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":56,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,19,19,19],"sum":95},{"judge_number":2,"scores":[18,18,18,16,18],"sum":88}],"total":183,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">55</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">УОКИНГ УЭЛШ РУТС /<br>WALKING WELSH ROUTES</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>45</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>94</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>56</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>95</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>183</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">365</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВАСУРУ ТАФФИС БОНД ДЖЕЙМС БОНД',
  'УИППЕТ',
  'ВАСУРУ ТАФФИС БОНД ДЖЕЙМС БОНД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВАСУРУ ТАФФИС БОНД ДЖЕЙМС БОНД' AND breed = 'УИППЕТ'),
  undefined,
  2,
  360,
  2,
  '{"heats":[{"heat_number":1,"bib_number":46,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[19,19,18,18,18],"sum":92},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":178,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":58,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,19,18,18],"sum":91},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":182,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">54</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ВАСУРУ ТАФФИ''С БОНД ДЖЕЙМС БОНД /<br>VASURU TAFFI''S BOND JAMES BOND</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>46</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>58</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>360</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗАДОР',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗАДОР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗАДОР' AND breed = 'УИППЕТ'),
  undefined,
  3,
  360,
  2,
  '{"heats":[{"heat_number":1,"bib_number":46,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,19,19,19],"sum":95},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":181,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":56,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,18,19,19],"sum":93},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">50</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗАДОР /<br>STANGERS LAND ZADOR</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>46</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>95</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>56</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>360</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФЛЕТЧЕР ИЛЛАСТРИАС ВИННЕР',
  'УИППЕТ',
  'ФЛЕТЧЕР ИЛЛАСТРИАС ВИННЕР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФЛЕТЧЕР ИЛЛАСТРИАС ВИННЕР' AND breed = 'УИППЕТ'),
  undefined,
  4,
  352,
  2,
  '{"heats":[{"heat_number":1,"bib_number":44,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,17,18,18],"sum":89},{"judge_number":2,"scores":[16,16,16,16,17],"sum":81}],"total":170,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":57,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[19,20,19,19,19],"sum":96},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":182,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">49</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ФЛЕТЧЕР ИЛЛАСТРИАС ВИННЕР /<br>FLETCHER ILLUSTRIOUS WINNER</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>44</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>57</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">20</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>96</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>352</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФЕЕЛ МАЙ ХЕАРТ БИСКВИТ',
  'УИППЕТ',
  'ФЕЕЛ МАЙ ХЕАРТ БИСКВИТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФЕЕЛ МАЙ ХЕАРТ БИСКВИТ' AND breed = 'УИППЕТ'),
  undefined,
  5,
  348,
  2,
  '{"heats":[{"heat_number":1,"bib_number":45,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,18,18,18],"sum":92},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":177,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":57,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[17,17,16,16,17],"sum":83}],"total":171,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">48</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ФЕЕЛ МАЙ ХЕАРТ БИСКВИТ /<br>FEEL MY HEART BISCUIT</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>45</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>57</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>348</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЧИА ЭССИ ТУАТАРА СТРАЙКЕР',
  'УИППЕТ',
  'ЧИА ЭССИ ТУАТАРА СТРАЙКЕР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧИА ЭССИ ТУАТАРА СТРАЙКЕР' AND breed = 'УИППЕТ'),
  undefined,
  1,
  362,
  2,
  '{"heats":[{"heat_number":1,"bib_number":47,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,19,18],"sum":91},{"judge_number":2,"scores":[17,18,18,18,17],"sum":88}],"total":179,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":60,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,18,18,18],"sum":92},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":183,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">56</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЧИА ЭССИ ТУАТАРА СТРАЙКЕР /<br>CHIA ESSI TUATARA STRAYKER</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>47</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>60</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>183</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">362</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЕЖЕВИКА',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЕЖЕВИКА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЕЖЕВИКА' AND breed = 'УИППЕТ'),
  undefined,
  2,
  358,
  2,
  '{"heats":[{"heat_number":1,"bib_number":47,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,18,19,18],"sum":92},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":178,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":59,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,19,18,18],"sum":91},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":180,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">58</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЕЖЕВИКА /<br>STANGERS LAND EZHEVIKA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>47</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>59</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>358</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА' AND breed = 'УИППЕТ'),
  undefined,
  3,
  352,
  2,
  '{"heats":[{"heat_number":1,"bib_number":48,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,18,17,18],"sum":89},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":59,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,19,18,18],"sum":92},{"judge_number":2,"scores":[17,17,18,18,18],"sum":88}],"total":180,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">59</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗЛАТОСЛАВА /<br>STANGERS LAND ZLATOSLAVA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>48</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>59</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>92</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>352</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'MY WILD ON THE GO',
  'УИППЕТ',
  'MY WILD ON THE GO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'MY WILD ON THE GO' AND breed = 'УИППЕТ'),
  undefined,
  4,
  349,
  2,
  '{"heats":[{"heat_number":1,"bib_number":48,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[17,18,18,16,17],"sum":86}],"total":174,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":60,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,17,16,18],"sum":87},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":175,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">57</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">MY WILD ON THE GO</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>48</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>60</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>349</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УИЛЛ КРЕЙК',
  'ФАРАОНОВА СОБАКА',
  'УИЛЛ КРЕЙК',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УИЛЛ КРЕЙК' AND breed = 'ФАРАОНОВА СОБАКА'),
  undefined,
  1,
  350,
  2,
  '{"heats":[{"heat_number":1,"bib_number":11,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,17,17],"sum":85},{"judge_number":2,"scores":[18,17,17,18,18],"sum":88}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":22,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":177,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">61</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Фараонова собака</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">УИЛЛ КРЕЙК</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>350</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Фараонова собака - Юниоры - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СОСЕДИ ПО ПЛАНЕТЕ РИКОШЕТ',
  'ФАРАОНОВА СОБАКА',
  'СОСЕДИ ПО ПЛАНЕТЕ РИКОШЕТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СОСЕДИ ПО ПЛАНЕТЕ РИКОШЕТ' AND breed = 'ФАРАОНОВА СОБАКА'),
  undefined,
  2,
  345,
  2,
  '{"heats":[{"heat_number":1,"bib_number":11,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":22,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":172,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">60</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Фараонова собака</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СОСЕДИ ПО ПЛАНЕТЕ РИКОШЕТ /<br>SOSEDI PO PLANETE RIKOSHET</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>345</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Фараонова собака - Юниоры - Кобели',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РОССО БОРЕАЛЕ ВИТТОРИЯ СИДА',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'РОССО БОРЕАЛЕ ВИТТОРИЯ СИДА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РОССО БОРЕАЛЕ ВИТТОРИЯ СИДА' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  1,
  362,
  2,
  '{"heats":[{"heat_number":1,"bib_number":28,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":180,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":35,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,19,18,19,18],"sum":93},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":182,"disqualified":false,"disqualification_reason":null}]}',
  'Чемпион РКФ',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">64</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">РОССО БОРЕАЛЕ ВИТТОРИЯ СИДА /<br>ROSSO BOREALE VITTORIYA SIDA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>35</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>362</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ</font></td> ',
  'Чирнеко дель Этна - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ИРКИСС СЛАВА',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'ИРКИСС СЛАВА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ИРКИСС СЛАВА' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  2,
  346,
  2,
  '{"heats":[{"heat_number":1,"bib_number":29,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,18,16],"sum":84},{"judge_number":2,"scores":[17,18,17,17,18],"sum":87}],"total":171,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":35,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,19,17,17],"sum":89},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":175,"disqualified":false,"disqualification_reason":null}]}',
  'CACL',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">63</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ИРКИСС СЛАВА /<br>IRKISS SLAVA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>35</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>346</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACL</font></td> ',
  'Чирнеко дель Этна - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'TESORO SOLARE DOMENICO',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'TESORO SOLARE DOMENICO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'TESORO SOLARE DOMENICO' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  3,
  341,
  2,
  '{"heats":[{"heat_number":1,"bib_number":28,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[17,17,17,16,17],"sum":84}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":36,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,17,17,16,17],"sum":85},{"judge_number":2,"scores":[17,17,17,17,16],"sum":84}],"total":169,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">62</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">TESORO SOLARE DOMENICO</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>36</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>341</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Чирнеко дель Этна - Стандартный - Микс',
  '',
  'Главный судья - Коршунова И.А., судья - Рубина А.В.'
);
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.' WHERE id = undefined;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ХАУС ЗЭ РЭЙНБОУ УЗОЧИ ЗИКИМО',
  'БАСЕНДЖИ',
  'ХАУС ЗЭ РЭЙНБОУ УЗОЧИ ЗИКИМО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ХАУС ЗЭ РЭЙНБОУ УЗОЧИ ЗИКИМО' AND breed = 'БАСЕНДЖИ'),
  undefined,
  1,
  339,
  2,
  '{"heats":[{"heat_number":1,"bib_number":3,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,16,17],"sum":84},{"judge_number":2,"scores":[17,17,16,17,16],"sum":83}],"total":167,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":18,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,17],"sum":87},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":172,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ХАУС ЗЭ РЭЙНБОУ УЗОЧИ ЗИКИМО /<br>HOUSE THE RAINBOW UZOCHI ZIKIMO</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>339</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СИМБА СОНУ',
  'БАСЕНДЖИ',
  'СИМБА СОНУ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИМБА СОНУ' AND breed = 'БАСЕНДЖИ'),
  undefined,
  2,
  337,
  2,
  '{"heats":[{"heat_number":1,"bib_number":2,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[17,16,16,16,17],"sum":82}],"total":167,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":17,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[17,16,17,17,17],"sum":84}],"total":170,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СИМБА СОНУ /<br>SIMBA SONU</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>337</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'SUNRISE LEUR ADAM',
  'БАСЕНДЖИ',
  'SUNRISE LEUR ADAM',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'SUNRISE LEUR ADAM' AND breed = 'БАСЕНДЖИ'),
  undefined,
  3,
  336,
  2,
  '{"heats":[{"heat_number":1,"bib_number":1,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,17,16,17],"sum":84},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":170,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":17,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,15,17],"sum":84},{"judge_number":2,"scores":[16,16,16,17,17],"sum":82}],"total":166,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">SUNRISE LEUR ADAM</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>336</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФЛАВИО ФОНСИ',
  'БАСЕНДЖИ',
  'ФЛАВИО ФОНСИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФЛАВИО ФОНСИ' AND breed = 'БАСЕНДЖИ'),
  undefined,
  4,
  333,
  2,
  '{"heats":[{"heat_number":1,"bib_number":1,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,16,17,17],"sum":84},{"judge_number":2,"scores":[16,16,16,16,16],"sum":80}],"total":164,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":18,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[17,16,16,17,17],"sum":83}],"total":169,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ФЛАВИО ФОНСИ /<br>FLAVIO FONSI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>333</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УИЛЛ ОФ АДАМАНТ',
  'БАСЕНДЖИ',
  'УИЛЛ ОФ АДАМАНТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УИЛЛ ОФ АДАМАНТ' AND breed = 'БАСЕНДЖИ'),
  undefined,
  NULL,
  NULL,
  2,
  '{"heats":[{"heat_number":1,"bib_number":2,"bib_color":"#f0ffff","judges":[],"total":null,"disqualified":true,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"bib_color":null,"judges":[],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'disqualified',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Басенджи</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">УИЛЛ ОФ АДАМАНТ /<br>UILL OF ADAMANT</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td colspan="6" rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Снятие (Агрессия)</font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Басенджи - Стандартный - Кобели',
  'Агрессия',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ARIES KHAN PHREIA PASIPHAE',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'ARIES KHAN PHREIA PASIPHAE',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ARIES KHAN PHREIA PASIPHAE' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  1,
  346,
  2,
  '{"heats":[{"heat_number":1,"bib_number":8,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,16,16,17],"sum":83},{"judge_number":2,"scores":[16,17,17,17,17],"sum":84}],"total":167,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":23,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,19,18,17,18],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ARIES KHAN PHREIA PASIPHAE</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>346</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Родезийский риджбек - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  2,
  344,
  2,
  '{"heats":[{"heat_number":1,"bib_number":8,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,16,17],"sum":85},{"judge_number":2,"scores":[16,18,18,17,17],"sum":86}],"total":171,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":22,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[16,17,17,17,18],"sum":85}],"total":173,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ /<br>ARIES KHAN RIVIERA AL RISHA SANGREAL</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>344</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Родезийский риджбек - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АЙНА ТАНДАЙВ ГРЕЙТ СТАР',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'АЙНА ТАНДАЙВ ГРЕЙТ СТАР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЙНА ТАНДАЙВ ГРЕЙТ СТАР' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  3,
  344,
  2,
  '{"heats":[{"heat_number":1,"bib_number":9,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,16,17],"sum":85},{"judge_number":2,"scores":[17,18,18,17,17],"sum":87}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":22,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,18,17,17],"sum":87},{"judge_number":2,"scores":[16,17,17,17,18],"sum":85}],"total":172,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">АЙНА ТАНДАЙВ ГРЕЙТ СТАР /<br>AINA TANDAIV GREIT STAR</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>344</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Родезийский риджбек - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'CHARISMATIC DOG DULSINEA',
  'РОДЕЗИЙСКИЙ РИДЖБЕК',
  'CHARISMATIC DOG DULSINEA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'CHARISMATIC DOG DULSINEA' AND breed = 'РОДЕЗИЙСКИЙ РИДЖБЕК'),
  undefined,
  4,
  341,
  2,
  '{"heats":[{"heat_number":1,"bib_number":9,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,16,17,17],"sum":85},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":170,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":23,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,17,17,16,17],"sum":84}],"total":171,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Родезийский риджбек</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">CHARISMATIC DOG DULSINEA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>341</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Родезийский риджбек - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЛУННАЯ РАДУГА ФАНТАСТИКА',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ЛУННАЯ РАДУГА ФАНТАСТИКА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛУННАЯ РАДУГА ФАНТАСТИКА' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  1,
  348,
  2,
  '{"heats":[{"heat_number":1,"bib_number":11,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,16,17],"sum":85},{"judge_number":2,"scores":[17,17,16,17,17],"sum":84}],"total":169,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":25,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,17,18,18],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЛУННАЯ РАДУГА ФАНТАСТИКА /<br>LUNNAJA RADUGA FANTASTIKA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>348</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЛУННАЯ РАДУГА ЦАРСКИЙ ЧЕРВОНЕЦ',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ЛУННАЯ РАДУГА ЦАРСКИЙ ЧЕРВОНЕЦ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛУННАЯ РАДУГА ЦАРСКИЙ ЧЕРВОНЕЦ' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  2,
  344,
  2,
  '{"heats":[{"heat_number":1,"bib_number":10,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[17,17,16,17,17],"sum":84}],"total":170,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":24,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,18,18,18],"sum":88},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":174,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЛУННАЯ РАДУГА ЦАРСКИЙ ЧЕРВОНЕЦ /<br>LUNNAJA RADUGA CZARSKIJ CHERVONECZ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>344</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СИМПЛЕ ОБСЕССИОН ЧАПТЕР ОФ МАЙ ЛАЙФ',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'СИМПЛЕ ОБСЕССИОН ЧАПТЕР ОФ МАЙ ЛАЙФ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИМПЛЕ ОБСЕССИОН ЧАПТЕР ОФ МАЙ ЛАЙФ' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  3,
  338,
  2,
  '{"heats":[{"heat_number":1,"bib_number":11,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,17,17,17],"sum":85},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":171,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":24,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,18,16,17],"sum":85},{"judge_number":2,"scores":[16,17,16,16,17],"sum":82}],"total":167,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СИМПЛЕ ОБСЕССИОН ЧАПТЕР ОФ МАЙ ЛАЙФ /<br>SIMPLE OBSESSION CHAPTER OF MY LIFE</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>338</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФАЙЗА',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'ФАЙЗА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФАЙЗА' AND breed = 'РУССКАЯ ПСОВАЯ БОРЗАЯ'),
  undefined,
  NULL,
  73,
  2,
  '{"heats":[{"heat_number":1,"bib_number":10,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[7,10,10,7,7],"sum":41},{"judge_number":2,"scores":[5,10,7,5,5],"sum":32}],"total":73,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"bib_color":null,"judges":[],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Русская псовая борзая</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ФАЙЗА /<br>FAJZA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>41</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Русская псовая борзая - Стандартный - Микс',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АЛЬ НАФИСЭХ ХАЙФА',
  'САЛЮКИ',
  'АЛЬ НАФИСЭХ ХАЙФА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЛЬ НАФИСЭХ ХАЙФА' AND breed = 'САЛЮКИ'),
  undefined,
  1,
  350,
  2,
  '{"heats":[{"heat_number":1,"bib_number":12,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,16,16],"sum":84},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":174,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":27,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[17,18,18,18,17],"sum":88}],"total":176,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Салюки</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">АЛЬ НАФИСЭХ ХАЙФА /<br>AL NAFISEH HAIFA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>350</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Салюки - Стандартный - Микс',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ШАВАТИ ПРАДА',
  'САЛЮКИ',
  'ШАВАТИ ПРАДА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ШАВАТИ ПРАДА' AND breed = 'САЛЮКИ'),
  undefined,
  2,
  344,
  2,
  '{"heats":[{"heat_number":1,"bib_number":12,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":171,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":27,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,18,16,17],"sum":85},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":173,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Салюки</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ШАВАТИ ПРАДА /<br>SHAWATI PRADA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>344</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Салюки - Стандартный - Микс',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'САЛЮКОВ СИНБАД СТОРИ ОФ СЕВЕН СИАС',
  'САЛЮКИ',
  'САЛЮКОВ СИНБАД СТОРИ ОФ СЕВЕН СИАС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'САЛЮКОВ СИНБАД СТОРИ ОФ СЕВЕН СИАС' AND breed = 'САЛЮКИ'),
  undefined,
  3,
  342,
  2,
  '{"heats":[{"heat_number":1,"bib_number":13,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,16,17],"sum":85},{"judge_number":2,"scores":[16,16,16,15,15],"sum":78}],"total":163,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":26,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Салюки</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">САЛЮКОВ СИНБАД СТОРИ ОФ СЕВЕН СИАС /<br>SALUKOV SINDBAD STORY OF SEVEN SEAS</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>342</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Салюки - Стандартный - Микс',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БЕЛЬ ЭТУАЛЬ ЛИБЕРТАНГО',
  'САЛЮКИ',
  'БЕЛЬ ЭТУАЛЬ ЛИБЕРТАНГО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БЕЛЬ ЭТУАЛЬ ЛИБЕРТАНГО' AND breed = 'САЛЮКИ'),
  undefined,
  4,
  336,
  2,
  '{"heats":[{"heat_number":1,"bib_number":13,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,15,16],"sum":83},{"judge_number":2,"scores":[16,16,16,16,17],"sum":81}],"total":164,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":26,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,18,16,17],"sum":85},{"judge_number":2,"scores":[17,18,17,17,18],"sum":87}],"total":172,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Салюки</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">БЕЛЬ ЭТУАЛЬ ЛИБЕРТАНГО /<br>BEL ETUAL LIBERTANGO</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>336</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Салюки - Стандартный - Микс',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗАДОР',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗАДОР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗАДОР' AND breed = 'УИППЕТ'),
  undefined,
  1,
  361,
  2,
  '{"heats":[{"heat_number":1,"bib_number":39,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,17,18,18],"sum":89},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":180,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":53,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,18,18,18],"sum":90},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":181,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗАДОР /<br>STANGERS LAND ZADOR</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>39</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>53</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязаний">361</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФЕЕЛ МАЙ ХЕАРТ БИСКВИТ',
  'УИППЕТ',
  'ФЕЕЛ МАЙ ХЕАРТ БИСКВИТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФЕЕЛ МАЙ ХЕАРТ БИСКВИТ' AND breed = 'УИППЕТ'),
  undefined,
  2,
  360,
  2,
  '{"heats":[{"heat_number":1,"bib_number":38,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,18,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":177,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":54,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,19,18,18,18],"sum":90},{"judge_number":2,"scores":[19,19,19,18,18],"sum":93}],"total":183,"disqualified":false,"disqualification_reason":null}]}',
  'CACLBr',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ФЕЕЛ МАЙ ХЕАРТ БИСКВИТ /<br>FEEL MY HEART BISCUIT</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>38</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>54</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>183</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязаний">360</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACLBr</font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗОДИАК',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗОДИАК',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗОДИАК' AND breed = 'УИППЕТ'),
  undefined,
  3,
  358,
  2,
  '{"heats":[{"heat_number":1,"bib_number":39,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,18,18],"sum":88},{"judge_number":2,"scores":[17,18,17,18,18],"sum":88}],"total":176,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":52,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,19,18,17,18],"sum":89},{"judge_number":2,"scores":[18,20,19,18,18],"sum":93}],"total":182,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗОДИАК /<br>STANGERS LAND ZODIAK</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>39</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>52</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>358</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФЛЕТЧЕР ИЛЛАСТРИАС ВИННЕР',
  'УИППЕТ',
  'ФЛЕТЧЕР ИЛЛАСТРИАС ВИННЕР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФЛЕТЧЕР ИЛЛАСТРИАС ВИННЕР' AND breed = 'УИППЕТ'),
  undefined,
  4,
  357,
  2,
  '{"heats":[{"heat_number":1,"bib_number":37,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,18,18],"sum":88},{"judge_number":2,"scores":[19,18,18,18,18],"sum":91}],"total":179,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":53,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,19,18,17,18],"sum":88},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ФЛЕТЧЕР ИЛЛАСТРИАС ВИННЕР /<br>FLETCHER ILLUSTRIOUS WINNER</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>37</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>53</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ALPHAS LEGACY ALTAIR',
  'УИППЕТ',
  'ALPHAS LEGACY ALTAIR',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ALPHAS LEGACY ALTAIR' AND breed = 'УИППЕТ'),
  undefined,
  5,
  357,
  2,
  '{"heats":[{"heat_number":1,"bib_number":37,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,19,17,18,18],"sum":88},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":179,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":51,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,19,18,17,18],"sum":88},{"judge_number":2,"scores":[17,19,18,18,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ALPHAS LEGACY ALTAIR</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>37</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>51</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'КУПИДОН',
  'УИППЕТ',
  'КУПИДОН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КУПИДОН' AND breed = 'УИППЕТ'),
  undefined,
  6,
  356,
  2,
  '{"heats":[{"heat_number":1,"bib_number":38,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,18,18],"sum":88},{"judge_number":2,"scores":[18,18,17,18,18],"sum":89}],"total":177,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":54,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,17,18,18],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">КУПИДОН /<br>KUPIDON</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>38</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>54</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>356</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ИСТОРИЯ ЛЮБВИ ИЗУМРУД',
  'УИППЕТ',
  'ИСТОРИЯ ЛЮБВИ ИЗУМРУД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ИСТОРИЯ ЛЮБВИ ИЗУМРУД' AND breed = 'УИППЕТ'),
  undefined,
  7,
  356,
  2,
  '{"heats":[{"heat_number":1,"bib_number":40,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,17,17,18],"sum":88},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":51,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,19,18,16,18],"sum":88},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ИСТОРИЯ ЛЮБВИ ИЗУМРУД</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>40</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>51</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>356</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВАСУРУ ТАФФИС БОНД ДЖЕЙМС БОНД',
  'УИППЕТ',
  'ВАСУРУ ТАФФИС БОНД ДЖЕЙМС БОНД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВАСУРУ ТАФФИС БОНД ДЖЕЙМС БОНД' AND breed = 'УИППЕТ'),
  undefined,
  8,
  355,
  2,
  '{"heats":[{"heat_number":1,"bib_number":40,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,18,18],"sum":87},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":176,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":52,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,19,18,17,18],"sum":88},{"judge_number":2,"scores":[19,18,18,18,18],"sum":91}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ВАСУРУ ТАФФИ''С БОНД ДЖЕЙМС БОНД /<br>VASURU TAFFI''S BOND JAMES BOND</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>40</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>52</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>355</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ГЕНДАЛЬФ ИЗ СОЗВЕЗДИЯ СУРСКИХ ПСОВ',
  'УИППЕТ',
  'ГЕНДАЛЬФ ИЗ СОЗВЕЗДИЯ СУРСКИХ ПСОВ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ГЕНДАЛЬФ ИЗ СОЗВЕЗДИЯ СУРСКИХ ПСОВ' AND breed = 'УИППЕТ'),
  undefined,
  NULL,
  NULL,
  2,
  '{"heats":[{"heat_number":1,"bib_number":41,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,17,16,18],"sum":85},{"judge_number":2,"scores":[16,18,17,17,17],"sum":85}],"total":170,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":55,"bib_color":"red","judges":[],"total":null,"disqualified":true,"disqualification_reason":null}]}',
  '',
  '',
  'disqualified',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ГЕНДАЛЬФ ИЗ СОЗВЕЗДИЯ СУРСКИХ ПСОВ /<br>GENDALF IZ SOZVEZDIYA SURSKIKH PSOV</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>41</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>55</i></font></td> <td colspan="6" rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Потеря приманки)</font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Кобели',
  'Потеря приманки',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'MY WILD ON THE GO',
  'УИППЕТ',
  'MY WILD ON THE GO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'MY WILD ON THE GO' AND breed = 'УИППЕТ'),
  undefined,
  1,
  361,
  2,
  '{"heats":[{"heat_number":1,"bib_number":44,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,17,17,18],"sum":88},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":179,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":56,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,20,18,17,18],"sum":91},{"judge_number":2,"scores":[17,19,19,18,18],"sum":91}],"total":182,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">MY WILD ON THE GO</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>44</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>56</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">20</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязаний">361</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЕЖЕВИКА',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЕЖЕВИКА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЕЖЕВИКА' AND breed = 'УИППЕТ'),
  undefined,
  2,
  358,
  2,
  '{"heats":[{"heat_number":1,"bib_number":42,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,19,17,18,18],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":179,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":56,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,19,17,17,18],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  'CACLBr',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЕЖЕВИКА /<br>STANGERS LAND EZHEVIKA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>42</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>56</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>358</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACLBr</font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЛАКШЕРИ ВИПП ОКСИ',
  'УИППЕТ',
  'ЛАКШЕРИ ВИПП ОКСИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛАКШЕРИ ВИПП ОКСИ' AND breed = 'УИППЕТ'),
  undefined,
  3,
  356,
  2,
  '{"heats":[{"heat_number":1,"bib_number":43,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,16,18],"sum":86},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":175,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":57,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,17,17,18],"sum":89},{"judge_number":2,"scores":[18,19,19,18,18],"sum":92}],"total":181,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЛАКШЕРИ ВИПП ОКСИ /<br>LUXURY WHIPP OXXY</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>43</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>57</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>356</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА' AND breed = 'УИППЕТ'),
  undefined,
  4,
  353,
  2,
  '{"heats":[{"heat_number":1,"bib_number":43,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,17,17,18,18],"sum":87}],"total":174,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":57,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,19,18,17,18],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗЛАТОСЛАВА /<br>STANGERS LAND ZLATOSLAVA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>43</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>57</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЛАКШЕРИ ВИПП НЬЮ БЕЛЛЕ',
  'УИППЕТ',
  'ЛАКШЕРИ ВИПП НЬЮ БЕЛЛЕ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛАКШЕРИ ВИПП НЬЮ БЕЛЛЕ' AND breed = 'УИППЕТ'),
  undefined,
  5,
  326,
  2,
  '{"heats":[{"heat_number":1,"bib_number":42,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,18,18],"sum":88},{"judge_number":2,"scores":[18,18,17,18,18],"sum":89}],"total":177,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":58,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[12,12,12,12,16],"sum":64},{"judge_number":2,"scores":[17,18,17,16,17],"sum":85}],"total":149,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЛАКШЕРИ ВИПП НЬЮ БЕЛЛЕ /<br>LUXURY WHIPP NEW BELLE</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>42</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>58</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>64</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>149</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>326</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЛАКШЕРИ ВИПП ОМЕГА',
  'УИППЕТ',
  'ЛАКШЕРИ ВИПП ОМЕГА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛАКШЕРИ ВИПП ОМЕГА' AND breed = 'УИППЕТ'),
  undefined,
  6,
  324,
  2,
  '{"heats":[{"heat_number":1,"bib_number":44,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":177,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":58,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,12,12,12,15],"sum":63},{"judge_number":2,"scores":[16,17,17,17,17],"sum":84}],"total":147,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный-спринтеры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ЛАКШЕРИ ВИПП ОМЕГА /<br>LUXURY WHIPP OMEGA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>44</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>58</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>63</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>147</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>324</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный-спринтеры - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗАМИР',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗАМИР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗАМИР' AND breed = 'УИППЕТ'),
  undefined,
  1,
  356,
  2,
  '{"heats":[{"heat_number":1,"bib_number":31,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":177,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":46,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,18,18,18],"sum":90},{"judge_number":2,"scores":[17,19,17,18,18],"sum":89}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">21</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗАМИР /<br>STANGERS LAND ZAMIR</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>46</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>356</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН' AND breed = 'УИППЕТ'),
  undefined,
  2,
  355,
  2,
  '{"heats":[{"heat_number":1,"bib_number":31,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,17,17,18],"sum":86},{"judge_number":2,"scores":[18,17,17,17,18],"sum":87}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":45,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,18,18,18],"sum":90},{"judge_number":2,"scores":[18,19,18,19,18],"sum":92}],"total":182,"disqualified":false,"disqualification_reason":null}]}',
  'CACLBr',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">20</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН /<br>STANGERS LAND VERSAILLES CHARMAN</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>45</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>355</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACLBr</font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ЗЕНИТ',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ЗЕНИТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ЗЕНИТ' AND breed = 'УИППЕТ'),
  undefined,
  3,
  353,
  2,
  '{"heats":[{"heat_number":1,"bib_number":33,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,16,18],"sum":85},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":175,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":46,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,19,17,17,18],"sum":88},{"judge_number":2,"scores":[18,19,18,17,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">22</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ЗЕНИТ /<br>STANGERS LAND ZENIT</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>46</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БИЛЛИ БОНС',
  'УИППЕТ',
  'БИЛЛИ БОНС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БИЛЛИ БОНС' AND breed = 'УИППЕТ'),
  undefined,
  4,
  351,
  2,
  '{"heats":[{"heat_number":1,"bib_number":33,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,16,17,18],"sum":85},{"judge_number":2,"scores":[17,17,17,18,18],"sum":87}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":47,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":179,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">БИЛЛИ БОНС /<br>BILLY BONES</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>47</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>351</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'GUY',
  'УИППЕТ',
  'GUY',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'GUY' AND breed = 'УИППЕТ'),
  undefined,
  5,
  351,
  2,
  '{"heats":[{"heat_number":1,"bib_number":32,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,17,16,18],"sum":85},{"judge_number":2,"scores":[17,18,18,18,17],"sum":88}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":45,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[18,19,17,18,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">GUY</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>45</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>351</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'КЕТЛИН ДАРСИ',
  'УИППЕТ',
  'КЕТЛИН ДАРСИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КЕТЛИН ДАРСИ' AND breed = 'УИППЕТ'),
  undefined,
  6,
  347,
  2,
  '{"heats":[{"heat_number":1,"bib_number":32,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,17,18],"sum":86},{"judge_number":2,"scores":[18,17,17,17,17],"sum":86}],"total":172,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":47,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,18,15,18],"sum":87},{"judge_number":2,"scores":[17,19,17,17,18],"sum":88}],"total":175,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">КЕТЛИН ДАРСИ /<br>KETLIN DARCY</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>47</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РУССКИ ПАРК ПАТРИЦИЯ ГРЕЙС',
  'УИППЕТ',
  'РУССКИ ПАРК ПАТРИЦИЯ ГРЕЙС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РУССКИ ПАРК ПАТРИЦИЯ ГРЕЙС' AND breed = 'УИППЕТ'),
  undefined,
  1,
  355,
  2,
  '{"heats":[{"heat_number":1,"bib_number":34,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,16,17,18],"sum":85},{"judge_number":2,"scores":[17,18,17,18,18],"sum":88}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":49,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,18,18,18],"sum":90},{"judge_number":2,"scores":[19,19,18,18,18],"sum":92}],"total":182,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">26</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">РУССКИ ПАРК ПАТРИЦИЯ ГРЕЙС /<br>RUSSKI PARK PATRICIYA GREIS</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>49</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>355</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АФИНА ФИЕСТА СВИТ ТАНГО',
  'УИППЕТ',
  'АФИНА ФИЕСТА СВИТ ТАНГО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АФИНА ФИЕСТА СВИТ ТАНГО' AND breed = 'УИППЕТ'),
  undefined,
  2,
  354,
  2,
  '{"heats":[{"heat_number":1,"bib_number":34,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,17,18],"sum":86},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":176,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":48,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,19,18,16,18],"sum":88},{"judge_number":2,"scores":[18,19,18,17,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null}]}',
  'CACLBr',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">24</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">АФИНА ФИЕСТА СВИТ ТАНГО /<br>AFINA FIESTA SWEET TANGO</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>48</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>354</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACLBr</font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД Е ЛАНЬ',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД Е ЛАНЬ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД Е ЛАНЬ' AND breed = 'УИППЕТ'),
  undefined,
  3,
  354,
  2,
  '{"heats":[{"heat_number":1,"bib_number":35,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,17,18],"sum":86},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":176,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":48,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,19,18,17,18],"sum":88},{"judge_number":2,"scores":[19,18,17,18,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">28</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД Е-ЛАНЬ /<br>STANGERS LAND E-LAN''</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>35</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>48</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>354</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'LONDONS FOG LANDVAETTIR',
  'УИППЕТ',
  'LONDON’S FOG LANDVAETTIR',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'LONDONS FOG LANDVAETTIR' AND breed = 'УИППЕТ'),
  undefined,
  4,
  345,
  2,
  '{"heats":[{"heat_number":1,"bib_number":35,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,16,15,16],"sum":81},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":167,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":49,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">23</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">LONDON’S FOG LANDVAETTIR</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>35</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>49</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>345</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ',
  'УИППЕТ',
  'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ' AND breed = 'УИППЕТ'),
  undefined,
  5,
  344,
  2,
  '{"heats":[{"heat_number":1,"bib_number":36,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,18,18],"sum":88},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":1611,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":50,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,19,18,17,18],"sum":89},{"judge_number":2,"scores":[19,19,19,19,18],"sum":94}],"total":183,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">27</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Уиппет</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">СТАНГЕРС ЛАНД ВАЛЬДИВИЯ /<br>STANGERS LAND VALDIVIA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>36</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161<a title="Ранний старт (штраф 10% от суммы баллов забега)" href="#remark"><sup>1</sup></a></b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>50</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>183</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>344</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Уиппет - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ТЕМПЛ ВЕЛЕС ДЕВАЙН ДИВИНИТИ',
  'ФАРАОНОВА СОБАКА',
  'ТЕМПЛ ВЕЛЕС ДЕВАЙН ДИВИНИТИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ТЕМПЛ ВЕЛЕС ДЕВАЙН ДИВИНИТИ' AND breed = 'ФАРАОНОВА СОБАКА'),
  undefined,
  1,
  340,
  2,
  '{"heats":[{"heat_number":1,"bib_number":15,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[16,16,16,17,17],"sum":82}],"total":168,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":29,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":172,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Фараонова собака</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ТЕМПЛ ВЕЛЕС ДЕВАЙН ДИВИНИТИ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>340</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Фараонова собака - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'TEMPLE VELES CHOCOLATE',
  'ФАРАОНОВА СОБАКА',
  'TEMPLE VELES CHOCOLATE',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'TEMPLE VELES CHOCOLATE' AND breed = 'ФАРАОНОВА СОБАКА'),
  undefined,
  2,
  339,
  2,
  '{"heats":[{"heat_number":1,"bib_number":16,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,16,17,17],"sum":85},{"judge_number":2,"scores":[17,17,16,17,17],"sum":84}],"total":169,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":29,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,16,16,17,17],"sum":83}],"total":170,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Фараонова собака</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">TEMPLE VELES CHOCOLATE</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>339</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Фараонова собака - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РОКСИ ИФЕ ШАНИ ИЗ ШНЕЙДЕР РИЧ',
  'ФАРАОНОВА СОБАКА',
  'РОКСИ ИФЕ ШАНИ ИЗ ШНЕЙДЕР РИЧ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РОКСИ ИФЕ ШАНИ ИЗ ШНЕЙДЕР РИЧ' AND breed = 'ФАРАОНОВА СОБАКА'),
  undefined,
  3,
  335,
  2,
  '{"heats":[{"heat_number":1,"bib_number":15,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,17,16,17],"sum":84},{"judge_number":2,"scores":[15,17,16,16,16],"sum":80}],"total":164,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":30,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,18,16,18],"sum":87},{"judge_number":2,"scores":[16,17,17,17,17],"sum":84}],"total":171,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Фараонова собака</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">РОКСИ ИФЕ ШАНИ ИЗ ШНЕЙДЕР РИЧ /<br>ROKSI IFE SHANI IZ SCHNEIDER RICH</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>335</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Фараонова собака - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БЛЭКСИ ШАЙН ГАЛАТЕЯ',
  'ФАРАОНОВА СОБАКА',
  'БЛЭКСИ ШАЙН ГАЛАТЕЯ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БЛЭКСИ ШАЙН ГАЛАТЕЯ' AND breed = 'ФАРАОНОВА СОБАКА'),
  undefined,
  1,
  339,
  2,
  '{"heats":[{"heat_number":1,"bib_number":14,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,16,17],"sum":85},{"judge_number":2,"scores":[15,16,16,16,16],"sum":79}],"total":164,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":28,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,17,19],"sum":90},{"judge_number":2,"scores":[16,17,17,17,18],"sum":85}],"total":175,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Фараонова собака</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">БЛЭКСИ ШАЙН ГАЛАТЕЯ /<br>BLACKSEA SHINE GALATEYA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>339</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Фараонова собака - Юниоры - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ИРКИСС СИД',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'ИРКИСС СИД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ИРКИСС СИД' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  1,
  345,
  2,
  '{"heats":[{"heat_number":1,"bib_number":5,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,17,16,17],"sum":84},{"judge_number":2,"scores":[18,19,18,17,17],"sum":89}],"total":173,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":19,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,17,18],"sum":86},{"judge_number":2,"scores":[18,17,17,17,17],"sum":86}],"total":172,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ИРКИСС СИД /<br>IRKISS SID</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>345</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Чирнеко дель Этна - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'МИА САНТОС РИКАРДО',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'МИА САНТОС РИКАРДО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МИА САНТОС РИКАРДО' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  2,
  345,
  2,
  '{"heats":[{"heat_number":1,"bib_number":4,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,17,16,17],"sum":84},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":175,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":19,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,18,16,18],"sum":86},{"judge_number":2,"scores":[16,18,17,16,17],"sum":84}],"total":170,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">МИА САНТО''С РИКАРДО /<br>MIA SANTO''S RICARDO</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>345</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Чирнеко дель Этна - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ИНДИАНА ДЖОНС',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'ИНДИАНА ДЖОНС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ИНДИАНА ДЖОНС' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  3,
  344,
  2,
  '{"heats":[{"heat_number":1,"bib_number":5,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,16,17,17],"sum":85},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":171,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":20,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":173,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ИНДИАНА ДЖОНС /<br>INDIANA JONES</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>344</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Чирнеко дель Этна - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'TESORO SOLARE DOMENICO',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'TESORO SOLARE DOMENICO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'TESORO SOLARE DOMENICO' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  4,
  275,
  2,
  '{"heats":[{"heat_number":1,"bib_number":4,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,16,16,16],"sum":82},{"judge_number":2,"scores":[17,17,16,16,17],"sum":83}],"total":165,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":20,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[4,10,10,7,7],"sum":38},{"judge_number":2,"scores":[14,15,15,14,14],"sum":72}],"total":110,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">TESORO SOLARE DOMENICO</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>38</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>110</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>275</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Чирнеко дель Этна - Стандартный - Кобели',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РОССО БОРЕАЛЕ ИРКИСС',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'РОССО БОРЕАЛЕ ИРКИСС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РОССО БОРЕАЛЕ ИРКИСС' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  1,
  336,
  2,
  '{"heats":[{"heat_number":1,"bib_number":6,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,17,16,17],"sum":84},{"judge_number":2,"scores":[17,18,17,18,17],"sum":87}],"total":171,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":21,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,18,16,18],"sum":87},{"judge_number":2,"scores":[15,17,15,15,16],"sum":78}],"total":165,"disqualified":false,"disqualification_reason":null}]}',
  'ПЧРКФ РК',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">РОССО БОРЕАЛЕ ИРКИСС /<br>ROSSO BOREALE IRKISS</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>336</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПЧРКФ РК</font></td> ',
  'Чирнеко дель Этна - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ИРКИСС СОФИЯ',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'ИРКИСС СОФИЯ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ИРКИСС СОФИЯ' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  2,
  316,
  2,
  '{"heats":[{"heat_number":1,"bib_number":6,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,16,17,17],"sum":84},{"judge_number":2,"scores":[16,19,17,17,17],"sum":86}],"total":170,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":21,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,14,17],"sum":83},{"judge_number":2,"scores":[16,17,15,15,16],"sum":79}],"total":1461,"disqualified":false,"disqualification_reason":null}]}',
  '',
  'CC',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ИРКИСС СОФИЯ /<br>IRKISS SOPHIA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>146<a title="Ранний старт (штраф 10% от суммы баллов забега)" href="#remark"><sup>1</sup></a></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>316</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Чирнеко дель Этна - Стандартный - Суки',
  '',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ROSSO BOREALE AURORA',
  'ЧИРНЕКО ДЕЛЬ ЭТНА',
  'ROSSO BOREALE AURORA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ROSSO BOREALE AURORA' AND breed = 'ЧИРНЕКО ДЕЛЬ ЭТНА'),
  undefined,
  NULL,
  NULL,
  2,
  '{"heats":[{"heat_number":1,"bib_number":7,"bib_color":"red","judges":[],"total":null,"disqualified":true,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"bib_color":null,"judges":[],"total":null,"disqualified":false,"disqualification_reason":null}]}',
  '',
  '',
  'disqualified',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Чирнеко дель Этна</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ROSSO BOREALE AURORA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td colspan="6" rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Сошла)</font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Чирнеко дель Этна - Стандартный - Суки',
  'Сошла',
  'Главный судья - Лукина Д.М., судья - Кузнецова Н.Н.'
);
DELETE FROM results WHERE event_id = undefined;
UPDATE events SET judges = 'Главный судья - Лукина Д.М., судья - Карелина Н.В.' WHERE id = undefined;