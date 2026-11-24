using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Web.Script.Serialization;

namespace CoursingStats.RkfTracker
{
    public class AuthResult
    {
        public bool ok { get; set; }
        public string apikey { get; set; }
        public string error { get; set; }
    }

    public static class AuthService
    {
        private static readonly JavaScriptSerializer json = new JavaScriptSerializer();

        public static AuthResult Authenticate(string email, string password)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                return new AuthResult { ok = false, error = "Укажите E-mail и пароль" };
            }

            try
            {
                string rkfAuthUrl = "https://rkf.online/api/Authentication";
                HttpWebRequest rkfReq = (HttpWebRequest)WebRequest.Create(rkfAuthUrl);
                rkfReq.Method = "POST";
                rkfReq.ContentType = "application/json";
                rkfReq.Accept = "application/json";
                rkfReq.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStats-Desktop/1.0";
                rkfReq.Timeout = 15000;

                byte[] payload = Encoding.UTF8.GetBytes(json.Serialize(new
                {
                    email = email.Trim(),
                    password = password.Trim(),
                    is_remember_me = true
                }));

                using (Stream os = rkfReq.GetRequestStream())
                {
                    os.Write(payload, 0, payload.Length);
                }

                using (HttpWebResponse rkfRes = (HttpWebResponse)rkfReq.GetResponse())
                using (StreamReader sr = new StreamReader(rkfRes.GetResponseStream(), Encoding.UTF8))
                {
                    string respTxt = sr.ReadToEnd();
                    var respData = json.Deserialize<Dictionary<string, object>>(respTxt);
                    string key = ExtractApiKey(respData);

                    if (!string.IsNullOrEmpty(key))
                    {
                        return new AuthResult { ok = true, apikey = key };
                    }
                    return new AuthResult { ok = false, error = "Не удалось извлечь ключ авторизации" };
                }
            }
            catch (WebException wex)
            {
                string errMsg = "Неверная почта или пароль";
                try
                {
                    if (wex.Response != null)
                    {
                        using (StreamReader sr = new StreamReader(wex.Response.GetResponseStream(), Encoding.UTF8))
                        {
                            var errData = json.Deserialize<Dictionary<string, object>>(sr.ReadToEnd());
                            if (errData != null && errData.ContainsKey("errors") && errData["errors"] is Dictionary<string, object>)
                            {
                                var ed = (Dictionary<string, object>)errData["errors"];
                                if (ed.ContainsKey("authentication")) errMsg = Convert.ToString(ed["authentication"]);
                            }
                        }
                    }
                }
                catch { }
                return new AuthResult { ok = false, error = errMsg };
            }
            catch (Exception ex)
            {
                return new AuthResult { ok = false, error = "Сетевая ошибка: " + ex.Message };
            }
        }

        private static string ExtractApiKey(Dictionary<string, object> data)
        {
            if (data == null) return string.Empty;
            if (data.ContainsKey("result") && data["result"] is Dictionary<string, object>)
            {
                var r = (Dictionary<string, object>)data["result"];
                if (r.ContainsKey("apikey")) return Convert.ToString(r["apikey"]);
            }
            if (data.ContainsKey("apikey")) return Convert.ToString(data["apikey"]);
            return string.Empty;
        }
    }
}
