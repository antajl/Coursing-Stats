import json
import os

def make_result(idx, cat_no, breed, breed_class, sex, name_ru, name_lat, placement, total_score, qualification, vc, status, status_reason, heats):
    if status == 'finished':
        calc_total = 0
        for h in heats:
            if 'judges' in h:
                j_sum = sum(j['sum'] for j in h['judges'])
                assert h['total'] == j_sum, f"Heat total mismatch for {name_ru}: {h['total']} != {j_sum}"
                for j in h['judges']:
                    assert sum(j['scores']) == j['sum'], f"Judge {j['judge_number']} sum mismatch for {name_ru}: {sum(j['scores'])} != {j['sum']}"
                calc_total += h['total']
        assert calc_total == total_score, f"Grand total mismatch for {name_ru}: {calc_total} != {total_score}"

    judge_cnt = 2 if any('judges' in h and h['judges'] for h in heats) else 0

    return {
        "id": idx,
        "catalog_no": cat_no,
        "breed_class": breed_class,
        "placement": placement,
        "total_score": total_score,
        "judge_count": judge_cnt,
        "qualification": qualification,
        "vc": vc,
        "status": status,
        "status_reason": status_reason,
        "dog": {
            "name_ru": name_ru,
            "name_lat": name_lat,
            "breed": breed,
            "sex": sex
        },
        "raw_scores_json": {
            "heats": heats,
            "grand_total": total_score,
            "format": "coursing"
        }
    }

results_raw = [
    # 1. Американский стаффордшир-терьер_Стандартный_Общая
    (1, "Американский стаффордширский терьер", "Американский стаффордширский терьер - Стандартный - Кобель", "Кобель", "ЛАН-БРАЙТ БУГАТТИ БЛЭК", "LAN-BRIGHT BUGATTI BLACK", 1, 330, "CC", "", "finished", None, [
        {"heat_number": 1, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 17, 18, 17], "sum": 87}], "total": 176},
        {"heat_number": 11, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [13, 17, 17, 17, 17], "sum": 81}, {"judge_number": 2, "scores": [13, 17, 16, 12, 15], "sum": 73}], "total": 154}
    ]),
    (2, "Американский стаффордширский терьер", "Американский стаффордширский терьер - Стандартный - Сука", "Сука", "РУССКИЙ ФАВОРИТ БЕССОННАЯ НОЧЬ", "RUSSKIY FAVORIT BESSONNAYA NOCH", None, None, "", "", "dnf", "Сошёл", [
        {"heat_number": 1, "bib_color": "white", "disqualified": False, "disqualification_reason": "Сошёл"}
    ]),

    # 2. Бигль_Стандартный_Кобели
    (3, "Бигль", "Бигль - Стандартный - Кобель", "Кобель", "ДАКОТА ХАНТЕР ЭББИ ДОР", "DAKOTA HUNTER ABBY DOR", 1, 369, "CC", "", "finished", None, [
        {"heat_number": 2, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [19, 19, 19, 20, 20], "sum": 97}, {"judge_number": 2, "scores": [19, 18, 18, 18, 18], "sum": 91}], "total": 188},
        {"heat_number": 12, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 19, 19], "sum": 92}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 181}
    ]),

    # 3. Золотистый ретривер_Стандартный_Кобели
    (4, "Золотистый ретривер", "Золотистый ретривер - Стандартный - Кобель", "Кобель", "ХЕППИ СПИРИТ ХЬЮСТОН", "HAPPY SPIRIT HOUSTON", 1, 345, "CC", "", "finished", None, [
        {"heat_number": 3, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 19, 19], "sum": 91}, {"judge_number": 2, "scores": [17, 19, 18, 19, 18], "sum": 91}], "total": 182},
        {"heat_number": 13, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [14, 16, 16, 15, 18], "sum": 79}, {"judge_number": 2, "scores": [16, 17, 18, 16, 17], "sum": 84}], "total": 163}
    ]),

    # 4. Ирландский терьер_Стандартный_Общая
    (5, "Ирландский терьер", "Ирландский терьер - Стандартный - Кобель", "Кобель", "НЕЖНОЕ ПЛАМЯ БРОДЕРИК", "NEZHNOYE PLAMYA BRODERICK", 1, 353, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 4, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 19, 19], "sum": 92}, {"judge_number": 2, "scores": [16, 17, 17, 17, 18], "sum": 85}], "total": 177},
        {"heat_number": 14, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 17, 18], "sum": 88}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 176}
    ]),
    (None, "Ирландский терьер", "Ирландский терьер - Стандартный - Сука", "Сука", "ЮРАТЕ ЯНТАРНАЯ КАПЛЯ", "YURATE YANTARNYA KAPLYA", 2, 353, "CC", "", "finished", None, [
        {"heat_number": 4, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 18, 18, 18, 19], "sum": 89}, {"judge_number": 2, "scores": [18, 17, 18, 19, 18], "sum": 90}], "total": 179},
        {"heat_number": 15, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 17, 18], "sum": 88}, {"judge_number": 2, "scores": [17, 18, 17, 17, 17], "sum": 86}], "total": 174}
    ]),
    (6, "Ирландский терьер", "Ирландский терьер - Стандартный - Кобель", "Кобель", "НЕЖНОЕ ПЛАМЯ ЩЕДВИН ВОИН СЕВЕРА", "NEZHNOYE PLAMYA SCHEDVIN VOIN SEVERA", 3, 347, "CC", "", "finished", None, [
        {"heat_number": 5, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 16, 19, 19], "sum": 88}, {"judge_number": 2, "scores": [17, 18, 17, 17, 18], "sum": 87}], "total": 175},
        {"heat_number": 15, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [17, 17, 18, 16, 14], "sum": 82}], "total": 172}
    ]),
    (7, "Ирландский терьер", "Ирландский терьер - Стандартный - Кобель", "Кобель", "БЕСЦЕННЫЙ ПОДАРОК ИЗ ДОМА АЛАНТЕС", "BESCENNYJ PODAROK IZ DOMA ALANTES", 4, 346, "CC", "", "finished", None, [
        {"heat_number": 5, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 18, 19, 19], "sum": 90}, {"judge_number": 2, "scores": [16, 16, 16, 16, 17], "sum": 81}], "total": 171},
        {"heat_number": 14, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [17, 17, 18, 16, 17], "sum": 85}], "total": 175}
    ]),

    # 5. Метис_Стандартный_Общая
    (14, "Метис", "Метис - Стандартный - Сука", "Сука", "КНОПА", "KNOPA", 1, 369, "CC", "", "finished", None, [
        {"heat_number": 8, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [19, 19, 20, 20, 20], "sum": 98}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 189},
        {"heat_number": 17, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 19], "sum": 91}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 180}
    ]),
    (11, "Метис", "Метис - Стандартный - Кобель", "Кобель", "ПЁС", "PES", 2, 362, "CC", "", "finished", None, [
        {"heat_number": 7, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [19, 19, 18, 19, 19], "sum": 94}, {"judge_number": 2, "scores": [16, 19, 18, 18, 18], "sum": 89}], "total": 183},
        {"heat_number": 16, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 19, 18, 19], "sum": 91}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 179}
    ]),
    (10, "Метис", "Метис - Стандартный - Кобель", "Кобель", "БОНЯ", "BONYA", 3, 344, "CC", "", "finished", None, [
        {"heat_number": 6, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 17, 18, 19, 20], "sum": 92}, {"judge_number": 2, "scores": [17, 17, 17, 15, 16], "sum": 82}], "total": 174},
        {"heat_number": 17, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 18, 17, 18, 18], "sum": 87}, {"judge_number": 2, "scores": [15, 17, 17, 16, 18], "sum": 83}], "total": 170}
    ]),
    (12, "Метис", "Метис - Стандартный - Сука", "Сука", "БРЭЙВ ФАЙТЕРС МИЛК ЭНД ХАНИ", "BRAVE FIGHTER'S MILK AND HONEY", 4, 340, "CC", "", "finished", None, [
        {"heat_number": 6, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 20], "sum": 92}, {"judge_number": 2, "scores": [16, 18, 18, 16, 16], "sum": 84}], "total": 176},
        {"heat_number": 16, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 17, 19], "sum": 89}, {"judge_number": 2, "scores": [13, 18, 16, 13, 15], "sum": 75}], "total": 164}
    ]),
    (13, "Метис", "Метис - Стандартный - Сука", "Сука", "ДЖИНА", "DZHINA", None, None, "", "", "dnf", "Сошёл", [
        {"heat_number": 7, "bib_color": "red", "disqualified": False, "disqualification_reason": "Сошёл"}
    ]),

    # 6. Метис_Юниоры_Кобели
    (15, "Метис", "Метис - Юниоры - Кобель", "Кобель", "БРЭЙВ ФАЙТЕРС ТОРЕТТО", "BRAVE FIGHTER'S TORETTO", 1, 347, "", "", "finished", None, [
        {"heat_number": 9, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [19, 17, 17, 17, 18], "sum": 88}, {"judge_number": 2, "scores": [15, 18, 15, 15, 15], "sum": 78}], "total": 166},
        {"heat_number": 18, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [19, 18, 17, 19, 19], "sum": 92}, {"judge_number": 2, "scores": [18, 17, 18, 18, 18], "sum": 89}], "total": 181}
    ]),

    # 7. Немецкая овчарка д/ш_Стандартный_Суки
    (16, "Немецкая овчарка длинношерстная", "Немецкая овчарка длинношерстная - Стандартный - Сука", "Сука", "ВАМП ОТ АЙРОН ВУД", "VAMP OT AIRON VUD", 1, 343, "CC", "", "finished", None, [
        {"heat_number": 8, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [17, 16, 15, 17, 18], "sum": 83}], "total": 173},
        {"heat_number": 19, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 16, 15, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 17, 17, 18, 18], "sum": 87}], "total": 170}
    ]),

    # 8. Неявившиеся участники
    (8, "Ирландский терьер", "Ирландский терьер - Стандартный - Кобель", "Кобель", "РИЧЛИ РЭД ХЕЙЛ СТОРМ", "RICHLI RED HEYL STORM", None, None, "", "", "absent", "Неявка", [])
]

results = [make_result(i + 1, *r) for i, r in enumerate(results_raw)]

draft = {
    "date_start": "2022-04-17",
    "date_end": "2022-04-17",
    "title": "Чемпионат РКФ по бегам за механической приманкой",
    "full_title": "ЧРКФ по бегам за механической приманкой, 17.04.2022 (Московская обл., Михайловское)",
    "rank_label": "ЧРКФ\n(БЗМП)",
    "rank_code": "ЧРКФ",
    "discipline_code": "coursing",
    "event_type": "coursing",
    "competition_kind": "ЧРКФ",
    "competition_type": "Бега за механической приманкой (курсинг)",
    "host_club": 'МОРОО "Федерация спортивно-прикладного собаководства"',
    "location": "Московская область, деревня Михайловское",
    "judges": "Корепанова Т.В., Вронская О.В.",
    "results": results
}

os.makedirs("data/temp", exist_ok=True)
out_path = "data/temp/draft-2022-04-17_B.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(draft, f, ensure_ascii=False, indent=2)

print(f"Generated draft with {len(results)} participants to {out_path}")
