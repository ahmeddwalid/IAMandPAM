---
title: Advanced Technical Interview Questions
description: "10 advanced technical interview questions for IAM and PAM roles, with detailed explanations, follow-ups, and cross-links to relevant site pages."
---

# Advanced Technical Interview Questions

## Question 1: How does SAML signature wrapping work, and how do you defend against it?

**Concise answer.** Signature wrapping (XSW) is an attack where an attacker manipulates the XML structure of a signed SAML assertion to inject malicious content while preserving the valid signature. The defense is to validate the assertion structure, not just the signature.

**Detailed explanation.** XSW exploits the fact that XML signatures can cover only a portion of the XML document. The attacker intercepts a valid signed assertion, adds a duplicate assertion element with modified attributes, and moves the signature to cover only the original assertion. The SP validates the signature (which covers the original assertion) and processes the injected assertion.

There are eight XSW variants (XSW1-XSW8), each manipulating the XML structure differently. The common thread is that the signature validation passes because the signature covers a valid portion of the document, but the application processes a different portion.

Defense: use a SAML library that validates the assertion structure, not just the signature. Reject assertions with duplicate `ID` attributes or unexpected elements. Validate that the signature covers the entire assertion, not just a portion. Use schema validation to reject malformed assertions.

**Why it matters.** XSW is a real attack that has been used in the wild. Understanding it shows you know SAML at a deep level, not just the happy path.

**Likely follow-ups.** What is the difference between signing and encrypting a SAML assertion? How does artifact resolution prevent XSW?

## Question 2: What is the difference between OAuth 2.0 delegation and impersonation, and when would you use each?

**Concise answer.** Delegation preserves the user's identity in the token (via the `act` claim), while impersonation does not. Use delegation for auditing and least privilege; use impersonation only when the downstream service needs full access as the user.

**Detailed explanation.** In OAuth 2.0 token exchange (RFC 8693), delegation means the downstream service acts on behalf of the user, but the user's identity is preserved. The new token contains both the user's identity (`sub`) and the actor's identity (`act`). The `act` claim identifies the service that requested the token.

Impersonation means the downstream service acts as the user, with no actor claim. The new token contains only the user's identity. This is riskier because the downstream service has full access as the user, with no way to distinguish the impersonated request from a direct request.

Use delegation when the downstream service needs to act on behalf of the user but the user's identity should be preserved for auditing. Use impersonation only when the downstream service needs full access as the user and auditing is not a concern. Impersonation is rarely recommended.

**Why it matters.** Token exchange is increasingly common in multi-service architectures. Understanding the difference between delegation and impersonation shows you understand the security implications of token exchange.

**Likely follow-ups.** What is an actor token chain? How do you prevent token exchange abuse?

## Question 3: How does Kerberos constrained delegation work, and what are the risks?

**Concise answer.** Constrained delegation allows a service to delegate user credentials to a specific set of services, configured via SPNs. The risk is that a compromised service with constrained delegation can impersonate users to the allowed services.

**Detailed explanation.** Kerberos delegation allows a service to act on behalf of a user. Unconstrained delegation (deprecated) allows the service to delegate to any service. Constrained delegation (Windows Server 2003+) allows the service to delegate only to specific services, configured via SPNs in AD.

Resource-based constrained delegation (Windows Server 2012+) reverses the configuration: the target service specifies which services can delegate to it, rather than the delegating service specifying which services it can delegate to.

The risk: if a service with constrained delegation is compromised, the attacker can impersonate any user who authenticates to that service, but only to the allowed services. This is a powerful attack because it can lead to domain admin if the allowed services include domain controllers.

Defense: use the "Protected Users" group (which prevents delegation for its members), use "Account is sensitive and cannot be delegated" for high-value accounts, and audit constrained delegation configurations regularly.

**Why it matters.** Constrained delegation is a common attack path in AD environments. Understanding it shows you know Kerberos at a deep level.

**Likely follow-ups.** What is resource-based constrained delegation? How does the "Protected Users" group work?

## Question 4: What is the difference between LDAP and Active Directory, and when would you use each?

**Concise answer.** LDAP is a protocol for accessing directory services. Active Directory is a directory service that uses LDAP as one of its protocols. Use LDAP for cross-platform directory access; use AD for Windows-integrated environments.

**Detailed explanation.** LDAP (Lightweight Directory Access Protocol) is an open, vendor-neutral protocol for accessing and maintaining distributed directory information services. It defines how to query and modify directory entries, how to authenticate, and how to search.

Active Directory is Microsoft's directory service. It uses LDAP for directory access, Kerberos for authentication, and DNS for name resolution. AD adds features beyond LDAP: Group Policy, trust relationships, and Windows-specific schema extensions.

Use LDAP when you need cross-platform directory access (e.g., Linux applications authenticating to an LDAP directory). Use AD when you are in a Windows-integrated environment and need features like Group Policy, Kerberos authentication, and Windows-specific schema extensions.

OpenLDAP is an open-source implementation of the LDAP protocol. It is commonly used in Linux environments and for applications that need LDAP without AD.

**Why it matters.** Many IAM engineers use LDAP and AD interchangeably, but they are not the same. Understanding the difference shows you know directory services at a deep level.

**Likely follow-ups.** What is the difference between LDAP and LDAPS? How does AD replication work?

## Question 5: How does FIDO2/WebAuthn prevent phishing, and what are the limitations?

**Concise answer.** FIDO2/WebAuthn binds the authentication to the origin (the domain name), so a phishing site cannot use a credential issued for a different origin. The limitations are device loss, biometric false negatives, and the complexity of recovery.

**Detailed explanation.** FIDO2/WebAuthn is a passwordless authentication standard that uses public-key cryptography. During registration, the authenticator (e.g., a security key or platform authenticator) generates a key pair and sends the public key to the relying party (the application). During authentication, the relying party sends a challenge, and the authenticator signs it with the private key.

The key to phishing resistance is origin binding: the authenticator includes the origin (the domain name) in the signed data. The relying party verifies that the origin matches its own domain. If a phishing site tries to use a credential issued for a different origin, the origin check fails, and the authentication is rejected.

Limitations:
- **Device loss**: if the user loses their authenticator, they cannot authenticate. Recovery requires backup factors or a recovery code.
- **Biometric false negatives**: if the user's biometric does not match (e.g., wet fingers), the authentication fails. A fallback PIN is required.
- **Recovery complexity**: recovering a lost device requires a pre-registered backup factor or a recovery code. Without these, the user is locked out.

**Why it matters.** FIDO2/WebAuthn is the most phishing-resistant authentication method available. Understanding its limitations shows you can deploy it responsibly.

**Likely follow-ups.** What is the difference between FIDO2 and U2F? How do passkeys work?

## Question 6: What is the difference between RBAC, ABAC, and ReBAC, and when would you use each?

**Concise answer.** RBAC grants access based on roles, ABAC based on attributes, and ReBAC based on relationships. Use RBAC for simple, stable access patterns; ABAC for dynamic, context-aware policies; ReBAC for graph-based authorization.

**Detailed explanation.** RBAC (Role-Based Access Control) grants access based on the user's role. Permissions are assigned to roles, and users are assigned to roles. RBAC is simple and efficient for stable access patterns but becomes complex when roles proliferate (role explosion).

ABAC (Attribute-Based Access Control) grants access based on attributes of the user, resource, and environment. Policies are evaluated dynamically at access time. ABAC is flexible and context-aware but requires a policy engine and careful policy design.

ReBAC (Relationship-Based Access Control) grants access based on relationships between entities. It is graph-based: users, resources, and permissions are nodes, and relationships are edges. ReBAC is powerful for complex, hierarchical access patterns (e.g., Google Zanzibar) but requires a graph database or specialized engine.

Use RBAC for simple, stable access patterns (e.g., a small application with a few roles). Use ABAC for dynamic, context-aware policies (e.g., access based on time of day, location, or device). Use ReBAC for complex, hierarchical access patterns (e.g., a multi-tenant SaaS application with nested permissions).

**Why it matters.** Authorization is a core IAM function. Understanding the differences between RBAC, ABAC, and ReBAC shows you can choose the right model for the use case.

**Likely follow-ups.** What is Google Zanzibar? How does OpenFGA implement ReBAC?

## Question 7: How does PAM session recording work, and what are the limitations?

**Concise answer.** PAM session recording captures the keystrokes, mouse actions, and screen output of a privileged session. The limitations are storage volume, privacy concerns, and the inability to detect all malicious activity.

**Detailed explanation.** PAM session recording captures privileged sessions for audit and forensic analysis. There are three types of recording:

- **Keystroke logging**: captures all keystrokes during the session. Useful for command-line sessions (SSH, RDP).
- **Screen recording**: captures the screen output as a video. Useful for GUI sessions.
- **Session metadata**: captures session metadata (user, target, time, duration). Useful for search and filtering.

The recording is stored in the PAM vault and can be searched and replayed. Search is based on metadata (user, target, time) and, for keystroke logging, on keystroke content.

Limitations:
- **Storage volume**: session recordings consume significant storage. A single hour of screen recording can be gigabytes.
- **Privacy concerns**: recording privileged sessions may capture sensitive data (passwords, personal data). Access to recordings must be controlled.
- **Detection limitations**: recording captures what happened, not why. It cannot detect all malicious activity (e.g., a user who legitimately accesses data they are authorized to access but uses it maliciously).

**Why it matters.** Session recording is a core PAM capability. Understanding its limitations shows you can deploy it responsibly.

**Likely follow-ups.** What is the difference between PSM and session recording? How do you search session recordings?

## Question 8: What is the difference between SCIM and LDAP, and when would you use each?

**Concise answer.** SCIM is a protocol for identity provisioning (creating, updating, deleting users). LDAP is a protocol for directory access (querying and modifying directory entries). Use SCIM for provisioning; use LDAP for authentication and directory queries.

**Detailed explanation.** SCIM (System for Cross-domain Identity Management) is a standard for automating the exchange of user identity information between identity domains. It defines a RESTful API for creating, updating, deleting, and querying users and groups. SCIM is designed for provisioning: it is the glue between HR systems and SaaS applications.

LDAP (Lightweight Directory Access Protocol) is a protocol for accessing and maintaining directory services. It defines how to query and modify directory entries, how to authenticate, and how to search. LDAP is designed for directory access: it is the protocol applications use to authenticate users and query directory information.

Use SCIM when you need to provision users between systems (e.g., HR to SaaS). Use LDAP when you need to authenticate users or query directory information (e.g., application authentication, group membership queries).

**Why it matters.** SCIM and LDAP are often confused, but they serve different purposes. Understanding the difference shows you know identity provisioning and directory access.

**Likely follow-ups.** What is the difference between SCIM and SAML? How does SCIM handle group membership?

## Question 9: How does AWS IAM policy evaluation work, and what is the difference between identity-based and resource-based policies?

**Concise answer.** AWS IAM policy evaluation follows a deny-by-default model: an explicit deny overrides any allow. Identity-based policies are attached to IAM users, groups, or roles. Resource-based policies are attached to resources (e.g., S3 buckets).

**Detailed explanation.** AWS IAM policy evaluation follows these rules:

1. **Default deny**: all requests are denied by default.
2. **Explicit allow**: an identity-based or resource-based policy can allow the request.
3. **Explicit deny**: any explicit deny overrides any allow.
4. **Permissions boundary**: a permissions boundary can further restrict the permissions of an identity-based policy.

Identity-based policies are attached to IAM users, groups, or roles. They define what actions the identity can perform on which resources. Resource-based policies are attached to resources (e.g., S3 buckets, SQS queues). They define which principals can perform which actions on the resource.

The evaluation logic:
1. If there is an explicit deny in any applicable policy, the request is denied.
2. If there is an explicit allow in an identity-based or resource-based policy, and no explicit deny, the request is allowed.
3. If there is no explicit allow or deny, the request is denied (default deny).

**Why it matters.** AWS IAM is the most widely used cloud IAM service. Understanding policy evaluation shows you can design secure IAM policies.

**Likely follow-ups.** What is a permissions boundary? How do SCPs (Service Control Policies) work?

## Question 10: What is the difference between IdP-initiated and SP-initiated SSO, and what are the risks of each?

**Concise answer.** SP-initiated SSO starts at the application (the user clicks "log in"), and the SP sends an AuthnRequest to the IdP. IdP-initiated SSO starts at the IdP (the user clicks a portal link), and the IdP sends an unsolicited assertion to the SP. The risk of IdP-initiated SSO is that the SP cannot verify the assertion corresponds to a specific request.

**Detailed explanation.** In SP-initiated SSO, the user navigates to the application and clicks "log in." The application generates an AuthnRequest and redirects the user to the IdP. The IdP authenticates the user and returns a SAML assertion with an `InResponseTo` field that matches the AuthnRequest `ID`. The SP can verify that the assertion corresponds to a specific request.

In IdP-initiated SSO, the user navigates to the IdP portal and clicks a link to the application. The IdP authenticates the user and sends an unsolicited assertion to the SP. There is no AuthnRequest, so the `InResponseTo` field is absent. The SP cannot verify that the assertion corresponds to a specific request.

The risk of IdP-initiated SSO: an attacker can send a forged assertion to the SP's ACS URL. The SP has no way to verify that the assertion was generated in response to a legitimate user request.

Mitigations for IdP-initiated SSO: validate the `Issuer`, `Audience`, and `NotOnOrAfter` fields. Use a short assertion lifetime (5 minutes or less). Implement audience restriction validation.

**Why it matters.** IdP-initiated SSO is common in enterprise portals. Understanding the risks shows you can deploy it securely.

**Likely follow-ups.** What is the difference between SAML and OIDC? How does OIDC prevent IdP-initiated SSO risks?
