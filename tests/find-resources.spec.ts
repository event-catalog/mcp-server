import { describe, it, expect } from 'vitest';
import { filterAndPaginateResources } from '../src/tools/index.js';
import { encodeCursor, decodeCursor, InvalidCursorError } from '../src/cursor.js';
import type { ParsedResource } from '../src/types.js';

// Sample resources for testing
const sampleResources: ParsedResource[] = [
  { type: 'event', id: 'OrderCreated', name: 'Order Created', version: '1.0.0', url: '/events/OrderCreated/1.0.0', summary: 'When an order is created' },
  { type: 'event', id: 'OrderShipped', name: 'Order Shipped', version: '1.0.0', url: '/events/OrderShipped/1.0.0', summary: 'When order ships' },
  { type: 'event', id: 'PaymentReceived', name: 'Payment Received', version: '2.0.0', url: '/events/PaymentReceived/2.0.0', summary: 'Payment completed' },
  { type: 'command', id: 'CreateOrder', name: 'Create Order', version: '1.0.0', url: '/commands/CreateOrder/1.0.0', summary: 'Create a new order' },
  { type: 'command', id: 'ShipOrder', name: 'Ship Order', version: '1.0.0', url: '/commands/ShipOrder/1.0.0', summary: 'Ship an order' },
  { type: 'service', id: 'OrderService', name: 'Order Service', version: '1.0.0', url: '/services/OrderService/1.0.0', summary: 'Handles orders' },
  { type: 'service', id: 'PaymentService', name: 'Payment Service', version: '1.0.0', url: '/services/PaymentService/1.0.0', summary: 'Handles payments' },
  { type: 'team', id: 'platform-team', name: 'Platform Team', url: '/teams/platform-team', summary: 'Core platform' },
  { type: 'team', id: 'payments-team', name: 'Payments Team', url: '/teams/payments-team', summary: 'Payment processing' },
  { type: 'user', id: 'john-doe', name: 'John Doe', url: '/users/john-doe', summary: 'Developer' },
];

describe('filterAndPaginateResources', () => {
  describe('no filters', () => {
    it('returns all resources when no params provided', () => {
      const result = filterAndPaginateResources(sampleResources, {});
      expect(result.resources).toEqual(sampleResources);
      expect(result.nextCursor).toBeUndefined();
    });

    it('returns all resources when type is "all"', () => {
      const result = filterAndPaginateResources(sampleResources, { type: 'all' });
      expect(result.resources).toEqual(sampleResources);
    });
  });

  describe('type filtering', () => {
    it('filters by event type', () => {
      const result = filterAndPaginateResources(sampleResources, { type: 'event' });
      expect(result.resources).toHaveLength(3);
      expect(result.resources.every((r) => r.type === 'event')).toBe(true);
    });

    it('filters by command type', () => {
      const result = filterAndPaginateResources(sampleResources, { type: 'command' });
      expect(result.resources).toHaveLength(2);
      expect(result.resources.every((r) => r.type === 'command')).toBe(true);
    });

    it('filters by service type', () => {
      const result = filterAndPaginateResources(sampleResources, { type: 'service' });
      expect(result.resources).toHaveLength(2);
      expect(result.resources.every((r) => r.type === 'service')).toBe(true);
    });

    it('filters by team type', () => {
      const result = filterAndPaginateResources(sampleResources, { type: 'team' });
      expect(result.resources).toHaveLength(2);
      expect(result.resources.every((r) => r.type === 'team')).toBe(true);
    });

    it('filters by user type', () => {
      const result = filterAndPaginateResources(sampleResources, { type: 'user' });
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].id).toBe('john-doe');
    });

    it('returns empty array for type with no matches', () => {
      const result = filterAndPaginateResources(sampleResources, { type: 'flow' });
      expect(result.resources).toHaveLength(0);
    });
  });

  describe('search filtering', () => {
    it('searches by name (case-insensitive)', () => {
      const result = filterAndPaginateResources(sampleResources, { search: 'order' });
      // Should match: OrderCreated, OrderShipped, CreateOrder, ShipOrder, OrderService
      expect(result.resources).toHaveLength(5);
    });

    it('searches by id', () => {
      const result = filterAndPaginateResources(sampleResources, { search: 'PaymentService' });
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].id).toBe('PaymentService');
    });

    it('searches by summary', () => {
      const result = filterAndPaginateResources(sampleResources, { search: 'completed' });
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].id).toBe('PaymentReceived');
    });

    it('search is case-insensitive', () => {
      const result = filterAndPaginateResources(sampleResources, { search: 'ORDER' });
      expect(result.resources).toHaveLength(5);
    });

    it('returns empty array for search with no matches', () => {
      const result = filterAndPaginateResources(sampleResources, { search: 'nonexistent' });
      expect(result.resources).toHaveLength(0);
    });
  });

  describe('combined filtering', () => {
    it('filters by type AND search', () => {
      const result = filterAndPaginateResources(sampleResources, { type: 'event', search: 'order' });
      // Should match: OrderCreated, OrderShipped (events containing "order")
      expect(result.resources).toHaveLength(2);
      expect(result.resources.every((r) => r.type === 'event')).toBe(true);
    });

    it('type and search combination with no results', () => {
      const result = filterAndPaginateResources(sampleResources, { type: 'team', search: 'order' });
      expect(result.resources).toHaveLength(0);
    });
  });

  describe('pagination', () => {
    // Create 100 resources for pagination testing
    const manyResources: ParsedResource[] = Array.from({ length: 100 }, (_, i) => ({
      type: 'event' as const,
      id: `Event${i}`,
      name: `Event ${i}`,
      version: '1.0.0',
      url: `/events/Event${i}/1.0.0`,
      summary: `Event number ${i}`,
    }));

    it('returns first page (50 items) without cursor', () => {
      const result = filterAndPaginateResources(manyResources, {});
      expect(result.resources).toHaveLength(50);
      expect(result.resources[0].id).toBe('Event0');
      expect(result.resources[49].id).toBe('Event49');
      expect(result.nextCursor).toBeDefined();
    });

    it('returns second page with cursor', () => {
      const cursor = encodeCursor(50);
      const result = filterAndPaginateResources(manyResources, { cursor });
      expect(result.resources).toHaveLength(50);
      expect(result.resources[0].id).toBe('Event50');
      expect(result.resources[49].id).toBe('Event99');
      expect(result.nextCursor).toBeUndefined(); // No more pages
    });

    it('nextCursor is absent when no more items', () => {
      // Small set that fits in one page
      const result = filterAndPaginateResources(sampleResources, {});
      expect(result.nextCursor).toBeUndefined();
    });

    it('nextCursor is present when more items exist', () => {
      const result = filterAndPaginateResources(manyResources, {});
      expect(result.nextCursor).toBeDefined();
      const decodedPosition = decodeCursor(result.nextCursor!);
      expect(decodedPosition).toBe(50);
    });

    it('throws InvalidCursorError for invalid cursor', () => {
      expect(() => filterAndPaginateResources(sampleResources, { cursor: 'invalid!!!' }))
        .toThrow(InvalidCursorError);
    });

    it('InvalidCursorError has MCP error code -32602', () => {
      try {
        filterAndPaginateResources(sampleResources, { cursor: 'invalid!!!' });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidCursorError);
        expect((error as InvalidCursorError).code).toBe(-32602);
      }
    });

    it('returns empty array for cursor beyond data range', () => {
      const cursor = encodeCursor(1000); // Way beyond our 10 items
      const result = filterAndPaginateResources(sampleResources, { cursor });
      expect(result.resources).toHaveLength(0);
      expect(result.nextCursor).toBeUndefined();
    });

    it('pagination works correctly with filtering', () => {
      // Create 75 events and 25 commands
      const mixedResources: ParsedResource[] = [
        ...Array.from({ length: 75 }, (_, i) => ({
          type: 'event' as const,
          id: `Event${i}`,
          name: `Event ${i}`,
          version: '1.0.0',
          url: `/events/Event${i}/1.0.0`,
        })),
        ...Array.from({ length: 25 }, (_, i) => ({
          type: 'command' as const,
          id: `Command${i}`,
          name: `Command ${i}`,
          version: '1.0.0',
          url: `/commands/Command${i}/1.0.0`,
        })),
      ];

      // Filter by event (75 items) - should give first page with nextCursor
      const result1 = filterAndPaginateResources(mixedResources, { type: 'event' });
      expect(result1.resources).toHaveLength(50);
      expect(result1.nextCursor).toBeDefined();

      // Filter by command (25 items) - should fit in one page
      const result2 = filterAndPaginateResources(mixedResources, { type: 'command' });
      expect(result2.resources).toHaveLength(25);
      expect(result2.nextCursor).toBeUndefined();
    });
  });

  describe('cursor pagination roundtrip', () => {
    const manyResources: ParsedResource[] = Array.from({ length: 120 }, (_, i) => ({
      type: 'event' as const,
      id: `Event${i}`,
      name: `Event ${i}`,
      version: '1.0.0',
      url: `/events/Event${i}/1.0.0`,
    }));

    it('can iterate through all pages', () => {
      const allCollected: ParsedResource[] = [];
      let cursor: string | undefined = undefined;

      // Page 1
      const result1 = filterAndPaginateResources(manyResources, { cursor });
      allCollected.push(...result1.resources);
      cursor = result1.nextCursor;
      expect(cursor).toBeDefined();

      // Page 2
      const result2 = filterAndPaginateResources(manyResources, { cursor });
      allCollected.push(...result2.resources);
      cursor = result2.nextCursor;
      expect(cursor).toBeDefined();

      // Page 3 (last)
      const result3 = filterAndPaginateResources(manyResources, { cursor });
      allCollected.push(...result3.resources);
      cursor = result3.nextCursor;
      expect(cursor).toBeUndefined(); // No more pages

      expect(allCollected).toHaveLength(120);
      expect(allCollected[0].id).toBe('Event0');
      expect(allCollected[119].id).toBe('Event119');
    });
  });
});

describe('find_resources tool definition', () => {
  it('has paramsSchema with type, search, and cursor', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resources');

    expect(tool).toBeDefined();
    expect(tool!.paramsSchema).toBeDefined();

    const schema = tool!.paramsSchema!;
    expect(schema.type).toBeDefined();
    expect(schema.search).toBeDefined();
    expect(schema.cursor).toBeDefined();
  });

  it('type param accepts all valid resource types (plural)', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resources');
    const typeSchema = tool!.paramsSchema!.type;

    const validTypes = [
      'events',
      'commands',
      'queries',
      'services',
      'domains',
      'flows',
      'entities',
      'channels',
      'teams',
      'users',
      'docs',
      'all',
    ];

    for (const t of validTypes) {
      const result = typeSchema.safeParse(t);
      expect(result.success, `type "${t}" should be valid`).toBe(true);
    }
  });

  it('type param rejects invalid types', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resources');
    const typeSchema = tool!.paramsSchema!.type;

    const result = typeSchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });

  it('type param defaults to "all"', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resources');
    const typeSchema = tool!.paramsSchema!.type;

    const result = typeSchema.parse(undefined);
    expect(result).toBe('all');
  });

  it('search param is optional string with trimming', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resources');
    const searchSchema = tool!.paramsSchema!.search;

    expect(searchSchema.safeParse(undefined).success).toBe(true);
    expect(searchSchema.safeParse('order').success).toBe(true);
    expect(searchSchema.parse('  trimmed  ')).toBe('trimmed');
  });

  it('cursor param is optional string', async () => {
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resources');
    const cursorSchema = tool!.paramsSchema!.cursor;

    expect(cursorSchema.safeParse(undefined).success).toBe(true);
    expect(cursorSchema.safeParse('abc123').success).toBe(true);
  });
});
