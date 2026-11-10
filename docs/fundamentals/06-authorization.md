---
title: Authorization
description: "How access is decided after identity is proven: role-based, attribute-based, and policy-based models, and when each fits."
---

# Authorization

Authorization is the decision about what an authenticated identity may do (stage two of the [AAA model](02-aaa-model.md)). It is a policy question: given the requester, the action, and the resource, is this request allowed? This page covers the main models (RBAC, ABAC, PBAC), how they compare, and how to choose.

## The authorization problem

At its core, authorization is a predicate over context:

> Allow the **subject** to perform **action** on **resource** when **conditions** hold.

Every model in this section is a different way of organizing that predicate. The differences matter because they change who manages the rules, how fast they can change, and whether the rules stay correct as the organization grows.

## Role-based access control (RBAC)

RBAC grants access through roles. A role is a named collection of permissions ("finance-manager"), and users get access by being assigned to roles. The relationship chain is the site's reference diagram:

import Drawio from '@site/src/components/Drawio';
import rbacRel from '!!raw-loader!@site/static/diagrams/rbac-relationship.drawio';

<Drawio content={rbacRel} />

*The RBAC relationship chain: users hold roles, roles carry permissions, permissions apply to resources. Access decisions become role membership checks.*

<a href="/diagrams/rbac-relationship.drawio" download>Download / edit this diagram</a>

RBAC wins because it scales: with thousands of users and hundreds of permissions, granting by role is the only arrangement a human can reason about. Reviews are done per role ("who holds finance-manager?") instead of per permission. Most organizations run RBAC as their base model, including the built-in role structures in directories and cloud platforms (Azure AD roles, AWS IAM roles, Keycloak roles).

Its limits:

- **Role explosion.** Every new combination of needs invites a new role, and role counts grow faster than anyone reviews them.
- **Static structure.** RBAC captures *who you are*; it struggles with *what the situation is*. "Finance-manager" cannot easily express "but not during a blackout window" or "except for accounts in litigation."

## Attribute-based access control (ABAC)

ABAC decides from attributes of the subject, resource, action, and environment, evaluated against policies at request time:

| Attribute class | Examples |
|---|---|
| Subject | Department, clearance level, employment status, device posture |
| Resource | Classification, owner, data sensitivity |
| Action | Read, write, approve, delete |
| Environment | Time, location, network, risk score |

A policy reads like a sentence: *allow read on clinical records where department = cardiology and time is within working hours and device is managed*. The decision is computed per request, so it can react to context without anyone reassigning roles.

ABAC's costs are the mirror image of RBAC's strengths: policy sets need careful design and testing, evaluation engines add infrastructure, and "who can do what" becomes harder to summarize for auditors, because the answer is a computation, not a list. If RBAC is a spreadsheet, ABAC is a program, and programs need tests.

## Policy-based access control (PBAC)

PBAC is the umbrella term for attribute-driven, centrally managed policy authorization, and in practice most modern products implement a blend: RBAC for the coarse structure (roles for job functions) with ABAC policies layered on top for the dynamic conditions (time, location, risk). A claims- or policy-based engine (XACML-style, or cloud-native policy languages) evaluates the combined result.

A common industry pattern is **RBAC for what, ABAC for when**: roles decide the baseline permissions, and attribute policies modulate them per request. This gives the auditability of RBAC with the reactivity of ABAC.

## Static versus dynamic authorization

Two implementation styles sit behind these models:

- **Static (embedded).** Permissions are checked against roles or lists inside the application. Simple, but every application reimplements the decision and drift accumulates.
- **Dynamic (externalized).** The application asks a central decision point (PDP) at request time: "may subject X do action A on resource R given this context?" Policy changes apply everywhere at once, and the decision is auditable centrally.

Externalized authorization is what IGA and zero-trust architectures assume, because it is the only style where one policy change actually reaches every application. The trade-off is a dependency on the policy engine's availability and latency, which is why production deployments cache decisions with short time-to-live instead of querying per request.

## Choosing a model

| Situation | Fits |
|---|---|
| Stable roles, large user base, needs auditability | RBAC |
| Dynamic conditions, cloud-native, fine-grained resources | ABAC / PBAC |
| Regulatory pressure for access reviews | RBAC structure with ABAC conditions on top |
| One application, small team | Start with RBAC; add ABAC only when conditions force it |

The pragmatic default is RBAC as the backbone, ABAC conditions where context matters, and externalized enforcement where the organization spans many applications. Whatever the model, the pattern on this page's diagram holds: the decision chain ends at a policy about a resource, and the discipline (least privilege, reviews) applies to the chain, not just the head of it.

Next section: [Identity Protocols & IGA](../protocols-iga/index.md), the protocols (LDAP, SAML, OAuth, OIDC, SCIM) that move identity and authorization between systems.