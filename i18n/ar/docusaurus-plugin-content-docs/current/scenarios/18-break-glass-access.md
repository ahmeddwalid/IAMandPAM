---
title: Break-Glass Access
description: "The complete break-glass procedure: how emergency access accounts are designed, stored, activated, tested, and monitored without becoming a back door."
---
<!-- verified 2026-08-19: break-glass practices (dedicated accounts, MFA with compensating controls, sealed credentials, periodic testing) reflect Microsoft's and CISA's published guidance on emergency access accounts. -->

# Break-Glass Access

Every identity system eventually has an outage where normal access fails: an IdP is down, a policy is misconfigured, a federation trust is broken, or a conditional access rule locks out the administrators who were supposed to be exempt. Break-glass access is the planned, monitored, and tested path for exactly that situation. Done well, it is a controlled emergency exit. Done badly, it is a standing back door with the most powerful credentials in the environment. This page covers the full procedure: design, storage, activation, testing, and monitoring.

## The two failure modes

Break-glass design fails in two opposite directions, and both are common:

- **The back door**: emergency accounts that are known, usable daily, exempt from monitoring, and excluded from every control. They exist because "we might need them", and they get used because they are convenient. This is how a break-glass account becomes the compromise vector.
- **The locked door**: emergency access that is so rigorously sealed it cannot actually be activated in an emergency: credentials in a safe nobody can open, an activation procedure no one has practiced, or accounts that have drifted out of the directory. The plan that has never been tested is a plan that will fail at the worst moment.

The design goal is a third state: credentials sealed and split so they are not casually usable, but activation is a practiced, documented, and time-limited procedure that any on-call engineer can execute.

## Design of the accounts

| Decision | The right answer | The wrong answer |
|----------|------------------|------------------|
| How many | Two emergency accounts per scope (per tenant, per domain), with different ownership | One account for everything, or one per person |
| Privilege | The minimum needed for the emergency response: the roles that unblock the platform | Membership in every admin group as a convenience |
| MFA | MFA enrolled on the account, but with the hardware key or phone stored with the sealed credentials | No MFA, or MFA exempted |
| Conditional access / policies | *No* blanket exclusions; compensating controls instead: location restriction, alerting on use, session limits | Excluded from every policy, invisible in every report |
| Naming | Clearly identifiable emergency naming (for example, a documented prefix) so usage is auditable | Normal-looking names that blend into the directory |
| Ownership | Documented custodian plus a second person who can vouch for use | Nobody, or the same admin who is likely the one triggering the procedure |

The MFA point deserves emphasis because it is the most common single mistake: an emergency account exempt from MFA is a permanent MFA bypass. The correct pattern is MFA with the second factor physically stored alongside the sealed credentials, so an attacker cannot use the account remotely even if the username and password leak, but the responder can.

## Storage and sealing

The credentials must be hard to use casually and possible to use in minutes:

- **Split knowledge**: the password and the MFA device (or halves of the password) stored separately, with two named custodians. Recovering access requires a deliberate act by more than one person.
- **Physical sealing**: credentials in a sealed envelope or a safe with a tamper-evident seal, or in a PAM vault with dual custody checkout; the seal break is itself the audit event. Vault checkout integrates with the [PAM best practices](../pam-core/04-best-practices.md) model instead of sitting outside it.
- **Documented location**: the storage location, custodians, and checkout process written down in the runbook, with the runbook itself accessible without the broken system (a printed copy or an offline document, since the broken system may be the one the runbook lives on).

## Activation procedure

The activation procedure is a short checklist, not a novel:

1. Declare the emergency and log the trigger: which control failed, who is activating, and why normal access is unusable.
2. Retrieve the sealed credentials per the custody procedure, recording the seal break.
3. Sign in with the emergency account, perform only the minimum actions to restore normal access, and do not use it for routine work.
4. Announce use on the documented channel (the security team's alerting channel), with the account name and the time.
5. After the incident, immediately rotate the emergency credentials, restore the seal, and record the incident.

The property that makes the procedure safe: every step is logged, the use is broadcast, and the credentials are rotated at the end. Break-glass access is safe exactly because it is the opposite of standing access: temporary, announced, and reset.

## Testing

An untested break-glass plan is a theory. The standard cadence:

- **Periodic functional test** (quarterly): an on-call engineer executes the full activation procedure against a test scope, verifies the accounts exist and work, then rotates and re-seals. The test finds drifted accounts, expired certificates, and lost devices, which are exactly the failures that would surface during a real emergency.
- **Credentials check** (quarterly, aligned): verify the sealed credentials still match the directory (password rotations elsewhere do not touch these accounts, which is why they drift).
- **Incident-driven test**: after any incident that used or nearly used the accounts, review the procedure for gaps.

The test is also the training: the engineer who practices the procedure once is the engineer who can execute it under pressure.

## Monitoring

Emergency account usage is a rare event, which makes monitoring cheap and meaningful:

- **Alert on any sign-in**: usage of an emergency account is an event to be broadcast, with the sign-in details, within minutes. There is no legitimate silent use.
- **Watch the monitoring path itself**: if the emergency account is the account used to restore the monitoring stack, ensure the alert on its own use still fires through an independent channel.
- **Post-use review**: every activation produces a short after-action record: what triggered it, what was done, what was rotated. The [Incident: compromised privileged account](../scenarios/15-incident-compromised-privileged-account.md) playbook is the template for that review.

## Interview angle

Break-glass is a favorite interview topic because it exposes judgment. The strong answer has four beats: accounts are designed with MFA and compensating controls (never blanket exemptions), credentials are sealed with split custody, activation is a practiced and broadcast procedure, and the whole loop is tested quarterly and rotated after every use. The likely follow-up is "what if the emergency account itself is compromised?" The answer: the design already limited the damage (scoped privilege, MFA device physically sealed, immediate rotation, alerted usage), and the incident playbook applies, which is the point of having the monitoring path independent of the accounts it monitors.