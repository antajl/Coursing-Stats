import sqlite3
import gzip
import json
import re
import sys
from collections import Counter

DB_PATH = 'data/local/exhibitions-rkf-archive.sqlite'

SUFFIXES = {
    'новна', 'ровна', 'евна', 'овна', 'ична', 'инична', 'ович', 'евич',
    'ва', 'ова', 'ева', 'ина', 'ына',
    'ская', 'цкая', 'ский', 'цкий',
    'бург', 'граде',
    'ная', 'ный', 'ное', 'ные',
    'кова', 'лова', 'рова', 'това', 'сова'
}

PREFIXES = {
    'валенти', 'александ', 'владими', 'мордвино', 'краковс', 'оболенс',
    'сенашен', 'переведен', 'денисо', 'крюко', 'кудрявце', 'трофимо', 'никити'
}

COMMON_GIVENS = {
    'ирина', 'наталья', 'наталия', 'лариса', 'евгения', 'людмила', 'флера',
    'елена', 'татьяна', 'ольга', 'анна', 'марина', 'светлана', 'галина', 'мария',
    'екатерина', 'надежда', 'любовь', 'вера', 'нина', 'инна', 'жанна', 'лилия',
    'александр', 'алексей', 'владимир', 'сергей', 'дмитрий', 'андрей', 'михаил',
    'николай', 'иван', 'евгений', 'вадим', 'шамиль', 'георгий', 'роберт', 'денис',
    'эдуард', 'юрий', 'виктор', 'олег', 'игорь', 'павел', 'валерий', 'станислав',
    'эмилия', 'наиля', 'мадина', 'заур', 'эсенгельды'
}

SURNAME_ENDINGS_CYR = r'(?:ова|ева|ина|ына|ская|цкая|ов|ев|ин|ын|ский|цкий|ых|их|енко|ян|дзе|швили)$'
PATRONYMIC_ENDINGS = r'(?:ович|евич|овна|евна|ична|инична)$'

GRADE_NORM = {
    'без оц.': 'Б/О',
    'без оц': 'Б/О',
    'без оценки': 'Б/О',
    'б/о': 'Б/О',
    'б.о.': 'Б/О',
    'б.о': 'Б/О',
    'бп': 'Б/О',
    'б.п.': 'Б/О',
    'б/п': 'Б/О',
    'о/х': 'ОЧ.ХОР',
    'о.х': 'ОЧ.ХОР',
    'о.х.': 'ОЧ.ХОР',
    'оч.х': 'ОЧ.ХОР',
    'оч.х.': 'ОЧ.ХОР',
    'оч.хор': 'ОЧ.ХОР',
    'оч.хор.': 'ОЧ.ХОР',
    'очень хорошо': 'ОЧ.ХОР',
    'отлично': 'ОТЛ',
    'отл.': 'ОТЛ',
    'отл': 'ОТЛ',
    'хорошо': 'ХОР',
    'хор.': 'ХОР',
    'хор': 'ХОР',
    'уд.': 'УДОВЛ',
    'удовл.': 'УДОВЛ',
    'удовлетворительно': 'УДОВЛ',
    'дискв.': 'ДИСКВ',
    'дисквалификация': 'ДИСКВ',
    'ня': 'НЕЯВКА',
    'н/я': 'НЕЯВКА',
    'неявка': 'НЕЯВКА',
    'не явк': 'НЕЯВКА',
    'о/п': 'ОП',
    'о.п.': 'ОП',
    'о.п': 'ОП',
    'оч.п': 'ОП',
    'оч.персп.': 'ОП',
    'очень перспективный': 'ОП',
    'перспективный': 'ПЕРСП',
    'персп.': 'ПЕРСП',
    'персп': 'ПЕРСП',
    'неперспективный': 'НЕПЕРСП',
    'неперсп.': 'НЕПЕРСП',
    'неперсп': 'НЕПЕРСП',
    'непе рсп.': 'НЕПЕРСП',
}

def clean_soft_hyphens(text):
    if not text or not isinstance(text, str):
        return text
    # 1. Hyphen with trailing space in compound words
    text = re.sub(r'\b(черно|коричнево|красно|бело|шоколадно|темно|ярко|бассет|ши|кокер|вольф|блю)-\s+([а-яёa-z]+)\b', r'\1-\2', text, flags=re.I)
    text = re.sub(r'\bши\s+-\s+тцу\b', 'ши-тцу', text, flags=re.I)
    
    # 2. Soft hyphen line-breaks
    def repl(m):
        p1, p2 = m.group(1), m.group(2)
        if p2[0].isupper():
            return m.group(0)
        if p2.lower() in SUFFIXES or p1.lower() in PREFIXES:
            return p1 + p2
        return m.group(0)

    return re.sub(r'([а-яёa-z]{3,})-([а-яёa-z]{2,})', repl, text, flags=re.I)

def clean_judge_name(j):
    if not j or not isinstance(j, str):
        return j
    res = clean_soft_hyphens(j.strip())
    # Remove dates leaked into judge: e.g. "sarmont tamara 12 12 2021"
    res = re.sub(r'\s+\d{2}\s+\d{2}\s+\d{4}\b', '', res)
    # Remove leading dash: "– Жеребцова..."
    res = re.sub(r'^[-–—\s]+', '', res)
    # Remove middle isolated dash: "Николай – Борисович..."
    res = re.sub(r'\s+[-–—]\s+', ' ', res)
    
    # Check reversed patronymic order: "Рашидовна Чайковская Флера" -> "Чайковская Флера Рашидовна"
    parts = res.split()
    if len(parts) == 3 and re.search(PATRONYMIC_ENDINGS, parts[0], re.I):
        patr = parts[0]
        if parts[2].lower() in COMMON_GIVENS:
            res = f"{parts[1]} {parts[2]} {patr}"
        elif parts[1].lower() in COMMON_GIVENS:
            res = f"{parts[2]} {parts[1]} {patr}"
        elif re.search(SURNAME_ENDINGS_CYR, parts[1], re.I):
            res = f"{parts[1]} {parts[2]} {patr}"
        elif re.search(SURNAME_ENDINGS_CYR, parts[2], re.I):
            res = f"{parts[2]} {parts[1]} {patr}"
            
    return res.strip()

def is_valid_judge(j):
    if not j or len(j) < 4:
        return False
    parts = j.split()
    if len(parts) < 2:
        return False
    if j.lower() in ['б оп', 'оч хор', 'оч.хор', 'отл сас', 'вельш корги', 'немецкий шпиц', 'пудель']:
        return False
    return True

def main():
    print("Connecting to database:", DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    total_rows = cursor.execute("SELECT COUNT(*) FROM exhibitions_rkf").fetchone()[0]
    print(f"Total exhibitions in database: {total_rows}")

    cursor.execute("SELECT id, year, data FROM exhibitions_rkf ORDER BY year, id")
    rows = cursor.fetchall()

    updates = []
    stats = Counter()
    modified_shows = 0

    print("Processing exhibitions...")
    for idx, (ex_id, year, blob) in enumerate(rows):
        raw = gzip.decompress(blob).decode('utf-8')
        data = json.loads(raw)
        
        show_modified = False
        
        # 1. Judges in exhibition header
        new_judges = []
        for j in data.get('judges', []) or []:
            cj = clean_judge_name(j)
            if not is_valid_judge(cj):
                show_modified = True
                stats['invalid_judge_removed'] += 1
                continue
            if cj != j:
                show_modified = True
                stats['judge_header_cleaned'] += 1
            new_judges.append(cj)
        data['judges'] = new_judges

        # 2. Results
        results = data.get('results', []) or []
        for r_idx, r in enumerate(results):
            # Breed
            b = r.get('breed', '')
            cb = clean_soft_hyphens(b)
            b_upper = cb.strip().upper()
            if b_upper == 'СОБАКА' and r_idx > 0:
                prev_b = results[r_idx-1].get('breed', '').strip().upper()
                if 'КИТАЙСКАЯ ХОХЛАТАЯ' in prev_b:
                    cb = 'КИТАЙСКАЯ ХОХЛАТАЯ СОБАКА'
                elif 'ПИРЕНЕЙСКАЯ ГОРНАЯ' in prev_b:
                    cb = 'ПИРЕНЕЙСКАЯ ГОРНАЯ СОБАКА'
            elif b_upper in ['ПОДШЕРСТКОМ', 'ОСТЕВАЯ ШЕРСТЬ С']:
                cb = 'НЕМЕЦКАЯ ОВЧАРКА Д-Ш'
                
            if cb != b:
                r['breed'] = cb
                show_modified = True
                stats['breed_cleaned'] += 1

            # Judge in result
            rj = r.get('judge', '')
            crj = clean_judge_name(rj)
            if crj != rj:
                r['judge'] = crj
                show_modified = True
                stats['result_judge_cleaned'] += 1

            # Dog name
            dn = r.get('dog_name', '')
            cdn = clean_soft_hyphens(dn)
            if cdn != dn:
                r['dog_name'] = cdn
                show_modified = True
                stats['dog_name_cleaned'] += 1

            # Grade
            grd = r.get('grade', '')
            grd_low = grd.strip().lower()
            if grd_low in GRADE_NORM:
                cgrd = GRADE_NORM[grd_low]
                if cgrd != grd:
                    r['grade'] = cgrd
                    show_modified = True
                    stats['grade_cleaned'] += 1

        # 3. Main ring
        mr = data.get('main_ring', []) or []
        for m in mr:
            mj = m.get('judge', '')
            cmj = clean_judge_name(mj)
            if cmj != mj:
                m['judge'] = cmj
                show_modified = True
                stats['main_ring_judge_cleaned'] += 1

        if show_modified:
            modified_shows += 1
            # Recompress with gzip
            new_json_bytes = json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
            new_compressed = gzip.compress(new_json_bytes, mtime=0)
            updates.append((new_compressed, ex_id, year))

        if (idx + 1) % 5000 == 0:
            print(f"Processed {idx + 1} / {total_rows} exhibitions (Modified: {modified_shows})...")

    print(f"\nProcessing complete. Total modified exhibitions: {modified_shows} / {total_rows}")
    print("Writing updates to SQLite database...")

    cursor.executemany("UPDATE exhibitions_rkf SET data = ? WHERE id = ? AND year = ?", updates)
    conn.commit()

    print("Database committed successfully.")
    print("\nSummary of modifications applied:")
    for k, v in stats.items():
        print(f"  {k}: {v}")

    conn.close()

if __name__ == '__main__':
    main()
