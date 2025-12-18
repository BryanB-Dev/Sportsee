import fs from 'fs';
import path from 'path';
import { validateAIResponse, generateHonestFallback, calculateDataStatistics } from '../src/utils/aiResponseValidator.js';
import { mockUserActivity } from '../src/mocks/apiData.js';

const OUT_PATH = path.resolve('./test/test_results.json');
const API_URL = 'http://localhost:3000/api/chat';
const DEFAULT_USER = 'user123';
const MIN_REQUEST_INTERVAL_MS = 2100; // respect server rate limit (>= 2000ms)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tests list with expected/forbidden regex patterns (inspired by dev-tools/test_coach_prompt.ps1)
const tests = [
  { name: 'TEST 1.1 - Entrainement basique', msg: 'Par ou je commence si je veux courir ?', shouldContain: 'etape|debut|commencer|semaine', shouldNotContain: '', passData: false },
  { name: 'TEST 1.2 - Gestion douleur', msg: "J'ai mal aux genoux apres avoir couru hier", shouldContain: 'repos|professionnel|medecin', shouldNotContain: '' },
  { name: 'TEST 1.3 - Nutrition basique', msg: 'Quoi manger apres une seance ?', shouldContain: 'proteine|glucides|alimentation', shouldNotContain: '' },
  { name: 'TEST 2.1 - Optimisation performance', msg: 'Ma FC max reste a 185 bpm. Comment l\'augmenter ?', shouldContain: 'genetique|intensite|entrainement|interval', shouldNotContain: '' },
  { name: 'TEST 2.2 - Fatigue cumulee', msg: 'Je suis fatigue depuis 2 semaines malgre mon repos. Que faire ?', shouldContain: 'surentrainement|sommeil|fatigue', shouldNotContain: '', passData: true },
  { name: 'TEST 2.3 - Ambiguite', msg: "Mon app dit que j'ai recupere, mais je sens pas ?", shouldContain: 'application|recuperation|pistes', shouldNotContain: '', passData: false },
  { name: 'TEST 3.1 - Optimisation avancee', msg: 'Je veux ameliorer mon seuil anaerobique pour mon prochain trail', shouldContain: 'seuil|anaerobique|entrainement|intensite', shouldNotContain: '' },
  { name: 'TEST 3.2 - Question specialisee', msg: 'Mon ratio aerobie/anaerobique devrait etre ?', shouldContain: '80|20|ratio|aerobic', shouldNotContain: '' },
  { name: 'TEST L1 - Donnees manquantes', msg: 'Pourquoi je progresse pas ? Je n\'ai pas de données d\'activité.', shouldContain: 'precisions|objectif|entrainement|alimentation', shouldNotContain: '' },
  { name: 'TEST L2 - Hors sujet', msg: 'Donne-moi des conseils pour mes relations amoureuses.', shouldContain: 'desole|coach|specialis|entrain', shouldNotContain: '' },
  { name: 'TEST L3 - Question medicale', msg: 'Je prends un medicament, ca affecte ma perf ?', shouldContain: 'desole|coach|specialis|entrain', shouldNotContain: '' },
  { name: 'TEST L4 - Refus diagnostic', msg: "J'ai une douleur vive a la hanche depuis 3 jours", shouldContain: 'desole|coach|specialis|entrain', shouldNotContain: '' },
  { name: 'TEST L5 - Requete contradictoire', msg: 'Je veux etre tres muscle ET faire un marathon le mois prochain', shouldContain: 'marathon|muscle|muscul|planif|nutrition', shouldNotContain: '' },
  { name: 'TEST C1 - Ton motivant', msg: 'J\'ai fait une belle seance aujourd\'hui !', shouldContain: 'hydratation|etirements|recuperation', shouldNotContain: '', passData: true },
  { name: 'TEST C2 - Pas d\'emojis', msg: 'Quel exercice recommandes-tu ? Réponds sans utiliser d\'emojis.', shouldContain: 'objectif|niveau|cardio|musculation', shouldNotContain: '🚀|💪|😀|🙂' }
];

async function callApi(payload, timeoutMs = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${txt}`);
    }
    const data = await res.json().catch(() => null);
    return data;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function run() {
  const results = [];
  const allActivity = mockUserActivity[DEFAULT_USER] || [];
  // Filter to recent 4 weeks
  const today = new Date();
  const fourWeeksAgo = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);
  const activity = allActivity.filter((session) => {
    const [year, month, day] = session.date.split('-').map(Number);
    const sessionDate = new Date(year, month - 1, day);
    return sessionDate >= fourWeeksAgo && sessionDate <= today;
  });

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    if (i > 0) {
      // Small pause between requests to avoid rate limits and simulate real usage
      await sleep(MIN_REQUEST_INTERVAL_MS);
    }
    console.log('Running', t.name);
    let reply = null;
    let source = 'api';
    try {
      const payload = { message: t.msg, model: 'mistral-small-latest', temperature: 0, max_tokens: 512 };
      if (t.passData) {
        payload.userContext = `Données d'activité des 4 dernières semaines (format JSON) : ${JSON.stringify(activity)}`;
      }
      const data = await callApi(payload).catch(() => null);
      if (data && data.reply) {
        reply = data.reply;
      } else {
        source = 'fallback';
        reply = generateHonestFallback(activity, { short: true, focus: /bpm|rythme|cardiaque|bpm/i.test(t.msg) ? 'bpm' : 'general' });
      }
    } catch (e) {
      console.warn('API call failed, using fallback:', e.message);
      source = 'fallback';
      reply = generateHonestFallback(activity, { short: true, focus: /bpm|rythme|cardiaque|bpm/i.test(t.msg) ? 'bpm' : 'general' });
    }

    const validation = validateAIResponse(reply, activity);

    // Semantic validation based on expected/forbidden patterns (from PS1 runner)
    function normalizeForMatch(s) {
      if (!s) return '';
      return s
        .normalize('NFD') // decompose accents
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();
    }

    const normalizedReply = normalizeForMatch(reply || '');
    const expected = (t.shouldContain || '').trim();
    const forbidden = (t.shouldNotContain || '').trim();

    const expectedMatches = [];
    const forbiddenMatches = [];

    if (expected) {
      try {
        const re = new RegExp(expected, 'i');
        if (re.test(normalizedReply)) expectedMatches.push(true);
      } catch (e) {
        // fallback: simple substring check on normalized reply
        const parts = expected.split('|').map(p => p.trim()).filter(Boolean);
        for (const p of parts) if (normalizedReply.includes(p)) expectedMatches.push(p);
      }
    }

    if (forbidden) {
      try {
        const re2 = new RegExp(forbidden, 'i');
        if (re2.test(normalizedReply)) forbiddenMatches.push(true);
      } catch (e) {
        const parts = forbidden.split('|').map(p => p.trim()).filter(Boolean);
        for (const p of parts) if (normalizedReply.includes(p)) forbiddenMatches.push(p);
      }
    }

    // Combine validator issues with semantic checks
    let semanticValid = true;
    const semanticIssues = [];
    if (expected && expectedMatches.length === 0) {
      semanticValid = false;
      semanticIssues.push(`Expected patterns not found: ${expected}`);
    }
    if (forbidden && forbiddenMatches.length > 0) {
      semanticValid = false;
      semanticIssues.push(`Forbidden patterns present: ${forbidden}`);
    }

    // Merge validation issues
    const combinedIssues = [...(validation.issues || [])];
    if (!semanticValid) combinedIssues.push(...semanticIssues);

    const finalValid = combinedIssues.length === 0;

    const status = finalValid ? 'valid' : 'invalid';
    if (!finalValid) {
      console.warn(`Validation issues for ${t.name}:`, combinedIssues);
    }
    const entry = {
      test: t.name,
      question: t.msg,
      reply,
      source,
      status,
      validation,
      semantic: {
        expected,
        forbidden,
        expectedMatches: expectedMatches.length > 0,
        forbiddenMatches: forbiddenMatches.length > 0,
        semanticIssues,
      },
      combinedIssues,
      timestamp: new Date().toISOString(),
    };
    results.push(entry);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved', results.length, 'results to', OUT_PATH);
}

run().catch((e) => {
  console.error('Test runner failed:', e);
  process.exit(1);
});
