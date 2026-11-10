---
title: "PAM Core"
description: "Privileged Access Management, end to end: account types, capabilities, best practices, architecture, zero trust, and just-in-time access."
---

# PAM Core

Privileged Access Management (PAM) is the practice of controlling access to the accounts that can change the system itself. This section builds the discipline from the ground up: the account catalog, the mechanism catalog, the rules that make it work, the reference architecture, and the just-in-time pattern that eliminates standing privilege.

## In this section

- **[What is PAM](01-what-is-pam.md)**: the definition, the problems it solves, and how it differs from IAM.
- **[Privileged Account Types](02-privileged-account-types.md)**: the catalog: local admin, domain admin, service accounts, shared and break-glass accounts, cloud roles.
- **[Core Capabilities](03-core-capabilities.md)**: vaulting, session management, rotation, discovery, and the vault-versus-session distinction.
- **[Best Practices](04-best-practices.md)**: the ten rules that make a PAM program credible.
- **[PAM Architecture](05-pam-architecture.md)**: the reference architecture: session manager, vault, targets, approval, recording, SIEM, HA/DR.
- **[Zero-Trust IAM Architecture](06-zero-trust-iam.md)**: how PAM and JIT fit the never-trust-always-verify model.
- **[Just-in-Time Access](07-jit-access.md)**: the workflow that replaces standing privilege with time-boxed grants.
- **[Identity Attack & Defense Matrix](08-attack-defense.md)**: 15 attack classes with detection mechanisms and defensive posture.
- **[Secrets Management](09-secrets-management.md)**: application credentials, dynamic database secrets, and HashiCorp Vault.
- **[Service Accounts Governance](10-service-accounts.md)**: non-human identity lifecycle, gMSAs, and service principal hygiene.
- **[Measuring an IAM Program](11-iam-metrics.md)**: operational metrics, coverage formulas, and audit presentation rules.
- **[Privileged Access Workstations](12-privileged-access-workstations.md)**: hardware isolation, Tier 0 administration, and PAW network policies.
- **[Identity Threat Detection & Response](13-identity-threat-detection.md)**: ITDR architectures, honeypot accounts, and automated response playbooks.
- **[Ephemeral PAM and Zero Standing Privilege](14-ephemeral-pam-zero-standing-privilege.md)**: short-lived certificate CAs, dynamic JIT access, and eliminating vaulted static passwords.
- **[Cloud IAM and CIEM Posture](15-cloud-iem-posture.md)**: effective permission calculation, cross-account toxic combinations, and automated right-sizing.
- **[Identity Resilience & Disaster Recovery](16-identity-resilience-disaster-recovery.md)**: surviving cloud IdP outages, Continuous Access Evaluation, and offline break-glass runbooks.

## How to read this section

The pages build on each other: the account catalog defines scope, the capabilities define the mechanisms, the best practices define the rules, and the architecture pages show the assembly. [Just-in-time access](07-jit-access.md) and [Ephemeral PAM / Zero Standing Privilege](14-ephemeral-pam-zero-standing-privilege.md) represent the modern standard of the discipline, moving away from vaulted static passwords toward dynamic, short-lived cryptographic authorization.

## The one-sentence version

Make privileged access personal, temporary, and recorded: vault what must exist, eliminate what can be ephemeral, broker everything in between, and log it all off-platform.

This section connects to the rest of the site: the [Identity Protocols & IGA](/docs/protocols-iga/) section provides the identity foundation, and the [Vendor Landscape](/docs/vendors/) section compares products against the architecture built here.

## Section Assessment

import SectionQuiz from '@site/src/components/SectionQuiz';
import { QUIZZES } from '@site/src/data/quizzes';

<SectionQuiz title={QUIZZES['pam-core'].title} questions={QUIZZES['pam-core'].questions} passingScore={3} />