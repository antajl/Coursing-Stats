using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace CoursingStats.RkfTracker
{
    public class LoginWindow : Form
    {
        private readonly WebView2 webView;
        private readonly Timer pollTimer;
        private string capturedToken;
        private bool isCompleted;

        public string CapturedToken { get { return capturedToken; } }

        public LoginWindow(string iconPath)
        {
            this.Text = "Вход в РКФ Онлайн";
            this.Size = new Size(540, 700);
            this.MinimumSize = new Size(420, 500);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.Sizable;

            if (File.Exists(iconPath))
            {
                try { this.Icon = new Icon(iconPath); } catch { }
            }

            webView = new WebView2 { Dock = DockStyle.Fill };
            this.Controls.Add(webView);

            pollTimer = new Timer { Interval = 600 };
            pollTimer.Tick += async (s, e) => await CheckTokenAsync();

            InitializeWebViewAsync();
        }

        private async void InitializeWebViewAsync()
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
                webView.CoreWebView2.NavigationCompleted += async (s, e) => await CheckTokenAsync();

                webView.CoreWebView2.Navigate("https://rkf.online/auth/login");
                pollTimer.Start();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Ошибка инициализации окна авторизации:\n\n" + ex.Message,
                    "CoursingStats Tracker", MessageBoxButtons.OK, MessageBoxIcon.Error);
                this.Close();
            }
        }

        private void OnNavigationStarting(object sender, CoreWebView2NavigationStartingEventArgs e)
        {
            string uri = e.Uri;
            if (string.IsNullOrEmpty(uri)) return;

            if (uri.StartsWith("https://rkf.online") || uri.StartsWith("https://my.rkf.online"))
            {
                return;
            }

            e.Cancel = true;
            try { Process.Start(new ProcessStartInfo(uri) { UseShellExecute = true }); } catch { }
        }

        private async System.Threading.Tasks.Task CheckTokenAsync()
        {
            if (isCompleted || webView == null || webView.CoreWebView2 == null) return;

            try
            {
                string res = await webView.ExecuteScriptAsync("localStorage.getItem('apikey')");
                if (!string.IsNullOrEmpty(res) && res != "null" && res != "\"\"")
                {
                    string token = res.Trim('"', ' ', '\r', '\n');
                    if (!string.IsNullOrEmpty(token) && token.Length > 8)
                    {
                        isCompleted = true;
                        pollTimer.Stop();
                        capturedToken = token;
                        Program.OnWebLoginCompleted(token);
                        this.DialogResult = DialogResult.OK;
                        this.Close();
                    }
                }
            }
            catch { }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (pollTimer != null)
            {
                pollTimer.Stop();
                pollTimer.Dispose();
            }

            if (!isCompleted && string.IsNullOrEmpty(capturedToken))
            {
                Program.OnWebLoginCanceled();
            }

            base.OnFormClosing(e);
        }
    }
}
