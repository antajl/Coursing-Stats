import json

with open('data/v1/calendar/2022.json', 'r', encoding='utf-8') as f:
    events = json.load(f)['events']

for e in sorted(events, key=lambda x: (x['date_start'], str(x.get('id', '')))):
    has_res = e.get('has_results') or e.get('results_file') is not None
    print(f"{e['date_start']} | ID: {e.get('id')} | type: {e.get('event_type')} | with_res: {has_res} | {e.get('name')}")
