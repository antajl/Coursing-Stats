import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка соревнования
const competitionPath = path.join(__dirname, '../../data/v1/competitions/2026/08-август/1550-пчркф-курсинг-борзых.json');
const competition = JSON.parse(fs.readFileSync(competitionPath, 'utf8'));

// Карта dog_key -> dog_id для существующих собак
const existingDogIds = {
  "dzhana-dzhan-genri-morgan--басенджи": 5735,
  "nicol-san-s-knjazheskogo-dvora--басенджи": 387,
  "harmony-kama-tiramisu-best-ever--басенджи": 855,
  "emul-de-gepard-gelila-al-rawda--салюки": 5782,
  "stangers-land-bratislava--уиппет": 85,
  "devaj-1976-zarooq--уиппет": 459,
  "stangers-land-zamir--уиппет": 5631,
  "stangers-land-irwin-divnyi--уиппет": 5637,
  "stangers-land-versailles-charman--уиппет": 122,
  "stangers-land-zenit--уиппет": 5634,
  "wildabout-double-atomic-race--уиппет": 756,
  "feel-my-heart-daenerys-stormborn--уиппет": 461,
  "stangers-land-ingrid-elegant--уиппет": 263,
  "zoella-vlapan--уиппет": 267,
  "stangers-land-valdivia--уиппет": 7088,
  "antique-goddess--уиппет": 6240,
  "diamant-top-kristal--уиппет": 5876,
  "stangers-land-daring-greatly--уиппет": 269,
  "alphas-legacy-altair--уиппет": 462,
  "ural-spirit-salamander--уиппет": 5656,
  "brave-heart-simba--уиппет": 5650,
  "beyond-blue-doughnut--уиппет": 760,
  "dzhipsi-lilit-boginya-nochi--уиппет": 5797,
  "stangers-land-internal-energy--уиппет": 5661,
  "stangers-land-zlatoslava--уиппет": 5663,
  "heidi-sotis-djed-atum--фараонова-собака": 5903,
  "heidi-sotis-delimara-mintaka--фараонова-собака": 5906,
  "heidi-sotis-djgantiya-mut--фараонова-собака": 5908,
  "baxter-bern--фараонова-собака": 5901,
  "keyod--родезиискии-риджбек": 5757  // С опечаткой в существующем ключе
};

// Обновление dog_id в результатах
let updated = 0;
for (const result of competition.results) {
  if (existingDogIds[result.dog_key]) {
    result.dog_id = existingDogIds[result.dog_key];
    result.dog.id = existingDogIds[result.dog_key];
    updated++;
  }
}

console.log(`Обновлено dog_id для ${updated} собак`);

// Сохранение обновлённого файла
fs.writeFileSync(competitionPath, JSON.stringify(competition, null, 2), 'utf8');
console.log(`Файл обновлён: ${competitionPath}`);