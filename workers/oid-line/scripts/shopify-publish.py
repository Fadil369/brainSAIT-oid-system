#!/usr/bin/env python3
"""Publish OID LINE to brainsait-oid via Shopify Admin REST. Token via SHOPIFY_OID_TOKEN env. Never prints the token."""
import json, os, sys, urllib.request

SHOP = "brainsait-oid.myshopify.com"
API = "2025-10"
WEBHOOK_URL = "https://oid-line.brainsait-fadil.workers.dev/v1/checkout/webhook"
BASE = os.path.join(os.path.dirname(__file__), "oid-line-skus.json")
SKUS = json.load(open(BASE))["skus"]
EXTRA = [
    {"sku": "OID-NPHIES-SUP", "oid": "1.3.6.1.4.1.61026.14.4",
     "title_en": "NPHIES-OID Annual Support", "title_ar": "دعم نفيس السنوي",
     "price": 48000, "bill": "Annual support",
     "gates": ["Monitoring + SLA", "Conformance updates", "Concierge support"],
     "overage": "transaction-tier overage"},
    {"sku": "OID-NAMESPACE-SETUP", "oid": "1.3.6.1.4.1.61026.14.5",
     "title_en": "Enterprise Namespace Setup", "title_ar": "تأسيس النطاق",
     "price": 48000, "bill": "One-time setup",
     "gates": ["Namespace allocation", "oid-base registration", "DID + QR minting"],
     "overage": "scoped per namespace"},
]

def desc(s):
    gates = "".join(f"<li>{g}</li>" for g in s["gates"])
    return (f"<p><strong>{s['title_en']}</strong> / {s['title_ar']}</p>"
            f"<p>OID <code>{s['oid']}</code> · Verify: https://verify.brainsait.org/{{SPID}}</p>"
            f"<ul>{gates}</ul><p>Overage: {s['overage']}</p>")

def rest(token, method, path, payload=None):
    req = urllib.request.Request(
        f"https://{SHOP}/admin/api/{API}/{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Content-Type": "application/json", "X-Shopify-Access-Token": token},
        method=method)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def variant(price, sku, oid, option=None, compare=None):
    v = {"price": str(price), "sku": sku, "barcode": oid, "taxable": True,
         "requires_shipping": False, "inventory_management": None,
         "inventory_policy": "continue", "fulfillment_service": "manual"}
    if option: v["option1"] = option
    if compare: v["compare_at_price"] = str(compare)
    return v

def main():
    live = "--live" in sys.argv
    token = os.environ.get("SHOPIFY_OID_TOKEN", "")
    if live and not token:
        print("SHOPIFY_OID_TOKEN missing"); sys.exit(1)
    if live:
        shop = rest(token, "GET", "shop.json")["shop"]
        print(f"shop: {shop['name']} currency={shop['currency']}")
        existing = rest(token, "GET", "products.json?limit=250&fields=id,title,variants")["products"]
        have = {v["sku"] for p in existing for v in p.get("variants", []) if v.get("sku")}
        print(f"existing products: {len(existing)}, OID SKUs present: {sorted(have)}")
    plan = []
    for s in EXTRA:
        plan.append({"title": f"{s['title_en']} / {s['title_ar']}", "type": "OID",
                     "tags": f"OID, {s['sku']}, {s['oid']}, verify", "html": desc(s),
                     "variants": [variant(s["price"], s["sku"], s["oid"])]})
    for s in SKUS:
        p = s["prices"]
        if "monthly" in p and "annual" in p:
            plan.append({"title": f"{s['title_en']} / {s['title_ar']}", "type": "OID",
                         "tags": f"OID, {s['sku']}, {s['oid']}, verify, annual-first", "html": desc(s),
                         "options": [{"name": "Billing"}],
                         "variants": [variant(p["monthly"], f"{s['sku']}-M", s["oid"], "Monthly"),
                                      variant(p["annual"], f"{s['sku']}-A", s["oid"], "Annual", p["monthly"] * 12)]})
        else:
            plan.append({"title": f"{s['title_en']} / {s['title_ar']}", "type": "OID",
                         "tags": f"OID, {s['sku']}, {s['oid']}, verify, annual-first", "html": desc(s),
                         "variants": [variant(p.get("annual") or p.get("one_time"), s["sku"], s["oid"])]})
    for item in plan:
        skus = [v["sku"] for v in item["variants"]]
        print(f"[{' + '.join(skus)}] {item['title']}")
        if not live: continue
        if live and all(k in have for k in skus):
            print("  exists — skip"); continue
        body = {"product": {"title": item["title"], "vendor": "BrainSAIT",
                            "product_type": item["type"], "tags": item["tags"],
                            "status": "active", "body_html": item["html"],
                            "variants": item["variants"]}}
        if "options" in item: body["product"]["options"] = item["options"]
        try:
            pr = rest(token, "POST", "products.json", body)["product"]
            print(f"  created id={pr['id']} handle={pr['handle']} " +
                  str([(v["sku"], v["price"]) for v in pr["variants"]]))
        except Exception as e:
            print("  ERROR:", str(e)[:300])
    if live:
        hooks = rest(token, "GET", "webhooks.json")["webhooks"]
        addrs = [h["address"] for h in hooks if h.get("topic") == "orders/paid"]
        print(f"\norders/paid webhooks: {addrs}")
        if WEBHOOK_URL not in addrs:
            h = rest(token, "POST", "webhooks.json",
                     {"webhook": {"topic": "orders/paid", "address": WEBHOOK_URL, "format": "json"}})["webhook"]
            print(f"registered webhook id={h['id']} -> {h['address']}")
        else:
            print("webhook already registered")

if __name__ == "__main__":
    main()
