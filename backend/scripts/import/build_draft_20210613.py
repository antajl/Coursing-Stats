# -*- coding: utf-8 -*-
import json
import math

# Transcription of 2021-06-13 Чемпионат России по бегам борзых (рейсинг)

results = [
    # 1. Басенджи_Стандартный_Кобели (дистанция 330 м)
    {
        "catalog_no": 1,
        "placement": 1,
        "breed_class": "Басенджи - Стандартный - Кобели",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "DAKAR S KNJAZHESKOGO DVORA", "name_ru": "ДАКАР С КНЯЖЕСКОГО ДВОРА", "breed": "Басенджи", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 1, "bib_number": 1, "bib_color": "red", "time": 29.85, "speed_kmh": 39.799},
                {"heat_number": 31, "bib_number": 1, "bib_color": "red", "time": 29.56, "speed_kmh": 40.189},
                {"heat_number": 43, "bib_number": 1, "bib_color": "red", "time": 28.84, "speed_kmh": 41.193}
            ],
            "grand_total": 28.84,
            "normalized_score": 28.84
        },
        "total_score": 28.84
    },
    {
        "catalog_no": 2,
        "placement": 2,
        "breed_class": "Басенджи - Стандартный - Кобели",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "KASPER VAN DEAN", "name_ru": "КАСПЕР ВАН ДИН", "breed": "Басенджи", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 1, "bib_number": 3, "bib_color": "white", "time": 31.15, "speed_kmh": 38.138},
                {"heat_number": 31, "bib_number": 2, "bib_color": "blue", "time": 30.39, "speed_kmh": 39.092},
                {"heat_number": 43, "bib_number": 3, "bib_color": "white", "time": 30.34, "speed_kmh": 39.156}
            ],
            "grand_total": 30.34,
            "normalized_score": 30.34
        },
        "total_score": 30.34
    },
    {
        "catalog_no": 3,
        "placement": 3,
        "breed_class": "Басенджи - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "KILIMANJARO KAISER", "name_ru": "КИЛИМАНДЖАРО КАЙЗЕР", "breed": "Басенджи", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 2, "bib_number": 1, "bib_color": "red", "time": 30.77, "speed_kmh": 38.609},
                {"heat_number": 32, "bib_number": 2, "bib_color": "blue", "time": 29.97, "speed_kmh": 39.640},
                {"heat_number": 43, "bib_number": 2, "bib_color": "blue", "time": 31.08, "speed_kmh": 38.224}
            ],
            "grand_total": 31.08,
            "normalized_score": 31.08
        },
        "total_score": 31.08
    },
    {
        "catalog_no": 5,
        "placement": 4,
        "breed_class": "Басенджи - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "BENUA", "name_ru": "БЕНУА", "breed": "Басенджи", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 1, "bib_number": 2, "bib_color": "blue", "time": 30.52, "speed_kmh": 38.925},
                {"heat_number": 32, "bib_number": 1, "bib_color": "red", "time": 30.80, "speed_kmh": 38.571},
                {"heat_number": 43, "bib_number": 4, "bib_color": "black", "time": 31.41, "speed_kmh": 37.822}
            ],
            "grand_total": 31.41,
            "normalized_score": 31.41
        },
        "total_score": 31.41
    },
    {
        "catalog_no": 7,
        "placement": 5,
        "breed_class": "Басенджи - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "AFRIKANSKIY MOLCHUN IMPERIAL", "name_ru": "АФРИКАНСКИЙ МОЛЧУН ИМПЕРИАЛ", "breed": "Басенджи", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 2, "bib_number": 3, "bib_color": "white", "time": 31.70, "speed_kmh": 37.476},
                {"heat_number": 31, "bib_number": 3, "bib_color": "white", "time": 31.94, "speed_kmh": 37.195}
            ],
            "grand_total": 31.70,
            "normalized_score": 31.70
        },
        "total_score": 31.70
    },
    {
        "catalog_no": 6,
        "placement": None,
        "breed_class": "Басенджи - Стандартный - Кобели",
        "qualification": None,
        "vc": None,
        "status": "disqualified",
        "status_reason": "Дисквалификация",
        "dog": {"name_lat": "BLESK", "name_ru": "БЛЕСК", "breed": "Басенджи", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 2, "bib_number": 2, "bib_color": "blue", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 2. Басенджи_Стандартный_Суки (дистанция 330 м)
    {
        "catalog_no": 9,
        "placement": 1,
        "breed_class": "Басенджи - Стандартный - Суки",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "BERTI", "name_ru": "БЭРТИ", "breed": "Басенджи", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 3, "bib_number": 1, "bib_color": "red", "time": 28.79, "speed_kmh": 41.264},
                {"heat_number": 42, "bib_number": 1, "bib_color": "red", "time": 29.03, "speed_kmh": 40.923}
            ],
            "grand_total": 29.03,
            "normalized_score": 29.03
        },
        "total_score": 29.03
    },
    {
        "catalog_no": 10,
        "placement": 2,
        "breed_class": "Басенджи - Стандартный - Суки",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "ITURI PAZZL VILMA", "name_ru": "ИТУРИ ПАЗЗЛ ВИЛМА", "breed": "Басенджи", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 3, "bib_number": 3, "bib_color": "white", "time": 31.95, "speed_kmh": 37.183},
                {"heat_number": 42, "bib_number": 2, "bib_color": "blue", "time": 30.99, "speed_kmh": 38.335}
            ],
            "grand_total": 30.99,
            "normalized_score": 30.99
        },
        "total_score": 30.99
    },
    {
        "catalog_no": 8,
        "placement": 3,
        "breed_class": "Басенджи - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "KAYLAS LADY", "name_ru": "КАЙЛАС ЛЕДИ", "breed": "Басенджи", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 3, "bib_number": 2, "bib_color": "blue", "time": 32.40, "speed_kmh": 36.667},
                {"heat_number": 42, "bib_number": 3, "bib_color": "white", "time": 31.11, "speed_kmh": 38.187}
            ],
            "grand_total": 31.11,
            "normalized_score": 31.11
        },
        "total_score": 31.11
    },

    # 3. Грейхаунд_Стандартный_Общая (дистанция 430 м)
    {
        "catalog_no": 14,
        "placement": 1,
        "breed_class": "Грейхаунд - Стандартный - Общая",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "FEERIYA PAFF", "name_ru": "ФЕЕРИЯ ПАФФ", "breed": "Грейхаунд", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 49, "bib_number": 4, "bib_color": "black", "time": 28.98, "speed_kmh": 53.416},
                {"heat_number": 59, "bib_number": 1, "bib_color": "red", "time": 28.77, "speed_kmh": 53.806}
            ],
            "grand_total": 28.77,
            "normalized_score": 28.77
        },
        "total_score": 28.77
    },
    {
        "catalog_no": 13,
        "placement": 2,
        "breed_class": "Грейхаунд - Стандартный - Общая",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "FIONN KLANN POCH LOMONOD", "name_ru": "ФИОНН КЛАНН ПОЧ ЛОМОНОД", "breed": "Грейхаунд", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 49, "bib_number": 2, "bib_color": "blue", "time": 30.79, "speed_kmh": 50.276},
                {"heat_number": 59, "bib_number": 2, "bib_color": "blue", "time": 30.59, "speed_kmh": 50.605}
            ],
            "grand_total": 30.59,
            "normalized_score": 30.59
        },
        "total_score": 30.59
    },
    {
        "catalog_no": 11,
        "placement": 3,
        "breed_class": "Грейхаунд - Стандартный - Общая",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "ABSOULYUT IS SVORY NOVIKOVIKH", "name_ru": "АБСОЛЮТ ИЗ СВОРЫ НОВИКОВЫХ", "breed": "Грейхаунд", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 49, "bib_number": 1, "bib_color": "red", "time": 32.16, "speed_kmh": 48.134},
                {"heat_number": 59, "bib_number": 3, "bib_color": "white", "time": 31.39, "speed_kmh": 49.315}
            ],
            "grand_total": 31.39,
            "normalized_score": 31.39
        },
        "total_score": 31.39
    },
    {
        "catalog_no": 12,
        "placement": None,
        "breed_class": "Грейхаунд - Стандартный - Общая",
        "qualification": None,
        "vc": None,
        "status": "injured",
        "status_reason": "Травма",
        "dog": {"name_lat": "KEMBRIDZH", "name_ru": "КЕМБРИДЖ", "breed": "Грейхаунд", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 49, "bib_number": 3, "bib_color": "white", "time": 28.00, "speed_kmh": 55.286},
                {"heat_number": None, "bib_number": None, "bib_color": None, "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 4. Грейхаунд_Юниоры_Кобели (дистанция 430 м)
    {
        "catalog_no": 15,
        "placement": 1,
        "breed_class": "Грейхаунд - Юниоры - Кобели",
        "qualification": "Лучший юниор",
        "vc": None,
        "status": "finished",
        "dog": {"name_lat": "VEKTOR", "name_ru": "ВЕКТОР", "breed": "Грейхаунд", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 50, "bib_number": 1, "bib_color": "red", "time": 29.61, "speed_kmh": 52.280},
                {"heat_number": 60, "bib_number": 1, "bib_color": "red", "time": 30.22, "speed_kmh": 51.224}
            ],
            "grand_total": 30.22,
            "normalized_score": 30.22
        },
        "total_score": 30.22
    },

    # 5. Ирландский волкодав_Стандартный_Кобели (дистанция 430 м)
    {
        "catalog_no": 16,
        "placement": None,
        "breed_class": "Ирландский волкодав - Стандартный - Кобели",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "BORS MES AMIS DE MAFINNS", "name_ru": "БОРС МЕС АМИС ДЕ МАФИННС", "breed": "Ирландский волкодав", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 51, "bib_number": 1, "bib_color": "red", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 6. Испанский гальго_Стандартный_Суки (дистанция 430 м)
    {
        "catalog_no": 17,
        "placement": 1,
        "breed_class": "Испанский гальго - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "JUCARO SPI HIPNOSIS", "name_ru": "ХУКАРО СПИ ХИПНОСИС", "breed": "Испанский гальго", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 52, "bib_number": 1, "bib_color": "red", "time": 33.42, "speed_kmh": 46.320},
                {"heat_number": 61, "bib_number": 1, "bib_color": "red", "time": 37.14, "speed_kmh": 41.680}
            ],
            "grand_total": 37.14,
            "normalized_score": 37.14
        },
        "total_score": 37.14
    },

    # 7. Левретка_Стандартный_Суки (дистанция 330 м)
    {
        "catalog_no": 19,
        "placement": 1,
        "breed_class": "Левретка - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "GRACE HAUND ELIZABETH HER EXCELLENCE", "name_ru": "ГРЕЙС ХАУНД ЭЛИЗАБЕТ ХЁ ЭКСЕЛЕНС", "breed": "Левретка", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 18, "bib_number": 2, "bib_color": "blue", "time": 27.91, "speed_kmh": 42.565},
                {"heat_number": 34, "bib_number": 1, "bib_color": "red", "time": 27.42, "speed_kmh": 43.326}
            ],
            "grand_total": 27.42,
            "normalized_score": 27.42
        },
        "total_score": 27.42
    },
    {
        "catalog_no": 20,
        "placement": None,
        "breed_class": "Левретка - Стандартный - Суки",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "MUNNA", "name_ru": "МУННА", "breed": "Левретка", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 18, "bib_number": 1, "bib_color": "red", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 8. Левретка_Стандартный-спринтеры_Суки (дистанция 330 м)
    {
        "catalog_no": 18,
        "placement": None,
        "breed_class": "Левретка - Стандартный-спринтеры - Суки",
        "qualification": None,
        "vc": None,
        "status": "withdrawn",
        "status_reason": "Снят",
        "dog": {"name_lat": "VALS VALENTO YULISA", "name_ru": "ВАЛЬС ВАЛЕНТО ЮЛИСА", "breed": "Левретка", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 17, "bib_number": 1, "bib_color": "red", "time": 29.48, "speed_kmh": 40.299},
                {"heat_number": 33, "bib_number": 1, "bib_color": "red", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 9. Родезийский риджбек_Стандартный_Общая (дистанция 430 м)
    {
        "catalog_no": 22,
        "placement": 1,
        "breed_class": "Родезийский риджбек - Стандартный - Общая",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "ARIES KHAN PHREIA PASIPHAE", "name_ru": "АРИЕС ХАН ФРЕЙЯ ПАСИФАЯ", "breed": "Родезийский риджбек", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 53, "bib_number": 3, "bib_color": "white", "time": 35.64, "speed_kmh": 43.434},
                {"heat_number": 62, "bib_number": 1, "bib_color": "red", "time": 36.53, "speed_kmh": 42.376}
            ],
            "grand_total": 36.53,
            "normalized_score": 36.53
        },
        "total_score": 36.53
    },
    {
        "catalog_no": 23,
        "placement": None,
        "breed_class": "Родезийский риджбек - Стандартный - Общая",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "MAENDELEO HOLY LARA CROFT ARIES KHAN", "name_ru": "МАЭНДЕЛЕО ХОЛИ ЛАРА КРОФТ АРИЕС ХАН", "breed": "Родезийский риджбек", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 53, "bib_number": 2, "bib_color": "blue", "time": 40.95, "speed_kmh": 37.802},
                {"heat_number": 62, "bib_number": 2, "bib_color": "blue", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },
    {
        "catalog_no": 21,
        "placement": None,
        "breed_class": "Родезийский риджбек - Стандартный - Общая",
        "qualification": None,
        "vc": None,
        "status": "disqualified",
        "status_reason": "Дисквалификация",
        "dog": {"name_lat": "ARIES KHAN MARLON BRANDO", "name_ru": "АРИЕС ХАН МАРЛОН БРАНДО", "breed": "Родезийский риджбек", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 53, "bib_number": 1, "bib_color": "red", "time": 41.00, "speed_kmh": 37.756},
                {"heat_number": 62, "bib_number": 3, "bib_color": "white", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 10. Родезийский риджбек_Юниоры_Общая (дистанция 430 м)
    {
        "catalog_no": 25,
        "placement": 1,
        "breed_class": "Родезийский риджбек - Юниоры - Общая",
        "qualification": "Лучший юниор",
        "vc": None,
        "status": "finished",
        "dog": {"name_lat": "ARIES KHAN RIVIERA AL RISHA SANGRIEL", "name_ru": "АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ", "breed": "Родезийский риджбек", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 54, "bib_number": 1, "bib_color": "red", "time": 35.49, "speed_kmh": 43.618},
                {"heat_number": 63, "bib_number": 1, "bib_color": "red", "time": 36.15, "speed_kmh": 42.822}
            ],
            "grand_total": 36.15,
            "normalized_score": 36.15
        },
        "total_score": 36.15
    },
    {
        "catalog_no": 24,
        "placement": 2,
        "breed_class": "Родезийский риджбек - Юниоры - Общая",
        "qualification": None,
        "vc": None,
        "status": "finished",
        "dog": {"name_lat": "ARIES KHAN REGULUS RADCLIFFE", "name_ru": "АРИЕС ХАН РЕГУЛУС РЭДКЛИФФ", "breed": "Родезийский риджбек", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 54, "bib_number": 2, "bib_color": "blue", "time": 36.59, "speed_kmh": 42.307},
                {"heat_number": 63, "bib_number": 2, "bib_color": "blue", "time": 36.70, "speed_kmh": 42.180}
            ],
            "grand_total": 36.70,
            "normalized_score": 36.70
        },
        "total_score": 36.70
    },

    # 11. Русская псовая борзая_Стандартный_Кобели (дистанция 430 м)
    {
        "catalog_no": 27,
        "placement": 1,
        "breed_class": "Русская псовая борзая - Стандартный - Кобели",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "GUL-DARA DRAGOSH", "name_ru": "ГУЛЬ-ДАРА ДРАГОШ", "breed": "Русская псовая борзая", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 44, "bib_number": 1, "bib_color": "red", "time": 33.61, "speed_kmh": 46.058},
                {"heat_number": 56, "bib_number": 2, "bib_color": "blue", "time": 33.56, "speed_kmh": 46.126}
            ],
            "grand_total": 33.56,
            "normalized_score": 33.56
        },
        "total_score": 33.56
    },
    {
        "catalog_no": 28,
        "placement": 2,
        "breed_class": "Русская псовая борзая - Стандартный - Кобели",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "LUKICHI ILMEN", "name_ru": "ЛУКИЧИ ИЛЬМЕНЬ", "breed": "Русская псовая борзая", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 44, "bib_number": 3, "bib_color": "white", "time": 33.37, "speed_kmh": 46.389},
                {"heat_number": 56, "bib_number": 1, "bib_color": "red", "time": 33.73, "speed_kmh": 45.894}
            ],
            "grand_total": 33.73,
            "normalized_score": 33.73
        },
        "total_score": 33.73
    },
    {
        "catalog_no": 26,
        "placement": None,
        "breed_class": "Русская псовая борзая - Стандартный - Кобели",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "ULAAN BAATYR S ENISEISKIH POLEI", "name_ru": "УЛААН БААТЫР С ЕНИСЕЙСКИХ ПОЛЕЙ", "breed": "Русская псовая борзая", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 44, "bib_number": 4, "bib_color": "black", "time": 33.98, "speed_kmh": 45.556},
                {"heat_number": 56, "bib_number": 3, "bib_color": "white", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },
    {
        "catalog_no": 29,
        "placement": None,
        "breed_class": "Русская псовая борзая - Стандартный - Кобели",
        "qualification": None,
        "vc": None,
        "status": "withdrawn",
        "status_reason": "Снят",
        "dog": {"name_lat": "SOLOVEV LUCH SVETA", "name_ru": "СОЛОВЬЕВ ЛУЧ СВЕТА", "breed": "Русская псовая борзая", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 44, "bib_number": 2, "bib_color": "blue", "time": 36.71, "speed_kmh": 42.168},
                {"heat_number": 56, "bib_number": 4, "bib_color": "black", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 12. Русская псовая борзая_Стандартный_Суки (дистанция 430 м)
    {
        "catalog_no": 35,
        "placement": 1,
        "breed_class": "Русская псовая борзая - Стандартный - Суки",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "SOKOLKA", "name_ru": "СОКОЛКА", "breed": "Русская псовая борзая", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 46, "bib_number": 1, "bib_color": "red", "time": 35.51, "speed_kmh": 43.593},
                {"heat_number": 57, "bib_number": 2, "bib_color": "blue", "time": 34.41, "speed_kmh": 44.987}
            ],
            "grand_total": 34.41,
            "normalized_score": 34.41
        },
        "total_score": 34.41
    },
    {
        "catalog_no": 31,
        "placement": 2,
        "breed_class": "Русская псовая борзая - Стандартный - Суки",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "BEL ETUAL KRASOTKA", "name_ru": "БЕЛЬ ЭТУАЛЬ КРАСОТКА", "breed": "Русская псовая борзая", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 45, "bib_number": 2, "bib_color": "blue", "time": 34.29, "speed_kmh": 45.144},
                {"heat_number": 57, "bib_number": 1, "bib_color": "red", "time": 34.68, "speed_kmh": 44.637}
            ],
            "grand_total": 34.68,
            "normalized_score": 34.68
        },
        "total_score": 34.68
    },
    {
        "catalog_no": 30,
        "placement": None,
        "breed_class": "Русская псовая борзая - Стандартный - Суки",
        "qualification": None,
        "vc": None,
        "status": "disqualified",
        "status_reason": "Дисквалификация",
        "dog": {"name_lat": "ATAKA", "name_ru": "АТАКА", "breed": "Русская псовая борзая", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 46, "bib_number": 2, "bib_color": "blue", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },
    {
        "catalog_no": 32,
        "placement": None,
        "breed_class": "Русская псовая борзая - Стандартный - Суки",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "BERKANA", "name_ru": "БЕРКАНА", "breed": "Русская псовая борзая", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 45, "bib_number": 3, "bib_color": "white", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },
    {
        "catalog_no": 34,
        "placement": None,
        "breed_class": "Русская псовая борзая - Стандартный - Суки",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "SELENGA", "name_ru": "СЕЛЕНГА", "breed": "Русская псовая борзая", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 45, "bib_number": 1, "bib_color": "red", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 13. Русская псовая борзая_Юниоры_Общая (дистанция 430 м)
    {
        "catalog_no": 39,
        "placement": 1,
        "breed_class": "Русская псовая борзая - Юниоры - Общая",
        "qualification": "Лучший юниор",
        "vc": None,
        "status": "finished",
        "dog": {"name_lat": "PRI-CHUDA", "name_ru": "ПРИ-ЧУДА", "breed": "Русская псовая борзая", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 47, "bib_number": 2, "bib_color": "blue", "time": 35.23, "speed_kmh": 43.940},
                {"heat_number": 58, "bib_number": 1, "bib_color": "red", "time": 32.06, "speed_kmh": 48.284}
            ],
            "grand_total": 32.06,
            "normalized_score": 32.06
        },
        "total_score": 32.06
    },
    {
        "catalog_no": 36,
        "placement": 2,
        "breed_class": "Русская псовая борзая - Юниоры - Общая",
        "qualification": None,
        "vc": None,
        "status": "finished",
        "dog": {"name_lat": "OBEREG RUSI AGAT", "name_ru": "ОБЕРЕГ РУСИ АГАТ", "breed": "Русская псовая борзая", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 47, "bib_number": 1, "bib_color": "red", "time": 37.11, "speed_kmh": 41.714},
                {"heat_number": 58, "bib_number": 3, "bib_color": "white", "time": 33.85, "speed_kmh": 45.731}
            ],
            "grand_total": 33.85,
            "normalized_score": 33.85
        },
        "total_score": 33.85
    },
    {
        "catalog_no": 37,
        "placement": 3,
        "breed_class": "Русская псовая борзая - Юниоры - Общая",
        "qualification": None,
        "vc": None,
        "status": "finished",
        "dog": {"name_lat": "DOROGOY DRUG FIFA", "name_ru": "ДОРОГОЙ ДРУГ ФИФА", "breed": "Русская псовая борзая", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 48, "bib_number": 1, "bib_color": "red", "time": 35.85, "speed_kmh": 43.180},
                {"heat_number": 58, "bib_number": 2, "bib_color": "blue", "time": 34.37, "speed_kmh": 45.039}
            ],
            "grand_total": 34.37,
            "normalized_score": 34.37
        },
        "total_score": 34.37
    },
    {
        "catalog_no": 33,
        "placement": None,
        "breed_class": "Русская псовая борзая - Юниоры - Общая",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "OBEREG RUSI AFRODITA", "name_ru": "ОБЕРЕГ РУСИ АФРОДИТА", "breed": "Русская псовая борзая", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 48, "bib_number": 2, "bib_color": "blue", "time": 46.01, "speed_kmh": 33.645},
                {"heat_number": 58, "bib_number": 4, "bib_color": "black", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },
    {
        "catalog_no": 38,
        "placement": None,
        "breed_class": "Русская псовая борзая - Юниоры - Общая",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "POY-MAYKA", "name_ru": "ПОЙ-МАЙКА", "breed": "Русская псовая борзая", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 47, "bib_number": 3, "bib_color": "white", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 14. Уиппет_Ветераны_Общая (дистанция 330 м)
    {
        "catalog_no": 58,
        "placement": 1,
        "breed_class": "Уиппет - Ветераны - Общая",
        "qualification": "Лучший ветеран",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "EFFLORESCO'S MAVISCAL", "name_ru": "ЭФФЛОРЕСКО'С МАВИСКАЛ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 16, "bib_number": 2, "bib_color": "blue", "time": None, "speed_kmh": None},
                {"heat_number": 36, "bib_number": 3, "bib_color": "white", "time": 24.58, "speed_kmh": 48.332}
            ],
            "grand_total": 24.58,
            "normalized_score": 24.58
        },
        "total_score": 24.58
    },
    {
        "catalog_no": 59,
        "placement": None,
        "breed_class": "Уиппет - Ветераны - Общая",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "ARLETT FAER-SHOT", "name_ru": "АРЛЕТТ ФАЕР-ШОТ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 16, "bib_number": 3, "bib_color": "white", "time": None, "speed_kmh": None},
                {"heat_number": 36, "bib_number": 1, "bib_color": "red", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },
    {
        "catalog_no": 60,
        "placement": None,
        "breed_class": "Уиппет - Ветераны - Общая",
        "qualification": None,
        "vc": None,
        "status": "disqualified",
        "status_reason": "Дисквалификация",
        "dog": {"name_lat": "BUSI VAFA ELFA", "name_ru": "БУСИ ВАФА ЭЛЬФА", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 16, "bib_number": 1, "bib_color": "red", "time": None, "speed_kmh": None},
                {"heat_number": 36, "bib_number": 2, "bib_color": "blue", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 15. Уиппет_Стандартный_Кобели (дистанция 330 м)
    {
        "catalog_no": 66,
        "placement": 1,
        "breed_class": "Уиппет - Стандартный - Кобели",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "STANGERS LAND BLACKTHORNE WINTER", "name_ru": "СТЭНДЖЕРС ЛЭНД БЛЭКТОРН ВИНТЕР", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 9, "bib_number": 3, "bib_color": "white", "time": 23.28, "speed_kmh": 51.031},
                {"heat_number": 27, "bib_number": 1, "bib_color": "red", "time": 22.74, "speed_kmh": 52.243},
                {"heat_number": 40, "bib_number": 1, "bib_color": "red", "time": 22.72, "speed_kmh": 52.289}
            ],
            "grand_total": 22.72,
            "normalized_score": 22.72
        },
        "total_score": 22.72
    },
    {
        "catalog_no": 63,
        "placement": 2,
        "breed_class": "Уиппет - Стандартный - Кобели",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "GUY", "name_ru": "ГАЙ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 11, "bib_number": 2, "bib_color": "blue", "time": 22.98, "speed_kmh": 51.697},
                {"heat_number": 26, "bib_number": 1, "bib_color": "red", "time": 23.25, "speed_kmh": 51.097},
                {"heat_number": 40, "bib_number": 4, "bib_color": "black", "time": 23.59, "speed_kmh": 50.360}
            ],
            "grand_total": 23.59,
            "normalized_score": 23.59
        },
        "total_score": 23.59
    },
    {
        "catalog_no": 64,
        "placement": 3,
        "breed_class": "Уиппет - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "LET IT BE", "name_ru": "ЛЕТ ИТ БИ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 9, "bib_number": 1, "bib_color": "red", "time": 22.94, "speed_kmh": 51.787},
                {"heat_number": 25, "bib_number": 1, "bib_color": "red", "time": 23.94, "speed_kmh": 49.624},
                {"heat_number": 40, "bib_number": 3, "bib_color": "white", "time": 23.97, "speed_kmh": 49.562}
            ],
            "grand_total": 23.97,
            "normalized_score": 23.97
        },
        "total_score": 23.97
    },
    {
        "catalog_no": 65,
        "placement": None,
        "breed_class": "Уиппет - Стандартный - Кобели",
        "qualification": None,
        "vc": None,
        "status": "disqualified",
        "status_reason": "Дисквалификация",
        "dog": {"name_lat": "RUNNING RAIDERS GRIM REAPER", "name_ru": "РАННИНГ РЕЙДЕРС ГРИМ РИПЕР", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 10, "bib_number": 3, "bib_color": "white", "time": 23.42, "speed_kmh": 50.726},
                {"heat_number": 27, "bib_number": 2, "bib_color": "blue", "time": 22.87, "speed_kmh": 51.946},
                {"heat_number": 40, "bib_number": 2, "bib_color": "blue", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },
    {
        "catalog_no": 68,
        "placement": 5,
        "breed_class": "Уиппет - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "STRONG STOAT", "name_ru": "СТРОНГ СТОУТ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 10, "bib_number": 2, "bib_color": "blue", "time": 23.50, "speed_kmh": 50.553},
                {"heat_number": 26, "bib_number": 2, "bib_color": "blue", "time": 23.17, "speed_kmh": 51.273}
            ],
            "grand_total": 23.17,
            "normalized_score": 23.17
        },
        "total_score": 23.17
    },
    {
        "catalog_no": 69,
        "placement": 6,
        "breed_class": "Уиппет - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "DZHINI LAMBOR", "name_ru": "ДЖИНИ ЛАМБОР", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 10, "bib_number": 1, "bib_color": "red", "time": 23.80, "speed_kmh": 49.916},
                {"heat_number": 25, "bib_number": 2, "bib_color": "blue", "time": 23.59, "speed_kmh": 50.360}
            ],
            "grand_total": 23.59,
            "normalized_score": 23.59
        },
        "total_score": 23.59
    },
    {
        "catalog_no": 67,
        "placement": 7,
        "breed_class": "Уиппет - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "STEEL SWIFT", "name_ru": "СТИЛ СВИФТ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 11, "bib_number": 1, "bib_color": "red", "time": 23.91, "speed_kmh": 49.686},
                {"heat_number": 26, "bib_number": 3, "bib_color": "white", "time": 23.68, "speed_kmh": 50.169}
            ],
            "grand_total": 23.68,
            "normalized_score": 23.68
        },
        "total_score": 23.68
    },
    {
        "catalog_no": 62,
        "placement": 8,
        "breed_class": "Уиппет - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "GORDEY", "name_ru": "ГОРДЕЙ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 11, "bib_number": 3, "bib_color": "white", "time": 23.85, "speed_kmh": 49.811},
                {"heat_number": 25, "bib_number": 3, "bib_color": "white", "time": 23.79, "speed_kmh": 49.937}
            ],
            "grand_total": 23.79,
            "normalized_score": 23.79
        },
        "total_score": 23.79
    },
    {
        "catalog_no": 61,
        "placement": 9,
        "breed_class": "Уиппет - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "BRILLIANT FLASH", "name_ru": "БРИЛЛИАНТ ФЛЭШ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 9, "bib_number": 2, "bib_color": "blue", "time": 24.31, "speed_kmh": 48.869},
                {"heat_number": 27, "bib_number": 3, "bib_color": "white", "time": 24.38, "speed_kmh": 48.728}
            ],
            "grand_total": 24.31,
            "normalized_score": 24.31
        },
        "total_score": 24.31
    },

    # 16. Уиппет_Стандартный_Суки (дистанция 330 м)
    {
        "catalog_no": 74,
        "placement": 1,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "PALLADA ASTRUM", "name_ru": "ПАЛЛАДА АСТРУМ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 12, "bib_number": 2, "bib_color": "blue", "time": 22.62, "speed_kmh": 52.520},
                {"heat_number": 28, "bib_number": 1, "bib_color": "red", "time": 22.72, "speed_kmh": 52.289},
                {"heat_number": 41, "bib_number": 1, "bib_color": "red", "time": 22.62, "speed_kmh": 52.520}
            ],
            "grand_total": 22.62,
            "normalized_score": 22.62
        },
        "total_score": 22.62
    },
    {
        "catalog_no": 75,
        "placement": 2,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "PRIMA POLARIS", "name_ru": "ПРИМА ПОЛЯРИС", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 12, "bib_number": 4, "bib_color": "black", "time": 22.95, "speed_kmh": 51.765},
                {"heat_number": 29, "bib_number": 1, "bib_color": "red", "time": 24.23, "speed_kmh": 49.030},
                {"heat_number": 41, "bib_number": 2, "bib_color": "blue", "time": 23.11, "speed_kmh": 51.406}
            ],
            "grand_total": 23.11,
            "normalized_score": 23.11
        },
        "total_score": 23.11
    },
    {
        "catalog_no": 71,
        "placement": 3,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "ERIKMAN'S FIRE CARNELIA", "name_ru": "ЭРИКМАН'С ФАЕР КАРНЕЛИЯ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 12, "bib_number": 1, "bib_color": "red", "time": 23.09, "speed_kmh": 51.451},
                {"heat_number": 30, "bib_number": 2, "bib_color": "blue", "time": 23.25, "speed_kmh": 51.097},
                {"heat_number": 41, "bib_number": 4, "bib_color": "black", "time": 23.22, "speed_kmh": 51.163}
            ],
            "grand_total": 23.22,
            "normalized_score": 23.22
        },
        "total_score": 23.22
    },
    {
        "catalog_no": 76,
        "placement": 4,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "RUNNING WAVE", "name_ru": "РАННИНГ ВЕЙВ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 14, "bib_number": 2, "bib_color": "blue", "time": 22.99, "speed_kmh": 51.675},
                {"heat_number": 30, "bib_number": 1, "bib_color": "red", "time": 23.64, "speed_kmh": 50.254},
                {"heat_number": 41, "bib_number": 3, "bib_color": "white", "time": 24.08, "speed_kmh": 49.336}
            ],
            "grand_total": 24.08,
            "normalized_score": 24.08
        },
        "total_score": 24.08
    },
    {
        "catalog_no": 78,
        "placement": 5,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "SNOW SWALLOW", "name_ru": "СНОУ СВОЛЛОУ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 13, "bib_number": 2, "bib_color": "blue", "time": 23.31, "speed_kmh": 50.965},
                {"heat_number": 29, "bib_number": 3, "bib_color": "white", "time": 23.69, "speed_kmh": 50.148}
            ],
            "grand_total": 23.31,
            "normalized_score": 23.31
        },
        "total_score": 23.31
    },
    {
        "catalog_no": 77,
        "placement": 6,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "SILVER SABLE", "name_ru": "СИЛЬВЕР СЕЙБЛ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 13, "bib_number": 3, "bib_color": "white", "time": 23.34, "speed_kmh": 50.900},
                {"heat_number": 28, "bib_number": 2, "bib_color": "blue", "time": 23.86, "speed_kmh": 49.790}
            ],
            "grand_total": 23.34,
            "normalized_score": 23.34
        },
        "total_score": 23.34
    },
    {
        "catalog_no": 70,
        "placement": 7,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "BAFFI BLIZZARD BLACK", "name_ru": "БАФФИ БЛИЗЗАРД БЛЭК", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 14, "bib_number": 1, "bib_color": "red", "time": 24.13, "speed_kmh": 49.233},
                {"heat_number": 28, "bib_number": 3, "bib_color": "white", "time": 24.15, "speed_kmh": 49.193}
            ],
            "grand_total": 24.13,
            "normalized_score": 24.13
        },
        "total_score": 24.13
    },
    {
        "catalog_no": 72,
        "placement": 8,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "LAST UNICORN", "name_ru": "ЛАСТ ЮНИКОРН", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 12, "bib_number": 3, "bib_color": "white", "time": 24.39, "speed_kmh": 48.708},
                {"heat_number": 29, "bib_number": 3, "bib_color": "white", "time": 25.66, "speed_kmh": 46.298}
            ],
            "grand_total": 24.39,
            "normalized_score": 24.39
        },
        "total_score": 24.39
    },
    {
        "catalog_no": 79,
        "placement": 9,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "FEYRI TEYL", "name_ru": "ФЕЙРИ ТЕЙЛ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 14, "bib_number": 3, "bib_color": "white", "time": 25.00, "speed_kmh": 47.520},
                {"heat_number": 30, "bib_number": 3, "bib_color": "white", "time": 24.87, "speed_kmh": 47.768}
            ],
            "grand_total": 24.87,
            "normalized_score": 24.87
        },
        "total_score": 24.87
    },
    {
        "catalog_no": 73,
        "placement": None,
        "breed_class": "Уиппет - Стандартный - Суки",
        "qualification": None,
        "vc": None,
        "status": "retired",
        "status_reason": "Сошёл",
        "dog": {"name_lat": "LUXURY WHIPP LADY DAY", "name_ru": "ЛАКШЕРИ ВИПП ЛЕДИ ДЕЙ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 13, "bib_number": 1, "bib_color": "red", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 17. Уиппет_Стандартный-спринтеры_Кобели (дистанция 330 м)
    {
        "catalog_no": 44,
        "placement": 1,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "VARLOK YARKAYA MOLNIYA", "name_ru": "ВАРЛОК ЯРКАЯ МОЛНИЯ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 5, "bib_number": 3, "bib_color": "white", "time": 23.24, "speed_kmh": 51.119},
                {"heat_number": 22, "bib_number": 1, "bib_color": "red", "time": 23.44, "speed_kmh": 50.683},
                {"heat_number": 38, "bib_number": 3, "bib_color": "white", "time": 23.38, "speed_kmh": 50.813}
            ],
            "grand_total": 23.38,
            "normalized_score": 23.38
        },
        "total_score": 23.38
    },
    {
        "catalog_no": 42,
        "placement": 2,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "BLACK JACK", "name_ru": "БЛЭК ДЖЕК", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 4, "bib_number": 2, "bib_color": "blue", "time": 23.44, "speed_kmh": 50.683},
                {"heat_number": 22, "bib_number": 2, "bib_color": "blue", "time": 23.85, "speed_kmh": 49.811},
                {"heat_number": 38, "bib_number": 4, "bib_color": "black", "time": 23.50, "speed_kmh": 50.553}
            ],
            "grand_total": 23.50,
            "normalized_score": 23.50
        },
        "total_score": 23.50
    },
    {
        "catalog_no": 43,
        "placement": 3,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "SHOW MUST GO ON", "name_ru": "ШОУ МАСТ ГОУ ОН", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 4, "bib_number": 4, "bib_color": "black", "time": 22.77, "speed_kmh": 52.174},
                {"heat_number": 20, "bib_number": 1, "bib_color": "red", "time": 23.11, "speed_kmh": 51.406},
                {"heat_number": 38, "bib_number": 1, "bib_color": "red", "time": 23.58, "speed_kmh": 50.382}
            ],
            "grand_total": 23.58,
            "normalized_score": 23.58
        },
        "total_score": 23.58
    },
    {
        "catalog_no": 40,
        "placement": 4,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "AVATAR S PLANETY PANDORA", "name_ru": "АВАТАР С ПЛАНЕТЫ ПАНДОРА", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 3, "bib_number": 3, "bib_color": "white", "time": 23.06, "speed_kmh": 51.518},
                {"heat_number": 21, "bib_number": 1, "bib_color": "red", "time": 23.26, "speed_kmh": 51.075},
                {"heat_number": 38, "bib_number": 2, "bib_color": "blue", "time": 23.60, "speed_kmh": 50.339}
            ],
            "grand_total": 23.60,
            "normalized_score": 23.60
        },
        "total_score": 23.60
    },
    {
        "catalog_no": 41,
        "placement": 5,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "BATMAN NIGHT SHADOW", "name_ru": "БЭТМАН НАЙТ ШЭДОУ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 4, "bib_number": 1, "bib_color": "red", "time": 23.58, "speed_kmh": 50.382},
                {"heat_number": 20, "bib_number": 2, "bib_color": "blue", "time": 23.48, "speed_kmh": 50.596}
            ],
            "grand_total": 23.48,
            "normalized_score": 23.48
        },
        "total_score": 23.48
    },
    {
        "catalog_no": 50,
        "placement": 6,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "KETLIN RUTGER", "name_ru": "КЕТЛИН РУТГЕР", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 5, "bib_number": 4, "bib_color": "black", "time": 23.51, "speed_kmh": 50.532},
                {"heat_number": 21, "bib_number": 2, "bib_color": "blue", "time": 23.51, "speed_kmh": 50.532}
            ],
            "grand_total": 23.51,
            "normalized_score": 23.51
        },
        "total_score": 23.51
    },
    {
        "catalog_no": 51,
        "placement": 7,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "KULIKOVO POLE GERMES", "name_ru": "КУЛИКОВО ПОЛЕ ГЕРМЕС", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 6, "bib_number": 1, "bib_color": "red", "time": 24.00, "speed_kmh": 49.500},
                {"heat_number": 21, "bib_number": 3, "bib_color": "white", "time": 23.79, "speed_kmh": 49.937}
            ],
            "grand_total": 23.79,
            "normalized_score": 23.79
        },
        "total_score": 23.79
    },
    {
        "catalog_no": 46,
        "placement": 8,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "VARVAR KONAN BESSTRASHNYY", "name_ru": "ВАРВАР КОНАН БЕССТРАШНЫЙ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 6, "bib_number": 2, "bib_color": "blue", "time": 23.79, "speed_kmh": 49.937},
                {"heat_number": 20, "bib_number": 3, "bib_color": "white", "time": 23.91, "speed_kmh": 49.686}
            ],
            "grand_total": 23.79,
            "normalized_score": 23.79
        },
        "total_score": 23.79
    },
    {
        "catalog_no": 47,
        "placement": 9,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "GRINCH NOCHNOY POLET", "name_ru": "ГРИНЧ НОЧНОЙ ПОЛЕТ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 5, "bib_number": 1, "bib_color": "red", "time": 24.17, "speed_kmh": 49.152},
                {"heat_number": 22, "bib_number": 3, "bib_color": "white", "time": 23.89, "speed_kmh": 49.728}
            ],
            "grand_total": 23.89,
            "normalized_score": 23.89
        },
        "total_score": 23.89
    },
    {
        "catalog_no": 48,
        "placement": 10,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "ZIGVARD IZ SAGI O GAR豐ARIKE", "name_ru": "ЗИГВАРД ИЗ САГИ О ГАРДАРИКЕ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 6, "bib_number": 3, "bib_color": "white", "time": 24.28, "speed_kmh": 48.929},
                {"heat_number": 22, "bib_number": 4, "bib_color": "black", "time": 25.11, "speed_kmh": 47.312}
            ],
            "grand_total": 24.28,
            "normalized_score": 24.28
        },
        "total_score": 24.28
    },
    {
        "catalog_no": 45,
        "placement": 11,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "AMOROUS BABY ULTRAVIOLET EUGENE", "name_ru": "АМОРОУС БЭБИ УЛЬТРАВИОЛЕТ ЮДЖИН", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 5, "bib_number": 2, "bib_color": "blue", "time": 24.60, "speed_kmh": 48.293},
                {"heat_number": 21, "bib_number": 4, "bib_color": "black", "time": 24.50, "speed_kmh": 48.490}
            ],
            "grand_total": 24.50,
            "normalized_score": 24.50
        },
        "total_score": 24.50
    },
    {
        "catalog_no": 49,
        "placement": 12,
        "breed_class": "Уиппет - Стандартный-спринтеры - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "ZORKIY SOKOL IZ DOMA PRONINYKH", "name_ru": "ЗОРКИЙ СОКОЛ ИЗ ДОМА ПРОНИНЫХ", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 6, "bib_number": 4, "bib_color": "black", "time": 25.12, "speed_kmh": 47.293},
                {"heat_number": 20, "bib_number": 4, "bib_color": "black", "time": 24.97, "speed_kmh": 47.577}
            ],
            "grand_total": 24.97,
            "normalized_score": 24.97
        },
        "total_score": 24.97
    },

    # 18. Уиппет_Стандартный-спринтеры_Суки (дистанция 330 м)
    {
        "catalog_no": 54,
        "placement": 1,
        "breed_class": "Уиппет - Стандартный-спринтеры - Суки",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "FUMMA SPIRIT", "name_ru": "ФУММА СПИРИТ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 7, "bib_number": 2, "bib_color": "blue", "time": 22.83, "speed_kmh": 52.037},
                {"heat_number": 23, "bib_number": 1, "bib_color": "red", "time": 22.87, "speed_kmh": 51.946},
                {"heat_number": 39, "bib_number": 1, "bib_color": "red", "time": 23.43, "speed_kmh": 50.704}
            ],
            "grand_total": 23.43,
            "normalized_score": 23.43
        },
        "total_score": 23.43
    },
    {
        "catalog_no": 57,
        "placement": 2,
        "breed_class": "Уиппет - Стандартный-спринтеры - Суки",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "LAKSHERI VIPP MIRABELLA", "name_ru": "ЛАКШЕРИ ВИПП МИРАБЕЛЛА", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 8, "bib_number": 3, "bib_color": "white", "time": 23.74, "speed_kmh": 50.042},
                {"heat_number": 24, "bib_number": 1, "bib_color": "red", "time": 23.16, "speed_kmh": 51.295},
                {"heat_number": 39, "bib_number": 2, "bib_color": "blue", "time": 23.48, "speed_kmh": 50.596}
            ],
            "grand_total": 23.48,
            "normalized_score": 23.48
        },
        "total_score": 23.48
    },
    {
        "catalog_no": 56,
        "placement": 3,
        "breed_class": "Уиппет - Стандартный-спринтеры - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "KULIKOVO POLE GORDEYA", "name_ru": "КУЛИКОВО ПОЛЕ ГОРДЕЯ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 8, "bib_number": 2, "bib_color": "blue", "time": 24.62, "speed_kmh": 48.253},
                {"heat_number": 23, "bib_number": 2, "bib_color": "blue", "time": 24.32, "speed_kmh": 48.849},
                {"heat_number": 39, "bib_number": 4, "bib_color": "black", "time": 24.09, "speed_kmh": 49.315}
            ],
            "grand_total": 24.09,
            "normalized_score": 24.09
        },
        "total_score": 24.09
    },
    {
        "catalog_no": 53,
        "placement": 4,
        "breed_class": "Уиппет - Стандартный-спринтеры - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "LAVING BRIZ FLORENCE", "name_ru": "ЛАВИНГ БРИЗ ФЛОРЕНС", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 7, "bib_number": 1, "bib_color": "red", "time": 23.96, "speed_kmh": 49.583},
                {"heat_number": 24, "bib_number": 2, "bib_color": "blue", "time": 24.48, "speed_kmh": 48.529},
                {"heat_number": 39, "bib_number": 3, "bib_color": "white", "time": 24.51, "speed_kmh": 48.470}
            ],
            "grand_total": 24.51,
            "normalized_score": 24.51
        },
        "total_score": 24.51
    },
    {
        "catalog_no": 52,
        "placement": 5,
        "breed_class": "Уиппет - Стандартный-спринтеры - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "ENTAYLI YOZ", "name_ru": "ЭНТАЙЛИ ЕЗ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 7, "bib_number": 3, "bib_color": "white", "time": 24.48, "speed_kmh": 48.529},
                {"heat_number": 23, "bib_number": 3, "bib_color": "white", "time": 24.33, "speed_kmh": 48.829}
            ],
            "grand_total": 24.33,
            "normalized_score": 24.33
        },
        "total_score": 24.33
    },
    {
        "catalog_no": 55,
        "placement": 6,
        "breed_class": "Уиппет - Стандартный-спринтеры - Суки",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "GINURA YUTTA KULUMA", "name_ru": "ГИНУРА ЮТТА КУЛУМА", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 8, "bib_number": 1, "bib_color": "red", "time": 24.74, "speed_kmh": 48.019},
                {"heat_number": 24, "bib_number": 3, "bib_color": "white", "time": 24.35, "speed_kmh": 48.789}
            ],
            "grand_total": 24.35,
            "normalized_score": 24.35
        },
        "total_score": 24.35
    },

    # 19. Уиппет_Юниоры_Общая (дистанция 330 м)
    {
        "catalog_no": 80,
        "placement": 1,
        "breed_class": "Уиппет - Юниоры - Общая",
        "qualification": "Лучший юниор",
        "vc": None,
        "status": "finished",
        "dog": {"name_lat": "LAKSHERI VIPP NORD VIND", "name_ru": "ЛАКШЕРИ ВИПП НОРД ВИНД", "breed": "Уиппет", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 15, "bib_number": 3, "bib_color": "white", "time": 23.55, "speed_kmh": 50.446},
                {"heat_number": 37, "bib_number": 1, "bib_color": "red", "time": 23.50, "speed_kmh": 50.553}
            ],
            "grand_total": 23.50,
            "normalized_score": 23.50
        },
        "total_score": 23.50
    },
    {
        "catalog_no": 82,
        "placement": 2,
        "breed_class": "Уиппет - Юниоры - Общая",
        "qualification": None,
        "vc": None,
        "status": "finished",
        "dog": {"name_lat": "LAKSHERI VIPP NY U BELLE", "name_ru": "ЛАКШЕРИ ВИПП НЬЮ БЕЛЛЕ", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 15, "bib_number": 1, "bib_color": "red", "time": 24.21, "speed_kmh": 49.071},
                {"heat_number": 37, "bib_number": 2, "bib_color": "blue", "time": 24.20, "speed_kmh": 49.091}
            ],
            "grand_total": 24.20,
            "normalized_score": 24.20
        },
        "total_score": 24.20
    },
    {
        "catalog_no": 81,
        "placement": 3,
        "breed_class": "Уиппет - Юниоры - Общая",
        "qualification": None,
        "vc": None,
        "status": "finished",
        "dog": {"name_lat": "LAKSHERI VIPP NIKITA", "name_ru": "ЛАКШЕРИ ВИПП НИКИТА", "breed": "Уиппет", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 15, "bib_number": 2, "bib_color": "blue", "time": 24.51, "speed_kmh": 48.470},
                {"heat_number": 37, "bib_number": 3, "bib_color": "white", "time": 24.35, "speed_kmh": 48.789}
            ],
            "grand_total": 24.35,
            "normalized_score": 24.35
        },
        "total_score": 24.35
    },

    # 20. Фараонова собака_Стандартный_Общая (дистанция 430 м)
    {
        "catalog_no": 85,
        "placement": 1,
        "breed_class": "Фараонова собака - Стандартный - Общая",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "REEDLY ROAD MYBERN", "name_ru": "РИДЛИ РОАД МАЙБЕРН", "breed": "Фараонова собака", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 55, "bib_number": 1, "bib_color": "red", "time": 36.90, "speed_kmh": 41.951},
                {"heat_number": 64, "bib_number": 1, "bib_color": "red", "time": 37.27, "speed_kmh": 41.535}
            ],
            "grand_total": 37.27,
            "normalized_score": 37.27
        },
        "total_score": 37.27
    },
    {
        "catalog_no": 86,
        "placement": 2,
        "breed_class": "Фараонова собака - Стандартный - Общая",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "REEDLY ROAD NIGHTY NIGHT", "name_ru": "РИДЛИ РОАД НАЙТИ НАЙТ", "breed": "Фараонова собака", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 55, "bib_number": 2, "bib_color": "blue", "time": 37.44, "speed_kmh": 41.346},
                {"heat_number": 64, "bib_number": 2, "bib_color": "blue", "time": 38.28, "speed_kmh": 40.439}
            ],
            "grand_total": 38.28,
            "normalized_score": 38.28
        },
        "total_score": 38.28
    },
    {
        "catalog_no": 84,
        "placement": 3,
        "breed_class": "Фараонова собака - Стандартный - Общая",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "RIDLI ROAD KVIDDICH", "name_ru": "РИДЛИ РОАД КВИДДИЧ", "breed": "Фараонова собака", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 55, "bib_number": 3, "bib_color": "white", "time": 39.13, "speed_kmh": 39.560},
                {"heat_number": 64, "bib_number": 3, "bib_color": "white", "time": 41.59, "speed_kmh": 37.220}
            ],
            "grand_total": 41.59,
            "normalized_score": 41.59
        },
        "total_score": 41.59
    },
    {
        "catalog_no": 83,
        "placement": None,
        "breed_class": "Фараонова собака - Стандартный - Общая",
        "qualification": None,
        "vc": None,
        "status": "withdrawn",
        "status_reason": "Снят",
        "dog": {"name_lat": "LIBERTY INDIGO STAR", "name_ru": "ЛИБЕРТИ ИНДИГО СТАР", "breed": "Фараонова собака", "sex": "Сука"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 430,
            "heats": [
                {"heat_number": 55, "bib_number": 4, "bib_color": "black", "time": None, "speed_kmh": None}
            ],
            "grand_total": None,
            "normalized_score": None
        },
        "total_score": None
    },

    # 21. Чирнеко дель Этна_Стандартный_Кобели (дистанция 330 м)
    {
        "catalog_no": 87,
        "placement": 1,
        "breed_class": "Чирнеко дель Этна - Стандартный - Кобели",
        "qualification": "Чемпион России",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "COLISTO'S BIRBO", "name_ru": "КОЛИСТО'С БИРБО", "breed": "Чирнеко дель Этна", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 19, "bib_number": 2, "bib_color": "blue", "time": 27.16, "speed_kmh": 43.741},
                {"heat_number": 35, "bib_number": 1, "bib_color": "red", "time": 27.15, "speed_kmh": 43.757}
            ],
            "grand_total": 27.15,
            "normalized_score": 27.15
        },
        "total_score": 27.15
    },
    {
        "catalog_no": 89,
        "placement": 2,
        "breed_class": "Чирнеко дель Этна - Стандартный - Кобели",
        "qualification": "CACL",
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "TESORO SOLARE FORTUNATO", "name_ru": "ТЕЗОРО СОЛАРЕ ФОРТУНАТО", "breed": "Чирнеко дель Этна", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 19, "bib_number": 3, "bib_color": "white", "time": 27.61, "speed_kmh": 43.028},
                {"heat_number": 35, "bib_number": 2, "bib_color": "blue", "time": 27.81, "speed_kmh": 42.718}
            ],
            "grand_total": 27.81,
            "normalized_score": 27.81
        },
        "total_score": 27.81
    },
    {
        "catalog_no": 88,
        "placement": 3,
        "breed_class": "Чирнеко дель Этна - Стандартный - Кобели",
        "qualification": None,
        "vc": "CC",
        "status": "finished",
        "dog": {"name_lat": "SOLLUCERO", "name_ru": "СОЛЛУЧЕРО", "breed": "Чирнеко дель Этна", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": [
                {"heat_number": 19, "bib_number": 1, "bib_color": "red", "time": 29.85, "speed_kmh": 39.799},
                {"heat_number": 35, "bib_number": 3, "bib_color": "white", "time": 31.23, "speed_kmh": 38.040}
            ],
            "grand_total": 31.23,
            "normalized_score": 31.23
        },
        "total_score": 31.23
    },

    # DNS
    {
        "catalog_no": 4,
        "placement": None,
        "breed_class": "Басенджи - Стандартный - Кобели",
        "qualification": None,
        "vc": None,
        "status": "dns",
        "status_reason": "Неявка",
        "dog": {"name_lat": "UILL OF ADAMANT", "name_ru": "УИЛЛ ОФ АДАМАНТ", "breed": "Басенджи", "sex": "Кобель"},
        "raw_scores_json": {
            "format": "racing",
            "distance": 330,
            "heats": []
        },
        "total_score": None
    }
]

# Validation math
err_count = 0
for r in results:
    dist = r["raw_scores_json"].get("distance", 330)
    for h in r["raw_scores_json"].get("heats", []):
        t = h.get("time")
        spd = h.get("speed_kmh")
        if t and spd:
            calc_spd = round((dist / t) * 3.6, 3)
            diff = abs(calc_spd - spd)
            if diff > 0.005:
                print(f"Speed mismatch in dog {r['catalog_no']} heat {h['heat_number']}: listed {spd}, calc {calc_spd}")
                err_count += 1

print(f"Total dogs: {len(results)}, math errors: {err_count}")

draft = {
    "event_id": 20210613,
    "title": "Чемпионат России по бегам борзых за механическим зайцем",
    "rank_label": "Чемпионат России\n(Бега борзых)",
    "event_type": "racing",
    "competition_kind": "Чемпионат России",
    "competition_type": "Бега борзых",
    "date_start": "2021-06-13",
    "date_end": None,
    "host_club": "Новый Милет",
    "location": "Московская область, Новый Милет",
    "judges": "Серова Т.Г., Егорова М.А., Куликова Г.В., Иванова Г.С.",
    "results": results
}

with open("data/temp/draft-2021-06-13.json", "w", encoding="utf-8") as f:
    json.dump(draft, f, ensure_ascii=False, indent=2)

print("Saved data/temp/draft-2021-06-13.json")
