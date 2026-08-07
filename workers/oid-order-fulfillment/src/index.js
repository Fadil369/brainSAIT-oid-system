/**
 * BrainSAIT OID Order Fulfillment Worker
 *
 * Receives Shopify orders/paid webhooks, generates license keys,
 * calls the brainsait-store-delivery admin API, and logs to Airtable.
 */

const DELIVERY_BASE_URL = "https://assets.brainsait.org";
const AIRTABLE_API_URL = "https://api.airtable.com/v0";

const SKU_ASSETS = {
  "OID-STARTER-001": {
    name: "OID Namespace Starter Kit",
    maxDownloads: 5,
    expiresInDays: 365,
    assets: [
      { id: "oid-starter-guide", r2_key: "products/oid-starter/oid-namespace-starter-guide.pdf", filename: "OID_Namespace_Starter_Guide.pdf", kind: "pdf", size: 0 },
      { id: "oid-starter-templates", r2_key: "products/oid-starter/oid-templates.zip", filename: "OID_Templates.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-DEV-001": {
    name: "OID Developer Suite",
    maxDownloads: 10,
    expiresInDays: 365,
    assets: [
      { id: "oid-dev-sdk", r2_key: "products/oid-developer/oid-sdk.zip", filename: "OID_Developer_SDK.zip", kind: "zip", size: 0 },
      { id: "oid-dev-docs", r2_key: "products/oid-developer/oid-developer-docs.pdf", filename: "OID_Developer_Docs.pdf", kind: "pdf", size: 0 },
      { id: "oid-dev-examples", r2_key: "products/oid-developer/oid-code-examples.zip", filename: "OID_Code_Examples.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-HLTH-001": {
    name: "OID Healthcare Bundle",
    maxDownloads: 10,
    expiresInDays: 365,
    assets: [
      { id: "oid-fhir-bundle", r2_key: "products/oid-healthcare/fhir-namespace-bundle.zip", filename: "FHIR_Namespace_Bundle.zip", kind: "zip", size: 0 },
      { id: "oid-dicom-guide", r2_key: "products/oid-healthcare/dicom-uid-guide.pdf", filename: "DICOM_UID_Guide.pdf", kind: "pdf", size: 0 },
      { id: "oid-hl7-templates", r2_key: "products/oid-healthcare/hl7-templates.zip", filename: "HL7_Templates.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-ENT-001": {
    name: "OID Enterprise Platform",
    maxDownloads: 20,
    expiresInDays: 365,
    assets: [
      { id: "oid-ent-platform", r2_key: "products/oid-enterprise/enterprise-platform.zip", filename: "OID_Enterprise_Platform.zip", kind: "zip", size: 0 },
      { id: "oid-ent-docs", r2_key: "products/oid-enterprise/enterprise-docs.pdf", filename: "Enterprise_Documentation.pdf", kind: "pdf", size: 0 },
      { id: "oid-ent-config", r2_key: "products/oid-enterprise/enterprise-config-templates.zip", filename: "Enterprise_Config_Templates.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-BADGE-001": {
    name: "OID Badge System License",
    maxDownloads: 10,
    expiresInDays: 730,
    assets: [
      { id: "oid-badge-source", r2_key: "products/oid-badge/badge-system-source.zip", filename: "OID_Badge_System_Source.zip", kind: "zip", size: 0 },
      { id: "oid-badge-docs", r2_key: "products/oid-badge/badge-system-docs.pdf", filename: "Badge_System_Docs.pdf", kind: "pdf", size: 0 },
    ],
  },
  "OID-ENT-ARCH-001": {
    name: "OID Enterprise Namespace Architect",
    maxDownloads: 25,
    expiresInDays: 365,
    assets: [
      { id: "oid-arch-namespace-kit", r2_key: "products/oid-ent-arch/namespace-architect-kit.zip", filename: "OID_Enterprise_Namespace_Architect.zip", kind: "zip", size: 0 },
      { id: "oid-arch-fhir-bundle", r2_key: "products/oid-ent-arch/fhir-namespace-bundle-r4-r5.zip", filename: "FHIR_Namespace_Bundle_R4_R5.zip", kind: "zip", size: 0 },
      { id: "oid-arch-mcp-schemas", r2_key: "products/oid-ent-arch/mcp-urn-schemas.zip", filename: "MCP_URN_Schemas.zip", kind: "zip", size: 0 },
      { id: "oid-arch-x509-policy", r2_key: "products/oid-ent-arch/x509-policy-oids.pdf", filename: "X509_Policy_OIDs.pdf", kind: "pdf", size: 0 },
      { id: "oid-arch-docs", r2_key: "products/oid-ent-arch/enterprise-architect-docs.pdf", filename: "Enterprise_Architect_Docs.pdf", kind: "pdf", size: 0 },
      { id: "oid-arch-portal-access", r2_key: "products/oid-ent-arch/portal-access-guide.pdf", filename: "Portal_Access_Guide.pdf", kind: "pdf", size: 0 },
    ],
  },
  "OID-HLTH-SUITE-001": {
    name: "Healthcare AI Identity Infrastructure Suite",
    maxDownloads: 30,
    expiresInDays: 365,
    assets: [
      { id: "hlth-full-kit", r2_key: "products/oid-hlth-suite/healthcare-ai-identity-suite.zip", filename: "Healthcare_AI_Identity_Suite.zip", kind: "zip", size: 0 },
      { id: "hlth-dicom-uid-block", r2_key: "products/oid-hlth-suite/dicom-uid-allocation-block.pdf", filename: "DICOM_UID_Allocation_Block.pdf", kind: "pdf", size: 0 },
      { id: "hlth-fhir-ext-registry", r2_key: "products/oid-hlth-suite/fhir-extension-registry.zip", filename: "FHIR_Extension_Registry.zip", kind: "zip", size: 0 },
      { id: "hlth-snomed-mapping", r2_key: "products/oid-hlth-suite/snomed-ct-oid-mapping.pdf", filename: "SNOMED_CT_OID_Mapping.pdf", kind: "pdf", size: 0 },
      { id: "hlth-hipaa-docs", r2_key: "products/oid-hlth-suite/hipaa-namespace-documentation.pdf", filename: "HIPAA_Namespace_Documentation.pdf", kind: "pdf", size: 0 },
      { id: "hlth-audit-schema", r2_key: "products/oid-hlth-suite/audit-trail-oid-schema.zip", filename: "Audit_Trail_OID_Schema.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-WL-ENT-001": {
    name: "BrainSAIT OID White-Label Enterprise License",
    maxDownloads: 50,
    expiresInDays: 730,
    assets: [
      { id: "wl-full-platform", r2_key: "products/oid-white-label/white-label-enterprise-package.zip", filename: "WhiteLabel_Enterprise_Package.zip", kind: "zip", size: 0 },
      { id: "wl-portal-source", r2_key: "products/oid-white-label/oid-portal-react-source.zip", filename: "OID_Portal_React_Source.zip", kind: "zip", size: 0 },
      { id: "wl-reseller-guide", r2_key: "products/oid-white-label/reseller-setup-guide.pdf", filename: "Reseller_Setup_Guide.pdf", kind: "pdf", size: 0 },
      { id: "wl-multitenant-docs", r2_key: "products/oid-white-label/multitenant-architecture-docs.pdf", filename: "Multitenant_Architecture_Docs.pdf", kind: "pdf", size: 0 },
      { id: "wl-brand-kit", r2_key: "products/oid-white-label/white-label-brand-kit.zip", filename: "WhiteLabel_Brand_Kit.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-FHIR-PLAT-001": {
    name: "OID FHIR Integration Platform",
    maxDownloads: 20,
    expiresInDays: 365,
    assets: [
      { id: "fhir-plat-toolkit", r2_key: "products/oid-fhir-platform/fhir-integration-toolkit.zip", filename: "FHIR_Integration_Toolkit.zip", kind: "zip", size: 0 },
      { id: "fhir-plat-ig-template", r2_key: "products/oid-fhir-platform/ig-template-with-oid.zip", filename: "IG_Template_with_OID.zip", kind: "zip", size: 0 },
      { id: "fhir-plat-fsh-library", r2_key: "products/oid-fhir-platform/fsh-template-library.zip", filename: "FSH_Template_Library.zip", kind: "zip", size: 0 },
      { id: "fhir-plat-migration", r2_key: "products/oid-fhir-platform/structuredefinition-oid-migration.zip", filename: "StructureDefinition_OID_Migration.zip", kind: "zip", size: 0 },
      { id: "fhir-plat-docs", r2_key: "products/oid-fhir-platform/fhir-platform-docs.pdf", filename: "FHIR_Platform_Docs.pdf", kind: "pdf", size: 0 },
    ],
  },
};

function generateLicenseKey(orderId, sku) {
  const prefix = sku.replace(/[^A-Z0-9]/g, "").slice(0, 8);
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BSOID-${prefix}-${ts}-${rand}`;
}

async function verifyShopifyHmac(request, secret) {
  const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256");
  if (!hmacHeader) return false;

  const body = await request.clone().arrayBuffer();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, body);
  const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return computed === hmacHeader;
}

async function grantLicense(env, licenseKey, orderId, productIds, assets, customerEmail, customerId, maxDownloads, expiresAt) {
  const resp = await fetch(`${DELIVERY_BASE_URL}/admin/licenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hub-key": env.DELIVERY_ADMIN_TOKEN,
    },
    body: JSON.stringify({
      license_key: licenseKey,
      order_id: orderId,
      product_ids: productIds,
      assets,
      customer_email: customerEmail,
      customer_id: customerId,
      max_downloads_per_asset: maxDownloads,
      expires_at: expiresAt,
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`delivery grant failed ${resp.status}: ${txt}`);
  }
  return resp.json();
}

async function logToAirtable(env, record) {
  const resp = await fetch(
    `${AIRTABLE_API_URL}/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: record }),
    }
  );
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`airtable log failed ${resp.status}: ${txt}`);
  }
  return resp.json();
}

async function handleOrderPaid(request, env) {
  const valid = await verifyShopifyHmac(request, env.SHOPIFY_WEBHOOK_SECRET);
  if (!valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const order = await request.json();
  const orderId = String(order.id);
  const customerEmail = order.email || order.customer?.email || "";
  const customerId = String(order.customer?.id || orderId);
  const customerName = [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ") || customerEmail;

  const locale = (order.customer_locale || order.locale || "en").toLowerCase();
  const language = locale.startsWith("ar") ? "AR" : "EN";

  const errors = [];

  for (const lineItem of order.line_items || []) {
    const sku = lineItem.sku;
    if (!sku || !SKU_ASSETS[sku]) continue;

    const manifest = SKU_ASSETS[sku];
    const licenseKey = generateLicenseKey(orderId, sku);
    const expiresAt = new Date(Date.now() + manifest.expiresInDays * 86400 * 1000).toISOString();
    const deliveryUrl = `${DELIVERY_BASE_URL}/deliver/${licenseKey}`;

    try {
      await grantLicense(
        env,
        licenseKey,
        orderId,
        [sku],
        manifest.assets,
        customerEmail,
        customerId,
        manifest.maxDownloads,
        expiresAt
      );

      await logToAirtable(env, {
        "License Key": licenseKey,
        "Shopify Order ID": orderId,
        "Customer Email": customerEmail,
        "Customer Name": customerName,
        "Product SKU": sku,
        "Product Name": manifest.name,
        "Amount SAR": Number(lineItem.price),
        "Status": "Active",
        "Language": language,
        "Asset Bundle": manifest.assets.map((a) => a.id).join(", "),
        "Download URL": deliveryUrl,
        "Issued At": new Date().toISOString(),
        "Expires At": expiresAt.slice(0, 10),
        "Download Count": 0,
        "Notes": `Order ${orderId} — ${lineItem.quantity}x ${lineItem.name}`,
      });
    } catch (err) {
      errors.push({ sku, error: err.message });
    }
  }

  if (errors.length > 0) {
    console.error("fulfillment errors", JSON.stringify(errors));
    return new Response(JSON.stringify({ ok: false, errors }), {
      status: 207,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleAdminStatus(request, env) {
  const authHeader = request.headers.get("x-hub-key");
  if (authHeader !== env.DELIVERY_ADMIN_TOKEN) {
    return new Response("Forbidden", { status: 403 });
  }
  return new Response(
    JSON.stringify({
      worker: "oid-order-fulfillment",
      version: "1.0.0",
      skus: Object.keys(SKU_ASSETS),
      delivery_base: DELIVERY_BASE_URL,
      airtable_base: env.AIRTABLE_BASE_ID,
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/webhooks/shopify/orders-paid") {
      return handleOrderPaid(request, env);
    }

    if (request.method === "GET" && url.pathname === "/admin/status") {
      return handleAdminStatus(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};
