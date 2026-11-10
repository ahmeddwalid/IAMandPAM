---
title: Lab 7 - Secrets Management with Vault
description: "Stand up HashiCorp Vault on Docker, store a static secret, authenticate an app with AppRole, and provision short-lived PostgreSQL credentials that expire on their own."
---
<!-- verified 2026-08-19: Vault CLI commands (kv, auth enable approle, secrets enable database, postgresql plugin, leases) verified against the current HashiCorp Vault documentation. -->

# Lab 7 - Secrets Management with Vault

## What this lab proves

The [Secrets Management](../pam-core/09-secrets-management.md) page argued that a secrets vault changes the exposure model: a static secret is a risk someone is unaware of, a dynamic secret expires by construction. This lab makes that concrete. You will run HashiCorp Vault on Docker, write a secret into the KV store, let an application log in with AppRole (no human password), and then watch the interesting part: Vault creates a PostgreSQL user with a random password and a time-to-live, and the credential stops working when the lease expires. Nothing is configured manually on the database side, and nothing is stolen after use because there is nothing left to steal.

## Architecture

import Drawio from '@site/src/components/Drawio';
import simpleGraph from '!!raw-loader!@site/static/diagrams/lab-6-secrets-vault.drawio';

<Drawio content={simpleGraph} />

[Download / edit this diagram](/diagrams/lab-6-secrets-vault.drawio)

The application never stores a credential: it authenticates to Vault with an AppRole identity, asks Vault for what it needs, and holds each secret only for its lease. The admin's job is configuration, not credential distribution.

## Prerequisites

- Docker Desktop (from Lab 1).
- The `vault` CLI installed on your host, or a second Docker container; the commands below assume the CLI.
- A text editor.

## Step 1 - Start Vault in dev mode

Run Vault as a single Docker container:

```bash
docker run --rm --name vault -p 8200:8200 \
  -e VAULT_DEV_ROOT_TOKEN_ID=root-token \
  -e VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200 \
  hashicorp/vault:latest
```

Set two environment variables so the CLI talks to this container:

```bash
export VAULT_ADDR=http://localhost:8200
export VAULT_TOKEN=root-token
```

Verify with `vault status`. You now have a Vault, but be precise about what you have: **dev mode is single-process, in-memory, auto-unsealed, and resets on restart.** It is the right tool for learning the API surface and the wrong tool for anything you care about. A production deployment differs in exactly four ways: a proper storage backend, manual unsealing with key shares, TLS on the listener, and policies that do not include a root token. The rest of this lab works identically in production; the difference is operational, not conceptual.

## Step 2 - Store a static secret

Enable the KV v2 secrets engine at a path and write a secret:

```bash
vault secrets enable -path=secret kv-v2
vault kv put secret/app/db DB_HOST=db.corp.local DB_PORT=5432
vault kv get secret/app/db
```

`kv get` shows the secret plus the metadata block (version, timestamps). Versioning is the point of KV v2: write a new value with `vault kv put` again and the old version is still retrievable with `vault kv get -version=1`. A rotated secret leaves an audit trail of what the value was and when, which is the property a config file does not have.

## Step 3 - Create the application identity with AppRole

An application cannot type a password. AppRole gives it a machine identity: a role, a role ID (like a username), and a secret ID (like a password), issued by Vault. Create the role and generate its secret ID:

```bash
vault auth enable approle
vault write auth/approle/role/app token_ttl=10m token_max_ttl=30m
vault read auth/approle/role/app/role-id
vault write -f auth/approle/role/app/secret-id
```

Save the role ID and secret ID; the application will present both to log in. Note the `token_ttl` of 10 minutes: even the application's own Vault token expires and must be re-earned, which is the discipline in miniature.

## Step 4 - Start PostgreSQL

Run a database alongside Vault. The database engine needs a privileged account to create and drop users:

```bash
docker run --rm --name pg -p 5432:5432 \
  -e POSTGRES_PASSWORD=pg-admin-pass \
  -e POSTGRES_DB=appdb \
  postgres:16
```

Wait a few seconds, then confirm it accepts connections (`psql -h localhost -U postgres` or a Docker exec). The `postgres` superuser password you just set is exactly the kind of static credential that should be vaulted in production; for the lab it is the bootstrap secret the database engine uses to provision everyone else.

## Step 5 - Enable dynamic database credentials

Configure the database engine and a role that maps a DB template to a lease:

```bash
vault secrets enable database
vault write database/config/appdb \
  plugin_name=postgresql-database-plugin \
  allowed_roles=app-role \
  connection_url=postgresql://postgres:pg-admin-pass@host.docker.internal:5432/appdb?sslmode=disable \
  username=postgres \
  password=pg-admin-pass

vault write database/roles/app-role \
  db_name=appdb \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';" \
  default_ttl=1m max_ttl=5m
```

The pieces to notice: the engine connects as the bootstrap user, and the role's `creation_statements` define what a dynamically created user looks like. `VALID UNTIL` is set to the lease expiration, so the credential is time-limited *at the database itself*, not just in Vault's bookkeeping. The `default_ttl` of 1 minute is short on purpose, so you can watch expiry happen in this lab instead of reading about it.

## Step 6 - Request a credential and watch it expire

Ask Vault for a database credential:

```bash
vault read database/creds/app-role
```

The output shows a generated username (`v-token-app-role-...`), a random password, and a lease with `lease_duration`. This is the moment the lab exists for. Connect to PostgreSQL with those exact credentials and run a query; it works. Now wait about a minute and run the same query again; the connection is rejected, because the `VALID UNTIL` clause has passed and PostgreSQL itself has destroyed the credential. Run `SELECT usename FROM pg_user;` as the superuser and the generated user is gone.

Do it once more, this time watching the client side: the application holds a token with a 10-minute TTL and a DB credential with a 1-minute lease. When either expires, the application must go back to Vault for a fresh one. There is no stale-credential cleanup phase, because stale credentials do not exist.

## Step 7 - Audit the trail

Vault logs every operation. In dev mode, enable auditing to a file:

```bash
vault audit enable file file_path=/vault/logs/audit.log
```

Then perform a `vault kv get secret/app/db` and a `vault read database/creds/app-role`, and inspect the log (`docker exec vault cat /vault/logs/audit.log`). Each entry records the operation, the authenticated identity (token accessor, never the secret value), the path, and the time. This is the accountability layer the [Attacks on Identity Infrastructure](../pam-core/08-attack-defense.md) page assumes exists: when a credential is used, someone can say who asked for it and when.

## Verification checklist

- [ ] `vault status` reports the dev server healthy and unsealed.
- [ ] `vault kv get` shows the static secret and its version metadata; `-version=1` still returns the old value after an overwrite.
- [ ] An AppRole login (`vault login -method=approle role_id=... secret_id=...`) returns a token, and `vault token lookup` shows its 10-minute TTL.
- [ ] `vault read database/creds/app-role` returns a username, password, and lease; the credentials connect to PostgreSQL immediately.
- [ ] After `default_ttl` elapses, the generated DB user is gone from `pg_user` and its credentials are rejected.
- [ ] The audit log contains entries for the secret read and the credential request, attributed to the identity that made them.

## Common pitfalls

- **`host.docker.internal` does not resolve on Linux.** The database engine inside the Vault container reaches the PostgreSQL container via the Docker host gateway; on Linux add `--add-host=host.docker.internal:host-gateway` to the Vault container run. On macOS and Windows it resolves by default.
- **The container restarts and everything is gone.** Dev mode is in-memory. If you want the lab to survive restarts, switch to the file storage backend (`vault server -config=...` with `storage file`), which is also one step closer to a real deployment.
- **The generated credential fails immediately.** The `creation_statements` were rejected silently. Check the Vault logs with `vault read database/config/appdb` (it shows the last error) and confirm the bootstrap password matches the container's `POSTGRES_PASSWORD`.
- **The app's own token expires mid-script.** Expected. A production application re-authenticates and retries every Vault operation instead of reusing one token forever, which is exactly how production libraries like the Vault Go client behave.

## What you learned

The difference between a password manager and a secrets vault is not storage; it is *provisioning and expiry*. This lab showed all three capabilities that matter: versioned static secrets with an audit trail (Step 2), machine identity that never involves a human (Step 3), and credentials that are created per request and destroyed by the database itself when the lease ends (Steps 5-6). When an interviewer asks how you would handle a leaked database password, the answer is the architecture you just built: there is nothing to leak, because the credential had a lifespan of one minute and a scope of one application.

## Where the labs take you

With all seven labs done you can claim the full IAM plus PAM surface: directory, SSO, federation, cloud identity, PAM mechanics, JIT, governance, and secrets. The secrets discipline here pairs with [Lab 4 - PAM trial](04-pam-trial.md) the way the real products pair: CyberArk vaults human privilege, Vault serves machine identity, and the two together close the credential lifecycle. Bring this combination to the [interview preparation](../interviews/index.md) pages, where "explain secrets management" is answered with the words *provisioned, short-lived, audited*, and the proof is this lab.