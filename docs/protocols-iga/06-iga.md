---
title: "IGA"
description: "Identity Governance and Administration: access requests, reviews, segregation of duties, and the processes that keep entitlements honest."
---

# Identity Governance and Administration (IGA)

Identity Governance and Administration (IGA) is the governance layer of IAM: the processes and products that decide what access should exist, verify that it stays correct, and produce the evidence auditors ask for. If authentication and authorization are the machinery, IGA is the management system around it. The identity lifecycle ([Joiner, Mover, Leaver](../fundamentals/03-identity-lifecycle.md)) is implemented largely by IGA processes.

## What IGA covers

| Capability | What it does |
|---|---|
| Access requests and approvals | Users or managers request entitlements; policy decides who may approve; grants flow to provisioning (SCIM) |
| Access certifications | Periodic reviews where managers confirm or revoke the access their people hold |
| Segregation of duties (SoD) | Policy checks that prevent conflicting combinations (requester and approver, creator and signer) |
| Role management | The lifecycle of roles themselves: creation, ownership, review, cleanup |
| Entitlement analytics | Visibility into who holds what, orphaned accounts, dormant access, and oversharing |
| Audit and evidence | Reports and attestation records for internal and external auditors |

## The core loop

IGA runs a closed loop that connects every other IAM layer:

1. **Request.** A need appears: a new joiner, a role change, a new entitlement. The request carries the business justification.
2. **Approve.** Policy routes the request: manager approval for standard access, SoD checks, security review for sensitive entitlements.
3. **Provision.** The approved grant reaches the systems through provisioning ([SCIM](05-scim.md) where supported).
4. **Certify.** On a schedule, the right people review what exists: is this still needed, still accurate, still owned by someone accountable?
5. **Revoke.** Whatever fails the review is removed through deprovisioning, with the same automation as the grant.

The loop is only as strong as its weakest stage, and in practice the stage that fails is certification: reviews that nobody completes, or that everyone rubber-stamps. A certification where 100 percent of access is confirmed every time is usually a certification nobody read.

## Why SoD matters beyond compliance

Segregation of duties is often framed as a financial-controls requirement (SOX), but its logic is general: a person who can both create a vendor and approve the payment can create and pay a fake vendor. SoD policy detects exactly such combinations across systems. Its hard requirement is a *cross-system* view: the conflict is usually invisible inside a single application, because the conflicting permissions live in different ones. This is why SoD engines sit in IGA products, not inside applications.

## IGA versus IAM

The two terms overlap and the industry uses them loosely. The useful distinction:

- **IAM (access management)** is the operational layer: authentication, authorization, session, and provisioning execution.
- **IGA (governance)** is the decision layer: what access should exist, who reviews it, and proof that it stayed correct.

Products labeled IGA (SailPoint, Saviynt, Omada, and the governance modules of Okta/Entra ID) deliver the certification, SoD, and analytics capabilities; the access management platforms deliver the runtime. Mature deployments have both, and the [complete IAM architecture](07-iam-architecture.md) shows them as connected layers: IGA decides and the IdP executes, with SCIM as the conveyor belt between them.

## IGA in practice: what good looks like

- Entitlement catalogs describe what is requestable, in business language, with owners and risk ratings.
- Certifications run on risk-based schedules: sensitive access reviewed more often, low-risk roles less.
- SoD checks run at request time, not at review time, so conflicts are prevented rather than discovered.
- Every grant and revocation has an audit trail that answers "who, what, when, and approved by whom" without a manual hunt.

Next: [Complete IAM architecture](07-iam-architecture.md), where every piece of this section comes together in one diagram.