---
title: "PAM Core"
description: "Privileged Access Management, end to end: account types, capabilities, best practices, architecture, zero trust, and just-in-time access."
---

# PAM Core

Privileged Access Management (PAM) is the practice of controlling access to the accounts that can change the system itself. This section builds the discipline from the ground up: the account catalog, the mechanism catalog, the rules that make it work, the reference architecture, and the just-in-time pattern that eliminates standing privilege.

## In this section

- **[What is PAM](what-is-pam)**: the definition, the problems it solves, and how it differs from IAM.
- **[Privileged Account Types](privileged-account-types)**: the catalog: local admin, domain admin, service accounts, shared and break-glass accounts, cloud roles.
- **[Core Capabilities](core-capabilities)**: vaulting, session management, rotation, discovery, and the vault-versus-session distinction.
- **[Best Practices](best-practices)**: the ten rules that make a PAM program credible.
- **[PAM Architecture](pam-architecture)**: the reference architecture: session manager, vault, targets, approval, recording, SIEM, HA/DR.
- **[Zero-Trust IAM Architecture](zero-trust-iam)**: how PAM and JIT fit the never-trust-always-verify model.
- **[Just-in-Time Access](jit-access)**: the workflow that replaces standing privilege with time-boxed grants.

## How to read this section

The pages build on each other: the account catalog defines scope, the capabilities define the mechanisms, the best practices define the rules, and the architecture pages show the assembly. [Just-in-time access](jit-access) is the current endgame of the discipline and the pattern most worth understanding deeply.

## The one-sentence version

Make privileged access personal, temporary, and recorded: vault what must exist, eliminate what can be ephemeral, broker everything in between, and log it all off-platform.

This section connects to the rest of the site: the [Identity Protocols & IGA](/docs/protocols-iga/) section provides the identity foundation, and the [Vendor Landscape](/docs/vendors/) section compares products against the architecture built here.