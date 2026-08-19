---
title: "Cheat Sheets"
description: "SAML, OAuth, OIDC, LDAP, Kerberos, FIDO2, and NIST reference syntax at a glance, plus PowerShell commands for common IAM tasks."
---

# Cheat Sheets

Quick-reference syntax for the protocols you will touch daily, plus the PowerShell commands for common IAM tasks. For the reasoning behind any of this, follow the links into the full pages.

## SAML 2.0 quick reference

The full flow is in [SAML](/docs/protocols-iga/saml). The parts you will actually name in an integration:

| Element | What it is |
| --- | --- |
| Metadata | XML document publishing the IdP/SP `entityID`, endpoints, and signing certificate. Almost every integration starts by exchanging metadata. |
| `AuthnRequest` | SP-initiated request asking the IdP to authenticate a user. |
| `Response` > `Assertion` | The signed document the IdP returns; contains `Subject`, `Conditions` (validity window, audience), `AuthnStatement`, and `AttributeStatement`. |
| ACS URL | Assertion Consumer Service: the SP endpoint that receives the assertion (SAML-POST). The single most common misconfiguration. |
| Name ID | The user identifier in the assertion, e.g. `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`. |
| Signature | XML-DSig over the response and/or assertion; the SP must validate it against the IdP certificate. |
| SLO | Single Logout: a separate flow to end the session at both ends. |

**Integration checklist:** entityID matches exactly, ACS URL is https, Name ID format matches the SP expectation, assertion validity window tolerates clock skew, certificate fingerprint matches the IdP's published one.

## OAuth 2.0 / OIDC quick reference

Full walkthroughs: [OAuth 2.0](/docs/protocols-iga/oauth2) and [OIDC](/docs/protocols-iga/oidc).

**Roles:** resource owner, client, authorization server, resource server (OAuth); identity provider takes over the authorization server's role in OIDC.

**Endpoints:** `/authorize` (browser), `/token` (back channel), `/introspect`, `/revoke`, plus OIDC's `/.well-known/openid-configuration` and `/userinfo`.

**Authorization code flow (the one to use):**

```
GET /authorize?response_type=code&client_id=webapp&redirect_uri=https%3A%2F%2Fapp.corp%2Fcb&scope=openid%20profile%20email&state=xyz&code_challenge=...&code_challenge_method=S256

POST /token  grant_type=authorization_code&code=...&redirect_uri=...&client_id=...&code_verifier=...
→ { "access_token": "...", "token_type": "Bearer", "expires_in": 3600, "refresh_token": "...", "id_token": "..." }
```

**Grants:** authorization code (+ PKCE for public clients), client credentials (server-to-server, no user), device code (TVs, CLIs), refresh token (reissue access tokens).

**Token types:** access token (short-lived, sent to the API), refresh token (long-lived, back channel only), ID token (OIDC only, signed JWT with identity claims).

**OIDC claims:** `sub` (stable user ID, never the email), `aud`, `exp`, `iss`, `nonce`. Validate: issuer, audience, signature, expiry.

**SPA rule:** no client secret in the browser, PKCE always, `openid` scope required for an ID token.

## LDAP quick reference

The protocol mechanics are in [LDAP](/docs/protocols-iga/ldap).

**Ports:** 389 (LDAP), 636 (LDAPS), 3268/3269 (AD Global Catalog).

**Distinguished names** are paths built from RDNs, leaf first:

```
cn=jsmith,ou=Employees,ou=People,dc=corp,dc=local
```

**Filter syntax** (RFC 4515):

| Filter | Meaning |
| --- | --- |
| `(cn=jsmith)` | equality |
| `(cn=js*)` | substring (wildcards only at the edges of a value) |
| `(&(objectClass=user)(mail=*@corp.local))` | AND |
| `(\|(objectClass=user)(objectClass=contact))` | OR |
| `(!(userAccountControl:1.2.840.113556.1.4.803:=2))` | NOT with a bitwise AND match (AD disabled-user check) |
| `(memberOf:1.2.840.113556.1.4.1941:=cn=VPN Users,ou=Groups,dc=corp,dc=local)` | AD recursive group membership |

**Operations:** `bind` (authenticate), `search` (read), `compare`, `add`, `modify`, `delete`, `unbind`. Paged searches (`SimplePagedResults`) are mandatory against large directories.

**Common AD attributes:** `sAMAccountName`, `userPrincipalName`, `givenName`, `sn`, `mail`, `memberOf`, `distinguishedName`, `objectClass`, `userAccountControl` (bitmask: 512 enabled, 2 disabled), `lastLogonTimestamp`.

## PowerShell for IAM

The Active Directory module commands you will use constantly. All are native to Windows Server / RSAT; the Entra commands come from the Microsoft Graph PowerShell SDK.

```powershell
# Find a user and its groups
Get-ADUser -Identity jsmith -Properties memberOf, lastLogonTimestamp
Get-ADUser -Filter "Enabled -eq '$true'" -SearchBase "OU=People,DC=corp,DC=local"

# Create a user (disabled first, set password, then enable)
$secure = ConvertTo-SecureString "Temporary-Passw0rd!" -AsPlainText -Force
New-ADUser -Name "Jane Smith" -SamAccountName jsmith -UserPrincipalName "jsmith@corp.local" `
  -GivenName "Jane" -Surname "Smith" -Path "OU=People,DC=corp,DC=local" `
  -AccountPassword $secure -Enabled $false
Set-ADAccountPassword -Identity jsmith -NewPassword $secure -Reset
Enable-ADAccount -Identity jsmith

# Group management
Add-ADGroupMember -Identity "VPN Users" -Members jsmith
Remove-ADGroupMember -Identity "VPN Users" -Members jsmith
Get-ADGroupMember -Identity "Domain Admins" | Select-Object SamAccountName

# Lifecycle and audit
Disable-ADAccount -Identity jsmith
Unlock-ADAccount -Identity jsmith
Search-ADAccount -AccountDisabled | Select-Object Name, SamAccountName
Get-ADGroup -Filter 'name -like "*admin*"' | Select-Object Name, DistinguishedName
Get-ADUser -Identity jsmith -Properties PasswordLastSet | Select-Object PasswordLastSet
Move-ADObject -Identity "CN=jsmith,OU=People,DC=corp,DC=local" -TargetPath "OU=Leavers,DC=corp,DC=local"

# Find every account with admin rights (recursive, across the domain)
$adminGroups = Get-ADGroup -Filter 'name -like "*admins*"' | Select-Object -ExpandProperty DistinguishedName
$adminGroups | ForEach-Object { Get-ADGroupMember -Identity $_ -Recursive } |
  Select-Object -Unique SamAccountName
```

```powershell
# Entra ID (Microsoft Graph PowerShell)
Connect-MgGraph -Scopes "User.Read.All","Group.Read.All","RoleManagement.Read.Directory"
Get-MgUser -UserId "jsmith@corp.local" | Select-Object Id, UserPrincipalName, CreatedDateTime
Get-MgUserMemberOf -UserId "jsmith@corp.local"
Get-MgDirectoryRole | Select-Object DisplayName, Id
```

**The one command that finds leaked standing privileges:**

```powershell
Get-ADGroupMember -Identity "Domain Admins" -Recursive | Select-Object -ExpandProperty SamAccountName
```

If the output is longer than three names, the [PAM Core](/docs/pam-core/what-is-pam) section is your reading list.

## Kerberos quick reference

The full exchange is on the [Kerberos page](/docs/protocols-iga/kerberos). The parts you will actually touch:

| Item | Value |
| --- | --- |
| Ports | 88 (KDC, UDP/TCP); 464 (password change) |
| Default AD TGT lifetime | 10 hours (renewable), clock skew tolerance 5 minutes |
| Key objects | KRBTGT key (encrypts TGTs), service key (encrypts service tickets), TGT session key, service session key |
| Principals | User (`alice@CORP.LOCAL`) and service (`HTTP/web01.corp.local`) principals; service principals are registered in the directory as SPNs |
| Ticket types | TGT (proves domain auth), service ticket (proves access to one service), authenticator (timestamp proving key possession, fresh per request) |
| AD defaults | Ticket lifetime 10 h, max lifetime 7 d, renewal 7 d, skew 5 min |

**Client commands:**

```powershell
klist          # list cached tickets (and check for time-skew/expiry problems)
klist purge    # clear the ticket cache (the "I changed my password" fix)
kinit user@CORP.LOCAL   # force a fresh TGT (Linux/macOS Kerberos)
klist -li 0x3e7   # view the SYSTEM account's ticket cache (Windows, for service accounts)
```

**Windows security event IDs for Kerberos and identity monitoring:**

| Event ID | Meaning |
| --- | --- |
| 4768 | TGT issued (an AS-REQ succeeded). Watch for off-hours issuance and issuance to service accounts |
| 4769 | Service ticket issued (a TGS-REQ succeeded). High volume to one SPN is a Kerberoasting signal |
| 4624 / 4625 | Logon success / failure. 4625 aggregation across accounts is a spray signal |
| 4742 / 4738 | Computer / user account changes. Changes to `KRBTGT` or service accounts are Tier 0 events |
| 4662 | Directory object access (with SACL). The DRSUAPI pattern here is the DCSync signal |
| 4771 / 4772 | Kerberos pre-authentication failed / failed after challenge. Clock skew errors cluster here |

**Common failure causes:** clock skew (fix the time, not the ticket), SPN mismatch (the SPN in the ticket does not match what the client requested), stale keytab (the service cannot decrypt its tickets after a password change), and a full ticket cache on the workstation.

## FIDO2 / passkey quick reference

The mechanism is on the [Passwordless page](/docs/fundamentals/passwordless). The vocabulary you will use in an integration or an interview:

| Term | What it is |
| --- | --- |
| WebAuthn | W3C browser API for registration and sign-in with public-key credentials |
| CTAP2 | The FIDO protocol between the browser/platform and an external authenticator (USB, NFC, BLE) |
| FIDO2 | WebAuthn + CTAP2 together; the FIDO Alliance umbrella standard |
| Relying party (RP) | The website or identity provider that issues the challenge and validates the assertion |
| Authenticator | The device holding the private key (security key, phone, laptop security chip) |
| Attestation | Registration-time proof of the authenticator's origin and properties |
| Assertion | Sign-in-time signature over a challenge; proves key possession for this RP's origin |
| Discoverable credential | A resident credential that can be selected without a username (the passkey case) |
| Platform vs roaming | Platform = built into the device; roaming = a separate security key |

**AAL mapping (NIST SP 800-63-4):** AAL1 = password or single-factor OTP; AAL2 = two factors with a phishing-resistant option offered (passkeys qualify); AAL3 = hardware authenticator with a non-exportable key (synced passkeys are excluded).

**What to check in an integration:** the RP origin is exactly the registered one, the challenge is fresh and single-use, the counter/UV flags were verified, and the credential ID maps to a valid user. A passkey produces no password to phish and no OTP to relay; the failure mode to monitor instead is device loss (recovery flow) and synced-key export (policy decision at AAL3).

## NIST 800-63 and 800-207 quick reference

Full treatment on the [NIST 800-207 page](/docs/fundamentals/nist-800-207).

**NIST SP 800-63-4 authenticator assurance levels (AAL):**

| AAL | Minimum authenticators | Phishing-resistant required? |
| --- | --- | --- |
| AAL1 | Single-factor (password, OTP) | No |
| AAL2 | Two factors | Verifier must offer a phishing-resistant option |
| AAL3 | Hardware authenticator, non-exportable key | Yes |

**NIST SP 800-207 zero trust tenets (the seven):** all data sources and compute are resources; all communication secured regardless of network location; access granted per session, not per network; access by dynamic policy (identity + device + environment); continuous monitoring of all assets; authentication and authorization are dynamic and strict; collect as much asset state as possible for policy decisions.

**The one-line version for interviews:** zero trust replaces "inside the perimeter is trusted" with "trust is per request, verified continuously, and never inherited from the network."

## Identity attack quick reference

The full treatment is on the [Attacks page](/docs/pam-core/attack-defense). The operator's lookup table: attack, the log signal, and the control that breaks it.

| Attack | Detection signal | Primary defense |
| --- | --- | --- |
| Password spray / credential stuffing | Aggregated 4625 failures across accounts; automation-like timing | MFA everywhere, password blocklists, risk-based sign-in |
| Kerberoasting | 4769 service-ticket volume to non-interactive accounts; RC4 tickets | Strong rotated service passwords, AES-only Kerberos, monitoring 4769 |
| Golden / silver ticket | Anomalous 4768/4769 issuance, odd ticket lifetimes | Protect KRBTGT and service keys (Tier 0), monitor issuance |
| Pass-the-hash / pass-the-ticket | NTLM usage where it should not exist; ticket replay patterns | Disable NTLM, credential guard, short ticket lifetimes, no unconstrained delegation |
| DCSync | 4662 DRSUAPI replication patterns from non-DCs | Tier 0 hygiene, monitor replication, never DA on workstations |
| MFA fatigue | Repeated denials then a success, off-hours | Number matching, rate-limited pushes, step-up for sensitive roles |
| Consent phishing / token theft | Unknown publisher consent grants; token replay, impossible travel | Consent policies, short token lifetimes, device trust, continuous session evaluation |
| Shadow credentials | `msDS-KeyCredentialLink` attribute changes | Monitor attribute writes, restrict who may modify it |
