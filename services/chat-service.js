import { API_KEY, ENDPOINT, MODEL, PARAMS } from "../config/chat-config.js";

async function postChat(messages, stream) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...PARAMS,
      stream,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res;
}

export async function sendMessage(messages) {
  const res = await postChat(messages, false);
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function streamMessage(messages, onDelta) {
  const res = await postChat(messages, true);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullReply = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value, { stream: true }).split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const payload = line.slice(6).trim();
      if (payload === "[DONE]") continue;

      try {
        const chunk = JSON.parse(payload);
        const delta = chunk.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          fullReply += delta;
          onDelta(delta);
        }
      } catch {
        // chunk malformado — ignorar
      }
    }
  }

  return fullReply;
}
