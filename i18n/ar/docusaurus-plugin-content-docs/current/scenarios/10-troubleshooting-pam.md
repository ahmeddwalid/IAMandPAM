---
title: "Troubleshooting: PAM Session and Integration Errors"
description: "PAM failure modes: session drops, vault connectivity, credential rotation, and agent failures, with diagnosis and prevention."
---

# Troubleshooting: PAM Session and Integration Errors

The PAM stack has more moving parts than any other identity component: the vault, the session broker, the target systems, the agents, and the directories it authenticates against. Failures cluster into a small set of patterns. This guide maps symptoms to causes across the stack; it uses generic terminology because every vendor names the components differently, but the architecture is the same one described in [PAM core](/docs/pam-core/what-is-pam).

## Pattern 1: Session starts then drops immediately

**Symptoms.** The user connects through the session broker, authentication succeeds, and the session terminates within seconds. The session log shows an error at target connection time.

**Root causes, in order of likelihood.**

- **Credential drift.** The password stored in the vault for the target account does not match the target's actual password. This happens when the password was changed on the target directly (by an admin, a script, or the vendor's own maintenance), bypassing the vault. The vault's credential test fails silently or the target rejects the login.
- **Network reachability.** The session broker cannot reach the target on the protocol port, because of firewall rules, DNS, or the target being on a segmented network. The broker's error mentions connection timeout or refused.
- **Target-side lockout.** Repeated failed attempts against the target triggered the account lockout, and the session fails with a target-side authentication error.
- **Protocol mismatch.** The broker is configured for one protocol (RDP, SSH) and the target expects another, or the target's SSH host key changed and the broker's known-hosts record is stale.

**Resolution.** Check the vault's credential test for the account (this separates credential drift from network problems in one step). Then verify connectivity from the broker host to the target port. Then check the target's auth log for failed logins. Each check eliminates one cause. For host key changes, refresh the broker's known-hosts record from the target's current key, after confirming the key change was legitimate.

## Pattern 2: Credential retrieval or rotation failures

**Symptoms.** Password rotation jobs fail; the vault log shows the target rejecting the password change, or the vault cannot connect to the target to perform the rotation.

**Root causes.**

- **The rotation account lacks the rights** to change the target password: the target's local policy denies password change, or the account used for rotation has been de-privileged by a hardening exercise.
- **The target is not reachable** at rotation time, so the vault's change attempt fails and the account is left in a partially rotated state (password changed in vault but not on target, or vice versa). The classic divergence: the vault now holds a password the target does not have.
- **The account is in use** during rotation, and the target or the vault's policy refuses to rotate a password for an account with active sessions, leaving the rotation queued forever.

**Resolution.** Confirm the rotation account's permissions on the target, and confirm connectivity. If the vault and target diverged, reconcile: run the credential reconciliation operation (in vault terms, "reconcile" or "verify" the account against the target) to bring the vault in line with the target. Never manually edit a stored password in the vault to "fix" a rotation failure; that produces a new divergence and destroys the audit trail.

## Pattern 3: Session recording missing or broken

**Symptoms.** Sessions complete, but the recording is absent, truncated, or unplayable.

**Root causes.**

- **The recording service failed** during the session (disk full, service restart) and the session was completed without recording. Some brokers block sessions when recording fails; others do not, which is the configuration decision documented in [session recording](/docs/pam-core/core-capabilities).
- **The recording was captured but the audit store is full**, so the write failed silently.
- **The session was not recorded because the target was accessed outside the broker.** This is not a recording bug; it is a bypass, and it is the most important finding in this pattern. Check the target's access logs for connections that did not come through the broker.

**Resolution.** Check the recording service status and the audit store capacity first. Then correlate the session ID in the broker logs with the target's connection logs to confirm the session actually traversed the broker. A gap in that correlation is a bypass finding for the [incident response](/docs/scenarios/incident-insider-threat-session-review) playbook, not a support ticket.

## Pattern 4: Vault-to-directory integration failures

**Symptoms.** Vault cannot authenticate its directory bind, or user sync from the directory fails. The vault log shows an authentication error against the directory.

**Root causes.** This is an [LDAP bind failure](08-troubleshooting-ldap.md) with a specific flavor: the vault's bind account is often a shared service account that predates the vault, with an expired password, a disabled state, or a "must change" flag. The [sub-code table](08-troubleshooting-ldap.md) applies directly.

**Resolution.** Follow the LDAP guide. The vault's own credential test against the directory isolates the cause in one step. Then verify the bind account's state in the directory.

## Pattern 5: Agent failures

**Symptoms.** Agent-managed targets (password discovery, session control) stop responding; the agent appears offline in the management console.

**Root causes.**

- **Agent-to-vault connectivity lost**: network change, agent certificate expired, or the agent service stopped.
- **Agent certificate rotation failed**: the agent holds an expired client certificate and cannot re-authenticate to the vault.
- **Version mismatch**: a vault upgrade left old agents unsupported, and the agents silently stop reporting.

**Resolution.** Check the agent service state and its outbound connectivity to the vault's management port. Check the agent certificate validity, which is a [certificate troubleshooting](09-troubleshooting-certificates.md) case. Then check the vault's supported versions against the deployed agent build.

## Prevention

- **Rotate target passwords only through the vault**, and make direct password changes on targets a violation with detection: the drift alert is the detection mechanism.
- **Monitor the credential test results** for managed accounts. A failing credential test is the early warning for the session-drop pattern.
- **Alert on recording gaps.** An unrecorded session on a privileged target is an incident signal by policy, not a monitoring gap.
- **Keep the agent fleet in the supported version window**, and treat agent certificate expiry like any other certificate: tracked, not discovered.

## Related

- [LDAP bind failures](08-troubleshooting-ldap.md) and [certificate mismatches](09-troubleshooting-certificates.md), for the two integration dependencies.
- [Compromised privileged account](15-incident-compromised-privileged-account.md), for when a credential failure turns out to be an attacker.