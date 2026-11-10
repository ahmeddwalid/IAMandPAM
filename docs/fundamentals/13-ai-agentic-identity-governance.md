---
title: "AI and Agentic Identity Governance"
description: "Governing autonomous AI agents, LLM tool execution, Model Context Protocol (MCP) boundaries, and non-human identity proliferation."
---
<!-- verified 2026-09-26 -->

# AI and Agentic Identity Governance

The proliferation of autonomous artificial intelligence (AI) agents, large language models (LLMs) equipped with tool-calling capabilities, and synthetic personas represents the fastest-growing category of Non-Human Identities (NHI) in enterprise networks. Machine identities already outnumber human identities by a factor of 45 to 1 in modern organizations. Autonomous AI agents fundamentally alter the identity boundary: unlike traditional deterministic software (such as nightly cron jobs or static ETL pipelines), an AI agent decides its own execution path, selects tools dynamically, and constructs API payloads probabilistically.

Without rigorous identity architecture, deploying an autonomous agent with broad API keys creates immediate operational and security risks, formalized in the OWASP Top 10 for Large Language Model Applications under **LLM08: Excessive Agency**.

## The Agentic Identity Spectrum

AI agents operate under two distinct identity paradigms, each requiring a different authorization model:

| Dimension | User-Delegated Agent (Copilot Model) | Autonomous Synthetic Agent (Agentic Model) |
|---|---|---|
| **Identity Context** | Operates on behalf of a specific human user (`act_as`) | Operates as an independent machine principal (`client_id`) |
| **Authority Boundary** | Bound by the delegating user's entitlements | Independent service principal with scoped permissions |
| **Token Standard** | RFC 8693 Token Exchange / OAuth 2.0 On-Behalf-Of | OAuth 2.0 Client Credentials with mTLS or DPoP |
| **Liability & Attribution** | Human user remains accountable for actions | Sponsoring team or system owner is accountable |
| **Session Lifetime** | Tied to user's interactive session (minutes to hours) | Persistent or scheduled execution cycles |

### User-Delegated Architecture (RFC 8693)

When an AI assistant books travel, queries databases, or edits documents on behalf of an authenticated employee, the assistant must not inherit static administrative credentials. Instead, the agent exchanges the human user's incoming JWT for a downstream token using RFC 8693 (OAuth 2.0 Token Exchange):

```json
{
  "iss": "https://auth.enterprise.com",
  "sub": "user_49102",
  "aud": "https://api.finance.enterprise.com",
  "act": {
    "sub": "ai_agent_copilot_service"
  },
  "scope": "reports:read",
  "exp": 1727376000
}
```

The `act` (actor) claim cryptographically establishes that `ai_agent_copilot_service` is performing the action, while `sub` establishes that `user_49102` is the delegating human. Downstream services enforce two constraints:
1. The user possesses the entitlement to read financial reports.
2. The AI agent is authorized to act on behalf of the user for that specific scope.

### Autonomous Synthetic Personas

Autonomous agents that monitor infrastructure, triage security incidents, or execute business processes run without human intervention. These agents are provisioned as first-class Non-Human Identities:

- Assigned an immutable Enterprise Unique Identifier (EUID).
- Registered in the centralized Identity Governance and Administration (IGA) catalog.
- Assigned an operational human sponsor (the engineering manager or technical lead responsible for the agent's behavior).
- Certified through quarterly access recertification campaigns, identical to human employees.

## Model Context Protocol (MCP) Security Boundaries

The Model Context Protocol (MCP) standardizes how AI applications connect to external tools, databases, and filesystem resources. In an enterprise environment, MCP servers function as Privileged Execution Proxies:

```
[User / Client]
       │
       ▼ (1. Prompt & User Token)
[Host LLM Application]
       │
       ▼ (2. Scoped MCP Tool Request)
[MCP Authorization Gateway]  ◄── Evaluates Policy Engine (OPA / Cedar)
       │
       ▼ (3. Ephemeral mTLS / Scoped API Call)
[Enterprise MCP Server] (Postgres / GitHub / Jira)
```

### Security Controls for MCP Deployments

1. **Transport Isolation**: Local MCP servers communicate over stdio inside sandboxed Linux containers; remote MCP servers require mutual TLS (mTLS) with pinned client certificates.
2. **Dynamic Context Filtering**: MCP tools must not expose entire raw database schemas or broad file paths to the LLM context. Tool schemas must enforce parameter whitelisting (e.g., regex-constrained SQL identifiers or strictly typed UUID parameters).
3. **Prompt Injection Boundary**: LLM output parsed into tool arguments must be treated as untrusted input. Tool execution engines must validate arguments against static schema validators before dispatching commands to target backends.

## Mitigation of Excessive Agency (OWASP LLM08)

Excessive agency occurs when an AI agent possesses broad capabilities, permissions, or autonomy, and executes unexpected actions due to hallucination, prompt injection, or malicious jailbreaks.

IAM mitigations for excessive agency:

### 1. Ephemeral Tool Grants

An autonomous agent must not hold continuous standing privilege to all enterprise APIs. When an agent decides to invoke an external tool, it requests an ephemeral, time-boxed authorization token (TTL under 5 minutes) scoped to the single action. Once the tool executes, the token expires automatically.

### 2. Dual-Control and Human-in-the-Loop (HITL) Step-Up

Actions categorized as irreversible or high-impact must enforce out-of-band human approval:

- **Read Operations**: Querying documentation, fetching ticket status, or calculating metrics execute autonomously within the agent's pre-approved scope.
- **Write Operations (Low Risk)**: Creating a draft email or formatting a draft pull request execute autonomously.
- **High-Risk Operations**: Deleting database tables, modifying firewall rules, transferring funds, or changing IAM permissions trigger an out-of-band approval notification to the designated human supervisor. The action remains blocked until the supervisor approves via FIDO2-authenticated signature.

### 3. Rate-Limiting and Blast-Radius Quotas

Agents must be subject to automated circuit breakers:
- Maximum API invocations per minute (preventing runaway recursive loops).
- Maximum monetary transaction caps per execution cycle.
- Maximum number of records modified in a single batch.

## Audit and Attestation for Agent Actions

Standard audit logging records *which* service principal executed an API request. For AI agents, compliance and incident response teams require the *reasoning path*:

1. **Correlation Identifier**: Every API call executed by an agent must carry a correlation ID linking the request to the specific LLM session, prompt version, model identifier, and reasoning trace.
2. **Immutable Trace Storage**: Audit pipelines record the input prompt, tool-call decision payload, and target response in tamper-evident, append-only storage.
3. **Forensic Revocation**: In the event of prompt injection or erratic behavior, incident response playbooks must allow immediate one-click invalidation of all active tokens issued to the agent, freezing the agent's identity across all integrated systems.

## Interview Angle

Questions regarding AI and machine identity governance test modern identity architecture readiness:

- **"How do you prevent an AI agent from being tricked via prompt injection into deleting a production database?"**
  - Explain the multi-layer IAM defense: the database service principal held by the MCP server must lack `DROP` or `DELETE` permissions altogether (least privilege); tool arguments must undergo deterministic schema validation outside the LLM; and any high-impact operation must require out-of-band human cryptographic approval rather than trusting the LLM's autonomous decision.
- **"How does RFC 8693 Token Exchange apply to AI copilot architectures?"**
  - Walk through how an agent swaps a user's broad access token for a down-scoped, short-lived token carrying the `act` claim. This guarantees that audit trails distinguish between actions the user took directly versus actions the AI agent took on the user's behalf.
