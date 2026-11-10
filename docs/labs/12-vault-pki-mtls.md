---
title: "Lab 12 - Automated PKI and mTLS Certificate Lifecycle with HashiCorp Vault"
description: "Deploying HashiCorp Vault's PKI secrets engine as an internal Intermediate CA, issuing short-lived X.509 certificates, and enforcing mutual TLS."
---
<!-- verified 2026-09-26 -->

# Lab 12 - Automated PKI and mTLS Certificate Lifecycle with HashiCorp Vault

## What this lab proves

Manual certificate issuance and long-lived (1-year) TLS certificates cause unexpected enterprise outages and expand the blast radius of private key compromises. Modern machine identity architecture relies on automated, short-lived (24-hour) certificates issued by internal dynamic Certificate Authorities.

This lab uses HashiCorp Vault's PKI secrets engine to build a two-tier internal CA hierarchy (Root CA -> Intermediate CA), configure an automated role for microservices, dynamically issue X.509 client and server certificates, and verify mutual TLS (mTLS) authentication between two services.

## Architecture

```
                  [Root CA (Vault `pki`)]
                 (Generates & signs Inter CA)
                             │
                             ▼
              [Intermediate CA (Vault `pki_int`)]
                 (Issues 24h dynamic certs)
                             │
       ┌─────────────────────┴─────────────────────┐
       ▼                                           ▼
[payment-service] ◄────── Mutual TLS (mTLS) ─────► [order-service]
(Server Cert: payment.mesh)               (Client Cert: order.mesh)
```

## Prerequisites

- Docker Desktop installed and running.
- HashiCorp Vault CLI installed locally (`vault`).
- `openssl` and `curl` installed for certificate inspection and testing.

## Step 1 - Start Vault in Docker

Run Vault in development mode with root token `root-secret`:

```bash
docker run -d --name vault-pki \
  -p 8200:8200 \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=root-secret' \
  -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' \
  hashicorp/vault:latest
```

Configure your local environment to target the container:

```bash
export VAULT_ADDR="http://127.0.0.1:8200"
export VAULT_TOKEN="root-secret"
vault status
```

## Step 2 - Establish the Root CA

Mount the PKI secrets engine at `pki` to act as the corporate Root CA:

```bash
# Enable PKI engine for Root CA
vault secrets enable pki

# Tune max TTL to 10 years (87600 hours)
vault secrets tune -max-lease-ttl=87600h pki

# Generate Root CA private key and self-signed certificate
vault write -field=certificate pki/root/generate/internal \
  common_name="Enterprise Internal Root CA" \
  ttl=87600h > root_ca.crt

# Configure CA and CRL distribution URLs
vault write pki/config/urls \
  issuing_certificates="$VAULT_ADDR/v1/pki/ca" \
  crl_distribution_points="$VAULT_ADDR/v1/pki/crl"
```

## Step 3 - Establish the Intermediate CA

Mount a second PKI engine at `pki_int` to act as the operational Issuing CA for microservices:

```bash
# Enable second PKI engine for Intermediate CA
vault secrets enable -path=pki_int pki

# Tune max TTL to 1 year (8760 hours)
vault secrets tune -max-lease-ttl=8760h pki_int

# Generate Intermediate CSR
vault write -format=json pki_int/intermediate/generate/internal \
  common_name="Microservices Intermediate CA" \
  ttl=8760h | jq -r '.data.csr' > pki_intermediate.csr

# Sign Intermediate CSR with the Root CA
vault write -format=json pki/root/sign-intermediate \
  csr=@pki_intermediate.csr \
  format=pem_bundle \
  ttl=8760h | jq -r '.data.certificate' > intermediate.crt

# Import the signed intermediate certificate back into pki_int
vault write pki_int/intermediate/set-signed certificate=@intermediate.crt

# Configure operational URLs for the intermediate CA
vault write pki_int/config/urls \
  issuing_certificates="$VAULT_ADDR/v1/pki_int/ca" \
  crl_distribution_points="$VAULT_ADDR/v1/pki_int/crl"
```

The CA hierarchy is now complete: `pki_int` is cryptographically signed by `pki`.

## Step 4 - Configure the Microservice PKI Role

Define an automated role that regulates what domains, key usages, and lifetimes workloads can request:

```bash
vault write pki_int/roles/mesh-service \
  allowed_domains="mesh.corp.local" \
  allow_subdomains=true \
  max_ttl="72h" \
  ttl="24h" \
  allow_ip_sans=true \
  server_flag=true \
  client_flag=true \
  key_type="rsa" \
  key_bits=2048
```

The parameters enforce:
- **`ttl="24h"`**: Every issued certificate expires automatically in 24 hours.
- **`client_flag=true` and `server_flag=true`**: Certificates are valid for both client and server authentication in mutual TLS.
- **`allowed_domains="mesh.corp.local"`**: Prevents microservices from requesting arbitrary domains like `google.com`.

## Step 5 - Issue Dynamic Certificates for Microservices

Issue a certificate for `payment-service`:

```bash
vault write -format=json pki_int/issue/mesh-service \
  common_name="payment.mesh.corp.local" \
  ttl="24h" > payment_cert.json

# Extract certificate, private key, and issuing CA
jq -r .data.certificate payment_cert.json > payment.crt
jq -r .data.private_key payment_cert.json > payment.key
jq -r .data.issuing_ca payment_cert.json > ca_chain.crt
```

Issue a certificate for `order-service`:

```bash
vault write -format=json pki_int/issue/mesh-service \
  common_name="order.mesh.corp.local" \
  ttl="24h" > order_cert.json

jq -r .data.certificate order_cert.json > order.crt
jq -r .data.private_key order_cert.json > order.key
```

## Step 6 - Inspect and Verify Certificate Properties

Verify that the certificate conforms to least-privilege cryptographic standards using OpenSSL:

```bash
openssl x509 -in payment.crt -text -noout
```

Verify the critical extensions:
- **Validity**: `Not Before` is current time, `Not After` is exactly 24 hours later.
- **Subject**: `CN = payment.mesh.corp.local`.
- **X509v3 Extended Key Usage**:
  - `TLS Web Server Authentication`
  - `TLS Web Client Authentication`
- **X509v3 Subject Alternative Name**: `DNS:payment.mesh.corp.local`.

Verify the certificate chain:
```bash
openssl verify -CAfile root_ca.crt -untrusted intermediate.crt payment.crt
```
Expected output: `payment.crt: OK`.

## Step 7 - Verify Mutual TLS (mTLS) Enforcement

Simulate an mTLS connection using OpenSSL `s_server` and `s_client`:

1. Start a mock server representing `payment-service` enforcing client certificate validation (`-Verify 1`):
   ```bash
   openssl s_server -accept 8443 \
     -cert payment.crt -key payment.key \
     -CAfile intermediate.crt -Verify 1
   ```
2. In a second terminal, attempt a connection without a client certificate:
   ```bash
   curl -k https://127.0.0.1:8443
   ```
   **Result**: Connection fails with `tlsv13 alert certificate required`. The server rejects unauthenticated traffic.
3. Connect presenting the valid `order-service` client certificate:
   ```bash
   curl -v --cacert root_ca.crt \
     --cert order.crt --key order.key \
     --resolve payment.mesh.corp.local:8443:127.0.0.1 \
     https://payment.mesh.corp.local:8443/
   ```
   **Result**: Handshake completes successfully (`SSL handshake has read 5000 bytes`). Both client and server cryptographically verify each other's identity.

## Common Pitfalls

1. **Missing Intermediate CA in Server Bundle**: If a server provides only its leaf certificate (`payment.crt`) and omits `intermediate.crt`, clients that possess only `root_ca.crt` in their trust store will fail validation with `unable to get local issuer certificate`. Always bundle the leaf certificate and intermediate certificates together.
2. **Clock Skew in Short-Lived Certificates**: When certificates have 1-hour or 24-hour lifetimes, clock drift between servers (even 5 minutes) can cause `certificate is not yet valid` errors. Production environments running short-lived PKI require Network Time Protocol (NTP) synchronization across all nodes.
3. **Overusing Long TTLs**: Setting TTLs to 30 or 90 days reintroduces the revocation problem. Short lifetimes (24 to 72 hours) paired with automated renewal daemons (such as Vault Agent or Cert-Manager) eliminate the operational overhead of managing Certificate Revocation Lists.
