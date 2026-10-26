import json

null = None
true = True
false = False

dogs = [
    {
        "catalog_num": 3,
        "name_ru": "УИЛЛ ОФ АДАМАНТ",
        "name_en": "UILL OF ADAMANT",
        "breed": "Басенджи",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 21,
            "collar": "red",
            "j1": [
                17,
                18,
                16,
                17,
                18
            ],
            "j2": [
                17,
                17,
                16,
                17,
                18
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 27,
            "collar": "white",
            "j1": [
                18,
                18,
                17,
                18,
                18
            ],
            "j2": [
                16,
                16,
                16,
                17,
                17
            ],
            "total": 171
        },
        "total_score": 342
    },
    {
        "catalog_num": 1,
        "name_ru": "КАСПЕР ВАН ДИН",
        "name_en": "KASPER VAN DEAN",
        "breed": "Басенджи",
        "gender": "male",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 20,
            "collar": "red",
            "j1": [
                17,
                17,
                16,
                17,
                17
            ],
            "j2": [
                17,
                17,
                16,
                17,
                18
            ],
            "total": 169
        },
        "heat2": {
            "heat_num": 26,
            "collar": "red",
            "j1": [
                17,
                18,
                18,
                17,
                18
            ],
            "j2": [
                17,
                17,
                16,
                16,
                17
            ],
            "total": 171
        },
        "total_score": 340
    },
    {
        "catalog_num": 2,
        "name_ru": "ОДИССЕЙ",
        "name_en": "ODISSEY",
        "breed": "Басенджи",
        "gender": "male",
        "class": "standard",
        "place": null,
        "status": "disqualified",
        "disqualification_reason": "Дисквалификация",
        "heat1": {
            "heat_num": 20,
            "collar": "white",
            "disqualified": true,
            "disqualification_reason": "Дисквалификация"
        },
        "heat2": null,
        "total_score": null
    },
    {
        "catalog_num": 4,
        "name_ru": "ШАМИКА ИЗ ДИВНОГО САДА",
        "name_en": "SHAMIKA IZ DIVNOGO SADA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 24,
            "collar": "white",
            "j1": [
                18,
                18,
                18,
                18,
                18
            ],
            "j2": [
                17,
                18,
                17,
                17,
                18
            ],
            "total": 177
        },
        "heat2": {
            "heat_num": 27,
            "collar": "white",
            "j1": [
                18,
                18,
                18,
                18,
                18
            ],
            "j2": [
                17,
                18,
                17,
                17,
                18
            ],
            "total": 177
        },
        "total_score": 354
    },
    {
        "catalog_num": 6,
        "name_ru": "БАГИРА",
        "name_en": "BAGHEERA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 25,
            "collar": "white",
            "j1": [
                17,
                18,
                17,
                18,
                18
            ],
            "j2": [
                17,
                17,
                17,
                17,
                18
            ],
            "total": 174
        },
        "heat2": {
            "heat_num": 29,
            "collar": "white",
            "j1": [
                17,
                18,
                16,
                18,
                17
            ],
            "j2": [
                17,
                17,
                16,
                17,
                17
            ],
            "total": 170
        },
        "total_score": 344
    },
    {
        "catalog_num": 9,
        "name_ru": "ОЛИМПИЯ С КНЯЖЕСКОГО ДВОРА",
        "name_en": "OLIMPIA S KNYAZHESKOGO DVORA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 22,
            "collar": "red",
            "j1": [
                18,
                18,
                18,
                18,
                18
            ],
            "j2": [
                18,
                18,
                17,
                17,
                17
            ],
            "total": 177
        },
        "heat2": {
            "heat_num": 28,
            "collar": "red",
            "j1": [
                16,
                18,
                17,
                16,
                17
            ],
            "j2": [
                17,
                17,
                16,
                16,
                16
            ],
            "total": 166
        },
        "total_score": 343
    },
    {
        "catalog_num": 5,
        "name_ru": "СОНЕТА СТАР ИЗ ДИВНОГО САДА",
        "name_en": "SONETA STAR IZ DIVNOGO SADA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 4,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 23,
            "collar": "white",
            "j1": [
                18,
                18,
                17,
                18,
                18
            ],
            "j2": [
                16,
                16,
                16,
                16,
                17
            ],
            "total": 170
        },
        "heat2": {
            "heat_num": 29,
            "collar": "red",
            "j1": [
                16,
                18,
                18,
                17,
                17
            ],
            "j2": [
                15,
                17,
                16,
                16,
                17
            ],
            "total": 167
        },
        "total_score": 337
    },
    {
        "catalog_num": 10,
        "name_ru": "РЕЙНЕКС-ЛИС",
        "name_en": "REINEKS-LIS",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 5,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 23,
            "collar": "red",
            "j1": [
                17,
                18,
                17,
                17,
                18
            ],
            "j2": [
                18,
                17,
                17,
                17,
                17
            ],
            "total": 173
        },
        "heat2": {
            "heat_num": 28,
            "collar": "white",
            "j1": [
                16,
                18,
                17,
                16,
                16
            ],
            "j2": [
                16,
                17,
                16,
                15,
                16
            ],
            "total": 163
        },
        "total_score": 336
    },
    {
        "catalog_num": 11,
        "name_ru": "РЕМИСА АМИТА",
        "name_en": "REMISA AMITA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 6,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 22,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                16,
                16,
                16,
                16,
                17
            ],
            "total": 163
        },
        "heat2": {
            "heat_num": 27,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                16,
                16
            ],
            "j2": [
                17,
                16,
                16,
                17,
                17
            ],
            "total": 164
        },
        "total_score": 327
    },
    {
        "catalog_num": 7,
        "name_ru": "ВИННЕР ТАЙМ ЦЕДРА",
        "name_en": "VINNER TAYM TSEDRA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": null,
        "status": "disqualified",
        "disqualification_reason": "Дисквалификация",
        "heat1": {
            "heat_num": 24,
            "collar": "red",
            "disqualified": true,
            "disqualification_reason": "Дисквалификация"
        },
        "heat2": null,
        "total_score": null
    },
    {
        "catalog_num": 8,
        "name_ru": "ИТУРИ ПАЗЗЛ ВИЛМА",
        "name_en": "ITURY PUZZLE VILMA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": null,
        "status": "disqualified",
        "disqualification_reason": "Дисквалификация",
        "heat1": {
            "heat_num": 24,
            "collar": "white",
            "disqualified": true,
            "disqualification_reason": "Дисквалификация"
        },
        "heat2": null,
        "total_score": null
    },
    {
        "catalog_num": 12,
        "name_ru": "АРТЕФАКТ ЖУА ДЕ ВИВР",
        "name_en": "ARTEFAKT JOIE DE VIVRE",
        "breed": "Грейхаунд",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 42,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                17,
                17
            ],
            "j2": [
                16,
                17,
                17,
                17,
                18
            ],
            "total": 169
        },
        "heat2": {
            "heat_num": 53,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                16,
                17,
                17,
                17,
                17
            ],
            "total": 167
        },
        "total_score": 336
    },
    {
        "catalog_num": 14,
        "name_ru": "ЛОУЛЕНД ФОНС ФИАННА",
        "name_en": "LOWLAND FAUNS FIANNA",
        "breed": "Дирхаунд",
        "gender": "female",
        "class": "junior",
        "place": 1,
        "cert": null,
        "title": "Лучший юниор",
        "status": "finished",
        "heat1": {
            "heat_num": 2,
            "collar": "white",
            "j1": [
                18,
                18,
                16,
                16,
                16
            ],
            "j2": [
                17,
                17,
                16,
                17,
                16
            ],
            "total": 167
        },
        "heat2": {
            "heat_num": 11,
            "collar": "white",
            "j1": [
                17,
                18,
                18,
                18,
                18
            ],
            "j2": [
                16,
                17,
                16,
                17,
                17
            ],
            "total": 172
        },
        "total_score": 339
    },
    {
        "catalog_num": 13,
        "name_ru": "КОГСВОРТ АНДЕР ШАРП ХИЛЛ",
        "name_en": "COGSWORTH UNDER SHARP HILL",
        "breed": "Дирхаунд",
        "gender": "male",
        "class": "junior",
        "place": 2,
        "cert": null,
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 1,
            "collar": "red",
            "j1": [
                15,
                18,
                18,
                16,
                17
            ],
            "j2": [
                12,
                16,
                14,
                12,
                13
            ],
            "total": 151
        },
        "heat2": {
            "heat_num": 12,
            "collar": "red",
            "j1": [
                16,
                18,
                17,
                16,
                18
            ],
            "j2": [
                15,
                16,
                16,
                15,
                16
            ],
            "total": 163
        },
        "total_score": 314
    },
    {
        "catalog_num": 15,
        "name_ru": "МИЛЫЙ ЗВЕРЬ ШЕЙЛИ",
        "name_en": "MILIY ZVER SHAYLEIGH",
        "breed": "Ирландский вольфхаунд",
        "gender": "female",
        "class": "standard",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 3,
            "collar": "red",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "heat2": null,
        "total_score": null
    },
    {
        "catalog_num": 16,
        "name_ru": "МИЛЫЙ ЗВЕРЬ МАРКАС",
        "name_en": "MILIY ZVER MARCAS",
        "breed": "Ирландский вольфхаунд",
        "gender": "male",
        "class": "junior",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 4,
            "collar": "red",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "heat2": null,
        "total_score": null
    },
    {
        "catalog_num": 17,
        "name_ru": "АРИЕС ХАН МАРЛОН БРАНДО",
        "name_en": "ARIES KHAN MARLON BRANDO",
        "breed": "Родезийский риджбек",
        "gender": "male",
        "class": "veteran",
        "place": 1,
        "cert": "CC",
        "title": "Лучший ветеран",
        "status": "finished",
        "heat1": {
            "heat_num": 35,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                16,
                19
            ],
            "j2": [
                17,
                17,
                16,
                17,
                19
            ],
            "total": 172
        },
        "heat2": {
            "heat_num": 41,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                17,
                16,
                16,
                18,
                17
            ],
            "total": 166
        },
        "total_score": 338
    },
    {
        "catalog_num": 20,
        "name_ru": "СОЛАР СПИРИТ АМОН-РА",
        "name_en": "SOLAR SPIRIT AMON-RA",
        "breed": "Родезийский риджбек",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 31,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                17,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                18
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 37,
            "collar": "white",
            "j1": [
                17,
                16,
                16,
                16,
                17
            ],
            "j2": [
                17,
                17,
                16,
                17,
                18
            ],
            "total": 167
        },
        "total_score": 338
    },
    {
        "catalog_num": 18,
        "name_ru": "АРИЕС ХАН РЕГУЛУС РЭДКЛИФФ",
        "name_en": "ARIES KHAN REGULUS RADCLIFFE",
        "breed": "Родезийский риджбек",
        "gender": "male",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 30,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                17,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 169
        },
        "heat2": {
            "heat_num": 36,
            "collar": "white",
            "j1": [
                17,
                17,
                16,
                17,
                16
            ],
            "j2": [
                16,
                16,
                16,
                16,
                17
            ],
            "total": 164
        },
        "total_score": 333
    },
    {
        "catalog_num": 19,
        "name_ru": "РЕД ПРАЙД СИДНЕЙ ИСЛАНД",
        "name_en": "RED PRAYD SIDNEY ISLAND",
        "breed": "Родезийский риджбек",
        "gender": "male",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 30,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                17,
                16
            ],
            "j2": [
                17,
                17,
                16,
                17,
                17
            ],
            "total": 150,
            "penalty": 17
        },
        "heat2": {
            "heat_num": 37,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                17,
                17
            ],
            "j2": [
                16,
                17,
                16,
                17,
                17
            ],
            "total": 151,
            "penalty": 17
        },
        "total_score": 301
    },
    {
        "catalog_num": 23,
        "name_ru": "РЕД ХАНТЕР НКЕЧИ НЕНГА",
        "name_en": "RED HANTER NKECHI NENGA",
        "breed": "Родезийский риджбек",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 33,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                17,
                17
            ],
            "j2": [
                18,
                17,
                17,
                17,
                18
            ],
            "total": 172
        },
        "heat2": {
            "heat_num": 38,
            "collar": "white",
            "j1": [
                17,
                17,
                17,
                17,
                16
            ],
            "j2": [
                18,
                17,
                17,
                17,
                17
            ],
            "total": 170
        },
        "total_score": 342
    },
    {
        "catalog_num": 21,
        "name_ru": "МАЭНДЕЛЕО ХОЛИ ЛАРА КРОФТ АРИЕС ХАН",
        "name_en": "MAENDELEO HOLY LARA CROFT ARIES KHAN",
        "breed": "Родезийский риджбек",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 32,
            "collar": "white",
            "j1": [
                17,
                17,
                16,
                17,
                17
            ],
            "j2": [
                16,
                17,
                16,
                17,
                17
            ],
            "total": 167
        },
        "heat2": {
            "heat_num": 39,
            "collar": "white",
            "j1": [
                17,
                17,
                17,
                16,
                19
            ],
            "j2": [
                17,
                16,
                16,
                17,
                19
            ],
            "total": 171
        },
        "total_score": 338
    },
    {
        "catalog_num": 22,
        "name_ru": "ПОДАРОК ИЗ АФРИКИ РАМЛА РУКУРУ",
        "name_en": "PODAROK IZ AFRIKI RAMLA RUKURU",
        "breed": "Родезийский риджбек",
        "gender": "female",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 34,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                16,
                17
            ],
            "j2": [
                16,
                17,
                16,
                16,
                17
            ],
            "total": 166
        },
        "heat2": {
            "heat_num": 39,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                16,
                16
            ],
            "j2": [
                17,
                17,
                16,
                17,
                16
            ],
            "total": 166
        },
        "total_score": 332
    },
    {
        "catalog_num": 24,
        "name_ru": "СОЛАР СПИРИТ АНДРОМЕДА",
        "name_en": "SOLAR SPIRIT ANDROMEDA",
        "breed": "Родезийский риджбек",
        "gender": "female",
        "class": "standard",
        "place": 4,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 32,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                18
            ],
            "total": 170
        },
        "heat2": {
            "heat_num": 38,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                15,
                16
            ],
            "j2": [
                16,
                17,
                16,
                16,
                17
            ],
            "total": 147,
            "penalty": 16
        },
        "total_score": 317
    },
    {
        "catalog_num": 25,
        "name_ru": "СОЛАР СПИРИТ АРМОНИ",
        "name_en": "SOLAR SPIRIT ARMONIE",
        "breed": "Родезийский риджбек",
        "gender": "female",
        "class": "standard",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 33,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                16,
                16,
                15,
                16,
                17
            ],
            "total": 162
        },
        "heat2": {
            "heat_num": 40,
            "collar": "red",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "total_score": 162
    },
    {
        "catalog_num": 28,
        "name_ru": "ДОРОГОЙ ДРУГ ФАРТОВЫЙ",
        "name_en": "DOROGOY DRUG FARTOVYJ",
        "breed": "Русская псовая борзая",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 5,
            "collar": "red",
            "j1": [
                17,
                16,
                17,
                17,
                17
            ],
            "j2": [
                18,
                18,
                17,
                17,
                18
            ],
            "total": 172
        },
        "heat2": {
            "heat_num": 16,
            "collar": "red",
            "j1": [
                17,
                18,
                18,
                16,
                17
            ],
            "j2": [
                16,
                17,
                16,
                16,
                16
            ],
            "total": 167
        },
        "total_score": 339
    },
    {
        "catalog_num": 32,
        "name_ru": "СОЛОВЬЕВ ЛУЧ СВЕТА",
        "name_en": "SOLOVYEV LUCH SVETA",
        "breed": "Русская псовая борзая",
        "gender": "male",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 7,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                17,
                16
            ],
            "j2": [
                15,
                16,
                16,
                15,
                15
            ],
            "total": 160
        },
        "heat2": {
            "heat_num": 14,
            "collar": "red",
            "j1": [
                15,
                17,
                16,
                15,
                15
            ],
            "j2": [
                15,
                15,
                15,
                15,
                15
            ],
            "total": 153
        },
        "total_score": 313
    },
    {
        "catalog_num": 29,
        "name_ru": "ДРУГ СЕРЕБРЯНЫЙ ДЖИМ БИМ",
        "name_en": "DRUG SEREBRYANYIY DZHIM BIM",
        "breed": "Русская псовая борзая",
        "gender": "male",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 6,
            "collar": "red",
            "j1": [
                12,
                15,
                14,
                14,
                14
            ],
            "j2": [
                16,
                16,
                15,
                15,
                15
            ],
            "total": 146
        },
        "heat2": {
            "heat_num": 16,
            "collar": "white",
            "j1": [
                17,
                18,
                17,
                17,
                16
            ],
            "j2": [
                15,
                16,
                16,
                16,
                15
            ],
            "total": 163
        },
        "total_score": 309
    },
    {
        "catalog_num": 26,
        "name_ru": "СОЛОВЬЕВ ШЕЛКОВЫЙ АНГЕЛ",
        "name_en": "SOLOVYEV SHELKOVYI ANGEL",
        "breed": "Русская псовая борзая",
        "gender": "male",
        "class": "standard",
        "place": 4,
        "cert": null,
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 6,
            "collar": "white",
            "j1": [
                10,
                10,
                10,
                10,
                12
            ],
            "j2": [
                12,
                15,
                14,
                12,
                12
            ],
            "total": 117
        },
        "heat2": {
            "heat_num": 14,
            "collar": "white",
            "j1": [
                14,
                16,
                15,
                14,
                14
            ],
            "j2": [
                13,
                14,
                14,
                13,
                14
            ],
            "total": 141
        },
        "total_score": 258
    },
    {
        "catalog_num": 27,
        "name_ru": "ВАСАРТ ГАМБИТ",
        "name_en": "VASART GAMBIT",
        "breed": "Русская псовая борзая",
        "gender": "male",
        "class": "standard",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 5,
            "collar": "white",
            "j1": [
                17,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                17,
                16,
                17,
                17
            ],
            "total": 168
        },
        "heat2": {
            "heat_num": 15,
            "collar": "white",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "total_score": 168
    },
    {
        "catalog_num": 31,
        "name_ru": "ЛУННАЯ РАДУГА ПАТРОНУС",
        "name_en": "LUNNAJA RADUGA PATRONUS",
        "breed": "Русская псовая борзая",
        "gender": "male",
        "class": "standard",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 7,
            "collar": "red",
            "j1": [
                12,
                17,
                17,
                15,
                15
            ],
            "j2": [
                13,
                17,
                16,
                14,
                14
            ],
            "total": 150
        },
        "heat2": {
            "heat_num": 15,
            "collar": "red",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "total_score": 150
    },
    {
        "catalog_num": 34,
        "name_ru": "АДАНА",
        "name_en": "ADANA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 10,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                17,
                17
            ],
            "j2": [
                17,
                17,
                16,
                17,
                17
            ],
            "total": 169
        },
        "heat2": {
            "heat_num": 17,
            "collar": "red",
            "j1": [
                17,
                18,
                18,
                18,
                18
            ],
            "j2": [
                16,
                17,
                16,
                16,
                16
            ],
            "total": 170
        },
        "total_score": 339
    },
    {
        "catalog_num": 39,
        "name_ru": "ФАЙЗА",
        "name_en": "FAJZA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 10,
            "collar": "white",
            "j1": [
                17,
                17,
                17,
                17,
                16
            ],
            "j2": [
                16,
                16,
                16,
                16,
                17
            ],
            "total": 165
        },
        "heat2": {
            "heat_num": 18,
            "collar": "red",
            "j1": [
                17,
                18,
                18,
                18,
                18
            ],
            "j2": [
                17,
                17,
                16,
                17,
                17
            ],
            "total": 173
        },
        "total_score": 338
    },
    {
        "catalog_num": 38,
        "name_ru": "ПРИ-ЧУДА",
        "name_en": "PRI-CHUDA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 11,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                17,
                17
            ],
            "j2": [
                16,
                17,
                17,
                16,
                17
            ],
            "total": 166
        },
        "heat2": {
            "heat_num": 19,
            "collar": "red",
            "j1": [
                18,
                18,
                18,
                18,
                17
            ],
            "j2": [
                17,
                17,
                16,
                16,
                17
            ],
            "total": 172
        },
        "total_score": 338
    },
    {
        "catalog_num": 36,
        "name_ru": "ЗВЕЗДНАЯ РАДУГА ЛОРЕЛЕЯ",
        "name_en": "ZVEZDNAYA RADUGA LORELEI",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": 4,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 8,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                17,
                17
            ],
            "j2": [
                18,
                17,
                18,
                17,
                17
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 18,
            "collar": "white",
            "j1": [
                17,
                18,
                18,
                16,
                17
            ],
            "j2": [
                16,
                16,
                16,
                16,
                17
            ],
            "total": 167
        },
        "total_score": 338
    },
    {
        "catalog_num": 35,
        "name_ru": "ДОРОГОЙ ДРУГ ФИФА",
        "name_en": "DOROGOY DRUG FIFA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": 5,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 9,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                17,
                17
            ],
            "j2": [
                18,
                18,
                17,
                17,
                17
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 17,
            "collar": "white",
            "j1": [
                15,
                17,
                16,
                15,
                16
            ],
            "j2": [
                15,
                16,
                15,
                14,
                14
            ],
            "total": 153
        },
        "total_score": 324
    },
    {
        "catalog_num": 33,
        "name_ru": "БАРСКАЯ ПРИХОТЬ ЖАСМИН",
        "name_en": "BARSKAYA PRIKHOT JASMINE",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": 6,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 8,
            "collar": "white",
            "j1": [
                15,
                16,
                16,
                15,
                15
            ],
            "j2": [
                17,
                17,
                16,
                17,
                17
            ],
            "total": 161
        },
        "heat2": {
            "heat_num": 19,
            "collar": "white",
            "j1": [
                15,
                17,
                16,
                16,
                16
            ],
            "j2": [
                16,
                15,
                15,
                16,
                15
            ],
            "total": 157
        },
        "total_score": 318
    },
    {
        "catalog_num": 37,
        "name_ru": "ИСТОМА",
        "name_en": "ISTOMA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 9,
            "collar": "white",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "heat2": null,
        "total_score": null
    },
    {
        "catalog_num": 40,
        "name_ru": "АПРИОРИ ЛЮКСУРИ ФАКЕЛ",
        "name_en": "APRIORI LUXURY FAKEL",
        "breed": "Русская псовая борзая",
        "gender": "male",
        "class": "junior",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 12,
            "collar": "red",
            "j1": [
                16,
                16,
                16,
                15,
                15
            ],
            "j2": [
                16,
                17,
                16,
                16,
                16
            ],
            "total": 159
        },
        "heat2": {
            "heat_num": 13,
            "collar": "red",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "total_score": 159
    },
    {
        "catalog_num": 41,
        "name_ru": "ЕЕ ВЕЛИЧЕСТВО УДАЧА",
        "name_en": "EYO VELICHESTVO UDACHA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "junior",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 12,
            "collar": "white",
            "j1": [
                15,
                15,
                15,
                15,
                14
            ],
            "j2": [
                14,
                16,
                15,
                15,
                13
            ],
            "total": 147
        },
        "heat2": {
            "heat_num": 13,
            "collar": "white",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "total_score": 147
    },
    {
        "catalog_num": 61,
        "name_ru": "АНТРАКС ГОУ-БАЙ",
        "name_en": "ANTHRAX GO-BYE",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 67,
            "collar": "red",
            "j1": [
                18,
                17,
                16,
                17,
                18
            ],
            "j2": [
                18,
                18,
                17,
                17,
                18
            ],
            "total": 174
        },
        "heat2": {
            "heat_num": 79,
            "collar": "white",
            "j1": [
                18,
                18,
                17,
                17,
                18
            ],
            "j2": [
                18,
                18,
                17,
                18,
                18
            ],
            "total": 177
        },
        "total_score": 351
    },
    {
        "catalog_num": 71,
        "name_ru": "ЕАГЛЕ БЛАЦК",
        "name_en": "EAGLE BLACK",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 68,
            "collar": "white",
            "j1": [
                18,
                17,
                17,
                17,
                17
            ],
            "j2": [
                18,
                18,
                17,
                17,
                17
            ],
            "total": 173
        },
        "heat2": {
            "heat_num": 79,
            "collar": "red",
            "j1": [
                18,
                18,
                18,
                18,
                18
            ],
            "j2": [
                17,
                18,
                17,
                17,
                18
            ],
            "total": 177
        },
        "total_score": 350
    },
    {
        "catalog_num": 68,
        "name_ru": "РАННИНГ РЕЙДЕРС ГРИМ РИПЕР",
        "name_en": "RUNNING RAIDERS GRIM REAPER",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 69,
            "collar": "red",
            "j1": [
                18,
                17,
                17,
                17,
                17
            ],
            "j2": [
                18,
                18,
                17,
                17,
                18
            ],
            "total": 174
        },
        "heat2": {
            "heat_num": 78,
            "collar": "red",
            "j1": [
                18,
                18,
                17,
                17,
                18
            ],
            "j2": [
                18,
                17,
                17,
                18,
                18
            ],
            "total": 176
        },
        "total_score": 350
    },
    {
        "catalog_num": 72,
        "name_ru": "СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН",
        "name_en": "STANGERS LAND VERSAILLES CHARMAN",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 4,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 65,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                17,
                17
            ],
            "j2": [
                17,
                18,
                17,
                17,
                18
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 80,
            "collar": "white",
            "j1": [
                17,
                18,
                18,
                18,
                18
            ],
            "j2": [
                18,
                17,
                17,
                17,
                18
            ],
            "total": 176
        },
        "total_score": 347
    },
    {
        "catalog_num": 69,
        "name_ru": "СТРОНГ СТОАТ",
        "name_en": "STRONG STOAT",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 5,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 66,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                17,
                17
            ],
            "j2": [
                18,
                18,
                17,
                17,
                18
            ],
            "total": 172
        },
        "heat2": {
            "heat_num": 81,
            "collar": "white",
            "j1": [
                18,
                18,
                18,
                17,
                18
            ],
            "j2": [
                16,
                18,
                17,
                16,
                17
            ],
            "total": 173
        },
        "total_score": 345
    },
    {
        "catalog_num": 63,
        "name_ru": "ГОРДЕЙ",
        "name_en": "GORDEY",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 6,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 67,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                17,
                17
            ],
            "j2": [
                18,
                17,
                17,
                18,
                18
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 81,
            "collar": "red",
            "j1": [
                17,
                17,
                16,
                16,
                18
            ],
            "j2": [
                16,
                17,
                17,
                17,
                17
            ],
            "total": 168
        },
        "total_score": 339
    },
    {
        "catalog_num": 67,
        "name_ru": "ЛАВИНГ БРИЗ ОЛИВЕР",
        "name_en": "LAVING BRIZ OLIVER",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 7,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 69,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                16,
                16
            ],
            "j2": [
                17,
                17,
                17,
                16,
                18
            ],
            "total": 167
        },
        "heat2": {
            "heat_num": 77,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                17,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 168
        },
        "total_score": 335
    },
    {
        "catalog_num": 70,
        "name_ru": "ДЖИНИ ЛАМБОР",
        "name_en": "DZHINI LAMBOR",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 8,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 64,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                16,
                17,
                16,
                17,
                17
            ],
            "total": 165
        },
        "heat2": {
            "heat_num": 78,
            "collar": "white",
            "j1": [
                16,
                18,
                17,
                16,
                18
            ],
            "j2": [
                17,
                17,
                17,
                17,
                16
            ],
            "total": 169
        },
        "total_score": 334
    },
    {
        "catalog_num": 66,
        "name_ru": "КУЛИКОВО ПОЛЕ ВИНТАЖ",
        "name_en": "KULIKOVO POLE VINTAGE",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 9,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 66,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                16,
                16
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 167
        },
        "heat2": {
            "heat_num": 80,
            "collar": "red",
            "j1": [
                16,
                18,
                17,
                16,
                16
            ],
            "j2": [
                16,
                17,
                17,
                16,
                17
            ],
            "total": 166
        },
        "total_score": 333
    },
    {
        "catalog_num": 64,
        "name_ru": "ГАЙ",
        "name_en": "GUY",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 10,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 65,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                18,
                17,
                16,
                17
            ],
            "total": 151,
            "penalty": 17
        },
        "heat2": {
            "heat_num": 77,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                17,
                18
            ],
            "j2": [
                18,
                18,
                17,
                17,
                17
            ],
            "total": 172
        },
        "total_score": 323
    },
    {
        "catalog_num": 62,
        "name_ru": "БРИЛЛИАНТ ФЛЭШ",
        "name_en": "BRILLIANT FLASH",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 68,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                17,
                17
            ],
            "j2": [
                17,
                18,
                17,
                17,
                18
            ],
            "total": 170
        },
        "heat2": {
            "heat_num": 76,
            "collar": "red",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "total_score": 170
    },
    {
        "catalog_num": 65,
        "name_ru": "КУЛИКОВО ПОЛЕ ВЕРСК ЛОВЕЦ УДАЧИ",
        "name_en": "KULIKOVO POLE EVERSK LOVETS UDACHI",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": null,
        "status": "withdrawn",
        "disqualification_reason": "Снят",
        "heat1": {
            "heat_num": 64,
            "collar": "white",
            "j1": [
                16,
                16,
                16,
                16,
                17
            ],
            "j2": [
                16,
                16,
                16,
                17,
                17
            ],
            "total": 163
        },
        "heat2": {
            "heat_num": 76,
            "collar": "white",
            "disqualified": true,
            "disqualification_reason": "Снят"
        },
        "total_score": 163
    },
    {
        "catalog_num": 81,
        "name_ru": "СТАНГЕРС ЛАНД ВАЛЬДИВИЯ",
        "name_en": "STANGERS LAND VALDIVIA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 71,
            "collar": "red",
            "j1": [
                18,
                18,
                17,
                18,
                17
            ],
            "j2": [
                18,
                18,
                18,
                18,
                18
            ],
            "total": 178
        },
        "heat2": {
            "heat_num": 84,
            "collar": "red",
            "j1": [
                18,
                19,
                18,
                18,
                18
            ],
            "j2": [
                18,
                18,
                17,
                18,
                18
            ],
            "total": 180
        },
        "total_score": 358
    },
    {
        "catalog_num": 80,
        "name_ru": "СТАНГЕРС ЛАНД ВАЛЕНСИЯ",
        "name_en": "STANGERS LAND VALENCIA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 70,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                17,
                17
            ],
            "j2": [
                17,
                18,
                17,
                18,
                18
            ],
            "total": 173
        },
        "heat2": {
            "heat_num": 85,
            "collar": "white",
            "j1": [
                18,
                18,
                18,
                18,
                18
            ],
            "j2": [
                18,
                18,
                18,
                18,
                18
            ],
            "total": 180
        },
        "total_score": 353
    },
    {
        "catalog_num": 74,
        "name_ru": "СТАНГЕРС ЛАНД БРИЗА",
        "name_en": "STANGERS LAND BRIZA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 72,
            "collar": "white",
            "j1": [
                17,
                18,
                17,
                17,
                17
            ],
            "j2": [
                18,
                18,
                18,
                18,
                18
            ],
            "total": 176
        },
        "heat2": {
            "heat_num": 86,
            "collar": "red",
            "j1": [
                18,
                18,
                18,
                17,
                18
            ],
            "j2": [
                17,
                18,
                17,
                17,
                18
            ],
            "total": 176
        },
        "total_score": 352
    },
    {
        "catalog_num": 73,
        "name_ru": "ЭМЕРАЛЬД ОФ МАЙ СОУЛ",
        "name_en": "EMERALD OF MY SOUL",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 4,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 71,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                18,
                18,
                17,
                18,
                18
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 85,
            "collar": "red",
            "j1": [
                17,
                18,
                17,
                17,
                18
            ],
            "j2": [
                17,
                18,
                17,
                17,
                19
            ],
            "total": 175
        },
        "total_score": 346
    },
    {
        "catalog_num": 77,
        "name_ru": "ИНДИАНА ИЗ САГИ О ГАРДАРИКЕ",
        "name_en": "INDIANA IZ SAGI O GARDARIKE",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 5,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 73,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                18
            ],
            "total": 169
        },
        "heat2": {
            "heat_num": 84,
            "collar": "white",
            "j1": [
                17,
                18,
                18,
                17,
                18
            ],
            "j2": [
                18,
                17,
                17,
                18,
                18
            ],
            "total": 176
        },
        "total_score": 345
    },
    {
        "catalog_num": 76,
        "name_ru": "ВАЛЬПАЙН ПЕК ДРЭГОН'С ДОТЭ",
        "name_en": "VALPAIN PEK DRAGON'S DAUGHTER",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 6,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 70,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 167
        },
        "heat2": {
            "heat_num": 83,
            "collar": "red",
            "j1": [
                17,
                18,
                18,
                18,
                18
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 174
        },
        "total_score": 341
    },
    {
        "catalog_num": 78,
        "name_ru": "МЕЛОДИ ОФ МОУНТАЙНС ВИНДС",
        "name_en": "MELODY OF MOUNTAINS WINDS",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 7,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 72,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                18
            ],
            "total": 168
        },
        "heat2": {
            "heat_num": 86,
            "collar": "white",
            "j1": [
                17,
                18,
                18,
                18,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 173
        },
        "total_score": 341
    },
    {
        "catalog_num": 79,
        "name_ru": "РУССКИ ПАРК ДАНАЯ",
        "name_en": "RUSSKI PARK DANAYA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 8,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 73,
            "collar": "red",
            "j1": [
                17,
                17,
                16,
                17,
                17
            ],
            "j2": [
                18,
                17,
                17,
                17,
                18
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 82,
            "collar": "white",
            "j1": [
                17,
                18,
                17,
                17,
                18
            ],
            "j2": [
                16,
                17,
                16,
                17,
                17
            ],
            "total": 170
        },
        "total_score": 341
    },
    {
        "catalog_num": 75,
        "name_ru": "ВАЛЬПАЙН ПЕК ДЭЙЗИ ДОЛЛ",
        "name_en": "VALPAIN PEK DAISY DOLL",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 9,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 74,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                17,
                17
            ],
            "j2": [
                16,
                17,
                17,
                16,
                17
            ],
            "total": 166
        },
        "heat2": {
            "heat_num": 82,
            "collar": "red",
            "j1": [
                17,
                18,
                18,
                17,
                18
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 173
        },
        "total_score": 339
    },
    {
        "catalog_num": 46,
        "name_ru": "ВАЛЬПАЙН ПЕК ДИРЕКТ ХИТ",
        "name_en": "VALPAIN PEK DIRECT HIT",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 45,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                17,
                17
            ],
            "j2": [
                16,
                18,
                17,
                17,
                17
            ],
            "total": 169
        },
        "heat2": {
            "heat_num": 58,
            "collar": "red",
            "j1": [
                16,
                18,
                17,
                17,
                17
            ],
            "j2": [
                17,
                17,
                17,
                18,
                17
            ],
            "total": 171
        },
        "total_score": 340
    },
    {
        "catalog_num": 45,
        "name_ru": "ЛАКШЕРИ ВИПП ЛАЗЕР",
        "name_en": "LUXURY WHIPP LAZER",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 46,
            "collar": "red",
            "j1": [
                16,
                18,
                17,
                16,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                18
            ],
            "total": 170
        },
        "heat2": {
            "heat_num": 57,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                18
            ],
            "total": 169
        },
        "total_score": 339
    },
    {
        "catalog_num": 49,
        "name_ru": "ВРЕМЯ НЕ ЖДЕТ ЭРАГОН",
        "name_en": "VREMYA NE ZHDYOT ERAGON",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 3,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 47,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                18,
                17,
                17,
                18
            ],
            "total": 170
        },
        "heat2": {
            "heat_num": 58,
            "collar": "white",
            "j1": [
                16,
                18,
                17,
                16,
                17
            ],
            "j2": [
                16,
                17,
                17,
                16,
                18
            ],
            "total": 168
        },
        "total_score": 338
    },
    {
        "catalog_num": 43,
        "name_ru": "БЭТМАН НАЙТ ШЭДОУ",
        "name_en": "BATMAN NIGHT SHADOW",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 4,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 45,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                16,
                18,
                17,
                16,
                17
            ],
            "total": 167
        },
        "heat2": {
            "heat_num": 54,
            "collar": "red",
            "j1": [
                16,
                18,
                17,
                17,
                17
            ],
            "j2": [
                16,
                18,
                17,
                16,
                18
            ],
            "total": 170
        },
        "total_score": 337
    },
    {
        "catalog_num": 53,
        "name_ru": "КУЛИКОВО ПОЛЕ ГЕРМЕС",
        "name_en": "KULIKOVO POLE GERMES",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 5,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 48,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                17,
                18,
                17,
                17,
                18
            ],
            "total": 169
        },
        "heat2": {
            "heat_num": 54,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 168
        },
        "total_score": 337
    },
    {
        "catalog_num": 50,
        "name_ru": "ВАРВАР КОНАН БЕССТРАШНЫЙ",
        "name_en": "VARVAR KONAN BESSTRASHNYI",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 6,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 43,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 168
        },
        "heat2": {
            "heat_num": 56,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 168
        },
        "total_score": 336
    },
    {
        "catalog_num": 48,
        "name_ru": "ВАСУРУ ТАФФИ'С НАУ ОР НЕВЕР",
        "name_en": "VASURU TAFFI'S NOW OR NEVER",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 7,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 49,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                17,
                17
            ],
            "j2": [
                17,
                17,
                17,
                16,
                17
            ],
            "total": 168
        },
        "heat2": {
            "heat_num": 57,
            "collar": "white",
            "j1": [
                16,
                18,
                16,
                17,
                17
            ],
            "j2": [
                16,
                18,
                17,
                16,
                17
            ],
            "total": 168
        },
        "total_score": 336
    },
    {
        "catalog_num": 54,
        "name_ru": "РАТИМИР ИДУЩИЙ К СЛАВЕ ИЗ КАМЕЛОТА",
        "name_en": "RATIMIR IDUSCHIY K SLAVE IZ KAMELOTA",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 8,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 46,
            "collar": "white",
            "j1": [
                17,
                17,
                17,
                16,
                17
            ],
            "j2": [
                17,
                18,
                17,
                17,
                18
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 55,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                16,
                17,
                16,
                16,
                17
            ],
            "total": 165
        },
        "total_score": 336
    },
    {
        "catalog_num": 55,
        "name_ru": "СУРСКИЙ СУВЕНИР ЯСТРЕБ",
        "name_en": "SURSKIY SUVENIR YASTREB",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 9,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 47,
            "collar": "white",
            "j1": [
                16,
                16,
                16,
                16,
                17
            ],
            "j2": [
                15,
                17,
                17,
                17,
                17
            ],
            "total": 164
        },
        "heat2": {
            "heat_num": 55,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                17,
                17
            ],
            "j2": [
                18,
                17,
                17,
                17,
                18
            ],
            "total": 170
        },
        "total_score": 334
    },
    {
        "catalog_num": 44,
        "name_ru": "БЛЭК ДЖЕК",
        "name_en": "BLACK JACK",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 10,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 44,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                16,
                16
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 166
        },
        "heat2": {
            "heat_num": 55,
            "collar": "white",
            "j1": [
                17,
                17,
                16,
                16,
                17
            ],
            "j2": [
                16,
                17,
                17,
                16,
                17
            ],
            "total": 166
        },
        "total_score": 332
    },
    {
        "catalog_num": 47,
        "name_ru": "ВАРЛОК ЯРКАЯ МОЛНИЯ",
        "name_en": "VARLOK YARKAYA MOLNIYA",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 11,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 47,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                16,
                17,
                17,
                16,
                17
            ],
            "total": 166
        },
        "heat2": {
            "heat_num": 59,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                16,
                17,
                17,
                16,
                17
            ],
            "total": 166
        },
        "total_score": 332
    },
    {
        "catalog_num": 51,
        "name_ru": "ИСТОРИЯ ЛЮБВИ ПЕТЕРБУРГ БЬЮТИФУЛ",
        "name_en": "ISTORIYA LUBVI PETERBURG BEAUTIFUL",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 12,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 43,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                16,
                17,
                16,
                16,
                17
            ],
            "total": 164
        },
        "heat2": {
            "heat_num": 59,
            "collar": "white",
            "j1": [
                16,
                16,
                16,
                16,
                17
            ],
            "j2": [
                17,
                16,
                16,
                17,
                18
            ],
            "total": 165
        },
        "total_score": 329
    },
    {
        "catalog_num": 52,
        "name_ru": "КЕТЛИН ФАУСТ",
        "name_en": "KETLIN FAUST",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 13,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 48,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                16,
                17,
                17,
                16,
                17
            ],
            "total": 165
        },
        "heat2": {
            "heat_num": 56,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                16,
                16,
                16,
                16,
                17
            ],
            "total": 163
        },
        "total_score": 328
    },
    {
        "catalog_num": 59,
        "name_ru": "ЛАКШЕРИ ВИПП НИКИТА",
        "name_en": "LUXURY WHIPP NIKITA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "sprinter",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 50,
            "collar": "white",
            "j1": [
                17,
                17,
                17,
                17,
                17
            ],
            "j2": [
                17,
                18,
                17,
                17,
                17
            ],
            "total": 171
        },
        "heat2": {
            "heat_num": 62,
            "collar": "red",
            "j1": [
                16,
                18,
                17,
                17,
                17
            ],
            "j2": [
                16,
                18,
                17,
                16,
                17
            ],
            "total": 169
        },
        "total_score": 340
    },
    {
        "catalog_num": 58,
        "name_ru": "ГИНУРА ЮТТА КУЛУМА",
        "name_en": "GINURA JUTTA KULUMA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "sprinter",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 50,
            "collar": "red",
            "j1": [
                17,
                17,
                16,
                17,
                16
            ],
            "j2": [
                17,
                18,
                17,
                18,
                17
            ],
            "total": 170
        },
        "heat2": {
            "heat_num": 62,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                16,
                16
            ],
            "j2": [
                17,
                18,
                17,
                17,
                17
            ],
            "total": 168
        },
        "total_score": 338
    },
    {
        "catalog_num": 56,
        "name_ru": "АЦУАРЕЛА ДЕЛЬ'РИО ДОУСЕ КАРАМЕЛЬ",
        "name_en": "ACUARELA DEL'RIO DOUCE CARAMEL",
        "breed": "Уиппет",
        "gender": "female",
        "class": "sprinter",
        "place": 3,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 51,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                17,
                17
            ],
            "j2": [
                16,
                18,
                17,
                17,
                17
            ],
            "total": 169
        },
        "heat2": {
            "heat_num": 61,
            "collar": "red",
            "j1": [
                16,
                17,
                15,
                17,
                16
            ],
            "j2": [
                16,
                17,
                17,
                17,
                18
            ],
            "total": 166
        },
        "total_score": 335
    },
    {
        "catalog_num": 60,
        "name_ru": "ФЕЕЛ МАЙ ХЕАРТ АЛЕТЕЙЯ",
        "name_en": "FEEL MY HEART ALETHEA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "sprinter",
        "place": 4,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 51,
            "collar": "white",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                16,
                18,
                17,
                16,
                17
            ],
            "total": 167
        },
        "heat2": {
            "heat_num": 63,
            "collar": "red",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                16,
                17,
                17,
                16,
                17
            ],
            "total": 165
        },
        "total_score": 332
    },
    {
        "catalog_num": 57,
        "name_ru": "ЭНТАЙЛИ ЕЗ",
        "name_en": "ENTAYLI YOZ",
        "breed": "Уиппет",
        "gender": "female",
        "class": "sprinter",
        "place": 5,
        "cert": "CC",
        "title": null,
        "status": "finished",
        "heat1": {
            "heat_num": 50,
            "collar": "red",
            "j1": [
                16,
                17,
                17,
                16,
                17
            ],
            "j2": [
                15,
                17,
                17,
                16,
                17
            ],
            "total": 165
        },
        "heat2": {
            "heat_num": 61,
            "collar": "white",
            "j1": [
                16,
                17,
                16,
                16,
                17
            ],
            "j2": [
                16,
                17,
                17,
                16,
                17
            ],
            "total": 165
        },
        "total_score": 330
    },
    {
        "catalog_num": 82,
        "name_ru": "СТАНГЕРС ЛАНД ГОЛДИ-ТРИШ",
        "name_en": "STANGERS LAND GOLDIE-TRISH",
        "breed": "Уиппет",
        "gender": "female",
        "class": "junior",
        "place": 1,
        "cert": null,
        "title": "Лучший юниор",
        "status": "finished",
        "heat1": {
            "heat_num": 75,
            "collar": "red",
            "j1": [
                17,
                17,
                17,
                17,
                17
            ],
            "j2": [
                17,
                17,
                17,
                17,
                17
            ],
            "total": 170
        },
        "heat2": {
            "heat_num": 87,
            "collar": "red",
            "j1": [
                18,
                18,
                18,
                18,
                18
            ],
            "j2": [
                18,
                18,
                17,
                17,
                18
            ],
            "total": 178
        },
        "total_score": 348
    },
    {
        "catalog_num": 30,
        "name_ru": "КАВАЛЛЬЕРИК ФАКТОТУМ",
        "name_en": "CAVALLIERIK FACTOTUM",
        "breed": "Русская псовая борзая",
        "gender": "male",
        "class": "standard",
        "place": null,
        "status": "dns",
        "disqualification_reason": "Неявка",
        "heat1": null,
        "heat2": null,
        "total_score": null
    },
    {
        "catalog_num": 42,
        "name_ru": "АМБЕР ВЕЙВ'С МАРИУС",
        "name_en": "AMBER VEIV'S MARIUS",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": null,
        "status": "dns",
        "disqualification_reason": "Неявка",
        "heat1": null,
        "heat2": null,
        "total_score": null
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
            
    if d["status"] == "finished":
        h1 = d["heat1"]["total"]
        h2 = d["heat2"]["total"]
        if h1 + h2 != d["total_score"]:
            errors.append(f"Dog #{cat} {name} total: h1 ({h1}) + h2 ({h2}) = {h1+h2} != declared {d['total_score']}")

if errors:
    print(f"ERRORS FOUND ({len(errors)}):")
    for e in errors:
        print("  -", e)
else:
    print("ALL MATHEMATICAL CHECKS PASSED 100% PERFECTLY!")
