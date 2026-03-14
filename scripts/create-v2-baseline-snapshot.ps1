param(
    [string]$ContainerName = "saversure-postgres",
    [string]$Database = "saversure",
    [string]$Username = "saversure_app",
    [string]$OutputPath = (Join-Path $PSScriptRoot "..\backup\v2_dev_baseline.dump")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-FullPath {
    param([string]$PathValue)

    $resolved = Resolve-Path -LiteralPath $PathValue -ErrorAction SilentlyContinue
    if ($resolved) {
        return $resolved.Path
    }

    $parent = Split-Path -Parent $PathValue
    if (-not [string]::IsNullOrWhiteSpace($parent) -and -not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    return [System.IO.Path]::GetFullPath($PathValue)
}

$finalOutputPath = Resolve-FullPath -PathValue $OutputPath
$tempDumpPath = "/tmp/v2_dev_baseline.dump"

Write-Host "Creating V2 baseline snapshot from database '$Database'..." -ForegroundColor Cyan
docker exec $ContainerName pg_dump `
    -U $Username `
    -d $Database `
    --format=custom `
    --no-owner `
    --clean `
    --if-exists `
    -f $tempDumpPath

docker cp "${ContainerName}:${tempDumpPath}" $finalOutputPath
docker exec $ContainerName rm -f $tempDumpPath | Out-Null

Write-Host "Baseline snapshot created:" -ForegroundColor Green
Write-Host "  $finalOutputPath"
Write-Host ""
Write-Host "Use this only after schema + seed data are ready and before importing V1 migration data." -ForegroundColor Yellow
