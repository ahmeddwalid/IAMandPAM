---
title: Bash Code Samples
description: "Bash scripts for LDAP queries, Kerberos ticket inspection, certificate generation, and Vault CLI."
---

# Bash Code Samples

## Prerequisites

```bash
# Debian/Ubuntu
sudo apt-get install ldap-utils krb5-user openssl vault

# RHEL/CentOS
sudo yum install openldap-clients krb5-workstation openssl vault
```

## LDAP: Search for a user

```bash
ldapsearch -x -H ldap://dc1.corp.local \
  -b "dc=corp,dc=local" \
  -D "CN=Administrator,CN=Users,DC=corp,DC=local" \
  -w "password" \
  "(sAMAccountName=jsmith)" \
  cn mail memberOf
```

## LDAP: Search for groups

```bash
ldapsearch -x -H ldap://dc1.corp.local \
  -b "dc=corp,dc=local" \
  -D "CN=Administrator,CN=Users,DC=corp,DC=local" \
  -w "password" \
  "(objectClass=group)" \
  cn member
```

## LDAP: Find users with expired passwords

```bash
ldapsearch -x -H ldap://dc1.corp.local \
  -b "dc=corp,dc=local" \
  -D "CN=Administrator,CN=Users,DC=corp,DC=local" \
  -w "password" \
  "(pwdLastSet=0)" \
  sAMAccountName
```

## Kerberos: List tickets

```bash
klist
```

## Kerberos: Purge tickets

```bash
klist purge
```

## Kerberos: Get a ticket

```bash
kinit user@CORP.LOCAL
```

## Kerberos: Check ticket lifetime

```bash
klist -f
```

## OpenSSL: Generate a private key

```bash
openssl genrsa -out private.key 2048
```

## OpenSSL: Generate a CSR

```bash
openssl req -new -key private.key -out csr.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=example.com"
```

## OpenSSL: Generate a self-signed certificate

```bash
openssl req -x509 -new -key private.key -out cert.pem -days 365 \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=example.com"
```

## OpenSSL: Inspect a certificate

```bash
openssl x509 -in cert.pem -text -noout
```

## OpenSSL: Verify a certificate chain

```bash
openssl verify -CAfile ca.pem cert.pem
```

## OpenSSL: Test LDAPS connection

```bash
openssl s_client -connect dc1.corp.local:636 -showcerts
```

## Vault: Enable KV secrets engine

```bash
vault secrets enable -path=secret kv-v2
```

## Vault: Store a secret

```bash
vault kv put secret/myapp username="admin" password="secret123"
```

## Vault: Read a secret

```bash
vault kv get secret/myapp
```

## Vault: Read a specific field

```bash
vault kv get -field=password secret/myapp
```

## Vault: List secrets

```bash
vault kv list secret/
```

## Vault: Delete a secret

```bash
vault kv delete secret/myapp
```

## Vault: Enable AppRole auth

```bash
vault auth enable approle
```

## Vault: Create an AppRole

```bash
vault write auth/approle/role/myapp \
  token_policies="myapp-policy" \
  token_ttl=1h \
  token_max_ttl=4h
```

## Common errors

| Error | Cause | Fix |
|---|---|---|
| `ldap_bind: Invalid credentials` | Wrong username or password | Verify the bind DN and password |
| `ldap_bind: Can't contact LDAP service` | Network issue or wrong server | Check the server address and network connectivity |
| `kinit: Client not found in Kerberos database` | Wrong username or realm | Verify the username and realm |
| `kinit: Preauthentication failed` | Wrong password | Verify the password |
| `openssl: unable to load certificate` | Wrong file format | Verify the file is a valid PEM certificate |
| `vault: connection refused` | Vault server not running | Start the Vault server with `vault server -dev` |
