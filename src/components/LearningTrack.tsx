import React, { useState } from 'react';
import Link from '@docusaurus/Link';

interface Step {
  title: string;
  link: string;
  duration: string;
  focus: string;
}

interface Track {
  id: string;
  name: string;
  targetRole: string;
  description: string;
  estimatedWeeks: string;
  steps: Step[];
}

const TRACKS: Track[] = [
  {
    id: 'cloud_devsecops',
    name: 'Cloud IAM & DevSecOps Engineer',
    targetRole: 'Cloud Security Engineer, DevSecOps Engineer, Platform Security Specialist',
    estimatedWeeks: '4–6 weeks',
    description:
      'Focuses on modern federated cloud identity, short-lived tokens, machine-to-machine workload federation, and secrets automation without standing privileges.',
    steps: [
      {
        title: 'OAuth 2.0 & OIDC Core Mechanics',
        link: '/docs/protocols-iga/oauth2/',
        duration: '1 week',
        focus: 'Authorization code with PKCE, token validation, client credentials',
      },
      {
        title: 'Cloud IAM & Multi-Cloud Federation',
        link: '/docs/vendors/cloud-iam/',
        duration: '1 week',
        focus: 'AWS IAM Identity Center, GCP Workforce Pools, Azure Managed Identities',
      },
      {
        title: 'Workload & Machine Identities',
        link: '/docs/fundamentals/workload-machine-identities/',
        duration: '1 week',
        focus: 'SPIFFE/SPIRE, Kubernetes ServiceAccount token projections, mTLS',
      },
      {
        title: 'Lab: Secrets Management with Vault',
        link: '/docs/labs/secrets-vault/',
        duration: '3 days',
        focus: 'AppRole authentication, dynamic PostgreSQL credentials with lease expiry',
      },
      {
        title: 'Lab: DevOps CI/CD Workload Identity',
        link: '/docs/labs/devops-identity/',
        duration: '3 days',
        focus: 'GitHub Actions OIDC federation into AWS without static secret keys',
      },
      {
        title: 'Cloud Identity Interview Bank',
        link: '/docs/interviews/cloud-questions/',
        duration: '1 week',
        focus: 'Service principals vs managed identities, permission boundaries, CA policies',
      },
    ],
  },
  {
    id: 'pam_specialist',
    name: 'Enterprise PAM Specialist',
    targetRole: 'PAM Engineer, CyberArk Administrator, Privileged Access Architect',
    estimatedWeeks: '5–7 weeks',
    description:
      'Grounded in the complete PAM lifecycle: credential vaulting, session isolation, credential injection, JIT brokering, and zero standing privilege architecture.',
    steps: [
      {
        title: 'Privileged Access Fundamentals',
        link: '/docs/pam-core/what-is-pam/',
        duration: '1 week',
        focus: 'The capability test, standing privilege elimination, vault vs session management',
      },
      {
        title: 'Complete PAM Architecture',
        link: '/docs/pam-core/pam-architecture/',
        duration: '1 week',
        focus: 'PSM broker, CPM engine, target isolation, SIEM integration, HA/DR failover',
      },
      {
        title: 'Identity Attack & Defense Techniques',
        link: '/docs/pam-core/attack-defense/',
        duration: '1 week',
        focus: 'Kerberoasting, DCSync, Pass-the-Hash, token theft, detection telemetry',
      },
      {
        title: 'Vendor Architectures (CyberArk, Delinea, BeyondTrust)',
        link: '/docs/vendors/cyberark/',
        duration: '1–2 weeks',
        focus: 'Deep component topologies, distributed engines, cloud broker zones',
      },
      {
        title: 'Incident Playbooks: Privileged Account Compromise',
        link: '/docs/scenarios/incident-compromised-privileged-account/',
        duration: '3 days',
        focus: 'Triage order, emergency credential rotation, blast radius containment',
      },
      {
        title: 'Lab: Hands-on PAM Deployment',
        link: '/docs/labs/pam-trial/',
        duration: '1 week',
        focus: 'Vaulting, PSM-brokered RDP/SSH, CPM auto-rotation, recording inspection',
      },
    ],
  },
  {
    id: 'architect_iga',
    name: 'IAM Architect & Identity Governance',
    targetRole: 'Identity Architect, IGA Lead, IAM Program Manager, Security Director',
    estimatedWeeks: '6–8 weeks',
    description:
      'Focuses on enterprise identity strategy, JML lifecycle pipelines, compliance framework mapping, cross-application segregation of duties (SoD), and program metrics.',
    steps: [
      {
        title: 'Identity Lifecycle (JML) Engineering',
        link: '/docs/fundamentals/identity-lifecycle/',
        duration: '1 week',
        focus: 'State transitions, event-driven HR triggers, orphan account prevention',
      },
      {
        title: 'IGA Capabilities & SoD Matrices',
        link: '/docs/protocols-iga/iga/',
        duration: '1 week',
        focus: 'Access certifications, role mining algorithms, toxic combinations',
      },
      {
        title: 'SCIM 2.0 In-Depth Provisioning',
        link: '/docs/protocols-iga/scim/',
        duration: '1 week',
        focus: 'Schema extensions, PATCH operations, bulk synchronization, idempotency',
      },
      {
        title: 'Regulatory Compliance Mapping',
        link: '/docs/reference/compliance-mapping/',
        duration: '1 week',
        focus: 'SOX 404, PCI DSS 4.0, ISO 27001:2022, NIST CSF 2.0 audit controls',
      },
      {
        title: 'Measuring an IAM Program (Metrics)',
        link: '/docs/pam-core/iam-metrics/',
        duration: '3 days',
        focus: 'Operational definitions, drift metrics, coverage formulas without fake benchmarks',
      },
      {
        title: 'IAM Architecture Interview Bank',
        link: '/docs/interviews/architecture-questions/',
        duration: '1–2 weeks',
        focus: 'Enterprise migration design, hybrid directory topologies, break-glass strategies',
      },
    ],
  },
];

export default function LearningTrack() {
  const [activeTrackId, setActiveTrackId] = useState<string>('cloud_devsecops');

  const currentTrack = TRACKS.find((t) => t.id === activeTrackId) || TRACKS[0];

  return (
    <div
      style={{
        margin: '2rem 0',
        padding: '1.5rem',
        background: 'var(--warm-1)',
        border: '1px solid var(--warm-3)',
        borderRadius: '4px',
        boxShadow: 'var(--ifm-global-shadow-lw)',
      }}
    >
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--accent-600)',
          marginBottom: '0.5rem',
        }}
      >
        Structured Curricula
      </div>
      <h3
        style={{
          margin: '0 0 0.5rem',
          fontSize: '1.4rem',
          fontFamily: 'var(--ifm-heading-font-family)',
          color: 'var(--ink-1)',
        }}
      >
        Select a Role-Based Learning Pathway
      </h3>
      <p style={{ margin: '0 0 1.25rem', fontSize: '0.925rem', color: 'var(--ink-2)', lineHeight: 1.55 }}>
        Choose a curated progression tailored to specific industry roles. Each track organizes core reading, architectural
        diagrams, hands-on labs, and interview question banks in optimal pedagogical sequence.
      </p>

      {/* Track Selection Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--warm-3)',
          paddingBottom: '0.75rem',
        }}
      >
        {TRACKS.map((track) => {
          const isActive = track.id === activeTrackId;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => setActiveTrackId(track.id)}
              style={{
                padding: '0.5rem 1rem',
                border: `1px solid ${isActive ? 'var(--accent-500)' : 'var(--warm-3)'}`,
                borderRadius: '8px',
                background: isActive ? 'var(--accent-100)' : 'var(--warm-0)',
                color: isActive ? 'var(--accent-700)' : 'var(--ink-2)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              {track.name}
            </button>
          );
        })}
      </div>

      {/* Active Track Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          background: 'var(--warm-0)',
          border: '1px solid var(--warm-2)',
          borderRadius: '4px',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: 'var(--ink-1)' }}>{currentTrack.name}</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>
              <strong>Target Roles:</strong> {currentTrack.targetRole}
            </div>
          </div>
          <span
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              background: 'var(--warm-2)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--accent-700)',
            }}
          >
            Pace: {currentTrack.estimatedWeeks}
          </span>
        </div>
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.55 }}>
          {currentTrack.description}
        </p>
      </div>

      {/* Step Sequence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {currentTrack.steps.map((step, idx) => (
          <div
            key={step.title}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '0.875rem 1rem',
              background: 'var(--warm-0)',
              border: '1px solid var(--warm-3)',
              borderRadius: '4px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--accent-500)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <Link
                  to={step.link}
                  style={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'var(--accent-600)',
                    textDecoration: 'none',
                  }}
                >
                  {step.title}
                </Link>
                <span style={{ fontSize: '0.8rem', color: 'var(--ink-4)', fontStyle: 'italic' }}>{step.duration}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)', marginTop: '0.2rem' }}>
                <strong>Key Mastery:</strong> {step.focus}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
