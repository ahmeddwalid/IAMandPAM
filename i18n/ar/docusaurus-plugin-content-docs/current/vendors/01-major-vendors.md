---
title: "The Vendor Landscape"
description: "How the identity product categories relate: PAM specialists, the Microsoft stack, cloud IAM, and governance tools."
---
<!-- verified 2026-08-18 -->

# The Vendor Landscape

Every identity product is a concrete implementation of concepts from earlier sections of this site. CyberArk's vault is the [credential vault](/docs/pam-core/core-capabilities) from the PAM architecture; Microsoft's Conditional Access is a policy engine over [authentication](/docs/fundamentals/authentication); SailPoint's certification campaigns are the [IGA loop](/docs/protocols-iga/iga) as a product.

This page maps the four categories so the product pages that follow have a frame to sit in.

## The four categories

| Category | What it sells | Examples | Interview frame |
|---|---|---|---|
| PAM specialists | Vaulting, privileged session management, endpoint privilege control | CyberArk, Delinea, BeyondTrust | "The three problems: shared access, standing privilege, audit gap" ([what is PAM](/docs/pam-core/what-is-pam)) |
| Microsoft stack | Directory, identity, policy, provisioning, joined at the hip | Active Directory, Entra ID, PIM, MIM | "The default: every org already has the directory" |
| Cloud IAM | Per-cloud identity and permission models | AWS IAM + Identity Center, Google Cloud IAM, Azure RBAC + managed identities | "Federation first: the IdP is the authority, the cloud is the enforcement point" |
| Governance tools | Certification, roles, SoD, provisioning workflows | SailPoint, Okta Identity Governance, Saviynt | "The IGA loop as a product" |

Two products you will not find in this section are Okta Workforce Identity and Ping Identity. They are identity providers (IdPs), the category [SAML](/docs/protocols-iga/saml) and [OIDC](/docs/protocols-iga/oidc) pages describe in protocol terms. They matter, but they are the enterprise peers of Entra ID rather than a separate category, and the [Microsoft stack](05-microsoft-stack.md) and [cloud IAM](06-cloud-iam.md) pages cover the IdP role.

## How the categories relate

The diagram on the [complete IAM architecture](/docs/protocols-iga/iam-architecture) page shows the shape of a full identity estate: users, an IdP, directories, and applications. The four vendor categories map onto that picture at different layers:

- **Cloud IAM** is the substrate. Each hyperscaler's native IAM is the enforcement point inside its own cloud, whether or not any other tool exists.
- **The Microsoft stack** is usually the identity authority. Active Directory holds the directory, Entra ID extends it, and Conditional Access enforces policy at sign-in.
- **PAM specialists** sit on top of the identity authority. They manage the privileged accounts that the authority itself cannot fully control, which is why [PAM is not a subset of IAM](/docs/pam-core/what-is-pam).
- **Governance tools** sit even higher. They consume the same accounts and entitlements and run the certification and role processes over them.

A full estate rarely has one of each. A common pattern: Microsoft for identity authority, CyberArk or Delinea for privileged access, SailPoint or Saviynt for governance, and each hyperscaler's native IAM for its own cloud. That is four tools for one problem space, which is why integration points are a real evaluation criterion ([comparison and evaluation](08-vendor-comparison.md)).

## A note on corporate changes

The PAM vendor market consolidated in 2026. Palo Alto Networks completed its acquisition of CyberArk in February 2026; CyberArk's products continue to operate under their own brand and roadmap within Palo Alto Networks. Verify current ownership and product names before citing either in an interview, since this space changes faster than training data does.

Next: [CyberArk](02-cyberark.md), the most complete implementation of the [PAM architecture](/docs/pam-core/pam-architecture) in this section.