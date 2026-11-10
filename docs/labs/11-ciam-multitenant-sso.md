---
title: "Lab 11 - Customer IAM and Multi-Tenant B2B SaaS Federation"
description: "Building enterprise multi-tenancy in Keycloak: domain-based Home Realm Discovery, SAML and OIDC enterprise federation, inbound SCIM, and tenant-scoped claims."
---
<!-- verified 2026-09-26 -->

# Lab 11 - Customer IAM and Multi-Tenant B2B SaaS Federation

## What this lab proves

Workforce single sign-on federates internal employees into cloud apps. In contrast, multi-tenant software-as-a-service (SaaS) identity federates thousands of external corporate identity providers into a single application platform while enforcing complete tenant isolation.

This lab configures a production-grade multi-tenant B2B federation hub in Keycloak. You will configure domain-based Home Realm Discovery (HRD) that routes `user@acme.com` to an enterprise SAML IdP and `user@globex.com` to an enterprise OIDC IdP, provisions tenant records on first login, and generates tenant-scoped JWTs containing organizational context and roles.

## Architecture

```
[Browser / User]
       │
       ▼ (1. Enters email: user@acme.com)
[SaaS Login Portal (Keycloak Realm: saas-platform)]
       │
       ▼ (2. HRD routes by domain @acme.com)
[Acme Corp Enterprise IdP] (SAML 2.0)
       │
       ▼ (3. SAML Assertion with email and groups)
[Keycloak Federation Broker]
       │
       ▼ (4. Issues tenant-scoped JWT with tenant_id="acme")
[SaaS Application Backend] (Verifies token & tenant filter)
```

## Prerequisites

- Docker Desktop installed and running.
- Keycloak 24+ running locally (or using the container from Lab 2).
- Terminal with `curl` and `jq` installed.

## Step 1 - Start Keycloak in Docker

If Keycloak is not already running, start an instance in development mode:

```bash
docker run -d --name keycloak-ciam \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=AdminPassword123! \
  quay.io/keycloak/keycloak:latest start-dev
```

Verify Keycloak is responding at `http://localhost:8080`.

## Step 2 - Create the SaaS Master Realm and Client

1. Open `http://localhost:8080/admin` and log in with `admin` / `AdminPassword123!`.
2. In the top-left realm dropdown, click **Create Realm**.
3. Name the realm `saas-platform` and click **Create**.
4. In the left navigation, click **Clients**, then **Create client**:
   - **Client type**: OpenID Connect
   - **Client ID**: `cloud-app`
   - Click **Next**.
   - Enable **Client authentication** (confidential client) and **Standard flow**.
   - **Valid redirect URIs**: `http://localhost:3000/*`
   - **Web origins**: `http://localhost:3000`
   - Click **Save**.

## Step 3 - Configure Multi-Tenant Organizations and Identity Providers

In an enterprise SaaS architecture, each client organization connects their own corporate IdP:

### Tenant A: Acme Corporation (SAML IdP)

1. Under **Identity providers** in the left menu, select **SAML v2.0**.
2. Set **Alias**: `acme-idp`.
3. Set **Display name**: `Acme Corporation Single Sign-On`.
4. Configure the SAML endpoints (for lab testing, point to a mock SAML provider or Keycloak's secondary realm).
5. In **Advanced settings**:
   - Enable **Trust Email**.
   - Enable **First login flow**: `first broker login`.
   - Enable **Sync mode**: `force` (updates user attributes on every login).

### Tenant B: Globex Corporation (OIDC IdP)

1. Under **Identity providers**, click **Add provider** and select **OpenID Connect v1.0**.
2. Set **Alias**: `globex-idp`.
3. Set **Display name**: `Globex Enterprise Login`.
4. Set **Authorization URL**, **Token URL**, and **Client ID** matching Globex's IdP configuration.

## Step 4 - Configure Home Realm Discovery (HRD)

To prevent users from having to manually click their company logo on a messy login screen, configure automated domain-based routing:

1. In the left menu, click **Authentication**, then open the **Flows** tab.
2. Select **Browser flow**, click the three dots, and select **Duplicate**. Name it `multi-tenant-browser`.
3. In the new flow, add an execution step: **Home Realm Identifier**.
4. Configure the authenticator:
   - Map domain `acme.com` to alias `acme-idp`.
   - Map domain `globex.com` to alias `globex-idp`.
5. Bind `multi-tenant-browser` as the default browser flow for the `saas-platform` realm.

When a user visits the login portal and enters `alice@acme.com`, Keycloak immediately redirects the browser to Acme's SAML IdP without displaying other tenant options.

## Step 5 - Inject Tenant Scoped Claims into the JWT

The SaaS application backend requires the tenant identifier in every access token to enforce database query isolation.

1. Under **Clients**, select `cloud-app`.
2. Navigate to the **Client scopes** tab, and click the dedicated scope (`cloud-app-dedicated`).
3. Click **Add mapper** -> **By configuration** -> **User Attribute**:
   - **Name**: `tenant_id`
   - **User Attribute**: `tenant_id`
   - **Token Claim Name**: `tenant_id`
   - **Claim JSON Type**: `String`
   - Enable **Add to ID token** and **Add to access token**.
4. Click **Save**.

Under **Identity providers** -> `acme-idp` -> **Mappers**, add a hardcoded attribute mapper:
- **Name**: `set-acme-tenant`
- **User Attribute**: `tenant_id`
- **Value**: `org_acme_corp`

Every user authenticating through Acme's SAML IdP automatically receives `tenant_id = "org_acme_corp"` in their access token.

## Step 6 - Verification and Token Inspection

Test the complete federation flow by simulating an authorization code exchange:

1. Open an incognito browser window and navigate to the authorization endpoint:
   ```
   http://localhost:8080/realms/saas-platform/protocol/openid-connect/auth?client_id=cloud-app&response_type=code&scope=openid&redirect_uri=http://localhost:3000/callback
   ```
2. Enter `testuser@acme.com`. Verify that Keycloak immediately redirects to Acme's identity provider.
3. Complete authentication. Exchange the returned authorization code for tokens:
   ```bash
   curl -s -X POST "http://localhost:8080/realms/saas-platform/protocol/openid-connect/token" \
     -d "grant_type=authorization_code" \
     -d "client_id=cloud-app" \
     -d "client_secret=<CLIENT_SECRET>" \
     -d "code=<AUTH_CODE>" \
     -d "redirect_uri=http://localhost:3000/callback" | jq .access_token
   ```
4. Decode the JWT payload using `jwt.io` or `jq -R 'split(".") | .[1] | @base64d | fromjson'`:
   ```json
   {
     "iss": "http://localhost:8080/realms/saas-platform",
     "sub": "b8f2409c-d079-4d81-8172-120091823901",
     "email": "testuser@acme.com",
     "tenant_id": "org_acme_corp",
     "azp": "cloud-app"
   }
   ```

Verify that `tenant_id: "org_acme_corp"` is present. The SaaS application backend can now safely use this claim to enforce database partition queries (`SELECT * FROM documents WHERE tenant_id = 'org_acme_corp'`).

## Common Pitfalls

1. **Missing DNS Validation in Production**: In production SaaS, never allow customers to claim an email domain without DNS verification (e.g., adding a `saas-verify=<token>` TXT record to `acme.com`). Otherwise, an attacker could register `acme.com` and intercept corporate logins.
2. **Account Linking Collisions**: If `user@acme.com` exists as a consumer account and later authenticates via corporate SAML, Keycloak prompts for account linking. Configure explicit first-broker login rules to prevent unauthorized account takeovers.
3. **Stale Tokens on Tenant Offboarding**: When an enterprise customer terminates an employee, SAML JIT provisioning does not notify Keycloak. Production SaaS platforms must implement inbound SCIM 2.0 to push termination events and invalidate active refresh tokens immediately.
