---
title: "Official Documentation Links"
description: "Curated links to the standards, vendor documentation, and RFCs this site builds on."
---

<!-- verified 2026-08-19: every URL below returned HTTP 200 on this date -->

# External Links: Official Documentation

The links referenced or implied throughout this site, gathered in one place. Only official sources: vendor documentation, standards bodies, and the relevant RFCs. No aggregators, no summary blogs.

## Standards and specifications

| Source | Covers |
| --- | --- |
| [RFC 6749: The OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749) | The core OAuth spec: roles, grants, endpoints, tokens. |
| [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) | The OIDC spec built on OAuth 2.0: ID tokens, userinfo, flows. |
| [RFC 7643: SCIM Core Schema](https://datatracker.ietf.org/doc/html/rfc7643) | The SCIM data model and protocol for automated provisioning. |
| [RFC 4511: LDAP](https://datatracker.ietf.org/doc/html/rfc4511) | The LDAP protocol definition: bind, search, operations. |
| [RFC 6238: TOTP](https://datatracker.ietf.org/doc/html/rfc6238) | Time-based one-time passwords, the standard app-MFA factor. |
| [RFC 7519: JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519) | The JWT format used by OIDC and most modern APIs. |
| [OASIS SAML 2.0 Core](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf) | The SAML 2.0 specification (PDF). |
| [NIST SP 800-207: Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final) | The reference zero-trust architecture: pillars, tenets, components. |
| [NIST SP 800-63: Digital Identity Guidelines](https://pages.nist.gov/800-63-3/) | Identity assurance, authenticators, and federation guidelines. |

## Microsoft

| Source | Covers |
| --- | --- |
| [Microsoft Entra ID documentation](https://learn.microsoft.com/en-us/entra/identity/) | Entra ID (Azure AD): users, apps, federation, conditional access, governance. |
| [Windows Server identity and access documentation](https://learn.microsoft.com/en-us/windows-server/identity/identity-and-access) | Active Directory, AD DS, Kerberos, GPOs, identity tools. |
| [SC-300: Identity and Access Administrator Associate](https://learn.microsoft.com/en-us/credentials/certifications/identity-and-access-administrator/) | The Microsoft identity certification: exam, skills measured, study links. |

## Open source

| Source | Covers |
| --- | --- |
| [Keycloak documentation](https://www.keycloak.org/documentation) | The server guide, admin REST API, and migration guides for the lab projects. |
| [Keycloak downloads](https://www.keycloak.org/downloads) | Current and archived releases, container images. |

## Cloud IAM

| Source | Covers |
| --- | --- |
| [AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/) | Users, roles, policies, ARNs, permission boundaries. |
| [AWS IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/) | The successor to AWS SSO: permission sets, external IdP federation. |

## PAM and IGA vendors

| Source | Covers |
| --- | --- |
| [CyberArk documentation](https://docs.cyberark.com/portal/latest/en/docs.htm) | Privileged Access Manager, PSM, CPM, EPM, and the Identity Security Platform. |
| [Delinea documentation](https://docs.delinea.com/) | Secret Server, PAM, and DevOps secrets vaulting. |
| [BeyondTrust documentation](https://docs.beyondtrust.com/) | Privileged Remote Access, Password Safe, and identity products. |
| [SailPoint documentation](https://documentation.sailpoint.com/) | IdentityNow and IdentityIQ governance and provisioning. |
| [Okta developer documentation](https://developer.okta.com/docs/) | Okta's API and protocol reference for identity integrations. |

Two notes on currency: vendor doc portals move their URL structure periodically (CyberArk moved to a spaces layout in 2026), so if a link above dies, search the vendor's main site for "documentation" rather than assuming the product changed. Certification prices and names change too; the [certifications page](/docs/careers/certifications) carries its verification date at the top.