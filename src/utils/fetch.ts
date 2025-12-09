import { parseLlmsTxt } from '../parser.js';
import type { ParsedResource, OwnerResult, OwnerNotFoundError } from '../types.js';

let cachedLlmsTxt: string | null = null;

/**
 * Get the base URL from environment
 */
export function getBaseUrl(): string {
  return process.env.EVENTCATALOG_URL || '';
}

/**
 * Fetch llms.txt from EventCatalog and cache the result
 */
export async function fetchLlmsTxt(): Promise<string> {
  if (cachedLlmsTxt) return cachedLlmsTxt;

  const baseUrl = getBaseUrl();
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

/**
 * Fetch owner (user or team) by id
 * Tries user first, then team
 */
export async function fetchOwnerById(ownerId: string, fetchFn: typeof fetch = fetch): Promise<OwnerResult | OwnerNotFoundError> {
  const baseUrl = getBaseUrl();

  // Try user first
  const userUrl = new URL(`/docs/users/${ownerId}.mdx`, baseUrl);
  let response = await fetchFn(userUrl.toString());
  let ownerType: 'user' | 'team' = 'user';

  if (!response.ok) {
    // Try team
    const teamUrl = new URL(`/docs/teams/${ownerId}.mdx`, baseUrl);
    response = await fetchFn(teamUrl.toString());
    ownerType = 'team';
  }

  if (!response.ok) {
    return {
      error: 'Owner not found',
      message: `No user or team found with id '${ownerId}'`,
      searchedUrls: [`${baseUrl}/docs/users/${ownerId}`, `${baseUrl}/docs/teams/${ownerId}`],
    };
  }

  const content = await response.text();

  return {
    type: ownerType,
    id: ownerId,
    name: ownerId,
    content,
    mimeType: 'text/markdown',
    url: `${baseUrl}/docs/${ownerType}s/${ownerId}`,
  };
}
