const { execSync } = require('child_process');
const path = require('path');

const DRIVE_2021 = 'C:\\Users\\Antal\\Documents\\Google.Disk\\Competitions\\2021';

const events = [
  { id: 1574, folder: '2021-04-17 - Чемпионат РКФ по курсингу [Московская обл.] [1574]' },
  { id: 1573, folder: '2021-04-18 - Бега за механической приманкой, Чемпионат России [Московская обл., Михайловское] [1573]' },
  { id: 1575, folder: '2021-04-24 - Чепионат РКФ по курсингу борзых [Ярославль] [1575]' },
  { id: 1576, folder: '2021-05-01 - Чемпионат ЧРКФ-CACL по курсингу борзых [Московская обл., д. Суханово] [1576]' },
  { id: 1577, folder: '2021-05-22 - Чемпионат РКФ-CACL по курсингу борзых -Зигзаг удачи в л [Калужская область, б-о Головин] [1577]' },
  { id: 1578, folder: '2021-06-19 - Чемпионат РКФ-CACL по бегам борзых [М.О., г. Раменское] [1578]' },
  { id: 1579, folder: '2021-08-07 - Чемпионат РКФ - CACL по бегам борзых за механическим за [Ярославская обл.] [1579]' },
  { id: 1580, folder: '2021-08-21 - Международные состязания по курсингу CACIL - Чемпионат [Московская обл.] [1580]' },
  { id: 1585, folder: '2021-09-04 - CACL Курсинг для борзых [Калужская область, б-о Головин] [1585]' },
  { id: 1581, folder: '2021-09-04 - Чемпионат РКФ по бегам за механической приманкой [Калужская область, б-о Головин] [1581]' },
  { id: 1582, folder: '2021-09-18 - Кубок России курсинг борзых [М.О. -Новый Милет-] [1582]' },
  { id: 1583, folder: '2021-10-02 - Зайчик-листопадничек - курсинг, CACIL + CACL [Московская обл., Михайловское] [1583]' },
];

for (const e of events) {
  const outDir = path.join(DRIVE_2021, e.folder);
  console.log(`\n=== Exporting ${e.id} to "${e.folder}" ===`);
  try {
    const cmd = `node --max-old-space-size=12288 ./node_modules/tsx/dist/cli.mjs backend/scripts/export/export-protocol-vector.ts ${e.id} "${outDir}"`;
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to export ${e.id}:`, err.message);
  }
}
