---
title: "Fine-Grained Authorization and Policy-as-Code"
description: "Relationship-Based Access Control (ReBAC), the Google Zanzibar model, Open Policy Agent (OPA) Rego, AWS Cedar, and externalized PDP/PEP architecture."
---
<!-- verified 2026-09-17 -->

import KnowledgeCheck from '@site/src/components/KnowledgeCheck';
import ProtocolChooser from '@site/src/components/ProtocolChooser';

# Fine-Grained Authorization and Policy-as-Code

Traditional authorization architectures rely on coarse-grained Role-Based Access Control (RBAC): users belong to roles (e.g., `BillingAdmin` or `SupportAgent`), and applications check `user.hasRole('Admin')` in backend handlers.

In enterprise software, this model inevitably degrades into **role explosion**. To accommodate nuanced business logic ("Alice can edit invoices, but only for EMEA clients, only during business hours, and only if the invoice total is under $50,000"), organizations create hundreds of bespoke roles (`EMEA_Invoice_Editor_Under50k`). The roles become unmaintainable, audit reviews degrade into rubber-stamping, and critical boundaries fail silently.

Modern authorization solves this through **Fine-Grained Authorization (FGA)** and **Policy-as-Code (PaC)**.

---

## 1. Comparing Authorization Paradigms

| Model | Core Concept | Example Rule | Scalability Limit |
|---|---|---|---|
| **RBAC** | Subject $\to$ Role $\to$ Permission | "Users with `Doctor` role can read medical records." | Degrades when permissions depend on context or ownership. |
| **ABAC** | Policy evaluating Subject, Resource, Action, Environment attributes | "Allow if `subject.clearance >= resource.classification` AND `env.ip in corporate_range`." | High policy complexity; challenging to compute "who has access to what" reverse queries. |
| **ReBAC** | Graph relations between objects, subjects, and groups | "Allow edit if user is a member of the folder's `editors` relation or owns the parent document." | Highly scalable for multi-tenant and collaborative resource hierarchies. |
| **Policy-as-Code** | Decoupled policy rules authored in declarative languages (Rego, Cedar) | Evaluates arbitrary JSON inputs and outputs boolean allow/deny decisions. | Externalizes logic from application code into version-controlled repositories. |

---

## 2. ReBAC and the Google Zanzibar Model

In 2019, Google published its seminal paper on **Zanzibar**, the global authorization system powering Google Drive, YouTube, and Cloud IAM. Modern open-source implementations include **OpenFGA** (CNCF) and **Ory Keto**.

### Zanzibar Representation: Relation Tuples
In ReBAC, all authorization decisions resolve against a distributed directed graph of **relation tuples**:

```text
tuple = <object> # <relation> @ <user>
```

Examples of relation tuples:
- `document:financial-report-2026#editor@user:alice` (Alice is an editor of the document)
- `document:financial-report-2026#parent@folder:finance-q3` (The document belongs to folder `finance-q3`)
- `folder:finance-q3#viewer@group:accounting#member` (All members of accounting group can view the folder)

### Transitive Expansion (Usersets)
When user Bob attempts to view `financial-report-2026`, the authorization engine traverses the graph:
1. Does a direct tuple `document:financial-report-2026#viewer@user:bob` exist? No.
2. Does the document define a relationship rule: `viewer: editor or parent.viewer`? Yes.
3. Does Bob belong to the parent folder's viewers? Engine checks `folder:finance-q3#viewer`.
4. Is Bob a member of `group:accounting`? Yes $\to$ **Decision: ALLOW**.

This structure allows sharing permissions to propagate instantly across millions of sub-objects without mutating records on every child item.

---

## 3. Policy-as-Code: Open Policy Agent (OPA) and Rego

**Open Policy Agent (OPA)** is an open-source, general-purpose policy engine. Instead of hardcoding authorization logic inside microservices, services make a REST API call to OPA, passing request data as JSON and receiving an authorization decision.

### Concrete Production Rego Policy
The following policy enforces fine-grained API authorization:
1. Denies all requests by default.
2. Allows users with `compliance_auditor` role to issue read-only `GET` requests.
3. Allows users to modify resources only if they own the resource or hold an active break-glass emergency claim.

```rego
package authz.api

# Default deny: All decisions default to false unless explicitly allowed
default allow = false

# Allow if the user has a valid compliance auditor role for read operations
allow {
    input.method == "GET"
    "compliance_auditor" == input.user.roles[_]
}

# Allow resource modifications if the requester is the resource owner
allow {
    input.method in ["POST", "PUT", "PATCH"]
    input.user.id == input.resource.owner_id
    not is_resource_locked
}

# Allow emergency modifications if break-glass claim is present and validated
allow {
    input.method in ["POST", "PUT", "PATCH", "DELETE"]
    input.user.break_glass == true
    input.user.break_glass_ticket != ""
    time.now_ns() < input.user.break_glass_expires_ns
}

# Helper rule: checks if resource status is archived
is_resource_locked {
    input.resource.status == "archived"
}
```

---

## 4. AWS Cedar: Formal Verification and Safety

Developed by AWS for Amazon Verified Permissions and AWS Verified Access, **Cedar** is a purpose-built authorization language designed for speed and provable correctness:
- **Default Deny**: Cedar requires explicit `permit` statements.
- **Formal Verification**: Cedar policies are mathematically checked using automated reasoning (SMT solvers) to ensure policies cannot contradict each other or introduce unreachable paths.
- **Constant-Time Evaluation**: Cedar deliberately avoids Turing completeness (no unbounded loops) to prevent denial-of-service during authorization checks.

```cedar
// Permit doctors in the Cardiology department to view patient records
permit (
    principal in Role::"Doctor",
    action == Action::"ViewMedicalRecord",
    resource in Department::"Cardiology"
)
when {
    context.request_ip in IPNet::"10.200.0.0/16" &&
    principal.mfa_authenticated == true
};

// Explicit forbid: Suspended accounts can never take any action
forbid (
    principal,
    action,
    resource
)
when {
    principal.is_suspended == true
};
```

---

## 5. Architectural Topology: PEP vs PDP

Modern policy-driven authorization divides responsibilities into two distinct architectural components:

1. **Policy Enforcement Point (PEP)**: Embedded directly in the request path (e.g., an Envoy API gateway, an NGINX reverse proxy, or a web application middleware). The PEP intercepts incoming requests, extracts headers and JWT claims, queries the PDP, and strictly enforces the binary allow/deny decision.
2. **Policy Decision Point (PDP)**: A dedicated service (running as a local sidecar container or a central microservice) that evaluates policies against the extracted request data and returns decisions.

### Latency and Resilience Trade-offs
- **Centralized PDP**: Simpler to deploy, but introduces network hop latency (5–20ms per API call) and represents a single point of failure.
- **Sidecar / Local PDP**: Runs on `localhost` alongside the microservice (0.2–1ms latency via in-memory cache). Policies are pushed asynchronously to all sidecars via git-driven CI/CD bundles.

---

<ProtocolChooser />

---

<KnowledgeCheck
  question="What is the primary operational advantage of ReBAC (Relationship-Based Access Control) over standard RBAC in collaborative, hierarchical SaaS platforms?"
  options={[
    {
      id: "A",
      text: "It replaces all public-key cryptography with symmetric shared secrets.",
      isCorrect: false,
      explanation: "ReBAC is an authorization model dealing with relationships and permissions; it does not alter cryptographic primitives."
    },
    {
      id: "B",
      text: "It allows permissions to propagate dynamically through resource and group relationship graphs without mutating individual permission records across millions of nested items.",
      isCorrect: true,
      explanation: "By defining transitive relation rules (e.g. child document inherits viewer relation from parent folder), changing folder access instantly updates all contained documents without running mass database updates."
    },
    {
      id: "C",
      text: "It automatically generates user passwords upon account creation.",
      isCorrect: false,
      explanation: "Password generation belongs to user lifecycle provisioning, not authorization models."
    },
    {
      id: "D",
      text: "It eliminates the need for an Identity Provider (IdP).",
      isCorrect: false,
      explanation: "ReBAC governs authorization (who can do what to which object). It assumes authentication (who the user is) has already been performed by an IdP."
    }
  ]}
  takeaway="Use RBAC for broad system roles, but adopt ReBAC or Policy-as-Code (OPA/Cedar) when access decisions depend on resource ownership, nesting, or dynamic organizational relationships."
/>
