# BrainSAIT OID Badge System
## IANA PEN 61026 — Digital Identity Badge Infrastructure

The OID Badge System provides verifiable digital identity badges anchored to
BrainSAIT's IANA-registered OID namespace (1.3.6.1.4.1.61026).

## Features

- **Verifiable Credentials**: W3C VC-compatible badge issuance
- **OID-Anchored Identity**: Every badge resolves to a unique OID node
- **FHIR Integration**: Healthcare role badges with NPHIES compatibility
- **QR & RFID Support**: Physical/digital badge encoding

## Badge OID Structure

```
1.3.6.1.4.1.61026.6        — Badge System Root
1.3.6.1.4.1.61026.6.1      — Professional Badges
1.3.6.1.4.1.61026.6.2      — Healthcare Practitioner Badges
1.3.6.1.4.1.61026.6.3      — AI Agent Identity Badges
1.3.6.1.4.1.61026.6.4      — IoT Device Identity Badges
```

## Quick Start

```bash
# Issue a badge
curl -X POST https://api.brainsait.org/badges \
  -H "Authorization: ******" \
  -d '{"type":"professional","subject":"user-123","role":"healthcare-provider"}'
```

## Support

Email: support@brainsait.com | Portal: https://portal.brainsait.com
