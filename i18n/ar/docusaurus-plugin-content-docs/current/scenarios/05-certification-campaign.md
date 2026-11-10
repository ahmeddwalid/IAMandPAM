---
title: "Access Certification Campaign"
description: "Running an access certification campaign: scoping, reviewer assignment, evidence, remediation, and the metrics that prove it worked."
---

# Access Certification Campaign

The certification campaign is the governance loop in action: periodically, every access grant is reviewed by someone who can say whether it is still justified. This page runs a campaign end to end, from scoping to remediation, and covers the decisions that separate a real campaign from a checkbox exercise.

## What a campaign reviews

A campaign reviews **who has what, and why**. The units are:

- **User entitlements**: the groups, roles, and app accounts attached to each identity, reviewed by the person's manager.
- **Privileged access**: vault grants, [JIT sessions](/docs/pam-core/jit-access), standing admin memberships, reviewed by the system or service owner.
- **Service and shared accounts**: the accounts that outlived their owners, reviewed by the account owner.

The campaign output is a decision per grant: **certify** (keep), **revoke** (remove), or **investigate** (evidence insufficient).

## Campaign mechanics

1. **Scope.** The IGA system pulls the current entitlement inventory: every user, every grant, every role membership, every vault grant. Stale data is the campaign killer: if the inventory is wrong, the reviews are wrong.
2. **Assignment.** Each grant gets a reviewer. The default is the grantee's manager for user entitlements and the account owner for privileged access. Managers review their team; service owners review their systems. No grant should fall to a default "yes" reviewer.
3. **Evidence.** The reviewer sees the grant, the role it came from, the last use, and the request record if one exists. A grant with a request ticket and recent use is easy to certify. A grant with no request and no use is easy to revoke. The evidence is what makes the campaign fast.
4. **Remediation.** Revokes are executed automatically where the source is a role membership, and as tickets to the access team where the source is a direct grant. Automatic revocation of group membership is safe; manual revocation of direct grants is where campaigns stall.
5. **Re-review.** Revokes should be effective immediately and visible in the next inventory pull. The campaign is not complete until the inventory shows the revoked grants gone.

## The decisions that matter

- **Reviewer independence.** The certification of a privileged grant should not be performed by the holder of the grant. A domain admin certifying their own domain admin membership is not a control.
- **Revoke by default.** The industry norm is a fallback: grants without evidence of use are revoked, and the user re-requests if needed. This is the [zero standing privilege](/docs/pam-core/jit-access) philosophy applied to governance: access must be justified on every review cycle.
- **Consequence for the approver, not the requester.** When a campaign reveals standing access that was never requested, the failure belongs to the process that granted it, not to the user who holds it. Fix the role template or the provisioning rule; do not blame the employee.

## Metrics that prove the campaign worked

- **Revoke rate by reviewer.** A reviewer who certifies everything every cycle is not reviewing.
- **Time to remediate.** How long between a revoke decision and the grant disappearing from the inventory.
- **Second-cycle overlap.** How much of the first campaign's certified access is revoked in the second. Some overlap is normal; a lot means the first campaign was not reviewing.
- **Request rate after revocation.** When access is revoked and nobody re-requests it, the revocation was correct. When a flood of re-requests follows, the campaign over-revoked, and the role templates need fixing.

## The campaign as a system, not an event

A campaign that runs quarterly and reviews everything is a sledgehammer. Mature programs run **continuous certification**: high-risk access (privileged, financial, customer data) is reviewed on a shorter cadence or event-triggered, while low-risk access is reviewed annually. The trigger events are the same ones the scenarios describe: the [mover](02-role-change.md) event is a mini-certification of the new role, and the [termination](03-termination.md) checklist is a certification of the exit state.

## Failure modes

- **The rubber-stamp campaign.** No evidence, no consequences, 98% certify rate. The auditors see the 98% before they see anything else.
- **The orphan campaign.** The campaign assigns reviews to people who no longer own the systems, so reviews expire in the approver's queue and the campaign "completes" with pending items that were never decided.
- **The secret campaign.** The campaign runs in the IGA tool and the outcomes are never fed back into provisioning. Certification then documents a state of the world that does not match the actual access. The feedback loop to the [provisioning](/docs/protocols-iga/scim) pipeline is the entire point.

## Next

The certification campaign depends on clean identity data and a working provisioning pipeline. The remaining scenario pages cover the user-facing and integration cases: [MFA enrollment and recovery](06-mfa-enrollment-recovery.md) and [SaaS SSO integration](07-saas-sso-integration.md).