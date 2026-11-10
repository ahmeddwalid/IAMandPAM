import type { QuizQuestion } from '../components/SectionQuiz';

export const QUIZZES: Record<string, { title: string; questions: QuizQuestion[] }> = {
  fundamentals: {
    title: 'IAM Fundamentals',
    questions: [
      {
        id: 'f1',
        question: 'What are the three components of the AAA model?',
        options: [
          { id: 'a', text: 'Authentication, Authorization, Accounting', isCorrect: true, explanation: 'AAA stands for Authentication (proving who you are), Authorization (deciding what you may do), and Accounting (recording what was done).' },
          { id: 'b', text: 'Authentication, Access, Audit', isCorrect: false, explanation: 'Access is not part of the AAA model. The third A is Accounting (audit logging).' },
          { id: 'c', text: 'Authorization, Access, Audit', isCorrect: false, explanation: 'Access is not part of the AAA model. The first A is Authentication.' },
          { id: 'd', text: 'Authentication, Authorization, Access', isCorrect: false, explanation: 'Access is not part of the AAA model. The third A is Accounting.' },
        ],
        takeaway: 'AAA is the foundation of IAM: prove identity, grant permissions, record actions.',
      },
      {
        id: 'f2',
        question: 'What is the Joiner-Mover-Leaver (JML) lifecycle?',
        options: [
          { id: 'a', text: 'A network protocol for directory synchronization', isCorrect: false, explanation: 'JML is not a network protocol. It is the identity lifecycle model.' },
          { id: 'b', text: 'The identity lifecycle: onboarding, role changes, and offboarding', isCorrect: true, explanation: 'JML covers the three key identity transitions: Joiner (onboarding), Mover (role change), and Leaver (offboarding).' },
          { id: 'c', text: 'A PAM session recording format', isCorrect: false, explanation: 'JML is not related to PAM session recording.' },
          { id: 'd', text: 'A type of LDAP replication', isCorrect: false, explanation: 'JML is not related to LDAP replication.' },
        ],
        takeaway: 'Every identity goes through JML transitions. Each transition is a security-relevant event.',
      },
      {
        id: 'f3',
        question: 'What is the principle of least privilege?',
        options: [
          { id: 'a', text: 'Granting users the maximum permissions they might ever need', isCorrect: false, explanation: 'Least privilege is the opposite: grant only what is needed.' },
          { id: 'b', text: 'Granting users only the permissions necessary to perform their job', isCorrect: true, explanation: 'Least privilege means granting the minimum permissions required for a specific task or role.' },
          { id: 'c', text: 'Removing all permissions from users by default', isCorrect: false, explanation: 'Least privilege is not about removing all permissions, but about granting only what is needed.' },
          { id: 'd', text: 'A type of firewall rule', isCorrect: false, explanation: 'Least privilege is an IAM principle, not a firewall rule.' },
        ],
        takeaway: 'Least privilege reduces the attack surface by limiting what each identity can access.',
      },
      {
        id: 'f4',
        question: 'What is the difference between RBAC and ABAC?',
        options: [
          { id: 'a', text: 'RBAC uses roles, ABAC uses attributes', isCorrect: true, explanation: 'RBAC grants access based on roles. ABAC grants access based on attributes of the user, resource, and environment.' },
          { id: 'b', text: 'RBAC is faster, ABAC is slower', isCorrect: false, explanation: 'Speed is not the defining difference. The difference is the authorization model.' },
          { id: 'c', text: 'RBAC is for cloud, ABAC is for on-premises', isCorrect: false, explanation: 'Both models can be used in cloud and on-premises environments.' },
          { id: 'd', text: 'There is no difference', isCorrect: false, explanation: 'RBAC and ABAC are fundamentally different authorization models.' },
        ],
        takeaway: 'RBAC for what (roles), ABAC for when (attributes and context).',
      },
      {
        id: 'f5',
        question: 'What is multi-factor authentication (MFA)?',
        options: [
          { id: 'a', text: 'Using two different passwords', isCorrect: false, explanation: 'MFA requires different types of factors, not just multiple passwords.' },
          { id: 'b', text: 'Requiring two or more independent factors: something you know, have, or are', isCorrect: true, explanation: 'MFA combines factors from different categories: knowledge (password), possession (token), and inherence (biometric).' },
          { id: 'c', text: 'A type of single sign-on', isCorrect: false, explanation: 'MFA is not SSO. MFA is an authentication strength measure.' },
          { id: 'd', text: 'A password policy', isCorrect: false, explanation: 'MFA is not a password policy. It is an authentication mechanism.' },
        ],
        takeaway: 'MFA significantly reduces the risk of account compromise from stolen credentials.',
      },
    ],
  },
  'protocols-iga': {
    title: 'Identity Protocols & IGA',
    questions: [
      {
        id: 'p1',
        question: 'What is the difference between SAML and OIDC?',
        options: [
          { id: 'a', text: 'SAML uses XML, OIDC uses JSON', isCorrect: true, explanation: 'SAML assertions are XML-based. OIDC ID tokens are JSON-based (JWT).' },
          { id: 'b', text: 'SAML is newer than OIDC', isCorrect: false, explanation: 'SAML (2005) is older than OIDC (2014).' },
          { id: 'c', text: 'SAML is for APIs, OIDC is for browsers', isCorrect: false, explanation: 'SAML is primarily for browser SSO. OIDC is designed for both browser and API authentication.' },
          { id: 'd', text: 'There is no difference', isCorrect: false, explanation: 'SAML and OIDC are different protocols with different design goals.' },
        ],
        takeaway: 'SAML is the enterprise SSO standard. OIDC is the modern standard for web and mobile.',
      },
      {
        id: 'p2',
        question: 'What is OAuth 2.0?',
        options: [
          { id: 'a', text: 'An authentication protocol', isCorrect: false, explanation: 'OAuth 2.0 is an authorization framework, not an authentication protocol.' },
          { id: 'b', text: 'An authorization framework for delegated access', isCorrect: true, explanation: 'OAuth 2.0 allows a client to access resources on behalf of a user without sharing the user\'s credentials.' },
          { id: 'c', text: 'A directory service', isCorrect: false, explanation: 'OAuth 2.0 is not a directory service.' },
          { id: 'd', text: 'A password policy', isCorrect: false, explanation: 'OAuth 2.0 is not a password policy.' },
        ],
        takeaway: 'OAuth 2.0 answers "can this application access this resource on this user\'s behalf?"',
      },
      {
        id: 'p3',
        question: 'What is SCIM used for?',
        options: [
          { id: 'a', text: 'Single sign-on', isCorrect: false, explanation: 'SCIM is not for SSO. It is for provisioning.' },
          { id: 'b', text: 'Automated user provisioning and deprovisioning', isCorrect: true, explanation: 'SCIM (System for Cross-domain Identity Management) automates the exchange of user identity information between systems.' },
          { id: 'c', text: 'Session recording', isCorrect: false, explanation: 'SCIM is not related to session recording.' },
          { id: 'd', text: 'Certificate management', isCorrect: false, explanation: 'SCIM is not related to certificate management.' },
        ],
        takeaway: 'SCIM is the glue between HR systems and SaaS applications.',
      },
      {
        id: 'p4',
        question: 'What is LDAP?',
        options: [
          { id: 'a', text: 'A programming language', isCorrect: false, explanation: 'LDAP is not a programming language.' },
          { id: 'b', text: 'A protocol for accessing directory services', isCorrect: true, explanation: 'LDAP (Lightweight Directory Access Protocol) is used to query and modify directory services like Active Directory and OpenLDAP.' },
          { id: 'c', text: 'A type of database', isCorrect: false, explanation: 'LDAP is a protocol, not a database. It accesses directory services.' },
          { id: 'd', text: 'A network topology', isCorrect: false, explanation: 'LDAP is not a network topology.' },
        ],
        takeaway: 'LDAP is the protocol applications use to authenticate users and query directory information.',
      },
      {
        id: 'p5',
        question: 'What is IGA?',
        options: [
          { id: 'a', text: 'A type of firewall', isCorrect: false, explanation: 'IGA is not a firewall.' },
          { id: 'b', text: 'Identity Governance and Administration: access requests, certifications, and audits', isCorrect: true, explanation: 'IGA covers the governance layer: who should have access, how they request it, and how it is reviewed.' },
          { id: 'c', text: 'A programming language', isCorrect: false, explanation: 'IGA is not a programming language.' },
          { id: 'd', text: 'A type of VPN', isCorrect: false, explanation: 'IGA is not a VPN.' },
        ],
        takeaway: 'IGA is the decision layer that drives provisioning and ensures compliance.',
      },
    ],
  },
  'pam-core': {
    title: 'PAM Core',
    questions: [
      {
        id: 'pa1',
        question: 'What is the difference between IAM and PAM?',
        options: [
          { id: 'a', text: 'IAM is for users, PAM is for administrators', isCorrect: true, explanation: 'IAM manages general user access. PAM manages privileged access (admins, root, service accounts).' },
          { id: 'b', text: 'There is no difference', isCorrect: false, explanation: 'IAM and PAM are related but distinct disciplines.' },
          { id: 'c', text: 'IAM is for cloud, PAM is for on-premises', isCorrect: false, explanation: 'Both IAM and PAM apply to cloud and on-premises environments.' },
          { id: 'd', text: 'IAM is a subset of PAM', isCorrect: false, explanation: 'PAM is a subset of IAM, not the other way around.' },
        ],
        takeaway: 'PAM is the specialized subset of IAM that deals with privileged access.',
      },
      {
        id: 'pa2',
        question: 'What is credential vaulting?',
        options: [
          { id: 'a', text: 'Storing passwords in a text file', isCorrect: false, explanation: 'Vaulting is secure storage, not a text file.' },
          { id: 'b', text: 'Securely storing and managing privileged credentials in a centralized vault', isCorrect: true, explanation: 'A PAM vault stores privileged credentials, controls access to them, and rotates them automatically.' },
          { id: 'c', text: 'A type of database', isCorrect: false, explanation: 'A vault is not just a database. It has access controls, rotation, and audit capabilities.' },
          { id: 'd', text: 'A network protocol', isCorrect: false, explanation: 'Vaulting is not a network protocol.' },
        ],
        takeaway: 'The vault is the core of PAM: credentials are checked out, used, and rotated automatically.',
      },
      {
        id: 'pa3',
        question: 'What is Just-in-Time (JIT) access?',
        options: [
          { id: 'a', text: 'Standing privileged access that is always available', isCorrect: false, explanation: 'JIT is the opposite: access is granted only when needed and expires automatically.' },
          { id: 'b', text: 'Time-bounded privileged access granted on demand and revoked after use', isCorrect: true, explanation: 'JIT access is granted for a specific task, for a limited time, and revoked automatically.' },
          { id: 'c', text: 'A type of VPN', isCorrect: false, explanation: 'JIT is not a VPN.' },
          { id: 'd', text: 'A password policy', isCorrect: false, explanation: 'JIT is not a password policy.' },
        ],
        takeaway: 'JIT eliminates standing privilege: no standing access, elevation on verified request, automatic revocation.',
      },
      {
        id: 'pa4',
        question: 'What is Privileged Session Management (PSM)?',
        options: [
          { id: 'a', text: 'A type of password manager', isCorrect: false, explanation: 'PSM is not a password manager. It is session brokering and recording.' },
          { id: 'b', text: 'Brokering and recording privileged sessions to prevent direct access to targets', isCorrect: true, explanation: 'PSM acts as a proxy: the admin connects to the PSM, and the PSM connects to the target. The session is recorded.' },
          { id: 'c', text: 'A network protocol', isCorrect: false, explanation: 'PSM is not a network protocol.' },
          { id: 'd', text: 'A type of firewall', isCorrect: false, explanation: 'PSM is not a firewall.' },
        ],
        takeaway: 'PSM ensures privileged sessions are brokered, recorded, and auditable.',
      },
      {
        id: 'pa5',
        question: 'What is a break-glass account?',
        options: [
          { id: 'a', text: 'A regular user account', isCorrect: false, explanation: 'A break-glass account is a special emergency account.' },
          { id: 'b', text: 'An emergency account used when normal access fails, with strict controls and monitoring', isCorrect: true, explanation: 'Break-glass accounts are for emergencies: IdP outage, misconfigured policies, or locked-out admins. They are tightly controlled and monitored.' },
          { id: 'c', text: 'A type of service account', isCorrect: false, explanation: 'Break-glass accounts are not service accounts. They are human emergency accounts.' },
          { id: 'd', text: 'A shared admin account', isCorrect: false, explanation: 'Break-glass accounts are individual, not shared. Shared accounts are a PAM anti-pattern.' },
        ],
        takeaway: 'Break-glass is the planned, monitored, and tested emergency exit when normal access fails.',
      },
    ],
  },
  vendors: {
    title: 'Vendor Landscape',
    questions: [
      {
        id: 'v1',
        question: 'What is CyberArk?',
        options: [
          { id: 'a', text: 'A cloud IAM service', isCorrect: false, explanation: 'CyberArk is a PAM specialist, not a cloud IAM service.' },
          { id: 'b', text: 'A PAM specialist: vault, session management, rotation, and privileged threat analytics', isCorrect: true, explanation: 'CyberArk is the leading PAM vendor with products like Vault, PSM, CPM, and PTA.' },
          { id: 'c', text: 'A directory service', isCorrect: false, explanation: 'CyberArk is not a directory service.' },
          { id: 'd', text: 'A firewall vendor', isCorrect: false, explanation: 'CyberArk is not a firewall vendor.' },
        ],
        takeaway: 'CyberArk is the PAM market leader: vaulting, session management, rotation, and threat analytics.',
      },
      {
        id: 'v2',
        question: 'What is the difference between Delinea and BeyondTrust?',
        options: [
          { id: 'a', text: 'Delinea is PAM, BeyondTrust is IGA', isCorrect: false, explanation: 'Both are PAM vendors.' },
          { id: 'b', text: 'Both are PAM vendors with different strengths: Delinea (Secret Server), BeyondTrust (Password Safe)', isCorrect: true, explanation: 'Delinea and BeyondTrust are both PAM vendors. Delinea is known for Secret Server. BeyondTrust is known for Password Safe and endpoint privilege management.' },
          { id: 'c', text: 'There is no difference', isCorrect: false, explanation: 'They are different vendors with different product strengths.' },
          { id: 'd', text: 'Delinea is cloud-only, BeyondTrust is on-premises only', isCorrect: false, explanation: 'Both offer cloud and on-premises deployments.' },
        ],
        takeaway: 'Delinea and BeyondTrust are both PAM vendors. Evaluate based on your specific requirements.',
      },
      {
        id: 'v3',
        question: 'What is Microsoft Entra ID?',
        options: [
          { id: 'a', text: 'A PAM product', isCorrect: false, explanation: 'Entra ID is not a PAM product. It is a cloud identity provider.' },
          { id: 'b', text: 'Microsoft\'s cloud identity provider: SSO, MFA, Conditional Access, and PIM', isCorrect: true, explanation: 'Entra ID (formerly Azure AD) is Microsoft\'s cloud IdP with SSO, MFA, Conditional Access, and Privileged Identity Management.' },
          { id: 'c', text: 'A directory service', isCorrect: false, explanation: 'Entra ID is not just a directory service. It is a full cloud identity platform.' },
          { id: 'd', text: 'A firewall', isCorrect: false, explanation: 'Entra ID is not a firewall.' },
        ],
        takeaway: 'Entra ID is the Microsoft cloud IdP: SSO, MFA, Conditional Access, and PIM.',
      },
      {
        id: 'v4',
        question: 'What is AWS IAM Identity Center?',
        options: [
          { id: 'a', text: 'A PAM product', isCorrect: false, explanation: 'IAM Identity Center is not a PAM product. It is AWS\'s SSO service.' },
          { id: 'b', text: 'AWS\'s SSO service: centralized access to AWS accounts and applications', isCorrect: true, explanation: 'IAM Identity Center (formerly AWS SSO) provides centralized access to AWS accounts and business applications.' },
          { id: 'c', text: 'A directory service', isCorrect: false, explanation: 'IAM Identity Center is not a directory service.' },
          { id: 'd', text: 'A type of VPN', isCorrect: false, explanation: 'IAM Identity Center is not a VPN.' },
        ],
        takeaway: 'IAM Identity Center is where AWS identity management is heading: centralized SSO and permission sets.',
      },
      {
        id: 'v5',
        question: 'What is SailPoint?',
        options: [
          { id: 'a', text: 'A PAM vendor', isCorrect: false, explanation: 'SailPoint is an IGA vendor, not PAM.' },
          { id: 'b', text: 'An IGA vendor: identity governance, access requests, and certifications', isCorrect: true, explanation: 'SailPoint is a leading IGA vendor with products like IdentityIQ and IdentityNow.' },
          { id: 'c', text: 'A firewall vendor', isCorrect: false, explanation: 'SailPoint is not a firewall vendor.' },
          { id: 'd', text: 'A cloud IAM service', isCorrect: false, explanation: 'SailPoint is not a cloud IAM service.' },
        ],
        takeaway: 'SailPoint is the IGA leader: governance, access requests, and certifications.',
      },
    ],
  },
  scenarios: {
    title: 'Scenarios & Troubleshooting',
    questions: [
      {
        id: 's1',
        question: 'What is the most common cause of LDAP bind failures?',
        options: [
          { id: 'a', text: 'Network latency', isCorrect: false, explanation: 'Network latency is not the most common cause of bind failures.' },
          { id: 'b', text: 'Invalid credentials (error 49, sub-code 52e)', isCorrect: true, explanation: 'The most common LDAP bind failure is invalid credentials: error 49 with sub-code 52e.' },
          { id: 'c', text: 'DNS resolution failure', isCorrect: false, explanation: 'DNS failure would prevent the connection entirely, not cause a bind failure.' },
          { id: 'd', text: 'Certificate expiry', isCorrect: false, explanation: 'Certificate expiry would cause LDAPS failures, not simple bind failures.' },
        ],
        takeaway: 'LDAP error 49 sub-code 52e means invalid credentials. Check the bind DN and password first.',
      },
      {
        id: 's2',
        question: 'What is the first step in emergency offboarding?',
        options: [
          { id: 'a', text: 'Delete the user account', isCorrect: false, explanation: 'Deleting the account destroys evidence. Disable first.' },
          { id: 'b', text: 'Disable the account and revoke active sessions', isCorrect: true, explanation: 'The first step is to disable the account and revoke all active sessions to prevent further access.' },
          { id: 'c', text: 'Change the user\'s password', isCorrect: false, explanation: 'Changing the password is not sufficient. The account must be disabled.' },
          { id: 'd', text: 'Notify the manager', isCorrect: false, explanation: 'Notification is important but not the first step. Containment comes first.' },
        ],
        takeaway: 'Emergency offboarding: disable first, revoke sessions, then investigate and recover.',
      },
      {
        id: 's3',
        question: 'What is a SAML signature wrapping attack?',
        options: [
          { id: 'a', text: 'A network-level attack on SAML endpoints', isCorrect: false, explanation: 'XSW is not a network-level attack. It is an XML manipulation attack.' },
          { id: 'b', text: 'Manipulating the XML structure of a signed assertion to inject malicious content', isCorrect: true, explanation: 'XSW exploits the fact that XML signatures can cover only a portion of the document, allowing injection of unsigned content.' },
          { id: 'c', text: 'A type of phishing attack', isCorrect: false, explanation: 'XSW is not phishing. It is a technical attack on the SAML assertion structure.' },
          { id: 'd', text: 'A denial-of-service attack', isCorrect: false, explanation: 'XSW is not a DoS attack.' },
        ],
        takeaway: 'Validate the assertion structure, not just the signature. Use a SAML library that checks for XSW.',
      },
      {
        id: 's4',
        question: 'What is the purpose of an access certification campaign?',
        options: [
          { id: 'a', text: 'To grant new access', isCorrect: false, explanation: 'Certification is about reviewing existing access, not granting new access.' },
          { id: 'b', text: 'To periodically review and certify that existing access is still justified', isCorrect: true, explanation: 'Access certification ensures that access grants are still necessary and appropriate.' },
          { id: 'c', text: 'To provision new users', isCorrect: false, explanation: 'Certification is not about provisioning. It is about review.' },
          { id: 'd', text: 'To rotate passwords', isCorrect: false, explanation: 'Certification is not about password rotation.' },
        ],
        takeaway: 'Certification is the governance loop: periodically, every access grant is reviewed.',
      },
      {
        id: 's5',
        question: 'What is the first sign of a compromised privileged account?',
        options: [
          { id: 'a', text: 'A password change', isCorrect: false, explanation: 'A password change is not necessarily a sign of compromise.' },
          { id: 'b', text: 'Anomalous login: unusual time, location, or behavior', isCorrect: true, explanation: 'The first sign is usually anomalous activity: login at an unusual time, from an unusual location, or with unusual behavior.' },
          { id: 'c', text: 'A system reboot', isCorrect: false, explanation: 'A system reboot is not a sign of account compromise.' },
          { id: 'd', text: 'A software update', isCorrect: false, explanation: 'A software update is not a sign of account compromise.' },
        ],
        takeaway: 'Anomaly detection is the first line of defense: unusual time, location, or behavior.',
      },
    ],
  },
  labs: {
    title: 'Hands-On Labs',
    questions: [
      {
        id: 'l1',
        question: 'What is the purpose of the home lab setup?',
        options: [
          { id: 'a', text: 'To learn programming', isCorrect: false, explanation: 'The home lab is for IAM practice, not programming.' },
          { id: 'b', text: 'To build a practice environment with AD, Keycloak, and cloud IAM for hands-on learning', isCorrect: true, explanation: 'The home lab provides a safe environment to practice IAM concepts with real tools.' },
          { id: 'c', text: 'To replace production systems', isCorrect: false, explanation: 'The home lab is for learning, not production.' },
          { id: 'd', text: 'To learn networking', isCorrect: false, explanation: 'The home lab is for IAM, not general networking.' },
        ],
        takeaway: 'The home lab is your practice environment: safe to break, safe to learn.',
      },
      {
        id: 'l2',
        question: 'What is Keycloak?',
        options: [
          { id: 'a', text: 'A PAM product', isCorrect: false, explanation: 'Keycloak is not a PAM product. It is an open-source IdP.' },
          { id: 'b', text: 'An open-source identity provider: SSO, federation, and identity brokering', isCorrect: true, explanation: 'Keycloak is a free, open-source IdP that supports SAML, OIDC, LDAP federation, and more.' },
          { id: 'c', text: 'A directory service', isCorrect: false, explanation: 'Keycloak is not a directory service. It federates to directories.' },
          { id: 'd', text: 'A firewall', isCorrect: false, explanation: 'Keycloak is not a firewall.' },
        ],
        takeaway: 'Keycloak is the most accessible open-source IdP for learning SSO and federation.',
      },
      {
        id: 'l3',
        question: 'What is HashiCorp Vault used for in the labs?',
        options: [
          { id: 'a', text: 'Network monitoring', isCorrect: false, explanation: 'Vault is not for network monitoring.' },
          { id: 'b', text: 'Secrets management: dynamic credentials, encryption, and audit', isCorrect: true, explanation: 'Vault provides secrets management, dynamic credentials, encryption as a service, and audit logging.' },
          { id: 'c', text: 'Session recording', isCorrect: false, explanation: 'Vault is not for session recording.' },
          { id: 'd', text: 'Certificate management only', isCorrect: false, explanation: 'Vault does much more than certificate management.' },
        ],
        takeaway: 'Vault is the secrets management standard: dynamic credentials, encryption, and audit.',
      },
      {
        id: 'l4',
        question: 'What is Teleport used for in the labs?',
        options: [
          { id: 'a', text: 'Password management', isCorrect: false, explanation: 'Teleport is not a password manager.' },
          { id: 'b', text: 'Zero Standing Privilege access: ephemeral certificates for SSH and Kubernetes', isCorrect: true, explanation: 'Teleport provides ephemeral, short-lived certificates for infrastructure access, eliminating standing privileges.' },
          { id: 'c', text: 'Network monitoring', isCorrect: false, explanation: 'Teleport is not for network monitoring.' },
          { id: 'd', text: 'Database management', isCorrect: false, explanation: 'Teleport is not a database management tool.' },
        ],
        takeaway: 'Teleport is the modern ZSP pattern: ephemeral certificates, no standing access.',
      },
      {
        id: 'l5',
        question: 'What is the purpose of the incident response simulation lab?',
        options: [
          { id: 'a', text: 'To learn programming', isCorrect: false, explanation: 'The IR lab is for incident response practice, not programming.' },
          { id: 'b', text: 'To practice detecting, containing, eradicating, and recovering from a compromised account', isCorrect: true, explanation: 'The IR simulation lab walks through the full incident response lifecycle with a compromised service account.' },
          { id: 'c', text: 'To learn networking', isCorrect: false, explanation: 'The IR lab is for incident response, not networking.' },
          { id: 'd', text: 'To replace production monitoring', isCorrect: false, explanation: 'The IR lab is for learning, not production monitoring.' },
        ],
        takeaway: 'Practice IR in a safe environment so you are ready when it happens in production.',
      },
    ],
  },
  interviews: {
    title: 'Interview Preparation',
    questions: [
      {
        id: 'i1',
        question: 'What is the STAR method for behavioral questions?',
        options: [
          { id: 'a', text: 'A technical troubleshooting framework', isCorrect: false, explanation: 'STAR is not a technical framework. It is a behavioral answer structure.' },
          { id: 'b', text: 'Situation, Task, Action, Result: a structured way to answer behavioral questions', isCorrect: true, explanation: 'STAR structures behavioral answers: describe the Situation, your Task, the Action you took, and the Result.' },
          { id: 'c', text: 'A type of network diagram', isCorrect: false, explanation: 'STAR is not a network diagram.' },
          { id: 'd', text: 'A programming methodology', isCorrect: false, explanation: 'STAR is not a programming methodology.' },
        ],
        takeaway: 'STAR structures your behavioral answers: Situation, Task, Action, Result.',
      },
      {
        id: 'i2',
        question: 'What is the most important thing to demonstrate in an IAM interview?',
        options: [
          { id: 'a', text: 'Memorized definitions', isCorrect: false, explanation: 'Memorized definitions are not enough. Understanding and application matter more.' },
          { id: 'b', text: 'Practical understanding: how you apply concepts to real scenarios', isCorrect: true, explanation: 'Interviewers want to see that you can apply concepts, not just recite definitions.' },
          { id: 'c', text: 'Knowledge of every vendor', isCorrect: false, explanation: 'You do not need to know every vendor. Depth in a few is better than shallow knowledge of many.' },
          { id: 'd', text: 'Certification count', isCorrect: false, explanation: 'Certifications help, but practical understanding is more important.' },
        ],
        takeaway: 'Demonstrate practical understanding: how you apply concepts to real scenarios.',
      },
      {
        id: 'i3',
        question: 'How should you answer "What is the difference between IAM and PAM?"',
        options: [
          { id: 'a', text: 'IAM is for users, PAM is for admins', isCorrect: true, explanation: 'IAM manages general user access. PAM manages privileged access (admins, root, service accounts).' },
          { id: 'b', text: 'There is no difference', isCorrect: false, explanation: 'IAM and PAM are related but distinct.' },
          { id: 'c', text: 'IAM is for cloud, PAM is for on-premises', isCorrect: false, explanation: 'Both apply to cloud and on-premises.' },
          { id: 'd', text: 'IAM is a subset of PAM', isCorrect: false, explanation: 'PAM is a subset of IAM.' },
        ],
        takeaway: 'IAM is the broad discipline. PAM is the specialized subset for privileged access.',
      },
      {
        id: 'i4',
        question: 'What is the best way to prepare for a technical interview?',
        options: [
          { id: 'a', text: 'Memorize every definition', isCorrect: false, explanation: 'Memorization is not enough. Understanding and application matter more.' },
          { id: 'b', text: 'Practice explaining concepts out loud, work through scenarios, and build hands-on labs', isCorrect: true, explanation: 'Active practice (explaining, scenarios, labs) is far more effective than passive memorization.' },
          { id: 'c', text: 'Read documentation only', isCorrect: false, explanation: 'Reading is passive. Active practice is more effective.' },
          { id: 'd', text: 'Watch videos only', isCorrect: false, explanation: 'Watching is passive. Active practice is more effective.' },
        ],
        takeaway: 'Active practice beats passive memorization: explain out loud, work scenarios, build labs.',
      },
      {
        id: 'i5',
        question: 'What should you do if you do not know the answer to an interview question?',
        options: [
          { id: 'a', text: 'Make up an answer', isCorrect: false, explanation: 'Making up an answer is worse than admitting you do not know.' },
          { id: 'b', text: 'Be honest, explain what you do know, and describe how you would find the answer', isCorrect: true, explanation: 'Honesty and problem-solving approach are more valuable than a guess.' },
          { id: 'c', text: 'Change the subject', isCorrect: false, explanation: 'Changing the subject is evasive and unhelpful.' },
          { id: 'd', text: 'Stay silent', isCorrect: false, explanation: 'Silence is not helpful. Engage with the question.' },
        ],
        takeaway: 'Honesty and problem-solving approach beat guessing. Show how you would find the answer.',
      },
    ],
  },
  careers: {
    title: 'Certifications & Career',
    questions: [
      {
        id: 'c1',
        question: 'What is the typical career progression in IAM?',
        options: [
          { id: 'a', text: 'Analyst to Engineer to Senior to Architect to Director', isCorrect: true, explanation: 'The typical IAM career ladder: Analyst, Engineer, Senior Engineer, Architect, Director.' },
          { id: 'b', text: 'Engineer to Analyst to Architect', isCorrect: false, explanation: 'The progression is Analyst to Engineer, not the reverse.' },
          { id: 'c', text: 'Director to Architect to Engineer', isCorrect: false, explanation: 'The progression is upward, not downward.' },
          { id: 'd', text: 'There is no typical progression', isCorrect: false, explanation: 'While paths vary, there is a common progression pattern.' },
        ],
        takeaway: 'IAM career ladder: Analyst, Engineer, Senior, Architect, Director.',
      },
      {
        id: 'c2',
        question: 'What is the most important factor in salary negotiation?',
        options: [
          { id: 'a', text: 'Threatening to leave', isCorrect: false, explanation: 'Threats are counterproductive. Data and value are more effective.' },
          { id: 'b', text: 'Research: knowing the market rate for your role, experience, and location', isCorrect: true, explanation: 'Data-driven negotiation is the most effective approach. Know your market value.' },
          { id: 'c', text: 'Accepting the first offer', isCorrect: false, explanation: 'Accepting the first offer leaves money on the table.' },
          { id: 'd', text: 'Asking for the highest possible number', isCorrect: false, explanation: 'Anchoring too high without justification can backfire.' },
        ],
        takeaway: 'Research is the foundation of effective negotiation: know your market value.',
      },
      {
        id: 'c3',
        question: 'What is the SC-300 certification?',
        options: [
          { id: 'a', text: 'A PAM certification', isCorrect: false, explanation: 'SC-300 is not a PAM certification. It is Microsoft\'s identity and access certification.' },
          { id: 'b', text: 'Microsoft\'s identity and access administrator certification', isCorrect: true, explanation: 'SC-300 (Microsoft Identity and Access Administrator) covers Entra ID, hybrid identity, and access management.' },
          { id: 'c', text: 'A programming certification', isCorrect: false, explanation: 'SC-300 is not a programming certification.' },
          { id: 'd', text: 'A network certification', isCorrect: false, explanation: 'SC-300 is not a network certification.' },
        ],
        takeaway: 'SC-300 is Microsoft\'s identity and access administrator certification.',
      },
      {
        id: 'c4',
        question: 'What is the best way to build a portfolio for an IAM role?',
        options: [
          { id: 'a', text: 'List every certification', isCorrect: false, explanation: 'Certifications alone are not a portfolio. Projects demonstrate skills.' },
          { id: 'b', text: 'Build hands-on projects, document them on GitHub, and write about what you learned', isCorrect: true, explanation: 'A portfolio of documented projects demonstrates practical skills better than a list of certifications.' },
          { id: 'c', text: 'Copy other people\'s projects', isCorrect: false, explanation: 'Copying does not demonstrate your skills.' },
          { id: 'd', text: 'Only list work experience', isCorrect: false, explanation: 'Work experience is important, but projects demonstrate initiative and depth.' },
        ],
        takeaway: 'Build projects, document them, write about them. A portfolio demonstrates skills.',
      },
      {
        id: 'c5',
        question: 'What is the most important thing to include in an IAM resume?',
        options: [
          { id: 'a', text: 'Every job you have ever had', isCorrect: false, explanation: 'Relevance matters more than completeness.' },
          { id: 'b', text: 'Specific technologies, scale numbers, and project outcomes', isCorrect: true, explanation: 'Specific technologies, scale numbers, and measurable outcomes make claims credible.' },
          { id: 'c', text: 'A photo', isCorrect: false, explanation: 'A photo is not relevant and may introduce bias.' },
          { id: 'd', text: 'Personal hobbies', isCorrect: false, explanation: 'Hobbies are not relevant to an IAM resume.' },
        ],
        takeaway: 'Specific technologies, scale numbers, and project outcomes make your resume credible.',
      },
    ],
  },
};
