---
title: "Identity Analytics and UEBA"
description: "Using behavioral analytics to detect identity risk: peer-group analysis, anomaly scoring, and the operational realities of tuning a system that cries wolf."
---

# Identity Analytics and UEBA

Rule-based detection catches known patterns. Analytics catch the unknown. The admin who has always logged in from Cairo at 8 AM and now logs in from Bucharest at 3 AM is a rule. The admin who has always accessed 5 servers and suddenly accesses 50 is an anomaly.

## The problem

Identity programs generate enormous volumes of log data: every authentication, every access request, every role assignment, every session. Rule-based systems look for specific patterns (impossible travel, off-hours login, privileged group change) and miss everything else. The attacker who does not trigger any single rule but whose behavior is subtly different from their baseline goes unnoticed for months.

UEBA (User and Entity Behavior Analytics) applied to identity data addresses this gap. The "entity" is the account, the service principal, the device. The behavior is the pattern of authentication, authorization, and access over time. The analytics build a baseline of normal behavior and flag deviations from it.

## The signals

Identity analytics systems build baselines from several categories of signal:

### Peer-group analysis

The most powerful signal in identity analytics is the peer group. A user's access pattern is compared to the access patterns of other users in the same role, the same department, the same location. The finance user who suddenly accesses engineering systems is a signal, even if the user has the technical permission to access those systems. The pattern is unusual for the peer group, not for the system.

The peer-group approach catches the compromised credential that is used in ways the legitimate user never used it. The attacker who steals a finance user's credential and uses it to access the source code repository is flagged because no other finance user accesses the source code repository.

### Time-of-day patterns

Every user has a temporal pattern. The help desk agent who works 9 AM to 5 PM, Monday to Friday. The DBA who works 8 AM to 6 PM with occasional evening maintenance windows. The automated service account that runs at 2 AM every night.

Deviations from the temporal pattern are signals. The help desk agent who authenticates at 3 AM on Saturday. The DBA who authenticates at noon on a Sunday. The service account that runs at 4 PM during business hours. Each of these is a signal that contributes to the risk score.

### Resource-access patterns

The set of resources a user accesses is remarkably stable over time. The finance user accesses the ERP system, the expense reporting tool, and the file share for their department. The server admin accesses the management servers, the monitoring system, and the PAM vault.

A sudden expansion of the resource set is a signal. The finance user who accesses the HR database for the first time. The server admin who accesses the domain controller they have never touched. The service account that starts accessing resources outside its normal scope.

### Authentication-method patterns

Users tend to authenticate the same way every day. The Windows user who always uses Windows Hello. The remote user who always uses the VPN with a certificate. The service account that always uses a client secret.

A change in authentication method is a signal. The Windows user who suddenly authenticates with a password. The remote user who authenticates without the VPN. The service account that starts using a certificate instead of a secret.

### Privilege-usage patterns

The way a user exercises their privileges is a pattern. The domain admin who uses PowerShell for Active Directory tasks. The DBA who uses SQL Server Management Studio. The PAM administrator who uses the PVWA web portal.

A change in privilege usage is a signal. The domain admin who starts using `net.exe` commands instead of PowerShell. The DBA who starts using a command-line tool they have never used before. The PAM administrator who exports credentials instead of checking them out one at a time.

## Risk scoring

Each anomaly contributes to a risk score. The score is a weighted sum of the signals, with weights that reflect the severity of the anomaly. Impossible travel is weighted heavily. A new device is weighted moderately. A new resource access is weighted lightly.

The score triggers actions at thresholds:

- **Low score (0-30).** No action. The anomaly is noted in the user's risk profile.
- **Medium score (31-70).** Step-up MFA is required at the next authentication. The user must prove possession of a second factor.
- **High score (71-100).** Session revocation and account disable. The user is locked out until an analyst reviews the case.

The threshold is the key tuning parameter. Too low and the system generates alert fatigue: every user who travels for business triggers a high-priority alert. Too high and the system misses real attacks. The threshold is tuned over time based on the organization's risk tolerance and the analyst team's capacity.

## Operational realities

Identity analytics is not a product you install and forget. It requires ongoing tuning:

### Baselining takes 30-90 days

During the baselining period, the system is learning what "normal" looks like. It cannot detect anomalies because it does not yet know what normal is. During this period, the system is either blind (no detection) or noisy (everything is an anomaly because there is no baseline). Most organizations run the system in "learning mode" for 30-90 days before enabling detection.

### Seasonality matters

Behavior changes with the calendar. Month-end is busy for finance. Quarter-end is busy for sales. Audit season is busy for everyone. The analytics system must account for seasonality or it will generate false positives during predictable busy periods. The finance user who works late at month-end is not an anomaly; it is a pattern.

### The "finance user who suddenly accesses engineering systems" signal is powerful but requires good attribute data

The peer-group analysis depends on accurate role and department attributes. If the attributes are stale or incomplete, the peer groups are wrong, and the analysis produces garbage. The user who changed departments three months ago but whose attribute was not updated is in the wrong peer group and will generate false positives.

### Alert fatigue is the primary failure mode

An analytics system that generates too many alerts is worse than no system at all. The analyst team starts ignoring the alerts, and the real attacks are lost in the noise. The tuning process is iterative: start with a high threshold, review the alerts, lower the threshold gradually until the alert volume is manageable, then maintain.

## What breaks without this

Without analytics, the compromised service account that runs a slightly different command set every night goes unnoticed for months. Every individual action looks legitimate: the service account is allowed to run commands, the commands are within its scope, the timing is consistent. The only signal is the pattern: the command set is slowly expanding, the targets are slowly diversifying, the volume is slowly increasing. Analytics catches the pattern; rules catch the individual actions.

## Honest limits

UEBA products are only as good as the data they ingest. If identity logs are incomplete or inconsistent, the analytics produce garbage. Start with log quality, then add analytics.

The products are also expensive and require skilled analysts to tune and operate. Most organizations start with a handful of manual correlation rules and add a UEBA product as the program matures and the log quality improves.

## What you learned

Identity analytics is the detection layer for the unknown. It complements rule-based detection (which catches known patterns) by building baselines of normal behavior and flagging deviations. The signals are peer-group analysis, time-of-day patterns, resource-access patterns, authentication-method patterns, and privilege-usage patterns. The risk score aggregates the signals and triggers actions at thresholds. And the operational reality is that analytics requires ongoing tuning to avoid alert fatigue.

Next: [DevOps and CI-CD Identity](../labs/08-devops-identity.md), because the analytics principles apply to machine identities as much as human ones.
