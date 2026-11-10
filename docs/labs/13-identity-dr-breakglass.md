---
title: "Lab 13 - Identity Disaster Recovery and Break-Glass Drill"
description: "Executing a disaster recovery drill: isolating control plane nodes, authenticating via offline break-glass accounts with hardware FIDO2 keys, and verifying out-of-band audit logging."
---
<!-- verified 2026-09-26 -->

# Lab 13 - Identity Disaster Recovery and Break-Glass Drill

## What this lab proves

When an enterprise routes 100% of administrative authentication through a centralized cloud identity provider (Entra ID, Okta), a multi-hour cloud outage locks administrators out of the very infrastructure needed to diagnose the problem. A break-glass account that has never been tested in a simulated blackout will fail during a real emergency due to forgotten credentials, unverified hardware keys, or unexpected cloud dependencies.

This lab conducts an end-to-end identity disaster recovery drill on a Linux control plane host. You will configure an isolated emergency account with offline hardware token authentication, simulate a complete cloud IdP network blackout, execute the emergency access runbook, verify that out-of-band audit logs are captured, and execute the post-drill revocation procedure.

## Architecture

```
[Normal Path (SSO Down)]
Admin ──X──► [Cloud IdP (Entra ID / Okta)] ──X──► [Control Plane Node]
                 (Outage / Network Blackout)

[Break-Glass Path (Emergency Drill)]
Admin ──────► [Tamper-Evident Physical Safe]
                    │
                    ▼ (Retrieves physical FIDO2 hardware key)
              [Direct Serial / Out-of-Band Console]
                    │
                    ▼ (Authenticates locally with pam_u2f / offline key)
              [Control Plane Node] ────► [Out-of-Band Immutable Audit Log]
```

## Prerequisites

- A Linux host or virtual machine (Ubuntu 22.04/24.04 or Debian 12) with root/sudo access.
- `libpam-u2f` or `pamtester` installed for testing hardware token authentication.
- Terminal access.

## Step 1 - Provision the Isolated Emergency Account

Create a dedicated local break-glass user (`emergency-admin`) with no directory, LDAP, or cloud synchronization dependencies:

```bash
# Create local emergency group and user
sudo groupadd -g 990 emergency-admins
sudo useradd -u 990 -g emergency-admins -m -s /bin/bash emergency-admin

# Set a complex 32-character break-glass password
sudo passwd emergency-admin
```

Configure `sudo` access strictly scoped to the emergency group, requiring re-authentication:

```bash
echo "%emergency-admins ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/99-emergency-admin
echo "Defaults:%emergency-admins timestamp_timeout=0" | sudo tee -a /etc/sudoers.d/99-emergency-admin
sudo chmod 440 /etc/sudoers.d/99-emergency-admin
```

The `timestamp_timeout=0` directive ensures that every individual `sudo` invocation requires explicit credential re-authentication, preventing orphaned active sessions.

## Step 2 - Configure Hardware Key Authentication (pam_u2f)

Emergency break-glass accounts must not rely on mobile push notifications or SMS (which require internet connectivity and third-party cloud gateways). They require hardware-bound physical keys (YubiKey / FIDO2):

1. Install the PAM U2F module:
   ```bash
   sudo apt-get update && sudo apt-get install -y libpam-u2f pamu2fcfg
   ```
2. Create an isolated directory for emergency key mappings:
   ```bash
   sudo mkdir -p /etc/auth/emergency
   sudo chmod 700 /etc/auth/emergency
   ```
3. Register your physical FIDO2 security key for `emergency-admin` (if a physical key is not plugged in during the lab exercise, generate a local PAM cryptographic key pair for simulation):
   ```bash
   # Generate authorization mapping for emergency-admin
   pamu2fcfg -u emergency-admin | sudo tee /etc/auth/emergency/u2f_keys
   sudo chmod 600 /etc/auth/emergency/u2f_keys
   ```
4. Enforce U2F in `/etc/pam.d/common-auth`:
   ```bash
   auth required pam_u2f.so authfile=/etc/auth/emergency/u2f_keys cue
   ```
   The `cue` parameter prompts the operator to physically touch the flashing hardware key during authentication.

## Step 3 - Configure Out-of-Band Audit Logging

During an identity disaster recovery scenario, standard SIEM ingestion pipelines may be disrupted. Critical break-glass actions must write immediately to an append-only, tamper-resistant local log:

```bash
sudo tee /etc/rsyslog.d/10-emergency-audit.conf << 'RSYSLOG_CONF'
# Route emergency admin auth events to dedicated immutable audit file
if $programname == 'sudo' and $msg contains 'emergency-admin' then /var/log/emergency-audit.log
& stop
if $programname == 'sshd' and $msg contains 'emergency-admin' then /var/log/emergency-audit.log
& stop
RSYSLOG_CONF

sudo systemctl restart rsyslog
```

Protect the log file using Linux file system append-only attributes:
```bash
sudo touch /var/log/emergency-audit.log
sudo chattr +a /var/log/emergency-audit.log
```
The `+a` attribute ensures that even a root user cannot delete or edit past log entries; new entries can only be appended.

## Step 4 - Simulate Total Cloud IdP Outage

To test whether your environment has hidden dependencies on the cloud IdP, blackhole all cloud identity endpoints at the kernel level:

```bash
# Blackhole common enterprise cloud IdP endpoints
sudo iptables -A OUTPUT -d login.microsoftonline.com -j REJECT
sudo iptables -A OUTPUT -d okta.com -j REJECT
sudo iptables -A OUTPUT -p udp --dport 53 -d 8.8.8.8 -j REJECT

# Block standard enterprise SSO ports
sudo iptables -A OUTPUT -p tcp --dport 636 -j DROP # LDAPS
```

Verify that federated SSO tools and external directory lookups fail with connection timeouts.

## Step 5 - Execute the Break-Glass Access Procedure

With the cloud IdP offline, execute the emergency runbook:

1. **Physical Token Retrieval**: In a real incident, the incident commander and lead architect unlock the physical safe and retrieve the emergency hardware key.
2. **Console Authentication**: Connect via local terminal or serial out-of-band console:
   ```bash
   login: emergency-admin
   Password: <EmergencyPassword32Chars>
   [Touch FIDO2 hardware security key]
   ```
3. **Verify Emergency Privilege Escalation**:
   ```bash
   sudo systemctl status
   ```
4. **Verify Out-of-Band Audit Generation**:
   In another terminal, inspect the append-only audit log:
   ```bash
   sudo cat /var/log/emergency-audit.log
   ```
   Verify that the log contains the exact timestamp, hostname, command executed, and the user identity `emergency-admin`.

## Step 6 - Post-Incident Recovery and Credential Revocation

Once the primary identity provider is restored, complete the formal post-incident restoration procedure:

1. **Remove Blackout Simulation**:
   ```bash
   sudo iptables -F
   ```
2. **Immediate Password Rotation**:
   The break-glass password used during the drill is considered compromised:
   ```bash
   # Generate new random 32-character password
   NEW_PASS=$(openssl rand -base64 24)
   echo "emergency-admin:$NEW_PASS" | sudo chpasswd
   ```
3. **Reseal Physical Credentials**:
   Place the new password and hardware key in tamper-evident security bags (with recorded serial numbers) and return them to the physical safes.
4. **Archive Audit Logs**:
   Export `/var/log/emergency-audit.log` to an air-gapped forensic repository and verify that all actions taken during the drill match the incident commander's log.

## Common Pitfalls

1. **Hidden Cloud Dependencies in PAM**: If the emergency user account's shell (`/bin/bash`) or home directory relies on an NFS mount or network directory, login will hang indefinitely during a network outage. Break-glass accounts must use local home directories (`/root` or `/home/emergency-admin` on the root disk partition).
2. **Failing Open During Outages**: If PAM configurations use `sufficient` instead of `required` for MFA modules, a failure in the hardware token module might accidentally allow password-only authentication. Always verify that hardware token checks are marked `required`.
3. **Alerting Through the Dead Platform**: Configuring break-glass alerts to send exclusively via email or Microsoft Teams will fail silently when the cloud IdP is down. Emergency alerts must use out-of-band paths: direct SMS modems, cellular pagers, or independent satellite uplinks.
