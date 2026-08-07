// BrainSAIT OID FHIR Integration Toolkit
// IANA PEN 61026

export const BRAINSAIT_OID_ROOT = "1.3.6.1.4.1.61026";

export function oidToUrn(oid: string): string {
  return `urn:oid:${oid}`;
}

export function urnToOid(urn: string): string {
  return urn.replace(/^urn:oid:/, "");
}

export function buildFhirIdentifier(oidNode: string, value: string) {
  return {
    system: oidToUrn(`${BRAINSAIT_OID_ROOT}.${oidNode}`),
    value,
  };
}
