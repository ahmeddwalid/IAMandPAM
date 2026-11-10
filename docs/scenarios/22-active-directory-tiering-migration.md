---
title: "Active Directory Tiering and ADCS Attack Defense"
description: "Active Directory Certificate Services (ADCS ESC1-ESC8) vulnerability mechanics, PKINIT abuse, and migration to the Microsoft Enterprise Access Model (Control Plane / Tier 0)."
---
<!-- verified 2026-09-17 -->

import Drawio from '@site/src/components/Drawio';
import diagram from '!!raw-loader!@site/static/diagrams/adcs-attack-defense.drawio';

# Active Directory Tiering and ADCS Attack Defense

Active Directory Certificate Services (ADCS) is Microsoft's public key infrastructure (PKI) implementation. While essential for issuing smart card certificates, computer authentication, and VPN access, ADCS is frequently the single easiest vector for an unprivileged attacker to achieve full Active Directory forest compromise.

Following the landmark research by Will Schroeder and Lee Christensen ("Certified Pre-Owned", 2021), security teams must understand both the cryptographic mechanics of ADCS template abuse and the architectural isolation required under the **Microsoft Enterprise Access Model (EAM)**.

---

## 1. ADCS Attack Topology & PKINIT Exploitation

<Drawio content={diagram} />

<p className="diagram-caption">
  ADCS ESC1 Exploitation Topology: An unprivileged domain user requests a certificate from a misconfigured template supplying an arbitrary Domain Admin SAN, using PKINIT to obtain a Tier 0 TGT.
  [Download / edit this diagram](/diagrams/adcs-attack-defense.drawio)
</p>

---

## 2. Anatomies of Key ADCS Vulnerabilities

### ESC1: Enrollee Supplies Subject with Client Authentication
The most devastating misconfiguration occurs when a certificate template permits the requesting user to specify their own Subject Alternative Name (SAN):
1. **Misconfiguration Conditions**:
   - The template grants enrollment rights to low-privileged users (e.g., `Authenticated Users` or `Domain Users`).
   - Manager approval is disabled (`msPKI-Enrollment-Flag` lacks `CT_FLAG_PEND_ALL_REQUESTS`).
   - The template flag `CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT` (`0x00000001`) is set.
   - The Extended Key Usage (EKU) includes `Client Authentication` (`1.3.6.1.5.5.7.3.2`) or `Smart Card Logon` (`1.3.6.1.4.1.311.20.2.2`).
2. **Exploitation**: The attacker uses open-source tools (such as `Certipy` or `Certify`) to request a certificate, specifying `altname: administrator@corp.local`.
3. **PKINIT Authentication**: The attacker presents the signed certificate to the Domain Controller's Kerberos Key Distribution Center (KDC) via RFC 4556 (Public Key Cryptography for Initial Authentication - PKINIT). The KDC verifies the CA signature, matches the certificate's SAN to the `Administrator` account, and returns a valid Kerberos Ticket Granting Ticket (TGT) for the Domain Admin.

### ESC8: NTLM Relay to ADCS Web Enrollment
If the Certificate Authority runs the legacy HTTP web enrollment role (`/certsrv`), it frequently lacks Extended Protection for Authentication (EPA) and does not enforce SMB/HTTP signing:
1. An attacker coerces authentication from a Domain Controller (e.g., via PetitPotam / MS-EFSRPC).
2. The attacker relays the machine account's NTLM authentication to the ADCS HTTP endpoint (`http://ca.corp.local/certsrv`).
3. The CA accepts the relayed authentication and issues an X.509 certificate for the Domain Controller machine account (`DC01$`).
4. The attacker uses the machine certificate to request a TGT and executes a DCSync attack, dumping all password hashes in the forest.

---

## 3. The Microsoft Enterprise Access Model (EAM)

To defend against credential theft and privilege escalation, organizations must abandon flat Active Directory structures in favor of the **Enterprise Access Model (EAM)** (the modern evolution of legacy Tier 0/1/2 architecture):

```
+----------------------------------------------------------------------------+
| CONTROL PLANE (Tier 0)                                                     |
| Assets: Domain Controllers, ADCS PKI, Entra Connect Sync, ADFS, PAM Vaults|
| Admin Rule: Managed strictly from dedicated Privileged Access Workstations |
|             (PAWs). Zero internet browsing. Hardware FIDO2 credentials.   |
+----------------------------------------------------------------------------+
       | (Enforced unidirectional boundary - credentials NEVER flow down)
       v
+----------------------------------------------------------------------------+
| MANAGEMENT PLANE (Tier 1)                                                  |
| Assets: Enterprise member servers, databases, cloud subscriptions, IaaS    |
| Admin Rule: Local server administrators managed via LAPS or JIT PAM.      |
+----------------------------------------------------------------------------+
       | (Enforced unidirectional boundary - credentials NEVER flow down)
       v
+----------------------------------------------------------------------------+
| WORKLOAD & USER PLANE (Tier 2)                                             |
| Assets: Laptops, workstations, mobile devices, printers                    |
| Admin Rule: Standard users hold ZERO administrative rights.               |
+----------------------------------------------------------------------------+
```

### The Clean Source Principle
An administrative session is only as secure as the workstation from which it originates. If a Domain Admin logs into a Tier 2 workstation (which browses the web and opens phishing emails) to run PowerShell:
- An attacker with local admin on that workstation uses Mimikatz to dump the Domain Admin's Kerberos ticket or plaintext password from `lsass.exe`.
- **The entire forest is compromised**.

The **Clean Source Principle** dictates that control plane credentials may only be entered on hardened **Privileged Access Workstations (PAWs)** that have no email clients, no web browsing, and strict application whitelisting (AppLocker/WDAC).

---

## 4. ADCS Hardening Checklist

Execute these administrative controls immediately on all enterprise CAs:

```powershell
# 1. Disable NTLM on ADCS HTTP enrollment endpoints
# Enforce EPA and require HTTPS with SSL certificate binding in IIS

# 2. Audit all templates for CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT
Get-CATemplate | Where-Object {
    $_.EnrollmentFlag -band 0x1 -and
    $_.ExtendedKeyUsage -contains "Client Authentication"
}

# 3. Disable HTTP Web Enrollment if not strictly required
# Uninstall the "Certification Authority Web Enrollment" role feature
Remove-WindowsFeature ADCS-Web-Enrollment
```
