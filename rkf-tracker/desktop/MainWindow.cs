using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace CoursingStats.RkfTracker
{
    public class MainWindow : Form
    {
        private readonly WebView2 webView;
        private readonly string startUrl;
        private bool isForceExit;
        private readonly bool startsMinimized;
        private bool isWebLoginActive;

        public MainWindow(string url, string iconPath, bool isMinimized = false)
        {
            this.startUrl = url;
            this.startsMinimized = isMinimized;
            this.Text = "CoursingStats • RKF Tracker";
            this.Size = new Size(1100, 720);
            this.MinimumSize = new Size(850, 550);
            this.StartPosition = FormStartPosition.CenterScreen;

            if (File.Exists(iconPath))
            {
                try { this.Icon = new Icon(iconPath); } catch { }
            }

            webView = new WebView2 { Dock = DockStyle.Fill };
            this.Controls.Add(webView);

            InitializeWebView();
        }

        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            if (startsMinimized)
            {
                this.Hide();
            }
        }

        private async void InitializeWebView()
        {
            try
            {
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string userDataFolder = Path.Combine(localAppData, "CoursingStatsTracker", "WebViewProfile");

                var environment = await CoreWebView2Environment.CreateAsync(null, userDataFolder, null);
                await webView.EnsureCoreWebView2Async(environment);

                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
                webView.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled = false;
                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;

                webView.CoreWebView2.NavigationStarting += OnNavigationStarting;
                webView.CoreWebView2.NavigationCompleted += OnNavigationCompleted;
                webView.CoreWebView2.Navigate(startUrl);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Ошибка инициализации интерфейса WebView2:\n\n" + ex.Message,
                    "CoursingStats Tracker", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void OnNavigationStarting(object sender, CoreWebView2NavigationStartingEventArgs e)
        {
            string uri = e.Uri;
            if (string.IsNullOrEmpty(uri)) return;

            if (uri.StartsWith("http://127.0.0.1:") || uri.StartsWith("http://localhost:"))
            {
                if (isWebLoginActive && !uri.Contains("/api/desktop/auth/start-web-login"))
                {
                    isWebLoginActive = false;
                }
                return;
            }

            if (isWebLoginActive && (uri.StartsWith("https://rkf.online") || uri.StartsWith("https://my.rkf.online")))
            {
                return;
            }

            e.Cancel = true;
            try
            {
                Process.Start(new ProcessStartInfo(uri) { UseShellExecute = true });
            }
            catch { }
        }

        private async void OnNavigationCompleted(object sender, CoreWebView2NavigationCompletedEventArgs e)
        {
            if (!isWebLoginActive || webView == null || webView.CoreWebView2 == null) return;

            try
            {
                string res = await webView.ExecuteScriptAsync("localStorage.getItem('apikey')");
                if (!string.IsNullOrEmpty(res) && res != "null" && res != "\"\"")
                {
                    string token = res.Trim('"', ' ', '\r', '\n');
                    if (!string.IsNullOrEmpty(token))
                    {
                        CompleteWebLogin(token);
                        return;
                    }
                }

                string injectJs =
                    "(function() {" +
                    "  if (document.getElementById('cs-back-bar')) return;" +
                    "  const b = document.createElement('div');" +
                    "  b.id = 'cs-back-bar';" +
                    "  b.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:999999;background:#201202;color:#F9F6F0;padding:7px 12px;border-radius:20px;font-family:sans-serif;font-size:12px;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;cursor:pointer;';" +
                    "  b.innerHTML = '<span>CoursingStats</span><button style=\"background:#8B4513;color:#fff;border:none;padding:2px 8px;border-radius:10px;cursor:pointer;font-size:11px;\">« В трекер</button>';" +
                    "  b.onclick = function() { window.location.href = '" + startUrl + "'; };" +
                    "  document.body.appendChild(b);" +
                    "})();";
                await webView.ExecuteScriptAsync(injectJs);
            }
            catch { }
        }

        public void StartWebLogin()
        {
            if (this.InvokeRequired)
            {
                this.BeginInvoke(new Action(StartWebLogin));
                return;
            }
            isWebLoginActive = true;
            ShowAndActivate();
            if (webView != null && webView.CoreWebView2 != null)
            {
                webView.CoreWebView2.Navigate("https://rkf.online/login");
            }
        }

        private void CompleteWebLogin(string token)
        {
            isWebLoginActive = false;
            Program.SaveTokenFromWeb(token);
            string sep = startUrl.Contains("?") ? "&" : "?";
            string target = startUrl + sep + "token=" + Uri.EscapeDataString(token);
            webView.CoreWebView2.Navigate(target);
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (!isForceExit)
            {
                e.Cancel = true;
                this.Hide();
            }
            else
            {
                base.OnFormClosing(e);
            }
        }

        public void ShowAndActivate()
        {
            this.Show();
            if (this.WindowState == FormWindowState.Minimized)
            {
                this.WindowState = FormWindowState.Normal;
            }
            this.Activate();
            this.BringToFront();
        }

        public void ForceClose()
        {
            isForceExit = true;
            this.Close();
        }
    }
}
