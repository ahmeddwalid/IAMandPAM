---
title: "Identity Threat Detection and Response"
description: "How identity-specific detection differs from generic SIEM monitoring, the signals that matter, and the playbooks for identity-based attacks."
---

# Identity Threat Detection and Response

Identity Threat Detection and Response (ITDR) is the practice of detecting and responding to attacks that target the identity infrastructure itself: the identity provider, the directory, the PAM vault, the federation trust. Not just attacks that use compromised credentials downstream, but attacks that compromise the systems that issue and validate those credentials.

## Why generic SIEM misses identity attacks

A SIEM is designed to correlate events from many sources and find patterns that indicate compromise. It looks for malware signatures, network anomalies, unusual process execution, and known-bad IPs. It is good at detecting the attacker who has already breached the perimeter and is moving laterally.

Identity attacks look different. They look like legitimate logins from legitimate accounts at legitimate times. The attacker who steals a session token and presents it from a residential IP in the same city as the user does not trigger a network anomaly. The attacker who requests a certificate for a service account at 2 AM triggers a certificate event, but the SIEM has no rule for "certificate request for a service account outside business hours" because that rule is identity-specific.

The signal is in the identity logs: IdP sign-in logs, directory replication events, PAM session records, certificate authority logs, federation trust change logs. These logs are often not ingested by the SIEM, or they are ingested but not correlated with the identity context that makes them meaningful.

## The signal categories

ITDR detection is organized around four categories of signal:

### Authentication anomalies

The login itself is unusual:

- **Impossible travel.** The user authenticates from Cairo at 9:00 and from Bucharest at 9:30. The travel time between the two cities is 2 hours. The authentication is impossible.
- **Unfamiliar features.** The user has always authenticated from a Windows 10 machine in the Cairo office. Today they authenticate from a Linux machine in a cloud region the company does not use. The device, the OS, the location, and the network are all new.
- **Token replay.** The same access token is presented from two different IPs within a short window. The token is being used by two clients, which means it has been stolen and replayed.
- **MFA fatigue.** The user denies 15 MFA push notifications in a row, then approves the 16th. The attacker was hoping the user would eventually approve out of frustration or confusion.
- **Legacy auth usage.** The user has always authenticated with modern auth (OAuth/OIDC). Today they authenticate with IMAP using a basic auth password. Legacy auth does not support MFA and is a common fallback for attackers.
- **Certificate-based auth from new devices.** The user has always authenticated with a certificate issued to their managed device. Today a certificate is presented from a device that has never been seen before.

### Authorization anomalies

The access decision is unusual:

- **Role activation outside business hours.** The user activates a PIM role at 3 AM on a Sunday. The role is normally activated during business hours on weekdays.
- **JIT grants to unusual targets.** The user requests JIT access to a server they have never accessed before. The request is approved, but the target is outside the user's normal scope.
- **SoD violations in real time.** The user is assigned two roles that are supposed to be mutually exclusive. The assignment happens outside the normal provisioning process.
- **Group membership changes to privileged groups.** A user is added to a privileged group by an account that is not the normal provisioning account. The change happens outside the change window.

### Infrastructure anomalies

The identity infrastructure itself is being modified:

- **Directory replication from non-DCs.** A computer that is not a domain controller requests directory replication. This is the DCSync attack: the attacker is requesting replication to extract password hashes.
- **KRBTGT password reset outside change window.** The KRBTGT account password is reset outside the scheduled rotation window. This is either a golden ticket attack or a misconfigured automation.
- **Federation trust modification.** A federation trust is added, modified, or removed. The change is not associated with a planned integration.
- **PAM vault export.** A user exports a large number of credentials from the PAM vault. The export is not associated with a planned migration.
- **New app registration with high permissions.** A new application registration is created with high-permission API scopes (Mail.Read, Directory.Read.All). The registration is not associated with a planned deployment.

### Behavioral anomalies

The user's behavior has changed:

- **Access to resources the user has never touched.** The user accesses a file share, a database, or a server they have never accessed before. The access is not associated with a role change or a project assignment.
- **Volume spike in data access.** The user downloads 10 times their normal volume of data from a sensitive repository.
- **Session recording shows unusual commands.** The PAM session recording shows commands the user's role does not normally run. A server admin running `net group "Domain Admins" /domain` is a signal.

## Detection architecture

The detection pipeline for ITDR:

1. **Identity logs are centralized.** Entra ID sign-in logs, AD security events, PAM session records, VPN logs, SaaS app logs, certificate authority logs. All of them go to a single log aggregator (SIEM or dedicated ITDR platform).
2. **Correlation rules are identity-specific.** The rules are written against the identity context: user, role, device, location, time, resource. The rules are not generic network or endpoint rules.
3. **Risk scoring aggregates signals.** Each anomaly contributes to a risk score for the user, the session, or the device. The score is updated in real time as new signals arrive.
4. **Alerts are prioritized by risk.** A single anomaly (impossible travel) is a medium-priority alert. Multiple anomalies (impossible travel + token replay + new device) is a high-priority alert.
5. **Automated responses are scoped.** High-risk alerts can trigger automated responses: session revocation, step-up MFA, account disable. The responses are scoped to the affected identity and do not impact other users.

## Playbooks

The detection is only half the job. The response is the playbook:

- **Compromised privileged account.** Follow the [existing playbook](../scenarios/incident-compromised-privileged-account): disable the account, terminate sessions, revoke MFA, rotate credentials, cut downstream access, preserve evidence.
- **DCSync detection.** Immediate Tier 0 containment. Rotate the KRBTGT password twice (the second rotation invalidates the first rotation's output, so the attacker's extracted hashes are useless after the second rotation). Wait 10 hours between rotations for replication to complete.
- **Federation trust modification.** Treat as Tier 0 compromise. Verify every federation trust and certificate. Remove any trust that was not planned. Rotate the federation signing certificate.
- **MFA fatigue.** Revoke all sessions for the affected user. Require phishing-resistant re-enrollment (a new hardware key or passkey, not a new phone number). Review the user's recent activity for any actions taken after the approved push.

## What breaks without this

Without ITDR, an attacker who compromises the IdP can create backdoor accounts, modify federation trusts, and exfiltrate tokens for weeks before anyone notices. The activity looks like admin work: account creation, trust modification, token issuance. The SIEM does not flag it because the SIEM does not understand the identity context.

With ITDR, the same activity triggers alerts: account creation outside the provisioning process, federation trust modification outside the change window, token issuance to an unknown application. The alerts are prioritized by risk, and the playbooks ensure the response is fast and complete.

## Honest limits

ITDR tools are newer and less mature than EDR. The market is still consolidating, and the products vary widely in their coverage of identity logs and their correlation capabilities. Most organizations start with manual log review and a handful of correlation rules, then add a dedicated ITDR platform as the program matures.

The prerequisite is log quality. If identity logs are incomplete, inconsistent, or not centralized, the ITDR platform has nothing to correlate. Start with log quality, then add detection.

## Architecture

import Drawio from '../../src/components/Drawio';
import itdrFlow from '!!raw-loader!../../static/diagrams/itdr-workflow.drawio';

<Drawio content={itdrFlow} />

[Download / edit this diagram](/diagrams/itdr-workflow.drawio)

The ITDR pipeline: identity logs flow into the SIEM or ITDR platform, correlation rules evaluate them against identity context, risk scoring aggregates the signals, and alerts are prioritized for the analyst. High-risk alerts can trigger automated responses (session revocation, step-up MFA) without analyst intervention.

## What you learned

ITDR is the detection layer for the identity infrastructure. It is distinct from generic SIEM monitoring because it requires identity-specific logs, identity-specific correlation rules, and identity-specific playbooks. The four signal categories (authentication, authorization, infrastructure, behavioral) cover the full range of identity attacks. And the honest limit is that ITDR is only as good as the logs it ingests.

Next: [Identity Analytics and UEBA](../fundamentals/identity-analytics), because ITDR detects known attack patterns and analytics detect the unknown.
