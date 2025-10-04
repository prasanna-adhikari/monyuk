// src/utils/risk.js
const PHRASES = [
  "kill myself",
  "suicide",
  "end my life",
  "i want to die",
  "self harm",
  "self-harm",
  "hurt myself",
  "cut myself",
];
function detectRisk(text = "") {
  const t = text.toLowerCase();
  return PHRASES.some((p) => t.includes(p)) ? "self_harm" : null;
}
module.exports = { detectRisk };
