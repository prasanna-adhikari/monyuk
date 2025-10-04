// src/providers/llm/index.js
const openrouter = require("./openrouter");
const huggingface = require("./huggingface");
const gemini = require("./gemini");

const MAP = { openrouter, huggingface, gemini };
function getProvider() {
  const key = (process.env.CHAT_PROVIDER || "openrouter").toLowerCase();
  return MAP[key] || openrouter;
}
module.exports = { getProvider };
