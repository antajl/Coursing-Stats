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

            if (uri.StartsWith("http://127.0.0.1:") || uri.StartsWith("http://localhost:") || uri.StartsWith("https://tracker.local/"))
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
