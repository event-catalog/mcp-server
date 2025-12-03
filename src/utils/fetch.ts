import { parseLlmsTxt } from '../parser.js';
import type { ParsedResource } from '../types.js';

let cachedLlmsTxt: string | null = null;

/**
 * Fetch llms.txt from EventCatalog and cache the result
 */
export async function fetchLlmsTxt(): Promise<string> {
  if (cachedLlmsTxt) return cachedLlmsTxt;

  const baseUrl = process.env.EVENTCATALOG_URL || '';
  const url = new URL('/docs/llm/llms.txt', baseUrl);
  const response = await fetch(url.toString());
  const text = await response.text();
  cachedLlmsTxt = text;
  return text;
}

/**
 * Fetch and parse llms.txt into typed resources
 */
export async function fetchParsedResources(): Promise<ParsedResource[]> {
  const text = await fetchLlmsTxt();
  return parseLlmsTxt(text);
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  cachedLlmsTxt = null;
}
