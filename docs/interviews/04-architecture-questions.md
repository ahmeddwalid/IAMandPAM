---
title: "Wave 2: Architecture Questions"
description: "Ten architecture interview questions with full-treatment answers."
---

# Wave 2: Architecture Questions

Architecture questions are the design filter: they test whether you can lay out a system with the right components, justify each choice, and name the trade-offs. The winning pattern is to state the requirements you are designing for, name the components, and explain what you deliberately chose not to build.

### 1. Design IAM for a 5,000-person company moving to the cloud.

**Concise answer.** One directory as the source of truth, federated to a cloud identity provider, with provisioning to the cloud platforms and applications, [role-based access](/docs/fundamentals/authorization), MFA with [conditional access](/docs/fundamentals/least-privilege-zero-trust), and a governance loop of reviews and certification.

**Detailed explanation.** The components: the HR system feeds the identity lifecycle, the directory (Active Directory or Entra ID) is the [source of truth](/docs/fundamentals/identity-lifecycle), the identity provider federates to the cloud platforms (AWS, Azure, GCP) and SaaS applications, and SCIM carries accounts to targets. The cloud platforms are connected through [federation](/docs/protocols-iga/iam-architecture): the cloud's identity provider trusts the company IdP, so no cloud accounts are created for humans; roles are mapped from the user's [groups and attributes](/docs/fundamentals/authorization). The security layer: MFA enforced for everything external, [conditional access](/docs/fundamentals/least-privilege-zero-trust) restricting sign-in by device, location, and risk, and [PAM](/docs/pam-core/what-is-pam) for the cloud administrators' console access. The governance layer: access reviews, least-privilege baselines for cloud roles, and automated [deprovisioning](/docs/fundamentals/identity-lifecycle) from the HR trigger. The design constraint to state: no direct human accounts in the cloud platforms, because they bypass the directory and the lifecycle.

**Why it matters.** This is the most common architecture question there is. The interviewer listens for the source-of-truth decision, the federation boundary, and the governance loop, not for product names.

**Likely follow-ups.** What if they have 200 applications? How do you handle legacy apps that only support LDAP? Where does MFA enforcement live? How do you design the [hybrid state](/docs/pam-core/what-is-pam) during the migration?

### 2. Design the authentication flow for a new web application.

**Concise answer.** The application delegates authentication to the identity provider through [OIDC](/docs/protocols-iga/oidc): the user signs in at the IdP, the app receives an ID token for identity and a short-lived access token for APIs, and sessions are handled by the app with refresh tokens.

**Detailed explanation.** The flow: the application redirects to the IdP's authorization endpoint, the user authenticates with MFA, and the IdP redirects back with an authorization code, which the application exchanges for tokens at the token endpoint. The [ID token](/docs/protocols-iga/oidc) (a JWT) carries identity claims the application uses for the UI; the access token is passed to the API layer, which validates it by signature, never by calling back to the IdP per request. The security decisions: [PKCE](/docs/protocols-iga/oauth2) on the code exchange, short access token lifetimes, refresh tokens held server-side where possible and [rotated](/docs/protocols-iga/oauth2) on use, and validation of issuer, audience, and expiry on every token. The design constraint: the application never sees the password, never stores credentials, and does not build its own session for anything beyond the user's UI state. The API layer enforces authorization by scope and by the user's roles, not by trusting the front end.

**Why it matters.** The question tests whether you build identity into the application correctly or bolt on a home-grown session. The correct answer is delegation: the IdP authenticates, the app authorizes.

**Likely follow-ups.** How do you handle logout? What about the mobile app? How do you refresh tokens when the user's roles change? What if the API is used by other services?

### 3. Design SSO for a company with on-premises Active Directory and cloud applications.

**Concise answer.** [Hybrid identity](/docs/vendors/cloud-iam): keep AD as the on-prem directory, extend identity to the cloud with directory sync, use the cloud identity provider for application federation, and federate the cloud platforms to the same identity.

**Detailed explanation.** The design: directory synchronization copies identities from AD to the cloud tenant, so the source of truth stays in AD while cloud applications get a cloud identity. [Authentication](/docs/protocols-iga/iam-architecture) for cloud apps is handled by the cloud IdP with [SAML/OIDC federation](/docs/protocols-iga/saml), and password hashes or [pass-through authentication](/docs/protocols-iga/iam-architecture) keep one credential. The on-prem legacy apps continue with AD/LDAP or ADFS if they predate federation. The boundary decisions: which apps federate to the cloud IdP versus staying on AD; whether [conditional access](/docs/fundamentals/least-privilege-zero-trust) applies to both; and how [privileged access](/docs/pam-core/core-capabilities) to on-prem servers is handled, which stays with PAM. The migration consideration: the design is a destination, not a freeze, since the direction is consolidating onto the cloud IdP while AD runs the lifecycle. The failure mode to design against: split-brain identity (a user changed in AD but not synced), which the sync interval and [reconciliation](/docs/protocols-iga/scim) must catch.

**Why it matters.** Most companies are in exactly this state. The answer shows you can design around the reality of a legacy directory rather than around a clean-slate fantasy.

**Likely follow-ups.** What is the difference between password hash sync and pass-through? What about users only in the cloud? How do you migrate ADFS apps? How fast does sync need to be for a terminated user?

### 4. Design a PAM architecture for a mid-size company.

**Concise answer.** A central [PAM platform](/docs/pam-core/what-is-pam) that vaults credentials, brokers access through [JIT sessions](/docs/pam-core/jit-access) with MFA, records sessions, and rotates credentials, with [break-glass](/docs/pam-core/core-capabilities) as a separate, audited path.

**Detailed explanation.** The components: the vault holds the [privileged credentials](/docs/pam-core/what-is-pam) (admin accounts, service accounts, application accounts) with scheduled rotation; the session broker mediates access: the admin requests access, approval (if required) is checked, MFA is enforced, and the session connects to the target using a rotated, single-use credential, while the [session is recorded](/docs/pam-core/core-capabilities). The targets: domain controllers, servers, network devices, databases, cloud consoles, and application accounts, each with the same pattern: no standing credential in the admin's hands. [JIT](/docs/pam-core/jit-access) handles the access that is occasional: time-boxed, approved, and removed at the end. The governance layer: who can approve, what gets recorded, and who reviews recordings, with [certification](/docs/protocols-iga/iga) of privileged access as a recurring review. The break-glass path is a deliberate exception: sealed credentials with a documented opening procedure and immediate notification, because the alternative to break-glass is admins who refuse the vault.

**Why it matters.** The interviewer listens for the pattern: vault, broker, record, rotate, with governance around it. Naming the politics (break-glass, the DBA who resists) is what separates design from theory.

**Likely follow-ups.** How do you handle local admin on workstations? What about SSH keys? How do you protect the vault itself? How do you measure the rollout?

### 5. How do you architect zero-trust access to internal applications?

**Concise answer.** No network trust: every access decision is evaluated per request, with the user's identity, the device's posture, and the risk of the context, enforced at the application layer or through a [policy engine](/docs/fundamentals/least-privilege-zero-trust).

**Detailed explanation.** The model: the network is treated as hostile, so "on the VPN" grants nothing by itself. The access decision combines: identity (who, with MFA and [conditional access](/docs/fundamentals/least-privilege-zero-trust) policies), device (managed, compliant, patched), and context (location, risk score). The enforcement points: applications integrate with the identity layer directly (OIDC), or traffic is brokered through a [zero-trust gateway](/docs/fundamentals/least-privilege-zero-trust) that authenticates the session and proxies the request, which covers legacy apps without rewriting them. The session is [time-bound](/docs/pam-core/jit-access) and re-verified; [privileged access](/docs/pam-core/core-capabilities) gets the same treatment with tighter policy and recording. The design constraint: segmentation and micro-segmentation replace the flat network, and [service accounts](/docs/pam-core/privileged-account-types) use workload identity rather than credentials in config. The trade-off to name: zero trust reduces the blast radius of a compromised endpoint at the cost of operational complexity, so the rollout prioritizes the sensitive applications first.

**Why it matters.** Zero trust is the architectural direction everyone claims and few implement. The interviewer wants the decision model (who, what, where, per request), not the buzzwords.

**Likely follow-ups.** What is the difference between zero trust and VPN? How do you handle legacy apps? What role does the network still play? How does zero trust handle machine-to-machine access?

### 6. Design the session management strategy for your identity platform.

**Concise answer.** Session lifetimes are set by risk, not by a single global number: low-risk sessions last longer, [privileged and sensitive sessions](/docs/pam-core/core-capabilities) are short and actively terminated, and refresh tokens are the real control for application sessions.

**Detailed explanation.** The layers: the IdP session (how long the user stays signed in), the application session (the ID token and its refresh token), and the [privileged session](/docs/pam-core/core-capabilities) (the PAM session). The policy design: conditional access sets the session lifetime by context, so a managed device in the office gets a longer session than an unmanaged device at a cafe. The application layer: refresh tokens with rotation and reuse detection, so a stolen refresh token is caught when it is replayed; [access tokens](/docs/protocols-iga/oauth2) stay short. The privileged layer: sessions are bound to a task with a time limit, recorded, and terminated when the task ends. The revocation model: when a user is terminated or a device is lost, sessions are invalidated at the IdP (revoking refresh tokens), at the applications (re-validating on the next refresh), and at the [PAM layer](/docs/pam-core/core-capabilities) (killing active sessions). The design decision to state: session length is a business decision owned by security, with the default being shorter and the exceptions justified.

**Why it matters.** Session management is where authentication design meets daily reality: too short, users revolt; too long, breaches widen. The layered answer shows you know sessions exist at three levels.

**Likely follow-ups.** What is the right session length? How do you log users out everywhere? How do you handle shared devices? What is session replay protection?

### 7. Design identity for a microservices platform.

**Concise answer.** Human access comes through the [OIDC](/docs/protocols-iga/oidc) layer with tokens validated at the gateway; service-to-service access uses [workload identity](/docs/pam-core/privileged-account-types): short-lived, scoped credentials issued by the platform, never shared secrets in configuration.

**Detailed explanation.** The design splits into two planes. Human plane: users authenticate at the IdP, the API gateway validates the access token, and services downstream trust the gateway or validate the token's signature themselves with a shared key set. Service plane: each workload gets a [platform-issued identity](/docs/pam-core/privileged-account-types) (the cloud's workload identity mechanism, or a short-lived certificate), which it exchanges for a scoped token at a token service; no credentials in configuration, no shared passwords between services. The authorization model: tokens carry scopes and claims, and each service enforces its own authorization by checking the caller's identity and scope, so a compromised service cannot call everything. The operational layer: service identities rotate automatically, have owners, and appear in [access reviews](/docs/protocols-iga/iga); tokens are short-lived, so revocation risk is bounded. The failure mode to design against: a service that forwards the user's token downstream, expanding its scope; the rule is delegation or impersonation, explicit and scoped.

**Why it matters.** Microservices identity is a senior question because the answer requires separating the human plane from the service plane, which most candidates blur.

**Likely follow-ups.** How do you handle a service that needs to act as the user? What is mTLS for? How do you audit service-to-service calls? What about third-party services?

### 8. Design the provisioning architecture for a company with 200 applications.

**Concise answer.** One source of truth feeding a central provisioning engine, with [SCIM](/docs/protocols-iga/scim) connectors to every capable application, directory integrations for the rest, and a reconciliation loop that catches drift.

**Detailed explanation.** The architecture: the HR system is the identity trigger (joiner, mover, leaver), the directory is the source of truth for accounts, and the [provisioning engine](/docs/fundamentals/identity-lifecycle) (IGA platform or IdP provisioning) carries changes out. The connectors: SCIM for modern SaaS (the majority), API or JDBC for legacy applications, and group-based provisioning for applications without provisioning APIs. The attribute design: one attribute map per application, because each app has different expectations (email, employee ID, department), and the map is owned per application. The [governance loop](/docs/protocols-iga/iga): access requests create entitlements, entitlements feed provisioning, and access reviews feed back into entitlement cleanup; reconciliation compares target accounts against the source and flags or remediates drift. The design constraint: no application is the source of truth, and no human accounts are created directly in applications, because both create drift and orphans.

**Why it matters.** Provisioning architecture is the operational heart of IAM. The answer demonstrates scale thinking: connectors, attribute maps, and reconciliation, not just "we use SCIM."

**Likely follow-ups.** What if the HR system is unreliable? How do you handle applications that only provision by API? How often do you reconcile? What is the source of truth for guests and contractors?

### 9. Design the break-glass access strategy.

**Concise answer.** A separate, sealed set of emergency credentials with a documented opening procedure, immediate notification when used, and MFA, because the goal is that break-glass access is never silently available.

**Detailed explanation.** The design: break-glass accounts are distinct from normal [privileged accounts](/docs/pam-core/core-capabilities), have no standing access to anything beyond what emergency recovery needs, and are [sealed](/docs/pam-core/core-capabilities): credentials stored in a sealed container or PAM vault, opened only through a documented procedure that requires verification of the emergency. The activation: the procedure is run by two people or approved through the incident process, the credentials are rotated after use, and every opening generates an alert and a session recording. The maintenance: break-glass is tested on a schedule (a quarterly failover test that actually uses the credentials), credentials are rotated periodically even without use, and the account list is reviewed. The failure mode to avoid: break-glass accounts that are quietly used as regular admin accounts, which defeats the audit trail; the monitoring must flag any use outside the documented procedure.

**Why it matters.** Break-glass is where identity design meets the incident reality: if it is hard to open, no one uses it in an emergency, and if it is easy, it is abused. The balanced design is the answer.

**Likely follow-ups.** How do you open break-glass during an IdP outage? Who can use it? How do you test it? What about break-glass for the cloud consoles?

### 10. Design the audit architecture: what gets logged, where, and who reads it.

**Concise answer.** [Authentication events, authorization decisions, provisioning changes, and privileged sessions](/docs/protocols-iga/iga) are logged centrally, with privileged activity recorded as sessions rather than just events, and the logs feed both security monitoring and recurring access reviews.

**Detailed explanation.** The event layers: the identity layer logs authentication (success, failure, MFA, [conditional access](/docs/fundamentals/least-privilege-zero-trust) decisions), the provisioning layer logs account creation, modification, and deletion (who requested, who approved, who executed), the authorization layer logs access decisions, and the [PAM layer](/docs/pam-core/core-capabilities) records privileged sessions with the actor, target, time, and recording. The transport: logs stream centrally (SIEM) with [immutability](/docs/protocols-iga/iga) for the forensic layer, and retention matches the compliance requirement. The consumption: security operations alerts on the events that matter (privileged logins, MFA resets, [access review](/docs/protocols-iga/iga) overrides), and the governance team reads the same stream for certifications and investigations. The design constraint: the audit data is only as good as the correlation keys, so identity events carry the actor, the target, the source, and the approval reference, which is what makes a [compromise investigation](/docs/scenarios/incident-compromised-privileged-account) possible.

**Why it matters.** Audit architecture is the difference between "we log things" and a governable system. The interviewer wants the layers, the centralization, and the consumption model.

**Likely follow-ups.** How long do you retain logs? What is a session recording worth in an investigation? How do you protect the logs from tampering? How do you handle privacy regulations for logged user data?