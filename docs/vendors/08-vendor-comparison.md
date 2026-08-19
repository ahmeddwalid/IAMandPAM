---
title: "Comparison and Evaluation"
description: "Comparing CyberArk, Delinea, BeyondTrust, the Microsoft stack, cloud IAM, and IGA tools, and the criteria a real evaluation uses."
---
<!-- verified 2026-08-18: feature positioning verified against vendor documentation; pricing deliberately omitted (quote-based, changes often, confirm with the vendor). -->

# Comparison and Evaluation

This page ties the section together: how the products compare, and the criteria an actual evaluation would use. Interview questions about "which tool when" are answered here.

## The comparison matrix

| Dimension | CyberArk | Delinea | BeyondTrust | Microsoft | Cloud native |
|---|---|---|---|---|---|
| Vaulting | Flagship (Digital Vault) | Secret Server | Password Safe | No (Entra ID stores hashes only) | No (workload identity instead) |
| Session management | PSM, recording, threat analytics | Session connectors, recording | Brokers + session proxy, recording | No | No |
| Endpoint privilege | EPM-DEF product line | Privilege Manager | Privilege Management | LAPS for local admin passwords | No |
| Just-in-time | Workflow approvals, check-out | Approvals, check-out | Access policies, request/approve | PIM role activation | IAM Identity Center / PIM-like features |
| Machine identity | Conjur, AIM | Secret Server API | Secrets management in Password Safe | Managed identities, service principals | Managed identities, service accounts, roles |
| Discovery | CPM scanners | Distributed engines, broad scanners | Smart groups, brokers | Entra ID / MIM sync | None (native accounts) |
| Strong suit | Enterprise PAM depth, certification ecosystem | Easiest mid-market deployment | Remote support + cloud broker model | Directory + policy ubiquity | Native, cheap, hands-on accessible |
| Typical buyer | Large enterprise, regulated | Mid-market, Windows-first | Support-heavy, segmented networks | Everyone (it is the substrate) | Cloud-first engineering teams |

The pattern to see in the matrix: the PAM vendors differentiate on where the privileged session is brokered and how discovery runs, while Microsoft and the clouds differentiate on being the identity platform itself. That is the [IAM-vs-PAM boundary](/docs/pam-core/what-is-pam) applied to products.

## Evaluation criteria

When comparing any two products in a real project, these are the questions that decide the outcome:

1. **Discovery coverage**: does the scanner catalog every privileged account type in the estate, including databases, network devices, and SaaS? An inventory gap is a governance gap ([account types](/docs/pam-core/privileged-account-types)).
2. **Connector catalog**: how many target systems have native connectors for session brokering and rotation? Targets without connectors are unmanaged privileged access, whatever the marketing says.
3. **Vault resilience**: what is the HA/DR story? Replication, failover, and backup all matter because the vault is a single point of failure ([PAM architecture](/docs/pam-core/pam-architecture)).
4. **Session fidelity**: what does recording actually capture for each protocol? Keystroke-level for text, video for graphical, and what happens to sessions when the recorder fails.
5. **API-first operations**: can discovery, rotation, and check-out run programmatically? The audit answer "the API did it, the human never saw it" is the whole point ([core capabilities](/docs/pam-core/core-capabilities)).
6. **JIT patterns**: which of the four [JIT patterns](/docs/pam-core/jit-access) does the product support natively, and do approvals carry ticket context?
7. **Integration with the identity platform**: does it federate against the existing IdP, or does it want its own user store? (The [Microsoft stack](05-microsoft-stack.md) and [cloud IAM](06-cloud-iam.md) pages show what the identity substrate looks like.)
8. **Operations cost**: the license price is a small fraction of the cost of running the platform. Consider admin staffing, training, and the certification burden ([CyberArk's track](02-cyberark.md) is the extreme example).
9. **Audit export**: can it produce the evidence trail for a certification campaign in a format an auditor accepts, off-platform? ([IGA](/docs/protocols-iga/iga) covers what campaigns need.)
10. **Skill availability**: in your market, which product's skills are hireable? This is where the [careers](/docs/careers/) section matters as much as the feature list.

## What this section deliberately does not do

Pricing is not compared here. Enterprise identity software is quote-based, prices change, and public list prices mislead. When an interviewer asks about cost, the correct answer is the evaluation criteria above plus "confirm current pricing with the vendor", not a number from memory.

## The whole estate in one view

The [complete IAM architecture](/docs/protocols-iga/iam-architecture) and [complete PAM architecture](/docs/pam-core/pam-architecture) pages show the shape an estate takes; the [major vendors](01-major-vendors.md) page maps the products onto it. The result of a good evaluation is not the most complete product, but the smallest set that covers the estate with no unmanaged privileged access left over.