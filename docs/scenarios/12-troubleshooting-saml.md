---
title: "Troubleshooting: SAML Assertion Errors"
description: "SAML 2.0 assertion failures: signature validation, audience mismatch, attribute mapping, and clock skew."
---

# Troubleshooting: SAML Assertion Errors

SAML failures happen at one of two points: the service provider rejects the assertion during validation, or it accepts the assertion but cannot map it to a user. The first group is certificate and XML work; the second is attribute work. This guide covers both. The concepts come from the [SAML overview](/docs/protocols-iga/saml); the message formats shown are typical of common implementations, and the exact wording varies by vendor.

## Pattern 1: Signature validation failure

**Symptoms.** The SP rejects the assertion with an error naming the signature, for example:

```
Signature validation failed for SAML assertion
```

or a certificate error in the SP logs.

**Root causes.**

- **The SP has the wrong signing certificate.** The IdP rotated its signing certificate and the SP still holds the old one. This is the most common SAML outage and the reason certificate rotation is a coordinated process, not an IdP-side change.
- **The metadata was never updated** after the certificate change. The SP validates against the certificate in its stored metadata.
- **The clock is wrong on either side**, which fails validation in a different way (see Pattern 4).

**Resolution.** Confirm which certificate the IdP is currently signing with, confirm which certificate the SP holds in its metadata, and update the SP to the current certificate. The [certificate guide](09-troubleshooting-certificates.md) has the inspection commands. For the coordination problem, rotate with overlap: publish the new certificate in metadata while the old one is still valid, let the SPs pick it up, then retire the old one.

## Pattern 2: Audience or destination mismatch

**Symptoms.** The SP rejects the assertion with an error naming the audience or recipient, for example:

```
The 'AudienceRestriction' condition was not met
```

or `Invalid audience for this response` in the SP log.

**Root causes.** The IdP is configured with an entity ID or audience value that does not match the SP's own entity ID. This happens when the IdP's application entry was created with a placeholder audience value, or when the SP changed its entity ID (for example, moving to a new region or a new custom domain) and the IdP was not updated.

**Resolution.** Compare three values: the SP's own entity ID, the audience value in the IdP's application configuration, and the `AudienceRestriction` in an actual assertion. The mismatch is between the first two; the fix is updating the IdP's configuration. The same check applies to the assertion consumer URL: the SP's ACS endpoint must match the destination in the response. An assertion that passes signature but fails audience is always a configuration comparison, never a code problem.

## Pattern 3: Attribute mapping errors

**Symptoms.** Authentication succeeds, then the SP fails with "user not found", "no user with this identifier", or a provisioning error. The assertion is valid; the user is simply not identified.

**Root causes.**

- **The NameID format or value does not match what the SP expects.** The IdP sends `email` where the SP expects the persistent ID, or the NameID is the UPN when the SP looks up by email.
- **A required attribute is missing or has a different name.** The SP expects `userPrincipalName` or `employeeNumber`; the IdP sends `mail` and `displayName`. The assertion contains the data, but under names the SP does not read.
- **The attribute value format differs.** The SP expects a normalized email and receives a display name, or the department value is empty for some users, producing a blank mapping.

**Resolution.** Capture an actual assertion (the IdP and most SPs can expose the last assertion, often via a debug endpoint or by logging the response) and inspect it: the NameID and the attribute statement. Compare each attribute name and value against the SP's mapping configuration. The fix is on one side or the other: change the IdP's attribute mapping to emit the expected names, or change the SP's mapping to read the names actually sent. Then test with a second user: attribute gaps are frequently role-specific, so the pilot user is not a sufficient test.

## Pattern 4: Time validation failures

**Symptoms.** The SP rejects with a time error, for example:

```
The SAML assertion is not valid: NotBefore / NotOnOrAfter
```

or "assertion expired" immediately after issuance.

**Root causes.** Either the clock is wrong on the SP or the IdP, or the IdP issued an assertion with a very short lifetime and the network path added latency. The common case is clock skew: the SP's clock is ahead of the IdP's, so the assertion's `NotOnOrAfter` is already in the past, or behind, so the `NotBefore` is still in the future.

**Resolution.** Check the clocks on both servers and fix the skewed one with time sync. Confirm the IdP's assertion lifetime is sane (a few minutes, not seconds). Then re-test. Clock problems also produce [certificate errors](09-troubleshooting-certificates.md), so a wrong clock on the SP can manifest as either failure.

## Pattern 5: Relay state and post-login failures

**Symptoms.** Authentication succeeds, then the SP errors during the post-login redirect, or drops the user at a generic error page.

**Root causes.** The `RelayState` value is corrupted or expired, or the SP's post-authentication session creation fails. This is often the SP's own session handling, not SAML: the SP authenticated the assertion but could not create its session, which is an SP-side session or cookie problem.

**Resolution.** Reproduce and inspect the SP's post-auth logs. The distinction that matters: did the SP accept the assertion (the SAML part succeeded) or reject it (validation failed)? The error page rarely says; the SP logs do.

## Prevention

- **Certificate rotation drills** with the overlap pattern, rehearsed before a real rotation.
- **A test user per role** in the integration acceptance checklist, so attribute gaps surface at integration time rather than on the first real user.
- **Assertion inspection as a standard skill**: every identity engineer should be able to capture and read an assertion, because every SAML failure eventually resolves to reading one.

## Related

- [Certificate mismatches](09-troubleshooting-certificates.md) for the signature failures.
- [SaaS SSO integration](07-saas-sso-integration.md) for the acceptance checklist that prevents most of these at rollout.