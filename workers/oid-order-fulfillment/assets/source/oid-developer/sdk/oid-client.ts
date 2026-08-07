/**
 * BrainSAIT OID Client SDK
 * Root: 1.3.6.1.4.1.61026  (IANA PEN 61026)
 */

export const BRAINSAIT_ROOT = '1.3.6.1.4.1.61026';

export type IntegrationContext = 'fhir' | 'mcp' | 'x509' | 'api' | 'db' | 'qr';

export interface OIDNodeConfig {
  root: string;
}

export interface FHIRCodeableConcept {
  system: string;
  code: string;
  display?: string;
}

export interface MCPURNMetadata {
  urn: string;
  toolId: string;
  namespace: string;
}

export interface X509PolicyExtension {
  critical: boolean;
  policyIdentifier: string;
  policyQualifiers?: { id: string; cps: string }[];
}

export interface APIHeaders {
  'X-BrainSAIT-OID': string;
  'X-OID-Namespace': string;
  'X-OID-Version': string;
}

export interface DBColumnDef {
  column: string;
  type: string;
  constraint: string;
  indexSQL: string;
}

export interface QRPayload {
  oid: string;
  pen: number;
  v: number;
  ts: string;
  [key: string]: unknown;
}

export class OIDNode {
  readonly full: string;
  readonly suffix: string;
  private _label?: string;

  constructor(root: string, suffix: string, label?: string) {
    this.full = suffix ? `${root}.${suffix}` : root;
    this.suffix = suffix;
    this._label = label;
  }

  get label(): string {
    return this._label ?? this.suffix;
  }

  child(arc: string | number, label?: string): OIDNode {
    return new OIDNode(this.full, String(arc), label);
  }

  toFHIR(code = '1', display?: string): FHIRCodeableConcept {
    return {
      system: `urn:oid:${this.full}`,
      code,
      ...(display ? { display } : {}),
    };
  }

  toFHIRExtensionURL(): string {
    return `http://brainsait.com/fhir/StructureDefinition/${this.suffix.replace(/\./g, '-')}`;
  }

  toMCP(toolId: string): MCPURNMetadata {
    return {
      urn: `urn:oid:${this.full}`,
      toolId,
      namespace: `1.3.6.1.4.1.61026`,
    };
  }

  toX509(cpsUrl?: string): X509PolicyExtension {
    return {
      critical: false,
      policyIdentifier: this.full,
      ...(cpsUrl
        ? { policyQualifiers: [{ id: '1.3.6.1.5.5.7.2.1', cps: cpsUrl }] }
        : {}),
    };
  }

  toAPIHeaders(version = '1'): APIHeaders {
    return {
      'X-BrainSAIT-OID': this.full,
      'X-OID-Namespace': BRAINSAIT_ROOT,
      'X-OID-Version': version,
    };
  }

  toDBColumn(columnName = 'oid_path', tableName = 'records'): DBColumnDef {
    return {
      column: columnName,
      type: 'VARCHAR(128)',
      constraint: `CHECK (${columnName} LIKE '${this.full}%')`,
      indexSQL: `CREATE INDEX idx_${tableName}_oid ON ${tableName} (${columnName});`,
    };
  }

  toQR(extra: Record<string, unknown> = {}): QRPayload {
    return {
      oid: this.full,
      pen: 61026,
      v: 1,
      ts: new Date().toISOString(),
      ...extra,
    };
  }

  toQRString(extra: Record<string, unknown> = {}): string {
    return JSON.stringify(this.toQR(extra));
  }

  toAll(opts: {
    fhirCode?: string;
    fhirDisplay?: string;
    mcpToolId?: string;
    cpsUrl?: string;
    apiVersion?: string;
    dbColumn?: string;
    dbTable?: string;
    qrExtra?: Record<string, unknown>;
  } = {}) {
    return {
      fhir: this.toFHIR(opts.fhirCode, opts.fhirDisplay),
      fhirExtensionURL: this.toFHIRExtensionURL(),
      mcp: this.toMCP(opts.mcpToolId ?? 'tool'),
      x509: this.toX509(opts.cpsUrl),
      api: this.toAPIHeaders(opts.apiVersion),
      db: this.toDBColumn(opts.dbColumn, opts.dbTable),
      qr: this.toQR(opts.qrExtra),
    };
  }

  toString(): string { return this.full; }
  toJSON(): string { return this.full; }
}

export class OIDClient {
  private readonly root: string;

  constructor(config: OIDNodeConfig = { root: BRAINSAIT_ROOT }) {
    this.root = config.root;
  }

  node(suffix: string, label?: string): OIDNode {
    return new OIDNode(this.root, suffix, label);
  }

  readonly ns = {
    root: () => new OIDNode(this.root, '', 'BrainSAIT Root'),
    geo: () => new OIDNode(this.root, '1', 'Geographic Operations'),
    geoRiyadh: () => new OIDNode(this.root, '1.1', 'Riyadh — Saudi HQ'),
    geoSudan: () => new OIDNode(this.root, '1.2', 'Sudan — Regional'),
    org: () => new OIDNode(this.root, '2', 'Organization'),
    engineering: () => new OIDNode(this.root, '2.1.1', 'Engineering'),
    healthcareOps: () => new OIDNode(this.root, '2.1.2', 'Healthcare Operations'),
    licensing: () => new OIDNode(this.root, '2.2', 'Licensing & Compliance'),
    products: () => new OIDNode(this.root, '3', 'Products & Services'),
    cms: () => new OIDNode(this.root, '3.1', 'Content Management System'),
    healthcare: () => new OIDNode(this.root, '3.2', 'Healthcare Platform'),
    aiNormalizer: () => new OIDNode(this.root, '3.2.1', 'AI Normalizer Service'),
    signer: () => new OIDNode(this.root, '3.2.2', 'Signer Microservice'),
    nphiesConnector: () => new OIDNode(this.root, '3.2.3', 'NPHIES Connector'),
    aiAgentFramework: () => new OIDNode(this.root, '3.3', 'AI Agent Framework'),
    infra: () => new OIDNode(this.root, '4', 'Infrastructure'),
    ollama: () => new OIDNode(this.root, '4.1', 'Ollama Private Cloud'),
    docker: () => new OIDNode(this.root, '4.2', 'Docker Infrastructure'),
    iot: () => new OIDNode(this.root, '4.3', 'IoT Devices'),
  } as const;
}

export const oid = new OIDClient();
