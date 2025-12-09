import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { filterByType } from '../src/utils/filter.js';
import { parseLlmsTxt } from '../src/parser.js';
import type { ParsedResource } from '../src/types.js';

// Mock data for getResourcesByType tests
const mockLlmsTxtForGetResources = `# Test EventCatalog

## Events
- [Order Created - OrderCreated - 1.0.0](https://example.com/docs/events/OrderCreated/1.0.0.mdx) - Order created event
- [Payment Received - PaymentReceived - 2.0.0](https://example.com/docs/events/PaymentReceived/2.0.0.mdx) - Payment received

## Services
- [Order Service - OrderService - 1.0.0](https://example.com/docs/services/OrderService/1.0.0.mdx) - Handles orders

## Domains
- [Orders Domain - OrdersDomain - 1.0.0](https://example.com/docs/domains/OrdersDomain/1.0.0.mdx) - Order management

## Commands
- [Create Order - CreateOrder - 1.0.0](https://example.com/docs/commands/CreateOrder/1.0.0.mdx) - Create a new order

## Queries
- [Get Order - GetOrder - 1.0.0](https://example.com/docs/queries/GetOrder/1.0.0.mdx) - Retrieve an order

## Teams
- [platform](https://example.com/docs/teams/platform.mdx) - Platform Team

## Users
- [john-doe](https://example.com/docs/users/john-doe.mdx) - John Doe
`;

// Sample resources for testing
const sampleResources: ParsedResource[] = [
  {
    type: 'event',
    id: 'OrderCreated',
    name: 'Order Created',
    version: '1.0.0',
    url: '/events/OrderCreated/1.0.0',
    summary: 'When an order is created',
  },
  {
    type: 'event',
    id: 'PaymentReceived',
    name: 'Payment Received',
    version: '2.0.0',
    url: '/events/PaymentReceived/2.0.0',
    summary: 'Payment completed',
  },
  {
    type: 'command',
    id: 'CreateOrder',
    name: 'Create Order',
    version: '1.0.0',
    url: '/commands/CreateOrder/1.0.0',
    summary: 'Create a new order',
  },
  {
    type: 'service',
    id: 'OrderService',
    name: 'Order Service',
    version: '1.0.0',
    url: '/services/OrderService/1.0.0',
    summary: 'Handles orders',
  },
  { type: 'team', id: 'platform-team', name: 'Platform Team', url: '/teams/platform-team', summary: 'Core platform' },
  { type: 'user', id: 'john-doe', name: 'John Doe', url: '/users/john-doe', summary: 'Developer' },
];

describe('filterByType', () => {
  it('returns all resources when type is "all"', () => {
    const result = filterByType(sampleResources, 'all');
    expect(result).toEqual(sampleResources);
    expect(result).toHaveLength(6);
  });

  it('filters by event type', () => {
    const result = filterByType(sampleResources, 'event');
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.type === 'event')).toBe(true);
    expect(result[0].id).toBe('OrderCreated');
    expect(result[1].id).toBe('PaymentReceived');
  });

  it('filters by command type', () => {
    const result = filterByType(sampleResources, 'command');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('command');
    expect(result[0].id).toBe('CreateOrder');
  });

  it('filters by service type', () => {
    const result = filterByType(sampleResources, 'service');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('service');
    expect(result[0].id).toBe('OrderService');
  });

  it('filters by team type', () => {
    const result = filterByType(sampleResources, 'team');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('team');
    expect(result[0].id).toBe('platform-team');
  });

  it('filters by user type', () => {
    const result = filterByType(sampleResources, 'user');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('user');
    expect(result[0].id).toBe('john-doe');
  });

  it('returns empty array for type with no matches', () => {
    const result = filterByType(sampleResources, 'flow');
    expect(result).toHaveLength(0);
  });

  it('returns empty array when input is empty', () => {
    const result = filterByType([], 'event');
    expect(result).toHaveLength(0);
  });

  it('filters by query type', () => {
    const resourcesWithQuery: ParsedResource[] = [
      ...sampleResources,
      { type: 'query', id: 'GetOrder', name: 'Get Order', version: '1.0.0', url: '/queries/GetOrder/1.0.0' },
    ];
    const result = filterByType(resourcesWithQuery, 'query');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('GetOrder');
  });

  it('filters by domain type', () => {
    const resourcesWithDomain: ParsedResource[] = [
      ...sampleResources,
      { type: 'domain', id: 'Orders', name: 'Orders Domain', version: '1.0.0', url: '/domains/Orders/1.0.0' },
    ];
    const result = filterByType(resourcesWithDomain, 'domain');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('Orders');
  });

  it('filters by flow type', () => {
    const resourcesWithFlow: ParsedResource[] = [
      ...sampleResources,
      { type: 'flow', id: 'OrderFlow', name: 'Order Flow', version: '1.0.0', url: '/flows/OrderFlow/1.0.0' },
    ];
    const result = filterByType(resourcesWithFlow, 'flow');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('OrderFlow');
  });

  it('preserves all resource fields', () => {
    const result = filterByType(sampleResources, 'event');
    const event = result[0];

    expect(event).toHaveProperty('type', 'event');
    expect(event).toHaveProperty('id', 'OrderCreated');
    expect(event).toHaveProperty('name', 'Order Created');
    expect(event).toHaveProperty('version', '1.0.0');
    expect(event).toHaveProperty('url');
    expect(event).toHaveProperty('summary', 'When an order is created');
  });
});

describe('filterByType with parsed llms.txt', () => {
  const mockLlmsTxt = `# EventCatalog

## Events
- [Order Created - OrderCreated - 1.0.0](https://example.com/docs/events/OrderCreated/1.0.0) - When an order is created
- [Payment Received - PaymentReceived - 2.0.0](https://example.com/docs/events/PaymentReceived/2.0.0) - Payment completed

## Commands
- [Create Order - CreateOrder - 1.0.0](https://example.com/docs/commands/CreateOrder/1.0.0) - Create a new order

## Services
- [Order Service - OrderService - 1.0.0](https://example.com/docs/services/OrderService/1.0.0) - Handles orders

## Teams
- [Platform Team - platform-team](https://example.com/docs/teams/platform-team) - Core platform
`;

  it('works with parsed llms.txt data', () => {
    const resources = parseLlmsTxt(mockLlmsTxt);

    const events = filterByType(resources, 'event');
    expect(events).toHaveLength(2);

    const commands = filterByType(resources, 'command');
    expect(commands).toHaveLength(1);

    const services = filterByType(resources, 'service');
    expect(services).toHaveLength(1);

    const teams = filterByType(resources, 'team');
    expect(teams).toHaveLength(1);

    const all = filterByType(resources, 'all');
    expect(all).toHaveLength(5);
  });
});

describe('getResourcesByType', () => {
  beforeEach(() => {
    vi.stubEnv('EVENTCATALOG_URL', 'https://example.com');
    vi.resetModules();

    // Mock fetchParsedResources
    vi.doMock('../src/utils/fetch.js', () => ({
      fetchParsedResources: vi.fn(async () => parseLlmsTxt(mockLlmsTxtForGetResources)),
      fetchLlmsTxt: vi.fn(async () => mockLlmsTxtForGetResources),
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('../src/utils/fetch.js');
  });

  it('returns all resources when type is "all"', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('all');
    const parsed = JSON.parse(result);

    expect(parsed).toHaveProperty('resources');
    expect(Array.isArray(parsed.resources)).toBe(true);
    expect(parsed.resources.length).toBe(8); // 2 events + 1 service + 1 domain + 1 command + 1 query + 1 team + 1 user
  });

  it('returns only events when type is "event"', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('event');
    const parsed = JSON.parse(result);

    expect(parsed.resources).toHaveLength(2);
    expect(parsed.resources.every((r: any) => r.type === 'event')).toBe(true);
  });

  it('returns only services when type is "service"', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('service');
    const parsed = JSON.parse(result);

    expect(parsed.resources).toHaveLength(1);
    expect(parsed.resources[0].type).toBe('service');
    expect(parsed.resources[0].id).toBe('OrderService');
  });

  it('returns only domains when type is "domain"', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('domain');
    const parsed = JSON.parse(result);

    expect(parsed.resources).toHaveLength(1);
    expect(parsed.resources[0].type).toBe('domain');
  });

  it('returns only commands when type is "command"', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('command');
    const parsed = JSON.parse(result);

    expect(parsed.resources).toHaveLength(1);
    expect(parsed.resources[0].type).toBe('command');
  });

  it('returns only queries when type is "query"', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('query');
    const parsed = JSON.parse(result);

    expect(parsed.resources).toHaveLength(1);
    expect(parsed.resources[0].type).toBe('query');
  });

  it('returns only teams when type is "team"', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('team');
    const parsed = JSON.parse(result);

    expect(parsed.resources).toHaveLength(1);
    expect(parsed.resources[0].type).toBe('team');
    expect(parsed.resources[0]).not.toHaveProperty('version');
  });

  it('returns only users when type is "user"', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('user');
    const parsed = JSON.parse(result);

    expect(parsed.resources).toHaveLength(1);
    expect(parsed.resources[0].type).toBe('user');
    expect(parsed.resources[0]).not.toHaveProperty('version');
  });

  it('returns empty array for type with no resources', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('flow');
    const parsed = JSON.parse(result);

    expect(parsed.resources).toHaveLength(0);
  });

  it('returns valid JSON with resources wrapper', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('event');

    // Should be valid JSON
    expect(() => JSON.parse(result)).not.toThrow();

    // Should have resources property
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('resources');
  });

  it('resources have all required fields', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('event');
    const parsed = JSON.parse(result);

    for (const resource of parsed.resources) {
      expect(resource).toHaveProperty('id');
      expect(resource).toHaveProperty('name');
      expect(resource).toHaveProperty('type');
      expect(resource).toHaveProperty('url');
      expect(resource).toHaveProperty('version'); // events are versioned
    }
  });

  it('matches find_resources tool output format', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');
    const result = await getResourcesByType('all');
    const parsed = JSON.parse(result);

    // Should match { resources: [...] } format used by find_resources tool
    expect(parsed).toHaveProperty('resources');
    expect(Array.isArray(parsed.resources)).toBe(true);
    expect(Object.keys(parsed)).toEqual(['resources']);
  });
});

describe('uriToType mapping (via resource definitions)', () => {
  // uriToType is a private function, but we can verify its behavior
  // through the resource definitions and their URIs

  beforeEach(() => {
    vi.stubEnv('EVENTCATALOG_URL', 'https://example.com');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('handles all standard resource types', async () => {
    const { getResourcesByType } = await import('../src/resources/index.js');

    // Test all singular types that uriToType should handle
    const types = [
      'all',
      'event',
      'domain',
      'service',
      'query',
      'command',
      'flow',
      'team',
      'user',
      'entity',
      'channel',
      'doc',
    ] as const;

    for (const type of types) {
      const result = await getResourcesByType(type);
      expect(() => JSON.parse(result)).not.toThrow();
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('resources');
    }
  });
});
