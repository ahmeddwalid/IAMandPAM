---
title: "Incident Response: Compromised Privileged Account"
description: "Containment, evidence preservation, and recovery for a compromised privileged account."
---

# Incident Response: Compromised Privileged Account

A compromised privileged account is the worst-case identity incident: the attacker holds credentials that the organization itself treats as high-trust. This playbook covers containment first, evidence second, and recovery third, because the order is the strategy. The goal is twofold: stop the attacker, and preserve the evidence that proves the scope afterward.

## Detection signals

The trigger is rarely "the account was compromised". It is one of these:

- **A sign-in anomaly**: login from a new location, a new device, or outside the account's normal hours; MFA prompts the user did not initiate.
- **A credential failure pattern**: the account was used and failed, which an attacker does while testing access.
- **A session anomaly**: a [PAM session](/docs/pam-core/core-capabilities) on a target the account never touches, at a time it never operates.
- **An alert from a correlated source**: the same IP, token, or device fingerprint appears against multiple accounts.
- **A data signal**: the account's mailbox, file shares, or code repositories show access patterns outside baseline.

Treat any of these on a privileged account as an incident until proven otherwise. The cost of a false alarm is a review; the cost of ignoring the signal is the [ransomware scenario](17-incident-ransomware-credential-rotation.md).

## Containment (minutes)

Containment stops the attacker from using the account further. Do these in order, and do not wait for evidence collection:

1. **Disable the account at the directory.** This is the anchor control: the account cannot authenticate anywhere.
2. **Terminate active sessions.** Revoke IdP sessions, terminate PAM sessions at the vault, and kill the account's active sessions on targets. A disabled account does not terminate sessions that are already established.
3. **Revoke MFA registrations and rotate credentials.** Rotate the account's password and revoke its tokens, keys, and certificates. For a service account, this means updating every consumer, which the [credential management](/docs/pam-core/core-capabilities) process handles.
4. **Revoke downstream access**: cloud provider roles, API keys, and service principals associated with the account. The account's blast radius is everything it could reach, and containment means cutting the reach, not just the login.
5. **Preserve the evidence before cleanup**: sign-in logs, session recordings, vault audit logs, and target access logs are exported and hashed before anything is deleted. The account being disabled does not delete its history, but incident cleanup often does.

The discipline: containment actions are reversible (the account can be re-enabled), while evidence loss is not. Export first, clean up second.

## Investigation (hours)

With the account contained, establish the scope:

- **What did the attacker access?** Walk the sign-in log and the session recordings backward from the detection point. Every target the account reached, every file it read, every command it ran is scope.
- **How did they get in?** The credential source matters for recovery: a phishing-reset password, a vault extraction, a token replay, or a [service account](/docs/protocols-iga/scim) with a hardcoded secret all imply different fixes. The [SAML](12-troubleshooting-saml.md) and [MFA](13-troubleshooting-mfa.md) guides cover the authentication-side failures.
- **Did they move?** Check for lateral movement: new accounts created, group memberships changed, tokens minted, persistence mechanisms installed. The account's own history is the start; the endpoints it touched are the search space.
- **Did they reach privileged targets?** If the account held or could assume [privileged access](/docs/pam-core/what-is-pam), the investigation expands to the PAM session history and the vault's audit log.

## Recovery (days)

1. **Re-establish the account cleanly.** Re-enable with a rotated credential, MFA re-enrollment, and a fresh review of its permissions. The review matters: the compromise is the moment to remove the standing rights the account never needed, with the [JIT](/docs/pam-core/jit-access) pattern as the replacement.
2. **Check for persistence everywhere the account reached.** Tokens, SSH keys, scheduled tasks, and service credentials on the accessed targets. The account was the door; persistence is the lock the attacker left inside.
3. **Update the threat model.** What made this compromise possible? The fix is a control change, not a policy reminder: reissue a hardcoded secret, enforce [MFA](/docs/fundamentals/authentication) on the affected flow, rotate the [certificate](09-troubleshooting-certificates.md) that was in scope.
4. **Write the post-incident report** with the timeline, the scope, the fix, and the evidence index. The report is the deliverable that turns the incident into institutional knowledge, and it feeds the [certification campaign](05-certification-campaign.md) review of the affected account's entitlements.

## What the playbook assumes

This playbook assumes the basics exist: sign-in logs retained, sessions recorded, and credentials inventoried. The failure mode to avoid is discovering during the investigation that the account's history was never logged, which turns an incident into an unknown. The [session review](16-incident-insider-threat-session-review.md) playbook covers the review of that history, and the [credential rotation](17-incident-ransomware-credential-rotation.md) playbook covers the mass variant when the compromise is estate-wide.