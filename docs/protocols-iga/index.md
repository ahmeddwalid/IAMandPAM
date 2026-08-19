---
title: "Identity Protocols & IGA"
description: "The protocols that move identity between systems: LDAP, SAML, OAuth 2.0, OIDC, SCIM, the governance layer around them, and the complete IAM architecture."
---

# Identity Protocols & IGA

This section covers the protocols that make IAM work across systems, plus the governance layer that decides what access should exist. These are the protocols behind every login you have ever used, and the integration vocabulary you will speak in every IAM role.

## In this section

- **[LDAP](01-ldap.md)** - the directory protocol: tree structure, bind and search, and the store behind enterprise identity.
- **[SAML](02-saml.md)** - the enterprise SSO protocol: SP and IdP, assertions, and the browser redirect flow.
- **[OAuth 2.0](03-oauth2.md)** - the authorization framework: grants, tokens, scopes, and PKCE.
- **[OpenID Connect](04-oidc.md)** - identity on OAuth 2.0: ID tokens, discovery, and when it beats SAML.
- **[SCIM](05-scim.md)** - the provisioning protocol that keeps user records synchronized.
- **[IGA](06-iga.md)** - identity governance: requests, reviews, segregation of duties, and audit evidence.
- **[Complete IAM Architecture](07-iam-architecture.md)** - the whole stack in one diagram, with the protocol per connection.

## Suggested order

Read the pages in order. LDAP introduces the directory as the store; SAML and OIDC are the two competing SSO dialects (OAuth 2.0 first, because OIDC is its extension); SCIM is the write path; IGA is the decision layer that drives it all; the architecture page is the summary diagram. The [IAM Fundamentals](../fundamentals/index.md) section is the prerequisite; the [PAM Core](../pam-core/index.md) section is the natural next step.