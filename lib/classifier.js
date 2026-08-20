import { SECTIONS } from '../public-data.js';
import { normalizeText } from './security.js';

const STOP = new Set(['a','o','as','os','de','da','do','das','dos','e','em','para','por','com','um','uma','meu','minha','me','eu','sobre','quero','preciso','como','qual','onde','ser','ter','no','na','nos','nas']);

function tokens(text) {
  return normalizeText(text).split(' ').filter((token) => token.length > 2 && !STOP.has(token));
}

function buildModel() {
  const vocab = new Set();
  const docs = SECTIONS.map((section) => {
    const corpus = [section.title, section.summary, ...section.publicTopics, ...section.keywords, ...section.training].join(' ');
    const list = tokens(corpus);
    list.forEach((t) => vocab.add(t));
    const counts = new Map();
    list.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    return { section, counts, total: list.length };
  });
  return { docs, vocabSize: Math.max(vocab.size, 1) };
}

const MODEL = buildModel();

function keywordBoost(section, normalized) {
  let score = 0;
  for (const keyword of section.keywords) {
    const k = normalizeText(keyword);
    if (k && normalized.includes(k)) score += k.includes(' ') ? 3.5 : 2;
  }
  return score;
}

export function classifySection(input) {
  const normalized = normalizeText(input);
  const inputTokens = tokens(input);
  if (!inputTokens.length) return { section: null, confidence: 0, alternatives: [] };

  const scored = MODEL.docs.map(({ section, counts, total }) => {
    let logp = Math.log(1 / SECTIONS.length);
    for (const token of inputTokens) {
      const count = counts.get(token) || 0;
      logp += Math.log((count + 1) / (total + MODEL.vocabSize));
    }
    logp += keywordBoost(section, normalized);
    return { section, score: logp };
  }).sort((a, b) => b.score - a.score);

  const max = scored[0].score;
  const probs = scored.map((item) => ({ ...item, p: Math.exp(item.score - max) }));
  const totalP = probs.reduce((sum, item) => sum + item.p, 0) || 1;
  const ranked = probs.map((item) => ({ section: item.section, confidence: item.p / totalP }));

  const top = ranked[0];
  const second = ranked[1];
  const margin = top.confidence - (second?.confidence || 0);
  const evidence = Math.min(1, inputTokens.length / 5);
  const confidence = Math.max(0, Math.min(0.98, (top.confidence * 0.75) + (margin * 0.15) + (evidence * 0.10)));

  return {
    section: confidence >= 0.34 ? top.section : null,
    confidence,
    alternatives: ranked.slice(1, 3).map((item) => ({ id: item.section.id, title: item.section.title, confidence: item.confidence }))
  };
}

export function confidenceLabel(confidence) {
  if (confidence >= 0.72) return 'alta';
  if (confidence >= 0.5) return 'média';
  return 'baixa';
}
