import json
import os
from verify_math_20220514_C import dogs

def get_breed_class(d):
    breed = d["breed"]
    cls_map = {
        "standard": "Стандартный",
        "veteran": "Ветераны",
        "sprinter": "Стандартный-спринтеры",
        "junior": "Юниоры"
    }
    cls_name = cls_map.get(d["class"], "Стандартный")
    
    # Check if breed/class in the original protocol is single sex or mixed (Общая)
    # In protocol 2022-05-14_C:
    # Басенджи Стандартный: Кобели, Суки
    # РПБ Стандартный: Суки
    # Тайский риджбек Ветераны: Общая
    # Тайский риджбек Стандартный: Общая
    # Уиппет Ветераны: Суки
    # Уиппет Стандартный: Общая
    # Уиппет Стандартный-спринтеры: Кобели, Суки
    # Уиппет Юниоры: Суки
    # Фараонова собака Ветераны: Суки
    # Фараонова собака Стандартный: Кобели, Суки
    
    if breed == "Тайский риджбек" or (breed == "Уиппет" and d["class"] == "standard"):
        cat_name = "Общая"
    else:
        cat_name = "Кобели" if d["gender"] == "male" else "Суки"
        
    return f"{breed} - {cls_name} - {cat_name}"

output_draft = {
    "event": {
        "id": 20221012,
        "event_id": 20221012,
        "title": "Чемпионат РКФ - CACL по курсингу борзых",
        "name": "Чемпионат РКФ - CACL по курсингу борзых",
        "date_start": "2022-05-14",
        "date_end": "2022-05-14",
        "location": "Ярославская область, село Великое",
        "event_type": "coursing",
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
        if h1.get("disqualified"):
            heats_data.append({
                "heat_number": h1.get("heat_num", 1),
                "bib_color": h1.get("collar", "red"),
                "disqualified": True,
                "disqualification_reason": h1.get("disqualification_reason", "Сход")
            })
        else:
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
        if h2.get("disqualified"):
            heats_data.append({
                "heat_number": h2.get("heat_num"),
                "bib_color": h2.get("collar"),
                "disqualified": True,
                "disqualification_reason": h2.get("disqualification_reason", "Сход")
            })
        else:
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
        "status_reason": d.get("disqualification_reason"),
        "disqualification_reason": d.get("disqualification_reason"),
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

out_path = "data/temp/draft-2022-05-14_C.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output_draft, f, ensure_ascii=False, indent=2)

print(f"Generated complete draft with {len(output_draft['results'])} dogs to {out_path}")
