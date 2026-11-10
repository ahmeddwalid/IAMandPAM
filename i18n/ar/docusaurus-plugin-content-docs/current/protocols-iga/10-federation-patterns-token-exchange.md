---
title: "Advanced Federation and Token Exchange (RFC 8693)"
description: "OAuth 2.0 Token Exchange (RFC 8693), microservice token delegation, Identity Brokering, and Shared Signals and Events (CAEP/RISC)."
---
<!-- verified 2026-09-17 -->

import KnowledgeCheck from '@site/src/components/KnowledgeCheck';

# Advanced Federation and Token Exchange (RFC 8693)

In complex enterprise architectures, authentication is rarely a single hop between one browser and one monolithic backend. Instead, requests flow through API gateways, identity brokers, and distributed microservices spanning multiple cloud providers and on-premises data centers.

Handling identity across these multi-tier service chains presents severe security trade-offs:
- **Anti-Pattern 1: Credential Forwarding**: Passing the user's raw incoming JWT across every downstream microservice. This violates least privilege; any downstream service holding the primary access token can impersonate the user across all other enterprise APIs.
- **Anti-Pattern 2: Service-Only Auth**: Dropping the user's identity entirely at the gateway and having microservices communicate using static client credentials. This breaks auditability; backend logs show actions performed by "Service-B", completely obscuring which human user initiated the transaction.

**RFC 8693 (OAuth 2.0 Token Exchange)** provides the standardized cryptographic mechanism to solve this dilemma.

---

## 1. RFC 8693 Token Exchange Mechanics

RFC 8693 defines a formal OAuth 2.0 grant type allowing a client to exchange an existing security token (e.g., an incoming user JWT) for a new, downscoped token tailored specifically for a target downstream resource.

### The Token Exchange Request:
The intermediary service (Service A) posts a request to the authorization server's `/token` endpoint:

```http
POST /token HTTP/1.1
Host: authz.enterprise.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&client_id=service-a-gateway
&client_secret=secret-value
&subject_token=eyJhbGciOiJSUzI1NiIs...
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&audience=https://payments.internal.api
&scope=read:transactions
```

### Key Request Parameters:
1. `grant_type`: Must be `urn:ietf:params:oauth:grant-type:token-exchange`.
2. `subject_token`: The original security token representing the identity requesting access (e.g., the user's primary access token).
3. `subject_token_type`: URI identifier specifying the token format (e.g., access token, ID token, SAML 2.0 assertion).
4. `actor_token` *(Optional)*: An auxiliary token representing the intermediary acting on behalf of the subject.
5. `audience` / `resource`: Restricts the newly issued token so it is cryptographically valid **only** for the designated downstream microservice (e.g., the Payments API).
6. `scope`: Downscopes the permissions so the new token holds only the minimum subset of privileges needed for the downstream task.

---

## 2. Delegation vs Impersonation

RFC 8693 explicitly distinguishes between two security relationship models:

```
[Impersonation]
User Alice ---> [Service A] ===(token with sub: Alice, no actor)====> [Service B]
(Service B cannot verify whether Alice called it directly or via Service A)

[Delegation]
User Alice ---> [Service A] ===(token with sub: Alice + act: Service A)==> [Service B]
(Service B knows Alice is the subject AND Service A is the authorized actor)
```

### Delegation Token Structure (The `act` Claim):
When using delegation, the Authorization Server mints a token containing an **actor claim (`act`)** specified in RFC 8693 Section 4.1:

```json
{
  "iss": "https://authz.enterprise.com",
  "sub": "user_alice_4921",
  "aud": "https://payments.internal.api",
  "scope": "read:transactions",
  "exp": 1726588800,
  "act": {
    "sub": "service-a-gateway"
  }
}
```

When the Payments API receives this token, its audit trail can record both entities:
- **Principal Subject**: `user_alice_4921` (account balance retrieved for Alice).
- **Executing Actor**: `service-a-gateway` (call originated through the authorized gateway).

If `service-a-gateway` is subsequently breached, security analysts can query SIEM logs specifically for transactions where `act.sub == "service-a-gateway"`.

---

## 3. Identity Brokering and Protocol Bridging

In large enterprise mergers or legacy transitions, organizations maintain an **Identity Broker** (such as Keycloak, PingFederate, or Okta). The broker acts as an abstraction layer:
- **Inbound**: Connects to external Identity Providers using SAML 2.0 (e.g., Active Directory Federation Services or partner IdPs).
- **Translation Engine**: Normalizes disparate user attributes, translates SAML attribute statements into standardized OIDC claims, and maps legacy group SIDs into application-level roles.
- **Outbound**: Mints modern OAuth 2.0 / OIDC JWTs for modern cloud-native applications.

This prevents individual developers from having to configure complex XML signature parsers and SAML metadata endpoints in microservices.

---

## 4. Real-Time Revocation: CAEP and RISC (RFC 8935 / 8936)

Traditional stateless JWTs suffer from a major architectural weakness: **the revocation latency window**. Once issued, a JWT remains valid until its expiration timestamp (`exp`), even if:
- The user's account is disabled in HR systems.
- The user's session is terminated due to a reported device theft.
- The IdP detects an impossible travel anomaly.

The OpenID Foundation standardizes **Continuous Access Evaluation Profile (CAEP)** and **Risk Incident Sharing and Coordination (RISC)** to solve this:

```
[Identity Provider] ============= Push Event Stream (RFC 8935 SSE) =============> [Relying Parties / APIs]
(detects threat /                                                                (immediately invalidates
 password change)      Event: session-revoked / credential-compromised            active cached sessions)
```

Instead of requiring APIs to poll the IdP on every request, the IdP pushes cryptographically signed Security Event Tokens (SETs) over an HTTP webhook:

```json
{
  "iss": "https://idp.enterprise.com",
  "iat": 1726585200,
  "jti": "event-981240-uuid",
  "aud": "https://api.enterprise.com",
  "events": {
    "https://schemas.openid.net/secevent/caep/event-type/session-revoked": {
      "subject": {
        "format": "iss_sub",
        "iss": "https://idp.enterprise.com",
        "sub": "user_bob_881"
      },
      "initiating_entity": "admin",
      "reason": "Compromised credential alert from SOC"
    }
  }
}
```

Downstream APIs intercepting this event immediately purge Bob's tokens from local memory caches, terminating active sessions within milliseconds across all services.

---

<KnowledgeCheck
  question="In a microservice architecture, why is the RFC 8693 delegation pattern with an 'act' claim preferred over simple user credential forwarding?"
  options={[
    {
      id: "A",
      text: "It increases the lifetime of the access token to prevent re-authentication.",
      isCorrect: false,
      explanation: "Delegation tokens are typically shorter-lived and downscoped, not longer-lived."
    },
    {
      id: "B",
      text: "It downscopes the token for the specific downstream service and cryptographically preserves both the human subject (sub) and the calling service (act), maintaining full audit accountability and containing compromise blast radius.",
      isCorrect: true,
      explanation: "By issuing a target-specific audience token with an explicit 'act' claim, downstream services cannot abuse the token on unrelated APIs, and logs accurately reflect both the human initiator and the machine intermediary."
    },
    {
      id: "C",
      text: "It bypasses all TLS encryption requirements between internal microservices.",
      isCorrect: false,
      explanation: "Internal microservice communication still requires mTLS encryption; token exchange handles application-layer identity."
    },
    {
      id: "D",
      text: "It eliminates the need for an Authorization Server.",
      isCorrect: false,
      explanation: "RFC 8693 specifically relies on an Authorization Server to validate the subject token and issue the exchanged token."
    }
  ]}
  takeaway="Never pass raw frontend user tokens deep into backend microservices. Use RFC 8693 token exchange to issue downscoped, audience-restricted tokens carrying explicit delegation claims."
/>
