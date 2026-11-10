---
title: "PAM Architecture"
description: "The complete PAM architecture: vault, session manager, targets, approval, recording, SIEM integration, and high availability."
---

# PAM Architecture

This page is the reference architecture for a complete PAM deployment, the privileged slice of the [complete IAM architecture](/docs/protocols-iga/iam-architecture). It shows every component a production program needs and the data flows between them.

import Drawio from '@site/src/components/Drawio';
import arch from '!!raw-loader!@site/static/diagrams/pam-architecture.drawio';

<Drawio content={arch} />

*The PAM architecture. The admin requests a session, the ticketing system approves it, the session manager retrieves the credential from the vault and connects to the target, the session is mirrored to recording, and everything logs to the SIEM. The vault replicates for high availability.*

[Download / edit this diagram](/diagrams/pam-architecture.drawio)

## The components

**Admin.** The human requesting privileged access. Their identity is the anchor of the whole design: the session is attributed to them, not to the shared account they will be granted.

**Privileged Session Manager (PSM).** The control plane: broker, policy engine, and recording gateway in one. It authenticates the admin, enforces policy, connects to targets with the vaulted credential, and streams the session. This is the component that makes access personal and recorded.

**Credential vault.** The encrypted store: check-out/check-in semantics, rotation, and per-requester policy. The PSM retrieves the credential programmatically, which is what keeps it from ever reaching the human.

**Target systems.** Servers, databases, and network devices. The PSM connects to each with the appropriate protocol (SSH, RDP, SQL, console). Targets with no connector are unmanaged privileged access; the connector catalog is a real evaluation criterion.

**Ticketing / approval.** The workflow layer: a session is tied to a ticket, an approver, or an emergency rule. This is where the [JIT access](07-jit-access.md) request-approve pattern plugs in.

**Session recording & storage.** The immutable record: keystroke-level capture for text protocols, video for graphical, with retention and tamper-evidence. The deliverable for audits and investigations.

**Vault HA/DR.** Replication and failover for the vault itself. The vault is a single point of failure and a single point of attack; it gets the same resilience as the systems it protects.

**SIEM.** The independent log sink: session logs, vault events, approvals. Shipping logs off-platform is what prevents the PAM admin from being able to delete the evidence (best practice 7 on the [best practices](04-best-practices.md) page).

## The flow, step by step

1. The admin requests a session for a target, tied to a ticket and a reason.
2. The approval flow runs: ticket check, approver, or risk-based auto-approval.
3. The PSM retrieves the credential from the vault for this session only.
4. The PSM connects to the target; the admin's session streams through it.
5. The session is mirrored to recording and monitored.
6. On disconnect, the PSM closes the session; the vault may rotate the credential immediately.
7. Logs from PSM, vault, and recording converge in the SIEM.

Two properties of this design matter more than any product choice:

- **The password never appears on the admin's screen.** The credential travels from vault to PSM to target, all machine to machine.
- **The audit trail is complete and off-platform.** The "who, what, when, why" answer exists even if the PSM itself is compromised.

## What this architecture assumes

- An identity foundation: the admin's identity comes from the organization's directory and IdP, which is the [IAM architecture](/docs/protocols-iga/iam-architecture) link.
- Network segmentation: the PSM is the only path to the targets, which is a zero-trust enforcement point. Direct admin routes to targets are removed.
- Policy discipline: the approval and JIT rules are real, reviewed, and enforced (the [best practices](04-best-practices.md) page).

## The zero-trust angle

This PAM architecture is already a zero-trust pattern: no implicit trust for the admin, a policy check on every session, and continuous logging. The [zero-trust IAM architecture](06-zero-trust-iam.md) page makes that connection explicit by putting the PAM broker inside the trust model.

Next: [Zero-trust IAM architecture](06-zero-trust-iam.md), where PAM and IAM meet zero trust.