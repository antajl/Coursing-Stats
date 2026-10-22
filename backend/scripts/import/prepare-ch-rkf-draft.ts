import fs from 'node:fs';
import path from 'node:path';

interface JudgeScore {
  judge_number: number;
  scores: [number, number, number, number, number];
  sum: number;
}

interface Heat {
  heat_number: number;
  bib_color?: 'red' | 'white';
  judges?: JudgeScore[];
  total?: number;
  disqualified?: boolean;
  disqualification_reason?: string | null;
}

interface ResultInput {
  catalog_no: number;
  breed: string;
  breed_class: string;
  sex: 'Кобель' | 'Сука';
  name_ru: string;
  name_lat: string;
  placement: number | null;
  total_score: number | null;
  qualification: string;
  vc: string;
  status: string;
  status_reason: string | null;
  heats: Heat[];
}

function makeResult(r: ResultInput, idx: number) {
  return {
    id: idx + 1,
    catalog_no: r.catalog_no,
    breed_class: r.breed_class,
    placement: r.placement,
    total_score: r.total_score,
    judge_count: r.heats.some(h => h.judges && h.judges.length > 0) ? 2 : 0,
    qualification: r.qualification,
    vc: r.vc,
    status: r.status,
    status_reason: r.status_reason,
    dog: {
      name_lat: r.name_lat,
      name_ru: r.name_ru,
      breed: r.breed,
      sex: r.sex
    },
    raw_scores_json: {
      heats: r.heats,
      grand_total: r.total_score,
      format: 'coursing'
    }
  };
}

const results: ResultInput[] = [
  // --- ЛЕВРЕТКА СТАНДАРТ КОБЕЛИ ---
  {
    catalog_no: 14,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'МОНАННА РЕПАБЛИК ХИДАН',
    name_lat: 'MONANNA REPUBLIC HIDAN',
    placement: 1,
    total_score: 338,
    qualification: 'Чемпион РКФ, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 6,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 17], sum: 82 },
          { judge_number: 2, scores: [16, 17, 17, 17, 17], sum: 84 }
        ],
        total: 166
      },
      {
        heat_number: 23,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 172
      }
    ]
  },
  {
    catalog_no: 13,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АПРИОРИ СТАР ЮКОС',
    name_lat: 'APRIORI STAR YUKOS',
    placement: 2,
    total_score: 328,
    qualification: 'CACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 6,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 15, 15, 17], sum: 80 },
          { judge_number: 2, scores: [17, 16, 16, 17, 17], sum: 83 }
        ],
        total: 163
      },
      {
        heat_number: 23,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 18, 17, 17, 18], sum: 86 },
          { judge_number: 2, scores: [15, 16, 15, 16, 17], sum: 79 }
        ],
        total: 165
      }
    ]
  },

  // --- ЛЕВРЕТКА СТАНДАРТ-СПРИНТЕРЫ МИКС ---
  {
    catalog_no: 12,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ВЕТЛУГА ХАЛВА РЕЙСДОГ',
    name_lat: 'VETLUGA HALVA RACEDOG',
    placement: 1,
    total_score: 342,
    qualification: 'Чемпион РКФ, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 5,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 16, 17], sum: 83 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 168
      },
      {
        heat_number: 22,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 16, 18], sum: 87 },
          { judge_number: 2, scores: [17, 18, 17, 17, 18], sum: 87 }
        ],
        total: 174
      }
    ]
  },
  {
    catalog_no: 11,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'РЕЙСДОГ ЯМАМОТО',
    name_lat: 'RACEDOG YAMAMOTO',
    placement: 2,
    total_score: 314,
    qualification: 'CACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 5,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [13, 16, 15, 15, 17], sum: 76 },
          { judge_number: 2, scores: [15, 16, 16, 15, 16], sum: 78 }
        ],
        total: 154
      },
      {
        heat_number: 22,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 17, 17, 14, 18], sum: 81 },
          { judge_number: 2, scores: [15, 16, 16, 15, 17], sum: 79 }
        ],
        total: 160
      }
    ]
  },

  // --- САЛЮКИ СТАНДАРТ КОБЕЛИ ---
  {
    catalog_no: 23,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'САЛГРЕЙ\'С ВЕЛАР',
    name_lat: 'SALGREY\'S VELAR',
    placement: 1,
    total_score: 346,
    qualification: 'Чемпион РКФ, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 38,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [18, 19, 17, 18, 18], sum: 90 },
          { judge_number: 2, scores: [18, 17, 16, 18, 16], sum: 85 }
        ],
        total: 175
      },
      {
        heat_number: 57,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 19, 18, 16, 18], sum: 88 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 171
      }
    ]
  },
  {
    catalog_no: 22,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'БЕЛЬ ЭТУАЛЬ АМБАССАДОР ІІ',
    name_lat: 'BEL ETUAL AMBASSADOR II',
    placement: 2,
    total_score: 342,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 38,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 18, 18, 17, 18], sum: 87 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 171
      },
      {
        heat_number: 59,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 18, 18, 17, 18], sum: 87 },
          { judge_number: 2, scores: [16, 17, 17, 17, 17], sum: 84 }
        ],
        total: 171
      }
    ]
  },
  {
    catalog_no: 21,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'УЛИСС АЛЬ САИФ МАДЖАЛ',
    name_lat: 'ULYSSE AL SAIF MAJAL',
    placement: 3,
    total_score: 339,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 40,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [18, 18, 18, 18, 18], sum: 90 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 174
      },
      {
        heat_number: 57,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 17, 18], sum: 87 },
          { judge_number: 2, scores: [15, 16, 16, 15, 16], sum: 78 }
        ],
        total: 165
      }
    ]
  },

  // --- САЛЮКИ СТАНДАРТ СУКИ ---
  {
    catalog_no: 25,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БЕЛЬ ЭТУАЛЬ КАЯЛА',
    name_lat: 'BEL ETUAL KAYALA',
    placement: 1,
    total_score: 346,
    qualification: 'Чемпион РКФ, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 39,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [18, 18, 18, 18, 18], sum: 90 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 174
      },
      {
        heat_number: 61,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [16, 18, 17, 16, 17], sum: 84 }
        ],
        total: 172
      }
    ]
  },
  {
    catalog_no: 26,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА',
    name_lat: 'EMUL DE GEPARD GELILA AL RAWDA',
    placement: 2,
    total_score: 343,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 42,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 18, 18, 16, 18], sum: 86 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 169
      },
      {
        heat_number: 58,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 16, 18], sum: 87 },
          { judge_number: 2, scores: [17, 18, 17, 17, 18], sum: 87 }
        ],
        total: 174
      }
    ]
  },
  {
    catalog_no: 24,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БЕЛЬ ЭТУАЛЬ БОН ВОЯЖ',
    name_lat: 'BEL ETUAL BON VOYAGE',
    placement: 3,
    total_score: 339,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 39,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [17, 17, 16, 17, 16], sum: 83 }
        ],
        total: 171
      },
      {
        heat_number: 58,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 18, 17, 15, 18], sum: 84 },
          { judge_number: 2, scores: [16, 17, 17, 16, 18], sum: 84 }
        ],
        total: 168
      }
    ]
  },

  // --- САЛЮКИ ЮНИОРЫ КОБЕЛИ ---
  {
    catalog_no: 603,
    breed: 'Салюки',
    breed_class: 'Салюки - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИМРАН НУККИ',
    name_lat: 'IMRAN NUKKI',
    placement: 1,
    total_score: 341,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 44,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 18, 18], sum: 89 },
          { judge_number: 2, scores: [17, 17, 16, 16, 17], sum: 83 }
        ],
        total: 172
      },
      {
        heat_number: 63,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 18, 18, 16, 17], sum: 85 },
          { judge_number: 2, scores: [16, 18, 17, 16, 17], sum: 84 }
        ],
        total: 169
      }
    ]
  },
  {
    catalog_no: 602,
    breed: 'Салюки',
    breed_class: 'Салюки - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИМРАН МАКСИМУС',
    name_lat: 'IMRAN MAKSIMUS',
    placement: 2,
    total_score: 337,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 44,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [15, 16, 16, 15, 17], sum: 79 }
        ],
        total: 167
      },
      {
        heat_number: 63,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 16, 18], sum: 87 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 170
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТ КОБЕЛИ ---
  {
    catalog_no: 40,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ЛАГГАР ФАЛКОН',
    name_lat: 'STANGERS LAND LAGGAR FALCON',
    placement: 1,
    total_score: 339,
    qualification: 'Чемпион РКФ, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 13,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 17, 17], sum: 84 },
          { judge_number: 2, scores: [16, 17, 17, 17, 17], sum: 84 }
        ],
        total: 168
      },
      {
        heat_number: 31,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 18, 18], sum: 88 },
          { judge_number: 2, scores: [17, 16, 16, 17, 17], sum: 83 }
        ],
        total: 171
      }
    ]
  },
  {
    catalog_no: 38,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН',
    name_lat: 'STANGERS LAND VERSAILLES CHARMAN',
    placement: 2,
    total_score: 337,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 14,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 16, 17], sum: 83 },
          { judge_number: 2, scores: [16, 17, 16, 17, 17], sum: 83 }
        ],
        total: 166
      },
      {
        heat_number: 28,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 17, 18], sum: 87 },
          { judge_number: 2, scores: [17, 17, 17, 16, 17], sum: 84 }
        ],
        total: 171
      }
    ]
  },
  {
    catalog_no: 41,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ЯРЫЙ ВЕТЕР ИЗ ПОЛЕТА МЕЧТЫ',
    name_lat: 'YARYJ VETER IZ POLETA MECHTI',
    placement: 3,
    total_score: 337,
    qualification: 'RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 13,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 17, 17, 17, 17], sum: 83 },
          { judge_number: 2, scores: [16, 17, 16, 17, 17], sum: 83 }
        ],
        total: 166
      },
      {
        heat_number: 30,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [18, 18, 18, 18, 18], sum: 90 },
          { judge_number: 2, scores: [16, 16, 16, 16, 17], sum: 81 }
        ],
        total: 171
      }
    ]
  },
  {
    catalog_no: 35,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ВАЙЛДАБАУТ ДАБЛ АТОМИК РЕЙС',
    name_lat: 'WILDABOUT DOUBLE ATOMIC RACE',
    placement: 4,
    total_score: 336,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 11,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 16, 17], sum: 83 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 166
      },
      {
        heat_number: 31,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 170
      }
    ]
  },
  {
    catalog_no: 34,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ДЕВАДЖ 1976 ЗАРУК',
    name_lat: 'DEVAJ 1976 ZAROOQ',
    placement: 5,
    total_score: 335,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 14,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 17, 17], sum: 84 },
          { judge_number: 2, scores: [16, 16, 16, 16, 17], sum: 81 }
        ],
        total: 165
      },
      {
        heat_number: 30,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 16, 18], sum: 87 },
          { judge_number: 2, scores: [17, 17, 16, 16, 17], sum: 83 }
        ],
        total: 170
      }
    ]
  },
  {
    catalog_no: 37,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'МИСТФИЛД ДОДЖЕР',
    name_lat: 'MISTFIELD DODGER',
    placement: 6,
    total_score: 334,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 12,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 17, 17], sum: 82 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 164
      },
      {
        heat_number: 29,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 17, 18], sum: 87 },
          { judge_number: 2, scores: [17, 17, 16, 16, 17], sum: 83 }
        ],
        total: 170
      }
    ]
  },
  {
    catalog_no: 36,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'МЕТЕЛЬ АВГУСТА АЙРЕОН',
    name_lat: 'METEL\' AVGUSTA AYREON',
    placement: 7,
    total_score: 333,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 12,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 17, 17, 16, 17], sum: 82 },
          { judge_number: 2, scores: [16, 17, 17, 17, 17], sum: 84 }
        ],
        total: 166
      },
      {
        heat_number: 28,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 18, 17, 18, 18], sum: 87 },
          { judge_number: 2, scores: [16, 16, 16, 15, 17], sum: 80 }
        ],
        total: 167
      }
    ]
  },
  {
    catalog_no: 39,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ВИНСЕНТ',
    name_lat: 'STANGERS LAND VINCENT',
    placement: 8,
    total_score: 330,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 11,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 15, 17], sum: 80 },
          { judge_number: 2, scores: [16, 17, 16, 16, 16], sum: 81 }
        ],
        total: 161
      },
      {
        heat_number: 29,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 18, 18], sum: 88 },
          { judge_number: 2, scores: [16, 16, 16, 16, 17], sum: 81 }
        ],
        total: 169
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТ СУКИ ---
  {
    catalog_no: 45,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД ИНГРИД ЭЛЕГАНТ',
    name_lat: 'STANGERS LAND INGRID ELEGANT',
    placement: 1,
    total_score: 343,
    qualification: 'Чемпион РКФ, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 16,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 17], sum: 85 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 170
      },
      {
        heat_number: 33,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 19], sum: 89 },
          { judge_number: 2, scores: [17, 17, 17, 16, 17], sum: 84 }
        ],
        total: 173
      }
    ]
  },
  {
    catalog_no: 46,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД КАТАЛИНА',
    name_lat: 'STANGERS LAND KATALINA',
    placement: 2,
    total_score: 343,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 15,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 17], sum: 85 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 170
      },
      {
        heat_number: 33,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 18, 18], sum: 89 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 173
      }
    ]
  },
  {
    catalog_no: 42,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'АНГЕЛИК ВИНГС',
    name_lat: 'ANGELIC WINGS',
    placement: 3,
    total_score: 333,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 15,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 17], sum: 82 },
          { judge_number: 2, scores: [15, 17, 16, 16, 17], sum: 81 }
        ],
        total: 163
      },
      {
        heat_number: 32,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 170
      }
    ]
  },
  {
    catalog_no: 44,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ДРИМИ ДАВ',
    name_lat: 'DREAMY DOVE',
    placement: 4,
    total_score: 323,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 16,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 14, 17], sum: 77 },
          { judge_number: 2, scores: [15, 16, 16, 15, 17], sum: 79 }
        ],
        total: 156
      },
      {
        heat_number: 32,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 18, 18], sum: 88 },
          { judge_number: 2, scores: [16, 16, 15, 16, 16], sum: 79 }
        ],
        total: 167
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТ-СПРИНТЕРЫ КОБЕЛИ ---
  {
    catalog_no: 28,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИСТОРИЯ ЛЮБВИ ИЗУМРУД',
    name_lat: 'ISTORIYA LUBVI IZUMRUD',
    placement: 1,
    total_score: 339,
    qualification: 'Чемпион РКФ, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 7,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 17], sum: 82 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 167
      },
      {
        heat_number: 24,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 172
      }
    ]
  },
  {
    catalog_no: 27,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ВАРВАР КОНАН БЕССТРАШНЫЙ',
    name_lat: 'VARVAR KONAN BESSTRASHNYI',
    placement: 2,
    total_score: 326,
    qualification: 'CACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 8,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 16, 17], sum: 83 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 165
      },
      {
        heat_number: 24,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 15, 17], sum: 83 },
          { judge_number: 2, scores: [15, 16, 16, 15, 16], sum: 78 }
        ],
        total: 161
      }
    ]
  },
  {
    catalog_no: 29,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ФЕЕЛ МАЙ ХЕАРТ БИСКВИТ',
    name_lat: 'FEEL MY HEART BISCUIT',
    placement: 3,
    total_score: 323,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 7,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 15, 17], sum: 78 },
          { judge_number: 2, scores: [16, 16, 16, 16, 16], sum: 80 }
        ],
        total: 158
      },
      {
        heat_number: 25,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 17, 18], sum: 85 },
          { judge_number: 2, scores: [16, 16, 15, 16, 17], sum: 80 }
        ],
        total: 165
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТ-СПРИНТЕРЫ СУКИ ---
  {
    catalog_no: 30,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'АЙЯ ВИНД',
    name_lat: 'AIYA WIND',
    placement: 1,
    total_score: 341,
    qualification: 'Чемпион РКФ, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 10,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 17], sum: 85 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 169
      },
      {
        heat_number: 27,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 18, 18], sum: 88 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 172
      }
    ]
  },
  {
    catalog_no: 31,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ГРЕЙС КЭНДИ',
    name_lat: 'GRACE CANDY',
    placement: 2,
    total_score: 332,
    qualification: 'CACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 10,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 17], sum: 82 },
          { judge_number: 2, scores: [16, 17, 15, 15, 17], sum: 80 }
        ],
        total: 162
      },
      {
        heat_number: 26,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 18, 18], sum: 88 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 170
      }
    ]
  },
  {
    catalog_no: 33,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД КОМЕТА',
    name_lat: 'STANGERS LAND KOMETA',
    placement: 3,
    total_score: 331,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 9,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 17, 17], sum: 84 },
          { judge_number: 2, scores: [16, 16, 15, 16, 17], sum: 80 }
        ],
        total: 164
      },
      {
        heat_number: 27,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 18, 17, 16, 18], sum: 85 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 167
      }
    ]
  },
  {
    catalog_no: 32,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА',
    name_lat: 'STANGERS LAND ZLATOSLAVA',
    placement: 4,
    total_score: 325,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 9,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 15, 17], sum: 82 },
          { judge_number: 2, scores: [15, 16, 16, 15, 17], sum: 79 }
        ],
        total: 161
      },
      {
        heat_number: 26,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 16, 17], sum: 85 },
          { judge_number: 2, scores: [15, 16, 16, 15, 17], sum: 79 }
        ],
        total: 164
      }
    ]
  },

  // --- ФАРАОНОВА СОБАКА СТАНДАРТ КОБЕЛИ ---
  {
    catalog_no: 47,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ШНЕЙДЕР РИЧ ЮДЖИН',
    name_lat: 'SCHNEIDER RICH YOUDZHIN',
    placement: 1,
    total_score: 339,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 4,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 17, 17], sum: 83 },
          { judge_number: 2, scores: [16, 17, 16, 17, 17], sum: 83 }
        ],
        total: 166
      },
      {
        heat_number: 21,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 17, 18], sum: 87 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 173
      }
    ]
  },

  // --- ЧИРНЕКО ДЕЛЬ ЭТНА ВЕТЕРАНЫ КОБЕЛИ ---
  {
    catalog_no: 49,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Ветераны - Кобель',
    sex: 'Кобель',
    name_ru: 'TESORO SOLARE DOMENICO',
    name_lat: 'TESORO SOLARE DOMENICO',
    placement: 1,
    total_score: 329,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 45,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 15, 17], sum: 83 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 165
      },
      {
        heat_number: 64,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 15, 17], sum: 82 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 164
      }
    ]
  },

  // --- ЧИРНЕКО ДЕЛЬ ЭТНА СТАНДАРТ МИКС ---
  {
    catalog_no: 51,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АРТУ',
    name_lat: 'ARTU',
    placement: 1,
    total_score: 346,
    qualification: 'Чемпион РКФ, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 41,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 17, 18, 18], sum: 88 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 172
      },
      {
        heat_number: 60,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [18, 18, 18, 18, 18], sum: 90 },
          { judge_number: 2, scores: [17, 17, 16, 17, 17], sum: 84 }
        ],
        total: 174
      }
    ]
  },
  {
    catalog_no: 52,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'РОССО БОРЕАЛЕ АВРОРА',
    name_lat: 'ROSSO BOREALE AURORA',
    placement: 2,
    total_score: 240,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 43,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 18], sum: 83 },
          { judge_number: 2, scores: [15, 15, 14, 15, 16], sum: 75 }
        ],
        total: 158
      },
      {
        heat_number: 60,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [4, 16, 15, 2, 5], sum: 42 },
          { judge_number: 2, scores: [3, 16, 15, 3, 3], sum: 40 }
        ],
        total: 82
      }
    ]
  },
  {
    catalog_no: 50,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АЛИЯ ЛЮКС ДЗАФФИРО',
    name_lat: 'ALIA LUX ZAFFIRO',
    placement: null,
    total_score: 156,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Пункт Правил проведения состязаний 4.7.1.2 (д, ж))',
    heats: [
      {
        heat_number: 41,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 15, 16], sum: 79 },
          { judge_number: 2, scores: [15, 16, 15, 15, 16], sum: 77 }
        ],
        total: 156
      },
      {
        heat_number: 62,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Пункт Правил проведения состязаний 4.7.1.2 (д, ж))'
      }
    ]
  }
];

const draft = {
  date_start: '2026-10-03',
  date_end: '2026-10-04',
  title: 'Чемпионат РКФ по курсингу',
  rank_label: 'ЧРКФ\n(Курсинг борзых)',
  event_type: 'coursing',
  competition_kind: 'ЧРКФ',
  competition_type: 'Курсинг борзых',
  host_club: 'МОРОО "Федерация спортивно-прикладного собаководства"',
  location: 'Московская область, д. Михайловское',
  results: results.map(makeResult)
};

const outPath = path.resolve('data/temp/draft-2026-10-03.json');
fs.writeFileSync(outPath, JSON.stringify(draft, null, 2), 'utf-8');
console.log(`Generated ${draft.results.length} results to ${outPath}`);
