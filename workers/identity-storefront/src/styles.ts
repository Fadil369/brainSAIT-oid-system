export const CSS = String.raw`
@import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

/* ═══════════════════════════════════════════════
   THEME SYSTEM — dark default, light toggle
   ═══════════════════════════════════════════════ */

:root {
  --bg: #0a0a0b;
  --bg-raised: #111113;
  --bg-card: #161618;
  --bg-hover: #1c1c1f;
  --ink: #e8e4de;
  --ink-strong: #f5f1ea;
  --muted: #8a857d;
  --soft: #b5b0a8;
  --gold: #c9a96e;
  --gold-soft: #dfc088;
  --gold-glow: rgba(201,169,110,.12);
  --teal: #2ec4a6;
  --cyan: #5ad4e6;
  --teal-glow: rgba(46,196,166,.1);
  --amber: #d4a853;
  --rose: #c97b6b;
  --line: rgba(255,255,255,.07);
  --line-strong: rgba(255,255,255,.12);
  --radius-xl: 28px;
  --radius-lg: 20px;
  --radius-md: 14px;
  --max: 1120px;
  --gutter: 20px;
  color-scheme: dark;
}

[data-theme="light"] {
  --bg: #f8f6f2;
  --bg-raised: #ffffff;
  --bg-card: #ffffff;
  --bg-hover: #f0ede8;
  --ink: #1a1814;
  --ink-strong: #0e0d0b;
  --muted: #6b6560;
  --soft: #4a4540;
  --gold: #8b6d2f;
  --gold-soft: #a07d3a;
  --gold-glow: rgba(139,109,47,.08);
  --teal: #1a8a72;
  --cyan: #2a9aaa;
  --teal-glow: rgba(26,138,114,.06);
  --amber: #9a7a2a;
  --rose: #a05a4a;
  --line: rgba(0,0,0,.08);
  --line-strong: rgba(0,0,0,.14);
  color-scheme: light;
}

/* ═══════════════════════════════════════════════
   FOUNDATIONS
   ═══════════════════════════════════════════════ */

* { box-sizing: border-box; }
html { scroll-behavior: smooth; background: var(--bg); }
body {
  margin: 0;
  color: var(--ink);
  background: var(--bg);
  font-family: "IBM Plex Sans Arabic", "Inter", system-ui, sans-serif;
  font-size: 17px;
  line-height: 1.8;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

a { color: inherit; text-decoration: none; }
button, input, textarea { font: inherit; }
img, video { max-width: 100%; display: block; }

.skip {
  position: absolute;
  left: -9999px;
  z-index: 99;
  padding: .6rem 1rem;
  background: var(--ink);
  color: var(--bg);
  border-radius: var(--radius-md);
}
.skip:focus { left: 1rem; top: 1rem; }

.shell { width: min(var(--max), calc(100% - var(--gutter) * 2)); margin: 0 auto; }

/* ═══════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════ */

.site-header {
  position: sticky;
  top: 8px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .6rem;
  padding: .5rem .65rem;
  margin: 8px auto 0;
  width: min(var(--max), calc(100% - var(--gutter) * 2));
  border: 1px solid var(--line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(20px) saturate(140%);
}

.brand { display: flex; align-items: center; gap: .55rem; min-width: max-content; }
.mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--bg);
  font-weight: 900;
  font-size: .78rem;
  letter-spacing: -.08em;
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
}
.brand-title { display: block; font-weight: 700; font-size: .88rem; }
.brand-sub { display: block; color: var(--muted); font-size: .64rem; }

.nav { display: none; gap: .85rem; color: var(--muted); font-size: .92rem; font-weight: 500; }
.nav a { transition: color .2s; }
.nav a:hover { color: var(--ink); }
.header-cta { display: flex; gap: .35rem; align-items: center; }

/* ═══════════════════════════════════════════════
   BUTTONS & PILLS
   ═══════════════════════════════════════════════ */

.pill, .btn, .toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .4rem;
  border-radius: 999px;
  min-height: 40px;
  padding: 0 .9rem;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-weight: 700;
  font-size: .9rem;
  transition: all .2s;
  cursor: pointer;
  white-space: nowrap;
}
.pill { color: var(--muted); font-size: .78rem; min-height: 30px; padding: 0 .6rem; }
.btn:hover { border-color: var(--line-strong); background: var(--bg-hover); }
.btn-primary { color: var(--bg); border-color: transparent; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); }
.btn-primary:hover { opacity: .88; }
.btn-teal { color: var(--bg); border-color: transparent; background: linear-gradient(135deg, var(--teal), var(--cyan)); }
.btn-wide { min-height: 48px; padding: 0 1.2rem; font-size: .96rem; }
.toggle { min-height: 34px; padding: 0 .65rem; font-size: .82rem; color: var(--muted); }
.toggle:hover { color: var(--ink); border-color: var(--line-strong); }
.toggle.active { color: var(--gold); border-color: rgba(201,169,110,.3); background: var(--gold-glow); }

/* ═══════════════════════════════════════════════
   TYPOGRAPHY — Aref Ruqaa for display
   ═══════════════════════════════════════════════ */

.display {
  margin: 0;
  font-family: "Aref Ruqaa", "IBM Plex Sans Arabic", serif;
  font-size: clamp(2.4rem, 7.5vw, 4.8rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -.01em;
  color: var(--ink-strong);
}
.headline {
  font-family: "Aref Ruqaa", "IBM Plex Sans Arabic", serif;
  font-weight: 700;
  line-height: 1.15;
}
.lead {
  margin: 1rem 0 0;
  max-width: 620px;
  color: var(--soft);
  font-size: clamp(1rem, 1.7vw, 1.15rem);
  line-height: 1.9;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  margin: 0 0 .65rem;
  color: var(--gold);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.eyebrow::before { content: ""; width: 20px; height: 1px; background: var(--gold); opacity: .5; }

/* ═══════════════════════════════════════════════
   SECTIONS
   ═══════════════════════════════════════════════ */

.section { padding: clamp(2rem, 6vw, 4rem) 0 0; }
.section-head { margin-bottom: 1rem; }
.section-title { margin: 0; max-width: 660px; font-size: clamp(1.7rem, 4.2vw, 3.4rem); }
.section-copy { margin: .6rem 0 0; max-width: 600px; color: var(--muted); font-size: .95rem; line-height: 1.8; }

/* ═══════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════ */

.hero { padding: clamp(3.5rem, 11vw, 7rem) 0 clamp(1.5rem, 4vw, 3rem); }
.hero .lead { max-width: 560px; }
.hero-actions { display: flex; flex-wrap: wrap; gap: .55rem; margin-top: 1.2rem; }
.trust-strip { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: 1rem; }

/* ═══════════════════════════════════════════════
   CARDS
   ═══════════════════════════════════════════════ */

.product-grid { display: grid; grid-template-columns: 1fr; gap: .65rem; }
.product-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: var(--bg-card);
  transition: border-color .25s, transform .25s;
}
.product-card:hover { border-color: var(--line-strong); transform: translateY(-2px); }
.product-card.featured { border-color: rgba(201,169,110,.2); }
.product-meta { display: flex; justify-content: space-between; gap: .4rem; color: var(--muted); font-size: .74rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.product-card h3 { margin: 1rem 0 .35rem; font-size: clamp(1.4rem, 2.4vw, 1.9rem); }
.product-card p { color: var(--muted); line-height: 1.75; margin: 0; font-size: .96rem; }
.product-card .signal { margin-top: .75rem; padding-top: .65rem; border-top: 1px solid var(--line); color: var(--soft); font-size: .92rem; }
.product-card .signal span { display: block; color: var(--gold); font-size: .66rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: .15rem; }
.price { margin: .75rem 0 0; color: var(--gold-soft); font-weight: 700; font-size: .96rem; }
.card-actions { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: auto; padding-top: .85rem; }

/* ═══════════════════════════════════════════════
   FEATURE BAND
   ═══════════════════════════════════════════════ */

.feature-band {
  border: 1px solid rgba(201,169,110,.12);
  border-radius: var(--radius-xl);
  padding: 1.1rem;
  background: var(--bg-card);
}
.feature-band h2 { margin: 0; font-size: clamp(1.6rem, 4.5vw, 3.4rem); }
.arabic-line { margin: .65rem 0 0; color: var(--gold-soft); font-family: "IBM Plex Sans Arabic", sans-serif; font-size: clamp(1rem, 2.2vw, 1.4rem); line-height: 1.8; }
.feature-copy { color: var(--soft); line-height: 1.8; margin-top: .5rem; }
.feature-panel {
  margin-top: .85rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: var(--bg);
}
.feature-panel ul, .clean-list { list-style: none; padding: 0; margin: 0; display: grid; gap: .5rem; }
.feature-panel li, .clean-list li { display: flex; gap: .5rem; align-items: flex-start; color: var(--soft); font-size: .9rem; line-height: 1.65; }
.feature-panel li::before, .clean-list li::before { content: ""; flex-shrink: 0; width: 5px; height: 5px; margin-top: .5rem; border-radius: 50%; background: var(--gold); }

/* ═══════════════════════════════════════════════
   ARCHITECTURE MAP
   ═══════════════════════════════════════════════ */

.architecture-map { display: grid; grid-template-columns: 1fr; gap: .55rem; border: 1px solid var(--line); border-radius: var(--radius-xl); padding: 1.1rem; background: var(--bg-card); }
.system-node { border: 1px solid var(--line); border-radius: var(--radius-lg); padding: .9rem; background: var(--bg); }
.system-node span { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; color: var(--bg); background: linear-gradient(135deg, var(--gold-soft), var(--gold)); font-weight: 900; font-size: .68rem; }
.system-node h3 { margin: .75rem 0 .3rem; font-size: 1rem; }
.system-node p { margin: 0; color: var(--muted); font-size: .84rem; line-height: 1.6; }
.system-node.registry { border-color: rgba(46,196,166,.15); }
.architecture-spine { display: grid; place-items: center; padding: .75rem; text-align: center; border: 1px dashed rgba(201,169,110,.12); border-radius: var(--radius-lg); color: rgba(232,228,222,.06); }
.architecture-spine b { font-family: "Aref Ruqaa", serif; font-size: clamp(1.2rem, 3.5vw, 2rem); }
.architecture-spine span { font-size: .64rem; text-transform: uppercase; letter-spacing: .12em; color: rgba(232,228,222,.12); }

/* ═══════════════════════════════════════════════
   PATHFINDER
   ═══════════════════════════════════════════════ */

.pathfinder { border: 1px solid rgba(46,196,166,.12); border-radius: var(--radius-xl); padding: 1.1rem; background: var(--bg-card); }
.pathfinder h2 { margin: 0; font-size: clamp(1.4rem, 3.5vw, 2.8rem); }
.pathfinder p { color: var(--soft); line-height: 1.75; }
.segment-grid { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .75rem; }
.segment { min-height: 32px; border: 1px solid var(--line); border-radius: 999px; padding: 0 .7rem; color: var(--muted); background: transparent; cursor: pointer; font-weight: 700; font-size: .78rem; transition: all .2s; }
.segment.active, .segment:hover { color: var(--bg); border-color: transparent; background: linear-gradient(135deg, var(--teal), var(--cyan)); }
.recommendation { margin-top: .85rem; border: 1px solid rgba(46,196,166,.15); border-radius: var(--radius-lg); padding: .9rem; background: var(--bg); }
.recommendation span { color: var(--gold); font-size: .64rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.recommendation h3 { margin: .65rem 0 .4rem; font-size: clamp(1.2rem, 2.2vw, 1.8rem); }
.recommendation p { margin: 0; color: var(--soft); }

/* ═══════════════════════════════════════════════
   VERIFY LAUNCHER
   ═══════════════════════════════════════════════ */

.verify-launcher { margin-top: .85rem; max-width: 500px; border: 1px solid rgba(46,196,166,.12); border-radius: var(--radius-lg); padding: .75rem; background: var(--bg-card); }
.verify-launcher label { display: block; color: var(--gold); font-size: .82rem; font-weight: 700; margin-bottom: .4rem; }
.verify-launcher div { display: flex; gap: .35rem; }
.verify-launcher input { flex: 1; min-height: 42px; border: 1px solid var(--line); border-radius: 999px; padding: 0 .85rem; color: var(--ink); background: var(--bg); font-size: .92rem; outline: none; }
.verify-launcher input:focus { border-color: rgba(46,196,166,.35); }
.verify-launcher small { display: block; margin-top: .35rem; color: var(--muted); font-size: .72rem; }

/* ═══════════════════════════════════════════════
   STORY GRID
   ═══════════════════════════════════════════════ */

.story-grid { display: grid; grid-template-columns: 1fr; gap: .55rem; }
.story-tile { border: 1px solid var(--line); border-radius: var(--radius-lg); padding: .85rem; background: var(--bg-card); }
.story-tile b { display: block; color: var(--gold); margin-bottom: .3rem; font-size: .92rem; }
.story-tile p { margin: 0; color: var(--muted); font-size: .94rem; line-height: 1.7; }

/* ═══════════════════════════════════════════════
   PRODUCT PAGE
   ═══════════════════════════════════════════════ */

.product-hero { padding: clamp(2.5rem, 8vw, 4.5rem) 0 1rem; }
.breadcrumb { display: flex; flex-wrap: wrap; gap: .3rem; color: var(--muted); font-size: .84rem; margin-bottom: .75rem; }
.breadcrumb a:hover { color: var(--ink); }
.product-layout { display: grid; grid-template-columns: 1fr; gap: .75rem; }
.product-main, .buy-box, .panel { border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--bg-card); }
.product-main { padding: 1.1rem; }
.product-main h1 { margin: 0; font-size: clamp(1.8rem, 5.5vw, 3.8rem); }
.product-story { margin: 1rem 0 0; color: var(--soft); font-size: 1.05rem; line-height: 2; }
.product-story-ar { color: var(--gold-soft); font-family: "IBM Plex Sans Arabic", sans-serif; font-size: 1.1rem; line-height: 2.1; margin-top: .75rem; direction: rtl; }
.dossier-strip { margin-top: 1rem; border: 1px solid rgba(201,169,110,.12); border-radius: var(--radius-lg); padding: .85rem; background: var(--bg); }
.dossier-strip b { display: block; color: var(--gold-soft); font-size: 1.05rem; }
.dossier-strip span { display: block; color: var(--soft); line-height: 1.7; margin-top: .2rem; }
.buy-box { padding: .9rem; }
.buy-box .price { margin: .35rem 0 .75rem; }
.buy-actions { display: grid; gap: .4rem; }
.detail-grid { display: grid; grid-template-columns: 1fr; gap: .65rem; margin-top: .75rem; }
.panel { padding: .9rem; }
.panel h2 { margin: 0 0 .6rem; font-size: 1.2rem; }
.spec-row { display: flex; justify-content: space-between; gap: .65rem; border-top: 1px solid var(--line); padding-top: .55rem; margin-top: .55rem; color: var(--muted); font-size: .9rem; }
.spec-row strong { color: var(--ink); text-align: right; }
.dossier { display: grid; grid-template-columns: 1fr; gap: .65rem; }
.dossier-panel span { display: block; color: var(--gold); font-size: .7rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.dossier-panel h2 { margin: .5rem 0 0; line-height: 1.15; font-size: 1.12rem; }
.runway { display: grid; grid-template-columns: 1fr; gap: .55rem; }
.runway-step { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius-lg); padding: .8rem; background: var(--bg-card); }
.runway-step::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), var(--teal), transparent); opacity: .4; }
.runway-step span { color: var(--muted); font-weight: 700; font-size: .8rem; }
.runway-step b { display: block; margin: .55rem 0 .3rem; color: var(--ink); font-size: 1.05rem; }
.runway-step p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.6; }
.shock-board { border: 1px solid rgba(201,169,110,.12); border-radius: var(--radius-xl); padding: 1.1rem; background: var(--bg-card); }
.shock-board h2 { margin: 0; font-size: clamp(1.5rem, 3.8vw, 3rem); }
.shock-board p { color: var(--soft); line-height: 1.8; font-size: 1rem; }
.closing { margin: clamp(2.5rem, 6vw, 4rem) 0 1rem; border: 1px solid var(--line); border-radius: var(--radius-xl); padding: 1.2rem; text-align: center; background: var(--bg-card); }
.closing h2 { margin: 0; font-size: clamp(1.5rem, 3.8vw, 3rem); }
.closing p { margin: .65rem auto 0; max-width: 580px; color: var(--soft); line-height: 1.8; font-size: 1rem; }
.footer { display: flex; flex-direction: column; align-items: center; gap: .4rem; text-align: center; padding: 1.2rem 0 1.5rem; color: var(--muted); font-size: .84rem; }

/* ═══════════════════════════════════════════════
   KNOWLEDGE HUB
   ═══════════════════════════════════════════════ */

.kb-hub-hero { padding: clamp(2.5rem, 9vw, 5rem) 0 1.5rem; text-align: center; }
.kb-hub-hero .display { max-width: 100%; }
.kb-hub-hero .lead { margin: .85rem auto 0; max-width: 620px; text-align: center; }
.kb-pillars { display: flex; flex-wrap: wrap; gap: .35rem; justify-content: center; margin-top: 1.2rem; }
.kb-pill { display: inline-flex; align-items: center; min-height: 32px; padding: 0 .8rem; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); background: transparent; font-size: .82rem; font-weight: 700; transition: all .2s; cursor: pointer; }
.kb-pill:hover, .kb-pill.active { color: var(--bg); border-color: transparent; background: var(--gold); }
.kb-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: .55rem; margin: clamp(1.2rem, 3.5vw, 2.5rem) 0; }
.kb-stat { border: 1px solid var(--line); border-radius: var(--radius-lg); padding: .9rem; text-align: center; background: var(--bg-card); }
.kb-stat-number { display: block; color: var(--gold-soft); font-family: "Aref Ruqaa", serif; font-size: clamp(1.7rem, 4.8vw, 2.6rem); font-weight: 700; line-height: 1; }
.kb-stat-label { display: block; color: var(--muted); font-size: .7rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-top: .25rem; }
.kb-featured { border: 1px solid rgba(201,169,110,.12); border-radius: var(--radius-xl); padding: 1.1rem; background: var(--bg-card); }
.kb-featured-meta { display: flex; flex-wrap: wrap; gap: .3rem; margin-bottom: .6rem; }
.kb-featured-quote { margin: .85rem 0 0; color: var(--gold-soft); font-family: "Aref Ruqaa", serif; font-size: clamp(1.1rem, 1.9vw, 1.35rem); line-height: 1.65; }
.kb-featured-quote-ar { margin: .5rem 0 0; color: var(--soft); font-family: "IBM Plex Sans Arabic", sans-serif; font-size: 1.05rem; line-height: 1.9; direction: rtl; text-align: right; }
.kb-featured h2 { margin: 0 0 .4rem; font-size: clamp(1.5rem, 3.8vw, 2.8rem); }
.kb-featured p { color: var(--muted); line-height: 1.8; max-width: 580px; }
.kb-featured-side { margin-top: .85rem; border: 1px solid var(--line); border-radius: var(--radius-lg); padding: .9rem; background: var(--bg); }
.kb-featured-side .btn { width: 100%; }
.kb-grid { display: grid; grid-template-columns: 1fr; gap: .55rem; margin-top: .75rem; }
.kb-card { position: relative; overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: var(--radius-lg); padding: .9rem; background: var(--bg-card); transition: border-color .25s, transform .25s; }
.kb-card:hover { border-color: var(--line-strong); transform: translateY(-2px); }
.kb-card-meta { display: flex; justify-content: space-between; gap: .35rem; color: var(--muted); font-size: .68rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.kb-card h3 { margin: .85rem 0 .35rem; font-size: clamp(1.15rem, 2vw, 1.55rem); }
.kb-card p { margin: 0; color: var(--muted); font-size: .92rem; line-height: 1.7; flex: 1; }
.kb-card-tags { display: flex; flex-wrap: wrap; gap: .25rem; margin-top: .75rem; }
.kb-card-tag { font-size: .64rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: .2rem .45rem; }
.kb-card-actions { display: flex; gap: .35rem; margin-top: auto; padding-top: .75rem; }

/* Article page */
.kb-article-hero { padding: clamp(2.5rem, 8vw, 4.5rem) 0 1rem; }
.kb-article-hero h1 { margin: 0; font-size: clamp(1.7rem, 4.8vw, 3.4rem); }
.kb-article-meta { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .85rem; }
.kb-article-body { padding: clamp(1.2rem, 3.5vw, 2rem) 0; }
.kb-article-body h2 { margin: clamp(1.2rem, 3vw, 2rem) 0 .75rem; font-family: "Aref Ruqaa", "IBM Plex Sans Arabic", serif; font-size: clamp(1.35rem, 2.8vw, 2.1rem); font-weight: 700; line-height: 1.25; color: var(--ink-strong); }
.kb-article-body p { margin: 0 0 1rem; color: var(--soft); font-size: 1.08rem; line-height: 2.05; max-width: 720px; }
.kb-article-body ol, .kb-article-body ul { padding-right: 1.2rem; color: var(--soft); font-size: 1.04rem; line-height: 2; }
.kb-article-body li { margin-bottom: .5rem; }
.kb-article-body code { padding: .15rem .4rem; border: 1px solid var(--line); border-radius: 4px; background: var(--bg); color: var(--cyan); font-size: .88rem; }
.kb-lead { margin: 0 0 1.5rem; color: var(--ink); font-size: clamp(1.08rem, 1.8vw, 1.2rem); line-height: 2.1; max-width: 720px; border-right: 2px solid var(--gold); padding-right: .9rem; }
.kb-callout { margin: 1.3rem 0; border: 1px solid rgba(201,169,110,.12); border-radius: var(--radius-lg); padding: .9rem; background: var(--bg-raised); }
.kb-callout.warning { border-color: rgba(201,123,107,.12); }
.kb-callout-label { display: block; color: var(--gold); font-size: .68rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; margin-bottom: .35rem; }
.kb-callout.warning .kb-callout-label { color: var(--rose); }
.kb-callout p { margin: 0; color: var(--soft); font-size: .96rem; line-height: 1.9; }
.kb-callout ol { margin: .35rem 0 0; padding-right: .9rem; }
.kb-callout li { margin-bottom: .35rem; color: var(--soft); font-size: .96rem; line-height: 1.8; }
.kb-insight { margin: 1.3rem 0; border: 1px solid rgba(46,196,166,.12); border-radius: var(--radius-lg); padding: .9rem; background: var(--bg-raised); }
.kb-insight-label { display: block; color: var(--teal); font-size: .68rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; margin-bottom: .35rem; }
.kb-insight p, .kb-insight ol { margin: 0; color: var(--soft); font-size: .96rem; line-height: 1.9; }
.kb-insight li { margin-bottom: .35rem; }
.kb-benefits-grid { display: grid; grid-template-columns: 1fr; gap: .55rem; margin: 1rem 0; }
.kb-benefit { border: 1px solid var(--line); border-radius: var(--radius-lg); padding: .85rem; background: var(--bg-card); }
.kb-benefit-number { display: block; color: var(--gold-soft); font-family: "Aref Ruqaa", serif; font-size: 1.4rem; font-weight: 700; line-height: 1; margin-bottom: .3rem; }
.kb-benefit h3 { margin: 0 0 .25rem; font-size: 1.05rem; }
.kb-benefit p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.65; }
.kb-features-table { margin: 1rem 0; border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; }
.kb-feature-row { padding: .8rem .95rem; border-bottom: 1px solid var(--line); }
.kb-feature-row:last-child { border-bottom: none; }
.kb-feature-name { color: var(--ink); font-weight: 700; font-size: .96rem; margin-bottom: .15rem; }
.kb-feature-desc { color: var(--muted); font-size: .9rem; line-height: 1.65; }
.kb-api-endpoints { margin: 1rem 0; display: grid; gap: .4rem; }
.kb-endpoint { display: flex; align-items: center; gap: .65rem; border: 1px solid var(--line); border-radius: var(--radius-md); padding: .6rem .8rem; background: var(--bg-card); }
.kb-endpoint code { flex-shrink: 0; font-weight: 700; color: var(--cyan); font-size: .84rem; }
.kb-endpoint span { color: var(--muted); font-size: .9rem; line-height: 1.55; }
.kb-schema-table { margin: 1rem 0; border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; }
.kb-schema-header, .kb-schema-row { padding: .6rem .8rem; }
.kb-schema-header { background: var(--bg-raised); color: var(--gold); font-size: .68rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.kb-schema-row { border-top: 1px solid var(--line); color: var(--muted); font-size: .9rem; }
.kb-schema-row code { color: var(--cyan); border: none; padding: 0; background: none; }
.kb-tree-diagram { margin: 1.3rem 0; padding: .9rem; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--bg-card); }
.kb-tree-node { display: flex; flex-wrap: wrap; gap: .2rem .65rem; align-items: baseline; padding: .4rem 0; border-bottom: 1px solid rgba(255,255,255,.03); }
.kb-tree-node:last-child { border-bottom: none; }
.kb-tree-node.highlight { border-right: 2px solid var(--teal); padding-right: .65rem; }
.kb-tree-label { color: var(--ink); font-weight: 700; font-family: "Inter", monospace; font-size: .9rem; }
.kb-tree-desc { color: var(--muted); font-size: .84rem; }
.kb-media-grid { display: grid; grid-template-columns: 1fr; gap: .55rem; margin: 1.2rem 0; }
.kb-media-card { border: 1px solid var(--line); border-radius: var(--radius-lg); padding: .95rem; background: var(--bg-card); transition: border-color .22s; }
.kb-media-card:hover { border-color: var(--line-strong); }
.kb-media-icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); color: var(--bg); margin-bottom: .65rem; }
.kb-media-icon svg { width: 16px; height: 16px; }
.kb-media-card h3 { margin: 0 0 .3rem; font-size: 1.05rem; }
.kb-media-card p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.65; }
.kb-media-badge { display: inline-block; margin-top: .6rem; color: var(--gold); font-size: .64rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; border: 1px solid rgba(201,169,110,.15); border-radius: 999px; padding: .18rem .5rem; }

/* ═══════════════════════════════════════════════
   MEDIA PLAYERS — video / audio / image
   ═══════════════════════════════════════════════ */

.kb-player { margin: 1.1rem 0 1.6rem; border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; background: #000; }
.kb-player video { width: 100%; max-height: 62vh; display: block; background: #000; }
.kb-player.audio { background: var(--bg-card); padding: .85rem; }
.kb-player audio { width: 100%; display: block; accent-color: var(--gold); }
.kb-player img { width: 100%; height: auto; display: block; background: var(--bg-card); }
.kb-player-caption { padding: .6rem .9rem; font-size: .78rem; color: var(--muted); background: var(--bg-card); border-top: 1px solid var(--line); }

/* ═══════════════════════════════════════════════
   ASSISTANT LAUNCHER — floating GPT access
   ═══════════════════════════════════════════════ */

.gpt-fab {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: .55rem;
  border: none;
  border-radius: 999px;
  padding: 0;
  background: linear-gradient(135deg, var(--teal), var(--cyan));
  color: #fff;
  font-family: "IBM Plex Sans Arabic", "Inter", system-ui, sans-serif;
  font-weight: 700;
  font-size: .88rem;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(46,196,166,.35), 0 0 0 0 rgba(46,196,166,0);
  transition: box-shadow .3s, transform .3s;
  text-decoration: none;
  animation: fab-pulse 3s ease-in-out infinite;
}
.gpt-fab:hover { box-shadow: 0 6px 32px rgba(46,196,166,.5), 0 0 0 4px rgba(46,196,166,.15); transform: translateY(-2px) scale(1.04); }
.gpt-fab:active { transform: scale(.97); }
.gpt-fab-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,.2);
  flex-shrink: 0;
}
.gpt-fab-icon svg { width: 22px; height: 22px; }
.gpt-fab-label { padding-right: .1rem; white-space: nowrap; }

@keyframes fab-pulse {
  0%, 100% { box-shadow: 0 4px 24px rgba(46,196,166,.35), 0 0 0 0 rgba(46,196,166,0); }
  50% { box-shadow: 0 4px 24px rgba(46,196,166,.35), 0 0 0 8px rgba(46,196,166,.08); }
}

.gpt-splash {
  position: fixed;
  bottom: 80px;
  left: 24px;
  z-index: 51;
  max-width: 320px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: var(--bg-raised);
  box-shadow: 0 8px 40px rgba(0,0,0,.35);
  display: none;
}
.gpt-splash.show { display: block; animation: fab-slide .35s ease-out; }
.gpt-splash-arrow { position: absolute; bottom: -7px; left: 20px; width: 14px; height: 14px; background: var(--bg-raised); border-right: 1px solid var(--line-strong); border-bottom: 1px solid var(--line-strong); transform: rotate(45deg); }
.gpt-splash h3 { margin: 0 0 .3rem; font-size: .96rem; color: var(--ink-strong); }
.gpt-splash p { margin: 0 0 .65rem; color: var(--muted); font-size: .84rem; line-height: 1.65; }
.gpt-splash .gpt-splash-actions { display: flex; gap: .4rem; }
.gpt-splash .gpt-splash-dismiss { font-size: .78rem; color: var(--muted); background: none; border: none; cursor: pointer; padding: .3rem .5rem; border-radius: 999px; }
.gpt-splash .gpt-splash-dismiss:hover { background: var(--bg-hover); color: var(--ink); }

@keyframes fab-slide {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════ */

@media (min-width: 640px) {
  :root { --gutter: 24px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .kb-grid { grid-template-columns: repeat(2, 1fr); }
  .kb-stats { grid-template-columns: repeat(4, 1fr); }
  .kb-benefits-grid { grid-template-columns: repeat(2, 1fr); }
  .detail-grid { grid-template-columns: repeat(2, 1fr); }
  .dossier { grid-template-columns: repeat(2, 1fr); }
  .runway { grid-template-columns: repeat(2, 1fr); }
  .story-grid { grid-template-columns: repeat(2, 1fr); }
  .kb-media-grid { grid-template-columns: repeat(2, 1fr); }
  .kb-feature-row { display: grid; grid-template-columns: minmax(0,.32fr) minmax(0,.68fr); gap: .65rem; }
}

@media (min-width: 900px) {
  :root { --gutter: 32px; --max: 1140px; }
  .nav { display: flex; }
  .site-header { top: 10px; padding: .55rem .75rem; }
  .hero { padding: clamp(4.5rem, 13vw, 8rem) 0 clamp(2rem, 4.5vw, 3.5rem); }
  .product-grid { grid-template-columns: repeat(3, 1fr); }
  .product-card.featured { grid-column: span 2; }
  .product-layout { grid-template-columns: minmax(0, 1fr) 320px; gap: .75rem; align-items: start; }
  .buy-box { position: sticky; top: 72px; }
  .kb-grid { grid-template-columns: repeat(3, 1fr); }
  .feature-band { display: grid; grid-template-columns: minmax(0,.88fr) minmax(260px,.62fr); gap: .75rem; align-items: start; }
  .feature-panel { margin-top: 0; }
  .pathfinder { display: grid; grid-template-columns: minmax(0,.88fr) minmax(280px,.52fr); gap: .75rem; align-items: start; }
  .recommendation { margin-top: 0; }
  .kb-featured { display: grid; grid-template-columns: minmax(0,1fr) minmax(280px,.52fr); gap: .75rem; align-items: start; }
  .kb-featured-side { margin-top: 0; }
  .architecture-map { grid-template-columns: repeat(4, 1fr); }
  .architecture-spine { grid-column: 1 / -1; }
  .detail-grid { grid-template-columns: repeat(3, 1fr); }
  .dossier { grid-template-columns: repeat(3, 1fr); }
  .runway { grid-template-columns: repeat(5, 1fr); }
  .story-grid { grid-template-columns: repeat(4, 1fr); }
  .footer { flex-direction: row; justify-content: space-between; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; scroll-behavior: auto !important; }
}

/* ═══════════════════════════════════════════════
   LIVE VERIFY WIDGET
   ═══════════════════════════════════════════════ */

.verify-result { margin-top: .65rem; border: 1px solid var(--line); border-radius: var(--radius-md); padding: .75rem .9rem; font-size: .92rem; line-height: 1.65; display: none; }
.verify-result.show { display: block; }
.verify-result.loading { color: var(--muted); border-style: dashed; }
.verify-result.verified { border-color: rgba(46,196,166,.3); background: var(--teal-glow); }
.verify-result.notfound { border-color: rgba(201,169,110,.2); }
.verify-result.error { border-color: rgba(201,123,107,.25); }
.verify-result b { display: block; margin-bottom: .15rem; }
.verify-result.verified b { color: var(--teal); }
.verify-result.notfound b { color: var(--gold); }
.verify-result.error b { color: var(--rose); }
.verify-result small { color: var(--muted); }
.verify-result code { color: var(--cyan); }

/* ═══════════════════════════════════════════════
   OID TREE EXPLORER
   ═══════════════════════════════════════════════ */

.oid-explorer { border: 1px solid var(--line); border-radius: var(--radius-xl); padding: 1.1rem; background: var(--bg-card); margin-top: .85rem; }
.oid-node { border-right: 2px solid var(--line); margin-right: .4rem; padding-right: .7rem; }
.oid-node-head { display: flex; align-items: center; gap: .5rem; padding: .45rem 0; cursor: pointer; border-radius: var(--radius-md); }
.oid-node-head:hover .oid-label { color: var(--gold-soft); }
.oid-toggle { flex-shrink: 0; width: 24px; height: 24px; border: 1px solid var(--line); border-radius: 50%; display: grid; place-items: center; font-size: .78rem; color: var(--muted); transition: transform .2s; }
.oid-node.open > .oid-node-head .oid-toggle { transform: rotate(90deg); color: var(--gold); border-color: rgba(201,169,110,.3); }
.oid-label { font-family: "Inter", monospace; font-size: .9rem; font-weight: 700; color: var(--ink); direction: ltr; }
.oid-desc { font-size: .86rem; color: var(--muted); }
.oid-children { display: none; margin-top: .25rem; }
.oid-node.open > .oid-children { display: block; }
.oid-leaf { display: flex; flex-wrap: wrap; gap: .2rem .6rem; align-items: baseline; padding: .4rem 0; border-bottom: 1px solid rgba(255,255,255,.03); }
.oid-leaf:last-child { border-bottom: none; }
.oid-leaf .oid-desc { flex-basis: 100%; }
.oid-link { font-size: .8rem; color: var(--teal); }
.oid-link:hover { text-decoration: underline; }

/* ═══════════════════════════════════════════════
   KB SEARCH
   ═══════════════════════════════════════════════ */

.kb-search { position: relative; max-width: 560px; margin: 1.2rem auto 0; }
.kb-search input { width: 100%; min-height: 50px; border: 1px solid var(--line); border-radius: 999px; padding: 0 1.2rem; color: var(--ink); background: var(--bg-card); font-size: 1rem; outline: none; }
.kb-search input:focus { border-color: rgba(201,169,110,.4); }
.kb-search-results { position: absolute; top: calc(100% + 6px); right: 0; left: 0; z-index: 30; border: 1px solid var(--line-strong); border-radius: var(--radius-lg); background: var(--bg-raised); overflow: hidden; display: none; max-height: 320px; overflow-y: auto; }
.kb-search-results.show { display: block; }
.kb-search-item { display: block; padding: .65rem .9rem; border-bottom: 1px solid var(--line); }
.kb-search-item:last-child { border-bottom: none; }
.kb-search-item:hover { background: var(--bg-hover); }
.kb-search-item b { display: block; font-size: .96rem; }
.kb-search-item span { font-size: .8rem; color: var(--muted); }

/* ═══════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════ */

.faq-list { display: grid; gap: .5rem; margin-top: .85rem; }
.faq-item { border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--bg-card); overflow: hidden; }
.faq-q { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: .75rem; padding: .9rem 1.1rem; background: none; border: none; color: var(--ink); font-weight: 700; font-size: 1rem; text-align: start; cursor: pointer; }
.faq-q:hover { color: var(--gold-soft); }
.faq-q .faq-icon { flex-shrink: 0; transition: transform .2s; color: var(--gold); }
.faq-item.open .faq-q .faq-icon { transform: rotate(45deg); }
.faq-a { display: none; padding: 0 1.1rem 1rem; color: var(--soft); font-size: .96rem; line-height: 1.9; }
.faq-item.open .faq-a { display: block; }

/* ═══════════════════════════════════════════════
   READING PROGRESS
   ═══════════════════════════════════════════════ */

.read-progress { position: fixed; top: 0; right: 0; left: 0; height: 2px; z-index: 60; background: transparent; }
.read-progress span { display: block; height: 100%; width: 0; background: linear-gradient(90deg, var(--gold), var(--teal)); transition: width .1s linear; }

/* ═══════════════════════════════════════════════
   COMPARE TABLE
   ═══════════════════════════════════════════════ */

.compare-wrap { overflow-x: auto; margin-top: .85rem; border: 1px solid var(--line); border-radius: var(--radius-lg); }
.compare-table { width: 100%; min-width: 560px; border-collapse: collapse; font-size: .9rem; }
.compare-table th, .compare-table td { padding: .7rem .9rem; text-align: start; border-bottom: 1px solid var(--line); }
.compare-table thead th { background: var(--bg-raised); color: var(--gold-soft); font-size: .78rem; font-weight: 700; }
.compare-table tbody tr:last-child td { border-bottom: none; }
.compare-table tbody tr:hover td { background: var(--bg-hover); }
.compare-table td:first-child { color: var(--muted); font-weight: 600; white-space: nowrap; }

/* ═══════════════════════════════════════════════
   PRINT — articles print cleanly
   ═══════════════════════════════════════════════ */

@media print {
  .site-header, .footer, .hero-actions, .verify-launcher, .pathfinder, .kb-search, .read-progress, .card-actions, .buy-actions, #theme-toggle { display: none !important; }
  body { background: #fff; color: #111; font-size: 12pt; }
  .display, .headline, .kb-article-body h2 { color: #111; }
  .kb-article-body p, .kb-article-body li { color: #333; font-size: 11pt; line-height: 1.9; }
  .product-card, .kb-card, .panel, .buy-box, .feature-band, .kb-callout, .kb-insight { break-inside: avoid; border: 1px solid #ccc; background: none; }
}
`;
