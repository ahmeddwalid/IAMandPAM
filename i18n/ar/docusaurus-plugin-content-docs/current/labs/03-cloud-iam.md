---
title: Lab 3 - Cloud IAM Federation
description: "Stand up AWS Organizations with IAM Identity Center, federate it to your company identity provider, and control access with permission sets instead of long-lived IAM users."
---

# Lab 3 - Cloud IAM Federation

## What this lab proves

The cloud re-orders identity: instead of one directory and many apps, you have one cloud organization with many accounts, and the interesting problem is who can reach which account with what rights. This lab builds the standard AWS pattern: AWS Organizations with a management account and member accounts, IAM Identity Center as the cloud-side identity layer, your Keycloak from Lab 1 as the identity source, and permission sets that scope what a federated user can do. The result is no IAM users in the member accounts at all.

## Architecture

import Drawio from '@site/src/components/Drawio';
import simpleGraph from '!!raw-loader!@site/static/diagrams/lab-2-cloud-iam.drawio';

<Drawio content={simpleGraph} />

<a href="/diagrams/lab-2-cloud-iam.drawio" download>تنزيل هذا المخطط أو تعديله</a>

The company IdP federates into IAM Identity Center (SAML), Identity Center maps groups to permission sets, and permission sets grant short-lived roles in the member accounts. Nobody holds long-lived IAM user credentials in the member accounts.

## Prerequisites

- An AWS account with the Free Tier (new accounts get 12 months). You will spend no meaningful money if you stop or delete what you create; the note under Step 5 covers the few things that can cost.
- The Keycloak `corp` realm from Lab 1, with the `lab-users` group and its members `alice` and `bob`.
- An email address you can receive mail at (Identity Center needs it for invitations if you use its built-in directory; with federation you can skip most of that).

## Step 1 - Create the organization and member accounts

1. In the AWS console, search for **AWS Organizations**, open it, and choose **Create an organization**. This creates the management account (your current account) and enables consolidated billing.
2. From the **Accounts** tab, choose **Add an AWS account** → **Create an AWS account**:
   - Account 1: name `dev`, email `dev+lab@your-domain.example`, and a strong root password.
   - Account 2: name `prod`, email `prod+lab@your-domain.example`.
3. Wait for both accounts to appear with status Active (this can take a few minutes). Do not log into them directly; everything from here happens from the management account.

## Step 2 - Enable IAM Identity Center

1. Search for **IAM Identity Center** and choose **Enable**. If the console offers "Enable with AWS Organizations", accept: Identity Center needs the organization.
2. Under **Settings → Identity source**, the default is the Identity Center built-in directory. Switch to **External identity provider** and download the **IdP metadata** file (the SAML metadata AWS will send to Keycloak). Note the **AWS access portal URL**; that is where federated users sign in.

## Step 3 - Register AWS as a SAML client in Keycloak

1. In the Keycloak admin console, under **Clients**, create a client:
   - Client type: SAML.
   - Client ID: `https://portal.sso.awsapps.com` (use the AWS access portal URL from Step 2).
2. In the client's **Settings** tab, set **Client signature required: Off** (Identity Center signs its own requests), **Sign documents: Off**, and **Force POST binding: On** (Identity Center uses POST bindings).
3. Upload the IdP metadata: in the client, use the **Import** action and select the file downloaded from AWS. Keycloak fills in the endpoints automatically.
4. The exact configuration values that AWS publishes in the Identity Center settings, the login and logout URLs, are in the **SAML 2.0 metadata** file; Keycloak's import handles them, but verify they match what AWS shows under the identity provider source settings.

## Step 4 - Export Keycloak's IdP metadata to AWS

1. In Keycloak, open **Realm settings → SAML 2.0 identity provider metadata** and click **Download** (or open the export URL shown there).
2. In IAM Identity Center, under **Identity source → External identity provider**, upload this metadata as the IdP metadata file and save. AWS shows the two URLs (single sign-on and single logout) and the signing certificate it extracted.
3. To make the lab usable with real users, map the attribute Identity Center expects. Under the Keycloak client's **Mapper** tab, ensure a mapper emits the **NameID** as the username (`sAMAccountName`), which Identity Center reads as the federated user identifier.

## Step 5 - Create permission sets

1. In Identity Center, under **Permission sets**, choose **Create permission set**.
2. Create two:
   - `ViewOnly`: select **Predefined → ViewOnlyAccess**.
   - `PowerUser`: select **Predefined → PowerUserAccess**.
3. Under **Session duration**, set 1 hour for both. This is where the short-lived credential behavior becomes visible: AWS issues temporary credentials that expire on this schedule, unlike an IAM user's long-lived keys.

## Step 6 - Assign access to accounts

1. Under **AWS accounts**, open `dev`, choose **Assign users or groups**, and select the group `lab-users` (the group appears because Identity Center reads it from the federated provider; if you used the built-in directory, create the group there instead).
2. Attach the `PowerUser` permission set to the dev account and `ViewOnly` to the prod account.
3. Repeat the assignment for the prod account with `ViewOnly`.

## Step 7 - Sign in through the access portal

1. Open the **AWS access portal URL** from Step 2 in a private window.
2. It redirects to Keycloak; sign in as `alice` (the AD account from Lab 1, since Keycloak is federated to AD).
3. After the redirect back, the portal lists the dev and prod accounts with their assigned roles. Click the role for dev: you land in the AWS console as a role in the dev account.
4. In the console, open the account menu (top right). It shows "IAM role" with the role name from the permission set, not an IAM user. Confirm there is no IAM user for alice in the dev account: **IAM → Users** is empty, or only shows the original account's root user if you created one.

## Verification checklist

- [ ] AWS Organizations shows `dev` and `prod` accounts with Active status.
- [ ] Identity Center reports the external IdP as configured and the connection test passes.
- [ ] The access portal redirects through Keycloak and accepts `alice` / the AD password.
- [ ] `dev` grants the PowerUser role and `prod` grants ViewOnly, and the two consoles behave differently (prod rejects an attempt to create resources).
- [ ] No IAM users exist in the member accounts.
- [ ] After 1 hour, the portal role session expires and re-entry issues new credentials.

## Common pitfalls

- **"Cannot sign in" from the access portal with a generic error.** Most often the SAML client config in Keycloak (binding, signature requirements) or a NameID mapper missing. Check the Keycloak client logs and re-import the metadata from AWS.
- **The group `lab-users` is missing in Identity Center.** If the identity source is the built-in directory, groups must be created there, not in Keycloak. If federated, verify the group attribute is included in the SAML assertion (the group mapper on the Keycloak client).
- **Permission set shows "Attach AWS managed policy" only.** The predefined permission sets map to AWS managed policies; custom inline policies are also available, but for the lab predefined is the clearest.
- **Billing anxiety.** The services used here (Organizations, Identity Center, SAML federation) are not metered in a meaningful way for this lab. The member accounts are Free Tier eligible; the classic cost risk is EC2 or RDS resources you start inside them. Create nothing in the member accounts beyond the console itself.

## What you learned

Cloud identity inverts the LDAP lesson from Lab 2: the cloud account structure is the security boundary, and identities are imported into it rather than owning it. Permission sets are the cloud equivalent of roles that the IdP's groups map onto, and session duration is the operationalized version of least privilege: access that expires by default. When interviewers ask "how would you give a consultant 24 hours of read-only access to prod", the answer is the pattern you just built: group membership on the IdP side, a time-boxed permission set on the cloud side.

Next: [Lab 4 - PAM fundamentals on a trial](04-pam-trial.md).