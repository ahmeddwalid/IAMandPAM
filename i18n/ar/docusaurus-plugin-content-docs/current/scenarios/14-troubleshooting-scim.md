---
title: "Troubleshooting: SCIM Provisioning Failures"
description: "SCIM 2.0 provisioning failures: sync stops silently, error response format, uniqueness conflicts, and attribute mismatches."
---

<!-- verified 2026-08-18: error response schema and scimType values verified against RFC 7644 section 3.12 and multiple vendor implementations. -->

# Troubleshooting: SCIM Provisioning Failures

SCIM provisioning is the silent killer of identity programs: users who should appear in applications never do, and the sync failure is logged in a connector that nobody watches. This guide covers the failure patterns and the error format that names them, based on [RFC 7644](/docs/protocols-iga/scim).

## The error format

A SCIM service provider returns errors as JSON with the error schema, and the `scimType` field names the failure category:

```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:Error"],
  "scimType": "uniqueness",
  "detail": "A user with this userName already exists",
  "status": "409"
}
```

The common `scimType` values: `invalidSyntax` (malformed attribute data), `invalidValue` (an attribute value the provider will not accept), `uniqueness` (the value collides with an existing resource), `mutability` (the caller tried to modify a read-only attribute), `noTarget` (the referenced resource does not exist), and `tooMany` (too many results for an operation). Reading the `scimType` first narrows the diagnosis immediately.

## Pattern 1: The sync stops with no obvious error

**Symptoms.** Provisioning worked, then stopped. The connector shows no failures, the schedule runs, but users are no longer created or updated in the target application.

**Root causes.**

- **The token expired or was revoked.** SCIM endpoints authenticate with a bearer token; tokens expire or are rotated by the provider's admin, and the connector keeps running with a rejected credential. The connector may log the 401, or may log nothing depending on its error handling.
- **The endpoint URL changed.** The provider moved the SCIM base URL (new tenant, new region, provider migration) and the connector still targets the old one. The failures are 404s that look like configuration drift.
- **The connector is running against a sandbox or a stale tenant** after an environment migration.

**Resolution.** Test the endpoint manually with the stored token: a simple query for one user returns a `ListResponse` if the credential and URL are correct. A 401 means the token; a 404 means the URL; a 200 means the problem is in the data being sent, not the plumbing.

## Pattern 2: Uniqueness conflicts

**Symptoms.** Provisioning fails with `scimType: uniqueness` and HTTP 409. A new user cannot be created because the provider already holds a resource with the same `userName` or another unique attribute.

**Root causes.**

- **A duplicate identity exists in the source.** Two directory entries map to the same email or user name. The source of truth has a duplicate, and SCIM faithfully reports it.
- **A legacy account predates the integration.** The user has an account created before SCIM was connected, with the same `userName`. The provider's uniqueness rule rejects the new resource.
- **The uniqueness attribute changed.** The mapping was altered to push a different attribute as unique, colliding with existing values.

**Resolution.** Find the colliding resource in the provider (query by the unique attribute), decide which account is authoritative, and resolve the conflict: rename the legacy account or adopt it as the SCIM-managed resource. The [uniqueness and duplicate identity](/docs/fundamentals/identity-lifecycle) problem is an identity-data problem that SCIM surfaces but cannot fix. The durable fix is at the source: deduplicate in the directory, not in the connector.

## Pattern 3: Attribute mapping failures

**Symptoms.** Provisioning succeeds at the HTTP level, but the created users are wrong: missing names, empty fields, wrong departments, or users created without the attributes the application needs.

**Root causes.** The attribute mapping between the source schema and the target's SCIM schema is wrong or incomplete. Common forms:

- The mapping sends `displayName` where the target expects `givenName` and `familyName`, producing empty or odd names.
- The mapping never sends the attribute the target uses for [authorization](/docs/fundamentals/authorization) decisions, such as the group or role attribute.
- A source attribute is empty for some users (for example, a missing manager field), and the mapping fails or produces a validation error only for those users.

**Resolution.** Provision a test user whose source record is complete, inspect the resource as the provider stored it (SCIM supports GET on the resource, or the provider's admin UI shows the stored attributes), and compare against what the application consumes. Then test with a user whose record is incomplete, because the empty-attribute case only appears for a subset. The fix is in the mapping, and the [SaaS integration checklist](07-saas-sso-integration.md) has the acceptance steps.

## Pattern 4: Mutability violations

**Symptoms.** Updates fail with `scimType: mutability`. The connector tries to modify an attribute the provider defines as read-only (typically `id`, `meta`, or provider-managed fields), or the connector's user matching writes attributes that are write-only on creation.

**Root causes.** The mapping includes provider-managed attributes, or the update operation uses `PUT` with the full resource including read-only fields, where the provider's validation rejects the read-only values. The RFC distinguishes immutable, read-only, and write-only attribute mutability; the failure names which rule was violated.

**Resolution.** Remove the read-only attributes from the mapping and prefer `PATCH` operations for updates, which only send the changed attributes. The provider's `/Schemas` endpoint documents each attribute's mutability; the connector should be configured from that, not from an example payload.

## Pattern 5: Groups and membership drift

**Symptoms.** Users provision, but group memberships lag or vanish: users drop out of groups after every sync, or groups the application uses for access decisions are empty.

**Root causes.**

- **Group push is not enabled**, and the connector only syncs users. The application's local group memberships go stale as users churn.
- **Group membership is computed from a membership list the source does not maintain.** The connector pushes users, the application keeps groups local, and no sync ever reconciles them.
- **Membership reference format mismatch**: the connector sends users as references inside the group resource, and the provider expects full user resources or a different reference field.

**Resolution.** Enable group sync and verify one group end to end: create the group in the source with a known membership, watch the provisioned group in the provider, and confirm membership appears and disappears with source changes. If the application derives access decisions from groups, group sync is not optional, and a group drift finding belongs in the [access certification](05-certification-campaign.md) review as a broken control.

## Prevention

- **Watch the connector health**, not just the sync logs. A 401 from a dead token is silent until someone checks.
- **Test deprovisioning as part of every integration change.** The [termination scenario](03-termination.md) depends on it.
- **Keep the mapping in version control**, as configuration, so attribute changes are reviewed changes, not field experiments.
- **Reconcile periodically**: a quarterly full compare between the source and the provider catches the drift that incremental syncs accumulate.

## Related

- [SaaS SSO integration](07-saas-sso-integration.md), the scenario that produces SCIM configurations.
- [Onboarding](01-onboarding.md) and [Termination](03-termination.md), the processes SCIM failures silently break.