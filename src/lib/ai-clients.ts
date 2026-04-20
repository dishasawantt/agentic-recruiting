import OpenAI from "openai";

const boundFetch: typeof fetch =
  typeof globalThis.fetch === "function"
    ? globalThis.fetch.bind(globalThis)
    : fetch;

export function createGroqOpenAIClient(apiKey: string, timeoutMs = 55_000) {
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
    fetch: boundFetch,
    maxRetries: 0,
    timeout: timeoutMs,
  });
}

export function createOpenAIEmbeddingClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    fetch: boundFetch,
    maxRetries: 0,
    timeout: 45_000,
  });
}
