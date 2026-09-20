// Clinical Copilot endpoint — real Workers AI LLM + Vectorize RAG grounding + constitutional prompt.
// Routes: /copilot/*   (POST /copilot)
//
// Pipeline: mode detection → (optional) registry + medical-vector grounding →
//   system msg = constitution + mode appendix + grounded context + output note →
//   env.AI.run(COPILOT_MODEL, messages). Falls back to a small built-in responder
//   when the AI binding/med index or deployed model is unavailable.

import { json, badRequest, methodNotAllowed } from '../lib/http.js';
import { CONSTITUTION, MODE_APPENDIX, ragInstruction, OUTPUT_NOTE } from '../lib/copilotPrompt.js';

// ---------------- route dispatch ----------------
export async function handleCopilot(request, env, subpath) {
  if (subpath === '/_seed' && request.method === 'POST') return seedMedicalIndex(request, env);
  if (subpath === '/_dims' && request.method === 'GET') return dimsCheck(env);
  if (subpath === '/' && request.method === 'POST') return copilotChat(request, env);
  return methodNotAllowed();
}

// ---------------- helpers ----------------
async function readJsonBody(req) {
  try { return await req.json(); } catch { return null; }
}

const MODEL = () => '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const EMBED = '@cf/baai/bge-base-en-v1.5';
const MODE_KEYS = ['doctor', 'cdi', 'rcm', 'patient', 'general'];

function detectMode(text, hint) {
  if (hint && MODE_KEYS.includes(hint)) return hint;
  const lower = (text || '').toLowerCase();
  const scores = { doctor: 0, cdi: 0, rcm: 0, patient: 0 };
  const add = (k, v) => { scores[k] += v; };
  for (const w of ['symptom','diagnosis','treatment','prescribe','differential','medication','dose','assessment','chief complaint','history','examination','investigation']) if (lower.includes(w)) scores.doctor++;
  for (const w of ['cdi','coding','icd','documentation','clarification','severity','comorbidity','principal diagnosis','documenta','query']) if (lower.includes(w)) scores.cdi++;
  for (const w of ['claims','denial','reimbursement','nphies','eligibility','authorization','referral','rcm','revenue','appeal','billing','denial']) if (lower.includes(w)) scores.rcm++;
  for (const w of ['my ','i feel','what is','why do i','normal range','should i','worried','myself','family']) if (lower.includes(w)) scores.patient++;
  // Arabic boosters
  for (const w of ['عرض','تشخيص','علاج','جرعة','دواء','أعراض','تقييم','طبيب']) if (lower.includes(w)) scores.doctor += 2;
  for (const w of ['توثيق','ترميز','هيئة','شدة','توضيح']) if (lower.includes(w)) scores.cdi += 2;
  for (const w of ['مطالبة','رفض','استرداد','مالي','فواتير']) if (lower.includes(w)) scores.rcm += 2;
  for (const w of ['أشعر','أعاني','ألم','طبيعي','ماذا أفعل','انزعاج']) if (lower.includes(w)) scores.patient += 2;
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] ? best[0] : 'general';
}

const URGENT = ['chest pain','ambulance','unconscious','heart attack','stroke','cannot breathe',"can't breathe",'overdose','suicide','severe hemorrhage','choking'];
const SAUDI_URGENT = ['ألم في الصدر','إغماء','نوبة','لا يستطيع التنفس','أزمة قلبية','جلطة','انتحار'];

// returns text to inject when red-flag terminology present (plus a hard redirect)
function safetyNote(text, lang) {
  const t = text || '';
  const tl = t.toLowerCase();
  const hit = URGENT.some(x => tl.includes(x)) || SAUDI_URGENT.some(x => t.includes(x));
  if (!hit) return { hit: false, note: '' };
  const note = lang === 'ar'
    ? 'تم اكتشاف مفردات قد تشير إلى حالة عاجلة. إذا كانت حالة طارئة فعلية اتصل فوراً بــ 997 (الإسعاف السعودي) أو 911، ولا تنتظر رد المساعد. عبّر عن ذلك بوضوح في بداية ردك إن كان مناسباً.'
    : 'Emergency red-flag wording was detected. If this is a real emergency, direct the person immediately to 997 (Saudi ambulance) or 911 and do not substitute for urgent care. Act accordingly.';
  return { hit: true, note };
}

// -------- registry grounding (SPID/OID/verify questions) --------
async function registryContext(env, text) {
  try {
    const lower = (text || '').toLowerCase();
    const wants = lower.includes('spid') || lower.includes('verify') ||
      lower.includes('oid') || lower.includes('هوية') || lower.includes('تحقق') || lower.includes('معرف');
    if (!wants) return '';
    const rows = await env.DB.prepare(
      `SELECT spid, oid, name_english, name_arabic, provider_type, specialty, subspecialty, verification_status, profile_status
       FROM providers WHERE profile_status='published' LIMIT 8`
    ).all();
    const list = rows?.results || rows || [];
    if (!Array.isArray(list) || !list.length) return '';
    const lines = list.map(r =>
      `- ${r.spid} / ${r.oid} — ${r.name_english || ''} (${r.name_arabic || ''}); type=${r.provider_type}; specialty=${r.specialty || ''}${r.subspecialty ? ' / ' + r.subspecialty : ''}; status=${r.verification_status}; profile=${r.profile_status}`,
    );
    return `${lines.join('\n')}`;
  } catch { return ''; }
}

// Shared: run the 768d embedding model and normalize to a number[].
// bge-base-en-v1.5 returns { data: [[768...]], shape:[1,768], pooling, usage }.
async function embedVector(env, text) {
  if (!env?.AI) return null;
  const raw = await env.AI.run(EMBED, { text: String(text) });
  if (!raw) return null;
  const p = (candidate) => Array.isArray(candidate) ? candidate : null;
  // candidate shapes, most likely first
  const vec =
    p(raw?.data?.[0]?.embedding) ||
    p(raw?.data?.[0]) ||       // array-of-numbers form
    p(raw?.embedding) ||
    p(raw?.result?.[0]?.embedding) ||
    p(raw?.vectors?.[0]?.values) ||
    null;
  return vec && vec.length ? vec : null;
}

// -------- Vectorize grounding across the medical index --------
async function vectorGround(env, text, topK) {
  if (!env?.AI || !env?.MED_INDEX) return '';
  const k = Number(topK || env.RAG_TOP_K || 4) || 4;
  try {
    const vector = await embedVector(env, text);
    if (!vector) return '';
    const res = await env.MED_INDEX.query(vector, { topK: k, returnMetadata: 'all' });
    const hits = (res?.matches || res?.result || []).filter(Boolean).slice(0, k);
    if (!hits.length) return '';
    const parts = hits.map((h, i) => {
      const meta = h.metadata || {};
      const score = (typeof h.score === 'number') ? h.score.toFixed(3) : '';
      const t = meta.text || meta.content || meta.title || (typeof h.text === 'string' ? h.text : '');
      return t ? `[${i + 1}] (score ${score}) ${String(t).slice(0, 650)}` : null;
    }).filter(Boolean);
    return parts.length ? `${parts.join('\n')}` : '';
  } catch { return ''; }
}

async function callModel(env, system, history, model) {
  if (!env?.AI) return null;
  const messages = [
    { role: 'system', content: system },
    ...history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text || m.content || '' })),
  ];
  try {
    const out = await env.AI.run(model, { messages, max_tokens: 800, temperature: 0.4 });
    const raw = (out && (out.response || (out.choices && out.choices[0] && out.choices[0].message && out.choices[0].message.content))) || null;
    return (typeof raw === 'string' && raw.trim()) ? raw : null;
  } catch { return null; }
}

function fallbackAnswer(mode, lang) {
  return lang === 'ar'
    ? 'عذراً — المحرّك الذكي غير متاح حالياً. يرجى المحاولة لاحقاً أو فتح النسخة الكاملة للمساعد من صفحة /copilot.'
    : 'The intelligent engine is temporarily unavailable. Please retry shortly, or open the full Copilot from /copilot.';
}

// Diagnostic: confirm embedding model dimension + vectorize wiring.
async function dimsCheck(env) {
  if (!env?.AI || !env?.MED_INDEX) {
    return json({ ok: false, reason: 'ai_or_index_missing', hasAI: !!env?.AI, hasIndex: !!env?.MED_INDEX });
  }
  try {
    const vec = await embedVector(env, 'sanity check embedding');
    if (Array.isArray(vec)) {
      return json({ ok: true, dims: vec.length, got: true, model: EMBED });
    }
    // surface the raw AI response so we can see model id errors / shape
    try {
      const raw = await env.AI.run(EMBED, { text: 'sanity check embedding' });
      const dataKeys = raw.data && (Array.isArray(raw.data) ? (raw.data[0] && Object.keys(raw.data[0])) : Object.keys(raw.data));
      const dataIsArray = Array.isArray(raw.data);
      const dataLen = dataIsArray ? raw.data.length : null;
      const el0 = dataIsArray && raw.data.length ? raw.data[0] : null;
      const el0IsNum = typeof el0 === 'number';
      const isArrArr = Array.isArray(el0);
      let dimsVisible = null;
      if (isArrArr) dimsVisible = el0.length;
      else if (el0 && Array.isArray(el0.embedding)) dimsVisible = el0.embedding.length;
      return json({
        ok: false, got: false, reason: 'unrecognized',
        shape: { kind: typeof raw, keys: raw && typeof raw === 'object' ? Object.keys(raw) : null,
          success: raw && 'success' in raw ? raw.success : undefined,
          errors: raw && raw.errors ? (Array.isArray(raw.errors) ? raw.errors : String(raw.errors)).slice(0, 200) : undefined,
          declared: raw.shape, pooling: raw.pooling, usage: raw.usage,
          dataIsArray, dataLen, el0IsNum, el0Type: isArrArr ? 'array-of-numbers' : el0 ? typeof el0 : 'n/a',
          dataFirstKeys: isArrArr ? null : el0 && typeof el0 === 'object' ? Object.keys(el0) : null,
          dimsVisible, head: el0IsNum && raw.data ? raw.data.slice(0, 3) : null } });
    } catch (e2) {
      return json({ ok: false, got: false, reason: String(e2?.message || e2).slice(0, 300) });
    }
  } catch (e) {
    return json({ ok: false, reason: String(e?.message || e).slice(0, 300) });
  }
}

// Seed medical Vectorize index from published provider profiles (registry auto-RAG).
async function readJsonPayload(request) {
  try { return await request.json(); } catch { return {}; }
}
async function seedMedicalIndex(request, env) {
  const auth = (request.headers.get('authorization') || '').replace('Bearer ', '');
  if (env.SEED_TOKEN && auth !== env.SEED_TOKEN) {
    return json({ ok: false, reason: 'unauthorized' }, 401);
  }
  if (!env?.AI || !env?.MED_INDEX) {
    return json({ ok: false, reason: 'missing AI or MED_INDEX binding' });
  }
  await readJsonPayload(request); // swallow body
  const rows = await env.DB.prepare(
    `SELECT spid, oid, name_english, name_arabic, title_en, specialty, subspecialty, bio_en,
            primary_email, scfhs_file_number, website_url, verification_status, profile_status, updated_at
     FROM providers WHERE profile_status='published'`,
  ).all();
  const list = rows?.results || rows || [];
  if (!Array.isArray(list) || !list.length) return json({ ok: true, seeded: 0, total: 0, note: 'no published providers' });

  const bulk = [];
  for (const r of list) {
    const text = [
      `SPID ${r.spid}  OID ${r.oid}`,
      `Name: ${r.name_english || ''}${r.name_arabic ? ' / ' + r.name_arabic : ''}`,
      r.title_en ? `Title: ${r.title_en}` : '',
      `Specialty: ${r.specialty || 'general'}${r.subspecialty ? ' / ' + r.subspecialty : ''}`,
      r.bio_en ? `Bio: ${r.bio_en}` : '',
      r.scfhs_file_number ? `SCFHS file: ${r.scfhs_file_number}` : '',
      r.website_url ? `Website: ${r.website_url}` : '',
      `Status: ${r.verification_status} (${r.profile_status}); updated ${r.updated_at || ''}`,
    ].filter(Boolean).join('\n');
    const values = await embedVector(env, text);
    if (values) {
      bulk.push({
        id: `reg-${String(r.spid).toLowerCase()}`,
        values,
        metadata: {
          source: 'registry', spid: r.spid, oid: r.oid,
          name_english: r.name_english || '', name_arabic: r.name_arabic || '',
          specialty: r.specialty || '', verification_status: r.verification_status || '', text,
        },
      });
    }
  }
  let ok = 0;
  for (let i = 0; i < bulk.length; i += 6) {
    const chunk = bulk.slice(i, i + 6);
    await env.MED_INDEX.upsert(chunk);
    ok += chunk.length;
  }
  return json({ ok: true, seeded: ok, total: list.length, index: 'brainsait-medical', model: EMBED });
}

// ------------------- main -------------------
async function copilotChat(request, env) {
  const body = await readJsonBody(request);
  if (!body) return badRequest('invalid_json');

  const msgs = Array.isArray(body.messages) ? body.messages : [];
  const last = msgs[msgs.length - 1];
  const text = (last && (last.text || last.content)) || '';
  const lang = body.lang === 'ar' ? 'ar' : 'en';
  const hint = body.mode && MODE_KEYS.includes(body.mode) ? body.mode : undefined;
  const mode = detectMode(text, hint);

  const safety = safetyNote(text, lang);
  const history = msgs.slice(-8);

  let extra = '';
  try {
    const reg = await registryContext(env, text);
    const vec = await vectorGround(env, text);
    const bits = [reg, vec].filter(Boolean);
    if (bits.length) extra += ragInstruction(bits.join('\n\n'));
  } catch { /* grounding best-effort */ }

  const appendix = MODE_APPENDIX[mode] || MODE_APPENDIX.general;
  const system = CONSTITUTION + appendix + (safety.hit ? `\n\n${safety.note}` : '') + extra + OUTPUT_NOTE;
  const model = (env.COPILOT_MODEL || '').trim() || MODEL();

  const answer = await callModel(env, system, history, model);
  if (answer) {
    return json({ response: answer, mode, safetyFlag: !!(safety && safety.hit), grounded: true, model, used: 'ai' });
  }
  return json({
    response: fallbackAnswer(mode, lang),
    mode,
    safetyFlag: !!(safety && safety.hit),
    grounded: false,
    used: 'fallback',
  });
}
