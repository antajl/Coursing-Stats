import os
import json
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
TOKENS_FILE = os.path.join(PROJECT_ROOT, ".gsc-tokens.json")

def get_tokens():
    if not os.path.exists(TOKENS_FILE):
        raise FileNotFoundError(f"Файл токенов не найден: {TOKENS_FILE}")
    with open(TOKENS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def refresh_access_token():
    tokens = get_tokens()
    refresh_token = tokens.get("refresh_token")
    client_id = tokens.get("client_id")
    client_secret = tokens.get("client_secret")

    if not refresh_token or not client_id or not client_secret:
        raise ValueError("В .gsc-tokens.json отсутствуют необходимые ключи для обновления токена.")

    data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }).encode("utf-8")

    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data, method="POST")
    with urllib.request.urlopen(req, timeout=20) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        tokens["access_token"] = res.get("access_token")
        if "refresh_token" in res:
            tokens["refresh_token"] = res["refresh_token"]
        with open(TOKENS_FILE, "w", encoding="utf-8") as f:
            json.dump(tokens, f, indent=2)
        return tokens["access_token"]

def make_request(url, method="GET", payload=None):
    tokens = get_tokens()
    access_token = tokens.get("access_token")

    def _call(token):
        headers = {"Authorization": f"Bearer {token}"}
        data = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
        if not raw:
            return {}
        return json.loads(raw)

    try:
        return _call(access_token)
    except urllib.error.HTTPError as e:
        if e.code == 401:
            new_token = refresh_access_token()
            return _call(new_token)
        err = e.read().decode("utf-8")
        raise RuntimeError(f"HTTPError {e.code}: {err}")

def list_sites():
    res = make_request("https://www.googleapis.com/webmasters/v3/sites")
    return res.get("siteEntry", [])

def get_search_analytics(site_url="sc-domain:coursing-stats.ru", start_date=None, end_date=None, dimensions=None, row_limit=50):
    now_utc = datetime.now(timezone.utc)
    if not end_date:
        end_date = (now_utc - timedelta(days=2)).strftime("%Y-%m-%d")
    if not start_date:
        start_date = (now_utc - timedelta(days=90)).strftime("%Y-%m-%d")
    if dimensions is None:
        dimensions = ["query"]

    encoded_site = urllib.parse.quote(site_url, safe="")
    url = f"https://www.googleapis.com/webmasters/v3/sites/{encoded_site}/searchAnalytics/query"
    payload = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": dimensions,
        "rowLimit": row_limit
    }
    return make_request(url, method="POST", payload=payload)

def list_sitemaps(site_url="sc-domain:coursing-stats.ru"):
    encoded_site = urllib.parse.quote(site_url, safe="")
    url = f"https://www.googleapis.com/webmasters/v3/sites/{encoded_site}/sitemaps"
    return make_request(url)

def submit_sitemap(sitemap_url, site_url="sc-domain:coursing-stats.ru"):
    encoded_site = urllib.parse.quote(site_url, safe="")
    encoded_sitemap = urllib.parse.quote(sitemap_url, safe="")
    url = f"https://www.googleapis.com/webmasters/v3/sites/{encoded_site}/sitemaps/{encoded_sitemap}"
    return make_request(url, method="PUT")

def delete_sitemap(sitemap_url, site_url="sc-domain:coursing-stats.ru"):
    encoded_site = urllib.parse.quote(site_url, safe="")
    encoded_sitemap = urllib.parse.quote(sitemap_url, safe="")
    url = f"https://www.googleapis.com/webmasters/v3/sites/{encoded_site}/sitemaps/{encoded_sitemap}"
    return make_request(url, method="DELETE")

def inspect_url(inspection_url, site_url="sc-domain:coursing-stats.ru"):
    url = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
    payload = {
        "inspectionUrl": inspection_url,
        "siteUrl": site_url,
    }
    return make_request(url, method="POST", payload=payload)

if __name__ == "__main__":
    sites = list_sites()
    print("Доступные сайты в GSC:")
    for s in sites:
        print(f" - {s.get('siteUrl')} (уровень: {s.get('permissionLevel')})")

    site = "sc-domain:coursing-stats.ru"
    print(f"\nЗапрашиваем топ страниц за последние 90 дней для {site}...")
    pages_data = get_search_analytics(site_url=site, dimensions=["page"], row_limit=25)
    p_rows = pages_data.get("rows", [])
    print(f"{'Страница':<65} | {'Клики':<6} | {'Показы':<7} | {'Позиция'}")
    print("-" * 90)
    for r in p_rows:
        pg = r["keys"][0]
        clicks = int(r["clicks"])
        impr = int(r["impressions"])
        pos = r["position"]
        print(f"{pg:<65} | {clicks:<6} | {impr:<7} | {pos:.1f}")

    print("\nПроверяем статус Sitemap в Google...")
    try:
        sitemaps = list_sitemaps(site)
        for sm in sitemaps.get("sitemap", []):
            print(f" - {sm.get('path')}: статус {sm.get('lastDownloaded')}, ошибок: {sm.get('errors')}, страниц: {sm.get('contents', [{}])[0].get('submitted')}")
    except Exception as ex:
        print(f"Не удалось получить Sitemap: {ex}")
