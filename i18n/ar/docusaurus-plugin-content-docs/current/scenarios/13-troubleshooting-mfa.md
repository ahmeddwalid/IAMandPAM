---
title: "Troubleshooting: MFA Time Drift and Device Loss"
description: "MFA failures: TOTP time drift, clock skew on servers, lost devices, and the recovery flow."
---

# Troubleshooting: MFA Time Drift and Device Loss

The two classic MFA failures are the same two failures in every implementation: the one-time code does not verify, and the device that generates the codes is gone. This guide covers both, including the server-side cases that look like app-side problems.

## Pattern 1: TOTP codes rejected at login

**Symptoms.** The user enters the code from the authenticator app and the IdP or application rejects it. The rejection is consistent (every code fails) or intermittent (codes work after a few tries).

**Root causes.**

- **Clock drift on the phone.** TOTP codes are derived from the current time in 30-second windows, per the RFC 6238 algorithm. If the device clock is wrong, the generated codes fall outside the accepted window. This is the classic TOTP failure.
- **Clock skew on the server.** The validating server has the wrong time, so even a correct code fails. Server clocks drift in the other direction, and the symptom is identical.
- **The code window and skew tolerance are misconfigured.** Validators typically accept one or a few windows of skew. A validator configured with zero skew tolerance rejects codes that arrive late, for example during a slow network round trip.
- **The secret was re-seeded.** The user re-enrolled the device (new QR code) but the application still validates against the old secret, or the user scanned the QR twice into two apps and is using the wrong one.

**Resolution.** In order:

1. **Check the device clock.** On the phone, enable automatic time and re-test. Automatic time from the carrier or the network, not manual setting, is the fix for the most common case.
2. **Check the server clock.** Verify the validating service's clock against a time source. If it is wrong, fix time sync; the codes will validate again without any re-enrollment.
3. **Check the accepted skew.** If codes work "after a few tries", the window tolerance is too tight for the network path. Widening the accepted skew on the server side is the fix, not retraining the users.
4. **Verify the seed.** If the above are all correct, re-enroll the factor: revoke the old registration, enroll a fresh one, and confirm the new secret validates immediately with a test code.

## Pattern 2: Hardware key failures

**Symptoms.** The security key does not authenticate: the browser shows a prompt but no response, or the key itself errors.

**Root causes.**

- **The key is out of range or in the wrong port** (WebAuthn requires the key to be reachable; a hub or an extension can interfere).
- **The key's firmware or the browser's protocol support mismatch**, for example a key that only speaks one protocol version against a browser that expects another.
- **The key was never registered to this account**, or the registration was wiped by the vendor's tool.
- **User verification configuration**: the relying party requires a PIN and the user does not know the PIN was set.

**Resolution.** Try the key in another browser and another device to separate the key from the environment. Confirm the registration exists in the account's registered devices. If the key works elsewhere, the account registration is the issue: re-register. If the key fails everywhere, the key itself is faulty: replace it and revoke the old registration.

## Pattern 3: Lost or stolen device

**Symptoms.** The user's phone or key is gone, and login requires the factor that was on it.

**Root causes.** The recovery flow was not designed or was designed badly. The actual failure is organizational: no backup factor, no recovery codes, or recovery requiring the lost device itself.

**Resolution.** This is the [recovery scenario](/docs/scenarios/mfa-enrollment-recovery) executed under pressure:

1. **Verify identity out of band** before resetting anything. The verification strength matches the account risk; a privileged account gets manager approval plus out-of-band confirmation, not a knowledge question.
2. **Revoke the lost factor's registration.** The lost phone with a valid authenticator registration is a live credential in someone else's hands. Revocation happens before enrollment of the new factor.
3. **Enroll a new factor and a new backup.** The replacement flow is the standard [first enrollment](06-mfa-enrollment-recovery.md) flow.
4. **Check for suspicious sign-ins** on the account during the period the factor was missing. If the factor could have been used, the [compromised account playbook](15-incident-compromised-privileged-account.md) applies, not just the recovery flow.

## Prevention

- **Require a backup factor or recovery codes at enrollment.** The backup is what makes the recovery flow survivable. The [MFA scenario](06-mfa-enrollment-recovery.md) covers the policy.
- **Automatic time on all devices** as an enrollment requirement where the platform allows it.
- **Server time sync monitored.** A validating server with a wrong clock breaks every user at once, and it is the fastest fix in this guide.
- **Recovery drills for privileged accounts.** The recovery flow for an admin who lost the phone should be rehearsed before it is needed in an incident.

## Related

- [MFA enrollment and recovery](06-mfa-enrollment-recovery.md), the scenario this guide supports.
- [Compromised privileged account](15-incident-compromised-privileged-account.md), when the lost factor may have been used.