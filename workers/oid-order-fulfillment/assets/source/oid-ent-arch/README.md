# BrainSAIT OID Enterprise Architect Kit
## IANA PEN 61026 — Namespace Architecture & Design Toolkit

The Enterprise Architect Kit provides comprehensive tools for designing and
deploying OID namespaces at enterprise scale.

## Contents

- `fhir-bundle/` — FHIR R4/R5 namespace bundle definitions
- `mcp-schemas/` — MCP/URN schema definitions
- `x509-policy-comprehensive.conf` — X.509 certificate policy configuration

## OID Namespace Design

```
1.3.6.1.4.1.61026           — BrainSAIT Root (IANA PEN 61026)
├── .1                       — Infrastructure & Platform
├── .2                       — Products & Services
├── .3                       — Healthcare & Clinical
│   ├── .3.1                 — Patient Identity
│   ├── .3.2                 — FHIR Resources
│   └── .3.3                 — AI Clinical Agents
└── .4                       — IoT & Edge Devices
```

## Portal Access

Portal: https://portal.brainsait.com
Email: architect@brainsait.com
