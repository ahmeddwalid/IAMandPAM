---
title: "Delinea"
description: "Secret Server and Privilege Manager: architecture, deployment models, and how the two products integrate."
---
<!-- verified 2026-08-18: Secret Server / Privilege Manager architecture and integration verified against Delinea's published architecture documentation. -->

# Delinea

Delinea sells the two products that cover the [PAM capabilities](/docs/pam-core/core-capabilities) split: Secret Server, a credential vault with session management, and Privilege Manager, an endpoint privilege management (EPM) product that controls what local users can run on their own machines.

## Secret Server: architecture and deployment models

Secret Server is a Windows-based product with a classic three-tier shape:

| Tier | Component |
|---|---|
| Presentation | The web interface and API layer |
| Application | The Secret Server application, message queue consumer, and distributed engines |
| Data | SQL Server database (on-premises) or managed SQL (cloud) |

**Messaging.** On-premises deployments use RabbitMQ to pass work between components. Cloud deployments use Azure Service Bus. The queue is what lets discovery and rotation jobs be handed to engines running elsewhere in the network.

**Distributed Engines.** Discovery scanners and password rotation run on lightweight engine components that can be placed in each network segment. This is the deployment model that matters in practice: a single console can manage credentials in segmented networks without opening direct paths from the central server to every target. In cloud deployments the engines are mandatory, because the hosted service cannot reach the customer's network on its own.

**Discovery and launchers.** Secret Server discovers accounts with scanners for Active Directory, Unix, AWS, Azure, GCP, VMware, and other systems. Access to targets happens through launchers: basic (the user sees the password), proxied (the credential stays in the vault), or session connectors that broker and record RDP/SSH sessions. The proxied and session-connector modes are the [PSM pattern](/docs/pam-core/pam-architecture): the user gets a session, not a password.

**Deployment models.**

- **On-premises**: customer-provided Windows servers and SQL Server. Full control, and the pattern most interview questions assume.
- **Cloud**: Secret Server Cloud, hosted in Delinea's own Azure environment. Same feature set, no infrastructure to run; engines still go into the customer network.
- **IaaS**: the on-premises software installed on customer-chosen virtual machines in the customer's cloud subscription.

**High availability.** Production deployments run two or more Secret Server nodes behind a load balancer sharing one SQL database, plus replicated engines. The vault is a single point of failure, so it gets the same treatment the [PAM architecture](/docs/pam-core/pam-architecture) page gives its HA/DR component.

## Privilege Manager: the EPM side

Privilege Manager is a separate product with its own web servers and database. It controls endpoint privileges: approved applications run with full rights, everything else runs as the standard user. This is the "raise the user, not the app" pattern, and it directly addresses the [least privilege](/docs/fundamentals/least-privilege-zero-trust) rule that standing local admin rights violate.

**Integration with Secret Server.** The two products are usually deployed together, and the integration is worth knowing because it is the vendor's answer to "vault plus EPM":

- Secret Server can act as Privilege Manager's authentication source, so one identity is used across both consoles.
- Secret Server can act as the storage container for Privilege Manager, holding the local admin passwords that Privilege Manager grants or rotates.
- The integration runs through the Secret Server REST API and is available on-premises.
- The products must not share a database. The API boundary is intentional.

This maps onto the [vault-vs-session separation](/docs/pam-core/core-capabilities) from the PAM core section: the vault (Secret Server) and the enforcement agent (Privilege Manager) are separate systems that exchange data through a defined interface, not one monolithic install.

## Where it fits

Delinea's position is the mid-market and Windows-centric PAM deployment: Secret Server is significantly easier to stand up than the enterprise platforms, which is why it is common in the "first PAM tool" story at smaller organizations. The [comparison and evaluation](08-vendor-comparison.md) page covers how that positioning changes the evaluation criteria.

Next: [BeyondTrust](04-beyondtrust.md), the vendor that grew out of remote support.