"""
Загрузка рекордов скорости из Google Sheets через PDF экспорт
"""

import fitz  # pymupdf
import requests
import sys

SPREADSHEET_ID = "1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE"

# Листы с цветами
SHEETS_WITH_COLORS = [
    {"gid": "1787526009", "name": "2026"},
    {"gid": "0", "name": "2025"},
    {"gid": "1775097609", "name": "старые личные рекорды"}
]

def parse_pdf_to_records(pdf_path):
    """Парсит PDF и извлекает записи собак с цветами"""
    doc = fitz.open(pdf_path)
    page = doc[0]
    
    # Собираем цветные прямоугольники
    colored_rects = []
    for drawing in page.get_drawings():
        fill = drawing.get("fill")
        if fill and fill != (1, 1, 1):  # исключаем белый
            colored_rects.append({
                "rect": drawing["rect"],
                "color": "#{:02X}{:02X}{:02X}".format(
                    int(fill[0]*255), int(fill[1]*255), int(fill[2]*255)
                )
            })
    
    # Сопоставляем текст с прямоугольниками по координатам
    words_with_colors = []
    for word in page.get_text("words"):  # (x0, y0, x1, y1, text, ...)
        wx0, wy0, wx1, wy1, text = word[:5]
        word_cx = (wx0 + wx1) / 2
        word_cy = (wy0 + wy1) / 2

        cell_color = None
        for r in colored_rects:
            rx = r["rect"]
            if rx.x0 <= word_cx <= rx.x1 and rx.y0 <= word_cy <= rx.y1:
                cell_color = r["color"]
                break

        words_with_colors.append({
            "text": text,
            "color": cell_color,
            "x": wx0,
            "y": wy0
        })
    
    doc.close()
    
    # Группируем слова в строки по Y-координате
    rows = {}
    for word in words_with_colors:
        y_rounded = round(word["y"] / 10) * 10
        if y_rounded not in rows:
            rows[y_rounded] = []
        rows[y_rounded].append(word)
    
    # Сортируем строки по Y и слова по X
    sorted_rows = []
    for y in sorted(rows.keys()):
        row_words = sorted(rows[y], key=lambda x: x["x"])
        sorted_rows.append(row_words)
    
    # Группируем слова в записи
    records = []
    
    for row_words in sorted_rows:
        # Если в строке 6 слов - это запись
        if len(row_words) == 6:
            breed = row_words[0]["text"]
            sex = row_words[1]["text"]
            name = row_words[2]["text"]
            speed_text = row_words[3]["text"]
            date = row_words[4]["text"]
            screenshot_url = row_words[5]["text"]
            color = row_words[5]["color"]
            
            # Пропускаем заголовки
            if breed in ["Порода", "Пол", "Кличка"]:
                continue
            
            # Пропускаем легенду
            if "новый" in breed or "улучшение" in breed:
                continue
            
            # Парсим скорость
            speed_km_h = 0
            try:
                speed_km_h = int(speed_text)
            except ValueError:
                pass
            
            # Определяем статус по цвету
            status = "normal"
            if color == "#B6D7A8":  # зелёный
                status = "new"
            elif color == "#9FC5E8":  # синий
                status = "improved"
            
            # Сохраняем запись
            if breed and name:
                records.append({
                    "breed": breed,
                    "sex": sex,
                    "name": name,
                    "speed_km_h": speed_km_h,
                    "date": date,
                    "screenshot_url": screenshot_url,
                    "status": status
                })
    
    return records

def download_pdf(gid):
    """Скачивает PDF из Google Sheets для указанного листа"""
    url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=pdf&gid={gid}"
    response = requests.get(url)
    response.raise_for_status()
    
    pdf_path = f"sheet_{gid}.pdf"
    with open(pdf_path, "wb") as f:
        f.write(response.content)
    
    return pdf_path

def generate_sql(records):
    """Генерирует SQL для загрузки в D1"""
    sql = "-- speed_records\n"
    sql += "DELETE FROM speed_records;\n\n"
    
    for record in records:
        # Сериализуем историю в JSON
        history_json = "NULL"
        if 'history' in record and record['history']:
            import json
            history_json = f"'{json.dumps(record['history'])}'"
        
        sql += "INSERT INTO speed_records (breed, sex, name, speed_km_h, date, screenshot_url, status, history)\n"
        sql += "VALUES (\n"
        sql += f"  '{record['breed']}',\n"
        sql += f"  '{record['sex']}',\n"
        sql += f"  '{record['name']}',\n"
        sql += f"  {record['speed_km_h']},\n"
        sql += f"  '{record['date']}',\n"
        sql += f"  '{record['screenshot_url']}',\n"
        sql += f"  '{record['status']}',\n"
        sql += f"  {history_json}\n"
        sql += ");\n\n"
    
    return sql

def main():
    all_records = []
    
    # Парсим все листы с цветами
    for sheet in SHEETS_WITH_COLORS:
        print(f"\nProcessing sheet: {sheet['name']} (gid={sheet['gid']})")
        print("Downloading PDF...")
        pdf_path = download_pdf(sheet['gid'])
        print(f"PDF downloaded to {pdf_path}")
        
        print("Parsing PDF to records...")
        records = parse_pdf_to_records(pdf_path)
        print(f"Found {len(records)} records in {sheet['name']}")
        
        all_records.extend(records)
    
    print(f"\nTotal records from all sheets: {len(all_records)}")
    
    # Дедупликация и сопоставление
    print("Deduplicating records...")
    unique_records = {}
    
    def parse_date(date_str):
        """Парсит дату DD.MM.YYYY в tuple (day, month, year) для сравнения"""
        parts = date_str.split('.')
        if len(parts) == 3:
            return (int(parts[2]), int(parts[1]), int(parts[0]))  # (year, month, day)
        return (0, 0, 0)
    
    for record in all_records:
        key = (record['breed'], record['name'])
        
        if key not in unique_records:
            unique_records[key] = record
        else:
            # Если есть несколько результатов с разной датой
            existing = unique_records[key]
            if existing['date'] != record['date']:
                # Сравниваем даты
                existing_date = parse_date(existing['date'])
                record_date = parse_date(record['date'])
                
                if record_date > existing_date:
                    # Новая дата — сохраняем старый результат в историю
                    if 'history' not in existing:
                        existing['history'] = []
                    existing['history'].append({
                        'speed_km_h': existing['speed_km_h'],
                        'date': existing['date'],
                        'status': existing['status']
                    })
                    # Обновляем на новый результат
                    unique_records[key] = record
                else:
                    # Старая дата — добавляем в историю существующей записи
                    if 'history' not in existing:
                        existing['history'] = []
                    existing['history'].append({
                        'speed_km_h': record['speed_km_h'],
                        'date': record['date'],
                        'status': record['status']
                    })
            # Если всё одинаковое - пропускаем дубликат
    
    final_records = list(unique_records.values())
    print(f"After deduplication: {len(final_records)} unique records")
    
    print(f"\nRecords with history:")
    for record in final_records:
        if 'history' in record:
            print(f"  {record['breed']} {record['name']} - {len(record['history'])} historical results")
    
    sql = generate_sql(final_records)
    
    sql_path = "data/speed-records.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write(sql)
    
    print(f"\nSQL generated: {sql_path}")
    print(f"Total SQL length: {len(sql)} bytes")

if __name__ == "__main__":
    main()
