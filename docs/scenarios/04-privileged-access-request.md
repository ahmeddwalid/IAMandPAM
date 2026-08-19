---
title: "Privileged Access Request"
description: "The privileged access request scenario: requesting admin rights, approval, time-boxed grant, use, and audit."
---

# Privileged Access Request

The privileged access request is the operational core of [PAM](/docs/pam-core/what-is-pam): a user requests privileged access, an approver decides, the grant is time-boxed, the use is recorded, and the grant expires. This page runs the scenario end to end with the decision points called out.

## The request

Suppose a senior engineer at Northwind Systems needs to restart a production service outside of change window because it is degrading. Standing admin rights are banned by policy, so the request goes through the PAM workflow:

1. The engineer opens a request in the PAM portal, selecting the target (the production server or service), the account to use (the service's managed account, not a personal account), and a requested duration of 45 minutes.
2. The system checks policy automatically: is this target within the requester's scope, is the duration within the maximum allowed, is the change ticket referenced? Policy failures are rejected before a human sees them.
3. The request lands with the on-call approver. Approval includes the justification and the expiry.

The details matter. The request names a **managed account**, not a personal one, so the credential stays in the [vault](/docs/pam-core/core-capabilities), and the session is recorded. The request references a **change ticket**, which gives the approver context and gives the auditor a reason later.

## The approval decision

The approver checks three things:

- **Scope**: does this person legitimately operate this target? A database administrator approving access to the payment processing server should be unusual.
- **Justification**: does the stated reason match the change ticket?
- **Duration**: is 45 minutes plausible for the task, or is the requester trying to pad a standing access window into a request?

Approval should be the exception that proves the workflow, not a rubber stamp. [Access certification](05-certification-campaign.md) measures approver behavior: an approver who approves every request with no review is creating a paper trail that looks exactly like the standing access the PAM program was meant to remove.

## The grant

On approval, the vault issues the credential to the session:

- The user connects through the session broker, not directly to the target, so the password is never disclosed to the requester.
- The session is recorded, including the command stream.
- The grant has a hard expiry: at 45 minutes the session is terminated, not politely ended. The engineer must re-request for continued work, and the second request triggers the same approval.

This is the [JIT access](/docs/pam-core/jit-access) pattern in production: access exists only while justified, and every use is attributable.

## The audit

After the session, the record contains the requester, the approver, the target, the account used, the start and end times, and the session recording. This is the material for the [insider-threat session review](16-incident-insider-threat-session-review.md) playbook and for the compliance evidence the [certification](05-certification-campaign.md) campaign consumes.

The audit trail is also the feedback loop: requests that exceed their duration, targets that get requested by the same person weekly, and approvers who never decline are all signals. The PAM team should review the request log monthly, not just archive it.

## Failure modes

- **Credential disclosure at request time.** If the workflow hands the requester the actual password for later use, it is a password manager, not PAM. The credential must stay in the vault and be consumed by the session.
- **Standing approvals.** A workflow variant where "on-call approver" is implemented as a permanent approval rule defeats the purpose. Approvals should be per request.
- **Scope drift.** The request system allows free-text target selection, so the engineer requests "production-01" but the policy engine cannot tell which group that belongs to, and any target is approvable. Target selection should come from the [inventory](/docs/pam-core/core-capabilities), not free text.

## Next

The request workflow generates the requests that the [Access certification campaign](05-certification-campaign.md) reviews, which closes the governance loop.