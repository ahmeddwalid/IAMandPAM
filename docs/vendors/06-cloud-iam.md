---
title: "Cloud IAM"
description: "AWS IAM and IAM Identity Center, Google Cloud IAM, and Azure RBAC with managed identities: the native identity model of each hyperscaler."
---
<!-- verified 2026-08-18: product names, permission models, and workload identity mechanisms verified against AWS, Google Cloud, and Microsoft documentation. -->

# Cloud IAM

Each hyperscaler ships its own native identity and access management. The models differ in policy language, hierarchy, and terminology, but they solve the same problem: who can do what on which resource. This is the most accessible slice of IAM to learn hands-on, because every cloud has a free tier and no enterprise license is needed ([hands-on labs](/docs/labs/) builds on exactly this).

## The federation-first pattern

The first rule of cloud IAM in an enterprise: the cloud is not the identity authority for people. A workforce IdP (Entra ID, Okta, or similar) authenticates users, and each cloud's native IAM consumes that identity through SAML or OIDC federation. The cloud's IAM is the enforcement point; the IdP is the authority.

| Cloud | Enforcement point | How federated identity arrives |
|---|---|---|
| AWS | IAM Identity Center (formerly AWS SSO) | SAML from the IdP; permission sets scoped to accounts and regions |
| Azure | Entra ID RBAC | Entra ID is the IdP itself, or federated through B2B collaboration |
| Google Cloud | Cloud Identity / Workforce Identity Federation | OIDC into workforce pools; role bindings scoped to projects |

The same pattern extends to machines. Long-lived access keys are the anti-pattern; each cloud's workload identity mechanism issues short-lived credentials instead:

- **AWS**: IAM roles assumed through OIDC federation (used by EKS, GitHub Actions, and others) or IAM Roles Anywhere.
- **Azure**: managed identities, system-assigned or user-assigned, issued to the workload automatically.
- **Google Cloud**: workload identity federation, mapping a Kubernetes service account or external identity to a Google Cloud service account.

## AWS

**Identity**: IAM users and groups are the legacy model for people; IAM roles are the mechanism for machines and cross-account access. IAM Identity Center is the current model for workforce users: the IdP federates in, and permission sets define what a user or group can do in each account.

**Policy model**: JSON policies, both identity-based (attached to users, groups, roles) and resource-based (attached to the resource, defining who may access it). Both are evaluated together. Explicit deny always wins. Permission boundaries and service control policies (SCPs at the organization level) add extra layers of restriction.

**Hierarchy**: Organizations, then organizational units, then accounts. SCPs apply down the tree; policies at an account cannot grant more than the SCP allows.

**Temporary credentials**: Security Token Service (STS) `AssumeRole` issues credentials with a configurable lifetime, up to 12 hours. This is the mechanism behind most cross-account and workload access.

**Audit and hygiene**: CloudTrail records API activity; IAM Access Analyzer identifies policies that grant access outside the intended boundary; IAM last accessed information supports entitlement reviews.

## Google Cloud

**Identity**: Cloud Identity (or Google Workspace) holds the workforce directory; workforce identity federation extends it to external IdPs. Service accounts are the machine identity, and they are resources: they have an IAM policy of their own, which is a distinctive design compared with AWS roles.

**Policy model**: allow-only policies bound to the resource hierarchy (organization, folder, project, resource), inherited downward. A role granted at the organization level applies everywhere below. Google Cloud has introduced deny policies, but the primary model remains allow-based inheritance.

**Workload identity**: GKE workloads map a Kubernetes service account to a Google Cloud service account through workload identity federation, so the workload authenticates without stored keys. External workloads federate through identity pools that trust OIDC providers.

**Audit and hygiene**: Cloud Audit Logs record activity; the IAM Recommender flags unused permissions and suggests tightened roles; IAM deny policies support explicit exclusions.

## Azure and Entra ID

**Identity**: Entra ID is both the directory and the RBAC identity provider. Security principals (users, groups, service principals, managed identities) receive role assignments at a scope.

**Policy model**: Azure RBAC with built-in and custom roles (more than 300 built-in roles). Scope hierarchy runs management group, subscription, resource group, resource. Assignments inherit downward and can be overridden by a more specific assignment.

**Workload identity**: managed identities are issued automatically to Azure workloads (App Service, Functions, AKS, VMs) with no stored secrets. Workload identity federation extends the pattern to external workloads.

**Audit and hygiene**: activity logs and sign-in logs feed the Entra ID reporting and the [Conditional Access](/docs/vendors/microsoft-stack) risk engine; Azure Advisor surfaces permission hygiene recommendations.

## A concept map across the three clouds

| Concept | AWS | Azure | Google Cloud |
|---|---|---|---|
| Directory | IAM Identity Center | Entra ID | Cloud Identity |
| Permission model | JSON policies (identity + resource based) | RBAC role assignments | Allow policies on hierarchy |
| Permission boundary | Account / OU (SCPs) | Subscription / resource group | Project / folder |
| Service identity | IAM roles | Managed identities | Service accounts |
| Workload federation | OIDC roles, Roles Anywhere | Workload identity federation | Workload identity pools |
| Temporary credentials | STS AssumeRole (up to 12 h) | Configurable token lifetime | Access tokens (1 h default) |
| Audit log | CloudTrail | Activity and sign-in logs | Cloud Audit Logs |

The practical takeaway for interviews: the pattern is the same everywhere, the vocabulary is not. "Read-only" is `ReadOnlyAccess` in AWS, `Reader` in Azure, `Viewer` in GCP.

## The four anti-patterns

These come up in audits and in interviews, and all four are solved by the federation-first pattern:

1. **Per-cloud identity silos**: separate user pools in each cloud, so lifecycle events never propagate and MFA is inconsistent. Fix: one IdP, clouds as consumers.
2. **Root-account sprawl**: an AWS root user, Azure Global Administrator, or GCP super admin per account or subscription. Every one is an ungoverned break-glass surface. Fix: root only where architecturally required, documented and monitored, everything else federated. Each cloud documents its own break-glass account pattern (for example, cloud-only Entra accounts excluded from Conditional Access).
3. **Long-lived credentials**: access keys in config files and repositories. Fix: workload identity federation, short-lived credentials as the default.
4. **Cross-cloud entitlement drift**: equivalent permissions named differently in each cloud, so certification campaigns cannot reason across the estate. Fix: semantic access model at the IdP layer, cloud roles as the enforcement mapping.

The governance tools page covers how certification campaigns ([IGA](/docs/protocols-iga/iga)) run over a cloud estate once it is federated.

Next: [Governance tools](07-governance-tools.md), SailPoint, Okta Identity Governance, and Saviynt.