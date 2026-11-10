---
title: Resume and Portfolio Guide for IAM Roles
description: "How to structure a resume for IAM roles, what hiring managers actually look for, portfolio project ideas, and how to present your work on GitHub."
---

# Resume and Portfolio Guide for IAM Roles

## What hiring managers actually look for

Hiring managers for IAM roles scan resumes for specific signals. They are not looking for a generic security resume. They want to see:

- **Specific technologies**: Keycloak, Entra ID, CyberArk, SailPoint, Okta, AWS IAM, Azure RBAC. Name the exact products you have worked with.
- **Protocol depth**: SAML, OIDC, OAuth 2.0, SCIM, LDAP, Kerberos. Not just familiarity, but integration experience.
- **Scale numbers**: How many users? How many applications? How many privileged accounts? Numbers make claims credible.
- **Project outcomes**: Not just what you did, but what it enabled. "Reduced onboarding time by 40%" is stronger than "implemented SSO."
- **Troubleshooting evidence**: Specific error messages, root causes, and resolutions. This proves you have operated the technology, not just read about it.

## Resume structure for IAM roles

### Header

Name, location, email, LinkedIn, GitHub. No photo, no age, no marital status.

### Summary (2-3 lines)

A focused statement of what you do and what you are looking for. Not an objective statement.

```
IAM engineer with 3 years of experience in enterprise identity: Entra ID, Keycloak, SAML/OIDC federation, and PAM fundamentals. Seeking a senior IAM engineer role in a cloud-first environment.
```

### Skills section

Group skills by category. Be specific.

```
Identity Providers: Keycloak, Entra ID, Okta, Auth0
Protocols: SAML 2.0, OIDC, OAuth 2.0, SCIM, LDAP, Kerberos
PAM: CyberArk (PVWA, PSM, CPM), Delinea Secret Server, BeyondTrust Password Safe
Cloud IAM: AWS IAM, IAM Identity Center, Azure RBAC, GCP IAM
Scripting: PowerShell, Python, Bash
Directories: Active Directory, LDAP, Azure AD
Tools: Wireshark, Postman, Git, Docker, Terraform
```

### Experience

For each role, use the formula: action + technology + outcome.

```
IAM Engineer | Company X | 2023 - Present
- Integrated 15 SaaS applications with Entra ID via SAML and OIDC, reducing SSO support tickets by 60%.
- Built SCIM provisioning pipeline between Workday and Entra ID, automating user lifecycle for 5,000 employees.
- Configured Conditional Access policies enforcing MFA for all external access, reducing account compromise incidents by 80%.
- Troubleshot SAML assertion mapping errors using browser DevTools and SAML-tracer, resolving 20+ integration issues.
```

### Projects

If you lack professional experience, projects are your proof. List them like work experience.

```
Home Lab: Enterprise IAM with Keycloak | 2024
- Deployed Keycloak as an IdP with LDAP federation to Active Directory.
- Configured SAML and OIDC clients for three applications, proving multi-protocol SSO.
- Built SCIM provisioning client in Python to automate user creation and deprovisioning.
- Documented the entire project on GitHub with architecture diagrams and step-by-step guides.
```

### Education and certifications

List degrees and certifications with dates. Put certifications that are in progress as "In progress (expected 2026)."

## Portfolio project ideas

A portfolio project demonstrates skills that a resume cannot. Build something that solves a real problem and document it publicly.

### Project 1: Multi-protocol SSO hub

Build a Keycloak realm that serves as an IdP for multiple applications using different protocols (SAML, OIDC, LDAP). Document the architecture, the configuration steps, and the challenges you solved.

### Project 2: SCIM provisioning automation

Build a Python script that reads user data from a CSV and provisions users into a SCIM-compatible application. Handle group membership, deprovisioning, and error cases. Publish the code on GitHub with a README that explains the design decisions.

### Project 3: PAM session recording analysis

If you have access to a PAM trial (CyberArk, Delinea), record a privileged session and analyze it. Document what the recording captures, how to search it, and what indicators of compromise look like in a session recording.

### Project 4: Incident response simulation

Simulate a compromised service account in a lab environment. Document the detection, containment, eradication, and recovery steps. Publish the incident timeline and the lessons learned.

### Project 5: Cloud IAM least-privilege mining

Use AWS Access Advisor and IAM Access Analyzer to identify overprivileged IAM roles in a test account. Document the findings and the remediation steps. Publish the methodology as a blog post or GitHub repository.

## GitHub presentation

Your GitHub profile is your public portfolio. Make it presentable.

### Repository structure

Each project should have:

- **README.md**: what the project does, why it exists, how to set it up, what it proves.
- **Architecture diagram**: a Draw.io or Mermaid diagram showing the components and flows.
- **Configuration files**: the actual configuration used, with secrets redacted.
- **Scripts**: any automation scripts, with comments explaining what they do.
- **Documentation**: a docs/ folder with detailed explanations of the design decisions.

### README template

```markdown
# Project Name

One-paragraph description of what this project does and why it exists.

## Architecture

[Diagram]

## Setup

Step-by-step instructions to replicate the project.

## What this proves

- Skill 1
- Skill 2
- Skill 3

## Challenges and solutions

Describe the hardest problems you solved and how you solved them.
```

### What to avoid

- **No README**: a repository without a README is invisible. Always write a README.
- **Hardcoded secrets**: never commit passwords, API keys, or tokens. Use environment variables or a .env file.
- **No commits**: a repository with one commit looks abandoned. Commit regularly with meaningful messages.
- **Forked repos without explanation**: if you forked a repo, explain what you changed and why.

## LinkedIn optimization

LinkedIn is where recruiters find you. Optimize it for IAM roles.

### Headline

Your headline should include your role and key skills.

```
IAM Engineer | Entra ID, Keycloak, SAML/OIDC, PAM | Cloud Identity
```

### About section

Expand on your resume summary. Tell your story: how you got into IAM, what you have built, what you are looking for.

### Skills and endorsements

List your top skills and ask colleagues to endorse you. Prioritize skills that match job postings.

### Projects

Link to your GitHub projects in the Projects section. Write a one-line description of what each project proves.

## Verification checklist

- [ ] Resume structured with specific technologies, scale numbers, and project outcomes.
- [ ] Skills section grouped by category and specific.
- [ ] Experience uses action + technology + outcome formula.
- [ ] Projects listed like work experience with outcomes.
- [ ] GitHub repositories have READMEs, architecture diagrams, and documentation.
- [ ] LinkedIn headline and About section optimized for IAM roles.
- [ ] No hardcoded secrets in any public repository.

## What this page teaches

- Hiring managers scan for specific signals: technologies, protocols, scale numbers, project outcomes, and troubleshooting evidence.
- Resume structure matters: summary, skills, experience, projects, education. Each section has a specific purpose.
- Portfolio projects demonstrate skills that a resume cannot: build something real and document it publicly.
- GitHub is your public portfolio: every repository needs a README, architecture diagram, and documentation.
- LinkedIn is where recruiters find you: optimize your headline, About section, and skills for IAM roles.
