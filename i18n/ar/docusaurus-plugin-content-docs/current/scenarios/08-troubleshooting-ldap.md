---
title: "Troubleshooting: LDAP Bind Failures"
description: "LDAP bind failures against Active Directory: error 49 sub-codes, diagnosis steps, and prevention."
---

<!-- verified 2026-08-18: sub-error codes and message format verified against Microsoft error code documentation and multiple vendor references. -->

# Troubleshooting: LDAP Bind Failures

LDAP bind failures are the classic identity integration failure. The app, sync engine, or PAM tool cannot authenticate to the directory, and the error message is one line of hex. This guide covers the Active Directory case, which is the most common, with the same structure applying to any LDAP directory.

## Symptoms

- The integration logs show repeated authentication failures against the directory.
- The typical message format is a Windows error plus an `LdapErr` detail, for example:

```
80090308: LdapErr: DSID-0C09030B, comment: AcceptSecurityContext error, data 52e, v893
```

- Depending on the component, the failure may surface as a generic "authentication failed", "cannot bind", or "access denied" with the hex detail in the debug log only.

## Root cause

An LDAP bind against Active Directory fails with result code 49 (invalid credentials), and the directory appends a **sub-error code** in the `data` field that says exactly why. The sub-code is the diagnosis. The common values:

| Sub-code | Meaning | What to check |
| --- | --- | --- |
| `525` | User not found | The bind DN or user name is wrong, or the user is in a different domain |
| `52e` | Invalid credentials | Wrong password, or the bind account's password changed outside the integration |
| `530` | Not permitted to log on at this time | Logon hours restriction on the account |
| `531` | Not permitted to log on from this workstation | Workstation restriction |
| `532` | Password expired | The bind account password has expired |
| `533` | Account disabled | The bind account is disabled |
| `701` | Account expired | The account has an expiry date in the past |
| `773` | User must change password | The account is configured to require a password change at next logon, which is typical after an admin reset |
| `775` | Account locked out | Failed attempts triggered the lockout policy |

A less common variant is the bind failing with a certificate or TLS error instead of error 49, which means the transport failed before authentication. That is covered by the [certificate guide](09-troubleshooting-certificates.md).

## Resolution

1. **Read the sub-code.** The `data` field is hexadecimal; convert it to decimal to cross-check: `52e` = 0x52E = 1326, which is `ERROR_LOGON_FAILURE` in the Windows error list. Every sub-code above maps to a documented Windows error.
2. **Verify the bind account exists and is usable.** Query the directory with a known-good tool or a test bind from the integration host. If the account cannot authenticate from the host, the problem is local to that host.
3. **Check the account state.** For `533`, `532`, `701`, `773`, and `775`, the fix is a directory-side action: enable the account, reset and sync the password, clear the "must change" flag, or reset the lockout state. The identity team does this; the integration team cannot fix it from their side.
4. **Check the bind DN.** For `525`, confirm the distinguished name or user name format matches what the directory expects. A common mistake is binding with the user principal name against a directory configured for DN binds, or vice versa.
5. **Test the password separately.** For `52e`, change the password in the directory and update the integration. If the integration keeps failing with `52e` immediately after a password change, suspect a caching layer (the app's credential store, the OS credential cache, or a service account that loads credentials at service start).
6. **Check for rate limiting or lockout.** For `775`, the account was locked by repeated failures, which itself is an incident signal: check the directory's lockout audit log for the source of the attempts before resetting the lockout state.

## Prevention

- Bind accounts for integrations get **long, non-expiring passwords** where policy allows, or a managed rotation process that updates every consuming integration at once. A bind account with a forgotten expiry is the most common recurring outage.
- Document which integrations use which bind accounts. An account used by six systems that only one team knows about will fail six ways.
- Monitor bind failures at the directory: a cluster of `52e` or `775` codes from one source is a brute-force signal, not a support ticket.
- Run the bind as a **least-privilege service account**: read access to the attributes the integration needs, never domain admin. A bind account with admin rights that is shared across integrations is a standing credential risk covered by [PAM](/docs/pam-core/what-is-pam).

## Related

- [Certificate mismatches](09-troubleshooting-certificates.md), for TLS-level failures.
- [PAM session and integration errors](10-troubleshooting-pam.md), for vault-to-directory authentication failures in the PAM stack.