---
title: "Cybersecurity Arabic Terminology Standard (معايير تعريب مصطلحات الهوية والوصول)"
description: "The official technical terminology standard and lexicon for translating Identity and Access Management (IAM) and Privileged Access Management (PAM) concepts into professional Arabic."
---
<!-- verified 2026-09-17 -->

# Cybersecurity Arabic Terminology Standard (معايير تعريب مصطلحات الهوية والوصول)

This document establishes the official technical translation standard and lexicon for translating Identity and Access Management (IAM), Identity Governance and Administration (IGA), and Privileged Access Management (PAM) concepts into Arabic across this reference site.

In enterprise security environments across the Middle East (including Saudi Arabia's National Cybersecurity Authority [NCA] Essential Cybersecurity Controls [ECC] and the UAE Information Assurance Standards [NESA]), imprecise translations create dangerous ambiguities. Translating *Vault* as "قبو" (cellar) or *Break-Glass* as "كسر الزجاج" without operational context undermines professional credibility. 

---

## 1. Core Principles for Technical Translation

1. **Precision Over Literalism**: Translate operational function rather than literal dictionary definitions (e.g., *Privileged Access* → إدارة الوصول المميّز, never الوصول الاستثنائي).
2. **First-Mention Acronym Rule**: On first occurrence in a section, state the Arabic term followed by the English term and abbreviation in parentheses. Subsequent references may use either the Arabic term or the acronym:
   - *Example*: التحكم في الوصول المستند إلى الأدوار (Role-Based Access Control - RBAC).
3. **Strict Code & Command Isolation**: All source code, terminal commands, configuration blocks, API endpoints, JSON/YAML schemas, and protocol flags remain strictly in English (LTR).
4. **Standardization with Regulatory Frameworks**: Align terminology with authoritative Arabic cybersecurity frameworks established by the Saudi NCA, Dubai Electronic Security Center (DESC), and the ITU Arab Regional Cybersecurity Centre.

---

## 2. Master Terminology Lexicon

### A. Fundamentals & Authentication (الأساسيات والمصادقة)

| English Term | Standard Arabic Translation | Avoid (Non-Standard / Inaccurate) | Operational Context |
|---|---|---|---|
| **Identity and Access Management (IAM)** | إدارة الهوية والوصول | التحكم في الدخول | The overarching discipline governing digital identities. |
| **Authentication (AuthN)** | المصادقة / التحقق من الهوية | التفويض | Proving that a subject is who they claim to be. |
| **Authorization (AuthZ)** | الترخيص / تخويل الصلاحيات | المصادقة | Determining what actions an authenticated entity may perform. |
| **Accounting / Auditing (AAA)** | التدقيق والمحاسبة | الحسابات | Logging and auditing actions to prove accountability. |
| **Identity Lifecycle** | دورة حياة الهوية | مراحل الموظف | The end-to-end journey from onboarding to offboarding. |
| **Joiner-Mover-Leaver (JML)** | الانضمام، الانتقال، المغادرة | الداخل والمتحول والخارج | The standard identity lifecycle state transition pipeline. |
| **Single Sign-On (SSO)** | تسجيل الدخول الموحد | الدخول الأحادي / الدخول المنفرد | Centralized authentication across multiple applications. |
| **Multi-Factor Authentication (MFA)** | المصادقة متعددة العوامل | التحقق بخطوتين | Requiring 2+ independent factors (knowledge, possession, inherence). |
| **Phishing-Resistant MFA** | مصادقة مقاومة للتصيد الاحتيالي | مصادقة قوية | Authentication bound cryptographically to the TLS origin (FIDO2). |
| **Passkeys** | مفاتيح المرور الرقمية | كلمات السر البديلة | FIDO2 / WebAuthn discoverable public-key credentials. |
| **Zero Trust Architecture (ZTA)** | بنية الثقة المعدومة / انعدام الثقة | نموذج اللا ثقة | Never trust, always verify continuous evaluation model. |
| **Least Privilege** | مبدأ الامتياز الأقل / الحد الأدنى من الصلاحيات | الصلاحية الصغرى | Granting only permissions necessary to execute required tasks. |

---

### B. Access Control Models & Governance (نماذج التحكم في الوصول والحوكمة)

| English Term | Standard Arabic Translation | Avoid (Non-Standard / Inaccurate) | Operational Context |
|---|---|---|---|
| **Role-Based Access Control (RBAC)** | التحكم في الوصول المستند إلى الأدوار | التحكم بالوظائف | Permissions grouped into roles assigned to subjects. |
| **Attribute-Based Access Control (ABAC)**| التحكم في الوصول المستند إلى الخصائص | التحكم بالصفات | Dynamic policies evaluating subject, resource, and environment. |
| **Relationship-Based Access Control (ReBAC)**| التحكم في الوصول المستند إلى العلاقات | التحكم النسبي | Graph-based authorization (e.g., Google Zanzibar model). |
| **Identity Governance & Administration (IGA)**| حوكمة الهوية وإدارتها | تنظيم المستخدمين | Compliance, access requests, certifications, and audits. |
| **Access Certification / Recertification**| مراجعة وتوثيق الصلاحيات | حملة التدقيق | Periodic managerial reviews to certify continued necessity of access. |
| **Segregation of Duties (SoD)** | الفصل بين المهام المتعارضة | تقسيم العمل | Preventing one identity from holding toxic combinations of access. |
| **Toxic Combinations** | التوليفات الخطرة للصلاحيات | التركيبات السامة | Conflicting entitlements that allow unilateral fraud or bypass. |
| **Entitlement Management** | إدارة الاستحقاقات والصلاحيات | ضبط الرخص | Fine-grained application-level permissions and group memberships. |
| **Orphan Account** | الحساب المهجور / غير المنسوب | الحساب اليتيم | An active account in a target system with no valid human owner. |

---

### C. Privileged Access Management (إدارة الوصول المميّز)

| English Term | Standard Arabic Translation | Avoid (Non-Standard / Inaccurate) | Operational Context |
|---|---|---|---|
| **Privileged Access Management (PAM)** | إدارة الوصول المميّز | إدارة الصلاحيات العليا | Security controls protecting high-impact accounts and resources. |
| **Credential Vault** | خزينة بيانات الاعتماد الرقمية | قبو كلمات السر | Hardened, encrypted repository for credentials and keys. |
| **Privileged Session Management (PSM)**| إدارة الجلسات المميّزة | تسجيل الشاشة | Brokered proxy that isolates, controls, and records sessions. |
| **Just-in-Time (JIT) Access** | الوصول في الوقت المناسب / عند الطلب | الوصول الفوري | Time-bounded elevation granted on demand and revoked after use. |
| **Zero Standing Privileges (ZSP)** | انعدام الصلاحيات الدائمة | تصفير الامتيازات | Eliminating persistent privileged accounts; access is ephemeral. |
| **Break-Glass Account** | حساب الطوارئ المحكم | حساب كسر الزجاج | Emergency administrative account reserved exclusively for DR/disasters. |
| **Credential Rotation** | التدوير التلقائي لبيانات الاعتماد | تغيير الباسورد | Automated programmatic changing of passwords and keys after use. |
| **Credential Injection** | الحقن المباشر لبيانات الاعتماد | تمرير الكلمات | Passing vaulted credentials into a target session without user visibility. |
| **Privileged Access Workstation (PAW)** | محطة العمل المخصصة للوصول المميّز | حاسوب المشرف | Hardened, dedicated physical host isolated for administrative tasks. |

---

### D. Protocols & Federation (البروتوكولات واتحاد الهويات)

| English Term | Standard Arabic Translation | Avoid (Non-Standard / Inaccurate) | Operational Context |
|---|---|---|---|
| **Identity Provider (IdP)** | موفر الهوية / مزود خدمة الهوية | مصدر الدخول | The central authority that authenticates credentials and issues tokens. |
| **Service Provider (SP)** | موفر الخدمة | مقدم البرنامج | The relying application that delegates authentication to the IdP. |
| **Identity Federation** | اتحاد الهويات الرقمية | الائتلاف | Trust relationship allowing identities across distinct security domains. |
| **Assertion (SAML)** | إفادة الهوية المشفرة / إقرار الهوية | تأكيد | Signed XML document carrying authentication and attribute assertions. |
| **Proof Key for Code Exchange (PKCE)**| مفتاح إثبات تبادل الرمز البرمجي | تحقق بيكسي | Cryptographic defense against authorization code interception. |
| **System for Cross-domain Identity Management (SCIM)**| المعيار المشترك لإدارة الهوية عبر النطاقات | بروتوكول سكيم | RESTful protocol for provisioning user accounts across SaaS apps. |
| **Claims / Scopes** | المطالبات / نطاقات الترخيص | الادعاءات | Verified identity attributes (claims) and requested permissions (scopes). |
| **Token Exchange** | تبادل الرموز الرقمية (RFC 8693) | استبدال التوكن | Delegating and swapping security tokens across microservice boundaries. |

---

### E. Machine, Cloud & Modern Security (هويات الآلات والسحابة والأمان الحديث)

| English Term | Standard Arabic Translation | Operational Context |
|---|---|---|
| **Non-Human Identity (NHI)** | هويات الكيانات غير البشرية | Service accounts, API tokens, bots, microservices, and scripts. |
| **Workload Identity Federation** | اتحاد هويات أعباء العمل | Exchanging platform OIDC tokens for cloud credentials without static keys. |
| **Cloud Infrastructure Entitlement Management (CIEM)** | إدارة استحقاقات البنية التحتية السحابية | Discovering and enforcing least privilege across cloud IAM permissions. |
| **Identity Threat Detection & Response (ITDR)** | اكتشاف تهديدات الهوية والاستجابة لها | Monitoring identity telemetry to detect credential abuse and attacks. |
| **Adversary-in-the-Middle (AiTM)** | هجوم الوسيط الاحتيالي | Reverse-proxy phishing stealing session tokens and cookies. |
| **Active Directory Certificate Services (ADCS)** | خدمات شهادات الدليل النشط | Enterprise PKI issuing X.509 certificates used for AD authentication. |
| **Service Principal / Managed Identity** | كيان الخدمة الأساسي / الهوية المدارة | Cloud-native application identities with automated credential lifecycles. |

---

## 3. Style and Tone Rules for Arabic Documentation

- **Scholarly and Instructional Tone**: Avoid flowery adjectives, exaggerated marketing superlatives, or casual conversational filler. Maintain rigorous, authoritative prose.
- **Punctuation**:
  - Use Arabic comma (،) and Arabic semicolon (؛) in Arabic prose.
  - Full stops (.) terminate sentences; exclamation points (!) are prohibited in technical reference copy per `AGENTS.md` §3.
- **Directional Isolation**:
  - Keep all technical terms, CLI options (e.g., `--locale ar`), and protocol names in Latin characters within code tags: `klist`, `samlResponse`, `grant_type=authorization_code`.
