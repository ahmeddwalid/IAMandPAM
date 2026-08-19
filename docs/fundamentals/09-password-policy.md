---
title: Password Policy Design
description: "What NIST 800-63 actually says about passwords, what enterprises actually run, and how to design a password policy that survives both auditors and users."
---
<!-- verified 2026-08-19: NIST SP 800-63B / 800-63-4 password rules (length over complexity, no forced rotation, breach screening) verified against the current NIST 800-63-4 digital identity guidelines. -->

# Password Policy Design

Few topics produce more confidently wrong answers in interviews than password policy. The old orthodoxy was complexity plus forced rotation: "Change every 90 days, must include uppercase, number, and symbol." NIST's guidance has disagreed with that since 2017, and enterprise practice is catching up slowly. This page covers what NIST SP 800-63B says, why the legacy rules made security worse, and how to design a policy that is defensible to auditors and usable by humans.

## What NIST actually says

NIST SP 800-63B (now SP 800-63-4) is the standard the industry cites, and its password rules are specific:

| Rule | What it means | The legacy rule it replaced |
|------|---------------|----------------------------|
| Length over complexity | Minimum of 8 characters; longer is better. No mandatory composition (uppercase/number/symbol) requirements | "Must include 3 of 4 character classes" |
| No forced rotation | Do not require periodic password changes unless there is evidence of compromise | "Change every 90 days" |
| Screen against breaches | Check every new password against a list of known breached passwords and common passwords | No such check |
| Allow password managers | Permit paste and manager-generated passwords; do not block them | Blocking paste in fields |
| No hints or secret questions | Do not offer password hints or knowledge-based recovery questions | "Mother's maiden name" style questions |
| Store salted hashes | Store passwords as salted, slow hashes (bcrypt/argon2 class), never plaintext or fast hashes | Storing with fast hashes or reversible encryption |

The reasoning is empirical. Composition rules do not make passwords stronger; they make them harder to remember, which pushes users toward predictable patterns (`Password1!`) and reuse. Forced rotation does not meaningfully reduce compromise risk, but it does increase help-desk volume, credential write-downs, and reuse. The two controls that measurably matter are length (which defeats most offline guessing) and breach screening (which kills the passwords attackers already have).

## What enterprises actually run

Real-world policy is a negotiation between NIST, auditors, and legacy systems:

- **The minimum floor**: 8 characters minimum, 12-16 encouraged, with breach screening. Most modern identity platforms ship this: Entra ID's default password policy and its Password Protection blocklist, and the same screening in Okta and Google Workspace.
- **The rotation compromise**: where auditors still demand rotation, the practical answer is to rotate *privileged* accounts (which have real compromise exposure) and exempt user accounts, or to justify the exemption with breach screening plus MFA. PAM platforms automate privileged rotation (see [PAM Best Practices](../pam-core/04-best-practices.md)), which makes the compromise easier to defend.
- **MFA changes the math**: with phishing-resistant MFA on the account, the password matters far less, which is the argument for pairing a relaxed password policy with a strict MFA policy. The [Passwordless page](08-passwordless.md) shows where that trajectory ends.
- **Lockout and rate limits**: these still exist and should. The NIST guidance does not remove account lockout or throttling; it removes the *composition* and *rotation* rules, which were never the point.

## Designing a policy

A defensible password policy has four parts, each with an owner and a technical control:

| Policy component | Technical control | Owner |
|------------------|-------------------|-------|
| Minimum length 12+, no composition rules | Identity platform policy; enforced at password set/reset | Identity team |
| Breach screening | Platform blocklist (Entra Password Protection, Okta, self-hosted blocklists) | Identity team |
| No forced user rotation; rotation for privileged accounts | Conditional/privileged rotation via PAM, not a global domain policy | PAM team |
| MFA on all remote and privileged access | Conditional access / risk policies | Security team |

The one sentence that sells it: *length and screening stop the attacks that actually happen; rotation and complexity only stopped the attacks we imagined.*

## Legacy and edge cases

- **Legacy systems** that cannot check composition-free policies or screening: isolate them, document the compensating control (network segmentation, MFA at the front door), and treat them as exceptions with a review date.
- **Service accounts** are a different problem entirely: their passwords should be long, random, unique, and rotated by a vault or gMSA, not governed by a human password policy. That is the [Service Accounts](../pam-core/10-service-accounts.md) page's subject.
- **Breach-driven resets**: when a breach is confirmed, a targeted reset of affected accounts is correct. The error is *scheduled* reset without evidence, which is the rotation rule NIST removed.
- **Recovery**: self-service password reset with strong identity proofing beats help-desk resets; the [MFA enrollment and recovery](../scenarios/06-mfa-enrollment-recovery.md) page covers the enrollment side.

## Interview angle

The question is usually "what do you think of password complexity requirements?" The strong answer has three beats: NIST's guidance is length plus breach screening plus no forced rotation; the legacy rules measurably worsened usability without improving security; and in practice you sell the change with MFA as the compensating strength. Then, if pushed: the privileged-account exception (rotation stays for privileged accounts) and the legacy-system exception. That answer names the standard, the evidence, and the political reality, which is the whole topic.