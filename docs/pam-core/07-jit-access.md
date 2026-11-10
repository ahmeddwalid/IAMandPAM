---
title: "Just-in-Time Access"
description: "The JIT access workflow: request, approve, grant, use, revoke, audit. How time-boxed grants replace standing privilege."
---

# Just-in-Time Access

Just-in-time (JIT) access is the pattern of granting privilege only when a task requires it, for the shortest useful window, and taking it back automatically. It is the operational answer to standing privilege: instead of asking "who has admin rights," the question becomes "who has admin rights *right now*," and the answer should be as small as the organization can make it.

import Drawio from '@site/src/components/Drawio';
import arch from '!!raw-loader!@site/static/diagrams/jit-access-flow.drawio';

<Drawio content={arch} />

*The JIT workflow: request, approve, grant, use, revoke, audit. The grant is time-boxed by default, revocation is automatic and verified, and every step is logged.*

[Download / edit this diagram](/diagrams/jit-access-flow.drawio)

## The workflow, step by step

**1. Request.** The user asks for privileged access with three pieces of information that matter: the ticket or reason, the target scope, and the requested duration. The request format is the first control: a request that cannot name a task and a scope is a request that should be denied.

**2. Approve.** The approver (manager, security, or an automated risk rule) decides. Mature programs route by risk: low-risk requests auto-approve against policy, high-risk requests need a human. The approval is logged with the requester and the approver.

**3. Grant.** The JIT broker issues the grant: ephemeral group membership, a time-boxed role activation, or a temporary credential. The default window is measured in minutes to hours, and the policy caps the maximum.

**4. Use.** The user performs the task through a brokered, monitored session ([PAM architecture](05-pam-architecture.md)). The session is attributed to the person, recorded, and visible to monitoring.

**5. Revoke.** The grant expires with the window, or is revoked early when the task completes. Revocation is automatic and *verified*: the broker confirms the ephemeral membership or credential is actually gone. An unverified revocation is a standing grant in disguise.

**6. Audit.** The full cycle is logged: request, approval, grant, use, revocation. The audit trail is the deliverable; the [best practices](04-best-practices.md) rule about the audit trail applies to JIT most of all, because the whole point of JIT is that every privileged grant is a visible event.

## The patterns

JIT is implemented in four recurring shapes:

- **Ephemeral group membership**: the user is added to a privileged group for the window and removed after (Active Directory, Entra ID, and cloud IAM all support this natively).
- **Time-boxed role activation**: cloud-native activation (Azure PIM, AWS permission sets, GCP roles) where the role exists as "eligible" and the user activates it for a window.
- **Brokered sessions**: the session runs with privilege inside the PSM; the privilege exists only inside that session and dies with it.
- **Credential check-out with auto-rotation**: the vault releases the credential for the window and rotates it on check-in.

The choice is driven by the platform and the target; the property that matters is the same: the grant has a lifetime, and the lifetime ends without human action.

## Why JIT beats standing privilege

- **Attack surface shrinks to the moment of use.** A standing grant is attackable 24/7; a JIT grant exists for minutes. The attacker who compromises an admin identity inherits no privilege unless they request it, and requesting it is exactly the event the monitoring plane is watching for.
- **Every use has a paper trail.** The audit question is answered by the workflow itself: who asked, who approved, what window, what was done.
- **Compromise is time-boxed.** Even a successful privileged grant is a window, not a key. The blast radius is measured in hours, not in perpetuity.

## The discipline that makes JIT work

JIT fails in predictable ways, all of them human:

- **Rubber-stamp approval.** If every request is auto-approved, the workflow is theater. The risk routing must be real, and approvers must be accountable for approvals.
- **Over-generous windows.** "I might need it all day" produces grants that outlive tasks. The default window and the cap exist to stop this.
- **Unverified revocation.** The revoke step that never confirms the grant is gone. Verification is part of the pattern, not optional.
- **Parallel paths.** JIT only works if all privileged paths go through it. The local admin account that still works directly is a standing backdoor next to a well-run JIT workflow.

## Where JIT lives in the architecture

JIT is the privileged-access heart of the [zero-trust IAM architecture](06-zero-trust-iam.md): the broker in that diagram is the JIT grant engine, and the eliminated standing accounts are what the pattern removes. The workflow above is the zoomed-in view of the broker.

Next: [Best practices](04-best-practices.md) is the full ruleset; [core capabilities](03-core-capabilities.md) is the mechanism catalog. Or continue to the [Index](index.md) for the section map.