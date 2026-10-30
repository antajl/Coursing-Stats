import json

null = None
true = True
false = False

dogs = [
    # Американский пит-бультерьер - Стандартный - Суки
    {
        "catalog_num": 1,
        "name_ru": "BRAVE FIGHTER'S MILK AND HONEY",
        "name_en": "BRAVE FIGHTER'S MILK AND HONEY",
        "breed": "Американский пит-бультерьер",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 3, "collar": "red",
            "j1": [17, 18, 17, 17, 16], # sum=85
            "j2": [16, 17, 16, 15, 16], # sum=80
            "total": 165
        },
        "heat2": {
            "heat_num": 14, "collar": "red",
            "j1": [17, 18, 18, 12, 16], # sum=81
            "j2": [15, 18, 17, 15, 17], # sum=82
            "total": 163
        },
        "total_score": 328
    },
    # Американский пит-бультерьер - Юниоры - Общая
    {
        "catalog_num": 4,
        "name_ru": "BRAVE FIGHTER'S UNCHAIN MY HEART",
        "name_en": "BRAVE FIGHTER'S UNCHAIN MY HEART",
        "breed": "Американский пит-бультерьер",
        "gender": "male",
        "class": "junior",
        "place": 1,
        "cert": "",
        "title": "Лучший юниор",
        "status": "finished",
        "heat1": {
            "heat_num": 1, "collar": "white",
            "j1": [17, 17, 17, 17, 17], # sum=85
            "j2": [17, 17, 17, 17, 17], # sum=85
            "total": 170
        },
        "heat2": {
            "heat_num": 13, "collar": "white",
            "j1": [17, 18, 18, 18, 18], # sum=89
            "j2": [17, 16, 16, 17, 18], # sum=84
            "total": 173
        },
        "total_score": 343
    },
    {
        "catalog_num": 5,
        "name_ru": "BRAVE FIGHTER'S ULTIMA",
        "name_en": "BRAVE FIGHTER'S ULTIMA",
        "breed": "Американский пит-бультерьер",
        "gender": "female",
        "class": "junior",
        "place": 2,
        "cert": "",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 2, "collar": "white",
            "j1": [17, 17, 16, 17, 18], # sum=85
            "j2": [17, 16, 16, 17, 17], # sum=83
            "total": 168
        },
        "heat2": {
            "heat_num": 13, "collar": "red",
            "j1": [17, 18, 17, 18, 18], # sum=88
            "j2": [17, 17, 16, 17, 19], # sum=86
            "total": 174
        },
        "total_score": 342
    },
    {
        "catalog_num": 2,
        "name_ru": "BRAVE FIGHTER'S FORT KNOX",
        "name_en": "BRAVE FIGHTER'S FORT KNOX",
        "breed": "Американский пит-бультерьер",
        "gender": "male",
        "class": "junior",
        "place": 3,
        "cert": "",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 1, "collar": "red",
            "j1": [15, 17, 17, 16, 17], # sum=82
            "j2": [15, 16, 15, 16, 16], # sum=78
            "total": 160
        },
        "heat2": {
            "heat_num": 12, "collar": "red",
            "j1": [17, 18, 17, 18, 18], # sum=88
            "j2": [17, 17, 16, 18, 19], # sum=87
            "total": 175
        },
        "total_score": 335
    },
    {
        "catalog_num": 3,
        "name_ru": "BRAVE FIGHTER'S TORETTO",
        "name_en": "BRAVE FIGHTER'S TORETTO",
        "breed": "Американский пит-бультерьер",
        "gender": "male",
        "class": "junior",
        "place": 4,
        "cert": "",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 2, "collar": "red",
            "j1": [16, 17, 16, 17, 17], # sum=83
            "j2": [17, 17, 16, 17, 17], # sum=84
            "total": 167
        },
        "heat2": {
            "heat_num": 12, "collar": "white",
            "j1": [16, 16, 16, 15, 15], # sum=78
            "j2": [15, 16, 15, 16, 16], # sum=78
            "total": 156
        },
        "total_score": 323
    },
    # Американский стаффордширский терьер - Стандартный - Суки
    {
        "catalog_num": 6,
        "name_ru": "РУССКИЙ ФАВОРИТ БЕССОННАЯ НОЧЬ",
        "name_en": "RUSSKIY FAVORIT BESSONNAYA NOCH",
        "breed": "Американский стаффордширский терьер",
        "gender": "female",
        "class": "standard",
        "place": None,
        "cert": "",
        "title": "",
        "status": "finished", # ran heat 1, withdrawn heat 2
        "heat1": {
            "heat_num": 4, "collar": "red",
            "j1": [18, 18, 16, 17, 17], # sum=86
            "j2": [17, 16, 16, 17, 17], # sum=83
            "total": 169
        },
        "heat2": {
            "heat_num": 15, "collar": "red",
            "disqualified": True,
            "disqualification_reason": "Снят"
        },
        "total_score": 169
    },
    # Ирландский терьер - Стандартный - Общая
    {
        "catalog_num": 8,
        "name_ru": "БЕСЦЕННЫЙ ПОДАРОК ИЗ ДОМА АЛАНТЕС",
        "name_en": "BESTSENNYI PODAROK IZ DOMA ALANTES",
        "breed": "Ирландский терьер",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 6, "collar": "red",
            "j1": [17, 18, 17, 17, 17], # sum=86
            "j2": [17, 17, 17, 18, 17], # sum=86
            "total": 172
        },
        "heat2": {
            "heat_num": 16, "collar": "red",
            "j1": [17, 18, 18, 17, 17], # sum=87
            "j2": [17, 16, 16, 17, 17], # sum=83
            "total": 170
        },
        "total_score": 342
    },
    {
        "catalog_num": 9,
        "name_ru": "ЮРАТЕ ЯНТАРНАЯ КАПЛЯ",
        "name_en": "YURATE YANTARNAYA KAPLYA",
        "breed": "Ирландский терьер",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 5, "collar": "red",
            "j1": [17, 18, 18, 17, 17], # sum=87
            "j2": [16, 17, 16, 16, 17], # sum=82
            "total": 169
        },
        "heat2": {
            "heat_num": 16, "collar": "white",
            "j1": [16, 18, 18, 16, 17], # wait, let's check: 16+18+18+16+17 = 85
            "j2": [16, 17, 16, 15, 17], # sum=81 -> 85 + 81 = 166!
            "total": 166
        },
        "total_score": 335
    },
    {
        "catalog_num": 7,
        "name_ru": "НЕЖНОЕ ПЛАМЯ ЩЕДВИН ВОИН СЕВЕРА",
        "name_en": "NEZHNOYE PLAMYA SCHEDVIN VOIN SEVERA",
        "breed": "Ирландский терьер",
        "gender": "male",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 5, "collar": "white",
            "j1": [16, 18, 16, 15, 13], # sum=78
            "j2": [17, 16, 15, 15, 16], # sum=79
            "total": 157
        },
        "heat2": {
            "heat_num": 17, "collar": "red",
            "j1": [18, 18, 18, 18, 18], # sum=90
            "j2": [17, 16, 16, 17, 17], # sum=83
            "total": 173
        },
        "total_score": 330
    },
    # Итальянская короткошерстная гончая - Стандартный - Суки
    {
        "catalog_num": 10,
        "name_ru": "ПАФИАНА",
        "name_en": "PAFIANA",
        "breed": "Итальянская короткошерстная гончая",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 7, "collar": "red",
            "j1": [17, 18, 18, 18, 18], # sum=89
            "j2": [17, 17, 17, 18, 18], # sum=87
            "total": 176
        },
        "heat2": {
            "heat_num": 18, "collar": "red",
            "j1": [17, 18, 18, 17, 18], # sum=88
            "j2": [17, 18, 17, 17, 18], # sum=87
            "total": 175
        },
        "total_score": 351
    },
    # Метис - Стандартный - Общая
    {
        "catalog_num": 13,
        "name_ru": "КНОПА",
        "name_en": "KNOPA",
        "breed": "Метис",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 9, "collar": "red",
            "j1": [18, 18, 18, 17, 18], # sum=89
            "j2": [16, 17, 17, 17, 17], # sum=84
            "total": 173
        },
        "heat2": {
            "heat_num": 19, "collar": "white",
            "j1": [18, 18, 18, 18, 17], # sum=89
            "j2": [17, 17, 16, 17, 18], # sum=85
            "total": 174
        },
        "total_score": 347
    },
    {
        "catalog_num": 12,
        "name_ru": "ПЁС",
        "name_en": "PES",
        "breed": "Метис",
        "gender": "male",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 8, "collar": "red",
            "j1": [17, 17, 17, 16, 17], # sum=84
            "j2": [17, 17, 17, 17, 18], # sum=86
            "total": 170
        },
        "heat2": {
            "heat_num": 19, "collar": "red",
            "j1": [17, 18, 18, 17, 18], # sum=88
            "j2": [16, 17, 16, 16, 18], # sum=83
            "total": 171
        },
        "total_score": 341
    },
    {
        "catalog_num": 11,
        "name_ru": "БОНЯ",
        "name_en": "BONIA",
        "breed": "Метис",
        "gender": "male",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 8, "collar": "white",
            "j1": [16, 17, 17, 16, 17], # sum=83
            "j2": [16, 16, 16, 17, 17], # sum=82
            "total": 165
        },
        "heat2": {
            "heat_num": 20, "collar": "red",
            "j1": [17, 18, 18, 17, 18], # sum=88
            "j2": [16, 16, 15, 16, 17], # sum=80
            "total": 168
        },
        "total_score": 333
    },
    # Цвергпинчер - Ветераны - Суки
    {
        "catalog_num": 14,
        "name_ru": "ВАНДЕБОР ЕГОЗА ЧАРУЕТ ГЛАЗА",
        "name_en": "VANDEBOR EGOZA CHARUET GLAZA",
        "breed": "Цвергпинчер",
        "gender": "female",
        "class": "veteran",
        "place": None,
        "cert": "",
        "title": "",
        "status": "dns",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 10, "collar": "red",
            "disqualified": True,
            "disqualification_reason": "Снят"
        },
        "heat2": None,
        "total_score": None
    },
    # Цвергпинчер - Стандартный - Кобели
    {
        "catalog_num": 15,
        "name_ru": "PETIT PRINCE D'ARTAGNAN",
        "name_en": "PETIT PRINCE D'ARTAGNAN",
        "breed": "Цвергпинчер",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "",
        "status": "finished",
        "heat1": {
            "heat_num": 11, "collar": "red",
            "j1": [17, 17, 16, 17, 17], # sum=84
            "j2": [17, 17, 17, 18, 18], # sum=87
            "total": 171
        },
        "heat2": {
            "heat_num": 21, "collar": "red",
            "j1": [10, 17, 17, 10, 10], # sum=64
            "j2": [14, 17, 16, 12, 12], # sum=71
            "total": 135
        },
        "total_score": 306
    }
]

print(f"Total dogs: {len(dogs)}")
errors = []

for d in dogs:
    cat = d["catalog_num"]
    name = d["name_ru"]
    for h_name in ["heat1", "heat2"]:
        h = d.get(h_name)
        if not h:
            continue
        if h.get("disqualified"):
            continue
        j1 = h["j1"]
        j2 = h["j2"]
        sum_j1 = sum(j1)
        sum_j2 = sum(j2)
        h_tot = h["total"]
        penalty = h.get("penalty", 0)
        if sum_j1 + sum_j2 - penalty != h_tot:
            errors.append(f"Dog #{cat} {name} {h_name}: sum_j1 ({sum_j1}) + sum_j2 ({sum_j2}) - penalty ({penalty}) = {sum_j1+sum_j2-penalty} != declared {h_tot}")
            
    if d["status"] == "finished" and d["total_score"] is not None:
        h1_tot = d["heat1"]["total"] if d.get("heat1") and not d["heat1"].get("disqualified") else 0
        h2_tot = d["heat2"]["total"] if d.get("heat2") and not d["heat2"].get("disqualified") else 0
        if h1_tot + h2_tot != d["total_score"]:
            errors.append(f"Dog #{cat} {name} total: h1 ({h1_tot}) + h2 ({h2_tot}) = {h1_tot+h2_tot} != declared {d['total_score']}")

if errors:
    print(f"ERRORS FOUND ({len(errors)}):")
    for e in errors:
        print("  -", e)
else:
    print("ALL MATHEMATICAL CHECKS PASSED 100% PERFECTLY!")
