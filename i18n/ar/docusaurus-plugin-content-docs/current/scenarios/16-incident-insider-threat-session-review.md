---
title: "Incident Response: Insider-Threat Session Review"
description: "Reviewing PAM session recordings and logs for insider-threat indicators, and knowing what the recordings can and cannot prove."
---

# Incident Response: Insider-Threat Session Review

The insider threat is the case where the attacker has legitimate credentials, so sign-in logs and authentication controls prove nothing. The evidence is in the sessions: what the account did, on what targets, at what times. This playbook covers how to review [PAM session history](/docs/pam-core/core-capabilities) for insider indicators, and the limits of what the recordings can prove.

## The review trigger

Session review runs in two modes:

- **Scheduled**: a sample of privileged sessions reviewed periodically, prioritized by risk (targets holding customer data, financial systems, domain controllers).
- **Triggered**: a specific session or account reviewed because of a signal: a [certification](05-certification-campaign.md) finding, an [access review](04-privileged-access-request.md) anomaly, a data incident, or an employee separation with a dispute.

## What to look for

The review looks for behavior that authentication cannot detect: the session doing things the account's role does not justify.

**Target anomalies.** The session connected to a target outside the account's normal scope. The account's [role template](/docs/fundamentals/authorization) defines the normal scope; the review compares sessions against it.

**Command and data anomalies.** The session downloaded, copied, or exfiltrated data the role never touches: a support agent querying the payroll database, an engineer exporting the customer list. In database sessions this is the query history; in file sessions it is the copy and download actions; in SSH sessions it is the command stream.

**Timing anomalies.** Sessions at abnormal hours, or sessions that align suspiciously with known events (a pending departure, a data leak announcement, an audit).

**Bypass patterns.** The session that did not need elevation but ran with it, the session on a target reached outside the broker, or the account that requested a [JIT grant](/docs/pam-core/jit-access) on a target it then used abnormally. The bypass is the strongest indicator: the user went out of their way to avoid the controls.

**Credential behavior.** The session that retrieved secrets it had no task for: the vault log shows credential fetches with no corresponding session, or a burst of fetches before an event.

## The review workflow

1. **Pull the session index** for the account or the window: sessions, targets, start and end times, and the recording references.
2. **Filter by the indicators above** before watching anything. The index is the triage; the recordings are the evidence. Reviewing recordings first is how reviews take days.
3. **Examine the flagged sessions**: the metadata, the command or query stream, and the recording where the stream is not conclusive.
4. **Correlate with the surrounding context**: sign-in logs, the account's access requests, the [certification](05-certification-campaign.md) decisions, and any concurrent data events.
5. **Escalate findings** through the incident path, with the session index and the recording references as the evidence package.

## What the recordings can and cannot prove

The limits are as important as the capabilities:

- **The recording proves what the session did on the target through the broker.** It does not prove what the user did outside sessions: on their workstation, on targets without recording, or through channels that never touched the PAM stack. An empty review is a statement about the recorded sessions, not about the user.
- **The recording proves the command stream, not the intent.** A database query proves the data was read; it does not prove the reason. The review establishes what happened; the investigation establishes why.
- **The absence of a recording is a finding.** A privileged session with no recording is either a recording failure, which is a [PAM troubleshooting](10-troubleshooting-pam.md) case, or a session that did not traverse the broker, which is a bypass finding.
- **The recording is evidence, not a verdict.** The review report describes what the evidence shows and what it does not; conclusions about intent belong to the investigation, and the report's credibility depends on staying inside that boundary.

## The report

The review output is a report with the scope (account or window), the sessions reviewed, the indicators checked, the findings with evidence references, and the recommended actions (control changes, further investigation, or clearance). The report feeds the [certification](05-certification-campaign.md) loop and the [compromised account](15-incident-compromised-privileged-account.md) playbook when the finding escalates to an incident.

## Prevention and detection infrastructure

The review is only as good as the data it consumes. The controls that make session review effective: recording enabled on all privileged targets, the vault as the only path to privileged credentials, session index retention long enough to cover investigations, and the [JIT](/docs/pam-core/jit-access) model so that abnormal grants are the exception worth reviewing rather than the norm. The [PAM troubleshooting](10-troubleshooting-pam.md) guide covers keeping the recording pipeline healthy.