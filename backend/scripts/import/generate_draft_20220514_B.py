import json
import os
from verify_math_20220514_B import dogs

def get_breed_class(d):
    breed = d["breed"]
    cls_map = {
        "standard": "Стандартный",
        "junior": "Юниоры",
        "veteran": "Ветераны"
    }
    cls_name = cls_map.get(d["class"], "Стандартный")
    if breed == "Американский пит-бультерьер" and d["class"] == "junior":
        cat_name = "Кобели"
    else:
        cat_name = "Общая"
    return f"{breed} - {cls_name} - {cat_name}"

output_draft = {
    "event": {
        "id": 20221013,
        "event_id": 20221013,
        "title": "Чемпионат РКФ по бегам за механической приманкой (курсинг)",
        "name": "Чемпионат РКФ по бегам за механической приманкой (курсинг)",
        "date_start": "2022-05-14",
        "date_end": "2022-05-14",
        "location": "Ярославская область, село Великое",
        "event_type": "bzmp",
        "judges": ["Орлова М.О.", "Крылова Е.В."],
        "organizer": None,
        "source_url": "https://procoursing.ru/s_2022.html"
    },
    "results": []
}

for idx, d in enumerate(dogs, start=1):
    b_class = get_breed_class(d)
    
    heats_data = []
    
    # Heat 1
    h1 = d.get("heat1")
    if h1:
        heats_data.append({
            "heat_number": h1["heat_num"],
            "bib_color": h1["collar"],
            "judges": [
                {
                    "judge_number": 1,
                    "scores": h1["j1"],
                    "sum": sum(h1["j1"])
                },
                {
                    "judge_number": 2,
                    "scores": h1["j2"],
                    "sum": sum(h1["j2"])
                }
            ],
            "total": h1["total"]
        })
        
    # Heat 2
    h2 = d.get("heat2")
    if h2:
        heats_data.append({
            "heat_number": h2["heat_num"],
            "bib_color": h2["collar"],
            "judges": [
                {
                    "judge_number": 1,
                    "scores": h2["j1"],
                    "sum": sum(h2["j1"])
                },
                {
                    "judge_number": 2,
                    "scores": h2["j2"],
                    "sum": sum(h2["j2"])
                }
            ],
            "total": h2["total"]
        })

    entry = {
        "id": idx,
        "catalog_no": d["catalog_num"],
        "catalog_number": d["catalog_num"],
        "placement": d.get("place"),
        "place": d.get("place"),
        "breed_class": b_class,
        "competition_class": b_class,
        "qualification": d.get("cert") or "",
        "certificate": d.get("cert") or "",
        "vc": d.get("title") or "",
        "title": d.get("title") or "",
        "total_score": d.get("total_score"),
        "status": d["status"],
        "dog": {
            "name": d.get("name_en") or d["name_ru"],
            "name_ru": d["name_ru"],
            "name_lat": d.get("name_en"),
            "breed": d["breed"],
            "gender": d["gender"],
            "sex": "Кобель" if d["gender"] == "male" else "Сука"
        },
        "raw_scores_json": {
            "heats": heats_data,
            "grand_total": d.get("total_score"),
            "format": "coursing"
        }
    }
    output_draft["results"].append(entry)

out_path = "data/temp/draft-2022-05-14_B.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output_draft, f, ensure_ascii=False, indent=2)

print(f"Generated draft with {len(output_draft['results'])} dogs to {out_path}")
