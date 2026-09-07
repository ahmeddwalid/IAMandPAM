---
title: SAML
description: "Security Assertion Markup Language: the SSO protocol for enterprises, with the browser redirect flow, assertions, and the SP/IdP trust model."
---

# SAML

Security Assertion Markup Language (SAML) is the SSO protocol of the enterprise: it is how a user logs in once at a central identity provider and gets into applications without presenting credentials again. It is XML-based, predates OIDC, and remains the default integration protocol for SaaS applications and government/education federations.

## The model: SP and IdP

SAML has two roles:

- **Identity Provider (IdP)**. Authenticates the user and issues assertions about them.
- **Service Provider (SP)**. The application the user wants to reach; trusts the IdP and consumes its assertions.

The two trust each other through metadata: each side publishes its certificates and endpoints, and each verifies the other's signatures. No shared session state exists; trust is cryptographic and configured up front.

## The flow: SP-initiated SSO

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant SP as App (SP)
    participant IdP as Identity Provider

    U->>SP: Opens app (unauthenticated)
    SP->>B: Redirect to IdP with AuthnRequest
    B->>IdP: AuthnRequest
    IdP->>U: Login prompt (MFA if required)
    U->>IdP: Credentials
    IdP->>B: POST signed SAML assertion to SP
    B->>SP: Assertion (via form POST)
    SP->>SP: Verify signature, issue session
    SP->>U: Logged in
```

*SP-initiated SSO. The user is redirected to the IdP, authenticates, and the IdP returns a signed assertion that the application verifies before creating a session.*

The assertion carries identity claims: who the user is (NameID), what attributes they have (groups, mail), and conditions such as validity window and audience (which SP the assertion is for). The audience restriction matters: an assertion issued for one application must be worthless at another.

## IdP-initiated versus SP-initiated

- **SP-initiated** starts at the application and redirects to the IdP. Used for most user-facing apps.
- **IdP-initiated** starts at the IdP portal ("choose an app") and sends the user to the SP already authenticated. This is the pattern of app launcher pages. It carries a known risk: the SP receives an unsolicited assertion, so session fixation protection matters there.

## What can go wrong

SAML is powerful and unforgiving:

- **Signature verification gaps.** An SP that does not actually verify the assertion signature (or checks only the XML body, not the whole signed element) accepts forged assertions. XML signature wrapping attacks are the classic exploit; the correct answer is strict schema validation plus full-document signature verification.
- **NameID confusion.** If the IdP changes the NameID format or value (from email to a directory GUID), every SP silently starts creating new identities, which cascades into orphaned accounts and access reviews gone wrong.
- **Certificate lifecycle.** IdP signing certificates expire and rotate. SPs that hardcode the old certificate break at rotation time; the metadata-based trust relationship exists precisely to handle this gracefully.
- **Session lifetime mismatch.** The IdP session and the SP session are independent. Revoking at the IdP does not kill existing SP sessions unless single logout is implemented and honored.

## SAML versus OIDC

| | SAML | OIDC |
|---|---|---|
| Era and transport | XML over browser redirects and POSTs | JSON over HTTP, OAuth 2.0 underlay |
| Token | Signed XML assertion | Signed JWT ID token |
| Best fit | Enterprise SaaS, government/edu federations, legacy stacks | Web/mobile apps, APIs, cloud-native |
| Complexity | High (XML parsing, metadata exchange) | Lower (JSON, discovery document) |

The pragmatic rule most identity teams use: SAML where the vendor ecosystem expects it (Microsoft 365, Salesforce, most SaaS catalogs support both, but SAML is the safe common denominator), OIDC where the stack is modern or APIs are involved. Both give the same guarantee: one authentication at the IdP, verified trust into the application.

Next: [OAuth 2.0](03-oauth2.md), the authorization framework that OIDC builds on, and the grant types that move tokens instead of assertions.

## Real-world integration patterns

The sequence diagram above is the clean path. The integration work is everything around it:

- **Metadata exchange is the first point of failure.** Most SPs and IdPs publish metadata at `/metadata` or `/FederationMetadata/2007-06/FederationMetadata.xml`. The integration checklist: download the metadata, pin the signing certificate, configure the ACS URL, configure the entityID, configure the Name ID format. If any of these do not match exactly, the integration fails with a generic "invalid assertion" error that tells you nothing.
- **Clock skew is the second point of failure.** SAML assertions have `NotBefore` and `NotOnOrAfter` conditions. If the IdP and SP clocks differ by more than the allowed skew (usually 3 minutes), the assertion is rejected. The fix is NTP on both ends, not a configuration change.
- **The IdP-initiated flow is a convenience trap.** It lets a user click a portal link and land in the SP without the SP initiating the flow. The risk: the SP cannot verify the `InResponseTo` field because there was no request. The `RelayState` is attacker-controlled. Use IdP-initiated only inside a portal that already authenticated the user and is issuing the RelayState itself.
- **Attribute mapping is where business logic leaks into the integration.** The IdP sends `department`, `title`, `manager`. The SP needs `costCenter`, `jobLevel`, `approver`. The mapping is either a transform at the IdP (clean) or a lookup at the SP (common but fragile). The "attributes are correct for every role" check in the [SaaS integration scenario](../scenarios/saas-sso-integration) is the test that catches the mapping gaps.
- **Certificate rotation is the highest-risk maintenance operation.** The IdP signing certificate expires or is rotated. The SP must be updated before the old certificate expires, or SSO breaks for everyone. The automation: most IdPs publish metadata with two certificates during the transition window. The SP must pick up the new one and trust both during the overlap.

**What breaks without these:** a SAML integration that works in the pilot with 5 users breaks at month 3 when the certificate rotates, or at month 6 when a new department is onboarded and the attribute mapping does not cover it.