---
title: "IAM Program Audit Guide"
description: "A structured approach to auditing an IAM program: scope, evidence, findings, and the questions auditors actually ask."
---

# IAM Program Audit Guide

This guide is for two audiences: the auditor who needs to know what to look for in an IAM program, and the program owner who needs to know what evidence to prepare.

## Audit scope

An IAM audit covers the processes and controls that manage who can access what, under what conditions, and how that access is reviewed and revoked. It does not cover network security, physical security, application logic, or data classification (though it touches all of them at the boundaries).

The audit scope is organized around four domains:

1. **Identity lifecycle.** How identities are created, changed, and removed. The audit verifies that the lifecycle process is triggered by authoritative events (HR hire, transfer, termination), that the provisioning and deprovisioning are complete, and that the timing meets the organization's policy.

2. **Authentication.** How users prove their identity. The audit verifies that MFA is enforced, that legacy authentication is blocked, that conditional access policies are in place and effective, and that the identity provider is configured securely.

3. **Authorization.** What users can do after they authenticate. The audit verifies that roles are well-scoped, that access is granted by assignment (not by ad hoc direct grants), that privileged access is controlled through PAM or JIT, and that segregation of duties is enforced.

4. **Governance.** How access is reviewed and certified. The audit verifies that access reviews are conducted on a schedule, that the reviews are performed by independent reviewers, that findings are remediated, and that the certification evidence is complete.

## The evidence list

The auditor requests the following evidence. The program owner should prepare it in advance:

### Identity lifecycle evidence

| Evidence | What it shows | Sample size |
|---|---|---|
| HR-to-directory reconciliation | That every active employee has a corresponding identity, and every identity corresponds to an active employee or a documented exception | Full population for the audit period |
| Provisioning tickets (last 30) | That new hires are provisioned within the policy timeframe | Random sample of 30 |
| Termination tickets (last 30) | That terminated employees are deprovisioned within the policy timeframe | Random sample of 30 |
| Orphan account report | That accounts without an owner are identified and remediated | Full population at audit time |
| Contractor and vendor access register | That non-employee access has an owner, an end date, and a review schedule | Full population at audit time |

### Authentication evidence

| Evidence | What it shows | Sample size |
|---|---|---|
| MFA enrollment statistics | That MFA is enrolled for all users, with exceptions documented | Full population at audit time |
| Conditional access policy list | That policies enforce MFA, block legacy auth, and restrict high-risk sign-ins | Full policy list |
| Legacy auth usage logs | That legacy authentication is blocked or declining | Full population for the audit period |
| IdP security configuration | That the IdP is configured per best practices (token lifetime, session management, admin MFA) | Configuration export |
| Break-glass account inventory | That emergency access accounts are documented, monitored, and tested | Full population |

### Authorization evidence

| Evidence | What it shows | Sample size |
|---|---|---|
| Role definition and membership | That roles are well-scoped, membership is by assignment, and privileged roles have few members | Full population |
| Access request and approval records | That access is granted through a request and approval process | Random sample of 30 |
| Privileged group membership history | That changes to privileged groups are documented and approved | Full history for the audit period |
| SoD policy and violation report | That segregation of duties is enforced and violations are remediated | Full population at audit time |

### Governance evidence

| Evidence | What it shows | Sample size |
|---|---|---|
| Access review campaign records | That reviews are conducted on a schedule, with documented decisions | Last three campaigns |
| Remediation evidence | That findings from access reviews are remediated within the policy timeframe | Last three campaigns |
| Audit log retention and completeness | That identity logs are retained per policy and are complete | Full population for the audit period |
| IAM policy and procedure documentation | That the program is documented and approved | Current versions |

## The auditor's questions

The auditor asks the following questions. The program owner should be able to answer them directly and with evidence:

### "How do you know every terminated employee's access was removed?"

**Good answer.** The HR system triggers the deprovisioning process. The termination event is sent to the provisioning system within 1 hour. The provisioning system disables the account, revokes sessions, removes group memberships, and closes the PAM vault. The process is verified by the termination ticket, which records the completion time. The sample of 30 termination tickets from the last quarter shows an average deprovisioning time of 2.3 hours, with a maximum of 8 hours.

**Poor answer.** The HR system sends an email to the help desk, and the help desk disables the account when they get around to it.

### "Who can grant Domain Admin?"

**Good answer.** The Domain Admins group has three standing members: the two domain administrators and the break-glass account. Membership changes require a PAM approval workflow: the request is submitted, approved by the identity architect, and recorded in the PAM audit log. The last change was 6 months ago, and the audit log shows the request, the approval, and the business justification.

**Poor answer.** The domain admins can add themselves. We trust them.

### "How do you detect orphaned accounts?"

**Good answer.** The HR-to-directory reconciliation runs weekly and identifies accounts that do not correspond to an active employee. The orphan account report is reviewed by the identity team and remediated within 5 business days. The last reconciliation identified 12 orphan accounts, all of which were remediated.

**Poor answer.** We run a report sometimes. Usually the help desk catches them when someone notices.

### "What happens when the IdP goes down?"

**Good answer.** The IdP is deployed in an active-active configuration across two availability zones. The failover is automatic and takes less than 30 seconds. The break-glass process documents the manual steps if both availability zones fail. The break-glass accounts are tested quarterly.

**Poor answer.** We call the vendor and wait.

### "How do you enforce least privilege?"

**Good answer.** Access is granted through role-based assignments. Roles are reviewed quarterly through the certification campaign. Privileged access is granted through JIT with a time limit. The access request workflow requires a business justification. The certification campaign from last quarter revoked 15% of reviewed access.

**Poor answer.** Users request access when they need it and we approve it.

## Common findings and their root causes

The following findings appear in most IAM audits. The root cause is usually process, not technology.

### Finding: Orphaned accounts

**Root cause.** No HR-to-provisioning integration, or the integration is broken, or the manual process has gaps. The orphan accounts are in applications that were never connected to provisioning, or they are local accounts on servers, or they are service accounts that no one owns.

**Remediation.** Integrate the application with provisioning. Decommission the local accounts. Assign owners to service accounts. Run the orphan account report monthly.

### Finding: Standing privilege

**Root cause.** No JIT, no certification campaign, or the certification campaign is a rubber stamp. The privileged roles have members who no longer need the access. The privileged groups have members who were added years ago and never reviewed.

**Remediation.** Implement JIT for privileged access. Run a real certification campaign with independent reviewers. Revoke by default: access is removed unless the reviewer explicitly confirms it is still needed.

### Finding: Weak MFA

**Root cause.** MFA is enforced with SMS, or the conditional access policy has exclusions for "legacy apps" that cover half the organization, or the break-glass accounts are excluded from MFA.

**Remediation.** Move to phishing-resistant MFA (passkeys or hardware keys). Remove the exclusions and fix the legacy apps. Remove the break-glass account exclusions and use a different compensating control (approval workflow, monitoring).

### Finding: Audit log gaps

**Root cause.** PAM logs are not integrated with the SIEM. Identity logs are retained for 30 days instead of the required 90. Directory replication events are not logged.

**Remediation.** Integrate PAM logs with the SIEM. Increase the retention period. Enable directory replication monitoring.

### Finding: Privileged group changes not monitored

**Root cause.** Changes to privileged groups are not audited, or the audit events are not alerted on. An account is added to Domain Admins at 3 AM and no one notices for weeks.

**Remediation.** Enable auditing on privileged groups. Alert on any membership change to a privileged groups. Review the alerts daily.

## What breaks without this

Without regular IAM audits, the program drifts. Roles accumulate access. Certification campaigns become rubber stamps. The gap between policy and reality widens until an incident exposes it. The audit is the feedback loop that catches the drift before it becomes an incident.

## What you learned

The IAM audit is organized around four domains: identity lifecycle, authentication, authorization, and governance. The evidence list is specific and sampleable. The auditor's questions are operational, not theoretical. And the common findings (orphaned accounts, standing privilege, weak MFA, audit log gaps, unmonitored privileged group changes) are process failures that can be fixed with the right controls.

Next: [Certifications](../careers/certifications), because the audit knowledge maps directly to the SC-300 and CISSP exam objectives.
