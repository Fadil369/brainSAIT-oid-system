/**
 * BrainSAIT OID — All 6 Integration Contexts
 * Demonstrates the OID Client SDK for IANA PEN 61026.
 */
import { oid } from '../sdk/oid-client';

const nphiesConnector = oid.ns.nphiesConnector();  // 1.3.6.1.4.1.61026.3.2.3
const aiAgent         = oid.ns.aiAgentFramework(); // 1.3.6.1.4.1.61026.3.3

// 1. FHIR
const fhirCoding = nphiesConnector.toFHIR('nphies-connector', 'NPHIES Connector Service');
console.log('FHIR CodeableConcept:', JSON.stringify(fhirCoding, null, 2));

// 2. MCP
const mcpMetadata = aiAgent.toMCP('brainsait-ai-agent-v1');
console.log('MCP URN Metadata:', JSON.stringify(mcpMetadata, null, 2));

// 3. X.509
const x509Policy = oid.ns.licensing().toX509('https://brainsait.com/cps/1.0');
console.log('X.509 Policy Extension:', JSON.stringify(x509Policy, null, 2));

// 4. REST API Headers
const headers = nphiesConnector.toAPIHeaders('2024-11');
console.log('HTTP Headers:', JSON.stringify(headers, null, 2));

// 5. Database Schema
const dbDef = oid.ns.products().toDBColumn('oid_path', 'healthcare_records');
console.log('DB Column:', dbDef);

// 6. QR / RFID
const qrPayload = oid.ns.iot().toQRString({ asset: 'ESP32-CAM-001', loc: 'SERVER-ROOM-A' });
console.log('QR/RFID JSON:', qrPayload);

// Custom node
const yourNode = oid.node('5.1', 'Your Custom Service');
const allContexts = yourNode.toAll({
  fhirCode: 'your-service',
  fhirDisplay: 'Your Custom Service',
  mcpToolId: 'your-mcp-tool',
  cpsUrl: 'https://yourorg.com/cps',
  dbColumn: 'service_oid',
  dbTable: 'your_table',
  qrExtra: { env: 'production' },
});
console.log('All contexts for custom node:', JSON.stringify(allContexts, null, 2));
