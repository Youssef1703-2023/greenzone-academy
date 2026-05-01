$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot

$env:XDG_DATA_HOME = Join-Path $root '.argos\data'
$env:XDG_CONFIG_HOME = Join-Path $root '.argos\config'
$env:XDG_CACHE_HOME = Join-Path $root '.argos\cache'
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'

New-Item -ItemType Directory -Force -Path $env:XDG_DATA_HOME | Out-Null
New-Item -ItemType Directory -Force -Path $env:XDG_CONFIG_HOME | Out-Null
New-Item -ItemType Directory -Force -Path $env:XDG_CACHE_HOME | Out-Null

$modelPackage = Join-Path $env:XDG_DATA_HOME 'argos-translate\packages\en_ar'
$updateArgs = @()

if (!(Test-Path $modelPackage)) {
  $updateArgs = @('--update-models')
}

& libretranslate `
  --host 127.0.0.1 `
  --port 5001 `
  --load-only en,ar `
  @updateArgs `
  --batch-limit -1 `
  --char-limit -1 `
  --req-limit -1 `
  --hourly-req-limit -1 `
  --daily-req-limit -1
