---
title: Measuring an IAM Program
description: "The metrics that show an identity program is working: coverage, lifecycle, review, and detection measures, defined with formulas and honest baselines."
---
<!-- verified 2026-08-19: IAM program metric definitions are presented as operational definitions, not sourced industry benchmarks; no fabricated averages or external statistics. -->

# Measuring an IAM Program

Security teams are asked "how is identity doing?" and the honest answer needs numbers, not anecdotes. This page defines the metrics that actually measure an IAM program, why each one matters, and how to avoid the measurement traps that make dashboards decorative. The definitions are operational: formulas and data sources, deliberately without fabricated industry benchmarks, because a benchmark you cannot source is worse than a baseline you built yourself.

## The four metric families

| Family | What it measures | Example metrics |
|--------|------------------|-----------------|
| Coverage | How much of the environment is governed | MFA coverage, privileged account coverage, accounts in the directory vs in the register |
| Lifecycle | How fast and completely identities move | Time to provision, time to deprovision, orphan accounts |
| Review | Whether access stays correct | Certification completion, open SoD conflicts, standing privilege counts |
| Detection | Whether misuse is seen | Time to detect anomalous sign-in, alert volume, repeat findings |

The rule of the four families: coverage and lifecycle measure *completeness*, review measures *correctness*, and detection measures *speed*. A program can be complete and correct and still fail at speed, which is the incident half of the program.

## Coverage metrics

- **MFA coverage**: percentage of active accounts with MFA enrolled and enforced. Data source: identity platform reporting. The number to chase is not "MFA enabled" but "MFA enforced by policy", because optional MFA is not MFA.
- **Privileged account coverage**: percentage of privileged accounts vaulted or under privileged-access management. From [Privileged Account Types](02-privileged-account-types.md): every admin, service, and break-glass account should be in the register; the metric is register completeness divided by directory reality.
- **Register completeness**: accounts in the authoritative register versus accounts that actually exist. The gap is ungoverned identity, and it is the first metric to fix, because every other metric is meaningless on the ungoverned fraction.

## Lifecycle metrics

- **Time to provision**: elapsed time from HR event (or request approval) to working access. Measured per account type; privileged access should be minutes (JIT), standard access measured in days.
- **Time to deprovision**: elapsed time from termination to disabled account. The metric that matters most: every hour of delay is an hour of access held by someone who no longer works there. Measure the tail, not the average: the average hides the terminated account that was forgotten for a month.
- **Orphan accounts**: active accounts with no owner, no logon in the review window, or no associated person. Count per review cycle and trend it; a rising orphan count is the leading indicator of lifecycle failure. The [Identity Lifecycle](../fundamentals/03-identity-lifecycle.md) page is the underlying discipline.

## Review metrics

- **Certification completion**: percentage of access reviews completed on time. A campaign that is 60% complete is a control that does not cover 40% of entitlements. From the [IGA](../protocols-iga/06-iga.md) page's loop: the certification is only done when the revocations are executed, so the metric should include remediation completion, not just review completion.
- **Open segregation-of-duties conflicts**: count and age of unresolved SoD conflicts. Age matters more than count: an old conflict is a known risk being carried on purpose.
- **Standing privilege count**: number of accounts holding standing admin rights, and its trend under JIT adoption. The [JIT Access](07-jit-access.md) page's entire thesis is measured by this number going down while work still gets done.

## Detection metrics

- **Time to detect anomalous sign-in**: elapsed time between an anomalous sign-in event and the alert that surfaces it. This is the identity version of mean time to detect, and it is improved by rules, not by dashboards.
- **Alert disposition rate**: percentage of identity alerts that are investigated and closed with a finding or a reason. A high alert volume with a low disposition rate is a monitoring theater; the [Attacks page](08-attack-defense.md) tables are the source of the rules that make alerts meaningful.
- **Repeat findings**: number of audit findings that recur in consecutive reviews. Recurrence is the metric that separates programs that report from programs that fix.

## How to present the metrics

Three rules keep a metrics program credible:

1. **Show trend, not level.** "12 orphan accounts" means nothing; "12 this month, 30 last quarter, 51 the quarter before" shows a program working.
2. **Show the denominator.** "99% MFA coverage" without the total account count is a claim; with "of 4,800 active accounts" it is a statement.
3. **Put the failing number first.** A quarterly review that opens with the orphan count and the deprovisioning tail, then the coverage wins, reads as honest operations. A review that leads with the win and buries the gap reads as a presentation, which is what auditors and interviewers distrust.

## Interview angle

"When asked how you would measure an IAM program", the answer is the four families with one concrete metric per family, each with its data source and its failure mode. The follow-up that separates candidates: "which metric would you report to the board?" The strong answer is not a coverage number but the *trend of the failing metric* with the denominator stated, because that is what a board can act on. The other interview angle is the trap question: "what does a 100% certification completion mean?" The answer: it means the campaign ran, not that access is correct, which is why remediation completion is the metric that matters.