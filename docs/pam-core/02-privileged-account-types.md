---
title: "Privileged Account Types"
description: "The catalog of privileged accounts: local admin, domain admin, service accounts, shared and break-glass accounts, and cloud roles."
---

# Privileged Account Types

The first step of any PAM program is knowing what is privileged in your environment. This page is the catalog: the account types that show up in every organization, what each one can do, why it is risky, and the control pattern that fits it.

## The catalog

| Type | Example | Capability | Typical risk |
|---|---|---|---|
| Local administrator | `Administrator` on a Windows host, `root` on Linux | Full control of one machine | Reused passwords across the fleet; one compromise spreads |
| Domain / enterprise admin | `DOMAIN\Administrator`, `Enterprise Admins` group | Directory-wide control: every machine, every account | Highest-value target; a single leak is a full takeover |
| Server admin | `mysql`, `postgres`, `sa` on databases; app servers | Control of a service or data store | Often the *only* access that matters in the data layer |
| Service account | `svc_backup`, `svc_webapp` | Runs an application or job; often over-granted | No human owner, no password changes, silently accumulates rights |
| Application admin | Admin consoles for HR, ERP, or ticketing apps | Business-critical data, approvals, configuration | Often ignored by IAM because it is not an OS account |
| Shared / generic account | `helpdesk_admin`, `ops_root` used by a whole team | Anything the team needs, attributed to nobody | Anonymous actions; cannot answer "who did this" |
| Break-glass account | Emergency admin, offline vault recovery | Recovery when everything else fails | Must exist, must be sealed, must be monitored |
| Cloud role | AWS `AdministratorAccess`, Azure Global Admin, GCP owner | Cloud-wide control, billing, IAM itself | Standing cloud roles are standing risk; temporary is the norm |

## Why the catalog matters

The audit question "list all privileged accounts" is a trap unless you have already decided what counts. The catalog above is the checklist. A defensible inventory records, per account:

- The system and the account name
- The type from the catalog
- The owner (a person, not a team name)
- What it can actually do, in one line
- Where the credential lives today (vault, file, spreadsheet, someone's head)
- When it was last used and last changed

Programs fail the audit in two directions: they miss account types (service accounts and app admin consoles are the usual blind spots), or they claim accounts are unprivileged that plainly are. Neither survives a competent review.

## The risk rankings

Not all privileged accounts deserve the same urgency. A defensible ordering:

1. **Domain/enterprise admin and cloud owner roles**: everything else is reachable from these.
2. **Shared and break-glass accounts**: anonymous by design, so they need the strictest controls.
3. **Service accounts with privileged rights**: the silent accumulators; nobody notices when they drift.
4. **Local admin at scale**: individually low risk, dangerous in aggregate through password reuse.
5. **Application admins**: business impact first, infrastructure impact second.

## Control patterns per type

The [core capabilities](core-capabilities) page defines the mechanisms; here is the assignment:

- **Local admin**: unique passwords per machine, rotated automatically (LAPS-style), checked out only when needed. Direct login should be rare.
- **Domain/enterprise admin**: no daily use, ever. Vaulted, broken out only for emergencies or through a brokered session, with dual approval.
- **Service accounts**: least privilege by design, gMSA or equivalent managed rotation where the platform supports it, an owner who reviews usage quarterly.
- **Shared accounts**: eliminated where possible, replaced by individual accounts with temporary privilege (the [JIT access](jit-access) pattern). Where they must remain, the session is brokered and recorded so the person, not the account, is attributed.
- **Break-glass**: sealed in the vault, credentials split between two holders, every use fires an alert, and the account is rotated and re-sealed after use.
- **Cloud roles**: no standing role assignment; temporary, scoped, time-boxed grants issued on request.

The common thread: the account that must exist is vaulted, the account that must be used is brokered, and the account that can be avoided is eliminated.

Next: [Core capabilities](core-capabilities), the mechanisms these controls are built from.