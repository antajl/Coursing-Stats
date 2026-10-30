import fs from 'node:fs';
import path from 'node:path';

interface JudgeScore {
  judge_number: number;
  scores: [number, number, number, number, number];
  sum: number;
}

interface Heat {
  heat_number: number;
  bib_number?: number;
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
  // --- УИППЕТ ВЕТЕРАНЫ КОБЕЛИ ---
  {
    catalog_no: 23,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Ветераны - Кобель',
    sex: 'Кобель',
    name_ru: 'RIDER OF ROHAN Brodwinek',
    name_lat: 'RIDER OF ROHAN Brodwinek',
    placement: null,
    total_score: 167,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки, сход с трассы)',
    heats: [
      {
        heat_number: 5,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 16, 17, 17], sum: 83 },
          { judge_number: 2, scores: [17, 17, 17, 16, 17], sum: 84 }
        ],
        total: 167,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 22,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки, сход с трассы)'
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТНЫЙ КОБЕЛИ ---
  {
    catalog_no: 2,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД ЗАМИР',
    name_lat: 'STANGERS LAND ZAMIR',
    placement: 1,
    total_score: 339,
    qualification: 'ПЧРКФ',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 12,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 18], sum: 86 },
          { judge_number: 2, scores: [17, 18, 17, 17, 17], sum: 86 }
        ],
        total: 172,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 29,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [13, 18, 17, 15, 18], sum: 81 },
          { judge_number: 2, scores: [17, 18, 17, 17, 17], sum: 86 }
        ],
        total: 167,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 1,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ГОРДЕЙ',
    name_lat: 'GORDEY',
    placement: 2,
    total_score: 325,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 12,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 17], sum: 80 },
          { judge_number: 2, scores: [15, 17, 16, 15, 17], sum: 80 }
        ],
        total: 160,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 28,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 16, 18], sum: 84 },
          { judge_number: 2, scores: [15, 17, 17, 15, 17], sum: 81 }
        ],
        total: 165,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 3,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ВАЛТТЕРИ СИЛЬВЕР ВИНГС',
    name_lat: 'VALTTERY SILVER WINGS',
    placement: 3,
    total_score: 324,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 13,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 17, 18], sum: 85 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 167,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 29,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [13, 17, 17, 12, 18], sum: 77 },
          { judge_number: 2, scores: [15, 17, 16, 15, 17], sum: 80 }
        ],
        total: 157,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 4,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ЯРЫЙ ВЕТЕР ИЗ ПОЛЕТА МЕЧТЫ',
    name_lat: 'YARYJ VETER IZ POLETA MECHTI',
    placement: 4,
    total_score: 313,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 13,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 16, 16, 14, 17], sum: 77 },
          { judge_number: 2, scores: [16, 16, 16, 17, 17], sum: 82 }
        ],
        total: 159,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 28,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 16, 16, 13, 17], sum: 76 },
          { judge_number: 2, scores: [14, 17, 16, 14, 17], sum: 78 }
        ],
        total: 154,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТНЫЙ СУКИ ---
  {
    catalog_no: 10,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД КОРИЦА',
    name_lat: 'STANGERS LAND KORITSA',
    placement: null,
    total_score: 168,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки, сход с трассы)',
    heats: [
      {
        heat_number: 14,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 18, 18], sum: 87 },
          { judge_number: 2, scores: [15, 17, 16, 16, 17], sum: 81 }
        ],
        total: 168,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 31,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки, сход с трассы)'
      }
    ]
  },
  {
    catalog_no: 9,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД ИСЛАНДИЯ ФЛЭРИНГ АЙС',
    name_lat: 'STANGERS LAND ISLANDIYA FLARING ICE',
    placement: null,
    total_score: 162,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки, сход с трассы)',
    heats: [
      {
        heat_number: 16,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 14, 18], sum: 77 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 162,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 31,
        bib_color: 'white',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки, сход с трассы)'
      }
    ]
  },
  {
    catalog_no: 8,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'MAJESTIC ZARYA',
    name_lat: 'MAJESTIC ZARYA',
    placement: null,
    total_score: 161,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Сход с трассы)',
    heats: [
      {
        heat_number: 14,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 15, 18], sum: 81 },
          { judge_number: 2, scores: [15, 16, 16, 16, 17], sum: 80 }
        ],
        total: 161,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 30,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Сход с трассы)'
      }
    ]
  },
  {
    catalog_no: 7,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ИНДИАНА ИЗ САГИ О ГАРДАРИКЕ',
    name_lat: 'INDIANA IZ SAGI O GARDARIKE',
    placement: null,
    total_score: 160,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Сход с трассы)',
    heats: [
      {
        heat_number: 16,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 14, 15, 18], sum: 77 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 160,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 30,
        bib_color: 'white',
        disqualified: true,
        disqualification_reason: 'Отстранение (Сход с трассы)'
      }
    ]
  },
  {
    catalog_no: 5,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'АНГЕЛИК ВИНГС',
    name_lat: 'ANGELIC WINGS',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки)',
    heats: [
      {
        heat_number: 15,
        bib_color: 'white',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки)'
      }
    ]
  },
  {
    catalog_no: 6,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ДИАМАНТ ТОП КРИСТАЛ',
    name_lat: 'DIAMANT TOP KRISTAL',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки)',
    heats: [
      {
        heat_number: 15,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки)'
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТНЫЙ-СПРИНТЕРЫ КОБЕЛИ ---
  {
    catalog_no: 13,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИСТОРИЯ ЛЮБВИ ЛАНДЫШ СЕРЕБРИСТЫЙ',
    name_lat: 'ISTORIYA LYUBVI LANDYSH SEREBRISTYY',
    placement: 1,
    total_score: 328,
    qualification: 'ПЧРКФ',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 6,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 16, 18], sum: 81 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 163,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 25,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 18, 18, 17, 18], sum: 86 },
          { judge_number: 2, scores: [15, 17, 16, 15, 16], sum: 79 }
        ],
        total: 165,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 11,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ГАННОВЕР ЛОРД ПОТОМОК МУСТАНГА',
    name_lat: 'GANNOVER LORD POTOMOK MUSTANGA',
    placement: 2,
    total_score: 322,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 6,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 15, 17], sum: 77 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 160,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 23,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 18, 18, 16, 18], sum: 86 },
          { judge_number: 2, scores: [15, 16, 15, 14, 16], sum: 76 }
        ],
        total: 162,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 12,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ИСТОРИЯ ЛЮБВИ ИЗУМРУД',
    name_lat: 'ISTORIYA LUBVI IZUMRUD',
    placement: 3,
    total_score: 322,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 8,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 15, 18], sum: 81 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 164,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 25,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 18, 18, 14, 16], sum: 80 },
          { judge_number: 2, scores: [14, 17, 17, 14, 16], sum: 78 }
        ],
        total: 158,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 16,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ВАРВАР КОНАН БЕССТРАШНЫЙ',
    name_lat: 'VARVAR KONAN BESSTRASHNYI',
    placement: 4,
    total_score: 318,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 7,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 16, 18], sum: 79 },
          { judge_number: 2, scores: [16, 16, 15, 16, 17], sum: 80 }
        ],
        total: 159,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 23,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 18, 18, 14, 18], sum: 83 },
          { judge_number: 2, scores: [15, 16, 16, 14, 15], sum: 76 }
        ],
        total: 159,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 14,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'ЛЕВИАФАН ДРАГОН ОФ ЛОВЕ',
    name_lat: 'LEVIATHAN DRAGON OF LOVE',
    placement: 5,
    total_score: 317,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 7,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 14, 18], sum: 79 },
          { judge_number: 2, scores: [15, 16, 16, 15, 16], sum: 78 }
        ],
        total: 157,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 24,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 18, 18, 15, 18], sum: 84 },
          { judge_number: 2, scores: [14, 17, 16, 14, 15], sum: 76 }
        ],
        total: 160,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 15,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Кобель',
    sex: 'Кобель',
    name_ru: 'СОЛАР ВИНД',
    name_lat: 'SOLAR WIND',
    placement: 6,
    total_score: 314,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 8,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 15, 14, 15, 18], sum: 78 },
          { judge_number: 2, scores: [16, 16, 14, 17, 16], sum: 79 }
        ],
        total: 157,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 24,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 16, 18], sum: 82 },
          { judge_number: 2, scores: [15, 15, 14, 15, 16], sum: 75 }
        ],
        total: 157,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },

  // --- УИППЕТ СТАНДАРТНЫЙ-СПРИНТЕРЫ СУКИ ---
  {
    catalog_no: 20,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД КАРЕЛИЯ',
    name_lat: 'STANGERS LAND KARELIYA',
    placement: 1,
    total_score: 331,
    qualification: 'ПЧРКФ',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 9,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 16, 18], sum: 85 },
          { judge_number: 2, scores: [16, 17, 17, 16, 17], sum: 83 }
        ],
        total: 168,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 27,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 17, 16, 15, 18], sum: 81 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 163,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 22,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД ЗЛАТОСЛАВА',
    name_lat: 'STANGERS LAND ZLATOSLAVA',
    placement: 2,
    total_score: 326,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 9,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 16, 16, 15, 18], sum: 80 },
          { judge_number: 2, scores: [15, 17, 16, 15, 17], sum: 80 }
        ],
        total: 160,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 27,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 17, 17, 16, 18], sum: 84 },
          { judge_number: 2, scores: [16, 17, 17, 15, 17], sum: 82 }
        ],
        total: 166,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 18,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ДИВА РАЛЛИ ЧАРУЮЩАЯ',
    name_lat: 'DIVA RALLI CHARUYUSHCHAYA',
    placement: null,
    total_score: 153,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки, сход с трассы)',
    heats: [
      {
        heat_number: 10,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [15, 15, 15, 13, 15], sum: 73 },
          { judge_number: 2, scores: [15, 17, 17, 15, 16], sum: 80 }
        ],
        total: 153,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 26,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки, сход с трассы)'
      }
    ]
  },
  {
    catalog_no: 19,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'НАША ЛЮБОВЬ ИЗ ПОЛЕТА МЕЧТЫ',
    name_lat: 'NASHA LYUBOV IZ POLETA MECHTI',
    placement: null,
    total_score: 147,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки, сход с трассы)',
    heats: [
      {
        heat_number: 10,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [13, 14, 14, 13, 14], sum: 68 },
          { judge_number: 2, scores: [15, 17, 16, 15, 16], sum: 79 }
        ],
        total: 147,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 26,
        bib_color: 'white',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки, сход с трассы)'
      }
    ]
  },
  {
    catalog_no: 17,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'ACUARELA DEL\'RIO DOUCE CARAMEL',
    name_lat: 'ACUARELA DEL\'RIO DOUCE CARAMEL',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки)',
    heats: [
      {
        heat_number: 11,
        bib_color: 'white',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки)'
      }
    ]
  },
  {
    catalog_no: 21,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Стандартный-спринтеры - Сука',
    sex: 'Сука',
    name_ru: 'СТАНГЕРС ЛАНД КОМЕТА',
    name_lat: 'STANGERS LAND KOMETA',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки)',
    heats: [
      {
        heat_number: 11,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки)'
      }
    ]
  },

  // --- УИППЕТ ЮНИОРЫ КОБЕЛИ ---
  {
    catalog_no: 601,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'СТАНГЕРС ЛАНД МАЗАЙ',
    name_lat: 'STANGERS LAND MAZAJ',
    placement: 1,
    total_score: 351,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 18,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [18, 15, 15, 18, 18], sum: 84 },
          { judge_number: 2, scores: [17, 16, 16, 17, 17], sum: 83 }
        ],
        total: 167,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 32,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [19, 19, 19, 19, 19], sum: 95 },
          { judge_number: 2, scores: [19, 18, 17, 18, 17], sum: 89 }
        ],
        total: 184,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 602,
    breed: 'Уиппет',
    breed_class: 'Уиппет - Юниоры - Кобель',
    sex: 'Кобель',
    name_ru: 'ТАТЬЯНИН ДЕНЬ КАРЛ',
    name_lat: 'TATYANIN DEN CARL',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Потеря приманки, сход с трассы)',
    heats: [
      {
        heat_number: 17,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Потеря приманки, сход с трассы)'
      }
    ]
  },

  // --- ЧИРНЕКО ДЕЛЬ ЭТНА ВЕТЕРАНЫ КОБЕЛИ ---
  {
    catalog_no: 6,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Ветераны - Кобель',
    sex: 'Кобель',
    name_ru: 'TESORO SOLARE DOMENICO',
    name_lat: 'TESORO SOLARE DOMENICO',
    placement: null,
    total_score: 138,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Сход с трассы)',
    heats: [
      {
        heat_number: 1,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [12, 14, 12, 12, 15], sum: 65 },
          { judge_number: 2, scores: [13, 16, 15, 14, 15], sum: 73 }
        ],
        total: 138,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 19,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Сход с трассы)'
      }
    ]
  },

  // --- ЧИРНЕКО ДЕЛЬ ЭТНА СТАНДАРТНЫЙ МИКС ---
  {
    catalog_no: 3,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ИРКИСС ВОЛЬПЕ КЬЯРА',
    name_lat: 'IRKISS VOLPE CHIARA',
    placement: 1,
    total_score: 298,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 3,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 16, 12, 15, 15], sum: 72 },
          { judge_number: 2, scores: [17, 16, 15, 17, 16], sum: 81 }
        ],
        total: 153,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 21,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [13, 14, 14, 13, 12], sum: 66 },
          { judge_number: 2, scores: [16, 16, 15, 16, 16], sum: 79 }
        ],
        total: 145,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 5,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'РОССО БОРЕАЛЕ ВИТТОРИЯ СИДА',
    name_lat: 'ROSSO BOREALE VITTORIYA SIDA',
    placement: 2,
    total_score: 286,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 3,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 15, 13, 14, 14], sum: 70 },
          { judge_number: 2, scores: [15, 16, 16, 16, 17], sum: 80 }
        ],
        total: 150,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 21,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [10, 13, 13, 11, 12], sum: 59 },
          { judge_number: 2, scores: [15, 16, 15, 15, 16], sum: 77 }
        ],
        total: 136,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 2,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'КОЛИСТО\'С ДЕЯ',
    name_lat: 'COLISTO\'S DEYA',
    placement: 3,
    total_score: 177,
    qualification: '',
    vc: '',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 2,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [8, 11, 11, 10, 10], sum: 50 },
          { judge_number: 2, scores: [12, 15, 14, 12, 13], sum: 66 }
        ],
        total: 116,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 20,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [2, 4, 4, 1, 4], sum: 15 },
          { judge_number: 2, scores: [5, 16, 15, 5, 5], sum: 46 }
        ],
        total: 61,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 4,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'РОССО БОРЕАЛЕ ИРКИСС',
    name_lat: 'ROSSO BOREALE IRKISS',
    placement: null,
    total_score: 149,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Сход с трассы)',
    heats: [
      {
        heat_number: 2,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [10, 16, 15, 14, 16], sum: 71 },
          { judge_number: 2, scores: [15, 16, 16, 15, 16], sum: 78 }
        ],
        total: 149,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 20,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Сход с трассы)'
      }
    ]
  },
  {
    catalog_no: 1,
    breed: 'Чирнеко дель Этна',
    breed_class: 'Чирнеко дель Этна - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'АЛИЯ ЛЮКС ДЗАФФИРО',
    name_lat: 'ALIA LUX ZAFFIRO',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'disqualified',
    status_reason: 'Отстранение (Сход с трассы)',
    heats: [
      {
        heat_number: 4,
        bib_color: 'red',
        disqualified: true,
        disqualification_reason: 'Отстранение (Сход с трассы)'
      }
    ]
  },

  // --- САЛЮКИ СТАНДАРТНЫЙ КОБЕЛИ ---
  {
    catalog_no: 5,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'САЛГРЕЙ\'С ВЕЛАР',
    name_lat: 'SALGREY\'S VELAR',
    placement: 1,
    total_score: 344,
    qualification: 'ПЧРКФ',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 44,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [17, 17, 17, 17, 18], sum: 86 }
        ],
        total: 174,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 61,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [16, 17, 16, 16, 17], sum: 82 }
        ],
        total: 170,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 3,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'ИМРАН КАЙЛАС',
    name_lat: 'IMRAN KAILAS',
    placement: 2,
    total_score: 336,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 43,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 17, 17, 17, 17], sum: 83 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 168,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 61,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 18, 18, 18, 18], sum: 88 },
          { judge_number: 2, scores: [15, 16, 16, 16, 17], sum: 80 }
        ],
        total: 168,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 2,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'БЕЛЬ ЭТУАЛЬ МАЖОР',
    name_lat: 'BEL ETUAL MAJOR',
    placement: 3,
    total_score: 319,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 46,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 16, 16, 17, 16], sum: 81 },
          { judge_number: 2, scores: [15, 16, 15, 15, 15], sum: 76 }
        ],
        total: 157,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 59,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 16, 17, 17, 17], sum: 84 },
          { judge_number: 2, scores: [15, 16, 16, 16, 15], sum: 78 }
        ],
        total: 162,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 7,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'УЛИСС АЛЬ САИФ МАДЖАЛ',
    name_lat: 'ULYSSE AL SAIF MAJAL',
    placement: 4,
    total_score: 313,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 45,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [13, 15, 15, 12, 16], sum: 71 },
          { judge_number: 2, scores: [15, 16, 15, 15, 16], sum: 77 }
        ],
        total: 148,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 60,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [18, 16, 16, 16, 18], sum: 84 },
          { judge_number: 2, scores: [16, 16, 16, 16, 17], sum: 81 }
        ],
        total: 165,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 1,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'БЕЛЬ ЭТУАЛЬ АМБАССАДОР ІІ',
    name_lat: 'BEL ETUAL AMBASSADOR II',
    placement: 5,
    total_score: 310,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 43,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [14, 14, 14, 12, 13], sum: 67 },
          { judge_number: 2, scores: [16, 16, 16, 16, 17], sum: 81 }
        ],
        total: 148,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 59,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 16, 16, 17], sum: 83 },
          { judge_number: 2, scores: [15, 16, 16, 16, 16], sum: 79 }
        ],
        total: 162,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 4,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'NOWRUZ NARCISSUS IBN MALA OD VJETRA',
    name_lat: 'NOWRUZ NARCISSUS IBN MALA OD VJETRA',
    placement: 6,
    total_score: 306,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 45,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [14, 16, 16, 12, 14], sum: 72 },
          { judge_number: 2, scores: [13, 15, 15, 14, 13], sum: 70 }
        ],
        total: 142,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 60,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 18], sum: 86 },
          { judge_number: 2, scores: [15, 16, 16, 15, 16], sum: 78 }
        ],
        total: 164,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 6,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Кобель',
    sex: 'Кобель',
    name_ru: 'САЛЮКОВ СИНБАД СТОРИ ОФ СЕВЕН СИАС',
    name_lat: 'SALUKOV SINDBAD STORY OF SEVEN SEAS',
    placement: null,
    total_score: null,
    qualification: '',
    vc: '',
    status: 'withdrawn',
    status_reason: 'Снят владельцем',
    heats: [
      {
        heat_number: 44,
        bib_color: 'white',
        disqualified: true,
        disqualification_reason: 'Снят владельцем'
      }
    ]
  },

  // --- САЛЮКИ СТАНДАРТНЫЙ СУКИ ---
  {
    catalog_no: 8,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'АЛЬ НАФИСЭХ ЛАВЬЕН',
    name_lat: 'AL NAFISEH LAVIEN',
    placement: 1,
    total_score: 342,
    qualification: 'ПЧРКФ',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 47,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 18, 18], sum: 89 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 174,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 63,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 18, 17], sum: 88 },
          { judge_number: 2, scores: [17, 15, 15, 17, 16], sum: 80 }
        ],
        total: 168,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 11,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА',
    name_lat: 'EMUL DE GEPARD GELILA AL RAWDA',
    placement: 2,
    total_score: 333,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 48,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 17], sum: 85 },
          { judge_number: 2, scores: [16, 16, 16, 17, 17], sum: 82 }
        ],
        total: 167,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 62,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [16, 18, 18, 16, 17], sum: 85 },
          { judge_number: 2, scores: [16, 16, 16, 16, 17], sum: 81 }
        ],
        total: 166,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 10,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БЕЛЬ ЭТУАЛЬ ЧООСЕ МЕ',
    name_lat: 'BEL ETUAL CHOOSE ME',
    placement: 3,
    total_score: 332,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 48,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 17, 17], sum: 85 },
          { judge_number: 2, scores: [17, 17, 17, 17, 17], sum: 85 }
        ],
        total: 170,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 63,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [17, 17, 17, 16, 16], sum: 83 },
          { judge_number: 2, scores: [16, 16, 16, 16, 15], sum: 79 }
        ],
        total: 162,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },
  {
    catalog_no: 9,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'БЕЛЬ ЭТУАЛЬ АЛТЕР ЭГО',
    name_lat: 'BEL ETUAL ALTER EGO',
    placement: 4,
    total_score: 327,
    qualification: '',
    vc: 'CC',
    status: 'finished',
    status_reason: null,
    heats: [
      {
        heat_number: 47,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [15, 17, 17, 16, 17], sum: 82 },
          { judge_number: 2, scores: [16, 17, 16, 16, 16], sum: 81 }
        ],
        total: 163,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 62,
        bib_color: 'white',
        judges: [
          { judge_number: 1, scores: [16, 18, 18, 17, 16], sum: 85 },
          { judge_number: 2, scores: [16, 16, 16, 15, 16], sum: 79 }
        ],
        total: 164,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },

  // --- САЛЮКИ ЮНИОРЫ КОБЕЛИ ---
  {
    catalog_no: 601,
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
        heat_number: 49,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [18, 18, 18, 18, 18], sum: 90 },
          { judge_number: 2, scores: [17, 16, 16, 17, 17], sum: 83 }
        ],
        total: 173,
        disqualified: false,
        disqualification_reason: null
      },
      {
        heat_number: 64,
        bib_color: 'red',
        judges: [
          { judge_number: 1, scores: [17, 18, 18, 17, 18], sum: 88 },
          { judge_number: 2, scores: [16, 16, 16, 16, 16], sum: 80 }
        ],
        total: 168,
        disqualified: false,
        disqualification_reason: null
      }
    ]
  },

  // --- САЛЮКИ НЕЯВКА ---
  {
    catalog_no: 12,
    breed: 'Салюки',
    breed_class: 'Салюки - Стандартный - Сука',
    sex: 'Сука',
    name_ru: 'САЛЮКОВ САИДА',
    name_lat: 'SALUKOV SAIDA',
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
  date_start: '2026-06-27',
  date_end: '2026-06-28',
  title: 'Монопородный чемпионат по курсингу борзых (Уиппет, Чирнеко дель Этна, Салюки)',
  rank_label: 'ПЧРКФ\n(Курсинг борзых)',
  event_type: 'coursing',
  competition_kind: 'ПЧРКФ',
  competition_type: 'Курсинг борзых',
  host_club: 'МОРОО "Федерация спортивно-прикладного собаководства"',
  location: 'Московская область, д. Суханово',
  results: results.map(makeResult)
};

const outPath = path.resolve('data/temp/draft-2026-06-27.json');
fs.writeFileSync(outPath, JSON.stringify(draft, null, 2), 'utf-8');
console.log(`Generated ${draft.results.length} results to ${outPath}`);
