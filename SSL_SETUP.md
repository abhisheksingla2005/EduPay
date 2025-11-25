# SSL/HTTPS Setup Guide

## Overview
The EduPay application now supports optional HTTPS using SSL certificates. When SSL certificates are provided, the server runs on HTTPS; otherwise, it defaults to HTTP.

## Environment Variables
Add these to your `.env` file to enable HTTPS:

```env
SSL_KEY_PATH=./ssl/server.key
SSL_CERT_PATH=./ssl/server.cert
```

## Generating Self-Signed Certificates (Local Development)

### Option 1: Using OpenSSL (Windows/Linux/Mac)

1. **Install OpenSSL** (if not already installed):
   - Windows: Download from https://slproweb.com/products/Win32OpenSSL.html
   - Mac: `brew install openssl`
   - Linux: Usually pre-installed

2. **Generate Certificate**:
```bash
# Create ssl directory
mkdir ssl
cd ssl

# Generate private key and certificate (valid for 365 days)
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.cert -days 365 -nodes

# You'll be prompted for:
# - Country Name (e.g., US)
# - State/Province
# - City
# - Organization Name (e.g., EduPay)
# - Common Name (use: localhost)
# - Email Address
```

### Option 2: Using PowerShell (Windows)

```powershell
# Create ssl directory
New-Item -ItemType Directory -Force -Path ssl
cd ssl

# Generate self-signed certificate
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(1)

# Export certificate and key
$certPath = "cert:\LocalMachine\My\$($cert.Thumbprint)"
$password = ConvertTo-SecureString -String "temp" -Force -AsPlainText

# Export PFX
Export-PfxCertificate -Cert $certPath -FilePath ".\server.pfx" -Password $password

# Convert PFX to PEM format (requires OpenSSL)
openssl pkcs12 -in server.pfx -nocerts -out server.key -nodes -password pass:temp
openssl pkcs12 -in server.pfx -clcerts -nokeys -out server.cert -password pass:temp

# Clean up
Remove-Item server.pfx
```

## Running with HTTPS

1. **Set environment variables**:
```bash
# PowerShell
$env:SSL_KEY_PATH="./ssl/server.key"
$env:SSL_CERT_PATH="./ssl/server.cert"
$env:PORT="8443"

# Or add to .env file
```

2. **Start the server**:
```bash
npm start
```

3. **Access the application**:
   - HTTPS: `https://localhost:8443`
   - Note: Self-signed certificates will show a browser warning. Click "Advanced" → "Proceed to localhost"

## Production Setup (AWS/Cloud)

### AWS Certificate Manager (ACM)
1. Request a certificate in AWS Certificate Manager
2. Validate domain ownership (DNS or email)
3. Use Application Load Balancer (ALB) with ACM certificate
4. ALB handles SSL termination, forwards HTTP to Elastic Beanstalk
5. No need to set `SSL_KEY_PATH`/`SSL_CERT_PATH` in application

### Let's Encrypt (Free SSL)
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificate files will be at:
# /etc/letsencrypt/live/yourdomain.com/privkey.pem (key)
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem (cert)

# Set in .env:
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

## Security Best Practices

1. **Never commit SSL certificates to Git**:
   - Already in `.gitignore`: `ssl/`, `*.key`, `*.cert`, `*.pem`

2. **Use environment-specific certificates**:
   - Development: Self-signed
   - Production: ACM, Let's Encrypt, or commercial CA

3. **Cookie security**:
   - Cookies automatically use `secure: true` flag when SSL is enabled
   - This prevents cookie transmission over unencrypted connections

4. **HTTPS-only in production**:
   - Set `NODE_ENV=production` to enforce secure cookies
   - Use HTTP → HTTPS redirect middleware if needed

## Testing HTTPS Locally

```bash
# Test with curl (accept self-signed cert)
curl -k https://localhost:8443/

# Test with browser
# Chrome: chrome://flags/#allow-insecure-localhost (enable)
# Firefox: Click "Advanced" → "Accept Risk"
```

## Troubleshooting

### Certificate errors
- **Error: ENOENT**: Check file paths in `.env`
- **Error: PEM routines**: Certificate format issue, regenerate
- **Browser warning**: Normal for self-signed certs, click "Proceed"

### Port conflicts
- HTTPS typically uses 443 (requires sudo/admin)
- Use 8443 for development (no special permissions needed)

## Elastic Beanstalk Deployment

For AWS deployment, use ALB with ACM certificate:
1. Don't set `SSL_KEY_PATH`/`SSL_CERT_PATH` on EB
2. Configure ALB listener on port 443 with ACM certificate
3. Forward to EB environment on port 80
4. Application runs HTTP internally (SSL terminated at ALB)

See `DEPLOYMENT.md` for full AWS setup guide.
