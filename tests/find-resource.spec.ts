import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseLlmsTxt } from '../src/parser.js';
import { pluralToSingular } from '../src/utils/filter.js';
import type { ParsedResource } from '../src/types.js';

describe('find_resource tool definition', () => {
  beforeEach(() => {
    vi.stubEnv('EVENTCATALOG_URL', 'https://example.com');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('has correct name', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resource');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('find_resource');
  });

  it('has id, version, and type params', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resource');
    expect(tool!.paramsSchema).toBeDefined();
    expect(tool!.paramsSchema!.id).toBeDefined();
    expect(tool!.paramsSchema!.version).toBeDefined();
    expect(tool!.paramsSchema!.type).toBeDefined();
  });

  it('version param is optional', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resource');
    const versionSchema = tool!.paramsSchema!.version;

    expect(versionSchema.safeParse(undefined).success).toBe(true);
    expect(versionSchema.safeParse('1.0.0').success).toBe(true);
  });

  it('type param accepts all valid plural types', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resource');
    const typeSchema = tool!.paramsSchema!.type;

    const validTypes = ['services', 'domains', 'events', 'commands', 'queries', 'flows', 'entities', 'channels'];

    for (const t of validTypes) {
      const result = typeSchema.safeParse(t);
      expect(result.success, `type "${t}" should be valid`).toBe(true);
    }
  });

  it('type param rejects invalid types', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resource');
    const typeSchema = tool!.paramsSchema!.type;

    expect(typeSchema.safeParse('invalid').success).toBe(false);
    expect(typeSchema.safeParse('event').success).toBe(false); // singular not allowed
    expect(typeSchema.safeParse('all').success).toBe(false);
  });
});

describe('find_resource version lookup logic', () => {
  // Sample llms.txt content for testing
  const sampleLlmsTxt = `# Test EventCatalog

## Events
- [Order Created - OrderCreated - 1.0.0](https://example.com/docs/events/OrderCreated/1.0.0.mdx) - Order created event
- [Order Created - OrderCreated - 2.0.0](https://example.com/docs/events/OrderCreated/2.0.0.mdx) - Order created event v2
- [Payment Received - PaymentReceived - 1.0.0](https://example.com/docs/events/PaymentReceived/1.0.0.mdx) - Payment received

## Services
- [Order Service - OrderService - 1.0.0](https://example.com/docs/services/OrderService/1.0.0.mdx) - Handles orders
- [Payment Service - PaymentService - 2.5.0](https://example.com/docs/services/PaymentService/2.5.0.mdx) - Handles payments

## Teams
- [platform](https://example.com/docs/teams/platform.mdx) - Platform Team
`;

  let parsedResources: ParsedResource[];

  beforeEach(() => {
    parsedResources = parseLlmsTxt(sampleLlmsTxt);
  });

  it('finds resource by id and type', () => {
    const singularType = pluralToSingular['events'];
    const resource = parsedResources.find((r) => r.id === 'OrderCreated' && r.type === singularType);

    expect(resource).toBeDefined();
    expect(resource!.id).toBe('OrderCreated');
    expect(resource!.type).toBe('event');
  });

  it('returns first matching resource when multiple versions exist', () => {
    const singularType = pluralToSingular['events'];
    const resource = parsedResources.find((r) => r.id === 'OrderCreated' && r.type === singularType);

    // First one in the list (1.0.0)
    expect(resource).toBeDefined();
    if (resource && 'version' in resource) {
      expect(resource.version).toBe('1.0.0');
    }
  });

  it('finds service by id', () => {
    const singularType = pluralToSingular['services'];
    const resource = parsedResources.find((r) => r.id === 'OrderService' && r.type === singularType);

    expect(resource).toBeDefined();
    expect(resource!.type).toBe('service');
    if (resource && 'version' in resource) {
      expect(resource.version).toBe('1.0.0');
    }
  });

  it('returns undefined for non-existent resource', () => {
    const singularType = pluralToSingular['events'];
    const resource = parsedResources.find((r) => r.id === 'NonExistent' && r.type === singularType);

    expect(resource).toBeUndefined();
  });

  it('returns undefined for wrong type', () => {
    // OrderCreated is an event, not a service
    const singularType = pluralToSingular['services'];
    const resource = parsedResources.find((r) => r.id === 'OrderCreated' && r.type === singularType);

    expect(resource).toBeUndefined();
  });

  it('teams do not have version', () => {
    const singularType = pluralToSingular['teams'];
    const resource = parsedResources.find((r) => r.id === 'platform' && r.type === singularType);

    expect(resource).toBeDefined();
    expect(resource!.type).toBe('team');
    expect('version' in resource!).toBe(false);
  });

  it('pluralToSingular correctly maps all types', () => {
    expect(pluralToSingular['events']).toBe('event');
    expect(pluralToSingular['commands']).toBe('command');
    expect(pluralToSingular['queries']).toBe('query');
    expect(pluralToSingular['services']).toBe('service');
    expect(pluralToSingular['domains']).toBe('domain');
    expect(pluralToSingular['flows']).toBe('flow');
    expect(pluralToSingular['entities']).toBe('entity');
    expect(pluralToSingular['channels']).toBe('channel');
    expect(pluralToSingular['teams']).toBe('team');
    expect(pluralToSingular['users']).toBe('user');
    expect(pluralToSingular['docs']).toBe('doc');
  });
});

describe('get_schema tool definition', () => {
  beforeEach(() => {
    vi.stubEnv('EVENTCATALOG_URL', 'https://example.com');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('has correct name', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'get_schema');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('get_schema');
  });

  it('has id, version, and type params', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'get_schema');
    expect(tool!.paramsSchema).toBeDefined();
    expect(tool!.paramsSchema!.id).toBeDefined();
    expect(tool!.paramsSchema!.version).toBeDefined();
    expect(tool!.paramsSchema!.type).toBeDefined();
  });

  it('type param accepts all valid plural types', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'get_schema');
    const typeSchema = tool!.paramsSchema!.type;

    const validTypes = ['services', 'domains', 'events', 'commands', 'queries', 'flows', 'entities', 'channels'];

    for (const t of validTypes) {
      const result = typeSchema.safeParse(t);
      expect(result.success, `type "${t}" should be valid`).toBe(true);
    }
  });

  it('uses same types as find_resource', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const findResource = TOOL_DEFINITIONS.find((t) => t.name === 'find_resource');
    const getSchema = TOOL_DEFINITIONS.find((t) => t.name === 'get_schema');

    // Both should have the same type options
    const findResourceTypes = findResource!.paramsSchema!.type._def.values;
    const getSchemaTypes = getSchema!.paramsSchema!.type._def.values;

    expect(findResourceTypes).toEqual(getSchemaTypes);
  });
});
