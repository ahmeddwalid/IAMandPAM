---
title: "Lab 10: Zero Standing Privileges with Teleport"
description: "Deploy Teleport Community on Docker, issue short-lived OpenSSH certificates, enforce identity-based access, and eliminate static SSH keys and database passwords."
---
<!-- verified 2026-09-17 -->

import Drawio from '@site/src/components/Drawio';
import diagram from '!!raw-loader!@site/static/diagrams/zero-standing-privilege-zsp.drawio';

# Lab 10: Zero Standing Privileges with Teleport

Managing thousands of static SSH keys across hundreds of servers is an operational nightmare. Keys are rarely rotated, orphan keys persist after engineers leave the company, and shared root keys completely eliminate individual accountability.

In this lab, you will deploy an open-source **Teleport Community Edition** cluster using Docker Compose. You will configure an ephemeral Certificate Authority, connect a target Linux node, issue 1-hour signed OpenSSH certificates, and observe complete session and keystroke recording without leaving a single static password or key on the target machine.

---

## 1. Architecture & Lab Objectives

<Drawio content={diagram} />

<p className="diagram-caption">
  Zero Standing Privilege Architecture: Authenticate via identity provider, receive an ephemeral signed certificate, and connect through the secure proxy.
  <a href="/diagrams/zero-standing-privilege-zsp.drawio" download>Download / edit this diagram</a>
</p>

### What You Will Learn:
- How to deploy and configure a Teleport Auth + Proxy service on Docker.
- How to configure OpenSSH daemons to trust a dynamic Certificate Authority (`TrustedUserCAKeys`).
- How to authenticate using the `tsh` CLI to obtain short-lived cryptographic certificates.
- How to replay and audit administrative sessions in the Teleport web console.

### Lab Parameters:
- **Estimated Time**: 60–75 minutes
- **Cost**: $0 (executes entirely on local Docker engine)
- **Prerequisites**: Docker & Docker Compose installed, Linux/macOS/WSL2 terminal.

---

## 2. Step-by-Step Implementation

### Step 1: Create the Docker Compose Cluster Environment
Create a working directory and a `docker-compose.yml` defining the Teleport Auth/Proxy service and an SSH target node:

```yaml
version: '3.8'

services:
  teleport:
    image: public.ecr.aws/gravitational/teleport:15
    container_name: teleport-cluster
    entrypoint: ["/bin/sh", "-c"]
    command:
      - |
        teleport configure --acme=off --insecure-no-tls=on > /etc/teleport/teleport.yaml
        teleport start --config=/etc/teleport/teleport.yaml
    ports:
      - "3080:3080" # Web UI / Proxy
      - "3023:3023" # SSH Proxy
      - "3025:3025" # Auth API
    volumes:
      - teleport-data:/var/lib/teleport

  target-server:
    image: ubuntu:22.04
    container_name: prod-target-node
    entrypoint: ["/bin/sh", "-c"]
    command:
      - |
        apt-get update && apt-get install -y openssh-server sudo curl
        mkdir -p /var/run/sshd
        useradd -m -s /bin/bash operator
        echo "operator ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
        /usr/sbin/sshd -D
    ports:
      - "2222:22"

volumes:
  teleport-data:
```

Launch the cluster:
```bash
docker compose up -d
```

### Step 2: Create a Teleport Administrative User
Create a local user with administrative and operator roles:
```bash
docker exec -it teleport-cluster tctl users add alice \
  --roles=editor,access \
  --logins=root,operator,ubuntu
```
The command outputs a registration URL. Open the URL in your browser, set a password, and register a local WebAuthn hardware key or mobile authenticator app.

### Step 3: Configure Target Node to Trust Teleport User CA
Extract the trusted User CA public key from Teleport and configure OpenSSH on `target-server`:

```bash
# 1. Export the CA public key from Teleport
docker exec -it teleport-cluster tctl auth export --type=user > /tmp/teleport_user_ca.pub

# 2. Copy the key to the target server
docker cp /tmp/teleport_user_ca.pub prod-target-node:/etc/ssh/teleport_user_ca.pub

# 3. Configure sshd to trust the CA and reload
docker exec -it prod-target-node sh -c '
  echo "TrustedUserCAKeys /etc/ssh/teleport_user_ca.pub" >> /etc/ssh/sshd_config
  kill -HUP $(pgrep sshd)
'
```

### Step 4: Authenticate and Connect via `tsh`
Install the `tsh` client on your workstation:
```bash
# Log in to the Teleport cluster
tsh login --proxy=localhost:3080 --insecure --user=alice

# Inspect the issued ephemeral certificate
tsh status
```
**Observation**: `tsh status` confirms you hold an OpenSSH certificate valid for exactly **12 hours** (or 60 minutes if configured), allowing login as `operator` or `ubuntu`.

Connect to the target node:
```bash
# Connect through the Teleport proxy
tsh ssh --proxy=localhost:3080 operator@localhost:2222
```
You are immediately logged in to the target container **without typing any password or having your personal SSH public key present in any `authorized_keys` file**.

### Step 5: Session Playback and Keystroke Auditing
Execute several commands inside the session:
```bash
whoami
uname -a
sudo cat /etc/shadow
exit
```
Open the Teleport Web UI at `https://localhost:3080`, navigate to **Audit Log** $\to$ **Session Recordings**, and click **Play**. Watch the recorded terminal session replay keystroke-by-keystroke in real time.
