using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace CoursingStats.RkfTracker
{
    static class Program
    {
        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool SetDllDirectory(string lpPathName);

        private static NotifyIcon trayIcon;
        private static LocalServer server;
        private static Poller poller;
        private static System.Threading.Timer pollTimer;
        private static MainWindow mainWindow;
        private static int port = 4199;
        private static string baseDir;

        private static Mutex appMutex;

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            AppDomain.CurrentDomain.AssemblyResolve += ResolveAssemblies;

            AppDomain.CurrentDomain.UnhandledException += (s, e) => {
                string msg = e.ExceptionObject != null ? e.ExceptionObject.ToString() : "Неизвестная ошибка";
                try { File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "crash.log"), msg); } catch { }
                MessageBox.Show("Ошибка запуска приложения:\n\n" + msg, "CoursingStats Tracker", MessageBoxButtons.OK, MessageBoxIcon.Error);
            };
            Application.ThreadException += (s, e) => {
                string msg = e.Exception != null ? e.Exception.ToString() : "Неизвестная ошибка";
                try { File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "crash.log"), msg); } catch { }
                MessageBox.Show("Ошибка приложения:\n\n" + msg, "CoursingStats Tracker", MessageBoxButtons.OK, MessageBoxIcon.Error);
            };

            bool createdNew;
            appMutex = new Mutex(true, "Local\\CoursingStatsRkfTrackerMutex", out createdNew);
            if (!createdNew)
            {
                try
                {
                    using (var wc = new WebClient())
                    {
                        wc.DownloadString(string.Format("http://127.0.0.1:{0}/api/desktop/show", port));
                    }
                }
                catch { }
                return;
            }

            RunApplication(args);
        }

        [MethodImpl(MethodImplOptions.NoInlining)]
        private static void RunApplication(string[] args)
        {
            try { File.AppendAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "debug_lifecycle.log"), "3. RunApplication entry\n"); } catch { }
            baseDir = AppDomain.CurrentDomain.BaseDirectory;

            // Direct native WebView2 loader resolution
            string[] loaderDirs = new string[]
            {
                baseDir,
                Path.Combine(baseDir, "runtimes", "win-x64", "native"),
                Path.Combine(baseDir, "lib", "runtimes", "win-x64", "native"),
                Path.Combine(baseDir, "dist", "runtimes", "win-x64", "native")
            };
            foreach (var lDir in loaderDirs)
            {
                if (File.Exists(Path.Combine(lDir, "WebView2Loader.dll")))
                {
                    try { SetDllDirectory(lDir); } catch { }
                    break;
                }
            }

            string webDir = Path.Combine(baseDir, "web");
            if (!Directory.Exists(webDir)) webDir = Path.Combine(baseDir, "dist", "web");
            if (!Directory.Exists(webDir)) webDir = Path.GetFullPath(Path.Combine(baseDir, "..", "web"));

            poller = new Poller(baseDir);
            poller.StatusChanged += OnStatusChanged;

            server = new LocalServer(port, webDir, poller);
            server.Start();

            string icoPath = Path.Combine(baseDir, "app.ico");
            string appUrl = string.Format("http://127.0.0.1:{0}/index.html", port);

            bool isMinimized = args.Length > 0 && args[0].ToLowerInvariant().Contains("minimized");
            mainWindow = new MainWindow(appUrl, icoPath, isMinimized);
            SetupTray();

            // Background poll every 60 minutes (safely wrapped)
            pollTimer = new System.Threading.Timer(_ => {
                try { poller.PollOnce(); } catch { }
            }, null, 5000, 3600000);

            if (!isMinimized)
            {
                mainWindow.ShowAndActivate();
            }

            Application.Run();

            if (pollTimer != null) pollTimer.Dispose();
            if (server != null) server.Stop();
            if (trayIcon != null) trayIcon.Dispose();
        }

        private static Assembly ResolveAssemblies(object sender, ResolveEventArgs args)
        {
            string shortName = args.Name.Split(',')[0].Trim();
            string dir = AppDomain.CurrentDomain.BaseDirectory;
            string[] candidates = new string[]
            {
                Path.Combine(dir, shortName + ".dll"),
                Path.Combine(dir, "lib", shortName + ".dll"),
                Path.Combine(dir, "dist", shortName + ".dll")
            };
            foreach (var path in candidates)
            {
                if (File.Exists(path))
                {
                    try { return Assembly.LoadFrom(path); } catch { }
                }
            }
            return null;
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
                if (mainWindow != null) mainWindow.ForceClose();
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
            try
            {
                string msg = string.Format("Заявка №{0}:\n{1}", barcode, newStatus);
                if (mainWindow != null && mainWindow.InvokeRequired)
                {
                    mainWindow.BeginInvoke(new Action(() =>
                    {
                        try { if (trayIcon != null) trayIcon.ShowBalloonTip(6000, "РКФ: Изменение статуса", msg, ToolTipIcon.Info); } catch { }
                    }));
                }
                else
                {
                    if (trayIcon != null) trayIcon.ShowBalloonTip(6000, "РКФ: Изменение статуса", msg, ToolTipIcon.Info);
                }
            }
            catch { }
        }

        public static void OpenDashboard()
        {
            if (mainWindow != null)
            {
                if (mainWindow.InvokeRequired)
                {
                    mainWindow.Invoke(new Action(() => mainWindow.ShowAndActivate()));
                }
                else
                {
                    mainWindow.ShowAndActivate();
                }
            }
        }

        public static void StartWebLogin()
        {
            if (mainWindow != null)
            {
                mainWindow.StartWebLogin();
            }
        }

        public static void SaveTokenFromWeb(string token)
        {
            if (poller != null)
            {
                poller.SaveToken(token);
            }
        }
    }
}
