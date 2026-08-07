# BrainSAIT OID Healthcare Bundle
## IANA PEN 61026 — Healthcare Namespace (1.3.6.1.4.1.61026.3.*)

This bundle covers all healthcare-specific OID integrations: FHIR namespaces,
DICOM UIDs, and HL7 message templates under the BrainSAIT PEN 61026.

---

## Namespace Map — Healthcare Branch

```
1.3.6.1.4.1.61026.3  — Healthcare Services (root)
├── .1   — Patient Identity Management
├── .2   — NPHIES Integration
│   ├── .1  — Prior Authorization
│   ├── .2  — Eligibility Check
│   └── .3  — NPHIES Connector Service  ← primary integration OID
├── .3   — AI Agent Framework
├── .4   — Pharmacy Systems
└── .5   — Laboratory Information Systems
```

## FHIR Integration

```json
{
  "resourceType": "Organization",
  "identifier": [{
    "system": "urn:oid:1.3.6.1.4.1.61026.3.2.3",
    "value": "BRAINSAIT-NPHIES-001"
  }]
}
```

## Support

- NPHIES Integration: https://brainsait.com/nphies
- Email: healthcare@brainsait.com
