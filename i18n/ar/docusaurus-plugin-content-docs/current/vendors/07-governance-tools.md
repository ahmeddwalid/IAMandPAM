---
title: "Governance Tools"
description: "SailPoint, Okta Identity Governance, and Saviynt: how the IGA products differ in architecture and coverage."
---
<!-- verified 2026-08-18: product positioning, platform names, and governance features verified against vendor sites and market analyses. -->

# Governance Tools

The governance tools productize the [IGA loop](/docs/protocols-iga/iga): access certification campaigns, role management, segregation of duties, and provisioning workflows. Unlike the PAM and cloud products, these are bought by compliance-driven organizations that must prove who has access to what, and the three main products differ in architecture more than in feature lists.

## SailPoint

**Position**: the mature enterprise IGA incumbent, with the deepest connector ecosystem.

**Platform**: Identity Security Cloud (ISC), the SaaS product built on the Atlas platform and the rebranded successor to IdentityNow. IdentityIQ remains the legacy on-premises product; SailPoint encourages migration to ISC, but many large organizations still run customized IdentityIQ deployments, so both names appear in job ads.

**Capabilities**: access certification campaigns with escalation and bulk handling, AI-assisted role mining and access recommendations, separation of duties enforcement, CIEM for cloud entitlements, and non-employee (contractor) lifecycle management. The product line extended in 2026: SailPoint completed its acquisition of Entro Security in June 2026 (reported around USD 200 million), adding discovery of secrets and tokens used by machine identities, and its Human Fabric positioning emphasizes zero standing privilege and real-time governance rather than periodic reviews.

**Corporate note**: SailPoint returned to the public markets in 2025 while remaining majority-owned by Thoma Bravo.

## Okta Identity Governance

**Position**: not a standalone IGA platform, but a governance layer built natively on Okta's Workforce Identity Cloud, sharing the same admin console and directory.

**Capabilities**: lifecycle management (HRIS-driven JML via SCIM), Okta Workflows for request and approval automation, access certification campaigns with delegation and bulk decisions, auditor reporting exports (added for the 2025/2026 cycle), and SoD enforcement through conflicting role pair definitions. The distinctive addition is Security Access Review: event-triggered access reviews connected to Okta's threat detection, surfacing the identities relevant to an active incident.

**The constraint to know**: governance covers the applications that are Okta-connected with SCIM provisioning. Applications outside the Okta estate are outside OIG's certification scope. For an organization standardized on Okta this is the fastest governance deployment; for a heterogeneous estate it is a coverage limitation.

## Saviynt

**Position**: the cloud-native challenger, built from the start as a multi-tenant SaaS platform (Enterprise Identity Cloud) rather than adapted from on-premises code.

**Capabilities**: IGA, PAM, application access governance, third-party access governance, and data access governance in one platform. Zero standing privileges at the application layer shipped as a live feature in 2025, ahead of most competitors' roadmaps. The strongest differentiator is fine-grained separation-of-duties rulesets for SAP, Oracle, Workday, and healthcare systems (Cerner, Epic), the granularity external auditors require for SOX on financial ERP configurations. Compliance templates for SOX, GDPR, HIPAA, and PCI ship with the product.

## Choosing between them

| | SailPoint | Okta IAG | Saviynt |
|---|---|---|---|
| Architecture | SaaS (Atlas) + legacy on-prem | Add-on to Okta Workforce Identity Cloud | Cloud-native converged platform |
| Certification scope | Broadest connector ecosystem | Okta-connected SCIM apps only | Broad, with deep ERP/healthcare SoD |
| Distinctive strength | Enterprise scale, ecosystem, CIEM | Native to the Okta identity platform | Converged IGA + PAM, zero standing privilege |
| Typical buyer | Large regulated enterprise | Existing Okta customer | Cloud-first org wanting one platform |

The interview-relevant summary: SailPoint is the incumbent with the deepest coverage, Okta IAG only makes sense where Okta is the identity platform, and Saviynt is the converged cloud-native option where governance and privileged access are bought together.

Next: [Comparison and evaluation](08-vendor-comparison.md), how to evaluate any of the products in this section.