// src/providers/llm/huggingface.js
const axios = require("axios");
// Example with an instruct model; adjust to any supported model id
const MODEL = process.env.CHAT_MODEL || "mistralai/Mixtral-8x7B-Instruct-v0.1";
async function chat({ messages }) {
  const prompt = messages
    .map((m) => `${m.role}: ${m.content || m.text}`)
    .join("\n");
  const r = await axios.post(
    `https://api-inference.huggingface.co/models/${MODEL}`,
    { inputs: prompt, parameters: { max_new_tokens: 256 } },
    { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
  );
  const text = Array.isArray(r.data)
    ? r.data[0]?.generated_text
    : r.data?.generated_text;
  return text || "";
}
module.exports = { chat };
