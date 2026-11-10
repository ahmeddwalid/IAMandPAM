---
title: Lab 15 - SCIM Provisioning Automation
description: "Build a SCIM 2.0 client in Python that provisions users into a target application, handles group membership, and processes deprovisioning events. Includes error handling, idempotency, and a realistic HR-to-SaaS pipeline."
---

# Lab 15 - SCIM Provisioning Automation

## What this lab proves

SCIM (System for Cross-domain Identity Management) is the protocol that moves identity data between systems: HR creates a user, the IdP provisions them into every connected SaaS application, and when HR terminates the employee, SCIM deprovisioning revokes access everywhere. This lab builds a working SCIM 2.0 client in Python that provisions users, manages group membership, and handles deprovisioning. The client speaks real SCIM: it discovers the service provider config, creates users with proper schemas, maps attributes, and processes error responses.

## Architecture

import Drawio from '@site/src/components/Drawio';
import scimProv from '!!raw-loader!@site/static/diagrams/lab-15-scim-provisioning.drawio';

<Drawio content={scimProv} />

[Download / edit this diagram](/diagrams/lab-15-scim-provisioning.drawio)

The flow: an HR system (or CSV export) triggers a provisioning event (step 1), the SCIM client sends a POST to the service provider's `/Users` endpoint (step 2), the service provider creates the user and returns a 201 with the user's SCIM ID (step 3), the client stores the mapping between HR ID and SCIM ID (step 4), and on termination the client sends a PATCH to deactivate the user (step 5).

## Prerequisites

- Python 3.10+ with `requests` installed (`pip install requests`).
- A SCIM service provider. For this lab, use a mock SCIM server (such as [scim-server](https://github.com/CleverTap/scim-server) or a simple Flask app) or a real SCIM endpoint from an IdP trial (Okta, Entra ID, or Keycloak with SCIM extension).
- A source of user data: a CSV file with columns `employee_id, first_name, last_name, email, department, job_title, manager_id`.

## Step 1 - Discover the service provider configuration

SCIM 2.0 requires the client to discover the service provider's capabilities before making requests. The discovery endpoint is `/.well-known/scim-configuration` or `/ServiceProviderConfig`.

```python
import requests

SCIM_BASE = "https://scim.example.com/v2"

def discover_service_provider(base_url):
    resp = requests.get(f"{base_url}/ServiceProviderConfig")
    resp.raise_for_status()
    config = resp.json()
    print(f"PATCH supported: {config['patch']['supported']}")
    print(f"Bulk supported: {config['bulk']['supported']}")
    print(f"Filter supported: {config['filter']['supported']}")
    return config

config = discover_service_provider(SCIM_BASE)
```

The configuration tells the client which operations are supported (PATCH, bulk, filter), which authentication method to use, and which schemas are available.

## Step 2 - Create a user

SCIM user creation is a POST to `/Users` with a JSON body containing the user's attributes. The core schema is `urn:ietf:params:scim:schemas:core:2.0:User`.

```python
def create_user(base_url, user_data):
    payload = {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
        "externalId": user_data["employee_id"],
        "userName": user_data["email"],
        "name": {
            "givenName": user_data["first_name"],
            "familyName": user_data["last_name"],
        },
        "emails": [
            {
                "value": user_data["email"],
                "type": "work",
                "primary": True,
            }
        ],
        "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
            "department": user_data["department"],
            "manager": {"value": user_data["manager_id"]},
        },
    }
    resp = requests.post(
        f"{base_url}/Users",
        json=payload,
        headers={"Content-Type": "application/scim+json"},
    )
    if resp.status_code == 201:
        scim_user = resp.json()
        print(f"Created user: {scim_user['id']}")
        return scim_user
    else:
        print(f"Error: {resp.status_code} {resp.json()}")
        return None

user = create_user(SCIM_BASE, {
    "employee_id": "E1001",
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice.smith@example.com",
    "department": "Engineering",
    "job_title": "Software Engineer",
    "manager_id": "E1000",
})
```

The `externalId` is the HR system's employee ID. The service provider stores it and uses it for idempotency: if the client sends the same `externalId` twice, the service provider returns the existing user instead of creating a duplicate.

## Step 3 - Map attributes and handle errors

SCIM error responses follow RFC 7644 section 3.12. The response contains a `scimType` that categorizes the error.

```python
def handle_scim_error(response):
    error = response.json()
    scim_type = error.get("scimType", "unknown")
    detail = error.get("detail", "No detail provided")
    
    error_map = {
        "invalidSyntax": "Malformed request body",
        "invalidValue": "Invalid attribute value",
        "uniqueness": "Attribute value already exists",
        "mutability": "Attribute cannot be modified",
        "noTarget": "Target resource not found",
        "tooMany": "Too many results for filter",
    }
    
    description = error_map.get(scim_type, "Unknown error")
    print(f"SCIM Error ({scim_type}): {description} - {detail}")
    return scim_type

# Example: handle a uniqueness conflict
resp = requests.post(f"{SCIM_BASE}/Users", json=payload)
if resp.status_code == 400:
    scim_type = handle_scim_error(resp)
    if scim_type == "uniqueness":
        # User already exists, fetch by externalId
        resp = requests.get(
            f"{SCIM_BASE}/Users?filter=externalId eq '{user_data['employee_id']}'"
        )
        existing = resp.json()["Resources"][0]
        print(f"User already exists: {existing['id']}")
```

## Step 4 - Manage group membership

SCIM groups are resources with a `members` array. To add a user to a group, PATCH the group resource.

```python
def add_user_to_group(base_url, group_id, user_id):
    payload = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        "Operations": [
            {
                "op": "add",
                "path": "members",
                "value": [{"value": user_id}],
            }
        ],
    }
    resp = requests.patch(
        f"{base_url}/Groups/{group_id}",
        json=payload,
        headers={"Content-Type": "application/scim+json"},
    )
    if resp.status_code == 200:
        print(f"Added user {user_id} to group {group_id}")
    else:
        handle_scim_error(resp)

def remove_user_from_group(base_url, group_id, user_id):
    payload = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        "Operations": [
            {
                "op": "remove",
                "path": "members",
                "value": [{"value": user_id}],
            }
        ],
    }
    resp = requests.patch(
        f"{base_url}/Groups/{group_id}",
        json=payload,
        headers={"Content-Type": "application/scim+json"},
    )
    if resp.status_code == 200:
        print(f"Removed user {user_id} from group {group_id}")
    else:
        handle_scim_error(resp)
```

## Step 5 - Deprovision a user

Deprovisioning is a PATCH that sets `active` to `false`. The user resource is not deleted; it is deactivated. This preserves audit history while revoking access.

```python
def deactivate_user(base_url, user_id):
    payload = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        "Operations": [
            {
                "op": "replace",
                "path": "active",
                "value": False,
            }
        ],
    }
    resp = requests.patch(
        f"{base_url}/Users/{user_id}",
        json=payload,
        headers={"Content-Type": "application/scim+json"},
    )
    if resp.status_code == 200:
        print(f"Deactivated user {user_id}")
    else:
        handle_scim_error(resp)

def delete_user(base_url, user_id):
    resp = requests.delete(f"{base_url}/Users/{user_id}")
    if resp.status_code == 204:
        print(f"Deleted user {user_id}")
    else:
        handle_scim_error(resp)
```

## Step 6 - Build the full pipeline

Combine the steps into a provisioning pipeline that reads from a CSV and provisions into SCIM.

```python
import csv
import json

def provision_from_csv(csv_path, scim_base):
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Check if user already exists
            resp = requests.get(
                f"{scim_base}/Users",
                params={"filter": f"externalId eq '{row['employee_id']}'"},
            )
            users = resp.json().get("Resources", [])
            
            if users:
                scim_user = users[0]
                print(f"User {row['email']} already exists: {scim_user['id']}")
            else:
                scim_user = create_user(scim_base, row)
                if scim_user is None:
                    continue
            
            # Store the mapping
            mapping = {
                "employee_id": row["employee_id"],
                "scim_id": scim_user["id"],
                "email": row["email"],
            }
            with open("provisioned_users.json", "a") as out:
                out.write(json.dumps(mapping) + "\n")

provision_from_csv("hr_export.csv", SCIM_BASE)
```

## Step 7 - Handle deprovisioning events

When HR terminates an employee, the pipeline must deactivate the user in every connected application.

```python
def deprovision_user(employee_id, scim_base):
    # Find the user by externalId
    resp = requests.get(
        f"{scim_base}/Users",
        params={"filter": f"externalId eq '{employee_id}'"},
    )
    users = resp.json().get("Resources", [])
    
    if not users:
        print(f"User {employee_id} not found in SCIM")
        return
    
    scim_user = users[0]
    user_id = scim_user["id"]
    
    # Deactivate the user
    deactivate_user(scim_base, user_id)
    
    # Remove from all groups
    resp = requests.get(
        f"{scim_base}/Groups",
        params={"filter": f"members.value eq '{user_id}'"},
    )
    groups = resp.json().get("Resources", [])
    for group in groups:
        remove_user_from_group(scim_base, group["id"], user_id)
    
    print(f"Deprovisioned user {employee_id} (SCIM ID: {user_id})")

deprovision_user("E1001", SCIM_BASE)
```

## Verification checklist

- [ ] Service provider configuration discovered successfully.
- [ ] User created with proper SCIM schema and externalId.
- [ ] Duplicate creation handled via externalId lookup.
- [ ] User added to and removed from groups via PATCH.
- [ ] User deactivated (not deleted) on termination.
- [ ] Error responses parsed with scimType handling.
- [ ] Full CSV-to-SCIM pipeline runs end to end.

## Common pitfalls

- **Missing externalId**: Without `externalId`, the service provider cannot deduplicate. Always set it to the source system's unique identifier.
- **Schema mismatch**: The service provider may require specific attributes or reject unknown ones. Check the service provider's schema before sending.
- **PATCH vs PUT**: SCIM supports both PATCH (partial update) and PUT (full replacement). PATCH is safer for updates; PUT replaces the entire resource.
- **Group membership drift**: If the source system and SCIM group membership diverge, the next sync may remove legitimate access. Use a reconciliation strategy, not just a one-way push.
- **Rate limiting**: SCIM endpoints often have rate limits. Implement exponential backoff for 429 responses.

## What this lab teaches

- SCIM is the glue between HR systems and SaaS applications: it standardizes the user schema, the operations, and the error format.
- Idempotency is built into the protocol: `externalId` prevents duplicate creation, and PATCH operations are naturally idempotent.
- Deprovisioning is a state change, not a deletion: `active=false` preserves audit history while revoking access.
- Error handling is standardized: `scimType` categories let the client programmatically handle different failure modes.
- Group membership is a first-class SCIM resource: groups are managed via PATCH operations on the group, not the user.
