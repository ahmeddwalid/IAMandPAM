---
title: SAML Deep Dive - Metadata, Encryption, and Artifact Resolution
description: "Advanced SAML 2.0 topics: metadata exchange, assertion encryption, artifact resolution, signature wrapping attacks, and IdP-vs-SP-initiated edge cases."
---

# SAML Deep Dive - Metadata, Encryption, and Artifact Resolution

## Metadata: the trust bootstrap

SAML metadata is an XML document that describes an IdP or SP's capabilities, endpoints, and signing certificates. It is the machine-readable contract that replaces manual configuration.

### IdP metadata

```xml
<EntityDescriptor entityID="https://idp.example.com/metadata">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
        <X509Data>
          <X509Certificate>MIIC...</X509Certificate>
        </X509Data>
      </KeyInfo>
    </KeyDescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
      Location="https://idp.example.com/sso/redirect"/>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="https://idp.example.com/sso/post"/>
  </IDPSSODescriptor>
</EntityDescriptor>
```

Key fields:
- `entityID`: the unique identifier for this IdP. Must match the `Issuer` in every assertion.
- `KeyDescriptor`: the X.509 certificate used to verify assertion signatures.
- `SingleSignOnService`: the endpoints where the SP sends AuthnRequests. Multiple bindings (Redirect, POST, Artifact) are advertised.

### SP metadata

```xml
<EntityDescriptor entityID="https://sp.example.com/metadata">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="https://sp.example.com/saml/acs" index="0" isDefault="true"/>
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
      Location="https://sp.example.com/saml/slo"/>
  </SPSSODescriptor>
</EntityDescriptor>
```

Key fields:
- `AssertionConsumerService`: the endpoint where the IdP POSTs the SAML response. The `index` must match the `AssertionConsumerServiceURL` in the AuthnRequest.
- `SingleLogoutService`: the endpoint for SLO requests.

### Metadata exchange

Metadata is exchanged out-of-band: the SP administrator downloads the IdP metadata XML and imports it into the SP configuration, and vice versa. This establishes trust without manual certificate entry.

Automated metadata refresh is preferable to manual updates: the SP periodically fetches the IdP metadata and validates the certificate chain. If the IdP rotates its signing key, the SP picks up the new certificate automatically.

## Assertion encryption

SAML assertions contain sensitive identity data. Encryption protects the assertion in transit and at rest.

### How encryption works

1. The IdP generates a symmetric session key (AES-256).
2. The IdP encrypts the assertion with the session key.
3. The IdP encrypts the session key with the SP's public key (RSA-OAEP).
4. The IdP sends the encrypted assertion and encrypted session key to the SP.
5. The SP decrypts the session key with its private key, then decrypts the assertion.

```xml
<EncryptedAssertion>
  <EncryptedData xmlns="http://www.w3.org/2001/04/xmlenc#" Type="http://www.w3.org/2001/04/xmlenc#Element">
    <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"/>
    <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
      <EncryptedKey>
        <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p"/>
        <KeyInfo>
          <KeyName>SP-Signing-Key</KeyName>
        </KeyInfo>
        <CipherData>
          <CipherValue>AbC123...</CipherValue>
        </CipherData>
      </EncryptedKey>
    </KeyInfo>
    <CipherData>
      <CipherValue>XyZ789...</CipherValue>
    </CipherData>
  </EncryptedData>
</EncryptedAssertion>
```

### When to use encryption

- The assertion contains sensitive attributes (SSN, salary, health data).
- The SP is in a different trust domain than the IdP.
- Regulatory requirements mandate encryption of personal data in transit.

### Signature vs encryption

- **Signature**: proves the assertion came from the IdP and was not tampered with. Always sign assertions.
- **Encryption**: protects the assertion contents from eavesdroppers. Use when the assertion contains sensitive data.

Both can be applied: sign the assertion first, then encrypt it. The SP decrypts first, then verifies the signature.

## Artifact resolution

Artifact resolution is a binding that passes a small reference (the artifact) instead of the full assertion. The SP uses the artifact to fetch the assertion from the IdP via a back-channel SOAP call.

### When to use artifact resolution

- The assertion is too large for a browser redirect (URL length limits).
- The SP and IdP have a direct back-channel connection.
- The IdP wants to control when the assertion is delivered (non-repudiation).

### The artifact flow

1. The SP sends an AuthnRequest to the IdP's Artifact Resolution Service.
2. The IdP authenticates the user and generates an assertion.
3. The IdP stores the assertion server-side and generates a SAML artifact (a 42-byte random string).
4. The IdP redirects the browser to the SP's Assertion Consumer Service with the artifact.
5. The SP sends a SOAP request to the IdP's Artifact Resolution Service with the artifact.
6. The IdP retrieves the assertion and returns it in a SOAP response.
7. The SP processes the assertion and creates a session.

```xml
<samlp:ArtifactResolve xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  ID="_id" Version="2.0" IssueInstant="2026-09-29T12:00:00Z">
  <saml:Issuer>https://sp.example.com/metadata</saml:Issuer>
  <samlp:Artifact>AAQAAMh48x69o16iHdQz0KqC7z0</samlp:Artifact>
</samlp:ArtifactResolve>
```

### Artifact vs POST binding

| Aspect | POST Binding | Artifact Binding |
|---|---|---|
| Assertion transport | Browser redirect (form POST) | Back-channel SOAP |
| Assertion size | Limited by browser/URL | Unlimited |
| IdP control | Assertion delivered immediately | Assertion delivered on SP request |
| Complexity | Simple | Requires SOAP infrastructure |
| Use case | Most common | Large assertions, strict non-repudiation |

## Signature wrapping attacks

Signature wrapping (XSW) is a class of attacks where an attacker manipulates the XML structure of a signed SAML assertion to inject malicious content while preserving the valid signature.

### How XSW works

1. The attacker intercepts a valid signed assertion.
2. The attacker adds a duplicate assertion element with modified attributes (e.g., changing the `Role` to `Admin`).
3. The attacker moves the original signature to cover only the original assertion, leaving the injected assertion unsigned.
4. The SP validates the signature (which covers the original assertion) and processes the injected assertion.

### XSW variants

- **XSW1**: Add a duplicate assertion after the signed one.
- **XSW2**: Add a duplicate assertion before the signed one.
- **XSW3**: Move the signed assertion into a wrapper element.
- **XSW4**: Inject a new assertion into the `Extensions` element.
- **XSW5**: Use XML comments to break the signature validation.
- **XSW6**: Use XPath injection to select a different element for validation.
- **XSW7**: Use XML entity expansion to inject content.
- **XSW8**: Use namespace manipulation to inject content.

### Defending against XSW

- Use a SAML library that validates the assertion structure, not just the signature.
- Reject assertions with duplicate `ID` attributes or unexpected elements.
- Validate that the signature covers the entire assertion, not just a portion.
- Use schema validation to reject malformed assertions.

## IdP-initiated vs SP-initiated edge cases

### IdP-initiated SSO

In IdP-initiated SSO, the user starts at the IdP (e.g., clicks a portal link) and is redirected to the SP without an AuthnRequest. The SP must handle the missing `InResponseTo` field.

Risks:
- The SP cannot verify that the assertion corresponds to a specific AuthnRequest.
- An attacker can send a forged assertion to the SP's ACS URL.

Mitigations:
- Validate the `Issuer`, `Audience`, and `NotOnOrAfter` fields.
- Use a short assertion lifetime (5 minutes or less).
- Implement audience restriction validation.

### SP-initiated SSO with unsolicited responses

Some SPs accept unsolicited assertions (assertions without a corresponding AuthnRequest). This is equivalent to IdP-initiated SSO from the SP's perspective.

### Logout edge cases

- **Single Logout (SLO)**: when the user logs out of the IdP, the IdP sends a LogoutRequest to every SP with an active session. The SP must invalidate the session and return a LogoutResponse.
- **Partial logout**: if one SP fails to respond to the LogoutRequest, the IdP may proceed with the logout for other SPs. The user's session at the failed SP remains active.
- **Logout without NameID**: if the LogoutRequest does not include the user's NameID, the SP cannot identify which session to terminate. Always include the NameID in LogoutRequests.

## Verification checklist

- [ ] IdP and SP metadata exchanged and validated.
- [ ] Assertion encryption configured for sensitive attributes.
- [ ] Artifact resolution tested (if used).
- [ ] Signature wrapping defenses implemented.
- [ ] IdP-initiated SSO risks understood and mitigated.
- [ ] SLO tested with multiple SPs.

## What this page teaches

- Metadata is the machine-readable trust contract: it replaces manual configuration and enables automated certificate rotation.
- Assertion encryption protects sensitive data: use it when the assertion contains personal or regulated data.
- Artifact resolution decouples assertion delivery from the browser: use it for large assertions or strict non-repudiation requirements.
- Signature wrapping is a real attack class: validate the assertion structure, not just the signature.
- IdP-initiated SSO has no AuthnRequest: the SP must validate the assertion independently.
