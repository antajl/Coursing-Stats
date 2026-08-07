import iconv from "iconv-lite";

/**
 * Скачивает страницу с procoursing.ru и декодирует её из windows-1251.
 * Сайт не отдаёт Content-Type с правильной кодировкой, поэтому декодируем
 * вручную из байт, а не доверяем тому, что сделает fetch/TextDecoder.
 */
export async function fetchWin1251(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      // некоторые сайты отдают другой контент без UA браузера
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStatsBot/0.1 (non-commercial project)",
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText} для ${url}`);
  }
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  return iconv.decode(buf, "win1251");
}

/**
 * Простая задержка между запросами — чтобы не долбить сайт-источник.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
