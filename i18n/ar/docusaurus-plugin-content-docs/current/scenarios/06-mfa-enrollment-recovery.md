---
title: "MFA Enrollment and Recovery"
description: "MFA enrollment and recovery scenario: first enrollment, re-enrollment on new devices, lost-device recovery, and the friction trade-offs."
---

# MFA Enrollment and Recovery

Multi-factor authentication only protects what is enrolled. The enrollment flow decides how many users actually adopt it, and the recovery flow decides what happens when the factor is lost. Both are identity scenarios with real failure modes, and both are usually under-designed.

## First enrollment

The enrollment window is the moment of maximum friction, so it is designed to be small and guided:

1. The user signs in with password. The IdP detects no registered factor and routes to enrollment.
2. The user registers a primary factor: an authenticator app, a hardware key, or a phone number for SMS. Policy should prefer the strongest factor the population can support; authenticator apps or hardware keys over SMS where possible, because [SMS is the weakest practical factor](/docs/fundamentals/authentication) due to SIM swap attacks.
3. The IdP performs an **enrollment proof**: a one-time challenge that proves the user controls the factor. For an authenticator app this is the QR code scan plus a verification code entry. The proof prevents a factor being registered to an account the attacker cannot access.
4. The user registers a backup: a second factor or a set of recovery codes. The backup is not optional, because the primary factor will be lost eventually.
5. The user completes a real sign-in with the new factor. Nothing convinces like the first successful use.

Enrollment should be **self-service with escalation**: the user can complete it alone, and if the flow fails, support can complete it after identity verification. An enrollment flow that requires a ticket for every user will have an adoption rate that matches the ticket queue.

## Re-enrollment on a new device

The phone with the authenticator app is the most commonly lost factor. The recovery flow must exist before the loss, not be invented when it happens:

1. The user reports the lost device or requests recovery through self-service.
2. The IdP verifies identity out of band: knowledge questions, a previously registered backup factor, or approval from the manager for higher-risk accounts. The verification strength should match the account risk. A domain admin's MFA reset should not be approved by a knowledge question a coworker could answer.
3. The IdP revokes the old factor registrations and issues new enrollment. Revocation of the old registrations is the step that actually closes the risk: a lost phone with a live authenticator is an attack surface, not an inconvenience.
4. The user completes first enrollment again, including a new backup.

The risk window is the period between the reported loss and the revocation. IdPs that delay revocation while "investigating" leave the lost factor live. Revoke first, investigate in parallel.

## What good recovery is not

- **Support re-registers without identity verification.** The attacker who has the password and the victim's identity details gets the factor reset and owns the account. This is the classic MFA bypass chain: password reset plus support-assisted factor reset.
- **Recovery codes stored where the attacker looks.** Codes emailed to the account mailbox, saved in the browser, or photographed are credentials stored next to the thing they protect. The [troubleshooting guide](13-troubleshooting-mfa.md) covers the failure modes in detail.
- **A recovery flow that loops back into the same factor.** The user who lost the phone should not have to approve recovery from the lost phone.

## The enrollment data that matters

- **Adoption rate**: the share of the population with a registered factor. Below 95%, the missing 5% are the accounts that will be attacked first.
- **Factor mix**: how many users hold hardware keys versus SMS. A workforce that is 80% SMS is a workforce that is 80% phishable at the second factor.
- **Recovery rate**: how many resets happen per month and what share of them went through identity verification. A spike in resets with no verification is an incident signal, not a metric.

## Relationship to the other scenarios

MFA enrollment is the first thing a [joiner](01-onboarding.md) does and the last thing a [leaver](03-termination.md) has revoked. The recovery flow is the same flow a [compromised account](15-incident-compromised-privileged-account.md) incident uses when the attacker owns the factor: revocation, not recovery.

## Next

The integration scenario, [SaaS SSO integration](07-saas-sso-integration.md), shows how MFA policy and provisioning extend to a new cloud application.