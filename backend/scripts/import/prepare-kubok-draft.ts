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
    catalog_no: 22,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АПРИОРИ СТАР ЮКОС',
    name_lat: 'APRIORI STAR YUKOS',
    placement: 1,
    total_score: 334,
    qualification: 'Победитель Кубка России, CACLBr, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 47,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 16, 17, 17, 17], sum: 84 },
          { judge_number: 2, scores: [16, 16, 17, 17, 17], sum: 83 }
        ],
        total: 167
      },
      {
        heat_number: 47,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [18, 17, 17, 18, 18], sum: 88 }
        ],
        total: 167
      }
    ]
  },
  {
    catalog_no: 24,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'НЕФЕРТИТИ НЕРИС ДИВИНА ГОДСЕНД ВИП НАСЛЕДИЕ РИМА',
    name_lat: 'NTFERTITI NERIS DIVINE GODSEND VIP NASLEDIE RIMA',
    placement: 2,
    total_score: 331,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 28,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 15, 16, 17, 17], sum: 82 },
          { judge_number: 2, scores: [17, 16, 17, 17, 17], sum: 84 }
        ],
        total: 166
      },
      {
        heat_number: 46,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [17, 18, 18, 17, 17], sum: 87 }
        ],
        total: 165
      }
    ]
  },
  {
    catalog_no: 23,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'МОНАННА РЕПАБЛИК ХИДАН',
    name_lat: 'MONANNA REPUBLIC HIDAN',
    placement: 3,
    total_score: 321,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 28,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 16, 17, 17], sum: 83 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 168
      },
      {
        heat_number: 47,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [13, 15, 14, 13, 15], sum: 70 },
          { judge_number: 2, scores: [17, 18, 17, 14, 17], sum: 83 }
        ],
        total: 153
      }
    ]
  },
  {
    catalog_no: 21,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АПРИОРИ СТАР СИРИУС СУННИ БОЙ',
    name_lat: 'APRIORI STAR SIRIUS SUNNI BOY',
    placement: 4,
    total_score: 314,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 29,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 14, 15], sum: 74 },
          { judge_number: 2, scores: [14, 16, 17, 14, 17], sum: 78 }
        ],
        total: 152
      },
      {
        heat_number: 46,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 17, 17, 17], sum: 84 }
        ],
        total: 162
      }
    ]
  },

  // --- ЛЕВРЕТКА СТАНДАРТ-СПРИНТЕРЫ МИКС ---
  {
    catalog_no: 28,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'И\'М Э ЛЕГЕНД ЭНИВЕЙ',
    name_lat: 'I\'M A LEGEND ANYWAY',
    placement: 1,
    total_score: 331,
    qualification: 'Победитель Кубка России, CACLBr, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 30,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 16, 17], sum: 81 },
          { judge_number: 2, scores: [17, 17, 17, 16, 17], sum: 84 }
        ],
        total: 165
      },
      {
        heat_number: 49,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [16, 18, 18, 17, 18], sum: 87 }
        ],
        total: 166
      }
    ]
  },
  {
    catalog_no: 27,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ВЕТЛУГА МЕГУМИ МАРС ДЕЛ ЕСПАСИО',
    name_lat: 'VETLUGA MEGUMI MARS DEL ESPACIO',
    placement: 2,
    total_score: 330,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 30,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 17], sum: 85 },
          { judge_number: 2, scores: [16, 18, 17, 14, 17], sum: 82 }
        ],
        total: 167
      },
      {
        heat_number: 50,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 17], sum: 82 },
          { judge_number: 2, scores: [15, 17, 17, 14, 18], sum: 81 }
        ],
        total: 163
      }
    ]
  },
  {
    catalog_no: 29,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ВЕТЛУГА ХАЛВА РЕЙСДОГ',
    name_lat: 'VETLUGA HALVA RACEDOG',
    placement: 3,
    total_score: 322,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 31,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 15, 15], sum: 77 },
          { judge_number: 2, scores: [14, 18, 16, 15, 17], sum: 80 }
        ],
        total: 157
      },
      {
        heat_number: 49,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 16], sum: 77 },
          { judge_number: 2, scores: [18, 17, 17, 18, 18], sum: 88 }
        ],
        total: 165
      }
    ]
  },
  {
    catalog_no: 25,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ПЕРМЬ ВЕЛИКАЯ ЗЕФИР',
    name_lat: 'PERM VELIKAYA ZEFIR',
    placement: 4,
    total_score: 305,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 31,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 15, 16], sum: 78 },
          { judge_number: 2, scores: [15, 17, 16, 14, 16], sum: 78 }
        ],
        total: 156
      },
      {
        heat_number: 48,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 15, 15, 14, 16], sum: 74 },
          { judge_number: 2, scores: [13, 17, 16, 13, 16], sum: 75 }
        ],
        total: 149
      }
    ]
  },
  {
    catalog_no: 26,
    breed: 'Малая итальянская борзая',
    breed_class: 'Малая итальянская борзая - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'РЕЙСДОГ ЯМАМОТО',
    name_lat: 'RACEDOG YAMAMOTO',
    placement: 5,
    total_score: 272,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 32,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [13, 14, 13, 11, 13], sum: 64 },
          { judge_number: 2, scores: [10, 16, 10, 10, 12], sum: 58 }
        ],
        total: 122
      },
      {
        heat_number: 48,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 15, 15, 15, 16], sum: 75 },
          { judge_number: 2, scores: [13, 16, 16, 14, 16], sum: 75 }
        ],
        total: 150
      }
    ]
  },

  // --- САЛЮКИ СТАНДАРТ КОБЕЛИ ---
  {
    catalog_no: 81,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'САЛГРЕЙ\'С ВЕЛАР',
    name_lat: 'SALGREY\'S VELAR',
    placement: 1,
    total_score: 317,
    qualification: 'Победитель Кубка России, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 164,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [15, 15, 16, 15, 17], sum: 78 }
        ],
        total: 158
      },
      {
        heat_number: 182,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 17, 16, 16], sum: 81 },
          { judge_number: 2, scores: [14, 16, 16, 16, 16], sum: 78 }
        ],
        total: 159
      }
    ]
  },
  {
    catalog_no: 83,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'УЛИСС АЛЬ САИФ МАДЖАЛ',
    name_lat: 'ULYSSE AL SAIF MAJAL',
    placement: 2,
    total_score: 311,
    qualification: 'CACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 167,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 15, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [15, 16, 15, 16, 16], sum: 78 }
        ],
        total: 157
      },
      {
        heat_number: 180,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 16], sum: 78 },
          { judge_number: 2, scores: [15, 15, 15, 16, 15], sum: 76 }
        ],
        total: 154
      }
    ]
  },
  {
    catalog_no: 80,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'NOWRUZ NARCISSUS IBN MALA OD VJETRA',
    name_lat: 'NOWRUZ NARCISSUS IBN MALA OD VJETRA',
    placement: 3,
    total_score: 310,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 164,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 15, 15], sum: 76 },
          { judge_number: 2, scores: [16, 16, 16, 16, 17], sum: 81 }
        ],
        total: 157
      },
      {
        heat_number: 180,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 14], sum: 76 },
          { judge_number: 2, scores: [16, 15, 15, 15, 16], sum: 77 }
        ],
        total: 153
      }
    ]
  },
  {
    catalog_no: 79,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ИМРАН КАЙЛАС',
    name_lat: 'IMRAN KAILAS',
    placement: 4,
    total_score: 310,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 168,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [14, 15, 16, 16, 16], sum: 77 }
        ],
        total: 158
      },
      {
        heat_number: 182,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 16], sum: 78 },
          { judge_number: 2, scores: [14, 15, 15, 15, 15], sum: 74 }
        ],
        total: 152
      }
    ]
  },
  {
    catalog_no: 77,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'БЕЛЬ ЭТУАЛЬ ЛЕКСИНГТОН',
    name_lat: 'BEL ETUAL LEXINGTON',
    placement: 5,
    total_score: 308,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 165,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [15, 16, 15, 13, 15], sum: 74 }
        ],
        total: 154
      },
      {
        heat_number: 181,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [14, 15, 16, 14, 16], sum: 75 }
        ],
        total: 154
      }
    ]
  },
  {
    catalog_no: 76,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'БЕЛЬ ЭТУАЛЬ АМБАССАДОР ІІ',
    name_lat: 'BEL ETUAL AMBASSADOR II',
    placement: 6,
    total_score: 305,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 166,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 15], sum: 77 },
          { judge_number: 2, scores: [14, 16, 16, 14, 15], sum: 75 }
        ],
        total: 152
      },
      {
        heat_number: 179,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 16], sum: 78 },
          { judge_number: 2, scores: [16, 14, 14, 16, 15], sum: 75 }
        ],
        total: 153
      }
    ]
  },
  {
    catalog_no: 78,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'БЕЛЬ ЭТУАЛЬ МАЖОР',
    name_lat: 'BEL ETUAL MAJOR',
    placement: 7,
    total_score: 302,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 167,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 14, 15, 14, 14], sum: 71 },
          { judge_number: 2, scores: [16, 16, 16, 14, 15], sum: 77 }
        ],
        total: 148
      },
      {
        heat_number: 179,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 15], sum: 78 },
          { judge_number: 2, scores: [16, 15, 15, 15, 15], sum: 76 }
        ],
        total: 154
      }
    ]
  },
  {
    catalog_no: 82,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'САЛЮКОВ СИНБАД СТОРИ ОФ СЕВЕН СИАС',
    name_lat: 'SALUKOV SINDBAD STORY OF SEVEN SEAS',
    placement: 8,
    total_score: 288,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 166,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 15, 15, 14, 14], sum: 72 },
          { judge_number: 2, scores: [10, 15, 15, 11, 14], sum: 65 }
        ],
        total: 137
      },
      {
        heat_number: 183,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 16, 16, 15, 16], sum: 77 },
          { judge_number: 2, scores: [14, 16, 16, 13, 15], sum: 74 }
        ],
        total: 151
      }
    ]
  },
  {
    catalog_no: 75,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АЛЬ НАФИСЭХ ЛЕОН БАКСТ',
    name_lat: 'AL NAFISEH LEON BAKST',
    placement: null,
    total_score: 154,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Сход с трассы)',
    heats: [
      {
        heat_number: 165,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 15, 15], sum: 78 },
          { judge_number: 2, scores: [14, 16, 16, 14, 16], sum: 76 }
        ],
        total: 154
      },
      {
        heat_number: 181,
        bib_color: 'white',
        disqualified: true,
        disqualification_reason: 'Отстранение (Сход с трассы)'
      }
    ]
  },

  // --- САЛЮКИ СТАНДАРТ СУКИ ---
  {
    catalog_no: 84,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'АЛЬ НАФИСЭХ ИСМИЯ',
    name_lat: 'AL NAFISEH ISMIYA',
    placement: 1,
    total_score: 322,
    qualification: 'Победитель Кубка России, CACLBr, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 171,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [16, 17, 16, 17, 16], sum: 82 }
        ],
        total: 162
      },
      {
        heat_number: 187,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 16], sum: 81 },
          { judge_number: 2, scores: [15, 16, 16, 16, 16], sum: 79 }
        ],
        total: 160
      }
    ]
  },
  {
    catalog_no: 87,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'АЙСАРА',
    name_lat: 'AYSARA',
    placement: 2,
    total_score: 321,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 170,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 160
      },
      {
        heat_number: 186,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 16, 16], sum: 82 },
          { judge_number: 2, scores: [16, 17, 16, 15, 15], sum: 79 }
        ],
        total: 161
      }
    ]
  },
  {
    catalog_no: 86,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'АЛЬ НАФИСЭХ МАСАДА',
    name_lat: 'AL NAFISEH MASADA',
    placement: 3,
    total_score: 320,
    qualification: 'RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 173,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 18], sum: 86 },
          { judge_number: 2, scores: [16, 15, 15, 16, 16], sum: 78 }
        ],
        total: 164
      },
      {
        heat_number: 187,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 15, 16], sum: 78 },
          { judge_number: 2, scores: [16, 16, 16, 15, 15], sum: 78 }
        ],
        total: 156
      }
    ]
  },
  {
    catalog_no: 85,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'АЛЬ НАФИСЭХ ЛАВЬЕН',
    name_lat: 'AL NAFISEH LAVIEN',
    placement: 4,
    total_score: 317,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 169,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 17], sum: 81 },
          { judge_number: 2, scores: [15, 16, 16, 15, 16], sum: 78 }
        ],
        total: 159
      },
      {
        heat_number: 185,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 15], sum: 78 },
          { judge_number: 2, scores: [16, 16, 16, 16, 16], sum: 80 }
        ],
        total: 158
      }
    ]
  },
  {
    catalog_no: 91,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БЕЛЬ ЭТУАЛЬ КАЯЛА',
    name_lat: 'BEL ETUAL KAYALA',
    placement: 5,
    total_score: 315,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 172,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 16], sum: 78 },
          { judge_number: 2, scores: [15, 16, 16, 15, 16], sum: 78 }
        ],
        total: 156
      },
      {
        heat_number: 188,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [15, 16, 16, 15, 16], sum: 78 }
        ],
        total: 159
      }
    ]
  },
  {
    catalog_no: 92,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА',
    name_lat: 'EMUL DE GEPARD GELILA AL RAWDA',
    placement: 6,
    total_score: 312,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 170,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 15, 16], sum: 77 },
          { judge_number: 2, scores: [16, 16, 16, 15, 16], sum: 79 }
        ],
        total: 156
      },
      {
        heat_number: 186,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [14, 15, 15, 15, 16], sum: 75 }
        ],
        total: 156
      }
    ]
  },
  {
    catalog_no: 89,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БЕЛЬ ЭТУАЛЬ ЧООСЕ МЕ',
    name_lat: 'BEL ETUAL CHOOSE ME',
    placement: 7,
    total_score: 309,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 172,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 15, 16], sum: 78 },
          { judge_number: 2, scores: [16, 15, 16, 16, 15], sum: 78 }
        ],
        total: 156
      },
      {
        heat_number: 184,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 16, 16, 16, 15], sum: 77 },
          { judge_number: 2, scores: [15, 16, 16, 15, 14], sum: 76 }
        ],
        total: 153
      }
    ]
  },
  {
    catalog_no: 90,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БЕЛЬ ЭТУАЛЬ ФИЛОМЕНА',
    name_lat: 'BEL ETUAL FILOMENA',
    placement: 8,
    total_score: 306,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 169,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [14, 16, 16, 15, 15], sum: 76 }
        ],
        total: 156
      },
      {
        heat_number: 188,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 16, 16, 14, 16], sum: 76 },
          { judge_number: 2, scores: [14, 16, 16, 12, 16], sum: 74 }
        ],
        total: 150
      }
    ]
  },
  {
    catalog_no: 93,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ШАВАТИ ПРАДА',
    name_lat: 'SHAWATI PRADA',
    placement: 9,
    total_score: 302,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 171,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 15], sum: 77 },
          { judge_number: 2, scores: [16, 16, 16, 16, 15], sum: 79 }
        ],
        total: 156
      },
      {
        heat_number: 184,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 15, 16, 14, 15], sum: 74 },
          { judge_number: 2, scores: [16, 17, 15, 10, 14], sum: 72 }
        ],
        total: 146
      }
    ]
  },

  // --- САЛЮКИ ЮНИОРЫ КОБЕЛИ ---
  {
    catalog_no: 604,
    breed: 'Салюки',
    breed_class: 'Салюки - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИЛТО БЭНД БРЕНКО',
    name_lat: 'ILTO BAND BRENKO',
    placement: 1,
    total_score: 322,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 175,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 17, 17], sum: 84 },
          { judge_number: 2, scores: [15, 16, 16, 17, 17], sum: 81 }
        ],
        total: 165
      },
      {
        heat_number: 189,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 16, 16], sum: 82 },
          { judge_number: 2, scores: [14, 15, 15, 16, 15], sum: 75 }
        ],
        total: 157
      }
    ]
  },
  {
    catalog_no: 606,
    breed: 'Салюки',
    breed_class: 'Салюки - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИМРАН НУККИ',
    name_lat: 'IMRAN NUKKI',
    placement: 2,
    total_score: 314,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 174,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [16, 16, 16, 16, 16], sum: 80 }
        ],
        total: 161
      },
      {
        heat_number: 189,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 15], sum: 80 },
          { judge_number: 2, scores: [14, 15, 15, 14, 15], sum: 73 }
        ],
        total: 153
      }
    ]
  },
  {
    catalog_no: 605,
    breed: 'Салюки',
    breed_class: 'Салюки - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИЛТО БЭНД БУСЛАЙ',
    name_lat: 'ILTO BEND BUSLAY',
    placement: 3,
    total_score: 313,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 174,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 15, 15], sum: 78 },
          { judge_number: 2, scores: [15, 16, 16, 17, 15], sum: 79 }
        ],
        total: 157
      },
      {
        heat_number: 190,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 17, 17, 16], sum: 83 },
          { judge_number: 2, scores: [14, 15, 15, 15, 14], sum: 73 }
        ],
        total: 156
      }
    ]
  },

  // --- УИППЕТ ВЕТЕРАНЫ КОБЕЛИ ---
  {
    catalog_no: 154,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Ветераны - Кобель',
    sex: 'Кобель',
    name_ru: 'ДЖИНИ ЛАМБОР',
    name_lat: 'DZHINI LAMBOR',
    placement: 1,
    total_score: 341,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 81,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 18, 18], sum: 87 },
          { judge_number: 2, scores: [16, 17, 17, 18, 18], sum: 86 }
        ],
        total: 173
      },
      {
        heat_number: 101,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 17, 17, 17], sum: 84 },
          { judge_number: 2, scores: [16, 17, 17, 16, 18], sum: 84 }
        ],
        total: 168
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТ КОБЕЛИ ---
  {
    catalog_no: 113,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ЮНИОН СВЕТЛЫЙ',
    name_lat: 'YUNION SVETLYJ',
    placement: 1,
    total_score: 339,
    qualification: 'Победитель Кубка России, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 89,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 17], sum: 85 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 174
      },
      {
        heat_number: 85,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [16, 17, 17, 17, 18], sum: 85 }
        ],
        total: 165
      }
    ]
  },
  {
    catalog_no: 97,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'БАЙТ ЭНД ФАЙТ',
    name_lat: 'BITE AND FIGHT',
    placement: 2,
    total_score: 338,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 64,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 17], sum: 81 },
          { judge_number: 2, scores: [17, 17, 18, 17, 18], sum: 87 }
        ],
        total: 168
      },
      {
        heat_number: 88,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [18, 18, 18, 18, 18], sum: 90 }
        ],
        total: 170
      }
    ]
  },
  {
    catalog_no: 114,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ЮВЕНТУС СКОРЫЙ',
    name_lat: 'YUVENTUS SKORYJ',
    placement: 3,
    total_score: 338,
    qualification: 'RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 72,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 16, 17, 17], sum: 81 },
          { judge_number: 2, scores: [17, 19, 18, 18, 18], sum: 90 }
        ],
        total: 171
      },
      {
        heat_number: 91,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [18, 17, 18, 18, 18], sum: 89 }
        ],
        total: 167
      }
    ]
  },
  {
    catalog_no: 111,
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
        heat_number: 64,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 17, 17], sum: 84 },
          { judge_number: 2, scores: [15, 16, 17, 17, 18], sum: 83 }
        ],
        total: 167
      },
      {
        heat_number: 90,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [18, 17, 18, 17, 18], sum: 88 }
        ],
        total: 169
      }
    ]
  },
  {
    catalog_no: 108,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ЗАМИР',
    name_lat: 'STANGERS LAND ZAMIR',
    placement: 5,
    total_score: 336,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 71,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 16, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [16, 18, 18, 18, 18], sum: 88 }
        ],
        total: 169
      },
      {
        heat_number: 91,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [16, 18, 18, 18, 18], sum: 88 }
        ],
        total: 167
      }
    ]
  },
  {
    catalog_no: 104,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ИРВИН ДИВНЫЙ',
    name_lat: 'STANGERS LAND IRWIN DIVNYI',
    placement: 6,
    total_score: 333,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 66,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 17], sum: 82 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 171
      },
      {
        heat_number: 85,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [15, 16, 17, 17, 18], sum: 83 }
        ],
        total: 162
      }
    ]
  },
  {
    catalog_no: 101,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'МАЛЕНЬКИЙ ПРИНЦ ИЗ ПОЛЕТА МЕЧТЫ',
    name_lat: 'MALENKIY PRINTS IZ POLETA MECHTI',
    placement: 7,
    total_score: 331,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 68,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 16, 16], sum: 82 },
          { judge_number: 2, scores: [16, 17, 17, 17, 18], sum: 85 }
        ],
        total: 167
      },
      {
        heat_number: 93,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 16], sum: 78 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 164
      }
    ]
  },
  {
    catalog_no: 102,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'МИСТФИЛД ДОДЖЕР',
    name_lat: 'MISTFIELD DODGER',
    placement: 8,
    total_score: 331,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 73,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 15, 16, 17, 16], sum: 81 },
          { judge_number: 2, scores: [17, 17, 17, 18, 17], sum: 86 }
        ],
        total: 167
      },
      {
        heat_number: 88,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 15, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 17, 18, 18], sum: 86 }
        ],
        total: 164
      }
    ]
  },
  {
    catalog_no: 103,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ДАКАР РАЛЛИ',
    name_lat: 'STANGERS LAND DAKAR RALLY',
    placement: 9,
    total_score: 330,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 67,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [14, 17, 17, 16, 18], sum: 82 }
        ],
        total: 162
      },
      {
        heat_number: 92,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [17, 17, 17, 18, 18], sum: 87 }
        ],
        total: 168
      }
    ]
  },
  {
    catalog_no: 106,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН',
    name_lat: 'STANGERS LAND VERSAILLES CHARMAN',
    placement: 10,
    total_score: 329,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 67,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 15, 17, 17], sum: 82 },
          { judge_number: 2, scores: [16, 17, 17, 17, 18], sum: 85 }
        ],
        total: 167
      },
      {
        heat_number: 93,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [16, 16, 17, 17, 17], sum: 83 }
        ],
        total: 162
      }
    ]
  },
  {
    catalog_no: 112,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ЯРЫЙ ВЕТЕР ИЗ ПОЛЕТА МЕЧТЫ',
    name_lat: 'YARYJ VETER IZ POLETA MECHTI',
    placement: 11,
    total_score: 329,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 69,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 17, 16, 16], sum: 81 },
          { judge_number: 2, scores: [16, 17, 18, 17, 18], sum: 86 }
        ],
        total: 167
      },
      {
        heat_number: 87,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 17, 16, 18], sum: 84 }
        ],
        total: 162
      }
    ]
  },
  {
    catalog_no: 107,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ВИНСЕНТ',
    name_lat: 'STANGERS LAND VINCENT',
    placement: 12,
    total_score: 328,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 65,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [16, 17, 17, 17, 18], sum: 85 }
        ],
        total: 166
      },
      {
        heat_number: 90,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 16, 17, 18], sum: 84 }
        ],
        total: 162
      }
    ]
  },
  {
    catalog_no: 109,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ЗЛАТАН',
    name_lat: 'STANGERS LAND ZLATAN',
    placement: 13,
    total_score: 328,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 70,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 167
      },
      {
        heat_number: 87,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 17, 15, 18], sum: 83 }
        ],
        total: 161
      }
    ]
  },
  {
    catalog_no: 98,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'БУМЕРАНГ ДОБРА',
    name_lat: 'BUMERANG DOBRA',
    placement: 14,
    total_score: 327,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 70,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 15, 16], sum: 77 },
          { judge_number: 2, scores: [17, 17, 18, 18, 18], sum: 88 }
        ],
        total: 165
      },
      {
        heat_number: 86,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 16], sum: 81 },
          { judge_number: 2, scores: [14, 17, 17, 16, 17], sum: 81 }
        ],
        total: 162
      }
    ]
  },
  {
    catalog_no: 100,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'КЕТЛИН ДАРСИ',
    name_lat: 'KETLIN DARCY',
    placement: 15,
    total_score: 325,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 68,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 15, 16], sum: 80 },
          { judge_number: 2, scores: [16, 17, 16, 17, 18], sum: 84 }
        ],
        total: 164
      },
      {
        heat_number: 86,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 15, 16], sum: 78 },
          { judge_number: 2, scores: [15, 17, 17, 16, 18], sum: 83 }
        ],
        total: 161
      }
    ]
  },
  {
    catalog_no: 110,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ТАЙФУН СТРЕМИТЕЛЬНЫЙ',
    name_lat: 'TAYFUN STREMITELNYI',
    placement: 16,
    total_score: 317,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 71,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 14, 13, 13, 15], sum: 69 },
          { judge_number: 2, scores: [16, 16, 16, 15, 16], sum: 79 }
        ],
        total: 148
      },
      {
        heat_number: 89,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 16], sum: 81 },
          { judge_number: 2, scores: [17, 18, 17, 18, 18], sum: 88 }
        ],
        total: 169
      }
    ]
  },
  {
    catalog_no: 99,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ДОГОНИ ВЕТЕР НЕБЕСНЫЙ ЭТЮД',
    name_lat: 'DOGONI VETER NEBESNYI ETUDE',
    placement: 17,
    total_score: 317,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 65,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 15, 15], sum: 76 },
          { judge_number: 2, scores: [16, 16, 17, 17, 16], sum: 82 }
        ],
        total: 158
      },
      {
        heat_number: 89,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 15, 15, 15, 16], sum: 75 },
          { judge_number: 2, scores: [16, 16, 17, 17, 18], sum: 84 }
        ],
        total: 159
      }
    ]
  },
  {
    catalog_no: 105,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД КАСПИЙ',
    name_lat: 'STANGERS LAND KASPIJ',
    placement: 18,
    total_score: 315,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 72,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 14, 15, 15, 15], sum: 73 },
          { judge_number: 2, scores: [16, 18, 18, 18, 18], sum: 88 }
        ],
        total: 161
      },
      {
        heat_number: 92,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 14, 16, 15], sum: 76 },
          { judge_number: 2, scores: [17, 14, 14, 16, 17], sum: 78 }
        ],
        total: 154
      }
    ]
  },
  {
    catalog_no: 96,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АЛЬФАС БОРА',
    name_lat: 'ALPHAS BORA',
    placement: null,
    total_score: 157,
    qualification: '',
    vc: '',
    status: 'withdrawn',
    status_reason: 'Снят владельцем',
    heats: [
      {
        heat_number: 66,
        bib_color: 'white',
        total: 157
      },
      {
        heat_number: 0,
        disqualified: true,
        disqualification_reason: 'Снят владельцем'
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТ СУКИ ---
  {
    catalog_no: 127,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД ВАЛЬДИВИЯ',
    name_lat: 'STANGERS LAND VALDIVIA',
    placement: 1,
    total_score: 339,
    qualification: 'Победитель Кубка России, CACLBr, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 41,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 15, 15], sum: 75 },
          { judge_number: 2, scores: [17, 18, 18, 17, 18], sum: 88 }
        ],
        total: 163
      },
      {
        heat_number: 51,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [18, 17, 17, 17, 17], sum: 86 },
          { judge_number: 2, scores: [18, 18, 18, 18, 18], sum: 90 }
        ],
        total: 176
      }
    ]
  },
  {
    catalog_no: 128,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД ВАЛЕНСИЯ',
    name_lat: 'STANGERS LAND VALENCIA',
    placement: 2,
    total_score: 339,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 40,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 15, 16, 15], sum: 77 },
          { judge_number: 2, scores: [18, 19, 18, 18, 18], sum: 91 }
        ],
        total: 168
      },
      {
        heat_number: 54,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 17], sum: 82 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 171
      }
    ]
  },
  {
    catalog_no: 122,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'МОРРИС МИА АМОРЕ',
    name_lat: 'MORRIS MIA AMORE',
    placement: 3,
    total_score: 339,
    qualification: 'RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 34,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [18, 18, 18, 18, 18], sum: 90 }
        ],
        total: 169
      },
      {
        heat_number: 54,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 17, 17], sum: 83 },
          { judge_number: 2, scores: [17, 17, 18, 17, 18], sum: 87 }
        ],
        total: 170
      }
    ]
  },
  {
    catalog_no: 115,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'АНГЕЛИК ВИНГС',
    name_lat: 'ANGELIC WINGS',
    placement: 4,
    total_score: 337,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 39,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 15, 15, 16], sum: 77 },
          { judge_number: 2, scores: [16, 18, 18, 18, 18], sum: 88 }
        ],
        total: 165
      },
      {
        heat_number: 52,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 17, 17], sum: 84 },
          { judge_number: 2, scores: [17, 18, 18, 17, 18], sum: 88 }
        ],
        total: 172
      }
    ]
  },
  {
    catalog_no: 124,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД ИНГРИД ЭЛЕГАНТ',
    name_lat: 'STANGERS LAND INGRID ELEGANT',
    placement: 5,
    total_score: 337,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 33,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 16, 17, 17, 17], sum: 84 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 173
      },
      {
        heat_number: 58,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 164
      }
    ]
  },
  {
    catalog_no: 131,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'УИТЧ ФО ШЕРВУД',
    name_lat: 'WITCH OF SHERWOOD',
    placement: 6,
    total_score: 336,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 40,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 15, 15], sum: 75 },
          { judge_number: 2, scores: [18, 19, 18, 17, 18], sum: 90 }
        ],
        total: 165
      },
      {
        heat_number: 56,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 17], sum: 82 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 171
      }
    ]
  },
  {
    catalog_no: 116,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БОННИ ФЛАИНГ ФЛЭШ',
    name_lat: 'BONNY FLYING FLASH',
    placement: 7,
    total_score: 335,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 38,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 16], sum: 77 },
          { judge_number: 2, scores: [16, 17, 17, 17, 18], sum: 85 }
        ],
        total: 162
      },
      {
        heat_number: 53,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 15, 17, 17], sum: 82 },
          { judge_number: 2, scores: [18, 19, 18, 18, 18], sum: 91 }
        ],
        total: 173
      }
    ]
  },
  {
    catalog_no: 126,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД КОРИЦА',
    name_lat: 'STANGERS LAND KORITSA',
    placement: 8,
    total_score: 334,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 36,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 15, 16], sum: 76 },
          { judge_number: 2, scores: [16, 18, 17, 18, 18], sum: 87 }
        ],
        total: 163
      },
      {
        heat_number: 55,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 16, 16], sum: 82 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 171
      }
    ]
  },
  {
    catalog_no: 118,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ДИАМАНТ ТОП КРИСТАЛ',
    name_lat: 'DIAMANT TOP KRISTAL',
    placement: 9,
    total_score: 333,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 35,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 14, 14, 15], sum: 74 },
          { judge_number: 2, scores: [17, 19, 17, 18, 18], sum: 89 }
        ],
        total: 163
      },
      {
        heat_number: 52,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 16, 14, 17, 17], sum: 81 },
          { judge_number: 2, scores: [19, 17, 17, 18, 18], sum: 89 }
        ],
        total: 170
      }
    ]
  },
  {
    catalog_no: 125,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД КАТАЛИНА',
    name_lat: 'STANGERS LAND KATALINA',
    placement: 10,
    total_score: 333,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 36,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 15, 16], sum: 77 },
          { judge_number: 2, scores: [17, 18, 18, 17, 18], sum: 88 }
        ],
        total: 165
      },
      {
        heat_number: 56,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 16, 17, 16], sum: 80 },
          { judge_number: 2, scores: [17, 17, 18, 18, 18], sum: 88 }
        ],
        total: 168
      }
    ]
  },
  {
    catalog_no: 151,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'НАША ЛЮБОВЬ ИЗ ПОЛЕТА МЕЧТЫ',
    name_lat: 'NASHA LYUBOV IZ POLETA MECHTI',
    placement: 11,
    total_score: 330,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 35,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 15, 15], sum: 75 },
          { judge_number: 2, scores: [17, 17, 18, 17, 18], sum: 87 }
        ],
        total: 162
      },
      {
        heat_number: 53,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 17, 17], sum: 81 },
          { judge_number: 2, scores: [17, 18, 18, 16, 18], sum: 87 }
        ],
        total: 168
      }
    ]
  },
  {
    catalog_no: 123,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'РУССКИ ПАРК ПАТРИЦИЯ ГРЕЙС',
    name_lat: 'RUSSKI PARK PATRICIYA GREIS',
    placement: 12,
    total_score: 329,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 34,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 17, 16, 16], sum: 82 },
          { judge_number: 2, scores: [17, 17, 18, 17, 18], sum: 87 }
        ],
        total: 169
      },
      {
        heat_number: 58,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 16], sum: 77 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 160
      }
    ]
  },
  {
    catalog_no: 117,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'КЛАССИК Н ТАХАРИ ЛИРА ФОР РЕСТЛЕСС ВИП',
    name_lat: 'CLASSIC N TAHARI LIRA FOR RESTLESS WHIP',
    placement: 13,
    total_score: 328,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 36,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 14, 16, 16], sum: 77 },
          { judge_number: 2, scores: [16, 17, 17, 18, 18], sum: 86 }
        ],
        total: 163
      },
      {
        heat_number: 51,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 17, 17], sum: 81 },
          { judge_number: 2, scores: [17, 17, 17, 17, 16], sum: 84 }
        ],
        total: 165
      }
    ]
  },
  {
    catalog_no: 121,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'КИНГДОМ ФЛАЙ ГРЭММИ ГРАНЖЕРИ',
    name_lat: 'KINGDOM FLY GRAMMY GRUNGERY',
    placement: 14,
    total_score: 326,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 33,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 14, 17, 16], sum: 77 },
          { judge_number: 2, scores: [16, 18, 17, 17, 18], sum: 86 }
        ],
        total: 163
      },
      {
        heat_number: 55,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 15, 15, 16], sum: 77 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 163
      }
    ]
  },
  {
    catalog_no: 129,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ТИМИРЯЗЕВСКИЙ ПАРК ОЛИВИЯ',
    name_lat: 'TIMIRIAZEVSKIJ PARK OLIVIA',
    placement: 15,
    total_score: 320,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 41,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 14, 15, 15], sum: 74 },
          { judge_number: 2, scores: [16, 17, 17, 16, 18], sum: 84 }
        ],
        total: 158
      },
      {
        heat_number: 59,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 14, 15], sum: 76 },
          { judge_number: 2, scores: [17, 18, 18, 15, 18], sum: 86 }
        ],
        total: 162
      }
    ]
  },
  {
    catalog_no: 130,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ТЕМНАЯ НОЧЬ ИЗ ПОЛЕТА МЕЧТЫ',
    name_lat: 'TEMNAYA NOCH IZ POLETA MECHTI',
    placement: 16,
    total_score: 317,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 37,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 14, 15, 14, 14], sum: 71 },
          { judge_number: 2, scores: [16, 16, 15, 15, 18], sum: 80 }
        ],
        total: 151
      },
      {
        heat_number: 59,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 15], sum: 77 },
          { judge_number: 2, scores: [18, 18, 17, 18, 18], sum: 89 }
        ],
        total: 166
      }
    ]
  },
  {
    catalog_no: 120,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'КАСТРА',
    name_lat: 'KASTRA',
    placement: 17,
    total_score: 285,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 38,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [10, 13, 12, 12, 15], sum: 62 },
          { judge_number: 2, scores: [14, 14, 10, 10, 12], sum: 60 }
        ],
        total: 122
      },
      {
        heat_number: 57,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 15, 16], sum: 77 },
          { judge_number: 2, scores: [18, 17, 18, 15, 18], sum: 86 }
        ],
        total: 163
      }
    ]
  },
  {
    catalog_no: 119,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ГАЙЛЛАРДИЯ АСТЭРАЭСЭА',
    name_lat: 'GAILLARDIA ASTERACEAE',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Нарушение амуниции)',
    heats: [
      {
        heat_number: 39,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Нарушение амуниции)'
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТ-СПРИНТЕРЫ КОБЕЛИ ---
  {
    catalog_no: 141,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ЗОДИАК',
    name_lat: 'STANGERS LAND ZODIAK',
    placement: 1,
    total_score: 335,
    qualification: 'Победитель Кубка России, CACLBr, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 77,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 169
      },
      {
        heat_number: 99,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 16, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [16, 17, 17, 17, 18], sum: 85 }
        ],
        total: 166
      }
    ]
  },
  {
    catalog_no: 139,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'МИКЕЛЕ АНДЖЕЛО ДЕЛЬ СОЛЕ',
    name_lat: 'MICHELE ANGELO DEL SOLE',
    placement: 2,
    total_score: 335,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 77,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [18, 18, 18, 18, 18], sum: 90 }
        ],
        total: 170
      },
      {
        heat_number: 99,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 165
      }
    ]
  },
  {
    catalog_no: 135,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИСТОРИЯ ЛЮБВИ ИЗУМРУД',
    name_lat: 'ISTORIYA LUBVI IZUMRUD',
    placement: 3,
    total_score: 333,
    qualification: 'RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 78,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 16, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [17, 17, 17, 18, 18], sum: 87 }
        ],
        total: 168
      },
      {
        heat_number: 96,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [16, 17, 17, 17, 18], sum: 85 }
        ],
        total: 165
      }
    ]
  },
  {
    catalog_no: 144,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ЕРЕМА',
    name_lat: 'EREMA',
    placement: 4,
    total_score: 331,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 78,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 15, 16, 16], sum: 80 },
          { judge_number: 2, scores: [17, 17, 17, 16, 16], sum: 83 }
        ],
        total: 163
      },
      {
        heat_number: 100,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 15, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [18, 18, 16, 18, 18], sum: 88 }
        ],
        total: 168
      }
    ]
  },
  {
    catalog_no: 136,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИСТОРИЯ ЛЮБВИ ЛАНДЫШ СЕРЕБРИСТЫЙ',
    name_lat: 'ISTORIYA LYUBVI LANDYSH SEREBRISTYY',
    placement: 5,
    total_score: 331,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 74,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 17, 16], sum: 83 },
          { judge_number: 2, scores: [17, 16, 17, 17, 17], sum: 84 }
        ],
        total: 167
      },
      {
        heat_number: 96,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 16, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [15, 17, 17, 16, 18], sum: 83 }
        ],
        total: 164
      }
    ]
  },
  {
    catalog_no: 133,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ФАЙЕР ФИЛД АГНИС',
    name_lat: 'FIRE FIELD AGNYIS',
    placement: 6,
    total_score: 329,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 74,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 15, 16], sum: 79 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 164
      },
      {
        heat_number: 94,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 165
      }
    ]
  },
  {
    catalog_no: 142,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'УРАЛ УЛЬКЕН САТТИЛИК НОРС ФЭМИЛИ',
    name_lat: 'URAL ULKEN SATTILLIK NORTH FAMILY',
    placement: 7,
    total_score: 328,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 75,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 15, 16], sum: 79 },
          { judge_number: 2, scores: [15, 16, 17, 16, 18], sum: 82 }
        ],
        total: 161
      },
      {
        heat_number: 97,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 167
      }
    ]
  },
  {
    catalog_no: 143,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ВАРВАР КОНАН БЕССТРАШНЫЙ',
    name_lat: 'VARVAR KONAN BESSTRASHNYI',
    placement: 8,
    total_score: 328,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 79,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 15, 16, 15], sum: 77 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 163
      },
      {
        heat_number: 100,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [16, 18, 18, 17, 17], sum: 86 }
        ],
        total: 165
      }
    ]
  },
  {
    catalog_no: 140,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'САДЖИТА ВОЛАТ ГЕРО ПОСТ ТЕ',
    name_lat: 'SAGITA VOLAT GERO POST TE',
    placement: 9,
    total_score: 328,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 75,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [16, 17, 17, 16, 18], sum: 84 }
        ],
        total: 165
      },
      {
        heat_number: 98,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [16, 17, 17, 16, 18], sum: 84 }
        ],
        total: 163
      }
    ]
  },
  {
    catalog_no: 134,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ГАННОВЕР ЛОРД ПОТОМОК МУСТАНГА',
    name_lat: 'GANNOVER LORD POTOMOK MUSTANGA',
    placement: 10,
    total_score: 327,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 76,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [17, 17, 17, 18, 18], sum: 87 }
        ],
        total: 166
      },
      {
        heat_number: 98,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 15, 16], sum: 77 },
          { judge_number: 2, scores: [17, 16, 16, 17, 18], sum: 84 }
        ],
        total: 161
      }
    ]
  },
  {
    catalog_no: 137,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'КЕТЛИН МАРЦИПАН',
    name_lat: 'KETLIN MARZIPAN',
    placement: 11,
    total_score: 326,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 79,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 15], sum: 76 },
          { judge_number: 2, scores: [16, 17, 17, 16, 18], sum: 84 }
        ],
        total: 160
      },
      {
        heat_number: 95,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 16], sum: 81 },
          { judge_number: 2, scores: [16, 17, 17, 17, 18], sum: 85 }
        ],
        total: 166
      }
    ]
  },
  {
    catalog_no: 138,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ЛЕВИАФАН ДРАГОН ОФ ЛОВЕ',
    name_lat: 'LEVIATHAN DRAGON OF LOVE',
    placement: 12,
    total_score: 325,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 76,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 15, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 17, 18, 18], sum: 86 }
        ],
        total: 164
      },
      {
        heat_number: 94,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 15, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 17, 15, 18], sum: 83 }
        ],
        total: 161
      }
    ]
  },
  {
    catalog_no: 132,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ДИАВЕЛ ЛАМБО ДУХ ВЕТРА',
    name_lat: 'DIAVEL LAMBO DUKH VETRA',
    placement: 13,
    total_score: 297,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 80,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [10, 12, 12, 10, 12], sum: 56 },
          { judge_number: 2, scores: [17, 16, 15, 12, 18], sum: 78 }
        ],
        total: 134
      },
      {
        heat_number: 95,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [17, 17, 16, 17, 18], sum: 85 }
        ],
        total: 163
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТ-СПРИНТЕРЫ СУКИ ---
  {
    catalog_no: 152,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД ИНТЕРНАЛ ЭНЕРДЖИ',
    name_lat: 'STANGERS LAND INTERNAL ENERGY',
    placement: 1,
    total_score: 333,
    qualification: 'Победитель Кубка России, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 42,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [18, 18, 18, 18, 18], sum: 90 }
        ],
        total: 169
      },
      {
        heat_number: 60,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 16, 16, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 18, 17, 18], sum: 86 }
        ],
        total: 164
      }
    ]
  },
  {
    catalog_no: 149,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ГРЕЙС КЭНДИ',
    name_lat: 'GRACE CANDY',
    placement: 2,
    total_score: 331,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 43,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [18, 17, 18, 18, 18], sum: 89 }
        ],
        total: 168
      },
      {
        heat_number: 60,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [14, 17, 18, 17, 18], sum: 84 }
        ],
        total: 163
      }
    ]
  },
  {
    catalog_no: 153,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД КОМЕТА',
    name_lat: 'STANGERS LAND KOMETA',
    placement: 3,
    total_score: 329,
    qualification: 'RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 43,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [16, 18, 17, 17, 18], sum: 86 }
        ],
        total: 165
      },
      {
        heat_number: 62,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 16], sum: 77 },
          { judge_number: 2, scores: [17, 17, 17, 18, 18], sum: 87 }
        ],
        total: 164
      }
    ]
  },
  {
    catalog_no: 150,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'МЕЛОДИЯ ИЗ САГИ О ГАРДАРИКЕ',
    name_lat: 'MELODIYA IZ SAGI O GARDARIKE',
    placement: 4,
    total_score: 328,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 42,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 16], sum: 77 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 163
      },
      {
        heat_number: 62,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [17, 16, 16, 18, 18], sum: 85 }
        ],
        total: 165
      }
    ]
  },
  {
    catalog_no: 146,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ДИВА РАЛЛИ ЧАРУЮЩАЯ',
    name_lat: 'DIVA RALLI CHARUYUSHCHAYA',
    placement: 5,
    total_score: 326,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 44,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 14, 15, 15, 15], sum: 73 },
          { judge_number: 2, scores: [13, 18, 18, 17, 18], sum: 84 }
        ],
        total: 157
      },
      {
        heat_number: 63,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 17], sum: 82 },
          { judge_number: 2, scores: [16, 18, 18, 17, 18], sum: 87 }
        ],
        total: 169
      }
    ]
  },
  {
    catalog_no: 148,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ДЖИПСИ ЛИЛИТ БОГИНЯ НОЧИ',
    name_lat: 'DZHIPSI LILIT BOGINYA NOCHI',
    placement: 6,
    total_score: 325,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 44,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [13, 14, 15, 14, 15], sum: 71 },
          { judge_number: 2, scores: [16, 18, 18, 16, 18], sum: 86 }
        ],
        total: 157
      },
      {
        heat_number: 61,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 15, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 168
      }
    ]
  },
  {
    catalog_no: 147,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ДОГОНИ ВЕТЕР ОПЮИСАНТ САМСАРА',
    name_lat: 'DOGONI VETER OPUISSANTE SAMSARA',
    placement: 7,
    total_score: 325,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 45,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 15], sum: 76 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 162
      },
      {
        heat_number: 63,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 16], sum: 77 },
          { judge_number: 2, scores: [17, 17, 18, 17, 17], sum: 86 }
        ],
        total: 163
      }
    ]
  },
  {
    catalog_no: 145,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ЧИА ЭССИ ТУАТАРА СТРАЙКЕР',
    name_lat: 'CHIA ESSI TUATARA STRAYKER',
    placement: 8,
    total_score: 323,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 45,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 14, 15, 14, 15], sum: 73 },
          { judge_number: 2, scores: [15, 17, 17, 13, 18], sum: 80 }
        ],
        total: 153
      },
      {
        heat_number: 61,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 17], sum: 82 },
          { judge_number: 2, scores: [17, 18, 18, 17, 18], sum: 88 }
        ],
        total: 170
      }
    ]
  },

  // --- УИППЕТ ЮНИОРЫ КОБЕЛИ ---
  {
    catalog_no: 608,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'МЕТЕЛЬ АВГУСТА АЙРЕОН',
    name_lat: 'METEL\' AVGUSTA AYREON',
    placement: 1,
    total_score: 335,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 82,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 17], sum: 82 },
          { judge_number: 2, scores: [17, 18, 18, 18, 18], sum: 89 }
        ],
        total: 171
      },
      {
        heat_number: 102,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 164
      }
    ]
  },
  {
    catalog_no: 609,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ЛОНГ ВАНГ',
    name_lat: 'STANGERS LAND LONG WANG',
    placement: 2,
    total_score: 325,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 82,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 14, 16], sum: 78 },
          { judge_number: 2, scores: [17, 18, 18, 15, 18], sum: 86 }
        ],
        total: 164
      },
      {
        heat_number: 102,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 15, 16], sum: 78 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 161
      }
    ]
  },

  // --- ФАРАОНОВА СОБАКА СТАНДАРТ КОБЕЛИ ---
  {
    catalog_no: 155,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'БАКСТЕР БЕРН',
    name_lat: 'BAXTER BERN',
    placement: 1,
    total_score: 323,
    qualification: 'Победитель Кубка России, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 136,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 17], sum: 80 },
          { judge_number: 2, scores: [15, 17, 17, 16, 17], sum: 82 }
        ],
        total: 162
      },
      {
        heat_number: 150,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [15, 17, 16, 16, 17], sum: 81 }
        ],
        total: 161
      }
    ]
  },
  {
    catalog_no: 158,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ХЕЙДИ СОТИС ДЖЕД АТУМ',
    name_lat: 'HEIDI SOTIS DJED ATUM',
    placement: 2,
    total_score: 320,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 135,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 15, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [15, 16, 16, 16, 17], sum: 80 }
        ],
        total: 159
      },
      {
        heat_number: 149,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [16, 17, 17, 14, 17], sum: 81 }
        ],
        total: 161
      }
    ]
  },
  {
    catalog_no: 156,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'КОР ОРИОН ЭЛЕКСИР ОФ ЛАЙФ',
    name_lat: 'COR ORION ELEKSIR OF LAYF',
    placement: 3,
    total_score: 318,
    qualification: 'RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 136,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [15, 17, 16, 16, 17], sum: 81 }
        ],
        total: 160
      },
      {
        heat_number: 150,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [16, 16, 15, 16, 16], sum: 79 }
        ],
        total: 158
      }
    ]
  },
  {
    catalog_no: 157,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ГАЛМАД СТАР ВЕДАГОР',
    name_lat: 'GALMAD STAR VEDAGOR',
    placement: 4,
    total_score: 308,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 135,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 15, 15, 14, 15], sum: 73 },
          { judge_number: 2, scores: [14, 16, 16, 15, 17], sum: 78 }
        ],
        total: 151
      },
      {
        heat_number: 149,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
          { judge_number: 2, scores: [14, 16, 16, 16, 16], sum: 78 }
        ],
        total: 157
      }
    ]
  },

  // --- ФАРАОНОВА СОБАКА СТАНДАРТ СУКИ ---
  {
    catalog_no: 163,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ХЕЙДИ СОТИС ДЕЛИМАРА МИНТАКА',
    name_lat: 'HEIDI SOTIS DELIMARA MINTAKA',
    placement: 1,
    total_score: 325,
    qualification: 'Победитель Кубка России, CACLBr, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 137,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 17, 16], sum: 81 },
          { judge_number: 2, scores: [15, 17, 17, 16, 17], sum: 82 }
        ],
        total: 163
      },
      {
        heat_number: 152,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 16, 15, 16, 17], sum: 81 },
          { judge_number: 2, scores: [15, 17, 17, 15, 17], sum: 81 }
        ],
        total: 162
      }
    ]
  },
  {
    catalog_no: 164,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ХЕЙДИ СОТИС ДЖГАНТИЯ МУТ',
    name_lat: 'HEIDI SOTIS DJGANTIYA MUT',
    placement: 2,
    total_score: 325,
    qualification: 'CACL, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 139,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 16], sum: 81 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 163
      },
      {
        heat_number: 152,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 15, 15, 16, 17], sum: 79 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 162
      }
    ]
  },
  {
    catalog_no: 162,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ХАЛЛАМ ТЕРРА ОБСЕСШН ЭТ РИДЛИ РОУД',
    name_lat: 'HALLAM TERRA OBSESSION AT REEDLY ROAD',
    placement: 3,
    total_score: 322,
    qualification: 'RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 138,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 161
      },
      {
        heat_number: 153,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 17], sum: 81 },
          { judge_number: 2, scores: [17, 16, 16, 15, 16], sum: 80 }
        ],
        total: 161
      }
    ]
  },
  {
    catalog_no: 165,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ТЕМПЛ ВЕЛЕС ШОКОЛАД',
    name_lat: 'TEMPLE VELES CHOCOLATE',
    placement: 4,
    total_score: 318,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 139,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 16], sum: 77 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 162
      },
      {
        heat_number: 153,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [15, 16, 15, 15, 16], sum: 77 }
        ],
        total: 156
      }
    ]
  },
  {
    catalog_no: 166,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ТЕМПЛ ВЕЛЕС ДЕВАЙН ДИВИНИТИ',
    name_lat: 'TEMPLE VELES DIVINE DIVINITY',
    placement: 5,
    total_score: 314,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 137,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [14, 17, 17, 16, 17], sum: 81 }
        ],
        total: 159
      },
      {
        heat_number: 151,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 15, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [15, 15, 15, 15, 16], sum: 76 }
        ],
        total: 155
      }
    ]
  },
  {
    catalog_no: 160,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'АМЕНЕМХЕТ АНДОРА ТА МАЛЬТА',
    name_lat: 'AMENEMHET ANDORA TA MALTA',
    placement: 6,
    total_score: 309,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 138,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 16], sum: 77 },
          { judge_number: 2, scores: [16, 15, 15, 15, 16], sum: 77 }
        ],
        total: 154
      },
      {
        heat_number: 151,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 15, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [15, 15, 15, 16, 16], sum: 77 }
        ],
        total: 155
      }
    ]
  },

  // --- ЧИРНЕКО ДЕЛЬ ЭТНА СТАНДАРТ КОБЕЛИ ---
  {
    catalog_no: 175,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ИНДИАНА ДЖОНС',
    name_lat: 'INDIANA JONES',
    placement: 1,
    total_score: 300,
    qualification: 'Победитель Кубка России, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 116,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 15, 14], sum: 74 },
          { judge_number: 2, scores: [14, 16, 15, 15, 17], sum: 77 }
        ],
        total: 151
      },
      {
        heat_number: 129,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 14, 15, 15], sum: 74 },
          { judge_number: 2, scores: [15, 16, 14, 15, 15], sum: 75 }
        ],
        total: 149
      }
    ]
  },
  {
    catalog_no: 172,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АЛИЯ ЛЮКС ДЗАФФИРО',
    name_lat: 'ALIA LUX ZAFFIRO',
    placement: 2,
    total_score: 286,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 115,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [12, 15, 16, 13, 13], sum: 69 },
          { judge_number: 2, scores: [10, 13, 15, 10, 16], sum: 64 }
        ],
        total: 133
      },
      {
        heat_number: 129,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 15, 15, 16, 15], sum: 75 },
          { judge_number: 2, scores: [15, 16, 16, 16, 15], sum: 78 }
        ],
        total: 153
      }
    ]
  },
  {
    catalog_no: 173,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АРТУ',
    name_lat: 'ARTU',
    placement: null,
    total_score: 171,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки, сход с трассы)',
    heats: [
      {
        heat_number: 116,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 17], sum: 85 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 171
      },
      {
        heat_number: 130,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки, сход с трассы)'
      }
    ]
  },
  {
    catalog_no: 174,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ЭЛВИН',
    name_lat: 'ELVIN',
    placement: null,
    total_score: 159,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки, сход с трассы)',
    heats: [
      {
        heat_number: 115,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 16], sum: 79 },
          { judge_number: 2, scores: [14, 16, 16, 17, 17], sum: 80 }
        ],
        total: 159
      },
      {
        heat_number: 130,
        bib_color: 'white',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки, сход с трассы)'
      }
    ]
  },

  // --- ЧИРНЕКО ДЕЛЬ ЭТНА СТАНДАРТ СУКИ ---
  {
    catalog_no: 181,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ТЕССА ДЕЛЬ ДЖЕЛЬСО БЬЯНКО',
    name_lat: 'TESSA DEL GELSO BIANCO',
    placement: 1,
    total_score: 332,
    qualification: 'Победитель Кубка России, CACLBr, RegCACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 117,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 18, 17, 17, 17], sum: 85 },
          { judge_number: 2, scores: [15, 17, 17, 17, 17], sum: 83 }
        ],
        total: 168
      },
      {
        heat_number: 132,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 17], sum: 82 },
          { judge_number: 2, scores: [15, 17, 17, 16, 17], sum: 82 }
        ],
        total: 164
      }
    ]
  },
  {
    catalog_no: 177,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ИРКИСС РАЦЦО КЬЯНТИ',
    name_lat: 'IRKISS RAZZO CHIANTI',
    placement: 2,
    total_score: 321,
    qualification: 'CACL',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 118,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 17], sum: 80 },
          { judge_number: 2, scores: [14, 17, 17, 14, 17], sum: 79 }
        ],
        total: 159
      },
      {
        heat_number: 131,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [17, 16, 17, 17, 17], sum: 84 }
        ],
        total: 162
      }
    ]
  },
  {
    catalog_no: 178,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ИРКИСС СЛАВА',
    name_lat: 'IRKISS SLAVA',
    placement: 3,
    total_score: 307,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 117,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 16, 16, 16], sum: 81 },
          { judge_number: 2, scores: [14, 16, 14, 16, 16], sum: 76 }
        ],
        total: 157
      },
      {
        heat_number: 131,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 15, 15], sum: 76 },
          { judge_number: 2, scores: [13, 16, 15, 14, 16], sum: 74 }
        ],
        total: 150
      }
    ]
  },
  {
    catalog_no: 180,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ИРКИСС ВОЛЬПЕ КЬЯРА',
    name_lat: 'IRKISS VOLPE CHIARA',
    placement: 4,
    total_score: 301.3,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 118,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
          { judge_number: 2, scores: [15, 16, 15, 17, 17], sum: 80 }
        ],
        total: 160
      },
      {
        heat_number: 132,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 15, 16, 16], sum: 78 },
          { judge_number: 2, scores: [14, 16, 17, 15, 17], sum: 79 }
        ],
        total: 141.3
      }
    ]
  },
  {
    catalog_no: 176,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'КОЛИСТО\'С ДЕЯ',
    name_lat: 'COLISTO\'S DEYA',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Сход с трассы)',
    heats: [
      {
        heat_number: 119,
        bib_color: 'white',
        disqualified: true,
        disqualification_reason: 'Отстранение (Сход с трассы)'
      }
    ]
  },
  {
    catalog_no: 179,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ИРКИСС ВИВА ИЛЛИРИЯ',
    name_lat: 'IRKISS VIVA ILLYRIA',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Сход с трассы)',
    heats: [
      {
        heat_number: 119,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Сход с трассы)'
      }
    ]
  },

  // --- НЕПРИБЫВШИЕ УЧАСТНИКИ ---
  {
    catalog_no: 88,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БЕЛЬ ЭТУАЛЬ АЛТЕР ЭГО',
    name_lat: 'BEL ETUAL ALTER EGO',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'absent',
    status_reason: 'Неявка',
    heats: []
  },
  {
    catalog_no: 159,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ШНЕЙДЕР РИЧ ЮДЖИН',
    name_lat: 'SCHNEIDER RICH YOUDZHIN',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'absent',
    status_reason: 'Неявка',
    heats: []
  },
  {
    catalog_no: 161,
    breed: 'Фараонова собака',
    breed_class: 'Фараонова собака - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БЛЭКСИ ШАЙН ГАЛАТЕЯ',
    name_lat: 'BLACKSEA SHINE GALATEYA',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'absent',
    status_reason: 'Неявка',
    heats: []
  },
  {
    catalog_no: 607,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД МАРВИН СЛАВНЫЙ',
    name_lat: 'STANGERS LAND MARVIN SLAVNYJ',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'absent',
    status_reason: 'Неявка',
    heats: []
  }
];

const draft = {
  date_start: '2026-08-22',
  date_end: '2026-08-23',
  title: 'Кубок России по курсингу борзых',
  rank_label: 'Кубок России\n(Курсинг борзых)',
  event_type: 'coursing',
  competition_kind: 'Кубок России',
  competition_type: 'Курсинг борзых',
  host_club: 'МОРОО "Федерация спортивно-прикладного собаководства"',
  location: 'Московская обл., д. Суханово',
  results: results.map(makeResult)
};

const outPath = path.resolve('data/temp/draft-2026-08-22.json');
fs.writeFileSync(outPath, JSON.stringify(draft, null, 2), 'utf-8');
console.log(`Generated ${draft.results.length} results to ${outPath}`);
