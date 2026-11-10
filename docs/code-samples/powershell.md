---
title: PowerShell Code Samples
description: "PowerShell scripts for AD user management, group management, GPO queries, and PAM session analysis."
---

# PowerShell Code Samples

## Prerequisites

```powershell
Install-Module ActiveDirectory
Import-Module ActiveDirectory
```

## Create a user

```powershell
New-ADUser -Name "John Smith" `
  -SamAccountName "jsmith" `
  -UserPrincipalName "jsmith@corp.local" `
  -GivenName "John" `
  -Surname "Smith" `
  -EmailAddress "jsmith@corp.local" `
  -Department "Engineering" `
  -Title "Software Engineer" `
  -AccountPassword (ConvertTo-SecureString "P@ssw0rd123!" -AsPlainText -Force) `
  -Enabled $true `
  -ChangePasswordAtLogon $true
```

## Add user to group

```powershell
Add-ADGroupMember -Identity "Engineering" -Members "jsmith"
```

## Find users with expired passwords

```powershell
Search-ADAccount -PasswordExpired | 
  Select-Object Name, SamAccountName, PasswordLastSet, DistinguishedName
```

## Find inactive users (90+ days)

```powershell
$cutoff = (Get-Date).AddDays(-90)
Get-ADUser -Filter {LastLogonDate -lt $cutoff} -Properties LastLogonDate |
  Select-Object Name, SamAccountName, LastLogonDate |
  Sort-Object LastLogonDate
```

## Find users with adminCount = 1 (protected group members)

```powershell
Get-ADUser -Filter {adminCount -eq 1} -Properties adminCount, MemberOf |
  Select-Object Name, SamAccountName, MemberOf
```

## Export group membership

```powershell
Get-ADGroupMember -Identity "Domain Admins" |
  Select-Object Name, SamAccountName, objectClass |
  Export-Csv -Path "C:\temp\DomainAdmins.csv" -NoTypeInformation
```

## Find service accounts with SPNs

```powershell
Get-ADUser -Filter {ServicePrincipalName -like "*"} -Properties ServicePrincipalName |
  Select-Object Name, SamAccountName, ServicePrincipalName
```

## Reset user password

```powershell
Set-ADAccountPassword -Identity "jsmith" -Reset `
  -NewPassword (ConvertTo-SecureString "N3wP@ssw0rd!" -AsPlainText -Force)
```

## Unlock user account

```powershell
Unlock-ADAccount -Identity "jsmith"
```

## Disable user account

```powershell
Disable-ADAccount -Identity "jsmith"
```

## Find empty groups

```powershell
Get-ADGroup -Filter * -Properties Members |
  Where-Object { $_.Members.Count -eq 0 } |
  Select-Object Name, DistinguishedName
```

## Get user login events (Security log)

```powershell
Get-WinEvent -FilterHashtable @{
  LogName = 'Security'
  ID = 4624
} -MaxEvents 100 |
  Where-Object { $_.Properties[5].Value -eq 'jsmith' } |
  Select-Object TimeCreated, Id, @{N='User';E={$_.Properties[5].Value}}, @{N='IP';E={$_.Properties[18].Value}}
```

## Find locked-out users

```powershell
Get-WinEvent -FilterHashtable @{
  LogName = 'Security'
  ID = 4740
} -MaxEvents 50 |
  Select-Object TimeCreated, @{N='User';E={$_.Properties[0].Value}}, @{N='IP';E={$_.Properties[1].Value}}
```

## Common errors

| Error | Cause | Fix |
|---|---|---|
| `Access is denied` | Insufficient permissions | Run as administrator or use an account with AD permissions |
| `The specified directory service attribute or value does not exist` | Wrong attribute name | Check the attribute name with `Get-ADUser -Properties *` |
| `The user name could not be found` | Wrong username | Verify the username with `Get-ADUser -Filter *` |
| `The password does not meet the password policy requirements` | Weak password | Use a stronger password or adjust the policy |
