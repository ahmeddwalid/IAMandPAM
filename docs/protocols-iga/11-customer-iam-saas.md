---
title: "Customer IAM and Multi-Tenant SaaS Architecture"
description: "How identity architecture shifts for external users: B2B enterprise federation, tenant isolation, Home Realm Discovery, inbound SCIM, and consumer-scale authentication."
---
<!-- verified 2026-09-26 -->

# Customer IAM and Multi-Tenant SaaS Architecture

Workforce IAM manages known employees within a single organizational boundary. Customer Identity and Access Management (CIAM) and multi-tenant software-as-a-service (SaaS) identity solve the inverse problem: managing external users across thousands of independent organizations, or millions of consumer accounts, where the identity provider has no administrative control over the client's directory.

## Workforce IAM vs CIAM

The architectural assumptions that govern workforce IAM fail when applied to external customers:

| Architectural Dimension | Workforce IAM | Customer IAM (B2C) | Multi-Tenant SaaS (B2B) |
|---|---|---|---|
| **Identity Authority** | Single internal HR system and directory | Self-registration, social IdPs, passkeys | Disparate customer IdPs (Okta, Entra, Ping) |
| **User Population** | Fixed, bounded (1,000 to 200,000) | Unbounded, elastic (millions) | Grouped into organizational tenants |
| **Lifecycle Driver** | HR events (Joiner, Mover, Leaver) | Self-service sign-up, inactivity churn | Customer-side admin actions, inbound SCIM |
| **Authentication Policy** | Centrally mandated (FIDO2, managed devices) | Friction-sensitive, progressive profiling | Configured per customer tenant |
| **Authorization Scope** | Global internal roles and groups | Personal resource ownership | Tenant-scoped roles and permissions |
| **Availability SLA** | High internal availability | Critical revenue-impacting availability | Critical enterprise contract SLA |

## Multi-Tenant B2B Architecture

In a B2B SaaS application, each enterprise customer expects their employees to log in using their own corporate credentials, have accounts automatically provisioned and removed, and remain strictly isolated from all other tenants.

import Drawio from '@site/src/components/Drawio';
import ciamFlow from '!!raw-loader!@site/static/diagrams/ciam-multi-tenant-saas.drawio';

<Drawio content={ciamFlow} />

[Download / edit this diagram](/diagrams/ciam-multi-tenant-saas.drawio)

The architecture contains three primary flows:

1. **Enterprise Federation Inbound**: Corporate tenants connect via SAML 2.0 or OIDC.
2. **Inbound SCIM Receiver**: Tenant directories push employee additions and terminations directly into the SaaS database.
3. **Consumer Inbound**: Non-enterprise users authenticate via WebAuthn passkeys or social identity providers.

### Home Realm Discovery (HRD)

When a user visits a multi-tenant SaaS application, the login interface does not know which identity provider to redirect them to. Home Realm Discovery (HRD) resolves this routing.

Common HRD patterns:

1. **Email Domain Lookup**: The user enters their email address (`user@acme.com`). The application extracts the domain `acme.com`, looks up the registered identity provider for Acme Corporation, and initiates an SP-initiated SAML or OIDC flow to Acme's IdP.
2. **Subdomain or Vanity URL**: The user navigates to `acme.saas-platform.com`. The application reads the tenant identifier from the host header, loads Acme's tenant configuration, and immediately presents the tenant's dedicated login flow.
3. **Tenant Selection Prompt**: The user is prompted to enter an organization identifier or slug before authentication proceeds.

The email domain approach is the standard pattern for enterprise SaaS. It requires domain verification (DNS TXT record validation) during tenant setup to prevent an unauthorized tenant from claiming a corporate domain.

### Inbound SCIM Synchronization

Enterprise customers require employee offboarding in their directory to revoke access to SaaS tools immediately. Relying solely on Just-in-Time (JIT) SAML provisioning leaves orphaned accounts in the SaaS database when employees depart, because JIT provisioning only executes on login.

The SaaS platform implements a SCIM 2.0 server endpoint (`/scim/v2/Users`, `/scim/v2/Groups`) scoped by tenant API key:

- When Acme Corporation hires an engineer and assigns them to the SaaS app in Okta, Okta sends a `POST /scim/v2/Users` with Acme's tenant bearer token.
- When an employee changes roles, Okta sends a `PATCH /scim/v2/Users/{id}` updating group memberships or attributes.
- When an employee is terminated, Okta sends a `PATCH` setting `"active": false` or a `DELETE`. The SaaS application marks the tenant user account inactive and immediately revokes all active session tokens for that user ID.

### Tenant Isolation and Scoped Claims

Authorization decisions inside the SaaS application must guarantee tenant isolation at every layer: API gateway, application logic, and database queries.

A standard OAuth 2.0 access token issued by a multi-tenant federation hub encodes tenant boundary data:

```json
{
  "iss": "https://auth.saas-platform.com",
  "sub": "usr_948194821",
  "aud": "https://api.saas-platform.com",
  "exp": 1727376000,
  "tenant_id": "org_acme_corp_883",
  "roles": ["editor", "billing_admin"],
  "permissions": ["documents:read", "documents:write", "billing:view"]
}
```

The application backend verifies:
- The signature against the federation hub's public key (JWKS).
- The `tenant_id` claim against the database query filter. Every database read and write appends `WHERE tenant_id = :token_tenant_id` to prevent cross-tenant data leakage.

## Consumer Identity (B2C) Patterns

Consumer-facing IAM prioritizes conversion and minimal authentication friction while preventing account takeover:

1. **Passkeys and WebAuthn**: Cryptographic credential pairs bound to the platform (Apple Keychain, Google Password Manager) or security key. Eliminates shared secrets, credential stuffing, and phishing risks.
2. **Social Identity Providers**: OAuth 2.0 / OIDC integrations with Google, Apple, and Microsoft. Shifts credential management to consumer identity providers.
3. **Progressive Profiling**: Requesting minimal data at registration (email or phone) and incrementally collecting additional attributes as the user engages deeper with the application.
4. **Credential Stuffing Mitigation**: Rate limiting by IP and username, integration with Have I Been Pwned APIs, and risk-based step-up authentication when anomaly scores increase.
5. **Consent and Data Privacy Management**: Explicit tracking of terms-of-service versions, marketing consent, and automated data export/deletion workflows fulfilling GDPR Article 7 and Article 17 obligations.

## Interview Angle

In an architecture or system design interview for a SaaS company, expect questions on multi-tenant identity:

- **"How would you design single sign-on for a multi-tenant enterprise application?"**
  - Explain the three core components: Home Realm Discovery (by email domain with DNS verification), the Federation Hub translating vendor-specific SAML/OIDC assertions into standardized internal JWTs, and inbound SCIM 2.0 to handle automated deprovisioning so departed employees lose access without waiting for token expiry.
- **"How do you prevent cross-tenant access when users belong to multiple organizations?"**
  - Discuss tenant-scoped tokens versus user-scoped tokens. Explain why tenant context (`tenant_id`, `org_id`) must be an explicit claim verified by authorization middleware and appended to database partition keys, rather than trusting client-provided URL parameters.
