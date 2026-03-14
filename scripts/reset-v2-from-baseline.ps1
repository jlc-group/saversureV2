param(
    [string]$ContainerName = "saversure-postgres",
    [string]$ApiContainerName = "saversure-api",
    [string]$Database = "saversure",
    [string]$Username = "saversure_app",
    [string]$InputPath = (Join-Path $PSScriptRoot "..\backup\v2_dev_baseline.dump"),
    [switch]$RestartApi = $true,
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-FullPath {
    param([string]$PathValue)

    $resolved = Resolve-Path -LiteralPath $PathValue -ErrorAction SilentlyContinue
    if ($resolved) {
        return $resolved.Path
    }

    return [System.IO.Path]::GetFullPath($PathValue)
}

$finalInputPath = Resolve-FullPath -PathValue $InputPath
if (-not (Test-Path -LiteralPath $finalInputPath)) {
    throw "Baseline dump not found: $finalInputPath"
}

if (-not $Force) {
    $confirmation = Read-Host "This will replace database '$Database' from baseline. Type RESET to continue"
    if ($confirmation -ne "RESET") {
        throw "Reset cancelled by user."
    }
}

$repoRoot = Resolve-FullPath -PathValue (Join-Path $PSScriptRoot "..")
$tempDumpPath = "/tmp/v2_dev_baseline.dump"

Write-Host "Stopping API container to release DB connections..." -ForegroundColor Cyan
docker stop $ApiContainerName | Out-Null

Write-Host "Copying baseline dump into postgres container..." -ForegroundColor Cyan
docker cp $finalInputPath "${ContainerName}:${tempDumpPath}"

Write-Host "Terminating remaining connections to '$Database'..." -ForegroundColor Cyan
docker exec $ContainerName psql -U $Username -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$Database' AND pid <> pg_backend_pid();" | Out-Null

Write-Host "Recreating database '$Database'..." -ForegroundColor Cyan
docker exec $ContainerName psql -U $Username -d postgres -c "DROP DATABASE IF EXISTS $Database;"
docker exec $ContainerName psql -U $Username -d postgres -c "CREATE DATABASE $Database OWNER $Username;"

Write-Host "Restoring baseline dump..." -ForegroundColor Cyan
docker exec $ContainerName pg_restore `
    -U $Username `
    -d $Database `
    --no-owner `
    --role=$Username `
    $tempDumpPath

docker exec $ContainerName rm -f $tempDumpPath | Out-Null

if ($RestartApi) {
    Write-Host "Starting API container again..." -ForegroundColor Cyan
    Push-Location $repoRoot
    try {
        docker compose up -d api
    }
    finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "V2 baseline reset completed." -ForegroundColor Green
Write-Host "Next step: open Migration Center, run Dry Run, then Execute if the report looks correct."
