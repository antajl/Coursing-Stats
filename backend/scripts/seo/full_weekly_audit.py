import sys
import os
import json
from datetime import datetime, timedelta, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)
from gsc_client import make_request, get_search_analytics, list_sitemaps

SITE = "sc-domain:coursing-stats.ru"

def get_weekly_dates():
    now_utc = datetime.now(timezone.utc)
    # GSC data usually has 2-day lag
    end_date = (now_utc - timedelta(days=2)).strftime("%Y-%m-%d")
    start_date = (now_utc - timedelta(days=8)).strftime("%Y-%m-%d")
    prev_end = (now_utc - timedelta(days=9)).strftime("%Y-%m-%d")
    prev_start = (now_utc - timedelta(days=15)).strftime("%Y-%m-%d")
    return start_date, end_date, prev_start, prev_end

def inspect_url(url):
    payload = {
        "inspectionUrl": url,
        "siteUrl": SITE
    }
    try:
        res = make_request("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", method="POST", payload=payload)
        return res.get("inspectionResult", {})
    except Exception as e:
        return {"error": str(e)}

def run_audit():
    start_d, end_d, prev_start, prev_end = get_weekly_dates()
    print(f"=== АУДИТ GOOGLE SEARCH CONSOLE: {start_d} — {end_d} (Сравнение с {prev_start} — {prev_end}) ===\n")

    # 1. Общие показатели за текущую неделю
    cur_totals = get_search_analytics(SITE, start_date=start_d, end_date=end_d, dimensions=["date"], row_limit=100)
    prev_totals = get_search_analytics(SITE, start_date=prev_start, end_date=prev_end, dimensions=["date"], row_limit=100)

    cur_clicks = sum(r["clicks"] for r in cur_totals.get("rows", []))
    cur_impr = sum(r["impressions"] for r in cur_totals.get("rows", []))
    prev_clicks = sum(r["clicks"] for r in prev_totals.get("rows", []))
    prev_impr = sum(r["impressions"] for r in prev_totals.get("rows", []))

    print(f"--- 1. Сводные метрики за неделю ---")
    print(f"Клики:       {cur_clicks} (предыдущая неделя: {prev_clicks}, разница: {cur_clicks - prev_clicks:+d})")
    print(f"Показы:      {cur_impr} (предыдущая неделя: {prev_impr}, разница: {cur_impr - prev_impr:+d})")
    cur_ctr = (cur_clicks / cur_impr * 100) if cur_impr > 0 else 0
    prev_ctr = (prev_clicks / prev_impr * 100) if prev_impr > 0 else 0
    print(f"Средний CTR: {cur_ctr:.1f}% (предыдущая неделя: {prev_ctr:.1f}%)\n")

    # Динамика по дням
    print("Динамика по дням текущей недели:")
    for r in cur_totals.get("rows", []):
        d = r["keys"][0]
        c = int(r["clicks"])
        im = int(r["impressions"])
        p = r["position"]
        print(f"  {d}: клики {c}, показы {im}, ср. позиция {p:.1f}")
    print()

    # 2. Устройства и страны
    dev_data = get_search_analytics(SITE, start_date=start_d, end_date=end_d, dimensions=["device"])
    print("--- 2. Распределение по устройствам ---")
    for r in dev_data.get("rows", []):
        dev = r["keys"][0]
        print(f"  {dev}: клики {int(r['clicks'])}, показы {int(r['impressions'])}, CTR {(r['ctr']*100):.1f}%, позиция {r['position']:.1f}")
    print()

    geo_data = get_search_analytics(SITE, start_date=start_d, end_date=end_d, dimensions=["country"], row_limit=10)
    print("--- 3. Топ стран ---")
    for r in geo_data.get("rows", []):
        geo = r["keys"][0]
        print(f"  {geo}: клики {int(r['clicks'])}, показы {int(r['impressions'])}, позиция {r['position']:.1f}")
    print()

    # 3. Топ запросов за неделю
    query_data = get_search_analytics(SITE, start_date=start_d, end_date=end_d, dimensions=["query"], row_limit=30)
    print("--- 4. Топ поисковых запросов за неделю ---")
    q_rows = query_data.get("rows", [])
    print(f"Всего активных запросов: {len(q_rows)}")
    for r in q_rows:
        q = r["keys"][0]
        c = int(r["clicks"])
        im = int(r["impressions"])
        ctr = r["ctr"] * 100
        p = r["position"]
        print(f"  [{c} кл / {im} пок / CTR {ctr:4.1f}% / поз {p:4.1f}]  {q}")
    print()

    # 4. Топ страниц за неделю
    page_data = get_search_analytics(SITE, start_date=start_d, end_date=end_d, dimensions=["page"], row_limit=30)
    print("--- 5. Топ страниц за неделю ---")
    p_rows = page_data.get("rows", [])
    print(f"Всего страниц, получавших показы: {len(p_rows)}")
    for r in p_rows:
        pg = r["keys"][0]
        c = int(r["clicks"])
        im = int(r["impressions"])
        p = r["position"]
        print(f"  [{c} кл / {im} пок / поз {p:4.1f}]  {pg}")
    print()

    # 5. Карта сайта (Sitemap)
    print("--- 6. Статус Sitemap ---")
    try:
        sm_res = list_sitemaps(SITE)
        for sm in sm_res.get("sitemap", []):
            print(f"  URL: {sm.get('path')}")
            print(f"  Последняя загрузка: {sm.get('lastDownloaded')}")
            print(f"  Ошибок: {sm.get('errors')}, Предупреждений: {sm.get('warnings')}")
            for c in sm.get("contents", []):
                print(f"  Тип: {c.get('type')}, Страниц отправлено: {c.get('submitted')}, Проиндексировано: {c.get('indexed')}")
    except Exception as ex:
        print(f"  Ошибка чтения Sitemap: {ex}")
    print()

    # 6. Глубокая инспекция ключевых URL (URL Inspection API)
    print("--- 7. Инспекция ключевых страниц (URL Inspection) ---")
    urls_to_inspect = [
        "https://coursing-stats.ru/",
        "https://coursing-stats.ru/competitions/",
        "https://coursing-stats.ru/shows/",
        "https://coursing-stats.ru/guide/",
        "https://coursing-stats.ru/breeds/whippet/",
        "https://coursing-stats.ru/dog/154622288",
        "https://coursing-stats.ru/shows/judges/%D0%BB%D0%BE%D0%B3%D0%B8%D0%BD%D0%BE%D0%B2%7C%D0%B0%7C%D0%B5/",
        "https://coursing-stats.ru/donino/championship/"
    ]

    for u in urls_to_inspect:
        res = inspect_url(u)
        if "error" in res:
            print(f"  {u} -> Ошибка: {res['error']}")
            continue
        idx = res.get("indexStatusResult", {})
        rich = res.get("richResultsResult", {})
        verdict = idx.get("verdict", "UNKNOWN")
        state = idx.get("coverageState", "UNKNOWN")
        last_crawl = idx.get("lastCrawlTime", "UNKNOWN")
        robots = idx.get("robotsTxtState", "UNKNOWN")
        canonical = idx.get("googleCanonical", "UNKNOWN")
        user_can = idx.get("userCanonical", "UNKNOWN")
        rich_types = [item.get("richResultType") for item in rich.get("detectedItems", [])]

        print(f"  URL: {u}")
        print(f"    Статус: {verdict} ({state})")
        print(f"    Робот: {idx.get('crawledAs')}, Robots.txt: {robots}, HTTP: {idx.get('pageFetchState')}")
        print(f"    Дата последнего обхода: {last_crawl}")
        print(f"    Канонический URL: Google={canonical} | Указанный={user_can}")
        if rich_types:
            print(f"    Микроразметка (Rich Results): {', '.join(rich_types)} (Статус: {rich.get('verdict')})")
        print()

if __name__ == "__main__":
    run_audit()
