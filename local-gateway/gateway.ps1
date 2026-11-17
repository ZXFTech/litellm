param([ValidateSet('start', 'stop', 'status', 'verify', 'logs')][string]$Action = 'start')

$ErrorActionPreference = 'Stop'
$gatewayRoot = $PSScriptRoot
$envPath = Join-Path $gatewayRoot '.env'
$lanComposePath = Join-Path $gatewayRoot '.local/compose.lan.yaml'
$composeFiles = @('--file', (Join-Path $gatewayRoot 'compose.yaml'))
if (Test-Path -LiteralPath $lanComposePath -PathType Leaf) {
  $composeFiles += @('--file', $lanComposePath)
}

function Invoke-GatewayCompose([string[]]$CommandArgs) {
  & docker compose --project-directory $gatewayRoot @composeFiles @CommandArgs
  if ($LASTEXITCODE -ne 0) { throw 'Docker Compose command failed. Check Docker Desktop and gateway status.' }
}

function New-GatewaySecret {
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  return -join ($bytes | ForEach-Object { $_.ToString('x2') })
}

if ($Action -eq 'start' -and !(Test-Path -LiteralPath $envPath)) {
  $existingVolumes = @(& docker volume ls --filter 'label=com.docker.compose.project=llm-gateway' --format '{{.Name}}')
  if ($LASTEXITCODE -ne 0) { throw 'Docker Desktop must be running before initialization.' }
  if ($existingVolumes.Count -gt 0) { throw 'Existing gateway data found. Restore the original .env instead of generating replacement secrets.' }
  $dbPassword = New-GatewaySecret
  $masterKey = 'sk-' + (New-GatewaySecret)
  $saltKey = 'sk-' + (New-GatewaySecret)
  $uiPassword = New-GatewaySecret
  $envText = "POSTGRES_PASSWORD=$dbPassword`nLITELLM_MASTER_KEY=$masterKey`nLITELLM_SALT_KEY=$saltKey`nUI_PASSWORD=$uiPassword`n"
  [System.IO.File]::WriteAllText($envPath, $envText, (New-Object System.Text.UTF8Encoding($false)))
  $privateDir = Join-Path $gatewayRoot '.local'
  [System.IO.Directory]::CreateDirectory($privateDir) | Out-Null
  $loginText = "URL: http://127.0.0.1:4000/ui/`nUsername: admin`nPassword: $uiPassword`n"
  [System.IO.File]::WriteAllText((Join-Path $privateDir 'admin-login.txt'), $loginText, (New-Object System.Text.UTF8Encoding($false)))
  Write-Output 'Created private .env and .local/admin-login.txt. Keep both private and preserve the encryption salt.'
}

if (!(Test-Path -LiteralPath $envPath)) { throw 'Missing .env. Run gateway.ps1 start for a fresh installation or restore the original .env.' }
Invoke-GatewayCompose -CommandArgs @('config', '--quiet')

switch ($Action) {
  'start' { Invoke-GatewayCompose -CommandArgs @('up', '-d', '--wait', '--wait-timeout', '240') }
  'stop' { Invoke-GatewayCompose -CommandArgs @('stop') }
  'status' { Invoke-GatewayCompose -CommandArgs @('ps') }
  'logs' { Invoke-GatewayCompose -CommandArgs @('logs', '--tail', '100') }
  'verify' {
    $ready = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/health/readiness' -TimeoutSec 15
    if ($ready.status -ne 'healthy' -or $ready.db -ne 'connected') { throw 'Gateway or database is not ready.' }
    $live = Invoke-WebRequest -Uri 'http://127.0.0.1:4000/health/liveliness' -UseBasicParsing -TimeoutSec 15
    $ui = Invoke-WebRequest -Uri 'http://127.0.0.1:4000/ui/' -UseBasicParsing -TimeoutSec 15
    $keyLine = Get-Content -LiteralPath $envPath | Where-Object { $_.StartsWith('LITELLM_MASTER_KEY=') } | Select-Object -First 1
    if (!$keyLine) { throw 'Master key is missing from .env.' }
    $keyValue = $keyLine.Substring('LITELLM_MASTER_KEY='.Length)
    $models = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/v1/models' -Headers @{ Authorization = "Bearer $keyValue" } -TimeoutSec 15
    [PSCustomObject]@{ readiness = $ready.status; database = $ready.db; liveness = $live.StatusCode; ui = $ui.StatusCode; configuredModels = @($models.data).Count; providerCalls = 'not performed' } | ConvertTo-Json
  }
}
