using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;

namespace CoursingStats.RkfTracker
{
    public class Poller
    {
        private readonly string baseDir;
        private readonly JavaScriptSerializer json = new JavaScriptSerializer();

        public event Action<string, string, string> StatusChanged;
        public event Action<string> LogMessage;

        public Poller(string baseDirectory)
        {
            baseDir = baseDirectory;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11;
        }

        public string GetToken()
        {
            string cfgPath = Path.Combine(baseDir, "config.json");
            if (!File.Exists(cfgPath))
            {
                cfgPath = Path.Combine(baseDir, "config.example.json");
            }
            if (File.Exists(cfgPath))
            {
                try
                {
                    string txt = File.ReadAllText(cfgPath, Encoding.UTF8);
                    var dict = json.Deserialize<Dictionary<string, object>>(txt);
                    if (dict != null && dict.ContainsKey("token"))
                    {
                        return Convert.ToString(dict["token"]);
                    }
                }
                catch { }
            }
            return string.Empty;
        }

        public void SaveToken(string token)
        {
            try
            {
                string cfgPath = Path.Combine(baseDir, "config.json");
                var dict = new Dictionary<string, object>();
                if (File.Exists(cfgPath))
                {
                    string txt = File.ReadAllText(cfgPath, Encoding.UTF8);
                    dict = json.Deserialize<Dictionary<string, object>>(txt) ?? new Dictionary<string, object>();
                }
                dict["token"] = token ?? string.Empty;
                File.WriteAllText(cfgPath, json.Serialize(dict), Encoding.UTF8);
            }
            catch { }
        }

        public void SaveTelegramTicket(string ticket)
        {
            try
            {
                string cfgPath = Path.Combine(baseDir, "config.json");
                var dict = new Dictionary<string, object>();
                if (File.Exists(cfgPath))
                {
                    string txt = File.ReadAllText(cfgPath, Encoding.UTF8);
                    dict = json.Deserialize<Dictionary<string, object>>(txt) ?? new Dictionary<string, object>();
                }
                dict["telegram_ticket"] = ticket ?? string.Empty;
                dict["telegram_ticket_created"] = DateTime.UtcNow.ToString("o");
                File.WriteAllText(cfgPath, json.Serialize(dict), Encoding.UTF8);
            }
            catch { }
        }

        public Dictionary<string, string> LoadState()
        {
            string p = Path.Combine(baseDir, "state.json");
            if (File.Exists(p))
            {
                try
                {
                    string txt = File.ReadAllText(p, Encoding.UTF8);
                    return json.Deserialize<Dictionary<string, string>>(txt) ?? new Dictionary<string, string>();
                }
                catch { }
            }
            return new Dictionary<string, string>();
        }

        public void SaveState(Dictionary<string, string> state)
        {
            try
            {
                string p = Path.Combine(baseDir, "state.json");
                string txt = json.Serialize(state);
                File.WriteAllText(p, txt, Encoding.UTF8);
            }
            catch (Exception ex)
            {
                Log("Ошибка сохранения state.json: " + ex.Message);
            }
        }

        public int PollOnce()
        {
            string token = GetToken();
            if (string.IsNullOrEmpty(token) || token.StartsWith("YOUR_"))
            {
                Log("Токен РКФ не настроен в config.json.");
                return 0;
            }

            Log("Запуск проверки статусов в RKF Online...");
            var oldState = LoadState();
            var newState = new Dictionary<string, string>(oldState);
            int changesCount = 0;

            try
            {
                var articles = FetchFeed(token, 6);
                var archive = FetchFeed(token, 9);
                articles.AddRange(archive);

                var seenBarcodes = new HashSet<string>();

                foreach (var art in articles)
                {
                    string content = (art.ContainsKey("content") ? Convert.ToString(art["content"]) : "") +
                                     (art.ContainsKey("title") ? Convert.ToString(art["title"]) : "");
                    string link = art.ContainsKey("redirect_link") ? Convert.ToString(art["redirect_link"]) : "";

                    string barcode = ExtractBarcode(content, link);
                    if (string.IsNullOrEmpty(barcode)) continue;

                    // Deduplicate: feeds are reverse-chronological (newest first).
                    // If we have already seen this barcode in the current poll, ignore older historical entries.
                    if (seenBarcodes.Contains(barcode)) continue;
                    seenBarcodes.Add(barcode);

                    string status = ExtractStatus(content);
                    if (string.IsNullOrEmpty(status)) continue;

                    if (!oldState.ContainsKey(barcode))
                    {
                        newState[barcode] = status;
                        // Never notify for historical, rejected, or completed applications discovered in archive.
                        // Only notify for fresh active applications when state is already initialized.
                        if (oldState.Count > 0 && status != "Отклонена" && status != "Аннулирована" && status != "Изготовлено")
                        {
                            changesCount++;
                            OnStatusChanged(barcode, "Новая заявка", status);
                        }
                    }
                    else if (oldState[barcode] != status)
                    {
                        string prev = oldState[barcode];
                        newState[barcode] = status;
                        changesCount++;
                        OnStatusChanged(barcode, prev, status);
                    }
                }

                SaveState(newState);
                Log(string.Format("Проверка завершена. Актуально заявок: {0}, изменений: {1}.", newState.Count, changesCount));
            }
            catch (Exception ex)
            {
                Log("Ошибка при обращении к API РКФ: " + ex.Message);
            }

            return changesCount;
        }

        private List<Dictionary<string, object>> FetchFeed(string token, int filterType)
        {
            var list = new List<Dictionary<string, object>>();
            int page = 1;
            while (page <= 150)
            {
                string url = string.Format("https://rkf.online/api/article/articles_feed?start_element={0}&size=50&filter_type={1}", page, filterType);
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
                req.Method = "GET";
                req.Headers["Authorization"] = "Bearer " + token;
                req.Accept = "application/json";
                req.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStats-Desktop/1.0";
                req.Timeout = 15000;

                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                using (StreamReader reader = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
                {
                    string jsonTxt = reader.ReadToEnd();
                    var resObj = json.Deserialize<Dictionary<string, object>>(jsonTxt);
                    if (resObj == null || !resObj.ContainsKey("result")) break;

                    var result = resObj["result"] as Dictionary<string, object>;
                    if (result == null || !result.ContainsKey("articles")) break;

                    var arr = result["articles"] as System.Collections.ArrayList;
                    if (arr == null || arr.Count == 0) break;

                    foreach (var item in arr)
                    {
                        Dictionary<string, object> d = item as Dictionary<string, object>;
                        if (d != null) list.Add(d);
                    }

                    int total = result.ContainsKey("articles_count") ? Convert.ToInt32(result["articles_count"]) : 0;
                    if (list.Count >= total) break;
                    page += arr.Count;
                }
            }
            return list;
        }

        private string ExtractBarcode(string content, string link)
        {
            var m = Regex.Match(content, @"№\s*(\d+)");
            if (m.Success) return m.Groups[1].Value;
            if (!string.IsNullOrEmpty(link))
            {
                var lm = Regex.Match(link, @"barcode=(\d+)");
                if (lm.Success) return lm.Groups[1].Value;
            }
            return null;
        }

        private string ExtractStatus(string content)
        {
            var m = Regex.Match(content, @"присвоен статус ""(.*?)""");
            if (m.Success) return m.Groups[1].Value;
            var m2 = Regex.Match(content, @"статус:?\s*""(.*?)""");
            if (m2.Success) return m2.Groups[1].Value;
            return null;
        }

        private void OnStatusChanged(string barcode, string oldStatus, string newStatus)
        {
            if (StatusChanged != null) StatusChanged(barcode, oldStatus, newStatus);
        }

        private void Log(string msg)
        {
            if (LogMessage != null) LogMessage(string.Format("[{0}] {1}", DateTime.Now.ToString("HH:mm:ss"), msg));
        }
    }
}
