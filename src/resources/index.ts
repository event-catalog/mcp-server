import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fetchParsedResources } from '../utils/fetch.js';
import { filterByType } from '../utils/filter.js';
import type { ResourceKind } from '../types.js';

/**
 * Fetch and filter resources by type, return JSON
 */
export async function getResourcesByType(type: ResourceKind | 'all'): Promise<string> {
  const allResources = await fetchParsedResources();
  const filtered = filterByType(allResources, type);
  return JSON.stringify({ resources: filtered }, null, 2);
}

/**
 * Static list resources configuration
 */
const listResources = [
  {
    name: 'All Resources in EventCatalog',
    uri: 'eventcatalog://all',
    description: 'All messages, domains and services in EventCatalog',
    type: 'all' as const,
  },
  {
    name: 'All Events in EventCatalog',
    uri: 'eventcatalog://events',
    description: 'All events in EventCatalog',
    type: 'event' as const,
  },
  {
    name: 'All Domains in EventCatalog',
    uri: 'eventcatalog://domains',
    description: 'All domains in EventCatalog',
    type: 'domain' as const,
  },
  {
    name: 'All Services in EventCatalog',
    uri: 'eventcatalog://services',
    description: 'All services in EventCatalog',
    type: 'service' as const,
  },
  {
    name: 'All Queries in EventCatalog',
    uri: 'eventcatalog://queries',
    description: 'All queries in EventCatalog',
    type: 'query' as const,
  },
  {
    name: 'All Commands in EventCatalog',
    uri: 'eventcatalog://commands',
    description: 'All commands in EventCatalog',
    type: 'command' as const,
  },
  {
    name: 'All Flows in EventCatalog',
    uri: 'eventcatalog://flows',
    description: 'All flows in EventCatalog',
    type: 'flow' as const,
  },
  {
    name: 'All Teams in EventCatalog',
    uri: 'eventcatalog://teams',
    description: 'All teams in EventCatalog',
    type: 'team' as const,
  },
  {
    name: 'All Users in EventCatalog',
    uri: 'eventcatalog://users',
    description: 'All users in EventCatalog',
    type: 'user' as const,
  },
];

export function registerResources(server: McpServer) {
  for (const resource of listResources) {
    server.registerResource(
      resource.name,
      resource.uri,
      { description: resource.description, mimeType: 'application/json' },
      async (uri) => {
        const json = await getResourcesByType(resource.type);
        return {
          contents: [{ uri: uri.href, text: json, mimeType: 'application/json' }],
        };
      }
    );
  }
}
