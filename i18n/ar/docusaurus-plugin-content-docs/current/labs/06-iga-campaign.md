---
title: Lab 6 - Lightweight IGA Campaign
description: "Simulate an access certification campaign with free tooling: import identities from a CSV, map entitlements, review access as a certifier, detect segregation-of-duties conflicts, and remediate."
---

# Lab 6 - Lightweight IGA Campaign

## What this lab proves

Identity governance is the unglamorous half of IAM: someone must periodically prove that every account, membership, and permission is still warranted. This lab simulates an access certification campaign with nothing but a spreadsheet, Keycloak groups, and a few scripts. It walks the exact lifecycle a commercial IGA product automates: identity import from an HR source, entitlement mapping, certifier review, segregation-of-duties (SoD) conflict detection, and remediation. When you later evaluate SailPoint or Omada, you will recognize every step.

## Architecture

import Drawio from '@site/src/components/Drawio';
import simpleGraph from '!!raw-loader!@site/static/diagrams/lab-5-iga.drawio';

<Drawio content={simpleGraph} />

[Download / edit this diagram](/diagrams/lab-5-iga.drawio)

A CSV stands in for the HR system, Keycloak groups stand in for entitlements, a review table stands in for the certification campaign, and a check script stands in for the SoD engine.

## Prerequisites

- Lab 1 Keycloak with the `corp` realm.
- A spreadsheet tool (Excel, LibreOffice) and a text editor.
- Optionally the Lab 2 environment if you want the campaign to act on AD group memberships; this lab runs against Keycloak groups for simplicity.

## Step 1 - The identity source: a CSV file

Create `identities.csv` with the shape an HR export would have:

```csv
employee_id,email,department,role
1001,alice@corp.local,Finance,analyst
1002,bob@corp.local,Finance,manager
1003,carol@corp.local,IT,analyst
1004,dave@corp.local,IT,manager
```

Note the governance semantics baked into this file: **role** is the job-based entitlement trigger, and **department** will matter for the SoD check. In a real deployment this file is a nightly export from the HR system; for the lab it is the starting point of the pipeline.

## Step 2 - Map entitlements to groups

Define the entitlement model as group-to-role rules in `entitlements.csv`:

```csv
role,group
analyst,finance-analyst-access
analyst,it-analyst-access
manager,finance-manager-access
manager,it-manager-access
```

The rule "an analyst gets the analyst groups of their department" is a simple entitlement policy. In the lab you will materialize it with the Keycloak admin API or by hand in the console: create the four groups, and assign `alice` to `finance-analyst-access`, `bob` to `finance-manager-access`, `carol` to `it-analyst-access`, `dave` to `it-manager-access`.

## Step 3 - Run the provisioning script

Write `provision.py` (or PowerShell; the API is the same). It reads `identities.csv`, and for each identity whose `role` appears in `entitlements.csv`, calls the Keycloak admin API to create the user if missing and assign the mapped groups:

```python
import csv, json, requests

TOKEN_URL = "http://localhost:8080/realms/corp/protocol/openid-connect/token"
BASE = "http://localhost:8080/admin/realms/corp"

token = requests.post(TOKEN_URL, data={
    "client_id": "admin-cli", "username": "admin", "password": "admin",
    "grant_type": "password"}).json()["access_token"]
h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

rules = {r["role"]: r["group"] for r in csv.DictReader(open("entitlements.csv"))}
for ident in csv.DictReader(open("identities.csv")):
    group = rules.get(ident["role"])
    if not group:
        continue  # no entitlement rule for this role: flag, do not invent access
    # create user if missing, then add group membership
    # POST {BASE}/users   and   PUT {BASE}/users/{id}/groups/{groupId}
```

Run it, then verify in the Keycloak console that each user carries exactly their mapped group. The key discipline to internalize: **no rule, no access**; a role without an entitlement mapping is an exception to report, not something to grant.

## Step 4 - Run the certification campaign

A certification is a review exercise: for every user-to-group assignment, an owner confirms or revokes it. Model it as a review table `review.csv` generated from the current state:

```csv
user,group,status
alice,finance-analyst-access,revoke
bob,finance-manager-access,keep
carol,it-analyst-access,keep
dave,it-manager-access,keep
```

Generate it by listing group memberships via the admin API (`GET {BASE}/users/{id}/groups`). Then act as the certifier (in a real tool this is the group owner's dashboard): set `alice`'s row to `revoke` because she moved departments (the HR CSV says Finance, but a mover event changed her role).

## Step 5 - Detect SoD conflicts

Add the SoD rule set that finance environments care about: a user may not hold both `finance-manager-access` and `it-manager-access`, and an `analyst` may not approve their own access. Implement `sod-check.py`:

```python
import csv
# load current group memberships, then flag:
# 1. user in finance-manager-access AND it-manager-access -> conflict
# 2. any user whose certifier row was reviewed by the user themselves -> conflict
for user, groups in memberships.items():
    if {"finance-manager-access", "it-manager-access"} <= set(groups):
        print("SoD conflict:", user)
```

Give `dave` both manager groups first (temporarily, via the admin console) so the check has something to find. The output should name `dave`.

## Step 6 - Remediate

1. Apply the revoke from Step 4: remove `alice` from `finance-analyst-access` via the admin API (the same endpoint as Step 3, but DELETE).
2. Resolve dave's conflict by removing `it-manager-access` (in a real org this decision goes to the risk owner, with a ticket).
3. Re-run `sod-check.py`: it now reports no conflicts.
4. Record both actions in a `campaign-log.csv` (user, action, actor, timestamp) as the audit artifact a real IGA product would produce automatically.

## Verification checklist

- [ ] `provision.py` creates users and assigns exactly the mapped groups.
- [ ] A role with no entitlement rule produces no access.
- [ ] The certifier's `revoke` removes the group membership after remediation.
- [ ] `sod-check.py` flags `dave` before remediation and reports clean after.
- [ ] `campaign-log.csv` records every change with an actor and timestamp.

## Common pitfalls

- **Provisioning created duplicate users.** The script must look up users by username before creating them; the Keycloak API returns 409 Conflict on duplicates, which is your signal.
- **The SoD check flags everyone.** SoD rules are pairs of entitlements, not "all privileged access is bad". Keep the rule set minimal and specific, exactly as a real risk register would.
- **Revocation did not propagate.** The lab's revoke removes the group; if the application caches roles from a prior token, the effect appears only after re-login (token lifetime, as in Lab 5). Real IGA tools push to downstream systems; here the lesson is that propagation is a separate, explicit step.
- **"Why not just use the admin console?"** Because the point is the pipeline: a repeatable script that takes the HR file to enforced state is the definition of governance; a console session is an incident. The scripts are short on purpose, and the pattern is the deliverable.

## What you learned

IGA is a closed loop: source of truth, entitlement mapping, provisioning, certification, conflict detection, remediation, and an audit trail back into the loop. Each piece in this lab maps to a feature in commercial IGA products (connectivity to HR, role-based access control, certification campaigns, SoD analysis, remediation workflows), which makes vendor demos decodable: when a vendor shows "automated joiner provisioning", you now know exactly what engine they are showing you. In interviews, the answer to "describe an access certification" is the loop you just executed, with the audit trail as the closing argument.

## Where the labs take you

With all six labs done you can claim, accurately, hands-on exposure to every layer of the IAM stack: directory, SSO, federation, cloud identity, PAM mechanics, JIT, and governance. That is the evidence to bring to the [interview preparation](../interviews/index.md) pages, and it maps directly onto the certification topics in [certifications and career](../careers/01-certifications.md).