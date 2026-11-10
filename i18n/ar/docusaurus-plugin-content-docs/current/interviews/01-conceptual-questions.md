---
title: "Wave 1: Conceptual Questions"
description: "Fifteen IAM conceptual interview questions with full-treatment answers."
---

# Wave 1: Conceptual Questions

The fifteen questions in this wave are the ones that appear in nearly every identity interview, in some form. They test whether you understand what the discipline is for, not whether you can name products.

### 1. What is the difference between IAM and PAM?

**Concise answer.** IAM manages the identities of everyone and their access to everything, with the principle that people get the access their role needs. PAM manages the highest-risk subset: privileged accounts, shared accounts, and admin rights, where the controls are stricter because the blast radius is larger.

**Detailed explanation.** IAM answers "who can access what": identities in the directory, authentication, authorization, and lifecycle. PAM answers a harder question about the same objects: the accounts that can change the rules, the shared accounts nobody owns, and the sessions where someone operates with admin rights. PAM adds controls IAM does not normally have: credentials stored in a vault so people never know the password, sessions recorded, passwords rotated automatically, and access granted temporarily instead of permanently. The boundary is the [capability test](/docs/pam-core/what-is-pam): if losing control of the account means losing control of the system, it is a privileged account and it belongs under PAM treatment.

**Why it matters.** Organizations that run IAM without PAM leave their administrators standing on a platform with no lock: everyone's access is managed, except the access that can change the management. Interviewers ask this first to see whether you think in terms of systems and risk or product categories.

**Likely follow-ups.** Where exactly do you draw the line between a normal account and a privileged one? Would a service account be IAM or PAM? Can you run PAM without IAM?

### 2. What are the three A's of identity security?

**Concise answer.** Authentication (proving who you are), authorization (deciding what you can do), and accounting (recording what you did).

**Detailed explanation.** Authentication establishes identity through factors: what you know, what you have, what you are. Authorization is the policy layer: given who you are, which actions on which resources are allowed, enforced through roles or attributes. Accounting is the audit layer: the logs that record who authenticated, what they were authorized for, and what they actually did. The three fail differently: authentication failure locks people out, authorization failure blocks work, accounting failure removes the evidence trail that makes the other two enforceable. The order is a pipeline: a user cannot be authorized before they are authenticated, and the accounting records are the output of both. [The model](/docs/fundamentals/aaa-model) applies at every layer, from the login page to the database.

**Why it matters.** Every control you will discuss, from MFA to access reviews, is a control on one of the three A's. Being able to name which A a control strengthens is the fastest way to show structured thinking.

**Likely follow-ups.** Which of the three is most often neglected in practice? How does accounting differ from monitoring? Where does MFA fit in the model?

### 3. What is the difference between authentication and authorization?

**Concise answer.** Authentication answers "who are you?". Authorization answers "what are you allowed to do?". Authentication comes first, authorization is evaluated against policies after identity is established.

**Detailed explanation.** Authentication establishes identity claims: the password verified, the device registered, the session established. Authorization then evaluates those claims against policy: the user has the role, the role has the permission, the permission allows the action on the resource. The two are enforced by different components and fail in different ways. A common failure is conflating them: an application that treats "logged in" as "allowed to do everything" is an authorization failure. Another is scope: a system can authenticate a user and then authorize at the API layer with no relationship between the two, which is how the [OAuth](/docs/protocols-iga/oauth2) and [OIDC](/docs/protocols-iga/oidc) separation came to exist. The [AAA model](/docs/fundamentals/aaa-model) keeps the layers distinct.

**Why it matters.** Interviewers ask this to see whether you can separate identity from access. Most real security incidents are authorization failures: the identity was valid, the access was not. Explaining the layers clearly signals you debug by layer, not by guess.

**Likely follow-ups.** Give an example of a system that authenticates correctly but authorizes incorrectly. Where does MFA sit? Where does a role sit?

### 4. What are the MFA factor types, and why is SMS considered weak?

**Concise answer.** The three factor types are something you know (password, PIN), something you have (phone, hardware key), and something you are (biometric). MFA combines two or more. SMS is weak because the second factor travels over a channel the attacker can intercept or redirect through SIM swapping.

**Detailed explanation.** The factors are independent categories, and the strength of MFA depends on the strength of the weakest factor. SMS one-time codes are technically "something you have" but the delivery channel is the phone number, which is not a secure device: SIM swap attacks let an attacker receive the codes, and SS7 interception affects the same channel. [Authenticator apps](/docs/fundamentals/authentication) generate codes on the device itself, which raises the bar to device compromise. Hardware keys implement possession more directly and resist phishing because the credential is bound to the origin. The strongest modern answer is passkeys: possession plus biometric, bound to the origin, so a phishing site cannot relay the credential. The ranking is honest: hardware keys and passkeys above authenticator apps, authenticator apps above SMS, SMS above no second factor.

**Why it matters.** MFA questions test whether you understand the difference between "enforcing MFA" and "enforcing strong MFA". Organizations commonly check the compliance box with SMS and remain phishable at the second factor.

**Likely follow-ups.** What is phishing-resistant MFA? How does a passkey prevent a relay attack? When is SMS acceptable?

### 5. How does SSO work, and what are its security trade-offs?

**Concise answer.** SSO centralizes authentication: the user authenticates once to the identity provider, and the IdP establishes sessions or assertions that applications accept, so the user does not authenticate per application.

**Detailed explanation.** The user authenticates to the [identity provider](/docs/protocols-iga/saml), and the IdP issues a token or assertion that proves the authentication to each application. The application validates the token and accepts the session. The trade-off is concentration: the IdP becomes a single point of failure for login and a single target for attackers, so the IdP needs the strongest controls in the estate: MFA, monitoring, and session revocation. The benefit is that authentication happens once with strong controls instead of many times with weak ones, and users stop reusing passwords across applications, which is the actual security win. The risk is that one IdP compromise or one leaked session token spans every connected application. [OIDC](/docs/protocols-iga/oidc) and SAML are the mechanisms; SSO is the outcome.

**Why it matters.** SSO is the most common enterprise authentication architecture, and the trade-off answer distinguishes a candidate who has operated it from one who has read about it.

**Likely follow-ups.** What happens to active sessions when the IdP is down? How do you revoke an SSO session? What is the difference between SSO and federation?

### 6. What is the difference between RBAC and ABAC, and when do you use each?

**Concise answer.** RBAC grants access through roles the user holds. ABAC grants access through evaluating attributes of the user, the resource, and the context. RBAC is simpler and good for stable structures; ABAC is finer-grained and good for dynamic conditions.

**Detailed explanation.** RBAC models the organization: job functions map to roles, roles carry permissions, users get roles. It is easy to understand, audit, and delegate, which is why it dominates. ABAC evaluates policy against attributes: the user's department, the resource's classification, the time of day, the device. It expresses conditions RBAC cannot, like "engineers on the on-call rotation can read production logs between 6 PM and 8 AM". The cost is complexity: attributes must be maintained and policy evaluation must be consistent. The practical pattern is [RBAC for the base and ABAC for the edges](/docs/fundamentals/authorization): roles for the standard grants, attribute conditions for the exceptions, with policy-based access control as the externalized version that policy teams write without code changes.

**Why it matters.** Most organizations run RBAC poorly and blame the model. Knowing that ABAC solves attribute conditions, not broken role design, prevents recommending the wrong tool.

**Likely follow-ups.** How do you audit ABAC policies? When does attribute drift break ABAC? How does SoD interact with roles?

### 7. What is least privilege, and why is it a design principle rather than a setting?

**Concise answer.** Least privilege means every identity has exactly the access its tasks require, nothing more. It is a design principle because it has to be engineered into role templates, provisioning, and review cycles; no configuration toggle produces it.

**Detailed explanation.** Least privilege requires answering, for every role, what access the role needs to function, and then building the role template that grants exactly that. The principle has two halves: the grant side (new access is added deliberately, never by default) and the removal side (access expires or is reviewed, never accumulates). [The principle](/docs/fundamentals/least-privilege-zero-trust) fails in practice through accumulation: movers keep old access, requests are granted and never revoked, and standing admin rights survive audits. The controls are structural: role-based grants instead of individual ones, JIT access for privileged operations, and certification campaigns that revoke by default. Least privilege is the design target that the whole IAM program serves.

**Why it matters.** Almost every breach narrative includes "an account with too much access". The interviewer wants to hear that you design for it rather than ask for it as a policy.

**Likely follow-ups.** How do you decide what a role needs? What do you do with a shared account? How does least privilege interact with break-glass accounts?

### 8. What is identity lifecycle management?

**Concise answer.** Identity lifecycle management is the process that creates, changes, and removes identities and their access as people join, move, and leave the organization.

**Detailed explanation.** The lifecycle is [joiner, mover, leaver](/docs/fundamentals/identity-lifecycle): HR events trigger identity creation and provisioning, role changes trigger access changes, and terminations trigger deprovisioning. The discipline is that every phase has a trigger, an owner, and a completion check. The phases fail asymmetrically: joiner failures are visible immediately (someone cannot work), leaver failures are invisible until they become incidents (someone retains access after leaving). The process quality is measured by deprovisioning: how long between the HR event and the account being unusable. Modern programs treat the lifecycle as automation: the HR system is the source of truth, provisioning is SCIM-driven, and certification is the periodic reconciliation that catches what automation missed.

**Why it matters.** Lifecycle questions test operational maturity. Candidates who describe the process in terms of tickets and help desk requests are describing a reactive shop; the lifecycle is designed to be the automation that makes tickets rare.

**Likely follow-ups.** What happens to the account when someone moves teams? How long should deprovisioning take? What about contractors?

### 9. What is identity federation?

**Concise answer.** Federation is an agreement between two organizations or domains to trust identities issued by each other: one side authenticates, the other accepts the assertion.

**Detailed explanation.** In federation, the identity provider authenticates the user and issues an assertion about them; the service provider trusts that assertion without authenticating the user again. The trust is established by configuration: metadata exchange, certificates, and audience agreements. [SAML](/docs/protocols-iga/saml) and OIDC are the mechanisms; federation is the relationship. The practical cases: a company federating with a customer's IdP, a cloud SaaS federating with the company IdP, a subsidiary federating with the parent. The trust boundary question is the core: what does the receiving side rely on the sending side to have verified, and what does it verify itself? The [SaaS integration scenario](/docs/scenarios/saas-sso-integration) walks the operational version.

**Why it matters.** Federation questions separate "SSO within one company" from the multi-organization reality of enterprise identity. The interviewer wants to hear the trust model, not just the protocol.

**Likely follow-ups.** How do you establish trust between two IdPs? What happens when the federated partner's certificate expires? What is a trust policy in AWS terms?

### 10. What is zero trust, and what role does identity play in it?

**Concise answer.** Zero trust is a security model where no entity is trusted by default: every access request is authenticated, authorized, and evaluated in context, regardless of where the request comes from. Identity is the enforcement point: the model decides access based on who is asking, in what context, to what.

**Detailed explanation.** The traditional model trusted the network perimeter: inside was trusted, outside was not. Zero trust inverts it: [position](/docs/pam-core/zero-trust-iam) is not trust, and every request is verified against policy: the identity, the device state, the location, the sensitivity of the resource. Identity systems are the machinery: the IdP evaluates the context, the policy engine makes the decision, and JIT access replaces standing entitlements. The model makes identity the security boundary, which is why identity hygiene (MFA, least privilege, lifecycle) is a prerequisite rather than an add-on: the model is only as strong as the identity data it evaluates. Zero trust also changes privileged access: admin rights become session-based and brokered rather than standing, which is the [PAM](/docs/pam-core/what-is-pam) architecture in its zero-trust form.

**Why it matters.** Zero trust is a framework question disguised as a concept question. Answering with the identity role instead of the marketing version shows you understand the architecture, not the slogan.

**Likely follow-ups.** What does "never trust, always verify" mean operationally? How does zero trust change network design? What is the role of the policy engine?

### 11. What is a service account, and why are they a security problem?

**Concise answer.** A service account is an account used by an application or system rather than a person. They are a problem because they often have high privileges, long-lived or hardcoded credentials, no human owner, and no lifecycle: they accumulate and never get deprovisioned.

**Detailed explanation.** Service accounts authenticate machines: an application connecting to a database, a backup job, a sync engine. They break the normal identity model: no human uses them, so MFA does not apply, passwords are shared configuration, and rotation breaks the consumers. The failure modes: credentials stored in code or config files, privileges granted broadly "because the app needs it", and the account surviving every [certification](/docs/protocols-iga/iga) because no human claims ownership. The controls: inventory them, give each an owner, rotate credentials automatically with the consumers aware, use platform-managed identities where available (managed identities in Azure, IRSA in AWS), and treat their secrets with [vault](/docs/pam-core/what-is-pam) protection. The threat model matters: service accounts are a favored target because their compromise is silent and their privileges are broad.

**Why it matters.** Most identity programs fail on service accounts long before they fail on user accounts. This question tests whether you know where the real work is.

**Likely follow-ups.** How do you rotate a service account credential without breaking the app? What is a workload identity? How do you inventory service accounts?

### 12. What is the difference between IAM and IGA?

**Concise answer.** IAM is the operational machinery: identities, authentication, authorization, provisioning. IGA is the governance layer: the processes that decide and review access, requests, certifications, and separation of duties.

**Detailed explanation.** IAM executes access: the directory, the IdP, the provisioning connectors. IGA governs it: the [request and approval workflow](/docs/protocols-iga/iga), the certification campaigns that review existing grants, the segregation-of-duties checks that catch conflicting roles, and the audit evidence. The relationship is the [governance loop](/docs/scenarios/certification-campaign): IGA decides and reviews, IAM executes. A shop with IGA tooling but broken provisioning is a paper governance program: the certifications document access that does not match reality. A shop with excellent provisioning and no IGA is an efficient system nobody reviews. The interview answer that lands: IGA is where access decisions become auditable, and the feedback loop into provisioning is what makes it real.

**Why it matters.** IAM and IGA are often sold as one product category. Knowing the boundary lets you discuss programs, not purchases.

**Likely follow-ups.** Where does SoD fit? How often should certifications run? What is the difference between an access request and a provisioning event?

### 13. What is provisioning and deprovisioning, and why does deprovisioning fail?

**Concise answer.** Provisioning is creating accounts and access when they are needed; deprovisioning is removing them when they are not. Deprovisioning fails because it depends on inventory: the organization cannot remove access it does not know exists.

**Detailed explanation.** Provisioning is the easy half: the trigger is visible (a hire), the process is additive, and failures are loud. Deprovisioning is the hard half: the trigger is an event that must be detected, the process must reach every system the person touched, and failures are silent. The failure modes: [orphaned accounts](/docs/scenarios/termination) in applications that were never connected to provisioning, direct grants that bypassed the process, service accounts created for a person's task and never cleaned up, and local accounts on servers. The controls are structural: SCIM-connected provisioning so removal propagates, deprovisioning by role membership rather than by individual account, certification campaigns as the catch-all, and termination checklists. The metric is time-to-deprovision: hours, not days.

**Why it matters.** Deprovisioning is where identity programs most often fail in audits and incidents. The interviewer wants the operational answer, not "the HR system tells us".

**Likely follow-ups.** How do you handle a terminated employee's mailbox? What is the difference between disabling and deleting an account? How do you deprovision an account that has no owner?

### 14. What is a directory service, and what role does it play in IAM?

**Concise answer.** A directory service is the system of record for identity: it stores users, groups, and attributes, and it is where authentication and group-based authorization resolve.

**Detailed explanation.** The directory (Active Directory being the common case) holds the identity objects and their attributes: who exists, what groups they belong to, what attributes describe them. Authentication resolves against it: the bind operation verifies credentials, and the directory answers authorization questions through group membership. [LDAP](/docs/protocols-iga/ldap) is the protocol for talking to directories. The directory's role in IAM: it is the anchor identity store that everything else trusts. Applications bind to it, the IdP federates from it, and provisioning writes to it. Its weaknesses are inherited by everything above it: an unmanaged directory means an unmanaged IAM program. Modern architectures add a cloud identity layer on top while the directory remains the system of record for on-premises and hybrid estates, which is the [hybrid architecture](/docs/vendors/microsoft-stack) pattern.

**Why it matters.** Directory questions test whether you understand the foundation. Candidates who can describe what binds against the directory and what the directory feeds understand the dependency graph of identity.

**Likely follow-ups.** What is a bind? What is a group used for? How do you secure a directory?

### 15. What is JIT access, and why is it preferred over standing access?

**Concise answer.** Just-in-time access grants privileges only when they are needed, for a limited time, and removes them automatically. Standing access is permanent, which means it is also permanent risk.

**Detailed explanation.** JIT access applies the least-privilege principle to privileged operations: the user requests access, an approver or policy decides, the grant is issued for the task duration, and it expires or is revoked without a second action. [The patterns](/docs/pam-core/jit-access): ephemeral group membership that expires, role activation with a time limit, and brokered sessions where the credential never reaches the user. Standing access is the default failure mode: an admin group membership granted once and never reviewed, a shared password known to everyone who ever needed it once. The risk difference: standing access is attackable at any time, JIT access is attackable only during the justified window, and every use is recorded. The cost of JIT is operational friction, which is why the workflow must be fast: a request that takes a day will be bypassed, and bypass is worse than standing access.

**Why it matters.** JIT is the defining modern PAM practice. The interviewer wants to hear the operational cost acknowledged, because the candidate who knows JIT has a failure mode knows JIT.

**Likely follow-ups.** How do you make JIT fast enough that people use it? What happens to sessions when the grant expires? What is zero standing privilege?