import json
import os
import re

def make_result(idx, cat_no, breed, breed_class, sex, name_ru, name_lat, placement, total_score, qualification, vc, status, status_reason, heats):
    # Verify math
    if status == 'finished':
        calculated_total = 0
        for h in heats:
            if 'judges' in h:
                j_sum = sum(j['sum'] for j in h['judges'])
                if h.get('penalty_percent'):
                    expected_total = int(round(j_sum * (1 - h['penalty_percent'] / 100)))
                    assert h['total'] == expected_total, f"Penalty total mismatch for {name_ru}: got {h['total']}, expected {expected_total}"
                else:
                    assert h['total'] == j_sum, f"Heat total mismatch for {name_ru}: got {h['total']}, expected {j_sum}"
                for j in h['judges']:
                    assert sum(j['scores']) == j['sum'], f"Judge {j['judge_number']} sum mismatch for {name_ru}: {sum(j['scores'])} vs {j['sum']}"
                calculated_total += h['total']
        assert calculated_total == total_score, f"Grand total mismatch for {name_ru}: {calculated_total} vs {total_score}"

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
    # === Басенджи_Стандартный_Кобели ===
    (None, "Басенджи", "Басенджи - Стандартный - Кобель", "Кобель", "ДЖАНА-ДЖАН ГЕНРИ МОРГАН", "DZHANA-DZHAN GENRI MORGAN", 1, 351, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 1, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 17, 17, 17], "sum": 87}, {"judge_number": 2, "scores": [19, 18, 18, 18, 18], "sum": 91}], "total": 178},
        {"heat_number": 15, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 18], "sum": 85}, {"judge_number": 2, "scores": [18, 17, 18, 18, 17], "sum": 88}], "total": 173}
    ]),
    (2, "Басенджи", "Басенджи - Стандартный - Кобель", "Кобель", "КИЛИМАНДЖАРО КАЙЗЕР", "KILIMANJARO KAISER", 2, 341, "CC", "CACL", "finished", None, [
        {"heat_number": 1, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [18, 17, 18, 18, 17], "sum": 88}], "total": 172},
        {"heat_number": 14, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 16, 17, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 18, 18, 16, 17], "sum": 86}], "total": 169}
    ]),
    (1, "Басенджи", "Басенджи - Стандартный - Кобель", "Кобель", "КАСПЕР ВАН ДИН", "KASPER VAN DEAN", 3, 333, "CC", "", "finished", None, [
        {"heat_number": 2, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 16, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [18, 18, 18, 18, 18], "sum": 90}], "total": 173},
        {"heat_number": 16, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [15, 16, 16, 14, 15], "sum": 76}, {"judge_number": 2, "scores": [17, 17, 17, 16, 17], "sum": 84}], "total": 160}
    ]),
    (None, "Басенджи", "Басенджи - Стандартный - Кобель", "Кобель", "ХАУС ЭЗ РЭЙНБОУ УЗОЧИ ЗИКИМО", "HAUS EZ REINBOU UZOCHI ZIKIMO", 4, 331, "CC", "", "finished", None, [
        {"heat_number": 4, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 17, 16, 17, 14], "sum": 82}, {"judge_number": 2, "scores": [18, 17, 18, 17, 14], "sum": 84}], "total": 166},
        {"heat_number": 15, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 16, 16, 16], "sum": 82}, {"judge_number": 2, "scores": [17, 18, 17, 17, 14], "sum": 83}], "total": 165}
    ]),
    (4, "Басенджи", "Басенджи - Стандартный - Кобель", "Кобель", "БЛЕСК", "BLESK", 5, 331, "CC", "", "finished", None, [
        {"heat_number": 4, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 17, 18, 18], "sum": 88}, {"judge_number": 2, "scores": [16, 17, 17, 15, 18], "sum": 83}], "total": 171},
        {"heat_number": 14, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [15, 14, 15, 16, 15], "sum": 75}, {"judge_number": 2, "scores": [17, 17, 17, 17, 17], "sum": 85}], "total": 160}
    ]),
    (5, "Басенджи", "Басенджи - Стандартный - Кобель", "Кобель", "ДАММАР ГРАНД АСТЕРИОН", "DAMMAR GRAND ASTERION", 6, 324, "CC", "", "finished", None, [
        {"heat_number": 2, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 16, 16, 16, 17], "sum": 81}, {"judge_number": 2, "scores": [18, 17, 17, 18, 17], "sum": 87}], "total": 151, "penalty_percent": 10, "penalty_reason": "Ранний старт (штраф 10% от суммы баллов забега)"},
        {"heat_number": 17, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [18, 18, 17, 18, 18], "sum": 89}], "total": 173}
    ]),
    (3, "Басенджи", "Басенджи - Стандартный - Кобель", "Кобель", "САНРАЙЗ ЛЕЮР АДАМ", "SUNRISE LEUR ADAM", 7, 323, "CC", "", "finished", None, [
        {"heat_number": 3, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 16, 16, 15, 16], "sum": 78}, {"judge_number": 2, "scores": [18, 18, 18, 17, 18], "sum": 89}], "total": 167},
        {"heat_number": 16, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [14, 15, 17, 13, 14], "sum": 73}, {"judge_number": 2, "scores": [16, 17, 17, 16, 17], "sum": 83}], "total": 156}
    ]),

    # === Басенджи_Стандартный_Суки ===
    (10, "Басенджи", "Басенджи - Стандартный - Сука", "Сука", "ШАМИКА ИЗ ДИВНОГО САДА", "SHAMIKA IZ DIVNOGO SADA", 1, 349, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 7, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 17, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 18, 16, 18], "sum": 87}], "total": 176},
        {"heat_number": 19, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [18, 18, 17, 18, 18], "sum": 89}], "total": 173}
    ]),
    (12, "Басенджи", "Басенджи - Стандартный - Сука", "Сука", "ИТУРИ ПАЗЗЛ ВИЛМА", "ITURY PUZZLE VILMA", 2, 341, "CC", "CACL", "finished", None, [
        {"heat_number": 5, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 17, 18], "sum": 88}, {"judge_number": 2, "scores": [17, 17, 18, 17, 17], "sum": 86}], "total": 174},
        {"heat_number": 19, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 16, 17, 16, 17], "sum": 82}, {"judge_number": 2, "scores": [17, 18, 17, 16, 17], "sum": 85}], "total": 167}
    ]),
    (8, "Басенджи", "Басенджи - Стандартный - Сука", "Сука", "ОЛИМПИЯ С КНЯЖЕСКОГО ДВОРА", "OLIMPIA S KNJAZHESKOGO DVORA", 3, 340, "CC", "", "finished", None, [
        {"heat_number": 5, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 18, 19, 18], "sum": 90}], "total": 179},
        {"heat_number": 18, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 16, 17, 15, 16], "sum": 79}, {"judge_number": 2, "scores": [16, 18, 16, 15, 17], "sum": 82}], "total": 161}
    ]),
    (11, "Басенджи", "Басенджи - Стандартный - Сука", "Сука", "СОНЕТА СТАР ИЗ ДИВНОГО САДА", "SONETA STAR IZ DIVNOGO SADA", 4, 336, "CC", "", "finished", None, [
        {"heat_number": 6, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [17, 17, 18, 17, 18], "sum": 87}], "total": 172},
        {"heat_number": 18, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 15, 16], "sum": 81}, {"judge_number": 2, "scores": [16, 17, 17, 16, 17], "sum": 83}], "total": 164}
    ]),
    (9, "Басенджи", "Басенджи - Стандартный - Сука", "Сука", "ПАТИ ГЁРЛ ФОН ГРИЗЗЛИ СТАЙЛ", "PATI GIRL VON GRIZZLY STYLE", None, None, "", "", "disqualified", "Дисквалификация", [
        {"heat_number": 6, "bib_color": "white", "disqualified": True, "disqualification_reason": "Дисквалификация"}
    ]),
    (13, "Басенджи", "Басенджи - Стандартный - Сука", "Сука", "САНРАЙЗ ЛЕЮР ЖОВЕЛЛАНА", "SUNRISE LEUR JOVELLANA", None, None, "", "", "dnf", "Сошёл", [
        {"heat_number": 7, "bib_color": "white", "disqualified": False, "disqualification_reason": "Сошёл"}
    ]),

    # === Басенджи_Юниоры_Суки ===
    (14, "Басенджи", "Басенджи - Юниоры - Сука", "Сука", "ЗЕНДЕЯ ЛЕЯ ФОН ГРИЗЗЛИ СТАЙЛ", "ZENDEYA LEYA VON GRIZZLY STYLE", 1, 348, "", "Лучший юниор", "finished", None, [
        {"heat_number": 8, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [18, 17, 18, 18, 17], "sum": 88}], "total": 177},
        {"heat_number": 20, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 16, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [18, 17, 17, 18, 18], "sum": 88}], "total": 171}
    ]),

    # === Грейхаунд_Стандартный_Кобели ===
    (15, "Грейхаунд", "Грейхаунд - Стандартный - Кобель", "Кобель", "АРТЕФАКТ ЖЮЛЬ ВЕРН", "ARTEFAKT JULE VERNE", 1, 361, "CC", "", "finished", None, [
        {"heat_number": 77, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 19, 19, 19, 19], "sum": 94}, {"judge_number": 2, "scores": [17, 19, 18, 18, 17], "sum": 89}], "total": 183},
        {"heat_number": 89, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 19, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 178}
    ]),
    (16, "Грейхаунд", "Грейхаунд - Стандартный - Кобель", "Кобель", "ФЙОНН КЛАНН ЛОЧ ЛОМОНОД", "FIONN CLANN LOCH LOMOND", 2, 357, "CC", "", "finished", None, [
        {"heat_number": 77, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [19, 19, 19, 20, 20], "sum": 97}, {"judge_number": 2, "scores": [16, 18, 18, 17, 18], "sum": 87}], "total": 184},
        {"heat_number": 89, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 18, 17, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [16, 17, 18, 16, 17], "sum": 84}], "total": 173}
    ]),

    # === Ирландский вольфхаунд_Стандартный_Общая ===
    (17, "Ирландский вольфхаунд", "Ирландский вольфхаунд - Стандартный - Кобель", "Кобель", "БУГИ-ВУГИ ВУ КИЛЛКАПИ", "BOOGIE WOOGIE WOO KILLKAPI", 1, 351, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 78, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 16, 16, 18, 18], "sum": 86}, {"judge_number": 2, "scores": [17, 16, 18, 17, 18], "sum": 86}], "total": 172},
        {"heat_number": 90, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 19, 19], "sum": 92}, {"judge_number": 2, "scores": [17, 18, 17, 17, 18], "sum": 87}], "total": 179}
    ]),
    (19, "Ирландский вольфхаунд", "Ирландский вольфхаунд - Стандартный - Сука", "Сука", "ЕГО ВЕЛИЧЕСТВО УДАЧА ИЗ ВОЛШЕБНОГО ЛЕСА", "EYO VELICHESTVO UDACHA IZ VOLSHEBNOGO LESA", 2, 340, "CC", "CACL", "finished", None, [
        {"heat_number": 79, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [18, 18, 17, 18, 16], "sum": 87}], "total": 171},
        {"heat_number": 90, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 16, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 17, 17, 17, 18], "sum": 86}], "total": 169}
    ]),
    (18, "Ирландский вольфхаунд", "Ирландский вольфхаунд - Стандартный - Сука", "Сука", "ЕЩЕ ОДНА ЛЮБОВЬ ИЗ ВОЛШЕБНОГО ЛЕСА", "ESCHO ODNA LYUBOV IZ VOLSHEBNOGO LESA", 3, 319, "CC", "", "finished", None, [
        {"heat_number": 78, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [14, 14, 13, 13, 14], "sum": 68}, {"judge_number": 2, "scores": [15, 18, 17, 17, 14], "sum": 81}], "total": 149},
        {"heat_number": 90, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [16, 18, 17, 16, 18], "sum": 85}], "total": 170}
    ]),
    (20, "Ирландский вольфхаунд", "Ирландский вольфхаунд - Стандартный - Сука", "Сука", "ХОРОШАЯ ТРАДИЦИЯ ИЗ ВОЛШЕБНОГО ЛЕСА", "HOROSHAYA TRADITSIJA IZ VOLSHEBNOGO LESA", 4, 313, "CC", "", "finished", None, [
        {"heat_number": 79, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 15, 15, 15, 15], "sum": 75}, {"judge_number": 2, "scores": [16, 16, 15, 16, 15], "sum": 78}], "total": 153},
        {"heat_number": 91, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 16, 16, 16, 16], "sum": 80}, {"judge_number": 2, "scores": [15, 17, 16, 15, 17], "sum": 80}], "total": 160}
    ]),

    # === Левретка_Стандартный_Кобели ===
    (21, "Малая итальянская борзая", "Малая итальянская борзая - Стандартный - Кобель", "Кобель", "АЙЛЕНСТИЛЬ ЕВРИСФЕЙ ФОТИС", "AILENSTIL EVRISFEY FOTIS", 1, 356, "CC", "", "finished", None, [
        {"heat_number": 9, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 18, 17, 18], "sum": 86}, {"judge_number": 2, "scores": [18, 20, 19, 17, 19], "sum": 93}], "total": 179},
        {"heat_number": 21, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 17, 17, 17], "sum": 86}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 177}
    ]),
    (22, "Малая итальянская борзая", "Малая итальянская борзая - Стандартный - Кобель", "Кобель", "МАГНИФИКО НЕРО", "MAGNIFICO NERO", 2, 352, "CC", "", "finished", None, [
        {"heat_number": 9, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 18, 16, 18], "sum": 86}, {"judge_number": 2, "scores": [18, 19, 19, 18, 18], "sum": 92}], "total": 178},
        {"heat_number": 21, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 17, 16, 17], "sum": 85}, {"judge_number": 2, "scores": [18, 18, 18, 17, 18], "sum": 89}], "total": 174}
    ]),

    # === Родезийский риджбек_Ветераны_Кобели ===
    (23, "Родезийский риджбек", "Родезийский риджбек - Ветераны - Кобель", "Кобель", "АРИЕС ХАН МАРЛОН БРАНДО", "ARIES KHAN MARLON BRANDO", 1, 346, "CC", "Лучший ветеран", "finished", None, [
        {"heat_number": 105, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 19, 19], "sum": 91}, {"judge_number": 2, "scores": [18, 17, 17, 17, 18], "sum": 87}], "total": 178},
        {"heat_number": 118, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 18, 18, 18, 18], "sum": 88}, {"judge_number": 2, "scores": [15, 18, 16, 15, 16], "sum": 80}], "total": 168}
    ]),

    # === Родезийский риджбек_Стандартный_Кобели ===
    (26, "Родезийский риджбек", "Родезийский риджбек - Стандартный - Кобель", "Кобель", "АРИЕС ХАН РЕГУЛУС РЭДКЛИФФ", "ARIES KHAN REGULUS RADCLIFFE", 1, 357, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 101, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 19, 19], "sum": 92}, {"judge_number": 2, "scores": [18, 18, 18, 18, 18], "sum": 90}], "total": 182},
        {"heat_number": 114, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 19, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [16, 18, 17, 16, 18], "sum": 85}], "total": 175}
    ]),
    (24, "Родезийский риджбек", "Родезийский риджбек - Стандартный - Кобель", "Кобель", "GAKERU ABUBAKAR", "GAKERU ABUBAKAR", 2, 350, "CC", "CACL", "finished", None, [
        {"heat_number": 100, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 18, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [17, 17, 17, 17, 18], "sum": 86}], "total": 171},
        {"heat_number": 115, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [18, 18, 18, 17, 18], "sum": 89}], "total": 179}
    ]),
    (27, "Родезийский риджбек", "Родезийский риджбек - Стандартный - Кобель", "Кобель", "СОЛАР СПИРИТ АМОН-РА", "SOLAR SPIRIT AMON-RA", 3, 344, "CC", "", "finished", None, [
        {"heat_number": 100, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 16, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [18, 17, 18, 17, 17], "sum": 87}], "total": 171},
        {"heat_number": 114, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 16, 18, 18], "sum": 87}, {"judge_number": 2, "scores": [17, 17, 18, 17, 17], "sum": 86}], "total": 173}
    ]),
    (25, "Родезийский риджбек", "Родезийский риджбек - Стандартный - Кобель", "Кобель", "ДЖЕЛАНИ РЕД ТРОЙ", "JELANY RED TROY", 4, 326, "CC", "", "finished", None, [
        {"heat_number": 102, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 16, 16, 17, 17], "sum": 81}, {"judge_number": 2, "scores": [17, 17, 17, 16, 17], "sum": 84}], "total": 165},
        {"heat_number": 113, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [15, 14, 15, 16, 16], "sum": 76}, {"judge_number": 2, "scores": [17, 17, 17, 17, 17], "sum": 85}], "total": 161}
    ]),
    (28, "Родезийский риджбек", "Родезийский риджбек - Стандартный - Кобель", "Кобель", "ТИНА ТРЕЙДИНГ ГРЕММИ ГОЛЬФ", "TINA TREYDING GREMMI GOLF", None, 173, "", "", "dnf", "Сошёл", [
        {"heat_number": 101, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [17, 17, 17, 16, 16], "sum": 83}], "total": 173},
        {"heat_number": 113, "bib_color": "red", "disqualified": False, "disqualification_reason": "Сошёл"}
    ]),

    # === Родезийский риджбек_Стандартный_Суки ===
    (31, "Родезийский риджбек", "Родезийский риджбек - Стандартный - Сука", "Сука", "СОЛАР СПИРИТ АНДРОМЕДА", "SOLAR SPIRIT ANDROMEDA", 1, 355, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 104, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 178},
        {"heat_number": 116, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 17, 17, 18], "sum": 87}, {"judge_number": 2, "scores": [17, 19, 18, 18, 18], "sum": 90}], "total": 177}
    ]),
    (29, "Родезийский риджбек", "Родезийский риджбек - Стандартный - Сука", "Сука", "МАЕНДЕЛЕО ХОЛИ ЛАРА КРОФТ АРИЕС ХАН", "MAENDELEO HOLY LARA CROFT ARIES KHAN", 2, 350, "CC", "CACL", "finished", None, [
        {"heat_number": 103, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 17, 17, 15, 17], "sum": 83}], "total": 172},
        {"heat_number": 117, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [19, 17, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 178}
    ]),
    (30, "Родезийский риджбек", "Родезийский риджбек - Стандартный - Сука", "Сука", "ПОДАРОК ИЗ АФРИКИ РАМЛА РУКУРУ", "PODAROK IS AFRIKI RAMLA RUKURU", 3, 331, "CC", "", "finished", None, [
        {"heat_number": 103, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 16, 16, 17, 16], "sum": 81}, {"judge_number": 2, "scores": [16, 16, 17, 17, 17], "sum": 83}], "total": 164},
        {"heat_number": 116, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 16, 15, 17, 17], "sum": 81}, {"judge_number": 2, "scores": [16, 18, 18, 17, 17], "sum": 86}], "total": 167}
    ]),

    # === Родезийский риджбек_Юниоры_Кобели ===
    (33, "Родезийский риджбек", "Родезийский риджбек - Юниоры - Кобель", "Кобель", "ГРАНД КОРТЕЖ РОМУЛ РЕКС", "GRAND CORTEGE ROMUL REKS", 1, 352, "", "Лучший юниор", "finished", None, [
        {"heat_number": 106, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 18, 18], "sum": 87}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 178},
        {"heat_number": 119, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [19, 19, 19, 19, 19], "sum": 95}, {"judge_number": 2, "scores": [14, 18, 16, 15, 16], "sum": 79}], "total": 174}
    ]),

    # === Русская псовая борзая_Стандартный_Кобели ===
    (36, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Кобель", "Кобель", "ДОРОГОЙ ДРУГ ФАРТОВЫЙ", "DOROGOY DRUG FARTOVYY", 1, 358, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 81, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 19, 18, 18, 18], "sum": 90}], "total": 179},
        {"heat_number": 92, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [18, 19, 18, 17, 18], "sum": 90}], "total": 179}
    ]),
    (34, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Кобель", "Кобель", "КОНЗА ЛАЙТ ДОТ КОМ", "KONZA LYTHE DOT COM", 2, 353, "CC", "CACL", "finished", None, [
        {"heat_number": 80, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 18, 18, 19], "sum": 89}, {"judge_number": 2, "scores": [17, 17, 18, 18, 17], "sum": 87}], "total": 176},
        {"heat_number": 92, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 18, 17, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 177}
    ]),
    (37, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Кобель", "Кобель", "КАВАЛЛЬЕРИК ФАКТОУМ", "KAVALL'ERIK FAKTOUM", 3, 353, "CC", "", "finished", None, [
        {"heat_number": 80, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 18, 19, 19], "sum": 91}, {"judge_number": 2, "scores": [16, 18, 18, 16, 17], "sum": 85}], "total": 176},
        {"heat_number": 93, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 18, 18], "sum": 87}, {"judge_number": 2, "scores": [17, 19, 18, 18, 18], "sum": 90}], "total": 177}
    ]),
    (35, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Кобель", "Кобель", "ОБЕРЕГ РУСИ АЛЕКСАНДРИТ", "OBEREG RUSI ALEKSANDRIT", 4, 316, "CC", "", "finished", None, [
        {"heat_number": 81, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 15, 16, 15, 15], "sum": 77}, {"judge_number": 2, "scores": [17, 17, 18, 16, 15], "sum": 83}], "total": 160},
        {"heat_number": 93, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 16, 15, 15, 15], "sum": 77}, {"judge_number": 2, "scores": [16, 17, 16, 15, 15], "sum": 79}], "total": 156}
    ]),

    # === Русская псовая борзая_Стандартный_Суки ===
    (41, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Сука", "Сука", "ВАСИЛИСА", "VASILISA", 1, 364, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 83, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 18, 17, 17], "sum": 87}], "total": 176},
        {"heat_number": 95, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [19, 19, 19, 20, 20], "sum": 97}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 188}
    ]),
    (44, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Сука", "Сука", "ПРИ-ЧУДА", "PRI-CHUDA", 2, 362, "CC", "CACL", "finished", None, [
        {"heat_number": 82, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [18, 19, 18, 18, 19], "sum": 92}], "total": 182},
        {"heat_number": 96, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 180}
    ]),
    (39, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Сука", "Сука", "ЛУННАЯ РАДУГА РОССИЯ", "LUNNAJA RADUGA ROSSIYA", 3, 335, "CC", "", "finished", None, [
        {"heat_number": 82, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [17, 18, 17, 17, 16], "sum": 85}], "total": 169},
        {"heat_number": 95, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 16, 16], "sum": 82}, {"judge_number": 2, "scores": [16, 18, 17, 16, 17], "sum": 84}], "total": 166}
    ]),
    (42, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Сука", "Сука", "ЗВЕЗДНАЯ РАДУГА ЛОРЕЛЕЯ", "ZVEZDNAYA RADUGA LORELEYA", 4, 317, "CC", "", "finished", None, [
        {"heat_number": 84, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 18], "sum": 86}, {"judge_number": 2, "scores": [17, 17, 18, 17, 19], "sum": 88}], "total": 174},
        {"heat_number": 96, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [13, 14, 14, 14, 14], "sum": 69}, {"judge_number": 2, "scores": [14, 17, 16, 13, 14], "sum": 74}], "total": 143}
    ]),
    (40, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Сука", "Сука", "ОБЕРЕГ РУСИ БЕГУЩАЯ ПО ВОЛНАМ", "OBEREG RUSI BEGUSCHAYA PO VOLNAM", None, 183, "", "", "disqualified", "Дисквалификация", [
        {"heat_number": 85, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [19, 19, 19, 19, 19], "sum": 95}, {"judge_number": 2, "scores": [17, 17, 18, 18, 18], "sum": 88}], "total": 183},
        {"heat_number": 94, "bib_color": "white", "disqualified": True, "disqualification_reason": "Дисквалификация"}
    ]),
    (43, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Сука", "Сука", "ПЕРМЬ ВЕЛИКАЯ ЯГОДА МАЛИНА", "PERM' VELIKAYA YAGODA MALINA", None, 160, "", "", "withdrawn", "Снят", [
        {"heat_number": 83, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 16, 15, 15, 15], "sum": 76}, {"judge_number": 2, "scores": [16, 17, 18, 16, 17], "sum": 84}], "total": 160},
        {"heat_number": 94, "bib_color": "red", "disqualified": False, "disqualification_reason": "Снят"}
    ]),
    (38, "Русская псовая борзая", "Русская псовая борзая - Стандартный - Сука", "Сука", "КОНЗА ЛАЙТ ДЕКЛАССИФАЙД", "KONZA LYTHE DECLASSIFIED", None, None, "", "", "disqualified", "Дисквалификация", [
        {"heat_number": 84, "bib_color": "white", "disqualified": True, "disqualification_reason": "Дисквалификация"}
    ]),

    # === Русская псовая борзая_Юниоры_Суки ===
    (46, "Русская псовая борзая", "Русская псовая борзая - Юниоры - Сука", "Сука", "НАГАЙКА", "NAGAYKA", 1, 355, "", "Лучший юниор", "finished", None, [
        {"heat_number": 86, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 19, 19, 18, 18], "sum": 92}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 183},
        {"heat_number": 97, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 16, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [18, 18, 17, 18, 18], "sum": 89}], "total": 172}
    ]),

    # === Салюки_Стандартный_Общая ===
    (47, "Салюки", "Салюки - Стандартный - Кобель", "Кобель", "СЭЛГРЕЙС ПРОДИДЖИ", "SALGREY'S PRODIGY", 1, 363, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 87, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 19, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 181},
        {"heat_number": 99, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [18, 19, 18, 18, 19], "sum": 92}], "total": 182}
    ]),
    (49, "Салюки", "Салюки - Стандартный - Сука", "Сука", "АЛЬ НАФИСЭХ ХАЙФА", "AL NAFISEH HAIFA", 2, 360, "CC", "CACL", "finished", None, [
        {"heat_number": 87, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 19, 19, 19, 19], "sum": 94}, {"judge_number": 2, "scores": [17, 18, 18, 18, 17], "sum": 88}], "total": 182},
        {"heat_number": 99, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 17, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 178}
    ]),
    (48, "Салюки", "Салюки - Стандартный - Сука", "Сука", "АЛЬ НАФИСЭХ ХИБА", "AL NAFISEH HIBA", 3, 352, "CC", "", "finished", None, [
        {"heat_number": 88, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 177},
        {"heat_number": 98, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [16, 17, 18, 17, 18], "sum": 86}], "total": 175}
    ]),

    # === Тайский риджбек_Стандартный_Суки ===
    (51, "Тайский риджбек", "Тайский риджбек - Стандартный - Сука", "Сука", "СИАММ ВЕЛЛ ФАР ИСТ АКСЕЛЬ", "SIAMM WELL FAR EAST AKSEL", 1, 352, "CC", "", "finished", None, [
        {"heat_number": 107, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 18, 18], "sum": 88}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 176},
        {"heat_number": 120, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 16, 18, 18], "sum": 85}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 176}
    ]),
    (50, "Тайский риджбек", "Тайский риджбек - Стандартный - Сука", "Сука", "G-MINI FASHION LITTLE BLUE QUEEN MY DEAR FRIENDS", "G-MINI FASHION LITTLE BLUE QUEEN MY DEAR FRIENDS", 2, 311, "CC", "", "finished", None, [
        {"heat_number": 107, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [13, 13, 13, 15, 15], "sum": 69}, {"judge_number": 2, "scores": [10, 17, 15, 13, 15], "sum": 70}], "total": 139},
        {"heat_number": 120, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 19, 19], "sum": 92}, {"judge_number": 2, "scores": [16, 17, 15, 17, 15], "sum": 80}], "total": 172}
    ]),

    # === Уиппет_Ветераны_Суки ===
    (71, "Уиппет", "Уиппет - Ветераны - Сука", "Сука", "НИФТИ РЕЙСИНГ ГЕРЛ", "NIFTY RACING GIRL", 1, 336, "CC", "Лучший ветеран", "finished", None, [
        {"heat_number": 26, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 16, 17, 17, 17], "sum": 82}, {"judge_number": 2, "scores": [16, 17, 18, 16, 18], "sum": 85}], "total": 167},
        {"heat_number": 38, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 16, 16, 16, 17], "sum": 81}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 169}
    ]),

    # === Уиппет_Стандартный_Кобели ===
    (83, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "ТАТЬЯНИН ДЕНЬ ИНКИ", "TATYANIN DEN INKY", 1, 357, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 58, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [17, 18, 17, 18, 18], "sum": 88}], "total": 178},
        {"heat_number": 72, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 19, 18, 18, 18], "sum": 91}, {"judge_number": 2, "scores": [17, 18, 18, 18, 17], "sum": 88}], "total": 179}
    ]),
    (72, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "АНТРАКС ГОУ-БАЙ", "ANTHRAX GO-BYE", 2, 353, "CC", "CACL", "finished", None, [
        {"heat_number": 60, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 173},
        {"heat_number": 74, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 19], "sum": 91}, {"judge_number": 2, "scores": [18, 18, 18, 17, 18], "sum": 89}], "total": 180}
    ]),
    (75, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "ГАЙ", "GUY", 3, 351, "CC", "", "finished", None, [
        {"heat_number": 57, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 18, 19], "sum": 88}, {"judge_number": 2, "scores": [18, 18, 18, 18, 18], "sum": 90}], "total": 178},
        {"heat_number": 72, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 16, 17], "sum": 83}, {"judge_number": 2, "scores": [18, 19, 18, 17, 18], "sum": 90}], "total": 173}
    ]),
    (84, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "ВАЛПАЙН ПЭК ДАРЛИНГ ОФ ФОРТЬЮН", "VALPAIN PEK DARLING OF FORTUNE", 4, 349, "CC", "", "finished", None, [
        {"heat_number": 56, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 19, 20], "sum": 90}, {"judge_number": 2, "scores": [16, 18, 18, 17, 17], "sum": 86}], "total": 176},
        {"heat_number": 70, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 173}
    ]),
    (82, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "СТРОНГ СТОУТ", "STRONG STOAT", 5, 349, "CC", "", "finished", None, [
        {"heat_number": 56, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 19, 20], "sum": 90}, {"judge_number": 2, "scores": [17, 19, 18, 18, 18], "sum": 90}], "total": 180},
        {"heat_number": 73, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 18, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [16, 18, 18, 15, 17], "sum": 84}], "total": 169}
    ]),
    (85, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "ДЖИНИ ЛАМБОР", "JINI LAMBOR", 6, 348, "CC", "", "finished", None, [
        {"heat_number": 59, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 172},
        {"heat_number": 73, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 18, 16, 18], "sum": 87}], "total": 176}
    ]),
    (80, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "СТАНГЕРС ЛЭНД БАРСТ", "STANGERS LAND BARST", 7, 342, "CC", "", "finished", None, [
        {"heat_number": 59, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 16, 17], "sum": 84}, {"judge_number": 2, "scores": [16, 18, 18, 18, 18], "sum": 88}], "total": 172},
        {"heat_number": 71, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [15, 16, 16, 16, 17], "sum": 80}, {"judge_number": 2, "scores": [18, 18, 18, 18, 18], "sum": 90}], "total": 170}
    ]),
    (81, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "СТАНГЕРС ЛЭНД БЛЭКТОРН ВИНТЕР", "STANGERS LAND BLACKTHORNE WINTER", 8, 341, "CC", "", "finished", None, [
        {"heat_number": 61, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 16, 17, 16, 16], "sum": 80}, {"judge_number": 2, "scores": [16, 18, 18, 17, 18], "sum": 87}], "total": 167},
        {"heat_number": 70, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 18, 18, 17, 17], "sum": 86}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 174}
    ]),
    (74, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "БРИЛЛИАНТ ФЛЭШ", "BRILLIANT FLASH", 9, 338, "CC", "", "finished", None, [
        {"heat_number": 60, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 18, 17], "sum": 85}, {"judge_number": 2, "scores": [16, 17, 18, 17, 17], "sum": 85}], "total": 170},
        {"heat_number": 72, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 16, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 18, 17, 16, 17], "sum": 85}], "total": 168}
    ]),
    (73, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "БЛЮ ВИНД ОФ ТРИУМФ", "BLUE WIND OF TRIUMPH", 10, 336, "CC", "", "finished", None, [
        {"heat_number": 61, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 18], "sum": 86}, {"judge_number": 2, "scores": [16, 19, 18, 18, 18], "sum": 89}], "total": 175},
        {"heat_number": 75, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 16, 15, 15], "sum": 80}, {"judge_number": 2, "scores": [15, 18, 17, 17, 14], "sum": 81}], "total": 161}
    ]),
    (78, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "МЛЕЧНЫЙ ПУТЬ ИЗ ПОЛЕТА МЕЧТЫ", "MLECHNYY PUT IZ POLETA MECHTI", 11, 331, "CC", "", "finished", None, [
        {"heat_number": 58, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [15, 15, 17, 14, 16], "sum": 77}, {"judge_number": 2, "scores": [15, 17, 16, 15, 17], "sum": 80}], "total": 157},
        {"heat_number": 75, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [16, 17, 17, 16, 18], "sum": 84}], "total": 174}
    ]),
    (79, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "РАЙДЕР ОФ РОХАН БРОДВИНЕК", "RIDER OF ROHAN BRODWINEK", 12, 330, "CC", "", "finished", None, [
        {"heat_number": 57, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 16, 16, 16, 17], "sum": 80}, {"judge_number": 2, "scores": [16, 18, 18, 16, 18], "sum": 86}], "total": 166},
        {"heat_number": 71, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 15, 15, 16, 17], "sum": 78}, {"judge_number": 2, "scores": [17, 17, 18, 16, 18], "sum": 86}], "total": 164}
    ]),
    (77, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "ЛАВИНГ БРИЗ ОЛИВЕР", "LAVING BRIZ OLIVER", 13, 329, "CC", "", "finished", None, [
        {"heat_number": 62, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 17, 17, 18], "sum": 87}], "total": 172},
        {"heat_number": 74, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [15, 16, 15, 15, 15], "sum": 76}, {"judge_number": 2, "scores": [16, 17, 17, 15, 16], "sum": 81}], "total": 157}
    ]),
    (76, "Уиппет", "Уиппет - Стандартный - Кобель", "Кобель", "КУЛИКОВО ПОЛЕ ВИНТАЖ", "KULIKOVO POLE VINTAGE", 14, 316, "CC", "", "finished", None, [
        {"heat_number": 62, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 16, 16, 16, 15], "sum": 79}, {"judge_number": 2, "scores": [18, 18, 18, 17, 17], "sum": 88}], "total": 167},
        {"heat_number": 73, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [13, 13, 13, 13, 13], "sum": 65}, {"judge_number": 2, "scores": [15, 18, 18, 16, 17], "sum": 84}], "total": 149}
    ]),

    # === Уиппет_Стандартный_Суки ===
    (101, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "АКОКА ТАХО", "ACOKA TAHO", 1, 354, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 31, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [18, 17, 17, 18, 18], "sum": 88}], "total": 177},
        {"heat_number": 44, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 18, 18, 18, 17], "sum": 87}, {"judge_number": 2, "scores": [18, 18, 18, 18, 18], "sum": 90}], "total": 177}
    ]),
    (90, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "ГАРДА", "GARDA", 2, 353, "CC", "CACL", "finished", None, [
        {"heat_number": 34, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [18, 19, 18, 16, 18], "sum": 89}], "total": 179},
        {"heat_number": 47, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 18], "sum": 86}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 174}
    ]),
    (99, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "СТАНГЕРС ЛЭНД ВАЛЬДИВИЯ", "STANGERS LAND VALDIVIA", 3, 351, "CC", "", "finished", None, [
        {"heat_number": 29, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 17, 17], "sum": 86}, {"judge_number": 2, "scores": [18, 18, 18, 18, 18], "sum": 90}], "total": 176},
        {"heat_number": 45, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 18, 18, 19], "sum": 90}], "total": 175}
    ]),
    (88, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "ДЕНСИ МИДНАЙТ САН", "DENSI MIDNIGHT SUN", 4, 350, "CC", "", "finished", None, [
        {"heat_number": 29, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 178},
        {"heat_number": 39, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 18, 16], "sum": 84}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 172}
    ]),
    (106, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "СТИЛАР ХАРЛИ КВИНН", "STILAR HARLI KVINN", 5, 349, "CC", "", "finished", None, [
        {"heat_number": 37, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 17, 17, 17], "sum": 86}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 175},
        {"heat_number": 46, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 17, 17], "sum": 86}, {"judge_number": 2, "scores": [18, 17, 18, 17, 18], "sum": 88}], "total": 174}
    ]),
    (92, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "ЛАВИНГ БРИЗ ПЕЛАГЕЯ", "LAVING BRIZ PELAGEA", 6, 348, "CC", "", "finished", None, [
        {"heat_number": 30, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 16, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 17, 18, 17, 18], "sum": 87}], "total": 170},
        {"heat_number": 40, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 17, 18], "sum": 87}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 178}
    ]),
    (105, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "СТАНГЕРС ЛАНД ВАЛЕНСИЯ", "STANGERS LAND VALENSIYA", 7, 348, "CC", "", "finished", None, [
        {"heat_number": 33, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 18, 16], "sum": 86}, {"judge_number": 2, "scores": [17, 18, 18, 18, 17], "sum": 88}], "total": 174},
        {"heat_number": 43, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 18], "sum": 86}, {"judge_number": 2, "scores": [18, 18, 17, 17, 18], "sum": 88}], "total": 174}
    ]),
    (97, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "СТАНГЕРС ЛЭНД БРАТИСЛАВА", "STANGERS LAND BRATISLAVA", 8, 347, "CC", "", "finished", None, [
        {"heat_number": 28, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 18], "sum": 86}, {"judge_number": 2, "scores": [17, 18, 18, 17, 17], "sum": 87}], "total": 173},
        {"heat_number": 41, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 16, 17, 18], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 174}
    ]),
    (94, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "СИЛЬВЕР СЕЙБЛ", "SILVER SABLE", 9, 346, "CC", "", "finished", None, [
        {"heat_number": 31, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 18, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 18, 16, 18], "sum": 87}], "total": 172},
        {"heat_number": 46, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 18, 17], "sum": 86}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 174}
    ]),
    (86, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "АКВАРЕЛА ДЕЛЬ РИО ДРАГОНФЛАЙ", "ACUARELA DEL'RIO DRAGONFLY", 10, 345, "CC", "", "finished", None, [
        {"heat_number": 36, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [18, 18, 18, 16, 18], "sum": 88}], "total": 173},
        {"heat_number": 47, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 17, 18], "sum": 87}, {"judge_number": 2, "scores": [17, 17, 17, 17, 17], "sum": 85}], "total": 172}
    ]),
    (93, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "РУССКИЙ ПАРК ЕДИНСТВЕННАЯ ЛЕДИ", "RUSSKI PARK EDINSTVENNAYA LADY", 11, 344, "CC", "", "finished", None, [
        {"heat_number": 30, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 17, 18], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 18, 17, 17], "sum": 87}], "total": 172},
        {"heat_number": 39, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 18, 18], "sum": 87}, {"judge_number": 2, "scores": [17, 18, 17, 16, 17], "sum": 85}], "total": 172}
    ]),
    (108, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "ФЭЙРИ ТЕЙЛ", "FAIRY TALE", 12, 342, "CC", "", "finished", None, [
        {"heat_number": 36, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 16, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 17, 18, 17, 18], "sum": 87}], "total": 170},
        {"heat_number": 44, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 18, 17], "sum": 87}, {"judge_number": 2, "scores": [17, 16, 17, 17, 18], "sum": 85}], "total": 172}
    ]),
    (91, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "ХОРЛЕНДС ИНТЕРНАЛ ЭНЕРДЖИ", "HORLEND'S INTERNAL ENERGY", 13, 342, "CC", "", "finished", None, [
        {"heat_number": 34, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 17, 17, 17], "sum": 86}, {"judge_number": 2, "scores": [18, 18, 18, 16, 17], "sum": 87}], "total": 173},
        {"heat_number": 45, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [17, 18, 17, 16, 17], "sum": 85}], "total": 169}
    ]),
    (95, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "СНОУ СВОЛЛОУ", "SNOW SWALLOW", 14, 341, "CC", "", "finished", None, [
        {"heat_number": 32, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [15, 16, 17, 16, 16], "sum": 80}, {"judge_number": 2, "scores": [17, 19, 18, 17, 18], "sum": 89}], "total": 169},
        {"heat_number": 43, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 16, 18, 17], "sum": 84}, {"judge_number": 2, "scores": [18, 19, 17, 16, 18], "sum": 88}], "total": 172}
    ]),
    (98, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "СТАНГЕРС ЛАНД БРИЗА", "STANGERS LAND BRIZA", 15, 341, "CC", "", "finished", None, [
        {"heat_number": 28, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 18, 17, 16], "sum": 85}, {"judge_number": 2, "scores": [16, 18, 17, 16, 18], "sum": 85}], "total": 170},
        {"heat_number": 42, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 17, 17], "sum": 86}, {"judge_number": 2, "scores": [16, 17, 18, 16, 18], "sum": 85}], "total": 171}
    ]),
    (103, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "КОЛОМБИНА ИЗ КОРОЛЕВСТВА АННЫ", "KOLOMBINA IZ KOROLEVSTVA ANNY", 16, 340, "CC", "", "finished", None, [
        {"heat_number": 35, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 18, 16, 16, 18], "sum": 85}, {"judge_number": 2, "scores": [17, 17, 18, 17, 18], "sum": 87}], "total": 172},
        {"heat_number": 41, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 15, 15, 16, 16], "sum": 78}, {"judge_number": 2, "scores": [18, 19, 18, 17, 18], "sum": 90}], "total": 168}
    ]),
    (96, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "СТАНГЕРС ЛЭНД АЛКИОНА", "STANGERS LAND ALKIONA", 17, 340, "CC", "", "finished", None, [
        {"heat_number": 35, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 17, 18], "sum": 87}, {"judge_number": 2, "scores": [16, 18, 18, 18, 18], "sum": 88}], "total": 175},
        {"heat_number": 39, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 15, 16, 16, 17], "sum": 79}, {"judge_number": 2, "scores": [16, 18, 17, 18, 17], "sum": 86}], "total": 165}
    ]),
    (100, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "ВАЛПАЙН ПЭК ДЕЙЗИ ДОЛЛ", "VALPAIN PEK DAISY DOLL", 18, 338, "CC", "", "finished", None, [
        {"heat_number": 29, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 16, 17, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [16, 19, 17, 16, 18], "sum": 86}], "total": 169},
        {"heat_number": 42, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [15, 17, 17, 15, 16], "sum": 80}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 169}
    ]),
    (89, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "ДЕРА БЛЮ", "DERA BLUE", 19, 337, "CC", "", "finished", None, [
        {"heat_number": 32, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 18, 17], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 18, 16, 18], "sum": 87}], "total": 172},
        {"heat_number": 40, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 16, 15, 15, 15], "sum": 77}, {"judge_number": 2, "scores": [17, 18, 18, 18, 17], "sum": 88}], "total": 165}
    ]),
    (107, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "ТАТЬЯНИН ДЕНЬ ИГРУШКА", "TATYANIN DEN IGRUSHKA", 20, 331, "CC", "", "finished", None, [
        {"heat_number": 37, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 16, 16, 16, 16], "sum": 80}, {"judge_number": 2, "scores": [15, 17, 16, 15, 17], "sum": 80}], "total": 160},
        {"heat_number": 39, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 16, 17, 18], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 17, 17, 17], "sum": 86}], "total": 171}
    ]),

    # === Уиппет_Стандартный-спринтеры_Кобели ===
    (64, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "КУЛИКОВО ПОЛЕ ГЕРМЕС", "KULIKOVO POLE GERMES", 1, 354, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 52, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [17, 19, 18, 18, 18], "sum": 90}], "total": 180},
        {"heat_number": 66, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 18, 18], "sum": 86}, {"judge_number": 2, "scores": [18, 17, 18, 18, 17], "sum": 88}], "total": 174}
    ]),
    (52, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "ЭМБЕР ВЕЙВ`С МАРИУС", "AMBER VEIV'S MARIUS", 2, 353, "CC", "CACL", "finished", None, [
        {"heat_number": 54, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 17, 17], "sum": 88}, {"judge_number": 2, "scores": [17, 17, 18, 17, 18], "sum": 87}], "total": 175},
        {"heat_number": 63, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 17, 18, 19], "sum": 89}, {"judge_number": 2, "scores": [18, 18, 18, 17, 18], "sum": 89}], "total": 178}
    ]),
    (63, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "КЕТЛИН РУТГЕР", "KETLIN RUTGER", 3, 353, "CC", "", "finished", None, [
        {"heat_number": 51, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [18, 19, 18, 18, 18], "sum": 91}], "total": 181},
        {"heat_number": 65, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 18, 17, 17, 18], "sum": 86}, {"judge_number": 2, "scores": [17, 18, 17, 17, 17], "sum": 86}], "total": 172}
    ]),
    (56, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "ИСТОРИЯ ЛЮБВИ СУПРИМ ЛАВ", "ISTORIYA LUBVI SUPREME LOVE", 4, 346, "CC", "", "finished", None, [
        {"heat_number": 53, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 18, 17, 16, 16], "sum": 83}, {"judge_number": 2, "scores": [18, 18, 18, 18, 18], "sum": 90}], "total": 173},
        {"heat_number": 65, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 17, 18], "sum": 89}, {"judge_number": 2, "scores": [16, 18, 17, 16, 17], "sum": 84}], "total": 173}
    ]),
    (58, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "ВАЛПАЙН ПЭК ДИКТУМ ФАКТУМ", "VALPAIN PEK DICTUM FACTUM", 5, 344, "CC", "", "finished", None, [
        {"heat_number": 52, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 18, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 18, 16, 16], "sum": 85}], "total": 170},
        {"heat_number": 69, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 18, 18], "sum": 88}, {"judge_number": 2, "scores": [18, 18, 18, 16, 16], "sum": 86}], "total": 174}
    ]),
    (55, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "ДОН КОРЛЕОНЕ", "DON CORLEONE", 6, 343, "CC", "", "finished", None, [
        {"heat_number": 49, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 16, 16, 17], "sum": 82}, {"judge_number": 2, "scores": [17, 17, 18, 17, 18], "sum": 87}], "total": 169},
        {"heat_number": 67, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 19], "sum": 87}, {"judge_number": 2, "scores": [16, 18, 18, 18, 17], "sum": 87}], "total": 174}
    ]),
    (53, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "БЭТМАН НАЙТ ШЭДОУ", "BATMAN NIGHT SHADOW", 7, 342, "CC", "", "finished", None, [
        {"heat_number": 53, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [16, 18, 17, 15, 18], "sum": 84}], "total": 173},
        {"heat_number": 64, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 17, 18], "sum": 85}, {"judge_number": 2, "scores": [16, 17, 18, 16, 17], "sum": 84}], "total": 169}
    ]),
    (62, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "ИСТОРИЯ ЛЮБВИ ЭВР БЫСТРЫЙ", "ISTORIYA LUBVI EVR BYSTRYY", 8, 342, "CC", "", "finished", None, [
        {"heat_number": 51, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 17, 18], "sum": 88}, {"judge_number": 2, "scores": [16, 18, 18, 16, 18], "sum": 86}], "total": 174},
        {"heat_number": 64, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [16, 18, 18, 15, 17], "sum": 84}], "total": 168}
    ]),
    (59, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "ВАЛПАЙН ПЭК ДИРЕКТ ХИТ", "VALPAIN PEK DIRECT HIT", 9, 341, "CC", "", "finished", None, [
        {"heat_number": 50, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 16, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 18, 18, 18, 17], "sum": 88}], "total": 171},
        {"heat_number": 68, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 16, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 18, 17, 17, 18], "sum": 87}], "total": 170}
    ]),
    (57, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "ЛАКШЕРИ ВИПП ТАЗЕР", "LUXURY WHIPP TAZER", 10, 339, "CC", "", "finished", None, [
        {"heat_number": 50, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 16, 17, 15, 16], "sum": 80}, {"judge_number": 2, "scores": [18, 17, 18, 17, 18], "sum": 88}], "total": 168},
        {"heat_number": 67, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 17, 16, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 171}
    ]),
    (65, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "СУРСКИЙ СУВЕНИР ЯСТРЕБ", "SURSKIY SUVENIR YASTREB", 11, 334, "CC", "", "finished", None, [
        {"heat_number": 49, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 15, 17], "sum": 83}, {"judge_number": 2, "scores": [18, 18, 18, 18, 18], "sum": 90}], "total": 173},
        {"heat_number": 68, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 16, 16, 15, 16], "sum": 78}, {"judge_number": 2, "scores": [15, 18, 17, 15, 18], "sum": 83}], "total": 161}
    ]),
    (60, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "ВАРЛОК ЯРКАЯ МОЛНИЯ", "VARLOK YARKAYA MOLNIYA", 12, 331, "CC", "", "finished", None, [
        {"heat_number": 55, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 16, 16, 16, 16], "sum": 79}, {"judge_number": 2, "scores": [16, 18, 18, 17, 17], "sum": 86}], "total": 165},
        {"heat_number": 66, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 16, 15, 16], "sum": 80}, {"judge_number": 2, "scores": [17, 18, 18, 16, 17], "sum": 86}], "total": 166}
    ]),
    (54, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "БЛЭК ДЖЕК", "BLACK JACK", None, 171, "", "", "disqualified", "Дисквалификация", [
        {"heat_number": 55, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 17, 17, 17], "sum": 86}], "total": 171},
        {"heat_number": 63, "bib_color": "red", "disqualified": True, "disqualification_reason": "Дисквалификация"}
    ]),
    (61, "Уиппет", "Уиппет - Стандартный-спринтеры - Кобель", "Кобель", "АМОРОУС БЭБИ ПИНКЕРТОН", "AMOROUS BEBI PINKERTON", None, None, "", "", "disqualified", "Дисквалификация", [
        {"heat_number": 54, "bib_color": "white", "disqualified": True, "disqualification_reason": "Дисквалификация"}
    ]),

    # === Уиппет_Стандартный-спринтеры_Суки ===
    (68, "Уиппет", "Уиппет - Стандартный-спринтеры - Сука", "Сука", "ЛАВИНГ БРИЗ ФЛОРЕНС", "LAVING BRIZ FLORENCE", 1, 354, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 10, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 17, 19, 19], "sum": 90}, {"judge_number": 2, "scores": [17, 18, 18, 18, 18], "sum": 89}], "total": 179},
        {"heat_number": 23, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [16, 18, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [18, 19, 18, 17, 18], "sum": 90}], "total": 175}
    ]),
    (104, "Уиппет", "Уиппет - Стандартный-спринтеры - Сука", "Сука", "ЛАКШЕРИ ВИПП НИКИТА", "LUXURY WHIPP NIKITA", 2, 346, "CC", "CACL", "finished", None, [
        {"heat_number": 12, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [18, 18, 18, 18, 18], "sum": 90}], "total": 175},
        {"heat_number": 23, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [17, 18, 18, 17, 17], "sum": 87}], "total": 171}
    ]),
    (67, "Уиппет", "Уиппет - Стандартный-спринтеры - Сука", "Сука", "АКВАРЕЛА ДЕЛЬ РИО ВАНИЛЛА СКАЙ", "ACUARELA DEL'RIO VANILLA SKY", 3, 344, "CC", "", "finished", None, [
        {"heat_number": 12, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 16, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [17, 18, 18, 17, 17], "sum": 87}], "total": 171},
        {"heat_number": 22, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 17, 17], "sum": 85}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 173}
    ]),
    (70, "Уиппет", "Уиппет - Стандартный-спринтеры - Сука", "Сука", "ФЕЕЛ МАЙ ХЕАРТ АЛЕТЕЙЯ", "FEEL MY HEART ALETEIYA", 4, 343, "CC", "", "finished", None, [
        {"heat_number": 11, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 18, 18], "sum": 87}, {"judge_number": 2, "scores": [18, 18, 18, 16, 17], "sum": 87}], "total": 174},
        {"heat_number": 24, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [17, 17, 18, 17, 16], "sum": 85}], "total": 169}
    ]),
    (66, "Уиппет", "Уиппет - Стандартный-спринтеры - Сука", "Сука", "АКВАРЕЛА ДЕЛЬ РИО ДУС КАРАМЕЛЬ", "ACUARELA DEL'RIO DOUCE CARAMEL", 5, 341, "CC", "", "finished", None, [
        {"heat_number": 10, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 18, 18], "sum": 87}, {"judge_number": 2, "scores": [16, 18, 18, 17, 17], "sum": 86}], "total": 173},
        {"heat_number": 22, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 17, 17, 15, 17], "sum": 82}, {"judge_number": 2, "scores": [17, 18, 17, 16, 18], "sum": 86}], "total": 168}
    ]),
    (102, "Уиппет", "Уиппет - Стандартный-спринтеры - Сука", "Сука", "ВАФЕЛИЯ", "VAFELIYA", 6, 340, "CC", "", "finished", None, [
        {"heat_number": 10, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [18, 19, 18, 19, 18], "sum": 92}], "total": 176},
        {"heat_number": 24, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 17, 16, 14, 16], "sum": 78}, {"judge_number": 2, "scores": [17, 18, 18, 15, 18], "sum": 86}], "total": 164}
    ]),
    (69, "Уиппет", "Уиппет - Стандартный-спринтеры - Сука", "Сука", "ЛАКШЕРИ ВИПП НЬЮ БЕЛЛЕ", "LUXURY WHIPP NEW BELLE", 7, 337, "CC", "", "finished", None, [
        {"heat_number": 11, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [14, 17, 17, 13, 14], "sum": 75}, {"judge_number": 2, "scores": [19, 19, 17, 18, 17], "sum": 90}], "total": 165},
        {"heat_number": 25, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 16, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [17, 19, 17, 18, 18], "sum": 89}], "total": 172}
    ]),

    # === Уиппет_Юниоры_Общая ===
    (109, "Уиппет", "Уиппет - Юниоры - Кобель", "Кобель", "ЛАКШЕРИ ВИПП ОНИКС", "LUXURY WHIPP ONIKS", None, None, "", "", "dnf", "Сошёл", [
        {"heat_number": 27, "bib_color": "white", "disqualified": False, "disqualification_reason": "Сошёл"}
    ]),
    (110, "Уиппет", "Уиппет - Юниоры - Сука", "Сука", "ЛАКШЕРИ ВИПП ОМЕГА", "LUXURY WHIPP OMEGA", None, None, "", "", "dnf", "Сошёл", [
        {"heat_number": 27, "bib_color": "red", "disqualified": False, "disqualification_reason": "Сошёл"}
    ]),

    # === Фараонова собака_Стандартный_Суки ===
    (112, "Фараонова собака", "Фараонова собака - Стандартный - Сука", "Сука", "РИДЛИ РОАД СТЭДЛИН", "RIDLI ROAD STEDLIN", None, 77, "", "", "dnq", "Не прошла квалификацию", [
        {"heat_number": 112, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [3, 5, 3, 2, 5], "sum": 18}, {"judge_number": 2, "scores": [10, 18, 10, 8, 13], "sum": 59}], "total": 77}
    ]),

    # === Чирнеко дель Этна_Стандартный_Кобели ===
    (115, "Чирнеко дель Этна", "Чирнеко дель Этна - Стандартный - Кобель", "Кобель", "ВЕНТУРА", "VENTURA", 1, 354, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 109, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [16, 20, 18, 17, 18], "sum": 89}, {"judge_number": 2, "scores": [18, 19, 18, 16, 17], "sum": 88}], "total": 177},
        {"heat_number": 121, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 18, 18], "sum": 87}, {"judge_number": 2, "scores": [18, 19, 18, 18, 17], "sum": 90}], "total": 177}
    ]),
    (114, "Чирнеко дель Этна", "Чирнеко дель Этна - Стандартный - Кобель", "Кобель", "ТЕСОРО СОЛАРЕ ФОРТУНАТО", "TESORO SOLARE FORTUNATO", 2, 342, "CC", "CACL", "finished", None, [
        {"heat_number": 108, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 16, 17, 17], "sum": 84}, {"judge_number": 2, "scores": [17, 18, 18, 16, 18], "sum": 87}], "total": 171},
        {"heat_number": 122, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 17, 18, 18], "sum": 86}, {"judge_number": 2, "scores": [17, 18, 18, 15, 17], "sum": 85}], "total": 171}
    ]),
    (116, "Чирнеко дель Этна", "Чирнеко дель Этна - Стандартный - Кобель", "Кобель", "МИА САНТО'С МАРКО КВИНТО", "MIA SANTO'S MARKO KVINTO", 3, 336, "CC", "", "finished", None, [
        {"heat_number": 108, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [17, 16, 15, 17, 17], "sum": 82}, {"judge_number": 2, "scores": [16, 17, 18, 17, 18], "sum": 86}], "total": 168},
        {"heat_number": 121, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 15, 16, 18, 18], "sum": 82}, {"judge_number": 2, "scores": [17, 18, 17, 17, 17], "sum": 86}], "total": 168}
    ]),

    # === Чирнеко дель Этна_Стандартный_Суки ===
    (120, "Чирнеко дель Этна", "Чирнеко дель Этна - Стандартный - Сука", "Сука", "ЦВЕТ СОЛНЦА ДРЕВНЯЯ ЛЕГЕНДА", "TSVET SOLNTSA DREVNYAYA LEGENDA", 1, 349, "CC", "Чемпион РКФ", "finished", None, [
        {"heat_number": 111, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 17, 17, 18, 18], "sum": 87}, {"judge_number": 2, "scores": [17, 18, 17, 18, 18], "sum": 88}], "total": 175},
        {"heat_number": 124, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 18, 18, 18, 18], "sum": 89}, {"judge_number": 2, "scores": [16, 18, 17, 17, 17], "sum": 85}], "total": 174}
    ]),
    (119, "Чирнеко дель Этна", "Чирнеко дель Этна - Стандартный - Сука", "Сука", "КОЛИСТО'С СИЦИЛИЯ", "COLISTO'S SICILIA", 2, 344, "CC", "CACL", "finished", None, [
        {"heat_number": 110, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [15, 16, 15, 17, 17], "sum": 80}, {"judge_number": 2, "scores": [17, 18, 16, 17, 18], "sum": 86}], "total": 166},
        {"heat_number": 124, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 18, 18, 18, 18], "sum": 90}, {"judge_number": 2, "scores": [17, 18, 18, 17, 18], "sum": 88}], "total": 178}
    ]),
    (118, "Чирнеко дель Этна", "Чирнеко дель Этна - Стандартный - Сука", "Сука", "МИА САНТО'С ИЛЬВА-НЕВА", "MIA SANTO'S ILVA-NEVA", 3, 339, "CC", "", "finished", None, [
        {"heat_number": 110, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [15, 17, 17, 17, 17], "sum": 83}, {"judge_number": 2, "scores": [16, 17, 18, 16, 18], "sum": 85}], "total": 168},
        {"heat_number": 123, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [18, 17, 17, 18, 18], "sum": 88}, {"judge_number": 2, "scores": [16, 17, 17, 16, 17], "sum": 83}], "total": 171}
    ]),
    (117, "Чирнеко дель Этна", "Чирнеко дель Этна - Стандартный - Сука", "Сука", "КОЛИСТО'С МОЛЛИ", "COLISTO'S MOLLY", 4, 322, "CC", "", "finished", None, [
        {"heat_number": 111, "bib_color": "red", "judges": [{"judge_number": 1, "scores": [13, 16, 17, 15, 17], "sum": 78}, {"judge_number": 2, "scores": [15, 17, 17, 15, 17], "sum": 81}], "total": 159},
        {"heat_number": 123, "bib_color": "white", "judges": [{"judge_number": 1, "scores": [17, 16, 16, 18, 18], "sum": 85}, {"judge_number": 2, "scores": [15, 16, 17, 15, 15], "sum": 78}], "total": 163}
    ]),

    # === Неявившиеся участники ===
    (32, "Родезийский риджбек", "Родезийский риджбек - Стандартный - Сука", "Сука", "СОЛАР СПИРИТ АРМОНИ", "SOLAR SPIRIT ARMONI", None, None, "", "", "absent", "Неявка", []),
    (45, "Русская псовая борзая", "Русская псовая борзая - Юниоры - Кобель", "Кобель", "ВАСАРТ ГАМБИТ", "VASART GAMBIT", None, None, "", "", "absent", "Неявка", []),
    (87, "Уиппет", "Уиппет - Стандартный - Сука", "Сука", "ЭМБЕР ВЕЙВ`С НЭНСИ", "AMBER VEIV`S NENSI", None, None, "", "", "absent", "Неявка", []),
    (111, "Уиппет", "Уиппет - Юниоры - Сука", "Сука", "СТАНГЕРС ЛЭНД ГОЛДИ-ТРИШ", "STANGERS LAND GOLDI-TRISH", None, None, "", "", "absent", "Неявка", []),
    (113, "Фараонова собака", "Фараонова собака - Юниоры - Сука", "Сука", "РОКСИ ИФЕ ШАНИ ИЗ ШНЕЙДЕР РИЧ", "ROKSI IFE SHANI IZ SHNEYDER RICH", None, None, "", "", "absent", "Неявка", [])
]

results = [make_result(i + 1, *r) for i, r in enumerate(results_raw)]

draft = {
    "date_start": "2022-04-16",
    "date_end": "2022-04-17",
    "title": "Чемпионат РКФ по курсингу",
    "full_title": "Чемпионат РКФ, CACL, 16-17.04.2022 (Московская обл., Михайловское)",
    "rank_label": "ЧРКФ\n(Курсинг борзых)",
    "rank_code": "ЧРКФ",
    "discipline_code": "coursing",
    "event_type": "coursing",
    "competition_kind": "ЧРКФ",
    "competition_type": "Курсинг борзых",
    "host_club": 'МОРОО "Федерация спортивно-прикладного собаководства"',
    "location": "Московская область, деревня Михайловское",
    "judges": "Корепанова Т.В., Вронская О.В.",
    "results": results
}

os.makedirs("data/temp", exist_ok=True)
out_path = "data/temp/draft-2022-04-16.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(draft, f, ensure_ascii=False, indent=2)

print(f"Generated draft with {len(results)} participants to {out_path}")
