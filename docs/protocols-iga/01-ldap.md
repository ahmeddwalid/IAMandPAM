---
title: LDAP
description: "Lightweight Directory Access Protocol: the directory protocol behind enterprise identity stores, from directory tree structure to bind, search, and secure access."
---

# LDAP

Lightweight Directory Access Protocol (LDAP) is the protocol for reading and searching directory services: the structured stores that hold identities, groups, and their attributes. It is the oldest protocol in the IAM stack and still the backbone of enterprise identity, because the two dominant directory implementations, Microsoft Active Directory (AD DS) and OpenLDAP, both speak it.

## What a directory is

A directory is a database optimized for reads: many lookups, few writes, with a hierarchical, attribute-based model. Unlike a relational database, entries are not rows in tables. An entry is a set of attributes (uid, mail, department) identified by a distinguished name (DN) that encodes its position in the tree. The tree structure is the directory information tree (DIT).

import Drawio from '../../src/components/Drawio';
import dit from '!!raw-loader!../../static/diagrams/ldap-dit.drawio';

<Drawio content={dit} />

*A simplified directory tree. The DIT is organized from the domain root down through organizational units to entries; every entry has a globally unique DN made from its path.*

[Download / edit this diagram](/diagrams/ldap-dit.drawio)

## The core operations

Everything a client does with LDAP is one of a small set of operations:

| Operation | Purpose |
|---|---|
| Bind | Authenticate the client, either anonymously or with credentials (the bind DN plus password) |
| Search | Query entries by base DN, scope, and filter; returns matching entries and attributes |
| Compare | Check whether an entry has a specific attribute value without returning the entry |
| Add / Modify / Delete | Write operations on entries |
| Extended operations | Protocol extensions, notably StartTLS for upgrading a plain connection to TLS |

The bind is how most IAM integrations actually use LDAP: applications and identity providers bind with a service account and then search for users and groups. The search filter language (`(&(objectClass=user)(sAMAccountName=alimi))`) is the query syntax every IAM engineer eventually learns.

## How LDAP fits IAM

LDAP plays several roles in the identity stack:

- **User store.** The directory is the authoritative source for who people are and what attributes they carry (department, manager, mail, group membership).
- **Authentication source.** The classic pattern is a bind against the directory to verify a password. Modern IAM treats this as the fallback path, since the bind requires the application to receive the user's password.
- **Group membership.** Groups in the directory (`cn=finance-team,ou=Groups,...`) feed authorization decisions in applications, which is why directory group hygiene matters: an application trusts the directory's groups as if they were its own roles.
- **Service account access.** AD and OpenLDAP hold the machine and service accounts that everything else authenticates against.

## Security considerations

- **Always encrypt the wire.** Plain LDAP transmits credentials in clear text. LDAPS (LDAP over TLS on port 636) and StartTLS (port 389 upgraded) are the minimum bar; binding over cleartext is a finding in every penetration test.
- **Simple bind vs SASL.** The simple bind sends the password directly; SASL mechanisms (GSSAPI/Kerberos, EXTERNAL with client certificates) avoid sending a reusable password over the wire at all.
- **Account lockout and throttling** live in the directory, and misconfiguration (no lockout, no failed-bind logging) turns the directory into a brute-force buffet.
- **Restrict search scope.** Directory-wide anonymous search with broad filters leaks the whole user base; least privilege applies to directory reads too.

## LDAP versus modern protocols

LDAP is a directory protocol, not an SSO protocol. It answers "is this credential valid against this entry" and "what attributes does this user have." It does not hand out session tokens across applications. Modern stacks therefore keep the directory as the store and put OIDC/SAML in front of it for application access, which is why an IAM architecture diagram (see [Complete IAM architecture](07-iam-architecture.md)) typically shows LDAP only on the store side and the SSO protocols on the application side.

Next: [SAML](02-saml.md), the SSO protocol born from the same XML era as directories, and still the standard for SaaS integration.