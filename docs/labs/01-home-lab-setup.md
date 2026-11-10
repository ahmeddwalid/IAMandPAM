---
title: Lab 1 - Home Lab Setup
description: "Build the VirtualBox, Windows Server, and Keycloak foundation that the rest of the labs reuse: a domain controller, a Docker-based identity provider, and a test application."
---

# Lab 1 - Home Lab Setup

## What this lab proves

Before any interesting identity work, you need the three pieces every later lab assumes: a Windows Server domain controller running Active Directory, a Keycloak identity provider running in Docker, and a trivial OIDC test application. Building this base yourself teaches the parts of the stack that are usually already "just there" in a real job: how the domain controller is structured, how Keycloak stores realms and clients, and how an app actually talks to an identity provider.

## What you will have at the end

- A `corp.local` Active Directory domain with one domain controller, `DC1`, running Windows Server 2022 Evaluation.
- Keycloak running in Docker on the host, reachable at `http://localhost:8080`, with one realm (`corp`) and one test client.
- A tiny OIDC test application (the Keycloak example app) that logs in through Keycloak.

## Prerequisites

- Host with 16 GB RAM, 80 GB free disk, virtualization enabled in BIOS/UEFI.
- VirtualBox installed, with the Extension Pack for RDP support.
- Docker Desktop installed and running.
- Windows Server 2022 Evaluation ISO downloaded from Microsoft's evaluation center (free registration). The ISO is roughly 5 GB, so start the download early.
- Keycloak: the fastest path is `quay.io/keycloak/keycloak:latest`. No separate download needed; Docker pulls it.

## Step 1 - Create the DC1 virtual machine

1. In VirtualBox, click New. Name `DC1`, type Microsoft Windows, version Windows Server 2022 (64-bit). Memory: 4096 MB. Disk: 60 GB dynamically allocated.
2. In Settings, set two network adapters:
   - Adapter 1: NAT (for host-to-guest access and updates).
   - Adapter 2: Internal Network, name `labnet` (this is your "corporate" network; later VMs join it).
3. Start the VM, attach the Windows Server ISO as the optical drive, and boot from it.
4. When the setup asks for an edition, choose Windows Server 2022 Standard (Desktop Experience). Installing the desktop experience makes the rest of this lab far easier to follow; Server Core is a valid choice later when you are comfortable with PowerShell administration.
5. Accept the evaluation license, choose Custom install, and let the installer use the whole disk. Windows Server Evaluation does not need a product key during setup.

## Step 2 - Configure networking and name the server

1. Open the network adapter settings and find the adapter on the `labnet` internal network (it will not have DHCP, so it gets an Automatic Private IP like `169.254.x.x`).
2. Set a static IP for that adapter: IP `10.10.0.10`, subnet mask `255.255.0.0`, no gateway (the internal network has none). Leave DNS empty for now; AD will configure it.
3. Rename the server to `DC1` (System Properties → Computer Name → Change). Reboot when prompted.

## Step 3 - Install Active Directory Domain Services

1. Open Server Manager. Click Add roles and features, then select the `DC1` server.
2. Select the **Active Directory Domain Services** role. Accept the defaults; the installer adds the management tools.
3. After installation, click the flag icon in Server Manager and choose **Promote this server to a domain controller**.
4. Select **Add a new forest** and set the root domain name to `corp.local`. Forest and domain functional levels: Windows Server 2016 or higher is fine. Set the Directory Services Restore Mode password and let the wizard finish (it reboots automatically).

Verification: after reboot, Server Manager shows the AD DS and DNS roles, and the computer is a domain controller of `corp.local`. `dcdiag /q` in an elevated PowerShell should return no errors.

## Step 4 - Create lab users and a group

Identity work needs identities. Create two test users and one group:

```powershell
New-ADUser -Name "alice" -SamAccountName alice -UserPrincipalName alice@corp.local `
  -AccountPassword (ConvertTo-SecureString "Password123!" -AsPlainText -Force) `
  -Enabled $true -Path "CN=Users,DC=corp,DC=local"
New-ADUser -Name "bob" -SamAccountName bob -UserPrincipalName bob@corp.local `
  -AccountPassword (ConvertTo-SecureString "Password123!" -AsPlainText -Force) `
  -Enabled $true -Path "CN=Users,DC=corp,DC=local"
New-ADGroup -Name "lab-users" -GroupScope Global -Path "CN=Users,DC=corp,DC=local"
Add-ADGroupMember -Identity "lab-users" -Members alice, bob
```

Note: these passwords are deliberately weak because this is an isolated lab on an internal-only network. In any real deployment, the AD password policy would reject them.

## Step 5 - Run Keycloak in Docker

On the host:

```bash
docker run -d --name keycloak -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -e KC_HOSTNAME=localhost \
  quay.io/keycloak/keycloak:latest start-dev
```

`start-dev` runs in development mode with no TLS, which is fine for a laptop lab. Wait for the log line that says the server started, then open `http://localhost:8080` and log in to the admin console with `admin` / `admin`.

## Step 6 - Create the realm and a test client

1. In the admin console, open the realm picker (top-left) and click **Create realm**. Name it `corp`. Realms are fully isolated identity domains; everything in the rest of the labs lives in `corp`.
2. Under **Clients**, click Create client:
   - Client type: OpenID Connect.
   - Client ID: `test-app`.
   - Valid redirect URIs: `http://localhost:8081/*`.
   - Standard flow enabled, direct access grants disabled.
3. Under **Realm settings → Login**, note that registration and forgot-password links are on by default in a fresh realm. Disable self-registration for now; identities come from AD in Lab 2, not from signups.

## Step 7 - Run the Keycloak example app

The Keycloak repository ships an example app that exercises the full OIDC flow without writing code:

```bash
docker run -d --name test-app -p 8081:8080 \
  quay.io/keycloak/keycloak-examples:latest
```

Open `http://localhost:8081` and log in through the link. You will be redirected to Keycloak's login page; there are no users in the `corp` realm yet, so create a test user under **Users → Create user** in the admin console, set a password under the Credentials tab, and log in as them. The app then shows the claims Keycloak sent in the ID token.

## Verification checklist

- [ ] `dcdiag /q` on DC1 returns no errors.
- [ ] `alice` and `bob` resolve with `Get-ADUser alice` on DC1.
- [ ] `http://localhost:8080` serves the Keycloak admin console and you can log in.
- [ ] `http://localhost:8081` lets you log in through the `corp` realm and displays your username.
- [ ] The test-app session survives a browser restart only while the Keycloak SSO session lives (check by logging in, closing the browser, reopening `http://localhost:8081`).

## Common pitfalls

- **The guest has no network on the internal adapter.** Static IP must be set by hand; there is no DHCP on `labnet`.
- **Promote to domain controller fails on DNS.** The wizard needs the static IP set first; if DNS points at the NAT router, the forest creation fails. Clear DNS to automatic before promoting.
- **Port 8080 already in use.** Any other dev tool on the host can hold it. Either stop it or map Keycloak to `8088` and adjust the client redirect URIs accordingly.
- **Keycloak and the app time out on first start.** First boot downloads and initializes; give it 30-60 seconds and check `docker logs keycloak`.

## What you learned

A domain controller is not "just a server with AD installed"; it is also the DNS server for its zone, which is why the static IP and DNS interplay matters. Keycloak's realm model is the first place identity isolation appears: the same Keycloak instance can serve many realms, and realms do not share users. And the OIDC redirect you saw in the example app is the same mechanism every vendor federation in later labs relies on.

Next: [Lab 2 - AD plus Keycloak SSO](02-keycloak-sso.md).