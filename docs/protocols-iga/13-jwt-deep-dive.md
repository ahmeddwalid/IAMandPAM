---
title: JWT Deep Dive - JWS, JWE, Signing Algorithms, and JWK
description: "Advanced JWT topics: JWS/JWE structures, signing algorithms (RS256, ES256, EdDSA), JWK/JWKS key management, token binding, and common JWT attacks."
---

# JWT Deep Dive - JWS, JWE, Signing Algorithms, and JWK

## JWT structure

A JSON Web Token (JWT) is a compact, URL-safe means of representing claims between two parties. It consists of three parts: header, payload, and signature, separated by dots.

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Header

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-2026-09"
}
```

- `alg`: the signing algorithm (e.g., `RS256`, `ES256`, `EdDSA`).
- `typ`: the token type (`JWT`).
- `kid`: the key identifier, used to select the signing key from a JWKS.

### Payload

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622,
  "iss": "https://idp.example.com",
  "aud": "https://api.example.com"
}
```

Standard claims:
- `sub`: the subject (user ID).
- `iss`: the issuer (IdP).
- `aud`: the audience (intended recipient).
- `exp`: the expiration time.
- `iat`: the issued-at time.
- `nbf`: the not-before time.
- `jti`: the JWT ID (unique identifier for replay prevention).

### Signature

The signature is computed over the base64url-encoded header and payload:

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

The signature ensures the token was not tampered with after issuance.

## JWS: JSON Web Signature

JWS is the signed variant of JWT. It uses asymmetric or symmetric keys to sign the token.

### JWS compact serialization

The compact serialization is the three-part dot-separated format shown above. It is the most common format for JWTs in OIDC and OAuth 2.0.

### JWS JSON serialization

The JSON serialization is a JSON object that can contain multiple signatures:

```json
{
  "payload": "eyJzdWIiOiIxMjM0NTY3ODkwIn0",
  "signatures": [
    {
      "protected": "eyJhbGciOiJSUzI1NiJ9",
      "header": {"kid": "key-1"},
      "signature": "Signature1"
    },
    {
      "protected": "eyJhbGciOiJFUzI1NiJ9",
      "header": {"kid": "key-2"},
      "signature": "Signature2"
    }
  ]
}
```

The JSON serialization is rarely used in practice; the compact serialization is the standard.

## JWE: JSON Web Encryption

JWE is the encrypted variant of JWT. It provides confidentiality for the token contents.

### JWE compact serialization

A JWE has five parts, separated by dots:

```
BASE64URL(UTF8(JWE Protected Header)) || '.' ||
BASE64URL(JWE Encrypted Key) || '.' ||
BASE64URL(JWE Initialization Vector) || '.' ||
BASE64URL(JWE Ciphertext) || '.' ||
BASE64URL(JWE Authentication Tag)
```

### JWE encryption process

1. Generate a Content Encryption Key (CEK) for symmetric encryption (e.g., AES-256-GCM).
2. Encrypt the payload with the CEK.
3. Encrypt the CEK with the recipient's public key (e.g., RSA-OAEP or ECDH-ES).
4. Construct the JWE from the encrypted CEK, IV, ciphertext, and authentication tag.

### When to use JWE

- The token contains sensitive data that must be encrypted (e.g., PII, health data).
- The token passes through untrusted intermediaries (e.g., API gateways, message queues).
- Regulatory requirements mandate encryption of personal data in transit.

## Signing algorithms

### RS256 (RSASSA-PKCS1-v1_5 with SHA-256)

- Asymmetric: signs with RSA private key, verifies with RSA public key.
- Widely supported, mature, and well-understood.
- Key size: 2048-bit minimum (3072-bit recommended for long-term security).
- Performance: slower than elliptic curve algorithms.

### ES256 (ECDSA with P-256 and SHA-256)

- Asymmetric: signs with ECDSA private key, verifies with ECDSA public key.
- Smaller keys than RSA (256-bit vs 2048-bit) for equivalent security.
- Faster than RSA for signing and verification.
- Requires careful implementation to avoid nonce reuse attacks.

### EdDSA (Ed25519)

- Asymmetric: signs with Ed25519 private key, verifies with Ed25519 public key.
- Fast, secure, and resistant to side-channel attacks.
- Deterministic: no nonce required, eliminating nonce reuse risks.
- Growing support in modern libraries.

### HS256 (HMAC with SHA-256)

- Symmetric: signs and verifies with the same shared secret.
- Fast and simple, but requires secure key distribution.
- Suitable for internal tokens where the issuer and verifier are the same system.
- Not suitable for tokens that cross trust boundaries.

### Algorithm comparison

| Algorithm | Type | Key Size | Speed | Use Case |
|---|---|---|---|---|
| RS256 | Asymmetric | 2048-bit | Moderate | General-purpose, wide support |
| ES256 | Asymmetric | 256-bit | Fast | Modern applications, smaller keys |
| EdDSA | Asymmetric | 255-bit | Fastest | Modern, security-critical applications |
| HS256 | Symmetric | 256-bit | Fastest | Internal tokens, same trust domain |

### Algorithm confusion attacks

An algorithm confusion attack occurs when an attacker changes the `alg` header from an asymmetric algorithm (e.g., `RS256`) to a symmetric algorithm (e.g., `HS256`), and the verifier uses the public key as the HMAC secret.

Defense:
- Reject tokens with `alg` values that do not match the expected algorithm.
- Use a library that validates the algorithm against a whitelist.
- Never use the same key for both asymmetric and symmetric algorithms.

## JWK and JWKS

### JWK (JSON Web Key)

A JWK is a JSON object that represents a cryptographic key:

```json
{
  "kty": "RSA",
  "kid": "key-2026-09",
  "use": "sig",
  "alg": "RS256",
  "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
  "e": "AQAB"
}
```

Key fields:
- `kty`: the key type (`RSA`, `EC`, `oct`, `OKP`).
- `kid`: the key identifier, used to select the key from a JWKS.
- `use`: the key use (`sig` for signing, `enc` for encryption).
- `alg`: the algorithm the key is intended for.
- `n` and `e`: the RSA modulus and exponent (for RSA keys).

### JWKS (JSON Web Key Set)

A JWKS is a JSON object that contains an array of JWKs:

```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "key-2026-09",
      "use": "sig",
      "alg": "RS256",
      "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
      "e": "AQAB"
    },
    {
      "kty": "RSA",
      "kid": "key-2026-08",
      "use": "sig",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

The IdP publishes its JWKS at a standard endpoint (e.g., `/.well-known/jwks.json`). The verifier fetches the JWKS, selects the key by `kid`, and uses it to verify the token signature.

### Key rotation

Key rotation is the process of replacing signing keys periodically. The IdP publishes multiple keys in the JWKS during the transition period:

1. The IdP generates a new key pair and adds it to the JWKS with a new `kid`.
2. The IdP signs new tokens with the new key.
3. The verifier fetches the updated JWKS and can verify tokens signed with either key.
4. After all tokens signed with the old key have expired, the IdP removes the old key from the JWKS.

## Token binding

Token binding ties a token to a specific TLS connection, preventing token theft and replay.

### DPoP (Demonstrating Proof of Possession)

DPoP (RFC 9449) binds a token to a client's private key. The client generates a key pair, includes the public key in the token request, and signs each request with the private key. The server verifies the signature to prove the client possesses the private key.

```http
GET /resource HTTP/1.1
Authorization: DPoP eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0IiwidHlwIjoiZHBvcCtqd3QifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
DPoP: eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0IiwidHlwIjoiZHBvcCtqd3QifQ.eyJqdGkiOiJ1dWlkLTEyMzQ1Njc4OTAiLCJodG0iOiJHRVQiLCJodHIiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### mTLS token binding

mTLS token binding (RFC 8705) binds a token to a client's TLS certificate. The client presents the certificate during the TLS handshake, and the server associates the token with the certificate's thumbprint.

## Common JWT attacks

### Algorithm none attack

An attacker removes the signature by setting `alg` to `none` and removing the signature part. The verifier must reject tokens with `alg=none`.

### Key confusion attack

As described above, the attacker changes `alg` from `RS256` to `HS256` and signs the token with the public key as the HMAC secret.

### Weak secret attack

If `HS256` is used with a weak secret, an attacker can brute-force the secret and forge tokens. Use a strong random secret (256 bits minimum).

### Expired token attack

An attacker replays an expired token. The verifier must check the `exp` claim and reject expired tokens.

### Audience confusion attack

An attacker uses a token issued for one audience to access a different audience. The verifier must check the `aud` claim and reject tokens with unexpected audiences.

### Issuer confusion attack

An attacker uses a token issued by a different IdP. The verifier must check the `iss` claim and reject tokens from unexpected issuers.

## Verification checklist

- [ ] JWT structure understood (header, payload, signature).
- [ ] JWS and JWE differences understood.
- [ ] Signing algorithm selected based on use case.
- [ ] JWKS endpoint configured for key distribution.
- [ ] Key rotation process implemented.
- [ ] Token binding (DPoP or mTLS) considered for high-security scenarios.
- [ ] Common JWT attacks defended against.

## What this page teaches

- JWT is a compact token format: header, payload, and signature, separated by dots.
- JWS provides integrity (signing); JWE provides confidentiality (encryption).
- Signing algorithm selection depends on the use case: RS256 for compatibility, ES256 for modern applications, EdDSA for security-critical applications.
- JWKS is the key distribution mechanism: the IdP publishes keys, and the verifier selects by `kid`.
- Key rotation is essential: publish multiple keys during transition, remove old keys after expiration.
- Token binding prevents token theft: DPoP binds to a private key, mTLS binds to a certificate.
- JWT attacks are real: validate algorithm, issuer, audience, and expiration.
