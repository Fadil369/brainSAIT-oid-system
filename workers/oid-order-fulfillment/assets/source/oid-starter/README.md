# BrainSAIT OID Namespace Starter Kit
## IANA PEN 61026 — Getting Started Guide

Welcome to the BrainSAIT OID Namespace Starter Kit. This package contains everything
you need to begin using your globally-unique OID namespace under IANA Private Enterprise
Number 61026.

---

## What's Included

| File | Description |
|------|-------------|
| `oid-namespace-guide.html` | Complete guide to the BrainSAIT OID namespace |
| `fhir-coding-template.json` | FHIR Coding element template |
| `mcp-agent-config.json` | MCP agent URN configuration |
| `api-headers-template.json` | REST API headers template |
| `db-schema-template.sql` | PostgreSQL schema template |
| `qr-rfid-payload-template.json` | QR/RFID tag payload template |

---

## Your OID Root

```
1.3.6.1.4.1.61026
│
├── 1  — Administrative
├── 2  — Licensing & Compliance
├── 3  — Healthcare Services
│   ├── 2  — NPHIES Integration
│   │   └── 3  — NPHIES Connector (1.3.6.1.4.1.61026.3.2.3)
│   └── 3  — AI Agent Framework (1.3.6.1.4.1.61026.3.3)
├── 4  — IoT & Device Management
│   └── 3  — Environmental Sensors
└── 5  — Custom (your allocation)
```

---

## Quick Start

### 1. Use the FHIR template

```json
{
  "system": "urn:oid:1.3.6.1.4.1.61026.3.2.3",
  "code": "your-code",
  "display": "Your Service Name"
}
```

### 2. Configure your MCP agent

```json
{
  "urn": "urn:oid:1.3.6.1.4.1.61026.3.3",
  "toolId": "your-agent-id",
  "namespace": "1.3.6.1.4.1.61026"
}
```

---

## Support

- Documentation: https://brainsait.com/oid
- Email: oid@brainsait.com
- Developer Portal: https://portal.brainsait.com/oid

© 2026 BrainSAIT — IANA PEN 61026
