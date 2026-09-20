import { CSS } from "./styles";
import { PRODUCTS, featuredProduct, findProduct, type Product } from "./products";
import { KB_ARTICLES, KB_CATEGORIES, findKBArticle, type KBArticle } from "./kb";

type Env = { SHOP_BASE_URL?: string; REGISTRY_URL?: string; OID_ROOT?: string; SITE_BASE_URL?: string; };

const DEFAULT_SHOP = "https://id.brainsait.org";
const DEFAULT_REGISTRY = "https://registry.brainsait.org";
const DEFAULT_ROOT = "1.3.6.1.4.1.61026";
const DEFAULT_SITE = "https://identity.brainsait.org";

// ── Translation system ──
type Lang = "ar" | "en";
type TKey =
  | "brandTitle" | "brandSub" | "navRegistry" | "navKnowledge" | "navProducts" | "navArchitecture"
  | "heroEyebrow" | "heroTitle" | "heroLead" | "ctaShop" | "ctaRegistry"
  | "registryEyebrow" | "registryTitle" | "registryLead" | "registryAr"
  | "archEyebrow" | "archTitle" | "archCopy"
  | "pathfinderEyebrow" | "pathfinderTitle" | "pathfinderCopy"
  | "kbEyebrow" | "kbTitle" | "kbCopy" | "kbExplore" | "kbRead"
  | "productsEyebrow" | "productsTitle" | "productsCopy"
  | "method1" | "method2" | "method3" | "method4"
  | "closingEyebrow" | "closingTitle" | "closingCopy"
  | "verifyLabel" | "verifyBtn" | "verifyHelp"
  | "learnStep" | "buyStep" | "captureStep" | "fulfillStep" | "verifyStep"
  | "whoFor" | "whatYouGet" | "proofPoints" | "hiddenRisk" | "assetCreated" | "nextMove"
  | "readStory" | "shopify" | "compare" | "buyVia" | "openRegistry"
  | "oidBranch" | "timeline" | "decisionPath" | "decisionCopy"
  | "hubArticles" | "hubPillars" | "hubTexts" | "hubMedia" | "hubFeatured"
  | "allKnowledge" | "foundations" | "architectureCat" | "guides" | "philosophy" | "media"
  | "relatedProducts" | "turnKnowledge" | "associatedMedia"
  | "langLabel" | "themeLabel" | "skipToContent" | "notFound" | "notFoundCopy";

const T: Record<TKey, Record<Lang, string>> = {
  brandTitle: { ar: "هوية برينسايت", en: "BrainSAIT Identity" },
  brandSub: { ar: "منصة الهوية والسجلات", en: "Registry-first platform" },
  navRegistry: { ar: "السجل", en: "Registry" },
  navKnowledge: { ar: "المعرفة", en: "Knowledge" },
  navProducts: { ar: "المنتجات", en: "Products" },
  navArchitecture: { ar: "العمارة", en: "Architecture" },
  heroEyebrow: { ar: "منصة هوية صحية", en: "Healthcare identity platform" },
  heroTitle: { ar: "السجل هو المنتج.", en: "The registry is the product." },
  heroLead: { ar: "تعرّف على بنية الهوية، اقرأ قاعدة المعرفة، ثم اشترِ الشارات أو النطاقات أو حزم التنفيذ عبر متجر Shopify المدمج.", en: "Learn the identity architecture, read the knowledge base, then purchase badges, namespaces, or implementation bundles through the integrated Shopify store." },
  ctaShop: { ar: "افتح المتجر", en: "Open Shop" },
  ctaRegistry: { ar: "افتح السجل", en: "Open Registry" },
  registryEyebrow: { ar: "المنتج الرئيسي", en: "Featured product" },
  registryTitle: { ar: "سجل مزودي برينسايت", en: "BrainSAIT Provider Registry" },
  registryLead: { ar: "السجل هو مصدر الحقيقة وراء كل شارة ومنتج وتكامل ونطاق ورحلة تحقق.", en: "The registry is the source of truth behind every badge, SKU, integration, namespace, and verification journey." },
  registryAr: { ar: "سجل موثوق يحول هوية مزود الرعاية إلى أصل قابل للتحقق والربط والتشغيل.", en: "A trusted registry that transforms provider identity into a verifiable, connectable, operational asset." },
  archEyebrow: { ar: "العمارة", en: "Architecture" },
  archTitle: { ar: "ثلاث محركات. اقتصاد ثقة واحد.", en: "Three engines. One trust economy." },
  archCopy: { ar: "التسويق والسداد والتحقق والتنفيذ تعمل كنظام منتج واحد.", en: "Marketing, checkout, verification, and fulfillment behave as one product system." },
  pathfinderEyebrow: { ar: "دليل المشتري", en: "Buyer pathfinder" },
  pathfinderTitle: { ar: "لا تعرض نفس المنتج للجميع.", en: "Do not show everyone the same product." },
  pathfinderCopy: { ar: "اختر زاوية المشتري. يعيد المتجر صياغة خط OID إلى قرار بنية هوية.", en: "Choose the buyer lens. The storefront reframes the OID Line into an identity architecture decision." },
  kbEyebrow: { ar: "مركز المعرفة", en: "Knowledge Hub" },
  kbTitle: { ar: "معرفة عميقة لبنية هوية جادة.", en: "Deep knowledge for serious identity infrastructure." },
  kbCopy: { ar: "وثائق العمارة وفلسفة هندسة المعلومات وأدلة التنفيذ والوسائط المتعددة — كلها من قاعدة معرفة برينسايت.", en: "Architecture documents, information architecture philosophy, implementation guides, and multimedia — all from the BrainSAIT knowledge base." },
  kbExplore: { ar: "استكشف مركز المعرفة", en: "Explore Knowledge Hub" },
  kbRead: { ar: "اقرأ:", en: "Read:" },
  productsEyebrow: { ar: "مجموعة المنتجات", en: "Product collection" },
  productsTitle: { ar: "خط OID", en: "The OID Line" },
  productsCopy: { ar: "وصول سجل المزودين وشارات التحقق وتكامل FHIR وعمليات هوية NPHIES وترخيص النطاقات المؤسسية وعروض العلامات البيضاء.", en: "Provider registry access, verification badges, FHIR mapping, NPHIES identity operations, enterprise namespaces, and white-label territory plays." },
  method1: { ar: "تحديد الهوية", en: "Identify" },
  method2: { ar: "إسناد SPID/OID", en: "Assign SPID/OID" },
  method3: { ar: "التحقق العام", en: "Verify publicly" },
  method4: { ar: "تشغيل وتكامل", en: "Operate & integrate" },
  closingEyebrow: { ar: "من المتجر إلى طبقة الثقة", en: "Storefront to trust layer" },
  closingTitle: { ar: "منصة لهوية رقمية جادة.", en: "A platform for serious identity infrastructure." },
  closingCopy: { ar: "يحصل العملاء على الفكرة الكاملة قبل السداد: ما مشكلة الهوية التي يشترونها، ولماذا يهم السجل، وكيف يرتبط كل منتج بهوية برينسايت القابلة للتحقق.", en: "Customers get the full idea before checkout: what identity problem they are buying, why the registry matters, and how each product maps to verifiable BrainSAIT infrastructure." },
  verifyLabel: { ar: "ابدأ التحقق من السجل", en: "Launch a registry verification" },
  verifyBtn: { ar: "تحقق", en: "Verify" },
  verifyHelp: { ar: "يفتح registry.brainsait.org/api/verify/{SPID}", en: "Opens registry.brainsait.org/api/verify/{SPID}" },
  learnStep: { ar: "تعرّف", en: "Learn" },
  buyStep: { ar: "اشترِ", en: "Buy" },
  captureStep: { ar: "اجمع", en: "Capture" },
  fulfillStep: { ar: "نفّذ", en: "Fulfill" },
  verifyStep: { ar: "تحقّق", en: "Verify" },
  whoFor: { ar: "لمن هذا المنتج", en: "Who it is for" },
  whatYouGet: { ar: "ماذا تحصل", en: "What you get" },
  proofPoints: { ar: "نقاط الإثبات", en: "Proof points" },
  hiddenRisk: { ar: "الخطر الخفي", en: "Hidden risk" },
  assetCreated: { ar: "الأصل المُنشأ", en: "Asset created" },
  nextMove: { ar: "الخطوة التالية", en: "Next move" },
  readStory: { ar: "اقرأ القصة", en: "Read story" },
  shopify: { ar: "Shopify", en: "Shopify" },
  compare: { ar: "قارن", en: "Compare" },
  buyVia: { ar: "اشترِ عبر id.brainsait.org", en: "Buy via id.brainsait.org" },
  openRegistry: { ar: "افتح السجل", en: "Open registry" },
  oidBranch: { ar: "فرع OID", en: "OID branch" },
  timeline: { ar: "الجدول الزمني", en: "Timeline" },
  decisionPath: { ar: "مسار القرار", en: "Decision path" },
  decisionCopy: { ar: "افهمه هنا. اشترِه عبر Shopify. تحقق منه في السجل.", en: "Understand it here. Buy it through Shopify. Verify it in the registry." },
  hubArticles: { ar: "مقالات", en: "Articles" },
  hubPillars: { ar: "أعمدة", en: "Pillars" },
  hubTexts: { ar: "نصوص", en: "Texts" },
  hubMedia: { ar: "وسائط", en: "Media" },
  hubFeatured: { ar: "مميز", en: "Featured" },
  allKnowledge: { ar: "كل المعرفة", en: "All Knowledge" },
  foundations: { ar: "الأساسيات", en: "Foundations" },
  architectureCat: { ar: "العمارة", en: "Architecture" },
  guides: { ar: "الأدلة", en: "Guides" },
  philosophy: { ar: "الفلسفة", en: "Philosophy" },
  media: { ar: "الوسائط", en: "Media" },
  relatedProducts: { ar: "المنتجات ذات الصلة", en: "Related Products" },
  turnKnowledge: { ar: "حوّل المعرفة إلى قدرة", en: "Turn knowledge into capability" },
  associatedMedia: { ar: "الوسائط المرتبطة", en: "Associated media" },
  langLabel: { ar: "EN", en: "عربي" },
  themeLabel: { ar: "☀", en: "☀" },
  skipToContent: { ar: "انتقل إلى المحتوى", en: "Skip to content" },
  notFound: { ar: "غير موجود", en: "Not found" },
  notFoundCopy: { ar: "هذا الفرع غير موجود بعد. عد إلى المنصة أو افتح السجل.", en: "This branch does not exist yet. Return to the platform or open the registry." },
};

const PRODUCT_INTEL: Record<string, Record<Lang, { risk: string; asset: string; boardLine: string; nextMove: string }>> = {
  "provider-registry": { ar: { risk: "حقيقة الاعتمادات متناثرة في رسائل البريد وملفات PDF والبوابات والذاكرة.", asset: "مصدر حقيقة محكوم للهوية يمكن البحث فيه والتحقق منه وتكامله.", boardLine: "نحن لا نشتري دليلاً. نشتري نظام تشغيل ثقة.", nextMove: "افتح وصول السجل، حدد أول مجموعة مزودين، ثم أرفق منتجات الهوية المشتراة من Shopify بسجلات حقيقية." }, en: { risk: "Credential truth is scattered across emails, PDFs, portals, and memory.", asset: "A governed source of identity truth that can be searched, verified, and integrated.", boardLine: "We are not buying a directory. We are buying a trust operating system.", nextMove: "Open registry access, define the first provider cohort, then attach Shopify-purchased identity products to real records." } },
  "oid-verification-badge": { ar: { risk: "قد يكون المزود ممتازاً، لكن الإثبات الرقمي متناثر وسهل التزوير.", asset: "شارة ثقة عامة وSPID وفرع OID ومسار تحقق QR.", boardLine: "اجعل كل مزود موثوق يحمل توقيعاً رقمياً قابلاً للتحقق.", nextMove: "اشترِ وصول الشارة، قدّم أدلة الملف الشخصي، ثم انشر رابط التحقق عبر القنوات العامة." }, en: { risk: "A provider may be excellent, but online proof is fragmented and easy to fake.", asset: "A public trust badge, SPID, OID branch, and QR verification path.", boardLine: "Make every trusted provider carry a verifiable digital signature.", nextMove: "Purchase badge access, submit profile evidence, then publish the verify link across public channels." } },
  "registry-explorer-seat": { ar: { risk: "لا تستطيع الفرق حوكمة ما لا تستطيع رؤيته عبر المنشآت والخدمات والأدوار.", asset: "مقعد قيادة على مستوى المنشأة لعمليات الهوية ورؤية التدقيق.", boardLine: "الهوية تصبح تشغيلية فقط عندما تستطيع الفرق فحصها يومياً.", nextMove: "ابدأ بمنشأة واحدة، خرّط المستخدمين والأدوار، ثموسّع إلى مجموعات المزودين." }, en: { risk: "Teams cannot govern what they cannot see across facilities, services, and roles.", asset: "A facility-level command seat for identity operations and audit visibility.", boardLine: "Identity becomes operational only when teams can inspect it daily.", nextMove: "Start with one facility, map users and roles, then expand into provider cohorts." } },
  "fhir-integration-platform": { ar: { risk: "بيانات FHIR تتحرك، لكن المعرفات الغامضة تلوث كل سير عمل في المصب.", asset: "طبقة هوية مخرّطة لموارد FHIR قبل نمو حركة التكامل.", boardLine: "نظّف الهوية قبل إطلاق الـ API، وليس بعد فشل المطالبات والإحالات.", nextMove: "حدد مجموعة الموارد الأولى، ارسم خريطة معرفات OID/FHIR، ثم اختبر تحقق نقطة النهاية." }, en: { risk: "FHIR data moves, but ambiguous identifiers contaminate every downstream workflow.", asset: "A mapped identity layer for FHIR resources before integration traffic grows.", boardLine: "Clean identity before the API goes live, not after claims and referrals fail.", nextMove: "Scope the first resource set, map OID/FHIR identifiers, then test endpoint verification." } },
  "nphies-identity-bundle": { ar: { risk: "سير عمل المطالبات ينهار عندما تنحرف هوية المزود والدافع والمنشأة والخدمة والمعاملة.", asset: "حزمة هوية عملية لفرق NPHIES تواجه الأهلية والترخيص والمطالبات.", boardLine: "دقة المطالبات تبدأ قبل وجود المطالبة نفسها: في تصميم الهوية.", nextMove: "حدد نطاق الدافع/المنشأة، وحّد هوية المعاملة، ثم درّب المستخدمين التشغيليين." }, en: { risk: "Claims workflows collapse when provider, facility, payer, service, and transaction identities drift.", asset: "A practical NPHIES-facing identity bundle for eligibility, authorization, and claims.", boardLine: "Claims accuracy begins before the claim exists: at identity design.", nextMove: "Define payer/facility scope, align transaction identity, then train operational users." } },
  "enterprise-namespace-license": { ar: { risk: "البرامج الكبيرة تبتكر معرفات في كل مكان حتى تصبح الحوكمة مستحيلة.", asset: "نطاق OID مؤسسي محكوم بأقواس فرعية وقواعد نشر ومسارات تحقق.", boardLine: "النطاق ليس تسمية تقنية. إنه ذاكرة مؤسسية.", nextMove: "احجز حوكمة النطاق، وافق على الأقواس الفرعية، سجّل وانشر نموذج التشغيل." }, en: { risk: "Large programs invent identifiers everywhere until governance becomes impossible.", asset: "A sovereign enterprise namespace with child arcs, publishing rules, and verification paths.", boardLine: "A namespace is not an IT label. It is institutional memory.", nextMove: "Reserve namespace governance, approve child arcs, then register and publish the operating model." } },
  "white-label-enterprise": { ar: { risk: "الشركاء الاستراتيجيون يريدون طبقة الثقة لكنهم لا يستطيعون كشف علامة مستعارة على نطاق واسع.", asset: "سجل وواجهة متجر وطبقة تحقق بالعلامة التجارية الخاصة ونموذج تشغيل شريك.", boardLine: "دع الشركاء يملكون المسرح بينما تشغّل برينسايت آليات الثقة.", nextMove: "أجرِ اكتشاف مؤسسي، حدد اقليمية الإقليم، ثم أطلق طيار سجل متحكم فيه." }, en: { risk: "Strategic partners want the trust layer but cannot expose a borrowed brand at scale.", asset: "A private-branded registry, storefront, verification layer, and partner operating model.", boardLine: "Let partners own the stage while BrainSAIT powers the trust machinery.", nextMove: "Run enterprise discovery, define territory economics, then launch a controlled pilot registry." } },
};

const SEGMENTS: { id: string; label: Record<Lang, string>; product: string; line: Record<Lang, string> }[] = [
  { id: "facility", label: { ar: "المنشأة", en: "Facility CEO" }, product: "provider-registry", line: { ar: "أنهِ فوضى الاعتمادات. اجعل السجل طبقة التشغيل.", en: "Stop credential chaos. Make registry the operating layer." } },
  { id: "provider", label: { ar: "المزود", en: "Provider" }, product: "oid-verification-badge", line: { ar: "حوّل السمعة إلى ملف موثق محمول.", en: "Turn reputation into a portable verified profile." } },
  { id: "integration", label: { ar: "فريق FHIR", en: "FHIR Team" }, product: "fhir-integration-platform", line: { ar: "حل الهوية قبل تبادل البيانات بين الأنظمة.", en: "Resolve identity before systems exchange data." } },
  { id: "claims", label: { ar: "عمليات المطالبات", en: "Claims Ops" }, product: "nphies-identity-bundle", line: { ar: "نظّم الهوية قبل حركة الأهلية والترخيص والمطالبات.", en: "Structure identity before eligibility, auth, and claims move." } },
  { id: "enterprise", label: { ar: "المؤسسة", en: "Enterprise" }, product: "enterprise-namespace-license", line: { ar: "امتلك النطاق قبل أن يبتكر كل نظام واحداً.", en: "Own the namespace before every system invents one." } },
  { id: "partner", label: { ar: "شريك إقليمي", en: "Territory Partner" }, product: "white-label-enterprise", line: { ar: "شغّل طبقة ثقة بعلامتك التجارية الخاصة.", en: "Operate a trust layer under your own brand." } },
];

// ── Helpers ──
function esc(v: string): string { return v.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] || c)); }
function t(key: TKey, lang: Lang): string { return T[key][lang]; }
function shopUrl(env: Env, p?: Product): string { const b = (env.SHOP_BASE_URL || DEFAULT_SHOP).replace(/\/$/, ""); return p?.handle ? `${b}/products/${p.handle}` : b; }
function registryUrl(env: Env): string { return (env.REGISTRY_URL || DEFAULT_REGISTRY).replace(/\/$/, ""); }

function detectLang(url: URL): Lang {
  const qp = url.searchParams.get("lang");
  if (qp === "en") return "en";
  return "ar";
}

function buildJsonLd(blocks?: object[]): string {
  const base: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "BrainSAIT",
      alternateName: "برينسايت",
      url: DEFAULT_SITE,
      logo: `${DEFAULT_SITE}/favicon.ico`,
      sameAs: [DEFAULT_REGISTRY, DEFAULT_SHOP],
      identifier: "1.3.6.1.4.1.61026",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "BrainSAIT Identity",
      url: DEFAULT_SITE,
      inLanguage: ["ar", "en"],
    },
  ];
  const all = [...base, ...(blocks || [])];
  return all.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join("\n  ");
}

function productJsonLd(p: Product, lang: Lang): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: lang === "ar" ? p.titleAr : p.title,
    description: lang === "ar" ? p.summaryAr : p.summary,
    sku: p.sku,
    identifier: p.oid,
    brand: { "@type": "Brand", name: "BrainSAIT" },
    offers: { "@type": "Offer", priceCurrency: "SAR", availability: "https://schema.org/InStock", url: `${DEFAULT_SHOP}${p.handle ? `/products/${p.handle}` : ""}` },
  };
}

function articleJsonLd(a: KBArticle, lang: Lang, path: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: lang === "ar" ? a.titleAr : a.title,
    description: lang === "ar" ? a.excerptAr : a.excerpt,
    inLanguage: lang,
    author: { "@type": "Organization", name: "BrainSAIT" },
    publisher: { "@type": "Organization", name: "BrainSAIT" },
    mainEntityOfPage: `${DEFAULT_SITE}${path}`,
  };
}

function mediaJsonLd(a: KBArticle, lang: Lang): object[] {
  if (!a.media?.length) return [];
  return a.media.map((m) => ({
    "@context": "https://schema.org",
    "@type": m.type === "video" ? "VideoObject" : m.type === "audio" ? "AudioObject" : "ImageObject",
    name: lang === "ar" ? m.labelAr : m.label,
    contentUrl: m.src,
    encodingFormat: m.mime,
    inLanguage: lang,
  }));
}

function breadcrumbJsonLd(items: { name: string; path: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${DEFAULT_SITE}${it.path}`,
    })),
  };
}

function faqJsonLd(faqs: { q: string; a: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function html(body: string, env: Env, lang: Lang, meta: { title?: string; description?: string; path?: string; jsonLd?: object[] } = {}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const title = meta.title || (lang === "ar" ? "هوية برينسايت — منصة الهوية والسجلات" : "BrainSAIT Identity — Registry-first platform");
  const desc = meta.description || (lang === "ar" ? "تجارة هوية صحية: السجلات والشارات وFHIR وNPHIES والنطاقات المؤسسية." : "Registry-first identity commerce: registries, badges, FHIR, NPHIES, enterprise namespaces.");
  const siteBase = (env.SITE_BASE_URL || DEFAULT_SITE).replace(/\/$/, "");
  const canonical = `${siteBase}${meta.path || "/"}`;
  const arUrl = `${siteBase}${meta.path || "/"}?lang=ar`;
  const enUrl = `${siteBase}${meta.path || "/"}?lang=en`;
  const jsonLd = buildJsonLd(meta.jsonLd);
  return new Response(`<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0a0a0b" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="ar" href="${arUrl}" />
  <link rel="alternate" hreflang="en" href="${enUrl}" />
  <link rel="alternate" hreflang="x-default" href="${arUrl}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="${lang === "ar" ? "ar_SA" : "en_US"}" />
  <meta property="og:locale:alternate" content="${lang === "ar" ? "en_US" : "ar_SA"}" />
  <meta name="twitter:card" content="summary" />
  ${jsonLd}
  <style>${CSS}</style>
</head>
<body>
  <a class="skip" href="#main">${t("skipToContent", lang)}</a>
  <header class="site-header" aria-label="Site header">
    <a class="brand" href="/?lang=${lang}" aria-label="${esc(t("brandTitle", lang))}">
      <span class="mark">ID</span>
      <span><span class="brand-title">${esc(t("brandTitle", lang))}</span><span class="brand-sub">${esc(t("brandSub", lang))}</span></span>
    </a>
    <nav class="nav" aria-label="Primary">
      <a href="/#registry">${esc(t("navRegistry", lang))}</a>
      <a href="/knowledge?lang=${lang}">${esc(t("navKnowledge", lang))}</a>
      <a href="/products?lang=${lang}">${esc(t("navProducts", lang))}</a>
      <a href="/architecture?lang=${lang}">${esc(t("navArchitecture", lang))}</a>
    </nav>
    <div class="header-cta">
      <a class="toggle" href="${meta.path || "/"}?lang=${lang === "ar" ? "en" : "ar"}" title="${lang === 'ar' ? 'English' : 'العربية'}">${esc(t("langLabel", lang))}</a>
      <button class="toggle" onclick="toggleTheme()" id="theme-toggle" title="Toggle theme">${esc(t("themeLabel", lang))}</button>
      <a class="pill" href="${registryUrl(env)}">registry</a>
      <a class="btn btn-primary" href="${shopUrl(env)}">${esc(t("ctaShop", lang))}</a>
    </div>
  </header>
  <main id="main" class="shell">${body}</main>
  <footer class="shell footer">
    <span>BrainSAIT OID Root ${DEFAULT_ROOT}</span>
    <span><a href="${registryUrl(env)}">Registry</a> · <a href="${shopUrl(env)}">Shopify</a> · <a href="/knowledge?lang=${lang}">${esc(t("navKnowledge", lang))}</a></span>
  </footer>
  <a class="gpt-fab" href="https://chatgpt.com/g/g-Mkc6z8fGf-brainsait-ecosystem-gpt" target="_blank" rel="noopener" id="gpt-fab" aria-label="${lang === "ar" ? "تحدث مع المساعد الذكي" : "Chat with AI Assistant"}">
    <span class="gpt-fab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path><path d="M9 22h6"></path><path d="M10 22v-4"></path><path d="M14 22v-4"></path></svg></span>
    <span class="gpt-fab-label">${esc(lang === "ar" ? "اسأل المساعد" : "Ask Assistant")}</span>
  </a>
  <div class="gpt-splash" id="gpt-splash">
    <div class="gpt-splash-arrow"></div>
    <h3>${esc(lang === "ar" ? "مساعد BrainSAIT الذكي" : "BrainSAIT AI Assistant")}</h3>
    <p>${esc(lang === "ar" ? "مساعدنا الذكي متصل بالكامل بنظام OID ومنتجاتنا. اسأل عن أي شيء — من التحقق من المعرفات إلى تكامل FHIR." : "Our AI assistant is fully trained on the OID system and all products. Ask anything — from identity verification to FHIR integration.")}</p>
    <div class="gpt-splash-actions">
      <a class="btn btn-teal" href="https://chatgpt.com/g/g-Mkc6z8fGf-brainsait-ecosystem-gpt" target="_blank" rel="noopener">${esc(lang === "ar" ? "ابدأ المحادثة" : "Start Chat")}</a>
      <button class="gpt-splash-dismiss" onclick="document.getElementById('gpt-splash').classList.remove('show');localStorage.setItem('gpt-splash-seen','1')">${esc(lang === "ar" ? "لاحقاً" : "Later")}</button>
    </div>
  </div>
  <div class="read-progress" aria-hidden="true"><span id="read-progress-bar"></span></div>
  <script>
  (function(){
    var saved=localStorage.getItem("bs-theme");
    if(saved==="light")document.documentElement.setAttribute("data-theme","light");
    else if(!saved&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches)document.documentElement.setAttribute("data-theme","light");
    window.toggleTheme=function(){
      var h=document.documentElement;
      var curr=h.getAttribute("data-theme");
      var next=curr==="light"?"dark":"light";
      if(next==="dark")h.removeAttribute("data-theme");
      else h.setAttribute("data-theme","light");
      localStorage.setItem("bs-theme",next);
    };
    // Reading progress bar (article pages)
    var bar=document.getElementById("read-progress-bar");
    if(bar){var onScroll=function(){var h=document.documentElement;var max=h.scrollHeight-h.clientHeight;var pct=max>0?(h.scrollTop/max)*100:0;bar.style.width=pct+"%"};window.addEventListener("scroll",onScroll,{passive:true});onScroll()}
    // FAQ accordion
    document.querySelectorAll("[data-faq]").forEach(function(item){
      var btn=item.querySelector("[data-faq-btn]");
      if(btn)btn.addEventListener("click",function(){item.classList.toggle("open")});
    });
    // GPT assistant splash — show once per session
    if(!localStorage.getItem("gpt-splash-seen")){
      setTimeout(function(){var s=document.getElementById("gpt-splash");if(s)s.classList.add("show")},2500);
    }
    var savedLang=localStorage.getItem("bs-lang");
    if(savedLang&&savedLang!=="${lang}"){
      var url=new URL(window.location.href);
      if(!url.searchParams.has("lang")){
        url.searchParams.set("lang",savedLang);
        window.location.replace(url.toString());
      }
    }
    localStorage.setItem("bs-lang","${lang}");
  })();
  </script>
</body>
</html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" } });
}

function btnRow(env: Env, lang: Lang, p?: Product, regFirst = false): string {
  const reg = `<a class="btn btn-teal btn-wide" href="${registryUrl(env)}">${esc(t("openRegistry", lang))}</a>`;
  const shop = `<a class="btn btn-primary btn-wide" href="${shopUrl(env, p)}">${esc(t("buyVia", lang))}</a>`;
  return `<div class="hero-actions">${regFirst ? reg + shop : shop + reg}</div>`;
}

function productCard(p: Product, i: number, env: Env, lang: Lang): string {
  const intel = PRODUCT_INTEL[p.slug]?.[lang];
  const featured = p.registryFirst ? " featured" : "";
  return `<article class="product-card${featured}" data-product-card="${p.slug}">
    <div class="product-meta"><span>${esc(lang === "ar" ? p.eyebrowAr : p.eyebrow)}</span><span>${esc(p.sku)}</span></div>
    <h3 class="headline">${esc(lang === "ar" ? p.titleAr : p.title)}</h3>
    <p>${esc(lang === "ar" ? p.summaryAr : p.summary)}</p>
    ${intel ? `<p class="signal"><span>${lang === "ar" ? "إشارة" : "Signal"}</span>${esc(intel.boardLine)}</p>` : ""}
    <div class="price">${esc(p.price)}</div>
    <div class="card-actions">
      <a class="btn" href="/products/${p.slug}?lang=${lang}">${esc(t("readStory", lang))}</a>
      <a class="btn btn-primary" href="${shopUrl(env, p)}">${esc(t("shopify", lang))}</a>
    </div>
  </article>`;
}

function kbCard(a: KBArticle, lang: Lang): string {
  return `<article class="kb-card" style="--accent:${a.accent}">
    <div class="kb-card-meta"><span>${esc(lang === "ar" ? T[a.category as TKey]?.[lang] || a.category : a.category)}</span><span>${esc(a.readTime)}</span></div>
    <h3 class="headline">${esc(lang === "ar" ? a.titleAr : a.title)}</h3>
    <p>${esc(lang === "ar" ? a.excerptAr : a.excerpt)}</p>
    <div class="kb-card-tags">${a.tags.slice(0, 3).map(tg => `<span class="kb-card-tag">${esc(tg)}</span>`).join("")}</div>
    <div class="kb-card-actions">
      <a class="btn" href="/knowledge/${a.slug}?lang=${lang}">${esc(lang === "ar" ? "اقرأ" : "Read")}</a>
      ${a.relatedProducts?.length ? `<a class="btn btn-primary" href="/products/${a.relatedProducts[0]}?lang=${lang}">${esc(t("shopify", lang))}</a>` : ""}
    </div>
  </article>`;
}

function verifyLauncher(env: Env, lang: Lang): string {
  const reg = registryUrl(env);
  return `<form class="verify-launcher" data-verify-form data-registry="${esc(reg)}">
    <label for="spid">${esc(t("verifyLabel", lang))}</label>
    <div>
      <input id="spid" name="spid" value="BS-P-000001" autocomplete="off" spellcheck="false" dir="ltr" />
      <button class="btn btn-teal" type="submit">${esc(t("verifyBtn", lang))}</button>
    </div>
    <div class="verify-result" data-verify-result role="status" aria-live="polite"></div>
    <small>${esc(t("verifyHelp", lang))}</small>
  </form>`;
}

function archSection(env: Env, lang: Lang): string {
  return `<section id="architecture" class="section">
    <div class="section-head">
      <p class="eyebrow">${esc(t("archEyebrow", lang))}</p>
      <h2 class="section-title headline">${esc(t("archTitle", lang))}</h2>
      <p class="section-copy">${esc(t("archCopy", lang))}</p>
    </div>
    <div class="architecture-map">
      <article class="system-node"><span>01</span><h3>identity.brainsait.org</h3><p>${lang === "ar" ? "متجر رئيسي ومركز معرفة وقصص منتجات وSEO." : "Landing store, knowledge hub, product stories, SEO."}</p></article>
      <article class="system-node"><span>02</span><h3>id.brainsait.org</h3><p>${lang === "ar" ? "سداد Shopify وفواتير وMyFatoorah وتجارة SKU." : "Shopify checkout, invoices, MyFatoorah, SKU commerce."}</p></article>
      <article class="system-node registry"><span>03</span><h3>registry.brainsait.org</h3><p>${lang === "ar" ? "سجلات المزودين وبحث SPID/OID والتحقق." : "Provider records, SPID/OID lookup, verification."}</p></article>
      <article class="system-node"><span>04</span><h3>oid-line Worker</h3><p>${lang === "ar" ? "استيفاء Webhooks وQR ووكيل التحقق وحالة KV." : "Webhook fulfillment, QR, verify proxy, KV status."}</p></article>
      <div class="architecture-spine"><b>1.3.6.1.4.1.61026</b><span>${lang === "ar" ? "جذر هوية المؤسسة" : "Enterprise identity root"}</span></div>
    </div>
  </section>`;
}

function pathfinderSection(env: Env, lang: Lang): string {
  const first = SEGMENTS[0];
  const fp = findProduct(first.product) || featuredProduct;
  return `<section id="pathfinder" class="section">
    <div class="pathfinder" data-pathfinder>
      <div>
        <p class="eyebrow">${esc(t("pathfinderEyebrow", lang))}</p>
        <h2 class="headline">${esc(t("pathfinderTitle", lang))}</h2>
        <p>${esc(t("pathfinderCopy", lang))}</p>
        <div class="segment-grid" role="tablist">
          ${SEGMENTS.map((s, i) => `<button type="button" class="segment ${i === 0 ? "active" : ""}" data-segment="${s.id}" data-product="${s.product}" aria-pressed="${i === 0}">${esc(s.label[lang])}</button>`).join("")}
        </div>
      </div>
      <aside class="recommendation" data-pathfinder-output>
        <span>${lang === "ar" ? "الخطوة الأولى الموصى بها" : "Recommended first move"}</span>
        <h3>${esc(lang === "ar" ? fp.titleAr : fp.title)}</h3>
        <p>${esc(first.line[lang])}</p>
        <div class="card-actions">
          <a class="btn" data-story-link href="/products/${fp.slug}?lang=${lang}">${esc(t("readStory", lang))}</a>
          <a class="btn btn-primary" data-shop-link href="${shopUrl(env, fp)}">${esc(t("shopify", lang))}</a>
          <a class="btn btn-teal" href="${registryUrl(env)}">${esc(t("ctaRegistry", lang))}</a>
        </div>
      </aside>
    </div>
  </section>`;
}

const OID_TREE: { arc: string; label: Record<Lang, string>; children?: { arc: string; label: Record<Lang, string>; product?: string }[] }[] = [
  { arc: ".2", label: { ar: "العمليات الجغرافية", en: "Geographic Operations" }, children: [
    { arc: ".2.3", label: { ar: "الممارسون", en: "Practitioners" } },
    { arc: ".2.4", label: { ar: "المنشآت", en: "Facilities" } },
  ] },
  { arc: ".3", label: { ar: "شؤون المنظمة", en: "Organization" } },
  { arc: ".4", label: { ar: "المنتجات والخدمات", en: "Products & Services" } },
  { arc: ".5", label: { ar: "البنية التحتية", en: "Infrastructure" } },
  { arc: ".6", label: { ar: "جذر الشارات الصحية", en: "Healthcare Badge Root" }, children: [
    { arc: ".6.1", label: { ar: "شارات الممارسين", en: "Practitioner badges" }, product: "oid-verification-badge" },
    { arc: ".6.2", label: { ar: "الأنظمة الطبية", en: "Medical systems" }, product: "fhir-integration-platform" },
    { arc: ".6.3", label: { ar: "أجهزة IoT والوكلاء", en: "IoT devices & agents" } },
  ] },
  { arc: ".7", label: { ar: "وكلاء الذكاء الاصطناعي", en: "AI Agents" } },
  { arc: ".14", label: { ar: "تجارة خط OID", en: "OID LINE Commerce" }, children: [
    { arc: ".14.1", label: { ar: "شارة التحقق", en: "Verification Badge" }, product: "oid-verification-badge" },
    { arc: ".14.2", label: { ar: "مقعد المستكشف", en: "Explorer Seat" }, product: "registry-explorer-seat" },
    { arc: ".14.3", label: { ar: "منصة FHIR", en: "FHIR Platform" }, product: "fhir-integration-platform" },
    { arc: ".14.4", label: { ar: "حزمة NPHIES", en: "NPHIES Bundle" }, product: "nphies-identity-bundle" },
    { arc: ".14.5", label: { ar: "ترخيص النطاق", en: "Namespace License" }, product: "enterprise-namespace-license" },
    { arc: ".14.6", label: { ar: "العلامة البيضاء", en: "White-Label" }, product: "white-label-enterprise" },
  ] },
  { arc: ".16", label: { ar: "سجل المزودين", en: "Provider Registry" }, children: [
    { arc: ".16.x", label: { ar: "سجلات المزودين والمنشآت", en: "Provider & facility records" }, product: "provider-registry" },
  ] },
];

function oidExplorer(env: Env, lang: Lang): string {
  const root = "1.3.6.1.4.1.61026";
  return `<div class="oid-explorer">
    <div class="oid-node open" data-oid-node>
      <div class="oid-node-head" data-oid-toggle role="button" tabindex="0" aria-expanded="true">
        <span class="oid-toggle">›</span>
        <span class="oid-label">${root}</span>
        <span class="oid-desc">${lang === "ar" ? "برينسايت — IANA PEN 61026" : "BrainSAIT — IANA PEN 61026"}</span>
      </div>
      <div class="oid-children">
        ${OID_TREE.map((n) => `
        <div class="oid-node" data-oid-node>
          <div class="oid-node-head" data-oid-toggle role="button" tabindex="0" aria-expanded="false">
            <span class="oid-toggle">›</span>
            <span class="oid-label">${root}${n.arc}</span>
            <span class="oid-desc">${esc(n.label[lang])}</span>
          </div>
          ${n.children?.length ? `<div class="oid-children">${n.children.map((c) => `
            <div class="oid-leaf">
              <span class="oid-label">${root}${c.arc}</span>
              <span class="oid-desc">${esc(c.label[lang])}</span>
              ${c.product ? `<a class="oid-link" href="/products/${c.product}?lang=${lang}">→ ${lang === "ar" ? "المنتج" : "product"}</a>` : ""}
            </div>`).join("")}</div>` : ""}
        </div>`).join("")}
      </div>
    </div>
  </div>`;
}

function kbSearchBox(lang: Lang): string {
  return `<div class="kb-search">
    <input type="search" data-kb-search placeholder="${lang === "ar" ? "ابحث في قاعدة المعرفة…" : "Search the knowledge base…"}" aria-label="${lang === "ar" ? "بحث" : "Search"}" autocomplete="off" />
    <div class="kb-search-results" data-kb-results></div>
  </div>`;
}

function faqSection(faqs: { q: string; a: string }[], lang: Lang): string {
  return `<section class="section">
    <div class="section-head">
      <p class="eyebrow">${lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}</p>
      <h2 class="section-title headline">${lang === "ar" ? "أسئلة يطرحها المشترون الأذكياء." : "Questions smart buyers ask."}</h2>
    </div>
    <div class="faq-list">
      ${faqs.map((f) => `<div class="faq-item" data-faq>
        <button class="faq-q" data-faq-btn type="button"><span>${esc(f.q)}</span><span class="faq-icon">+</span></button>
        <div class="faq-a">${esc(f.a)}</div>
      </div>`).join("")}
    </div>
  </section>`;
}

function compareTable(lang: Lang): string {
  const rows: { label: Record<Lang, string>; vals: string[] }[] = [
    { label: { ar: "السعر", en: "Price" }, vals: PRODUCTS.map((p) => p.price) },
    { label: { ar: "فرع OID", en: "OID branch" }, vals: PRODUCTS.map((p) => p.oid) },
    { label: { ar: "الجمهور", en: "Audience" }, vals: PRODUCTS.map((p) => (lang === "ar" ? p.fitAr : p.fit).slice(0, 2).join("، ")) },
  ];
  return `<section class="section">
    <div class="section-head">
      <p class="eyebrow">${lang === "ar" ? "مقارنة" : "Compare"}</p>
      <h2 class="section-title headline">${lang === "ar" ? "قارن خط OID جنباً إلى جنب." : "Compare the OID Line side by side."}</h2>
    </div>
    <div class="compare-wrap"><table class="compare-table">
      <thead><tr><th></th>${PRODUCTS.map((p) => `<th><a href="/products/${p.slug}?lang=${lang}">${esc(lang === "ar" ? p.titleAr : p.title)}</a></th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${esc(r.label[lang])}</td>${r.vals.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>
  </section>`;
}

function clientScript(env: Env, lang: Lang): string {
  const data = JSON.stringify({ registry: registryUrl(env), products: PRODUCTS.map(p => ({ slug: p.slug, title: lang === "ar" ? p.titleAr : p.title, shop: shopUrl(env, p) })), segments: SEGMENTS.map(s => ({ id: s.id, product: s.product, line: s.line[lang] })), kb: KB_ARTICLES.map(a => ({ slug: a.slug, title: lang === "ar" ? a.titleAr : a.title, titleAr: a.titleAr, category: a.category, readTime: a.readTime, tags: a.tags.join(" "), excerpt: lang === "ar" ? a.excerptAr : a.excerpt })) });
  return `<script type="application/json" id="identity-data">${data.replace(/</g, "\\u003c")}</script>
<script>
(()=>{
const d=JSON.parse(document.getElementById("identity-data").textContent||"{}");
const ps=new Map((d.products||[]).map(p=>[p.slug,p]));
const ss=new Map((d.segments||[]).map(s=>[s.id,s]));
document.querySelectorAll("[data-pathfinder]").forEach(r=>{
  const o=r.querySelector("[data-pathfinder-output]"),sl=r.querySelector("[data-story-link]"),sh=r.querySelector("[data-shop-link]"),bs=Array.from(r.querySelectorAll("[data-segment]"));
  const set=b=>{const s=ss.get(b.dataset.segment||"");if(!s||!o)return;const p=ps.get(s.product);bs.forEach(i=>{const a=i===b;i.classList.toggle("active",a);i.setAttribute("aria-pressed",String(a))});if(p){const t=o.querySelector("h3"),c=o.querySelector("p");if(t)t.textContent=p.title;if(c)c.textContent=s.line;if(sl)sl.href="/products/"+p.slug;if(sh)sh.href=p.shop}};
  bs.forEach(b=>b.addEventListener("click",()=>set(b)));
});
document.querySelectorAll("[data-verify-form]").forEach(f=>{
  const box=f.querySelector("[data-verify-result]");
  const reg=f.getAttribute("data-registry")||d.registry||"https://registry.brainsait.org";
  f.addEventListener("submit",e=>{
    e.preventDefault();
    const i=f.querySelector("input[name=spid]"),v=i&&i.value.trim()?i.value.trim():"BS-P-000001";
    if(!box){window.open(reg+"/api/verify/"+encodeURIComponent(v),"_blank","noopener,noreferrer");return}
    box.className="verify-result show loading";box.innerHTML="…";
    fetch(reg+"/api/verify/"+encodeURIComponent(v),{headers:{"Accept":"application/json"}})
      .then(r=>r.json().then(j=>({ok:r.ok,j:j})).catch(()=>({ok:r.ok,j:null})))
      .then(res=>{
        if(res.ok&&res.j&&!res.j.error){
          const verified=res.j.verification_status==="verified";
          box.className="verify-result show "+(verified?"verified":"notfound");
          box.innerHTML="<b>"+(verified?"✓ Verified":"◐ Found — "+(res.j.verification_status||"pending"))+"</b><small><code>"+v+"</code>"+(res.j.oid?" · <code>"+res.j.oid+"</code>":"")+"</small>";
        }else{
          box.className="verify-result show notfound";
          box.innerHTML="<b>◐ Not in registry</b><small><code>"+v+"</code> — no record returned. <a href='"+reg+"' target='_blank' rel='noopener'>Open registry →</a></small>";
        }
      })
      .catch(()=>{
        box.className="verify-result show error";
        box.innerHTML="<b>✕ Registry unreachable</b><small><a href='"+reg+"/api/verify/"+encodeURIComponent(v)+"' target='_blank' rel='noopener'>Try direct link →</a></small>";
      });
  });
});
document.querySelectorAll("[data-oid-toggle]").forEach(h=>{h.addEventListener("click",()=>{const n=h.closest("[data-oid-node]");if(n)n.classList.toggle("open")})});
(function(){
  const idx=(d.kb||[]);const box=document.querySelector("[data-kb-search]");const out=document.querySelector("[data-kb-results]");
  if(!box||!out)return;
  box.addEventListener("input",()=>{
    const q=box.value.trim().toLowerCase();
    if(q.length<2){out.classList.remove("show");out.innerHTML="";return}
    const hits=idx.filter(a=>(a.title+" "+a.titleAr+" "+a.tags+" "+a.excerpt).toLowerCase().includes(q)).slice(0,6);
    if(!hits.length){out.classList.add("show");out.innerHTML="<span class='kb-search-item'><span>No matches</span></span>";return}
    out.classList.add("show");
    out.innerHTML=hits.map(h=>"<a class='kb-search-item' href='/knowledge/"+h.slug+"'><b>"+h.title+"</b><span>"+h.category+" · "+h.readTime+"</span></a>").join("");
  });
  document.addEventListener("click",e=>{if(!e.target.closest(".kb-search"))out.classList.remove("show")});
})();
})();
</script>`;
}

// ── Pages ──
function renderHome(env: Env, lang: Lang): Response {
  const cards = PRODUCTS.map((p, i) => productCard(p, i, env, lang)).join("");
  const latest = KB_ARTICLES[0];
  return html(`<section class="hero">
    <div>
      <p class="eyebrow">${esc(t("heroEyebrow", lang))}</p>
      <h1 class="display">${esc(t("heroTitle", lang))}</h1>
      <p class="lead">${esc(t("heroLead", lang))}</p>
      ${btnRow(env, lang, featuredProduct, true)}
      <div class="trust-strip"><span class="pill">${DEFAULT_ROOT}</span><span class="pill">SPID</span><span class="pill">FHIR R4</span><span class="pill">NPHIES</span><span class="pill">BIAL</span></div>
      ${verifyLauncher(env, lang)}
    </div>
  </section>
  <section id="registry" class="section">
    <div class="feature-band">
      <div>
        <p class="eyebrow">${esc(t("registryEyebrow", lang))}</p>
        <h2 class="headline">${esc(t("registryTitle", lang))}</h2>
        <p class="arabic-line" dir="rtl">${esc(t("registryAr", lang))}</p>
        <p class="feature-copy">${esc(t("registryLead", lang))}</p>
        ${btnRow(env, lang, featuredProduct, true)}
      </div>
      <div class="feature-panel">
        <ul>
          <li>${lang === "ar" ? "ملفات مزودين ومنشآت قابلة للبحث" : "Searchable practitioner and facility profiles"}</li>
          <li>${lang === "ar" ? "إسناد SPID وهوية OID" : "SPID and OID identity assignment"}</li>
          <li>${lang === "ar" ? "مسارات QR والتحقق العام" : "QR and public verification paths"}</li>
          <li>${lang === "ar" ? "أساس لـ FHIR وDID وNPHIES والنطاقات المؤسسية" : "Foundation for FHIR, DID, NPHIES, and enterprise namespaces"}</li>
        </ul>
      </div>
    </div>
  </section>
  ${archSection(env, lang)}
  ${pathfinderSection(env, lang)}
  <section class="section">
    <div class="section-head">
      <p class="eyebrow">${esc(t("kbEyebrow", lang))}</p>
      <h2 class="section-title headline">${esc(t("kbTitle", lang))}</h2>
      <p class="section-copy">${esc(t("kbCopy", lang))}</p>
    </div>
    <div class="kb-featured" style="--accent:${latest.accent}">
      <div>
        <div class="kb-featured-meta"><span class="pill">${KB_ARTICLES.length} ${esc(t("hubArticles", lang))}</span><span class="pill">${KB_CATEGORIES.length - 1} ${esc(t("hubPillars", lang))}</span></div>
        <h2 class="headline">${esc(lang === "ar" ? latest.titleAr : latest.title)}</h2>
        <p>${esc(lang === "ar" ? latest.excerptAr : latest.excerpt)}</p>
        <p class="kb-featured-quote">${esc(lang === "ar" ? latest.heroQuoteAr : latest.heroQuote)}</p>
      </div>
      <div class="kb-featured-side">
        <span class="pill">${esc(t("hubFeatured", lang))}</span>
        <p class="section-copy">${KB_ARTICLES.length} ${esc(t("hubArticles", lang))} · ${esc(t("kbExplore", lang))}</p>
        <a class="btn btn-primary" href="/knowledge?lang=${lang}">${esc(t("kbExplore", lang))}</a>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="section-head">
      <p class="eyebrow">${esc(t("productsEyebrow", lang))}</p>
      <h2 class="section-title headline">${esc(t("productsTitle", lang))}</h2>
    </div>
    <div class="product-grid">${cards}</div>
  </section>
  <section class="section">
    <div class="story-grid">
      <div class="story-tile"><b>1. ${esc(t("method1", lang))}</b><p>${lang === "ar" ? "تحديد الشخص والمنشأة والدور والخدمة والاعتماد ونقطة النهاية." : "Capture the person, facility, role, service, credential, and endpoint."}</p></div>
      <div class="story-tile"><b>2. ${esc(t("method2", lang))}</b><p>${lang === "ar" ? "إسناد SPID وهوية مدعومة بـ OID تحت جذر برينسايت المؤسسي." : "Issue SPID and OID-backed structure under the BrainSAIT enterprise root."}</p></div>
      <div class="story-tile"><b>3. ${esc(t("method3", lang))}</b><p>${lang === "ar" ? "كشف السجل العام وتحقق QR وحالة الثقة." : "Expose public registry, QR verification, and trust status."}</p></div>
      <div class="story-tile"><b>4. ${esc(t("method4", lang))}</b><p>${lang === "ar" ? "التوسع في FHIR وNPHIES وDID والنطاقات والعلامة التجارية." : "Extend into FHIR, NPHIES, DID, namespace, and white-label journeys."}</p></div>
    </div>
  </section>
  ${faqSection(FAQS[lang], lang)}
  ${closingSection(env, lang)}`, env, lang, { path: "/", jsonLd: [faqJsonLd(FAQS[lang])] });
}

const FAQS: Record<Lang, { q: string; a: string }[]> = {
  ar: [
    { q: "ما هو OID ولماذا يهم في الرعاية الصحية؟", a: "معرف الكائن (OID) هو عنوان رقمي فريد وهرمي يضمن عدم التداخل بين الأقسام والموظفين والأجهزة. في الرعاية الصحية، يربط الشخص والترخيص والمنشأة والخدمة في بنية واحدة قابلة للتحقق." },
    { q: "ما الفرق بين SPID وOID؟", a: "SPID هو معرف المزود القابل للقراءة البشرية (مثل BS-P-000001)، بينما OID هو العنوان الهرمي الآلي (مثل 1.3.6.1.4.1.61026.14.1). يعملان معاً: SPID للبشر، OID للأنظمة." },
    { q: "كيف أشتري منتجات الهوية؟", a: "تعرّف على المنتج هنا، ثم أكمل الشراء عبر متجر Shopify على id.brainsait.org. بعد الدفع، تُستوفى الطلبات عبر webhooks وتظهر السجلات في registry.brainsait.org." },
    { q: "هل التحقق من برينسايت يستبدل الترخيص الرسمي؟", a: "لا. تحقق برينسايت يضيف طبقة ثقة وتشغيل وربط. الجهات الرسمية مثل SCFHS تبقى مرجع الترخيص المستقل." },
    { q: "ما هو BIAL؟", a: "مستوى ضمان الهوية من برينسايت: H0 غير موثق، H1 مسجل، H2 موثق. يظهر المستوى في كل استجابة تحقق." },
  ],
  en: [
    { q: "What is an OID and why does it matter in healthcare?", a: "An Object Identifier (OID) is a unique hierarchical digital address that prevents collisions between departments, staff, and devices. In healthcare it binds person, license, facility, and service into one verifiable structure." },
    { q: "What is the difference between SPID and OID?", a: "SPID is the human-readable provider ID (e.g. BS-P-000001); OID is the machine hierarchical address (e.g. 1.3.6.1.4.1.61026.14.1). They work together: SPID for humans, OID for systems." },
    { q: "How do I buy identity products?", a: "Learn the product here, then complete purchase via the Shopify store on id.brainsait.org. After payment, webhooks fulfill orders and records appear in registry.brainsait.org." },
    { q: "Does BrainSAIT verification replace official licensure?", a: "No. BrainSAIT verification adds a trust, operations, and connection layer. Official authorities such as SCFHS remain the independent licensing source." },
    { q: "What is BIAL?", a: "BrainSAIT Identity Assurance Level: H0 unverified, H1 registered, H2 verified. The level appears in every verification response." },
  ],
};

function closingSection(env: Env, lang: Lang): string {
  return `<section class="closing">
    <p class="eyebrow">${esc(t("closingEyebrow", lang))}</p>
    <h2 class="headline">${esc(t("closingTitle", lang))}</h2>
    <p>${esc(t("closingCopy", lang))}</p>
    ${btnRow(env, lang, featuredProduct, true)}
  </section>`;
}

function renderKnowledgeHub(env: Env, lang: Lang): Response {
  const featured = KB_ARTICLES[0];
  const catLabel: Record<string, Record<Lang, string>> = {
    all: { ar: "كل المعرفة", en: "All Knowledge" },
    foundations: { ar: "الأساسيات", en: "Foundations" },
    architecture: { ar: "العمارة", en: "Architecture" },
    guides: { ar: "الأدلة", en: "Guides" },
    philosophy: { ar: "الفلسفة", en: "Philosophy" },
    media: { ar: "الوسائط", en: "Media" },
  };
  return html(`<section class="kb-hub-hero">
    <p class="eyebrow">${esc(t("kbEyebrow", lang))}</p>
    <h1 class="display">${esc(t("kbTitle", lang))}</h1>
    <p class="lead">${esc(t("kbCopy", lang))}</p>
    <div class="kb-pillars">${KB_CATEGORIES.map(c => `<a class="kb-pill" href="/knowledge?category=${c.id}&lang=${lang}">${esc(catLabel[c.id]?.[lang] || c.label)}</a>`).join("")}</div>
  </section>
  <div class="kb-stats">
    <div class="kb-stat"><span class="kb-stat-number">${KB_ARTICLES.length}</span><span class="kb-stat-label">${esc(t("hubArticles", lang))}</span></div>
    <div class="kb-stat"><span class="kb-stat-number">${KB_CATEGORIES.length - 1}</span><span class="kb-stat-label">${esc(t("hubPillars", lang))}</span></div>
    <div class="kb-stat"><span class="kb-stat-number">6</span><span class="kb-stat-label">${esc(t("hubTexts", lang))}</span></div>
    <div class="kb-stat"><span class="kb-stat-number">4</span><span class="kb-stat-label">${esc(t("hubMedia", lang))}</span></div>
  </div>
  <div class="kb-featured" style="--accent:${featured.accent}">
    <div>
      <div class="kb-featured-meta"><span class="pill">${esc(featured.category)}</span><span class="pill">${esc(featured.readTime)}</span><span class="pill">${esc(featured.pillar)}</span></div>
      <h2 class="headline">${esc(lang === "ar" ? featured.titleAr : featured.title)}</h2>
      <p>${esc(lang === "ar" ? featured.excerptAr : featured.excerpt)}</p>
      <p class="kb-featured-quote">${esc(lang === "ar" ? featured.heroQuoteAr : featured.heroQuote)}</p>
    </div>
    <div class="kb-featured-side">
      <span class="eyebrow">${esc(t("hubFeatured", lang))}</span>
      <p class="section-copy">${esc(lang === "ar" ? featured.excerptAr : featured.excerpt)}</p>
      <a class="btn btn-primary" href="/knowledge/${featured.slug}?lang=${lang}">${esc(lang === "ar" ? "اقرأ المقال" : "Read Article")}</a>
    </div>
  </div>
  <section class="section">
    <div class="section-head"><p class="eyebrow">${esc(lang === "ar" ? "كل المقالات" : "All Articles")}</p><h2 class="section-title headline">${esc(t("kbTitle", lang))}</h2></div>
    ${kbSearchBox(lang)}
    <div class="kb-grid">${KB_ARTICLES.map(a => kbCard(a, lang)).join("")}</div>
  </section>
  ${closingSection(env, lang)}`, env, lang, { title: lang === "ar" ? "مركز المعرفة | هوية برينسايت" : "Knowledge Hub | BrainSAIT Identity", path: "/knowledge" });
}

function renderKBArticle(article: KBArticle, env: Env, lang: Lang): Response {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return html(`<section class="kb-article-hero">
    <div class="breadcrumb"><a href="/?lang=${lang}">${lang === "ar" ? "الرئيسية" : "Home"}</a><span>/</span><a href="/knowledge?lang=${lang}">${esc(t("navKnowledge", lang))}</a><span>/</span><span>${esc(lang === "ar" ? article.titleAr : article.title)}</span></div>
    <p class="eyebrow">${esc(article.pillar)}</p>
    <h1 class="headline">${esc(lang === "ar" ? article.titleAr : article.title)}</h1>
    <p class="lead" dir="${dir}">${esc(lang === "ar" ? article.titleAr : article.title)}</p>
    <div class="kb-article-meta">
      <span class="pill">${esc(article.category)}</span>
      <span class="pill">${esc(article.readTime)}</span>
      ${article.tags.slice(0, 3).map(tg => `<span class="pill">${esc(tg)}</span>`).join("")}
    </div>
    <div style="margin-top:1rem;padding:.9rem;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--bg-card);">
      <p style="margin:0;color:var(--gold-soft);font-family:Aref Ruqaa,serif;font-size:clamp(.96rem,1.8vw,1.2rem);line-height:1.6;">${esc(lang === "ar" ? article.heroQuoteAr : article.heroQuote)}</p>
    </div>
  </section>
  ${article.content}
  ${article.media?.length ? `<section class="section">
    <div class="section-head"><p class="eyebrow">${esc(t("associatedMedia", lang))}</p></div>
    <div class="kb-media-grid">${article.media.map(m => `<a class="kb-media-card" href="${esc(m.src)}" target="_blank" rel="noopener">
      <div class="kb-media-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${m.type === "video" ? '<polygon points="5 3 19 12 5 21 5 3"></polygon>' : m.type === "audio" ? '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>' : '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>'}</svg></div>
      <h3>${esc(lang === "ar" ? m.labelAr : m.label)}</h3>
      <p dir="ltr" style="font-size:.72rem;opacity:.7;">${esc(m.src.split("/").pop() || "")}</p>
      <span class="kb-media-badge">${esc(m.type)} · ${lang === "ar" ? "فتح" : "open"} ↗</span>
    </a>`).join("")}</div>
  </section>` : ""}
  ${article.relatedProducts?.length ? `<section class="section">
    <div class="section-head"><p class="eyebrow">${esc(t("relatedProducts", lang))}</p><h2 class="section-title headline">${esc(t("turnKnowledge", lang))}</h2></div>
    <div class="product-grid">${article.relatedProducts.map(slug => { const p = findProduct(slug); return p ? productCard(p, 0, env, lang) : ""; }).join("")}</div>
  </section>` : ""}
  ${closingSection(env, lang)}`, env, lang, { title: `${lang === "ar" ? article.titleAr : article.title} | BrainSAIT`, description: lang === "ar" ? article.excerptAr : article.excerpt, path: `/knowledge/${article.slug}`, jsonLd: [articleJsonLd(article, lang, `/knowledge/${article.slug}`), ...mediaJsonLd(article, lang), breadcrumbJsonLd([{ name: lang === "ar" ? "الرئيسية" : "Home", path: "/" }, { name: lang === "ar" ? "المعرفة" : "Knowledge", path: "/knowledge" }, { name: lang === "ar" ? article.titleAr : article.title, path: `/knowledge/${article.slug}` }])] });
}

function renderProducts(env: Env, lang: Lang): Response {
  return html(`<section class="product-hero">
    <p class="eyebrow">${esc(t("productsEyebrow", lang))}</p>
    <h1 class="display">${esc(t("productsTitle", lang))}</h1>
    <p class="lead">${esc(t("productsCopy", lang))}</p>
  </section>
  ${pathfinderSection(env, lang)}
  <section class="product-grid">${PRODUCTS.map((p, i) => productCard(p, i, env, lang)).join("")}</section>
  ${compareTable(lang)}
  ${faqSection(FAQS[lang].slice(0, 3), lang)}
  ${closingSection(env, lang)}`, env, lang, { title: lang === "ar" ? "المنتجات | هوية برينسايت" : "Products | BrainSAIT Identity", path: "/products", jsonLd: PRODUCTS.map((p) => productJsonLd(p, lang)) });
}

function renderArchitecturePage(env: Env, lang: Lang): Response {
  return html(`<section class="product-hero">
    <div class="breadcrumb"><a href="/?lang=${lang}">${lang === "ar" ? "الرئيسية" : "Home"}</a><span>/</span><span>${esc(t("navArchitecture", lang))}</span></div>
    <p class="eyebrow">${esc(t("archEyebrow", lang))}</p>
    <h1 class="display">${esc(t("archTitle", lang))}</h1>
    <p class="lead">${esc(t("archCopy", lang))}</p>
  </section>
  ${archSection(env, lang)}
  <section class="section">
    <div class="section-head">
      <p class="eyebrow">${lang === "ar" ? "مستكشف OID" : "OID Explorer"}</p>
      <h2 class="section-title headline">${lang === "ar" ? "استكشف شجرة المعرفات تفاعلياً." : "Explore the identifier tree interactively."}</h2>
      <p class="section-copy">${lang === "ar" ? "انقر على أي فرع لتوسيعه. الفروع المرتبطة بالمنتجات تقود مباشرة إلى صفحة المنتج." : "Click any branch to expand it. Branches linked to products lead directly to the product page."}</p>
    </div>
    ${oidExplorer(env, lang)}
  </section>
  ${closingSection(env, lang)}`, env, lang, { title: lang === "ar" ? "العمارة | هوية برينسايت" : "Architecture | BrainSAIT Identity", path: "/architecture" });
}

function renderProduct(p: Product, env: Env, lang: Lang): Response {
  const intel = PRODUCT_INTEL[p.slug]?.[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  return html(`<section class="product-hero">
    <div class="breadcrumb"><a href="/?lang=${lang}">${lang === "ar" ? "الرئيسية" : "Home"}</a><span>/</span><a href="/products?lang=${lang}">${esc(t("navProducts", lang))}</a><span>/</span><span>${esc(lang === "ar" ? p.titleAr : p.title)}</span></div>
    <div class="product-layout">
      <article class="product-main">
        <p class="eyebrow">${esc(lang === "ar" ? p.eyebrowAr : p.eyebrow)}</p>
        <h1 class="headline">${esc(lang === "ar" ? p.titleAr : p.title)}</h1>
        <p class="product-story">${esc(lang === "ar" ? p.storyAr : p.story)}</p>
        ${intel ? `<div class="dossier-strip"><b>${esc(intel.boardLine)}</b><span>${esc(intel.asset)}</span></div>` : ""}
      </article>
      <aside class="buy-box">
        <span class="pill">${esc(p.sku)}</span>
        <div class="price">${esc(p.price)}</div>
        <p class="section-copy">${esc(lang === "ar" ? p.promiseAr : p.promise)}</p>
        <div class="buy-actions">
          <a class="btn btn-primary" href="${shopUrl(env, p)}">${esc(t("buyVia", lang))}</a>
          <a class="btn btn-teal" href="${registryUrl(env)}">${esc(t("openRegistry", lang))}</a>
          <a class="btn" href="/products?lang=${lang}">${esc(t("compare", lang))}</a>
        </div>
        <div class="spec-row"><span>${esc(t("oidBranch", lang))}</span><strong>${esc(p.oid)}</strong></div>
        <div class="spec-row"><span>${esc(t("timeline", lang))}</span><strong>${esc(lang === "ar" ? p.timelineAr : p.timeline)}</strong></div>
      </aside>
    </div>
  </section>
  <section class="detail-grid">
    ${detailPanel(t("whoFor", lang), lang === "ar" ? p.fitAr : p.fit)}
    ${detailPanel(t("whatYouGet", lang), lang === "ar" ? p.outcomesAr : p.outcomes)}
    ${detailPanel(t("proofPoints", lang), lang === "ar" ? p.proofAr : p.proof)}
  </section>
  ${intel ? `<section class="section dossier">
    <div class="panel dossier-panel"><span>${esc(t("hiddenRisk", lang))}</span><h2>${esc(intel.risk)}</h2></div>
    <div class="panel dossier-panel"><span>${esc(t("assetCreated", lang))}</span><h2>${esc(intel.asset)}</h2></div>
    <div class="panel dossier-panel"><span>${esc(t("nextMove", lang))}</span><h2>${esc(intel.nextMove)}</h2></div>
  </section>` : ""}
  <section class="section">
    <div class="runway">
      ${[t("learnStep", lang), t("buyStep", lang), t("captureStep", lang), t("fulfillStep", lang), t("verifyStep", lang)].map((step, i) => `<div class="runway-step"><span>${String(i + 1).padStart(2, "0")}</span><b>${esc(step)}</b><p>${runwayCopy(step, p, lang)}</p></div>`).join("")}
    </div>
  </section>
  ${faqSection(FAQS[lang].slice(2, 5), lang)}
  ${closingSection(env, lang)}`, env, lang, { title: `${lang === "ar" ? p.titleAr : p.title} | BrainSAIT`, path: `/products/${p.slug}`, jsonLd: [productJsonLd(p, lang), breadcrumbJsonLd([{ name: lang === "ar" ? "الرئيسية" : "Home", path: "/" }, { name: lang === "ar" ? "المنتجات" : "Products", path: "/products" }, { name: lang === "ar" ? p.titleAr : p.title, path: `/products/${p.slug}` }])] });
}

function detailPanel(title: string, items: string[]): string {
  return `<article class="panel"><h2>${esc(title)}</h2><ul class="clean-list">${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></article>`;
}

function runwayCopy(step: string, p: Product, lang: Lang): string {
  const ar: Record<string, string> = { "تعرّف": `افهم لماذا يوجد ${p.titleAr} وأين يقع في منظومة الهوية.`, "اشترِ": `انقل القصد عبر Shopify باستخدام ${p.sku}.`, "اجمع": "اجمع الأدلة وبيانات المشتري وسياق المنشأة.", "نفّذ": "حوّل الدفع إلى سجل تشغيلي.", "تحقّق": "كشف الإثبات عبر registry.brainsait.org." };
  const en: Record<string, string> = { Learn: `Understand why ${p.title} exists.`, Buy: `Move intent through Shopify using ${p.sku}.`, Capture: "Collect evidence, buyer details, facility context.", Fulfill: "Turn payment into an operational record.", Verify: "Expose proof through registry.brainsait.org." };
  return (lang === "ar" ? ar : en)[step] || (lang === "ar" ? "قدّم نحو التحقق." : "Advance toward verification.");
}

function redirect(location: string, status = 302): Response {
  return new Response(null, { status, headers: { Location: location, "Cache-Control": "public, max-age=120" } });
}

function sitemap(url: URL): Response {
  const o = url.origin;
  const routes = ["/", "/products", "/architecture", "/knowledge", ...PRODUCTS.map(p => `/products/${p.slug}`), ...KB_ARTICLES.map(a => `/knowledge/${a.slug}`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(p => `  <url><loc>${o}${p}</loc></url>`).join("\n")}\n</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

export default {
  fetch(request: Request, env: Env): Response {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";
    const lang = detectLang(url);

    if (path === "/health") return Response.json({ ok: true, service: "brainsait-identity", lang, products: PRODUCTS.length, articles: KB_ARTICLES.length });
    if (path === "/robots.txt") return new Response("User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    if (path === "/sitemap.xml") return sitemap(url);
    if (path === "/shop") return redirect(shopUrl(env));
    if (path === "/registry") return redirect(registryUrl(env));
    if (path === "/") return renderHome(env, lang);
    if (path === "/products") return renderProducts(env, lang);
    if (path === "/architecture") return renderArchitecturePage(env, lang);
    if (path === "/knowledge") return renderKnowledgeHub(env, lang);

    const pm = path.match(/^\/products\/([a-z0-9-]+)$/);
    if (pm) { const p = findProduct(pm[1]); if (p) return renderProduct(p, env, lang); }

    const km = path.match(/^\/knowledge\/([a-z0-9-]+)$/);
    if (km) { const a = findKBArticle(km[1]); if (a) return renderKBArticle(a, env, lang); }

    return html(`<section class="product-hero"><p class="eyebrow">404</p><h1 class="display">${esc(t("notFound", lang))}</h1><p class="lead">${esc(t("notFoundCopy", lang))}</p>${btnRow(env, lang, featuredProduct, true)}</section>`, env, lang, { title: lang === "ar" ? "غير موجود | برينسايت" : "Not found | BrainSAIT", path });
  },
};
