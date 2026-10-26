import json

with open('scratch/events_2022.json', 'r', encoding='utf-8') as f:
    events = json.load(f)

event_rows = []
for r in events:
    tds = r.get('tds', [])
    if tds and any('2022' in t and ('.' in t or '-' in t) for t in tds):
        # exclude header row "2022" or "2015 | 2016..."
        if any(len(t) >= 8 and any(c.isdigit() for c in t[:2]) for t in tds):
            event_rows.append(r)

print(f"Total competition events in s_2022.html: {len(event_rows)}\n")

with open('scratch/events_2022_full_list.txt', 'w', encoding='utf-8') as out:
    for i, er in enumerate(event_rows):
        links = er.get('links', [])
        date_str = er['tds'][0]
        title_str = er['tds'][1]
        loc_str = er['tds'][2] if len(er['tds']) > 2 else ''
        res_links = [l[0] for l in links if 'results' in l[0] or 'Complete_Results' in l[0]]
        cat_links = [l[0] for l in links if l[0].endswith('.pdf')]
        line = f"{i+1:2d}. {date_str} | {title_str} ({loc_str}) | Res: {len(res_links)} | Cat: {len(cat_links)}"
        print(line)
        out.write(line + "\n")
        out.write(f"    Res links: {res_links}\n")
        out.write(f"    Cat links: {cat_links}\n")
