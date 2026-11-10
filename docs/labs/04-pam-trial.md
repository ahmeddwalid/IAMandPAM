---
title: Lab 4 - PAM Fundamentals on a Trial
description: "Run a CyberArk community trial in a VM: vault a domain admin credential, broker a session through PSM, watch credential rotation by CPM, and review the recording."
---

# Lab 4 - PAM Fundamentals on a Trial

## What this lab proves

Everything in the PAM section of this site is easier to defend after you have watched the machine do it. This lab runs a real PAM product, CyberArk's community edition trial, against the Windows environment from Lab 1: the domain administrator's credential goes into a vault, a user reaches the target server through a session proxy without ever seeing the password, the password is rotated by the CPM after use, and every session is recorded for review. It also confronts the trial's limits honestly, which is part of learning to evaluate vendor trials.

## Architecture

import Drawio from '@site/src/components/Drawio';
import simpleGraph from '!!raw-loader!@site/static/diagrams/lab-3-pam-trial.drawio';

<Drawio content={simpleGraph} />

[Download / edit this diagram](/diagrams/lab-3-pam-trial.drawio)

The admin authenticates to the vault with MFA, requests access, and the session is brokered through PSM, which injects the credential invisibly. CPM rotates the password afterward. Everything is recorded.

## What the community trial includes, honestly

CyberArk's community edition (a free trial via the CyberArk website, license keys valid for a defined period) gives you the components this lab needs: the Vault and PVWA (the web console), CPM for rotation, and PSM for session brokering and recording. What it does **not** give you in a single download is the full enterprise topology with separate vault, PSM, and CPM servers, HA, or the privileged threat analytics; those are beyond the trial and beyond what a laptop lab needs. The trial is time-limited; expect to reapply when it lapses, or treat the lab as a 1-2 week sprint. All values below are what the trial offers as of this writing; check the trial page for current terms rather than assuming them.

## Prerequisites

- Lab 1 environment: `DC1` on `labnet` at `10.10.0.10`, domain `corp.local`, with the built-in Administrator account you know the password for.
- One more VM: **PAM server**, Windows Server 2022 Evaluation, 6 GB RAM, 60 GB disk, with both a NAT adapter (for the host to reach its web UI) and an internal adapter on `labnet` (to reach DC1). Name it `PAM01`, join it to `corp.local` (for DNS to resolve DC1 and for domain credentials to work from it).
- The CyberArk community edition download from the vendor site, plus the license key the signup email provides. Downloads are several GB; start early.

## Step 1 - Install the PAM components

1. On `PAM01`, extract the downloaded components and run the Vault installer as Administrator. Accept defaults: a single-server install with the Vault, PVWA, CPM, and PSM on one machine is the intended trial layout.
2. Activate the license with the key from the trial email.
3. When the installer finishes, open `https://localhost` (or the PVWA URL it prints) and log in with the initial credentials it provides. Expect certificate warnings: the trial uses a self-signed certificate, which is fine inside the lab.

## Step 2 - Add the target and the managed credential

1. In PVWA, open **Platforms** and confirm a Windows platform (e.g. `WinDomain`) exists. Platforms define how a credential type is discovered, logged in with, and rotated.
2. Open **Administration → Users**, create a user `pamadmin` with Vault Administrator privileges, and log out and back in as `pamadmin` (the default admin should not stay in daily use, same discipline as AD).
3. Under **Safe**, create a safe named `Targets` (safes are the vault's containers and permission units). Grant `pamadmin` full access.
4. Under **Accounts**, add an account:
   - Safe: `Targets`.
   - Platform: `WinDomain`.
   - Account: the built-in Administrator of DC1, `administrator@corp.local`, with the current password.
5. PVWA verifies the credential against the target. A verified account shows a green status; a failed verification means the password is wrong or the platform's resolution of the target hostname fails (check DNS from PAM01).

## Step 3 - Brokered session through PSM

1. In PVWA, click the account, then **Connect → PSM** (the connect menu lists the PSM options the platform supports, RDP for Windows).
2. A session opens through PSM to DC1, authenticated as Administrator. The password was never displayed anywhere in the UI. Confirm: the session page in PVWA shows the recording icon, and the user's clipboard/keyboard activity is captured.
3. While connected, open the recording later: **Monitoring → Recordings** lists the session with metadata (who, when, target, duration).

## Step 4 - Watch CPM rotate the password

1. In PVWA, open the account's properties and find the **Password rotation** settings. The default is to rotate on a schedule; set it to rotate after use if the platform supports it, or run **Rotate password** manually from the account menu.
2. After rotation, note the "password change" event in the account's **History** tab. The new password is now in the vault; the old one is gone.
3. Prove it: on PAM01, try `net use \\DC1\C$ /user:corp.local\administrator` with the old password. It fails. Connect through PSM again: the new password works because PSM fetches it from the vault.

## Step 5 - The audit view

1. In PVWA, open **Administration → Audit** and filter the last hour. You should see: account add, verification, connect (PSM session), password rotation.
2. Note that every event carries the actor (which vault user, which session) and a timestamp. This is the "who did what, when" artifact that PAM sells to auditors, and now you know where it is generated.

## Verification checklist

- [ ] PVWA shows the Administrator account with a verified status.
- [ ] A PSM session to DC1 works without the password ever being displayed.
- [ ] The recording is playable from the Recordings view.
- [ ] After rotation, the old password fails and the new one works via PSM.
- [ ] The Audit view shows add, connect, and rotate events with actors and timestamps.

## Common pitfalls

- **Account verification fails with hostname resolution errors.** PSM/PVWA resolve the target through the AD-integrated DNS; if PAM01 is not domain-joined or the target hostname is wrong, verification fails. Join the domain first, then re-verify.
- **PSM connection times out.** The PSM component must be installed and its service running on PAM01, and the platform's PSM server setting must point at PAM01 (localhost for a single-server trial).
- **Rotation fails with "password complexity" errors.** AD's default password policy rejects the passwords CPM generates; set a lab-appropriate policy on DC1 (or use the platform's password generator settings) so rotation can succeed. This is a real-world integration issue, not a lab quirk.
- **Recording not playable.** The player needs the recording files on disk; if the lab disk filled up, recordings stop. Free space is part of a PAM lab's capacity planning.

## What you learned

PAM's value is not hiding passwords; it is that credentials become operational state nobody knows. The rotation you watched is the same mechanism that in production makes a credential useless within minutes of checkout. The trial also teaches the honest boundary of vendor demos: a community edition proves the mechanics, while production topics like HA and separation of duties between vault operators and admins stay out of scope. When an interviewer asks "what breaks if the vault goes down", your answer should include everything you just saw depend on it.

Next: [Lab 5 - Just-in-time access with MFA](05-jit-mfa.md).