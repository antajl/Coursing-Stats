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

echo [2/3] Compiling RkfTracker.exe...
"%CSC%" /nologo /target:winexe /optimize+ /win32icon:app.ico /r:System.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.Web.Extensions.dll /out:RkfTracker.exe Program.cs LocalServer.cs Poller.cs AutostartHelper.cs

if %ERRORLEVEL% neq 0 (
    echo Compilation failed!
    exit /b %ERRORLEVEL%
)

echo [3/3] Preparing portable distribution in dist...
if not exist "dist" mkdir "dist"
copy /y "RkfTracker.exe" "dist\" >nul
copy /y "app.ico" "dist\" >nul
copy /y "config.example.json" "dist\" >nul
if exist "config.json" copy /y "config.json" "dist\" >nul
if not exist "dist\web" mkdir "dist\web"
xcopy /s /e /y "..\web\*" "dist\web\" >nul

echo Build successful: rkf-tracker\desktop\RkfTracker.exe
echo Portable release ready: rkf-tracker\desktop\dist\
