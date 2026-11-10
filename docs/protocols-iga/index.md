---
title: "Identity Protocols & IGA"
description: "The protocols that move identity between systems: LDAP, SAML, OAuth 2.0, OIDC, SCIM, the governance layer around them, and the complete IAM architecture."
---

import ProtocolChooser from '@site/src/components/ProtocolChooser';

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
- **[Kerberos Protocol & Enterprise Attacks](08-kerberos.md)** - ticket granting, service tickets, delegation, and attacks (Kerberoasting, Golden Tickets).
- **[FIDO2 and WebAuthn Deep Dive](09-fido2-webauthn-deep-dive.md)** - Relying Party registration, CTAP2 CBOR payloads, and cryptographic signature verification.
- **[Federation Patterns & Token Exchange](10-federation-patterns-token-exchange.md)** - RFC 8693 token exchange, delegation chains, and cross-cloud federation.
- **[Customer IAM and Multi-Tenant SaaS](11-customer-iam-saas.md)** - B2B multi-tenancy, Home Realm Discovery, inbound SCIM, and consumer authentication.
- **[SAML Deep Dive](12-saml-deep-dive.md)** - Metadata exchange, assertion encryption, artifact resolution, signature wrapping attacks, and IdP-initiated edge cases.
- **[JWT Deep Dive](13-jwt-deep-dive.md)** - JWS/JWE structures, signing algorithms (RS256, ES256, EdDSA), JWK/JWKS key management, token binding, and common JWT attacks.
- **[LDAP Advanced](14-ldap-advanced.md)** - Multi-master replication, schema design, referral chasing, performance tuning, and AD vs OpenLDAP differences.
- **[OAuth 2.0 Token Exchange Deep Dive](15-oauth-token-exchange.md)** - RFC 8693 token exchange: delegation vs impersonation, actor token chains, cross-cloud patterns, and security considerations.

## Interactive Protocol Decision Matrix

Select your architectural constraints below to find the recommended identity protocol:

<ProtocolChooser />

## Suggested order

Read the pages in order. LDAP introduces the directory as the store; SAML and OIDC are the two competing SSO dialects (OAuth 2.0 first, because OIDC is its extension); SCIM is the write path; IGA is the decision layer that drives it all; Kerberos explains internal Windows domain auth; FIDO2 covers phishing-resistant hardware credentials; token exchange handles microservices; and customer IAM scales the architecture to multi-tenant B2B environments. The architecture page summarizes the core enterprise topology.

## Section Assessment

import SectionQuiz from '@site/src/components/SectionQuiz';
import { QUIZZES } from '@site/src/data/quizzes';

<SectionQuiz title={QUIZZES['protocols-iga'].title} questions={QUIZZES['protocols-iga'].questions} passingScore={3} sectionKey="protocols-iga" />