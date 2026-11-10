---
title: IAM Fundamentals
description: "The foundations of identity and access management: what IAM is, the AAA model, the identity lifecycle, least privilege, authentication, and authorization."
---

# IAM Fundamentals

This section is the foundation for everything else on the site. It answers the questions that the protocol, PAM, and vendor sections all assume: what IAM is, how access decisions are structured, how identity records stay current, and which principles decide how much access anyone holds.

## In this section

- **[What is IAM](01-what-is-iam.md)** - the scope of the discipline: identities, accounts, entitlements, and why organizations run it.
- **[The AAA Model](02-aaa-model.md)** - authentication, authorization, and accounting: the three stages behind every access decision.
- **[Identity Lifecycle](03-identity-lifecycle.md)** - joiner, mover, leaver: the process states an identity passes through, and where access risk actually accumulates.
- **[Least Privilege & Zero Trust](04-least-privilege-zero-trust.md)** - the principles that decide how much access anyone holds, and the enforcement model that verifies it.
- **[Authentication](05-authentication.md)** - how identity is proven: why passwords are no longer sufficient, MFA, passwordless, and SSO.
- **[Authorization](06-authorization.md)** - how access is decided: RBAC, ABAC, PBAC, and externalized policy.
- **[NIST SP 800-207 Zero Trust Tenets](07-nist-800-207.md)** - the formal zero-trust architecture tenets and authenticator assurance levels (AAL1-3).
- **[Passwordless Authentication](08-passwordless.md)** - WebAuthn, CTAP2, FIDO2, and passkey architecture.
- **[Password Policy Design](09-password-policy.md)** - NIST SP 800-63B guidance: eliminating arbitrary rotation and enforcing breach screening.
- **[Identity Analytics and UEBA](10-identity-analytics.md)** - behavioral baselining, peer-group analysis, and anomaly scoring.
- **[Workload and Machine Identities](11-workload-machine-identities.md)** - SPIFFE/SPIRE, mTLS SVIDs, and Kubernetes workload identity federation.
- **[Fine-Grained Authorization](12-fine-grained-authorization.md)** - Google Zanzibar, ReBAC, OpenFGA, and Cedar policy engines.
- **[AI and Agentic Identity Governance](13-ai-agentic-identity-governance.md)** - autonomous AI agents, LLM tool execution, MCP boundaries, and mitigating excessive agency.
- **[Enterprise PKI and Certificate Lifecycle](14-enterprise-pki-certificate-lifecycle.md)** - CA hierarchies, automated issuance protocols (ACME/SCEP/EST), and Post-Quantum Cryptography.
- **[Data Access Governance](15-data-access-governance.md)** - Snowflake, Databricks Unity Catalog, BigQuery, and attribute-based dynamic row/column masking.
- **[Decentralized Identity and Verifiable Credentials](16-decentralized-identity-verifiable-credentials.md)** - W3C DIDs, Verifiable Credentials, Zero-Knowledge Proofs, and national digital ID integration.

## Suggested order

Read the pages in order. The AAA model gives you the structure that authentication and authorization fill in; the lifecycle explains why the directory stays honest; least privilege and zero trust set the bar that the rest of the site's content measures against. Specialized pages on passwordless, analytics, workload identities, fine-grained authorization, AI agent governance, enterprise PKI, data access, and decentralized identity deepen the foundational models into modern enterprise practice. The [Identity Protocols & IGA](../protocols-iga/index.md) section then shows how these concepts are implemented across systems.

## Section Assessment

import SectionQuiz from '@site/src/components/SectionQuiz';
import { QUIZZES } from '@site/src/data/quizzes';

<SectionQuiz title={QUIZZES.fundamentals.title} questions={QUIZZES.fundamentals.questions} passingScore={3} />