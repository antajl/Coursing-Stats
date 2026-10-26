import json
import os

dogs = [
    # БАСЕНДЖИ СТАНДАРТНЫЙ КОБЕЛИ
    {
        "catalog_num": 1,
        "name_ru": "БОСКО БОКАРИ ЗИКИМО ФАНГЕЙ",
        "name_en": "BOSKO BOKARI ZIKIMO FANGEI",
        "breed": "Басенджи",
        "gender": "male",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 23, "collar": "red",
            "j1": [16, 17, 18, 16, 15],
            "j2": [16, 16, 16, 17, 16],
            "total": 163
        },
        "heat2": {
            "heat_num": 33, "collar": "red",
            "j1": [18, 19, 18, 18, 18],
            "j2": [15, 17, 16, 16, 16],
            "total": 171
        },
        "total_score": 334
    },
    {
        "catalog_num": 2,
        "name_ru": "РИВЕР СОНГ ЖАМИРОКВЭЙ",
        "name_en": "RIVER SONG ZHAMIROKVEI",
        "breed": "Басенджи",
        "gender": "male",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 23, "collar": "white",
            "j1": [15, 16, 16, 14, 13],
            "j2": [15, 17, 16, 15, 16],
            "total": 153
        },
        "heat2": {
            "heat_num": 33, "collar": "white",
            "j1": [16, 17, 17, 16, 16],
            "j2": [14, 16, 16, 14, 16],
            "total": 158
        },
        "total_score": 311
    },
    {
        "catalog_num": 3,
        "name_ru": "СТАР КАРУНА ТЕЛЛУР ДЖАНГЛ ЧАЙЛД",
        "name_en": "STAR KARUNA TELLUR DZHANGL CHAILD",
        "breed": "Басенджи",
        "gender": "male",
        "class": "standard",
        "place": None,
        "status": "withdrawn",
        "disqualification_reason": "Сход",
        "heat1": {
            "heat_num": 24, "collar": "red",
            "disqualified": True,
            "disqualification_reason": "Сход"
        },
        "heat2": None,
        "total_score": None
    },

    # БАСЕНДЖИ СТАНДАРТНЫЙ СУКИ
    {
        "catalog_num": 7,
        "name_ru": "ГОРДЕН МАГИК ОДРИ АМАЛИ",
        "name_en": "GORDEN MAGIK ODRI AMALI",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 25, "collar": "white",
            "j1": [18, 19, 19, 19, 19],
            "j2": [18, 17, 17, 17, 18],
            "total": 181
        },
        "heat2": {
            "heat_num": 35, "collar": "white",
            "j1": [19, 19, 20, 20, 19],
            "j2": [17, 18, 17, 17, 17],
            "total": 183
        },
        "total_score": 364
    },
    {
        "catalog_num": 6,
        "name_ru": "ГОРДЕН МАГИК МАРИЭЛЬ ПЕРСЕУС УРСА",
        "name_en": "GORDEN MAGIK MARIEL PERSEUS URSA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 26, "collar": "red",
            "j1": [19, 18, 19, 19, 18],
            "j2": [18, 17, 17, 17, 17],
            "total": 179
        },
        "heat2": {
            "heat_num": 34, "collar": "red",
            "j1": [19, 19, 20, 19, 19],
            "j2": [16, 18, 16, 16, 17],
            "total": 179
        },
        "total_score": 358
    },
    {
        "catalog_num": 4,
        "name_ru": "АНГАВУ МАИША РУФАРО АДАННАЯ",
        "name_en": "ANGAVU MAISHA RUFARO ADANNAYA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 26, "collar": "white",
            "j1": [15, 16, 17, 13, 14],
            "j2": [12, 16, 16, 12, 10],
            "total": 141
        },
        "heat2": {
            "heat_num": 35, "collar": "red",
            "j1": [16, 17, 17, 18, 16],
            "j2": [15, 17, 17, 16, 17],
            "total": 166
        },
        "total_score": 307
    },
    {
        "catalog_num": 8,
        "name_ru": "ЗАФРИНА СОЛАР СМАЙЛ С КНЯЖЕСКОГО ДВОРА",
        "name_en": "ZAFRINA SOLAR SMAJL S KNYAZHESKOGO DVORA",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": 4,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 25, "collar": "red",
            "j1": [13, 17, 16, 10, 10],
            "j2": [10, 16, 15, 10, 8],
            "total": 125
        },
        "heat2": {
            "heat_num": 34, "collar": "white",
            "j1": [17, 18, 18, 17, 18],
            "j2": [15, 17, 16, 15, 16],
            "total": 167
        },
        "total_score": 292
    },
    {
        "catalog_num": 5,
        "name_ru": "ГОЛДЕН АЙРИС БЕЙСИ",
        "name_en": "GOLDEN AIRIS BEYSI",
        "breed": "Басенджи",
        "gender": "female",
        "class": "standard",
        "place": None,
        "status": "withdrawn",
        "disqualification_reason": "Сход",
        "heat1": {
            "heat_num": 27, "collar": "red",
            "disqualified": True,
            "disqualification_reason": "Сход"
        },
        "heat2": None,
        "total_score": None
    },

    # РУССКАЯ ПСОВАЯ БОРЗАЯ СТАНДАРТНЫЙ СУКИ
    {
        "catalog_num": 10,
        "name_ru": "ДОРОГОЙ ДРУГ УЛАНКА",
        "name_en": "DOROGOY DRUG ULANKA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 29, "collar": "white",
            "j1": [19, 19, 20, 18, 19],
            "j2": [17, 18, 17, 17, 18],
            "total": 182
        },
        "heat2": {
            "heat_num": 36, "collar": "red",
            "j1": [17, 19, 19, 18, 19],
            "j2": [17, 18, 17, 18, 18],
            "total": 180
        },
        "total_score": 362
    },
    {
        "catalog_num": 14,
        "name_ru": "ПРИ-ЧУДА",
        "name_en": "PRI-CHUDA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 28, "collar": "white",
            "j1": [16, 17, 18, 16, 17],
            "j2": [17, 17, 17, 16, 17],
            "total": 168
        },
        "heat2": {
            "heat_num": 37, "collar": "red",
            "j1": [17, 18, 19, 19, 19],
            "j2": [16, 18, 17, 17, 18],
            "total": 178
        },
        "total_score": 346
    },
    {
        "catalog_num": 13,
        "name_ru": "ДРУГ СЕРЕБРЯНЫЙ ВАРНИЦА",
        "name_en": "DRUG SEREBRYANYJ VARNICA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 28, "collar": "red",
            "j1": [15, 16, 17, 15, 16],
            "j2": [16, 17, 17, 17, 18],
            "total": 164
        },
        "heat2": {
            "heat_num": 36, "collar": "white",
            "j1": [15, 16, 17, 15, 13],
            "j2": [15, 16, 16, 16, 17],
            "total": 156
        },
        "total_score": 320
    },
    {
        "catalog_num": 12,
        "name_ru": "ВИТТОРИЯ",
        "name_en": "VITTORYA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": None,
        "status": "disqualified",
        "disqualification_reason": "Дисквалификация",
        "heat1": {
            "heat_num": 29, "collar": "red",
            "disqualified": True,
            "disqualification_reason": "Дисквалификация"
        },
        "heat2": None,
        "total_score": None
    },

    # ТАЙСКИЙ РИДЖБЕК ВЕТЕРАНЫ ОБЩАЯ
    {
        "catalog_num": 16,
        "name_ru": "ЯРОСЛАВА КРАСА",
        "name_en": "YAROSLAVA KRASA",
        "breed": "Тайский риджбек",
        "gender": "female",
        "class": "veteran",
        "place": 1,
        "cert": None,
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 32, "collar": "red",
            "j1": [16, 15, 15, 13, 10],
            "j2": [15, 15, 14, 13, 14],
            "total": 140
        },
        "heat2": {
            "heat_num": 40, "collar": "white",
            "j1": [14, 14, 12, 10, 10],
            "j2": [11, 15, 12, 11, 10],
            "total": 119
        },
        "total_score": 259
    },
    {
        "catalog_num": 15,
        "name_ru": "ЯРОСВЕТ ПОБЕДОНОСНЫЙ",
        "name_en": "YAROSVET POBEDONOSNY",
        "breed": "Тайский риджбек",
        "gender": "male",
        "class": "veteran",
        "place": 2,
        "cert": None,
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 32, "collar": "white",
            "j1": [15, 16, 16, 14, 10],
            "j2": [15, 15, 14, 14, 14],
            "total": 143
        },
        "heat2": {
            "heat_num": 40, "collar": "red",
            "j1": [15, 13, 10, 12, 10],
            "j2": [10, 13, 10, 10, 10],
            "total": 113
        },
        "total_score": 256
    },

    # ТАЙСКИЙ РИДЖБЕК СТАНДАРТНЫЙ ОБЩАЯ
    {
        "catalog_num": 21,
        "name_ru": "СИАМ ВЕЛЛ ФАР ЕАСТ АКСЕЛЬ",
        "name_en": "SIAM WELL FAR EAST AKSEL",
        "breed": "Тайский риджбек",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 30, "collar": "red",
            "j1": [18, 19, 19, 20, 20],
            "j2": [18, 17, 17, 17, 17],
            "total": 182
        },
        "heat2": {
            "heat_num": 39, "collar": "white",
            "j1": [18, 18, 19, 19, 19],
            "j2": [17, 17, 17, 17, 18],
            "total": 179
        },
        "total_score": 361
    },
    {
        "catalog_num": 20,
        "name_ru": "Ж-МИНИ ФЭШН ЛИТЛ БЛЮ КУИН МАЙ ДИА ФРЕНДС",
        "name_en": "G-MINI FASHION LITTLE BLUE QUEEN MY DEAR FRIENDS",
        "breed": "Тайский риджбек",
        "gender": "female",
        "class": "standard",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 31, "collar": "red",
            "j1": [17, 18, 19, 18, 19],
            "j2": [18, 18, 17, 18, 17],
            "total": 179
        },
        "heat2": {
            "heat_num": 38, "collar": "red",
            "j1": [17, 17, 18, 17, 17],
            "j2": [16, 17, 16, 17, 18],
            "total": 170
        },
        "total_score": 349
    },
    {
        "catalog_num": 17,
        "name_ru": "ЛАВАН ФАЙЛИН РОЛЛО АКЭЛЬ",
        "name_en": "LAWAN FAILIN ROLLO AKEL",
        "breed": "Тайский риджбек",
        "gender": "male",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 30, "collar": "white",
            "j1": [17, 18, 18, 18, 19],
            "j2": [17, 17, 16, 17, 17],
            "total": 174
        },
        "heat2": {
            "heat_num": 38, "collar": "white",
            "j1": [18, 18, 19, 19, 18],
            "j2": [15, 16, 15, 15, 16],
            "total": 169
        },
        "total_score": 343
    },
    {
        "catalog_num": 19,
        "name_ru": "ЯР МАРИН СТАЙЛ ИТАЛИ",
        "name_en": "YAR MARIN STYLE ITALY",
        "breed": "Тайский риджбек",
        "gender": "female",
        "class": "standard",
        "place": 4,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 31, "collar": "white",
            "j1": [14, 17, 17, 15, 15],
            "j2": [15, 17, 16, 15, 15],
            "total": 156
        },
        "heat2": {
            "heat_num": 39, "collar": "red",
            "j1": [15, 17, 16, 13, 14],
            "j2": [15, 16, 16, 15, 16],
            "total": 153
        },
        "total_score": 309
    },

    # УИППЕТ ВЕТЕРАНЫ СУКИ
    {
        "catalog_num": 30,
        "name_ru": "ВАЛЬПАЙН ПЕК САНСА",
        "name_en": "VALPAIN PEK SANSA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "veteran",
        "place": 1,
        "cert": "CC",
        "title": "Лучший ветеран",
        "status": "finished",
        "heat1": {
            "heat_num": 10, "collar": "red",
            "j1": [16, 17, 18, 15, 17],
            "j2": [15, 17, 16, 16, 17],
            "total": 164
        },
        "heat2": {
            "heat_num": 21, "collar": "red",
            "j1": [19, 18, 18, 19, 19],
            "j2": [17, 17, 17, 17, 17],
            "total": 178
        },
        "total_score": 342
    },

    # УИППЕТ СТАНДАРТНЫЙ ОБЩАЯ
    {
        "catalog_num": 35,
        "name_ru": "СТАНГЕРС ЛАНД БРАТИСЛАВА",
        "name_en": "STANGERS LAND BRATISLAVA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 8, "collar": "red",
            "j1": [19, 19, 20, 20, 19],
            "j2": [18, 18, 17, 17, 18],
            "total": 185
        },
        "heat2": {
            "heat_num": 17, "collar": "white",
            "j1": [18, 19, 19, 18, 19],
            "j2": [17, 19, 18, 17, 18],
            "total": 182
        },
        "total_score": 367
    },
    {
        "catalog_num": 37,
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
            "heat_num": 7, "collar": "red",
            "j1": [18, 18, 19, 17, 18],
            "j2": [18, 17, 17, 18, 17],
            "total": 177
        },
        "heat2": {
            "heat_num": 20, "collar": "red",
            "j1": [19, 19, 20, 20, 19],
            "j2": [18, 19, 18, 19, 18],
            "total": 189
        },
        "total_score": 366
    },
    {
        "catalog_num": 31,
        "name_ru": "ГАЙ",
        "name_en": "GUY",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 3,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 6, "collar": "white",
            "j1": [17, 19, 18, 19, 18],
            "j2": [17, 17, 17, 16, 18],
            "total": 176
        },
        "heat2": {
            "heat_num": 19, "collar": "white",
            "j1": [19, 20, 20, 20, 19],
            "j2": [18, 18, 18, 18, 18],
            "total": 188
        },
        "total_score": 364
    },
    {
        "catalog_num": 38,
        "name_ru": "СТАНГЕРС ЛАНД ВАЛЬДИВИЯ",
        "name_en": "STANGERS LAND VALDIVIA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 4,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 6, "collar": "red",
            "j1": [18, 18, 17, 18, 18],
            "j2": [18, 18, 17, 18, 18],
            "total": 178
        },
        "heat2": {
            "heat_num": 18, "collar": "red",
            "j1": [18, 19, 20, 19, 19],
            "j2": [18, 18, 17, 18, 18],
            "total": 184
        },
        "total_score": 362
    },
    {
        "catalog_num": 33,
        "name_ru": "СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН",
        "name_en": "STANGERS LAND VERSAILLES CHARMAN",
        "breed": "Уиппет",
        "gender": "male",
        "class": "standard",
        "place": 5,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 7, "collar": "white",
            "j1": [19, 19, 20, 19, 19],
            "j2": [18, 18, 17, 18, 18],
            "total": 185
        },
        "heat2": {
            "heat_num": 17, "collar": "red",
            "j1": [17, 17, 18, 18, 18],
            "j2": [18, 18, 18, 17, 18],
            "total": 177
        },
        "total_score": 362
    },
    {
        "catalog_num": 36,
        "name_ru": "СТАНГЕРС ЛАНД БРИЗА",
        "name_en": "STANGERS LAND BRIZA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 6,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 9, "collar": "red",
            "j1": [18, 19, 19, 17, 18],
            "j2": [16, 18, 17, 17, 18],
            "total": 177
        },
        "heat2": {
            "heat_num": 18, "collar": "white",
            "j1": [16, 18, 18, 18, 18],
            "j2": [18, 19, 18, 18, 18],
            "total": 179
        },
        "total_score": 356
    },
    {
        "catalog_num": 34,
        "name_ru": "СТАНГЕРС ЛАНД АЛЬТАНА",
        "name_en": "STANGERS LAND ALTANA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": 7,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 9, "collar": "white",
            "j1": [17, 18, 17, 18, 18],
            "j2": [15, 18, 17, 16, 18],
            "total": 172
        },
        "heat2": {
            "heat_num": 19, "collar": "red",
            "j1": [17, 18, 18, 18, 18],
            "j2": [17, 19, 18, 17, 18],
            "total": 178
        },
        "total_score": 350
    },
    {
        "catalog_num": 39,
        "name_ru": "СТИЛАР ХАРЛИ КВИНН",
        "name_en": "STYLAR HARLAY QUINN",
        "breed": "Уиппет",
        "gender": "female",
        "class": "standard",
        "place": None,
        "status": "injured",
        "disqualification_reason": "Травма",
        "heat1": {
            "heat_num": 8, "collar": "white",
            "j1": [17, 18, 18, 19, 18],
            "j2": [17, 17, 17, 17, 17],
            "total": 175
        },
        "heat2": {
            "heat_num": None, "collar": None,
            "disqualified": True,
            "disqualification_reason": "Травма"
        },
        "total_score": 175
    },

    # УИППЕТ СТАНДАРТНЫЙ-СПРИНТЕРЫ КОБЕЛИ
    {
        "catalog_num": 32,
        "name_ru": "АЦУАРЕЛА ДЕЛЬ РИО ЭТАМИН",
        "name_en": "ACUARELA DEL' RIO ETAMIN",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 1,
        "cert": "CC",
        "title": "Чемпион РКФ",
        "status": "finished",
        "heat1": {
            "heat_num": 2, "collar": "white",
            "j1": [19, 19, 20, 20, 19],
            "j2": [17, 18, 17, 17, 18],
            "total": 184
        },
        "heat2": {
            "heat_num": 14, "collar": "white",
            "j1": [17, 19, 18, 19, 19],
            "j2": [17, 17, 17, 18, 19],
            "total": 180
        },
        "total_score": 364
    },
    {
        "catalog_num": 22,
        "name_ru": "ДОН КОРЛЕОНЕ",
        "name_en": "DON CORLEONE",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 3, "collar": "red",
            "j1": [17, 17, 18, 18, 19],
            "j2": [18, 18, 17, 17, 17],
            "total": 176
        },
        "heat2": {
            "heat_num": 12, "collar": "white",
            "j1": [19, 19, 19, 20, 19],
            "j2": [18, 17, 17, 18, 18],
            "total": 184
        },
        "total_score": 360
    },
    {
        "catalog_num": 26,
        "name_ru": "СУРСКИЙ СУВЕНИР ЯСТРЕБ",
        "name_en": "SURSKIY SUVENIR YASTREB",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 3,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 3, "collar": "white",
            "j1": [18, 18, 19, 19, 18],
            "j2": [17, 17, 17, 17, 17],
            "total": 177
        },
        "heat2": {
            "heat_num": 13, "collar": "white",
            "j1": [19, 18, 17, 18, 19],
            "j2": [18, 17, 17, 18, 18],
            "total": 179
        },
        "total_score": 356
    },
    {
        "catalog_num": 25,
        "name_ru": "ИСТОРИЯ ЛЮБВИ ЭВР БЫСТРЫЙ",
        "name_en": "ISTORIYA LUBVI EVR BY'STRY'J",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 4,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 2, "collar": "red",
            "j1": [17, 18, 18, 18, 18],
            "j2": [17, 17, 17, 16, 17],
            "total": 173
        },
        "heat2": {
            "heat_num": 13, "collar": "red",
            "j1": [17, 19, 18, 17, 18],
            "j2": [17, 18, 17, 17, 18],
            "total": 176
        },
        "total_score": 349
    },
    {
        "catalog_num": 24,
        "name_ru": "ИСТОРИЯ ЛЮБВИ ПЕТЕРБУРГ БЬЮТИФУЛ",
        "name_en": "ISTORIYA LUBVI PETERBURG BEAUTIFUL",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 5,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 1, "collar": "red",
            "j1": [19, 18, 19, 19, 18],
            "j2": [16, 17, 17, 16, 17],
            "total": 176
        },
        "heat2": {
            "heat_num": 14, "collar": "red",
            "j1": [16, 18, 18, 17, 18],
            "j2": [16, 17, 17, 16, 18],
            "total": 171
        },
        "total_score": 347
    },
    {
        "catalog_num": 23,
        "name_ru": "АМОРОУС БЭБИ ПИНКЕРТОН",
        "name_en": "AMOROUS BABY PINKERTON",
        "breed": "Уиппет",
        "gender": "male",
        "class": "sprinter",
        "place": 6,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 1, "collar": "white",
            "j1": [17, 17, 19, 16, 16],
            "j2": [16, 17, 17, 17, 15],
            "total": 167
        },
        "heat2": {
            "heat_num": 12, "collar": "red",
            "j1": [17, 18, 18, 18, 17],
            "j2": [17, 17, 17, 17, 18],
            "total": 174
        },
        "total_score": 341
    },

    # УИППЕТ СТАНДАРТНЫЙ-СПРИНТЕРЫ СУКИ
    {
        "catalog_num": 28,
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
            "heat_num": 4, "collar": "white",
            "j1": [19, 19, 20, 19, 20],
            "j2": [17, 18, 18, 18, 18],
            "total": 186
        },
        "heat2": {
            "heat_num": 15, "collar": "red",
            "j1": [20, 19, 20, 19, 19],
            "j2": [18, 19, 18, 18, 18],
            "total": 188
        },
        "total_score": 374
    },
    {
        "catalog_num": 27,
        "name_ru": "КУЛИКОВО ПОЛЕ ГОРДЕЯ",
        "name_en": "KULIKOVO POLE GORDEYA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "sprinter",
        "place": 2,
        "cert": "CC",
        "title": "CACL",
        "status": "finished",
        "heat1": {
            "heat_num": 4, "collar": "red",
            "j1": [18, 17, 18, 18, 19],
            "j2": [17, 17, 17, 18, 17],
            "total": 176
        },
        "heat2": {
            "heat_num": 16, "collar": "red",
            "j1": [19, 18, 18, 19, 19],
            "j2": [17, 17, 16, 17, 18],
            "total": 178
        },
        "total_score": 354
    },
    {
        "catalog_num": 29,
        "name_ru": "ФЕЕЛ МАЙ ХЕАРТ АЛЕТЕЙЯ",
        "name_en": "FEEL MY HEART ALETHEA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "sprinter",
        "place": 3,
        "cert": "CC",
        "title": None,
        "status": "finished",
        "heat1": {
            "heat_num": 5, "collar": "red",
            "j1": [18, 19, 18, 19, 19],
            "j2": [15, 17, 17, 16, 17],
            "total": 175
        },
        "heat2": {
            "heat_num": 15, "collar": "white",
            "j1": [17, 17, 18, 17, 17],
            "j2": [17, 18, 17, 18, 18],
            "total": 174
        },
        "total_score": 349
    },

    # УИППЕТ ЮНИОРЫ СУКИ
    {
        "catalog_num": 40,
        "name_ru": "ДОЛГОПУПС АЛИСА",
        "name_en": "DOLCOPUPS ALISA",
        "breed": "Уиппет",
        "gender": "female",
        "class": "junior",
        "place": 1,
        "cert": None,
        "title": "Лучший юниор",
        "status": "finished",
        "heat1": {
            "heat_num": 11, "collar": "red",
            "j1": [20, 19, 19, 20, 19],
            "j2": [18, 17, 17, 18, 18],
            "total": 185
        },
        "heat2": {
            "heat_num": 22, "collar": "red",
            "j1": [19, 18, 19, 17, 17],
            "j2": [18, 18, 17, 17, 19],
            "total": 179
        },
        "total_score": 364
    },

    # НЕЯВИВШИЕСЯ УЧАСТНИКИ
    {
        "catalog_num": 9,
        "name_ru": "КАВАЛЛЬЕРИК ФАКТОТУМ",
        "name_en": "CAVALLIERIK FACTOTUM",
        "breed": "Русская псовая борзая",
        "gender": "male",
        "class": "standard",
        "place": None,
        "status": "dns",
        "disqualification_reason": "Неявка",
        "heat1": None,
        "heat2": None,
        "total_score": None
    },
    {
        "catalog_num": 11,
        "name_ru": "АТАКА",
        "name_en": "ATAKA",
        "breed": "Русская псовая борзая",
        "gender": "female",
        "class": "standard",
        "place": None,
        "status": "dns",
        "disqualification_reason": "Неявка",
        "heat1": None,
        "heat2": None,
        "total_score": None
    },
    {
        "catalog_num": 18,
        "name_ru": "ТАЙ-МЕКС АУРА",
        "name_en": "THAI-MEX AURA",
        "breed": "Тайский риджбек",
        "gender": "female",
        "class": "standard",
        "place": None,
        "status": "dns",
        "disqualification_reason": "Неявка",
        "heat1": None,
        "heat2": None,
        "total_score": None
    },
    {
        "catalog_num": 41,
        "name_ru": "ЛИБЕРТИ ИНДИГО СТАР",
        "name_en": "LIBERTY INDIGO STAR",
        "breed": "Фараонова собака",
        "gender": "female",
        "class": "veteran",
        "place": None,
        "status": "dns",
        "disqualification_reason": "Неявка",
        "heat1": None,
        "heat2": None,
        "total_score": None
    },
    {
        "catalog_num": 42,
        "name_ru": "ГАЛМАД СТАР ВОИБОР",
        "name_en": "GALMAD STAR VOIBOR",
        "breed": "Фараонова собака",
        "gender": "male",
        "class": "standard",
        "place": None,
        "status": "dns",
        "disqualification_reason": "Неявка",
        "heat1": None,
        "heat2": None,
        "total_score": None
    },
    {
        "catalog_num": 43,
        "name_ru": "ГАЛМАД СТАР ВЕЛИНА",
        "name_en": "GALMAD STAR VELINA",
        "breed": "Фараонова собака",
        "gender": "female",
        "class": "standard",
        "place": None,
        "status": "dns",
        "disqualification_reason": "Неявка",
        "heat1": None,
        "heat2": None,
        "total_score": None
    }
]

print(f"Total dogs: {len(dogs)}")
errors = []

for d in dogs:
    # check heats
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
        if sum_j1 + sum_j2 != h_tot:
            errors.append(f"Dog #{cat} {name} {h_name}: sum_j1 ({sum_j1}) + sum_j2 ({sum_j2}) = {sum_j1+sum_j2} != declared {h_tot}")
            
    if d["status"] == "finished":
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
