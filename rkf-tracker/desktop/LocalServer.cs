using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

namespace CoursingStats.RkfTracker
{
    public class LocalServer
    {
        private readonly HttpListener listener = new HttpListener();
        private readonly string webDir;
        private readonly Poller poller;
        private readonly int port;
        private Thread serverThread;
        private volatile bool isRunning;
        private readonly JavaScriptSerializer json = new JavaScriptSerializer();

        public LocalServer(int port, string webDirectory, Poller pollerInstance)
        {
            this.port = port;
            this.webDir = webDirectory;
            this.poller = pollerInstance;
            listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
            listener.Prefixes.Add(string.Format("http://localhost:{0}/", port));
        }

        public void Start()
        {
            try
            {
                listener.Start();
                isRunning = true;
                serverThread = new Thread(ListenLoop) { IsBackground = true };
                serverThread.Start();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Ошибка запуска сервера: " + ex.Message);
            }
        }

        public void Stop()
        {
            isRunning = false;
            try { listener.Stop(); } catch { }
        }

        private void ListenLoop()
        {
            while (isRunning && listener.IsListening)
            {
                try
                {
                    var ctx = listener.GetContext();
                    ThreadPool.QueueUserWorkItem(_ =>
                    {
                        try
                        {
                            ProcessRequest(ctx);
                        }
                        catch
                        {
                            try { ctx.Response.Close(); } catch { }
                        }
                    });
                }
                catch { break; }
            }
        }

        private void ProcessRequest(HttpListenerContext ctx)
        {
            var req = ctx.Request;
            var res = ctx.Response;
            string origin = req.Headers["Origin"];
            if (!string.IsNullOrEmpty(origin) && (origin.StartsWith("http://127.0.0.1") || origin.StartsWith("http://localhost")))
            {
                res.Headers["Access-Control-Allow-Origin"] = origin;
            }
            else
            {
                res.Headers["Access-Control-Allow-Origin"] = string.Format("http://127.0.0.1:{0}", port);
            }
            res.Headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
            res.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";

            if (req.HttpMethod == "OPTIONS")
            {
                res.StatusCode = 204;
                res.Close();
                return;
            }

            string path = req.Url.AbsolutePath;

            if (path.StartsWith("/api/rkf/"))
            {
                ProxyRkfApi(ctx);
                return;
            }

            if (path == "/api/desktop/status") { SendJson(res, new { ok = true, autostart = AutostartHelper.IsEnabled() }); return; }
            if (path == "/api/desktop/show") { Program.OpenDashboard(); SendJson(res, new { ok = true }); return; }
            if (path == "/api/desktop/check-now") { SendJson(res, new { ok = true, changes = poller.PollOnce() }); return; }
            if (path == "/api/desktop/test-notification") { Program.ShowTestNotification(); SendJson(res, new { ok = true }); return; }
            if (path == "/api/desktop/settings")
            {
                if (req.HttpMethod == "POST")
                {
                    var body = ParseJsonBody(req);
                    if (body != null)
                    {
                        if (body.ContainsKey("interval"))
                        {
                            int interval = Convert.ToInt32(body["interval"]);
                            poller.SaveIntervalMinutes(interval);
                            Program.SetPollInterval(interval);
                        }
                        if (body.ContainsKey("autostart"))
                        {
                            bool autostart = Convert.ToBoolean(body["autostart"]);
                            AutostartHelper.SetEnabled(autostart);
                        }
                    }
                    SendJson(res, new { ok = true });
                }
                else
                {
                    SendJson(res, new {
                        ok = true,
                        interval = poller.GetIntervalMinutes(),
                        autostart = AutostartHelper.IsEnabled(),
                        notifications = true
                    });
                }
                return;
            }
            if (path == "/api/desktop/auth/logout") { poller.SaveToken(string.Empty); SendJson(res, new { ok = true }); return; }
            if (path == "/api/desktop/auth/start-web-login") { Program.StartWebLogin(); SendJson(res, new { ok = true }); return; }

            if (path == "/api/desktop/auth/poll-web-login")
            {
                if (!string.IsNullOrEmpty(Program.LastWebLoginToken))
                {
                    string token = Program.LastWebLoginToken;
                    Program.LastWebLoginToken = null;
                    SendJson(res, new { ok = true, status = "success", token = token });
                }
                else if (Program.IsWebLoginCanceled)
                {
                    Program.IsWebLoginCanceled = false;
                    SendJson(res, new { ok = false, status = "canceled" });
                }
                else
                {
                    SendJson(res, new { ok = true, status = Program.IsWebLoginActive ? "active" : "idle" });
                }
                return;
            }

            if (path == "/api/desktop/telegram/bind-url")
            {
                string rkfToken = poller.GetToken();
                if (string.IsNullOrEmpty(rkfToken))
                {
                    SendJson(res, new { ok = false, error = "Сначала войдите в РКФ Онлайн" }, 401);
                    return;
                }
                try
                {
                    var ticketReq = (HttpWebRequest)WebRequest.Create("https://coursing-stats-tracker-bot.antajltube.workers.dev/api/auth/ticket");
                    ticketReq.Method = "POST";
                    ticketReq.ContentType = "application/json";
                    ticketReq.Timeout = 10000;
                    byte[] payload = Encoding.UTF8.GetBytes(json.Serialize(new { apikey = rkfToken }));
                    using (var os = ticketReq.GetRequestStream()) os.Write(payload, 0, payload.Length);
                    using (var ticketRes = (HttpWebResponse)ticketReq.GetResponse())
                    using (var sr = new StreamReader(ticketRes.GetResponseStream(), Encoding.UTF8))
                    {
                        var data = json.Deserialize<Dictionary<string, object>>(sr.ReadToEnd());
                        if (data != null && data.ContainsKey("botUrl"))
                        {
                            string botUrl = Convert.ToString(data["botUrl"]);
                            string ticket = data.ContainsKey("ticket") ? Convert.ToString(data["ticket"]) : "";
                            poller.SaveTelegramTicket(ticket);
                            try { Process.Start(new ProcessStartInfo(botUrl) { UseShellExecute = true }); } catch { }
                            SendJson(res, new { ok = true, ticket = ticket, url = botUrl });
                            return;
                        }
                    }
                }
                catch { }
                SendJson(res, new { ok = false, error = "Не удалось создать ссылку привязки Telegram" }, 502);
                return;
            }

            if (path == "/api/desktop/open-external")
            {
                string target = req.QueryString["url"];
                if (!string.IsNullOrEmpty(target) && (target.StartsWith("http://") || target.StartsWith("https://")))
                {
                    try { System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(target) { UseShellExecute = true }); } catch { }
                }
                SendJson(res, new { ok = true });
                return;
            }

            if (path == "/api/desktop/auth/login" && req.HttpMethod == "POST")
            {
                var body = ParseJsonBody(req);
                string email = body != null && body.ContainsKey("email") ? Convert.ToString(body["email"]) : "";
                string password = body != null && body.ContainsKey("password") ? Convert.ToString(body["password"]) : "";
                var authRes = AuthService.Authenticate(email, password);
                if (authRes.ok) poller.SaveToken(authRes.apikey);
                SendJson(res, authRes, authRes.ok ? 200 : 422);
                return;
            }

            if (path == "/api/desktop/auth/save-token" && req.HttpMethod == "POST")
            {
                var body = ParseJsonBody(req);
                string token = body != null && body.ContainsKey("token") ? Convert.ToString(body["token"]).Trim() : "";
                if (!string.IsNullOrEmpty(token)) { poller.SaveToken(token); SendJson(res, new { ok = true }); }
                else { SendJson(res, new { ok = false, error = "Токен не может быть пустым" }, 400); }
                return;
            }

            ServeStatic(ctx, path);
        }

        private void ProxyRkfApi(HttpListenerContext ctx)
        {
            var req = ctx.Request;
            var res = ctx.Response;
            string targetPath = req.Url.PathAndQuery.Replace("/api/rkf/", "/api/");
            string targetUrl = "https://rkf.online" + targetPath;

            try
            {
                HttpWebRequest proxyReq = (HttpWebRequest)WebRequest.Create(targetUrl);
                proxyReq.Method = req.HttpMethod;
                proxyReq.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStats-Proxy/1.0";
                proxyReq.Accept = "application/json";

                string auth = req.Headers["Authorization"];
                if (string.IsNullOrEmpty(auth))
                {
                    string token = poller.GetToken();
                    if (!string.IsNullOrEmpty(token)) auth = "Bearer " + token;
                }
                if (!string.IsNullOrEmpty(auth)) proxyReq.Headers["Authorization"] = auth;

                using (HttpWebResponse proxyRes = (HttpWebResponse)proxyReq.GetResponse())
                {
                    res.StatusCode = (int)proxyRes.StatusCode;
                    res.ContentType = proxyRes.ContentType;
                    using (Stream sIn = proxyRes.GetResponseStream())
                    {
                        sIn.CopyTo(res.OutputStream);
                    }
                }
            }
            catch (WebException wex)
            {
                HttpWebResponse wr = wex.Response as HttpWebResponse;
                res.StatusCode = wr != null ? (int)wr.StatusCode : 502;
                byte[] b = Encoding.UTF8.GetBytes(json.Serialize(new { error = wex.Message }));
                res.ContentType = "application/json";
                res.OutputStream.Write(b, 0, b.Length);
            }
            catch (Exception ex)
            {
                res.StatusCode = 500;
                byte[] b = Encoding.UTF8.GetBytes(json.Serialize(new { error = ex.Message }));
                res.ContentType = "application/json";
                res.OutputStream.Write(b, 0, b.Length);
            }
            finally { res.Close(); }
        }

        private void ServeStatic(HttpListenerContext ctx, string path)
        {
            var res = ctx.Response;
            try
            {
                if (path == "/" || string.IsNullOrEmpty(path)) path = "/index.html";

                string relPath = path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                string rootFull = Path.GetFullPath(webDir);
                string fullPath = Path.GetFullPath(Path.Combine(rootFull, relPath));

                if (!fullPath.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase) || !File.Exists(fullPath))
                {
                    res.StatusCode = File.Exists(fullPath) ? 403 : 404;
                    byte[] b = Encoding.UTF8.GetBytes("Файл не найден");
                    res.OutputStream.Write(b, 0, b.Length);
                    return;
                }

                res.ContentType = GetMimeType(Path.GetExtension(fullPath));
                using (FileStream fs = File.OpenRead(fullPath))
                {
                    fs.CopyTo(res.OutputStream);
                }
            }
            catch { }
            finally
            {
                try { res.Close(); } catch { }
            }
        }

        private string GetMimeType(string ext)
        {
            switch (ext.ToLowerInvariant())
            {
                case ".html": return "text/html; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".svg": return "image/svg+xml";
                case ".png": return "image/png";
                case ".webp": return "image/webp";
                case ".ico": return "image/x-icon";
                default: return "application/octet-stream";
            }
        }

        private void SendJson(HttpListenerResponse res, object data, int statusCode = 200)
        {
            try
            {
                res.StatusCode = statusCode;
                byte[] b = Encoding.UTF8.GetBytes(json.Serialize(data));
                res.ContentType = "application/json; charset=utf-8";
                res.OutputStream.Write(b, 0, b.Length);
            }
            catch { }
            finally
            {
                try { res.Close(); } catch { }
            }
        }

        private Dictionary<string, object> ParseJsonBody(HttpListenerRequest req)
        {
            try
            {
                using (var sr = new StreamReader(req.InputStream, req.ContentEncoding ?? Encoding.UTF8))
                {
                    return json.Deserialize<Dictionary<string, object>>(sr.ReadToEnd());
                }
            }
            catch { return new Dictionary<string, object>(); }
        }
    }
}
