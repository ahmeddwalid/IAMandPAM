---
title: "Wave 2: Scenario Questions"
description: "Fifteen scenario-based interview questions with full-treatment answers."
---

# Wave 2: Scenario Questions

Scenario questions test judgment: what you do, in what order, and what you think about first. The strongest answers name the priority (protect the business, then restore service), the exact steps, and the thing that goes wrong if you skip a step. These map to the [playbooks](/docs/scenarios/) in Phase 5, which are linked at the end of each answer.

### 1. A new hire starts Monday. Walk me through giving them access on day one.

**Concise answer.** Start from the access request, provision identity and entitlements from the source of truth, sync to the systems they need, and verify they can do their job and nothing more.

**Detailed explanation.** The sequence: the hiring manager's request defines the role, which maps to a predefined [access profile](/docs/fundamentals/identity-lifecycle): directory account, email, collaboration tools, line-of-business apps, and any shared drives. The provisioning engine creates the identity and applies [role-based entitlements](/docs/fundamentals/authorization); SCIM carries the account to each target. Approval is only for exceptions beyond the standard profile, so the joiner process is fast: automation covers the common case, humans review the edge cases. The verification step is the one most people skip: confirm the account works, the MFA enrollment is attached, and the user received their credential securely. Two rules: never grant more than the profile (scope creep at day one is how standing access accumulates), and log the creation so the [leaver process](/docs/scenarios/termination) knows what to revoke later.

**Why it matters.** A slow or broken joiner process is the most visible identity failure. The interviewer wants to hear that you designed for the standard case with automation and kept approval for exceptions.

**Likely follow-ups.** Who approves access? What if the role doesn't exist yet? How do you deliver credentials securely? What breaks first when this process scales?

### 2. An employee transfers from sales to finance. What access changes?

**Concise answer.** Remove the sales entitlements, add finance entitlements, and verify nothing from the old role survives. The mover change is a revocation event, not just an addition.

**Detailed explanation.** The mover is where identity drift is born, because adding the new role is easy and removing the old one is easy to forget. The correct order: freeze the old access, remove the old entitlements, add the new ones, and re-enroll MFA if the new role is [privileged](/docs/fundamentals/authorization). The deadline matters: the transfer date is the revocation date, not the approval date. The [mover flow](/docs/scenarios/role-change) in this site shows the pipeline; the failure mode is when the transfer is informal and nobody tells the identity team, which is why the trigger should come from HR's system rather than a ticket. The audit question at the end: certify that the employee's remaining access equals the new role's profile.

**Why it matters.** Transfer without revocation is how a salesperson keeps finance access for years, and that is the most common finding in access reviews. Saying "the old role must be revoked on day one" is the answer.

**Likely follow-ups.** What if they need read-only access to the old system during transition? Who owns the transfer trigger? How do you prove the old access is gone?

### 3. An employee is terminated for cause at 5 PM. What happens?

**Concise answer.** The account is disabled immediately, before the person can react, and the systems most likely to be abused are prioritized. The [emergency offboarding playbook](/docs/scenarios/termination) runs: disable, revoke, collect, then verify.

**Detailed explanation.** Immediate steps: disable the directory account and SSO access, revoke the [privileged accounts](/docs/scenarios/incident-compromised-privileged-account) and any standing admin access, rotate passwords or tokens for accounts they knew, and invalidate sessions and cached credentials. The physical assets follow: badge, laptop, phone. The verification is not optional: log in as the terminated user on a test basis or check session inventory to confirm nothing still works, including offline or cached credentials. The order matters: disable first, communicate later, because the risk is the person using access they know is being revoked. HR leads the timeline; identity executes the technical revocation. The post-incident step: review what the account did in the hours before termination, because a pending termination is sometimes known in advance and abused.

**Why it matters.** Termination is the highest-stakes identity event: the business impact of a delayed revocation is immediate and measurable. The answer that lands: disable first, verify, then audit what happened before.

**Likely follow-ups.** What if the employee has a break-glass account? How fast must revocation be? Who else needs to know? What if they had a pending access certification?

### 4. An administrator asks for access to the production database. Walk me through it.

**Concise answer.** The request is evaluated against the job requirement, approved by the data owner, granted as a [just-in-time](/docs/pam-core/jit-access) privileged session with a time limit, and reviewed afterward.

**Detailed explanation.** The decision tree: does the job actually require production database access, or is there a lower-access path (read-only, a specific schema, a support tool)? If required, the request goes to the data owner, not the requester's manager, because the data owner answers for the data. The grant is not a standing account: the requester checks out a [privileged session](/docs/pam-core/core-capabilities) through the PAM platform, which rotates the actual credential, records the session, and enforces MFA at the moment of access. The duration is bounded, the session is [session-managed](/docs/pam-core/core-capabilities) (recording, keystrokes, clipboard control), and the approval is attached to the session record. The review: the requester's manager sees the session log and the business reason; the access is gone when the session ends. What never happens: handing out the shared database password.

**Why it matters.** This is the classic PAM scenario. The interviewer listens for three things: business justification, owner approval, and JIT session rather than standing credentials.

**Likely follow-ups.** What if the admin is on call at 2 AM? How long is the session valid? What if the database doesn't support the PAM platform? How do you handle the DBA who refuses to give up the root password?

### 5. Your identity provider goes down. What breaks, and what do you do?

**Concise answer.** SSO-dependent applications reject new authentication, but established sessions and local logins usually survive. The response: declare the incident, assess what still works, communicate, and route around the outage.

**Detailed explanation.** What breaks: new [SSO](/docs/fundamentals/authentication) logins to every federated application, password resets, MFA enrollment, and SCIM sync (provisioning stops). What usually survives: existing sessions until they expire or are validated again, cached credentials, direct logins to systems that support local authentication, and the directory itself if it is on-premises. The response order: confirm the cause (provider outage, certificate expiry, or your own directory failure, since the answer differs), communicate to the user base with the real scope, and execute the fallback plan: [break-glass procedures](/docs/pam-core/core-capabilities) for emergency administration, local authentication for critical systems, and possibly an emergency IdP or cached sessions for priority apps. The post-incident work: review what was inaccessible, check for users who fell back to unsafe paths (shared passwords, shadow IT), and fix the single point of failure if the design allowed one.

**Why it matters.** Every interviewer has lived an IdP outage. The answer distinguishes the prepared (has a fallback plan, knows what survives) from the hopeful.

**Likely follow-ups.** What is your IdP SLA? Do you have a second IdP? What about certificate expiry? How do you handle users locked out by MFA during the outage?

### 6. A service account password shows up in a public code repository. What now?

**Concise answer.** Treat it as a credential compromise: rotate the credential immediately, scan for other exposures, and fix the process that let it leak.

**Detailed explanation.** The sequence: rotate the service account's password or [rotate the key](/docs/fundamentals/identity-lifecycle) at the target system, and do it before investigating, because every minute it stays valid it is a live credential. Then check where it was used: the target systems it could reach, logs for access from unexpected sources, and whether the account has [privileged scope](/docs/pam-core/privileged-account-types). Then fix the pipeline: add secret scanning to the repository, enforce secret managers or managed identities instead of passwords in code, and make the service account rotation a scheduled practice rather than an incident. The ownership question comes next: if the account has no owner, it becomes part of the [orphaned account cleanup](/docs/pam-core/privileged-account-types) before it can leak again. The uncomfortable follow-up: if the password was in the repo for months, assume it was used, and audit what the account could do.

**Why it matters.** Service account hygiene is a favorite interview topic because it tests both security instinct (rotate first) and operational maturity (fix the pipeline).

**Likely follow-ups.** What if rotating breaks the application? How do you find all uses of that account? What is a managed identity? How do you prevent service account password reuse?

### 7. Your organization wants to roll out MFA to everyone. How do you approach it?

**Concise answer.** Start with the riskiest accounts, choose factors that fit the user base, phase the rollout, and design enrollment and recovery so users can't get locked out.

**Detailed explanation.** The plan: segment by risk first, [privileged and remote users first](/docs/fundamentals/authentication), then the rest. Choose the factors: push notifications or TOTP for most users, hardware keys for [privileged administrators](/docs/pam-core/core-capabilities), and avoid SMS as the only factor given its known interception risk. Phased rollout: pilot with a friendly department to fix friction, then a communication and training push, then enforcement with a deadline, keeping a grace period. The part that determines success is [recovery](/docs/scenarios/mfa-enrollment-recovery): a lost phone cannot mean a lost account, so design self-service recovery (backup codes, a second device, a recovery contact) and a help desk procedure with real verification. The enrollment trap: forcing MFA with a deadline and no recovery path creates shadow IT and help desk floods. Measure what matters: enrollment rate, help desk lockout tickets, and authentication failure rates.

**Why it matters.** MFA rollout is the most common real-world identity project. The interviewer hears the security intent in the first sentence and the operational realism in the rest.

**Likely follow-ups.** How do you handle break-glass accounts with MFA? What about users who refuse? How do you deal with MFA for service accounts? What if a user's phone is lost during the rollout?

### 8. An access certification shows a 98% certify rate. Is that good news?

**Concise answer.** No. A near-perfect certify rate usually means certifiers are clicking through without reviewing, which is worse than a low rate with scrutiny.

**Detailed explanation.** The point of [certification](/docs/protocols-iga/iga) is review, and review produces findings: access that doesn't match the role, stale entitlements, orphaned accounts. A 98% certify rate means reviewers spent seconds per item, which means the process is theater. The healthy signals: a meaningful removal rate (3-10% depending on maturity), questions raised by reviewers, and changes to profiles as a result. The fix when certification is rubber-stamping: smaller certification campaigns with more context (show the role comparison, show last-use data), [recurring reviews on a schedule](/docs/protocols-iga/iga), accountability for certifiers (their certification is itself audited), and automated triggers for the clear-cut cases so humans only see the ambiguous ones. The interview point: you treat the process outcome as a signal about the process, not a success metric.

**Why it matters.** Access certification is where governance programs look successful and are quietly useless. Demonstrating you evaluate the review itself is senior thinking.

**Likely follow-ups.** What is a good removal rate? How do you make certification less painful? What do you do with access no one can explain? How does a certification campaign work technically?

### 9. A team wants to adopt a new SaaS application. How do you integrate it into identity?

**Concise answer.** Route it through the standard integration path: [SSO via SAML or OIDC](/docs/protocols-iga/saml), [SCIM provisioning](/docs/protocols-iga/scim), access by role, and the [access request and review](/docs/protocols-iga/iga) loop attached.

**Detailed explanation.** The evaluation order: does the application support SAML or OIDC federation (if not, it becomes a shadow IT or shared-credential risk)? Does it support SCIM (if not, accounts will drift and terminate manually)? The integration itself: configure the identity provider as the [SAML identity source](/docs/scenarios/saas-sso-integration), map attributes (email, groups) to the application's expectations, define the access profiles in the IdP so role changes propagate, and enable SCIM so the joiner-mover-leaver lifecycle extends into the app. The governance loop: access to the app is requested and approved through the same process as everything else, the app shows up in access reviews, and the data owner is named. The operational contract: who is the vendor support contact, what is the deprovisioning SLA, and what happens if the app stops supporting SAML.

**Why it matters.** SaaS adoption is the engine of shadow IT. The answer shows you don't just say "no" to new apps, you give them a fast, safe path in, which is what companies actually need.

**Likely follow-ups.** What if the app only supports LDAP? What if it supports neither? How do you discover shadow IT? Who owns the app's access review?

### 10. A privileged account shows a login at 3 AM from an unknown location. What do you do?

**Concise answer.** Treat it as a potential compromise: alert the response team, isolate and verify the session, check what the account can reach, and rotate the credential if there is any doubt.

**Detailed explanation.** The immediate action: the [session alert](/docs/scenarios/incident-compromised-privileged-account) goes to the response team with the context that matters (account, time, source, target), the session is killed or suspended while it is checked, and the account's recent history is pulled: other sessions, [session recordings](/docs/pam-core/core-capabilities), and what it touched. Then the questions: was it a legitimate admin working remotely without the [PAM policy](/docs/pam-core/core-capabilities) (the "unknown location" is sometimes a home IP)? Was the account the only way in, or a symptom of a broader compromise? The decision: if unverified, rotate the credential, review the session recording, and search for related activity from the same source against other systems. The organizational step: this is a test of the alert pipeline, so the incident is documented and the detection logic reviewed: how long did the alert take, and did it fire or was it found in a morning report? The wrong outcome is the password change without the investigation, because the attacker may have another way in.

**Why it matters.** PAM incidents are the interview's way to test incident judgment without asking for the incident playbook. Priorities: verify, contain, investigate, then learn.

**Likely follow-ups.** What if the account is a break-glass account? How do you tell a real incident from a false positive? What logs do you pull? When do you escalate?

### 11. The organization wants to remove password complexity requirements and rely on MFA. How do you respond?

**Concise answer.** Support it: password complexity rules are counterproductive, and [long passphrases plus MFA](/docs/fundamentals/authentication) is the better control. The condition is that MFA actually covers the users and systems the complexity rule was protecting.

**Detailed explanation.** The evidence and practice: complexity rules produce predictable passwords (a required number, a capital, a symbol, and everyone uses "Password1!") and drive reuse across sites. The modern recommendation is longer passphrases, blocking known-compromised passwords, and MFA as the second factor, which defeats the password reuse risk the complexity rule was meant to address. The risk in the change: MFA must genuinely apply to everything that matters, including [privileged access](/docs/pam-core/core-capabilities), VPN, and the systems that don't support MFA (which then need compensating controls). The practical response to the proposal: agree with the direction, define what replaces it (passphrase length, breach-blocking, MFA coverage, [conditional access](/docs/fundamentals/least-privilege-zero-trust)), and make sure the change is communicated as a security improvement rather than a relaxation.

**Why it matters.** The question tests whether you hold security as the goal or the specific control as the goal. The candidate who defends complexity rules for their own sake loses; the candidate who negotiates the replacement wins.

**Likely follow-ups.** What is a breach-blocking password check? What about passwords for shared accounts? How do you measure whether the change helped? What if some systems can't use MFA?

### 12. A vendor asks for a direct VPN account into your network. How do you handle it?

**Concise answer.** Decline the standing network account and offer the safer alternative: [federated access](/docs/protocols-iga/iam-architecture) to the specific systems the vendor needs, with identity provided by the vendor, scoped to the work, and time-limited.

**Detailed explanation.** The standing vendor VPN account is the classic backdoor: it is often shared, rarely reviewed, and survives past the engagement. The alternatives in order of preference: the vendor's support personnel authenticate against their own identity provider through a federation trust, and your side grants access only to the required systems (support portal, log access, a specific server via [JIT session](/docs/pam-core/jit-access)); if federation is not possible, a named, individual account with MFA, scoped access, an expiration date tied to the contract, and review. The governance piece: vendor access appears in the access review, the engagement has an owner, and termination is automated at contract end. The interview point: you protect the perimeter by refusing the simple request and providing a path that serves the vendor's actual need.

**Why it matters.** Third-party access is a top breach vector. The answer shows you can say no to a stakeholder without blocking the business, which is the actual job.

**Likely follow-ups.** What if the vendor refuses federation? How do you audit what the vendor did? What if they need to access the core network for support? How do you handle vendor credential sharing?

### 13. An employee is abroad and their phone with the MFA app is lost. Walk me through recovery.

**Concise answer.** Verify the person through an independent channel, then issue recovery: temporary access with strict controls, re-enrollment of a new factor, and revocation of the old device's sessions.

**Detailed explanation.** The trap is the help desk that resets MFA based on the caller knowing basic details, which is the account takeover attack. The recovery: the user is verified through a separate channel (manager confirmation, a pre-registered recovery contact, an on-file backup code, or documented identity proof), then the old factor is revoked, the sessions on the lost device are invalidated, and the user re-enrolls with a new device. The [recovery procedure](/docs/scenarios/mfa-enrollment-recovery) is the part to have designed in advance: the backup codes issued at enrollment are the self-service path that avoids the help desk entirely. The temporary-access layer: for a privileged user, the replacement is a [JIT session](/docs/pam-core/jit-access) with MFA on the remaining factor, not a standing exception. The logging requirement: every recovery is recorded, because the [insider threat playbook](/docs/scenarios/incident-insider-threat-session-review) starts with recovery anomalies.

**Why it matters.** MFA recovery is the weakest link in real deployments, and interviewers know it. The answer demonstrates you designed the emergency path, not just the happy path.

**Likely follow-ups.** What if they never enrolled backup codes? How do you verify someone who is abroad and unreachable by phone? How fast should recovery be? What does the audit trail need to show?

### 14. An audit finds 500 service accounts with no owner. What is your plan?

**Concise answer.** Classify them first: find the ones that are active, privileged, or connected to anything sensitive, and handle those first. Then establish ownership and a cleanup path for the rest.

**Detailed explanation.** The order: discover and inventory every service account and what it connects to (the [discovery](/docs/pam-core/core-capabilities) step), then triage by risk: active privileged accounts are urgent, dormant accounts are candidates for disablement, and accounts with unknown connections are flagged for review before touching. Then ownership: each account gets a named owner through the organization, either by tracing the application it supports or by the system team that manages the host. The cleanup: disable dormant accounts for a grace period before deletion, because deletion is irreversible and a disabled account can be re-enabled if something breaks. The prevention: new service accounts go through a registration process with owner and [rotation policy](/docs/pam-core/privileged-account-types) recorded, and an automated [recurring review](/docs/protocols-iga/iga) catches future orphans before they accumulate.

**Why it matters.** Service account sprawl is the most common finding in real audits. The answer shows you think in risk order and reversibility, not in cleaning everything at once.

**Likely follow-ups.** How do you identify what a service account does? What if an application needs the account's permissions reviewed? How often do you run the cleanup? What about service accounts in code?

### 15. You are starting a PAM rollout. Where do you begin?

**Concise answer.** With discovery: inventory the privileged accounts and credentials before choosing tools or policies, because you cannot protect what you haven't found.

**Detailed explanation.** The rollout order: discovery and inventory of privileged accounts (local admin, domain admin, service accounts, application accounts, embedded credentials) and their risk; then prioritize: [domain and cloud administrators](/docs/pam-core/what-is-pam) first, then infrastructure accounts, then application accounts. The next layer: bring the top-tier accounts under credential vaulting and rotation, enforce MFA on privileged access, and build the [JIT](/docs/pam-core/jit-access) workflow for the access that is only needed occasionally. The common failure is tool-first: buying a PAM platform and connecting accounts in whatever order is easiest, which leaves the riskiest paths unprotected. The governance pieces are part of the rollout, not an afterthought: who approves privileged access, what sessions are recorded, and who reviews the recordings. The sequencing rule: discover, protect the top tier, expand in waves, and review as you go.

**Why it matters.** PAM is a program, not a product, and the interviewer wants the program. Starting with discovery shows you understand that the hard part is the inventory and the politics, not the vault.

**Likely follow-ups.** How do you handle the DBA who resists the vault? What if credentials are embedded in scripts? How do you measure the rollout's progress? What is the first priority account type?