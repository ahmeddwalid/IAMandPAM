---
title: "SaaS SSO Integration"
description: "Onboarding a new SaaS application: SAML or OIDC SSO, SCIM provisioning, attribute mapping, and the acceptance checklist."
---

# SaaS SSO Integration

The most common integration project in modern identity work is connecting a new SaaS application to the corporate identity platform: sign in with the IdP instead of a local password, and provision users automatically. This page walks the integration from the SAML metadata exchange to the production rollout.

## The integration sequence

1. **Application inventory decision.** Before configuration, decide what the app is for: who uses it, what data it holds, and what risk level that implies. The risk level drives everything downstream, including whether the integration needs MFA and [privileged access](/docs/pam-core/what-is-pam) treatment. An app with customer data gets a higher bar than a team wiki.
2. **Authentication protocol choice.** Most SaaS apps support [SAML 2.0](/docs/protocols-iga/saml) or [OIDC](/docs/protocols-iga/oidc). The decision is usually dictated by the app: SAML for traditional enterprise apps, OIDC for developer-oriented ones. The [protocol comparison](/docs/protocols-iga/saml) page covers the trade-offs.
3. **Metadata exchange.** The IdP publishes a metadata endpoint; the app publishes its own. The integration consumes the app's assertion consumer URL and certificate, and the app consumes the IdP's signing certificate and entity ID. Getting the certificate and the endpoints from the vendor's official documentation, never from a random blog, is the accuracy baseline.
4. **Attribute mapping.** The app needs to know who is signing in. The assertion carries the NameID (usually the email or the directory user principal name) and whatever attributes the app requires: first name, last name, department, role. The mapping table is the integration's contract. A wrong attribute name means authentication succeeds but the app cannot identify the user.
5. **SCIM provisioning.** With SSO working, enable [SCIM](/docs/protocols-iga/scim) so users appear and disappear automatically: the IdP pushes users and group memberships to the app's SCIM endpoint. The provisioning token and the endpoint URL are exchanged once, securely. The [SCIM troubleshooting guide](14-troubleshooting-scim.md) covers what breaks.
6. **Policy application.** The IdP applies [conditional access](/docs/fundamentals/authentication) style rules to the app: MFA required, trusted locations only, session timeout. The app's local password option is disabled once SSO is verified, because a local password fallback is a backdoor around the entire integration.
7. **Rollout and verification.** Pilot with the integration team, verify sign-in, provisioning, and deprovisioning (create a test user, watch it provision, delete it, watch it deprovision). Then enable for the population and check the sign-in logs for failures in the first week.

## The acceptance checklist

Before the integration is declared done, verify:

- **Sign-in works through SSO with MFA.** The app never sees a password.
- **Local password login is disabled.** If the app has no option to disable it, the app is not compliant and the integration is a paper tiger.
- **Provisioning works both ways.** New users get accounts, group changes propagate, deprovisioning removes access. The leaver scenario depends on this: a SaaS app with orphaned accounts is a [termination](03-termination.md) liability.
- **Attributes are correct for every role**, not just the pilot users. The department attribute that exists for engineering may be empty for finance.
- **Session lifetime is set.** The app's idle timeout and the IdP's session policy agree; an app with a permanent session defeats the IdP's session controls.
- **Service accounts are in the vault.** If the integration needs a technical account, such as a privileged app admin role, that credential lives in the [vault](/docs/pam-core/core-capabilities), not in a shared document.

## Failure modes

- **The metadata mismatch.** The IdP signs with certificate A, the app validates against certificate B, and sign-in fails with a signature error. The [SAML troubleshooting guide](12-troubleshooting-saml.md) has the diagnosis path.
- **The attribute gap.** Authentication succeeds and the app says "user not found", because the app expects `userPrincipalName` and receives `email`. Attribute mapping errors are the most common SAML failure after signature problems.
- **Provisioning enabled, mapping wrong.** SCIM pushes users with `userName` in one format and the app matches on `externalId`, producing duplicate users with every sync. The uniqueness mismatch is a classic SCIM failure covered in [the guide](14-troubleshooting-scim.md).
- **The local fallback left on.** SSO rolls out, local passwords are never disabled, and six months later a breach is traced to a local account created before the integration. The checklist exists for this exact outcome.

## Next

With all scenarios covered, the section moves to the reference material: the [troubleshooting guides](08-troubleshooting-ldap.md), starting with LDAP bind failures.