---
title: "CyberArk"
description: "CyberArk architecture and components, the Defender and Sentry certification track, and a realistic implementation scenario."
---
<!-- verified 2026-08-18: exam names, eligibility, delivery mode, and corporate status verified against CyberArk's certification site and public acquisition announcements. Exam prices change; confirm at purchase time. -->

# CyberArk

CyberArk is the reference implementation of the [complete PAM architecture](/docs/pam-core/pam-architecture) on this site. Its Privileged Access Security (PAS) product line is the origin of the vault-plus-session-manager pattern that every other PAM vendor now sells in some form.

**Corporate status.** Palo Alto Networks announced its intent to acquire CyberArk in July 2025 and completed the acquisition on February 11, 2026. CyberArk operates within Palo Alto Networks under the name Idira, and its product lines continue to be sold and developed under their own brand and roadmap. If an interviewer asks about the acquisition, the current facts are: completed February 2026, products standalone, brand transition to Idira.

## The components

The PAS architecture maps one-to-one onto the components of the [PAM architecture](/docs/pam-core/pam-architecture) page:

| Component | Name | Role in the architecture |
|---|---|---|
| Vault | Digital Vault | The encrypted credential store and policy database. The security kernel of the whole product: all other components authenticate to it |
| Session manager | Privileged Session Manager (PSM) | Brokers and records privileged sessions (SSH, RDP, database, web). The admin connects to the PSM, never directly to the target |
| Rotation and discovery | Central Policy Manager (CPM) | Detects new privileged accounts, applies password policies, rotates credentials on schedule or on events |
| User portal | Privileged Access Web Access (PVWA) | The web interface: request access, check out credentials, approve requests, launch sessions |
| Threat analytics | Privileged Threat Analytics (PTA) | Correlates vault and session logs for behavioral signals on privileged accounts |
| Machine identity | Conjur | Secrets management for applications and workloads: API keys, SSH keys, database credentials consumed by machines rather than people |
| Application identity | Application Identity Manager (AIM) | Retrieves credentials from the vault on behalf of applications, programmatically |

Two properties distinguish CyberArk's design and matter for interviews:

- **The vault is the security boundary.** Every component, including the PSM, must authenticate to the vault before it can retrieve a credential. Compromising the web portal does not give access to stored secrets.
- **The PSM isolates the credential from the human.** The admin never sees the password; the PSM injects it into the session, which is the same rule the [PAM architecture](/docs/pam-core/pam-architecture) page calls the "credential never reaches the person" property.

## The certification track

Verified against CyberArk's certification pages on 2026-08-18:

- **Levels**: Defender (foundation) and Sentry (advanced), with product-specific exams at each level.
- **Defender exams**: PAM-DEF (Privileged Access Manager Defender), ACC-DEF (Access Control Defender), EPM-DEF (Endpoint Privilege Manager Defender).
- **Sentry exams**: PAM-SEN, CPC-SEN, SECRET-SEN (Secret Manager Sentry).
- **Format**: 90 minutes, 65 questions, passing score 70%. Delivered exclusively in person at Pearson VUE testing centers. CyberArk discontinued remote (OnVUE) delivery on November 1, 2025, so there is no online option to plan around.
- **Prerequisites**: PAM-SEN requires PAM-DEF first. CyberArk recommends roughly six months of hands-on platform experience before sitting a Defender exam; this is a recommendation about readiness, not a registration block.
- **Cost**: the Sentry exam is reported at around USD 300, but prices are set at purchase time through Pearson VUE, so confirm the current figure before stating it. Defender pricing was not verified.
- **Renewal**: Defender-level certifications are valid for two years and require recertification.

The eligibility point matters for career planning: because the exams expect hands-on experience first, CyberArk certification is a mid-career credential, not an entry point. The [careers](/docs/careers/) section covers how that fits a job search.

## A realistic implementation scenario

Suppose a regional bank with 400 staff and 60 servers decides to deploy CyberArk. The scenario is hypothetical but the steps are the ones a real engagement follows:

1. **Discovery.** Run the CPM discovery scanners against Active Directory, the servers, and the database estate. The result is an inventory: roughly 800 privileged accounts, most of them local administrators with identical, known passwords. This is the [account inventory](/docs/pam-core/privileged-account-types) step, made concrete.
2. **Vault the humans.** Domain admins and server admins move into the vault. Their daily work happens through PSM-brokered sessions instead of direct logins, and their real credentials rotate on a 30-day schedule.
3. **Vault the machines.** Application accounts that connect to databases move to Conjur or AIM so the database password exists only inside the vault.
4. **Remove the shared password.** The identical local admin passwords are randomized per machine, eliminating the lateral-movement path that made them dangerous.
5. **Add JIT for change windows.** Emergency access and vendor access use time-boxed check-outs with approval workflows instead of standing entitlements, the [JIT pattern](/docs/pam-core/jit-access) page describes.
6. **Connect the audit trail.** Vault events and session recordings stream to the SIEM, and session requests carry ticket numbers, closing the [ticketing integration](/docs/pam-core/pam-architecture) loop.

The pattern is identical to the one on the [PAM architecture](/docs/pam-core/pam-architecture) page. CyberArk's contribution is that the components are productized, which is exactly what an implementation project buys.

## Where it fits

CyberArk is the enterprise PAM leader and the vendor with the deepest certification ecosystem, which makes it the most likely answer to "which PAM tool have you used" in job ads. It is also the most complex to operate. The [Delinea](03-delinea.md) and [BeyondTrust](04-beyondtrust.md) pages cover the alternatives, and [comparison and evaluation](08-vendor-comparison.md) compares all three on the criteria that matter.

Next: [Delinea](03-delinea.md), the mid-market alternative with a different deployment model.