import urllib.request
import re
import json
import os

os.makedirs('scratch', exist_ok=True)

html = urllib.request.urlopen('http://www.procoursing.ru/s_2022.html').read().decode('windows-1251', 'replace')

trs = re.findall(r'<tr[^>]*>(.*?)</tr>', html, flags=re.DOTALL | re.IGNORECASE)
print(f'Found {len(trs)} table rows.')
rows_data = []
for tr in trs:
    tds = re.findall(r'<td[^>]*>(.*?)</td>', tr, flags=re.DOTALL | re.IGNORECASE)
    if tds:
        clean_tds = [re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', td)).strip() for td in tds]
        links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', tr, flags=re.DOTALL | re.IGNORECASE)
        rows_data.append({
            'tds': clean_tds,
            'links': [(l[0].strip(), re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', l[1])).strip()) for l in links]
        })

with open('scratch/events_2022.json', 'w', encoding='utf-8') as out:
    json.dump(rows_data, out, ensure_ascii=False, indent=2)

print('Saved scratch/events_2022.json')
