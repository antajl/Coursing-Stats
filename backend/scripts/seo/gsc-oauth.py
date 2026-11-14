import os
import json
import urllib.parse
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

PORT = 8080
REDIRECT_URI = f"http://localhost:{PORT}"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
TOKENS_FILE = os.path.join(PROJECT_ROOT, ".gsc-tokens.json")
ENV_FILE = os.path.join(PROJECT_ROOT, ".env.ai")

def get_env_credentials():
    client_id = os.environ.get("GSC_CLIENT_ID")
    client_secret = os.environ.get("GSC_CLIENT_SECRET")
    if not client_id or not client_secret:
        if os.path.exists(ENV_FILE):
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GSC_CLIENT_ID="):
                        client_id = line.split("=", 1)[1].strip()
                    elif line.startswith("GSC_CLIENT_SECRET="):
                        client_secret = line.split("=", 1)[1].strip()
    return client_id, client_secret

CLIENT_ID, CLIENT_SECRET = get_env_credentials()
SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/webmasters"
]

auth_code = None
server_instance = None

class OAuthHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Quiet

    def do_GET(self):
        global auth_code
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if "code" in params:
            auth_code = params["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            html = """
            <!DOCTYPE html>
            <html>
            <head><title>Авторизация успешна</title><meta charset="utf-8"></head>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #faf9f5;">
                <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 480px; border: 1px solid #e7e2d7;">
                    <div style="font-size: 48px; color: #16a34a; margin-bottom: 16px;">✓</div>
                    <h2 style="margin: 0 0 12px 0; color: #1c1917;">Авторизация Google Search Console успешна!</h2>
                    <p style="color: #78716c; margin: 0; font-size: 15px;">Токены получены и сохранены. Эту вкладку можно закрыть и вернуться в чат.</p>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html.encode("utf-8"))
            threading.Thread(target=self.server.shutdown).start()
        elif "error" in params:
            self.send_response(400)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(f"Ошибка авторизации: {params['error'][0]}".encode("utf-8"))
            threading.Thread(target=self.server.shutdown).start()
        else:
            self.send_response(404)
            self.end_headers()

def generate_auth_url():
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent",
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

def exchange_code_for_tokens(code):
    data = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI
    }).encode("utf-8")

    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    global server_instance
    if not CLIENT_ID or not CLIENT_SECRET:
        print("ERROR: GSC_CLIENT_ID или GSC_CLIENT_SECRET не найдены в .env.ai", flush=True)
        return

    url = generate_auth_url()
    print("AUTH_URL_START", flush=True)
    print(url, flush=True)
    print("AUTH_URL_END", flush=True)

    server_instance = HTTPServer(("localhost", PORT), OAuthHandler)
    server_instance.serve_forever()

    if auth_code:
        print("Код получен! Обмениваем на токены...", flush=True)
        tokens = exchange_code_for_tokens(auth_code)
        tokens_data = {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": tokens.get("refresh_token"),
            "access_token": tokens.get("access_token"),
            "expires_in": tokens.get("expires_in"),
            "scope": tokens.get("scope")
        }
        with open(TOKENS_FILE, "w", encoding="utf-8") as f:
            json.dump(tokens_data, f, indent=2)
        print("SUCCESS_SAVED_TOKENS", flush=True)
    else:
        print("Авторизация не завершена.", flush=True)

if __name__ == "__main__":
    main()
