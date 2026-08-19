---
title: Service Accounts
description: "Service and machine accounts are the majority of identities in an enterprise: how they are structured, governed, rotated, and monitored."
---
<!-- verified 2026-08-19: gMSA behavior (auto password rotation, 240-character auto-generated passwords, SPN registration) verified against current Microsoft Windows Server documentation. -->

# Service Accounts

Every application, scheduler, and integration runs as someone. That someone is a service account: an identity with a password or key that no human types, created when an application needs to authenticate. Service accounts routinely outnumber human accounts, they hold some of the most powerful permissions in the directory, and they are the least governed objects in most environments: no MFA, no owner review, no rotation, and no lifecycle. This page covers the taxonomy, the governance model, and the monitoring that makes service accounts defensible.

## The taxonomy

| Type | What it is | Where it lives |
|------|-----------|----------------|
| Traditional service account | A user-style account with a password, used by an application or scheduler; may carry an SPN for Kerberos | Active Directory, Entra ID, cloud IAM |
| gMSA (group Managed Service Account) | An AD account whose 240-character random password is automatically rotated by the domain and retrieved by authorized servers; no human ever knows it | Active Directory (Windows Server 2012+) |
| sMSA (standalone Managed Service Account) | A single-server variant of the gMSA idea, replaced in practice by gMSA | Active Directory |
| App registration / service principal | The cloud identity for an application (Entra ID), with secrets or certificates; see the [cloud questions](../interviews/06-cloud-questions.md) page | Entra ID |
| Machine / computer account | The identity of a joined machine itself; a service account's cousin, with the same governance problems | Active Directory |
| Cloud access key / service key | Long-lived credential for programmatic access (AWS access key, API key) | Cloud IAM |

The first question about any service account is which type it is, because the type determines the control: gMSAs and managed identities rotate themselves; traditional service accounts need external rotation; access keys need strict issuance and expiry.

## Why service accounts are the weak point

Service accounts fail for structural reasons, not negligence:

- **No MFA.** A service account authenticates programmatically; there is no human to approve a push. Compensating controls are therefore mandatory: the password is long and random, the account is scoped, and use is monitored.
- **Shared and static.** Teams copy credentials into config files, scripts, and code; the account becomes a standing shared secret. This is exactly what the [Secrets Management](09-secrets-management.md) page exists to remove.
- **Invisible to reviews.** Access certifications review people; service accounts have no "owner review" by default, so they accumulate entitlements across job changes. The [IGA](../protocols-iga/06-iga.md) page's certification loop must explicitly include machine identities.
- **Kerberoastable.** A service account with an SPN and a weak password is the classic [Kerberoasting](../protocols-iga/08-kerberos.md) target: the ticket is encrypted with the account's key, and a human-grade password falls to offline cracking.

## The governance model

The workable model has five parts:

1. **One service account per application and purpose.** No shared accounts across teams; a unique identity per workload is what makes rotation, audit, and revocation possible. "One secret per identity" from the secrets page applies here directly.
2. **An owner, in writing.** Every service account has a named owner (team or application), recorded in the directory description or an asset register. Unowned accounts are orphan candidates and get disabled at review.
3. **Least privilege, reviewed.** Service accounts get the minimum permissions for their function, reviewed in the same certification campaigns as human access, with the account's owner as the certifier.
4. **Rotation by machine, not by calendar.** gMSA where the platform supports it; vault-managed rotation (CPM-style, as in [PAM Core Capabilities](../pam-core/03-core-capabilities.md)) for traditional accounts; short-lived cloud credentials otherwise. Manual rotation on a schedule is how accounts end up rotated never.
5. **A lifecycle endpoint.** The account is disabled and deleted when the application is decommissioned, in the same [joiner-mover-leaver](../fundamentals/03-identity-lifecycle.md) discipline used for people, because decommissioned applications are where orphaned accounts breed.

## Monitoring service accounts

The signals are specific and cheap to collect:

| Signal | What it means | Where it appears |
|--------|---------------|------------------|
| Service ticket requests to an account's SPN | Normal application use, or [Kerberoasting](../protocols-iga/08-kerberos.md) if volume or timing is anomalous | Windows security event 4769 |
| Logon outside expected hosts or hours | The account is used where it should not be | 4624/4625 logon events, correlated with the account's host list |
| Password set when nobody scheduled it | Shadow rotation or compromise | 4724 (password reset requested) |
| Service account in a privileged group | Scope creep; the account is standing-privileged | Group membership change events (4728/4732) |
| gMSA retrieved on an unauthorized host | The account's credentials are being pulled elsewhere | Microsoft-Windows-AAD event 4104 / gMSA retrieval logs |

The pattern is the same as human monitoring from the [Attacks page](08-attack-defense.md): asymmetry in volume, timing, and location. The difference is that service accounts have a smaller legitimate footprint, so anomalies are easier to see once the baseline is known.

## Service accounts in the cloud

The cloud equivalents follow the same rules with better defaults: managed identities rotate automatically, workload identity federation removes the standing secret entirely (covered in the [cloud questions](../interviews/06-cloud-questions.md) page), and AWS access keys should be short-lived via roles rather than permanent IAM user keys. The governance model transfers unchanged: owner, scope, review, rotation, decommission.

## Interview angle

The question "how do you manage service accounts?" has a three-part strong answer: taxonomy first (which kind of account, which control applies), governance second (owner, scope, rotation, lifecycle), and monitoring third (ticket and logon anomalies). The detail that separates candidates: naming gMSA's self-rotation and Kerberoasting as the reason weak service passwords are a real finding. The follow-up "how do you find orphaned service accounts" is answered with the review loop: ownerless accounts, accounts with no logon in the review window, and accounts whose applications are decommissioned.