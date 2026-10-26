import re

with open('data/tmp/procoursing_2022/s_2022.html', 'r', encoding='cp1251', errors='replace') as f:
    html = f.read()

# find table rows
rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL | re.IGNORECASE)
events = []
for r in rows:
    tds = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL | re.IGNORECASE)
    if len(tds) >= 4:
        clean_tds = [re.sub(r'<[^>]+>', '', t).strip() for t in tds]
        date = clean_tds[0]
        title = clean_tds[1]
        links = re.findall(r'href=[\'"]?([^\'" >]+)', r, re.IGNORECASE)
        if date and any(char.isdigit() for char in date):
            events.append((date, title, links))

print(f"Total events in s_2022.html: {len(events)}")
for idx, (d, t, links) in enumerate(events, start=1):
    safe_title = t.encode('ascii', errors='replace').decode('ascii')
    print(f"{idx:2d}. {d} | {safe_title[:45]} | links: {links}")

