DELETE FROM results WHERE event_id = 1301;
UPDATE events SET judges = 'Главный судья - Лукина Д.М., судья - Гродинская Т.Л.' WHERE id = 1301;

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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'MILORD RICHARD IZ RELAX LANDA' AND breed = 'БЕДЛИНГТОН ТЕРЬЕР'),
  1301,
  1,
  328,
  2,
  '{"heats":[{"heat_number":43,"bib_number":43,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[15,15,14,16,17],"sum":77}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":63,"bib_number":63,"judges":[{"judge_number":1,"scores":[17,17,17,15,16],"sum":82},{"judge_number":2,"scores":[17,17,16,16,18],"sum":84}],"total":82,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"normalized_score":328,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бедлингтон терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">MILORD RICHARD  IZ RELAX LANDA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>43</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>63</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">328</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бедлингтон терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВЕРСАЧЕ БРАЙТ КРИСТАЛ /VERSACE BRIGHT CRYSTAL' AND breed = 'БИГЛЬ'),
  1301,
  1,
  298,
  2,
  '{"heats":[{"heat_number":45,"bib_number":45,"judges":[{"judge_number":1,"scores":[16,17,17,10,15],"sum":75},{"judge_number":2,"scores":[14,14,14,13,14],"sum":69}],"total":75,"disqualified":false,"disqualification_reason":null},{"heat_number":63,"bib_number":63,"judges":[{"judge_number":1,"scores":[15,17,17,14,16],"sum":79},{"judge_number":2,"scores":[15,15,15,14,16],"sum":75}],"total":79,"disqualified":false,"disqualification_reason":null}],"grand_total":298,"normalized_score":298,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВЕРСАЧЕ БРАЙТ КРИСТАЛ /<br>VERSACE BRIGHT CRYSTAL</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>45</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>75</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>144</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>63</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>154</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>298</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КУРАЖ КЛАБ ГОДДЕСС /COURAGE CLUB GODDESS' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1301,
  1,
  328,
  2,
  '{"heats":[{"heat_number":42,"bib_number":42,"judges":[{"judge_number":1,"scores":[17,17,17,16,17],"sum":84},{"judge_number":2,"scores":[15,16,16,17,17],"sum":81}],"total":84,"disqualified":false,"disqualification_reason":null},{"heat_number":64,"bib_number":64,"judges":[{"judge_number":1,"scores":[17,17,17,15,17],"sum":83},{"judge_number":2,"scores":[16,16,16,15,17],"sum":80}],"total":83,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"normalized_score":328,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КУРАЖ КЛАБ ГОДДЕСС /<br>COURAGE CLUB GODDESS</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>42</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>64</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Бигль - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БАТИДА ДЕ КОКО' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1301,
  2,
  325,
  2,
  '{"heats":[{"heat_number":44,"bib_number":44,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[14,14,14,17,16],"sum":75}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":62,"bib_number":62,"judges":[{"judge_number":1,"scores":[17,17,16,16,17],"sum":83},{"judge_number":2,"scores":[17,17,16,16,16],"sum":82}],"total":83,"disqualified":false,"disqualification_reason":null}],"grand_total":325,"normalized_score":325,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БАТИДА ДЕ КОКО</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>44</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>62</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>325</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Бигль - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МАРЛЕН БРАО ЧАРОДЕЙ /MARLEN BRAO CHARODEI' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1301,
  3,
  325,
  2,
  '{"heats":[{"heat_number":42,"bib_number":42,"judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[15,15,15,16,17],"sum":78}],"total":83,"disqualified":false,"disqualification_reason":null},{"heat_number":62,"bib_number":62,"judges":[{"judge_number":1,"scores":[17,17,16,17,17],"sum":84},{"judge_number":2,"scores":[16,16,16,16,16],"sum":80}],"total":84,"disqualified":false,"disqualification_reason":null}],"grand_total":325,"normalized_score":325,"format":"bzmp"}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МАРЛЕН-БРАО ЧАРОДЕЙ /<br>MARLEN-BRAO CHARODEI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>42</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>62</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>325</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Бигль - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БРЭНА /BRENA' AND breed = 'ДЖЕК РАССЕЛ ТЕРЬЕР'),
  1301,
  1,
  331,
  2,
  '{"heats":[{"heat_number":46,"bib_number":46,"judges":[{"judge_number":1,"scores":[16,18,17,17,19],"sum":87},{"judge_number":2,"scores":[15,15,14,17,17],"sum":78}],"total":87,"disqualified":false,"disqualification_reason":null},{"heat_number":65,"bib_number":65,"judges":[{"judge_number":1,"scores":[17,17,16,17,18],"sum":85},{"judge_number":2,"scores":[16,16,15,17,17],"sum":81}],"total":85,"disqualified":false,"disqualification_reason":null}],"grand_total":331,"normalized_score":331,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Джек Рассел Терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БРЭНА /<br>BRENA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>46</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>65</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">331</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Джек Рассел Терьер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS' AND breed = 'САМОЕД'),
  1301,
  1,
  336,
  2,
  '{"heats":[{"heat_number":47,"bib_number":47,"judges":[{"judge_number":1,"scores":[17,17,17,18,18],"sum":87},{"judge_number":2,"scores":[16,16,16,17,17],"sum":82}],"total":87,"disqualified":false,"disqualification_reason":null},{"heat_number":66,"bib_number":66,"judges":[{"judge_number":1,"scores":[17,17,16,17,18],"sum":85},{"judge_number":2,"scores":[16,16,16,17,17],"sum":82}],"total":85,"disqualified":false,"disqualification_reason":null}],"grand_total":336,"normalized_score":336,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Самоед</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /<br>SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>47</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>66</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">336</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Самоед - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN' AND breed = 'ЦВЕРГПИНЧЕР'),
  1301,
  1,
  324,
  2,
  '{"heats":[{"heat_number":48,"bib_number":48,"judges":[{"judge_number":1,"scores":[17,17,17,15,16],"sum":82},{"judge_number":2,"scores":[16,16,16,15,16],"sum":79}],"total":82,"disqualified":false,"disqualification_reason":null},{"heat_number":67,"bib_number":67,"judges":[{"judge_number":1,"scores":[16,17,17,15,17],"sum":82},{"judge_number":2,"scores":[16,17,16,15,17],"sum":81}],"total":82,"disqualified":false,"disqualification_reason":null}],"grand_total":324,"normalized_score":324,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Цвергпинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /<br>TSESVIL GARDEN IRINUS GOLD BREIN</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>48</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>67</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>324</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Цвергпинчер - Стандартный - Кобели',
  '',
  ''
);
DELETE FROM results WHERE event_id = 1303;
UPDATE events SET judges = 'Главный судья - Карелина Н.В.' WHERE id = 1303;

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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ZHE TEM KASPER' AND breed = 'БЕЛАЯ ШВЕЙЦАРСКАЯ ОВЧАРКА'),
  1303,
  1,
  142,
  1,
  '{"heats":[{"heat_number":29,"bib_number":29,"judges":[{"judge_number":1,"scores":[14,14,13,15,16],"sum":72}],"total":72,"disqualified":false,"disqualification_reason":null},{"heat_number":32,"bib_number":32,"judges":[{"judge_number":1,"scores":[13,14,12,15,16],"sum":70}],"total":70,"disqualified":false,"disqualification_reason":null}],"grand_total":142,"normalized_score":142,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Белая швейцарская овчарка</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ZHE TEM KASPER</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>72</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>70</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>70</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>142</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Белая швейцарская овчарка - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'PARMA VON AVERSWALD' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ'),
  1303,
  1,
  173,
  1,
  '{"heats":[{"heat_number":30,"bib_number":30,"judges":[{"judge_number":1,"scores":[16,18,18,16,18],"sum":86}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":33,"bib_number":33,"judges":[{"judge_number":1,"scores":[16,18,18,17,18],"sum":87}],"total":87,"disqualified":false,"disqualification_reason":null}],"grand_total":173,"normalized_score":173,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка стандартная</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">PARMA VON AVERSWALD</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>86</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>87</b></font></td> <td bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">173</abbr></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкая овчарка стандартная - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ONIKS PERSEY' AND breed = 'БИГЛЬ'),
  1303,
  1,
  164,
  1,
  '{"heats":[{"heat_number":28,"bib_number":28,"judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83}],"total":83,"disqualified":false,"disqualification_reason":null},{"heat_number":31,"bib_number":31,"judges":[{"judge_number":1,"scores":[14,17,17,15,18],"sum":81}],"total":81,"disqualified":false,"disqualification_reason":null}],"grand_total":164,"normalized_score":164,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ONIKS PERSEY</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>83</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>81</b></font></td> <td bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">164</abbr></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'GOLDEN APPLE' AND breed = 'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (ВЫЖЛА)'),
  1303,
  1,
  176,
  1,
  '{"heats":[{"heat_number":30,"bib_number":30,"judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88}],"total":88,"disqualified":false,"disqualification_reason":null},{"heat_number":33,"bib_number":33,"judges":[{"judge_number":1,"scores":[16,18,18,18,18],"sum":88}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":176,"normalized_score":176,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Венгерская короткошёрстная легавая (Выжла)</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">GOLDEN APPLE</font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>88</b></font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>88</b></font></td> <td bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">176</abbr></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская короткошёрстная легавая (Выжла) - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'SEVAN' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1303,
  1,
  158,
  1,
  '{"heats":[{"heat_number":19,"bib_number":19,"judges":[{"judge_number":1,"scores":[14,16,16,16,16],"sum":78}],"total":78,"disqualified":false,"disqualification_reason":null},{"heat_number":24,"bib_number":24,"judges":[{"judge_number":1,"scores":[15,16,15,17,17],"sum":80}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":158,"normalized_score":158,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">SEVAN</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>78</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>158</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский голый терьер - Юниоры - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФАБИАН ДОМИНЕРИНГ' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1303,
  1,
  162,
  1,
  '{"heats":[{"heat_number":21,"bib_number":21,"judges":[{"judge_number":1,"scores":[15,17,17,15,17],"sum":81}],"total":81,"disqualified":false,"disqualification_reason":null},{"heat_number":25,"bib_number":25,"judges":[{"judge_number":1,"scores":[16,16,16,16,17],"sum":81}],"total":81,"disqualified":false,"disqualification_reason":null}],"grand_total":162,"normalized_score":162,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ФАБИАН ДОМИНЕРИНГ</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>81</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>162</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'FIDEL DEFT' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1303,
  2,
  152,
  1,
  '{"heats":[{"heat_number":20,"bib_number":20,"judges":[{"judge_number":1,"scores":[14,17,17,15,17],"sum":80}],"total":80,"disqualified":false,"disqualification_reason":null},{"heat_number":25,"bib_number":25,"judges":[{"judge_number":1,"scores":[13,15,15,13,16],"sum":72}],"total":72,"disqualified":false,"disqualification_reason":null}],"grand_total":152,"normalized_score":152,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">FIDEL DEFT</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>80</b></font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>72</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>152</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДОДЖ ВОРТИ КОНТЕНДЕР' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1303,
  3,
  145,
  1,
  '{"heats":[{"heat_number":20,"bib_number":20,"judges":[{"judge_number":1,"scores":[10,16,16,12,16],"sum":70}],"total":70,"disqualified":false,"disqualification_reason":null},{"heat_number":26,"bib_number":26,"judges":[{"judge_number":1,"scores":[13,16,16,13,17],"sum":75}],"total":75,"disqualified":false,"disqualification_reason":null}],"grand_total":145,"normalized_score":145,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ДОДЖ ВОРТИ КОНТЕНДЕР</font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>70</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>70</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>75</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>75</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>145</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'DAKOTA SOUL QUEEN' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1303,
  1,
  162,
  1,
  '{"heats":[{"heat_number":23,"bib_number":23,"judges":[{"judge_number":1,"scores":[16,16,16,17,17],"sum":82}],"total":82,"disqualified":false,"disqualification_reason":null},{"heat_number":27,"bib_number":27,"judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":162,"normalized_score":162,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">DAKOTA SOUL QUEEN</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>82</b></font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>80</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>162</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФУРИЯ ШРЕЛЛ' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1303,
  2,
  160,
  1,
  '{"heats":[{"heat_number":22,"bib_number":22,"judges":[{"judge_number":1,"scores":[15,15,16,16,17],"sum":79}],"total":79,"disqualified":false,"disqualification_reason":null},{"heat_number":27,"bib_number":27,"judges":[{"judge_number":1,"scores":[16,17,17,15,16],"sum":81}],"total":81,"disqualified":false,"disqualification_reason":null}],"grand_total":160,"normalized_score":160,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ФУРИЯ ШРЕЛЛ</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>79</b></font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>81</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>160</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'KAYLA' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1303,
  3,
  149,
  1,
  '{"heats":[{"heat_number":22,"bib_number":22,"judges":[{"judge_number":1,"scores":[14,13,13,15,17],"sum":72}],"total":72,"disqualified":false,"disqualification_reason":null},{"heat_number":26,"bib_number":26,"judges":[{"judge_number":1,"scores":[16,14,13,17,17],"sum":77}],"total":77,"disqualified":false,"disqualification_reason":null}],"grand_total":149,"normalized_score":149,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">KAYLA</font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>72</b></font></td> <td bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b>77</b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b>149</b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский голый терьер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ОСКАР /OSKAR' AND breed = 'БИГЛЬ'),
  1303,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ОСКАР /<br>OSKAR</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Американский голый терьер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СЕВЕРИН СВОРА АДЫГЕИ' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1303,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">СЕВЕРИН СВОРА АДЫГЕИ</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Американский голый терьер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АМБЕР МУН' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1303,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АМБЕР МУН</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Американский голый терьер - Стандартный - Суки',
  '',
  ''
);
DELETE FROM results WHERE event_id = 1305;
UPDATE events SET judges = 'Главный судья - Иванова Г.С., судья - Богаченко В.В.' WHERE id = 1305;

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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КАПУЧИНО' AND breed = 'БЕЗ ПОРОДЫ'),
  1305,
  1,
  359,
  2,
  '{"heats":[{"heat_number":69,"bib_number":69,"judges":[{"judge_number":1,"scores":[18,18,18,19,18],"sum":91},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":91,"disqualified":false,"disqualification_reason":null},{"heat_number":78,"bib_number":78,"judges":[{"judge_number":1,"scores":[17,17,18,18,19],"sum":89},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":89,"disqualified":false,"disqualification_reason":null}],"grand_total":359,"normalized_score":359,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КАПУЧИНО</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>69</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>78</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">359</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКСЕЛЬ' AND breed = 'БЕЗ ПОРОДЫ'),
  1305,
  2,
  353,
  2,
  '{"heats":[{"heat_number":68,"bib_number":68,"judges":[{"judge_number":1,"scores":[17,18,16,18,18],"sum":87},{"judge_number":2,"scores":[17,17,18,18,18],"sum":88}],"total":87,"disqualified":false,"disqualification_reason":null},{"heat_number":77,"bib_number":77,"judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[17,17,18,17,18],"sum":87}],"total":91,"disqualified":false,"disqualification_reason":null}],"grand_total":353,"normalized_score":353,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКСЕЛЬ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>68</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>77</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'YO TE AMO CROWLEY PIT MUST SURVIVE' AND breed = 'БЕЗ ПОРОДЫ'),
  1305,
  3,
  351,
  2,
  '{"heats":[{"heat_number":68,"bib_number":68,"judges":[{"judge_number":1,"scores":[17,17,17,17,18],"sum":86},{"judge_number":2,"scores":[18,17,18,17,18],"sum":88}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":77,"bib_number":77,"judges":[{"judge_number":1,"scores":[17,18,18,18,18],"sum":89},{"judge_number":2,"scores":[17,17,18,18,18],"sum":88}],"total":89,"disqualified":false,"disqualification_reason":null}],"grand_total":351,"normalized_score":351,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">YO TE AMO CROWLEY "PIT MUST SURVIVE"</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>68</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>77</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>351</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КАМА' AND breed = 'БЕЗ ПОРОДЫ'),
  1305,
  1,
  357,
  2,
  '{"heats":[{"heat_number":69,"bib_number":69,"judges":[{"judge_number":1,"scores":[18,18,18,18,18],"sum":90},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":90,"disqualified":false,"disqualification_reason":null},{"heat_number":78,"bib_number":78,"judges":[{"judge_number":1,"scores":[18,18,17,18,17],"sum":88},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":357,"normalized_score":357,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КАМА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>69</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>78</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИЛЬВИ' AND breed = 'БЕЗ ПОРОДЫ'),
  1305,
  2,
  353,
  2,
  '{"heats":[{"heat_number":67,"bib_number":67,"judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":76,"bib_number":76,"judges":[{"judge_number":1,"scores":[18,17,17,18,18],"sum":88},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":353,"normalized_score":353,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СИЛЬВИ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>67</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>76</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧАРА' AND breed = 'БЕЗ ПОРОДЫ'),
  1305,
  3,
  347,
  2,
  '{"heats":[{"heat_number":70,"bib_number":70,"judges":[{"judge_number":1,"scores":[16,17,17,17,16],"sum":83},{"judge_number":2,"scores":[18,17,17,18,17],"sum":87}],"total":83,"disqualified":false,"disqualification_reason":null},{"heat_number":79,"bib_number":79,"judges":[{"judge_number":1,"scores":[17,17,18,18,18],"sum":88},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"normalized_score":347,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧАРА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>70</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>79</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧЕЙЗИ /CHEJZI' AND breed = 'БИГЛЬ'),
  1305,
  1,
  360,
  2,
  '{"heats":[{"heat_number":72,"bib_number":72,"judges":[{"judge_number":1,"scores":[18,18,18,18,19],"sum":91},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":91,"disqualified":false,"disqualification_reason":null},{"heat_number":85,"bib_number":85,"judges":[{"judge_number":1,"scores":[18,18,17,18,18],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":89,"disqualified":false,"disqualification_reason":null}],"grand_total":360,"normalized_score":360,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧЕЙЗИ /<br>CHEJZI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>72</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>85</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">360</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКВАТА' AND breed = 'БИГЛЬ'),
  1305,
  2,
  343,
  2,
  '{"heats":[{"heat_number":71,"bib_number":71,"judges":[{"judge_number":1,"scores":[16,17,17,18,17],"sum":85},{"judge_number":2,"scores":[18,17,17,18,18],"sum":88}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":85,"bib_number":85,"judges":[{"judge_number":1,"scores":[17,16,17,16,18],"sum":84},{"judge_number":2,"scores":[16,17,18,17,18],"sum":86}],"total":84,"disqualified":false,"disqualification_reason":null}],"grand_total":343,"normalized_score":343,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКВАТА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>71</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>85</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>343</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЖАСТЕР' AND breed = 'БИГЛЬ'),
  1305,
  NULL,
  NULL,
  1,
  '{"heats":[{"heat_number":71,"bib_number":71,"judges":[{"judge_number":1,"scores":[15,15,16,15,17],"sum":78}],"total":78,"disqualified":false,"disqualification_reason":null},{"heat_number":86,"bib_number":86,"judges":[{"judge_number":1,"scores":[],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}],"grand_total":null,"normalized_score":null,"format":"bzmp"}',
  '',
  '',
  'disqualified',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЖАСТЕР</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>71</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>86</i></font></td> <td colspan="6" rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Сход с трассы, возврат к владельцу)</font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  'Сход с трассы, возврат к владельцу',
  ''
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВИЛЬЯМ НИКОЛЛО ПАГАНИНИ' AND breed = 'БИГЛЬ'),
  1305,
  NULL,
  NULL,
  1,
  '{"heats":[{"heat_number":73,"bib_number":73,"judges":[{"judge_number":1,"scores":[null,null,null,null,null],"sum":null}],"total":null,"disqualified":true,"disqualification_reason":"Отстранение (Сход с трассы, возврат к владельцу)"}],"grand_total":null,"normalized_score":null,"format":"bzmp"}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Ветераны</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ВИЛЬЯМ НИКОЛЛО ПАГАНИНИ</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>73</i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Сход с трассы, возврат к владельцу)</font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Ветераны - Кобели',
  'Сход с трассы, возврат к владельцу',
  ''
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РОЯЛ АЙСИНГ ФАРТИ' AND breed = 'ДЖЕК РАССЕЛ ТЕРЬЕР'),
  1305,
  1,
  357,
  2,
  '{"heats":[{"heat_number":64,"bib_number":64,"judges":[{"judge_number":1,"scores":[18,18,18,18,19],"sum":91},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":91,"disqualified":false,"disqualification_reason":null},{"heat_number":74,"bib_number":74,"judges":[{"judge_number":1,"scores":[17,17,17,18,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":87,"disqualified":false,"disqualification_reason":null}],"grand_total":357,"normalized_score":357,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Джек Рассел Терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">РОЯЛ АЙСИНГ ФАРТИ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>64</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>74</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Джек Рассел Терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МИДНАЙТ БИС ЛАГУНА' AND breed = 'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)'),
  1305,
  1,
  352,
  2,
  '{"heats":[{"heat_number":65,"bib_number":65,"judges":[{"judge_number":1,"scores":[16,18,18,18,17],"sum":87},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":87,"disqualified":false,"disqualification_reason":null},{"heat_number":83,"bib_number":83,"judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":352,"normalized_score":352,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Такса миниатюрная (г-ш, д-ш, ж-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МИДНАЙТ БИС ЛАГУНА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>65</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>83</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>352</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Джек Рассел Терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФОРМУЛА УСПЕХА ПИОН /FORMULA USPEHA PION' AND breed = 'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)'),
  1305,
  2,
  347,
  2,
  '{"heats":[{"heat_number":65,"bib_number":65,"judges":[{"judge_number":1,"scores":[16,17,17,17,17],"sum":84},{"judge_number":2,"scores":[17,17,18,16,18],"sum":86}],"total":84,"disqualified":false,"disqualification_reason":null},{"heat_number":84,"bib_number":84,"judges":[{"judge_number":1,"scores":[17,17,18,17,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":87,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"normalized_score":347,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Такса миниатюрная (г-ш, д-ш, ж-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ФОРМУЛА УСПЕХА ПИОН /<br>FORMULA USPEHA PION</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>65</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>84</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Джек Рассел Терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИБИРСКИЙ ЛЕГИОН ЛИПОВЫЙ ЦВЕТ /SIBIRSKIY LEGION LIPOVYJ CZVET' AND breed = 'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)'),
  1305,
  3,
  347,
  2,
  '{"heats":[{"heat_number":66,"bib_number":66,"judges":[{"judge_number":1,"scores":[16,17,18,17,18],"sum":86},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":83,"bib_number":83,"judges":[{"judge_number":1,"scores":[17,17,17,16,18],"sum":85},{"judge_number":2,"scores":[17,16,18,18,18],"sum":87}],"total":85,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"normalized_score":347,"format":"bzmp"}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Такса миниатюрная (г-ш, д-ш, ж-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СИБИРСКИЙ ЛЕГИОН ЛИПОВЫЙ ЦВЕТ /<br>SIBIRSKIY LEGION LIPOVYJ CZVET</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>66</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>83</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Джек Рассел Терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ГОЛД ВИКТОРИ НОРД' AND breed = 'ЦВЕРГПИНЧЕР'),
  1305,
  1,
  359,
  2,
  '{"heats":[{"heat_number":67,"bib_number":67,"judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,19],"sum":91}],"total":87,"disqualified":false,"disqualification_reason":null},{"heat_number":75,"bib_number":75,"judges":[{"judge_number":1,"scores":[17,18,18,18,19],"sum":90},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":90,"disqualified":false,"disqualification_reason":null}],"grand_total":359,"normalized_score":359,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Цвергпинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ГОЛД ВИКТОРИ НОРД</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>67</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>75</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">359</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Цвергпинчер - Стандартный - Кобели',
  '',
  ''
);
DELETE FROM results WHERE event_id = 1306;
UPDATE events SET judges = 'Главный судья - Иванова Г.С., судья - Богаченко В.В.' WHERE id = 1306;

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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КАПУЧИНО' AND breed = 'БЕЗ ПОРОДЫ'),
  1306,
  1,
  359,
  2,
  '{"heats":[{"heat_number":69,"bib_number":69,"judges":[{"judge_number":1,"scores":[18,18,18,19,18],"sum":91},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":91,"disqualified":false,"disqualification_reason":null},{"heat_number":78,"bib_number":78,"judges":[{"judge_number":1,"scores":[17,17,18,18,19],"sum":89},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":89,"disqualified":false,"disqualification_reason":null}],"grand_total":359,"normalized_score":359,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КАПУЧИНО</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>69</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>78</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">359</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКСЕЛЬ' AND breed = 'БЕЗ ПОРОДЫ'),
  1306,
  2,
  353,
  2,
  '{"heats":[{"heat_number":68,"bib_number":68,"judges":[{"judge_number":1,"scores":[17,18,16,18,18],"sum":87},{"judge_number":2,"scores":[17,17,18,18,18],"sum":88}],"total":87,"disqualified":false,"disqualification_reason":null},{"heat_number":77,"bib_number":77,"judges":[{"judge_number":1,"scores":[18,19,18,18,18],"sum":91},{"judge_number":2,"scores":[17,17,18,17,18],"sum":87}],"total":91,"disqualified":false,"disqualification_reason":null}],"grand_total":353,"normalized_score":353,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКСЕЛЬ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>68</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>77</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'YO TE AMO CROWLEY PIT MUST SURVIVE' AND breed = 'БЕЗ ПОРОДЫ'),
  1306,
  3,
  351,
  2,
  '{"heats":[{"heat_number":68,"bib_number":68,"judges":[{"judge_number":1,"scores":[17,17,17,17,18],"sum":86},{"judge_number":2,"scores":[18,17,18,17,18],"sum":88}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":77,"bib_number":77,"judges":[{"judge_number":1,"scores":[17,18,18,18,18],"sum":89},{"judge_number":2,"scores":[17,17,18,18,18],"sum":88}],"total":89,"disqualified":false,"disqualification_reason":null}],"grand_total":351,"normalized_score":351,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">YO TE AMO CROWLEY "PIT MUST SURVIVE"</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>68</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>77</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>351</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КАМА' AND breed = 'БЕЗ ПОРОДЫ'),
  1306,
  1,
  357,
  2,
  '{"heats":[{"heat_number":69,"bib_number":69,"judges":[{"judge_number":1,"scores":[18,18,18,18,18],"sum":90},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":90,"disqualified":false,"disqualification_reason":null},{"heat_number":78,"bib_number":78,"judges":[{"judge_number":1,"scores":[18,18,17,18,17],"sum":88},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":357,"normalized_score":357,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КАМА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>69</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>78</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИЛЬВИ' AND breed = 'БЕЗ ПОРОДЫ'),
  1306,
  2,
  353,
  2,
  '{"heats":[{"heat_number":67,"bib_number":67,"judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":76,"bib_number":76,"judges":[{"judge_number":1,"scores":[18,17,17,18,18],"sum":88},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":353,"normalized_score":353,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СИЛЬВИ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>67</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>76</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>353</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧАРА' AND breed = 'БЕЗ ПОРОДЫ'),
  1306,
  3,
  347,
  2,
  '{"heats":[{"heat_number":70,"bib_number":70,"judges":[{"judge_number":1,"scores":[16,17,17,17,16],"sum":83},{"judge_number":2,"scores":[18,17,17,18,17],"sum":87}],"total":83,"disqualified":false,"disqualification_reason":null},{"heat_number":79,"bib_number":79,"judges":[{"judge_number":1,"scores":[17,17,18,18,18],"sum":88},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"normalized_score":347,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧАРА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>70</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>79</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧЕЙЗИ /CHEJZI' AND breed = 'БИГЛЬ'),
  1306,
  1,
  360,
  2,
  '{"heats":[{"heat_number":72,"bib_number":72,"judges":[{"judge_number":1,"scores":[18,18,18,18,19],"sum":91},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":91,"disqualified":false,"disqualification_reason":null},{"heat_number":85,"bib_number":85,"judges":[{"judge_number":1,"scores":[18,18,17,18,18],"sum":89},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":89,"disqualified":false,"disqualification_reason":null}],"grand_total":360,"normalized_score":360,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧЕЙЗИ /<br>CHEJZI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>72</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>85</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">360</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКВАТА' AND breed = 'БИГЛЬ'),
  1306,
  2,
  343,
  2,
  '{"heats":[{"heat_number":71,"bib_number":71,"judges":[{"judge_number":1,"scores":[16,17,17,18,17],"sum":85},{"judge_number":2,"scores":[18,17,17,18,18],"sum":88}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":85,"bib_number":85,"judges":[{"judge_number":1,"scores":[17,16,17,16,18],"sum":84},{"judge_number":2,"scores":[16,17,18,17,18],"sum":86}],"total":84,"disqualified":false,"disqualification_reason":null}],"grand_total":343,"normalized_score":343,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКВАТА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>71</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>85</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>343</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЖАСТЕР' AND breed = 'БИГЛЬ'),
  1306,
  NULL,
  NULL,
  1,
  '{"heats":[{"heat_number":71,"bib_number":71,"judges":[{"judge_number":1,"scores":[15,15,16,15,17],"sum":78}],"total":78,"disqualified":false,"disqualification_reason":null},{"heat_number":86,"bib_number":86,"judges":[{"judge_number":1,"scores":[],"sum":null}],"total":null,"disqualified":false,"disqualification_reason":null}],"grand_total":null,"normalized_score":null,"format":"bzmp"}',
  '',
  '',
  'disqualified',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЖАСТЕР</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>71</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>86</i></font></td> <td colspan="6" rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Сход с трассы, возврат к владельцу)</font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  'Сход с трассы, возврат к владельцу',
  ''
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВИЛЬЯМ НИКОЛЛО ПАГАНИНИ' AND breed = 'БИГЛЬ'),
  1306,
  NULL,
  NULL,
  1,
  '{"heats":[{"heat_number":73,"bib_number":73,"judges":[{"judge_number":1,"scores":[null,null,null,null,null],"sum":null}],"total":null,"disqualified":true,"disqualification_reason":"Отстранение (Сход с трассы, возврат к владельцу)"}],"grand_total":null,"normalized_score":null,"format":"bzmp"}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Ветераны</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ВИЛЬЯМ НИКОЛЛО ПАГАНИНИ</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>73</i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Сход с трассы, возврат к владельцу)</font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Ветераны - Кобели',
  'Сход с трассы, возврат к владельцу',
  ''
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РОЯЛ АЙСИНГ ФАРТИ' AND breed = 'ДЖЕК РАССЕЛ ТЕРЬЕР'),
  1306,
  1,
  357,
  2,
  '{"heats":[{"heat_number":64,"bib_number":64,"judges":[{"judge_number":1,"scores":[18,18,18,18,19],"sum":91},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":91,"disqualified":false,"disqualification_reason":null},{"heat_number":74,"bib_number":74,"judges":[{"judge_number":1,"scores":[17,17,17,18,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":87,"disqualified":false,"disqualification_reason":null}],"grand_total":357,"normalized_score":357,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Джек Рассел Терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">РОЯЛ АЙСИНГ ФАРТИ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>64</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>180</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>74</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>357</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Джек Рассел Терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МИДНАЙТ БИС ЛАГУНА' AND breed = 'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)'),
  1306,
  1,
  352,
  2,
  '{"heats":[{"heat_number":65,"bib_number":65,"judges":[{"judge_number":1,"scores":[16,18,18,18,17],"sum":87},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":87,"disqualified":false,"disqualification_reason":null},{"heat_number":83,"bib_number":83,"judges":[{"judge_number":1,"scores":[17,18,18,17,18],"sum":88},{"judge_number":2,"scores":[18,17,18,18,18],"sum":89}],"total":88,"disqualified":false,"disqualification_reason":null}],"grand_total":352,"normalized_score":352,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Такса миниатюрная (г-ш, д-ш, ж-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МИДНАЙТ БИС ЛАГУНА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>65</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>83</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>352</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Джек Рассел Терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ФОРМУЛА УСПЕХА ПИОН /FORMULA USPEHA PION' AND breed = 'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)'),
  1306,
  2,
  347,
  2,
  '{"heats":[{"heat_number":65,"bib_number":65,"judges":[{"judge_number":1,"scores":[16,17,17,17,17],"sum":84},{"judge_number":2,"scores":[17,17,18,16,18],"sum":86}],"total":84,"disqualified":false,"disqualification_reason":null},{"heat_number":84,"bib_number":84,"judges":[{"judge_number":1,"scores":[17,17,18,17,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":87,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"normalized_score":347,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Такса миниатюрная (г-ш, д-ш, ж-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ФОРМУЛА УСПЕХА ПИОН /<br>FORMULA USPEHA PION</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>65</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>84</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Джек Рассел Терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИБИРСКИЙ ЛЕГИОН ЛИПОВЫЙ ЦВЕТ /SIBIRSKIY LEGION LIPOVYJ CZVET' AND breed = 'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)'),
  1306,
  3,
  347,
  2,
  '{"heats":[{"heat_number":66,"bib_number":66,"judges":[{"judge_number":1,"scores":[16,17,18,17,18],"sum":86},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":83,"bib_number":83,"judges":[{"judge_number":1,"scores":[17,17,17,16,18],"sum":85},{"judge_number":2,"scores":[17,16,18,18,18],"sum":87}],"total":85,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"normalized_score":347,"format":"bzmp"}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Такса миниатюрная (г-ш, д-ш, ж-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СИБИРСКИЙ ЛЕГИОН ЛИПОВЫЙ ЦВЕТ /<br>SIBIRSKIY LEGION LIPOVYJ CZVET</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>66</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>83</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>347</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Джек Рассел Терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ГОЛД ВИКТОРИ НОРД' AND breed = 'ЦВЕРГПИНЧЕР'),
  1306,
  1,
  359,
  2,
  '{"heats":[{"heat_number":67,"bib_number":67,"judges":[{"judge_number":1,"scores":[17,18,17,17,18],"sum":87},{"judge_number":2,"scores":[18,18,18,18,19],"sum":91}],"total":87,"disqualified":false,"disqualification_reason":null},{"heat_number":75,"bib_number":75,"judges":[{"judge_number":1,"scores":[17,18,18,18,19],"sum":90},{"judge_number":2,"scores":[18,19,18,18,18],"sum":91}],"total":90,"disqualified":false,"disqualification_reason":null}],"grand_total":359,"normalized_score":359,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Цвергпинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ГОЛД ВИКТОРИ НОРД</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>67</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>178</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>75</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">359</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Цвергпинчер - Стандартный - Кобели',
  '',
  ''
);
DELETE FROM results WHERE event_id = 1308;
UPDATE events SET judges = 'Главный судья - Егорова М.А., судья - Карелина Н.В.' WHERE id = 1308;

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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'TCENNIY PRIZE EIRENA' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1308,
  NULL,
  NULL,
  1,
  '{"heats":[{"heat_number":5,"bib_number":5,"judges":[{"judge_number":1,"scores":[null,null,null,null,null],"sum":null}],"total":null,"disqualified":true,"disqualification_reason":"Отстранение (Сход с трассы)"}],"grand_total":null,"normalized_score":null,"format":"bzmp"}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Ветераны</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">TCENNIY PRIZE EIRENA</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Сход с трассы)</font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Ветераны - Суки',
  'Сход с трассы',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /SANSARA SHERVUD SHOTER GRAN PRI' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1308,
  1,
  306,
  2,
  '{"heats":[{"heat_number":1,"bib_number":1,"judges":[{"judge_number":1,"scores":[18,16,15,18,18],"sum":85},{"judge_number":2,"scores":[12,14,14,14,15],"sum":69}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":25,"bib_number":25,"judges":[{"judge_number":1,"scores":[16,17,14,16,16],"sum":79},{"judge_number":2,"scores":[12,16,14,14,17],"sum":73}],"total":79,"disqualified":false,"disqualification_reason":null}],"grand_total":306,"normalized_score":306,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /<br>SANSARA SHERVUD SHOTER GRAN PRI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>154</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>306</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ТИП ТОП ПУР ГОЛД ИЗ ДОМА ЗИДАНА /TIP TOP PURE GOLD IZ DOMA ZIDANA' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1308,
  2,
  302,
  2,
  '{"heats":[{"heat_number":2,"bib_number":2,"judges":[{"judge_number":1,"scores":[18,16,14,18,17],"sum":83},{"judge_number":2,"scores":[12,15,15,10,15],"sum":67}],"total":83,"disqualified":false,"disqualification_reason":null},{"heat_number":25,"bib_number":25,"judges":[{"judge_number":1,"scores":[15,16,16,17,16],"sum":80},{"judge_number":2,"scores":[13,15,14,13,17],"sum":72}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":302,"normalized_score":302,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ТИП ТОП ПУР ГОЛД ИЗ ДОМА ЗИДАНА /<br>TIP TOP PURE GOLD IZ DOMA ZIDANA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>150</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>302</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЗВЕЗДА АМЕРЛАНД ПАМИР ПЕРСИЛЬОН /ZVEZDA AMERLAND PAMIR PERSILLION' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1308,
  3,
  271,
  2,
  '{"heats":[{"heat_number":2,"bib_number":2,"judges":[{"judge_number":1,"scores":[10,14,12,13,15],"sum":64},{"judge_number":2,"scores":[15,15,15,13,16],"sum":74}],"total":64,"disqualified":false,"disqualification_reason":null},{"heat_number":24,"bib_number":24,"judges":[{"judge_number":1,"scores":[14,15,15,14,15],"sum":73},{"judge_number":2,"scores":[8,14,12,10,16],"sum":60}],"total":73,"disqualified":false,"disqualification_reason":null}],"grand_total":271,"normalized_score":271,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЗВЕЗДА АМЕРЛАНД ПАМИР ПЕРСИЛЬОН /<br>ZVEZDA AMERLAND PAMIR PERSILLION</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>64</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>138</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>133</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>271</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'BAKARORO END ITUBORI THE BEST TCENNIY PRIZE' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1308,
  4,
  261,
  2,
  '{"heats":[{"heat_number":1,"bib_number":1,"judges":[{"judge_number":1,"scores":[12,14,13,13,16],"sum":68},{"judge_number":2,"scores":[10,14,12,10,15],"sum":61}],"total":68,"disqualified":false,"disqualification_reason":null},{"heat_number":24,"bib_number":24,"judges":[{"judge_number":1,"scores":[14,16,15,14,15],"sum":74},{"judge_number":2,"scores":[8,14,12,8,16],"sum":58}],"total":74,"disqualified":false,"disqualification_reason":null}],"grand_total":261,"normalized_score":261,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">BAKARORO END ITUBORI THE BEST TCENNIY PRIZE</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>68</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>74</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>132</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>261</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /GLAD TO BE GREAT IZ SOZVEZDIYA STAFF' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1308,
  1,
  326,
  2,
  '{"heats":[{"heat_number":3,"bib_number":3,"judges":[{"judge_number":1,"scores":[18,17,14,18,18],"sum":85},{"judge_number":2,"scores":[14,16,15,16,16],"sum":77}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":26,"bib_number":26,"judges":[{"judge_number":1,"scores":[18,17,17,17,18],"sum":87},{"judge_number":2,"scores":[14,16,15,15,17],"sum":77}],"total":87,"disqualified":false,"disqualification_reason":null}],"grand_total":326,"normalized_score":326,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /<br>GLAD TO BE GREAT IZ SOZVEZDIYA STAFF</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>326</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский стаффордширский терьер - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEE’L CHARM DESTELLO MIA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1308,
  2,
  293,
  2,
  '{"heats":[{"heat_number":4,"bib_number":4,"judges":[{"judge_number":1,"scores":[12,16,14,15,17],"sum":74},{"judge_number":2,"scores":[10,16,16,10,16],"sum":68}],"total":74,"disqualified":false,"disqualification_reason":null},{"heat_number":26,"bib_number":26,"judges":[{"judge_number":1,"scores":[14,17,17,15,17],"sum":80},{"judge_number":2,"scores":[12,15,15,12,17],"sum":71}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":293,"normalized_score":293,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СТИ''Л ШАРМ ДЕСТЕЛЛО МИЯ /<br>STEE’L CHARM DESTELLO MIA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>74</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>142</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>151</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>293</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /TISSA LUNA GOLUBOJ RODNIK KREDO' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1308,
  3,
  272,
  2,
  '{"heats":[{"heat_number":3,"bib_number":3,"judges":[{"judge_number":1,"scores":[13,14,12,16,16],"sum":71},{"judge_number":2,"scores":[8,16,15,8,15],"sum":62}],"total":71,"disqualified":false,"disqualification_reason":null},{"heat_number":27,"bib_number":27,"judges":[{"judge_number":1,"scores":[12,17,17,12,15],"sum":73},{"judge_number":2,"scores":[14,16,14,8,14],"sum":66}],"total":73,"disqualified":false,"disqualification_reason":null}],"grand_total":272,"normalized_score":272,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /<br>TISSA LUNA GOLUBOJ RODNIK KREDO</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>71</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>133</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>139</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>272</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВЕГА' AND breed = 'БЕЗ ПОРОДЫ'),
  1308,
  1,
  340,
  2,
  '{"heats":[{"heat_number":7,"bib_number":7,"judges":[{"judge_number":1,"scores":[19,18,14,18,17],"sum":86},{"judge_number":2,"scores":[15,17,17,17,17],"sum":83}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":29,"bib_number":29,"judges":[{"judge_number":1,"scores":[18,18,16,17,18],"sum":87},{"judge_number":2,"scores":[16,16,17,18,17],"sum":84}],"total":87,"disqualified":false,"disqualification_reason":null}],"grand_total":340,"normalized_score":340,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВЕГА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>87</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">340</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МАРГАРИТА' AND breed = 'БЕЗ ПОРОДЫ'),
  1308,
  2,
  312,
  2,
  '{"heats":[{"heat_number":6,"bib_number":6,"judges":[{"judge_number":1,"scores":[16,16,15,16,18],"sum":81},{"judge_number":2,"scores":[14,16,15,12,17],"sum":74}],"total":81,"disqualified":false,"disqualification_reason":null},{"heat_number":28,"bib_number":28,"judges":[{"judge_number":1,"scores":[15,17,16,16,17],"sum":81},{"judge_number":2,"scores":[14,16,16,13,17],"sum":76}],"total":81,"disqualified":false,"disqualification_reason":null}],"grand_total":312,"normalized_score":312,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МАРГАРИТА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>155</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>157</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>312</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВЕРСАЧЕ БРАЙТ КРИСТАЛ /VERSACE BRIGHT CRYSTAL' AND breed = 'БИГЛЬ'),
  1308,
  1,
  317,
  2,
  '{"heats":[{"heat_number":8,"bib_number":8,"judges":[{"judge_number":1,"scores":[15,17,14,16,17],"sum":79},{"judge_number":2,"scores":[13,17,17,14,17],"sum":78}],"total":79,"disqualified":false,"disqualification_reason":null},{"heat_number":30,"bib_number":30,"judges":[{"judge_number":1,"scores":[12,16,17,16,17],"sum":78},{"judge_number":2,"scores":[15,18,16,15,18],"sum":82}],"total":78,"disqualified":false,"disqualification_reason":null}],"grand_total":317,"normalized_score":317,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВЕРСАЧЕ БРАЙТ КРИСТАЛ /<br>VERSACE BRIGHT CRYSTAL</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>157</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>317</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бигль - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /AURORAS MOON LIMITLESS EBONY POTENTION' AND breed = 'ДАЛМАТИН'),
  1308,
  1,
  354,
  2,
  '{"heats":[{"heat_number":9,"bib_number":9,"judges":[{"judge_number":1,"scores":[18,18,15,17,18],"sum":86},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":31,"bib_number":31,"judges":[{"judge_number":1,"scores":[19,18,18,19,19],"sum":93},{"judge_number":2,"scores":[16,17,17,18,18],"sum":86}],"total":93,"disqualified":false,"disqualification_reason":null}],"grand_total":354,"normalized_score":354,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Далматин</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /<br>AURORAS MOON LIMITLESS EBONY POTENTION</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">354</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Далматин - Юниоры - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN' AND breed = 'ЦВЕРГПИНЧЕР'),
  1308,
  1,
  334,
  2,
  '{"heats":[{"heat_number":10,"bib_number":10,"judges":[{"judge_number":1,"scores":[16,18,15,17,19],"sum":85},{"judge_number":2,"scores":[15,18,18,15,18],"sum":84}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":32,"bib_number":32,"judges":[{"judge_number":1,"scores":[15,17,18,15,17],"sum":82},{"judge_number":2,"scores":[14,18,18,16,17],"sum":83}],"total":82,"disqualified":false,"disqualification_reason":null}],"grand_total":334,"normalized_score":334,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Цвергпинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /<br>TSESVIL GARDEN IRINUS GOLD BREIN</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">334</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Цвергпинчер - Стандартный - Кобели',
  '',
  ''
);
DELETE FROM results WHERE event_id = 1311;
UPDATE events SET judges = 'Главный судья - Серова Т.Г., судья - Козлова И.В.' WHERE id = 1311;

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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ПАЙКИ /PAYKI' AND breed = 'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР'),
  1311,
  1,
  342,
  2,
  '{"heats":[{"heat_number":96,"bib_number":96,"judges":[{"judge_number":1,"scores":[17,17,17,17,18],"sum":86},{"judge_number":2,"scores":[17,18,17,18,17],"sum":87}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":107,"bib_number":107,"judges":[{"judge_number":1,"scores":[17,17,17,17,18],"sum":86},{"judge_number":2,"scores":[16,18,17,16,16],"sum":83}],"total":86,"disqualified":false,"disqualification_reason":null}],"grand_total":342,"normalized_score":342,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский голый терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ПАЙКИ /<br>PAYKI</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>96</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>107</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>342</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЕНВЕРС ЭЛИТ ШЕЙП МАЙ ИМПРЕЗА СОУЛ /DENVERS ELITE SHAPE MY IMPREZA SOUL' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1311,
  1,
  336,
  2,
  '{"heats":[{"heat_number":114,"bib_number":114,"judges":[{"judge_number":1,"scores":[17,18,17,17,17],"sum":86},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":126,"bib_number":126,"judges":[{"judge_number":1,"scores":[16,16,15,16,16],"sum":79},{"judge_number":2,"scores":[16,17,16,17,17],"sum":83}],"total":79,"disqualified":false,"disqualification_reason":null}],"grand_total":336,"normalized_score":336,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ДЕНВЕРС ЭЛИТ ШЕЙП МАЙ ИМПРЕЗА СОУЛ /<br>DENVERS ELITE SHAPE MY IMPREZA SOUL</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>114</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>126</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>336</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /SANSARA SHERVUD SHOTER GRAN PRI' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1311,
  2,
  329,
  2,
  '{"heats":[{"heat_number":115,"bib_number":115,"judges":[{"judge_number":1,"scores":[16,16,16,16,17],"sum":81},{"judge_number":2,"scores":[16,18,17,16,16],"sum":83}],"total":81,"disqualified":false,"disqualification_reason":null},{"heat_number":125,"bib_number":125,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[15,17,16,16,16],"sum":80}],"total":85,"disqualified":false,"disqualification_reason":null}],"grand_total":329,"normalized_score":329,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">САНСАРА ШЕРВУД ШОТЕР ГРАН ПРИ /<br>SANSARA SHERVUD SHOTER GRAN PRI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>115</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>125</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>329</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /GLAD TO BE GREAT IZ SOZVEZDIYA STAFF' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1311,
  3,
  328,
  2,
  '{"heats":[{"heat_number":115,"bib_number":115,"judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[16,18,16,16,17],"sum":83}],"total":83,"disqualified":false,"disqualification_reason":null},{"heat_number":126,"bib_number":126,"judges":[{"judge_number":1,"scores":[15,16,16,16,16],"sum":79},{"judge_number":2,"scores":[16,17,17,17,16],"sum":83}],"total":79,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"normalized_score":328,"format":"bzmp"}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ГЛЕД ТУ БИ ГРЕЙТ ИЗ СОЗВЕЗДИЯ СТАФФ /<br>GLAD TO BE GREAT IZ SOZVEZDIYA STAFF</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>115</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>126</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /TISSA LUNA GOLUBOJ RODNIK KREDO' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1311,
  4,
  300,
  2,
  '{"heats":[{"heat_number":114,"bib_number":114,"judges":[{"judge_number":1,"scores":[16,17,16,16,17],"sum":82},{"judge_number":2,"scores":[12,16,14,13,13],"sum":68}],"total":82,"disqualified":false,"disqualification_reason":null},{"heat_number":125,"bib_number":125,"judges":[{"judge_number":1,"scores":[14,16,16,16,17],"sum":79},{"judge_number":2,"scores":[12,16,15,14,14],"sum":71}],"total":79,"disqualified":false,"disqualification_reason":null}],"grand_total":300,"normalized_score":300,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ТИССА ЛУНА ГОЛУБОЙ РОДНИК КРЕДО /<br>TISSA LUNA GOLUBOJ RODNIK KREDO</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>114</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>150</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>125</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>150</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>300</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский голый терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'НОРД' AND breed = 'БЕЗ ПОРОДЫ'),
  1311,
  1,
  332,
  2,
  '{"heats":[{"heat_number":121,"bib_number":121,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,17,16,17,16],"sum":82}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":132,"bib_number":132,"judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[16,17,16,17,16],"sum":82}],"total":83,"disqualified":false,"disqualification_reason":null}],"grand_total":332,"normalized_score":332,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">НОРД</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>121</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>132</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>332</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'YUG PIT KNLS ELBRUS' AND breed = 'БЕЗ ПОРОДЫ'),
  1311,
  2,
  328,
  2,
  '{"heats":[{"heat_number":120,"bib_number":120,"judges":[{"judge_number":1,"scores":[16,17,17,17,17],"sum":84},{"judge_number":2,"scores":[16,18,17,16,16],"sum":83}],"total":84,"disqualified":false,"disqualification_reason":null},{"heat_number":131,"bib_number":131,"judges":[{"judge_number":1,"scores":[16,17,17,16,16],"sum":82},{"judge_number":2,"scores":[15,17,16,16,15],"sum":79}],"total":82,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"normalized_score":328,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">YUG PIT KNL''S ELBRUS</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>120</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>131</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЖОН' AND breed = 'БЕЗ ПОРОДЫ'),
  1311,
  3,
  324,
  2,
  '{"heats":[{"heat_number":121,"bib_number":121,"judges":[{"judge_number":1,"scores":[16,16,17,16,16],"sum":81},{"judge_number":2,"scores":[15,17,16,16,16],"sum":80}],"total":81,"disqualified":false,"disqualification_reason":null},{"heat_number":132,"bib_number":132,"judges":[{"judge_number":1,"scores":[15,17,16,16,16],"sum":80},{"judge_number":2,"scores":[16,17,16,17,17],"sum":83}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":324,"normalized_score":324,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ДЖОН</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>121</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>132</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>324</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВЕГА' AND breed = 'БЕЗ ПОРОДЫ'),
  1311,
  1,
  349,
  2,
  '{"heats":[{"heat_number":123,"bib_number":123,"judges":[{"judge_number":1,"scores":[17,17,18,18,18],"sum":88},{"judge_number":2,"scores":[17,18,16,17,17],"sum":85}],"total":88,"disqualified":false,"disqualification_reason":null},{"heat_number":134,"bib_number":134,"judges":[{"judge_number":1,"scores":[18,18,18,18,18],"sum":90},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":90,"disqualified":false,"disqualification_reason":null}],"grand_total":349,"normalized_score":349,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВЕГА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>123</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>173</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>134</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>90</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">349</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МИРОСЛАВА' AND breed = 'БЕЗ ПОРОДЫ'),
  1311,
  2,
  340,
  2,
  '{"heats":[{"heat_number":119,"bib_number":119,"judges":[{"judge_number":1,"scores":[16,17,17,17,17],"sum":84},{"judge_number":2,"scores":[17,18,18,18,17],"sum":88}],"total":84,"disqualified":false,"disqualification_reason":null},{"heat_number":130,"bib_number":130,"judges":[{"judge_number":1,"scores":[16,17,16,16,17],"sum":82},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":82,"disqualified":false,"disqualification_reason":null}],"grand_total":340,"normalized_score":340,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МИРОСЛАВА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>119</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>130</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>340</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЛАТТЕ' AND breed = 'БЕЗ ПОРОДЫ'),
  1311,
  3,
  338,
  2,
  '{"heats":[{"heat_number":119,"bib_number":119,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[15,17,17,16,16],"sum":81}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":130,"bib_number":130,"judges":[{"judge_number":1,"scores":[17,17,17,16,17],"sum":84},{"judge_number":2,"scores":[18,18,17,18,17],"sum":88}],"total":84,"disqualified":false,"disqualification_reason":null}],"grand_total":338,"normalized_score":338,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЛАТТЕ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>119</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>130</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>172</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>338</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧАРА' AND breed = 'БЕЗ ПОРОДЫ'),
  1311,
  4,
  329,
  2,
  '{"heats":[{"heat_number":122,"bib_number":122,"judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[17,17,16,17,17],"sum":84}],"total":80,"disqualified":false,"disqualification_reason":null},{"heat_number":133,"bib_number":133,"judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[17,17,17,17,17],"sum":85}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":329,"normalized_score":329,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧАРА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>122</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>133</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>329</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АФИНА' AND breed = 'БЕЗ ПОРОДЫ'),
  1311,
  5,
  307,
  2,
  '{"heats":[{"heat_number":120,"bib_number":120,"judges":[{"judge_number":1,"scores":[15,16,15,15,16],"sum":77},{"judge_number":2,"scores":[13,16,15,14,14],"sum":72}],"total":77,"disqualified":false,"disqualification_reason":null},{"heat_number":131,"bib_number":131,"judges":[{"judge_number":1,"scores":[15,17,16,16,16],"sum":80},{"judge_number":2,"scores":[15,17,16,15,15],"sum":78}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":307,"normalized_score":307,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АФИНА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>120</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>149</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>131</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>158</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>307</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Без породы - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЖАНИКО ЛАЗЕР (М) /DZHANIKO LASER (M)' AND breed = 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА'),
  1311,
  1,
  361,
  2,
  '{"heats":[{"heat_number":77,"bib_number":77,"judges":[{"judge_number":1,"scores":[18,18,18,18,19],"sum":91},{"judge_number":2,"scores":[17,18,18,18,17],"sum":88}],"total":91,"disqualified":false,"disqualification_reason":null},{"heat_number":90,"bib_number":90,"judges":[{"judge_number":1,"scores":[19,18,19,19,18],"sum":93},{"judge_number":2,"scores":[18,18,18,17,18],"sum":89}],"total":93,"disqualified":false,"disqualification_reason":null}],"grand_total":361,"normalized_score":361,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бельгийская овчарка малинуа</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ДЖАНИКО ЛАЗЕР (М) /<br>DZHANIKO LASER (M)</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>77</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>179</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>90</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>93</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>182</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">361</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВОРЛД ОФ РОЛЕКС ЭЛАЙДЖА ВУД /WORLD OF ROLEX ELAYDZHA VUD' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1311,
  1,
  332,
  2,
  '{"heats":[{"heat_number":99,"bib_number":99,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,18,17,17,16],"sum":84}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":109,"bib_number":109,"judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[16,17,16,17,17],"sum":83}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":332,"normalized_score":332,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВОРЛД ОФ РОЛЕКС ЭЛАЙДЖА ВУД /<br>WORLD OF ROLEX ELAYDZHA VUD</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>99</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>109</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>332</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КУРАЖ КЛАБ ГОДДЕСС /COURAGE CLUB GODDESS' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1311,
  2,
  329,
  2,
  '{"heats":[{"heat_number":98,"bib_number":98,"judges":[{"judge_number":1,"scores":[16,17,17,17,16],"sum":83},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":83,"disqualified":false,"disqualification_reason":null},{"heat_number":109,"bib_number":109,"judges":[{"judge_number":1,"scores":[16,16,15,16,16],"sum":79},{"judge_number":2,"scores":[15,17,16,16,17],"sum":81}],"total":79,"disqualified":false,"disqualification_reason":null}],"grand_total":329,"normalized_score":329,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КУРАЖ КЛАБ ГОДДЕСС /<br>COURAGE CLUB GODDESS</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>98</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>109</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>329</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МАРЛЕН БРАО ЧАРОДЕЙ /MARLEN BRAO CHARODEI' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1311,
  3,
  312,
  2,
  '{"heats":[{"heat_number":98,"bib_number":98,"judges":[{"judge_number":1,"scores":[13,16,15,14,15],"sum":73},{"judge_number":2,"scores":[16,17,16,14,13],"sum":76}],"total":73,"disqualified":false,"disqualification_reason":null},{"heat_number":110,"bib_number":110,"judges":[{"judge_number":1,"scores":[15,16,16,16,16],"sum":79},{"judge_number":2,"scores":[17,17,17,17,16],"sum":84}],"total":79,"disqualified":false,"disqualification_reason":null}],"grand_total":312,"normalized_score":312,"format":"bzmp"}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МАРЛЕН-БРАО ЧАРОДЕЙ /<br>MARLEN-BRAO CHARODEI</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>98</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>149</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>110</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>312</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БАТИДА ДЕ КОКО /BATIDA DE COCO' AND breed = 'БУЛЬТЕРЬЕР МИНИАТЮРНЫЙ'),
  1311,
  4,
  287,
  2,
  '{"heats":[{"heat_number":99,"bib_number":99,"judges":[{"judge_number":1,"scores":[14,16,14,12,13],"sum":69},{"judge_number":2,"scores":[9,12,12,10,9],"sum":52}],"total":69,"disqualified":false,"disqualification_reason":null},{"heat_number":110,"bib_number":110,"judges":[{"judge_number":1,"scores":[16,15,16,16,16],"sum":79},{"judge_number":2,"scores":[17,18,17,18,17],"sum":87}],"total":79,"disqualified":false,"disqualification_reason":null}],"grand_total":287,"normalized_score":287,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бультерьер миниатюрный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БАТИДА ДЕ КОКО /<br>BATIDA DE COCO</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>99</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>69</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>121</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>110</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>287</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АФИНА МУДРАЯ /AFINA MUDRAYA' AND breed = 'ВЕЙМАРАНЕР К Ш'),
  1311,
  1,
  235,
  2,
  '{"heats":[{"heat_number":17,"bib_number":17,"judges":[{"judge_number":1,"scores":[16,16,15,16,15],"sum":78},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":78,"disqualified":false,"disqualification_reason":null},{"heat_number":34,"bib_number":34,"judges":[{"judge_number":1,"scores":[9,15,8,7,7],"sum":46},{"judge_number":2,"scores":[5,5,5,5,5],"sum":25}],"total":46,"disqualified":false,"disqualification_reason":null}],"grand_total":235,"normalized_score":235,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Веймаранер к-ш</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АФИНА МУДРАЯ /<br>AFINA MUDRAYA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>46</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>71</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>235</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Веймаранер к-ш - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЗОВ ПОЛЕЙ ТЕРРАКОТ /ZOV POLEY TERRAKOT' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА К Ш'),
  1311,
  1,
  327,
  2,
  '{"heats":[{"heat_number":17,"bib_number":17,"judges":[{"judge_number":1,"scores":[16,17,17,17,17],"sum":84},{"judge_number":2,"scores":[16,18,16,16,17],"sum":83}],"total":84,"disqualified":false,"disqualification_reason":null},{"heat_number":34,"bib_number":34,"judges":[{"judge_number":1,"scores":[15,17,17,16,17],"sum":82},{"judge_number":2,"scores":[15,17,16,14,16],"sum":78}],"total":82,"disqualified":false,"disqualification_reason":null}],"grand_total":327,"normalized_score":327,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла к-ш</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЗОВ ПОЛЕЙ ТЕРРАКОТ /<br>ZOV POLEY TERRAKOT</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>327</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла к-ш - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /AURORAS MOON LIMITLESS EBONY POTENTION' AND breed = 'ДАЛМАТИН'),
  1311,
  1,
  335,
  2,
  '{"heats":[{"heat_number":113,"bib_number":113,"judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[17,18,18,18,17],"sum":88}],"total":83,"disqualified":false,"disqualification_reason":null},{"heat_number":124,"bib_number":124,"judges":[{"judge_number":1,"scores":[16,17,16,17,17],"sum":83},{"judge_number":2,"scores":[16,17,16,16,16],"sum":81}],"total":83,"disqualified":false,"disqualification_reason":null}],"grand_total":335,"normalized_score":335,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Далматин</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Юниоры</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АВРОРАС МУН ЛИМИТЛЕСС ЭБОНИ ПОТЕНШН /<br>AURORAS MOON LIMITLESS EBONY POTENTION</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>113</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>124</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>335</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Далматин - Юниоры - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДУШЕЧКА КРАСА ИЗ ДОМА АЛАНТЕС /DUSHECHKA KRASA IZ DOMA ALANTES' AND breed = 'ИРЛАНДСКИЙ ТЕРЬЕР'),
  1311,
  1,
  333,
  2,
  '{"heats":[{"heat_number":100,"bib_number":100,"judges":[{"judge_number":1,"scores":[16,17,16,17,17],"sum":83},{"judge_number":2,"scores":[15,17,17,16,16],"sum":81}],"total":83,"disqualified":false,"disqualification_reason":null},{"heat_number":111,"bib_number":111,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,17,17,17,17],"sum":84}],"total":85,"disqualified":false,"disqualification_reason":null}],"grand_total":333,"normalized_score":333,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Ирландский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ДУШЕЧКА-КРАСА ИЗ ДОМА АЛАНТЕС /<br>DUSHECHKA-KRASA IZ DOMA ALANTES</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>100</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>111</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>169</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>333</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Ирландский терьер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'НЕЖНОЕ ПЛАМЯ ЭДАНА /NEZHNOYE PLAMYA EDANA' AND breed = 'ИРЛАНДСКИЙ ТЕРЬЕР'),
  1311,
  NULL,
  NULL,
  1,
  '{"heats":[{"heat_number":100,"bib_number":100,"judges":[{"judge_number":1,"scores":[null,null,null,null,null],"sum":null}],"total":null,"disqualified":true,"disqualification_reason":"Отстранение (Уход с трассы)"}],"grand_total":null,"normalized_score":null,"format":"bzmp"}',
  '',
  '',
  'disqualified',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Ирландский терьер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">НЕЖНОЕ ПЛАМЯ ЭДАНА /<br>NEZHNOYE PLAMYA EDANA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>100</i></font></td> <td colspan="6" rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Уход с трассы)</font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Ирландский терьер - Стандартный - Суки',
  'Уход с трассы',
  ''
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'PANDORA VON HAUS BOCCIA' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1311,
  1,
  334,
  2,
  '{"heats":[{"heat_number":118,"bib_number":118,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[17,17,16,18,17],"sum":85}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":127,"bib_number":127,"judges":[{"judge_number":1,"scores":[17,16,16,16,16],"sum":81},{"judge_number":2,"scores":[17,17,16,17,16],"sum":83}],"total":81,"disqualified":false,"disqualification_reason":null}],"grand_total":334,"normalized_score":334,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>26</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">PANDORA VON HAUS BOCCIA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>118</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>127</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>334</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ВИРНА /VIRNA' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1311,
  2,
  331,
  2,
  '{"heats":[{"heat_number":117,"bib_number":117,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,16,15,17,16],"sum":80}],"total":85,"disqualified":false,"disqualification_reason":null},{"heat_number":128,"bib_number":128,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[16,17,15,17,16],"sum":81}],"total":85,"disqualified":false,"disqualification_reason":null}],"grand_total":331,"normalized_score":331,"format":"bzmp"}',
  'CACMB, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>28</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ВИРНА /<br>VIRNA</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>117</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>165</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>128</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>331</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB, RegCACMB</font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЮСТИЦИЯ ИЗ БЕЛОГО ЯРА (Д Ш) /YUSTITSIYA IZ BELOGO JARA (L H)' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1311,
  3,
  328,
  2,
  '{"heats":[{"heat_number":116,"bib_number":116,"judges":[{"judge_number":1,"scores":[17,16,16,16,16],"sum":81},{"judge_number":2,"scores":[17,17,16,18,17],"sum":85}],"total":81,"disqualified":false,"disqualification_reason":null},{"heat_number":127,"bib_number":127,"judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[16,17,16,17,16],"sum":82}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"normalized_score":328,"format":"bzmp"}',
  'RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЮСТИЦИЯ ИЗ БЕЛОГО ЯРА (Д-Ш) /<br>YUSTITSIYA IZ BELOGO JARA (L-H)</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>116</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>127</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">RegCACMB</font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЯРА /YARA' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1311,
  4,
  327,
  2,
  '{"heats":[{"heat_number":116,"bib_number":116,"judges":[{"judge_number":1,"scores":[16,16,17,16,16],"sum":81},{"judge_number":2,"scores":[16,17,16,17,17],"sum":83}],"total":81,"disqualified":false,"disqualification_reason":null},{"heat_number":128,"bib_number":128,"judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[15,17,16,16,16],"sum":80}],"total":83,"disqualified":false,"disqualification_reason":null}],"grand_total":327,"normalized_score":327,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>29</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЯРА /<br>YARA</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>116</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>128</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>327</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'PENELOPE VON HAUS BOCCIA (L H)' AND breed = 'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)'),
  1311,
  5,
  315,
  2,
  '{"heats":[{"heat_number":117,"bib_number":117,"judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[15,16,14,16,15],"sum":76}],"total":80,"disqualified":false,"disqualification_reason":null},{"heat_number":129,"bib_number":129,"judges":[{"judge_number":1,"scores":[17,17,17,17,17],"sum":85},{"judge_number":2,"scores":[14,16,15,15,14],"sum":74}],"total":85,"disqualified":false,"disqualification_reason":null}],"grand_total":315,"normalized_score":315,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>27</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкая овчарка (д-ш, к-ш)</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">PENELOPE VON HAUS BOCCIA (L-H)</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>117</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>156</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>129</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>159</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>315</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкая овчарка (д-ш, к-ш) - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ОБЕРЕГ С ВЕРШИНЫ ИНЬ ЯНЬ /OBEREG S VERSHINY IN YAN' AND breed = 'НЕМЕЦКИЙ ДОГ'),
  1311,
  1,
  328,
  2,
  '{"heats":[{"heat_number":49,"bib_number":49,"judges":[{"judge_number":1,"scores":[16,16,16,16,16],"sum":80},{"judge_number":2,"scores":[15,17,16,16,16],"sum":80}],"total":80,"disqualified":false,"disqualification_reason":null},{"heat_number":64,"bib_number":64,"judges":[{"judge_number":1,"scores":[16,16,17,17,17],"sum":83},{"judge_number":2,"scores":[17,17,16,17,18],"sum":85}],"total":83,"disqualified":false,"disqualification_reason":null}],"grand_total":328,"normalized_score":328,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>31</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкий дог</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ОБЕРЕГ С ВЕРШИНЫ ИНЬ-ЯНЬ /<br>OBEREG S VERSHINY IN-YAN</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>49</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>64</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>328</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкий дог - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS' AND breed = 'САМОЕД'),
  1311,
  1,
  358,
  2,
  '{"heats":[{"heat_number":76,"bib_number":76,"judges":[{"judge_number":1,"scores":[18,17,18,18,18],"sum":89},{"judge_number":2,"scores":[17,18,17,18,18],"sum":88}],"total":89,"disqualified":false,"disqualification_reason":null},{"heat_number":89,"bib_number":89,"judges":[{"judge_number":1,"scores":[18,18,19,18,18],"sum":91},{"judge_number":2,"scores":[18,18,17,19,18],"sum":90}],"total":91,"disqualified":false,"disqualification_reason":null}],"grand_total":358,"normalized_score":358,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>32</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Самоед</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СНЕЖНОЕ ОЧАРОВАНИЕ ЖАСМИН ПРИНЦЕСС /<br>SNEZHNOE OCHAROVANIE ZHASMIN PRINCZESS</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>76</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>177</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>89</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">19</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">358</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Самоед - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /TSESVIL GARDEN IRINUS GOLD BREIN' AND breed = 'ЦВЕРГПИНЧЕР'),
  1311,
  1,
  326,
  2,
  '{"heats":[{"heat_number":95,"bib_number":95,"judges":[{"judge_number":1,"scores":[15,17,16,16,16],"sum":80},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":80,"disqualified":false,"disqualification_reason":null},{"heat_number":106,"bib_number":106,"judges":[{"judge_number":1,"scores":[15,16,16,15,16],"sum":78},{"judge_number":2,"scores":[16,18,16,16,16],"sum":82}],"total":78,"disqualified":false,"disqualification_reason":null}],"grand_total":326,"normalized_score":326,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>33</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Цвергпинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЦЕСВИЛЬ ГАРДЕН ИРИНУС ГОЛД БРЕЙН /<br>TSESVIL GARDEN IRINUS GOLD BREIN</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>95</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>166</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>106</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>78</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>326</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Цвергпинчер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЭКСЕЛЛЕНТ СТАЙЛ МАРКУС /EXCELLENT STYLE MARKUS' AND breed = 'ШНАУЦЕР'),
  1311,
  1,
  345,
  2,
  '{"heats":[{"heat_number":97,"bib_number":97,"judges":[{"judge_number":1,"scores":[17,18,17,18,18],"sum":88},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":88,"disqualified":false,"disqualification_reason":null},{"heat_number":108,"bib_number":108,"judges":[{"judge_number":1,"scores":[17,18,18,18,18],"sum":89},{"judge_number":2,"scores":[16,17,17,16,16],"sum":82}],"total":89,"disqualified":false,"disqualification_reason":null}],"grand_total":345,"normalized_score":345,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>34</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Шнауцер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЭКСЕЛЛЕНТ СТАЙЛ МАРКУС /<br>EXCELLENT STYLE MARKUS</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>97</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>174</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>108</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>89</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>345</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Шнауцер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ДЕНВЕРС ЭЛИТ ЯС, АЙ КЕН ФЛАЙ /DENVERS ELITE YES, I CAN FLY' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1311,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">ДЕНВЕРС ЭЛИТ ЯС, АЙ КЕН ФЛАЙ /<br>DENVERS ELITE YES, I CAN FLY</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Шнауцер - Стандартный - Кобели',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA',
  'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
  'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEE’L CHARM DESTELLO MIA',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СТИЛ ШАРМ ДЕСТЕЛЛО МИЯ /STEEL CHARM DESTELLO MIA' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1311,
  NULL,
  NULL,
  2,
  '{"heats":[],"grand_total":null,"normalized_score":null}',
  '',
  '',
  'dns',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">СТИ''Л ШАРМ ДЕСТЕЛЛО МИЯ /<br>STEE’L CHARM DESTELLO MIA</font></td> <td colspan="19"><font style="font-size:10pt" face="Arial" color="#000000">Неявка</font></td> ',
  'Шнауцер - Стандартный - Кобели',
  '',
  ''
);
DELETE FROM results WHERE event_id = 1313;
UPDATE events SET judges = 'Главный судья - Минина С.В., судья - Меркушенкова О.В.' WHERE id = 1313;

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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ' AND breed = 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'),
  1313,
  NULL,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[null,null,null,null,null],"sum":null}],"total":null,"disqualified":true,"disqualification_reason":"Отстранение (Потеря приманки)"}],"grand_total":null,"normalized_score":null,"format":"bzmp"}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Американский стаффордширский терьер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">СЕКЬЮРИТИ СТАФФ БРО ЧЕЙЗ</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Потеря приманки)</font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  'Потеря приманки',
  ''
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РУБИ' AND breed = 'БЕЗ ПОРОДЫ'),
  1313,
  1,
  339,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[16,17,16,18,17],"sum":84},{"judge_number":2,"scores":[19,19,20,19,20],"sum":97}],"total":84,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[14,12,14,12,14],"sum":66},{"judge_number":2,"scores":[18,18,19,18,19],"sum":92}],"total":66,"disqualified":false,"disqualification_reason":null}],"grand_total":339,"normalized_score":339,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>10</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">РУБИ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>84</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>181</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>66</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>158</b></font></td> <td rowspan="2" bgcolor="#cd7f32"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Третий результат состязания">339</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'МОНА' AND breed = 'БЕЗ ПОРОДЫ'),
  1313,
  2,
  308,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[12,13,12,12,13],"sum":62},{"judge_number":2,"scores":[16,17,16,16,18],"sum":83}],"total":62,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[16,15,16,16,17],"sum":80},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":308,"normalized_score":308,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>9</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">МОНА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>62</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>145</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>308</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КЕКС' AND breed = 'БЕЗ ПОРОДЫ'),
  1313,
  3,
  255,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[8,8,9,6,12],"sum":43},{"judge_number":2,"scores":[16,17,18,15,17],"sum":83}],"total":43,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[10,8,9,10,12],"sum":49},{"judge_number":2,"scores":[15,17,17,15,16],"sum":80}],"total":49,"disqualified":false,"disqualification_reason":null}],"grand_total":255,"normalized_score":255,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>8</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Без породы</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КЕКС</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>43</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>126</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>49</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>255</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Американский стаффордширский терьер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СЕРВИЛИЯ ФОМ ГРЮНЕН ШТАДТ' AND breed = 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА'),
  1313,
  1,
  347,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[16,17,18,17,18],"sum":86},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":86,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[17,17,18,16,17],"sum":85},{"judge_number":2,"scores":[17,17,17,18,17],"sum":86}],"total":85,"disqualified":false,"disqualification_reason":null}],"grand_total":347,"normalized_score":347,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>11</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бельгийская овчарка малинуа</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СЕРВИЛИЯ ФОМ ГРЮНЕН ШТАДТ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>86</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>176</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>85</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>171</b></font></td> <td rowspan="2" bgcolor="#ffd700"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Лучший результат состязания">347</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЯШМА' AND breed = 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА'),
  1313,
  2,
  327,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[18,17,18,18,17],"sum":88},{"judge_number":2,"scores":[17,17,18,17,18],"sum":87}],"total":88,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[16,17,17,16,17],"sum":83},{"judge_number":2,"scores":[17,17,17,18,17],"sum":86}],"total":83,"disqualified":false,"disqualification_reason":null}],"grand_total":327,"normalized_score":327,"format":"bzmp"}',
  'CACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>13</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бельгийская овчарка малинуа</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЯШМА</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">18</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>88</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>83</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152.1<a title="Ранний/Поздний старт (штраф 10% от суммы баллов забега)" href="#remark"><sup>#</sup></a></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>327.1</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB</font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'СИМПЛИ ЗЕ БЕСТ ФОМ ГРЮНЕН ШТАРД' AND breed = 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА'),
  1313,
  3,
  307,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[15,16,17,16,17],"sum":81},{"judge_number":2,"scores":[17,18,18,16,18],"sum":87}],"total":81,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[14,13,14,15,16],"sum":72},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":72,"disqualified":false,"disqualification_reason":null}],"grand_total":307,"normalized_score":307,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>12</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бельгийская овчарка малинуа</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">СИМПЛИ ЗЕ БЕСТ ФОМ ГРЮНЕН ШТАРД</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>81</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>168</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>139.5<a title="Ранний/Поздний старт (штраф 10% от суммы баллов забега)" href="#remark"><sup>#</sup></a></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>307.5</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКВАТА' AND breed = 'БИГЛЬ'),
  1313,
  1,
  316,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[14,12,12,12,14],"sum":64},{"judge_number":2,"scores":[17,17,18,18,18],"sum":88}],"total":64,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[14,15,15,16,16],"sum":76},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":76,"disqualified":false,"disqualification_reason":null}],"grand_total":316,"normalized_score":316,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>14</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКВАТА</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>64</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>76</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>316</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЧЕЙЗИ /CHEJZI' AND breed = 'БИГЛЬ'),
  1313,
  2,
  283,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[12,10,12,11,12],"sum":57},{"judge_number":2,"scores":[17,17,18,17,18],"sum":87}],"total":57,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[9,10,10,11,14],"sum":54},{"judge_number":2,"scores":[17,18,17,16,17],"sum":85}],"total":54,"disqualified":false,"disqualification_reason":null}],"grand_total":283,"normalized_score":283,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЧЕЙЗИ /<br>CHEJZI</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>57</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>144</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>54</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>139</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>283</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Суки',
  '',
  ''
);

INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  'БЬЮТИС ГЛАНС НЭШЕНАЛ ВИННЕР',
  'БИГЛЬ',
  'БЬЮТИ’С ГЛАНС НЭШЕНАЛ ВИННЕР',
  NULL
);

INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БЬЮТИС ГЛАНС НЭШЕНАЛ ВИННЕР' AND breed = 'БИГЛЬ'),
  1313,
  3,
  281,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[12,10,11,9,10],"sum":52},{"judge_number":2,"scores":[17,16,17,16,16],"sum":82}],"total":52,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[10,11,12,12,16],"sum":61},{"judge_number":2,"scores":[17,18,17,17,17],"sum":86}],"total":61,"disqualified":false,"disqualification_reason":null}],"grand_total":281,"normalized_score":281,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>15</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Бигль</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БЬЮТИ’С ГЛАНС НЭШЕНАЛ ВИННЕР</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>52</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>134</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>61</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>147</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>281</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Бельгийская овчарка малинуа - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'НУМЕНОРС ОРОФЕН' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1313,
  1,
  342,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[16,15,15,16,15],"sum":77},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":77,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[16,15,16,16,17],"sum":80},{"judge_number":2,"scores":[18,18,20,19,20],"sum":95}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":342,"normalized_score":342,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">НУМЕНОР''С ОРОФЕН</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>167</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>175</b></font></td> <td rowspan="2" bgcolor="#c0c0c0"><font style="font-size:12pt" face="Arial" color="#000000"><b><abbr title="Второй результат состязания">342</abbr></b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АМАДЕЙ' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1313,
  2,
  311,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[15,13,14,15,15],"sum":72},{"judge_number":2,"scores":[18,18,18,18,19],"sum":91}],"total":72,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[14,13,14,13,13],"sum":67},{"judge_number":2,"scores":[16,17,16,15,17],"sum":81}],"total":67,"disqualified":false,"disqualification_reason":null}],"grand_total":311,"normalized_score":311,"format":"bzmp"}',
  'CACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>4</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АМАДЕЙ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>72</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>163</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>67</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>148</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>311</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CACMB</font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЗОВ ПОЛЕЙ ТЕРРАКОТ /ZOV POLEY TERRAKOT' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1313,
  3,
  306,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[13,13,14,14,14],"sum":68},{"judge_number":2,"scores":[15,17,16,15,17],"sum":80}],"total":68,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[12,14,16,16,16],"sum":74},{"judge_number":2,"scores":[16,17,17,17,17],"sum":84}],"total":74,"disqualified":false,"disqualification_reason":null}],"grand_total":306,"normalized_score":306,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>6</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЗОВ ПОЛЕЙ ТЕРРАКОТ /<br>ZOV POLEY TERRAKOT</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>68</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>148</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>74</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>158</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>306</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЙМАНТ' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1313,
  4,
  301,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[12,11,12,10,12],"sum":57},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":57,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[14,16,15,12,14],"sum":71},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":71,"disqualified":false,"disqualification_reason":null}],"grand_total":301,"normalized_score":301,"format":"bzmp"}',
  '',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">4</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АЙМАНТ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>57</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>140</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>71</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>161</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>301</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКИО' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1313,
  5,
  289,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[14,12,12,13,14],"sum":65},{"judge_number":2,"scores":[15,16,16,16,17],"sum":80}],"total":65,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[12,14,14,10,11],"sum":61},{"judge_number":2,"scores":[17,17,17,15,17],"sum":83}],"total":61,"disqualified":false,"disqualification_reason":null}],"grand_total":289,"normalized_score":289,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>3</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АКИО</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>65</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>145</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">11</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>61</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>144</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>289</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АРАНИ' AND breed = 'ВЕНГЕРСКАЯ ВЫЖЛА'),
  1313,
  6,
  285,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[15,14,14,15,15],"sum":73},{"judge_number":2,"scores":[16,16,17,17,17],"sum":83}],"total":73,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[10,12,12,6,8],"sum":48},{"judge_number":2,"scores":[16,17,15,16,17],"sum":81}],"total":48,"disqualified":false,"disqualification_reason":null}],"grand_total":285,"normalized_score":285,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>5</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Венгерская выжла</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АРАНИ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>73</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>156</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>48</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>285</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Венгерская выжла - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ИРОН БАЙТ' AND breed = 'ГОЛЛАНДСКАЯ ОВЧАРКА'),
  1313,
  1,
  247,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[7,7,8,10,9],"sum":41},{"judge_number":2,"scores":[17,18,17,18,18],"sum":88}],"total":41,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[5,5,6,5,6],"sum":27},{"judge_number":2,"scores":[18,18,18,18,19],"sum":91}],"total":27,"disqualified":false,"disqualification_reason":null}],"grand_total":247,"normalized_score":247,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>19</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Голландская овчарка</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ИРОН БАЙТ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>41</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>27</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>118</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>247</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Голландская овчарка - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЛВИШ ПОЛАРИС ДАРК НАЙТ' AND breed = 'ГОЛЛАНДСКАЯ ОВЧАРКА'),
  1313,
  2,
  235,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[5,6,5,5,6],"sum":27},{"judge_number":2,"scores":[15,16,16,16,16],"sum":79}],"total":27,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[10,7,9,9,9],"sum":44},{"judge_number":2,"scores":[16,17,17,17,18],"sum":85}],"total":44,"disqualified":false,"disqualification_reason":null}],"grand_total":235,"normalized_score":235,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>17</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Голландская овчарка</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АЛВИШ ПОЛАРИС ДАРК НАЙТ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>27</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>106</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>44</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>235</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Голландская овчарка - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'БАЛЬТАЗАР Д МАГНУМ' AND breed = 'ГОЛЛАНДСКАЯ ОВЧАРКА'),
  1313,
  3,
  226,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[6,6,6,7,7],"sum":32},{"judge_number":2,"scores":[16,17,17,17,17],"sum":84}],"total":32,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[8,6,8,7,8],"sum":37},{"judge_number":2,"scores":[17,17,17,17,18],"sum":86}],"total":37,"disqualified":false,"disqualification_reason":null}],"grand_total":226,"normalized_score":226,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">3</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>18</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Голландская овчарка</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">БАЛЬТАЗАР Д МАГНУМ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>32</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>116</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">7</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>37</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>110.7<a title="Ранний/Поздний старт (штраф 10% от суммы баллов забега)" href="#remark"><sup>#</sup></a></b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>226.7</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Голландская овчарка - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АЙЗА ЛУННЫЙ СВЕТ /AJZA LUNNYJ SVET' AND breed = 'ЛАБРАДОР РЕТРИВЕР'),
  1313,
  1,
  286,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[10,10,8,9,10],"sum":47},{"judge_number":2,"scores":[17,18,18,16,18],"sum":87}],"total":47,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[12,10,14,14,14],"sum":64},{"judge_number":2,"scores":[17,18,18,17,18],"sum":88}],"total":64,"disqualified":false,"disqualification_reason":null}],"grand_total":286,"normalized_score":286,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>20</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Лабрадор ретривер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сука</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">АЙЗА ЛУННЫЙ СВЕТ /<br>AJZA LUNNY`J SVET</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">9</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>47</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>134</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>64</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>152</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>286</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Лабрадор ретривер - Стандартный - Суки',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РАМИР СКАЙ БЛЮ' AND breed = 'НЕМЕЦКИЙ ПИНЧЕР'),
  1313,
  1,
  324,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[13,14,15,14,15],"sum":71},{"judge_number":2,"scores":[17,18,18,18,18],"sum":89}],"total":71,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[15,15,14,15,15],"sum":74},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":74,"disqualified":false,"disqualification_reason":null}],"grand_total":324,"normalized_score":324,"format":"bzmp"}',
  'Чемпион РКФ, RegCACMB',
  '+',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>22</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкий пинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">РАМИР СКАЙ БЛЮ</font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>71</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>160</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>74</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>164</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>324</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">+</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACMB</font></td> ',
  'Немецкий пинчер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'РОЙ ГАЛАКСИ ДЖОЙ' AND breed = 'НЕМЕЦКИЙ ПИНЧЕР'),
  1313,
  2,
  295,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[12,14,15,12,14],"sum":67},{"judge_number":2,"scores":[15,17,17,15,17],"sum":81}],"total":67,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[12,13,12,13,13],"sum":63},{"judge_number":2,"scores":[17,17,17,16,17],"sum":84}],"total":63,"disqualified":false,"disqualification_reason":null}],"grand_total":295,"normalized_score":295,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">2</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>23</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Немецкий пинчер</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">РОЙ ГАЛАКСИ ДЖОЙ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>67</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>148</b></font></td> <td rowspan="2" bgcolor="#f0ffff"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">12</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">13</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>63</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>147</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>295</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкий пинчер - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'АКСЕЛЬ ЛЕО БАЙРОН' AND breed = 'НЕМЕЦКИЙ ПИНЧЕР'),
  1313,
  NULL,
  NULL,
  1,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[null,null,null,null,null],"sum":null}],"total":null,"disqualified":true,"disqualification_reason":"Отстранение (Потеря приманки)"}],"grand_total":null,"normalized_score":null,"format":"bzmp"}',
  '',
  '',
  'disqualified',
  ' <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i>21</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Немецкий пинчер</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">АКСЕЛЬ ЛЕО БАЙРОН</font></td> <td bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000">Отстранение (Потеря приманки)</font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><i></i></font></td> <td colspan="6"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:11pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:12pt" face="Arial" color="#000000"><b></b></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Немецкий пинчер - Стандартный - Кобели',
  'Потеря приманки',
  ''
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'КАМИЛЛИОН СТАРС СТРОНГ СПИРИТ' AND breed = 'СИБИРСКИЙ ХАСКИ'),
  1313,
  1,
  206,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[6,6,8,6,8],"sum":34},{"judge_number":2,"scores":[15,16,17,16,17],"sum":81}],"total":34,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[5,5,6,5,6],"sum":27},{"judge_number":2,"scores":[13,14,14,11,12],"sum":64}],"total":27,"disqualified":false,"disqualification_reason":null}],"grand_total":206,"normalized_score":206,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>24</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Сибирский хаски</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">КАМИЛЛИОН СТАРС СТРОНГ СПИРИТ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>34</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>115</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">5</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">6</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>27</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>91</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>206</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Сибирский хаски - Стандартный - Кобели',
  '',
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
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = 'ЖИЗНЬ БЬЕТ КЛЮЧОМ' AND breed = 'ЯКУТСКАЯ ЛАЙКА'),
  1313,
  1,
  299,
  2,
  '{"heats":[{"heat_number":1,"bib_number":null,"judges":[{"judge_number":1,"scores":[8,10,10,8,10],"sum":46},{"judge_number":2,"scores":[16,17,17,16,17],"sum":83}],"total":46,"disqualified":false,"disqualification_reason":null},{"heat_number":2,"bib_number":null,"judges":[{"judge_number":1,"scores":[16,15,16,16,17],"sum":80},{"judge_number":2,"scores":[18,18,18,18,18],"sum":90}],"total":80,"disqualified":false,"disqualification_reason":null}],"grand_total":299,"normalized_score":299,"format":"bzmp"}',
  '',
  '',
  'finished',
  ' <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>25</i></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Якутская лайка</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Стандартный</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Кобель</font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">ЖИЗНЬ БЬЕТ КЛЮЧОМ</font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">8</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>46</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>129</b></font></td> <td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>-</i></font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td> <td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td> <td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>170</b></font></td> <td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>299</b></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> <td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"></font></td> ',
  'Якутская лайка - Стандартный - Кобели',
  '',
  ''
);