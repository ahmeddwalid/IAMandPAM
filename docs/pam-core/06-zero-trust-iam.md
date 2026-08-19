---
title: "Zero-Trust IAM Architecture"
description: "How just-in-time access and the elimination of standing privilege fit a zero-trust identity model."
---

# Zero-Trust IAM Architecture

Zero trust is the operating principle: no implicit trust for any user, device, or network position; every request is verified against identity, device posture, and risk, with continuous monitoring. This page shows what that means for IAM and PAM together, and how the [JIT access](jit-access) pattern is the mechanism that makes "never trust, always verify" work for privileged access.

import Drawio from '../../src/components/Drawio';
import arch from '!!raw-loader!../../static/diagrams/zero-trust-iam.drawio';

<Drawio content={arch} />

*The zero-trust IAM architecture. Every request crosses the policy engine, which consults the identity provider and directory. Privileged requests get a time-boxed grant from the JIT broker, not standing rights. Standing privileged accounts are eliminated, and everything logs to monitoring.*

[Download / edit this diagram](/diagrams/zero-trust-iam.drawio)

## The trust model

Traditional security trusted the perimeter: inside the network, users were trusted by default, and the privileged account was the crown jewel sitting inside the moat. Zero trust removes the moat. The consequences for identity:

- **Identity is the perimeter.** The policy engine is the gatekeeper, and it verifies on every request, not once per login.
- **Device posture is a factor.** A request from an unmanaged, unpatchable device is a different risk from a managed one, and the policy engine treats it that way.
- **Risk is continuous.** The session that was fine at login can be cut at any moment when context changes, which is why the monitoring plane is not decorative.

## Where PAM fits

The privileged account was the sharpest contradiction of the old model: maximum power, minimum verification, standing forever. Under zero trust, privileged access is the case that needs the most rigorous treatment:

- **JIT, not standing.** The [JIT broker](jit-access) issues time-boxed grants. The box on the diagram labeled "standing privileged accounts (eliminated)" is a target, not a description of reality: the architecture is designed to make it empty.
- **Brokered, not direct.** Privileged sessions run through the PAM session manager (the [PAM architecture](pam-architecture) page), so the person, the session, and the actions are all attributable.
- **Verified at request time.** Even an approved JIT grant is issued only after identity, posture, and risk checks pass at that moment.

## The components

**Policy engine.** The decision point for every request: identity (who), posture (what device), risk (what context). It does not trust the user's claim of identity; it re-checks. The engine's checks are: verify identity at the IdP, pull attributes from the directory, evaluate posture and risk signals, and then decide.

**Identity provider + MFA.** The identity source with phishing-resistant MFA. Under zero trust the IdP is not a login page; it is a continuously consulted verification service.

**Directory.** The source of truth for accounts, groups, and attributes. The policy engine reads it on every decision, which is why the directory must be authoritative and clean (the [identity lifecycle](/docs/fundamentals/identity-lifecycle) page is about keeping it that way).

**JIT access broker.** The PAM component: issues temporary, scoped grants for privileged requests and revokes them on expiry. No standing privilege flows through it; that is the point.

**Resources.** Applications, data, infrastructure. Each is protected by the enforcement point: the request only reaches the resource with a valid, policy-approved grant.

**Continuous monitoring & analytics.** The log sink and anomaly detector. Zero trust fails closed on evidence: if the monitoring plane cannot see a session, the session is suspect.

## The verification loop

Every request goes through the same loop, privileged or not:

1. Request arrives at the policy engine.
2. Engine verifies identity (IdP), attributes (directory), posture and risk.
3. Decision: allow, deny, or allow-with-restrictions.
4. Privileged requests additionally route through the JIT broker for a time-boxed grant.
5. Use and outcome are logged to monitoring; anomalies feed back into the risk signal.

The loop is what "never trust, always verify" means operationally: verification is not a login event, it is a per-request, continuous property.

## Standing privilege versus zero trust

A standing privileged account violates zero trust twice: it is implicit trust (the holder is trusted by the account's very existence, without per-request verification) and it is invisible trust (no request, no grant, no log entry precedes its use). Eliminating it is not a zero-trust optional extra; it is the load-bearing wall. The mechanics of the elimination are the [JIT patterns](jit-access): ephemeral groups, time-boxed activation, and brokered sessions.

## Relationship to the other architecture pages

- [IAM architecture](/docs/protocols-iga/iam-architecture): the full identity estate; this page is the zero-trust reading of its privileged slice.
- [PAM architecture](pam-architecture): the component design; this page shows where it sits in the trust model.
- [JIT access](jit-access): the mechanism; this page is why it is non-negotiable.

Next: [Just-in-time access](jit-access), the mechanism that removes standing privilege.