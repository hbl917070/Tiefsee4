param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$AppArgs
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$appPath = Join-Path $repoRoot "Tiefsee\bin\Debug\Tiefsee.exe"

if (-not (Test-Path -LiteralPath $appPath)) {
    throw "Debug apphost not found. Build with: dotnet build Tiefsee/Tiefsee.csproj --no-restore -p:UseAppHost=true"
}

$env:TIEFSEE_ENABLE_TEST_CDP = "1"
& $appPath @AppArgs
exit $LASTEXITCODE
