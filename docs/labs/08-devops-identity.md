---
title: "Lab 8 - DevOps and CI-CD Identity"
description: "Workload identity federation, OIDC for GitHub Actions, and the pattern of giving pipelines access to cloud resources without long-lived credentials."
---

# Lab 8 - DevOps and CI-CD Identity

## What this lab proves

CI-CD pipelines need cloud access, and the traditional answer (long-lived access keys in pipeline variables) is the highest-risk credential in the organization. Every pipeline that can deploy to production is a production-impacting identity. This lab builds the alternative: workload identity federation, where the pipeline authenticates to the cloud provider using a short-lived token exchanged for a cloud credential, scoped to the specific repository, branch, and environment.

## The problem

The traditional pattern for CI-CD cloud access:

1. Create an IAM user in AWS (or a service principal in Azure, or a service account in GCP).
2. Generate a long-lived access key.
3. Store the key in the CI-CD system's secret store (GitHub Actions secrets, GitLab CI variables, Jenkins credentials).
4. The pipeline reads the key and uses it to authenticate to the cloud.

The problems:

- **Long-lived credentials.** The key is valid until someone rotates it. If it is stolen, it is valid until someone notices and rotates it.
- **Broad scope.** The key is usually scoped to the IAM user, not to the specific pipeline. If the key is stolen, the attacker has the same access as the pipeline: full deployment rights.
- **No audit trail.** The cloud provider sees the IAM user, not the pipeline, the repository, or the commit. The audit trail is "IAM user X deployed to production" not "pipeline Y from repository Z deployed commit ABC to production."
- **Rotation burden.** Keys must be rotated regularly. The rotation process is manual, error-prone, and often delayed because rotating a key can break every pipeline that uses it.

## The solution: workload identity federation

Workload identity federation reverses the trust. Instead of the pipeline holding a long-lived cloud credential, the pipeline holds a short-lived token from its own identity provider (GitHub Actions, GitLab, Jenkins), and the cloud provider exchanges that token for a short-lived cloud credential.

The flow:

1. The pipeline requests a token from its identity provider. The token is scoped to the repository, the branch, the workflow, and the environment.
2. The pipeline presents the token to the cloud provider's token exchange endpoint.
3. The cloud provider validates the token against the configured trust (the token must come from the expected repository, the expected branch, the expected environment).
4. The cloud provider issues a short-lived cloud credential (an AWS session token, an Azure managed identity token, a GCP service account access token).
5. The pipeline uses the cloud credential to perform the deployment.
6. The cloud credential expires automatically (typically 1 hour).

The key properties:

- **No long-lived credentials.** The cloud credential is short-lived and automatically expires. There is nothing to rotate, nothing to store, nothing to leak.
- **Scoped trust.** The trust is scoped to the specific repository, branch, and environment. A PR from a forked repo cannot assume the role because its token does not match the trust policy.
- **Audit trail.** The cloud provider sees the assumed role session, which is tagged with the repository, the workflow, the commit, and the actor. The audit trail is "pipeline Y from repository Z deployed commit ABC to production as user alice."

## Architecture

import Drawio from '@site/src/components/Drawio';
import devopsFlow from '!!raw-loader!@site/static/diagrams/devops-identity-flow.drawio';

<Drawio content={devopsFlow} />

<a href="/diagrams/devops-identity-flow.drawio" download>Download / edit this diagram</a>

The federation flow: the GitHub Actions runner requests a token from GitHub's OIDC provider, presents it to the cloud provider's OIDC trust provider, assumes an IAM role scoped to the repository and branch, and receives a short-lived cloud credential. The local developer laptop has no path to the cloud resources.

## Prerequisites

- A GitHub repository (the lab uses a private repository; the OIDC trust is scoped to the repository).
- An AWS account with permissions to create IAM OIDC providers and IAM roles.
- The AWS CLI installed locally for verification.

## Step 1 - Create the OIDC trust provider in AWS

1. Open the AWS IAM console.
2. Under **Identity providers**, click **Add provider**.
3. Choose **OpenID Connect**.
4. Provider URL: `https://token.actions.githubusercontent.com`.
5. Audience: `sts.amazonaws.com`.
6. Click **Get thumbprints** to fetch the certificate fingerprint, then **Add provider**.

The trust provider tells AWS to trust tokens issued by GitHub's OIDC provider.

## Step 2 - Create the IAM role with a scoped trust policy

1. Create a new IAM role. The trusted entity is the OIDC provider you just created.
2. The trust policy must scope the role to the specific repository and branch:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:your-org/your-repo:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

The `sub` condition is the critical control. It restricts the role to tokens issued for the `main` branch of `your-org/your-repo`. A PR from a forked repo has a different `sub` claim (`repo:fork-owner/your-repo:pull_request`) and cannot assume the role.

3. Attach a minimal policy to the role. For the lab, `AmazonS3ReadOnlyAccess` is enough to prove the federation works.

## Step 3 - Configure the GitHub Actions workflow

In the repository, create `.github/workflows/federation-test.yml`:

```yaml
name: Federation Test

permissions:
  id-token: write   # required to request the OIDC token
  contents: read    # required to checkout the code

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<account-id>:role/your-federation-role
          aws-region: us-east-1

      - name: Verify identity
        run: |
          aws sts get-caller-identity
          aws s3 ls
```

The `configure-aws-credentials` action handles the token exchange: it requests a token from GitHub's OIDC provider, presents it to AWS, assumes the role, and sets the environment variables that the AWS CLI uses.

## Step 4 - Push and verify

1. Commit and push the workflow to the `main` branch.
2. The workflow triggers automatically.
3. Check the workflow logs. The `get-caller-identity` step shows the assumed role ARN, not an IAM user. The `s3 ls` step lists the S3 buckets (read-only proof).
4. In AWS CloudTrail, find the `AssumeRoleWithWebIdentity` event. The event shows the `principalArn` (the GitHub repository), the `subjectFromWebIdentityToken` (the `sub` claim), and the source IP (GitHub's runner IP).

## Step 5 - Verify the scope restriction

1. Create a branch `test-fork` and push a change to the workflow that tries to assume the role.
2. The workflow fails with an error: `NotAuthorized to perform sts:AssumeRoleWithWebIdentity`. The `sub` claim does not match the trust policy.
3. This proves the scope restriction: only the `main` branch of the configured repository can assume the role.

## Verification checklist

- [ ] The OIDC trust provider is created in AWS with the correct URL and audience.
- [ ] The IAM role trust policy scopes the `sub` claim to the repository and branch.
- [ ] The workflow requests the OIDC token and assumes the role.
- [ ] The `get-caller-identity` step shows the assumed role ARN.
- [ ] CloudTrail shows the `AssumeRoleWithWebIdentity` event with the repository and subject.
- [ ] A push to a non-main branch fails to assume the role.

## Common pitfalls

- **The `id-token: write` permission is missing.** Without it, the workflow cannot request the OIDC token. The `configure-aws-credentials` action fails with a permissions error.
- **The `sub` claim condition is too broad.** `repo:your-org/your-repo:*` allows any branch and any event. Use `repo:your-org/your-repo:ref:refs/heads/main` for the main branch only, or `repo:your-org/your-repo:environment:production` for the production environment.
- **The IAM role trust policy uses `StringEquals` instead of `StringLike`.** The `sub` claim contains colons and slashes. `StringLike` with wildcards is more flexible; `StringEquals` requires an exact match.
- **The `configure-aws-credentials` action version is outdated.** Use v4 or later. Earlier versions do not support all the configuration options.

## What you learned

Workload identity federation eliminates long-lived credentials from CI-CD pipelines. The trust is scoped to the repository, branch, and environment. The cloud credential is short-lived and automatically expires. The audit trail shows the pipeline, the commit, and the actor, not just an IAM user. And the scope restriction is enforced by the cloud provider's trust policy, not by the pipeline configuration.

This pattern applies to every cloud provider: AWS (OIDC federation), Azure (workload identity federation), GCP (workload identity federation). The mechanism is the same; only the configuration details differ.

Next: [Secrets Management with Vault](07-secrets-vault.md), because the federation pattern gets the pipeline into the cloud, and the secrets management pattern keeps the pipeline's access to secrets under control.
