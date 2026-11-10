---
title: "Identity Resilience and Disaster Recovery"
description: "Designing identity infrastructure to survive cloud IdP outages, network partitions, and catastrophic compromise: offline validation, break-glass vaults, and emergency control planes."
---
<!-- verified 2026-09-26 -->

# Identity Resilience and Disaster Recovery

Modern enterprise security consolidates authentication into centralized cloud identity providers (Microsoft Entra ID, Okta, Ping Identity). Centralization simplifies policy enforcement, conditional access, and threat detection. However, centralization creates a systemic single point of failure (SPOF): if the primary cloud IdP experiences an outage, network partition, or administrative lockout, access to production cloud infrastructure, hypervisors, and security consoles halts across the entire enterprise.

Identity resilience is the practice of designing authentication, authorization, and audit pipelines so critical business functions and emergency operations survive the complete unavailability of the primary identity provider.

## The IdP Outage Problem

When an enterprise routes all administrative access through single sign-on (SSO) and privileged access management (PAM) portals hosted on cloud infrastructure, an upstream cloud outage triggers cascading failures:

1. **Authentication Failure**: Engineers cannot log in to the AWS Management Console, Azure Portal, or Google Cloud Console because SAML and OIDC redirects fail with HTTP 503 or DNS timeouts.
2. **Session Termination**: Short-lived credentials cannot be refreshed. Active administrative sessions drop as tokens expire.
3. **Circular Dependencies**: The tools required to diagnose and resolve the outage (monitoring dashboards, internal communication platforms, ticketing systems, and network consoles) depend on the very IdP that is down.

## Architecture for High Resilience

Surviving an IdP outage requires decoupling critical control-plane access from the centralized cloud identity provider through an independent emergency architecture.

import Drawio from '@site/src/components/Drawio';
import idResilience from '!!raw-loader!@site/static/diagrams/identity-resilience-dr.drawio';

<Drawio content={idResilience} />

<a href="/diagrams/identity-resilience-dr.drawio" download>Download / edit this diagram</a>

The resilience model incorporates three independent recovery tiers:

### 1. Continuous Access Evaluation (CAE) and Caching

For standard workforce workloads, Continuous Access Evaluation (CAE, standardized under the OpenID Shared Signals and Events / CAEP specifications and implemented in RFC 9470):

- Allows relying party resource providers (such as Microsoft 365, internal APIs, or SaaS tools) to validate long-lived session tokens locally using cached public keys.
- Under normal operations, the IdP pushes real-time security events (revocation, password change, device risk) to resource providers over a webhook backchannel.
- If the primary IdP becomes unreachable, resource providers continue honoring valid unexpired tokens for a defined resilience window (typically 1 to 2 hours) instead of immediately failing closed.

### 2. Disconnected Break-Glass Vaults

Emergency administrative accounts must have zero dependencies on the primary cloud IdP, on-prem directory synchronization, or external third-party multi-factor authentication (MFA) push services:

- **Local Account Provisioning**: Standalone emergency accounts provisioned directly on root control planes:
  - AWS: Direct IAM users with administrator access created within member accounts or dedicated break-glass accounts, completely bypassed from IAM Identity Center (SSO).
  - Azure: Cloud-only Entra Global Administrator accounts (`breakglass@tenant.onmicrosoft.com`) excluded from all Conditional Access policies.
  - On-Prem / Hypervisors: Local root or administrator accounts configured on ESXi/KVM hosts and core network routers.
- **Hardware-Bound Credentials**: Authentication uses physical FIDO2 hardware security keys (such as YubiKeys) or offline TOTP seeds. Mobile push notifications (Okta Verify, Microsoft Authenticator push) depend on internet connectivity and third-party push gateways and must not be used as the sole second factor for emergency break-glass.
- **Split-Knowledge Custody**: Passwords and physical security keys are sealed in tamper-evident physical safes across two distinct geographic sites. Access requires two authorized custodians (for example, the CISO and the Lead Infrastructure Architect).

### 3. Isolated Recovery Certificate Authority

When directory services and identity federation are offline, an isolated recovery Certificate Authority (CA) provides administrative access to internal infrastructure:

- The CA runs on isolated, hardened infrastructure with an offline root.
- In an emergency, authorized break-glass operators use dual-custody physical credentials to issue short-lived (1 to 4 hour) X.509 certificates or SSH certificates for specific target hosts.
- Target servers (Linux SSH daemons, Windows hosts, Kubernetes clusters) trust the recovery CA public key natively in their configuration files, allowing administrative login without contacting an external directory.

### 4. Out-of-Band Audit Pipeline

A critical failure mode during emergency operations is the loss of audit visibility. If audit logs are routed through an SSO-dependent logging service or SIEM dashboard, emergency actions remain unmonitored:

- Critical infrastructure targets must forward syslogs and authentication events over direct, authenticated syslog (TLS) to an immutable, append-only secondary log repository (such as an S3 bucket with Object Lock or an air-gapped SIEM).
- Break-glass account usage triggers immediate automated out-of-band alerts via direct SMS and hardware-based emergency pagers, bypassing email and corporate chat platforms.

## Designing the Break-Glass Runbook

An effective disaster recovery plan requires a documented, tested runbook:

| Stage | Action | Verification |
|---|---|---|
| **1. Declaration** | Incident Commander officially declares primary IdP failure. Two designated keyholders retrieve physical safe contents. | Tamper-evident seal numbers verified against vault inventory log. |
| **2. Access Verification** | Operator connects via dedicated out-of-band console (management network / direct console). Authenticates with break-glass credentials and hardware key. | Out-of-band pager alert confirms break-glass account logon event. |
| **3. Emergency Remediation** | Operator applies emergency configuration, restores routing, or switches authentication bypass flags on critical services. | Service status verified via direct local health checks. |
| **4. Post-Incident Revocation** | Immediate password rotation for all break-glass accounts. New hardware keys provisioned. Investigation log exported from immutable audit store. | Break-glass accounts returned to dormant state; new tamper-evident seals recorded. |

## Testing and Disaster Recovery Drills

A break-glass account that has not been tested in twelve months will fail during a real outage. Organizations must conduct scheduled, non-destructive drills every quarter:

1. **Seal Inspection**: Physical verification that safe seals have not been broken or degraded.
2. **Offline Logon Test**: Authenticating to secondary management consoles with test credentials while the primary network route is temporarily simulated offline.
3. **Rotation Drill**: Exercising the rotation and re-sealing procedure to ensure credentials do not drift between password management documentation and target systems.

## Interview Angle

Questions regarding identity resilience test whether a candidate understands real-world operational dependencies:

- **"What happens to our cloud infrastructure if our identity provider suffers a global 4-hour outage?"**
  - Walk through the exact failure sequence: SSO portals fail, CLI sessions fail as STS tokens expire, and automated deployments break. Then describe the defense: pre-provisioned cloud-only break-glass accounts excluded from federation, hardware security keys, and pre-established direct console access.
- **"Why should break-glass accounts be excluded from Conditional Access policies?"**
  - Explain that Conditional Access policies rely on real-time risk evaluation, device compliance signals from MDM (Intune/Jamf), and geographic telemetry. If an outage degrades the Conditional Access evaluation pipeline or device compliance status cannot be reached, accounts subject to CA will be locked out. Break-glass accounts must bypass CA and rely instead on physical security, split custody, and real-time alert triggers upon any logon.
