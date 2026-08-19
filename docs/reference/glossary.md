---
title: "Glossary"
description: "Every acronym used on this site, expanded and cross-linked to the page that explains it."
---

# Glossary

Every acronym used elsewhere on this site, expanded and linked to the page that explains it. Definitions here are one-liners; follow the link when you need the detail.

## AAA

**Authentication, Authorization, and Accounting**. The three-step model for how a system decides who you are, what you may do, and what you did. The backbone of how IAM talks about access control. See [The AAA Model](/docs/fundamentals/aaa-model).

## ABAC

**Attribute-Based Access Control**. Access decisions based on subject, resource, action, and environment attributes rather than predefined roles. More granular than RBAC, harder to audit. See [Authorization](/docs/fundamentals/authorization).

## AD

**Active Directory**. Microsoft's directory service for Windows networks, built on LDAP and Kerberos. The dominant on-premises identity store. See [What Is IAM](/docs/fundamentals/what-is-iam).

## ARN

**Amazon Resource Name**. The standardized identifier for every resource and policy in AWS, e.g. `arn:aws:iam::123456789012:role/Admin`. See [Troubleshooting AWS IAM](/docs/scenarios/troubleshooting-aws-iam).

## CPM

**CyberArk Password Manager**. The CyberArk component that stores, rotates, and vaults privileged account passwords. See [CyberArk](/docs/vendors/cyberark).

## DC

**Domain Controller**. The server that authenticates users and machines in an Active Directory domain.

## DN

**Distinguished Name**. The full, unambiguous path of an LDAP entry, e.g. `cn=jsmith,ou=Users,dc=corp,dc=local`. See [LDAP](/docs/protocols-iga/ldap).

## DNS

**Domain Name System**. Translates hostnames to IP addresses; every directory and SSO integration depends on it working.

## EPM

**Endpoint Privilege Management**. The practice and product category for controlling privileges on endpoints (laptops, servers): application control, local admin rights, elevation prompts. See [Vendor Landscape](/docs/vendors/major-vendors).

## HR

**Human Resources**. The source of truth for identity lifecycle events (joiner, mover, leaver) in most IGA designs. See [Identity Lifecycle](/docs/fundamentals/identity-lifecycle).

## IdP

**Identity Provider**. The system that authenticates users and issues assertions or tokens (e.g. Keycloak, Entra ID, Okta). See [SAML](/docs/protocols-iga/saml) and [OIDC](/docs/protocols-iga/oidc).

## IGA

**Identity Governance and Administration**. Identity lifecycle management, access requests, certifications, and SoD checks: the governance half of IAM. See [IGA](/docs/protocols-iga/iga).

## JIT

**Just-In-Time**. Granting privileged access only for the duration of a task, then removing it. The core of modern PAM. See [JIT Access](/docs/pam-core/jit-access).

## JWT

**JSON Web Token**. The signed, self-contained token format that OIDC uses to carry identity claims. See [OIDC](/docs/protocols-iga/oidc).

## LDAP

**Lightweight Directory Access Protocol**. The protocol for reading and writing directory data; the foundation of AD, OpenLDAP, and most directory integrations. See [LDAP](/docs/protocols-iga/ldap).

## LDAPS

**LDAP over TLS**. Directory traffic encrypted with TLS, mandatory in production for credentials and directory data.

## MFA

**Multi-Factor Authentication**. Requiring two or more evidence types (something you know, have, or are) before access. See [Authentication](/docs/fundamentals/authentication).

## MIM

**Microsoft Identity Manager**. Microsoft's on-premises identity management tool (provisioning, sync, self-service), the predecessor of the Entra ID Identity Governance features. See [The Microsoft Stack](/docs/vendors/microsoft-stack).

## NAT

**Network Address Translation**. Lets a lab VM reach the internet while staying isolated; the typical setup for home-lab VMs. See [Home Lab Setup](/docs/labs/home-lab-setup).

## OAuth 2.0

**The authorization framework** that issues scoped tokens for delegated access; OIDC is an identity layer on top of it. See [OAuth 2.0](/docs/protocols-iga/oauth2).

## OIDC

**OpenID Connect**. The identity layer over OAuth 2.0 that standardizes how clients verify users and fetch profile claims. See [OIDC](/docs/protocols-iga/oidc).

## OTP

**One-Time Password**. A single-use code for MFA, usually time-based (TOTP) or sent over SMS/email.

## PAM

**Privileged Access Management**. The controls around privileged accounts: vaulting, session management, rotation, and JIT access. See [What Is PAM](/docs/pam-core/what-is-pam).

## PBAC

**Policy-Based Access Control**. The umbrella term for attribute-and-policy-driven models (ABAC, ReBAC); the current direction of authorization platforms. See [Authorization](/docs/fundamentals/authorization).

## PIM

**Privileged Identity Management**. In Entra ID, the feature for on-demand, time-boxed elevation of Azure AD roles. See [The Microsoft Stack](/docs/vendors/microsoft-stack).

## PIN

**Personal Identification Number**. The knowledge factor used by many PAM session workflows after vault login.

## PKCE

**Proof Key for Code Exchange**. An OAuth extension that protects the authorization code flow on public clients (SPAs, mobile apps). See [OAuth 2.0](/docs/protocols-iga/oauth2).

## PSM

**Privileged Session Manager**. The CyberArk component that brokers and records privileged sessions (RDP, SSH). See [CyberArk](/docs/vendors/cyberark).

## PVWA

**Privileged Vault Web Access**. The CyberArk web portal where users request and retrieve vaulted credentials. See [CyberArk](/docs/vendors/cyberark).

## RBAC

**Role-Based Access Control**. Access granted through roles that bundle permissions; the most common model in enterprise IAM. See [Authorization](/docs/fundamentals/authorization).

## RDP

**Remote Desktop Protocol**. Microsoft's remote desktop protocol; the session type most often brokered and recorded by PAM products.

## SAML

**Security Assertion Markup Language**. The XML-based protocol for browser-based single sign-on between an IdP and a service provider. See [SAML](/docs/protocols-iga/saml).

## SC-300

**Microsoft Certified: Identity and Access Administrator Associate**. The entry-level identity certification for the Microsoft stack. See [Certifications](/docs/careers/certifications).

## SCIM

**System for Cross-domain Identity Management**. The standard for automating user provisioning between systems (HR to directory, directory to SaaS). See [SCIM](/docs/protocols-iga/scim).

## SIEM

**Security Information and Event Management**. The log aggregation and alerting platform that consumes PAM and identity audit logs. See [Incident Response](/docs/scenarios/incident-compromised-privileged-account).

## SMS

**Short Message Service**. Text-message OTP delivery; convenient but phishable, so most MFA guidance prefers app-based or hardware factors. See [MFA Enrollment and Recovery](/docs/scenarios/mfa-enrollment-recovery).

## SoD

**Separation of Duties**. The control that prevents one person from holding conflicting permissions (request and approve, create and audit). See [IGA](/docs/protocols-iga/iga).

## SP

**Service Provider**. The application or service that relies on an IdP for authentication, in both SAML and OIDC. See [SAML](/docs/protocols-iga/saml).

## SSH

**Secure Shell**. The encrypted remote shell protocol; a primary target for PAM vaulting and session recording.

## SSO

**Single Sign-On**. One authentication event giving access to multiple applications. See [SAML](/docs/protocols-iga/saml) and [OIDC](/docs/protocols-iga/oidc).

## TLS

**Transport Layer Security**. The encryption protocol for HTTPS, LDAPS, and everything else that carries identity traffic.

## TOTP

**Time-Based One-Time Password**. OTP codes derived from a shared secret and the current time (RFC 6238); the standard app-based MFA factor. See [JIT Access with MFA](/docs/labs/jit-mfa).

## VPN

**Virtual Private Network**. Encrypted remote access to an internal network; often the outer layer of a zero-trust architecture discussion. See [Zero Trust](/docs/fundamentals/least-privilege-zero-trust).
