// BrainSAIT StructureDefinition OID Migration Tool
// Migrates legacy StructureDefinitions to use BrainSAIT OID namespace

const OID_ROOT = "1.3.6.1.4.1.61026";

function migrateStructureDefinition(sd) {
  if (!sd || sd.resourceType !== "StructureDefinition") {
    throw new Error("Input must be a FHIR StructureDefinition");
  }
  // Add BrainSAIT OID identifier
  sd.identifier = sd.identifier || [];
  const hasOid = sd.identifier.some(
    (id) => id.system && id.system.startsWith(`urn:oid:${OID_ROOT}`)
  );
  if (!hasOid) {
    sd.identifier.push({
      system: `urn:oid:${OID_ROOT}.2.1`,
      value: sd.id,
    });
  }
  return sd;
}

module.exports = { migrateStructureDefinition };
