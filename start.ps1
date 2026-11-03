param([switch]$Production,[switch]$Install,[switch]$Lan,[int]$Port=3000)
$ErrorActionPreference='Stop'
Push-Location -LiteralPath $PSScriptRoot
try {
 if(-not(Get-Command node -ErrorAction SilentlyContinue)){throw 'Node.js is missing. Install Node.js 24 LTS, then reopen PowerShell.'}
 if(-not(Get-Command npm.cmd -ErrorAction SilentlyContinue)){throw 'npm.cmd is missing. Repair the Node.js installation.'}
 $taskNodeVersion=[version]((node --version).TrimStart('v'))
 if($taskNodeVersion.Major -ne 24){throw "This project uses built-in SQLite and requires Node.js 24 LTS. Found $taskNodeVersion."}
 $env:NEXT_TELEMETRY_DISABLED='1'
 if($Lan){$env:BM3122_HOST='0.0.0.0';$env:BM3122_ALLOW_LAN='true';Write-Host 'LAN enabled: use this computer private IPv4 address on trusted Wi-Fi only. All visitors share study data.'}
 if($Install -or -not(Test-Path -LiteralPath 'node_modules/next/package.json')){
  Write-Host 'Installing dependencies (first setup requires internet access)...' -ForegroundColor Cyan
  & npm.cmd ci
  if($LASTEXITCODE -ne 0){throw 'Dependency installation failed. Check internet access and retry with -Install.'}
 }
 & npm.cmd run assets
 if($LASTEXITCODE -ne 0){throw 'Offline PDF asset preparation failed.'}
 & npm.cmd run db:init
 if($LASTEXITCODE -ne 0){throw 'Database initialization failed. See the error above; existing data has not been reset.'}
 if(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue){throw "Port $Port is in use. Close the existing server, or use -Port 3001."}
 Write-Host "Starting BM3122 at http://localhost:$Port . Press Ctrl+C to stop." -ForegroundColor Green
 if($Production){
  & npm.cmd run build
  if($LASTEXITCODE -ne 0){throw 'Production build failed.'}
  & npm.cmd run start -- --port $Port
 }else{& npm.cmd run dev -- --port $Port}
 if($LASTEXITCODE -ne 0){throw 'The application stopped with an error. See the output above.'}
}finally{Pop-Location}
