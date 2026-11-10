---
title: "Troubleshooting: Certificate Mismatches"
description: "TLS certificate failures in identity integrations: hostname mismatch, expiry, chain, and clock skew diagnosis."
---

# Troubleshooting: Certificate Mismatches

Certificate failures are the second most common identity integration problem, and the most confusing, because the visible error often does not name the actual cause. A "certificate expired" error can mean the clock is wrong, and a "hostname mismatch" can mean a load balancer is serving the wrong certificate. This guide maps the common error messages to their real causes.

## Symptoms

Typical error forms, with the underlying cause:

| Error text (typical form) | Actual cause |
| --- | --- |
| `certificate verify failed: hostname mismatch` or `SSL_ERROR_BAD_CERT_DOMAIN` | The certificate's subject or SAN does not match the hostname being connected to |
| `certificate has expired` or `certificate expired` | The certificate is outside its validity period, or the client clock is wrong |
| `unable to get local issuer certificate` or `certificate verify failed: unable to get local issuer` | The server sent an incomplete chain, or the client does not trust the issuing CA |
| `certificate is not yet valid` | The client clock is ahead of the certificate's `notBefore` |
| `self-signed certificate` | A self-signed cert was used where a CA-signed cert was expected |

## Root cause

TLS certificate validation checks four independent things, and any one of them can fail:

1. **Hostname match.** The certificate must contain the hostname (or an IP SAN for IP connections) that the client used. A certificate for `idp.example.com` will fail when the client connects to `identity.example.com`, even if both resolve to the same server.
2. **Validity period.** The current time must fall between `notBefore` and `notAfter`.
3. **Chain of trust.** The server's certificate must chain to a CA the client trusts. Missing intermediate certificates are the most common chain failure: the server sends only its leaf certificate, and the client cannot build the chain.
4. **Clock agreement.** TLS validation runs on the client's clock. A client clock that is wrong by more than the validity margin makes valid certificates look expired.

Identity integrations fail on all four: SAML metadata carries the signing certificate, LDAPS requires a trusted certificate, and the IdP's own TLS certificate is what the browser or the [SCIM](/docs/protocols-iga/scim) endpoint validates.

## Resolution

1. **Read the error exactly.** The message names the failing check. Do not assume expiry because the word "certificate" appears; `hostname mismatch` and `unable to get local issuer` are different fixes.
2. **Inspect the certificate actually served.** Use a TLS client from the failing host to fetch the certificate and print its subject, SANs, validity, and chain:

```bash
openssl s_client -connect idp.example.com:443 -servername idp.example.com
```

The output shows the certificate, the chain, and any missing intermediate. Compare the SAN list against the hostname the integration uses.
3. **Check the client clock.** If the error is `not yet valid` or `expired` but the certificate dates look correct, compare the client's clock to the server's. NTP drift on an integration host produces exactly this error, and it is fixed with `ntpdate` or the platform's time sync service, not with a new certificate.
4. **Fix the chain.** If the server sends an incomplete chain, reconfigure the server to send the intermediate certificate(s), or add the missing intermediate to the client trust store. The same fix applies to SAML metadata: the metadata must include the full signing certificate chain if the relying party validates it.
5. **Align the hostname.** If the certificate does not cover the hostname, either change the integration to use the hostname on the certificate or issue a certificate that covers the SAN the integration uses. Do not disable validation to "make it work": that converts a certificate problem into a permanent man-in-the-middle exposure.
6. **Re-run the integration test.** The fix is verified by the same `openssl s_client` command showing a full chain and a valid period, and then by the integration authenticating successfully.

## Prevention

- **Certificate inventory with expiry monitoring.** An identity platform with dozens of SAML certificates, LDAPS certs, and signing certs needs a renewal calendar. Certificate expiry is a scheduled event; it should never be an incident.
- **SAN discipline.** List every hostname and IP that will connect, including the internal and external names, in the certificate's SANs at issuance time.
- **Intermediate chain completeness checks** as part of certificate deployment, not after the integration breaks.
- **Clock management on all integration hosts.** NTP is infrastructure, not hygiene.
- **Renewal drills.** The SAML metadata re-import after a signing certificate rotation is a process that deserves rehearsal: the [SAML troubleshooting guide](12-troubleshooting-saml.md) covers what breaks when the metadata is not updated.

## Related

- [SAML assertion errors](12-troubleshooting-saml.md), where signing certificate mismatches surface as signature validation failures.
- [LDAP bind failures](08-troubleshooting-ldap.md), where TLS errors mask as authentication errors.