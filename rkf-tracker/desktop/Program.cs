using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Threading;
using System.Windows.Forms;

namespace CoursingStats.RkfTracker
{
    static class Program
    {
        private static NotifyIcon trayIcon;
        private static LocalServer server;
        private static Poller poller;
        private static System.Threading.Timer pollTimer;
        private static int port = 4199;
        private static string baseDir;

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool createdNew;
            using (Mutex mutex = new Mutex(true, "Global\\CoursingStatsRkfTrackerMutex", out createdNew))
            {
                if (!createdNew)
                {
                    OpenDashboard();
                    return;
                }

                baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string webDir = Path.Combine(baseDir, "web");
                if (!Directory.Exists(webDir))
                {
                    webDir = Path.GetFullPath(Path.Combine(baseDir, "..", "web"));
                }

                poller = new Poller(baseDir);
                poller.StatusChanged += OnStatusChanged;

                server = new LocalServer(port, webDir, poller);
                server.Start();

                SetupTray();

                // Background poll every 60 minutes
                pollTimer = new System.Threading.Timer(_ => poller.PollOnce(), null, 5000, 3600000);

                bool isMinimized = args.Length > 0 && args[0].ToLowerInvariant().Contains("minimized");
                if (!isMinimized)
                {
                    OpenDashboard();
                }

                Application.Run();

                if (pollTimer != null) pollTimer.Dispose();
                if (server != null) server.Stop();
                if (trayIcon != null) trayIcon.Dispose();
            }
        }

        private static void SetupTray()
        {
            trayIcon = new NotifyIcon();
            trayIcon.Text = "CoursingStats • RKF Tracker";

            string icoPath = Path.Combine(baseDir, "app.ico");
            if (File.Exists(icoPath))
            {
                trayIcon.Icon = new Icon(icoPath);
            }
            else
            {
                trayIcon.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            }

            var menu = new ContextMenuStrip();

            var openItem = new ToolStripMenuItem("Открыть дашборд", null, (s, e) => OpenDashboard());
            openItem.Font = new Font(openItem.Font, FontStyle.Bold);
            menu.Items.Add(openItem);

            menu.Items.Add(new ToolStripMenuItem("Проверить сейчас", null, (s, e) =>
            {
                ThreadPool.QueueUserWorkItem(_ =>
                {
                    int changes = poller.PollOnce();
                    trayIcon.ShowBalloonTip(3000, "РКФ Трекер", string.Format("Проверка завершена. Изменений: {0}", changes), ToolTipIcon.Info);
                });
            }));

            var autostartItem = new ToolStripMenuItem("Автозагрузка с Windows", null, (s, e) =>
            {
                var item = (ToolStripMenuItem)s;
                bool next = !item.Checked;
                if (AutostartHelper.SetEnabled(next))
                {
                    item.Checked = next;
                }
            });
            autostartItem.Checked = AutostartHelper.IsEnabled();
            menu.Items.Add(autostartItem);

            menu.Items.Add(new ToolStripMenuItem("Настройки", null, (s, e) =>
            {
                string cfg = Path.Combine(baseDir, "config.json");
                if (!File.Exists(cfg)) cfg = Path.Combine(baseDir, "config.example.json");
                if (File.Exists(cfg)) Process.Start("notepad.exe", "\"" + cfg + "\"");
                else OpenDashboard();
            }));

            menu.Items.Add(new ToolStripSeparator());

            menu.Items.Add(new ToolStripMenuItem("Выход", null, (s, e) =>
            {
                trayIcon.Visible = false;
                Application.Exit();
            }));

            trayIcon.ContextMenuStrip = menu;
            trayIcon.DoubleClick += (s, e) => OpenDashboard();
            trayIcon.BalloonTipClicked += (s, e) => OpenDashboard();
            trayIcon.Visible = true;
        }

        private static void OnStatusChanged(string barcode, string oldStatus, string newStatus)
        {
            string msg = string.Format("Заявка №{0}:\n{1}", barcode, newStatus);
            trayIcon.ShowBalloonTip(6000, "РКФ: Изменение статуса", msg, ToolTipIcon.Info);
        }

        public static void OpenDashboard()
        {
            string url = string.Format("http://127.0.0.1:{0}/", port);
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "msedge.exe",
                    Arguments = string.Format("--app=\"{0}\" --window-size=1100,720", url),
                    UseShellExecute = true
                };
                Process.Start(psi);
            }
            catch
            {
                try { Process.Start(url); } catch { }
            }
        }
    }
}
