---
title: Secrets Management
description: "Secrets management for machine and application credentials: what a vault is, dynamic secrets, and how it relates to privileged access management."
---
<!-- verified 2026-08-19: HashiCorp Vault capability names (KV v2, dynamic secrets, AppRole, policies) verified against the current Vault documentation. -->

# Secrets Management

PAM protects human privilege; secrets management protects everything else that holds a credential. Every application, script, and integration runs with a secret: a database password, an API token, a service account password, a cloud access key. These are the credentials that outnumber human accounts by orders of magnitude, that rotate least, and that attackers harvest first once they are inside. This page covers what a secrets vault is, why static secrets fail, and how the discipline relates to the PAM controls covered elsewhere on this site.

## What a vault does

A secrets vault (HashiCorp Vault, CyberArk Conjur, Akeyless, cloud-native key stores) is a service that holds secrets centrally and hands them out on request, with three properties that standing credentials in config files lack:

| Property | Standing credential | Vaulted credential |
|----------|---------------------|--------------------|
| Storage | In config files, env vars, source control | In the vault, encrypted, access-logged |
| Access control | Whoever can read the file has the secret | A policy engine decides per request, per identity |
| Rotation | Manual, infrequent, often forgotten | Automated (static secrets) or inherent (dynamic secrets) |
| Audit | None (file reads are not logged) | Every lease and read is logged with the requester |

The vault is a privileged component in its own right: whoever controls the vault controls every secret in the environment, so vault access itself must sit behind MFA and tiered administration, exactly as domain admin does in [PAM Best Practices](04-best-practices.md).

## Dynamic secrets: the property that changes everything

The vault does not have to store a static secret at all. For systems with a dynamic credential API, it can generate one on demand:

- **Dynamic secrets** (Vault's database, AWS, and PKI backends): the application requests a credential, the vault creates it (a database user, an AWS access key, a certificate), hands it to the application, and the credential is *revoked when the lease expires*. Nothing exists after use; there is nothing to steal from the application host.
- **Short-lived certificates**: instead of a static certificate for mutual TLS, services get certificates valid for minutes to hours, issued by the vault's PKI backend. This is the machine-identity equivalent of just-in-time access (see [JIT Access](07-jit-access.md)).
- **Leases**: every dynamic secret has a lease with a time-to-live and renewal. Expired leases mean revoked credentials, which converts "was this credential ever leaked" from a forensic question into a non-question: the credential is already gone.

The contrast with static secrets is the point: a static secret is a risk that someone is currently unaware of, a dynamic secret is a risk that expires by construction.

## Static secrets, done properly

Not everything has a dynamic API. For static secrets (API tokens, legacy passwords), the vault standard is:

1. **One secret per identity**: no shared tokens; each application gets its own credential so leases and audit trail to a single consumer.
2. **Automated rotation**: versioned secrets (Vault KV v2 keeps every version) and scheduled rotation by the vault itself, so the window in which a leaked value works is bounded. This mirrors the CPM function in [PAM Core Capabilities](03-core-capabilities.md): the humans-to-passwords problem and the machines-to-secrets problem have the same solution shape.
3. **Fetch at startup, never store**: applications request the secret at startup and hold it in memory; no secret ever touches the filesystem or source control. Leaked repos stop being breach events.

## Where secrets management sits in the stack

- **Relationship to PAM**: PAM vaults human-privilege credentials and brokers sessions; secrets managers vault machine credentials and serve them programmatically. Enterprises run both: CyberArk or Delinea for the human side, Vault or Conjur for the machine side. The boundaries blur (both rotate, both audit), but the consumer model differs: a human needs a session, a service needs a credential.
- **Relationship to identity**: service accounts are identities too. Their credentials (passwords, keys) should be managed exactly like user credentials, with the added constraint that they cannot do MFA by hand. The [Privileged Account Types](02-privileged-account-types.md) page covers the account taxonomy; secrets management is the operational answer for the machine half of it.
- **Cloud-native angle**: cloud key stores (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager) provide the same discipline inside a single cloud, with the platform's own IAM as the policy engine. Multi-cloud and hybrid environments are where a standalone vault earns its place, which is the scenario the [Cloud IAM lab](../labs/03-cloud-iam.md) and [IAM Architecture](../protocols-iga/07-iam-architecture.md) pages describe.

## Interview angle

The standard question is "static or dynamic secrets?" The strong answer: dynamic where the backend supports it (database, cloud, PKI), versioned and automatically rotated static secrets elsewhere, and the justification is expiry. "The credential is only valid while the lease says so" is the sentence that separates someone who has operated a vault from someone who has read about one. The follow-up, "how do applications authenticate to the vault itself", is answered by workload identity (AppRole, Kubernetes service accounts, AWS IAM role for Vault) rather than by vault credentials in config files, which would just recreate the problem one layer up.