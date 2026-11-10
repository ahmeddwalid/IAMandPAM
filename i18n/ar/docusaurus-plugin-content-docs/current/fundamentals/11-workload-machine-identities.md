---
title: "Workload and Machine Identities"
description: "Non-human identities (NHI), SPIFFE/SPIRE architecture, mTLS, and cloud workload identity federation without static secrets."
---
<!-- verified 2026-09-17 -->

import Drawio from '@site/src/components/Drawio';
import KnowledgeCheck from '@site/src/components/KnowledgeCheck';
import diagram from '!!raw-loader!@site/static/diagrams/machine-workload-identity.drawio';

# Workload and Machine Identities

In modern enterprise architectures, non-human identities (NHIs) — service accounts, API keys, CI/CD runners, Kubernetes workloads, microservices, and automated scripts — outnumber human identities by a factor of 10 to 45 times. Unlike human employees, workloads do not complete MFA prompts, do not check email for magic links, and operate 24/7.

When organizations fail to govern machine identities, engineers default to generating long-lived, high-privilege static credentials (such as AWS IAM access keys, static database passwords, or permanent API tokens) and hardcoding them into configuration files, container images, or CI/CD variable vaults. If compromised, these credentials grant attackers indefinite persistent access without triggering traditional user-behavior anomaly alerts.

---

## 1. The Machine Identity Problem

| Characteristic | Human Identity | Non-Human / Workload Identity |
|---|---|---|
| **Population Scale** | Hundreds to tens of thousands | Hundreds of thousands to millions |
| **Authentication Factor** | Passwords, FIDO2 passkeys, biometrics | Certificates, cryptographic tokens, private keys |
| **Lifecycle Driver** | HR events (hire, transfer, termination) | Deployment events (deploy, auto-scale, pod destroy) |
| **Session Lifetime** | 8 to 12 hours (workday) | Ephemeral (seconds/minutes) or inadvertently static (years) |
| **MFA Feasibility** | Interactive MFA (push, hardware key) | Impossible interactively; requires mutual cryptographic proof |
| **Credential Storage** | Memory, OS password manager, physical key | Environment variables, config maps, keyrings, memory |

The fundamental design rule of modern workload identity is: **eliminate static credentials entirely in favor of short-lived, cryptographically verifiable tokens issued on demand**.

---

## 2. SPIFFE and SPIRE Architecture

The **Secure Production Identity Framework for Everyone (SPIFFE)** is an open-source Cloud Native Computing Foundation (CNCF) standard that defines a uniform identity specification for workloads across heterogeneous environments (on-premises servers, Kubernetes clusters, and multi-cloud platforms).

### Core SPIFFE Concepts:
1. **SPIFFE ID**: A standardized URI that uniquely names a workload:
   ```text
   spiffe://prod.enterprise.internal/ns/payment/sa/processor-daemon
   ```
2. **SPIFFE Verifiable Identity Document (SVID)**: The cryptographic document asserting the SPIFFE ID. SVIDs take two formats:
   - **X.509 SVID**: An X.509 digital certificate used for mutual TLS (mTLS) handshakes between services.
   - **JWT SVID**: A signed JSON Web Token used for authenticating over HTTP where TLS termination occurs at a proxy.
3. **SPIRE (SPIFFE Runtime Environment)**: The reference implementation comprising a **SPIRE Server** (managing the signing CA and registration entries) and a node-local **SPIRE Agent** that exposes the SPIFFE Workload API over a local Unix domain socket. Workloads query this socket to receive rotated keys and certificates automatically without needing bootstrap credentials.

---

## 3. Cloud Workload Identity Federation

Rather than embedding long-lived cloud credentials (e.g., `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) inside external workloads, modern cloud providers support **Workload Identity Federation** based on RFC 8693 and OIDC.

### Architectural Flow

<Drawio content={diagram} />

<p className="diagram-caption">
  Machine and Workload Identity Federation: An ephemeral workload exchanges a platform-signed OIDC token for short-lived cloud STS credentials.
  <a href="/diagrams/machine-workload-identity.drawio" download>تنزيل هذا المخطط أو تعديله</a>
</p>

### Step-by-Step Federation Mechanics:
1. **Token Generation**: The execution platform (Kubernetes API server or GitHub Actions runner) issues an OpenID Connect (OIDC) JWT signed by its private key. In Kubernetes, this is handled by the `TokenRequest` API, mounting a time-limited token at `/var/run/secrets/tokens/vault-token`.
2. **Token Payload**: The JWT contains standardized claims:
   ```json
   {
     "iss": "https://token.actions.githubusercontent.com",
     "sub": "repo:organization/payment-service:ref:refs/heads/main",
     "aud": "sts.amazonaws.com",
     "exp": 1726588800
   }
   ```
3. **Security Token Service (STS) Call**: The workload passes this JWT to the cloud provider's STS endpoint via `AssumeRoleWithWebIdentity`.
4. **Signature Verification**: The cloud STS fetches the public JSON Web Key Set (JWKS) from the issuer's public endpoint (`/.well-known/jwks.json`) and verifies the cryptographic signature.
5. **Trust Policy Evaluation**: The STS evaluates the role's IAM trust policy to ensure the `sub` (subject), `aud` (audience), and `iss` (issuer) match strict constraints:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
             "token.actions.githubusercontent.com:sub": "repo:organization/payment-service:ref:refs/heads/main"
           }
         }
       }
     ]
   }
   ```
6. **Short-Lived Credential Issuance**: The STS returns temporary AWS credentials (`AccessKeyId`, `SecretAccessKey`, `SessionToken`) valid for 1 hour. No static secrets are ever stored in GitHub or the workload.

---

## 4. Kubernetes ServiceAccount Token Projection

Historically, Kubernetes mounted a static, non-expiring ServiceAccount token secret into every pod. If a pod was compromised or an attacker obtained a memory dump, that token could be used from any network location indefinitely.

Modern Kubernetes clusters (v1.22+) enforce **Projected ServiceAccount Tokens**:
- **Bounded Audience**: The token explicitly specifies `aud` claims restricting which service or API may accept it.
- **Bounded Lifetime**: The token has a strict expiration (`exp`, default 1 hour) and is automatically refreshed by the `kubelet` in memory.
- **Pod Binding**: The token is cryptographically bound to the pod instance. If the pod is deleted, the token immediately ceases to validate.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: payment-processor
spec:
  containers:
  - name: app
    image: enterprise/payment:v2.1
    volumeMounts:
    - mountPath: /var/run/secrets/tokens
      name: vault-token
  volumes:
  - name: vault-token
    projected:
      sources:
      - serviceAccountToken:
          path: vault-token
          expirationSeconds: 3600
          audience: "https://vault.internal.corp"
```

---

<KnowledgeCheck
  question="Why is Workload Identity Federation with OIDC cryptographically superior to storing long-lived cloud credentials in CI/CD secrets variables?"
  options={[
    {
      id: "A",
      text: "It encrypts the static secret inside an encrypted database in the cloud.",
      isCorrect: false,
      explanation: "Workload Identity Federation does not store or encrypt static secrets; it eliminates the static secret entirely."
    },
    {
      id: "B",
      text: "The CI/CD runner dynamically mints a short-lived, signed JWT that the cloud STS verifies via public PKI, issuing temporary 1-hour credentials without any standing secrets to steal.",
      isCorrect: true,
      explanation: "By relying on asymmetric public-key cryptography (JWKS verification), the cloud provider validates identity directly from the platform without requiring a pre-shared permanent secret."
    },
    {
      id: "C",
      text: "It enables interactive multi-factor authentication on every automated build step.",
      isCorrect: false,
      explanation: "Automated workloads cannot complete interactive MFA challenges; security is achieved through cryptographic attestation and short expiration windows."
    },
    {
      id: "D",
      text: "It allows workloads to bypass cloud IAM role permission checks.",
      isCorrect: false,
      explanation: "Workload Identity Federation still assumes an IAM role and is fully governed by the role's permission policies."
    }
  ]}
  takeaway="Never store long-lived cloud access keys in CI/CD pipelines or servers. Use OIDC federation so temporary credentials are generated on the fly and expire automatically."
/>
