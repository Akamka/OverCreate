$ErrorActionPreference = 'Stop'

$hostName = '127.0.0.1'
$port = 4010
$baseUrl = "http://${hostName}:$port"
$projectRoot = (Resolve-Path "$PSScriptRoot\..").Path

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )
  if (-not $Condition) {
    throw $Message
  }
}

function Get-Page {
  param(
    [string]$Path
  )
  return Invoke-WebRequest -Uri "$baseUrl$Path" -UseBasicParsing -TimeoutSec 30
}

$proc = $null
try {
  $proc = Start-Process -FilePath 'npm.cmd' `
    -ArgumentList 'run dev -- --port 4010 --hostname 127.0.0.1' `
    -WorkingDirectory $projectRoot `
    -PassThru `
    -WindowStyle Hidden

  $deadline = (Get-Date).AddMinutes(2)
  $ready = $false

  while ((Get-Date) -lt $deadline) {
    try {
      $readyResp = Invoke-WebRequest -Uri "$baseUrl/services" -UseBasicParsing -TimeoutSec 5
      if ($readyResp.StatusCode -ge 200) {
        $ready = $true
        break
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  Assert-True $ready "Dev server did not become ready within timeout"

  $paths = @(
    '/services',
    '/services/web',
    '/insights',
    '/privacy-policy',
    '/login',
    '/test-portfolio',
    '/robots.txt',
    '/sitemap.xml'
  )

  foreach ($path in $paths) {
    $resp = Get-Page -Path $path
    Assert-True ($resp.StatusCode -eq 200) "$path expected HTTP 200, got $($resp.StatusCode)"
  }

  $servicesHtml = (Get-Page -Path '/services').Content
  Assert-True ($servicesHtml -match 'rel="canonical"') '/services missing canonical tag'

  $insightsHtml = (Get-Page -Path '/insights').Content
  Assert-True ($insightsHtml -match 'rel="canonical"') '/insights missing canonical tag'

  $loginHtml = (Get-Page -Path '/login').Content
  Assert-True ($loginHtml -match '<meta[^>]+name="robots"[^>]+noindex') '/login should contain noindex robots meta'

  $testPortfolioHtml = (Get-Page -Path '/test-portfolio').Content
  Assert-True ($testPortfolioHtml -match '<meta[^>]+name="robots"[^>]+noindex') '/test-portfolio should contain noindex robots meta'

  $robotsTxt = (Get-Page -Path '/robots.txt').Content
  Assert-True ($robotsTxt -match 'Disallow: /test-portfolio') 'robots.txt missing /test-portfolio disallow'
  Assert-True ($robotsTxt -match 'Disallow: /projects/') 'robots.txt missing /projects/ disallow'

  $sitemapXml = (Get-Page -Path '/sitemap.xml').Content
  Assert-True ($sitemapXml -match '/services') 'sitemap missing /services'
  Assert-True ($sitemapXml -match '/insights') 'sitemap missing /insights'

  Write-Host ''
  Write-Host 'E2E smoke checks passed.'
}
finally {
  if ($null -ne $proc -and -not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force
  }
}
