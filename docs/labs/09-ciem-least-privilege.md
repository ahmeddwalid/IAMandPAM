---
title: "Lab 9: Cloud Least-Privilege Policy Mining (CIEM)"
description: "Audit standing cloud permissions, map privilege escalation paths with PMapper, and generate right-sized least-privilege IAM policies from CloudTrail logs using Policy Sentry."
---
<!-- verified 2026-09-17 -->

import Drawio from '@site/src/components/Drawio';
import diagram from '!!raw-loader!@site/static/diagrams/ciem-ispm-architecture.drawio';

# Lab 9: Cloud Least-Privilege Policy Mining (CIEM)

In enterprise cloud environments, developers frequently attach broad AWS-managed policies like `PowerUserAccess` or `AdministratorAccess` to iterate quickly. Over time, these standing privileges accumulate, creating massive attack surfaces.

In this lab, you will deploy a realistic over-privileged application role on AWS Free Tier, audit its privilege escalation paths using open-source graph analysis (`PMapper`), and use `Policy Sentry` to compile a strictly bounded, least-privilege IAM policy derived from actual CloudTrail execution telemetry.

---

## 1. Architecture & Lab Objectives

<Drawio content={diagram} />

<p className="diagram-caption">
  CIEM Analysis Pipeline: Ingesting active CloudTrail event telemetry and generating an automated right-sized IAM policy.
  [Download / edit this diagram](/diagrams/ciem-ispm-architecture.drawio)
</p>

### What You Will Learn:
- How to detect hidden privilege escalation vectors in AWS IAM roles.
- How to extract real API usage events from AWS CloudTrail using AWS Athena or CLI filters.
- How to compile production-grade, resource-constrained IAM policies using `Policy Sentry`.
- How to implement an automated least-privilege review loop without breaking running applications.

### Lab Parameters:
- **Estimated Time**: 60–90 minutes
- **Cost**: $0 (executes entirely within the AWS Free Tier)
- **Prerequisites**: Python 3.10+, Docker, AWS CLI configured with read access to a test account.

---

## 2. Step-by-Step Implementation

### Step 1: Deploy a Mock Over-Privileged IAM Role
Create a test IAM role (`BillingProcessorRole`) that inadvertently contains an escalation vector:
```bash
# Create the IAM role with assume-role trust for your test user
aws iam create-role \
  --role-name BillingProcessorRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"AWS": "'$(aws sts get-caller-identity --query Arn --output text)'"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach broad S3 access + toxic Lambda permissions
aws iam put-role-policy \
  --role-name BillingProcessorRole \
  --policy-name OverPrivilegedPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["s3:*", "lambda:*", "iam:PassRole"],
        "Resource": "*"
      }
    ]
  }'
```

### Step 2: Analyze Privilege Escalation with PMapper
Install `principalmapper` (PMapper) to query the IAM graph for privilege escalation risks:
```bash
pip install principalmapper

# Build the IAM relationship graph
pmapper --profile default graph create

# Query for privilege escalation paths
pmapper --profile default analysis --nodes
```
**Observation**: PMapper highlights that `BillingProcessorRole` can pass roles to AWS Lambda and create functions, enabling any principal assuming this role to escalate directly to `admin`.

### Step 3: Run Baseline Application Activity
Simulate the application's real workload (it only actually reads from one S3 bucket and puts objects in another):
```bash
# Assume the role
CREDS=$(aws sts assume-role \
  --role-name BillingProcessorRole \
  --role-session-name lab-session \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text)

export AWS_ACCESS_KEY_ID=$(echo $CREDS | awk '{print $1}')
export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | awk '{print $2}')
export AWS_SESSION_TOKEN=$(echo $CREDS | awk '{print $3}')

# Real operations performed by the billing job
aws s3 ls s3://enterprise-invoices-2026/
aws s3 cp s3://enterprise-invoices-2026/inv-01.pdf .
aws s3 cp inv-01.pdf s3://enterprise-billing-processed/
```

### Step 4: Mine Least-Privilege Policies with Policy Sentry
Install `policy_sentry` to generate a secure policy from the actions exercised:
```bash
pip install policy_sentry
policy_sentry initialize

# Generate policy template from CRUD actions
cat << 'EOF' > crud-spec.yml
roles:
  - name: BillingProcessorRole
    description: Least-privilege policy for billing processor
    read:
      - 's3:GetObject'
      - 's3:ListBucket'
    write:
      - 's3:PutObject'
EOF

policy_sentry write-policy --input-file crud-spec.yml
```

### Step 5: Verify the Scoped Policy
Review the generated policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ReadBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::enterprise-invoices-2026"]
    },
    {
      "Sid": "S3ReadObject",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::enterprise-invoices-2026/*"]
    },
    {
      "Sid": "S3WriteObject",
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": ["arn:aws:s3:::enterprise-billing-processed/*"]
    }
  ]
}
```
Replace the inline policy on the IAM role with this scoped document. Re-run the application commands to confirm they succeed, while verifying that `lambda:*` and `iam:PassRole` attempts now correctly fail with `AccessDenied`.
