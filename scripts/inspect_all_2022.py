import json

with open('scratch/events_2022.json', 'r', encoding='utf-8') as f:
    events = json.load(f)

event_rows = []
for r in events:
    tds = r.get('tds', [])
    if tds and any('.' in t and len(t) <= 12 and any(c.isdigit() for c in t) for t in tds):
        event_rows.append(r)

print(f"Total competition rows in s_2022.html: {len(event_rows)}")
for i, er in enumerate(event_rows):
    links = er.get('links', [])
    date_str = er['tds'][0]
    title_str = er['tds'][1]
    loc_str = er['tds'][2] if len(er['tds']) > 2 else ''
    res_links = [l[0] for l in links if 'results' in l[0] or 'Complete_Results' in l[0]]
    cat_links = [l[0] for l in links if l[0].endswith('.pdf')]
    print(f"{i+1:2d}. {date_str} | {title_str} ({loc_str})")
    print(f"    Results: {res_links}")
    print(f"    Catalog: {cat_links}")
