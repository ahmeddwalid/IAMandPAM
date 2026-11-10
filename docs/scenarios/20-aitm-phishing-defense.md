---
title: "Incident Response: Adversary-in-the-Middle (AiTM) Phishing"
description: "Detection, containment, and eradication playbook for reverse-proxy session cookie hijacking (e.g., Evilginx) and enforcing phishing-resistant authentication."
---
<!-- verified 2026-09-17 -->

import Drawio from '@site/src/components/Drawio';
import diagram from '!!raw-loader!@site/static/diagrams/aitm-phishing-defense.drawio';

# Incident Response: Adversary-in-the-Middle (AiTM) Phishing

**Adversary-in-the-Middle (AiTM)** reverse-proxy phishing represents the most dangerous identity threat facing modern enterprises. Traditional phishing attempted to harvest passwords; AiTM frameworks (such as **Evilginx**, **Muraena**, and **Modlishka**) sit transparently between the victim and the legitimate Identity Provider (such as Microsoft Entra ID or Okta).

When the victim enters their username, password, and completes their TOTP, SMS, or mobile push MFA prompt, the proxy intercepts the resulting authenticated session cookie (`ESTSAUTH`, `okta_session`) and OAuth refresh tokens. The attacker injects these cookies into their own browser, instantly establishing an active, fully authenticated session that completely bypasses passwords and legacy MFA.

---

## 1. Attack Topology & Cryptographic Defense

<Drawio content={diagram} />

<p className="diagram-caption">
  AiTM Reverse-Proxy Phishing: Legacy MFA (Path A) allows session cookie theft, whereas FIDO2 WebAuthn (Path B) uses cryptographic origin binding to reject the proxy connection automatically.
  <a href="/diagrams/aitm-phishing-defense.drawio" download>Download / edit this diagram</a>
</p>

---

## 2. Detection Signals

Security Operations Centers (SOC) must monitor for the following telemetry indicators:

| Signal Source | Event / Telemetry Field | Indicator of Compromise (IoC) |
|---|---|---|
| **Microsoft Entra Sign-In Logs** | `RiskEventTypes` | `anomalousToken`, `tokenIssuerAnomaly`, `unfamiliarFeatures` |
| **Entra ID / Okta Logs** | `ClientAppUsed` & `UserAgent` | Sudden shift from desktop Edge/Chrome to a generic Python, curl, or headless browser session within 60 seconds of login. |
| **IP / Network Telemetry** | `IPAddress` mismatch | Authentication occurs from legitimate employee ISP (e.g. Saudi Telecom / Vodafone Egypt), but the session cookie is exercised 30 seconds later from a cloud hosting ASN (DigitalOcean, AWS, Linode). |
| **Device Claims** | `DeviceDetail.isCompliant` | The authentication record shows compliant device claims, but subsequent API calls using the stolen bearer token contain no device identifier (`deviceId == null`). |

---

## 3. Containment Playbook (Immediate Steps)

When an AiTM session hijacking event is confirmed, execute containment in strict chronological order:

### Step 1: Invalidate All Active Refresh Tokens and Sessions
Terminating the browser window does not revoke stolen bearer tokens. The incident responder must programmatically revoke all refresh tokens across the cloud directory:

```powershell
# Microsoft Graph PowerShell: Revoke all active sessions immediately
Import-Module Microsoft.Graph.Users
Revoke-MgUserSignInSession -UserId "user@enterprise.com"
```

For Okta environments via Okta API:
```bash
curl -X DELETE "https://enterprise.okta.com/api/v1/users/{userId}/sessions" \
  -H "Authorization: SSWS ${OKTA_API_TOKEN}"
```

### Step 2: Trigger Continuous Access Evaluation (CAE)
Ensure the IdP sends real-time revocation events to all participating Relying Parties (Microsoft 365, Exchange Online, SharePoint) to drop cached access tokens without waiting for the 60-minute JWT expiration.

### Step 3: Rotate Passwords and Invalidate Application Passwords
Reset the account password. While the password was not the primary mechanism of bypass, the adversary harvested the plaintext password during the initial proxy phase.

### Step 4: Audit for Persistence Mechanisms
Attackers who obtain a session immediately attempt to establish persistence before the session is revoked:
- **New MFA Device Registrations**: Check Entra ID audit logs for `User registered security info` within 10 minutes of initial compromise (adversaries frequently register an attacker-controlled Microsoft Authenticator app or FIDO key).
- **Inbox Forwarding Rules**: Attackers create hidden mailbox rules to forward emails containing keywords like "invoice", "wire", "password", or "security alert" to external domains.
- **New OAuth App Consents**: Check for malicious third-party enterprise applications consented to on behalf of the user.

---

## 4. Definitive Prevention: Phishing-Resistant Architecture

Legacy MFA cannot be configured to survive reverse-proxy phishing. To permanently eliminate AiTM vulnerability, enforce:

1. **FIDO2 / WebAuthn Hardware Keys or Platform Passkeys**: Cryptographic origin binding guarantees that the browser refuses to sign an assertion for `login.microsoft.phishingsite.net`.
2. **Certificate-Based Authentication (CBA)**: Enforce Mutual TLS (mTLS) with smart cards or device certificates (e.g., YubiKey PIV). The client certificate handshake occurs directly at the TLS layer and cannot be proxied by an HTTP reverse proxy.
3. **Compliant Device Conditional Access**: Require that all authentication requests originate from an Intune-compliant, hybrid-joined device backed by a hardware TPM. Even if the attacker steals credentials, their cloud VM lacks the trusted hardware device certificate.
