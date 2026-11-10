import React, { useState } from 'react';

interface Recommendation {
  title: string;
  protocol: string;
  rfcOrStandard: string;
  rationale: string;
  docLink: string;
}

export default function ProtocolChooser() {
  const [clientType, setClientType] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [phishingResistant, setPhishingResistant] = useState<boolean>(false);

  const getRecommendation = (): Recommendation | null => {
    if (!clientType || !goal) return null;

    if (goal === 'provisioning') {
      return {
        title: 'System for Cross-domain Identity Management (SCIM 2.0)',
        protocol: 'SCIM 2.0',
        rfcOrStandard: 'RFC 7643 / RFC 7644',
        rationale:
          'SCIM is the industry standard REST API for synchronizing user identities, attribute updates, and group memberships between an authoritative IdP and downstream SaaS applications.',
        docLink: '/docs/protocols-iga/scim',
      };
    }

    if (clientType === 'm2m') {
      if (goal === 'ephemeral') {
        return {
          title: 'Workload Identity Federation / SPIFFE & SPIRE',
          protocol: 'Workload Identity / mTLS',
          rfcOrStandard: 'SPIFFE Standard / RFC 8693',
          rationale:
            'For service-to-service communication without static API keys or long-lived credentials, exchange platform-issued OIDC tokens or short-lived mTLS X.509 certificates.',
          docLink: '/docs/fundamentals/workload-machine-identities',
        };
      }
      return {
        title: 'OAuth 2.0 Client Credentials Grant',
        protocol: 'OAuth 2.0 Client Credentials',
        rfcOrStandard: 'RFC 6749 Section 4.4',
        rationale:
          'When an automated service or daemon calls a protected API autonomously without user context, the Client Credentials grant exchanges a secured client_id and secret for a scoped access token.',
        docLink: '/docs/protocols-iga/oauth2',
      };
    }

    if (clientType === 'browser_app' || clientType === 'native_mobile') {
      if (phishingResistant) {
        return {
          title: 'OpenID Connect with PKCE + FIDO2 / WebAuthn Authentication',
          protocol: 'OIDC + PKCE + FIDO2',
          rfcOrStandard: 'RFC 7636, OpenID Core 1.0, W3C WebAuthn',
          rationale:
            'Public clients (SPAs and mobile apps) must never use client secrets. Authorization Code with PKCE prevents authorization code interception, and FIDO2 passkeys/security keys provide cryptographic origin binding against AiTM phishing.',
          docLink: '/docs/protocols-iga/oidc',
        };
      }
      return {
        title: 'OpenID Connect (OIDC) via Authorization Code Grant with PKCE',
        protocol: 'OIDC + PKCE',
        rfcOrStandard: 'RFC 7636 / OpenID Connect Core 1.0',
        rationale:
          'Modern web and mobile applications requiring user authentication and identity claims should use the Authorization Code Flow with Proof Key for Code Exchange (PKCE).',
        docLink: '/docs/protocols-iga/oidc',
      };
    }

    if (clientType === 'enterprise_saas') {
      return {
        title: 'SAML 2.0 (SP-Initiated SSO) or OpenID Connect',
        protocol: 'SAML 2.0 / OIDC',
        rfcOrStandard: 'OASIS SAML 2.0 / OpenID Connect Core',
        rationale:
          'For enterprise B2B SaaS integrations, SAML 2.0 SP-initiated SSO remains the predominant enterprise federation protocol, passing signed XML assertions between the corporate IdP and service provider.',
        docLink: '/docs/protocols-iga/saml',
      };
    }

    if (clientType === 'legacy_infra') {
      return {
        title: 'Kerberos v5 or Ephemeral Certificate PAM',
        protocol: 'Kerberos / Ephemeral SSH Certificates',
        rfcOrStandard: 'RFC 4120 / OpenSSH Certificate Spec',
        rationale:
          'On-premises Active Directory domains rely on Kerberos ticket-granting service (TGS) tickets. For modern zero standing privilege, front legacy servers with an ephemeral certificate proxy (such as Teleport).',
        docLink: '/docs/protocols-iga/kerberos',
      };
    }

    return null;
  };

  const rec = getRecommendation();

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
        Architectural Decision Guide
      </div>
      <h3
        style={{
          margin: '0 0 1rem',
          fontSize: '1.35rem',
          fontFamily: 'var(--ifm-heading-font-family)',
          color: 'var(--ink-1)',
        }}
      >
        Protocol Selector: Which Identity Standard Fits Your Architecture?
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '0.4rem' }}>
            1. Client Architecture
          </label>
          <select
            value={clientType}
            onChange={(e) => setClientType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '2px',
              border: '1px solid var(--warm-3)',
              background: 'var(--warm-0)',
              color: 'var(--ink-1)',
              fontSize: '0.9rem',
            }}
          >
            <option value="">Select client type...</option>
            <option value="browser_app">Single-Page App (SPA) / React / Vue</option>
            <option value="native_mobile">Native Mobile / Desktop App</option>
            <option value="m2m">Machine-to-Machine / Microservice / Daemon</option>
            <option value="enterprise_saas">Enterprise SaaS Application</option>
            <option value="legacy_infra">On-Premises Servers / Linux & Windows OS</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '0.4rem' }}>
            2. Primary Security Objective
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '2px',
              border: '1px solid var(--warm-3)',
              background: 'var(--warm-0)',
              color: 'var(--ink-1)',
              fontSize: '0.9rem',
            }}
          >
            <option value="">Select primary objective...</option>
            <option value="sso_authn">User Authentication & Single Sign-On</option>
            <option value="api_authz">Delegated API Authorization</option>
            <option value="provisioning">Automated Account Provisioning & Deprovisioning</option>
            <option value="ephemeral">Zero Standing Privileges / Ephemeral Credentials</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--ink-2)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={phishingResistant}
            onChange={(e) => setPhishingResistant(e.target.checked)}
            style={{ accentColor: 'var(--accent-500)' }}
          />
          Enforce phishing-resistant authentication (NIST AAL3 / FIDO2 WebAuthn requirement)
        </label>
      </div>

      {rec ? (
        <div
          style={{
            padding: '1.25rem',
            background: 'var(--warm-0)',
            border: '1px solid var(--accent-300)',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-600)', textTransform: 'uppercase' }}>
            Recommended Architecture
          </div>
          <h4 style={{ margin: '0.35rem 0 0.25rem', fontSize: '1.15rem', color: 'var(--ink-1)' }}>{rec.title}</h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)', marginBottom: '0.75rem' }}>
            Standard: <code>{rec.rfcOrStandard}</code>
          </div>
          <p style={{ fontSize: '0.925rem', color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 1rem' }}>
            {rec.rationale}
          </p>
          <a
            href={rec.docLink}
            style={{
              display: 'inline-block',
              padding: '0.4rem 0.875rem',
              background: 'var(--accent-500)',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Review the {rec.protocol} Implementation Guide →
          </a>
        </div>
      ) : (
        <div style={{ fontSize: '0.875rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>
          Select client architecture and security objective above to generate an architectural recommendation.
        </div>
      )}
    </div>
  );
}
