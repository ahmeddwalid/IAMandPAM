---
title: "Certifications"
description: "IAM and PAM certifications with verified current costs, prerequisites, difficulty, and the roles that ask for them."
---
<!-- verified 2026-08-18: costs and prerequisites checked against CompTIA, Microsoft Learn, Okta, SailPoint University, Pearson VUE, ISC2 sources -->

# Certifications

Certifications matter differently at different career stages. Early on they substitute for experience you do not yet have, and later they signal specialization. The six below are the ones this site's content maps to directly. All prices were verified against official sources on 2026-08-18 and are listed with their verification date so staleness is easy to spot; prices change, so treat them as a starting point.

## The certification map

| Certification | Cost (verified 2026-08-18) | Prerequisites | Renewal | Best for |
|---|---|---|---|---|
| CompTIA Security+ (SY0-701) | $439 retail from CompTIA; partner vouchers typically $373-$395; academic discounts exist | None formal | Every 3 years via CompTIA CE program (CEUs or renewal exam) | Entry roles, DoD 8140 compliance |
| Microsoft SC-300 (Identity and Access Administrator Associate) | $165 | None formal; Microsoft recommends Entra and AD DS familiarity | Annual, free via online assessment on Microsoft Learn | IAM administrator roles on the Microsoft stack |
| Okta Certified Professional | $250 (retakes $100) | None formal; hands-on Okta experience recommended | Maintenance exam required periodically | IAM engineer roles in Okta shops |
| SailPoint Certified IdentityIQ Engineer | $400 (includes two attempts) | 1 year of hands-on IdentityIQ experience recommended | Role-based certs expire; check SailPoint's current policy | IdentityIQ implementers and engineers |
| CyberArk Defender PAM (PAM-DEF) | ~$200 (regional pricing varies) | None formal, but hands-on CyberArk experience is effectively required | Every 2-3 years via recertification | PAM operators and administrators |
| CyberArk Sentry PAM (PAM-SEN) | ~$200-$300 (regional pricing varies) | CyberArk Defender required | Every 2-3 years via recertification | PAM engineers and implementers |
| ISC2 CISSP | $749 (retakes $749; reschedule $50, cancel $100) | 5 years paid experience in 2+ of the 8 domains; degree or approved cert waives 1 year | Annual maintenance fee $135/year, 120 CPEs per 3-year cycle | Senior and architect roles |

## CompTIA Security+ (SY0-701)

The entry credential for security roles broadly, and the one most often listed as a baseline requirement, including for US government-adjacent contracting through the DoD 8140 directive.

- **What it covers**: security concepts, threats and vulnerabilities, architecture and design, implementation, operations and incident response, and governance. IAM content is present but not dominant.
- **Difficulty**: the classic first-certification difficulty: a broad survey, mostly memorization with applied scenario questions. Doable in 6-10 weeks of part-time study.
- **Who asks for it**: entry-level security analysts, SOC roles, help desk paths into security, and any role where the employer works with US federal contracts.
- **Study notes**: the free Professor Messer video series plus a practice question bank is the standard self-study stack; partner voucher bundles with a course are usually cheaper than the retail price.

## Microsoft SC-300 (Identity and Access Administrator Associate)

The identity credential for the Microsoft stack, covering exactly the territory of this site: identity lifecycle, authentication and access management, workload identities, and identity governance, all in Microsoft Entra ID.

- **What it covers** (skills measured as of April 2026): implement and manage user identities (20-25%), implement authentication and access management (25-30%), plan and implement workload identities (20-25%), plan and automate identity governance (20-25%).
- **Difficulty**: moderate. It assumes working familiarity with Entra ID, PowerShell, and AD DS; candidates without any Azure experience typically start with SC-900.
- **Who asks for it**: Identity and Access Administrator, IAM analyst, and security administrator roles in Microsoft-centric companies, which covers a large share of the market.
- **Study notes**: the exam is 100 minutes, 40-60 questions, pass mark 700/1000. Microsoft's free practice assessment is a fair preview of the question style.

## Okta Certified Professional

The entry Okta credential, notable because the exam is now fully performance-based: as of July 6, 2026, the Professional exam is 100% hands-on use cases (the previous multiple-choice version retired), which makes it a real lab test rather than a vocabulary test.

- **What it covers**: user management, SSO, basic security configurations, and day-to-day Okta administration.
- **Difficulty**: moderate for candidates who have not touched Okta; the hands-on format means practice in a real Okta org matters more than flashcards.
- **Who asks for it**: IAM engineers and support roles at companies running Okta, plus Okta partners.
- **Study notes**: Okta sells a premier practice exam ($75, seven attempts) that mirrors the performance format; a free practice version also exists.

## SailPoint Certified IdentityIQ Engineer

The on-premise IGA credential, covering IdentityIQ installation and deployment, Lifecycle Manager, identity governance, custom development, application onboarding, and troubleshooting.

- **What it covers**: IdentityIQ build and deployment, identity lifecycle management, access governance, rule and workflow development, and data/access modeling.
- **Difficulty**: the official material recommends one year of hands-on IdentityIQ experience. It is a role-based exam: it tests work you have done, not a course you have watched.
- **Who asks for it**: IdentityIQ implementers, IGA engineers, and consultants at SailPoint partners and customers.
- **Study notes**: the $400 registration includes two attempts and 364 days to schedule. SailPoint's certification program also added a cloud-focused Identity Security Engineer path; the IdentityIQ line targets on-premise shops, which remain common in banking and government.

## CyberArk Defender and Sentry (PAM)

The PAM specialist credentials, in a two-level progression: Defender covers day-to-day operation (vault administration, PVWA usage, PSM and CPM basics), and Sentry covers deployment, configuration, and troubleshooting. Since November 1, 2025, CyberArk exams are administered in person at Pearson VUE centers only.

- **Prerequisites**: Defender has no formal prerequisite but tests operational knowledge you only get by working with the product. Sentry requires Defender.
- **Difficulty**: Defender is the easier of the two but still assumes you have used the product. Sentry is notably harder and expects implementation experience.
- **Who asks for it**: PAM administrators and engineers at CyberArk customers and partners. These are specialist roles; employers generally do not hire for them as a first job.
- **Study notes**: the only realistic preparation is hands-on time with the product, which is why the [hands-on lab section](/docs/labs/) frames CyberArk trial use as a learning exercise, not a substitute for production experience.

## ISC2 CISSP

The senior credential, and the one with real eligibility rules: five years of paid full-time experience in at least two of the eight domains, with a degree or approved certification waiving one year. The IAM domain is one of the eight, so identity work counts toward eligibility.

- **What it covers**: eight domains from security and risk management through IAM (13% weight), security operations, and software development security.
- **Difficulty**: the exam itself is hard but fair (CAT, 100-150 questions, pass 700/1000); the real filter is the experience requirement. Passing without the experience makes you an Associate of ISC2, with six years to earn it.
- **Who asks for it**: senior security roles, architects, and leadership positions; in identity specifically, architect and director roles list CISSP as preferred or required.
- **Study notes**: budget for the annual $135 maintenance fee and 120 CPEs per three-year cycle, not just the exam fee. Retake policy: 30 days between attempt 1 and 2, 90 days to attempt 3, 180 days after that.

## How to choose

The sequencing logic that fits this site's career section:

1. **Start with Security+ or SC-300** if you are entering the field: Security+ for breadth and US market compliance, SC-300 if your target market is Microsoft-centric.
2. **Add a vendor IAM credential** (Okta Professional or SC-300) once you have touched the product, because the value is the hands-on component.
3. **Add a PAM credential** (CyberArk Defender then Sentry) only after real PAM experience, because the exam assumes it and employers will probe it in interviews.
4. **Plan CISSP for the 4-5 year mark**, when your experience satisfies the eligibility, and let the exam structure itself (two domains minimum) tell you which parts of your career count.

The [career ladder](/docs/careers/career-ladder) page shows where each credential sits relative to the roles, and the [Middle East and Egypt](/docs/careers/middle-east-gulf-egypt) page covers how the same credentials are weighted in that market.