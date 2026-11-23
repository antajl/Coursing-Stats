# CoursingStats • RKF Tracker Desktop Build Script
$ErrorActionPreference = "Stop"
$desktopDir = $PSScriptRoot

Write-Host "[1/3] Locating C# compiler..."
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) {
    $csc = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}
if (-not (Test-Path $csc)) {
    throw "Error: csc.exe not found on this system."
}

Write-Host "[2/3] Compiling RkfTracker.exe..."
$sources = @(
    (Join-Path $desktopDir "Program.cs"),
    (Join-Path $desktopDir "LocalServer.cs"),
    (Join-Path $desktopDir "Poller.cs"),
    (Join-Path $desktopDir "AutostartHelper.cs")
)
$exePath = Join-Path $desktopDir "RkfTracker.exe"
$icoPath = Join-Path $desktopDir "app.ico"

$refs = @(
    "/r:System.dll",
    "/r:System.Windows.Forms.dll",
    "/r:System.Drawing.dll",
    "/r:System.Web.Extensions.dll"
)

$argsList = @(
    "/nologo",
    "/target:winexe",
    "/optimize+",
    "/win32icon:$icoPath",
    "/out:$exePath"
) + $refs + $sources

& $csc $argsList
if ($LASTEXITCODE -ne 0) {
    throw "Compilation failed with exit code $LASTEXITCODE"
}

Write-Host "[3/3] Preparing portable distribution in dist..."
$distDir = Join-Path $desktopDir "dist"
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }

Copy-Item -Path $exePath -Destination $distDir -Force
Copy-Item -Path $icoPath -Destination $distDir -Force
Copy-Item -Path (Join-Path $desktopDir "config.example.json") -Destination $distDir -Force
if (Test-Path (Join-Path $desktopDir "config.json")) {
    Copy-Item -Path (Join-Path $desktopDir "config.json") -Destination $distDir -Force
}

$distWebDir = Join-Path $distDir "web"
if (-not (Test-Path $distWebDir)) { New-Item -ItemType Directory -Path $distWebDir | Out-Null }
Copy-Item -Path (Join-Path $desktopDir "..\web\*") -Destination $distWebDir -Recurse -Force

Write-Host "Build successful: $exePath"
Write-Host "Portable release ready: $distDir"
