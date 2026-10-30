# -*- coding: utf-8 -*-
import json

# Transcription of 2021-09-19 Открытый чемпионат НКП РПБ "Осенний Марафон - 2021"

dogs_meta = {
    # Кобели
    8: {"name_lat": "OBEREG RUSI AMETIST", "name_ru": "ОБЕРЕГ РУСИ АМЕТИСТ", "breed": "Русская псовая борзая", "sex": "Кобель"},
    17: {"name_lat": "LUKICHI ILMEN", "name_ru": "ЛУКИЧИ ИЛЬМЕНЬ", "breed": "Русская псовая борзая", "sex": "Кобель"},
    18: {"name_lat": "OBEREG RUSI AGAT", "name_ru": "ОБЕРЕГ РУСИ АГАТ", "breed": "Русская псовая борзая", "sex": "Кобель"},
    13: {"name_lat": "ZIDANE", "name_ru": "ЗИДАН", "breed": "Русская псовая борзая", "sex": "Кобель"},
    15: {"name_lat": "BORZYE-SENAVIAN TSAGRI", "name_ru": "БОРЗЫЕ-СЕНАВИАН ЦАГРИ", "breed": "Русская псовая борзая", "sex": "Кобель"},
    16: {"name_lat": "DRUG SEREBRYANYY DZHIM BIM", "name_ru": "ДРУГ СЕРЕБРЯНЫЙ ДЖИМ БИМ", "breed": "Русская псовая борзая", "sex": "Кобель"},
    7: {"name_lat": "KATZ PTYAGIN", "name_ru": "КАЦ ПТЯГИН", "breed": "Русская псовая борзая", "sex": "Кобель"},
    14: {"name_lat": "BORZOY TSARSKIY VOSTORG", "name_ru": "БОРЗОЙ ЦАРСКИЙ ВОСТОРГ", "breed": "Русская псовая борзая", "sex": "Кобель"},
    9: {"name_lat": "RUSSKAYA ZABAWA FURROR", "name_ru": "РУССКАЯ ЗАБАВА ФУРРОР", "breed": "Русская псовая борзая", "sex": "Кобель"},
    11: {"name_lat": "ULAAN BAATYR S ENISEISKIH POLEI", "name_ru": "УЛААН БААТЫР С ЕНИСЕЙСКИХ ПОЛЕЙ", "breed": "Русская псовая борзая", "sex": "Кобель"},
    12: {"name_lat": "GOLOS IZ RAZDOLIA", "name_ru": "ГОЛОС ИЗ РАЗДОЛЬЯ", "breed": "Русская псовая борзая", "sex": "Кобель"},

    # Суки
    41: {"name_lat": "PRI-CHUDA", "name_ru": "ПРИ-ЧУДА", "breed": "Русская псовая борзая", "sex": "Сука"},
    37: {"name_lat": "DZHIVA", "name_ru": "ДЖИВА", "breed": "Русская псовая борзая", "sex": "Сука"},
    36: {"name_lat": "DERZA II", "name_ru": "ДЕРЗА II", "breed": "Русская псовая борзая", "sex": "Сука"},
    22: {"name_lat": "BORZIE-SENAVIAN CARINA", "name_ru": "БОРЗЫЕ-СЕНАВИАН КАРИНА", "breed": "Русская псовая борзая", "sex": "Сука"},
    38: {"name_lat": "DRIM", "name_ru": "ДРИМ", "breed": "Русская псовая борзая", "sex": "Сука"},
    42: {"name_lat": "SEVERGA", "name_ru": "СЕВЕРГА", "breed": "Русская псовая борзая", "sex": "Сука"},
    39: {"name_lat": "ZVEZDNAYA RADUGA LORELEYA", "name_ru": "ЗВЁЗДНАЯ РАДУГА ЛОРЕЛЕЯ", "breed": "Русская псовая борзая", "sex": "Сука"},
    29: {"name_lat": "RUSSKAYA ZABAWA FANTASTIKA", "name_ru": "РУССКАЯ ЗАБАВА ФАНТАСТИКА", "breed": "Русская псовая борзая", "sex": "Сука"},
    51: {"name_lat": "DOROGOY DRUG ULANKA", "name_ru": "ДОРОГОЙ ДРУГ УЛАНКА", "breed": "Русская псовая борзая", "sex": "Сука"},
    40: {"name_lat": "OBEREG RUSI AFRODITA", "name_ru": "ОБЕРЕГ РУСИ АФРОДИТА", "breed": "Русская псовая борзая", "sex": "Сука"},
    27: {"name_lat": "PERM VELIKAYA SAFYANA", "name_ru": "ПЕРМЬ ВЕЛИКАЯ САФЬЯНА", "breed": "Русская псовая борзая", "sex": "Сука"},
    52: {"name_lat": "POLE-TAYKA", "name_ru": "ПОЛЕ-ТАЙКА", "breed": "Русская псовая борзая", "sex": "Сука"},
    21: {"name_lat": "APRIORI LUXURY RUSSKAYA ATAMANKA", "name_ru": "АПРИОРИ ЛЮКС РУССКАЯ АТАМАНКА", "breed": "Русская псовая борзая", "sex": "Сука"},
    33: {"name_lat": "BERKANA", "name_ru": "БЕРКАНА", "breed": "Русская псовая борзая", "sex": "Сука"},
    26: {"name_lat": "OBEREG RUSI ARTEMIDA", "name_ru": "ОБЕРЕГ РУСИ АРТЕМИДА", "breed": "Русская псовая борзая", "sex": "Сука"},
    28: {"name_lat": "RUSSKAYA ZABAWA ELEKTRA", "name_ru": "РУССКАЯ ЗАБАВА ЭЛЕКТРА", "breed": "Русская псовая борзая", "sex": "Сука"},
    30: {"name_lat": "VASILISA IZ RAZDOLIA", "name_ru": "ВАСИЛИСА ИЗ РАЗДОЛЬЯ", "breed": "Русская псовая борзая", "sex": "Сука"},
    31: {"name_lat": "VOROZHEYA IZ RAZDOLIA", "name_ru": "ВОРОЖЕЯ ИЗ РАЗДОЛЬЯ", "breed": "Русская псовая борзая", "sex": "Сука"},
    32: {"name_lat": "BEL ETUAL KRASOTKA", "name_ru": "БЕЛЬ ЭТУАЛЬ КРАСОТКА", "breed": "Русская псовая борзая", "sex": "Сука"},
    34: {"name_lat": "BORZOY TSARSKIY VACHA", "name_ru": "БОРЗОЙ ЦАРСКИЙ ВАЧА", "breed": "Русская псовая борзая", "sex": "Сука"},
    35: {"name_lat": "BURYA OSENNYAYA", "name_ru": "БУРЯ ОСЕННЯЯ", "breed": "Русская псовая борзая", "sex": "Сука"},

    # Юниоры
    48: {"name_lat": "LUNNAYA RADUGA ROSSIYA", "name_ru": "ЛУННАЯ РАДУГА РОССИЯ", "breed": "Русская псовая борзая", "sex": "Сука"},
    47: {"name_lat": "DOROGOY DRUG FARTOVYY", "name_ru": "ДОРОГОЙ ДРУГ ФАРТОВЫЙ", "breed": "Русская псовая борзая", "sex": "Кобель"},
    45: {"name_lat": "LUNNAJA RADUGA RUSSKIY ROMANCE", "name_ru": "ЛУННАЯ РАДУГА РУССКИЙ РОМАНС", "breed": "Русская псовая борзая", "sex": "Кобель"},
    44: {"name_lat": "APRIORI LUXURY MASTER", "name_ru": "АПРИОРИ ЛЮКС МАСТЕР", "breed": "Русская псовая борзая", "sex": "Кобель"}
}

# 1-й раунд (Рейсинг, 400 м)
racing_results_raw = [
    # Кобели
    {"no": 8, "pl": 1, "heat": 7, "bib": 2, "color": "blue", "t": 31.62, "spd": 45.541, "st": "finished", "reason": None},
    {"no": 17, "pl": 2, "heat": 18, "bib": 2, "color": "blue", "t": 31.71, "spd": 45.412, "st": "finished", "reason": None},
    {"no": 18, "pl": 3, "heat": 7, "bib": 1, "color": "red", "t": 32.69, "spd": 44.050, "st": "finished", "reason": None},
    {"no": 13, "pl": 4, "heat": 8, "bib": 1, "color": "red", "t": 33.63, "spd": 42.819, "st": "finished", "reason": None},
    {"no": 15, "pl": 5, "heat": 11, "bib": 1, "color": "red", "t": 34.06, "spd": 42.278, "st": "finished", "reason": None},
    {"no": 16, "pl": 6, "heat": 3, "bib": 2, "color": "blue", "t": 34.54, "spd": 41.691, "st": "finished", "reason": None},
    {"no": 7, "pl": 7, "heat": 5, "bib": 2, "color": "blue", "t": 36.44, "spd": 39.517, "st": "finished", "reason": None},
    {"no": 14, "pl": 8, "heat": 6, "bib": 1, "color": "red", "t": 39.18, "spd": 36.753, "st": "finished", "reason": None},
    {"no": 9, "pl": 9, "heat": 15, "bib": 1, "color": "red", "t": 42.98, "spd": 33.504, "st": "finished", "reason": None},
    {"no": 11, "pl": None, "heat": 17, "bib": 3, "color": "white", "t": None, "spd": None, "st": "retired", "reason": "Вход в круг"},
    {"no": 12, "pl": None, "heat": 4, "bib": 2, "color": "blue", "t": None, "spd": None, "st": "retired", "reason": "Сошёл"},

    # Суки
    {"no": 41, "pl": 1, "heat": 9, "bib": 2, "color": "blue", "t": 31.87, "spd": 45.184, "st": "finished", "reason": None},
    {"no": 37, "pl": 2, "heat": 8, "bib": 2, "color": "blue", "t": 33.36, "spd": 43.165, "st": "finished", "reason": None},
    {"no": 36, "pl": 3, "heat": 8, "bib": 3, "color": "white", "t": 33.55, "spd": 42.921, "st": "finished", "reason": None},
    {"no": 22, "pl": 4, "heat": 11, "bib": 3, "color": "white", "t": 33.65, "spd": 42.793, "st": "finished", "reason": None},
    {"no": 38, "pl": 5, "heat": 5, "bib": 1, "color": "red", "t": 33.99, "spd": 42.365, "st": "finished", "reason": None},
    {"no": 42, "pl": 6, "heat": 13, "bib": 1, "color": "red", "t": 34.23, "spd": 42.068, "st": "finished", "reason": None},
    {"no": 39, "pl": 7, "heat": 3, "bib": 1, "color": "red", "t": 34.33, "spd": 41.946, "st": "finished", "reason": None},
    {"no": 29, "pl": 8, "heat": 14, "bib": 2, "color": "blue", "t": 34.44, "spd": 41.812, "st": "finished", "reason": None},
    {"no": 51, "pl": 9, "heat": 16, "bib": 1, "color": "red", "t": 34.95, "spd": 41.202, "st": "finished", "reason": None},
    {"no": 40, "pl": 10, "heat": 2, "bib": 1, "color": "red", "t": 34.99, "spd": 41.155, "st": "finished", "reason": None},
    {"no": 27, "pl": 11, "heat": 10, "bib": 1, "color": "red", "t": 35.30, "spd": 40.793, "st": "finished", "reason": None},
    {"no": 52, "pl": 12, "heat": 16, "bib": 2, "color": "blue", "t": 35.33, "spd": 40.759, "st": "finished", "reason": None},
    {"no": 21, "pl": 13, "heat": 17, "bib": 1, "color": "red", "t": 36.58, "spd": 39.366, "st": "finished", "reason": None},
    {"no": 33, "pl": 14, "heat": 12, "bib": 2, "color": "blue", "t": 37.36, "spd": 38.544, "st": "finished", "reason": None},
    {"no": 26, "pl": None, "heat": 2, "bib": 2, "color": "blue", "t": None, "spd": None, "st": "retired", "reason": "Вход в круг"},
    {"no": 28, "pl": None, "heat": 14, "bib": 1, "color": "red", "t": None, "spd": None, "st": "retired", "reason": "Вход в круг"},
    {"no": 30, "pl": None, "heat": 4, "bib": 2, "color": "blue", "t": None, "spd": None, "st": "retired", "reason": "Вход в круг"},
    {"no": 31, "pl": None, "heat": 4, "bib": 1, "color": "red", "t": None, "spd": None, "st": "retired", "reason": "Вход в круг"},
    {"no": 32, "pl": None, "heat": 9, "bib": 1, "color": "red", "t": None, "spd": None, "st": "retired", "reason": "Вход в круг"},
    {"no": 34, "pl": None, "heat": 6, "bib": 2, "color": "blue", "t": None, "spd": None, "st": "retired", "reason": "Сошёл"},
    {"no": 35, "pl": None, "heat": 12, "bib": 1, "color": "red", "t": None, "spd": None, "st": "retired", "reason": "Сошёл"},

    # Юниоры
    {"no": 48, "pl": 1, "heat": 1, "bib": 1, "color": "red", "t": 32.41, "spd": 44.431, "st": "finished", "reason": None},
    {"no": 47, "pl": 2, "heat": 18, "bib": 1, "color": "red", "t": 33.07, "spd": 43.544, "st": "finished", "reason": None},
    {"no": 45, "pl": 3, "heat": 1, "bib": 2, "color": "blue", "t": 33.32, "spd": 43.217, "st": "finished", "reason": None},
    {"no": 44, "pl": 4, "heat": 17, "bib": 2, "color": "blue", "t": 35.32, "spd": 40.770, "st": "finished", "reason": None}
]

# 2-й раунд (Курсинг)
coursing_results_raw = [
    # Кобели
    {"no": 8, "pl": 1, "heat": 20, "bib": 3, "color": "white", "j1": [17, 18, 18, 17, 19], "j2": [18, 19, 19, 18, 19], "tot": 182, "st": "finished", "reason": None},
    {"no": 11, "pl": 2, "heat": 35, "bib": 3, "color": "white", "j1": [17, 18, 17, 18, 19], "j2": [19, 18, 18, 19, 18], "tot": 181, "st": "finished", "reason": None},
    {"no": 18, "pl": 3, "heat": 27, "bib": 2, "color": "blue", "j1": [16, 16, 17, 17, 18], "j2": [19, 19, 20, 19, 20], "tot": 181, "st": "finished", "reason": None},
    {"no": 17, "pl": 4, "heat": 27, "bib": 1, "color": "red", "j1": [17, 19, 18, 18, 19], "j2": [17, 19, 17, 17, 18], "tot": 179, "st": "finished", "reason": None},
    {"no": 15, "pl": 5, "heat": 29, "bib": 1, "color": "red", "j1": [17, 18, 17, 17, 19], "j2": [17, 18, 19, 17, 18], "tot": 177, "st": "finished", "reason": None},
    {"no": 16, "pl": 6, "heat": 21, "bib": 2, "color": "blue", "j1": [17, 17, 16, 18, 18], "j2": [17, 18, 18, 18, 18], "tot": 175, "st": "finished", "reason": None},
    {"no": 7, "pl": 7, "heat": 23, "bib": 2, "color": "blue", "j1": [17, 17, 17, 17, 18], "j2": [17, 17, 19, 18, 18], "tot": 175, "st": "finished", "reason": None},
    {"no": 13, "pl": 8, "heat": 23, "bib": 1, "color": "red", "j1": [17, 18, 17, 17, 18], "j2": [17, 18, 18, 16, 17], "tot": 173, "st": "finished", "reason": None},
    {"no": 12, "pl": 9, "heat": 22, "bib": 3, "color": "white", "j1": [10, 10, 10, 10, 10], "j2": [10, 10, 10, 10, 10], "tot": 100, "st": "finished", "reason": None},
    {"no": 9, "pl": None, "heat": 33, "bib": 2, "color": "blue", "j1": None, "j2": None, "tot": None, "st": "withdrawn", "reason": "Снят"},
    {"no": 14, "pl": None, "heat": 25, "bib": 1, "color": "red", "j1": None, "j2": None, "tot": None, "st": "withdrawn", "reason": "Снят"},

    # Суки
    {"no": 41, "pl": 1, "heat": 24, "bib": 1, "color": "red", "j1": [18, 18, 16, 17, 18], "j2": [19, 20, 18, 19, 21], "tot": 184, "st": "finished", "reason": None},
    {"no": 28, "pl": 2, "heat": 32, "bib": 1, "color": "red", "j1": [17, 18, 18, 17, 20], "j2": [18, 19, 19, 19, 19], "tot": 184, "st": "finished", "reason": None},
    {"no": 39, "pl": 3, "heat": 21, "bib": 1, "color": "red", "j1": [18, 17, 17, 18, 18], "j2": [18, 19, 19, 19, 18], "tot": 181, "st": "finished", "reason": None},
    {"no": 37, "pl": 4, "heat": 26, "bib": 2, "color": "blue", "j1": [17, 18, 18, 17, 18], "j2": [18, 19, 19, 18, 19], "tot": 181, "st": "finished", "reason": None},
    {"no": 42, "pl": 5, "heat": 31, "bib": 1, "color": "red", "j1": [17, 18, 17, 18, 19], "j2": [18, 17, 18, 18, 19], "tot": 179, "st": "finished", "reason": None},
    {"no": 22, "pl": 6, "heat": 29, "bib": 3, "color": "white", "j1": [17, 18, 17, 18, 19], "j2": [18, 19, 17, 18, 17], "tot": 178, "st": "finished", "reason": None},
    {"no": 52, "pl": 7, "heat": 31, "bib": 2, "color": "blue", "j1": [17, 17, 17, 18, 19], "j2": [17, 19, 19, 17, 18], "tot": 178, "st": "finished", "reason": None},
    {"no": 51, "pl": 8, "heat": 24, "bib": 1, "color": "red", "j1": [17, 18, 17, 18, 19], "j2": [16, 17, 18, 18, 17], "tot": 175, "st": "finished", "reason": None},
    {"no": 29, "pl": 9, "heat": 32, "bib": 2, "color": "blue", "j1": [17, 16, 16, 17, 19], "j2": [17, 17, 18, 17, 17], "tot": 171, "st": "finished", "reason": None},
    {"no": 36, "pl": 10, "heat": 26, "bib": 3, "color": "white", "j1": [17, 17, 15, 14, 15], "j2": [19, 18, 17, 19, 18], "tot": 169, "st": "finished", "reason": None},
    {"no": 26, "pl": 11, "heat": 27, "bib": 2, "color": "blue", "j1": [17, 16, 17, 17, 17], "j2": [17, 18, 17, 16, 17], "tot": 169, "st": "finished", "reason": None},
    {"no": 40, "pl": 12, "heat": 20, "bib": 1, "color": "red", "j1": [17, 16, 17, 17, 17], "j2": [16, 17, 17, 16, 17], "tot": 167, "st": "finished", "reason": None},
    {"no": 38, "pl": 13, "heat": 23, "bib": 1, "color": "red", "j1": [17, 17, 16, 18, 16], "j2": [16, 18, 16, 16, 16], "tot": 166, "st": "finished", "reason": None},
    {"no": 32, "pl": 14, "heat": 28, "bib": 1, "color": "red", "j1": [17, 18, 16, 15, 16], "j2": [16, 17, 17, 16, 17], "tot": 165, "st": "finished", "reason": None},
    {"no": 27, "pl": 15, "heat": 28, "bib": 2, "color": "blue", "j1": [16, 17, 16, 14, 15], "j2": [16, 17, 16, 16, 17], "tot": 160, "st": "finished", "reason": None},
    {"no": 31, "pl": 16, "heat": 22, "bib": 1, "color": "red", "j1": [17, 18, 15, 13, 14], "j2": [15, 18, 15, 10, 10], "tot": 145, "st": "finished", "reason": None},
    {"no": 21, "pl": None, "heat": 35, "bib": 1, "color": "red", "j1": None, "j2": None, "tot": None, "st": "disqualified", "reason": "Агрессия"},
    {"no": 30, "pl": None, "heat": 30, "bib": 2, "color": "blue", "j1": None, "j2": None, "tot": None, "st": "withdrawn", "reason": "Снят"},
    {"no": 33, "pl": None, "heat": 35, "bib": 2, "color": "blue", "j1": None, "j2": None, "tot": None, "st": "withdrawn", "reason": "Снят"},
    {"no": 34, "pl": None, "heat": 25, "bib": 2, "color": "blue", "j1": None, "j2": None, "tot": None, "st": "withdrawn", "reason": "Снят"},
    {"no": 35, "pl": None, "heat": 30, "bib": 1, "color": "red", "j1": None, "j2": None, "tot": None, "st": "withdrawn", "reason": "Снят"},

    # Юниоры
    {"no": 47, "pl": 1, "heat": 36, "bib": 1, "color": "red", "j1": [17, 18, 17, 18, 19], "j2": [19, 18, 19, 19, 19], "tot": 183, "st": "finished", "reason": None},
    {"no": 45, "pl": 2, "heat": 19, "bib": 2, "color": "blue", "j1": [17, 17, 16, 18, 18], "j2": [17, 18, 18, 19, 19], "tot": 177, "st": "finished", "reason": None},
    {"no": 44, "pl": 3, "heat": 35, "bib": 2, "color": "blue", "j1": [17, 17, 16, 16, 18], "j2": [17, 16, 17, 16, 16], "tot": 166, "st": "finished", "reason": None},
    {"no": 48, "pl": 4, "heat": 19, "bib": 1, "color": "red", "j1": [17, 17, 16, 15, 18], "j2": [13, 16, 15, 14, 13], "tot": 154, "st": "finished", "reason": None}
]

# Build merged results list
results = []

# Process racing round
for r in racing_results_raw:
    dmeta = dogs_meta[r["no"]]
    sex_label = "Кобели" if dmeta["sex"] == "Кобель" else "Суки"
    class_label = "Юниоры - Общая" if r["no"] in [44, 45, 47, 48] else f"Стандартный - {sex_label}"
    breed_class = f"Русская псовая борзая - 1-й раунд (Рейсинг) - {class_label}"

    heats = []
    if r["st"] == "finished" or r["t"] is not None:
        heats.append({
            "heat_number": r["heat"],
            "bib_number": r["bib"],
            "bib_color": r["color"],
            "time": r["t"],
            "speed_kmh": r["spd"]
        })
    elif r["reason"]:
        heats.append({
            "heat_number": r["heat"],
            "bib_number": r["bib"],
            "bib_color": r["color"],
            "time": None,
            "speed_kmh": None
        })

    res = {
        "catalog_no": r["no"],
        "placement": r["pl"],
        "breed_class": breed_class,
        "qualification": None,
        "vc": None,
        "status": r["st"],
        "status_reason": r["reason"],
        "dog": dmeta,
        "raw_scores_json": {
            "format": "racing",
            "distance": 400,
            "heats": heats,
            "grand_total": r["t"],
            "normalized_score": r["t"]
        },
        "total_score": r["t"]
    }
    results.append(res)

# Process coursing round
for c in coursing_results_raw:
    dmeta = dogs_meta[c["no"]]
    sex_label = "Кобели" if dmeta["sex"] == "Кобель" else "Суки"
    class_label = "Юниоры - Общая" if c["no"] in [44, 45, 47, 48] else f"Стандартный - {sex_label}"
    breed_class = f"Русская псовая борзая - 2-й раунд (Курсинг) - {class_label}"

    heats = []
    if c["st"] == "finished" and c["j1"] and c["j2"]:
        heats.append({
            "heat_number": c["heat"],
            "bib_number": c["heat"],
            "bib_color": 1 if c["color"] == "red" else (2 if c["color"] == "blue" else 3),
            "judges": [
                {"scores": c["j1"], "sum": sum(c["j1"])},
                {"scores": c["j2"], "sum": sum(c["j2"])}
            ],
            "total": c["tot"]
        })
    elif c["reason"]:
        heats.append({
            "heat_number": c["heat"],
            "bib_number": c["heat"],
            "bib_color": 1 if c["color"] == "red" else (2 if c["color"] == "blue" else 3),
            "judges": [],
            "total": None
        })

    res = {
        "catalog_no": c["no"],
        "placement": c["pl"],
        "breed_class": breed_class,
        "qualification": None,
        "vc": None,
        "status": c["st"],
        "status_reason": c["reason"],
        "dog": dmeta,
        "raw_scores_json": {
            "format": "coursing",
            "heats": heats,
            "grand_total": c["tot"]
        },
        "total_score": c["tot"]
    }
    results.append(res)

print(f"Total results: {len(results)} (36 racing + 36 coursing)")

draft = {
    "event_id": 20210919,
    "title": "Открытый чемпионат НКП РПБ 'Осенний Марафон - 2021'",
    "rank_label": "Чемпионат НКП РПБ\n(Марафон)",
    "event_type": "coursing",
    "competition_kind": "Чемпионат НКП РПБ",
    "competition_type": "Марафон",
    "date_start": "2021-09-19",
    "date_end": None,
    "host_club": "НКП РПБ",
    "location": "Московская область, Новый Милет",
    "judges": "Гольдинова Л.М., Орлова М.О.",
    "results": results
}

with open("data/temp/draft-2021-09-19.json", "w", encoding="utf-8") as f:
    json.dump(draft, f, ensure_ascii=False, indent=2)

print("Saved data/temp/draft-2021-09-19.json")
