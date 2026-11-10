---
title: OAuth 2.0 Token Exchange Deep Dive (RFC 8693)
description: "RFC 8693 token exchange: delegation vs impersonation, actor token chains, cross-cloud patterns, and security considerations."
---

# OAuth 2.0 Token Exchange Deep Dive (RFC 8693)

## What token exchange solves

OAuth 2.0 token exchange (RFC 8693) allows a client to exchange one token for another. This is needed when:

- A service needs to call another service on behalf of the user (delegation).
- A service needs to act as the user (impersonation).
- A token needs to be exchanged for a token with different scopes or audiences.
- A token needs to be refreshed or renewed.

Without token exchange, each service would need the user's credentials or a separate token for every downstream service.

## The token exchange request

Token exchange uses the standard OAuth 2.0 token endpoint with a special grant type:

```http
POST /token HTTP/1.1
Host: idp.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=eyJhbGciOiJSUzI1NiIs...
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&requested_token_type=urn:ietf:params:oauth:token-type:access_token
&audience=https://api.downstream.example.com
&scope=read write
```

Key parameters:
- `grant_type`: must be `urn:ietf:params:oauth:grant-type:token-exchange`.
- `subject_token`: the token being exchanged.
- `subject_token_type`: the type of the subject token (e.g., access token, JWT, SAML assertion).
- `requested_token_type`: the type of token requested (e.g., access token, refresh token).
- `audience`: the intended audience for the new token.
- `scope`: the scopes requested for the new token.

## Delegation vs impersonation

### Delegation

Delegation means the downstream service acts on behalf of the user, but the user's identity is preserved. The new token contains both the user's identity and the actor's identity.

```json
{
  "sub": "user-123",
  "act": {
    "sub": "service-a"
  },
  "aud": "https://api.downstream.example.com",
  "scope": "read write"
}
```

The `act` (actor) claim identifies the service that requested the token. The `sub` (subject) claim identifies the user.

### Impersonation

Impersonation means the downstream service acts as the user, with no actor claim. The new token contains only the user's identity.

```json
{
  "sub": "user-123",
  "aud": "https://api.downstream.example.com",
  "scope": "read write"
}
```

Impersonation is riskier: the downstream service has full access as the user, with no way to distinguish the impersonated request from a direct request.

### When to use each

- **Delegation**: use when the downstream service needs to act on behalf of the user but the user's identity should be preserved for auditing.
- **Impersonation**: use when the downstream service needs full access as the user and auditing is not a concern. Rarely recommended.

## Actor token chains

In a multi-service architecture, token exchange can create chains: Service A exchanges a token for Service B, Service B exchanges for Service C, and so on. Each exchange adds an `act` claim to the token.

```json
{
  "sub": "user-123",
  "act": {
    "sub": "service-a",
    "act": {
      "sub": "service-b"
    }
  },
  "aud": "https://api.service-c.example.com"
}
```

The `act` claim is nested: each layer represents a service in the chain. The token's `act` chain shows the complete delegation path.

### Chain depth limits

Deep chains increase token size and complexity. Best practice: limit chain depth to 3-5 levels. If a chain exceeds this limit, the token exchange should fail.

## Cross-cloud patterns

Token exchange enables cross-cloud identity federation: a token issued by one cloud provider can be exchanged for a token from another cloud provider.

### AWS to GCP token exchange

1. User authenticates to AWS STS and receives an AWS access token.
2. The client exchanges the AWS token for a GCP token via a token exchange service.
3. The GCP token is used to access GCP resources.

### Azure to AWS token exchange

1. User authenticates to Entra ID and receives an Entra ID token.
2. The client exchanges the Entra ID token for an AWS token via a token exchange service.
3. The AWS token is used to assume an AWS role.

### Token exchange service

A token exchange service is a trusted intermediary that validates the source token and issues a target token:

```python
def exchange_token(source_token, target_audience):
    # Validate the source token
    claims = validate_jwt(source_token)
    
    # Create the target token
    target_token = create_jwt({
        "sub": claims["sub"],
        "aud": target_audience,
        "scope": claims["scope"],
        "act": claims.get("act", {}).get("sub", "token-exchange-service"),
    })
    
    return target_token
```

## Security considerations

### Token validation

The token exchange service must validate the source token before issuing a new token:

- Verify the signature.
- Check the expiration.
- Validate the issuer and audience.
- Confirm the token has not been revoked.

### Scope narrowing

The token exchange service should narrow scopes, never expand them. If the source token has `read` scope, the target token should have `read` scope or a subset, never `write`.

### Audience restriction

The target token's audience must be explicitly requested and validated. The token exchange service should not issue tokens for arbitrary audiences.

### Actor chain validation

The token exchange service should validate the actor chain to prevent abuse:

- Reject tokens with excessively deep actor chains.
- Validate that each actor in the chain is authorized to delegate.

### Token binding

Token exchange should preserve token binding (DPoP, mTLS) from the source token to the target token. If the source token is bound to a TLS connection, the target token should be bound to the same connection.

## Token exchange vs token refresh

| Aspect | Token Exchange | Token Refresh |
|---|---|---|
| Purpose | Exchange one token for another | Renew an expired token |
| Grant type | `token-exchange` | `refresh_token` |
| Input | Any token type | Refresh token |
| Output | New token with different audience/scope | New access token with same audience/scope |
| Actor | May add actor claim | No actor claim |
| Use case | Cross-service delegation | Session continuation |

## Verification checklist

- [ ] Token exchange request format understood.
- [ ] Delegation vs impersonation distinction clear.
- [ ] Actor token chains understood.
- [ ] Cross-cloud token exchange patterns understood.
- [ ] Security considerations applied.
- [ ] Token exchange vs token refresh differences understood.

## What this page teaches

- Token exchange enables cross-service delegation: a service can exchange a user's token for a token to access a downstream service.
- Delegation preserves the user's identity; impersonation does not. Prefer delegation for auditing.
- Actor chains show the complete delegation path: each `act` claim represents a service in the chain.
- Cross-cloud token exchange enables multi-cloud identity federation: a token from one cloud can be exchanged for a token from another.
- Security is critical: validate the source token, narrow scopes, restrict audiences, and preserve token binding.
