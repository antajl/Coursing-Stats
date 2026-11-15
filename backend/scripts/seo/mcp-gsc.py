import sys
import os
import json

# Ensure local imports
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

from gsc_client import list_sites, get_search_analytics, list_sitemaps, inspect_url, make_request

TOOLS = [
    {
        "name": "gsc_get_search_analytics",
        "description": "Получить детальную поисковую аналитику из Google Search Console (запросы, страницы, клики, показы, CTR, средняя позиция).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "site_url": {
                    "type": "string",
                    "description": "URL сайта или ресурс в GSC (по умолчанию 'sc-domain:coursing-stats.ru')",
                    "default": "sc-domain:coursing-stats.ru"
                },
                "start_date": {
                    "type": "string",
                    "description": "Начальная дата в формате YYYY-MM-DD"
                },
                "end_date": {
                    "type": "string",
                    "description": "Конечная дата в формате YYYY-MM-DD"
                },
                "dimensions": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Группировка: 'query', 'page', 'country', 'device', 'date'",
                    "default": ["query"]
                },
                "row_limit": {
                    "type": "integer",
                    "description": "Максимум строк (по умолчанию 50, до 5000)",
                    "default": 50
                }
            }
        }
    },
    {
        "name": "gsc_list_sites",
        "description": "Получить список подтвержденных доменов и сайтов в Google Search Console с уровнем доступа.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "gsc_list_sitemaps",
        "description": "Получить статус всех карт сайта (Sitemap) в Google Search Console: дату последней загрузки, ошибки и количество страниц.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "site_url": {
                    "type": "string",
                    "description": "URL сайта или ресурс в GSC (по умолчанию 'sc-domain:coursing-stats.ru')",
                    "default": "sc-domain:coursing-stats.ru"
                }
            }
        }
    },
    {
        "name": "gsc_inspect_url",
        "description": "Проверить статус индексации конкретного URL в Google Search Console (вердикт, дата последнего сканирования, канонический URL, ошибки Schema.org).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "Полный URL для проверки (например 'https://coursing-stats.ru/dog/546266275')"
                },
                "site_url": {
                    "type": "string",
                    "description": "URL сайта или ресурс в GSC (по умолчанию 'sc-domain:coursing-stats.ru')",
                    "default": "sc-domain:coursing-stats.ru"
                }
            },
            "required": ["url"]
        }
    }
]

def handle_request(req):
    method = req.get("method")
    req_id = req.get("id")

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "google-search-console-mcp",
                    "version": "1.0.0"
                }
            }
        }

    if method == "notifications/initialized":
        return None

    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "tools": TOOLS
            }
        }

    if method == "tools/call":
        params = req.get("params", {})
        tool_name = params.get("name")
        args = params.get("arguments", {})

        try:
            if tool_name == "gsc_get_search_analytics":
                res = get_search_analytics(
                    site_url=args.get("site_url", "sc-domain:coursing-stats.ru"),
                    start_date=args.get("start_date"),
                    end_date=args.get("end_date"),
                    dimensions=args.get("dimensions", ["query"]),
                    row_limit=args.get("row_limit", 50)
                )
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {"type": "text", "text": json.dumps(res, ensure_ascii=False, indent=2)}
                        ]
                    }
                }

            elif tool_name == "gsc_list_sites":
                res = list_sites()
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {"type": "text", "text": json.dumps(res, ensure_ascii=False, indent=2)}
                        ]
                    }
                }

            elif tool_name == "gsc_list_sitemaps":
                res = list_sitemaps(args.get("site_url", "sc-domain:coursing-stats.ru"))
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {"type": "text", "text": json.dumps(res, ensure_ascii=False, indent=2)}
                        ]
                    }
                }

            elif tool_name == "gsc_inspect_url":
                res = inspect_url(
                    inspection_url=args.get("url"),
                    site_url=args.get("site_url", "sc-domain:coursing-stats.ru")
                )
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {"type": "text", "text": json.dumps(res, ensure_ascii=False, indent=2)}
                        ]
                    }
                }

            else:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32601,
                        "message": f"Неизвестный инструмент: {tool_name}"
                    }
                }

        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32000,
                    "message": str(e)
                }
            }

    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "error": {
            "code": -32601,
            "message": f"Метод не поддерживается: {method}"
        }
    }

def main():
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            continue

        try:
            req = json.loads(line)
            resp = handle_request(req)
            if resp is not None:
                sys.stdout.write(json.dumps(resp, ensure_ascii=False) + "\n")
                sys.stdout.flush()
        except Exception as e:
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": str(e)}
            }
            sys.stdout.write(json.dumps(err_resp, ensure_ascii=False) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
