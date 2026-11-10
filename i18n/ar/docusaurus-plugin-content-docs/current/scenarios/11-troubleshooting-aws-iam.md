---
title: "Troubleshooting: AWS IAM Policy Misconfigurations"
description: "AWS IAM failures: access denied diagnostics, malformed policies, assume-role chains, and the denial hierarchy."
---

# Troubleshooting: AWS IAM Policy Misconfigurations

AWS IAM failures follow a strict hierarchy of denials, and the error messages are unusually informative once the hierarchy is understood. This guide covers the failure patterns that produce most IAM tickets: access denied, malformed policies, and broken assume-role chains. The concepts map to the [authorization models](/docs/fundamentals/authorization) covered in the fundamentals.

## Pattern 1: Access denied on an action the user should have

**Symptoms.** The user or role receives an access denied error with the full AWS format, which names the principal, the action, and the resource:

```
AccessDenied: User: arn:aws:iam::123456789012:user/alice is not authorized to
perform: s3:PutObject on resource: arn:aws:s3:::archive/uploads/report.pdf
because no identity-based policy allows the s3:PutObject action
```

**Root causes, in order of likelihood.**

- **No policy allows the action.** The identity-based policy simply does not include it. The error text states this directly when no policy matches.
- **An explicit deny.** A policy (identity-based, resource-based, or [service control policy](/docs/vendors/cloud-iam)) explicitly denies the action. Explicit denies override allows, and the error text says "explicitly denied" in the message when this is the case.
- **A permission boundary.** The principal's permission boundary caps the effective permissions; the allowed action exists but exceeds the boundary.
- **An implicit deny from a session policy.** For assumed roles, the session policy constrains the role's permissions further.

**Resolution.** Check in this order: does any policy allow the action (use the IAM policy simulator or the access analyzer), is there an explicit deny anywhere in the policy chain (identity policy, resource policy, SCP, boundary), and does the session carry a session policy. The error message plus the policy simulator will name the missing piece in minutes. For SCPs, remember they apply at the organizational level: the account's own policies may be correct while the organization's SCP denies.

## Pattern 2: Malformed policy document

**Symptoms.** The policy fails to save or apply with an error naming the document, for example:

```
MalformedPolicyDocument: Policy document had invalid JSON
```

or a message naming the specific invalid element, such as a bad ARN in a resource field or a typo in an action name.

**Root causes.** JSON syntax errors, invalid ARN formats (typo in the service namespace, missing region or account for resource ARNs), action names that do not exist (a typo in `s3:PutObject`), and condition keys that are not valid for the action.

**Resolution.** Validate the JSON before saving (most IAM consoles flag invalid JSON inline). Check the ARN structure against the AWS service's documented ARN format; the resource ARN is the most common error, particularly for services with nested ARN structures like `arn:aws:sns:region:account:topic-name`. Confirm action names against the service's API reference; the error message typically names the offending element, and a quick check of the exact spelling resolves it. For conditions, confirm the condition key is documented for the action being modified.

## Pattern 3: Assume-role chain failures

**Symptoms.** The application or user cannot assume a role, with an error such as:

```
is not authorized to perform: sts:AssumeRole on resource:
arn:aws:iam::123456789012:role/prod-operator
```

**Root causes.**

- **The trust policy on the target role does not allow the principal** to assume it. The trust policy is evaluated separately from the caller's identity policy: the caller needs `sts:AssumeRole` permission, and the role's trust policy must list the caller.
- **The caller lacks `sts:AssumeRole` in their identity policy.**
- **The session duration exceeds the role's maximum**, which fails with a separate error naming the session duration; the standard maximum is 12 hours.
- **External ID or MFA requirements** in the trust policy conditions are not met.

**Resolution.** Check both halves of the contract: the caller's identity policy for the `sts:AssumeRole` permission, and the target role's trust policy for the caller's principal (the account ARN, role ARN, or the conditions such as ExternalId). The error message names the role and the action; the missing half is whichever policy does not reference the other side. Then confirm the requested session duration is within the role's limit.

## Pattern 4: "The role can be assumed but the resources fail"

**Symptoms.** The assumed role succeeds, but downstream API calls from the role fail with access denied.

**Root causes.** This is the session policy trap: the role was assumed with a session policy (via the API or the console session wizard), and the session policy restricts the role's own permissions. The role's policy allows the action; the session policy removes it. The error message names the action and resource, and the diagnosis is comparing the role policy against the session policy.

**Resolution.** Compare the role's identity policy with the session policy that was used. Remove or widen the session policy if the restriction was unintended. For applications, check whether the SDK assumes the role with a session policy embedded in the code.

## Prevention

- **Use the policy simulator as part of change review**, not as a debugging tool after the ticket. Simulate the proposed policy against the principal and the critical actions before deployment.
- **Prefer allow-list policies over deny patches.** A policy history full of deny overrides is a sign that the allow lists are wrong and the denials are fighting the design.
- **Treat the error message as documentation.** AWS access denied messages name the principal, action, and resource. Log them, index them, and alert on unexpected denial spikes: a role that suddenly cannot perform an action it used to perform is either a policy change or a compromise signal.

## Related

- [Cloud IAM](/docs/vendors/cloud-iam) for the AWS model in context.
- [SAML assertion errors](12-troubleshooting-saml.md) for federated access failures, which surface before any IAM policy is evaluated.