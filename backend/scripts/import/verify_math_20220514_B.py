import json

dogs = [
    # Американский пит-бультерьер_Стандартный_Общая
    {
        "catalog_num": 2,
        "name_ru": "ИСТИННАЯ ЦЕННОСТЬ",
        "name_en": "ISTINNAYA TSENNOST",
        "breed": "Американский пит-бультерьер",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 1, "collar": "red",
            "j1": [17, 18, 18, 19, 18],
            "j2": [16, 16, 16, 17, 17],
            "total": 172
        },
        "heat2": {
            "heat_num": 8, "collar": "red",
            "j1": [16, 17, 18, 16, 17],
            "j2": [15, 16, 15, 16, 16],
            "total": 162
        },
        "total_score": 334
    },
    {
        "catalog_num": 1,
        "name_ru": "PIT4LIFE PLACEBO",
        "name_en": "PIT4LIFE PLACEBO",
        "breed": "Американский пит-бультерьер",
        "gender": "male",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 1, "collar": "blue",
            "j1": [14, 17, 18, 15, 15],
            "j2": [14, 16, 16, 15, 16],
            "total": 156
        },
        "heat2": {
            "heat_num": 8, "collar": "blue",
            "j1": [17, 18, 19, 18, 18],
            "j2": [17, 17, 16, 17, 17],
            "total": 174
        },
        "total_score": 330
    },

    # Американский пит-бультерьер_Юниоры_Кобели
    {
        "catalog_num": 3,
        "name_ru": "BRAVE FIGHTER'S TORETTO",
        "name_en": "BRAVE FIGHTER'S TORETTO",
        "breed": "Американский пит-бультерьер",
        "gender": "male",
        "class": "junior",
        "place": 1,
        "cert": None,
        "title": "Лучший юниор",
        "status": "finished",
        "heat1": {
            "heat_num": 2, "collar": "red",
            "j1": [18, 19, 19, 19, 19],
            "j2": [16, 17, 17, 17, 17],
            "total": 178
        },
        "heat2": {
            "heat_num": 9, "collar": "red",
            "j1": [17, 17, 18, 18, 18],
            "j2": [17, 18, 16, 17, 17],
            "total": 173
        },
        "total_score": 351
    },
    {
        "catalog_num": 4,
        "name_ru": "BRAVE FIGHTER'S UNCHAIN MY HEART",
        "name_en": "BRAVE FIGHTER'S UNCHAIN MY HEART",
        "breed": "Американский пит-бультерьер",
        "gender": "male",
        "class": "junior",
        "place": 2,
        "cert": None,
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 2, "collar": "blue",
            "j1": [16, 18, 18, 17, 18],
            "j2": [17, 16, 16, 17, 18],
            "total": 171
        },
        "heat2": {
            "heat_num": 9, "collar": "blue",
            "j1": [18, 19, 18, 19, 19],
            "j2": [16, 17, 16, 16, 18],
            "total": 176
        },
        "total_score": 347
    },

    # Американский стаффордширский терьер_Стандартный_Общая
    {
        "catalog_num": 5,
        "name_ru": "ЛАН-БРАЙТ БУГАТТИ БЛЭК",
        "name_en": "LAN-BRIGHT BUGATTI BLACK",
        "breed": "Американский стаффордширский терьер",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 3, "collar": "blue",
            "j1": [15, 16, 18, 16, 17],
            "j2": [15, 16, 16, 16, 17],
            "total": 162
        },
        "heat2": {
            "heat_num": 10, "collar": "red",
            "j1": [19, 18, 17, 19, 19],
            "j2": [17, 17, 16, 17, 17],
            "total": 176
        },
        "total_score": 338
    },
    {
        "catalog_num": 6,
        "name_ru": "РУССКИЙ ФАВОРИТ БЕССОННАЯ НОЧЬ",
        "name_en": "RUSSKIY FAVORIT BESSONNAYA NOCH",
        "breed": "Американский стаффордширский терьер",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 3, "collar": "red",
            "j1": [17, 17, 18, 18, 18], # wait, let's check j1
            "j2": [17, 16, 16, 17, 17], # wait, 88 + 83 = 171
            "total": 171
        },
        "heat2": {
            "heat_num": 10, "collar": "blue",
            "j1": [17, 17, 18, 17, 18],
            "j2": [16, 16, 15, 16, 17],
            "total": 167
        },
        "total_score": 338
    },

    # Бигль_Стандартный_Общая
    {
        "catalog_num": 9,
        "name_ru": "БРАВА ВИСТА МИЛОНГА",
        "name_en": "BRAVA VISTA MILONGA",
        "breed": "Бигль",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 4, "collar": "blue",
            "j1": [18, 19, 19, 19, 19],
            "j2": [17, 17, 17, 18, 18],
            "total": 181
        },
        "heat2": {
            "heat_num": 11, "collar": "red",
            "j1": [18, 17, 17, 19, 18],
            "j2": [16, 16, 16, 16, 17],
            "total": 170
        },
        "total_score": 351
    },
    {
        "catalog_num": 7,
        "name_ru": "АРЕС",
        "name_en": "APEC",
        "breed": "Бигль",
        "gender": "male",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 5, "collar": "red",
            "j1": [15, 18, 18, 18, 19],
            "j2": [15, 16, 16, 15, 15],
            "total": 165
        },
        "heat2": {
            "heat_num": 11, "collar": "blue",
            "j1": [16, 18, 18, 17, 17],
            "j2": [17, 17, 15, 16, 17],
            "total": 168
        },
        "total_score": 333
    },
    {
        "catalog_num": 8,
        "name_ru": "МАНИФИК МЕТ ЮЛИАН",
        "name_en": "MANIFIK MET YULIAN",
        "breed": "Бигль",
        "gender": "male",
        "class": "standard",
        "place": 3,
        "cert": None,
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 4, "collar": "red",
            "j1": [14, 17, 16, 13, 13],
            "j2": [14, 16, 16, 14, 15],
            "total": 148
        },
        "heat2": {
            "heat_num": 12, "collar": "red",
            "j1": [15, 16, 15, 16, 15],
            "j2": [15, 15, 15, 16, 15],
            "total": 153
        },
        "total_score": 301
    },

    # Метис_Стандартный_Общая
    {
        "catalog_num": 10,
        "name_ru": "БОНЯ",
        "name_en": "BONYA",
        "breed": "Метис",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 7, "collar": "red",
            "j1": [17, 16, 18, 18, 17],
            "j2": [17, 16, 16, 17, 18],
            "total": 170
        },
        "heat2": {
            "heat_num": 14, "collar": "blue",
            "j1": [17, 18, 19, 18, 18],
            "j2": [17, 17, 16, 16, 17],
            "total": 173
        },
        "total_score": 343
    },
    {
        "catalog_num": 13,
        "name_ru": "КНОПА",
        "name_en": "KNOPA",
        "breed": "Метис",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 6, "collar": "blue",
            "j1": [18, 19, 19, 18, 19],
            "j2": [17, 17, 16, 17, 18],
            "total": 178
        },
        "heat2": {
            "heat_num": 14, "collar": "red",
            "j1": [16, 17, 17, 17, 18],
            "j2": [14, 16, 16, 15, 15],
            "total": 161
        },
        "total_score": 339
    },
    {
        "catalog_num": 12,
        "name_ru": "ДЖИНА",
        "name_en": "DZHINA",
        "breed": "Метис",
        "gender": "female",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 7, "collar": "blue",
            "j1": [16, 18, 17, 17, 16],
            "j2": [16, 17, 16, 16, 17],
            "total": 166
        },
        "heat2": {
            "heat_num": 13, "collar": "red",
            "j1": [16, 18, 16, 18, 17],
            "j2": [17, 17, 16, 16, 17],
            "total": 168
        },
        "total_score": 334
    },
    {
        "catalog_num": 11,
        "name_ru": "ПЁС",
        "name_en": "PYOS",
        "breed": "Метис",
        "gender": "male",
        "class": "standard",
        "place": 4,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 6, "collar": "red",
            "j1": [16, 18, 17, 17, 18],
            "j2": [16, 16, 16, 17, 18],
            "total": 169
        },
        "heat2": {
            "heat_num": 13, "collar": "blue",
            "j1": [15, 17, 18, 15, 18],
            "j2": [16, 17, 16, 15, 16],
            "total": 163
        },
        "total_score": 332
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
        j1 = h["j1"]
        j2 = h["j2"]
        sum_j1 = sum(j1)
        sum_j2 = sum(j2)
        h_tot = h["total"]
        if sum_j1 + sum_j2 != h_tot:
            errors.append(f"Dog #{cat} {name} {h_name}: sum_j1 ({sum_j1}) + sum_j2 ({sum_j2}) = {sum_j1+sum_j2} != declared {h_tot}")
            
    h1 = d["heat1"]["total"]
    h2 = d["heat2"]["total"]
    if h1 + h2 != d["total_score"]:
        errors.append(f"Dog #{cat} {name} total: h1 ({h1}) + h2 ({h2}) = {h1+h2} != declared {d['total_score']}")

if errors:
    print("ERRORS FOUND:")
    for e in errors:
        print("  -", e)
else:
    print("ALL MATHEMATICAL CHECKS PASSED 100% PERFECTLY!")
