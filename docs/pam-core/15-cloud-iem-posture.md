---
title: "Cloud Infrastructure Entitlement Management (CIEM)"
description: "Managing cloud permissions gaps, calculating effective multi-cloud permissions, identifying toxic privilege escalation paths, and automated least-privilege remediation."
---
<!-- verified 2026-09-17 -->

import Drawio from '@site/src/components/Drawio';
import KnowledgeCheck from '@site/src/components/KnowledgeCheck';
import diagram from '!!raw-loader!@site/static/diagrams/ciem-ispm-architecture.drawio';

# Cloud Infrastructure Entitlement Management (CIEM)

In multi-cloud environments (AWS, Azure, Google Cloud), identity is the new enterprise perimeter. However, cloud authorization models are drastically more complex than traditional on-premises Active Directory groups. Across cloud platforms, there are over 14,000 distinct API permissions, hundreds of managed role templates, and layered policy evaluation engines.

This complexity creates the **Cloud Permissions Gap**: the massive disparity between permissions granted to cloud roles and the permissions those roles actually use in production. Industry telemetry indicates that over 95% of cloud identities use less than 3% of their granted permissions, leaving standing administrative privileges that provide attackers with immediate lateral movement and privilege escalation paths.

**Cloud Infrastructure Entitlement Management (CIEM)** and **Identity Security Posture Management (ISPM)** provide the discovery, evaluation, and automated remediation machinery to close this gap.

---

## 1. Calculating Effective Cloud Permissions

A common failure in cloud security is assuming that inspecting an identity-based IAM policy reveals a role's true permissions. In reality, modern cloud providers evaluate permissions through a multi-layered intersection.

### The AWS Effective Permission Hierarchy
In AWS, an action is allowed if and only if every layer in the evaluation logic permits it:

```text
Effective Permissions = SCPs ∩ Resource Policy ∩ Permissions Boundary ∩ Identity Policy ∩ Session Policy
```

```
+----------------------------------------------------------------------------+
| 1. Explicit Deny Check (Any layer containing 'Deny' immediately halts evaluation) |
+----------------------------------------------------------------------------+
| 2. Service Control Policies (SCPs) (Maximum allowable boundary for the AWS Org/OU)|
+----------------------------------------------------------------------------+
| 3. Resource-Based Policies (e.g. S3 Bucket Policy, KMS Key Policy)         |
+----------------------------------------------------------------------------+
| 4. IAM Permissions Boundary (Maximum permissions an IAM entity can have)   |
+----------------------------------------------------------------------------+
| 5. Identity-Based Policies (Managed and Inline policies attached to role)  |
+----------------------------------------------------------------------------+
| 6. Session Policies (Passed dynamically during sts:AssumeRole)            |
+----------------------------------------------------------------------------+
```

An engineer can possess `AdministratorAccess` attached directly to their IAM role, but if an organizational SCP restricts operations to the `me-central-1` region, or if an IAM Permissions Boundary explicitly excludes `iam:*`, all attempts to create credentials or deploy outside the boundary will fail with `AccessDenied`.

---

## 2. Toxic Privilege Escalation Vectors in Cloud IAM

Attackers who compromise low-privileged cloud credentials frequently escalate to full administrative control through configuration oversights. CIEM tools continuously analyze graph topologies to detect these toxic combinations:

### Vector 1: `iam:PassRole` + `lambda:CreateFunction` / `lambda:InvokeFunction`
If a developer identity holds permission to pass an IAM role to a serverless function and create functions:
1. The developer writes a simple 5-line Python Lambda script that calls `iam:AttachUserPolicy` attaching `AdministratorAccess` to their own account.
2. The developer configures the Lambda function to execute using the high-privilege `AppProductionDeployerRole`.
3. The developer invokes the function. The code runs with the role's permissions, escalating the developer to full administrator.

### Vector 2: `iam:CreateAccessKey` on Unmonitored Service Accounts
A developer holding read access across the account holds `iam:CreateAccessKey` on a dormant, legacy service account. The developer generates an access key for that account and inherits all permissions assigned to it, completely bypassing change-management approval gates.

### Vector 3: `iam:UpdateAssumeRolePolicy`
An identity with permission to modify trust relationships on existing roles can edit an administrative role's trust document, adding their own low-privileged user ARN as a trusted principal, and subsequently call `sts:AssumeRole`.

---

## 3. CIEM Architecture & Automated Remediation

<Drawio content={diagram} />

<p className="diagram-caption">
  CIEM and Identity Posture Architecture: Ingesting activity telemetry and IAM metadata to compute effective permissions, identify escalation risks, and automate least-privilege policy updates.
  <a href="/diagrams/ciem-ispm-architecture.drawio" download>Download / edit this diagram</a>
</p>

### The Remediation Workflow:
1. **Continuous Inventory Ingestion**: The CIEM engine ingests all IAM configurations, role definitions, trust policies, and directory sync mappings across all cloud accounts.
2. **Activity Telemetry Analysis**: The engine streams real-time API logs (AWS CloudTrail, Azure Activity Logs, GCP Cloud Audit Logs) over a 90-day baseline window.
3. **Effective Permission Computation**: The engine compares *granted permissions* against *actively exercised APIs*.
4. **Least-Privilege Policy Generation**: For roles with massive unused access (e.g., granting `s3:*` when the application only executes `s3:GetObject` and `s3:PutObject` on a single bucket), the CIEM platform compiles a right-sized IAM policy.
5. **GitOps Remediation**: Rather than mutating production cloud environments directly (which risks breaking production services), the platform opens an automated Pull Request against the organization's Terraform/CloudFormation infrastructure repository.

---

<KnowledgeCheck
  question="An IAM role has the AWS-managed 'AdministratorAccess' policy attached, but when attempting to create a new DynamoDB table, the operation fails with AccessDenied. Which of the following explains this behavior?"
  options={[
    {
      id: "A",
      text: "DynamoDB tables can only be created using the root account.",
      isCorrect: false,
      explanation: "DynamoDB tables can be created by any IAM role with appropriate permissions; root accounts should never be used for day-to-day operations."
    },
    {
      id: "B",
      text: "An explicit Deny in an organizational Service Control Policy (SCP) or an attached Permissions Boundary restricts the role from creating DynamoDB resources.",
      isCorrect: true,
      explanation: "Cloud authorization evaluates effective permissions as the intersection of SCPs, boundaries, and identity policies. An explicit Deny at any layer immediately overrides an Allow in an identity-based policy."
    },
    {
      id: "C",
      text: "The role's session duration exceeded 15 minutes.",
      isCorrect: false,
      explanation: "Expired sessions return an expired token error (ExpiredTokenException), not a permission AccessDenied."
    },
    {
      id: "D",
      text: "AWS AdministratorAccess does not include DynamoDB permissions.",
      isCorrect: false,
      explanation: "AdministratorAccess includes 'Action: *', which grants full permissions to all AWS services unless bounded by another policy layer."
    }
  ]}
  takeaway="Always evaluate effective permissions across all policy layers (SCPs, Boundaries, and Resource Policies). Never rely solely on identity-based policy statements."
/>
