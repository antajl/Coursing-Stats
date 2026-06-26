DELETE FROM results WHERE event_id = 1077;
UPDATE events SET track_schemes = '[{"number":1,"url":"http://procoursing.ru/2026/2026-04-04_M1.png","name":"Схема трассы","length":"700 м"},{"number":1,"url":"http://procoursing.ru/2026/2026-04-04_M2.png","name":"Схема трассы","length":"700 м"}]', judges = 'Лукина Д.М., судья' WHERE id = 1077;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'MILORD RICHARD IZ RELAX LANDA',
  'БЕДЛИНГТОН ТЕРЬЕР',
  'MILORD RICHARD IZ RELAX LANDA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'MILORD RICHARD IZ RELAX LANDA' AND breed = 'БЕДЛИНГТОН ТЕРЬЕР'),
  1077,
  1,
  328,
  2,
  '{"heats":[{"heat_number":1,"bib_number":43,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[15,15,14,16,17],"sum":77}],"total":162},{"heat_number":2,"bib_number":63,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,15,16],"sum":82},{"judge_number":2,"scores":[17,17,16,16,18],"sum":84}],"total":166,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"raw_total":328,"normalized_score":328}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бедлингтон терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">MILORD RICHARD  IZ RELAX LANDA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>43</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>63</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">328</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бедлингтон терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВЕРСАЧЕ БРАЙТ КРИСТАЛ /VERSACE BRIGHT CRYSTAL',
  'БИГЛЬ',
  'ВЕРСАЧЕ БРАЙТ КРИСТАЛ /VERSACE BRIGHT CRYSTAL',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВЕРСАЧЕ БРАЙТ КРИСТАЛ /VERSACE BRIGHT CRYSTAL' AND breed = 'БИГЛЬ'),
  1077,
  1,
  298,
  2,
  '{"heats":[{"heat_number":1,"bib_number":45,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,10,15],"sum":75},{"judge_number":2,"scores":[14,14,14,13,14],"sum":69}],"total":144},{"heat_number":2,"bib_number":63,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,17,17,14,16],"sum":79},{"judge_number":2,"scores":[15,15,15,14,16],"sum":75}],"total":154,"disqualified":false,"disqualification_reason":null}],"grand_total":298,"raw_total":298,"normalized_score":298}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВЕРСАЧЕ БРАЙТ КРИСТАЛ /<br>VERSACE BRIGHT CRYSTAL</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>45</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>75</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>144</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>63</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>154</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>298</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'КУРАЖ КЛАБ ГОДДЕСС /COURAGE CLUB GODDESS',
  'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ',
  'КУРАЖ КЛАБ ГОДДЕСС /COURAGE CLUB GODDESS',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КУРАЖ КЛАБ ГОДДЕСС /COURAGE CLUB GODDESS' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1077,
  1,
  328,
  2,
  '{"heats":[{"heat_number":1,"bib_number":42,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,17,16,17],"sum":84},{"judge_number":2,"scores":[15,16,16,17,17],"sum":81}],"total":165},{"heat_number":2,"bib_number":64,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,15,17],"sum":83},{"judge_number":2,"scores":[16,16,16,15,17],"sum":80}],"total":163,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"raw_total":328,"normalized_score":328}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КУРАЖ КЛАБ ГОДДЕСС /<br>COURAGE CLUB GODDESS</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>42</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>64</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Бультерьер миниатюрный - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БАТИДА ДЕ КОКО',
  'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ',
  'БАТИДА ДЕ КОКО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БАТИДА ДЕ КОКО' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1077,
  2,
  325,
  2,
  '{"heats":[{"heat_number":1,"bib_number":44,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[14,14,14,17,16],"sum":75}],"total":160},{"heat_number":2,"bib_number":62,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,16,16,17],"sum":83},{"judge_number":2,"scores":[17,17,16,16,16],"sum":82}],"total":165,"disqualified":false,"disqualification_reason":null}],"grand_total":325,"raw_total":325,"normalized_score":325}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БАТИДА ДЕ КОКО</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>44</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>62</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>325</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Бультерьер миниатюрный - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'МАРЛЕН БРАО ЧАРОДЕЙ /MARLEN BRAO CHARODEI',
  'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ',
  'МАРЛЕН БРАО ЧАРОДЕЙ /MARLEN BRAO CHARODEI',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МАРЛЕН БРАО ЧАРОДЕЙ /MARLEN BRAO CHARODEI' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1077,
  3,
  325,
  2,
  '{"heats":[{"heat_number":1,"bib_number":42,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[15,15,15,16,17],"sum":78}],"total":161},{"heat_number":2,"bib_number":62,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,16,17,17],"sum":84},{"judge_number":2,"scores":[16,16,16,16,16],"sum":80}],"total":164,"disqualified":false,"disqualification_reason":null}],"grand_total":325,"raw_total":325,"normalized_score":325}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МАРЛЕН-БРАО ЧАРОДЕЙ /<br>MARLEN-BRAO CHARODEI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>42</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>62</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>325</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Бультерьер миниатюрный - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БРЭНА /BRENA',
  'ДЖЕК РАССЕЛ ТЕРЬЕР',
  'БРЭНА /BRENA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БРЭНА /BRENA' AND breed = 'ДЖЕК РАССЕЛ ТЕРЬЕР'),
  1077,
  1,
  331,
  2,
  '{"heats":[{"heat_number":1,"bib_number":46,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,17,17,19],"sum":87},{"judge_number":2,"scores":[15,15,14,17,17],"sum":78}],"total":165},{"heat_number":2,"bib_number":65,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,16,17,18],"sum":85},{"judge_number":2,"scores":[16,16,15,17,17],"sum":81}],"total":166,"disqualified":false,"disqualification_reason":null}],"grand_total":331,"raw_total":331,"normalized_score":331}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Джек Рассел Терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БРЭНА /<br>BRENA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>46</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>65</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">331</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Джек Рассел Терьер - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS',
  'САМОЕД',
  'СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS' AND breed = 'САМОЕД'),
  1077,
  1,
  336,
  2,
  '{"heats":[{"heat_number":1,"bib_number":47,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,18,18],"sum":87},{"judge_number":2,"scores":[16,16,16,17,17],"sum":82}],"total":169},{"heat_number":2,"bib_number":66,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,16,17,18],"sum":85},{"judge_number":2,"scores":[16,16,16,17,17],"sum":82}],"total":167,"disqualified":false,"disqualification_reason":null}],"grand_total":336,"raw_total":336,"normalized_score":336}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Самоед</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /<br>SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>47</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>66</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">336</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Самоед - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN',
  'ЦВЕРГПИНЧЕР',
  'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN' AND breed = 'ЦВЕРГПИНЧЕР'),
  1077,
  1,
  324,
  2,
  '{"heats":[{"heat_number":1,"bib_number":48,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,15,16],"sum":82},{"judge_number":2,"scores":[16,16,16,15,16],"sum":79}],"total":161},{"heat_number":2,"bib_number":67,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,15,17],"sum":82},{"judge_number":2,"scores":[16,17,16,15,17],"sum":81}],"total":163,"disqualified":false,"disqualification_reason":null}],"grand_total":324,"raw_total":324,"normalized_score":324}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Цвергпинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /<br>TSESVIL GARDEN IRINUS GOLD BREIN</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>48</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>67</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>324</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Цвергпинчер - Стандартный - Кобели',
  ''
);
DELETE FROM results WHERE event_id = 1079;
UPDATE events SET judges = 'Карелина Н.В.' WHERE id = 1079;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ZHE TEM KASPER',
  'БЕЛАЯ ШВЕЙЦАРСКАЯ ОВЧАРКА',
  'ZHE TEM KASPER',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ZHE TEM KASPER' AND breed = 'БЕЛАЯ ШВЕЙЦАРСКАЯ ОВЧАРКА'),
  1079,
  1,
  142,
  1,
  '{"heats":[{"heat_number":1,"bib_number":29,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,14,13,15,16],"sum":72}],"total":72},{"heat_number":2,"bib_number":32,"bib_color":"red","judges":[{"judge_number":1,"scores":[13,14,12,15,16],"sum":70}],"total":70,"disqualified":false,"disqualification_reason":null}],"grand_total":142,"raw_total":142,"normalized_score":142}',
  '',
  '',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Белая швейцарская овчарка</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ZHE TEM KASPER</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>72</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>70</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>70</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>142</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Белая швейцарская овчарка - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'PARMA VON AVERSWALD',
  'НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ',
  'PARMA VON AVERSWALD',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'PARMA VON AVERSWALD' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ'),
  1079,
  1,
  173,
  1,
  '{"heats":[{"heat_number":1,"bib_number":30,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,18,16,18],"sum":86}],"total":86},{"heat_number":2,"bib_number":33,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,18,17,18],"sum":87}],"total":87,"disqualified":false,"disqualification_reason":null}],"grand_total":173,"raw_total":173,"normalized_score":173}',
  '',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка стандартная</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">PARMA VON AVERSWALD</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>86</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>87</b></font></td> <td bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">173</abbr></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкая овчарка стандартная - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ONIKS PERSEY',
  'БИГЛЬ',
  'ONIKS PERSEY',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ONIKS PERSEY' AND breed = 'БИГЛЬ'),
  1079,
  1,
  164,
  1,
  '{"heats":[{"heat_number":1,"bib_number":28,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83}],"total":83},{"heat_number":2,"bib_number":31,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,17,17,15,18],"sum":81}],"total":81,"disqualified":false,"disqualification_reason":null}],"grand_total":164,"raw_total":164,"normalized_score":164}',
  '',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ONIKS PERSEY</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>83</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>81</b></font></td> <td bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">164</abbr></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'GOLDEN APPLE',
  'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (ВЫЖЛА)',
  'GOLDEN APPLE',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'GOLDEN APPLE' AND breed = 'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (ВЫЖЛА)'),
  1079,
  1,
  176,
  1,
  '{"heats":[{"heat_number":1,"bib_number":30,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88}],"total":88},{"heat_number":2,"bib_number":33,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,18,18,18,18],"sum":88}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":176,"raw_total":176,"normalized_score":176}',
  '',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Венгерская короткошёрстная легавая (Выжла)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">GOLDEN APPLE</font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>88</b></font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>88</b></font></td> <td bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">176</abbr></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская короткошёрстная легавая (Выжла) - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'SEVAN',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'SEVAN',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'SEVAN' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1079,
  1,
  158,
  1,
  '{"heats":[{"heat_number":1,"bib_number":19,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,16,16,16,16],"sum":78}],"total":78},{"heat_number":2,"bib_number":24,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,16,15,17,17],"sum":80}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":158,"raw_total":158,"normalized_score":158}',
  '',
  '',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">SEVAN</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>78</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>158</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский голый терьер - Юниоры - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФАБИАН ДОМИНЕРИНГ',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'ФАБИАН ДОМИНЕРИНГ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФАБИАН ДОМИНЕРИНГ' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1079,
  1,
  162,
  1,
  '{"heats":[{"heat_number":1,"bib_number":21,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,17,17,15,17],"sum":81}],"total":81},{"heat_number":2,"bib_number":25,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,16,16,17],"sum":81}],"total":81,"disqualified":false,"disqualification_reason":null}],"grand_total":162,"raw_total":162,"normalized_score":162}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ФАБИАН ДОМИНЕРИНГ</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>81</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>162</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'FIDEL DEFT',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'FIDEL DEFT',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'FIDEL DEFT' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1079,
  2,
  152,
  1,
  '{"heats":[{"heat_number":1,"bib_number":20,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,17,17,15,17],"sum":80}],"total":80},{"heat_number":2,"bib_number":25,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[13,15,15,13,16],"sum":72}],"total":72,"disqualified":false,"disqualification_reason":null}],"grand_total":152,"raw_total":152,"normalized_score":152}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">FIDEL DEFT</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>80</b></font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>72</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>152</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДОДЖ ВОРТИ КОНТЕНДЕР',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'ДОДЖ ВОРТИ КОНТЕНДЕР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДОДЖ ВОРТИ КОНТЕНДЕР' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1079,
  3,
  145,
  1,
  '{"heats":[{"heat_number":1,"bib_number":20,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[10,16,16,12,16],"sum":70}],"total":70},{"heat_number":2,"bib_number":26,"bib_color":"red","judges":[{"judge_number":1,"scores":[13,16,16,13,17],"sum":75}],"total":75,"disqualified":false,"disqualification_reason":null}],"grand_total":145,"raw_total":145,"normalized_score":145}',
  '',
  '',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ДОДЖ ВОРТИ КОНТЕНДЕР</font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>70</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>70</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>75</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>75</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>145</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'DAKOTA SOUL QUEEN',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'DAKOTA SOUL QUEEN',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'DAKOTA SOUL QUEEN' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1079,
  1,
  162,
  1,
  '{"heats":[{"heat_number":1,"bib_number":23,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,16,17,17],"sum":82}],"total":82},{"heat_number":2,"bib_number":27,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":162,"raw_total":162,"normalized_score":162}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">DAKOTA SOUL QUEEN</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>82</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>162</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФУРИЯ ШРЕЛЛ',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'ФУРИЯ ШРЕЛЛ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФУРИЯ ШРЕЛЛ' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1079,
  2,
  160,
  1,
  '{"heats":[{"heat_number":1,"bib_number":22,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,15,16,16,17],"sum":79}],"total":79},{"heat_number":2,"bib_number":27,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,15,16],"sum":81}],"total":81,"disqualified":false,"disqualification_reason":null}],"grand_total":160,"raw_total":160,"normalized_score":160}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ФУРИЯ ШРЕЛЛ</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>79</b></font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>160</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'KAYLA',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'KAYLA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'KAYLA' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1079,
  3,
  149,
  1,
  '{"heats":[{"heat_number":1,"bib_number":22,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[14,13,13,15,17],"sum":72}],"total":72},{"heat_number":2,"bib_number":26,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,14,13,17,17],"sum":77}],"total":77,"disqualified":false,"disqualification_reason":null}],"grand_total":149,"raw_total":149,"normalized_score":149}',
  '',
  '',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">KAYLA</font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>72</b></font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>77</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>149</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский голый терьер - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ОСКАР /OSKAR',
  'БИГЛЬ',
  'ОСКАР /OSKAR',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ОСКАР /OSKAR' AND breed = 'БИГЛЬ'),
  1079,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ОСКАР /<br>OSKAR</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Неприбывшие участники',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СЕВЕРИН СВОРА АДЫГЕИ',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'СЕВЕРИН СВОРА АДЫГЕИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СЕВЕРИН СВОРА АДЫГЕИ' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1079,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">СЕВЕРИН СВОРА АДЫГЕИ</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Неприбывшие участники',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АМБЕР МУН',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'АМБЕР МУН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АМБЕР МУН' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1079,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АМБЕР МУН</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Неприбывшие участники',
  ''
);
DELETE FROM results WHERE event_id = 1081;
UPDATE events SET track_schemes = '[{"number":1,"url":"http://procoursing.ru/2026/2026-04-18_Map.png","name":"Схема трассы","length":"600 м"}]', judges = 'Иванова Г.С., судья' WHERE id = 1081;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УЛЬТИМАТУМ СТАФФ ГЕШТАЛЬТ ЗАКРЫТ',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'УЛЬТИМАТУМ СТАФФ ГЕШТАЛЬТ ЗАКРЫТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УЛЬТИМАТУМ СТАФФ ГЕШТАЛЬТ ЗАКРЫТ' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1081,
  1,
  352,
  2,
  '{"heats":[{"heat_number":1,"bib_number":63,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":180},{"heat_number":2,"bib_number":80,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[17,16,17,17,18],"sum":85}],"total":172,"disqualified":false,"disqualification_reason":null}],"grand_total":352,"raw_total":352,"normalized_score":352}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">УЛЬТИМАТУМ СТАФФ ГЕШТАЛЬТ ЗАКРЫТ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>63</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>80</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>352</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ANRISE VIVENDI VEJLR',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'ANRISE VIVENDI VEJLR',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ANRISE VIVENDI VEJLR' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1081,
  2,
  348,
  2,
  '{"heats":[{"heat_number":1,"bib_number":61,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,17,18],"sum":85},{"judge_number":2,"scores":[17,16,18,17,18],"sum":86}],"total":171},{"heat_number":2,"bib_number":81,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,17,18,18,17],"sum":88},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":177,"disqualified":false,"disqualification_reason":null}],"grand_total":348,"raw_total":348,"normalized_score":348}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ANRISE VIVENDI VEJLR</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>61</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>81</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>348</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'МИРА АЛЬМА БЕБИ ДОЛЛ',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'МИРА АЛЬМА БЕБИ ДОЛЛ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МИРА АЛЬМА БЕБИ ДОЛЛ' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1081,
  3,
  347,
  2,
  '{"heats":[{"heat_number":1,"bib_number":61,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,18,18],"sum":88},{"judge_number":2,"scores":[17,17,18,16,18],"sum":86}],"total":174},{"heat_number":2,"bib_number":82,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,16,17,18],"sum":86},{"judge_number":2,"scores":[17,18,17,17,18],"sum":87}],"total":173,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"raw_total":347,"normalized_score":347}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МИРА АЛЬМА БЕБИ ДОЛЛ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>61</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>82</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1081,
  4,
  341,
  2,
  '{"heats":[{"heat_number":1,"bib_number":62,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,17,17,17,19],"sum":88},{"judge_number":2,"scores":[16,16,18,17,18],"sum":85}],"total":173},{"heat_number":2,"bib_number":80,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,18,16,18],"sum":86},{"judge_number":2,"scores":[16,16,17,15,18],"sum":82}],"total":168,"disqualified":false,"disqualification_reason":null}],"grand_total":341,"raw_total":341,"normalized_score":341}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>62</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>80</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>341</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'УЛЬТИМАТУМ СТАФФ ВИВЬЕН ВЕСТВУД',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'УЛЬТИМАТУМ СТАФФ ВИВЬЕН ВЕСТВУД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'УЛЬТИМАТУМ СТАФФ ВИВЬЕН ВЕСТВУД' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1081,
  5,
  340,
  2,
  '{"heats":[{"heat_number":1,"bib_number":62,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,18,18],"sum":89},{"judge_number":2,"scores":[17,17,18,16,18],"sum":86}],"total":175},{"heat_number":2,"bib_number":82,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,16,17,15,18],"sum":82},{"judge_number":2,"scores":[15,18,18,14,18],"sum":83}],"total":165,"disqualified":false,"disqualification_reason":null}],"grand_total":340,"raw_total":340,"normalized_score":340}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">УЛЬТИМАТУМ СТАФФ ВИВЬЕН ВЕСТВУД</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>62</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>82</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>340</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'КАПУЧИНО',
  'БЕЗ ПОРОДЫ',
  'КАПУЧИНО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КАПУЧИНО' AND breed = 'БЕЗ ПОРОДЫ'),
  1081,
  1,
  359,
  2,
  '{"heats":[{"heat_number":1,"bib_number":69,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,19,18],"sum":91},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":181},{"heat_number":2,"bib_number":78,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,18,18,19],"sum":89},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":178,"disqualified":false,"disqualification_reason":null}],"grand_total":359,"raw_total":359,"normalized_score":359}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КАПУЧИНО</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>69</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>78</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">359</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АКСЕЛЬ',
  'БЕЗ ПОРОДЫ',
  'АКСЕЛЬ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКСЕЛЬ' AND breed = 'БЕЗ ПОРОДЫ'),
  1081,
  2,
  353,
  2,
  '{"heats":[{"heat_number":1,"bib_number":68,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,16,18,18],"sum":87},{"judge_number":2,"scores":[17,17,18,18,18],"sum":88}],"total":175},{"heat_number":2,"bib_number":77,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[17,17,18,17,18],"sum":87}],"total":178,"disqualified":false,"disqualification_reason":null}],"grand_total":353,"raw_total":353,"normalized_score":353}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКСЕЛЬ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>68</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>77</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'YO TE AMO CROWLEY PIT MUST SURVIVE',
  'БЕЗ ПОРОДЫ',
  'YO TE AMO CROWLEY PIT MUST SURVIVE',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'YO TE AMO CROWLEY PIT MUST SURVIVE' AND breed = 'БЕЗ ПОРОДЫ'),
  1081,
  3,
  351,
  2,
  '{"heats":[{"heat_number":1,"bib_number":68,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,17,17,18],"sum":86},{"judge_number":2,"scores":[18,17,18,17,18],"sum":88}],"total":174},{"heat_number":2,"bib_number":77,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,18,18],"sum":89},{"judge_number":2,"scores":[17,17,18,18,18],"sum":88}],"total":177,"disqualified":false,"disqualification_reason":null}],"grand_total":351,"raw_total":351,"normalized_score":351}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">YO TE AMO CROWLEY "PIT MUST SURVIVE"</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>68</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>77</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>351</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'КАМА',
  'БЕЗ ПОРОДЫ',
  'КАМА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КАМА' AND breed = 'БЕЗ ПОРОДЫ'),
  1081,
  1,
  357,
  2,
  '{"heats":[{"heat_number":1,"bib_number":69,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,18,18,18],"sum":90},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":180},{"heat_number":2,"bib_number":78,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,17,18,17],"sum":88},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":177,"disqualified":false,"disqualification_reason":null}],"grand_total":357,"raw_total":357,"normalized_score":357}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КАМА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>69</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>78</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СИЛЬВИ',
  'БЕЗ ПОРОДЫ',
  'СИЛЬВИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИЛЬВИ' AND breed = 'БЕЗ ПОРОДЫ'),
  1081,
  2,
  353,
  2,
  '{"heats":[{"heat_number":1,"bib_number":67,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":175},{"heat_number":2,"bib_number":76,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,17,17,18,18],"sum":88},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":178,"disqualified":false,"disqualification_reason":null}],"grand_total":353,"raw_total":353,"normalized_score":353}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СИЛЬВИ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>67</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>76</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЧАРА',
  'БЕЗ ПОРОДЫ',
  'ЧАРА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧАРА' AND breed = 'БЕЗ ПОРОДЫ'),
  1081,
  3,
  347,
  2,
  '{"heats":[{"heat_number":1,"bib_number":70,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,17,16],"sum":83},{"judge_number":2,"scores":[18,17,17,18,17],"sum":87}],"total":170},{"heat_number":2,"bib_number":79,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,18,18,18],"sum":88},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":177,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"raw_total":347,"normalized_score":347}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧАРА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>70</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>79</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЧЕЙЗИ /CHEJZI',
  'БИГЛЬ',
  'ЧЕЙЗИ /CHEJZI',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧЕЙЗИ /CHEJZI' AND breed = 'БИГЛЬ'),
  1081,
  1,
  360,
  2,
  '{"heats":[{"heat_number":1,"bib_number":72,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,18,19],"sum":91},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":181},{"heat_number":2,"bib_number":85,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,17,18,18],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":179,"disqualified":false,"disqualification_reason":null}],"grand_total":360,"raw_total":360,"normalized_score":360}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧЕЙЗИ /<br>CHEJZI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>72</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>85</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">360</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Бигль - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АКВАТА',
  'БИГЛЬ',
  'АКВАТА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКВАТА' AND breed = 'БИГЛЬ'),
  1081,
  2,
  343,
  2,
  '{"heats":[{"heat_number":1,"bib_number":71,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,18,17],"sum":85},{"judge_number":2,"scores":[18,17,17,18,18],"sum":88}],"total":173},{"heat_number":2,"bib_number":85,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,16,17,16,18],"sum":84},{"judge_number":2,"scores":[16,17,18,17,18],"sum":86}],"total":170,"disqualified":false,"disqualification_reason":null}],"grand_total":343,"raw_total":343,"normalized_score":343}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКВАТА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>71</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>85</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>343</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Бигль - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЖАСТЕР',
  'БИГЛЬ',
  'ЖАСТЕР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЖАСТЕР' AND breed = 'БИГЛЬ'),
  1081,
  NULL,
  NULL,
  2,
  '{"heats":[{"heat_number":1,"bib_number":71,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,15,16,15,17],"sum":78},{"judge_number":2,"scores":[17,16,17,16,17],"sum":83}],"total":161},{"heat_number":2,"bib_number":86,"bib_color":"red","judges":[],"total":null,"disqualified":true,"disqualification_reason":"Отстранение (Сход с трассы, возврат к владельцу)"}],"grand_total":null,"raw_total":null,"normalized_score":null}',
  '',
  '',
  'disqualified',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЖАСТЕР</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>71</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>86</i></font></td> <td colspan="6" rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Сход с трассы, возврат к владельцу)</font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Стандартный - Микс',
  'Сход с трассы, возврат к владельцу'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВИЛЬЯМ НИКОЛЛО ПАГАНИНИ',
  'БИГЛЬ',
  'ВИЛЬЯМ НИКОЛЛО ПАГАНИНИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВИЛЬЯМ НИКОЛЛО ПАГАНИНИ' AND breed = 'БИГЛЬ'),
  1081,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"raw_total":null,"normalized_score":null}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Ветераны</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ВИЛЬЯМ НИКОЛЛО ПАГАНИНИ</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>73</i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Сход с трассы, возврат к владельцу)</font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Ветераны - Кобели',
  'Сход с трассы, возврат к владельцу'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РОЯЛ АЙСИНГ ФАРТИ',
  'ДЖЕК РАССЕЛ ТЕРЬЕР',
  'РОЯЛ АЙСИНГ ФАРТИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РОЯЛ АЙСИНГ ФАРТИ' AND breed = 'ДЖЕК РАССЕЛ ТЕРЬЕР'),
  1081,
  1,
  357,
  2,
  '{"heats":[{"heat_number":1,"bib_number":64,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,18,19],"sum":91},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":180},{"heat_number":2,"bib_number":74,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,18,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":177,"disqualified":false,"disqualification_reason":null}],"grand_total":357,"raw_total":357,"normalized_score":357}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Джек Рассел Терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">РОЯЛ АЙСИНГ ФАРТИ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>64</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>74</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Джек Рассел Терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'МИДНАЙТ БИС ЛАГУНА',
  'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)',
  'МИДНАЙТ БИС ЛАГУНА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МИДНАЙТ БИС ЛАГУНА' AND breed = 'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)'),
  1081,
  1,
  352,
  2,
  '{"heats":[{"heat_number":1,"bib_number":65,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,18,18,17],"sum":87},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":175},{"heat_number":2,"bib_number":83,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":177,"disqualified":false,"disqualification_reason":null}],"grand_total":352,"raw_total":352,"normalized_score":352}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Такса миниатюрная (г-ш, д-ш, ж-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МИДНАЙТ БИС ЛАГУНА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>65</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>83</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>352</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Такса миниатюрная (г-ш, д-ш, ж-ш) - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ФОРМУЛА УСПЕХА ПИОН /FORMULA USPEHA PION',
  'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)',
  'ФОРМУЛА УСПЕХА ПИОН /FORMULA USPEHA PION',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФОРМУЛА УСПЕХА ПИОН /FORMULA USPEHA PION' AND breed = 'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)'),
  1081,
  2,
  347,
  2,
  '{"heats":[{"heat_number":1,"bib_number":65,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,17,17],"sum":84},{"judge_number":2,"scores":[17,17,18,16,18],"sum":86}],"total":170},{"heat_number":2,"bib_number":84,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,18,17,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":177,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"raw_total":347,"normalized_score":347}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Такса миниатюрная (г-ш, д-ш, ж-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ФОРМУЛА УСПЕХА ПИОН /<br>FORMULA USPEHA PION</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>65</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>84</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Такса миниатюрная (г-ш, д-ш, ж-ш) - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СИБИРСКИЙ ЛЕГИОН ЛИПОВЫЙ ЦВЕТ /SIBIRSKIY LEGION LIPOVYJ CZVET',
  'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)',
  'СИБИРСКИЙ ЛЕГИОН ЛИПОВЫЙ ЦВЕТ /SIBIRSKIY LEGION LIPOVYJ CZVET',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИБИРСКИЙ ЛЕГИОН ЛИПОВЫЙ ЦВЕТ /SIBIRSKIY LEGION LIPOVYJ CZVET' AND breed = 'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)'),
  1081,
  3,
  347,
  2,
  '{"heats":[{"heat_number":1,"bib_number":66,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,18,17,18],"sum":86},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":175},{"heat_number":2,"bib_number":83,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,17,16,18],"sum":85},{"judge_number":2,"scores":[17,16,18,18,18],"sum":87}],"total":172,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"raw_total":347,"normalized_score":347}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Такса миниатюрная (г-ш, д-ш, ж-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СИБИРСКИЙ ЛЕГИОН ЛИПОВЫЙ ЦВЕТ /<br>SIBIRSKIY LEGION LIPOVYJ CZVET</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>66</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>83</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Такса миниатюрная (г-ш, д-ш, ж-ш) - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ГОЛД ВИКТОРИ НОРД',
  'ЦВЕРГПИНЧЕР',
  'ГОЛД ВИКТОРИ НОРД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ГОЛД ВИКТОРИ НОРД' AND breed = 'ЦВЕРГПИНЧЕР'),
  1081,
  1,
  359,
  2,
  '{"heats":[{"heat_number":1,"bib_number":67,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,19],"sum":91}],"total":178},{"heat_number":2,"bib_number":75,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,18,18,19],"sum":90},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":181,"disqualified":false,"disqualification_reason":null}],"grand_total":359,"raw_total":359,"normalized_score":359}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Цвергпинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ГОЛД ВИКТОРИ НОРД</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>67</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>75</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">359</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Цвергпинчер - Стандартный - Кобели',
  ''
);
DELETE FROM results WHERE event_id = 1084;
UPDATE events SET judges = 'Егорова М.А., судья' WHERE id = 1084;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'TCENNIY PRIZE EIRENA',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'TCENNIY PRIZE EIRENA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'TCENNIY PRIZE EIRENA' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1084,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"raw_total":null,"normalized_score":null}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Ветераны</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">TCENNIY PRIZE EIRENA</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Сход с трассы)</font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Ветераны - Суки',
  'Сход с трассы'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /SANSARA SHERVUD SHOTER GRAN PRI',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /SANSARA SHERVUD SHOTER GRAN PRI',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /SANSARA SHERVUD SHOTER GRAN PRI' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1084,
  1,
  306,
  2,
  '{"heats":[{"heat_number":1,"bib_number":1,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,16,15,18,18],"sum":85},{"judge_number":2,"scores":[12,14,14,14,15],"sum":69}],"total":154},{"heat_number":2,"bib_number":25,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,14,16,16],"sum":79},{"judge_number":2,"scores":[12,16,14,14,17],"sum":73}],"total":152,"disqualified":false,"disqualification_reason":null}],"grand_total":306,"raw_total":306,"normalized_score":306}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /<br>SANSARA SHERVUD SHOTER GRAN PRI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>154</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>306</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ТИП ТОП ПУР ГОЛД ИЗ ДОМА ЗИДАНА /TIP TOP PURE GOLD IZ DOMA ZIDANA',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'ТИП ТОП ПУР ГОЛД ИЗ ДОМА ЗИДАНА /TIP TOP PURE GOLD IZ DOMA ZIDANA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ТИП ТОП ПУР ГОЛД ИЗ ДОМА ЗИДАНА /TIP TOP PURE GOLD IZ DOMA ZIDANA' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1084,
  2,
  302,
  2,
  '{"heats":[{"heat_number":1,"bib_number":2,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,16,14,18,17],"sum":83},{"judge_number":2,"scores":[12,15,15,10,15],"sum":67}],"total":150},{"heat_number":2,"bib_number":25,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,16,16,17,16],"sum":80},{"judge_number":2,"scores":[13,15,14,13,17],"sum":72}],"total":152,"disqualified":false,"disqualification_reason":null}],"grand_total":302,"raw_total":302,"normalized_score":302}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ТИП ТОП ПУР ГОЛД ИЗ ДОМА ЗИДАНА /<br>TIP TOP PURE GOLD IZ DOMA ZIDANA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>150</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>302</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЗВЕЗДА АМЕРЛАНД ПАМИР ПЕРСИЛЬОН /ZVEZDA AMERLAND PAMIR PERSILLION',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'ЗВЕЗДА АМЕРЛАНД ПАМИР ПЕРСИЛЬОН /ZVEZDA AMERLAND PAMIR PERSILLION',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЗВЕЗДА АМЕРЛАНД ПАМИР ПЕРСИЛЬОН /ZVEZDA AMERLAND PAMIR PERSILLION' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1084,
  3,
  271,
  2,
  '{"heats":[{"heat_number":1,"bib_number":2,"bib_color":"red","judges":[{"judge_number":1,"scores":[10,14,12,13,15],"sum":64},{"judge_number":2,"scores":[15,15,15,13,16],"sum":74}],"total":138},{"heat_number":2,"bib_number":24,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,15,15,14,15],"sum":73},{"judge_number":2,"scores":[8,14,12,10,16],"sum":60}],"total":133,"disqualified":false,"disqualification_reason":null}],"grand_total":271,"raw_total":271,"normalized_score":271}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЗВЕЗДА АМЕРЛАНД ПАМИР ПЕРСИЛЬОН /<br>ZVEZDA AMERLAND PAMIR PERSILLION</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>64</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>138</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>133</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>271</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'BAKARORO END ITUBORI THE BEST TCENNIY PRIZE',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'BAKARORO END ITUBORI THE BEST TCENNIY PRIZE',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'BAKARORO END ITUBORI THE BEST TCENNIY PRIZE' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1084,
  4,
  261,
  2,
  '{"heats":[{"heat_number":1,"bib_number":1,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[12,14,13,13,16],"sum":68},{"judge_number":2,"scores":[10,14,12,10,15],"sum":61}],"total":129},{"heat_number":2,"bib_number":24,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[14,16,15,14,15],"sum":74},{"judge_number":2,"scores":[8,14,12,8,16],"sum":58}],"total":132,"disqualified":false,"disqualification_reason":null}],"grand_total":261,"raw_total":261,"normalized_score":261}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">BAKARORO END ITUBORI THE BEST TCENNIY PRIZE</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>68</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>74</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>132</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>261</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /GLAD TO BE GREAT IZ SOZVEZDIYA STAFF',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /GLAD TO BE GREAT IZ SOZVEZDIYA STAFF',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /GLAD TO BE GREAT IZ SOZVEZDIYA STAFF' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1084,
  1,
  326,
  2,
  '{"heats":[{"heat_number":1,"bib_number":3,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,17,14,18,18],"sum":85},{"judge_number":2,"scores":[14,16,15,16,16],"sum":77}],"total":162},{"heat_number":2,"bib_number":26,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,17,17,17,18],"sum":87},{"judge_number":2,"scores":[14,16,15,15,17],"sum":77}],"total":164,"disqualified":false,"disqualification_reason":null}],"grand_total":326,"raw_total":326,"normalized_score":326}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /<br>GLAD TO BE GREAT IZ SOZVEZDIYA STAFF</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>326</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1084,
  2,
  293,
  2,
  '{"heats":[{"heat_number":1,"bib_number":4,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,16,14,15,17],"sum":74},{"judge_number":2,"scores":[10,16,16,10,16],"sum":68}],"total":142},{"heat_number":2,"bib_number":26,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[14,17,17,15,17],"sum":80},{"judge_number":2,"scores":[12,15,15,12,17],"sum":71}],"total":151,"disqualified":false,"disqualification_reason":null}],"grand_total":293,"raw_total":293,"normalized_score":293}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СТИ''Л ШАРМ ДЕСТЕЛЛО МИЯ /<br>STEE’L CHARM DESTELLO MIA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>74</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>142</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>151</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>293</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /TISSA LUNA GOLUBOJ RODNIK KREDO',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /TISSA LUNA GOLUBOJ RODNIK KREDO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /TISSA LUNA GOLUBOJ RODNIK KREDO' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1084,
  3,
  272,
  2,
  '{"heats":[{"heat_number":1,"bib_number":3,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[13,14,12,16,16],"sum":71},{"judge_number":2,"scores":[8,16,15,8,15],"sum":62}],"total":133},{"heat_number":2,"bib_number":27,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,17,17,12,15],"sum":73},{"judge_number":2,"scores":[14,16,14,8,14],"sum":66}],"total":139,"disqualified":false,"disqualification_reason":null}],"grand_total":272,"raw_total":272,"normalized_score":272}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /<br>TISSA LUNA GOLUBOJ RODNIK KREDO</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>71</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>133</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>139</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>272</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВЕГА',
  'БЕЗ ПОРОДЫ',
  'ВЕГА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВЕГА' AND breed = 'БЕЗ ПОРОДЫ'),
  1084,
  1,
  340,
  2,
  '{"heats":[{"heat_number":1,"bib_number":7,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,18,14,18,17],"sum":86},{"judge_number":2,"scores":[15,17,17,17,17],"sum":83}],"total":169},{"heat_number":2,"bib_number":29,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,16,17,18],"sum":87},{"judge_number":2,"scores":[16,16,17,18,17],"sum":84}],"total":171,"disqualified":false,"disqualification_reason":null}],"grand_total":340,"raw_total":340,"normalized_score":340}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВЕГА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">340</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'МАРГАРИТА',
  'БЕЗ ПОРОДЫ',
  'МАРГАРИТА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МАРГАРИТА' AND breed = 'БЕЗ ПОРОДЫ'),
  1084,
  2,
  312,
  2,
  '{"heats":[{"heat_number":1,"bib_number":6,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,15,16,18],"sum":81},{"judge_number":2,"scores":[14,16,15,12,17],"sum":74}],"total":155},{"heat_number":2,"bib_number":28,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,17,16,16,17],"sum":81},{"judge_number":2,"scores":[14,16,16,13,17],"sum":76}],"total":157,"disqualified":false,"disqualification_reason":null}],"grand_total":312,"raw_total":312,"normalized_score":312}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МАРГАРИТА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>155</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>157</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>312</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВЕРСАЧЕ БРАЙТ КРИСТАЛ /VERSACE BRIGHT CRYSTAL',
  'БИГЛЬ',
  'ВЕРСАЧЕ БРАЙТ КРИСТАЛ /VERSACE BRIGHT CRYSTAL',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВЕРСАЧЕ БРАЙТ КРИСТАЛ /VERSACE BRIGHT CRYSTAL' AND breed = 'БИГЛЬ'),
  1084,
  1,
  317,
  2,
  '{"heats":[{"heat_number":1,"bib_number":8,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,17,14,16,17],"sum":79},{"judge_number":2,"scores":[13,17,17,14,17],"sum":78}],"total":157},{"heat_number":2,"bib_number":30,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,16,17,16,17],"sum":78},{"judge_number":2,"scores":[15,18,16,15,18],"sum":82}],"total":160,"disqualified":false,"disqualification_reason":null}],"grand_total":317,"raw_total":317,"normalized_score":317}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВЕРСАЧЕ БРАЙТ КРИСТАЛ /<br>VERSACE BRIGHT CRYSTAL</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>157</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>317</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /AURORAS MOON LIMITLESS EBONY POTENTION',
  'ДАЛМАТИН',
  'АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /AURORAS MOON LIMITLESS EBONY POTENTION',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /AURORAS MOON LIMITLESS EBONY POTENTION' AND breed = 'ДАЛМАТИН'),
  1084,
  1,
  354,
  2,
  '{"heats":[{"heat_number":1,"bib_number":9,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,15,17,18],"sum":86},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":175},{"heat_number":2,"bib_number":31,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,18,18,19,19],"sum":93},{"judge_number":2,"scores":[16,17,17,18,18],"sum":86}],"total":179,"disqualified":false,"disqualification_reason":null}],"grand_total":354,"raw_total":354,"normalized_score":354}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Далматин</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /<br>AURORAS MOON LIMITLESS EBONY POTENTION</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">354</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Далматин - Юниоры - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN',
  'ЦВЕРГПИНЧЕР',
  'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN' AND breed = 'ЦВЕРГПИНЧЕР'),
  1084,
  1,
  334,
  2,
  '{"heats":[{"heat_number":1,"bib_number":10,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,18,15,17,19],"sum":85},{"judge_number":2,"scores":[15,18,18,15,18],"sum":84}],"total":169},{"heat_number":2,"bib_number":32,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,17,18,15,17],"sum":82},{"judge_number":2,"scores":[14,18,18,16,17],"sum":83}],"total":165,"disqualified":false,"disqualification_reason":null}],"grand_total":334,"raw_total":334,"normalized_score":334}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Цвергпинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /<br>TSESVIL GARDEN IRINUS GOLD BREIN</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">334</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Цвергпинчер - Стандартный - Кобели',
  ''
);
DELETE FROM results WHERE event_id = 1087;
UPDATE events SET track_schemes = '[{"number":1,"url":"http://procoursing.ru/2026/2026-04-25_Map.png","name":"Схема трассы","length":"650 м"}]', judges = 'Серова Т.Г., судья' WHERE id = 1087;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ПАЙКИ /PAYKI',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
  'ПАЙКИ /PAYKI',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ПАЙКИ /PAYKI' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1087,
  1,
  342,
  2,
  '{"heats":[{"heat_number":1,"bib_number":96,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,17,17,18],"sum":86},{"judge_number":2,"scores":[17,18,17,18,17],"sum":87}],"total":173},{"heat_number":2,"bib_number":107,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,17,17,18],"sum":86},{"judge_number":2,"scores":[16,18,17,16,16],"sum":83}],"total":169,"disqualified":false,"disqualification_reason":null}],"grand_total":342,"raw_total":342,"normalized_score":342}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПАЙКИ /<br>PAYKI</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>96</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>107</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>342</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДЕНВЕРС ЭЛИТ ШЕЙП МАЙ ИМПРЕЗА СОУЛ /DENVERS ELITE SHAPE MY IMPREZA SOUL',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'ДЕНВЕРС ЭЛИТ ШЕЙП МАЙ ИМПРЕЗА СОУЛ /DENVERS ELITE SHAPE MY IMPREZA SOUL',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЕНВЕРС ЭЛИТ ШЕЙП МАЙ ИМПРЕЗА СОУЛ /DENVERS ELITE SHAPE MY IMPREZA SOUL' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1087,
  1,
  336,
  2,
  '{"heats":[{"heat_number":1,"bib_number":114,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":174},{"heat_number":2,"bib_number":126,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,15,16,16],"sum":79},{"judge_number":2,"scores":[16,17,16,17,17],"sum":83}],"total":162,"disqualified":false,"disqualification_reason":null}],"grand_total":336,"raw_total":336,"normalized_score":336}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ДЕНВЕРС ЭЛИТ ШЕЙП МАЙ ИМПРЕЗА СОУЛ /<br>DENVERS ELITE SHAPE MY IMPREZA SOUL</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>114</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>126</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>336</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /SANSARA SHERVUD SHOTER GRAN PRI',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /SANSARA SHERVUD SHOTER GRAN PRI',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /SANSARA SHERVUD SHOTER GRAN PRI' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1087,
  2,
  329,
  2,
  '{"heats":[{"heat_number":1,"bib_number":115,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,16,16,17],"sum":81},{"judge_number":2,"scores":[16,18,17,16,16],"sum":83}],"total":164},{"heat_number":2,"bib_number":125,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[15,17,16,16,16],"sum":80}],"total":165,"disqualified":false,"disqualification_reason":null}],"grand_total":329,"raw_total":329,"normalized_score":329}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /<br>SANSARA SHERVUD SHOTER GRAN PRI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>115</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>125</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>329</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /GLAD TO BE GREAT IZ SOZVEZDIYA STAFF',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /GLAD TO BE GREAT IZ SOZVEZDIYA STAFF',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /GLAD TO BE GREAT IZ SOZVEZDIYA STAFF' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1087,
  3,
  328,
  2,
  '{"heats":[{"heat_number":1,"bib_number":115,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[16,18,16,16,17],"sum":83}],"total":166},{"heat_number":2,"bib_number":126,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,16,16,16,16],"sum":79},{"judge_number":2,"scores":[16,17,17,17,16],"sum":83}],"total":162,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"raw_total":328,"normalized_score":328}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /<br>GLAD TO BE GREAT IZ SOZVEZDIYA STAFF</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>115</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>126</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /TISSA LUNA GOLUBOJ RODNIK KREDO',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /TISSA LUNA GOLUBOJ RODNIK KREDO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /TISSA LUNA GOLUBOJ RODNIK KREDO' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1087,
  4,
  300,
  2,
  '{"heats":[{"heat_number":1,"bib_number":114,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,16,16,17],"sum":82},{"judge_number":2,"scores":[12,16,14,13,13],"sum":68}],"total":150},{"heat_number":2,"bib_number":125,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[14,16,16,16,17],"sum":79},{"judge_number":2,"scores":[12,16,15,14,14],"sum":71}],"total":150,"disqualified":false,"disqualification_reason":null}],"grand_total":300,"raw_total":300,"normalized_score":300}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /<br>TISSA LUNA GOLUBOJ RODNIK KREDO</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>114</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>150</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>125</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>150</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>300</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'НОРД',
  'БЕЗ ПОРОДЫ',
  'НОРД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'НОРД' AND breed = 'БЕЗ ПОРОДЫ'),
  1087,
  1,
  332,
  2,
  '{"heats":[{"heat_number":1,"bib_number":121,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,17,16,17,16],"sum":82}],"total":167},{"heat_number":2,"bib_number":132,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[16,17,16,17,16],"sum":82}],"total":165,"disqualified":false,"disqualification_reason":null}],"grand_total":332,"raw_total":332,"normalized_score":332}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">НОРД</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>121</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>132</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>332</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'YUG PIT KNLS ELBRUS',
  'БЕЗ ПОРОДЫ',
  'YUG PIT KNLS ELBRUS',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'YUG PIT KNLS ELBRUS' AND breed = 'БЕЗ ПОРОДЫ'),
  1087,
  2,
  328,
  2,
  '{"heats":[{"heat_number":1,"bib_number":120,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,17,17],"sum":84},{"judge_number":2,"scores":[16,18,17,16,16],"sum":83}],"total":167},{"heat_number":2,"bib_number":131,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,16,16],"sum":82},{"judge_number":2,"scores":[15,17,16,16,15],"sum":79}],"total":161,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"raw_total":328,"normalized_score":328}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">YUG PIT KNL''S ELBRUS</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>120</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>131</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДЖОН',
  'БЕЗ ПОРОДЫ',
  'ДЖОН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЖОН' AND breed = 'БЕЗ ПОРОДЫ'),
  1087,
  3,
  324,
  2,
  '{"heats":[{"heat_number":1,"bib_number":121,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,16,17,16,16],"sum":81},{"judge_number":2,"scores":[15,17,16,16,16],"sum":80}],"total":161},{"heat_number":2,"bib_number":132,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,17,16,16,16],"sum":80},{"judge_number":2,"scores":[16,17,16,17,17],"sum":83}],"total":163,"disqualified":false,"disqualification_reason":null}],"grand_total":324,"raw_total":324,"normalized_score":324}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ДЖОН</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>121</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>132</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>324</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВЕГА',
  'БЕЗ ПОРОДЫ',
  'ВЕГА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВЕГА' AND breed = 'БЕЗ ПОРОДЫ'),
  1087,
  1,
  349,
  2,
  '{"heats":[{"heat_number":1,"bib_number":123,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,18,18,18],"sum":88},{"judge_number":2,"scores":[17,18,16,17,17],"sum":85}],"total":173},{"heat_number":2,"bib_number":134,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[18,18,18,18,18],"sum":90},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":176,"disqualified":false,"disqualification_reason":null}],"grand_total":349,"raw_total":349,"normalized_score":349}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВЕГА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>123</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>134</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">349</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'МИРОСЛАВА',
  'БЕЗ ПОРОДЫ',
  'МИРОСЛАВА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МИРОСЛАВА' AND breed = 'БЕЗ ПОРОДЫ'),
  1087,
  2,
  340,
  2,
  '{"heats":[{"heat_number":1,"bib_number":119,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,17,17],"sum":84},{"judge_number":2,"scores":[17,18,18,18,17],"sum":88}],"total":172},{"heat_number":2,"bib_number":130,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,16,16,17],"sum":82},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":168,"disqualified":false,"disqualification_reason":null}],"grand_total":340,"raw_total":340,"normalized_score":340}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МИРОСЛАВА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>119</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>130</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>340</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЛАТТЕ',
  'БЕЗ ПОРОДЫ',
  'ЛАТТЕ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛАТТЕ' AND breed = 'БЕЗ ПОРОДЫ'),
  1087,
  3,
  338,
  2,
  '{"heats":[{"heat_number":1,"bib_number":119,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[15,17,17,16,16],"sum":81}],"total":166},{"heat_number":2,"bib_number":130,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,17,16,17],"sum":84},{"judge_number":2,"scores":[18,18,17,18,17],"sum":88}],"total":172,"disqualified":false,"disqualification_reason":null}],"grand_total":338,"raw_total":338,"normalized_score":338}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЛАТТЕ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>119</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>130</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>338</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЧАРА',
  'БЕЗ ПОРОДЫ',
  'ЧАРА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧАРА' AND breed = 'БЕЗ ПОРОДЫ'),
  1087,
  4,
  329,
  2,
  '{"heats":[{"heat_number":1,"bib_number":122,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[17,17,16,17,17],"sum":84}],"total":164},{"heat_number":2,"bib_number":133,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":165,"disqualified":false,"disqualification_reason":null}],"grand_total":329,"raw_total":329,"normalized_score":329}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧАРА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>122</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>133</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>329</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АФИНА',
  'БЕЗ ПОРОДЫ',
  'АФИНА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АФИНА' AND breed = 'БЕЗ ПОРОДЫ'),
  1087,
  5,
  307,
  2,
  '{"heats":[{"heat_number":1,"bib_number":120,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,16,15,15,16],"sum":77},{"judge_number":2,"scores":[13,16,15,14,14],"sum":72}],"total":149},{"heat_number":2,"bib_number":131,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,17,16,16,16],"sum":80},{"judge_number":2,"scores":[15,17,16,15,15],"sum":78}],"total":158,"disqualified":false,"disqualification_reason":null}],"grand_total":307,"raw_total":307,"normalized_score":307}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АФИНА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>120</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>149</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>131</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>158</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>307</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДЖАНИКО ЛАЗЕР (М) /DZHANIKO LASER (M)',
  'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА',
  'ДЖАНИКО ЛАЗЕР (М) /DZHANIKO LASER (M)',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЖАНИКО ЛАЗЕР (М) /DZHANIKO LASER (M)' AND breed = 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА'),
  1087,
  1,
  361,
  2,
  '{"heats":[{"heat_number":1,"bib_number":77,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,18,18,19],"sum":91},{"judge_number":2,"scores":[17,18,18,18,17],"sum":88}],"total":179},{"heat_number":2,"bib_number":90,"bib_color":"red","judges":[{"judge_number":1,"scores":[19,18,19,19,18],"sum":93},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":182,"disqualified":false,"disqualification_reason":null}],"grand_total":361,"raw_total":361,"normalized_score":361}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бельгийская овчарка малинуа</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ДЖАНИКО ЛАЗЕР (М) /<br>DZHANIKO LASER (M)</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>77</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>90</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">361</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВОРЛД ОФ РОЛЕКС ЭЛАЙДЖА ВУД /WORLD OF ROLEX ELAYDZHA VUD',
  'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ',
  'ВОРЛД ОФ РОЛЕКС ЭЛАЙДЖА ВУД /WORLD OF ROLEX ELAYDZHA VUD',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВОРЛД ОФ РОЛЕКС ЭЛАЙДЖА ВУД /WORLD OF ROLEX ELAYDZHA VUD' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1087,
  1,
  332,
  2,
  '{"heats":[{"heat_number":1,"bib_number":99,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,18,17,17,16],"sum":84}],"total":169},{"heat_number":2,"bib_number":109,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[16,17,16,17,17],"sum":83}],"total":163,"disqualified":false,"disqualification_reason":null}],"grand_total":332,"raw_total":332,"normalized_score":332}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВОРЛД ОФ РОЛЕКС ЭЛАЙДЖА ВУД /<br>WORLD OF ROLEX ELAYDZHA VUD</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>99</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>109</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>332</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Бультерьер миниатюрный - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'КУРАЖ КЛАБ ГОДДЕСС /COURAGE CLUB GODDESS',
  'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ',
  'КУРАЖ КЛАБ ГОДДЕСС /COURAGE CLUB GODDESS',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КУРАЖ КЛАБ ГОДДЕСС /COURAGE CLUB GODDESS' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1087,
  2,
  329,
  2,
  '{"heats":[{"heat_number":1,"bib_number":98,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,17,16],"sum":83},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":169},{"heat_number":2,"bib_number":109,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,15,16,16],"sum":79},{"judge_number":2,"scores":[15,17,16,16,17],"sum":81}],"total":160,"disqualified":false,"disqualification_reason":null}],"grand_total":329,"raw_total":329,"normalized_score":329}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КУРАЖ КЛАБ ГОДДЕСС /<br>COURAGE CLUB GODDESS</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>98</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>109</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>329</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Бультерьер миниатюрный - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'МАРЛЕН БРАО ЧАРОДЕЙ /MARLEN BRAO CHARODEI',
  'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ',
  'МАРЛЕН БРАО ЧАРОДЕЙ /MARLEN BRAO CHARODEI',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МАРЛЕН БРАО ЧАРОДЕЙ /MARLEN BRAO CHARODEI' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1087,
  3,
  312,
  2,
  '{"heats":[{"heat_number":1,"bib_number":98,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[13,16,15,14,15],"sum":73},{"judge_number":2,"scores":[16,17,16,14,13],"sum":76}],"total":149},{"heat_number":2,"bib_number":110,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,16,16,16,16],"sum":79},{"judge_number":2,"scores":[17,17,17,17,16],"sum":84}],"total":163,"disqualified":false,"disqualification_reason":null}],"grand_total":312,"raw_total":312,"normalized_score":312}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МАРЛЕН-БРАО ЧАРОДЕЙ /<br>MARLEN-BRAO CHARODEI</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>98</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>149</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>110</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>312</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Бультерьер миниатюрный - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БАТИДА ДЕ КОКО /BATIDA DE COCO',
  'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ',
  'БАТИДА ДЕ КОКО /BATIDA DE COCO',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БАТИДА ДЕ КОКО /BATIDA DE COCO' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1087,
  4,
  287,
  2,
  '{"heats":[{"heat_number":1,"bib_number":99,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,16,14,12,13],"sum":69},{"judge_number":2,"scores":[9,12,12,10,9],"sum":52}],"total":121},{"heat_number":2,"bib_number":110,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,15,16,16,16],"sum":79},{"judge_number":2,"scores":[17,18,17,18,17],"sum":87}],"total":166,"disqualified":false,"disqualification_reason":null}],"grand_total":287,"raw_total":287,"normalized_score":287}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БАТИДА ДЕ КОКО /<br>BATIDA DE COCO</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>99</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>69</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>121</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>110</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>287</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бультерьер миниатюрный - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АФИНА МУДРАЯ /AFINA MUDRAYA',
  'ВЕЙМАРАНЕР К Ш',
  'АФИНА МУДРАЯ /AFINA MUDRAYA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АФИНА МУДРАЯ /AFINA MUDRAYA' AND breed = 'ВЕЙМАРАНЕР К Ш'),
  1087,
  1,
  235,
  2,
  '{"heats":[{"heat_number":1,"bib_number":17,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,15,16,15],"sum":78},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":164},{"heat_number":2,"bib_number":34,"bib_color":"red","judges":[{"judge_number":1,"scores":[9,15,8,7,7],"sum":46},{"judge_number":2,"scores":[5,5,5,5,5],"sum":25}],"total":71,"disqualified":false,"disqualification_reason":null}],"grand_total":235,"raw_total":235,"normalized_score":235}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Веймаранер к-ш</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АФИНА МУДРАЯ /<br>AFINA MUDRAYA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>46</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>71</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>235</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Веймаранер к-ш - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЗОВ ПОЛЕЙ ТЕРРАКОТ /ZOV POLEY TERRAKOT',
  'ВЕНГЕРСКАЯ ВЫЖЛА К Ш',
  'ЗОВ ПОЛЕЙ ТЕРРАКОТ /ZOV POLEY TERRAKOT',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЗОВ ПОЛЕЙ ТЕРРАКОТ /ZOV POLEY TERRAKOT' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА К Ш'),
  1087,
  1,
  327,
  2,
  '{"heats":[{"heat_number":1,"bib_number":17,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,17,17],"sum":84},{"judge_number":2,"scores":[16,18,16,16,17],"sum":83}],"total":167},{"heat_number":2,"bib_number":34,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,17,17,16,17],"sum":82},{"judge_number":2,"scores":[15,17,16,14,16],"sum":78}],"total":160,"disqualified":false,"disqualification_reason":null}],"grand_total":327,"raw_total":327,"normalized_score":327}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла к-ш</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЗОВ ПОЛЕЙ ТЕРРАКОТ /<br>ZOV POLEY TERRAKOT</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>327</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла к-ш - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /AURORAS MOON LIMITLESS EBONY POTENTION',
  'ДАЛМАТИН',
  'АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /AURORAS MOON LIMITLESS EBONY POTENTION',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /AURORAS MOON LIMITLESS EBONY POTENTION' AND breed = 'ДАЛМАТИН'),
  1087,
  1,
  335,
  2,
  '{"heats":[{"heat_number":1,"bib_number":113,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[17,18,18,18,17],"sum":88}],"total":171},{"heat_number":2,"bib_number":124,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,16,17,17],"sum":83},{"judge_number":2,"scores":[16,17,16,16,16],"sum":81}],"total":164,"disqualified":false,"disqualification_reason":null}],"grand_total":335,"raw_total":335,"normalized_score":335}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Далматин</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /<br>AURORAS MOON LIMITLESS EBONY POTENTION</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>113</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>124</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>335</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Далматин - Юниоры - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДУШЕЧКА КРАСА ИЗ ДОМА АЛАНТЕС /DUSHECHKA KRASA IZ DOMA ALANTES',
  'ИРЛАНДСКИЙ ТЕРЬЕР',
  'ДУШЕЧКА КРАСА ИЗ ДОМА АЛАНТЕС /DUSHECHKA KRASA IZ DOMA ALANTES',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДУШЕЧКА КРАСА ИЗ ДОМА АЛАНТЕС /DUSHECHKA KRASA IZ DOMA ALANTES' AND breed = 'ИРЛАНДСКИЙ ТЕРЬЕР'),
  1087,
  1,
  333,
  2,
  '{"heats":[{"heat_number":1,"bib_number":100,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,16,17,17],"sum":83},{"judge_number":2,"scores":[15,17,17,16,16],"sum":81}],"total":164},{"heat_number":2,"bib_number":111,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,17,17,17,17],"sum":84}],"total":169,"disqualified":false,"disqualification_reason":null}],"grand_total":333,"raw_total":333,"normalized_score":333}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Ирландский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ДУШЕЧКА-КРАСА ИЗ ДОМА АЛАНТЕС /<br>DUSHECHKA-KRASA IZ DOMA ALANTES</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>100</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>111</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>333</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Ирландский терьер - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'НЕЖНОЕ ПЛАМЯ ЭДАНА /NEZHNOYE PLAMYA EDANA',
  'ИРЛАНДСКИЙ ТЕРЬЕР',
  'НЕЖНОЕ ПЛАМЯ ЭДАНА /NEZHNOYE PLAMYA EDANA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'НЕЖНОЕ ПЛАМЯ ЭДАНА /NEZHNOYE PLAMYA EDANA' AND breed = 'ИРЛАНДСКИЙ ТЕРЬЕР'),
  1087,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"raw_total":null,"normalized_score":null}',
  '',
  '',
  'disqualified',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Ирландский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">НЕЖНОЕ ПЛАМЯ ЭДАНА /<br>NEZHNOYE PLAMYA EDANA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>100</i></font></td> <td colspan="6" rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Уход с трассы)</font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Ирландский терьер - Стандартный - Суки',
  'Уход с трассы'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'PANDORA VON HAUS BOCCIA',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)',
  'PANDORA VON HAUS BOCCIA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'PANDORA VON HAUS BOCCIA' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1087,
  1,
  334,
  2,
  '{"heats":[{"heat_number":1,"bib_number":118,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[17,17,16,18,17],"sum":85}],"total":170},{"heat_number":2,"bib_number":127,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,16,16,16,16],"sum":81},{"judge_number":2,"scores":[17,17,16,17,16],"sum":83}],"total":164,"disqualified":false,"disqualification_reason":null}],"grand_total":334,"raw_total":334,"normalized_score":334}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">PANDORA VON HAUS BOCCIA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>118</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>127</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>334</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ВИРНА /VIRNA',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)',
  'ВИРНА /VIRNA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВИРНА /VIRNA' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1087,
  2,
  331,
  2,
  '{"heats":[{"heat_number":1,"bib_number":117,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,16,15,17,16],"sum":80}],"total":165},{"heat_number":2,"bib_number":128,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,17,15,17,16],"sum":81}],"total":166,"disqualified":false,"disqualification_reason":null}],"grand_total":331,"raw_total":331,"normalized_score":331}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВИРНА /<br>VIRNA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>117</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>128</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>331</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЮСТИЦИЯ ИЗ БЕЛОГО ЯРА (Д Ш) /YUSTITSIYA IZ BELOGO JARA (L H)',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)',
  'ЮСТИЦИЯ ИЗ БЕЛОГО ЯРА (Д Ш) /YUSTITSIYA IZ BELOGO JARA (L H)',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЮСТИЦИЯ ИЗ БЕЛОГО ЯРА (Д Ш) /YUSTITSIYA IZ BELOGO JARA (L H)' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1087,
  3,
  328,
  2,
  '{"heats":[{"heat_number":1,"bib_number":116,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,16,16,16,16],"sum":81},{"judge_number":2,"scores":[17,17,16,18,17],"sum":85}],"total":166},{"heat_number":2,"bib_number":127,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[16,17,16,17,16],"sum":82}],"total":162,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"raw_total":328,"normalized_score":328}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЮСТИЦИЯ ИЗ БЕЛОГО ЯРА (Д-Ш) /<br>YUSTITSIYA IZ BELOGO JARA (L-H)</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>116</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>127</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЯРА /YARA',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)',
  'ЯРА /YARA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЯРА /YARA' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1087,
  4,
  327,
  2,
  '{"heats":[{"heat_number":1,"bib_number":116,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,16,17,16,16],"sum":81},{"judge_number":2,"scores":[16,17,16,17,17],"sum":83}],"total":164},{"heat_number":2,"bib_number":128,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[15,17,16,16,16],"sum":80}],"total":163,"disqualified":false,"disqualification_reason":null}],"grand_total":327,"raw_total":327,"normalized_score":327}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЯРА /<br>YARA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>116</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>128</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>327</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'PENELOPE VON HAUS BOCCIA (L H)',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)',
  'PENELOPE VON HAUS BOCCIA (L H)',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'PENELOPE VON HAUS BOCCIA (L H)' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1087,
  5,
  315,
  2,
  '{"heats":[{"heat_number":1,"bib_number":117,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[15,16,14,16,15],"sum":76}],"total":156},{"heat_number":2,"bib_number":129,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[14,16,15,15,14],"sum":74}],"total":159,"disqualified":false,"disqualification_reason":null}],"grand_total":315,"raw_total":315,"normalized_score":315}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">PENELOPE VON HAUS BOCCIA (L-H)</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>117</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>156</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>129</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>159</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>315</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ОБЕРЕГ С ВЕРШИНЫ ИНЬ ЯНЬ /OBEREG S VERSHINY IN YAN',
  'НЕМЕЦКИЙ ДОГ',
  'ОБЕРЕГ С ВЕРШИНЫ ИНЬ ЯНЬ /OBEREG S VERSHINY IN YAN',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ОБЕРЕГ С ВЕРШИНЫ ИНЬ ЯНЬ /OBEREG S VERSHINY IN YAN' AND breed = 'НЕМЕЦКИЙ ДОГ'),
  1087,
  1,
  328,
  2,
  '{"heats":[{"heat_number":1,"bib_number":49,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[15,17,16,16,16],"sum":80}],"total":160},{"heat_number":2,"bib_number":64,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,16,17,17,17],"sum":83},{"judge_number":2,"scores":[17,17,16,17,18],"sum":85}],"total":168,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"raw_total":328,"normalized_score":328}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкий дог</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ОБЕРЕГ С ВЕРШИНЫ ИНЬ-ЯНЬ /<br>OBEREG S VERSHINY IN-YAN</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>49</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>64</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкий дог - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS',
  'САМОЕД',
  'СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS' AND breed = 'САМОЕД'),
  1087,
  1,
  358,
  2,
  '{"heats":[{"heat_number":1,"bib_number":76,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,17,18,18,18],"sum":89},{"judge_number":2,"scores":[17,18,17,18,18],"sum":88}],"total":177},{"heat_number":2,"bib_number":89,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,18,19,18,18],"sum":91},{"judge_number":2,"scores":[18,18,17,19,18],"sum":90}],"total":181,"disqualified":false,"disqualification_reason":null}],"grand_total":358,"raw_total":358,"normalized_score":358}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Самоед</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /<br>SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>76</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>89</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">358</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Самоед - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN',
  'ЦВЕРГПИНЧЕР',
  'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN' AND breed = 'ЦВЕРГПИНЧЕР'),
  1087,
  1,
  326,
  2,
  '{"heats":[{"heat_number":1,"bib_number":95,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,17,16,16,16],"sum":80},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":166},{"heat_number":2,"bib_number":106,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,16,16,15,16],"sum":78},{"judge_number":2,"scores":[16,18,16,16,16],"sum":82}],"total":160,"disqualified":false,"disqualification_reason":null}],"grand_total":326,"raw_total":326,"normalized_score":326}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Цвергпинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /<br>TSESVIL GARDEN IRINUS GOLD BREIN</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>95</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>106</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>326</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Цвергпинчер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЭКСЕЛЛЕНТ СТАЙЛ МАРКУС /EXCELLENT STYLE MARKUS',
  'ШНАУЦЕР',
  'ЭКСЕЛЛЕНТ СТАЙЛ МАРКУС /EXCELLENT STYLE MARKUS',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЭКСЕЛЛЕНТ СТАЙЛ МАРКУС /EXCELLENT STYLE MARKUS' AND breed = 'ШНАУЦЕР'),
  1087,
  1,
  345,
  2,
  '{"heats":[{"heat_number":1,"bib_number":97,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,17,18,18],"sum":88},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":174},{"heat_number":2,"bib_number":108,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[17,18,18,18,18],"sum":89},{"judge_number":2,"scores":[16,17,17,16,16],"sum":82}],"total":171,"disqualified":false,"disqualification_reason":null}],"grand_total":345,"raw_total":345,"normalized_score":345}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Шнауцер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЭКСЕЛЛЕНТ СТАЙЛ МАРКУС /<br>EXCELLENT STYLE MARKUS</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>97</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>108</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>345</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Шнауцер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ДЕНВЕРС ЭЛИТ ЯС, АЙ КЕН ФЛАЙ /DENVERS ELITE YES, I CAN FLY',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'ДЕНВЕРС ЭЛИТ ЯС, АЙ КЕН ФЛАЙ /DENVERS ELITE YES, I CAN FLY',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЕНВЕРС ЭЛИТ ЯС, АЙ КЕН ФЛАЙ /DENVERS ELITE YES, I CAN FLY' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1087,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ДЕНВЕРС ЭЛИТ ЯС, АЙ КЕН ФЛАЙ /<br>DENVERS ELITE YES, I CAN FLY</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Неприбывшие участники',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1087,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">СТИ''Л ШАРМ ДЕСТЕЛЛО МИЯ /<br>STEE’L CHARM DESTELLO MIA</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Неприбывшие участники',
  ''
);
DELETE FROM results WHERE event_id = 1089;
UPDATE events SET judges = 'Минина С.В., судья' WHERE id = 1089;

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1089,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"raw_total":null,"normalized_score":null}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Потеря приманки)</font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  'Потеря приманки'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РУБИ',
  'БЕЗ ПОРОДЫ',
  'РУБИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РУБИ' AND breed = 'БЕЗ ПОРОДЫ'),
  1089,
  1,
  339,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,16,18,17],"sum":84},{"judge_number":2,"scores":[19,19,20,19,20],"sum":97}],"total":181},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,12,14,12,14],"sum":66},{"judge_number":2,"scores":[18,18,19,18,19],"sum":92}],"total":158,"disqualified":false,"disqualification_reason":null}],"grand_total":339,"raw_total":339,"normalized_score":339}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">РУБИ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>66</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>158</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">339</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'МОНА',
  'БЕЗ ПОРОДЫ',
  'МОНА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МОНА' AND breed = 'БЕЗ ПОРОДЫ'),
  1089,
  2,
  308,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,13,12,12,13],"sum":62},{"judge_number":2,"scores":[16,17,16,16,18],"sum":83}],"total":145},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,15,16,16,17],"sum":80},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":163,"disqualified":false,"disqualification_reason":null}],"grand_total":308,"raw_total":308,"normalized_score":308}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МОНА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>62</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>145</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>308</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'КЕКС',
  'БЕЗ ПОРОДЫ',
  'КЕКС',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КЕКС' AND breed = 'БЕЗ ПОРОДЫ'),
  1089,
  3,
  255,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[8,8,9,6,12],"sum":43},{"judge_number":2,"scores":[16,17,18,15,17],"sum":83}],"total":126},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[10,8,9,10,12],"sum":49},{"judge_number":2,"scores":[15,17,17,15,16],"sum":80}],"total":129,"disqualified":false,"disqualification_reason":null}],"grand_total":255,"raw_total":255,"normalized_score":255}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КЕКС</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>43</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>126</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>49</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>255</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СЕРВИЛИЯ ФОМ ГРЮНЕН ШТАДТ',
  'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА',
  'СЕРВИЛИЯ ФОМ ГРЮНЕН ШТАДТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СЕРВИЛИЯ ФОМ ГРЮНЕН ШТАДТ' AND breed = 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА'),
  1089,
  1,
  347,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,18,17,18],"sum":86},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":176},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[17,17,18,16,17],"sum":85},{"judge_number":2,"scores":[17,17,17,18,17],"sum":86}],"total":171,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"raw_total":347,"normalized_score":347}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бельгийская овчарка малинуа</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СЕРВИЛИЯ ФОМ ГРЮНЕН ШТАДТ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">347</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЯШМА',
  'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА',
  'ЯШМА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЯШМА' AND breed = 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА'),
  1089,
  2,
  327,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[18,17,18,18,17],"sum":88},{"judge_number":2,"scores":[17,17,18,17,18],"sum":87}],"total":175},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[17,17,17,18,17],"sum":86}],"total":152,"disqualified":false,"disqualification_reason":null}],"grand_total":327,"raw_total":327,"normalized_score":327}',
  'CACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бельгийская овчарка малинуа</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЯШМА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152.1<a title="Ранний/Поздний старт (штраф 10% от суммы баллов забега)" href="#remark"><sup>#</sup></a></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>327.1</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB</font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СИМПЛИ ЗЕ БЕСТ ФОМ ГРЮНЕН ШТАРД',
  'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА',
  'СИМПЛИ ЗЕ БЕСТ ФОМ ГРЮНЕН ШТАРД',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИМПЛИ ЗЕ БЕСТ ФОМ ГРЮНЕН ШТАРД' AND breed = 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА'),
  1089,
  3,
  307,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,16,17,16,17],"sum":81},{"judge_number":2,"scores":[17,18,18,16,18],"sum":87}],"total":168},{"heat_number":2,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[14,13,14,15,16],"sum":72},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":139,"disqualified":false,"disqualification_reason":null}],"grand_total":307,"raw_total":307,"normalized_score":307}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бельгийская овчарка малинуа</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СИМПЛИ ЗЕ БЕСТ ФОМ ГРЮНЕН ШТАРД</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>139.5<a title="Ранний/Поздний старт (штраф 10% от суммы баллов забега)" href="#remark"><sup>#</sup></a></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>307.5</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АКВАТА',
  'БИГЛЬ',
  'АКВАТА',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКВАТА' AND breed = 'БИГЛЬ'),
  1089,
  1,
  316,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[14,12,12,12,14],"sum":64},{"judge_number":2,"scores":[17,17,18,18,18],"sum":88}],"total":152},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,15,15,16,16],"sum":76},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":164,"disqualified":false,"disqualification_reason":null}],"grand_total":316,"raw_total":316,"normalized_score":316}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКВАТА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>64</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>76</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>316</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Бигль - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЧЕЙЗИ /CHEJZI',
  'БИГЛЬ',
  'ЧЕЙЗИ /CHEJZI',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧЕЙЗИ /CHEJZI' AND breed = 'БИГЛЬ'),
  1089,
  2,
  283,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,10,12,11,12],"sum":57},{"judge_number":2,"scores":[17,17,18,17,18],"sum":87}],"total":144},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[9,10,10,11,14],"sum":54},{"judge_number":2,"scores":[17,18,17,16,17],"sum":85}],"total":139,"disqualified":false,"disqualification_reason":null}],"grand_total":283,"raw_total":283,"normalized_score":283}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧЕЙЗИ /<br>CHEJZI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>57</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>144</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>54</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>139</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>283</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БЬЮТИС ГЛАНС НЭШЕНАЛ ВИННЕР',
  'БИГЛЬ',
  'БЬЮТИС ГЛАНС НЭШЕНАЛ ВИННЕР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БЬЮТИС ГЛАНС НЭШЕНАЛ ВИННЕР' AND breed = 'БИГЛЬ'),
  1089,
  3,
  281,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,10,11,9,10],"sum":52},{"judge_number":2,"scores":[17,16,17,16,16],"sum":82}],"total":134},{"heat_number":2,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[10,11,12,12,16],"sum":61},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":147,"disqualified":false,"disqualification_reason":null}],"grand_total":281,"raw_total":281,"normalized_score":281}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БЬЮТИ’С ГЛАНС НЭШЕНАЛ ВИННЕР</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>52</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>134</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>61</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>147</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>281</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Стандартный - Микс',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'НУМЕНОРС ОРОФЕН',
  'ВЕНГЕРСКАЯ ВЫЖЛА',
  'НУМЕНОРС ОРОФЕН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'НУМЕНОРС ОРОФЕН' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1089,
  1,
  342,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,15,15,16,15],"sum":77},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":167},{"heat_number":2,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[16,15,16,16,17],"sum":80},{"judge_number":2,"scores":[18,18,20,19,20],"sum":95}],"total":175,"disqualified":false,"disqualification_reason":null}],"grand_total":342,"raw_total":342,"normalized_score":342}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">НУМЕНОР''С ОРОФЕН</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">342</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АМАДЕЙ',
  'ВЕНГЕРСКАЯ ВЫЖЛА',
  'АМАДЕЙ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АМАДЕЙ' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1089,
  2,
  311,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,13,14,15,15],"sum":72},{"judge_number":2,"scores":[18,18,18,18,19],"sum":91}],"total":163},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,13,14,13,13],"sum":67},{"judge_number":2,"scores":[16,17,16,15,17],"sum":81}],"total":148,"disqualified":false,"disqualification_reason":null}],"grand_total":311,"raw_total":311,"normalized_score":311}',
  'CACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АМАДЕЙ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>67</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>148</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>311</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB</font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЗОВ ПОЛЕЙ ТЕРРАКОТ /ZOV POLEY TERRAKOT',
  'ВЕНГЕРСКАЯ ВЫЖЛА',
  'ЗОВ ПОЛЕЙ ТЕРРАКОТ /ZOV POLEY TERRAKOT',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЗОВ ПОЛЕЙ ТЕРРАКОТ /ZOV POLEY TERRAKOT' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1089,
  3,
  306,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[13,13,14,14,14],"sum":68},{"judge_number":2,"scores":[15,17,16,15,17],"sum":80}],"total":148},{"heat_number":2,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[12,14,16,16,16],"sum":74},{"judge_number":2,"scores":[16,17,17,17,17],"sum":84}],"total":158,"disqualified":false,"disqualification_reason":null}],"grand_total":306,"raw_total":306,"normalized_score":306}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЗОВ ПОЛЕЙ ТЕРРАКОТ /<br>ZOV POLEY TERRAKOT</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>68</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>148</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>74</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>158</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>306</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АЙМАНТ',
  'ВЕНГЕРСКАЯ ВЫЖЛА',
  'АЙМАНТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЙМАНТ' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1089,
  4,
  301,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,11,12,10,12],"sum":57},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":140},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,16,15,12,14],"sum":71},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":161,"disqualified":false,"disqualification_reason":null}],"grand_total":301,"raw_total":301,"normalized_score":301}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АЙМАНТ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>57</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>140</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>71</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>301</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АКИО',
  'ВЕНГЕРСКАЯ ВЫЖЛА',
  'АКИО',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКИО' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1089,
  5,
  289,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[14,12,12,13,14],"sum":65},{"judge_number":2,"scores":[15,16,16,16,17],"sum":80}],"total":145},{"heat_number":2,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[12,14,14,10,11],"sum":61},{"judge_number":2,"scores":[17,17,17,15,17],"sum":83}],"total":144,"disqualified":false,"disqualification_reason":null}],"grand_total":289,"raw_total":289,"normalized_score":289}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКИО</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>65</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>145</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>61</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>144</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>289</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АРАНИ',
  'ВЕНГЕРСКАЯ ВЫЖЛА',
  'АРАНИ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АРАНИ' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1089,
  6,
  285,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[15,14,14,15,15],"sum":73},{"judge_number":2,"scores":[16,16,17,17,17],"sum":83}],"total":156},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[10,12,12,6,8],"sum":48},{"judge_number":2,"scores":[16,17,15,16,17],"sum":81}],"total":129,"disqualified":false,"disqualification_reason":null}],"grand_total":285,"raw_total":285,"normalized_score":285}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АРАНИ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>156</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>48</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>285</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ИРОН БАЙТ',
  'ГОЛЛАНДСКАЯ ОВЧАРКА',
  'ИРОН БАЙТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ИРОН БАЙТ' AND breed = 'ГОЛЛАНДСКАЯ ОВЧАРКА'),
  1089,
  1,
  247,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[7,7,8,10,9],"sum":41},{"judge_number":2,"scores":[17,18,17,18,18],"sum":88}],"total":129},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[5,5,6,5,6],"sum":27},{"judge_number":2,"scores":[18,18,18,18,19],"sum":91}],"total":118,"disqualified":false,"disqualification_reason":null}],"grand_total":247,"raw_total":247,"normalized_score":247}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Голландская овчарка</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ИРОН БАЙТ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>41</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>27</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>118</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>247</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Голландская овчарка - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АЛВИШ ПОЛАРИС ДАРК НАЙТ',
  'ГОЛЛАНДСКАЯ ОВЧАРКА',
  'АЛВИШ ПОЛАРИС ДАРК НАЙТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЛВИШ ПОЛАРИС ДАРК НАЙТ' AND breed = 'ГОЛЛАНДСКАЯ ОВЧАРКА'),
  1089,
  2,
  235,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[5,6,5,5,6],"sum":27},{"judge_number":2,"scores":[15,16,16,16,16],"sum":79}],"total":106},{"heat_number":2,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[10,7,9,9,9],"sum":44},{"judge_number":2,"scores":[16,17,17,17,18],"sum":85}],"total":129,"disqualified":false,"disqualification_reason":null}],"grand_total":235,"raw_total":235,"normalized_score":235}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Голландская овчарка</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АЛВИШ ПОЛАРИС ДАРК НАЙТ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>27</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>106</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>44</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>235</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Голландская овчарка - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БАЛЬТАЗАР Д МАГНУМ',
  'ГОЛЛАНДСКАЯ ОВЧАРКА',
  'БАЛЬТАЗАР Д МАГНУМ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БАЛЬТАЗАР Д МАГНУМ' AND breed = 'ГОЛЛАНДСКАЯ ОВЧАРКА'),
  1089,
  3,
  226,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[6,6,6,7,7],"sum":32},{"judge_number":2,"scores":[16,17,17,17,17],"sum":84}],"total":116},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[8,6,8,7,8],"sum":37},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":110,"disqualified":false,"disqualification_reason":null}],"grand_total":226,"raw_total":226,"normalized_score":226}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Голландская овчарка</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БАЛЬТАЗАР Д МАГНУМ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>32</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>116</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>37</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>110.7<a title="Ранний/Поздний старт (штраф 10% от суммы баллов забега)" href="#remark"><sup>#</sup></a></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>226.7</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Голландская овчарка - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АЙЗА ЛУННЫЙ СВЕТ /AJZA LUNNYJ SVET',
  'ЛАБРАДОР РЕТРИВЕР',
  'АЙЗА ЛУННЫЙ СВЕТ /AJZA LUNNYJ SVET',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЙЗА ЛУННЫЙ СВЕТ /AJZA LUNNYJ SVET' AND breed = 'ЛАБРАДОР РЕТРИВЕР'),
  1089,
  1,
  286,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[10,10,8,9,10],"sum":47},{"judge_number":2,"scores":[17,18,18,16,18],"sum":87}],"total":134},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,10,14,14,14],"sum":64},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":152,"disqualified":false,"disqualification_reason":null}],"grand_total":286,"raw_total":286,"normalized_score":286}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Лабрадор ретривер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АЙЗА ЛУННЫЙ СВЕТ /<br>AJZA LUNNY`J SVET</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>47</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>134</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>64</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>286</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Лабрадор ретривер - Стандартный - Суки',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РАМИР СКАЙ БЛЮ',
  'НЕМЕЦКИЙ ПИНЧЕР',
  'РАМИР СКАЙ БЛЮ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РАМИР СКАЙ БЛЮ' AND breed = 'НЕМЕЦКИЙ ПИНЧЕР'),
  1089,
  1,
  324,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[13,14,15,14,15],"sum":71},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":160},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[15,15,14,15,15],"sum":74},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":164,"disqualified":false,"disqualification_reason":null}],"grand_total":324,"raw_total":324,"normalized_score":324}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкий пинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">РАМИР СКАЙ БЛЮ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>71</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>74</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>324</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Немецкий пинчер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'РОЙ ГАЛАКСИ ДЖОЙ',
  'НЕМЕЦКИЙ ПИНЧЕР',
  'РОЙ ГАЛАКСИ ДЖОЙ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РОЙ ГАЛАКСИ ДЖОЙ' AND breed = 'НЕМЕЦКИЙ ПИНЧЕР'),
  1089,
  2,
  295,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[12,14,15,12,14],"sum":67},{"judge_number":2,"scores":[15,17,17,15,17],"sum":81}],"total":148},{"heat_number":2,"bib_number":null,"bib_color":"#f0ffff","judges":[{"judge_number":1,"scores":[12,13,12,13,13],"sum":63},{"judge_number":2,"scores":[17,17,17,16,17],"sum":84}],"total":147,"disqualified":false,"disqualification_reason":null}],"grand_total":295,"raw_total":295,"normalized_score":295}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкий пинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">РОЙ ГАЛАКСИ ДЖОЙ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>67</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>148</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>63</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>147</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>295</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкий пинчер - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'АКСЕЛЬ ЛЕО БАЙРОН',
  'НЕМЕЦКИЙ ПИНЧЕР',
  'АКСЕЛЬ ЛЕО БАЙРОН',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКСЕЛЬ ЛЕО БАЙРОН' AND breed = 'НЕМЕЦКИЙ ПИНЧЕР'),
  1089,
  NULL,
  NULL,
  1,
  '{"heats":[],"grand_total":null,"raw_total":null,"normalized_score":null}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Немецкий пинчер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АКСЕЛЬ ЛЕО БАЙРОН</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Потеря приманки)</font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкий пинчер - Стандартный - Кобели',
  'Потеря приманки'
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'КАМИЛЛИОН СТАРС СТРОНГ СПИРИТ',
  'СИБИРСКИЙ ХАСКИ',
  'КАМИЛЛИОН СТАРС СТРОНГ СПИРИТ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КАМИЛЛИОН СТАРС СТРОНГ СПИРИТ' AND breed = 'СИБИРСКИЙ ХАСКИ'),
  1089,
  1,
  206,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[6,6,8,6,8],"sum":34},{"judge_number":2,"scores":[15,16,17,16,17],"sum":81}],"total":115},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[5,5,6,5,6],"sum":27},{"judge_number":2,"scores":[13,14,14,11,12],"sum":64}],"total":91,"disqualified":false,"disqualification_reason":null}],"grand_total":206,"raw_total":206,"normalized_score":206}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сибирский хаски</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КАМИЛЛИОН СТАРС СТРОНГ СПИРИТ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>34</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>115</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>27</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>206</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Сибирский хаски - Стандартный - Кобели',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'ЖИЗНЬ БЬЕТ КЛЮЧОМ',
  'ЯКУТСКАЯ ЛАЙКА',
  'ЖИЗНЬ БЬЕТ КЛЮЧОМ',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЖИЗНЬ БЬЕТ КЛЮЧОМ' AND breed = 'ЯКУТСКАЯ ЛАЙКА'),
  1089,
  1,
  299,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[8,10,10,8,10],"sum":46},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":129},{"heat_number":2,"bib_number":null,"bib_color":"red","judges":[{"judge_number":1,"scores":[16,15,16,16,17],"sum":80},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":170,"disqualified":false,"disqualification_reason":null}],"grand_total":299,"raw_total":299,"normalized_score":299}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Якутская лайка</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЖИЗНЬ БЬЕТ КЛЮЧОМ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>46</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>299</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Якутская лайка - Стандартный - Кобели',
  ''
);