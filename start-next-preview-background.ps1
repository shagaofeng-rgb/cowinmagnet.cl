$ErrorActionPreference = "Stop"

$script = Join-Path $PSScriptRoot "start-next-preview.ps1"
$dataDir = Join-Path $PSScriptRoot ".data"
$out = Join-Path $dataDir "next-preview.out.log"
$err = Join-Path $dataDir "next-preview.err.log"

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
Remove-Item -LiteralPath $out, $err -Force -ErrorAction SilentlyContinue

$existing = Get-NetTCPConnection -LocalPort 8092 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $existing) {
  Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

Start-Process -FilePath powershell.exe `
  -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$script`"") `
  -RedirectStandardOutput $out `
  -RedirectStandardError $err `
  -WindowStyle Hidden

Start-Sleep -Seconds 5

$listener = Get-NetTCPConnection -LocalPort 8092 -ErrorAction SilentlyContinue |
  Where-Object { $_.State -eq "Listen" } |
  Select-Object -First 1

if (-not $listener) {
  Write-Host "Preview failed to start. STDERR:"
  Get-Content -Raw -LiteralPath $err -ErrorAction SilentlyContinue
  exit 1
}

Write-Host "Next preview is running at http://localhost:8092"
