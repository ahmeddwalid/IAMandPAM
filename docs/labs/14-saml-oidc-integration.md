---
title: Lab 14 - SAML and OIDC Integration with Keycloak
description: "Configure Keycloak as a multi-protocol IdP: add a SAML client alongside the existing OIDC client, exchange metadata, and prove both protocols authenticate the same user against the same directory."
---

# Lab 14 - SAML and OIDC Integration with Keycloak

## What this lab proves

Lab 2 connected AD to Keycloak and proved OIDC-based SSO. Real enterprises rarely run one protocol: a SaaS vendor supports SAML, an internal tool uses OIDC, and both must authenticate the same users against the same directory. This lab adds a SAML client to the existing Keycloak realm, exchanges metadata between Keycloak and a SAML service provider, and proves that the same AD user can authenticate through both protocols with consistent identity claims.

## Architecture

import Drawio from '@site/src/components/Drawio';
import samlOidc from '!!raw-loader!@site/static/diagrams/lab-14-saml-oidc-integration.drawio';

<Drawio content={samlOidc} />

[Download / edit this diagram](/diagrams/lab-14-saml-oidc-integration.drawio)

The flow: the browser hits a SAML application (step 1), gets redirected to Keycloak's SAML endpoint (step 2), Keycloak authenticates against AD via LDAP (step 3), and returns a SAML assertion to the application (step 4). The OIDC client from Lab 2 continues to work unchanged (step 5). Both protocols issue tokens for the same user, with the same directory as the source of truth.

## Prerequisites

- Lab 2 complete: Keycloak on `http://localhost:8080` with the `corp` realm, LDAP federation to `corp.local`, and the OIDC client `test-app` on `http://localhost:8081`.
- A SAML-capable service provider. For this lab, use the Keycloak example SAML client or a simple SAML SP such as `https://samltest.id` (a public SAML test endpoint) or a second Keycloak realm configured as a SAML SP.

## Step 1 - Create the SAML client in Keycloak

1. In the Keycloak admin console, navigate to **Clients** and click **Create**.
2. Set **Client ID** to `saml-test-app` and **Client Protocol** to `saml`.
3. Set **Root URL** to `http://localhost:8083` (or the URL of your SAML SP).
4. Save. The client creation page redirects to the SAML client settings.

## Step 2 - Configure SAML client settings

On the SAML client settings page, set:

- **Name ID Format**: `username` (or `email` if your SP expects email-based identifiers).
- **Include AuthnStatement**: ON.
- **Sign Assertions**: ON (the SP validates the assertion signature).
- **Sign Documents**: ON (the entire SAML response is signed).
- **Signature Algorithm**: RSA_SHA256.
- **SAML Signature Key Name**: KEY_ID (the SP uses this to select the signing key from the metadata).
- **Valid Redirect URIs**: `http://localhost:8083/*` (or your SP's ACS URL).
- **Assertion Consumer Service URL**: `http://localhost:8083/saml/SSO` (or your SP's ACS URL).
- **Logout Service URL**: `http://localhost:8083/saml/SLO` (or your SP's SLO URL).

Save the client.

## Step 3 - Export Keycloak SAML metadata

1. In the SAML client settings, click the **SAML Keys** tab and confirm a signing certificate exists. If not, click **Generate new keys** to create one.
2. Navigate to **Realm Settings** → **SAML 2.0 Identity Provider Metadata**. Copy the entire XML metadata document. This is the IdP metadata that the SP needs to trust Keycloak.
3. Save the metadata to a file: `idp-metadata.xml`.

The metadata contains Keycloak's entity ID, SSO endpoint URL, SLO endpoint URL, and the X.509 signing certificate. The SP uses this to validate assertions and to know where to send users for authentication.

## Step 4 - Configure the SAML service provider

The SP configuration depends on the SP software. For a Keycloak-to-Keycloak SAML setup:

1. In a second Keycloak realm (or the same realm with a different client), create a new client with **Client Protocol** set to `saml`.
2. In the SP client settings, set **Master SAML Processing URL** to the SP's ACS URL.
3. Import the IdP metadata: in the SP realm, navigate to **Identity Providers** → **Add provider** → **SAML v2.0**. Paste the metadata XML from Step 3.
4. Set **First Login Flow** to `first broker login` and **Post Login Flow** to `none`.

For a non-Keycloak SP, the process is similar: import the IdP metadata XML, set the ACS URL, and configure the SP to trust Keycloak's signing certificate.

## Step 5 - Test SAML authentication

1. Open the SAML SP's login URL in a browser. You are redirected to Keycloak's SAML SSO endpoint.
2. Sign in as `alice` with her AD password. Keycloak performs an LDAP bind against `corp.local`.
3. On success, Keycloak generates a SAML assertion, signs it with the realm's signing key, and POSTs it to the SP's ACS URL.
4. The SP validates the assertion signature against the certificate in the metadata, extracts the `NameID` and attributes, and creates a local session.
5. The SP displays the authenticated user's identity. Confirm that `alice` appears with the expected attributes (`username`, `email`, `given_name`).

## Step 6 - Verify OIDC still works

1. Open `http://localhost:8081` (the OIDC client from Lab 2) in a fresh browser window.
2. Sign in as `alice`. The OIDC flow completes as before: authorization code, token exchange, ID token with claims.
3. Compare the identity claims from both protocols:
   - OIDC ID token: `preferred_username=alice`, `email=alice@corp.local`.
   - SAML assertion: `NameID=alice`, `Attribute Name="email" Value="alice@corp.local"`.
4. Both protocols authenticate the same user against the same directory. The claims are consistent because both clients read from the same LDAP federation provider.

## Step 7 - Inspect the SAML assertion

To see the actual SAML assertion:

1. In the SAML SP, enable debug logging or use a browser extension such as SAML-tracer (Firefox) or SAML DevTools (Chrome).
2. Log in through the SAML flow and capture the SAML response.
3. The response is a base64-encoded XML document. Decode it (the browser extension does this automatically) and inspect:
   - `<saml:Issuer>`: Keycloak's entity ID.
   - `<saml:Subject>`: the `NameID` (alice's username).
   - `<saml:AttributeStatement>`: the mapped attributes.
   - `<ds:Signature>`: the XML signature over the assertion.
4. Compare the assertion structure to the OIDC ID token from Step 6. Both carry the same identity information in different formats.

## Verification checklist

- [ ] SAML client created in Keycloak with valid ACS URL and signing enabled.
- [ ] IdP metadata exported and imported into the SP.
- [ ] SAML authentication completes: `alice` logs in through the SAML SP.
- [ ] OIDC authentication still works: `alice` logs in through the OIDC client.
- [ ] Identity claims are consistent across both protocols.
- [ ] SAML assertion inspected and signature validated.

## Common pitfalls

- **Clock skew**: SAML assertions have `NotBefore` and `NotOnOrAfter` conditions. If the SP and IdP clocks differ by more than 5 minutes, the assertion is rejected. Sync both systems to the same NTP source.
- **Entity ID mismatch**: The SP must be configured with the exact entity ID from Keycloak's metadata. A typo causes the SP to reject the assertion.
- **Certificate rotation**: If Keycloak's signing key is rotated, the SP must re-import the metadata. Automated metadata refresh is preferable to manual updates.
- **NameID format**: The SP expects a specific NameID format (usually `username` or `email`). If the format does not match, the SP cannot map the assertion to a user.
- **Attribute mapping**: The SP must be configured to extract attributes from the assertion. Without explicit attribute mapping, the SP receives the assertion but cannot populate the user profile.

## What this lab teaches

- SAML and OIDC are not competing protocols: they solve the same problem (federated authentication) for different eras and ecosystems. A modern IdP speaks both.
- Metadata exchange is the trust bootstrap: the SP trusts the IdP because it has the IdP's signing certificate and endpoint URLs, exchanged out-of-band.
- The directory is the source of truth: both protocols authenticate against the same LDAP backend, so identity claims are consistent regardless of protocol.
- SAML assertions and OIDC ID tokens carry the same information in different formats: XML with attributes versus JSON with claims.
