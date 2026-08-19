---
title: What is IAM
description: "Identity and Access Management defined: what it covers, why organizations run it, and where it sits in the security stack."
---

# What is IAM

Identity and Access Management (IAM) is the discipline of managing who can access what, under what conditions, and proving that the answer stays correct over time. It covers two connected halves: identity (the digital representation of a person, device, or service) and access (the permissions that identity holds).

This section of the site covers the fundamentals: what IAM is, the AAA model, the identity lifecycle, the principles of least privilege and zero trust, and the two core mechanisms of authentication and authorization. Later sections build on these concepts with the protocols that implement them (SAML, OAuth, OIDC, LDAP, SCIM) and the operational layer of PAM.

## What IAM manages

An IAM system typically concerns itself with these objects:

| Object | What it is | Example |
|---|---|---|
| Identity | A unique digital record for a person, device, or service | `a.mansour@example.com` |
| Account | A credential-bearing record on a specific system | The same person's account on the file server |
| Attribute | A fact attached to an identity | Department, location, employment status |
| Entitlement | A permission granted to an identity or group | "Can approve travel expenses" |
| Group / Role | A named collection of entitlements | `finance-managers` |

The same person often holds many accounts across many systems, and that spread is exactly the problem IAM exists to solve. Without a central view, access accumulates silently: every system has its own admin, its own account records, and its own idea of who a person is.

## Why organizations run IAM

The reasons are operational, security, and regulatory, and they reinforce each other:

- **Controlled access.** People get the access their work requires and no more. Access is granted deliberately and revoked when it stops being necessary.
- **Auditability.** Every grant, change, and use of access can be traced to a person, a system, and a time. This is a legal requirement in regulated industries (audit, banking, health) and a practical one everywhere else.
- **Reduced exposure.** The costliest incidents in most organizations involve compromised identities. Fewer standing privileges, faster revocation, and stronger authentication all shrink what an attacker gains from a single compromised credential.
- **Operational efficiency.** Joining, moving, and leaving are handled through repeatable processes instead of ad hoc requests to system administrators.
- **Compliance evidence.** Auditors ask for access reviews, segregation of duties checks, and proof of revocation. IAM processes produce that evidence instead of requiring a scramble.

## Where IAM sits in the security stack

IAM is not a single product. It is a set of capabilities that may be delivered by directories (Active Directory, Entra ID), identity providers (Okta, Keycloak, Entra ID), and governance tools, with protocols binding them together. The surrounding layers matter as much as the products:

- **Authentication** answers "who is this?" (this site: [Authentication](05-authentication.md)).
- **Authorization** answers "what may they do?" (this site: [Authorization](06-authorization.md)).
- **Lifecycle processes** keep both answers current as people join, move, and leave ([Identity lifecycle](03-identity-lifecycle.md)).
- **Governance** reviews and certifies that access matches business need.
- **PAM** protects the subset of accounts that hold privileged access ([PAM Core](../pam-core/index.md)).

A useful way to think about scope: IAM governs *everyone's* day-to-day access; PAM governs the dangerous subset that can change the system itself. The two overlap by design, and mature organizations integrate them.

## What IAM is not

- It is not just single sign-on. SSO is one feature that happens to sit inside most IAM products.
- It is not just a directory. A directory stores identities; IAM governs what those identities may do and proves it.
- It is not a one-time project. Identity data decays constantly, and the discipline is the maintenance process as much as the initial build.

Next: the [AAA model](02-aaa-model.md), the three-act structure every access decision follows.