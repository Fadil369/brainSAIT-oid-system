import json, os, urllib.request
t = os.environ["SHOPIFY_OID_TOKEN"]
B = "https://brainsait-oid.myshopify.com/admin/api/2025-10/"
H = {"Content-Type": "application/json", "X-Shopify-Access-Token": t}
def rest(method, path, payload=None):
    req = urllib.request.Request(B + path,
        data=json.dumps(payload).encode() if payload is not None else None, headers=H, method=method)
    with urllib.request.urlopen(req, timeout=25) as x: return json.load(x)
def gql(query, variables=None):
    req = urllib.request.Request(B + "graphql.json",
        data=json.dumps({"query": query, "variables": variables or {}}).encode(), headers=H)
    with urllib.request.urlopen(req, timeout=30) as x: return json.load(x)
pubs = rest("GET", "publications.json")["publications"]
online = [p for p in pubs if "nline" in p["name"]][0]
pub_gid = f"gid://shopify/Publication/{online['id']}"
print("channel:", online["name"])
ps = rest("GET", "products.json?limit=250&fields=id,title,variants")["products"]
oids = [p for p in ps if any((v.get("sku") or "").startswith("OID-") for v in p.get("variants", []))]
print("OID products:", len(oids))
MUT = "mutation($id: ID!, $in: [PublicationInput!]!) { publishablePublish(id: $id, input: $in) { userErrors { message } } }"
for p in oids:
    r = gql(MUT, {"id": f"gid://shopify/Product/{p['id']}", "in": [{"publicationId": pub_gid}]})
    errs = r["data"]["publishablePublish"]["userErrors"]
    print(("OK " if not errs else "ERR ") + str(p["id"]), p["title"][:45], errs or "")
