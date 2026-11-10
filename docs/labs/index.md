---
title: Hands-On Labs
description: "Hands-on lab projects that turn the theory on this site into practice: AD and Keycloak setup, SSO federation, cloud IAM, PAM trials, JIT access, IGA, Vault secrets, DevOps CI/CD identity, CIEM least privilege, and Teleport ephemeral access."
---

# Hands-On Labs

Theory earns credibility when you can prove it in a lab. These projects are designed to run on a single laptop with free and open-source tools: VirtualBox, Windows Server with Active Directory, Keycloak, AWS Free Tier, HashiCorp Vault on Docker, and Teleport Community Edition. Each project states what it proves, how long it takes, and exactly what to do step by step, with verification checks so you know the lab actually worked.

## The lab lineup

| # | Project | What it proves | Time |
|---|---------|----------------|------|
| 1 | [Home lab setup](01-home-lab-setup.md) | Building the VirtualBox + Windows Server + Keycloak base | 1-2 evenings |
| 2 | [AD + Keycloak SSO](02-keycloak-sso.md) | LDAP federation, OIDC SSO, and the app side of identity | 2-3 evenings |
| 3 | [Cloud IAM federation](03-cloud-iam.md) | AWS Organizations, IAM Identity Center, permission sets | 2 evenings |
| 4 | [PAM fundamentals on a trial](04-pam-trial.md) | Vaulting, session brokering, credential rotation, recording | 3 evenings |
| 5 | [Just-in-time access with MFA](05-jit-mfa.md) | JIT roles, approval flow, expiry-driven revocation | 2 evenings |
| 6 | [Lightweight IGA campaign](06-iga-campaign.md) | Identity import, certification, segregation of duties | 2 evenings |
| 7 | [Secrets management with Vault](07-secrets-vault.md) | AppRole identity, dynamic database credentials, lease expiry | 2 evenings |
| 8 | [DevOps CI/CD Pipeline Identity](08-devops-identity.md) | GitHub Actions OIDC federation to AWS STS without static keys | 2 evenings |
| 9 | [Cloud Least-Privilege Mining with CIEM](09-ciem-least-privilege.md) | AWS IAM Access Analyzer and policy right-sizing from CloudTrail | 2 evenings |
| 10 | [Zero Standing Privileges with Teleport](10-ephemeral-access-teleport.md) | Ephemeral SSH and Kubernetes access via short-lived certificate CA | 2 evenings |
| 11 | [Customer IAM and Multi-Tenant SaaS](11-ciam-multitenant-sso.md) | Keycloak B2B multi-tenancy, Home Realm Discovery, and tenant-scoped JWTs | 2 evenings |
| 12 | [Automated PKI and mTLS with Vault](12-vault-pki-mtls.md) | Two-tier Vault CA, 24-hour dynamic certificates, and mutual TLS enforcement | 2 evenings |
| 13 | [Identity DR and Break-Glass Drill](13-identity-dr-breakglass.md) | Simulated cloud IdP blackout, offline hardware key authentication, and audit preservation | 2 evenings |
| 14 | [SAML and OIDC Integration](14-saml-oidc-integration.md) | Multi-protocol IdP: SAML and OIDC clients authenticating the same AD user | 2 evenings |
| 15 | [SCIM Provisioning Automation](15-scim-provisioning.md) | Python SCIM client: user provisioning, group management, deprovisioning | 2 evenings |
| 16 | [Kerberos Analysis with Wireshark](16-kerberos-wireshark.md) | Live Kerberos ticket capture, dissection, and anomaly detection | 2 evenings |
| 17 | [Incident Response Simulation](17-ir-simulation.md) | Compromised service account: detection, containment, eradication, recovery | 2 evenings |

Work through them in order. Lab 1 is the foundation for labs 2, 4, and 5; labs 4 and 6 reuse the environment from earlier labs rather than rebuilding it. Labs 7 through 17 run on Docker, Linux VMs, and cloud free tiers, extending the core principles into DevOps, CIEM, modern cloud PAM, PKI automation, disaster recovery, multi-protocol federation, SCIM automation, Kerberos analysis, and incident response.

## What the tools cost

Every tool in these labs is either free or has a usable free tier:

- **VirtualBox** (free, GPL): runs Windows Server and Linux as guest machines on your laptop.
- **Windows Server Evaluation** (free, 180 days): Microsoft's evaluation ISO of Windows Server includes Active Directory Domain Services. The 180-day limit is irrelevant for a learning lab, and the same skills transfer to any AD environment.
- **Keycloak** (free, Apache 2.0): the reference open-source identity provider. Runs on the same laptop via Docker, no license cost.
- **AWS Free Tier** (free for 12 months for new accounts): enough for the cloud IAM lab. You need a card for signup, but the IAM Identity Center features used here are not metered per se; watch the few billed resources noted in the lab.
- **CyberArk** (free trial): a community edition trial of the PAM suite. The lab notes exactly what the trial includes and what it does not.
- **Docker Desktop** (free for personal use): the simplest way to run Keycloak and a test application.

Rough resource estimate for the whole lab stack: 16 GB of RAM on the host laptop, about 80 GB of free disk, and a virtualization-capable CPU. The Windows Server VM alone wants 4-6 GB of RAM; Keycloak runs fine in Docker with 1-2 GB.

## What each lab's diagram shows

Every project page includes an architecture diagram drawn for that lab. The diagrams use the same convention: warm boxes are services, the ochre-bordered box is the component the lab is about, dashed borders mark network or organizational boundaries, and numbered edges follow the order of the flow described in the steps.

See the [site topic map](/) for where these labs sit in the overall learning path.

## Before you start

- Confirm virtualization is enabled in your laptop's BIOS/UEFI and that you can run a 64-bit guest VM.
- Install VirtualBox and Docker Desktop first; both have straightforward installers on Windows, macOS, and Linux.
- Give yourself a full evening for the first lab. Nothing here is hard, but downloads of evaluation ISOs are large and virtualization setup has many small steps.

## Section Assessment

import SectionQuiz from '@site/src/components/SectionQuiz';
import { QUIZZES } from '@site/src/data/quizzes';

<SectionQuiz title={QUIZZES.labs.title} questions={QUIZZES.labs.questions} passingScore={3} sectionKey="labs" />