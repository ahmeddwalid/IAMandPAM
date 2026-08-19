---
title: IAM Fundamentals
description: "The foundations of identity and access management: what IAM is, the AAA model, the identity lifecycle, least privilege, authentication, and authorization."
---

# IAM Fundamentals

This section is the foundation for everything else on the site. It answers the questions that the protocol, PAM, and vendor sections all assume: what IAM is, how access decisions are structured, how identity records stay current, and which principles decide how much access anyone holds.

## In this section

- **[What is IAM](01-what-is-iam.md)** - the scope of the discipline: identities, accounts, entitlements, and why organizations run it.
- **[The AAA Model](02-aaa-model.md)** - authentication, authorization, and accounting: the three stages behind every access decision.
- **[Identity Lifecycle](03-identity-lifecycle.md)** - joiner, mover, leaver: the process states an identity passes through, and where access risk actually accumulates.
- **[Least Privilege & Zero Trust](04-least-privilege-zero-trust.md)** - the principles that decide how much access anyone holds, and the enforcement model that verifies it.
- **[Authentication](05-authentication.md)** - how identity is proven: why passwords are no longer sufficient, MFA, passwordless, and SSO.
- **[Authorization](06-authorization.md)** - how access is decided: RBAC, ABAC, PBAC, and externalized policy.

## Suggested order

Read the pages in order. The AAA model gives you the structure that authentication and authorization fill in; the lifecycle explains why the directory stays honest; least privilege and zero trust set the bar that the rest of the site's content measures against. The [Identity Protocols & IGA](../protocols-iga/index.md) section then shows how these concepts are implemented across systems.