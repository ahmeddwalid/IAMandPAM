---
title: Lab 16 - Kerberos Authentication Analysis with Wireshark
description: "Capture and dissect Kerberos ticket exchanges in a live AD environment. Identify AS-REQ, TGS-REQ, and AP-REQ messages, extract ticket lifetimes, and detect authentication anomalies."
---

# Lab 16 - Kerberos Authentication Analysis with Wireshark

## What this lab proves

Kerberos is the default authentication protocol in Active Directory, yet most IAM engineers have never seen a ticket exchange. This lab captures Kerberos traffic in a live AD environment, dissects the AS-REQ/TGS-REQ/AP-REQ message flow, extracts ticket lifetimes and encryption types, and identifies authentication anomalies. By the end, you can read a Kerberos capture the way you read an HTTP trace: message by message, field by field.

## Architecture

import Drawio from '@site/src/components/Drawio';
import kerberosWs from '!!raw-loader!@site/static/diagrams/lab-16-kerberos-wireshark.drawio';

<Drawio content={kerberosWs} />

<a href="/diagrams/lab-16-kerberos-wireshark.drawio" download>Download / edit this diagram</a>

The flow: the client sends an AS-REQ to the KDC (step 1), the KDC returns a TGT in an AS-REP (step 2), the client sends a TGS-REQ with the TGT to request a service ticket (step 3), the KDC returns a service ticket in a TGS-REP (step 4), and the client sends an AP-REQ with the service ticket to the target service (step 5).

## Prerequisites

- Lab 1 complete: `DC1` at `10.10.0.10` serving `corp.local`, with `alice` as a domain user.
- Wireshark installed on the host or in a VM with network access to DC1.
- A domain-joined Windows client (or the DC itself) to generate Kerberos traffic.

## Step 1 - Capture Kerberos traffic

1. Start Wireshark and select the network interface connected to the AD network.
2. Apply a display filter for Kerberos traffic:

   ```
   kerberos
   ```

3. Start the capture.
4. On the domain-joined client, generate Kerberos authentication traffic:
   - Run `klist purge` to clear the ticket cache.
   - Access a network resource that requires Kerberos authentication, such as `\\DC1\c$` or `http://dc1.corp.local`.
   - Run `klist` to confirm tickets were issued.

5. Stop the capture. You should see Kerberos messages in the packet list.

## Step 2 - Identify the AS-REQ and AS-REP

The Authentication Service (AS) exchange is the client's first contact with the KDC.

1. In Wireshark, filter for the AS exchange:

   ```
   kerberos.msg_type == 10 || kerberos.msg_type == 11
   ```

   `10` is AS-REQ, `11` is AS-REP.

2. Click the AS-REQ packet. In the packet details pane, expand the Kerberos protocol tree:
   - `msg-type`: `AS-REQ (10)`.
   - `realm`: `CORP.LOCAL`.
   - `cname`: the client's principal name (e.g., `alice`).
   - `sname`: the service principal name (e.g., `krbtgt/CORP.LOCAL`).
   - `etype`: the encryption types the client supports (e.g., `aes256-cts-hmac-sha1-96`, `aes128-cts-hmac-sha1-96`, `rc4-hmac`).

3. Click the AS-REP packet. Expand the Kerberos tree:
   - `msg-type`: `AS-REP (11)`.
   - `ticket`: the Ticket Granting Ticket (TGT).
     - `sname`: `krbtgt/CORP.LOCAL`.
     - `endtime`: the ticket expiration time.
     - `renew-till`: the renewable ticket lifetime.
   - `enc-part`: the encrypted portion (the session key, encrypted with the client's password hash).

4. Note the TGT lifetime. Default AD policy: 10 hours for user tickets, 7 days for renewable tickets.

## Step 3 - Identify the TGS-REQ and TGS-REP

The Ticket Granting Service (TGS) exchange is how the client obtains a service ticket for a specific service.

1. Filter for the TGS exchange:

   ```
   kerberos.msg_type == 12 || kerberos.msg_type == 13
   ```

   `12` is TGS-REQ, `13` is TGS-REP.

2. Click the TGS-REQ packet. Expand the Kerberos tree:
   - `msg-type`: `TGS-REQ (12)`.
   - `sname`: the service principal name (e.g., `HTTP/dc1.corp.local` or `HOST/DC1`).
   - `ticket`: the TGT from the AS-REP (included in the authenticator).
   - `authenticator`: encrypted with the TGT session key, proves the client possesses the session key.

3. Click the TGS-REP packet. Expand the Kerberos tree:
   - `msg-type`: `TGS-REP (13)`.
   - `ticket`: the service ticket.
     - `sname`: the requested service SPN.
     - `endtime`: the service ticket expiration time.
     - `flags`: ticket flags (e.g., `forwardable`, `proxiable`, `renewable`).
   - `enc-part`: the service session key, encrypted with the TGT session key.

4. Note the service ticket lifetime. Default AD policy: 10 hours.

## Step 4 - Identify the AP-REQ

The Application Request (AP-REQ) is how the client presents the service ticket to the target service.

1. Filter for the AP exchange:

   ```
   kerberos.msg_type == 14 || kerberos.msg_type == 15
   ```

   `14` is AP-REQ, `15` is AP-REP.

2. Click the AP-REQ packet. Expand the Kerberos tree:
   - `msg-type`: `AP-REQ (14)`.
   - `ticket`: the service ticket from the TGS-REP.
   - `authenticator`: encrypted with the service session key, proves the client possesses the service session key.

3. The target service decrypts the ticket with its own password hash, extracts the service session key, and validates the authenticator. If valid, access is granted.

## Step 5 - Extract ticket lifetimes and encryption types

1. In Wireshark, add columns for key Kerberos fields:
   - Right-click a column header → **Column Preferences**.
   - Add columns for `kerberos.msg_type`, `kerberos.sname`, `kerberos.endtime`, and `kerberos.etype`.

2. Sort by `msg_type` to group AS, TGS, and AP exchanges.

3. For each ticket, note:
   - `endtime`: the ticket expiration time.
   - `etype`: the encryption type (e.g., `aes256-cts-hmac-sha1-96` is the strongest, `rc4-hmac` is the weakest).

4. Compare the ticket lifetimes to the domain's Kerberos policy:
   - `Get-ADDefaultDomainPasswordPolicy` does not show Kerberos policy.
   - Use `Get-ADObject -Identity "CN=Default Domain Policy,CN=System,DC=corp,DC=local" -Properties *` or `klist` to see actual lifetimes.

## Step 6 - Detect authentication anomalies

Kerberos captures reveal authentication anomalies that are invisible in normal logs.

1. **RC4 downgrade**: If you see `rc4-hmac` in the `etype` field, the client or service is using weak encryption. This is a red flag for credential theft (pass-the-hash, Kerberoasting).

2. **Ticket lifetime anomalies**: If a ticket has an unusually long lifetime (e.g., 100 hours), it may indicate a Golden Ticket attack (forged TGT with arbitrary lifetime).

3. **SPN anomalies**: If the `sname` in a TGS-REQ does not match the expected SPN for the target service, it may indicate a Silver Ticket attack (forged service ticket).

4. **Clock skew**: If the `stime` (client timestamp) in an authenticator differs from the server time by more than 5 minutes, the KDC rejects the request. Clock skew is a common cause of authentication failures.

5. **Pre-authentication failures**: If you see `KDC_ERR_PREAUTH_FAILED` in an AS-REP, the client's pre-authentication data was invalid. This is a common indicator of password spraying or brute force.

## Verification checklist

- [ ] Kerberos traffic captured and filtered in Wireshark.
- [ ] AS-REQ and AS-REP identified with TGT details.
- [ ] TGS-REQ and TGS-REP identified with service ticket details.
- [ ] AP-REQ identified with service ticket presentation.
- [ ] Ticket lifetimes and encryption types extracted.
- [ ] At least one authentication anomaly identified and explained.

## Common pitfalls

- **No Kerberos traffic**: If the client is not domain-joined or is using NTLM, you will not see Kerberos. Confirm the client is domain-joined and that the target service supports Kerberos.
- **Encrypted tickets**: The ticket contents are encrypted. Wireshark can decode the metadata (SPN, lifetime, flags) but not the session keys or user data.
- **Clock skew**: If the client and DC clocks differ by more than 5 minutes, Kerberos authentication fails. Sync both to the same NTP source.
- **SPN mismatches**: If the SPN is not registered in AD, the KDC cannot issue a service ticket. Use `setspn -L <service_account>` to list registered SPNs.

## What this lab teaches

- Kerberos is a ticket-based authentication protocol: the client obtains a TGT from the KDC, then exchanges the TGT for service tickets.
- The KDC is the trust anchor: it issues tickets encrypted with the service's password hash, so only the service can decrypt them.
- Ticket lifetimes are policy-driven: the domain's Kerberos policy controls how long tickets are valid and whether they are renewable.
- Encryption types matter: AES-256 is the strongest, RC4 is the weakest. Downgrade attacks exploit RC4.
- Wireshark is a powerful diagnostic tool for Kerberos: it reveals the message flow, ticket metadata, and authentication anomalies that are invisible in normal logs.
