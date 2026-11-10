---
title: "Complete IAM Architecture"
description: "The full identity stack in one diagram: users, identity provider, directory, applications, IGA, and audit, with the protocols between them."
---

# Complete IAM Architecture

This page assembles everything in this section into one view: the full identity stack, from users through the identity provider to applications, with the directory, governance, and audit layers around it. It is the reference picture for the rest of the site: every later section (PAM, zero trust, vendor architecture, labs) describes a variation or a slice of this picture.

import Drawio from '@site/src/components/Drawio';
import arch from '!!raw-loader!@site/static/diagrams/iam-architecture.drawio';

<Drawio content={arch} />

*The complete IAM architecture. Users authenticate at the identity provider; the IdP federates to applications over OIDC, SAML, or OAuth 2.0, reads from the directory over LDAP, provisions with IGA over SCIM, and ships everything to audit.*

[Download / edit this diagram](/diagrams/iam-architecture.drawio)

## Walking through the diagram

**Users to IdP.** Every user type (employees, partners, customers) funnels through the identity provider. This is the deliberate concentration of the SSO design: one place that enforces authentication policy, MFA, and device posture. The strength of everything downstream depends on how well this point is protected, because a compromised IdP session is a session to every application behind it.

**IdP to applications.** The application landscape is heterogeneous and the protocol follows the app:

- Web apps speak **OIDC**: modern, JSON-based, natural fit for SPAs and API-backed pages.
- SaaS apps speak **SAML**: the enterprise common denominator, still what most SaaS catalogs expect.
- APIs speak **OAuth 2.0**: scoped access tokens validated by the resource server.
- Legacy apps speak **LDAP bind**: the last mile for applications that predate federation, where the IdP acts as an LDAP proxy or the app binds directly to the directory.

One IdP, four protocols, one trust model. The protocol per application is an integration decision, not an architecture decision, which is why the IdP is drawn as a single box speaking all of them.

**IdP to directory.** The IdP reads from the identity directory (LDAP/AD DS) for bind and search: who exists, what groups they hold. The directory is the store; the IdP is the gate. A common architectural question is which is authoritative; the answer in mature stacks is that the directory stays authoritative for identity facts, while the IdP owns authentication policy and application-facing claims.

**IGA to IdP.** IGA decides what access should exist (requests, certifications, SoD, covered on the [IGA page](06-iga.md)) and pushes changes to the IdP over **SCIM**, which propagates them to applications. This is the governance loop in action: the same conveyor belt carries joiner, mover, and leaver events into every connected system.

**Everything to audit.** The IdP and the applications stream logs to the SIEM/audit store: authentication events, token issuances, administrative changes, provisioning actions. This is the accounting leg of the [AAA model](../fundamentals/02-aaa-model.md), and it is what makes access reviews and incident investigations possible. The audit store must be protected from the very admins it watches, or it becomes evidence of nothing.

## What this diagram leaves out

The complete picture is deliberately the *identity* architecture; the *privileged* subset has its own architecture with its own diagram in [PAM Core](../pam-core/index.md): vaults, session managers, and just-in-time elevation are additions to this base, not replacements for it. Similarly, this diagram assumes a single trust domain; the [Vendor Landscape](../vendors/index.md) section adds the hybrid on-premises/cloud variant.

This is also the architecture that the hands-on [labs](../labs/index.md) recreate at small scale, so the diagram doubles as the roadmap for the practical work later on the site.

Next section: [PAM Core](../pam-core/index.md).