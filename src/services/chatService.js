// Lightweight client for the internal Next.js /api/chat route
// Handles request shaping, timeouts, and error normalization

const CHAT_ENDPOINT = "/api/chat";
const TIMEOUT_MS = 20000;

function normalizeMessages(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") return [{ role: "user", content: input }];
  return [];
}

function createTimeoutSignal(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

function mapError(err) {
  if (err?.name === "AbortError") return new Error("Le serveur met trop de temps à répondre.");
  const msg = String(err?.message || err || "");
  if (/Failed to fetch/i.test(msg)) return new Error("Impossible de contacter le serveur. Vérifiez qu'il est démarré.");
  // Propager le message serveur (API key manquante, rate-limit, upstream, etc.)
  if (msg) return new Error(msg);
  return new Error("Une erreur est survenue lors du chat.");
}

export async function sendChat({ messages, message, model, temperature, max_tokens, userContext } = {}) {
  const payload = {};
  if (message) payload.message = message;
  if (messages && Array.isArray(messages)) payload.messages = messages;
  if (!payload.message && !payload.messages) {
    throw new Error("Aucun message à envoyer");
  }
  if (model) payload.model = model;
  if (typeof temperature === "number") payload.temperature = temperature;
  if (typeof max_tokens === "number") payload.max_tokens = max_tokens;
  if (userContext) payload.userContext = userContext;

  const { signal, clear } = createTimeoutSignal(TIMEOUT_MS);

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
      cache: "no-store",
    });
    clear();

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errMsg = data?.error || data?.message || `Erreur (${res.status})`;
      throw new Error(errMsg);
    }
    return {
      reply: data?.reply ?? "",
      model: data?.model || null,
      id: data?.id || null,
      usage: data?.usage || null,
    };
  } catch (e) {
    clear();
    throw mapError(e);
  }
}

export default { sendChat };
