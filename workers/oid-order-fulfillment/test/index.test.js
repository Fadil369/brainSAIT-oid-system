import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/index.js";

const encoder = new TextEncoder();

async function signedRequest(body, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hmac = Buffer.from(signature).toString("base64");

  return new Request("https://fulfillment.brainsait.org/webhooks/shopify/orders-paid", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Hmac-SHA256": hmac,
    },
    body,
  });
}

test("replayed Shopify webhooks reuse the same license and Airtable upsert", async () => {
  const secret = "test-webhook-secret";
  const env = {
    SHOPIFY_WEBHOOK_SECRET: secret,
    LICENSE_SIGNING_SECRET: "test-license-signing-secret",
    DELIVERY_ADMIN_TOKEN: "test-delivery-token",
    AIRTABLE_API_KEY: "test-airtable-token",
    AIRTABLE_BASE_ID: "app-test",
    AIRTABLE_TABLE_NAME: "OID_Orders",
    DELIVERY_BASE_URL: "https://assets.example.test",
  };
  const body = JSON.stringify({
    id: 12345,
    created_at: "2026-01-01T00:00:00Z",
    email: "buyer@example.test",
    line_items: [
      {
        id: 67890,
        sku: "OID-STARTER-001",
        name: "OID Namespace Starter Kit",
        price: "100.00",
        quantity: 1,
      },
    ],
  });
  const deliveryRequests = [];
  const airtableRequests = [];
  const originalFetch = globalThis.fetch;
  let deliveryAttempt = 0;

  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith("/admin/licenses")) {
      deliveryRequests.push(JSON.parse(options.body));
      deliveryAttempt += 1;
      return deliveryAttempt === 1
        ? Response.json({ ok: true })
        : new Response("already exists", { status: 409 });
    }

    airtableRequests.push(JSON.parse(options.body));
    return Response.json({ records: [] });
  };

  try {
    const first = await worker.fetch(await signedRequest(body, secret), env);
    const replay = await worker.fetch(await signedRequest(body, secret), env);

    assert.equal(first.status, 200);
    assert.equal(replay.status, 200);
    assert.equal(deliveryRequests.length, 2);
    assert.equal(deliveryRequests[0].license_key, deliveryRequests[1].license_key);
    assert.deepEqual(
      airtableRequests[0].performUpsert,
      { fieldsToMergeOn: ["License Key"] }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects an invalid Shopify signature", async () => {
  const request = new Request(
    "https://fulfillment.brainsait.org/webhooks/shopify/orders-paid",
    {
      method: "POST",
      headers: { "X-Shopify-Hmac-SHA256": "invalid" },
      body: "{}",
    }
  );
  const response = await worker.fetch(request, {
    SHOPIFY_WEBHOOK_SECRET: "secret",
    LICENSE_SIGNING_SECRET: "signing",
    DELIVERY_ADMIN_TOKEN: "delivery",
    AIRTABLE_API_KEY: "airtable",
  });

  assert.equal(response.status, 401);
});
