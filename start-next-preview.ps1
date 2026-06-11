$ErrorActionPreference = "Stop"
$documents = Join-Path $env:USERPROFILE "Documents"
$mainSite = Get-ChildItem -LiteralPath $documents -Directory |
  Where-Object { $_.Name -like "cowinmagnet.com*" } |
  Select-Object -First 1

if (-not $mainSite) {
  throw "Cannot find main Cowinmagnet project under Documents."
}

$toolsDir = Join-Path $mainSite.FullName ".tools\node-v22.11.0-win-x64"
$npm = Join-Path $toolsDir "npm.cmd"
if (-not (Test-Path -LiteralPath $npm)) {
  throw "Cannot find bundled npm at $npm"
}

$env:PATH = "$toolsDir;" + $env:PATH
$env:PORT = "8092"
$env:ADMIN_EMAIL = "davidsha@cowinmagnet.com"
$env:ADMIN_DEFAULT_PASSWORD = "CowinLatam2026!"
Set-Location $PSScriptRoot
& $npm start
