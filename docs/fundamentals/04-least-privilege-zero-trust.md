---
title: Least Privilege & Zero Trust
description: "The two principles that decide how much access anyone holds: least privilege as the operating rule, zero trust as the enforcement model."
---

# Least Privilege & Zero Trust

Least privilege and zero trust are the principles that decide how much access anyone holds, and they appear constantly in IAM and PAM work. They are related but distinct: least privilege is the operating rule about how much access to grant, and zero trust is the enforcement model that assumes access must be re-verified rather than assumed. This page treats both at the conceptual level; the full architecture diagrams live in [PAM Core](../pam-core/index.md), where JIT access and standing-privilege elimination are covered.

## Least privilege

**Least privilege** is the rule that an identity should hold the minimum access needed to perform its function, no more, and only for as long as it is needed.

The rule applies to people, but also to everything that acts: service accounts, APIs, cloud roles, and devices. A web server that only needs to read a configuration file should not hold database write permissions; a backup account does not need interactive login.

Why it matters:

- **Blast radius.** If an identity is compromised, the attacker inherits its access. Smaller grants mean a compromised identity does less damage.
- **Insider risk.** Malicious or careless insiders can only misuse what they hold.
- **Compliance.** Regulators and auditors treat excessive access as a control deficiency, particularly around financial systems and personal data.

What it costs:

- **Operational friction.** Grants must be managed, reviewed, and adjusted as needs change. Granting everything up front is cheaper in the short term and catastrophic later.
- **Support load.** Users hit denials and need exceptions, which means least privilege needs a working exception process (request, approval, review) to survive contact with reality.

The practical lever for least privilege in IAM is role design: well-scoped roles that map to real job functions, granted by assignment, reviewed on a schedule. The more extreme lever is **just-in-time access** (JIT): holding no standing access at all and obtaining elevation for a specific task with a time limit. JIT is a PAM capability and gets its own treatment in [PAM Core](../pam-core/index.md).

## Zero trust

**Zero trust** is the security model that treats every request as untrusted until proven otherwise, regardless of where it originates. Its central claim is that network location must not imply trust: being "inside the corporate network" or "on the VPN" is not, by itself, a reason to grant access.

The model rests on a few working assumptions:

- The network is hostile, including the internal one. Assume compromise rather than waiting for proof of it.
- Access decisions are made per request, per session, with the full context: identity, device state, location, data sensitivity.
- Identity is the new perimeter. When there is no trusted network boundary, the identity and its evidence become the primary control point, which is why zero trust programs are often led by the IAM team.
- Access is granted dynamically, revoked when no longer justified, and continuously evaluated.

In practical deployments this shows up as: strong authentication with phishing-resistant MFA, device posture checks, microsegmentation (network policy that restricts lateral movement), and short-lived, scoped credentials. The identity layer is where most of the work happens: verifying who is asking, with what device, and whether the request is normal for that identity.

## How they fit together

The two principles reinforce each other:

- Least privilege answers *how much* access an identity should hold (as little as works).
- Zero trust answers *when* that access should be honored (only when verified, and only for as long as needed).

A zero-trust environment without least privilege still accumulates broad standing access, and least privilege without zero trust still assumes that verified-once equals trusted-forever. Mature programs apply both: least privilege at design time, zero trust at run time.

The sharpest expression of both together is **JIT access**: no standing privilege, elevation on verified request, automatic revocation. That pattern, and the architecture that supports it, is covered in [PAM Core](../pam-core/index.md).

Next: [Authentication](05-authentication.md), the first half of the access decision, and how modern methods replaced the password.