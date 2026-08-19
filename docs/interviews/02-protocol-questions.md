---
title: "Wave 1: Protocol Questions"
description: "Ten protocol and token interview questions with full-treatment answers."
---

# Wave 1: Protocol Questions

Protocol questions test whether you can explain the mechanics, not just the acronyms. The pattern in interviews is the same: explain the flow, then explain what can go wrong with it.

### 1. Explain the OAuth 2.0 authorization code flow, and where PKCE fits.

**Concise answer.** The authorization code flow has the user authenticate to the authorization server, which returns an authorization code to the application; the application exchanges the code for tokens at the token endpoint. PKCE protects the code exchange by binding it to a verifier only the application knows.

**Detailed explanation.** The flow, in order: the application redirects the user to the authorization server with its client ID, the requested scope, and a redirect URI; the user authenticates and consents; the server redirects back with a one-time authorization code; the application exchanges the code, along with its client credentials, for an access token (and a refresh token). The code is short-lived and single-use, which limits the exposure if it leaks. PKCE adds a verifier: the application generates a random secret, sends only its hash at the start, and presents the verifier at the exchange, so even an intercepted code cannot be exchanged without the verifier. [PKCE is now required or default](/docs/protocols-iga/oauth2) in most providers, including for public clients like single-page apps and mobile apps that cannot keep a client secret. The flow matters because the user's credentials never reach the application, which is the entire point: the [authorization server](/docs/protocols-iga/oidc) is the only component that sees the password.

**Why it matters.** The code flow is the most common OAuth flow in the wild and the one interviewers ask to hear walked through. Demonstrating PKCE unprompted signals you know the security history, not just the happy path.

**Likely follow-ups.** Why not return the token directly to the browser? What is a public client? What happens if the code is used twice? What is the difference between the code flow and the implicit flow?

### 2. What is the difference between SAML and OIDC, and when do you choose one?

**Concise answer.** SAML 2.0 is the enterprise SSO protocol, XML-based, built for web browser flows. OIDC is the modern protocol built on OAuth 2.0, JSON-based, built for APIs and mobile. Choose SAML for traditional enterprise apps and government federations; choose OIDC for everything new.

**Detailed explanation.** Both are federation protocols: the user authenticates at the identity provider and receives proof the application accepts. [SAML](/docs/protocols-iga/saml) communicates in XML assertions, is designed for browser redirects, and is entrenched in enterprise software, government, and legacy platforms. [OIDC](/docs/protocols-iga/oidc) rides on OAuth 2.0: the ID token (a JWT) carries identity claims, and the access token enables API calls, which SAML cannot do natively. The practical comparison: SAML is a single-purpose authentication protocol; OIDC is authentication plus API access, which is why modern SaaS supports OIDC or both. The choice is usually dictated by the application: enterprise platforms expose SAML metadata, developer platforms expose OIDC discovery. The answer that impresses: evaluate on the application's capabilities and the ecosystem, then standardize on OIDC where the choice is free, because it is simpler, JSON-native, and API-compatible.

**Why it matters.** This is the single most-asked protocol comparison in identity interviews. A clean answer shows you can evaluate technologies by capability rather than by familiarity.

**Likely follow-ups.** What is SAML metadata? What is an assertion vs an ID token? Can SAML be used for API authorization? What is OIDC discovery?

### 3. What is a SAML assertion, and what does it contain?

**Concise answer.** A SAML assertion is an XML document issued by the identity provider that proves the user authenticated and carries identity attributes, signed so the service provider can validate it.

**Detailed explanation.** The assertion contains: the issuer (the IdP's entity ID), the subject (the user's NameID and optional attributes), the authentication statement (when and how the user authenticated), the attribute statement (identity attributes like email and department), and the conditions (validity window and audience restriction). The [signature](/docs/protocols-iga/saml) covers the document so the SP can verify it was issued by the trusted IdP and not modified. The SP validates several things independently: the signature, the audience (the assertion must be intended for this SP), the validity window (notBefore and notOnOrAfter), and the destination. A failure in any check rejects the assertion, which is why [SAML troubleshooting](/docs/scenarios/troubleshooting-saml) is mostly a matter of reading which check failed.

**Why it matters.** Describing an assertion precisely shows you understand what the SP actually validates, which is the difference between knowing SAML and knowing that SAML exists.

**Likely follow-ups.** What is the difference between an assertion and a response? What happens when the assertion clock is skewed? What is the audience restriction for?

### 4. What is a JWT, and why is it not the answer to everything?

**Concise answer.** A JWT is a signed, structured token: a header, a payload of claims, and a signature. It is good for conveying verified claims between parties, but it is not a session, it is not encrypted by default, and it cannot be revoked without infrastructure.

**Detailed explanation.** The structure: the header names the signing algorithm, the payload carries claims (issuer, subject, audience, expiry, and custom claims), and the signature proves the token was issued by the signer and not modified. The signature is a guarantee of integrity and origin, not confidentiality: the payload is base64, readable by anyone, so sensitive claims require encryption (JWE) or should not be in the token. The design trade-offs: a JWT is stateless, so revocation requires either short lifetimes, a token denylist, or a revocation endpoint; the payload size grows and hits header limits; and algorithm confusion (an attacker swapping the algorithm) is a historical attack class that [validation rules](/docs/protocols-iga/oidc) must guard against. The correct use: short-lived access tokens validated by signature at each service, with refresh tokens and sessions handled by the identity layer.

**Why it matters.** JWTs are popular and misunderstood. The candidate who knows the revocation problem knows why the identity layer still needs state.

**Likely follow-ups.** How do you revoke a JWT? What is the difference between JWS and JWE? Where should you store a JWT in a browser? What is algorithm confusion?

### 5. How does SCIM provisioning work?

**Concise answer.** SCIM is a REST API standard for identity provisioning: the source system pushes users and groups to the target application, and the target stays in sync without human intervention.

**Detailed explanation.** The identity provider or IGA system acts as the SCIM client, calling the application's SCIM endpoints: create, update, delete, and query users and groups. The resource model is standardized (the user schema with `userName`, emails, groups, and an `externalId` for correlation), and operations are idempotent: the client can re-send operations safely, with the `externalId` used to match existing resources. [The sync model](/docs/protocols-iga/scim): full or incremental pushes, with PATCH for updates. The failure modes are operational: token expiry, endpoint changes, uniqueness conflicts, and attribute mapping mismatches, which is why [SCIM troubleshooting](/docs/scenarios/troubleshooting-scim) is a discipline rather than a setup step. SCIM is the provisioning half of the [joiner-mover-leaver](/docs/fundamentals/identity-lifecycle) lifecycle: the directory is the source of truth, and SCIM carries the changes to the applications.

**Why it matters.** SCIM is how identity programs scale past the help desk. Interviewers ask it to see whether you understand the operational loop: source, connector, target, and the reconciliation that catches drift.

**Likely follow-ups.** What is the difference between SCIM and SAML? What is `externalId` for? What happens when the target already has the user? How do you test deprovisioning?

### 6. What is the difference between scopes, roles, and permissions?

**Concise answer.** Permissions are the atomic rights ("read this file"). Roles group permissions for assignment ("editor"). Scopes are OAuth's consent mechanism: the limited set of operations a token is allowed to perform on behalf of the user.

**Detailed explanation.** Permissions are the smallest unit of access and are enforced by the resource. Roles are the assignment unit: a role bundles permissions and is granted to users or groups, which is [RBAC](/docs/fundamentals/authorization) in practice. Scopes exist in the OAuth world: when an application asks for access, it requests scopes, and the token is limited to those scopes ("read:orders" but not "write:orders"). The relationship: scopes constrain what the token can do, roles constrain what the user can do, and both are enforced at different layers. The common confusion is treating a scope as a role or vice versa: a user's role authorizes the application, and the application's scopes limit what the token may express. The security rule: tokens carry the minimum scopes the application needs, and roles carry the minimum permissions the user's job needs.

**Why it matters.** This question separates people who work with identity protocols from people who work with identity products. The layered answer shows you know where each control lives.

**Likely follow-ups.** Can a token's scopes exceed the user's roles? Who grants scopes? What is the relationship between scope and audience?

### 7. What is the difference between OAuth 2.0 and OIDC?

**Concise answer.** OAuth 2.0 is an authorization framework: it issues tokens that let an application act on behalf of the user without seeing the user's credentials. OIDC is an authentication layer on top of OAuth that adds an ID token carrying identity claims, so applications can also know who the user is.

**Detailed explanation.** OAuth answers "can this application access this resource on this user's behalf?" and its output is an access token the resource server validates. OIDC adds the identity question: a third token type, the ID token, is a JWT signed by the IdP with the user's identity claims, and the [discovery document](/docs/protocols-iga/oidc) and userinfo endpoint give the application the standard way to retrieve identity. The architecture: OIDC defines the authentication flow on top of OAuth's authorization flow, which is why OIDC is described as OAuth plus identity. In practice: OAuth alone can authenticate incidentally (the token proves the user approved), but that proof is weak and unstandardized, which is why authentication should use OIDC explicitly. The [layered diagram](/docs/protocols-iga/oidc) shows the relationship: identity band over the authorization band.

**Why it matters.** The pairing is the most common source of protocol confusion in interviews. Stating the relationship precisely ("OAuth authorizes, OIDC authenticates on top") is the answer.

**Likely follow-ups.** What is in the ID token? Can you do OIDC without OAuth? What is userinfo? What is the difference between an access token and an ID token?

### 8. What is an LDAP bind, and how does authentication work against a directory?

**Concise answer.** A bind is the LDAP authentication operation: the client presents a distinguished name and credentials, and the directory validates them. Success establishes an authenticated connection for subsequent operations.

**Detailed explanation.** The client connects to the directory (port 389, or 636 for LDAPS, or StartTLS on 389) and issues a bind request with the user's distinguished name and password. The directory validates the credentials and returns a bind response; success code 0 or failure codes, the most common being [error 49](/docs/scenarios/troubleshooting-ldap), invalid credentials, with a sub-code that names the reason: wrong password, disabled account, expired password, locked account. The bind proves possession of the password, which is why the transport must be encrypted: a clear-text bind over port 389 exposes the credential. After the bind, the connection is authenticated and the client can search and read attributes within its authorization. Bind-based authentication is how applications integrate with directories: the application binds with a service account or binds on behalf of the user.

**Why it matters.** LDAP authentication is still the backbone of enterprise application integration. Knowing the bind operation, the failure codes, and the transport requirements shows operational depth.

**Likely follow-ups.** What does error 49 with data 52e mean? What is the difference between a simple bind and SASL? Why is LDAPS important?

### 9. Why are access tokens short-lived, and what is the role of the refresh token?

**Concise answer.** Access tokens are short-lived to limit the damage if they leak, and refresh tokens are long-lived credentials the application uses to get new access tokens without bothering the user.

**Detailed explanation.** An access token is presented to resource servers on every call, which means it travels through proxies, logs, and caches, and the leak surface is real. A short lifetime (minutes to an hour) bounds the damage: a leaked token expires before it can be abused broadly. The refresh token is held by the application, sent only to the token endpoint, and exchanged for a fresh access token. [The trade-off](/docs/protocols-iga/oauth2): refresh tokens are the actual long-lived credential, so they are protected more strictly: bound to the client, stored securely, rotated on use, and revocable. The session model follows: the user's session lifetime is governed by the refresh token and the IdP's session policy, while the access token only represents the current slice of that session. Revocation works at the refresh layer: killing the refresh token ends the session without waiting for access token expiry.

**Why it matters.** Token lifetime design is a real security decision. The answer shows you understand where the risk lives and which token is the one to protect.

**Likely follow-ups.** How do you revoke a refresh token? What happens when an access token expires mid-request? Should a mobile app store a refresh token?

### 10. What is the difference between a session and a token?

**Concise answer.** A session is server-side state: the server records that a user is authenticated and references it by an identifier. A token is client-side state: the server validates the token's signature and claims without storing anything about it.

**Detailed explanation.** With sessions, the server holds the session record (who, when, expiry), and the client holds only a cookie or identifier; validation is a server lookup, revocation is deleting the record, and scale is a server-side problem. With tokens, the client holds the signed claims and every service validates them locally; revocation requires infrastructure (short lifetimes, denylists, or an auth service), and scale is a validation problem. [The practical model](/docs/protocols-iga/oidc): tokens for API access and distributed services, sessions for the user-facing authentication state, with the refresh token as the bridge. The common architecture is hybrid: the user has a session at the IdP, the session issues short-lived access tokens, and the applications validate tokens without checking with the IdP on every call. The interview distinction: sessions are state, tokens are evidence, and the design chooses which per layer.

**Why it matters.** The question tests architecture judgment. The candidate who can say where each belongs, and what revocation means in each model, can design an authentication flow rather than recite one.

**Likely follow-ups.** How do you scale sessions horizontally? How do you invalidate a session? When would you choose tokens over sessions for a web app?