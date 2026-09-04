import json, os, urllib.request
t = os.environ["SHOPIFY_OID_TOKEN"]
H = {"X-Shopify-Access-Token": t}
base = "https://brainsait-oid.myshopify.com/admin/api/2025-10/"
ps = json.load(urllib.request.urlopen(
    urllib.request.Request(base + "products.json?limit=250&fields=id,title,variants", headers=H),
    timeout=20))["products"]
for p in ps:
    vs = p.get("variants", [])
    if vs and all(not v.get("sku") for v in vs):
        pid = p.get("id")
        print("deleting dud:", pid, p.get("title", "")[:40])
        req = urllib.request.Request(base + "products/%s.json" % pid, headers=H, method="DELETE")
        with urllib.request.urlopen(req, timeout=20) as x:
            print("delete status:", x.status)
cnt = json.load(urllib.request.urlopen(
    urllib.request.Request(base + "products/count.json", headers=H), timeout=20))["count"]
print("final count:", cnt)
