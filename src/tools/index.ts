import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fetch from 'node-fetch';
import { z } from 'zod';
import { fileURLToPath, URL } from 'url';
import { prompt as createFlowPrompt } from './flows.js';
import path, { dirname } from 'path';
import fs from 'fs';
import { encodeCursor, decodeCursor, InvalidCursorError } from '../cursor.js';
import { fetchParsedResources, fetchOwnerById } from '../utils/fetch.js';
import { filterByType, filterBySearch, pluralToSingular } from '../utils/filter.js';
import type { ParsedResource, ResourceFilter } from '../types.js';

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const howEventCatalogWorks = fs.readFileSync(path.join(__dirname, './files/how-eventcatalog-works.txt'), 'utf8');

const getResourceInformation = async (type: string, id: string, version: string) => {
  const baseUrl = process.env.EVENTCATALOG_URL || '';
  const url = new URL(`/docs/${type}/${id}/${version}.mdx`, baseUrl);
  const response = await fetch(url.toString());
  const text = await response.text();
  return text;
};

const getUbiquitousLanguageTerms = async (domain: string) => {
  const baseUrl = process.env.EVENTCATALOG_URL || '';
  const url = new URL(`docs/domains/${domain}/language.mdx`, baseUrl);
  const response = await fetch(url.toString());
  const text = await response.text();
  return text;
};

const getProducersAndConsumers = async () => {
  const baseUrl = process.env.EVENTCATALOG_URL || '';
  const url = new URL(`/docs/llm/llms-services.txt`, baseUrl);
  const response = await fetch(url.toString());
  const text = await response.text();
  return text;
};

const DEFAULT_PAGE_SIZE = 50;

/**
 * Filter and paginate resources - exported for testing
 * Throws InvalidCursorError if cursor is invalid (MCP error code -32602)
 */
export function filterAndPaginateResources(
  resources: ParsedResource[],
  params: { type?: ResourceFilter; search?: string; cursor?: string }
): { resources: ParsedResource[]; nextCursor?: string } {
  // Filter by type
  const filterType = params.type ?? 'all';
  let filtered = filterByType(resources, filterType);

  // Filter by search term
  if (params.search) {
    filtered = filterBySearch(filtered, params.search);
  }

  // Pagination
  let startIndex = 0;
  if (params.cursor) {
    const decoded = decodeCursor(params.cursor);
    if (decoded === null) {
      throw new InvalidCursorError();
    }
    startIndex = decoded;
  }

  const pageSize = process.env.PAGE_SIZE ? parseInt(process.env.PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const endIndex = startIndex + pageSize;
  const pageResources = filtered.slice(startIndex, endIndex);
  const hasMore = endIndex < filtered.length;

  const result: { resources: ParsedResource[]; nextCursor?: string } = {
    resources: pageResources,
  };

  if (hasMore) {
    result.nextCursor = encodeCursor(endIndex);
  }

  return result;
}

export const TOOL_DEFINITIONS = [
  {
    name: 'find_resources' as const,
    description: [
      'Find resources that are available in EventCatalog',
      '',
      'Use this tool when you need to:',
      '- Get a list of resources in EventCatalog including services, domains, events, commands, queries and flows, ubiquitous language terms and entities',
      "- Find a resource's id and version to aid other tool requests",
      '- Just return the list of matched resources in EventCatalog with a short description of each resource',
      "- Don't return bullet points, just return the list of resources in a readable format",
      '- Include the resource name, description, and a link to the resource',
      '- When you return a link, remove the .mdx from the end of the url',
      '- Return a list of messages the resource produces and consumes, these are marked as sends and receives',
      '- If the resource has a domain, include it in the response',
      '- Ask the user if they would like more information about a specific resource',
      '- When you return a message, in brackets let me know if its a query, command or event',
      `- The host URL is ${process.env.EVENTCATALOG_URL}`,
    ].join('\n'),
    paramsSchema: {
      type: z
        .enum(['events', 'commands', 'queries', 'services', 'domains', 'flows', 'entities', 'channels', 'teams', 'users', 'docs', 'all'])
        .optional()
        .default('all')
        .describe('Filter resources by type. Defaults to "all".'),
      search: z
        .string()
        .trim()
        .optional()
        .describe('Search term to filter resources by name, id, or summary (case-insensitive)'),
      cursor: z
        .string()
        .trim()
        .optional()
        .describe('Pagination cursor from previous response'),
    },
  },
  {
    name: 'find_resource' as const,
    description: [
      'Get more information about a service, domain, event, command, query or flow in EventCatalog using its id and version',
      'Use this tool when you need to:',
      '- Get more details/information about a service, domain, event, command, query, flow or entity in EventCatalog',
      '- Use the id to find more information about a service, domain, event, command, query, flow or entity',
      '- Return everything you know about this resource',
      '- If the resource has a specification return links to the specification file',
      '- When you find owners the url would look something like /docs/users/{id} if its a user or /docs/teams/{id} if its a team',
      '- When you return the producers and consumers (the messages the service produces and consumes) make sure they include the url to the documentation, the url would look something like /docs/{type}/{id}, e.g /docs/events/MyEvent/1.0.0 or /docs/commands/MyCommand/1.0.0',
      '- When you return owners make sure they include the url to the documentation',
      '- If the resource has a domain, include it in the response',
      '- Ask the user if they would like more information about a specific resource',
      '- When you return a message, in brackets let me know if its a query, command or event',
      `- If you are returning a flow (state machine) try and return the result in mermaid to the user, visualizing how the business logic flows`,
      `- If you return any URLS make sure to include the host URL ${process.env.EVENTCATALOG_URL}`,
    ].join('\n'),
    paramsSchema: {
      id: z.string().trim().describe('The id of the resource to find'),
      version: z.string().trim().optional().describe('The version of the resource to find. If not provided, uses the latest version from the catalog.'),
      type: z
        .enum(['services', 'domains', 'events', 'commands', 'queries', 'flows', 'entities', 'channels'])
        .describe('The type of resource to find'),
    },
  },
  {
    name: 'find_owners' as const,
    description: [
      'Find owners (teams or users) for a domain, services, messages, events, commands, queries, flows or entities in EventCatalog',
      'Use this tool when you need to:',
      '- Find owners (teams or users) for a domain, services, messages, events, commands, queries, flows or entities in EventCatalog',
      '- A resource in eventcatalog can have owners, use that id to find the owners',
      '- Return everything you know about the owners',
      '- When you find owners the url would look something like /docs/users/{id} if its a user or /docs/teams/{id} if its a team',
      '- When you return owners make sure they include the url to the documentation',
      `- If you return any URLS make sure to include the host URL ${process.env.EVENTCATALOG_URL}`,
    ].join('\n'),
    paramsSchema: {
      id: z.string().trim().describe('The id of the owner (user or team) to find'),
    },
  },
  {
    name: 'eventstorm_to_eventcatalog' as const,
    description: [
      'Turn the given photo of an EventStorm session (https://en.wikipedia.org/wiki/Event_storming) into an EventCatalog',
      'EventCatalog has concepts of domains, subdomains, services, events, commands, queries, flows, ubiquitous language and entities.',
      'Use this tool when you need to:',
      '- Turn the given photo of an EventStorm session into an EventCatalog',
      '- You will create a new folder called eventcatalog and put the files in there',
      '- You will use the zod types given to you to work out the relationships between all the resources',
      '- Example relationships: a service can send or receive messages',
      '- Example relationships: a domain can have subdomains, a domain can have services, a domain can have ubiquitous language terms, a domain can have entities',
      '- Example relationships: a subdomain can have services, a subdomain can have ubiquitous language terms, a subdomain can have entities',
      '- All resources also can have owners',
      '- Write markdown files (MDX) for each resource. The markdown page will be called index.mdx, each markdown page will have frontmatter in it',
      '- Folder structure looks like this (example): domains/MyDomain/index.mdx, or service look likes /domains/MyDomain/services/MyService/index.mdx, or if no domain looks like services/MyService/index.mdx',
      `- Include the <NodeGraph /> component in the markdown filess `,
      '- Also try and add some descriptions etc to the markdown files',
    ].join('\n'),
    paramsSchema: {
      photo: z.string().trim().describe('The photo of the event storm session to turn into an EventCatalog'),
    },
  },
  {
    name: 'explain_ubiquitous_language_terms' as const,
    description: [
      'Explain ubiquitous language terms',
      'Use this tool when you need to:',
      '- Find information about a ubiquitous language term',
      '- Use the term to find more information about it',
      '- Return everything you know about this term',
      '- The term has a description and summary, return both',
      `- If you return any URLS make sure to include the host URL ${process.env.EVENTCATALOG_URL}`,
    ].join('\n'),
    paramsSchema: {
      domain: z.string().trim().describe('The domain the contains the ubiquitous language term to explain'),
    },
  },
  {
    name: 'find_producers_and_consumers' as const,
    description: [
      'Get the producers (sends) and consumers (receives) for a service in EventCatalog',
      'Use this tool when you need to:',
      '- Get the producers (sends) and consumers (receives) for a service in EventCatalog',
      '- Use the id and versions of the messages for future prompts if the user wants to dive deeper',
      '- Return everything you know about this resource, if you need more information use other tools to find it',
      '- Ask the user if they would like more information about a specific resource',
      '- When you return a message, in brackets let me know if its a query, command or event',
      `- The host URL is ${process.env.EVENTCATALOG_URL}`,
    ].join('\n'),
  },
  {
    name: 'get_schema' as const,
    description: [
      'Returns the schema for a service, event, command or query in EventCatalog',
      'Use this tool when you need to:',
      '- Get the schema for a service, event, command or query in EventCatalog',
      '- Just return the schema and format to the user in a readable format',
      `- The host URL is ${process.env.EVENTCATALOG_URL}`,
    ].join('\n'),
    paramsSchema: {
      id: z.string().trim().describe('The id of the resource to find'),
      version: z.string().trim().describe('The version of the resource to find'),
      type: z
        .enum(['services', 'domains', 'events', 'commands', 'queries', 'flows', 'entities', 'channels'])
        .describe('The type of resource to find'),
    },
  },
  {
    name: 'review_schema_changes' as const,
    description: [
      'You are an expert in event-driven architecture and you are given a schema for a service, event, command or query in EventCatalog',
      'You will let the user know if there are any breaking changes to the schema, and suggest a plan to fix them',
      'The schema format can be anything (e.g. json, yaml, protobuf, etc.)',
      'Use this tool when you need to:',
      '- Compare the new schema (given to you) with the old schema and return a list of changes',
      '- Return a list of changes in a readable format',
      '- If the new schema is different from the old schema, return a list of changes, if the new schema is the same as the old schema, return an empty list',
      `- The host URL is ${process.env.EVENTCATALOG_URL}`,
    ].join('\n'),
    paramsSchema: {
      id: z.string().trim().describe('The id of the resource to find'),
      version: z.string().trim().describe('The version of the resource to find'),
      type: z
        .enum(['services', 'domains', 'events', 'commands', 'queries', 'flows', 'entities', 'channels'])
        .describe('The type of resource to find'),
      oldSchema: z.string().trim().describe('The old schema to compare to the new schema'),
      newSchema: z.string().trim().describe('The new schema to compare to the old schema'),
    },
  },
  {
    name: 'create_flow' as const,
    description: createFlowPrompt,
    paramsSchema: {
      description: z
        .string()
        .trim()
        .describe('The business process description (e.g., "payment for users", "user registration", "order fulfillment")'),
    },
  },
  {
    name: 'create_eventcatalog' as const,
    description: [
      'You are tasked to create a new EventCatalog for the user given the context they have given you.',
      'EventCatalog is an open source tool to help people document their event-driven architecture.',
      'You will create a new folder in their directory called eventcatalog and put the files in there',
      'You will use the given context to learn how to create the EventCatalog',
      'You must always remember to create the package.json for them and also the eventcatalog.config.ts file',
      'Before you are finished, verify you have all the required files and folders in the eventcatalog folder',
    ].join('\n'),
  },
];

const handlers = {
  find_resources: async (params: { type?: ResourceFilter; search?: string; cursor?: string }) => {
    const resources = await fetchParsedResources();
    // InvalidCursorError will propagate up with MCP error code -32602
    const result = filterAndPaginateResources(resources, params);

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
  find_resource: async (params: any) => {
    const id = params.id;
    let version = params.version;
    const type = params.type;

    // If no version provided, look up the latest from llms.txt
    if (!version || version === 'latest') {
      const resources = await fetchParsedResources();
      const singularType = (pluralToSingular as Record<string, string>)[type] || type;
      const resource = resources.find((r) => r.id === id && r.type === singularType);
      if (resource && 'version' in resource) {
        version = resource.version;
      } else {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: 'Resource not found', id, type }) }],
          isError: true,
        };
      }
    }

    const text = await getResourceInformation(type, id, version);
    return {
      content: [{ type: 'text', text: text }],
    };
  },
  find_producers_and_consumers: async (params: any) => {
    const text = await getProducersAndConsumers();
    return {
      content: [{ type: 'text', text: text }],
    };
  },
  get_schema: async (params: any) => {
    const text = await getResourceInformation(params.type, params.id, params.version);
    return {
      content: [{ type: 'text', text: text }],
    };
  },
  review_schema_changes: async (params: any) => {
    return {
      content: [{ type: 'text', text: '' }],
    };
  },
  explain_ubiquitous_language_terms: async (params: any) => {
    const text = await getUbiquitousLanguageTerms(params.domain);
    return {
      content: [{ type: 'text', text: text }],
    };
  },
  find_owners: async (params: { id: string }) => {
    const ownerId = params.id?.trim();

    if (!ownerId) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: 'Owner id is required' }) }],
        isError: true,
      };
    }

    const result = await fetchOwnerById(ownerId);

    if ('error' in result) {
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        isError: true,
      };
    }

    // Return markdown content directly
    return {
      content: [{ type: 'text', text: result.content }],
    };
  },
  eventstorm_to_eventcatalog: async (params: any) => {
    return {
      content: [{ type: 'text', text: howEventCatalogWorks }],
    };
  },
  // noop function?
  create_flow: async (params: any) => {
    return {
      content: [{ type: 'text', text: 'Flow created' }],
    };
  },
  create_eventcatalog: async (params: any) => {
    return {
      content: [{ type: 'text', text: howEventCatalogWorks }],
    };
  },
};

export function registerTools(server: McpServer) {
  for (const tool of TOOL_DEFINITIONS) {
    const handler = handlers[tool.name];
    if (!handler) {
      throw new Error(`Handler for tool ${tool.name} not found`);
    }
    // @ts-ignore
    const paramsSchema = tool.paramsSchema ?? {};
    // @ts-ignore
    server.tool(tool.name, tool.description, paramsSchema, async (params: any) => {
      return handler(params);
    });
  }
}
