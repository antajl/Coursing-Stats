const fs = require('fs');
const path = require('path');

const DRIVE_2021 = 'C:\\Users\\Antal\\Documents\\Google.Disk\\Competitions\\2021';
const TMP = 'data/tmp/procoursing_2021';

const mappings = [
  { id: 1574, folder: '2021-04-17 - Чемпионат РКФ по курсингу [Московская обл.] [1574]', files: ['2021-04-17_C.webp'] },
  { id: 1573, folder: '2021-04-18 - Бега за механической приманкой, Чемпионат России [Московская обл., Михайловское] [1573]', files: ['2021-04-18_B.webp'] },
  { id: 1575, folder: '2021-04-24 - Чепионат РКФ по курсингу борзых [Ярославль] [1575]', files: ['2021-04-24.webp'] },
  { id: 1576, folder: '2021-05-01 - Чемпионат ЧРКФ-CACL по курсингу борзых [Московская обл., д. Суханово] [1576]', files: ['2021-05-02.webp'] },
  { id: 1577, folder: '2021-05-22 - Чемпионат РКФ-CACL по курсингу борзых -Зигзаг удачи в л [Калужская область, б-о Головин] [1577]', files: ['2021-05-22.webp'] },
  { id: 1578, folder: '2021-06-19 - Чемпионат РКФ-CACL по бегам борзых [М.О., г. Раменское] [1578]', files: ['2021-06-19.webp'] },
  { id: 1579, folder: '2021-08-07 - Чемпионат РКФ - CACL по бегам борзых за механическим за [Ярославская обл.] [1579]', files: ['2021-08-07.webp'] },
  { id: 1580, folder: '2021-08-21 - Международные состязания по курсингу CACIL - Чемпионат [Московская обл.] [1580]', files: ['2021-08-21.webp'] },
  { id: 1585, folder: '2021-09-04 - CACL Курсинг для борзых [Калужская область, б-о Головин] [1585]', files: ['2021-09-04_C.webp'] },
  { id: 1581, folder: '2021-09-04 - Чемпионат РКФ по бегам за механической приманкой [Калужская область, б-о Головин] [1581]', files: ['2021-09-04_B.webp'] },
  { id: 1582, folder: '2021-09-18 - Кубок России курсинг борзых [М.О. -Новый Милет-] [1582]', files: ['2021-09-18.webp', 'Catalog_2021-09-18_Coursing_Cup_Russia.pdf'] },
  { id: 1583, folder: '2021-10-02 - Зайчик-листопадничек - курсинг, CACIL + CACL [Московская обл., Михайловское] [1583]', files: ['2021-10-02.webp'] },
];

for (const m of mappings) {
  const destDir = path.join(DRIVE_2021, m.folder);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const f of m.files) {
    const src = path.join(TMP, f);
    if (fs.existsSync(src)) {
      const dest = path.join(destDir, f);
      fs.copyFileSync(src, dest);
      console.log(`Copied ${f} -> ${m.folder}`);
    } else {
      console.warn(`File not found: ${src}`);
    }
  }
}
