import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
let cachedResponse: string | null = null;

const getEventCatalogResources = async () => {
  if (cachedResponse) return cachedResponse;
  const BASE_URL = process.env.EVENTCATALOG_URL;
  const response = await fetch(`${BASE_URL}/docs/llm/llms-full.txt`);
  const text = await response.text();
  cachedResponse = text;
  return text;
};

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
  
];

export function registerResources(server: McpServer) {
  resources.forEach((resource) => {
    server.resource(resource.name, new ResourceTemplate(resource.uri, { list: undefined }), async (uri) => {
      const text = await getEventCatalogResources();
      return {
        contents: [{ uri: uri.href, text: text }],
      };
    });
  });


}
