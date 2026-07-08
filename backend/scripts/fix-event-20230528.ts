/**
 * Точечное исправление события 20230528 - добавление недостающих пород
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(__dirname, '../../data/v1/competitions/2023/05-май/20230528--27-28052023-.json');

// Читаем текущий файл
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Добавляем недостающие результаты
const additionalResults = [
  // Американский стаффордширский терьер
  {
    breed_class: "Американский стаффордширский терьер - Стандартный - Общая",
    placement: 1,
    catalog_no: 3,
    breed: "АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР",
    class: "Стандартный",
    sex: "Сука",
    name: "TCENNIY PRIZE EIRENA",
    name_lat: "TCENNIY PRIZE EIRENA",
    total_score: 334,
    judge_count: 2,
    qualification: "Чемпион РКФ",
    vc: "CC",
    status: "finished",
    status_reason: null,
    raw_scores_json: JSON.stringify({
      heats: [
        {
          heat_number: 1,
          bib_number: 11,
          bib_color: "16",
          judges: [
            { judge_number: 1, scores: [16, 16, 15, 16, 16], sum: 79 },
            { judge_number: 2, scores: [17, 17, 16, 18, 17], sum: 85 }
          ],
          total: 164,
          disqualified: false,
          disqualification_reason: null
        },
        {
          heat_number: 2,
          bib_number: 22,
          bib_color: "16",
          judges: [
            { judge_number: 1, scores: [16, 16, 16, 16, 17], sum: 81 },
            { judge_number: 2, scores: [18, 17, 16, 18, 18], sum: 87 }
          ],
          total: 168,
          disqualified: false,
          disqualification_reason: null
        }
      ]
    }),
    raw_text: ""
  },
  {
    breed_class: "Американский стаффордширский терьер - Стандартный - Общая",
    placement: 2,
    catalog_no: 1,
    breed: "АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР",
    class: "Стандартный",
    sex: "Кобель",
    name: "BAKARORO END ITUBORI THE BEST TCENNIY PRIZE",
    name_lat: "BAKARORO END ITUBORI THE BEST TCENNIY PRIZE",
    total_score: 327,
    judge_count: 2,
    qualification: "",
    vc: "CC",
    status: "finished",
    status_reason: null,
    raw_scores_json: JSON.stringify({
      heats: [
        {
          heat_number: 1,
          bib_number: 12,
          bib_color: "15",
          judges: [
            { judge_number: 1, scores: [15, 16, 14, 16, 16], sum: 77 },
            { judge_number: 2, scores: [18, 17, 16, 18, 17], sum: 86 }
          ],
          total: 163,
          disqualified: false,
          disqualification_reason: null
        },
        {
          heat_number: 2,
          bib_number: 22,
          bib_color: "15",
          judges: [
            { judge_number: 1, scores: [15, 16, 15, 15, 16], sum: 77 },
            { judge_number: 2, scores: [18, 17, 16, 18, 18], sum: 87 }
          ],
          total: 164,
          disqualified: false,
          disqualification_reason: null
        }
      ]
    }),
    raw_text: ""
  },
  {
    breed_class: "Американский стаффордширский терьер - Стандартный - Общая",
    placement: 3,
    catalog_no: 2,
    breed: "АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР",
    class: "Стандартный",
    sex: "Кобель",
    name: "TCENNIY PRIZE ESCLUSIVO",
    name_lat: "TCENNIY PRIZE ESCLUSIVO",
    total_score: 307,
    judge_count: 2,
    qualification: "",
    vc: "CC",
    status: "finished",
    status_reason: null,
    raw_scores_json: JSON.stringify({
      heats: [
        {
          heat_number: 1,
          bib_number: 11,
          bib_color: "15",
          judges: [
            { judge_number: 1, scores: [15, 16, 14, 14, 16], sum: 75 },
            { judge_number: 2, scores: [16, 17, 16, 16, 18], sum: 83 }
          ],
          total: 158,
          disqualified: false,
          disqualification_reason: null
        },
        {
          heat_number: 2,
          bib_number: 23,
          bib_color: "15",
          judges: [
            { judge_number: 1, scores: [15, 16, 16, 16, 17], sum: 80 },
            { judge_number: 2, scores: [18, 17, 16, 18, 18], sum: 87 }
          ],
          total: 167,
          disqualified: false,
          disqualification_reason: null
        }
      ]
    }),
    raw_text: ""
  },
  // Ирландский терьер
  {
    breed_class: "Ирландский терьер - Стандартный - Общая",
    placement: 1,
    catalog_no: 7,
    breed: "ИРЛАНДСКИЙ ТЕРЬЕР",
    class: "Стандартный",
    sex: "Сука",
    name: "РИЧЛИ РЭД ЮНИТИ / RICHLI RED YUNITI",
    name_lat: "RICHLI RED YUNITI",
    total_score: 351,
    judge_count: 2,
    qualification: "Чемпион РКФ",
    vc: "CC",
    status: "finished",
    status_reason: null,
    raw_scores_json: JSON.stringify({
      heats: [
        {
          heat_number: 1,
          bib_number: 90,
          bib_color: "17",
          judges: [
            { judge_number: 1, scores: [17, 17, 17, 17, 18], sum: 86 },
            { judge_number: 2, scores: [18, 18, 18, 17, 18], sum: 89 }
          ],
          total: 175,
          disqualified: false,
          disqualification_reason: null
        },
        {
          heat_number: 2,
          bib_number: 96,
          bib_color: "17",
          judges: [
            { judge_number: 1, scores: [17, 17, 17, 17, 18], sum: 86 },
            { judge_number: 2, scores: [18, 18, 18, 18, 18], sum: 90 }
          ],
          total: 176,
          disqualified: false,
          disqualification_reason: null
        }
      ]
    }),
    raw_text: ""
  },
  {
    breed_class: "Ирландский терьер - Стандартный - Общая",
    placement: 2,
    catalog_no: 8,
    breed: "ИРЛАНДСКИЙ ТЕРЬЕР",
    class: "Стандартный",
    sex: "Сука",
    name: "YURATE YANTARNAYA KAPLYA",
    name_lat: "YURATE YANTARNAYA KAPLYA",
    total_score: 345,
    judge_count: 2,
    qualification: "",
    vc: "CC",
    status: "finished",
    status_reason: null,
    raw_scores_json: JSON.stringify({
      heats: [
        {
          heat_number: 1,
          bib_number: 90,
          bib_color: "17",
          judges: [
            { judge_number: 1, scores: [17, 17, 17, 17, 17], sum: 85 },
            { judge_number: 2, scores: [17, 17, 18, 18, 18], sum: 88 }
          ],
          total: 173,
          disqualified: false,
          disqualification_reason: null
        },
        {
          heat_number: 2,
          bib_number: 95,
          bib_color: "17",
          judges: [
            { judge_number: 1, scores: [17, 17, 17, 16, 17], sum: 84 },
            { judge_number: 2, scores: [18, 18, 17, 18, 18], sum: 89 }
          ],
          total: 172,
          disqualified: false,
          disqualification_reason: null
        }
      ]
    }),
    raw_text: ""
  },
  {
    breed_class: "Ирландский терьер - Стандартный - Общая",
    placement: 3,
    catalog_no: 4,
    breed: "ИРЛАНДСКИЙ ТЕРЬЕР",
    class: "Стандартный",
    sex: "Кобель",
    name: "БЕСЦЕННЫЙ ПОДАРОК ИЗ ДОМА АЛАНТЕС / BESTSENNYI PODAROK IZ DOMA ALANTES",
    name_lat: "BESTSENNYI PODAROK IZ DOMA ALANTES",
    total_score: 342,
    judge_count: 2,
    qualification: "",
    vc: "CC",
    status: "finished",
    status_reason: null,
    raw_scores_json: JSON.stringify({
      heats: [
        {
          heat_number: 1,
          bib_number: 91,
          bib_color: "17",
          judges: [
            { judge_number: 1, scores: [17, 17, 17, 16, 17], sum: 84 },
            { judge_number: 2, scores: [18, 17, 18, 18, 17], sum: 88 }
          ],
          total: 172,
          disqualified: false,
          disqualification_reason: null
        },
        {
          heat_number: 2,
          bib_number: 95,
          bib_color: "17",
          judges: [
            { judge_number: 1, scores: [17, 17, 17, 17, 16], sum: 84 },
            { judge_number: 2, scores: [17, 18, 17, 18, 18], sum: 88 }
          ],
          total: 170,
          disqualified: false,
          disqualification_reason: null
        }
      ]
    }),
    raw_text: ""
  },
  {
    breed_class: "Ирландский терьер - Стандартный - Общая",
    placement: 4,
    catalog_no: 6,
    breed: "ИРЛАНДСКИЙ ТЕРЬЕР",
    class: "Стандартный",
    sex: "Сука",
    name: "АЙНЕ АЙРИШ АШЛИНГ / AINE IRISH ASHLING",
    name_lat: "AINE IRISH ASHLING",
    total_score: 338,
    judge_count: 2,
    qualification: "",
    vc: "CC",
    status: "finished",
    status_reason: null,
    raw_scores_json: JSON.stringify({
      heats: [
        {
          heat_number: 1,
          bib_number: 89,
          bib_color: "16",
          judges: [
            { judge_number: 1, scores: [16, 17, 16, 16, 14], sum: 79 },
            { judge_number: 2, scores: [18, 16, 18, 18, 18], sum: 88 }
          ],
          total: 167,
          disqualified: false,
          disqualification_reason: null
        },
        {
          heat_number: 2,
          bib_number: 97,
          bib_color: "17",
          judges: [
            { judge_number: 1, scores: [17, 17, 16, 16, 17], sum: 83 },
            { judge_number: 2, scores: [18, 18, 18, 18, 16], sum: 88 }
          ],
          total: 171,
          disqualified: false,
          disqualification_reason: null
        }
      ]
    }),
    raw_text: ""
  },
  {
    breed_class: "Ирландский терьер - Стандартный - Общая",
    placement: 5,
    catalog_no: 5,
    breed: "ИРЛАНДСКИЙ ТЕРЬЕР",
    class: "Стандартный",
    sex: "Кобель",
    name: "NEZHNOYE PLAMYA ANTEN",
    name_lat: "NEZHNOYE PLAMYA ANTEN",
    total_score: 329,
    judge_count: 2,
    qualification: "",
    vc: "CC",
    status: "finished",
    status_reason: null,
    raw_scores_json: JSON.stringify({
      heats: [
        {
          heat_number: 1,
          bib_number: 89,
          bib_color: "16",
          judges: [
            { judge_number: 1, scores: [16, 16, 16, 16, 16], sum: 80 },
            { judge_number: 2, scores: [17, 17, 18, 18, 18], sum: 88 }
          ],
          total: 168,
          disqualified: false,
          disqualification_reason: null
        },
        {
          heat_number: 2,
          bib_number: 96,
          bib_color: "17",
          judges: [
            { judge_number: 1, scores: [17, 17, 17, 15, 12], sum: 78 },
            { judge_number: 2, scores: [18, 18, 18, 15, 16], sum: 83 }
          ],
          total: 161,
          disqualified: false,
          disqualification_reason: null
        }
      ]
    }),
    raw_text: ""
  }
];

// Добавляем новые результаты к существующим
data.results = [...data.results, ...additionalResults];
data.result_count = data.results.length;

// Обновляем дату экспорта
data.exported_at = new Date().toISOString();

// Записываем обновленный файл
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`✓ Обновлен файл ${filePath}`);
console.log(`  Было результатов: ${data.results.length - additionalResults.length}`);
console.log(`  Стало результатов: ${data.results.length}`);
console.log(`  Добавлено: ${additionalResults.length} результатов`);
