import type { ParsedResource, ResourceKind } from '../types.js';

/**
 * Filter resources by type
 */
export function filterByType(
  resources: ParsedResource[],
  type: ResourceKind | 'all'
): ParsedResource[] {
  if (type === 'all') {
    return resources;
  }
  return resources.filter((r) => r.type === type);
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
