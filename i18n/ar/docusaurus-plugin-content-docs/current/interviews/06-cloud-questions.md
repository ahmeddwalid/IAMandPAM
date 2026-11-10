---
title: "Cloud Identity Questions"
description: "Ten cloud identity interview questions covering Entra ID, AWS IAM, workload identity, and cloud governance, with full-treatment answers."
---
<!-- verified 2026-08-19: Entra ID, AWS IAM, and IAM Identity Center terminology and feature names verified against current Microsoft and AWS documentation. -->

# Cloud Identity Questions

Cloud identity is its own dialect of IAM: the same principles, different objects and different failure modes. These ten questions cover the objects interviewers expect you to know cold (service principals, managed identities, IAM roles, permission sets) and the governance questions that separate operators from people who read documentation. The answers cross-link to the [Cloud IAM vendor page](/docs/vendors/cloud-iam), the [Microsoft stack page](/docs/vendors/microsoft-stack), and the [cloud IAM lab](/docs/labs/cloud-iam), which is where you build the hands-on version of this vocabulary.

### 1. What is the difference between on-premises Active Directory and Entra ID?

**Concise answer.** Active Directory is a directory and authentication service you run on your own servers; Entra ID is Microsoft's cloud identity platform for SaaS and cloud apps, built on a different protocol stack and accessed via an API, not a domain join.

**Detailed explanation.** On-prem AD is LDAP and Kerberos: it stores users and computers in a directory tree, uses Kerberos for domain authentication, and manages group policy and domain-joined machines. Entra ID is a cloud IdP: authentication is OIDC/SAML and OAuth, there is no LDAP endpoint, and there are no domain controllers because the tenant itself is the directory. The boundary matters more than the product names: hybrid identity is the reality in most enterprises, with AD holding on-prem identities and Entra ID federating or syncing them to the cloud. The [Microsoft stack page](/docs/vendors/microsoft-stack) covers how the two connect (Entra Connect / Cloud Sync, password hash sync, pass-through auth, and federation). The interview-ready distinction: AD is *the directory you manage*; Entra ID is *the identity plane for the cloud you manage via portal and API*.

**Why it matters.** Most enterprise roles are hybrid by default. The candidate who can explain where each protocol family lives (Kerberos/LDAP on-prem, OIDC/SAML/OAuth in the cloud) and how they connect is describing the architecture most companies are running.

**Likely follow-ups.** How do you sync on-prem identities to Entra ID? What is password hash sync and what is its risk trade-off? Can you federate AD with Entra ID without sync? What is a tenant?

### 2. What is a service principal, and how does it differ from a managed identity?

**Concise answer.** A service principal is the application's identity in the tenant, created when an app registration is consented to; a managed identity is an automatically managed Azure identity assigned to an Azure resource that can be used without storing credentials.

**Detailed explanation.** An app registration is the app's declared identity; a service principal is the instance of that identity in a tenant, with its own object, roles, and consent. Applications authenticate as the service principal with a client secret or certificate. A managed identity goes further: the platform creates and rotates the credential itself and injects it into the running resource (a VM, function, container), so the code calls the Azure Instance Metadata Service and receives a token with no secret in code or config at all. The distinction in one sentence: a service principal still has credentials to manage; a managed identity removes that burden by letting the platform own the credential lifecycle. This is the [secrets management](/docs/pam-core/secrets-management) principle applied by the platform.

**Why it matters.** The fastest way to tell a competent cloud identity engineer from a beginner is whether they reach for a service principal with a client secret or for a managed identity. Managed identity first, service principal with certificate when the workload is off-platform, client secret only as the last resort.

**Likely follow-ups.** How does the managed identity get its token? What is the Instance Metadata Service? When would you still need a service principal? What is a user-assigned vs system-assigned managed identity?

### 3. In AWS, what is the difference between an IAM user and an IAM role?

**Concise answer.** An IAM user is a persistent identity with long-lived credentials that a person or application uses to sign in; an IAM role is a set of permissions assumed temporarily, with credentials that are issued on demand and expire.

**Detailed explanation.** An IAM user has a permanent access key or password; it is the object for human sign-in and legacy programmatic access. An IAM role has no credentials of its own: a trusted principal assumes the role, and AWS issues temporary credentials (short-lived, rotated, scoped by the role's trust policy and session policy). The role is the right answer for almost everything: EC2 instances assume instance profiles, Lambda assumes roles, one account assumes roles in another account, and human users assume roles for elevation. The [cloud IAM lab](/docs/labs/cloud-iam) walks exactly this: users authenticate once to the identity center and assume roles rather than holding permanent keys. The interview answer: users are the legacy exception, roles are the pattern, and the reason is that role credentials expire and user keys do not.

**Why it matters.** Permanent access keys are the single most common cloud leak. Understanding roles is understanding why the cloud can do least privilege: temporary credentials make "scoped, short-lived, revocable" the default rather than an afterthought.

**Likely follow-ups.** What is the trust policy vs the permissions policy? How long can a role session last? What is an instance profile? Why are long-lived keys considered a finding?

### 4. What are permission sets in AWS IAM Identity Center, and why do they exist?

**Concise answer.** Permission sets are reusable bundles of AWS permissions assigned to users or groups across AWS accounts in IAM Identity Center, the successor to AWS SSO. They let you grant access to many accounts with one definition and one approval.

**Detailed explanation.** Before Identity Center, granting a user access to an account meant creating an IAM role per account or issuing keys. Permission sets change the model: you define a permission set once (say, "ReadOnly" or "PowerUser"), assign it to a group, and apply that group across the accounts in an organizational unit. When the user signs in to the portal, they get temporary credentials for each assigned account scoped to the permission set. This is JIT and role-based access at the organization scale: the [cloud IAM lab](/docs/labs/cloud-iam) demonstrates the portal, the assignment, and the short-lived credentials. Permission sets are the answer to the practical question of how an organization with dozens of accounts administers access without a permanent-key sprawl.

**Why it matters.** Identity Center is where AWS identity management is heading, and permission sets are its core abstraction. Naming them correctly and explaining the assignment model shows you know the current AWS IAM landscape, not the 2015 one.

**Likely follow-ups.** How does a user get temporary credentials from the portal? What is the difference between a permission set and an IAM role? How do you do access reviews across accounts? Can you federate Identity Center with an external IdP?

### 5. What is Conditional Access, and how does it enforce zero trust?

**Concise answer.** Conditional Access is Entra ID's policy engine: it evaluates sign-in against conditions (user, device, location, app, risk) and applies a decision (allow, block, or require more authentication) in real time.

**Detailed explanation.** A conditional access policy has three parts: who (users and groups, with exclusions for break-glass), what (the apps and actions), and the conditions (device compliance, location, sign-in risk, user risk) that gate the decision. The allowed outcomes include granting access, blocking, or requiring MFA, a compliant device, or a step-up such as a passkey. This is zero trust made operational: access is evaluated per request against signals, not granted to the network or the app. The [zero trust IAM](/docs/pam-core/zero-trust-iam) page frames the principle; conditional access is its enforcement engine. The interview point: conditional access is not MFA; it is the *decision layer* that decides when MFA (or stronger factors) is required, which is why the strongest policies combine risk signals with phishing-resistant factors from the [passwordless page](/docs/fundamentals/passwordless).

**Why it matters.** Conditional access is the primary control surface for securing Entra ID tenants, and interviewers use it to test whether you understand policy evaluation, not just product names.

**Likely follow-ups.** What happens when a policy overlaps another? What is the difference between sign-in risk and user risk? Why do you always exclude break-glass accounts from policies? What is device compliance and how does it relate?

### 6. How do you authenticate workload identity in the cloud, for example for CI/CD pipelines?

**Concise answer.** The modern pattern is workload identity federation: the pipeline obtains a short-lived token from its provider (GitHub, GitLab) and exchanges it for cloud credentials via OIDC, so no static secret is stored in the CI system.

**Detailed explanation.** The alternatives form a ladder. Worst: storing a cloud access key or service principal secret in the CI pipeline's variables. Better: a dedicated pipeline identity with scoped permissions, still a secret in the CI store. Best: OIDC federation, where the cloud provider trusts the CI provider as an issuer: the pipeline requests a token from the CI platform, presents it to the cloud's identity endpoint, and receives temporary credentials scoped by a trust policy that binds the claim (repo, environment, ref) to a role. This is the same [workload identity pattern](/docs/pam-core/secrets-management) Vault uses, with the platform doing the issuing instead. The interview point is the risk model: every stored credential is a standing secret that a CI breach extracts; federation removes the stored secret entirely and replaces it with a per-run, per-repo-bound token.

**Why it matters.** CI credential theft is a leading breach vector. Explaining the OIDC federation pattern, with the trust condition that binds repository to role, shows you understand both the cloud identity objects and why standing secrets are the thing being eliminated.

**Likely follow-ups.** How does the trust policy scope the claims? What happens if a repository is compromised? How does this compare to a service account key? What about GitHub Actions vs GitLab CI specifics?

### 7. What is the difference between identity-based and resource-based policies in AWS?

**Concise answer.** An identity-based policy is attached to an IAM identity (user, group, role) and defines what it may do; a resource-based policy is attached to a resource (S3 bucket, KMS key, SNS topic) and defines who may access it. The effective permission is the union of both.

**Detailed explanation.** An identity-based policy says "this principal can do X"; a resource-based policy says "this resource can be accessed by principal Y" and can grant access to principals in *other* accounts. The distinction creates two authorization styles: you can centralize permissions on identities (the common model) or delegate access decisions to the resource owner (the S3 bucket owner publishing to a partner account). Effective access is the union: if either policy grants the action, it is allowed, subject to the overall evaluation logic. This becomes decisive in cross-account access, where a resource-based policy is the standard way to let another account's role into your bucket without creating a role in your account.

**Why it matters.** Cloud authorization is a vocabulary of policy types, and this pairing is the most commonly confused one. Naming the two, and the union rule, demonstrates you can reason about permission evaluation rather than memorizing console steps.

**Likely follow-ups.** How does an IAM role assume access cross-account? What is a trust policy and how does it interact with a resource-based policy? Can a resource-based policy replace an identity-based one? How do you audit effective permissions?

### 8. How do you protect the cloud root account or the tenant's global admin?

**Concise answer.** You lock the account down and stop using it: no MFA exemption, no daily use, a monitored break-glass path, and separate administrative identities with scoped roles for everyday work.

**Detailed explanation.** The AWS root account and the Entra global administrator have unrestricted power by design, which makes them both a target and a liability. The standard posture is identical across clouds: enable MFA (phishing-resistant, a security key if possible), remove or revoke root access keys, never use the account for routine work, create break-glass accounts with strong passwords, MFA, and no conditional access exclusions, and monitor every use of the account with alerts. Daily administration moves to scoped roles and PIM-style elevation with approval, the pattern the [just-in-time](/docs/labs/jit-mfa) lab builds. This is [tier 0](/docs/pam-core/privileged-account-types) thinking: the account with the ultimate privilege gets the smallest attack surface, and its usage is treated as an event, not a routine.

**Why it matters.** Root and global-admin compromise is the worst-case cloud incident. The answer shows whether you treat the account as infrastructure to be governed or as a login you use, and it is the first question auditors ask.

**Likely follow-ups.** What is PIM and how does it reduce standing access? What is a break-glass process and how often is it tested? How do you detect root account use? What is the difference between eligible and active role assignments?

### 9. How do you do least privilege in the cloud when every service needs to call another?

**Concise answer.** You scope at every layer and review continuously: managed identities or roles with the minimum permissions per workload, resource-based policies where the resource knows its consumers, and automated tools that flag over-permissioned identities.

**Detailed explanation.** Least privilege in the cloud is a loop, not a setting. At design time, each workload gets a dedicated identity scoped to the services it calls (not a shared admin role), with actions limited to what the code path needs. At runtime, the [AWS IAM troubleshooting page](/docs/scenarios/troubleshooting-aws-iam) shows the denial side: when access is refused, the fix is to reason about the policy evaluation, not to widen the role. At review time, you use the cloud's own tools to surface drift: AWS Access Analyzer flags roles and buckets that expose access, IAM Access Advisor shows unused permissions, Entra's access reviews and PIM surface standing admin roles. The [IGA lab](/docs/labs/iga-campaign) models the certification loop that institutionalizes this. The interview answer: least privilege is not "give fewer permissions once"; it is "give the minimum, then prove it stays minimal through continuous monitoring and review."

**Why it matters.** Over-permissioned cloud identities are the most common finding in cloud audits. Demonstrating the loop, with the specific tools at each stage, shows operational experience rather than principle recitation.

**Likely follow-ups.** How do you find unused permissions at scale? What is Access Analyzer and what does it detect? How do you reduce a role without breaking the workload? How do access reviews work in practice?

### 10. How do you monitor identity in the cloud?

**Concise answer.** You collect the sign-in and authorization logs, watch the signals that matter, and alert on the events that indicate misuse: root use, privilege changes, impossible travel, consent grants, and key usage.

**Detailed explanation.** The log sources are the cloud's identity plane: Entra ID sign-in logs, audit logs, and provisioning logs; AWS CloudTrail for management events including IAM actions; AWS CloudWatch and GuardDuty for the runtime side. The signals that matter cluster into the patterns from the [attacks page](/docs/pam-core/attack-defense): aggregated failures (spray), off-hours success (fatigue or compromise), impossible travel (stolen tokens), privilege escalation (new role assignments), and standing-access creation (unexpected keys or app registrations). Alerting is paired with response: a suspicious sign-in triggers step-up authentication or session termination, and a root account event is a break-glass page, not an email. The honest point for interviews: monitoring is worthless without a response path, so the design answers "what happens when the alert fires" before it answers "what do we collect".

**Why it matters.** Cloud identity monitoring is the operational half of the controls this site describes. Candidates who name the specific logs and signals, and can say what happens when one fires, are describing a program; candidates who say "we use the console" are not.

**Likely follow-ups.** What is the difference between the Entra sign-in log and the audit log? How do you detect impossible travel reliably? What is a new-service-principal alert and why does it matter? How do you hunt for consent grant abuse?