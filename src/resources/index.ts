import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fetchParsedResources } from '../utils/fetch.js';
import { filterByType } from '../utils/filter.js';
import type { ResourceKind } from '../types.js';

/**
 * Fetch and filter resources by type, return JSON
 */
export async function getResourcesByType(type: ResourceKind | 'all'): Promise<string> {
  const resources = await fetchParsedResources();
  const filtered = filterByType(resources, type);
  return JSON.stringify(filtered, null, 2);
}

/**
 * Map URI path to resource type
 */
function uriToType(uri: string): ResourceKind | 'all' {
  const path = uri.replace('eventcatalog://', '');
  const typeMap: Record<string, ResourceKind | 'all'> = {
    all: 'all',
    events: 'event',
    domains: 'domain',
    services: 'service',
    queries: 'query',
    commands: 'command',
    flows: 'flow',
    teams: 'team',
    users: 'user',
    entities: 'entity',
    channels: 'channel',
    docs: 'doc',
  };
  return typeMap[path] ?? 'all';
}

const resources = [
  {
    name: 'All Resources in EventCatalog',
    uri: 'eventcatalog://all',
    description: 'All messages, domains and services in EventCatalog',
    mimeType: 'application/json',
  },
  {
    name: 'All Events in EventCatalog',
    uri: 'eventcatalog://events',
    description: 'All events in EventCatalog',
    mimeType: 'application/json',
  },
  {
    name: 'All Domains in EventCatalog',
    uri: 'eventcatalog://domains',
    description: 'All domains in EventCatalog',
    mimeType: 'application/json',
  },
  {
    name: 'All Services in EventCatalog',
    uri: 'eventcatalog://services',
    description: 'All services in EventCatalog',
    mimeType: 'application/json',
  },
  {
    name: 'All Queries in EventCatalog',
    uri: 'eventcatalog://queries',
    description: 'All queries in EventCatalog',
    mimeType: 'application/json',
  },
  {
    name: 'All Commands in EventCatalog',
    uri: 'eventcatalog://commands',
    description: 'All commands in EventCatalog',
    mimeType: 'application/json',
  },
  {
    name: 'All Flows in EventCatalog',
    uri: 'eventcatalog://flows',
    description: 'All flows in EventCatalog',
    mimeType: 'application/json',
  },
  {
    name: 'All Teams in EventCatalog',
    uri: 'eventcatalog://teams',
    description: 'All teams in EventCatalog',
    mimeType: 'application/json',
  },
  {
    name: 'All Users in EventCatalog',
    uri: 'eventcatalog://users',
    description: 'All users in EventCatalog',
    mimeType: 'application/json',
  },
];

export function registerResources(server: McpServer) {
  resources.forEach((resource) => {
    server.resource(resource.name, new ResourceTemplate(resource.uri, { list: undefined }), async (uri) => {
      const type = uriToType(uri.href);
      const json = await getResourcesByType(type);
      return {
        contents: [{ uri: uri.href, text: json, mimeType: 'application/json' }],
      };
    });
  });
}
