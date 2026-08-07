// BrainSAIT OID FHIR Shorthand Library
// IANA PEN 61026

Alias: $OID_ROOT = urn:oid:1.3.6.1.4.1.61026

Extension: BrainSAITOIDIdentifier
Id: brainsait-oid-identifier
Title: "BrainSAIT OID Identifier"
Description: "An OID identifier from the BrainSAIT namespace (IANA PEN 61026)"
* value[x] only oid
* valueOid 1..1

Profile: BrainSAITPractitioner
Parent: Practitioner
Id: brainsait-practitioner
Title: "BrainSAIT Practitioner"
Description: "Practitioner with BrainSAIT OID identity"
* identifier ^slicing.discriminator.type = #pattern
* identifier contains brainSAITOID 0..1
* identifier[brainSAITOID].system = $OID_ROOT + ".3.2.1" (exactly)
