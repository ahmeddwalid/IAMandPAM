---
title: Compliance Mapping
description: "Which regulations drive which IAM controls: SOX, HIPAA, PCI DSS, GDPR, ISO 27001, and NIST CSF mapped to identity and access management."
---
<!-- verified 2026-08-19: regulatory references (SOX 404 ITGC scope, HIPAA Security Rule sections, PCI DSS 4.0 requirements 7/8/10/12, GDPR Articles 5/32/17, ISO 27001:2022 Annex A controls) verified against the current published texts. -->

# Compliance Mapping

IAM exists partly because regulations require it. Every major compliance framework contains an access-control chapter, and auditors test identity controls harder than almost anything else, because access is where most findings come from. This page maps the frameworks to the controls they demand, so the same IAM program can be explained once and mapped many times. The map is presented as guidance, not legal advice: the controls are what the frameworks require, but which ones apply to you is a compliance decision for your organization.

## The map

| Framework | Where IAM lives | What it requires | The control that answers it |
|-----------|-----------------|------------------|-----------------------------|
| SOX 404 | IT general controls over financial systems | Access to financially significant systems is provisioned, reviewed, and revoked; segregation of duties; audit evidence of all of it | [IGA](../protocols-iga/06-iga.md) certification loop, [joiner-mover-leaver](../fundamentals/03-identity-lifecycle.md) with HR as source, [SoD checks](../labs/06-iga-campaign.md) |
| HIPAA Security Rule | Administrative and technical safeguards | Access controls (§164.312(a)), audit controls (§164.312(b)), authentication (§164.312(d)), workforce security and termination procedures (§164.308(a)(3)) | MFA and access review programs, logging and alerting, termination playbook ([scenarios](../scenarios/03-termination.md)) |
| PCI DSS 4.0 | Requirements 7, 8, 10, 12 | Restrict access by need to know (req 7); identify and authenticate users, MFA for remote access (req 8); log and monitor all access (req 10); support information security with policy (req 12) | Least privilege and RBAC, phishing-resistant MFA, [monitoring from the attacks page](../pam-core/08-attack-defense.md), documented policies |
| GDPR | Articles 5, 32, 17 | Integrity and confidentiality of processing (art 5); security of processing including access controls (art 32); erasure rights that touch identity lifecycle (art 17) | Access control and audit logging, [identity lifecycle](../fundamentals/03-identity-lifecycle.md) including data removal, retention discipline |
| ISO 27001:2022 | Annex A: A.5.15-A.5.18, A.8.2, A.5.24 | Access control policy (A.5.15); identity management (A.5.16); authentication information (A.5.17); access rights (A.5.18); privileged access rights (A.8.2); secrets management (A.8.24) | The full control set: [authorization](../fundamentals/06-authorization.md), [password policy](../fundamentals/09-password-policy.md), [service accounts](../pam-core/10-service-accounts.md), [PAM](../pam-core/04-best-practices.md), [secrets](../pam-core/09-secrets-management.md) |
| NIST CSF 2.0 | Govern and Protect functions | GV.OC (outcomes), PR.AA (identity management, authentication, access) with PR.AA-01 through PR.AA-06 | The same controls, framed as outcomes: identities provisioned and deprovisioned, authenticated with approved methods, authorized by policy, access reviewed |

Two things stand out when the map is read whole: every framework demands the same four capabilities (lifecycle, authentication, least privilege, review), and every framework expects evidence, which is why the [metrics page](../pam-core/11-iam-metrics.md) exists: controls without measurement cannot be certified.

## The four universal capabilities

| Capability | The control | The audit evidence auditors ask for |
|------------|-------------|-------------------------------------|
| Provisioning and deprovisioning | Lifecycle driven by HR and contract events | A sample of joiners, movers, and leavers with dates matching HR records |
| Authentication | MFA on remote and privileged access, sound password policy | Policy documents and a sample of enforcement logs |
| Least privilege | RBAC/ABAC, JIT for privileged access | Role definitions, standing-privilege reports, JIT approval records |
| Review | Certification campaigns with remediation | Completed certifications with sign-offs and the remediation log |

Every framework above is a different ordering of this same table. That is the sentence to remember: compliance frameworks do not create new controls, they *schedule* the same four.

## Typical audit findings

The findings that recur across frameworks are predictable, which makes them worth preempting:

- **Deprovisioning gaps**: terminated accounts still active. The most common identity finding across all frameworks, answered by lifecycle automation and the deprovisioning metric.
- **Standing privileged access**: admin rights without JIT or review, especially service accounts (the [service accounts](../pam-core/10-service-accounts.md) page's reason for existing).
- **Certification theater**: campaigns completed but with no revocations and no evidence of real review. Answered by remediation-completion metrics, not completion rates.
- **MFA exemptions**: accounts exempted from MFA without compensating controls or documentation. Answered by the exemption register with owners and review dates.
- **Segregation-of-duties gaps**: no SoD analysis on financial systems (SOX), no conflict monitoring. Answered by the SoD check pattern from the [IGA lab](../labs/06-iga-campaign.md).

The pattern across findings: auditors rarely find exotic failures; they find unexecuted basics. A program that executes the four universal capabilities with evidence is a program that passes most audits, which is why the compliance conversation always returns to operations.

## Building a control-to-framework mapping

When an organization adopts a framework, the work is a spreadsheet, honestly built: each control from the framework's checklist, the IAM capability that answers it, the tool and owner that implements it, and the evidence artifact. The same spreadsheet answers every subsequent framework, because the rows are the same capabilities. This is also the interview-ready description of an IAM compliance program: not "we are ISO certified" but "here is the control, here is the owner, here is the evidence."

## Interview angle

The compliance question in interviews usually takes two forms. The direct form ("which regulations apply to IAM?") is answered with the map's shape: lifecycle, authentication, least privilege, and review appear in every framework, named per framework. The judgment form ("how do you know you are compliant?") is answered with evidence: the certification log, the deprovisioning metrics, the MFA exemption register. The candidate who answers the first with the four capabilities and the second with named evidence artifacts is describing a program, not a checkbox list.