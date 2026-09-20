export type KBArticle = {
  slug: string;
  title: string;
  titleAr: string;
  category: "foundations" | "architecture" | "guides" | "philosophy" | "media";
  pillar: string;
  readTime: string;
  accent: string;
  heroQuote: string;
  heroQuoteAr: string;
  excerpt: string;
  excerptAr: string;
  content: string;
  tags: string[];
  media?: { type: "video" | "audio" | "image"; label: string; labelAr: string; src: string; mime: string }[];
  relatedProducts?: string[];
};

export const KB_MEDIA_BASE = "https://pub-633a4a994fe14149944a6cac31d38e8f.r2.dev/kb";

export const KB_CATEGORIES = [
  { id: "all", label: "All Knowledge", labelAr: "كل المعرفة" },
  { id: "foundations", label: "Foundations", labelAr: "الأساسيات" },
  { id: "architecture", label: "Architecture", labelAr: "العمارة" },
  { id: "guides", label: "Guides", labelAr: "الأدلة" },
  { id: "philosophy", label: "Philosophy", labelAr: "الفلسفة" },
  { id: "media", label: "Media", labelAr: "الوسائط" },
] as const;

export const KB_ARTICLES: KBArticle[] = [
  {
    slug: "introduction-to-oid",
    title: "Introduction to Object Identifiers",
    titleAr: "مقدمة شاملة في نظام إدارة معرفات الكائنات",
    category: "foundations",
    pillar: "Identity Fundamentals",
    readTime: "8 min",
    accent: "#31f4d2",
    heroQuote: "The OID is the map — read the number, know the place, permissions, and purpose.",
    heroQuoteAr: "المعرف هو الخريطة — اقرأ الرقم، تعرف على المكان والصلاحيات والغرض.",
    excerpt: "A foundational walkthrough of what Object Identifiers are, why they matter in enterprise healthcare, and how BrainSAIT structures identity hierarchies.",
    excerptAr: "شرح تأسيسي لمعرفات الكائنات ولماذا تهم في الرعاية الصحية المؤسسية وكيف تنظم برينسايت هويات الهرمية.",
    tags: ["OID", "identity", "hierarchy", "healthcare", "enterprise"],
    relatedProducts: ["oid-verification-badge", "provider-registry"],
    content: `
      <article class="kb-article-body" dir="rtl" lang="ar">
        <p class="kb-lead">في البيئات المؤسسية الضخمة، يصبح التمييز بين الموارد والأصول تحدياً تقنياً. هنا يأتي دور نظام OID، وهو ما نشبهه بـ "نظام الشارات الرقمي" (Badge System).</p>

        <div class="kb-callout">
          <span class="kb-callout-label">المبدأ الجوهري</span>
          <p>تخيل الـ OID كبصمة إصبع رقمية؛ لا يمكن لشخصين أو موردين أن يتشاركا نفس البصمة. في BrainSAIT، يعمل هذا المعرف كعنوان فريد ومطلق يضمن عدم التداخل بين الأقسام أو الموظفين أو حتى الأجهزة البرمجية.</p>
        </div>

        <h2>الفوائد الثلاث الكبرى</h2>
        <div class="kb-benefits-grid">
          <div class="kb-benefit">
            <span class="kb-benefit-number">01</span>
            <h3>التنظيم الهرمي</h3>
            <p>ترتيب البيانات في مستويات منطقية تبدأ من القمة (المؤسسة) نزولاً إلى أدق التفاصيل (الموظف أو الجهاز).</p>
          </div>
          <div class="kb-benefit">
            <span class="kb-benefit-number">02</span>
            <h3>سهولة التتبع</h3>
            <p>القدرة على تتبع أصل أي "شارة" ومعرفة موقعها الدقيق في الهيكل التنظيمي في أجزاء من الثانية.</p>
          </div>
          <div class="kb-benefit">
            <span class="kb-benefit-number">03</span>
            <h3>التكامل البرمجي السلس</h3>
            <p>توفير لغة موحدة تسمح للأنظمة المختلفة (قواعد البيانات، تطبيقات الويب، الخوادم) بالتخاطب دون لبس.</p>
          </div>
        </div>

        <h2>فهم شجرة المعرفات: الهيكل والمنطق</h2>
        <p>يعتمد نظام BrainSAIT على "تصور الشجرة" (OID Tree Visualization). الجوهر الحقيقي هو أن "المعرف هو الخريطة"؛ فبمجرد قراءة سلسلة الأرقام، أنت لا تعرف "هوية" الكائن فحسب، بل تعرف "مكانه" وصلاحياته تلقائياً.</p>

        <div class="kb-tree-diagram">
          <div class="kb-tree-node root"><span class="kb-tree-label">Root (1)</span><span class="kb-tree-desc">المؤسسة الأم</span></div>
          <div class="kb-tree-branch">
            <div class="kb-tree-node brainsait"><span class="kb-tree-label">BrainSAIT (1.3.6.1.4.1.61026)</span><span class="kb-tree-desc">فرع المؤسسة — IANA PEN 61026</span></div>
            <div class="kb-tree-branch">
              <div class="kb-tree-node"><span class="kb-tree-label">.2 — Geographic Operations</span><span class="kb-tree-desc">العمليات الجغرافية</span></div>
              <div class="kb-tree-node"><span class="kb-tree-label">.3 — Organization</span><span class="kb-tree-desc">شؤون المنظمة</span></div>
              <div class="kb-tree-node"><span class="kb-tree-label">.4 — Products &amp; Services</span><span class="kb-tree-desc">المنتجات والخدمات</span></div>
              <div class="kb-tree-node"><span class="kb-tree-label">.5 — Infrastructure</span><span class="kb-tree-desc">البنية التحتية</span></div>
              <div class="kb-tree-node highlight"><span class="kb-tree-label">.6 — Healthcare Badge Root</span><span class="kb-tree-desc">الشارات الصحية: ممارسين، أنظمة طبية، IoT، وكلاء أذكياء</span></div>
              <div class="kb-tree-node"><span class="kb-tree-label">.14 — OID LINE Commerce</span><span class="kb-tree-desc">تجارة خط المعرفات</span></div>
              <div class="kb-tree-node"><span class="kb-tree-label">.16 — Provider Registry</span><span class="kb-tree-desc">سجل المزودين</span></div>
            </div>
          </div>
        </div>

        <h2>الاستكشاف العملي: الميزات والواجهة</h2>
        <div class="kb-features-table">
          <div class="kb-feature-row">
            <div class="kb-feature-name">واجهة مظلمة حديثة (Dark UI)</div>
            <div class="kb-feature-desc">تقليل إجهاد العين وتوفير بيئة عمل احترافية باستخدام TailwindCSS.</div>
          </div>
          <div class="kb-feature-row">
            <div class="kb-feature-name">المساعد الذكي (AI Assistant)</div>
            <div class="kb-feature-desc">يقدم توصيات دقيقة لتخصيص المواقع لضمان عدم كسر سلامة الشجرة.</div>
          </div>
          <div class="kb-feature-row">
            <div class="kb-feature-name">التصور الشجري التفاعلي</div>
            <div class="kb-feature-desc">رؤية فورية للعلاقات بين البيانات، مما يسهل عملية اتخاذ القرار للمديرين.</div>
          </div>
        </div>

        <h2>العمليات الأساسية عبر الواجهة البرمجية</h2>
        <div class="kb-api-endpoints">
          <div class="kb-endpoint"><code>GET /health</code><span>مراقبة الصحة والتأكد من جاهزية النظام</span></div>
          <div class="kb-endpoint"><code>GET /oids</code><span>استرجاع كافة الشارات أو واحدة محددة</span></div>
          <div class="kb-endpoint"><code>POST /oids</code><span>تسجيل شارة OID جديدة مع تحقق ذكي</span></div>
          <div class="kb-endpoint"><code>PUT /oids/{oid}</code><span>تحديث البيانات الوصفية (Metadata)</span></div>
          <div class="kb-endpoint"><code>DELETE /oids/{oid}</code><span>سحب الشارة أو إبطال مفعولها</span></div>
        </div>

        <div class="kb-callout warning">
          <span class="kb-callout-label">تنبيه أمني</span>
          <p>هذا النظام مصمم للاستخدام الداخلي فقط داخل مؤسسة BrainSAIT. يُحظر تماماً تضمين مفاتيح API أو بيانات قاعدة البيانات في حزم المتصفح. يجب حماية النظام خلف طبقة تحقق قوية مثل Cloudflare Access.</p>
        </div>

        <div class="kb-insight">
          <span class="kb-insight-label">ثلاث ركائز لا تُنسى</span>
          <ol>
            <li><strong>الهوية هي الموقع:</strong> في نظام OID، قيمة المعرف تخبرك بمكانه وصلاحياته في الشجرة.</li>
            <li><strong>سلامة الهيكل:</strong> استخدم المساعد الذكي دائماً عند إضافة معرفات جديدة لضمان عدم كسر الهرمية.</li>
            <li><strong>الأمن أولاً:</strong> تأمين الواجهة البرمجية خلف بروكسي الهوية ليس خياراً بل ضرورة.</li>
          </ol>
        </div>
      </article>
    `,
  },
  {
    slug: "technical-architecture",
    title: "Technical Architecture of BrainSAIT OID",
    titleAr: "العمارة التقنية لنظام إدارة معرفات الكائنات",
    category: "architecture",
    pillar: "System Design",
    readTime: "12 min",
    accent: "#d6b46a",
    heroQuote: "Single source of truth for every digital asset — from React to FastAPI to PostgreSQL.",
    heroQuoteAr: "مصدر الحقيقة الوحيد لكافة الأصول الرقمية — من React إلى FastAPI إلى PostgreSQL.",
    excerpt: "Complete technical architecture document covering frontend, backend, database schema, API design, AI assistant integration, deployment strategy, and quality assurance.",
    excerptAr: "وثيقة العمارة التقنية الكاملة تغطي الواجهة والخدمات الخلفية وقاعدة البيانات والواجهة البرمجية والذكاء الاصطناعي والاستراتيجية التشغيلية.",
    tags: ["architecture", "React", "FastAPI", "PostgreSQL", "Docker", "API", "DevOps"],
    relatedProducts: ["fhir-integration-platform", "enterprise-namespace-license"],
    content: `
      <article class="kb-article-body" dir="rtl" lang="ar">
        <p class="kb-lead">تمثيل إدارة معرفات الكائنات (OID) العمود الفقري للتنظيم الرقمي داخل مؤسسة BrainSAIT. صُممت هذه العمارة لتتجاوز الوظائف التقليدية نحو بناء منظومة مركزية مؤتمتة بالكامل تضمن "مصدر الحقيقة الوحيد" لكافة الأصول الرقمية.</p>

        <div class="kb-callout">
          <span class="kb-callout-label">الرؤية الإستراتيجية</span>
          <p>تقليل الاحتكاك التشغيلي من خلال الفصل الصارم بين واجهات الإدارة ومنطق معالجة البيانات، مما يسمح بقابلية توسع أفقية تتماشى مع نمو المؤسسة.</p>
        </div>

        <h2>١. بنية الواجهة الأمامية — OID Portal</h2>
        <p>تعتمد بوابة OID على React.js مع TailwindCSS لتقديم واجهة عصرية بنمط داكن. هذا الاختيار ليس جمالياً فحسب، بل هو قرار معماري مدروس لتقليل الإجهاد البصري للمشغلين الذين يتعاملون مع هياكل بيانات كثيفة لفترات طويلة.</p>

        <div class="kb-benefits-grid">
          <div class="kb-benefit">
            <span class="kb-benefit-number">01</span>
            <h3>Interactive OID Tree</h3>
            <p>مكون متطور يعالج تمثيل البيانات الهرمية بشكل مرئي، مما يسمح للمسؤولين بالتنقل في شجرة المعرفات بعمق وسلاسة.</p>
          </div>
          <div class="kb-benefit">
            <span class="kb-benefit-number">02</span>
            <h3>React Hooks &amp; ES6+</h3>
            <p>الاعتماد الكلي على معايير حديثة لإدارة حالة التطبيق، مما يضمن كفاءة عالية في تحديث الواجهات دون التأثير على أداء المتصفح.</p>
          </div>
          <div class="kb-benefit">
            <span class="kb-benefit-number">03</span>
            <h3>Responsive Design</h3>
            <p>TailwindCSS يوفر سرعة استثنائية في دورة التطوير ويضمن استجابة الواجهة عبر مختلف بيئات العرض.</p>
          </div>
        </div>

        <h2>٢. عمارة الخدمات الخلفية وقواعد البيانات</h2>
        <p>يعتمد النظام الخلفي على FastAPI (Python 3.11+) بأسلوب الخدمات الموزعة، حيث يتم الفصل بين استقبال الطلبات وتنفيذ العمليات طويلة الأمد من خلال Workers.</p>

        <div class="kb-schema-table">
          <div class="kb-schema-header"><span>الحقل</span><span>نوع البيانات</span><span>الوصف</span></div>
          <div class="kb-schema-row"><code>OID</code><span>String (PK)</span><span>المعرف الفريد للكائن بصيغته الهرمية</span></div>
          <div class="kb-schema-row"><code>Parent_OID</code><span>String (FK)</span><span>الإشارة إلى المعرف الأب لتمثيل الهيكلية الشجرية</span></div>
          <div class="kb-schema-row"><code>Badge_Details</code><span>JSONB</span><span>بيانات الشارة المرنة — قابلية للتوسع دون تعديل المخطط</span></div>
          <div class="kb-schema-row"><code>Status</code><span>Enum</span><span>Active / Revoked — حالة المعرف ضمن دورة حياته</span></div>
          <div class="kb-schema-row"><code>Created_At</code><span>Timestamp</span><span>طابع زمني لضمان شفافية العمليات (Audit Trail)</span></div>
        </div>

        <h2>٣. تكامل واجهة برمجة التطبيقات (RESTful API)</h2>
        <p>طبقة الـ API هي العصب النابض الذي يربط البوابة بالخدمات الخلفية. تم تصميم النقاط الطرفية بمبدأ الـ Idempotency لضمان سلامة البيانات حتى في حالات تكرار الطلبات.</p>

        <div class="kb-api-endpoints">
          <div class="kb-endpoint"><code>GET /health</code><span>نقطة حيوية لمراقبة سلامة النظام (Liveness Probe)</span></div>
          <div class="kb-endpoint"><code>GET /oids</code><span>استرجاع الهيكل الكامل لشجرة المعرفات</span></div>
          <div class="kb-endpoint"><code>POST /oids</code><span>تسجيل معرف جديد مع إجراء عمليات تحقق صارمة</span></div>
          <div class="kb-endpoint"><code>PUT /oids/{oid}</code><span>تحديث البيانات الوصفية مع الحفاظ على ثبات المراجع</span></div>
          <div class="kb-endpoint"><code>DELETE /oids/{oid}</code><span>سحب المعرف وإلغاء مفعوله</span></div>
        </div>

        <div class="kb-callout">
          <span class="kb-callout-label">الطبقة الأمنية</span>
          <p>الالتزام بمبدأ الدفاع المتعدد الطبقات؛ النظام خلف Identity-Aware Proxy (IAP) مثل Cloudflare Access مع التأكيد الصارم على عدم تضمين أي أسرار برمجية داخل حزم المتصفح.</p>
        </div>

        <h2>٤. محرك المساعدة السياقية المدعوم بالذكاء الاصطناعي</h2>
        <p>يمثل دمج نماذج اللغة الكبيرة (LLM) تحولاً نوعياً في كيفية تفاعل المسؤولين مع نظام OID. بدلاً من المساعدة التقليدية، يقدم النظام مساعداً ذكياً يفهم سياق الهيكل التنظيمي.</p>

        <div class="kb-benefits-grid">
          <div class="kb-benefit">
            <span class="kb-benefit-number">01</span>
            <h3>توصيات التخصيص الذكي</h3>
            <p>اقتراح المسارات المثلى لتسكين المعرفات الجديدة بناءً على أنماط التوزيع الحالية.</p>
          </div>
          <div class="kb-benefit">
            <span class="kb-benefit-number">02</span>
            <h3>تبسيط الأنظمة المعقدة</h3>
            <p>مساعدة المسؤولين الجدد في فهم الترابطات داخل شجرة الـ OID الكبيرة.</p>
          </div>
        </div>

        <div class="kb-insight">
          <span class="kb-insight-label">القيمة المضافة</span>
          <p>يؤدي هذا التكامل إلى خفض تكاليف الدعم الفني من المستوى الأول (L1 Support) بنسبة كبيرة، حيث يوفر النظام "خدمة ذاتية" ذكية للمسؤولين ويقلل من الأخطاء البشرية الناتجة عن سوء فهم الهياكل المعقدة.</p>
        </div>

        <h2>٥. استراتيجية النشر والتشغيل</h2>
        <p>تعتمد فلسفة التشغيل على الحاويات (Containerization) الكاملة لضمان تماثل البيئات. يتم استخدام Docker Compose لتنسيق العلاقة بين Frontend وBackend وPostgreSQL ومكونات الـ Workers.</p>

        <div class="kb-benefits-grid">
          <div class="kb-benefit">
            <span class="kb-benefit-number">01</span>
            <h3>Secret Management</h3>
            <p>حقن المتغيرات الحساسة عبر ملفات .env في وقت التشغيل مع منع تسريب مفاتيح قواعد البيانات للمتصفح.</p>
          </div>
          <div class="kb-benefit">
            <span class="kb-benefit-number">02</span>
            <h3>Infrastructure</h3>
            <p>Nginx كخادم عكسي لتعزيز الأداء مع عزل قاعدة البيانات في شبكة خاصة.</p>
          </div>
        </div>

        <h2>٦. ضمان الجودة والاختبار</h2>
        <div class="kb-benefits-grid">
          <div class="kb-benefit">
            <span class="kb-benefit-number">01</span>
            <h3>اختبارات التحميل</h3>
            <p>ضمان استقرار النظام تحت ضغط الطلبات المتزامنة الكثيفة.</p>
          </div>
          <div class="kb-benefit">
            <span class="kb-benefit-number">02</span>
            <h3>API Validation</h3>
            <p>التأكد من دقة البيانات المرتجعة ومعالجة الأخطاء وفق معايير REST.</p>
          </div>
          <div class="kb-benefit">
            <span class="kb-benefit-number">03</span>
            <h3>Accessibility</h3>
            <p>التحقق من مطابقة الواجهة لمعايير الوصول العالمية لضمان شمولية الاستخدام.</p>
          </div>
        </div>

        <div class="kb-insight">
          <span class="kb-insight-label">الخاتمة الإستراتيجية</span>
          <p>هذا الهيكل المعماري يمثل حلاً مستداماً وقابلاً للتوسع يجمع بين قوة الأداء وأمان البيانات. عبر دمج FastAPI وReact مع تعزيزها بالذكاء الاصطناعي ومعالجة المهام غير المتزامنة، تضع BrainSAIT نفسها في مقدمة المؤسسات التي تكتسب ميزة تنافسية من خلال التميز التقني.</p>
        </div>
      </article>
    `,
  },
  {
    slug: "information-architecture-guide",
    title: "Information Architecture: The Art of Making Sense",
    titleAr: "دليل هندسة المعلومات: فن تنظيم الأجزاء لصناعة المعنى",
    category: "philosophy",
    pillar: "Knowledge Design",
    readTime: "14 min",
    accent: "#ffcf7a",
    heroQuote: "We don't design pages or systems — we design clarity. And clarity is the greatest gift an engineer can give the world.",
    heroQuoteAr: "نحن لا نصمم صفحات أو أنظمة، نحن نصمم الوضوح، والوضوح هو أعظم هدية يمكن أن يقدمها المهندس للعالم.",
    excerpt: "A masterclass in information architecture covering ontology, taxonomy, controlled vocabularies, abstraction, and the emotional dimension of sensemaking in complex systems.",
    excerptAr: "صفحة استاذية في هندسة المعلومات تغطي الأنطولوجيا والتصنيف والمفردات المنضبطة والتجريد والبُعد العاطفي لصناعة المعنى.",
    tags: ["IA", "ontology", "taxonomy", "sensemaking", "Abby Covert", "ASN.1", "DER"],
    relatedProducts: ["provider-registry", "enterprise-namespace-license"],
    content: `
      <article class="kb-article-body" dir="rtl" lang="ar">
        <p class="kb-lead">إننا لا نتعامل هنا مع مجرد ترتيب تقني للبيانات، بل نحن بصدد دراسة "فن صناعة المعنى" في عالم يغرق في الفوضى الرقمية. هدفنا هو تحويل "التعقيد" إلى "وضوح" من خلال أدوات استراتيجية تجعل المحتوى قابلاً للاستيعاب الفوري.</p>

        <div class="kb-callout">
          <span class="kb-callout-label">حسب آبي كوفيرت (Abby Covert)</span>
          <p>هندسة المعلومات هي "طريقة ترتيب الأجزاء لتجعلها منطقية ككل". إنها العملية التي نمارسها لفك شفرات الغموض وصناعة الوضوح.</p>
        </div>

        <h2>الدرس الأول: المعلومة ليست هي المحتوى</h2>
        <div class="kb-features-table">
          <div class="kb-feature-row"><div class="kb-feature-name">المحتوى (Content)</div><div class="kb-feature-desc">المادة الخام: نصوص، صور، ملفات. موضوعي، ملموس، قابل للقياس.</div></div>
          <div class="kb-feature-row"><div class="kb-feature-name">المعلومة (Information)</div><div class="kb-feature-desc">ما يدركه الجمهور. ذاتي، يعتمد على تفسير الفرد وسياقه الخاص.</div></div>
        </div>

        <div class="kb-insight">
          <span class="kb-insight-label">البصيرة الأكاديمية</span>
          <p>نحن كمهندسين لا يمكننا "نقل" المعلومة مباشرة كطرد بريدي؛ كل ما يمكننا فعله هو ترتيب المحتوى بذكاء، آملين أن يقوم المتلقي بتفسيره بالمعنى الذي قصدناه.</p>
        </div>

        <h2>الدرس الثاني: قوة الأنطولوجيا — إعلان المعنى</h2>
        <p>الأنطولوجيا (Ontology) هي "إعلان المعنى"، وهي الأداة التي نستخدمها لتقليل الغموض. لنأخذ مثال "الطماطم": علمياً هي فاكهة، لكن في سياق الطبخ هي خضار. هذا التضارب يؤدي إلى "انهيار أنطولوجي" إذا وُضعت في سياق خاطئ.</p>

        <div class="kb-callout warning">
          <span class="kb-callout-label">في أنظمة الهوية</span>
          <p>بدون إعلان واضح للمعنى، قد تُمنح صلاحيات لمستخدمين بناءً على مسميات وظيفية غامضة، مما يفتح ثغرات أمنية جسيمة. المهندس الرقمي هو من يضع القواعد التي تمنع هذا التداخل الأنطولوجي.</p>
        </div>

        <h2>الدرس الثالث: التصنيف (Taxonomy)</h2>
        <p>التصنيف هو "تصنيف الشيء لغرض محدد"، وهو وضع قواعد للفرز بناءً على سمات محددة. في هندسة النظم، يتم تصنيف الوسوم (Tags) إلى أربع فئات:</p>

        <div class="kb-benefits-grid">
          <div class="kb-benefit"><span class="kb-benefit-number">01</span><h3>العالمي (Universal)</h3><p>أنواع ثابتة المعنى في كل التطبيقات (مثل INTEGER).</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">02</span><h3>التطبيق (Application)</h3><p>أنواع خاصة بتطبيق معين (مثل خدمات X.500).</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">03</span><h3>خاص (Private)</h3><p>أنواع خاصة بمؤسسة محددة — حرية تعريف المعنى داخلياً.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">04</span><h3>سياقي (Context-specific)</h3><p>يتغير معنى الوسم بناءً على "الهيكل المحيط" به.</p></div>
        </div>

        <h2>الدرس الرابع: "سحر" التجريد — ASN.1</h2>
        <p>يعد التجريد (Abstraction) السمة المميزة لمواصفات البرمجيات الحديثة. لغة ASN.1 ت充当 "قواعد لغوية" تسمح للأنظمة المختلفة بفهم بيانات الهوية ذاتها، بغض النظر عن لغة البرمجة المستخدمة.</p>

        <div class="kb-tree-diagram">
          <div class="kb-tree-node"><span class="kb-tree-label">Simple Types</span><span class="kb-tree-desc">INTEGER, BIT STRING, NULL — الذرات الأساسية</span></div>
          <div class="kb-tree-node"><span class="kb-tree-label">Structured Types</span><span class="kb-tree-desc">SEQUENCE, SET — مجموعات منظمة</span></div>
          <div class="kb-tree-node"><span class="kb-tree-label">Tagged Types</span><span class="kb-tree-desc">المشتقة لتمييز الأنواع في سياقات معينة</span></div>
          <div class="kb-tree-node"><span class="kb-tree-label">Other Types</span><span class="kb-tree-desc">CHOICE, ANY — مرونة إضافية</span></div>
        </div>

        <h2>الدرس الخامس: DER — الترميز الفريد كحجر زاوية للثقة</h2>
        <p>في عالم التشفير، لا تكفي المرونة التي توفرها قواعد الترميز الأساسية (BER). DER يفرض ترميزاً واحداً فريداً لكل قيمة.</p>

        <div class="kb-callout">
          <span class="kb-callout-label">لماذا هذا "التفرد" حيوي؟</span>
          <p>التوقيعات الرقمية تعتمد على اتساق البيانات بتّاً ببت. إذا أمكن ترميز القيمة بطريقتين، سيتغير الهاش (Hash)، مما يؤدي إلى فشل التوقيع الرقمي وانهيار الثقة. DER هو ما يضمن أن ما نوقعه هو بالضبط ما يتم التحقق منه.</p>
        </div>

        <h2>الدرس السادس: IAM كنظام بيئي للثقة</h2>
        <p>توجهات الهوية اليوم تتجاوز كلمات المرور التقليدية:</p>
        <div class="kb-benefits-grid">
          <div class="kb-benefit"><span class="kb-benefit-number">01</span><h3>مصادقة بدون كلمات مرور</h3><p>للقضاء على مخاطر السرقة التقليدية.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">02</span><h3>البيومتريا السلوكية</h3><p>الذكاء الاصطناعي يحلل أنماط تفاعل الإنسان لإثبات هويته.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">03</span><h3>بنية الثقة الصفرية</h3><p>التحقق المستمر من الهوية بناءً على تحليل لحظي للسلوك والبيئة.</p></div>
        </div>

        <h2>الدرس السابع: الجانب العاطفي لصناعة المعنى</h2>
        <p>صناعة المعنى ليست عملية تقنية جافة، بل هي رحلة محفوفة بـ "اضطراب عاطفي متأصل". عندما يواجه المستخدم نظام هوية فاشلاً، فإن الفشل يتجاوز التقنية ليكون فشلاً عاطفياً يشعره بعدم الأمان.</p>

        <div class="kb-insight">
          <span class="kb-insight-label">للمهندسين المعماريين</span>
          <p>يجب ممارسة "تطبيع العواطف" كأداة هندسية؛ الهدف ليس مجرد بناء نظام آمن، بل بناء نظام "منطقي" يقلل من القلق البشري ويساعد المستخدمين على التنقل في "الفوضى" الرقمية بوضوح وثقة.</p>
        </div>

        <div class="kb-callout">
          <span class="kb-callout-label">بطاقة أداء المهندس</span>
          <ol>
            <li>ماذا تقصد بـ (____)؟ — تحديد الأنطولوجيا بدقة</li>
            <li>كيف تقيس النجاح؟ — تعريف "الجيد" قبل البدء</li>
            <li>هل تملك صورة واضحة لما في ذهنك؟ — مخطط كـ "جسم للنقاش"</li>
            <li>هل تستخدم نفس الكلمة لمعنيين مختلفين؟ — ضبط المفردات</li>
            <li>ماذا تعرف عن سياق وقناة جمهورك؟ — فهم بيئة التلقي</li>
          </ol>
        </div>
      </article>
    `,
  },
  {
    slug: "hidden-architecture-of-digital-identity",
    title: "The Hidden Architecture of Digital Identity",
    titleAr: "الهندسة الخفية للهوية الرقمية: كيف نصنع المعنى في عالم من البيانات المعقدة؟",
    category: "philosophy",
    pillar: "Strategic Vision",
    readTime: "10 min",
    accent: "#74e4ff",
    heroQuote: "Identity is not what you know — it's who you are and how you behave.",
    heroQuoteAr: "الهوية ليست \u201Cما تعرفه\u201D، بل \u201Cمن أنت\u201D وكيف تتصرف.",
    excerpt: "How IAM and Information Architecture intersect to create the invisible scaffolding that keeps our digital world coherent — from LDAP to Zero Trust to behavioral biometrics.",
    excerptAr: "كيف تتلاقى إدارة الهوية وهندسة المعلومات لإنشاء السقالات غير المرئية التي تحافظ على تماسك عالمنا الرقمي.",
    tags: ["IAM", "Zero Trust", "biometrics", "information architecture", "sensemaking", "ASN.1"],
    relatedProducts: ["oid-verification-badge", "nphies-identity-bundle"],
    content: `
      <article class="kb-article-body" dir="rtl" lang="ar">
        <p class="kb-lead">في كل مرة تقوم فيها بصياغة واقعك الرقمي—سواء عبر تسجيل الدخول، أو مشاركة البيانات، أو الوصول إلى موارد مؤسسية—فإنك تتفاعل مع "سقالات" غير مرئية تُبقي هذا البناء متماسكاً.</p>

        <div class="kb-callout">
          <span class="kb-callout-label">التقاطع العميق</span>
          <p>بينما تهتم إدارة الهوية بدورة حياة المستخدم (من التزويد والمصادقة وصولاً إلى التدقيق)، تأتي هندسة المعلومات لتعيد تعريف المشهد بوصفه "الطريقة التي نرتب بها الأجزاء لتبدو منطقية ككل واحد".</p>
        </div>

        <h2>الدرس الأول: المعلومات ليست هي المحتوى</h2>
        <p>في سياق IAM، يمثل "المحتوى" البيانات الخام المخزنة في أدلة مثل LDAP، أما "المعلومات" فهي ما يدركه المستخدم عن صلاحياته ووجوده الرقمي. المصمم البارع لا ينقل بيانات، بل ينسق بيئة إدراكية.</p>

        <div class="kb-insight">
          <span class="kb-insight-label">البصيرة</span>
          <p>"لا يمكننا ببساطة نقل محتوى الدرس إلى الطلاب، بل يمكننا فقط تقديمه بطريقة نأمل أن يتم تفسيرها بالطريقة التي نتوخاها." التحدي في هندسة الهوية ليس في "تخزين" اسم المستخدم، بل في ضمان أن "المعلومة" تتطابق مع الواقع الأمني المطلوب.</p>
        </div>

        <h2>الدرس الثاني: قوة الأنطولوجيا</h2>
        <p>الأنطولوجيا هي "إعلان المعنى"، وهي الأداة التي نستخدمها لتقليل الغموض. في أنظمة IAM، نعتمد على الأنطولوجيا لتحديد ما يعنيه "المستخدم" أو "الدور" بدقة.</p>

        <div class="kb-callout warning">
          <span class="kb-callout-label">الانهيار الأنطولوجي</span>
          <p>بدون إعلان واضح للمعنى، قد تُمنح صلاحيات لمستخدمين بناءً على مسميات وظيفية غامضة، مما يفتح ثغرات أمنية جسيمة. المهندس الرقمي هو من يضع القواعد التي تمنع هذا التداخل.</p>
        </div>

        <h2>الدرس الثالث: "سحر" التجريد — ASN.1</h2>
        <p>ASN.1 ت充当 "قواعد لغوية" تسمح للأنظمة المختلفة بفهم بيانات الهوية ذاتها، بغض النظر عن لغة البرمجة المستخدمة. إنها تضمن بقاء "المعنى" ثابتاً حتى لو تغيرت طريقة التنفيذ.</p>

        <div class="kb-tree-diagram">
          <div class="kb-tree-node"><span class="kb-tree-label">Simple Types</span><span class="kb-tree-desc">INTEGER, BIT STRING — الذرات الأساسية</span></div>
          <div class="kb-tree-node"><span class="kb-tree-label">Structured Types</span><span class="kb-tree-desc">SEQUENCE, SET — مجموعات منظمة</span></div>
          <div class="kb-tree-node"><span class="kb-tree-label">Tagged Types</span><span class="kb-tree-desc">المشتقة لتمييز الأنواع</span></div>
          <div class="kb-tree-node"><span class="kb-tree-label">Other Types</span><span class="kb-tree-desc">CHOICE, ANY — مرونة إضافية</span></div>
        </div>

        <h2>الدرس الرابع: DER كحجر زاوية للثقة</h2>
        <p>قواعد الترميز المتميزة (DER) تفرض ترميزاً واحداً فريداً لكل قيمة. التوقيعات الرقمية تعتمد على اتساق البيانات بتّاً ببت. DER يضمن أن ما نوقعه هو بالضبط ما يتم التحقق منه.</p>

        <h2>الدرس الخامس: IAM كنظام بيئي للثقة</h2>
        <div class="kb-benefits-grid">
          <div class="kb-benefit"><span class="kb-benefit-number">01</span><h3>مصادقة بدون كلمات مرور</h3><p>للقضاء على مخاطر السرقة التقليدية.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">02</span><h3>البيومتريا السلوكية</h3><p>الذكاء الاصطناعي يتحول إلى "صانع معنى" يحلل أنماط تفاعل الإنسان مع جهازه.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">03</span><h3>بنية الثقة الصفرية</h3><p>التحقق المستمر من الهوية بناءً على تحليل لحظي للسلوك والبيئة.</p></div>
        </div>

        <h2>الدرس السادس: الجانب العاطفي</h2>
        <p>صناعة المعنى ليست عملية تقنية جافة. عندما يواجه المستخدم نظام هوية فاشلاً، فإن الفشل يتجاوز التقنية ليكون فشلاً عاطفياً. يجب على المعماريين ممارسة "تطبيع العواطف" كأداة هندسية.</p>

        <div class="kb-insight">
          <span class="kb-insight-label">سؤال للتفكير</span>
          <p>إذا كان عالمك الرقمي مبنياً على تصنيفات وضعت القواعد لها آلات أو أشخاص آخرون، فهل تساءلت يوماً عن الكيفية التي صُنفت بها هويتك، وهل تملك حقاً سلطة "إعلان المعنى" الخاص بك؟</p>
        </div>
      </article>
    `,
  },
  {
    slug: "oid-badge-management-guide",
    title: "OID Badge Management System Guide",
    titleAr: "دليل الماهية البرمجية: نظام إدارة الشارات",
    category: "guides",
    pillar: "Implementation",
    readTime: "10 min",
    accent: "#31f4d2",
    heroQuote: "This system is not a passing web app — it's a sophisticated tool designed specifically for managing Object Identifier badges.",
    heroQuoteAr: "هذا النظام ليس مجرد تطبيق ويب عابر، بل هو أداة متطورة مصممة خصيصاً لإدارة شارات معرفات الكائنات.",
    excerpt: "A complete implementation guide covering the OID Portal frontend, FastAPI backend, PostgreSQL storage, AI assistant, Docker deployment, and the 5-step data flow from badge creation to confirmation.",
    excerptAr: "دليل تنفيذي كامل يغطي الواجهة والخدمات الخلفية والذكاء الاصطناعي وDocker وتدفق البيانات من إنشاء الشارة إلى التأكيد.",
    tags: ["guide", "React", "FastAPI", "PostgreSQL", "Docker", "SDK", "FHIR", "NPHIES"],
    relatedProducts: ["oid-verification-badge", "oid-explorer-seat"],
    content: `
      <article class="kb-article-body" dir="rtl" lang="ar">
        <p class="kb-lead">في جوهره، يعمل نظام BrainSAIT OID كمركز قيادة وتنظيم للمعرفات الرقمية الخاصة بالمنظمة. بدلاً من التعامل مع بيانات معقدة وجافة، يوفر النظام بيئة بصرية تفاعلية تجعل إدارة هذه المعرفات أمراً بسيطاً وفعالاً.</p>

        <div class="kb-benefits-grid">
          <div class="kb-benefit"><span class="kb-benefit-number">01</span><h3>الواجهة المظلمة العصرية</h3><p>تجربة بصرية مريحة تقلل من إجهاد العين ويزيد من كفاءة العمل الطويل.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">02</span><h3>تصور شجرة المعرفات</h3><p>رؤية الهيكل الهرمي للمعرفات بشكل تفاعلي يسهل فهم العلاقات.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">03</span><h3>المساعد الذكي</h3><p>دمج الذكاء الاصطناعي لتقديم نصائح وسياقات مساعدة للمسؤولين.</p></div>
        </div>

        <h2>الواجهة الأمامية: وجه النظام وتفاعله</h2>
        <div class="kb-features-table">
          <div class="kb-feature-row"><div class="kb-feature-name">React Hooks</div><div class="kb-feature-desc">تحديث الشاشة فوراً عند النقر دون انتظار تحميل الصفحة بالكامل.</div></div>
          <div class="kb-feature-row"><div class="kb-feature-name">TailwindCSS</div><div class="kb-feature-desc">بناء الواجهة المظلمة الأنيقة وتنسيق العناصر بمرونة عالية.</div></div>
          <div class="kb-feature-row"><div class="kb-feature-name">Modern JavaScript (ES6+)</div><div class="kb-feature-desc">أوامر برمجية قوية ونظيفة تضمن سرعة استجابة المتصفح.</div></div>
        </div>

        <h2>الواجهة الخلفية: العقل المدبر</h2>
        <p>يعتمد على FastAPI (Python 3.11+) لمعالجة الطلبات بأسلوب غير متزامن. أهم نقاط التواصل:</p>
        <div class="kb-api-endpoints">
          <div class="kb-endpoint"><code>GET /health</code><span>التحقق من "صحة" النظام</span></div>
          <div class="kb-endpoint"><code>GET /oids</code><span>الحصول على قائمة بكافة الشارات</span></div>
          <div class="kb-endpoint"><code>POST /oids</code><span>تسجيل شارة OID جديدة</span></div>
          <div class="kb-endpoint"><code>GET /oids/{oid}</code><span>البحث عن تفاصيل شارة محددة</span></div>
          <div class="kb-endpoint"><code>PUT /oids/{oid}</code><span>تحديث معلومات شارة موجودة</span></div>
          <div class="kb-endpoint"><code>DELETE /oids/{oid}</code><span>إلغاء شارة أو سحبها</span></div>
        </div>

        <h2>قاعدة البيانات والذكاء الاصطناعي</h2>
        <div class="kb-benefits-grid">
          <div class="kb-benefit"><span class="kb-benefit-number">01</span><h3>PostgreSQL</h3><p>قاعدة البيانات الموثوقة كـ "مستودع آمن" — حفظ منظم يضمن عدم الضياع وسرعة الاسترجاع.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">02</span><h3>المساعد المدعوم بالذكاء الاصطناعي</h3><p>يعمل كمستشار تقني فوري يحلل سياق المعرفات ويقدم توصيات ذكية لتقليل الأخطاء البشرية.</p></div>
        </div>

        <h2>بيئة التشغيل: Docker</h2>
        <p>تخيل Docker كـ "صندوق أدوات متنقل" يحتوي على كل ما يحتاجه النظام في بيئة معزولة. التشغيل عبر 3 خطوات: تحميل المشروع، إعداد الإعدادات، التشغيل النهائي.</p>

        <h2>خريطة التدفق: كيف تعمل الأجزاء معاً؟</h2>
        <div class="kb-benefits-grid">
          <div class="kb-benefit"><span class="kb-benefit-number">01</span><h3>نقطة الانطلاق</h3><p>يبدأ الطلب من مكونات React حيث يُدخل المستخدم البيانات.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">02</span><h3>المعالجة المركزية</h3><p>يستقبل ملف التشغيل الأساسي الطلب ويقوم بمعالجته عبر FastAPI.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">03</span><h3>الاستشارة الذكية</h3><p>يتم استدعاء منطق الذكاء الاصطناعي لتقديم توصيات حول التخصيص.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">04</span><h3>التخزين المستديم</h3><p>يتم توجيه البيانات إلى PostgreSQL ليتم حفظها رسمياً.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">05</span><h3>تأكيد النجاح</h3><p>تعود الإشارة من الخلفية إلى الواجهة لتظهر رسالة تأكيد النجاح.</p></div>
        </div>

        <h2>سياقات التكامل (Client SDK)</h2>
        <p>حزمة تطوير TypeScript توفر 6 سياقات تكاملية:</p>
        <div class="kb-api-endpoints">
          <div class="kb-endpoint"><code>FHIR/NPHIES</code><span>تحويل المعرفات إلى أكواد متوافقة مع الأنظمة الصحية الدولية</span></div>
          <div class="kb-endpoint"><code>X.509</code><span>تكامل مع السياسات الأمنية للشهادات الرقمية</span></div>
          <div class="kb-endpoint"><code>MCP</code><span>بروتوكول سياق ميكروفون الحاسوب</span></div>
          <div class="kb-endpoint"><code>Database</code><span>قواعد البيانات</span></div>
          <div class="kb-endpoint"><code>REST API</code><span>واجهات البرمجة</span></div>
          <div class="kb-endpoint"><code>QR / RFID</code><span>رموز الاستجابة السريعة والتعريف بموجات الراديو</span></div>
        </div>
      </article>
    `,
  },
  {
    slug: "brainait-oid-management-system",
    title: "BrainSAIT OID Badge Management System",
    titleAr: "نظام BrainSAIT OID لإدارة شارات معرفات الكائنات",
    category: "architecture",
    pillar: "System Overview",
    readTime: "7 min",
    accent: "#b8f0c7",
    heroQuote: "A modern web application designed for managing and assigning Object Identifier badges within the BrainSAIT organization.",
    heroQuoteAr: "تطبيق ويب حديث مصمم لإدارة وتخصيص شارات معرفات الكائنات داخل منظمة BrainSAIT.",
    excerpt: "System overview covering the OID tree hierarchy (IANA PEN 61026), badge management, multi-context integration (FHIR, X.509, QR/RFID), tech stack, and security measures.",
    excerptAr: "نظرة عامة على النظام تغطي شجرة OID وإدارة الشارات والتكامل متعدد السياقات والبنية التقنية والتدابير الأمنية.",
    tags: ["OID", "IANA", "PEN 61026", "FHIR", "NPHIES", "X.509", "SDK", "security"],
    relatedProducts: ["provider-registry", "fhir-integration-platform"],
    content: `
      <article class="kb-article-body" dir="rtl" lang="ar">
        <p class="kb-lead">نظام BrainSAIT OID هو تطبيق ويب حديث مصمم خصيصاً لإدارة وتخصيص شارات معرفات الكائنات (OID) داخل منظمة BrainSAIT، مع التركيز على سهولة الاستخدام والذكاء في الإدارة.</p>

        <h2>الهيكل الهرمي لمعرفات الكائنات</h2>
        <p>يعتمد النظام على شجرة تسجيل هرمية فريدة، حيث يمثل النطاق الجذري لمنظمة BrainSAIT الرقم <code>1.3.6.1.4.1.61026</code>، وهو مسجل لدى هيئة إنترنت الأرقام المخصصة (IANA) كرقم مؤسسة خاصة (Private Enterprise Number — PEN 61026).</p>

        <div class="kb-tree-diagram">
          <div class="kb-tree-node root"><span class="kb-tree-label">1.3.6.1.4.1.61026</span><span class="kb-tree-desc">BrainSAIT — IANA PEN 61026</span></div>
          <div class="kb-tree-branch">
            <div class="kb-tree-node"><span class="kb-tree-label">.2 — Geographic Operations</span><span class="kb-tree-desc">العمليات الجغرافية</span></div>
            <div class="kb-tree-node"><span class="kb-tree-label">.3 — Organization</span><span class="kb-tree-desc">شؤون المنظمة</span></div>
            <div class="kb-tree-node"><span class="kb-tree-label">.4 — Products &amp; Services</span><span class="kb-tree-desc">المنتجات والخدمات</span></div>
            <div class="kb-tree-node"><span class="kb-tree-label">.5 — Infrastructure</span><span class="kb-tree-desc">البنية التحتية</span></div>
            <div class="kb-tree-node highlight"><span class="kb-tree-label">.6 — Healthcare Badge Root</span><span class="kb-tree-desc">شارات الممارسين الصحيين، الأنظمة الطبية، IoT، الوكلاء الأذكياء</span></div>
          </div>
        </div>

        <h2>إدارة الشارات والتحكم في الوصول</h2>
        <p>يسمح النظام للمسؤولين بإنشاء وتعديل وإلغاء شارات الـ OID مع إمكانيات تحكم دقيقة في مستويات الوصول. عمليات التسجيل والاستعلام من خلال RESTful API.</p>

        <div class="kb-api-endpoints">
          <div class="kb-endpoint"><code>POST /oids</code><span>تسجيل شارة جديدة (مثل 1.3.6.1.4.1.61026.2.42)</span></div>
          <div class="kb-endpoint"><code>GET /oids/{oid}</code><span>الاستعلام عن تفاصيل شارة محددة</span></div>
          <div class="kb-endpoint"><code>DELETE /oids/{oid}</code><span>إلغاء الشارات وسحبها</span></div>
        </div>

        <h2>سياقات التكامل المتعددة وحزمة التطوير</h2>
        <p>تضمن النظام حزمة تطوير برمجيات (Client SDK) مكتوبة بلغة TypeScript تتيح 6 سياقات تكاملية:</p>
        <div class="kb-benefits-grid">
          <div class="kb-benefit"><span class="kb-benefit-number">01</span><h3>FHIR/NPHIES</h3><p>تحويل معرفات الـ OID إلى أكواد متوافقة مع الأنظمة الصحية الدولية.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">02</span><h3>X.509</h3><p>تكامل المعرفات مع السياسات الأمنية للشهادات الرقمية.</p></div>
          <div class="kb-benefit"><span class="kb-benefit-number">03</span><h3>MCP / Database / REST / QR</h3><p>بروتوكولات وقواعد بيانات وواجهات ورموز استجابة سريعة وتعريف بموجات الراديو.</p></div>
        </div>

        <h2>البنية التقنية</h2>
        <div class="kb-features-table">
          <div class="kb-feature-row"><div class="kb-feature-name">Frontend</div><div class="kb-feature-desc">React.js + TailwindCSS — شاشات تفاعلية بتصميم عصري داكن وعرض تفاعلي لشجرة الـ OIDs.</div></div>
          <div class="kb-feature-row"><div class="kb-feature-name">Backend</div><div class="kb-feature-desc">FastAPI (Python) — أداء سريع لعمليات API مع PostgreSQL.</div></div>
          <div class="kb-feature-row"><div class="kb-feature-name">Deployment</div><div class="kb-feature-desc">Docker — تشغيل وتعبئة متكاملة لتسهيل النشر.</div></div>
        </div>

        <div class="kb-callout warning">
          <span class="kb-callout-label">التدابير الأمنية</span>
          <p>صُمم هذا النظام للاستخدام الداخلي الحصري داخل شبكة BrainSAIT، ويتطلب وضعه خلف بوابات مصادقة تنظيمية صارمة (مثل وكيل الهوية الذكي) وتجنب تضمين بيانات الاعتماد مباشرة في حزم المتصفح.</p>
        </div>
      </article>
    `,
  },
  {
    slug: "brainait-deployment-guide",
    title: "BrainSAIT Local Deployment Guide",
    titleAr: "دليل النشر المحلي لنظام برينسايت",
    category: "media",
    pillar: "Operations",
    readTime: "Video + Audio",
    accent: "#ff8f6b",
    heroQuote: "From clone to production in minutes — the complete BrainSAIT deployment journey.",
    heroQuoteAr: "من الاستنساخ إلى الإنتاج في دقائق — رحلة النشر الكاملة لنظام برينسايت.",
    excerpt: "Video walkthrough of local deployment and audio deep-dive into securing BrainSAIT digital identities — covering Docker, Cloudflare Access, and production hardening.",
    excerptAr: "فيديو تعليمي للنشر المحلي وصوتي متعمق في تأمين الهويات الرقمية — يغطي Docker وCloudflare Access وتأمين الإنتاج.",
    tags: ["deployment", "Docker", "Cloudflare", "security", "video", "audio"],
    relatedProducts: ["oid-verification-badge", "enterprise-namespace-license"],
    media: [
      { type: "video", label: "Local Deployment — A Complete Guide", labelAr: "النشر المحلي — دليل كامل", src: `${KB_MEDIA_BASE}/local-deployment-guide.mp4`, mime: "video/mp4" },
      { type: "video", label: "From Silos to Sovereignty — The Future of Digital Identity", labelAr: "من الأجزاء المنعزلة إلى السيادة — مستقبل الهوية الرقمية", src: `${KB_MEDIA_BASE}/silos-to-sovereignty.mp4`, mime: "video/mp4" },
      { type: "audio", label: "Securing Digital Identities — Audio Deep Dive", labelAr: "تأمين الهويات الرقمية — غوص صوتي متعمق", src: `${KB_MEDIA_BASE}/securing-digital-identities.m4a`, mime: "audio/mp4" },
      { type: "image", label: "OID Badge Management System Architecture", labelAr: "عمارة نظام إدارة شارات المعرفات", src: `${KB_MEDIA_BASE}/oid-badge-architecture.png`, mime: "image/png" },
    ],
    content: `
      <article class="kb-article-body" dir="rtl" lang="ar">
        <p class="kb-lead">موارد الوسائط المتعددة التي تشرح عملية النشر المحلي وتأمين الهويات الرقمية — تُبث مباشرة من Cloudflare R2 بجودة كاملة.</p>

        <h2>فيديو: النشر المحلي — دليل كامل</h2>
        <p>BrainSAIT Local Deployment: A Complete Guide — شرح خطوة بخطوة لإعداد النظام محلياً باستخدام Docker.</p>
        <div class="kb-player">
          <video controls preload="metadata" playsinline src="https://pub-633a4a994fe14149944a6cac31d38e8f.r2.dev/kb/local-deployment-guide.mp4"></video>
        </div>

        <h2>فيديو: من الأجزاء المنعزلة إلى السيادة</h2>
        <p>From Silos to Sovereignty: The Future of Digital Identity — رؤية استراتيجية لمستقبل الهوية الرقمية وتحولها من أنظمة معزولة إلى منظومات سيادية متكاملة.</p>
        <div class="kb-player">
          <video controls preload="metadata" playsinline src="https://pub-633a4a994fe14149944a6cac31d38e8f.r2.dev/kb/silos-to-sovereignty.mp4"></video>
        </div>

        <h2>صوتي: تأمين الهويات الرقمية</h2>
        <p>نظام برينسايت لتأمين الهويات الرقمية — غوص صوتي متعمق في آليات الحماية والتوثيق والتحقق.</p>
        <div class="kb-player audio">
          <audio controls preload="metadata" src="https://pub-633a4a994fe14149944a6cac31d38e8f.r2.dev/kb/securing-digital-identities.m4a"></audio>
        </div>

        <h2>مخطط: عمارة نظام إدارة الشارات</h2>
        <p>نظام إدارة شارات معرفات الكائنات — مخطط العمارة التقنية الكاملة: الواجهة الأمامية والخلفية والذكاء الاصطناعي وشجرة OID وإدارة الشارات وDocker.</p>
        <div class="kb-player">
          <img loading="lazy" decoding="async" alt="مخطط عمارة نظام إدارة شارات معرفات الكائنات BrainSAIT OID" src="https://pub-633a4a994fe14149944a6cac31d38e8f.r2.dev/kb/oid-badge-architecture.png" />
        </div>
      </article>
    `,
  },
];

export function findKBArticle(slug: string): KBArticle | undefined {
  return KB_ARTICLES.find((article) => article.slug === slug);
}

export function getKBArticlesByCategory(category: string): KBArticle[] {
  if (category === "all") return KB_ARTICLES;
  return KB_ARTICLES.filter((article) => article.category === category);
}
