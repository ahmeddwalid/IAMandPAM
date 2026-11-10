---
title: LDAP Advanced - Replication, Schema, and Performance
description: "Advanced LDAP topics: multi-master replication, schema design, referral chasing, performance tuning, and AD vs OpenLDAP differences."
---

# LDAP Advanced - Replication, Schema, and Performance

## Multi-master replication

LDAP directories are replicated to ensure availability and performance. Multi-master replication allows writes to any replica, with changes propagated to all others.

### Replication topology

- **Single-master**: one writable replica, all others are read-only. Simple but creates a single point of failure.
- **Multi-master**: all replicas are writable. Changes are propagated via a replication protocol (e.g., AD's DFS-R, OpenLDAP's Syncrepl).
- **Hub-and-spoke**: a central hub replicates to multiple spokes. Common in hub-and-spoke network topologies.

### Replication conflicts

In multi-master replication, concurrent writes to the same entry on different replicas create conflicts. Resolution strategies:

- **Last writer wins**: the most recent write prevails. Simple but can lose data.
- **Timestamp-based**: the write with the latest timestamp prevails. Requires synchronized clocks.
- **Change sequence number (CSN)**: each change is assigned a unique CSN. The change with the highest CSN prevails. Used by OpenLDAP.

### AD replication specifics

Active Directory uses a multi-master replication model with the following characteristics:

- **Naming contexts (NCs)**: AD partitions the directory into NCs (Domain, Configuration, Schema, Application). Each NC replicates independently.
- **Site links**: AD replicates within sites frequently (every 15 seconds by default) and between sites on a schedule (default: 180 minutes).
- **Urgent replication**: certain changes (e.g., account lockout) trigger immediate replication to all domain controllers.
- **USN (Update Sequence Number)**: each DC maintains a USN. Changes are replicated based on USN comparison.

### OpenLDAP replication

OpenLDAP uses the Syncrepl protocol for replication:

- **Consumer**: the replica that receives updates.
- **Provider**: the master that sends updates.
- **RefreshAndPersist**: the consumer periodically polls the provider for changes and maintains a persistent connection for real-time updates.
- **RefreshOnly**: the consumer polls at intervals without a persistent connection.

## Schema design

The LDAP schema defines the object classes and attributes that can be stored in the directory. A well-designed schema is critical for performance and maintainability.

### Object classes

Object classes define the type of entry and the attributes it can contain:

- **Structural**: the primary object class for an entry (e.g., `user`, `group`, `organizationalUnit`). Each entry has exactly one structural class.
- **Auxiliary**: additional object classes that add attributes to an entry (e.g., `posixAccount`, `shadowAccount`). An entry can have multiple auxiliary classes.
- **Abstract**: base classes that cannot be instantiated directly (e.g., `top`). All entries inherit from `top`.

### Attribute types

Attribute types define the syntax and matching rules for attributes:

- **Syntax**: the data type (e.g., `DirectoryString`, `Integer`, `Boolean`, `OctetString`).
- **Matching rules**: how comparisons are performed (e.g., `equalityMatch`, `orderingMatch`, `substringsMatch`).
- **Single-valued vs multi-valued**: whether the attribute can have multiple values (e.g., `member` is multi-valued, `uid` is single-valued).

### Schema design best practices

- **Use standard attributes**: prefer standard attributes (e.g., `cn`, `mail`, `member`) over custom attributes.
- **Avoid excessive auxiliary classes**: each auxiliary class adds overhead to entry creation and modification.
- **Index frequently searched attributes**: attributes used in filters (e.g., `uid`, `mail`, `member`) should be indexed.
- **Plan for extensibility**: design the schema to accommodate future requirements without breaking existing entries.

### AD schema specifics

Active Directory's schema is extensible: new object classes and attributes can be added to the schema. However, schema modifications are forest-wide and cannot be undone (only deactivated).

- **Schema master**: one DC in the forest holds the schema master role. All schema modifications must be performed on this DC.
- **Schema cache**: each DC caches the schema in memory. Schema changes require a cache refresh.
- **Attribute IDs (attributeID)**: each attribute has a unique OID (Object Identifier). Custom attributes must have unique OIDs.

## Referral chasing

A referral is a pointer to another directory server that may hold the requested entry. When a server cannot fulfill a search, it returns a referral to the client.

### How referrals work

1. The client sends a search request to Server A.
2. Server A does not hold the requested entry but knows that Server B does.
3. Server A returns a referral (a LDAP URL pointing to Server B).
4. The client chases the referral by sending the same search request to Server B.
5. Server B returns the results.

### Referral chasing options

- **Chase automatically**: the client follows referrals automatically. Convenient but can lead to infinite loops if referrals are misconfigured.
- **Chase manually**: the client returns referrals to the application, which decides whether to chase them. More control but requires application logic.
- **Do not chase**: the client ignores referrals. Useful when referrals are not expected or not trusted.

### AD referrals

Active Directory uses referrals for cross-domain searches:

- **Global catalog**: a partial replica of all domains in the forest. Searches against the global catalog avoid referrals for common attributes.
- **Referral to another domain**: if the requested entry is in a different domain, the DC returns a referral to a DC in that domain.

## Performance tuning

LDAP performance depends on indexing, query optimization, and server configuration.

### Indexing

Indexes speed up searches by creating a lookup structure for specific attributes:

- **Equality index**: speeds up exact match filters (e.g., `uid=jsmith`).
- **Presence index**: speeds up presence filters (e.g., `mail=*`).
- **Substring index**: speeds up substring filters (e.g., `cn=*smith*`).
- **Approximate index**: speeds up approximate match filters (e.g., `cn~=smith`).

AD automatically indexes commonly searched attributes (e.g., `cn`, `member`, `sAMAccountName`). Custom attributes must be indexed manually.

### Query optimization

- **Use indexed attributes**: filters on indexed attributes are significantly faster.
- **Avoid substring filters**: substring filters (e.g., `cn=*smith*`) cannot use indexes and require a full scan.
- **Use narrow filters**: combine multiple filters with `&` to reduce the result set.
- **Limit attributes**: request only the attributes you need with the `attrs` parameter.

### Server configuration

- **Connection pooling**: reuse connections instead of creating a new connection for each operation.
- **Size limit**: limit the number of entries returned by a search (e.g., `sizeLimit=1000`).
- **Time limit**: limit the duration of a search (e.g., `timeLimit=30` seconds).
- **Idle timeout**: close idle connections after a timeout (e.g., 10 minutes).

## AD vs OpenLDAP

| Aspect | Active Directory | OpenLDAP |
|---|---|---|
| Schema | Extensible, forest-wide | Extensible, per-server |
| Replication | Multi-master, site-aware | Multi-master (Syncrepl) |
| Indexing | Automatic for common attributes | Manual configuration |
| Referrals | Cross-domain referrals | Configurable referrals |
| Authentication | Kerberos, NTLM, LDAP | LDAP, SASL |
| Group policy | GPOs (Group Policy Objects) | No equivalent |
| DNS integration | Required | Optional |
| Management tools | ADUC, PowerShell, ADSI Edit | phpLDAPadmin, Apache Directory Studio |
| Licensing | Windows Server license | Open source |

## Verification checklist

- [ ] Multi-master replication configured and tested.
- [ ] Schema design follows best practices.
- [ ] Referral chasing configured appropriately.
- [ ] Indexes created for frequently searched attributes.
- [ ] Query optimization techniques applied.
- [ ] AD vs OpenLDAP differences understood.

## What this page teaches

- Multi-master replication enables high availability: all replicas are writable, with changes propagated automatically.
- Schema design is critical: use standard attributes, index frequently searched attributes, and plan for extensibility.
- Referral chasing enables distributed directories: the client follows referrals to find entries across servers.
- Performance tuning is essential: indexing, query optimization, and server configuration directly impact LDAP performance.
- AD and OpenLDAP have different strengths: AD is integrated with Windows, OpenLDAP is open source and flexible.
