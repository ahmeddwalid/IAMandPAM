---
title: What is PAM
description: "Privileged Access Management defined: the accounts it protects, the difference from IAM, and the problems it exists to solve."
---

# What is PAM

Privileged Access Management (PAM) is the practice of controlling access to the accounts that can change the system itself: administrators, root, service accounts, and any identity whose compromise means game over for the environment. Where IAM answers "who are you, and what may you normally do," PAM answers "who may touch the controls, when, and what did they do while they had them."

## Privileged access defined

An account is privileged when it can do at least one of:

- Change security configuration (policies, permissions, firewall rules)
- Install or modify software and services
- Read or modify data beyond the scope of a normal user
- Create or modify other accounts and grants
- Bypass normal controls (backup, recovery, break-glass)

This is a capability definition, not a title definition. The same person may be an ordinary user for most of the day and privileged for one specific task; what matters to PAM is the state of the account at the moment of use.

## The three problems PAM solves

**1. Shared and anonymous access.** The `root` password, the domain admin credential, or the `sa` account is frequently known by several people and used from multiple machines. If anything goes wrong, the logs show the account, not the person. PAM makes the access personal: the human authenticates with their own identity, and the platform mediates the privileged action.

**2. Standing privilege and credential sprawl.** The classic audit finding is a service account with domain admin rights that nobody remembers granting, or an admin password that has not changed in four years. The longer a credential stands, the more chances it has to leak and the less anyone knows who holds it. PAM programs are largely about inventory and reduction: find the privileged accounts, vault them, rotate them, and eliminate the ones with no owner.

**3. The audit gap.** Compliance frameworks (SOC 2, PCI DSS, ISO 27001) and every serious security team want the answer to "who did what, with which privileged account, when, and was it approved?" Without PAM, that answer is guesswork. With it, the answer comes from the session records and the approval trail.

## PAM versus IAM

| | IAM | PAM |
|---|---|---|
| Who | Everyone: employees, contractors, customers | A small subset: administrators, service accounts |
| What it manages | Day-to-day access to applications and data | Access to the systems that control everything else |
| Key controls | SSO, MFA, lifecycle, least privilege | Vaulting, session brokering, just-in-time grants |
| Failure impact | A user account is compromised | The environment is compromised |

They are complements, not competitors. IAM decides who you are and what you may normally do; PAM decides who may temporarily hold the keys, records what they do with them, and takes the keys back. A mature program runs both on the same identity foundation, which is the model the [complete IAM architecture](/docs/protocols-iga/iam-architecture) page shows.

## What a PAM program contains

Regardless of vendor, a PAM program is built from a small set of components:

- **Discovery and inventory**: finding the privileged accounts that exist (covered in [Privileged account types](privileged-account-types))
- **Vaulting**: encrypted storage with check-out/check-in and rotation ([Core capabilities](core-capabilities))
- **Session management**: brokered, recorded, monitored sessions ([PAM architecture](pam-architecture))
- **Just-in-time access**: ephemeral, time-boxed grants ([JIT access](jit-access))
- **Monitoring and review**: the audit trail that makes everything else credible

The rest of this section is those components in order. The architecture page ties them together, and the [best practices](best-practices) page turns them into rules.

Next: [Privileged account types](privileged-account-types), because scope is the first decision in any PAM program.