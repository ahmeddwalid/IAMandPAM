---
title: Lab 5 - Just-in-Time Access with MFA
description: "Build the zero-trust pattern in Keycloak: step-up authentication, an approval workflow that issues a time-boxed role, and automatic revocation when the role expires."
---

# Lab 5 - Just-in-Time Access with MFA

## What this lab proves

Standing access is the default in most environments: a role that exists is a role that gets used, long after the incident that justified it. This lab builds the opposite pattern, **just-in-time (JIT) access**, with free tools. Keycloak enforces MFA at login, a lightweight approval step (a policy that requires a second person) issues a time-boxed role, and the role expires on its own. The result is a working miniature of what enterprise PAM products call temporary elevated access.

## Architecture

import Drawio from '@site/src/components/Drawio';
import simpleGraph from '!!raw-loader!@site/static/diagrams/lab-4-jit-mfa.drawio';

<Drawio content={simpleGraph} />

<a href="/diagrams/lab-4-jit-mfa.drawio" download>تنزيل هذا المخطط أو تعديله</a>

Login demands MFA, the request goes to an approver, approval issues a 24-hour role, and expiry revokes it. The audit log records every step.

## Prerequisites

- Lab 1 environment: Keycloak with the `corp` realm, users `alice` and `bob` (federated from AD or created locally; for this lab local users in the `corp` realm are fine and avoid LDAP noise).
- The test app on `http://localhost:8081`.
- A smartphone with an authenticator app (Google Authenticator, Aegis, or similar) for `alice`'s TOTP factor.

## Step 1 - Enforce MFA for the realm

1. In the Keycloak admin console, open **Authentication → Required actions**. Set **Configure OTP** and **Update password** as required actions; they are the standard bootstrap for enrolling factors.
2. Open **Authentication → Policies** (or Flows, depending on version) and make the browser flow require OTP for all users. The cleanest way in a fresh realm is to leave the browser flow at its default and instead enforce at the policy level: set the **OTP policy** (Realm settings → Authentication → OTP policy) to SHA1, 6 digits, 30-second period, and make OTP a required action for new users.
3. Log in as `alice` at `http://localhost:8081`. Keycloak asks to set up the authenticator; scan the QR code and confirm the code works. From now on, every login for `alice` requires the TOTP code.

Verify the MFA really is enforced: log out, log in again as `alice`, and confirm the TOTP prompt appears before access is granted.

## Step 2 - Create the elevated role and the approval group

1. Under **Realm roles**, create a role named `elevated-access`.
2. Under **Groups**, create `approvers` and add `bob` to it. In a real setup this is the on-call security or ops team; in the lab, one approver is enough to see the mechanism.
3. Create `requesters` and add `alice`. (If you federated users from AD in Lab 2, the group membership lives in Keycloak here; that is fine for the lab, but note the distinction: AD is the identity source, Keycloak holds the authorization-relevant group.)

## Step 3 - Expose the role to the app as a claim

1. Open the `test-app` client, go to **Client scopes** and confirm a scope like `roles` exists and is assigned to the client.
2. Add a mapper on the client: **Client scope → roles → Add mapper → By configuration → Realm roles**, token claim name `roles`. Save.
3. Log in as `alice` at the app and inspect the ID token/claims shown by the example app: `roles` now appears in the token, and it does not yet include `elevated-access`.

## Step 4 - Approve access, prove the role lands

Keycloak's out-of-the-box approval flow is not a full request/approve UI, so the lab implements the pattern with the pieces that exist, which is exactly how lightweight IGA and JIT setups start:

1. As `alice`, open the admin console at `http://localhost:8080/admin` and log in as `bob`'s role... in the lab the approval is performed by `bob` in the admin console: **Users → alice → Role mapping**, assign the realm role `elevated-access`.
2. Back at the app as `alice`, refresh: the app now shows `elevated-access` in the `roles` claim. The app can gate its admin features on this claim without knowing anything about the approval process.
3. To make the approval visible, use the **User session** view: both users' sessions are listed with timestamps, and Keycloak's audit events (Realm settings → Events, or Admin events) record the role change with actor `bob`, target `alice`, and a timestamp.

## Step 5 - Make it expire

A role assignment in Keycloak has no built-in expiry, so the time-box is enforced where roles are consumed, the same way real systems do it:

1. In the app's client, find the **Advanced** settings (or the token settings) and confirm the access token lifetime is short, e.g. 5 minutes (`SSO session idle` and `SSO session max` under Realm settings → Tokens are the master controls; the client can override them).
2. When the SSO session expires, the token no longer carries the role for fresh requests: the app must re-check claims at each request, not cache them. The lab app demonstrates the mechanics; the principle to internalize is that **expiry without a revocation path is not enough**, and the audit log is what makes the difference visible.
3. For a true automatic expiry, the honest lab answer is a scheduled cleanup: a small script (PowerShell or cron) that removes `elevated-access` from users after 24 hours. It is a legitimate lightweight pattern and a good talking point: many organizations run JIT as "role + expiry job" before they buy a PAM suite.

```powershell
# On a schedule (Task Scheduler, daily): remove the role 24h after assignment
# Uses the Keycloak admin API:
$token = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/realms/corp/protocol/openid-connect/token" `
  -Body @{ client_id="admin-cli"; username="admin"; password="admin";
          grant_type="password" } | Select-Object -ExpandProperty access_token

# For each user with elevated-access and role age > 24h, delete the role mapping
# (endpoint: DELETE /admin/realms/corp/users/{id}/role-mappings/realm)
```

Note: the `admin-cli` client exists in every realm by default for exactly this purpose.

## Verification checklist

- [ ] Logging in as `alice` always prompts for the TOTP code.
- [ ] The app token shows `roles` with no elevated role before approval.
- [ ] After `bob` assigns the role, the app token shows `elevated-access` on refresh.
- [ ] Admin events record the assignment with actor, target, and timestamp.
- [ ] The expiry job (or manual removal) removes the role and the app token no longer shows it.

## Common pitfalls

- **OTP enrollment fails with "invalid code".** Time skew between phone and server; the TOTP policy (30-second period, 6 digits) must match what the authenticator app expects, and the server clock should be NTP-synced.
- **The app never shows the `roles` claim.** The mapper was added to the wrong scope, or the client has no scope assigned. Check Client scopes → assigned scopes and re-verify the token with a fresh login.
- **`admin-cli` login rejected.** The admin-cli client uses the `password` grant; if you disabled direct access grants globally, re-enable it for `admin-cli` only (it is disabled by default in newer Keycloak; enable it in the client settings).
- **Approval through the admin console feels like cheating.** It is, a little. Real products have a dedicated request/approve UI; what matters for the lab is the mechanism: a role that appears only after a second actor's action, with an audit trail, that then expires. The same mental model transfers to CyberArk (Lab 4) and to commercial IGA tools.

## What you learned

JIT is three separable mechanics: step-up authentication (MFA), a second actor's approval, and expiry. Keycloak gives you the first two natively and the third needs a small script, which is a realistic architecture lesson: the expensive part of JIT is not the role issuance, it is the revocation guarantee and the audit trail that makes the whole thing defensible. In interviews, "how would you implement JIT with open source" is a favorite; you can now answer with exactly this stack and its limits.

Next: [Lab 6 - Lightweight IGA campaign](06-iga-campaign.md).