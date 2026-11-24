# CoursingStats • RKF Tracker Desktop Build Script
$ErrorActionPreference = "Stop"
$desktopDir = $PSScriptRoot
Stop-Process -Name "RkfTracker" -Force -ErrorAction SilentlyContinue

Write-Host "[1/4] Checking dependencies..."
$libDir = Join-Path $desktopDir "lib"
$coreDll = Join-Path $libDir "Microsoft.Web.WebView2.Core.dll"
$wfDll = Join-Path $libDir "Microsoft.Web.WebView2.WinForms.dll"
$loaderDll = Join-Path $libDir "runtimes\win-x64\native\WebView2Loader.dll"

if (-not (Test-Path $coreDll) -or -not (Test-Path $wfDll) -or -not (Test-Path $loaderDll)) {
    Write-Host "Restoring Microsoft.Web.WebView2..."
    $nugetUrl = "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2903.40"
    $targetZip = Join-Path $desktopDir "wv2.zip"
    Invoke-WebRequest -Uri $nugetUrl -OutFile $targetZip -UseBasicParsing
    Expand-Archive -Path $targetZip -DestinationPath $libDir -Force
    Remove-Item $targetZip -Force

    Copy-Item (Join-Path $libDir "lib\net462\Microsoft.Web.WebView2.Core.dll") $coreDll -Force
    Copy-Item (Join-Path $libDir "lib\net462\Microsoft.Web.WebView2.WinForms.dll") $wfDll -Force
}

Write-Host "[2/4] Locating C# compiler..."
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) {
    $csc = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}
if (-not (Test-Path $csc)) {
    throw "Error: csc.exe not found on this system."
}

Write-Host "[3/4] Compiling RkfTracker.exe..."
$sources = @(
    (Join-Path $desktopDir "Program.cs"),
    (Join-Path $desktopDir "MainWindow.cs"),
    (Join-Path $desktopDir "LoginWindow.cs"),
    (Join-Path $desktopDir "LocalServer.cs"),
    (Join-Path $desktopDir "Poller.cs"),
    (Join-Path $desktopDir "AutostartHelper.cs"),
    (Join-Path $desktopDir "AuthService.cs")
)
$exePath = Join-Path $desktopDir "RkfTracker.exe"
$icoPath = Join-Path $desktopDir "app.ico"

$refs = @(
    "/r:System.dll",
    "/r:System.Windows.Forms.dll",
    "/r:System.Drawing.dll",
    "/r:System.Web.Extensions.dll",
    "/r:$coreDll",
    "/r:$wfDll"
)

$argsList = @(
    "/nologo",
    "/target:winexe",
    "/platform:x64",
    "/optimize+",
    "/win32icon:$icoPath",
    "/out:$exePath"
) + $refs + $sources

& $csc $argsList
if ($LASTEXITCODE -ne 0) {
    throw "Compilation failed with exit code $LASTEXITCODE"
}

Write-Host "[4/4] Preparing portable distribution in dist and desktop..."
Copy-Item -Path $coreDll -Destination $desktopDir -Force
Copy-Item -Path $wfDll -Destination $desktopDir -Force
Copy-Item -Path $loaderDll -Destination $desktopDir -Force
$desktopRuntimes = Join-Path $desktopDir "runtimes\win-x64\native"
if (-not (Test-Path $desktopRuntimes)) { New-Item -ItemType Directory -Path $desktopRuntimes | Out-Null }
Copy-Item -Path $loaderDll -Destination $desktopRuntimes -Force

$distDir = Join-Path $desktopDir "dist"
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }

Copy-Item -Path $exePath -Destination $distDir -Force
Copy-Item -Path $icoPath -Destination $distDir -Force
Copy-Item -Path $coreDll -Destination $distDir -Force
Copy-Item -Path $wfDll -Destination $distDir -Force
Copy-Item -Path $loaderDll -Destination $distDir -Force

$distRuntimes = Join-Path $distDir "runtimes\win-x64\native"
if (-not (Test-Path $distRuntimes)) { New-Item -ItemType Directory -Path $distRuntimes | Out-Null }
Copy-Item -Path $loaderDll -Destination $distRuntimes -Force

Copy-Item -Path (Join-Path $desktopDir "config.example.json") -Destination $distDir -Force
if (Test-Path (Join-Path $desktopDir "config.json")) {
    Copy-Item -Path (Join-Path $desktopDir "config.json") -Destination $distDir -Force
}

$distWebDir = Join-Path $distDir "web"
if (-not (Test-Path $distWebDir)) { New-Item -ItemType Directory -Path $distWebDir | Out-Null }
Copy-Item -Path (Join-Path $desktopDir "..\web\*") -Destination $distWebDir -Recurse -Force

Write-Host "Build successful: $exePath"
Write-Host "Portable release ready: $distDir"
