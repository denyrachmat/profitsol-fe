<#
.SYNOPSIS
    Build the Quasar SPA (stx-new-portal-apps) and deploy it to the portal_v2 web share.

.DESCRIPTION
    Runs `quasar build`, then robocopy-copies dist\spa to the destination share.
    The copy is a safe merge (/E): it updates/overwrites built files but does NOT
    delete extra files on the destination (e.g. .htaccess, service-worker.js,
    backup folders).

.PARAMETER Target
    Destination UNC path. Default: \\192.168.100.32\website\portal_v2

.PARAMETER CleanAssets
    Delete the destination 'assets' folder before copying. Use this to avoid
    stale hashed asset files accumulating over many deploys. Safe because the
    new index.html only references assets from this build.

.PARAMETER SkipBuild
    Do not run the build; only deploy the existing dist\spa.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\deploy-portal-v2.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\deploy-portal-v2.ps1 -CleanAssets
#>
[CmdletBinding()]
param(
    [string]$Target = '\\192.168.100.32\website\portal_v2',
    [switch]$CleanAssets,
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $repoRoot 'dist\spa'

Push-Location -LiteralPath $repoRoot
try {
    # 1) Build
    if ($SkipBuild) {
        Write-Host '==> Skipping build (-SkipBuild)' -ForegroundColor Yellow
    } else {
        Write-Host '==> Building (npx quasar build)...' -ForegroundColor Cyan
        & npx quasar build
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE. Nothing was deployed."
        }
    }

    if (-not (Test-Path -LiteralPath $dist)) {
        throw "Build output not found: $dist"
    }

    # 2) Check destination
    if (-not (Test-Path -LiteralPath $Target)) {
        throw "Destination not reachable: $Target"
    }

    $stamp = Get-Date -Format 'yyyyMMdd_HHmmss'

    # 3) Back up current index.html for rollback reference
    $remoteIndex = Join-Path $Target 'index.html'
    if (Test-Path -LiteralPath $remoteIndex) {
        $backupIndex = Join-Path $Target "index.$stamp.bak.html"
        Copy-Item -LiteralPath $remoteIndex -Destination $backupIndex -Force
        Write-Host "==> Backed up index.html -> $(Split-Path -Leaf $backupIndex)" -ForegroundColor DarkGray
    }

    # 4) Optionally purge remote assets (avoids stale hashed files)
    if ($CleanAssets) {
        $remoteAssets = Join-Path $Target 'assets'
        if (Test-Path -LiteralPath $remoteAssets) {
            Write-Host '==> Removing remote assets folder (-CleanAssets)...' -ForegroundColor Yellow
            Remove-Item -LiteralPath $remoteAssets -Recurse -Force
        }
    }

    # 5) Copy (safe merge, no /MIR so destination-only files are kept)
    Write-Host "==> Deploying $dist -> $Target" -ForegroundColor Cyan
    $log = Join-Path $env:TEMP "portal_v2_deploy_$stamp.log"
    robocopy $dist $Target /E /R:2 /W:2 /NP /NFL /NDL /LOG:$log | Out-Null

    # robocopy: 0-7 = success (1 = files copied), >= 8 = error
    if ($LASTEXITCODE -ge 8) {
        Write-Host "Robocopy failed (exit code $LASTEXITCODE). See log: $log" -ForegroundColor Red
        throw 'Deploy failed.'
    }

    Write-Host '==> Deploy complete.' -ForegroundColor Green
    Write-Host "    Destination: $Target"
    Write-Host "    Robocopy log: $log"
}
finally {
    Pop-Location
}
