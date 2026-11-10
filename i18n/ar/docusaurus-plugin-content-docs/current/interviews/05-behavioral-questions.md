---
title: "Wave 3: Behavioral Questions"
description: "Ten behavioral interview questions with STAR templates to fill in with your own experience."
---

# Wave 3: Behavioral Questions

Behavioral questions are not about identity knowledge: they are about how you operate under real constraints. The interviewer is checking for ownership, judgment under pressure, and whether you can describe conflict without blame. Use the [STAR structure](https://en.wikipedia.org/wiki/Situation,_task,_action,_result) in every answer:

- **Situation**: the context, in two sentences. No history, no names beyond roles.
- **Task**: your specific responsibility. Not the team's, yours.
- **Action**: what you actually did, in order. This is 60% of the answer.
- **Result**: what happened, measured where possible.

Three rules that apply to every template below. First, the action must be in the first person: "I did X" beats "we did X" in every behavioral answer, because the interviewer is hiring you, not your team. Second, choose a real example you actually lived, and write the answer as notes in your own words, not as a polished script. Third, never invent a story: an interviewer who probes a fabricated example will find it, and the loss of credibility is worse than a modest example. If you have not lived the exact scenario, use a close one and say what you would do differently now.

### 1. Tell me about a time you had to fix something that was broken in production.

**Why they ask.** They want evidence that you can operate under pressure, prioritize, and communicate during an outage.

**Situation.** The system, its importance, and what broke. One sentence on the business impact. (Example notes: "Our IdP began rejecting logins from one customer tenant at 9 AM; all their users were locked out of SSO.")

**Task.** What you owned: diagnosis, response, communication, or all three.

**Action.** The sequence: how you scoped it, what you checked first (logs, certificate expiry, config change), what you found, and the fix. Include the moment of decision: what made you choose the fix over further diagnosis.

**Result.** Time to restore, what the fix was, and the follow-up: the postmortem, the monitoring added, or the runbook written.

**Red flags.** Blaming the vendor or another team in the Situation; a Task that is "I was on call"; an Action with no order or no decision point.

### 2. Describe a time you disagreed with a decision and were right.

**Why they ask.** They want to know if you can challenge decisions professionally and whether you pick your battles.

**Situation.** The decision, who made it, and the stakes. (Example notes: "Management wanted to remove MFA from the admin portal to speed up vendor support access.")

**Task.** What you did about it: raised it, escalated it, or accepted it.

**Action.** How you made the case: the data you brought, the alternative you proposed, and who you took it to. Include the moment you stopped pushing and respected the decision if it went against you, or the escalation if it was a genuine risk.

**Result.** What happened, and what you learned about how decisions get made in that organization.

**Red flags.** "I was right" with no evidence of how you communicated it; or disagreement that ended with you doing nothing. The mature answer includes the moment you let it go.

### 3. Tell me about a time you made a mistake. What did you do?

**Why they ask.** This is the honesty test: can you own an error, describe it without minimizing, and show what changed afterward?

**Situation.** The mistake, plainly stated, and its impact. Own it in the first sentence: "I disabled the wrong account during a cleanup."

**Task.** Your responsibility that the mistake violated.

**Action.** What you did immediately (did you report it, roll it back, or notify someone?), and what you did afterward to fix the process, not just the symptom.

**Result.** The recovery, and the specific change that prevents the same mistake: a checklist, a confirmation step, a review requirement.

**Red flags.** A mistake that is actually someone else's fault, or "the system let me do it." The interviewer is listening for whether you reported it, not just whether you fixed it.

### 4. Give me an example of a time you had to meet a tight deadline.

**Why they ask.** They want to see how you scope, negotiate, and deliver under time pressure without sacrificing the important parts.

**Situation.** The deadline, why it was tight, and what the deliverable was. (Example notes: "A compliance deadline required certifying 3,000 entitlements in two weeks.")

**Task.** What you committed to and what you said you could not do.

**Action.** How you planned: the triage (what had to be done, what could be deferred), the tools or automation you used, and who you told when the scope needed adjusting.

**Result.** Delivered on time or not, and what the negotiation taught you about setting expectations.

**Red flags.** "I worked nights and weekends" as the entire action. The strong answer shows scoping and communication, not heroics.

### 5. Tell me about a time you had to persuade someone to change how they worked.

**Why they ask.** Identity work is change management: users, admins, and DBAs all resist controls. They want evidence you can win cooperation.

**Situation.** The person or team, their old way of working, and why it was a problem. (Example notes: "A development team kept committing service account passwords to the repo.")

**Task.** What you needed from them.

**Action.** How you built the case: the concrete risk, the alternative that made their life easier, the pilot or demonstration. The key moment: what you changed in your approach when the first attempt failed.

**Result.** The adoption, and the measure: no new secrets in the repo for a quarter, or the team enabling the secret scanner.

**Red flags.** "I told them and they had to comply." The interviewer wants persuasion, not authority.

### 6. Describe a time you handled a difficult teammate or stakeholder.

**Why they ask.** They want evidence you can work with difficult people without escalating or capitulating.

**Situation.** The person's role and the friction, described neutrally, not as a character judgment.

**Task.** The outcome you needed to protect.

**Action.** How you approached them: the private conversation, the shared goal you found, the compromise or the firm line you held. Include the technique, not just the fact that you talked.

**Result.** The working relationship afterward and the outcome.

**Red flags.** Describing the person with loaded language ("toxic," "impossible") without describing the behavior. Also: "I went over their head" as the first move.

### 7. Tell me about a time you led or drove a change that people resisted.

**Why they ask.** Rollouts are the identity job: MFA, PAM, password policy. They want evidence you can drive adoption.

**Situation.** The change and who resisted it. (Example notes: "MFA rollout to a 500-person company, with the executive team the loudest resisters.")

**Task.** Your role in the change, even if you were not the formal leader.

**Action.** The change management: who you communicated with first, how you made the change easy (self-service enrollment, grace period, help desk prep), and how you handled the resistance specifically.

**Result.** Adoption metrics, and the lesson about what makes people adopt security controls.

**Red flags.** "It was mandated, so they had to." The strong answer treats resistance as a design input, not an obstacle.

### 8. Describe a time you had to learn something new quickly.

**Why they ask.** Identity is a field where the requirement is usually unfamiliar: a new vendor, a new protocol, a new compliance framework.

**Situation.** The new technology or domain and why the deadline was real. (Example notes: "Given a week to evaluate a PAM vendor against our requirements.")

**Task.** What you had to be able to do with it.

**Action.** Your learning method: the documentation, the lab or trial, the people you asked, and the point where you converted learning into a deliverable.

**Result.** The outcome and what you retained from the method.

**Red flags.** "I read the docs." The interviewer wants a method: hands-on, structured, and time-boxed.

### 9. Tell me about a time you had to say no to a request.

**Why they ask.** Security work is constant refusal: access requests, exceptions, shortcuts. They want to know you can say no while keeping the relationship.

**Situation.** The request, who made it, and why it mattered to them. (Example notes: "A business unit requested standing admin rights on the production database.")

**Task.** The control you were protecting.

**Action.** How you delivered the no: the reason tied to the request (not a policy citation), and the alternative you offered instead of the refusal.

**Result.** What they ended up with, and the relationship afterward.

**Red flags.** A no delivered by policy citation, or a yes that you describe with regret. The strong answer always includes the alternative.

### 10. Describe a time you had to explain something technical to a non-technical audience.

**Why they ask.** Identity work reports to executives, auditors, and business owners. The ability to translate risk into business language is the difference between a staff role and a leadership one.

**Situation.** The audience and the stakes. (Example notes: "Presenting the access review results to executives who had to certify their teams' access.")

**Task.** What the audience needed to decide.

**Action.** How you framed it: the business language, the concrete example, the decision they needed to make. Include how you handled their questions.

**Result.** The decision they made, and what you learned about the audience's actual concerns.

**Red flags.** Explaining at the same technical level as your peers, or treating the audience's questions as interruptions.