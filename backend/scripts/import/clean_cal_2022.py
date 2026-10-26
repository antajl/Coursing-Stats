import json

cal_path = 'data/v1/calendar/2022.json'
with open(cal_path, 'r', encoding='utf-8') as f:
    cal = json.load(f)

seen = set()
unique_events = []
for e in cal['events']:
    eid = int(e['id'])
    if eid not in seen:
        seen.add(eid)
        e['id'] = eid
        unique_events.append(e)

unique_events.sort(key=lambda x: (x['date_start'], x['id']))
cal['events'] = unique_events
cal['event_count'] = len(unique_events)
cal['with_results'] = sum(1 for e in unique_events if e.get('has_results'))

with open(cal_path, 'w', encoding='utf-8') as f:
    json.dump(cal, f, ensure_ascii=False, indent=2)

print(f"Cleaned calendar 2022: {cal['event_count']} events, {cal['with_results']} with results")
