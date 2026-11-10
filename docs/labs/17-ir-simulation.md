---
title: Lab 17 - Incident Response Simulation
description: "Simulate a compromised service account incident in a controlled lab environment. Practice detection, containment, eradication, and recovery using real AD tools and PowerShell."
---

# Lab 17 - Incident Response Simulation

## What this lab proves

Incident response for identity compromises follows a structured process: detect the anomaly, contain the threat, eradicate the attacker's access, and recover to a known-good state. This lab simulates a compromised service account in a controlled AD environment, walks through the full IR lifecycle using real tools (PowerShell, Event Viewer, AD audit logs), and produces an incident timeline that would hold up in a real investigation.

## Architecture

import Drawio from '@site/src/components/Drawio';
import irSim from '!!raw-loader!@site/static/diagrams/lab-17-ir-simulation.drawio';

<Drawio content={irSim} />

[Download / edit this diagram](/diagrams/lab-17-ir-simulation.drawio)

The flow: a service account exhibits anomalous behavior (step 1), the IR team detects the anomaly via audit logs (step 2), contains the threat by disabling the account and revoking sessions (step 3), eradicates the attacker's access by rotating credentials and removing persistence (step 4), and recovers by re-establishing the service account with proper controls (step 5).

## Prerequisites

- Lab 1 complete: `DC1` at `10.10.0.10` serving `corp.local`, with `alice` as a domain user.
- A service account in AD: `svc-app-01` with a known password.
- PowerShell with the AD module installed (`Import-Module ActiveDirectory`).
- Event Viewer access on DC1.

## Step 1 - Simulate the compromise

1. Create a service account in AD:

   ```powershell
   New-ADUser -Name "svc-app-01" -SamAccountName "svc-app-01" `
     -UserPrincipalName "svc-app-01@corp.local" `
     -AccountPassword (ConvertTo-SecureString "P@ssw0rd123!" -AsPlainText -Force) `
     -Enabled $true -PasswordNeverExpires $true
   ```

2. Simulate anomalous behavior: the service account authenticates from an unusual IP address at an unusual time.

   ```powershell
   # Simulate a login event (in a real scenario, this would come from actual authentication)
   # For the lab, we create a fake security event
   $event = @{
     TimeCreated = Get-Date
     Id = 4624
     Message = "An account was successfully logged on."
     SubjectUserName = "svc-app-01"
     IpAddress = "203.0.113.50"
     LogonType = 3
   }
   Write-Host "Simulated login: $($event.SubjectUserName) from $($event.IpAddress) at $($event.TimeCreated)"
   ```

3. The anomaly: `svc-app-01` normally authenticates from `10.10.0.0/24` during business hours. The simulated login is from `203.0.113.50` (external) at 02:00.

## Step 2 - Detect the anomaly

1. On DC1, open Event Viewer and navigate to **Windows Logs → Security**.
2. Filter for Event ID 4624 (successful logon) with the service account name:

   ```powershell
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
     ID = 4624
   } | Where-Object { $_.Properties[5].Value -eq 'svc-app-01' } |
     Select-Object TimeCreated, Id, @{N='User';E={$_.Properties[5].Value}}, @{N='IP';E={$_.Properties[18].Value}}
   ```

3. Identify the anomalous login:
   - Normal: `svc-app-01` from `10.10.0.50` at 09:00.
   - Anomalous: `svc-app-01` from `203.0.113.50` at 02:00.

4. Correlate with other events:
   - Check for Event ID 4672 (special privileges assigned) for the service account.
   - Check for Event ID 4768 (Kerberos TGT requested) from the anomalous IP.
   - Check for Event ID 4769 (Kerberos service ticket requested) from the anomalous IP.

   ```powershell
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
     ID = 4768, 4769
   } | Where-Object { $_.Properties[5].Value -eq 'svc-app-01' } |
     Select-Object TimeCreated, Id, @{N='User';E={$_.Properties[5].Value}}, @{N='IP';E={$_.Properties[18].Value}}
   ```

## Step 3 - Contain the threat

1. Disable the compromised service account:

   ```powershell
   Disable-ADAccount -Identity "svc-app-01"
   ```

2. Revoke all active sessions:
   - In AD, the account is disabled, so new authentications fail.
   - Existing sessions may persist until the ticket expires. Force revocation by resetting the account password (Step 4).

3. Block the anomalous IP address at the firewall:

   ```powershell
   # On a Windows host with firewall access
   New-NetFirewallRule -DisplayName "Block 203.0.113.50" `
     -Direction Inbound -RemoteAddress "203.0.113.50" -Action Block
   ```

4. Preserve evidence:
   - Export the security events for the service account to a file.
   - Capture the current state of the account (group membership, SPNs, permissions).

   ```powershell
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
   } | Where-Object { $_.Properties[5].Value -eq 'svc-app-01' } |
     Export-Csv -Path "C:\IR\svc-app-01-events.csv" -NoTypeInformation

   Get-ADUser -Identity "svc-app-01" -Properties * |
     Export-Csv -Path "C:\IR\svc-app-01-state.csv" -NoTypeInformation
   ```

## Step 4 - Eradicate the attacker's access

1. Reset the service account password:

   ```powershell
   $newPassword = ConvertTo-SecureString (New-Guid).Guid -AsPlainText -Force
   Set-ADAccountPassword -Identity "svc-app-01" -NewPassword $newPassword -Reset
   ```

2. Remove any persistence mechanisms:
   - Check for unauthorized group memberships:

     ```powershell
     Get-ADPrincipalGroupMembership -Identity "svc-app-01" |
       Select-Object Name, GroupCategory
     ```

   - Check for unauthorized SPNs:

     ```powershell
     Get-ADUser -Identity "svc-app-01" -Properties ServicePrincipalNames |
       Select-Object -ExpandProperty ServicePrincipalNames
     ```

   - Check for unauthorized permissions on the account:

     ```powershell
     (Get-Acl "AD:\CN=svc-app-01,CN=Users,DC=corp,DC=local").Access |
       Where-Object { $_.IdentityReference -notmatch "SYSTEM|Domain Admins|Enterprise Admins" }
     ```

3. Scan for lateral movement:
   - Check for the anomalous IP in other event logs across the environment.
   - Check for the service account authenticating to other systems.

   ```powershell
   # Check all domain controllers for the anomalous IP
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
     ID = 4624
   } | Where-Object { $_.Properties[18].Value -eq '203.0.113.50' } |
     Select-Object TimeCreated, @{N='User';E={$_.Properties[5].Value}}, @{N='IP';E={$_.Properties[18].Value}}
   ```

## Step 5 - Recover to a known-good state

1. Re-enable the service account with the new password:

   ```powershell
   Enable-ADAccount -Identity "svc-app-01"
   ```

2. Update the service configuration with the new password:
   - Update the service account password in the application configuration.
   - Restart the service to authenticate with the new credentials.

3. Verify the service is functioning:

   ```powershell
   Get-WinEvent -FilterHashtable @{
     LogName = 'Security'
     ID = 4624
   } | Where-Object { $_.Properties[5].Value -eq 'svc-app-01' } |
     Select-Object -First 5 TimeCreated, @{N='IP';E={$_.Properties[18].Value}}
   ```

4. Implement preventive controls:
   - Restrict the service account to authenticate only from specific IPs (via firewall or AD logon restrictions).
   - Implement a rotation policy for the service account password.
   - Enable alerting for anomalous logins (unusual IP, unusual time).

   ```powershell
   # Restrict logon to specific workstations
   Set-ADUser -Identity "svc-app-01" -LogonWorkstations "DC1,APP-SERVER-01"
   ```

## Step 6 - Produce the incident timeline

Document the incident for post-incident review:

| Time | Event | Source |
|---|---|---|
| 02:00 | `svc-app-01` authenticated from `203.0.113.50` | Security Event 4624 |
| 02:01 | `svc-app-01` requested TGT from `203.0.113.50` | Security Event 4768 |
| 02:02 | `svc-app-01` requested service ticket for `HOST/APP-SERVER-01` | Security Event 4769 |
| 02:05 | IR team detected anomaly via audit log review | Manual |
| 02:10 | Account disabled, sessions revoked | AD audit |
| 02:15 | Password reset, persistence removed | AD audit |
| 02:30 | Service re-established with new credentials | Service logs |

## Verification checklist

- [ ] Service account created and anomalous login simulated.
- [ ] Anomaly detected via audit log review.
- [ ] Account disabled and sessions revoked.
- [ ] Password reset and persistence removed.
- [ ] Service re-established with new credentials.
- [ ] Preventive controls implemented.
- [ ] Incident timeline documented.

## Common pitfalls

- **Deleting instead of disabling**: Deleting the account destroys evidence. Disable first, delete only after investigation.
- **Forgetting existing sessions**: Disabling the account does not revoke existing tickets. Reset the password to force re-authentication.
- **Missing lateral movement**: The attacker may have accessed other systems. Scan the entire environment for the anomalous IP and account.
- **No evidence preservation**: Export logs and account state before making changes. The investigation depends on evidence.
- **Skipping recovery verification**: After re-enabling the account, verify the service is functioning. A broken service is a new incident.

## What this lab teaches

- Incident response is a structured process: detect, contain, eradicate, recover.
- Audit logs are the primary detection mechanism: Event ID 4624, 4768, and 4769 reveal authentication anomalies.
- Containment is immediate: disable the account and block the IP before investigating further.
- Eradication is thorough: reset credentials, remove persistence, scan for lateral movement.
- Recovery is verified: re-enable the account, update the service, and confirm functionality.
- Documentation is essential: the incident timeline is the deliverable for post-incident review.
