---
title: "Ephemeral PAM and Zero Standing Privileges (ZSP)"
description: "Why static credential vaults are an intermediate step, how short-lived certificates eliminate standing access, and the mechanics of Teleport and HashiCorp Boundary."
---
<!-- verified 2026-09-17 -->

import Drawio from '@site/src/components/Drawio';
import KnowledgeCheck from '@site/src/components/KnowledgeCheck';
import diagram from '!!raw-loader!@site/static/diagrams/zero-standing-privilege-zsp.drawio';

# Ephemeral PAM and Zero Standing Privileges (ZSP)

For two decades, enterprise Privileged Access Management (PAM) centered on **credential vaulting**: generating complex 32-character passwords for root and administrative accounts, locking them inside an encrypted vault, and checking them out through a brokered proxy.

While vaulting significantly improves upon static spreadsheets and unmanaged passwords, it leaves a dangerous structural vulnerability: **standing privilege**.
- Privileged accounts still exist on target hosts 24/7/365, waiting to be exploited.
- The PAM vault itself becomes the ultimate "super-vault" target; a compromise of the vault administrator or database exposes the keys to the entire enterprise kingdom.
- Credential rotation is inherently asynchronous. If an adversary steals a checked-out password before the vault can trigger rotation, a window of exploitation remains open.

**Zero Standing Privileges (ZSP)** shifts the paradigm from *vaulting permanent credentials* to *issuing ephemeral, short-lived cryptographic credentials on demand*.

---

## 1. Vaulted Access vs Zero Standing Privileges

| Dimension | Traditional Vaulted PAM (Vault-Centric) | Ephemeral PAM / ZSP (Identity-Centric) |
|---|---|---|
| **Account Existence** | Accounts exist permanently on target hosts (`admin`, `root`). | Zero local admin accounts exist; identities are mapped dynamically. |
| **Credential Type** | Long-lived passwords or static private keys stored in a vault. | Ephemeral X.509 or OpenSSH certificates (TTL: 15–60 minutes). |
| **Credential Rotation** | Scheduled or event-based password resets via agents (CPM). | Unnecessary; credentials expire cryptographically and become invalid. |
| **Vault Blast Radius** | Catastrophic; vault database holds static root secrets for all assets. | Negligible; the broker holds only a CA signing key, zero target passwords. |
| **Revocation Method** | Manual vault check-in + forced target password rotation. | Passive expiration; certificates are mathematically un-usable after TTL. |

---

## 2. Ephemeral Access Architecture

<Drawio content={diagram} />

<p className="diagram-caption">
  Zero Standing Privilege Architecture: Operators authenticate via corporate IdP with FIDO2, receiving a short-lived signed certificate valid for 1 hour. Target hosts trust the CA public key directly.
  <a href="/diagrams/zero-standing-privilege-zsp.drawio" download>Download / edit this diagram</a>
</p>

### The Six-Step Ephemeral Lifecycle:
1. **Just-in-Time Request**: The engineer requests temporary access to a target production host or database via CLI (`tsh login` or `boundary connect`) or web portal, citing an approved change-ticket ID.
2. **Identity Verification**: The broker redirects the request to the enterprise Identity Provider (Okta, Entra ID). The engineer completes phishing-resistant FIDO2 authentication.
3. **Certificate Minting**: Upon successful authentication and ticket validation, the broker's embedded Certificate Authority (CA) signs an ephemeral certificate (e.g., an OpenSSH certificate or an X.509 client certificate) with:
   - **Subject**: `user:alice@enterprise.com`
   - **Allowed Principals**: `dev-operator`, `db-readonly`
   - **Validity Window**: Exact 60-minute lifetime (`NotBefore` / `NotAfter`)
4. **Proxy Brokering**: The engineer establishes an encrypted connection through the session proxy.
5. **Cryptographic Validation on Target**: The target host (Linux server, Windows node, PostgreSQL database) validates the signature against the pre-installed public key of the PAM CA:
   - The target checks: Is this certificate signed by our trusted CA? Yes.
   - Has the expiration timestamp passed? No.
   - Does the certificate permit logging in as `dev-operator`? Yes.
   - **Access is granted without any local password lookup**.
6. **Passive Expiration**: Once the 60-minute window elapses, the certificate becomes cryptographically invalid. Even if an adversary captures the certificate from memory, it cannot be reused.

---

## 3. Technology Implementations

### OpenSSH Certificates (Teleport, Smallstep)
Standard SSH keys (`id_rsa` / `id_ed25519`) have no expiration metadata; they remain valid until manually removed from `~/.ssh/authorized_keys`.

OpenSSH natively supports **Signed SSH Certificates**:
```text
ssh-keygen -L -f ~/.tsh/keys/teleport.corp/alice-cert.pub
Type: ssh-ed25519-cert-v01@openssh.com user certificate
Public key: ED25519-CERT SHA256:49f...
Signing CA: ED25519 SHA256:88a... (trusted user CA)
Key ID: "alice@enterprise.com"
Valid: from 2026-09-17T18:00:00 to 2026-09-17T19:00:00
Principals:
        ubuntu
        operator
Critical Options: (none)
Extensions:
        permit-pty
```
Target servers need only a single line in `/etc/ssh/sshd_config`:
```text
TrustedUserCAKeys /etc/ssh/trusted_user_ca.pub
```
Administrators never touch `~/.ssh/authorized_keys` again.

---

## 4. Operational Challenges of ZSP

While Zero Standing Privileges is the gold standard for zero trust architectures, organizations face three operational realities during adoption:
1. **Legacy Systems Without PKI Support**: Mainframes, industrial operational technology (OT/SCADA), and legacy network switches (Cisco, Juniper) often lack native support for ephemeral certificates, requiring traditional vaulted PAM or bastion jump hosts.
2. **Break-Glass Dependency**: If the ephemeral CA or corporate IdP is offline, engineers cannot generate certificates. Organizations must maintain isolated break-glass procedures (see [Break-Glass Access](/docs/scenarios/break-glass-access)).
3. **Air-Gapped Infrastructure**: Issuing short-lived certificates requires reliable time synchronization (NTP). Severe clock drift causes immediate, widespread authentication failures.

---

<KnowledgeCheck
  question="Why does Zero Standing Privileges (ZSP) using ephemeral certificates provide a superior security posture compared to traditional credential vaulting with automated CPM rotation?"
  options={[
    {
      id: "A",
      text: "It stores the root password in a hardware security module inside the target server.",
      isCorrect: false,
      explanation: "ZSP eliminates root passwords from target servers entirely; target servers validate CA signatures rather than stored passwords."
    },
    {
      id: "B",
      text: "It eliminates standing accounts on target hosts, avoids storing target secrets in a central vault, and bounds exposure to the mathematical lifetime of the short-lived certificate.",
      isCorrect: true,
      explanation: "By issuing short-lived certificates on demand that expire automatically, there are no standing passwords on targets to steal, and the vault cannot be breached for static passwords that don't exist."
    },
    {
      id: "C",
      text: "It allows engineers to share certificates across different accounts without generating logs.",
      isCorrect: false,
      explanation: "Ephemeral certificates are strictly bound to individual user identities and produce comprehensive cryptographic audit trails."
    },
    {
      id: "D",
      text: "It eliminates the need for an enterprise Identity Provider.",
      isCorrect: false,
      explanation: "ZSP relies heavily on enterprise IdPs to verify user identity and enforce MFA before signing ephemeral certificates."
    }
  ]}
  takeaway="Transition your PAM roadmap toward Zero Standing Privileges. Use vaults where legacy protocols demand static credentials, but implement ephemeral certificate brokering for modern cloud, container, and server workloads."
/>
