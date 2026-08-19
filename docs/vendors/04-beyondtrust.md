---
title: "BeyondTrust"
description: "BeyondTrust Password Safe and Privilege Management: architecture, the cloud resource broker model, and use cases."
---
<!-- verified 2026-08-18: Password Safe Cloud architecture, resource brokers, resource zones, and access policy model verified against BeyondTrust's published documentation. -->

# BeyondTrust

BeyondTrust's heritage is secure remote support: the company grew out of Bomgar, a remote-access product acquired by Thoma Bravo in 2016, and the remote-control lineage shows in the product. Password Safe and Privilege Management together cover the [PAM capabilities](/docs/pam-core/core-capabilities), and the vendor markets the two plus remote support as one platform.

## Password Safe

Password Safe combines privileged account and session management (PASM) with secrets management in a single product. All administration happens through the BeyondInsight platform, the shared console that manages the BeyondTrust product family.

**Deployment models.** On-premises (physical or virtual), IaaS (customer-chosen VMs), and Password Safe Cloud, a fully managed SaaS running in Microsoft Azure. The feature set is the same across models; what changes is who runs the infrastructure.

**The cloud resource broker model.** Password Safe Cloud's architecture is its distinctive feature and the one worth being able to describe:

- **Resource zones** group resources by network segmentation. A zone maps roughly to a network segment you want the service to reach without opening a path from Azure into everything. At least one zone is required; up to 51 are supported.
- **Resource brokers** are the on-premises agents that make the zone work. Each broker runs on a customer-managed Windows Server (2016 or later) and performs authentication against local AD/LDAP/Entra ID, asset and account discovery, credential management, and session proxying. Up to 200 brokers are supported across all zones.

The shape should be familiar: the brokers are the [distributed engines](/docs/vendors/delinea) pattern from Delinea, and the session proxy is the [PSM pattern](/docs/pam-core/pam-architecture) from the PAM architecture page. A cloud PAM service must push an agent into the customer's network because the hosted vault cannot reach segmented targets on its own.

**Access model.** Password Safe uses two kinds of groups:

- **Smart groups** organize assets, accounts, and managed systems, and are dynamic: smart rules add and remove members based on discovery results, so a new server that matches the rule is automatically managed. Version 26.1 added scanning to the rule criteria.
- **User groups** define who signs in and how (AD, Entra ID, LDAP, or local accounts).

**Access policies** then bind the two: requestable hours, whether requests need approval, whether users can see passwords or only launch sessions, and which session types (RDP, SSH, applications) are allowed. The Requestor/Approver split is the [JIT access](/docs/pam-core/jit-access) request-approve-grant pattern as product configuration.

**Zero trust enclave.** BeyondTrust markets the "zero trust enclave gateway" pattern: all privileged resources sit inside an enclave, and no user or machine is ever granted a direct privileged session; every session is brokered through the gateway. That is the [zero-trust IAM architecture](/docs/pam-core/zero-trust-iam) enforcement point made concrete: no implicit trust, every session brokered and recorded.

## Privilege Management

Privilege Management is the EPM product: it removes standing local admin rights from endpoints and grants them per-application or per-task when needed, with policy and approval workflows. Combined with Password Safe, the story is the same one [Delinea](03-delinea.md) tells with Secret Server plus Privilege Manager: the vault manages privileged accounts, the endpoint agent manages how privileges are used at the workstation.

## Use cases

- **Remote support and PAM in one**: the original Bomgar use case. Help desk staff get recorded, policy-controlled remote sessions into user machines, which is privileged access management applied to support work.
- **Segmented networks**: the resource broker model is built for it, since brokers can be placed per segment without a central VPN path.
- **Least privilege on endpoints**: Privilege Management for organizations removing local admin rights without breaking daily work.

## Where it fits

BeyondTrust competes with [CyberArk](02-cyberark.md) and [Delinea](03-delinea.md) on the same core problem, with strengths in the remote-support heritage and the broker-based cloud model. The [comparison and evaluation](08-vendor-comparison.md) page compares all three directly.

Next: [The Microsoft identity stack](05-microsoft-stack.md), which most organizations already run.