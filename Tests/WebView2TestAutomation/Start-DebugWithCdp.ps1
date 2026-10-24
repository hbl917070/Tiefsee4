param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$AppArgs
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$appPath = Join-Path $repoRoot "Tiefsee\bin\Debug\Tiefsee.exe"
$sourceWwwPath = Join-Path $repoRoot "Output\Www"
$debugWwwPath = Join-Path $repoRoot "Tiefsee\bin\Debug\Www"
$profilePath = Join-Path $repoRoot "Tiefsee\bin\Debug\WebView2TestProfile"
$activePortPath = Join-Path $profilePath "EBWebView\DevToolsActivePort"

if (-not (Test-Path -LiteralPath $appPath)) {
    throw "Debug apphost not found. Build with: dotnet build Tiefsee/Tiefsee.csproj --no-restore -p:UseAppHost=true"
}
if (-not (Test-Path -LiteralPath $sourceWwwPath)) {
    throw "Built WebView assets not found. Build the frontend from Www first. Expected: $sourceWwwPath"
}

$runningInstances = Get-Process -Name Tiefsee -ErrorAction SilentlyContinue
if ($runningInstances) {
    $processIds = ($runningInstances | ForEach-Object Id) -join ", "
    throw "Close all Tiefsee instances before starting the isolated test build. Running process IDs: $processIds"
}

# The frontend build writes to Output/Www, while the Debug apphost loads assets
# next to itself from bin/Debug/Www. Synchronize generated assets before launch.
New-Item -ItemType Directory -Path $debugWwwPath -Force | Out-Null
Copy-Item -Path (Join-Path $sourceWwwPath "*") -Destination $debugWwwPath -Recurse -Force

# The port file can survive an earlier WebView2 run. Remove it only after
# confirming there are no Tiefsee processes, so tests cannot target an old port.
if (Test-Path -LiteralPath $activePortPath) {
    Remove-Item -LiteralPath $activePortPath -Force
}

$startInfo = [System.Diagnostics.ProcessStartInfo]::new()
$startInfo.FileName = $appPath
$startInfo.WorkingDirectory = $repoRoot
$startInfo.UseShellExecute = $false
$startInfo.Environment["TIEFSEE_ENABLE_TEST_CDP"] = "1"
$startInfo.Environment["WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS"] = "--remote-debugging-port=0"
foreach ($argument in $AppArgs) {
    $startInfo.ArgumentList.Add($argument)
}

$process = [System.Diagnostics.Process]::Start($startInfo)
if (-not $process) {
    throw "Failed to start the isolated Debug Tiefsee process."
}

$deadline = [DateTime]::UtcNow.AddSeconds(30)
$lastError = "DevToolsActivePort has not been created."
while ([DateTime]::UtcNow -lt $deadline) {
    $process.Refresh()
    if ($process.HasExited) {
        throw "Debug Tiefsee exited before WebView2 CDP became ready (exit code $($process.ExitCode))."
    }

    if (Test-Path -LiteralPath $activePortPath) {
        try {
            $port = (Get-Content -LiteralPath $activePortPath -TotalCount 1).Trim()
            if ($port -notmatch '^\d+$') {
                throw "Invalid DevTools port: $port"
            }

            $version = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/version" -TimeoutSec 1
            if ($version.webSocketDebuggerUrl) {
                Write-Output "Debug Tiefsee is ready (PID $($process.Id), CDP port $port)."
                exit 0
            }
            $lastError = "The CDP version endpoint did not return a WebSocket URL."
        }
        catch {
            $lastError = $_.Exception.Message
        }
    }

    Start-Sleep -Milliseconds 250
}

$process.Refresh()
if (-not $process.HasExited) {
    Stop-Process -Id $process.Id -Force
}
if (Test-Path -LiteralPath $activePortPath) {
    Remove-Item -LiteralPath $activePortPath -Force
}
throw "WebView2 CDP did not become ready within 30 seconds. $lastError"
