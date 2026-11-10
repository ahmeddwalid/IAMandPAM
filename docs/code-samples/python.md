---
title: Python Code Samples
description: "Python scripts for SCIM provisioning, AWS IAM policy analysis, Azure AD Graph API, and certificate validation."
---

# Python Code Samples

## Prerequisites

```bash
pip install requests boto3 azure-identity msgraph-core cryptography
```

## SCIM: Create a user

```python
import requests

SCIM_BASE = "https://scim.example.com/v2"
TOKEN = "your-access-token"

def create_user(user_data):
    payload = {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
        "externalId": user_data["employee_id"],
        "userName": user_data["email"],
        "name": {
            "givenName": user_data["first_name"],
            "familyName": user_data["last_name"],
        },
        "emails": [{"value": user_data["email"], "type": "work", "primary": True}],
    }
    resp = requests.post(
        f"{SCIM_BASE}/Users",
        json=payload,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/scim+json"},
    )
    if resp.status_code == 201:
        return resp.json()
    print(f"Error: {resp.status_code} {resp.json()}")
    return None
```

## SCIM: Deprovision a user

```python
def deactivate_user(user_id):
    payload = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        "Operations": [{"op": "replace", "path": "active", "value": False}],
    }
    resp = requests.patch(
        f"{SCIM_BASE}/Users/{user_id}",
        json=payload,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/scim+json"},
    )
    return resp.status_code == 200
```

## AWS IAM: List attached policies for a role

```python
import boto3

def list_role_policies(role_name):
    iam = boto3.client('iam')
    paginator = iam.get_paginator('list_attached_role_policies')
    for page in paginator.paginate(RoleName=role_name):
        for policy in page['AttachedPolicies']:
            print(f"{policy['PolicyName']}: {policy['PolicyArn']}")
```

## AWS IAM: Find overprivileged roles (Access Advisor)

```python
def find_unused_roles(days=90):
    iam = boto3.client('iam')
    roles = iam.list_roles()['Roles']
    for role in roles:
        role_name = role['RoleName']
        last_used = iam.get_role(RoleName=role_name)['Role'].get('RoleLastUsed', {})
        if 'LastUsedDate' not in last_used:
            print(f"Role {role_name} has never been used")
        else:
            from datetime import datetime, timezone
            last_used_date = last_used['LastUsedDate']
            days_unused = (datetime.now(timezone.utc) - last_used_date).days
            if days_unused > days:
                print(f"Role {role_name} unused for {days_unused} days")
```

## Azure AD: Get users via Microsoft Graph

```python
from azure.identity import DefaultAzureCredential
from msgraph.core import GraphClient

credential = DefaultAzureCredential()
client = GraphClient(credential=credential)

def get_users(top=100):
    result = client.get(f'/users?$top={top}&$select=displayName,userPrincipalName,accountEnabled')
    return result.json().get('value', [])
```

## Certificate: Validate certificate chain

```python
from cryptography import x509
from cryptography.hazmat.backends import default_backend

def validate_certificate(cert_path, ca_path):
    with open(cert_path, 'rb') as f:
        cert = x509.load_pem_x509_certificate(f.read(), default_backend())
    with open(ca_path, 'rb') as f:
        ca_cert = x509.load_pem_x509_certificate(f.read(), default_backend())
    
    print(f"Subject: {cert.subject}")
    print(f"Issuer: {cert.issuer}")
    print(f"Not Before: {cert.not_valid_before}")
    print(f"Not After: {cert.not_valid_after}")
    print(f"Serial: {cert.serial_number}")
    
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    if now < cert.not_valid_before:
        print("Certificate not yet valid")
    elif now > cert.not_valid_after:
        print("Certificate expired")
    else:
        print("Certificate is valid")
```

## JWT: Decode and validate a token

```python
import base64
import json

def decode_jwt(token):
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid JWT format")
    
    def decode_segment(segment):
        padding = 4 - len(segment) % 4
        segment += '=' * padding
        return json.loads(base64.urlsafe_b64decode(segment))
    
    header = decode_segment(parts[0])
    payload = decode_segment(parts[1])
    return header, payload

# Example usage
token = "eyJhbGciOiJSUzI1NiIs..."
header, payload = decode_jwt(token)
print(f"Algorithm: {header['alg']}")
print(f"Subject: {payload['sub']}")
print(f"Expires: {payload['exp']}")
```

## Common errors

| Error | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError` | Missing dependency | Install with `pip install <module>` |
| `SSLError` | Certificate validation failed | Check the certificate chain or use `verify=False` for testing |
| `TokenExpiredError` | JWT expired | Refresh the token |
| `ResourceNotFoundError` | Resource does not exist | Verify the resource ID |
| `AuthorizationFailed` | Insufficient permissions | Check the IAM policy or Azure AD permissions |
