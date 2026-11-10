---
title: "Scenarios & Troubleshooting"
description: "Real-world identity scenarios, troubleshooting guides for the common failure modes, and incident response playbooks."
---

# Scenarios & Troubleshooting

This section turns the concepts into work. The [scenarios](01-onboarding.md) follow a single identity through its life: onboarding, role changes, termination, privileged access, certification, MFA, and SaaS integration. The [troubleshooting guides](08-troubleshooting-ldap.md) cover the failure modes that produce the majority of identity tickets, each with symptoms, root cause, resolution, and prevention. The [incident response](15-incident-compromised-privileged-account.md) playbooks handle the worst case.

## Pages in this section

### Scenarios

1. [Onboarding (Joiner)](01-onboarding.md): the provisioning pipeline from HR event to first login.
2. [Role change (Mover)](02-role-change.md): access follows the role, and leaves the old one.
3. [Termination (Leaver)](03-termination.md): standard and emergency offboarding.
4. [Privileged access request](04-privileged-access-request.md): request, approval, time-boxed grant, audit.
5. [Access certification campaign](05-certification-campaign.md): running the IGA loop as a real project.
6. [MFA enrollment and recovery](06-mfa-enrollment-recovery.md): first enrollment, re-enrollment, lost device.
7. [SaaS SSO integration](07-saas-sso-integration.md): onboarding a new cloud application with SAML and SCIM.
8. [Break-Glass Emergency Access](18-break-glass-access.md): account design, physical safe custody, activation checklist, and quarterly testing.
9. [Vendor and External Access](19-vendor-external-access.md): B2B guest federation, sponsored lifecycle, and PAM session brokering.
10. [Adversary-in-the-Middle (AiTM) Phishing Defense](20-aitm-phishing-defense.md): reverse proxy session cookie theft, FIDO2 origin binding, and token binding.
11. [Mergers, Acquisitions, and Divestitures](21-mergers-acquisitions-identity.md): Day 1, Day 30, Day 90 identity playbook, cross-tenant sync, and forest trusts.
12. [Active Directory Tiering and Enterprise Access Model](22-active-directory-tiering-migration.md): Tier 0 control plane isolation, AD CS ESC mitigations, and PAWs.

### Troubleshooting

8. [LDAP bind failures](08-troubleshooting-ldap.md): error 49 and its sub-codes.
9. [Certificate mismatches](09-troubleshooting-certificates.md): hostname, expiry, chain, and clock problems.
10. [PAM session and integration errors](10-troubleshooting-pam.md): vault, session, rotation, and agent failures.
11. [AWS IAM policy misconfigurations](11-troubleshooting-aws-iam.md): access denied and malformed policy.
12. [SAML assertion errors](12-troubleshooting-saml.md): signature, audience, and attribute mapping.
13. [MFA time drift and device loss](13-troubleshooting-mfa.md): TOTP clocks and recovery flows.
14. [SCIM provisioning failures](14-troubleshooting-scim.md): sync stops without an obvious error.

### Incident response

15. [Compromised privileged account](15-incident-compromised-privileged-account.md): containment, evidence, rotation.
16. [Insider-threat session review](16-incident-insider-threat-session-review.md): what the recordings can and cannot prove.
17. [Ransomware credential rotation](17-incident-ransomware-credential-rotation.md): emergency rotation at scale.

## How to read this section

The scenario pages assume the concepts from [IAM fundamentals](/docs/fundamentals/what-is-iam) and [PAM core](/docs/pam-core/what-is-pam). The troubleshooting pages are reference material: read the ones for technologies you operate. The incident pages are playbooks: they are deliberately prescriptive because a team under time pressure should not have to design a process.

Start with [Onboarding (Joiner)](01-onboarding.md).

## Section Assessment

import SectionQuiz from '@site/src/components/SectionQuiz';
import { QUIZZES } from '@site/src/data/quizzes';

<SectionQuiz title={QUIZZES.scenarios.title} questions={QUIZZES.scenarios.questions} passingScore={3} />