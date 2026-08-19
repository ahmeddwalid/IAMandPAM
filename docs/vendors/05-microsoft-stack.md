---
title: "The Microsoft Identity Stack"
description: "On-prem Active Directory, Entra ID, Conditional Access, PIM, and MIM, with the hybrid identity architecture."
---
<!-- verified 2026-08-18: MIM support end date, Cloud Sync transition timing, and PIM Conditional Access integration verified against Microsoft Learn and the Microsoft Entra blog. -->

# The Microsoft Identity Stack

Microsoft's identity stack is the default in most enterprises for one structural reason: the directory existed before the cloud, and the cloud identity service was built to extend it rather than replace it. Understanding this stack is not optional for an IAM career; most other tools in this section integrate with it.

## On-premises Active Directory

Active Directory (AD) is the on-premises identity authority: a directory service holding users, computers, groups, and policies, with its own authentication protocol (Kerberos) and management model.

- **Domains** are the administrative and security boundary. One domain is a single directory partition with its own password and policy store.
- **Forests** group domains that share a common schema and trust topology. A forest is the widest security boundary; schema changes apply forest-wide.
- **Trusts** let users in one domain authenticate against resources in another. Trust direction and transitivity define who can reach what across the forest.
- **Group Policy (GPOs)** applies configuration and security settings to users and computers: password policy, software restrictions, logon scripts.

For IAM purposes, AD is where most identities and almost all privileged accounts live, which is why every [PAM vendor](/docs/vendors/major-vendors) ships an AD discovery scanner.

## Entra ID

Entra ID (formerly Azure Active Directory) is Microsoft's cloud identity service. It is not "AD in the cloud": it is a different directory with a different protocol surface (OIDC/SAML instead of Kerberos/LDAP), and the two are connected rather than merged.

**Hybrid identity** is the connecting pattern: on-prem AD and Entra ID hold the same users, synchronized so one identity works in both worlds. The [hybrid identity architecture diagram](#hybrid-identity-architecture) at the end of this page shows the shape.

**Privileged Identity Management (PIM)** is Entra ID's just-in-time privileged access: role activation with time limits, approval, and audit. PIM activation is the same [JIT pattern](/docs/pam-core/jit-access) as a PAM check-out, native to the identity platform. In 2026, PIM role activation also supports reauthentication through Conditional Access policies, so an admin activating a privileged role can be required to pass MFA again at activation time.

**Conditional Access** is the policy engine that runs at every sign-in: signals (user, device compliance, location, risk) decide whether access is granted, challenged, or blocked. It is the [policy enforcement](/docs/fundamentals/authorization) layer for cloud applications, and the closest thing to a zero-trust enforcement point that ships with the identity platform.

## The sync path

Synchronization between AD and Entra ID runs through **Entra Connect Sync** (the older, heavier server-based tool) or **Entra Cloud Sync** (the newer, lighter agent-based service). Microsoft announced in April 2026 that Connect Sync transitions to Cloud Sync, with phased migration windows starting July 2026. Authentication itself is separate from sync:

- **Password Hash Sync**: only a hash of the AD password is stored in Entra ID. The password itself never leaves AD.
- **Pass-through Authentication**: the cloud sign-in is proxied to AD for validation; no password material is stored in the cloud.
- **Federation (ADFS)**: authentication happens at an on-premises identity provider, with Entra ID trusting its assertions.
- **Seamless SSO**: users signing in to cloud services are recognized as domain users and skip a second password prompt.

## Identity Manager (MIM)

Microsoft Identity Manager is the on-premises identity lifecycle tool: it imports from HR systems and other sources of authority, synchronizes between directories and applications, and runs workflow-driven provisioning for on-premises targets that the cloud cannot reach.

Current status, verified 2026-08-18:

- **MIM 2016 SP3** is the current service pack, adding support for newer platform versions and Azure SQL Database for the Sync Service (authenticated with managed identities).
- **Support**: end of support was extended from January 13, 2026 to January 9, 2029, and continues for Microsoft Entra ID Premium customers through the "MIM for Entra Premium" release.
- **Deprecations**: MIM hybrid reporting is deprecated, replaced by Azure Arc agent plus Azure Monitor (the old cloud reporting endpoints were retired in November 2025). MIM's PAM component relied on the deprecated MFA Server for its approval MFA, so MIM-based privileged access deployments must plan around that.
- **Direction**: Microsoft positions Entra ID Governance as the long-term replacement, with documented migration paths from MIM scenarios to cloud equivalents (lifecycle workflows, access reviews, API-driven provisioning). MIM remains supported for the on-premises-only cases that still need it.

## Hybrid identity architecture

import Drawio from '../../src/components/Drawio';
import hybrid from '!!raw-loader!../../static/diagrams/hybrid-identity-architecture.drawio';

<Drawio content={hybrid} />

*The hybrid identity architecture. Users sign in to on-prem applications through Active Directory and to cloud applications through Entra ID. A sync agent carries directory objects from AD to Entra ID, Conditional Access evaluates every cloud sign-in, and PIM provides just-in-time role activation.*

[Download / edit this diagram](/diagrams/hybrid-identity-architecture.drawio)

## Walking through the architecture

**The two authorities.** AD holds the on-premises directory; Entra ID holds the cloud identity. They are separate stores with separate protocols, and the sync service is what keeps them coherent.

**Sync is one-way by default.** Objects flow from AD to Entra ID, not the other way around. AD remains the source of authority for on-premises identities, which is why leaver handling usually starts in AD ([identity lifecycle](/docs/fundamentals/identity-lifecycle) applied to the directory).

**Conditional Access sits in front of the cloud apps.** Every sign-in to Microsoft 365 and federated SaaS passes the policy check. This is the enforcement point the [zero-trust IAM architecture](/docs/pam-core/zero-trust-iam) page puts between the user and the resource.

**PIM covers the privileged slice.** Administrative roles are not standing; they activate for a window, which closes the standing-privilege gap for the identity platform itself. PAM products still manage the accounts that live outside the identity platform (local admins, service accounts, other vendors), which is the [IAM-vs-PAM boundary](/docs/pam-core/what-is-pam) showing up in practice.

## Where it fits

The Microsoft stack is the substrate under most of the products in this section: CyberArk, Delinea, and BeyondTrust all discover accounts in AD, and the governance tools consume Entra ID entitlements. If you are building a home lab, the [hands-on labs](/docs/labs/) section shows how to stand this up without a Microsoft license, and [cloud IAM](06-cloud-iam.md) covers the identity models of the hyperscalers that peer with it.

Next: [Cloud IAM](06-cloud-iam.md), the native identity services of AWS, Google Cloud, and Azure.