---
title: Authentication
description: "How identity is proven: the decline of the password, multi-factor authentication, passwordless methods, and single sign-on."
---

# Authentication

Authentication is the process of proving that a claimed identity is real (stage one of the [AAA model](02-aaa-model.md)). This page covers the mechanisms: what passwords still do well, why they are no longer sufficient, how multi-factor authentication (MFA) and passwordless methods change the equation, and how single sign-on (SSO) concentrates the problem into one well-protected place.

## The password and why it is not enough

Passwords are knowledge-factor secrets: the system stores a salted hash, the user proves possession of the secret, and the system compares. They remain universal because they are cheap, standard, and understood by every user.

They fail because the secret is the problem:

- **Reuse.** People reuse passwords across sites, so a breach at one service hands over credentials that work elsewhere. Credential stuffing (automated replay of breached username/password pairs) exists because this works.
- **Phishing.** A password is something the user will type into whatever looks like the right site. The classic weakness of the knowledge factor is that the user is the one who leaks it, willingly, to the attacker.
- **Weakness and guessing.** Human-chosen secrets are predictable. Even policy-forced complexity produces patterns attackers can model.
- **No revocation granularity.** A password breach means changing the secret; everything else about the account is untouched.

The industry answer is not better passwords. It is to stop relying on a single secret, which is what MFA and passwordless methods do.

## Multi-factor authentication

MFA requires the user to present evidence from two or more different factors (knowledge, possession, inherence) at authentication time. The point is not that any one factor is strong; it is that the attacker who steals one factor still lacks the others. A phished password is worthless without the phone or security key.

| Method | Factor | Strength | Notes |
|---|---|---|---|
| TOTP app (time-based one-time codes) | Possession | Good | Codes rotate every 30 seconds; phishing can still collect the current code |
| SMS code | Possession | Weak-moderate | Interception and SIM-swap attacks make this a poor second factor; regulators increasingly discourage it |
| Push approval | Possession | Good | Convenient, but "just tap yes" fatigue weakens it; some implementations add number matching |
| Hardware security key (FIDO2) | Possession | Strong | Phishing-resistant by design: the key only releases its assertion to the correct origin |
| Biometrics (face, fingerprint) | Inherence | Good as a factor | Operates via a secure enclave; serves as the "you are present" half of a device-bound login |

The minimum bar for most organizations is MFA on everything reachable from the internet, with phishing-resistant methods (security keys or passkeys) on administrative access. The logic is simple: the credential an attacker can steal is only half the proof.

## Passwordless

Passwordless authentication removes the shared secret entirely. The canonical implementation is FIDO2/WebAuthn: the device holds a private key, the site holds the public key, and authentication is a cryptographic challenge-response. There is no secret to type, leak, or replay, and the protocol binds the assertion to the exact website origin, which defeats phishing by construction.

The common passwordless patterns:

- **Passkeys** (FIDO2 credentials synced across a platform's devices). The user authenticates to the device with a PIN or biometric, and the device authenticates to the site.
- **Biometrics as the primary factor** on managed devices, backed by the platform's secure enclave.
- **Magic links and one-time codes** sent to a verified inbox. Simpler than passkeys but the email channel becomes the attack surface, so these work best for low-risk flows.

Passwordless does not mean "no proof." It means the proof is cryptographic and device-bound instead of a shared secret. Enterprises adopting passkeys still protect them with an enterprise key-management story, because losing the device backup means losing access.

## Single sign-on

SSO lets one authentication event at a central identity provider (IdP) open multiple applications. After the user proves their identity to the IdP, the IdP vouches for them to each application via a protocol (SAML, OIDC; see [Identity Protocols & IGA](../protocols-iga/index.md)).

What SSO buys:

- **Fewer secrets.** Users type credentials once per session instead of once per application, which removes most password reset traffic and most reused passwords.
- **Consistent policy.** MFA, device checks, and session rules are enforced in one place, for every application behind the IdP.
- **Central revocation.** Disabling one account at the IdP cuts off every application at once, which makes the [leaver](03-identity-lifecycle.md) process practical.

What it costs:

- **Concentration.** The IdP is now the single most valuable credential target in the organization. A compromised IdP session is a session to everything. This is exactly why the IdP must carry the strongest authentication (phishing-resistant MFA) and why session lifetimes there should be short.
- **Sessions live longer.** SSO users stay authenticated for the session lifetime, so session revocation and idle timeouts become controls in their own right.

## Choosing a strategy

There is no universal answer, but the shape of a defensible strategy is consistent:

1. Kill weak factors: no SMS-only MFA, no passwords alone on anything internet-facing.
2. Push phishing-resistant methods (passkeys, security keys) on privileged and administrative access.
3. Use SSO to concentrate authentication at the IdP, then protect the IdP hardest.
4. Keep a fallback for account recovery that does not weaken the primary path (recovery codes, verified devices).

Authentication only decides *who* is asking. The other half of the decision, *what they may do*, is [Authorization](06-authorization.md).