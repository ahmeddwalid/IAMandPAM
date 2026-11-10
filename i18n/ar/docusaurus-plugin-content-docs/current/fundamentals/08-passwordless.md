---
title: Passwordless Authentication
description: "WebAuthn, FIDO2, and passkeys: how passwordless authentication works, why it resists phishing, and what NIST 800-63 says about its strength."
---
<!-- verified 2026-08-19: FIDO2/WebAuthn/CTAP terminology and NIST SP 800-63-4 AAL requirements verified against NIST 800-63-4 and the W3C WebAuthn recommendation. -->

# Passwordless Authentication

Passwords dominate enterprise authentication for one reason: they are universal and free. They also fail in two structural ways. They are shared secrets, so a breach of the verifier exposes every credential it stored (hashes or not). And they are entered into whatever website asks for them, which is what makes phishing effective. Passwordless authentication replaces the shared secret with a private key that never leaves the user's device and that only works for the site it was enrolled with. This page covers the mechanisms, the standards, and the deployment realities.

## The mechanism: public key pairs instead of shared secrets

Passwordless authentication is asymmetric cryptography. At enrollment, the user's device (or security key) generates a public/private key pair:

- The **private key** stays in the authenticator (a security key, phone, or laptop security chip) and never leaves it. There is nothing to steal from a server breach, because no verifier-side secret exists.
- The **public key** is registered with the relying party (the application or identity provider), which uses it to verify signatures.
- At sign-in, the relying party sends a challenge; the authenticator signs it with the private key, proving possession. This is the **assertion**. The user unlocks the key with a gesture (biometric, PIN), which is the "something you are" or "something you know" factor.

The standards stack has three layers:

| Layer | What it is | Who publishes it |
|-------|-----------|------------------|
| WebAuthn | The web API for registration and assertion, exposed by browsers | W3C |
| CTAP2 | The protocol between the browser/platform and the authenticator (USB, NFC, BLE) | FIDO Alliance |
| FIDO2 | The umbrella: WebAuthn + CTAP2 | FIDO Alliance |

## Why this defeats phishing

A phishing site fails at two points:

1. **Origin binding**: the credential is bound to the relying party's origin at registration. The authenticator will only produce an assertion for `login.contoso.com`, so a fake site presenting a different origin gets nothing. No amount of convincing UI changes that, because the signature covers the origin.
2. **No replayable secret**: even a captured assertion cannot be replayed, because each assertion is bound to the challenge and the RP's origin, and the challenge changes per sign-in. TOTP codes, by contrast, are site-agnostic: the code the user types into a fake site is the same code the real site would accept.

This is why NIST and CISA now treat phishing-resistant methods as the target rather than MFA in general: SMS codes and TOTP stop credential stuffing, but they do not stop a real-time relay or a fake sign-in page. The [MFA troubleshooting page](../scenarios/13-troubleshooting-mfa.md) covers the failure modes of the older methods; passwordless removes the class rather than hardening each case.

## Passkeys: the synced variant

A **passkey** is a discoverable WebAuthn credential that can synchronize between the user's devices. The private key is backed up (encrypted) into the platform ecosystem, so a user who enrolls on their phone can sign in on their laptop:

- **Platform-bound passkeys**: tied to one device (Windows Hello, a phone's built-in authenticator). Highest assurance, but the key is lost with the device unless recovery exists.
- **Synced passkeys**: synchronized via the platform (iCloud Keychain, Google Password Manager, third-party managers such as 1Password). Convenient and recoverable, but the private key now exists in multiple places, which is why NIST SP 800-63-4 permits synced authenticators at AAL2 but explicitly excludes them at AAL3.

The business tradeoff is deliberate: synced passkeys are a phishing-resistant replacement for passwords with password-manager-grade portability, while hardware security keys remain the highest-assurance option for administrators and break-glass accounts.

## What NIST 800-63 says

The [framework page](07-nist-800-207.md) covers the AAL table in full. The passwordless-relevant conclusions from NIST SP 800-63-4:

- **AAL1**: passwords and single-factor OTP still qualify. Nothing about passwordless is required.
- **AAL2**: two factors required, and the verifier must offer a phishing-resistant option. A passkey (synced or bound) plus the user gesture qualifies; so does a hardware key.
- **AAL3**: hardware authenticator with a non-exportable private key and phishing resistance required. Synced passkeys are out; security keys and PIV cards are in.

The honest reading for enterprises: deploying passkeys is the fastest way to satisfy the AAL2 phishing-resistant requirement, and security keys are the standard answer for the accounts that should sit at AAL3 (domain admins, break-glass, cloud root).

## Deployment realities

- **Identity provider support**: Entra ID supports passkeys and FIDO2 security keys, with Windows Hello as the platform authenticator; the [Microsoft stack page](../vendors/05-microsoft-stack.md) covers where these sit in the identity plane.
- **Enrollment is the hard part**: the mechanism is easy; issuing hardware keys, registering device-bound credentials, and handling replacement and recovery are the project. Plan for key loss before rollout (recovery codes or alternative MFA methods).
- **Hybrid sign-in**: most enterprises run passwordless for users and keep passwords (or key-based auth) for legacy integrations. Passwordless does not remove the password's existence from the environment; it removes it from the user's daily path, which is what cuts phishing exposure.
- **Caveats**: passwordless does not fix identity proofing (enrollment must still verify who the user is), does not fix session management (a hijacked session is still hijacked), and does not fix the accounts that cannot use it (service accounts authenticate with keys and tokens, not gestures; see [Secrets Management](../pam-core/09-secrets-management.md)).

## Interview angle

The question that separates candidates: "why is a passkey better than TOTP?" The answer has three parts, in order of importance: it is bound to the origin, so phishing cannot harvest it; it is a signature, not a shared secret, so server breaches expose no credential; and it is unlocked by a gesture, so it remains two-factor without a password. Then, if the interviewer pushes on tradeoffs, mention the sync-versus-hardware distinction and the AAL2/AAL3 line from NIST. That combination shows both mechanism knowledge and judgment.