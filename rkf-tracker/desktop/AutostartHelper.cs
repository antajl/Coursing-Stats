using System;
using System.IO;
using System.Windows.Forms;
using Microsoft.Win32;

namespace CoursingStats.RkfTracker
{
    public static class AutostartHelper
    {
        private const string RunKeyPath = @"Software\Microsoft\Windows\CurrentVersion\Run";
        private const string AppName = "CoursingStatsRkfTracker";

        public static bool IsEnabled()
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(RunKeyPath, false))
                {
                    if (key == null) return false;
                    object val = key.GetValue(AppName);
                    return val != null;
                }
            }
            catch
            {
                return false;
            }
        }

        public static bool SetEnabled(bool enable)
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(RunKeyPath, true))
                {
                    if (key == null) return false;
                    if (enable)
                    {
                        string exePath = Application.ExecutablePath;
                        string cmd = "\"" + exePath + "\" --minimized";
                        key.SetValue(AppName, cmd);
                    }
                    else
                    {
                        key.DeleteValue(AppName, false);
                    }
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
