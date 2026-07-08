@echo off
cd /d "d:\Site\CoursingStats"
npx tsx backend/scripts/web-archive/parse-calendar-2015.ts
npx tsx backend/scripts/web-archive/parse-calendar-2016.ts
npx tsx backend/scripts/web-archive/parse-calendar-2017.ts
npx tsx backend/scripts/web-archive/parse-calendar-2018.ts
npx tsx backend/scripts/web-archive/parse-calendar-2019.ts
npx tsx backend/scripts/web-archive/parse-calendar-2020.ts
npx tsx backend/scripts/web-archive/parse-calendar-2021.ts
npx tsx backend/scripts/web-archive/parse-calendar-2022.ts
npx tsx backend/scripts/web-archive/parse-calendar-2023.ts
npx tsx backend/scripts/web-archive/parse-calendar-2024.ts
echo All calendar parsers completed
