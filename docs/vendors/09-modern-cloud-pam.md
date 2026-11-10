---
title: "Modern Cloud-Native PAM (Teleport, Boundary, StrongDM)"
description: "Architecture and evaluation of modern cloud-native privileged access platforms: Teleport, HashiCorp Boundary, StrongDM, and comparison with traditional vaults."
---
<!-- verified 2026-09-17 -->

import KnowledgeCheck from '@site/src/components/KnowledgeCheck';

# Modern Cloud-Native PAM (Teleport, Boundary, StrongDM)

As enterprise infrastructure moved from static physical data centers to ephemeral Kubernetes clusters, dynamic cloud auto-scaling groups, and multi-cloud databases, traditional vault-centric PAM architectures encountered significant operational friction. 

Deploying traditional Windows-based credential vaults and remote desktop session proxies (like CyberArk PSM or Delinea Secret Server engines) into modern cloud-native environments introduces high maintenance overhead and fails to accommodate developer workflows (such as native `kubectl`, `ssh`, and CLI database connections).

This led to the rise of **Cloud-Native PAM**: platforms designed specifically for cloud infrastructure, ephemeral workloads, and Zero Standing Privileges.

---

## 1. Architectural Paradigms Compared

| Evaluation Criterion | Traditional Enterprise PAM (e.g. CyberArk, Delinea) | Modern Cloud-Native PAM (e.g. Teleport, Boundary) |
|---|---|---|
| **Core Mechanism** | Credential Vaulting (rotates and checks out static passwords) | Ephemeral Certificates / Identity-based Session Brokering |
| **User Experience** | Web portal launching heavy RDP/HTML5 jump-server sessions | Native developer CLI (`tsh ssh`, `kubectl`, `boundary connect`) |
| **Credential Storage** | Central hardened database storing all target passwords | Zero stored target passwords; signed short-lived X.509/SSH certs |
| **Deployment Footprint** | Windows Server, SQL Server, domain joins, heavy agents | Lightweight Linux/Go binaries, container native, zero agent option |
| **Target Coverage** | Legacy Windows AD, Unix, network switches, mainframes | Kubernetes clusters, cloud VMs, modern databases, cloud consoles |
| **Network Model** | Requires dedicated jump hosts within target network subnets | Reverse tunnels out from private networks to proxy; zero open inbound ports |

---

## 2. Teleport

**Teleport** (by Gravitational) is an open-source, identity-aware access plane designed for engineering teams accessing SSH servers, Kubernetes clusters, databases, and internal web applications.

### Core Architectural Components:
1. **Teleport Auth Service**: The brains of the cluster. Acts as a Certificate Authority (CA) issuing short-lived OpenSSH and X.509 certificates. It federates with enterprise Identity Providers (Okta, Entra ID, GitHub) via OIDC or SAML.
2. **Teleport Proxy Service**: The public-facing entry point. Handles client authentication, hosts the Web UI, and terminates TLS. Crucially, target infrastructure establishes **reverse SSH tunnels** out to the proxy, meaning target networks require **zero inbound listening ports** on firewalls.
3. **Teleport Node / Service Agents**: Runs locally on target servers, databases, or Kubernetes clusters. Validates client certificates against the Auth CA and records session telemetry.

### Operational Workflow:
```bash
# Authenticate against corporate IdP (triggers browser WebAuthn prompt)
tsh login --proxy=teleport.enterprise.com --auth=okta

# SSH into a production server using ephemeral certificate (no static keys)
tsh ssh root@prod-payment-api-01

# Access a private Kubernetes cluster without exposing the API server
tsh kube login prod-cluster
kubectl get pods -n payment
```

All keystrokes, commands, and file transfers are captured and streamed to an immutable S3/blob audit storage in real time.

---

## 3. HashiCorp Boundary

**HashiCorp Boundary** is an open-source, identity-based access management tool designed by HashiCorp to provide secure, authenticated access to hosts and services without exposing underlying corporate networks or requiring VPNs.

### Core Architectural Concepts:
1. **Identity-Based Routing**: Rather than granting network-level IP/subnet access (like a traditional VPN), Boundary grants granular access to specific application targets (e.g., `postgres-reporting.internal:5432`).
2. **Boundary Controller**: Manages the service catalog, authenticates users against IdPs, and generates time-bounded authorization tokens.
3. **Boundary Worker**: Software proxies deployed inside private network zones that terminate sessions and route traffic to target hosts.
4. **Dynamic Credential Brokering**: Tight integration with **HashiCorp Vault**. When an engineer connects to a database through Boundary, Boundary automatically calls Vault to generate dynamic, short-lived database user credentials valid only for the duration of that specific session.

```bash
# Connect to a production database through an encrypted Boundary tunnel
boundary connect postgres -target-id ttcp_1234567890
```

---

## 4. StrongDM

**StrongDM** operates as a dynamic proxy network for infrastructure. It abstracts database connections, Kubernetes clusters, SSH hosts, and internal web applications behind a local client agent.
- **Protocol Decoding**: The StrongDM proxy intercepts native protocols (MySQL wire protocol, PostgreSQL protocol, RDP, SSH) and translates user identities into database credentials on the fly.
- **Query-Level Auditing**: Captures granular SQL queries executed inside database sessions, logging individual `SELECT`, `UPDATE`, and `DROP` commands to SIEM backends.
- **Enterprise Positioning**: StrongDM is a commercial SaaS product focused on rapid deployment across heterogeneous enterprise databases and legacy systems, whereas Teleport and Boundary offer fully self-hosted, open-source options.

---

<KnowledgeCheck
  question="Why is the 'Reverse Tunnel' architecture used by modern cloud PAM proxies (like Teleport) advantageous for multi-cloud network security?"
  options={[
    {
      id: "A",
      text: "It disables TLS encryption to speed up network throughput.",
      isCorrect: false,
      explanation: "Reverse tunnels maintain strict end-to-end TLS/SSH encryption at all times."
    },
    {
      id: "B",
      text: "Private servers and Kubernetes nodes establish outbound connections to the proxy, allowing administrators to access targets without opening any inbound ports on firewalls or deploying public IP addresses.",
      isCorrect: true,
      explanation: "By relying on outbound reverse tunnels, target infrastructure remains completely hidden from the public internet with zero open listening ports, dramatically shrinking the external attack surface."
    },
    {
      id: "C",
      text: "It automatically grants all network users root privileges.",
      isCorrect: false,
      explanation: "Proxying has no bearing on privilege level; access is strictly bounded by IdP identity and CA certificates."
    },
    {
      id: "D",
      text: "It removes the need to log administrative sessions.",
      isCorrect: false,
      explanation: "Modern cloud PAM proxies perform complete session and keystroke recording on all brokered traffic."
    }
  ]}
  takeaway="Evaluate cloud-native PAM when managing modern cloud servers, Kubernetes, and developer workflows. Use outbound reverse tunnels to eliminate open inbound firewall ports."
/>
