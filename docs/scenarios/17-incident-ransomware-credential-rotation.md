---
title: "Incident Response: Ransomware Credential Rotation"
description: "Emergency credential rotation at estate scale: sequencing, prioritization, and the decisions that make mass rotation survivable."
---

# Incident Response: Ransomware Credential Rotation

Ransomware attacks reach their most damaging stage by using legitimate credentials: the attacker has admin access through stolen or [compromised](15-incident-compromised-privileged-account.md) accounts, and the recovery depends on rotating credentials faster than the attacker can use them. This playbook covers emergency rotation at estate scale: the sequencing, the prioritization, and the decisions that determine whether rotation succeeds.

## The strategic decision

Mass rotation is a race with two outcomes. If rotation completes before the attacker reconnects, the estate is reclaimed. If the attacker reconnects first, they re-establish access and the race repeats. The playbook therefore has one priority order, and the order is the strategy:

1. **Break the attacker's current access**: the credentials the attacker is known to hold.
2. **Break the attacker's fallback**: the credentials that let them reconnect after the first rotation.
3. **Reclaim the estate**: the remaining credentials, in risk order.

Every decision during the rotation serves this order. Credentials that the attacker does not have can wait; credentials that the attacker might have cannot.

## Phase 1: Stop the bleeding (minutes)

- **Disable and rotate the known-compromised accounts first**: the accounts named in the detection, and the accounts that can reach them. The [compromised account](15-incident-compromised-privileged-account.md) containment applies, at scale.
- **Cut the known persistence paths**: [IdP sessions](/docs/fundamentals/authentication), service principals, API keys, and tokens associated with the incident. A rotated password does not kill a live session; session revocation does.
- **Enable or tighten the controls that slow the attacker down**: MFA enforcement where it was not enforced, conditional access rules, and network segmentation around the affected targets. Each control buys time for the rotation.

## Phase 2: Rotate the privileged estate (hours)

With the immediate access cut, rotate in this order:

1. **Domain-level credentials**: domain admin accounts, the directory's own service accounts, and the credentials that can reset other credentials. These are the crown jewels: whoever holds them controls the directory, and the directory controls everything.
2. **Vault and PAM credentials**: the [vault](/docs/pam-core/core-capabilities) itself, its replication and backup accounts, and the accounts used to rotate other accounts. The vault is the rotation engine; if its own credentials are compromised, every rotation it performs is compromised.
3. **Cloud and platform credentials**: cloud root and admin accounts, break-glass accounts, and platform service principals. Cloud credentials are frequently the attacker's second path, and they rotate independently of the directory.
4. **Service accounts and application credentials**: the [service accounts](/docs/pam-core/what-is-pam) that applications use, in dependency order. This is the slow phase: every service account has consumers, and the rotation must be coordinated with the application teams. The [credential management](/docs/pam-core/core-capabilities) process exists for exactly this coordination, which is why the manual version of this phase is where rotations fail.
5. **User accounts in risk order**: privileged users first, then users with access to the affected data, then the remainder. Full user rotation is the last phase because it is the largest and the attacker's reuse of ordinary user credentials is the least likely path.

## Phase 3: Verify and reclaim (days)

- **Verify each rotation**: the credential no longer works, the consumer still does. A rotated credential that breaks the service is a new outage; a credential that was not actually rotated is a hole.
- **Re-scan for persistence**: the attacker's [session review](16-incident-insider-threat-session-review.md) and endpoint investigation happen in parallel with rotation, because rotation without removal is a treadmill: the attacker re-registers credentials as fast as they are rotated.
- **Reinforce the controls that failed**: the credential sprawl, the missing MFA, the unmonitored service account. The rotation is the emergency fix; the control changes are the permanent fix.

## The decisions that make or break rotation

**Rotation source.** Rotate from the [vault](/docs/pam-core/core-capabilities) or the platform, never by hand in the console. Hand rotation at estate scale produces missed accounts, and a missed account is the attacker's way back in. Every credential must be tracked as rotated or not; the tracking is the audit trail.

**Fail-open versus fail-closed.** When the application cannot accept the new credential yet, the choice is between leaving the old credential live (fail-open, keeps services running, keeps the attacker's path open) and breaking the service (fail-closed). The playbook default for privileged and service accounts is fail-closed: the temporary outage is cheaper than the compromise continuing. This is the decision the incident commander makes, with the trade-off stated explicitly.

**Coordination with the attacker's timeline.** The rotation order follows the attacker's probable access, not the team's convenience. Rotating the easy accounts first because they are easy is how the race is lost.

**Post-incident, not pre-incident, communication.** The rotation is executed first and explained after. Announcing the rotation publicly before it completes hands the attacker the timeline.

## When the estate is already in the attacker's hands

If the attacker has domain-level access and the directory is not trustworthy, rotation alone is not recovery: the directory itself may be modified. The decision escalates to rebuild territory: rebuild or restore the directory from a trusted backup, re-establish the domain with clean credentials, and treat every pre-incident credential as compromised. This is the boundary where the identity playbook hands over to the disaster-recovery playbook, and the [compromised account](15-incident-compromised-privileged-account.md) and [session review](16-incident-insider-threat-session-review.md) evidence becomes the scope definition for the rebuild.