// src/services/chat.service.js
const { getProvider } = require("../providers/llm");
const YarnMessage = require("../models/YarnMessage");
const RiskEvent = require("../models/RiskEvent");
const { detectRisk } = require("../utils/risk");

async function sendAndStore({ userId, input }) {
  const risk = detectRisk(input);
  await YarnMessage.create({ userId, role: "user", text: input });

  let reply = "I'm here to listen. Tell me more about what's on your mind.";
  try {
    const provider = getProvider();
    const history = await YarnMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(40);
    const messages = history
      .map((m) => ({
        role: m.role === "bot" ? "assistant" : m.role,
        content: m.text,
      }))
      .concat([{ role: "user", content: input }]);
    reply = await provider.chat({ messages });
  } catch (e) {
    console.warn("LLM error:", e.message);
  }

  const bot = await YarnMessage.create({ userId, role: "bot", text: reply });

  if (risk) {
    await RiskEvent.create({
      userId,
      type: risk,
      source: "user_message",
      actionShown: ["lifeline", "13yarn", "000"],
    });
  }
  return { reply: bot.text, risk: Boolean(risk) };
}
module.exports = { sendAndStore };
