---
title: The AAA Model
description: "Authentication, Authorization, and Accounting: the three-stage structure behind every access decision."
---

# The AAA Model

Every access decision in a secure system follows the same three-stage structure, known as the AAA model: **Authentication**, **Authorization**, and **Accounting**. The acronym is also familiar from network access control (RADIUS, TACACS+), where it governs device and VPN access; the shape is identical in IAM, and this page treats it in that context.

## Authentication: proving who you are

Authentication is the process of establishing that a claimed identity is real. The user presents a secret or attribute, and the system checks it against what it holds for that identity.

The three classic factors are:

| Factor | Kind | Examples |
|---|---|---|
| Knowledge | Something you know | Password, PIN, security answer |
| Possession | Something you have | Phone, hardware token, security key |
| Inherence | Something you are | Fingerprint, face, behavior pattern |

Single-factor authentication (typically a password) remains common but is the weakest point in most systems. Modern practice layers factors: see [Authentication](05-authentication.md) for how MFA and passwordless methods change this picture.

Authentication verifies *identity*, not *entitlement*. "This is Mounir" is a different claim from "Mounir may read payroll files," and conflating the two is a classic failure. The second claim is the job of the next stage.

## Authorization: deciding what you may do

Authorization determines what an authenticated identity may do. It is a decision made against policy, typically expressed as permissions tied to roles or attributes (see [Authorization](06-authorization.md) for the models).

Key properties of authorization:

- It happens **after** authentication. Anonymous users are denied by default; authenticated users are checked against their grants.
- It is **revocable and reviewable**. Access can be withdrawn without changing the identity, and reviews can certify that grants still match business need.
- It is **enforced per request**. The decision is taken at the point of access, not once at login. A session that started with access to a resource loses that access if the underlying grant is revoked.

Authorization without authentication is meaningless (the system does not know who to check), and authentication without authorization is a standing risk (any authenticated user can do anything). The two belong together.

## Accounting: recording what was done

Accounting, sometimes called auditing, records what actually happened: who accessed what, when, from where, and with what result. Its outputs are logs, audit trails, and reports.

Accounting serves three distinct audiences:

- **Security operations.** Anomalous access (a finance user logging in at 3am from a foreign network) becomes visible.
- **Auditors and compliance.** Regulators and external auditors require evidence of who held and used access. The phrase "prove it" describes most audit findings: the organization must be able to demonstrate its controls worked, which requires records.
- **Operations.** Usage patterns inform license management, access reviews, and troubleshooting.

Accounting is only as good as its integrity. Logs that can be modified by the attacker who triggered them are evidence in name only. Mature environments forward security-relevant logs to a central store with write-once handling and restrict who can alter or delete them.

## The model in practice

A worked example ties the three stages together. A nurse opens a patient record system:

1. **Authentication**: she presents her smart card and PIN (possession plus knowledge).
2. **Authorization**: the system checks her role, `clinical-nursing`, against the policy for the record she requested, and permits read access to her ward's patients.
3. **Accounting**: the access, the record opened, the time, and the terminal are written to the audit trail.

Later, an auditor reviewing "who accessed patient X's record" can answer from the accounting layer, and a compliance review can confirm that the role grants she holds are still appropriate.

## Why the distinction matters

The three stages fail in different ways and need different defenses:

- Authentication failures are fixed with stronger proof (MFA, phishing-resistant methods).
- Authorization failures are fixed with better policy design (least privilege, role reviews).
- Accounting failures are fixed with storage and integrity controls (central logs, tamper protection).

Treating them as one problem leads to overspending in one area and gaps in the others. Most IAM incidents trace back to an authorization or accounting gap, not to the authentication layer itself, which is why mature programs strengthen all three.

Next: the [identity lifecycle](03-identity-lifecycle.md), the process that keeps identity records and their access current.