---
title: "Core PAM Capabilities"
description: "Credential vaulting, session management, rotation, and discovery: the mechanism catalog a PAM program is built from."
---

# Core PAM Capabilities

Every PAM product, whatever its marketing, is a combination of the same handful of mechanisms. Learning the mechanisms is how you evaluate vendors, design programs, and answer interview questions about PAM without reciting product names. This page is the mechanism catalog; the [architecture page](pam-architecture) shows how they assemble.

## Credential vaulting

The vault is an encrypted store for privileged credentials, with three properties that a plain password database does not have:

- **Check-out / check-in**: a credential is released to exactly one requester for a limited window and returned after use. The classic pattern: the admin requests the root password, uses it, and the vault can rotate it the moment it is checked back in.
- **API-first access**: applications and pipelines retrieve secrets the same way a person does, with their own identity and policy. This is what turns "the password in the config file" into "the secret that exists for ten minutes."
- **Full audit**: every check-out, check-in, and rotation is logged with the requester identity.

The vault does not solve sharing; it makes sharing safe and attributable. The same shared root password is now released only on request, only to a known identity, and only for a window.

## Privileged session management (PSM)

PSM is the difference between a password safe and a PAM platform. Instead of releasing the credential to the person, the platform opens the session itself:

- The admin connects to the platform (SSH, RDP, or a web console).
- The platform authenticates the admin with their own identity.
- The platform connects to the target using the vaulted credential.
- The session streams through the platform: recorded, monitored, and optionally command-filtered.
- On disconnect, the platform closes the session and can rotate the credential immediately.

The person never sees the password. That is the property that makes shared and break-glass accounts usable at all: the account can be given to nobody, yet used by anyone with approval.

## Credential rotation

A credential that never changes is a credential that has leaked. Rotation is the mechanism that keeps that from mattering:

- **Scheduled rotation** (daily, weekly, per check-in) bounds the lifetime of any leak.
- **Event-driven rotation** (after check-in, after a personnel change, after an alert) is tighter and more common in mature programs.
- **Managed service accounts** (gMSA on Windows, workload identity in clouds) remove the human from the loop entirely: the platform changes the password and the service follows.

Rotation is the reason a program can survive the discovery that a service account password is in a leaked file: the leak is now a historical fact, not a standing risk.

## Discovery and inventory

Vaulting and session management only cover what the program knows about. Discovery is the capability that keeps the scope honest: it scans systems for privileged accounts, local admins, service accounts, and standing cloud roles, and feeds the inventory. Programs that skip discovery vault what they know about and leave the rest of the estate unmanaged, which is how audits fail.

## Privileged access workflows

The approval, time-boxing, and emergency-access flows that decide when a check-out or session is legitimate. This is where the [JIT access](jit-access) pattern lives: request, approve, grant with an expiry, revoke on expiry, audit the whole cycle. A workflow layer is what separates "the vault with a shared password" from "governed privileged access."

## The separation that matters: vault versus session

The single most important architectural distinction in PAM is between the **vault** (where the credential sleeps) and the **session manager** (where the credential is used). Confusing them is the root of most bad PAM designs:

- The vault is the data store: encryption, rotation, check-out policy, HA/DR. It is a database problem.
- The session manager is the control plane: policy enforcement, recording, monitoring, command filtering. It is a network and protocol problem.

A program with a vault but no session layer has protected the credential and lost the attribution. A program with a session layer but no vault has the attribution and no protected credential. The [architecture page](pam-architecture) shows both and the path between them.

Next: [Best practices](best-practices), the rules that turn these mechanisms into a program.