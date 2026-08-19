---
title: Hands-On Labs
description: "Seven home-lab projects that turn the theory on this site into hands-on practice: a lab AD and Keycloak setup, SSO federation, cloud IAM federation, a PAM trial, just-in-time access with MFA, a lightweight IGA workflow, and secrets management with Vault."
---

# Hands-On Labs

Theory earns credibility when you can prove it in a lab. These seven projects are designed to run on a single laptop with free tools: VirtualBox, Windows Server with Active Directory, Keycloak as a self-hosted identity provider, the free tier of AWS, and HashiCorp Vault on Docker. Each project states what it proves, how long it takes, and exactly what to do step by step, with verification checks so you know the lab actually worked.

## The lab lineup

| # | Project | What it proves | Time |
|---|---------|----------------|------|
| 1 | [Home lab setup](home-lab-setup) | Building the VirtualBox + Windows Server + Keycloak base | 1-2 evenings |
| 2 | [AD + Keycloak SSO](keycloak-sso) | LDAP federation, OIDC SSO, and the app side of identity | 2-3 evenings |
| 3 | [Cloud IAM federation](cloud-iam) | AWS Organizations, IAM Identity Center, permission sets | 2 evenings |
| 4 | [PAM fundamentals on a trial](pam-trial) | Vaulting, session brokering, credential rotation, recording | 3 evenings |
| 5 | [Just-in-time access with MFA](jit-mfa) | JIT roles, approval flow, expiry-driven revocation | 2 evenings |
| 6 | [Lightweight IGA campaign](iga-campaign) | Identity import, certification, segregation of duties | 2 evenings |
| 7 | [Secrets management with Vault](secrets-vault) | AppRole identity, dynamic database credentials, lease expiry | 2 evenings |

Work through them in order. Lab 1 is the foundation for labs 2, 4, and 5; labs 4 and 6 reuse the environment from earlier labs rather than rebuilding it. Lab 7 runs on Docker alone, but its concepts build directly on labs 4 and 6 (credential vaulting and governance loops).

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