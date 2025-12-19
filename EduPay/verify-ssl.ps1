# SSL Verification Script
Write-Host "`nSSL Configuration Check" -ForegroundColor Cyan

$keyFile = ".\ssl\server.key"
$certFile = ".\ssl\server.cert"

Write-Host "`n1. Checking SSL files..."
if (Test-Path $keyFile) {
    $keySize = (Get-Item $keyFile).Length
    Write-Host "   OK: server.key exists ($keySize bytes)" -ForegroundColor Green
} else {
    Write-Host "   FAIL: server.key NOT FOUND" -ForegroundColor Red
    exit 1
}

if (Test-Path $certFile) {
    $certSize = (Get-Item $certFile).Length
    Write-Host "   OK: server.cert exists ($certSize bytes)" -ForegroundColor Green
} else {
    Write-Host "   FAIL: server.cert NOT FOUND" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Validating certificate format..."
$certContent = Get-Content $certFile -Raw
$keyContent = Get-Content $keyFile -Raw

if ($certContent -match "-----BEGIN CERTIFICATE-----") {
    Write-Host "   OK: Certificate format valid" -ForegroundColor Green
} else {
    Write-Host "   FAIL: Invalid certificate" -ForegroundColor Red
    exit 1
}

if ($keyContent -match "-----BEGIN RSA PRIVATE KEY-----") {
    Write-Host "   OK: Private key format valid" -ForegroundColor Green
} else {
    Write-Host "   FAIL: Invalid private key" -ForegroundColor Red
    exit 1
}

Write-Host "`n3. Checking server.js for HTTPS code..."
$serverJs = Get-Content "server.js" -Raw
if ($serverJs -match "https\.createServer") {
    Write-Host "   OK: HTTPS support enabled" -ForegroundColor Green
} else {
    Write-Host "   FAIL: HTTPS code not found" -ForegroundColor Red
    exit 1
}

Write-Host "`nSSL Configuration Valid!" -ForegroundColor Green
Write-Host "`nTo run with HTTPS:" -ForegroundColor Cyan
Write-Host '  $env:SSL_KEY_PATH="./ssl/server.key"'
Write-Host '  $env:SSL_CERT_PATH="./ssl/server.cert"'
Write-Host '  $env:PORT="8443"'
Write-Host '  npm start'
Write-Host "`nThen open: https://localhost:8443`n"
