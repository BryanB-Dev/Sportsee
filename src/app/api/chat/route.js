// Next.js Route Handler for Mistral chat completions
// - Validates and sanitizes user input
// - Uses env var MISTRAL_API_KEY (never exposed to client)
// - Adds safe logging (no sensitive content)
// - Handles timeouts and API errors gracefully

import { buildMessagesWithSystem } from "@/config/coachAIPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_MODEL = process.env.MISTRAL_MODEL || "mistral-small-latest";
const ALLOWED_MODELS = new Set([
  "mistral-small-latest",
  "mistral-large-latest",
  "open-mixtral-8x7b",
  "open-mistral-7b",
]);

const MAX_MESSAGE_CHARS = 4000; // per message guardrail
const MAX_TOTAL_CHARS = 6000; // total across messages to avoid over-limit
const MAX_TOKENS = 2048; // model output cap - augmenté pour des réponses plus complètes
const DEFAULT_TEMPERATURE = 0.2; // Très bas: 0.2 pour réduire drastiquement les hallucinations (plus factuel, très peu créatif)
const REQUEST_TIMEOUT_MS = 20000; // 20s
const MIN_REQUEST_INTERVAL_MS = 2000; // simple rate limit: 1 request per 2s per client

// Basic in-memory rate limiter per IP (or per user-agent as fallback)
const rateLimitStore = new Map(); // key -> lastTimestamp

function sanitizeText(input) {
  return String(input)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(num, max));
}

function buildAbortSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("Request timeout")), timeoutMs);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

function safeLog(event, data) {
  // Ensure we never log sensitive content (prompt text or API key)
  try {
    const redacted = { ...data };
    if (redacted.apiKey) redacted.apiKey = "[REDACTED]";
    if (typeof redacted.totalChars === "number" && redacted.totalChars > 0) {
      // ok
    }
    if (typeof redacted.sampleContent === "string") {
      // truncate sample preview if provided by caller
      redacted.sampleContent = redacted.sampleContent.slice(0, 64) + (redacted.sampleContent.length > 64 ? "…" : "");
    }
    // eslint-disable-next-line no-console
    console.info(`[api/chat] ${event}`, redacted);
  } catch {
    // ignore logging errors
  }
}

function validateAndNormalizeBody(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body" };
  }

  const messages = [];
  if (typeof body.message === "string") {
    const content = sanitizeText(body.message);
    if (!content) return { error: "Message cannot be empty" };
    messages.push({ role: "user", content });
  } else if (Array.isArray(body.messages)) {
    for (const m of body.messages) {
      if (!m || typeof m !== "object") return { error: "Each message must be an object" };
      const role = typeof m.role === "string" ? m.role : "user";
      if (!["user", "system", "assistant"].includes(role)) return { error: `Invalid role: ${role}` };
      const content = sanitizeText(m.content ?? "");
      if (!content) return { error: "Message content cannot be empty" };
      messages.push({ role, content });
    }
  } else {
    return { error: "Provide 'message' string or 'messages' array" };
  }

  // length guardrails
  let totalChars = 0;
  for (const msg of messages) {
    if (msg.content.length > MAX_MESSAGE_CHARS) {
      return { error: `A message exceeds ${MAX_MESSAGE_CHARS} characters` };
    }
    totalChars += msg.content.length;
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    return { error: `Total content exceeds ${MAX_TOTAL_CHARS} characters` };
  }

  // optional params
  const model = typeof body.model === "string" ? body.model.trim() : DEFAULT_MODEL;
  if (!ALLOWED_MODELS.has(model)) {
    return { error: `Model not allowed. Use one of: ${Array.from(ALLOWED_MODELS).join(", ")}` };
  }

  const temperature = typeof body.temperature === "number" ? clamp(body.temperature, 0, 1) : DEFAULT_TEMPERATURE;
  const max_tokens = typeof body.max_tokens === "number" ? clamp(Math.floor(body.max_tokens), 1, MAX_TOKENS) : Math.min(MAX_TOKENS, 512);

  // Gérer le contexte utilisateur optionnel
  const userContext = typeof body.userContext === "string" ? sanitizeText(body.userContext).slice(0, 2000) : null;

  return { messages, model, temperature, max_tokens, totalChars, userContext };
}

export async function POST(req) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    safeLog("missing_api_key", { note: "Set MISTRAL_API_KEY in your environment" });
    return new Response(
      JSON.stringify({ error: "Server misconfigured: missing API key" }),
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const normalized = validateAndNormalizeBody(body);
  if (normalized.error) {
    const status = normalized.error.includes("exceeds") ? 413 : 400;
    return new Response(JSON.stringify({ error: normalized.error }), { status, headers: { "Content-Type": "application/json" } });
  }

  const { messages, model, temperature, max_tokens, totalChars, userContext } = normalized;

  // Inject the Coach AI system prompt and optional user context
  const withSystem = buildMessagesWithSystem(messages);
  const enrichedMessages = userContext
    ? [withSystem[0], { role: "system", content: userContext }, ...withSystem.slice(1)]
    : withSystem;

  // Rate limit check
  const clientKey = req.headers.get("x-forwarded-for") || req.headers.get("user-agent") || "unknown";
  const now = Date.now();
  const last = rateLimitStore.get(clientKey) || 0;
  if (now - last < MIN_REQUEST_INTERVAL_MS) {
    return new Response(
      JSON.stringify({ error: "Trop de requêtes. Réessayez dans un instant." }),
      { status: 429, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
  rateLimitStore.set(clientKey, now);

  // Safe request logging (no content, just counts/metadata)
  const requestId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  safeLog("request", {
    id: requestId,
    model,
    msgCount: messages.length,
    totalChars,
    hasUserContext: Boolean(userContext),
    userContextLength: userContext ? userContext.length : 0,
    userAgent: req.headers.get("user-agent") || "unknown",
    ip: req.headers.get("x-forwarded-for") ? "forwarded" : "hidden",
  });

  const { signal, cancel } = buildAbortSignal(REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(MISTRAL_API_URL, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: enrichedMessages,
        temperature,
        max_tokens,
        stream: false,
      }),
      cache: "no-store",
    });

    cancel();

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      safeLog("upstream_error", { id: requestId, status: resp.status, statusText: resp.statusText, bodyPreview: text.slice(0, 200) });
      const status = resp.status === 401 ? 502 : 502; // map upstream errors to 5xx
      return new Response(
        JSON.stringify({ error: "Upstream AI service error", details: resp.statusText }),
        { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    const data = await resp.json();

    const reply = data?.choices?.[0]?.message?.content ?? "";
    safeLog("response", { id: requestId, model: data?.model || model, hasReply: Boolean(reply), usage: data?.usage ? "present" : "absent" });

    return new Response(
      JSON.stringify({
        id: data?.id || null,
        model: data?.model || model,
        reply,
        usage: data?.usage || null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  } catch (err) {
    cancel();
    const isAbort = (err?.name === "AbortError") || /timeout/i.test(String(err?.message || ""));
    safeLog("exception", { type: isAbort ? "timeout" : "error", message: String(err?.message || err) });
    return new Response(
      JSON.stringify({ error: isAbort ? "Request timed out" : "Unexpected server error" }),
      { status: isAbort ? 504 : 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}
