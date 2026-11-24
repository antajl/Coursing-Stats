@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo [1/3] Locating C# compiler...
set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC%" (
    set CSC=C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe
)
if not exist "%CSC%" (
    echo Error: csc.exe not found on this Windows system.
    exit /b 1
)

echo [2/3] Compiling RkfTracker.exe with embedded WebView2...
"%CSC%" /nologo /target:winexe /platform:x64 /optimize+ /win32icon:app.ico /r:System.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.Web.Extensions.dll /r:lib\Microsoft.Web.WebView2.Core.dll /r:lib\Microsoft.Web.WebView2.WinForms.dll /out:RkfTracker.exe Program.cs MainWindow.cs LoginWindow.cs LocalServer.cs Poller.cs AutostartHelper.cs AuthService.cs

if %ERRORLEVEL% neq 0 (
    echo Compilation failed!
    exit /b %ERRORLEVEL%
)

echo [3/3] Preparing portable distribution in dist and desktop...
copy /y "lib\Microsoft.Web.WebView2.Core.dll" ".\" >nul
copy /y "lib\Microsoft.Web.WebView2.WinForms.dll" ".\" >nul
copy /y "lib\runtimes\win-x64\native\WebView2Loader.dll" ".\" >nul
if not exist "runtimes\win-x64\native" mkdir "runtimes\win-x64\native"
copy /y "lib\runtimes\win-x64\native\WebView2Loader.dll" "runtimes\win-x64\native\" >nul

if not exist "dist" mkdir "dist"
copy /y "RkfTracker.exe" "dist\" >nul
copy /y "app.ico" "dist\" >nul
copy /y "lib\Microsoft.Web.WebView2.Core.dll" "dist\" >nul
copy /y "lib\Microsoft.Web.WebView2.WinForms.dll" "dist\" >nul
copy /y "lib\runtimes\win-x64\native\WebView2Loader.dll" "dist\" >nul

if not exist "dist\runtimes\win-x64\native" mkdir "dist\runtimes\win-x64\native"
copy /y "lib\runtimes\win-x64\native\WebView2Loader.dll" "dist\runtimes\win-x64\native\" >nul

copy /y "config.example.json" "dist\" >nul
if exist "config.json" copy /y "config.json" "dist\" >nul
if not exist "dist\web" mkdir "dist\web"
xcopy /s /e /y "..\web\*" "dist\web\" >nul

echo Build successful: rkf-tracker\desktop\RkfTracker.exe
echo Portable release ready: rkf-tracker\desktop\dist\
