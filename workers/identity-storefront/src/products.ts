export type Product = {
  slug: string;
  sku: string;
  oid: string;
  eyebrow: string;
  eyebrowAr: string;
  title: string;
  titleAr: string;
  price: string;
  handle?: string;
  registryFirst?: boolean;
  summary: string;
  summaryAr: string;
  story: string;
  storyAr: string;
  promise: string;
  promiseAr: string;
  fit: string[];
  fitAr: string[];
  outcomes: string[];
  outcomesAr: string[];
  proof: string[];
  proofAr: string[];
  timeline: string;
  timelineAr: string;
  accent: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "provider-registry",
    sku: "REGISTRY-FEATURED",
    oid: "1.3.6.1.4.1.61026.16",
    eyebrow: "Featured product",
    eyebrowAr: "المنتج الرئيسي",
    title: "BrainSAIT Provider Registry",
    titleAr: "سجل مزودي برينسايت",
    price: "Registry access and onboarding via Shopify",
    handle: "oid-registry-explorer-seat",
    registryFirst: true,
    summary: "The main trust layer for practitioners, facilities, credentials, services, and public verification across the BrainSAIT identity fabric.",
    summaryAr: "طبقة الثقة الرئيسية للممارسين والمنشآت والاعتمادات والخدمات والتحقق العام عبر منظومة هوية برينسايت.",
    story: "Healthcare identity breaks when the person, license, facility, role, endpoint, and proof live in different places. The Provider Registry turns those fragments into a single governed source of truth that humans can search and systems can verify.",
    storyAr: "تتعطل الهوية الصحية عندما يعيش الشخص والترخيص والمنشأة والدور ونقطة النهاية والإثبات في أماكن متفرقة. يحول سجل المزودين هذه الأجزاء إلى مصدر حقيقة واحد محكوم يمكن للإنسان البحث فيه والأنظمة التحقق منه.",
    promise: "One registry for identity, trust, lookup, and healthcare interoperability.",
    promiseAr: "سجل واحد للهوية والثقة والبحث والتشغيل البيني الصحي.",
    fit: ["Hospitals and clinics", "Provider groups", "Digital health platforms", "Credentialing teams"],
    fitAr: ["المستشفيات والعيادات", "مجموعات المزودين", "منصات الصحة الرقمية", "فرق الاعتماد"],
    outcomes: ["Searchable provider profiles", "SPID and OID-backed records", "QR verification journeys", "Governed source of truth for integrations"],
    outcomesAr: ["ملفات مزودين قابلة للبحث", "سجلات مدعومة بـ SPID وOID", "رحلات تحقق QR", "مصدر حقيقة محكوم للتكاملات"],
    proof: ["registry.brainsait.org", "BIAL trust posture", "OID root 1.3.6.1.4.1.61026", "FHIR-ready identity model"],
    proofAr: ["registry.brainsait.org", "موقف ثقة BIAL", "جذر OID 1.3.6.1.4.1.61026", "نموذج هوية جاهز لـ FHIR"],
    timeline: "Launch access in days, then enrich records as teams validate credentials and workflows.",
    timelineAr: "إطلاق الوصول خلال أيام، ثم إثراء السجلات مع تحقق الفرق من الاعتمادات وسير العمل.",
    accent: "#d6b46a",
  },
  {
    slug: "oid-verification-badge",
    sku: "OID-BADGE",
    oid: "1.3.6.1.4.1.61026.14.1",
    eyebrow: "Individual proof",
    eyebrowAr: "إثبات فردي",
    title: "OID Verification Badge",
    titleAr: "شارة التحقق OID",
    price: "SAR 990 monthly or SAR 9,900 annual",
    handle: "oid-verification-badge",
    summary: "A public verification badge for providers who need a clean trust profile, QR proof, and a professional identity link.",
    summaryAr: "شارة تحقق عامة للمزودين الذين يحتاجون ملف ثقة نظيف وإثبات QR ورابط هوية مهني.",
    story: "The badge is the smallest valuable unit in the BrainSAIT identity economy: one professional, one verified profile, one QR journey that can be carried across websites, cards, signatures, and patient-facing material.",
    storyAr: "الشارة هي أصغر وحدة قيمة في اقتصاد هوية برينسايت: مهني واحد وملف موثق ورحلة QR يمكن حملها عبر المواقع والبطاقات والتواقيع والمواد الموجهة للمريض.",
    promise: "Turn a professional name into a trusted, shareable profile.",
    promiseAr: "حوّل اسم المهني إلى ملف موثق وقابل للمشاركة.",
    fit: ["Physicians", "Consultants", "Allied health providers", "Founding members"],
    fitAr: ["الأطباء", "المستشارون", "مقدمو الرعاية الصحية المساعدة", "الأعضاء المؤسسون"],
    outcomes: ["Public verification page", "Badge and QR link", "Directory listing", "Status monitoring"],
    outcomesAr: ["صفحة تحقق عامة", "رابط شارة وQR", "قائمة دليل", "مراقبة الحالة"],
    proof: ["SPID allocation", "OID branch assignment", "Registry lookup", "QR verification"],
    proofAr: ["إسناد SPID", "تعيين فرع OID", "بحث السجل", "تحقق QR"],
    timeline: "Fast onboarding once profile data and supporting references are available.",
    timelineAr: "تسجيل سريع بمجرد توفر بيانات الملف الشخصي والمراجع الداعمة.",
    accent: "#31f4d2",
  },
  {
    slug: "registry-explorer-seat",
    sku: "OID-EXPLORER",
    oid: "1.3.6.1.4.1.61026.14.2",
    eyebrow: "Team access",
    eyebrowAr: "وصول الفريق",
    title: "OID Registry Explorer Seat",
    titleAr: "مقعد مستكشف السجل",
    price: "SAR 24,000 annual",
    handle: "oid-registry-explorer-seat",
    summary: "A facility-level registry seat for searching, auditing, and operationalizing provider identity records.",
    summaryAr: "مقعد سجل على مستوى المنشأة للبحث والتدقيق وتشغيل سجلات هوية المزودين.",
    story: "Once identity becomes operational, teams need more than a profile page. They need dashboards, audit traces, and a controlled way to see which providers, services, facilities, and endpoints are connected.",
    storyAr: "عندما تصبح الهوية تشغيلية، تحتاج الفرق أكثر من صفحة ملف شخصي. تحتاج لوحات متابعة وأثر تدقيق وطريقة مضبوطة لرؤية المزودين والخدمات والمنشآت ونقاط النهاية المتصلة.",
    promise: "A command seat for identity operations, not just browsing.",
    promiseAr: "مقعد قيادة لعمليات الهوية، ليس مجرد تصفح.",
    fit: ["Facility administrators", "Credentialing teams", "Operations teams", "Compliance reviewers"],
    fitAr: ["مسؤولو المنشآت", "فرق الاعتماد", "فرق العمليات", "مراجعو الامتثال"],
    outcomes: ["Facility registry access", "Audit trail visibility", "Provider lookup", "Operational dashboard"],
    outcomesAr: ["وصول سجل المنشأة", "رؤية أثر التدقيق", "بحث المزودين", "لوحة متابعة تشغيلية"],
    proof: ["Facility gate", "Audit trail", "Dashboard view", "OID-linked records"],
    proofAr: ["بوابة المنشأة", "أثر التدقيق", "عرض لوحة المتابعة", "سجلات مرتبطة بـ OID"],
    timeline: "Typically provisioned after facility identity and buyer authorization are confirmed.",
    timelineAr: "يُ provision عادةً بعد تأكيد هوية المنشأة وترخيص المشتري.",
    accent: "#65dcff",
  },
  {
    slug: "fhir-integration-platform",
    sku: "OID-FHIR",
    oid: "1.3.6.1.4.1.61026.14.3",
    eyebrow: "Interoperability",
    eyebrowAr: "التشغيل البيني",
    title: "OID FHIR Integration Platform",
    titleAr: "منصة تكامل OID مع FHIR",
    price: "SAR 120,000 one time",
    handle: "oid-fhir-integration-platform",
    summary: "FHIR-ready identity mapping for systems that need practitioners, organizations, endpoints, and credentials to resolve cleanly.",
    summaryAr: "خرائط هوية جاهزة لـ FHIR للأنظمة التي تحتاج حل المزودين والمؤسسات ونقاط النهاية والاعتمادات بوضوح.",
    story: "FHIR integration fails quietly when identifiers are ambiguous. This platform anchors Practitioner, Organization, Location, Endpoint, and related resources to an OID-backed identity map before data moves.",
    storyAr: "يفشل تكامل FHIR بصمت عندما تكون المعرفات غامحة. هذه المنصة ترسي موارد Practitioner وOrganization وLocation وEndpoint إلى خريطة هوية مدعومة بـ OID قبل انتقال البيانات.",
    promise: "Make healthcare data exchange identity-aware before it becomes expensive.",
    promiseAr: "اجعل تبادل البيانات الصحية مدركاً للهوية قبل أن يصبح مكلفاً.",
    fit: ["HIS vendors", "Integration teams", "FHIR gateway owners", "Digital health builders"],
    fitAr: ["موردو HIS", "فرق التكامل", "owners بوابة FHIR", "مطورو الصحة الرقمية"],
    outcomes: ["FHIR R4 profile alignment", "Code and identifier mapping", "Endpoint trust model", "Go-live support"],
    outcomesAr: ["محاذاة ملف FHIR R4", "خرائط الأكواد والمعرفات", "نموذج ثقة نقطة النهاية", "دعم الإطلاق"],
    proof: ["FHIR R4", "OID root", "Code mapping", "Verification path"],
    proofAr: ["FHIR R4", "جذر OID", "خرائط الأكواد", "مسار التحقق"],
    timeline: "Scoped implementation with discovery, mapping, validation, and go-live steps.",
    timelineAr: "تنفيذ محدد النطاق مع خطوات الاكتشاف والخرائط والتحقق والإطلاق.",
    accent: "#ffcf7a",
  },
  {
    slug: "nphies-identity-bundle",
    sku: "OID-NPHIES",
    oid: "1.3.6.1.4.1.61026.14.4",
    eyebrow: "Saudi claims identity",
    eyebrowAr: "هوية مطالبات سعودية",
    title: "NPHIES-OID Healthcare Identity Bundle",
    titleAr: "حزمة الهوية الصحية NPHIES-OID",
    price: "SAR 180,000 one time + support option",
    handle: "nphies-oid-healthcare-identity-bundle",
    summary: "A healthcare identity bundle for eligibility, authorization, claims, and CCHI-aligned operating models.",
    summaryAr: "حزمة هوية صحية للأهلية والترخيص والمطالبات ونماذج التشغيل المتوافقة مع CCHI.",
    story: "Claims journeys need identity discipline. The bundle packages provider, payer, facility, service, and transaction identity into a practical implementation path for NPHIES-facing teams.",
    storyAr: "رحلات المطالبات تحتاج انضباط هوية. تجمع الحزمة هوية المزود والدافع والمنشأة والخدمة والمعاملة في مسار تنفيذي عملي لفرق NPHIES.",
    promise: "Identity structure for claims operations that cannot afford ambiguity.",
    promiseAr: "بنية هوية لعمليات المطالبات التي لا تحتمل الغموض.",
    fit: ["Revenue cycle teams", "Payers", "Providers", "NPHIES integrators"],
    fitAr: ["فرق دورة الإيرادات", "الدافعون", "المزودون", "متكاملو NPHIES"],
    outcomes: ["Eligibility identity model", "Authorization and claims mapping", "CCHI conformance support", "Training and operating guidance"],
    outcomesAr: ["نموذج هوية الأهلية", "خرائط الترخيص والمطالبات", "دعم توافق CCHI", "إرشادات التدريب والتشغيل"],
    proof: ["Eligibility", "Authorization", "Claims", "CCHI orientation"],
    proofAr: ["الأهلية", "الترخيص", "المطالبات", "توجيه CCHI"],
    timeline: "Implementation depends on claims scope, payer/facility count, and transaction depth.",
    timelineAr: "يعتمد التنفيذ على نطاق المطالبات وعدد الدافعين/المنشآت وعمق المعاملات.",
    accent: "#ff8f6b",
  },
  {
    slug: "enterprise-namespace-license",
    sku: "OID-NAMESPACE",
    oid: "1.3.6.1.4.1.61026.14.5",
    eyebrow: "Enterprise architecture",
    eyebrowAr: "عمارة مؤسسية",
    title: "OID Enterprise Namespace License",
    titleAr: "رخصة نطاق OID للمؤسسات",
    price: "SAR 240,000 annual + SAR 48,000 setup",
    handle: "oid-enterprise-namespace-license",
    summary: "A governed enterprise OID namespace with child arcs, DID-ready records, QR verification, and operating rules.",
    summaryAr: "نطاق OID مؤسسي محكوم بأقواس فرعية وسجلات جاهزة لـ DID وتحقق QR وقواعد تشغيل.",
    story: "Large organizations need their own naming authority. This license gives the institution a governed OID namespace that can represent departments, systems, credentials, agents, services, and endpoints without losing control.",
    storyAr: "المنظمات الكبيرة تحتاج سلطة تسمية خاصة. تمنح هذه الرخصة المؤسسة نطاق OID محكوم لتمثيل الأقسام والأنظمة والاعتمادات والوكلاء والخدمات ونقاط النهاية دون فقدان السيطرة.",
    promise: "A sovereign namespace for enterprise identity architecture.",
    promiseAr: "نطاق سيادي لعمارة هوية المؤسسة.",
    fit: ["Hospital groups", "Government programs", "Enterprise platforms", "National-scale initiatives"],
    fitAr: ["مجموعات المستشفيات", "البرامج الحكومية", "المنصات المؤسسية", "المبادرات الوطنية"],
    outcomes: ["One namespace plus child arcs", "Registration support", "DID and QR paths", "Governance playbook"],
    outcomesAr: ["نطاق واحد مع أقواس فرعية", "دعم التسجيل", "مسارات DID وQR", "دليل الحوكمة"],
    proof: ["OID-base registration path", "Child arc model", "DID-ready records", "QR verification"],
    proofAr: ["مسار تسجيل OID-base", "نموذج القوس الفرعي", "سجلات جاهزة لـ DID", "تحقق QR"],
    timeline: "Setup phase establishes namespace policy, child arcs, and publishing model.",
    timelineAr: "مرحلة الإعداد تضع سياسة النطاق والأقواس الفرعية ونموذج النشر.",
    accent: "#b8f0c7",
  },
  {
    slug: "white-label-enterprise",
    sku: "OID-WHITELABEL",
    oid: "1.3.6.1.4.1.61026.14.6",
    eyebrow: "Territory scale",
    eyebrowAr: "نطاق إقليمي",
    title: "OID White-Label Enterprise",
    titleAr: "العلامة التجارية الخاصة OID",
    price: "SAR 480,000 annual",
    handle: "oid-white-label-enterprise",
    summary: "A private-brand registry, verification, and identity storefront for partners who want to operate their own trust layer.",
    summaryAr: "سجل وتحقق وواجهة متجر بالعلامة التجارية الخاصة للشركاء الذين يريدون تشغيل طبقة ثقة خاصة.",
    story: "Some partners do not only want to consume identity. They want to operate it under their own brand, geography, compliance posture, residency expectations, and commercial model.",
    storyAr: "بعض الشركاء لا يريدون استهلاك الهوية فقط. يريدون تشغيلها بعلامتهم التجارية وجغرافيتهم وامتثالهم ومتطلبات الإقامة ونموذجهم التجاري.",
    promise: "Own the front stage while BrainSAIT powers the trust machinery behind it.",
    promiseAr: "امتلك المسرح الأمامي بينما تشغّل برينسايت آليات الثقة خلفه.",
    fit: ["Strategic partners", "Healthcare networks", "Territory operators", "Enterprise resellers"],
    fitAr: ["الشركاء الاستراتيجيون", "شبكات الرعاية الصحية", "المشغلون الإقليميون", "الموزعون المؤسسيون"],
    outcomes: ["White-label registry and verify", "SSO and residency options", "SLA and training", "Commercial enablement"],
    outcomesAr: ["سجل وتحقق بالعلامة التجارية", "خيارات SSO والإقامة", "اتفاقية مستوى الخدمة والتدريب", "تمكين تجاري"],
    proof: ["Private-branded registry", "SSO path", "Residency planning", "Revenue-share model"],
    proofAr: ["سجل بالعلامة التجارية الخاصة", "مسار SSO", "تخطيط الإقامة", "نموذج تقاسم الإيرادات"],
    timeline: "Enterprise discovery first, then architecture, governance, implementation, and enablement.",
    timelineAr: "اكتشاف مؤسسي أولاً، ثم العمارة والحوكمة والتنفيذ والتمكين.",
    accent: "#e8e1d4",
  },
];

export const featuredProduct = PRODUCTS[0];

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}
