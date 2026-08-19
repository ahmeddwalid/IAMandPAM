---
title: Vendor and External Access
description: "How enterprises grant access to vendors, partners, and contractors: external identity models, lifecycle governance, and privileged vendor access."
---
<!-- verified 2026-08-19: Entra External ID / B2B collaboration naming and external-identity governance features (guest lifecycle, access reviews, conditional access applicability) verified against current Microsoft documentation. -->

# Vendor and External Access

Every enterprise shares its systems with outsiders: a support vendor who administers a firewall, a payroll partner who receives data, a contractor who needs the same applications as employees. External access is identity management's edge case: the identities are not employees, they have no internal lifecycle events, and they carry the same risk as internal users with less visibility. This page covers the models for external identity, the lifecycle discipline, and the privileged-vendor variant that PAM exists to control.

## The three models

| Model | How it works | When it fits |
|-------|--------------|--------------|
| Local accounts | The vendor's staff get accounts in your directory or application | Small shops, legacy systems; the highest maintenance and risk |
| Federation | The vendor's own IdP authenticates its staff into your systems via SAML/OIDC trust | Vendors with mature identity; transfers the identity burden but imports their risk |
| B2B collaboration / external identities | External identities managed as guests in your platform (Entra External ID, including B2B collaboration; AWS IAM Identity Center with an external IdP) | The modern default: guests get your policies, your reviews, and your lifecycle |

The modern default is the third: the guest model gives you *control* over access (policies, MFA, reviews) while keeping the *identity* with the vendor. The [SaaS SSO integration](../scenarios/07-saas-sso-integration.md) and [cloud IAM](../vendors/06-cloud-iam.md) pages describe the federation mechanics; the choice above is about where the identity lives and who governs it.

## Lifecycle for external identities

External identities fail exactly where employee identities succeed: the lifecycle. There is no HR event for a vendor account, so the lifecycle must be built differently:

- **Request with a sponsor**: vendor access is requested by the business owner, with the vendor, the scope, and the end date stated at request time. The request is the joiner event; without it there is no lifecycle at all. This is the [privileged access request](../scenarios/04-privileged-access-request.md) workflow applied to non-employees.
- **Time-boxed by default**: vendor access is granted with an expiry (contract term, engagement end date), and renewal is an explicit act, not silence. The [JIT Access](../pam-core/07-jit-access.md) discipline applies to vendors first, because vendors are the access with the least internal visibility.
- **Review with the business owner**: external accounts are included in certification campaigns, certified by the sponsoring business owner rather than a directory team that does not know the vendor. The [IGA](../protocols-iga/06-iga.md) loop covers external accounts the same way it covers employees.
- **Termination by contract**: when the contract ends, access ends. The deprovisioning must be triggered by the contract system, not by a directory scan noticing the account later. The [termination](../scenarios/03-termination.md) playbook applies, with the contract as the source of truth.

The phrase that summarizes it: external identities need a *sponsor* where employees have an *HR event*. Everything else is the same discipline with different triggers.

## Privileged vendor access

The dangerous variant is the vendor who administers infrastructure: the remote support vendor with domain admin rights, or the database vendor with production credentials. The rules tighten:

- **No standing privileged access.** The vendor gets a JIT elevation path or a PAM-brokered session with approval, never a standing admin account. PAM platforms call this vendor access management: the vendor's staff authenticate as themselves (often federated from the vendor's IdP), and the platform grants the target session per request, records it, and can revoke it live. The [PAM session and integration troubleshooting](../scenarios/10-troubleshooting-pam.md) page covers the operational side of brokered sessions.
- **Brokered, not shared**: vendor sessions are brokered through the PAM layer so the target password is never known to the vendor; the platform injects it. This is the [core capability](../pam-core/03-core-capabilities.md) of credential brokering applied to third parties.
- **Session recording for the vendor's scope**: vendor sessions are recorded and reviewed like any privileged session, with the review owned by the business sponsor. The [session review playbook](../scenarios/16-incident-insider-threat-session-review.md) is the template.
- **MFA at the vendor's boundary and yours**: the vendor authenticates with its own MFA at its IdP, and your platform adds its own challenge at the trust boundary. Defense in depth across the federation.

## The failure modes

| Failure mode | What it looks like | The control that prevents it |
|--------------|--------------------|------------------------------|
| Shared vendor accounts | One "support" account used by the whole vendor team | Named external identities, federated or guest, per individual |
| Perpetual access | Vendor accounts from five years ago still active | Time-boxed grants, contract-driven termination |
| Standing admin for support | Vendor has domain admin because "they might need it" | JIT elevation, brokered sessions, least privilege per task |
| No review owner | Vendor access certified by nobody because nobody owns it | Sponsor-based certification with the business owner |
| Terminated vendor staff still inside | Access survives the individual's departure from the vendor | Federated identity transfers termination to the vendor, with your own review as the backstop |

## Interview angle

External access is where interviewers probe whether you understand risk transfer. The strong answer: external identities are managed as guests with your policies and reviews, not as strangers with local accounts; lifecycle is driven by a sponsor and a contract date, not by HR; and privileged vendor access is brokered through PAM with JIT elevation and session recording, never granted standing. The follow-up "what if the vendor's IdP is compromised?" is answered with the trust boundary: your platform still applies its own MFA and policies at your side of the federation, which is why the guest model is stronger than plain federation.