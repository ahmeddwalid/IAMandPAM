---
title: "Privileged Access Workstations"
description: "Why admin workstations matter, how a PAW architecture separates privileged from unprivileged work, and the hardware and policy controls that make it stick."
---

# Privileged Access Workstations

An admin who RDPs from their daily driver to a domain controller has just trusted that daily driver with domain admin rights. Every email attachment, every browser exploit, every macro on the daily driver is now a domain admin credential theft away from a complete compromise. A Privileged Access Workstation (PAW) breaks that chain by giving the admin a separate, hardened machine used only for privileged tasks.

## What a PAW is

A PAW is a dedicated workstation, physically or virtually isolated, used exclusively for managing privileged accounts and critical systems. It is not a VM on the same laptop. It is not a separate user account on the same machine. It is a separate environment with no shared clipboard, no shared filesystem, no shared browser, and no network path from the unprivileged environment to the management network.

The core principle: privileged credentials touch only trusted hardware. If the daily driver is compromised, the attacker gets email and documents. If the PAW is compromised, the attacker gets the domain.

## The tiering model

PAWs exist inside a tiered administration model that limits how far a compromise spreads. The most common model comes from Microsoft's Active Directory tiering guidance:

| Tier | What it contains | Who manages it from where |
|---|---|---|
| Tier 0 | Domain controllers, certificate authorities, PAM vaults, Entra Connect servers | From a Tier 0 PAW only |
| Tier 1 | Application servers, database servers, middleware | From a Tier 1 PAW or jump server |
| Tier 2 | Workstations, help desk tools, printers | From standard help desk tools |

The rule is directional: a higher-tier admin can manage lower-tier resources, but a lower-tier account cannot log in to a higher-tier resource. A Tier 2 help desk tech cannot RDP to a Tier 0 domain controller. A Tier 0 admin can RDP to a Tier 1 server but should use a Tier 1 PAW to do so, keeping the Tier 0 PAW reserved for Tier 0 work.

## The network flow

import Drawio from '@site/src/components/Drawio';
import pawArch from '!!raw-loader!@site/static/diagrams/paw-architecture.drawio';

<Drawio content={pawArch} />

[Download / edit this diagram](/diagrams/paw-architecture.drawio)

The flow: the admin uses a normal workstation for email and web. That workstation connects to the internet through a firewall but has no route to the management network. When the admin needs to manage a domain controller, they switch to the PAW. The PAW connects to the management network through a separate firewall path. It has no internet access, no browser, and no email client. The two environments share nothing.

## Hardware controls

A PAW is not just a software configuration. The hardware matters:

- **Dedicated machine:** a separate laptop or a dedicated virtual desktop on an isolated hypervisor. Not a dual-boot on the daily driver.
- **No USB boot:** BIOS boot order is locked to the internal drive only. An attacker cannot boot a live USB to bypass the OS.
- **BIOS password:** set and stored in the PAM vault or with a trusted colleague, not written on a sticky note under the keyboard.
- **Full-disk encryption:** TPM-backed BitLocker or equivalent. If the laptop is lost or stolen, the data is not readable.
- **Wired only:** no Wi-Fi adapter, or the Wi-Fi adapter is removed or disabled in BIOS. The PAW connects to the management VLAN over a physical cable.
- **Physical security:** locked drawer or safe when not in use. Clean desk. The PAW is not left logged in and unattended.

## Policy controls

Hardware alone is not enough. The policies enforce the boundaries:

- **PAW users cannot log in to non-PAW machines.** The PAW user accounts are denied logon to Tier 2 workstations through Group Policy. The admin has a normal account for email and a PAW account for privileged work, and the accounts never cross.
- **Non-admin users cannot log in to PAWs.** Only authorized administrators have accounts on the PAW. The local administrators group on the PAW is tightly controlled.
- **No internet access.** The PAW's network path has no route to the internet. There is no browser installed. If a domain controller needs a patch, the patch is downloaded on the daily driver, transferred through a one-way transfer mechanism (approved USB, isolated file drop), and applied from the PAW.
- **Credential Guard and LSA protection enabled.** These Windows features prevent credential dumping from memory even if the PAW is compromised.
- **RDP and SSH only to approved targets.** The PAW can reach the management VLAN, but within that VLAN, access is further restricted by firewall rules to only the specific systems the admin is authorized to manage.
- **No email, no Office, no productivity software.** The PAW has the management tools and nothing else. If the admin needs to read a runbook, the runbook is printed or displayed on a separate device.

## Virtual PAWs

Physical PAWs are expensive: one laptop per admin, plus spares, plus the operational overhead of maintaining a separate fleet. Virtual PAWs address this by running the PAW as a virtual machine on a dedicated, isolated hypervisor or through a virtual desktop infrastructure that enforces the same network and policy boundaries.

The honest trade-off: a virtual PAW on a well-managed hypervisor is better than no PAW at all. The hypervisor becomes part of the trusted compute base, which means it needs to be patched and monitored like a Tier 0 asset. A physical PAW removes the hypervisor from the trust chain and is the stronger option. The best PAW is the one people actually use: a PAW that is so inconvenient that admins find workarounds is worse than a slightly less secure PAW that admins accept.

## What breaks without a PAW

An attacker who compromises the admin's daily driver through a phishing email now has a machine that regularly authenticates to domain controllers. With credential dumping tools, the attacker extracts the admin's credentials from memory and has domain admin access within minutes. The admin's daily driver was never meant to be a security boundary, but in practice, it becomes one every time an admin logs in to a critical system from it.

With a PAW, the same phishing email lands on a machine that has no privileged credentials and no network path to the management network. The attacker gets email. They do not get the domain.

## PAWs and PAM

PAWs work with the PAM architecture, not instead of it. The PAW is the workstation from which the admin opens a PAM-brokered session. The PAM session records the admin's actions. The PAW ensures the endpoint that initiates that session is trusted. The combination is stronger than either alone: a PAM session from a compromised daily driver is a recorded session on a compromised endpoint, which means the attacker's actions are logged, but the attacker is still acting.

The [PAM architecture](05-pam-architecture.md) page covers the vault and session broker side. The [JIT access](07-jit-access.md) page covers the time-limited grant side. The [Zero trust](06-zero-trust-iam.md) page covers the model that ties them together.

Next: [Privileged account types](02-privileged-account-types.md), to understand what is being protected.
