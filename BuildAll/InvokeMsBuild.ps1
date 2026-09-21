param(
    [Parameter(Mandatory = $true)]
    [string]$Project,

    [ValidateSet('Build', 'Rebuild', 'Publish')]
    [string]$Target = 'Build',

    [string]$Configuration = 'Release',

    [string]$Platform = 'x64',

    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

$vswherePath = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
if (-not (Test-Path -LiteralPath $vswherePath)) {
    throw "找不到 Visual Studio 安裝偵測工具：$vswherePath"
}

$installationPath = & $vswherePath -latest -products * -requires Microsoft.Component.MSBuild -property installationPath |
    Select-Object -First 1
if ([string]::IsNullOrWhiteSpace($installationPath)) {
    throw '找不到包含 MSBuild 的 Visual Studio 安裝。'
}

$msbuildPath = Join-Path $installationPath 'MSBuild\Current\Bin\MSBuild.exe'
if (-not (Test-Path -LiteralPath $msbuildPath)) {
    throw "找不到 MSBuild：$msbuildPath"
}

$arguments = @(
    $Project
    "/t:$Target"
    "/p:Configuration=$Configuration"
    "/p:Platform=$Platform"
    '/m'
    '/v:minimal'
)

if (-not [string]::IsNullOrWhiteSpace($OutputPath)) {
    $arguments += "/p:OutputPath=$OutputPath"
}

& $msbuildPath @arguments
exit $LASTEXITCODE
