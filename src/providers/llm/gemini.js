// src/providers/llm/gemini.js
const axios = require("axios");
async function chat({ messages }) {
  // Keep it simple; convert to one prompt (free tier is very limited)
  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content || m.text}`)
    .join("\n");
  const r = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );
  const text = r.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}
module.exports = { chat };
