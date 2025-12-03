import type { ParsedResource, ResourceKind, PluralResourceKind } from '../types.js';

/**
 * Map plural type to singular for filtering
 */
export const pluralToSingular: Record<PluralResourceKind, ResourceKind> = {
  events: 'event',
  commands: 'command',
  queries: 'query',
  services: 'service',
  domains: 'domain',
  flows: 'flow',
  entities: 'entity',
  channels: 'channel',
  teams: 'team',
  users: 'user',
  docs: 'doc',
};

/**
 * Filter resources by type (accepts both singular and plural)
 */
export function filterByType(
  resources: ParsedResource[],
  type: ResourceKind | PluralResourceKind | 'all'
): ParsedResource[] {
  if (type === 'all') {
    return resources;
  }
  // Convert plural to singular if needed
  const singularType = (pluralToSingular as Record<string, ResourceKind>)[type] || type;
  return resources.filter((r) => r.type === singularType);
}

/**
 * Filter resources by search term (case-insensitive)
 * Searches in name, id, and summary
 */
export function filterBySearch(
  resources: ParsedResource[],
  search: string
): ParsedResource[] {
  const searchLower = search.toLowerCase();
  return resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchLower) ||
      r.id.toLowerCase().includes(searchLower) ||
      (r.summary && r.summary.toLowerCase().includes(searchLower))
  );
}
