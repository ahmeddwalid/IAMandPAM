---
title: "PAM Best Practices"
description: "The rules that make PAM work: MFA for administrators, least privilege for privileged access, rotation, review, and break-glass discipline."
---

# PAM Best Practices

Mechanisms do not make a program; discipline does. This page is the ruleset that separates a PAM deployment that passes audits from one that merely owns a vault. Each rule is stated as a specific, testable requirement, with the reasoning and the common failure.

## 1. No standing privileged access for daily use

The highest-impact rule in all of PAM. Privileged accounts exist for emergencies and for specific tasks, not for the working day. Where a person needs regular privileged access, use [JIT access](jit-access): grant, use, revoke, repeat. The test: at any random moment, the number of currently privileged humans in the environment should be close to zero.

**Failure mode:** the domain admin group has ten members who all "need it for their job." Every one of those memberships is a standing target.

## 2. Phishing-resistant MFA for every admin

Privileged access must not hinge on a single factor that phishing can harvest. The admin-facing login should require MFA with a phishing-resistant factor (hardware key or passkey) wherever the platform supports it, and SMS or push-based factors are a documented exception, not the default, for privileged accounts.

**Failure mode:** an admin's corporate password plus a push prompt is bypassed in a push-fatigue attack, and the attacker now holds domain admin.

## 3. The credential never reaches the person

If a human ever sees, types, or copies a privileged password, that control is gone: it is now in their browser history, their clipboard, their notes, or their password manager. The rule is absolute: privileged credentials are used through brokered sessions or injected by the vault, never handed to people.

**Failure mode:** the program vaults everything, then the team keeps the "real" root password in the shared password manager for convenience.

## 4. Rotate on event, not on schedule

Rotation should be triggered by events: check-in after use, personnel changes, compromise indicators, and alert-triggered incidents. Scheduled rotation is the baseline; event-driven rotation is the goal.

**Failure mode:** quarterly rotation on a calendar, while the account was checked out by a departing contractor in week one of the quarter.

## 5. Account for every break-glass path

Every emergency path must be enumerated, sealed, and tested:

- The break-glass account exists and is usable when the platform itself is down (the offline recovery path).
- Its credentials are split between two holders, sealed, and stored outside the vault.
- Every use fires an alert and triggers an after-action review.
- The account is rotated and re-sealed after any use.

**Failure mode:** the break-glass procedure is a sticky note with the root password, because "we never need it, it is just for emergencies."

## 6. Review privileged access quarterly, at least

Two reviews, both with real owners:

- **Account review**: every entry in the privileged account inventory has a named owner, and the owner confirms it is still needed and still correctly scoped.
- **Activity review**: a sample (or all) of recorded sessions and check-outs are reviewed for anomalies: unusual hours, unusual targets, unusual commands.

**Failure mode:** a self-service certification where everyone clicks approve on the whole list in five minutes. The review is the control; rubber-stamping is the absence of it.

## 7. Monitor the monitor

The vault and the session platform are themselves the most privileged systems in the environment. They need their own controls: the platform admins are dual-controlled, platform access is MFA-protected, and platform logs are shipped to an independent SIEM where a compromise cannot delete them.

**Failure mode:** the PAM admin can edit the PAM audit logs. When the inevitable question is asked, the answer is a vacuum.

## 8. Least privilege for privileged access

The privileged grant should be the smallest that does the job, for the shortest window:

- Scoped roles (backup admin, password-reset admin) instead of global admin where the platform allows splitting.
- Time-boxed grants measured in minutes for interactive use, not days.
- Service accounts scoped to their function, reviewed like any other privileged account.

**Failure mode:** one "admin" role for everything, because role design takes effort.

## 9. Treat the audit trail as a product

The logs and recordings are not a by-product; they are the deliverable. They must be complete (everything privileged is recorded), tamper-evident (append-only, shipped off-platform), searchable (who, what, when, why in one query), and retained per the organization's obligations.

**Failure mode:** recordings exist but nobody can search them, so the compliance question takes weeks to answer.

## 10. Start with discovery, then close the gaps

The program starts with an inventory ([privileged account types](privileged-account-types)), then proceeds in order: vault what exists, eliminate what can be eliminated, broker what must be used, and record everything. Attempting session management before the inventory exists produces a program with blind spots.

**Failure mode:** buying the platform first and discovering later that the estate is twice the size the scoping assumed.

## The pattern in one line

Every rule above is the same rule: make privileged access personal, temporary, and recorded. The mechanisms ([core capabilities](core-capabilities)) provide the machinery; these rules are the operating manual.

Next: [PAM architecture](pam-architecture), how the components and the rules assemble into a deployment.