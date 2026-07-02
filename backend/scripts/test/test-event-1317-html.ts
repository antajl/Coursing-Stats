import { fetchWin1251 } from "../../lib/fetch-win1251";

const url = 'http://procoursing.ru/2026/2026-05-23_Complete_Results_Coursing.html';

async function test() {
  const html = await fetchWin1251(url);
  console.log(html);
}

test().catch(console.error);
