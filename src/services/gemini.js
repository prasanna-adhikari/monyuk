// src/services/gemini.js

const API_KEY = process.env.GEMINI_API_KEY;

// ✅ Default to free Gemini model (always available on free tier)
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// ✅ Fallbacks (keeps newer ones like 2.0+ for optional upgrades)
const FALLBACKS = [PRIMARY_MODEL, "gemini-2.0-flash", "gemini-1.5-pro"];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isOverloaded(status, body) {
  const msg = typeof body === "string" ? body : JSON.stringify(body || {});
  return (
    status === 429 ||
    status === 503 ||
    /overloaded|unavailable|deadline|timeout/i.test(msg)
  );
}

/**
 * Call Gemini with retries and model fallback.
 * @param {{message: string, history?: Array<{role:string,text:string}>}} param0
 * @returns {Promise<{text:string}>}
 */
exports.chatOnce = async function chatOnce({ message, history = [] }) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY missing");

  const promptParts = [
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  let lastErr;
  for (const model of FALLBACKS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent?key=${API_KEY}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: promptParts,
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
          }),
        });

        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          /* non-JSON response */
        }

        if (!res.ok) {
          if (isOverloaded(res.status, json || text)) {
            lastErr = new Error(`Gemini ${model} overloaded (${res.status})`);
          } else {
            throw new Error(
              `Gemini ${model} error ${res.status}: ${text.slice(0, 400)}`
            );
          }
        } else {
          const candidates = json?.candidates || [];
          const outText =
            candidates[0]?.content?.parts
              ?.map((p) => p.text || "")
              .join("")
              .trim() || "Thanks for sharing that.";
          return { text: outText };
        }
      } catch (e) {
        lastErr = e;
      }

      // Exponential backoff with jitter
      const base = [400, 1200, 2400][attempt] || 2400;
      await sleep(base + Math.floor(Math.random() * 250));
    }
  }

  const err = new Error(lastErr?.message || "Gemini unavailable");
  err.code = "LLM_UNAVAILABLE";
  throw err;
};
