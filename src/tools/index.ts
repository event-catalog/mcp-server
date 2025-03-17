import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
let cachedResponse: string | null = null;
import fetch from 'node-fetch';
import { z } from 'zod';

const getEventCatalogResources = async () => {
  if (cachedResponse) return cachedResponse;
  const BASE_URL = process.env.EVENTCATALOG_URL;
  const response = await fetch(`${BASE_URL}/docs/llm/llms-full.txt`);
  const text = await response.text();
  cachedResponse = text;
  return text;
};

// const getManifestRules = async () => {
//   const manifest = `
//     ## Event-driven architecture rules
//     - We don't accept any breaking changes to events, queries or commands after they are released.
//     - All our messages have correlation id in the header.
//     - All messages have metadata tag in them.
//     - All messages have data tag in them.
//     - All messages have a name tag in them.
//     - All messages have a version tag in them.
//     - All messages have a type tag in them.
//     - All messages have a source tag in them.
//     - All messages have a timestamp tag in them.
//     `;
//   return manifest;
// };

const tools = [
  {
    name: 'get_services',
    description: 'Get information about all services in EventCatalog',
  },
  {
    name: 'get_domains',
    description: 'Get information about all domains in EventCatalog',
  },
  {
    name: 'get_commands',
    description: 'Get information about all commands in EventCatalog',
  },
  {
    name: 'get_events',
    description: 'Get information about all events in EventCatalog',
  },
  {
    name: 'get_queries',
    description: 'Get information about all queries in EventCatalog',
  },
];

const schemaTools = [
  {
    name: 'get_event_schema',
    collection: 'events',
    file: 'schema.json',
    description: 'Get the schema for an event',
  },
  {
    name: 'get_query_schema',
    collection: 'queries',
    file: 'schema.json',
    description: 'Get the schema for a query',
  },
  {
    name: 'get_command_schema',
    collection: 'commands',
    file: 'schema.json',
    description: 'Get the schema for a command',
  },
  {
    name: 'get_openapi_spec',
    file: 'openapi.yml',
    collection: 'services',
    description: 'Get the OpenAPI spec for a service',
  },
  {
    name: 'get_asyncapi_spec',
    file: 'asyncapi.yml',
    collection: 'services',
    description: 'Get the AsyncAPI spec for a service',
  },
];

export function registerTools(server: McpServer) {

  tools.forEach((tool) => {
    server.tool(tool.name, tool.description, {}, async () => {
      const text = await getEventCatalogResources();

      return {
        content: [{ type: 'text', text: text }],
      };
    });
  });

  schemaTools.forEach((tool) => {
    server.tool(
      tool.name,
      tool.description,
      { resourceName: z.string(), fileName: z.string() },
      async ({ resourceName, fileName }) => {
        const BASE_URL = process.env.EVENTCATALOG_URL;
        const response = await fetch(`${BASE_URL}/generated/${tool.collection}/${resourceName}/${fileName}`);
        if (response.status === 404) {
          return {
            content: [{ type: 'text', text: `Schema for ${resourceName} not found` }],
            isError: true,
          };
        }
        const text = await response.text();
        return {
          content: [{ type: 'text', text: text }],
        };
      }
    );
  });

  // Get Manifest rules
  // server.tool(
  //   'get_manifest_rules',
  //   'Get the standards and governance rules for EventCatalog and event-driven architecture',
  //   {},
  //   async () => {
  //     const text = await getManifestRules();
  //     return {
  //       content: [{ type: 'text', text: text }],
  //     };
  //   }
  // );
}
