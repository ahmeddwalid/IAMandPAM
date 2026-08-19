---
title: Attacks on Identity Infrastructure
description: "The attacks that target identity systems: credential theft, token and ticket abuse, MFA bypass, and consent phishing, with detection and defense for each."
---
<!-- verified 2026-08-19: attack names and mechanisms (Kerberoasting, DCSync, shadow credentials, MFA fatigue, consent phishing) verified against MITRE ATT&CK technique names and Microsoft security documentation. -->

# Attacks on Identity Infrastructure

Identity systems are the highest-value target in most enterprises, because they are the gateway to every other system. This page collects the attacks that actually show up in incident reports and interviews, organized by what they attack: credentials, tickets and tokens, authentication flows, and trust relationships. Each entry states how the attack works, why it works, how to detect it, and where this site's controls answer it.

## Attacks on credentials

| Attack | How it works | Why it works | Detection | Defense |
|--------|--------------|--------------|-----------|---------|
| Password spray | Low-volume login attempts with common passwords against many accounts, staying under lockout thresholds | Lockout thresholds and anomaly detection typically key on per-account volume, not cross-account patterns | Failed logon volume across accounts, unusual sign-in locations, event 4625 aggregation | Risk-based sign-in, password blocklists, MFA everywhere, banning legacy protocols |
| Credential stuffing | Replay of leaked username/password pairs from other breaches | Users reuse passwords across services | Sudden spikes of failed logons from automation; credential-stuffing lists are public | Password blocklists, MFA, breach monitoring, mandatory reset after leak |
| Pass-the-hash | Replay the NT hash of a password to authenticate without the password | NTLM authenticates on the hash, and hashes reside on machines after logon | NTLM usage where it should not exist, lateral movement patterns | Disable NTLM, restrict local admin rights, credential guard, treat hashes as secrets (see [Kerberos page](../protocols-iga/08-kerberos.md)) |
| Kerberoasting | Request a service ticket and crack the service account password offline | Service tickets are encrypted with service account keys; service passwords are often weak and never rotated | Service ticket requests for non-interactive accounts, AES vs RC4 ticket encryption patterns | Strong unique service passwords, managed rotation, least privilege on SPNs, monitoring (see [Kerberos page](../protocols-iga/08-kerberos.md)) |
| Shadow credentials | Write a certificate credential (`msDS-KeyCredentialLink`) onto a target account to authenticate as it with PKINIT | Modification of the attribute is rarely monitored; a single write grants persistent authentication | Changes to `msDS-KeyCredentialLink`, PKINIT authentication from unexpected principals | Monitor attribute changes, restrict who can modify it, treat it as a privileged entitlement (see [Privileged Account Types](02-privileged-account-types.md)) |

The pattern: every credential attack exploits a credential that is too weak, too long-lived, or too replayable. The defense theme is therefore rotation, uniqueness, and monitoring, which is the entire subject of [PAM Best Practices](04-best-practices.md).

## Attacks on tickets and tokens

| Attack | How it works | Why it works | Detection | Defense |
|--------|--------------|--------------|-----------|---------|
| Golden ticket | Forge a TGT with the KRBTGT hash, granting domain-wide impersonation until the forged ticket expires | Domain controllers trust any TGT they can decrypt; the KRBTGT key is static | Anomalous TGT issuance, tickets with unusual lifetimes or groups | Tier 0 protection of KRBTGT, rotation on compromise, monitoring (see [Kerberos page](../protocols-iga/08-kerberos.md)) |
| Silver ticket | Forge a service ticket with a compromised service account key | Service tickets are validated against the service key, not per request | Service ticket anomalies, logon for service accounts at odd hours | Service account hygiene, AES-only Kerberos, monitoring |
| Pass-the-ticket | Replay a captured TGT or service ticket from another machine | Tickets are valid until expiry regardless of source machine | Unusual ticket usage patterns across hosts | Shorter ticket lifetimes, disable unconstrained delegation |
| Token theft / session hijacking | Steal a session cookie, access token, or browser session and reuse it | Tokens are bearer credentials: whoever holds them is the user until expiry | Impossible travel, token replay signals, new device/UA with existing session | Short token lifetimes, token binding, device-based session controls, step-up reauth for sensitive actions |
| Token leakage into logs | Access tokens or credentials written into application logs, CI logs, or trace output | Logging libraries capture query strings and headers; nobody reviews logs for secrets | Regular log scans for credential patterns | Never log tokens or secrets, redaction at the edge, secret scanning in CI (see [Secrets Management](09-secrets-management.md)) |

The theme: tickets and tokens are bearer instruments, so their lifetime and their resting places are the control surface. Short expiry, session scoping, and hygiene of the keys that sign them are the answers, and they are implemented in [JIT Access](07-jit-access.md) and the [OIDC page](../protocols-iga/04-oidc.md).

## Attacks on authentication flows

| Attack | How it works | Why it works | Detection | Defense |
|--------|--------------|--------------|-----------|---------|
| MFA fatigue (push bombing) | Spam push notifications until the user accepts one, often during off hours | Users accept pushes out of annoyance or confusion; the notification itself is the social engineering | Repeated MFA denials followed by acceptance, off-hours success | Number matching, rate limits on pushes, step-up for sensitive roles, policy to lock after N denials (see [MFA troubleshooting](../scenarios/13-troubleshooting-mfa.md)) |
| Adversary-in-the-middle relay | Present a phishing page that relays the real IdP flow in real time, harvesting the session | The user authenticates against a genuine IdP; the relay holds the session | Suspicious geographic or device transitions immediately after sign-in | Phishing-resistant authentication (passkeys), device trust, continuous session evaluation (see [Passwordless page](../fundamentals/08-passwordless.md)) |
| SIM swapping | Take over the victim's phone number to receive SMS codes | SMS OTP is delivered to a number, and number porting is socially engineered | SMS codes consumed on new devices, number porting events | Deprecate SMS, use TOTP or phishing-resistant methods, carrier controls |
| Password reset abuse | Socially engineer a help desk or an insecure reset flow | Resets authenticate the caller, not the user; proofing is weak | Reset volume spikes, resets followed by data exfiltration | Strong reset proofing, verified identity workflows, anomaly review (see [Identity Lifecycle](../fundamentals/03-identity-lifecycle.md)) |

The theme: these attacks target the *process* around authentication rather than the cryptography. The defenses are process defenses: number matching, step-up authentication, phishing-resistant methods, and treating resets as a privileged operation.

## Attacks on trust relationships

| Attack | How it works | Why it works | Detection | Defense |
|--------|--------------|--------------|-----------|---------|
| OAuth consent phishing | Register a malicious application and social-engineer users into consenting; the app then uses the granted scopes with the platform | Consent grants are normal user behavior; broad scopes are often requested and granted without review | Consent grants to unknown publishers, apps with broad scopes, anomalies in granted permissions | Consent policies (restrict by publisher, scope, or require admin approval), app governance, alerting on consent events |
| Federation trust misuse | Misconfigured or overly broad trust between IdPs lets an attacker authenticate through a weak external IdP | Federation trusts are honored as configured; a broad trust is a back door (see the [SAML page](../protocols-iga/02-saml.md)) | Sign-ins through unexpected IdPs, assertion anomalies | Trust reviews, restrict inbound federation to known issuers, validate assertions, monitoring (see [SAML troubleshooting](../scenarios/12-troubleshooting-saml.md)) |
| Cloud root and service principal abuse | Compromised cloud root accounts or overprivileged service principals used for persistence | Root and service principals are powerful by design and rarely monitored | Root account activity, service principal privilege changes | Root protection (no MFA exemption), JIT elevation, service principal least privilege (see [Cloud IAM lab](../labs/03-cloud-iam.md)) |
| Insider overreach | A legitimate account performing actions beyond its role, exploiting standing privilege | Standing privileges are granted once and forgotten | Privilege use anomalies, session review | Access certifications (see [IGA](../protocols-iga/06-iga.md)), JIT access, session recording and review (see [Session review playbook](../scenarios/16-incident-insider-threat-session-review.md)) |

## The defensive posture in one paragraph

Read the tables together and the defense becomes a single architecture: credentials that are unique, rotated, and vaulted ([Secrets Management](09-secrets-management.md)); privilege that is scoped, temporary, and reviewed ([PAM Best Practices](04-best-practices.md), [JIT Access](07-jit-access.md)); authentication that is phishing-resistant and step-up capable ([Passwordless page](../fundamentals/08-passwordless.md)); and trust that is minimal and audited ([Zero Trust IAM](06-zero-trust-iam.md)). Each attack above fails at at least one of those layers, and most fail at two. When an interviewer asks "how would you defend against X", the answer is to locate X in this table and name the layer that breaks it, then the monitoring that would catch the attempt.

## Interview angle

The favorite follow-up to any attack question is "how do you detect it in practice". The general answer that covers most of this page: identity monitoring is log-based, and the patterns are asymmetric volume (sprays, fatigue), asymmetric timing (off-hours success), and asymmetric location (impossible travel). Name the specific events per attack (4625 for logon failures, 4768/4769 for Kerberos, consent events for consent phishing) and you are speaking the operator's language, not the slide's.