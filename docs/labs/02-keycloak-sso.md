---
title: Lab 2 - AD plus Keycloak SSO
description: "Federate Active Directory into Keycloak with LDAP user federation, then prove single sign-on across two applications with OIDC. Includes a step-by-step walkthrough of the whole flow."
---

# Lab 2 - AD plus Keycloak SSO

## What this lab proves

Lab 1 left you with an identity provider that has no real identities. This lab connects the two halves of a classic enterprise setup: AD remains the authoritative directory, Keycloak becomes the identity provider applications actually talk to, and users log in once and reach every application. The pattern is called **user federation**: Keycloak does not copy users, it reads them from AD on demand via LDAP, and validates passwords by performing an LDAP bind against AD.

## Architecture

import Drawio from '../../src/components/Drawio';
import simpleGraph from '!!raw-loader!../../static/diagrams/lab-1-iam-sso.drawio';

<Drawio content={simpleGraph} />

[Download / edit this diagram](/diagrams/lab-1-iam-sso.drawio)

The flow: the browser hits an application, gets redirected to Keycloak (step 1), Keycloak verifies the password against AD with an LDAP bind (step 2), and on success issues OIDC tokens to the application (step 3). Once the Keycloak SSO session exists, the second application requires no login at all (step 4).

## Prerequisites

- Lab 1 complete: `DC1` at `10.10.0.10` serving `corp.local`, Keycloak on `http://localhost:8080` with the `corp` realm, and the test app on `http://localhost:8081`.
- A second OIDC test client so SSO has something to prove. The simplest option is registering a second client in Keycloak pointing at the same example app on a different port; see Step 5.

## Step 1 - Make Keycloak reachable from DC1

Keycloak runs on the host, but AD lives in the guest VM. The host and the guest talk over the NAT adapter (`10.0.2.2` is the host from the guest's point of view). On DC1, confirm you can reach the host:

```powershell
Test-NetConnection 10.0.2.2 -Port 8080
```

If the port test fails, check that the Keycloak container is running and that the VM's NAT adapter is enabled.

## Step 2 - Add the LDAP user federation provider

1. In the Keycloak admin console, under **User federation**, click **Add provider** and choose **LDAP**.
2. Fill in the settings:
   - Console display name: `corp AD`.
   - Vendor: Active Directory.
   - Connection URL: `ldap://10.0.2.2:8080` is wrong here: that port is Keycloak's HTTP port, not LDAP. The AD server's LDAP port is 389, so use the AD IP directly: `ldap://10.10.0.10:389`.
   - Bind DN: the AD service account that reads the directory, e.g. `CN=Administrator,CN=Users,DC=corp,DC=local`, with its password.
   - Users DN: `CN=Users,DC=corp,DC=local`.
   - Search scope: Subtree.
3. Save, then click **Test connection** and **Test authentication**. Both must succeed. The connection test binds to AD; the authentication test performs an actual LDAP bind with the bind DN.

## Step 3 - Map AD attributes and enable login

1. Under the federation provider, open the **Mappers** tab. The defaults map `sAMAccountName`, `mail`, and `cn`.
2. Edit the `username` mapper so login uses `sAMAccountName` (this is the AD logon name and what `alice` and `bob` actually have).
3. Save and click **Synchronize all users**. In the **Users** view you will now see `alice` and `bob`, marked as federated (their source is LDAP, not Keycloak-local).

## Step 4 - Test the full flow

1. Open `http://localhost:8081` and click to log in.
2. Sign in as `alice` with the password from Lab 1. Keycloak has no copy of that password; it performed an LDAP bind to DC1. You can verify this by changing Alice's password on DC1 (`Set-ADAccountPassword alice`) and confirming the new password works immediately at the app, with no Keycloak-side change.
3. The app shows the claims in Alice's ID token, including `preferred_username=alice` (from `sAMAccountName`).

## Step 5 - Prove SSO with a second application

1. In the admin console, create a second client:
   - Client ID: `test-app-2`.
   - Valid redirect URIs: `http://localhost:8082/*`.
2. Run the example app again on the new port:

```bash
docker run -d --name test-app-2 -p 8082:8080 \
  quay.io/keycloak/keycloak-examples:latest
```

3. In a fresh browser window, log in at `http://localhost:8081` as `alice`, then open `http://localhost:8082`. There is no login prompt: the SSO session in Keycloak is reused.
4. Now close the browser entirely and reopen `http://localhost:8082`. You are asked to log in again, because the SSO session cookie is tied to the browser session. This distinction, SSO session vs. application session, is a classic interview topic.

## Verification checklist

- [ ] Federation provider tests: connection and authentication both pass.
- [ ] `alice` and `bob` appear in Keycloak's Users view, sourced from LDAP.
- [ ] Login at `http://localhost:8081` works with the AD password.
- [ ] Changing the AD password on DC1 changes the login password at the app immediately.
- [ ] Opening the second app in the same browser session shows no login prompt.
- [ ] A fresh browser session prompts again.

## Common pitfalls

- **"Unable to connect to LDAP" from the connection test.** The federation provider is configured with `10.10.0.10:389`; verify from the host that the port is open (`Test-NetConnection 10.10.0.10 -Port 389` does not work from Windows hosts without AD; use `telnet 10.10.0.10 389` or a port check tool). LDAP is not the same as LDAPS (636); the plaintext port is fine inside the isolated lab.
- **Login succeeds but the app shows the wrong username.** The username mapper was left on the default; map `preferred_username` to `sAMAccountName`.
- **Synchronize all users shows nothing.** The bind DN account needs read access to the Users container. The built-in Administrator works in a lab; in a real deployment you would create a dedicated, least-privileged service account.
- **Second app still asks for login.** Either the second client's redirect URI does not match, or the browser window was not actually fresh. Check the client config and retry with an incognito window.

## What you learned

Password validation against AD happens through LDAP bind, not by comparing stored copies, which is why password changes take effect instantly. User federation is different from identity brokering: here AD is the source of truth and Keycloak trusts it; in Lab 3 (cloud) the direction reverses, with the cloud acting as the source of truth for its own accounts. And the SSO-session-versus-application-session distinction you just observed is exactly what interviewers probe with "how does SSO work when the user closes the browser?"

Next: [Lab 3 - Cloud IAM federation](cloud-iam).