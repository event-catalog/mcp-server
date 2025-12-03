import { describe, it, expect } from 'vitest';
import { filterByType, filterBySearch, pluralToSingular } from '../src/utils/filter.js';
import type { ParsedResource } from '../src/types.js';

// Sample resources for testing
const sampleResources: ParsedResource[] = [
  { type: 'event', id: 'OrderCreated', name: 'Order Created', version: '1.0.0', url: '/events/OrderCreated/1.0.0', summary: 'When an order is created' },
  { type: 'event', id: 'PaymentReceived', name: 'Payment Received', version: '2.0.0', url: '/events/PaymentReceived/2.0.0', summary: 'Payment completed successfully' },
  { type: 'command', id: 'CreateOrder', name: 'Create Order', version: '1.0.0', url: '/commands/CreateOrder/1.0.0', summary: 'Create a new order' },
  { type: 'service', id: 'OrderService', name: 'Order Service', version: '1.0.0', url: '/services/OrderService/1.0.0', summary: 'Handles order processing' },
  { type: 'team', id: 'platform-team', name: 'Platform Team', url: '/teams/platform-team', summary: 'Core platform engineers' },
  { type: 'user', id: 'john-doe', name: 'John Doe', url: '/users/john-doe', summary: 'Senior Developer' },
  { type: 'domain', id: 'Orders', name: 'Orders Domain', version: '1.0.0', url: '/domains/Orders/1.0.0', summary: 'Order management bounded context' },
];

describe('filterBySearch', () => {
  describe('basic search', () => {
    it('finds resources by name', () => {
      const result = filterBySearch(sampleResources, 'Order');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.name.toLowerCase().includes('order'))).toBe(true);
    });

    it('finds resources by id', () => {
      const result = filterBySearch(sampleResources, 'OrderCreated');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('OrderCreated');
    });

    it('finds resources by summary', () => {
      const result = filterBySearch(sampleResources, 'successfully');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('PaymentReceived');
    });

    it('returns empty array when no matches', () => {
      const result = filterBySearch(sampleResources, 'nonexistent-term');
      expect(result).toHaveLength(0);
    });

    it('returns empty array for empty input', () => {
      const result = filterBySearch([], 'order');
      expect(result).toHaveLength(0);
    });
  });

  describe('case insensitivity', () => {
    it('matches lowercase search against uppercase name', () => {
      const result = filterBySearch(sampleResources, 'order');
      expect(result.length).toBeGreaterThan(0);
    });

    it('matches uppercase search against lowercase content', () => {
      const result = filterBySearch(sampleResources, 'ORDER');
      expect(result.length).toBeGreaterThan(0);
    });

    it('matches mixed case search', () => {
      const result = filterBySearch(sampleResources, 'OrDeR');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('partial matching', () => {
    it('finds partial matches in name', () => {
      const result = filterBySearch(sampleResources, 'Plat');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('platform-team');
    });

    it('finds partial matches in id', () => {
      const result = filterBySearch(sampleResources, 'john');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('john-doe');
    });

    it('finds partial matches in summary', () => {
      const result = filterBySearch(sampleResources, 'bounded');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('Orders');
    });
  });

  describe('multiple matches', () => {
    it('returns all matching resources', () => {
      const result = filterBySearch(sampleResources, 'order');
      // Should match: OrderCreated, CreateOrder, OrderService, Orders Domain
      expect(result.length).toBeGreaterThanOrEqual(4);
    });

    it('matches across different fields', () => {
      // "platform" appears in both id and name of platform-team
      const result = filterBySearch(sampleResources, 'platform');
      expect(result).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('handles resources without summary', () => {
      const resourcesNoSummary: ParsedResource[] = [
        { type: 'event', id: 'TestEvent', name: 'Test Event', version: '1.0.0', url: '/events/TestEvent/1.0.0' },
      ];
      const result = filterBySearch(resourcesNoSummary, 'Test');
      expect(result).toHaveLength(1);
    });

    it('handles single character search', () => {
      const result = filterBySearch(sampleResources, 'O');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles special characters in search', () => {
      const resourcesWithSpecial: ParsedResource[] = [
        { type: 'team', id: 'my-team', name: 'My Team', url: '/teams/my-team' },
      ];
      const result = filterBySearch(resourcesWithSpecial, 'my-team');
      expect(result).toHaveLength(1);
    });

    it('trims whitespace is handled by caller (returns no match with spaces)', () => {
      // The function itself doesn't trim, so this tests current behavior
      const result = filterBySearch(sampleResources, '  order  ');
      // Won't match because the spaces are included in search
      expect(result).toHaveLength(0);
    });
  });
});

describe('filterByType with plural types', () => {
  it('filters by plural type "events"', () => {
    const result = filterByType(sampleResources, 'events');
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.type === 'event')).toBe(true);
  });

  it('filters by plural type "commands"', () => {
    const result = filterByType(sampleResources, 'commands');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('command');
  });

  it('filters by plural type "services"', () => {
    const result = filterByType(sampleResources, 'services');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('service');
  });

  it('filters by plural type "teams"', () => {
    const result = filterByType(sampleResources, 'teams');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('team');
  });

  it('filters by plural type "users"', () => {
    const result = filterByType(sampleResources, 'users');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('user');
  });

  it('filters by plural type "domains"', () => {
    const result = filterByType(sampleResources, 'domains');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('domain');
  });

  it('still works with singular types', () => {
    const result = filterByType(sampleResources, 'event');
    expect(result).toHaveLength(2);
  });
});

describe('pluralToSingular mapping', () => {
  it('maps all versioned plural types', () => {
    expect(pluralToSingular.events).toBe('event');
    expect(pluralToSingular.commands).toBe('command');
    expect(pluralToSingular.queries).toBe('query');
    expect(pluralToSingular.services).toBe('service');
    expect(pluralToSingular.domains).toBe('domain');
    expect(pluralToSingular.flows).toBe('flow');
    expect(pluralToSingular.entities).toBe('entity');
    expect(pluralToSingular.channels).toBe('channel');
  });

  it('maps all unversioned plural types', () => {
    expect(pluralToSingular.teams).toBe('team');
    expect(pluralToSingular.users).toBe('user');
    expect(pluralToSingular.docs).toBe('doc');
  });

  it('has exactly 11 mappings', () => {
    expect(Object.keys(pluralToSingular)).toHaveLength(11);
  });

  it('all values are valid ResourceKind', () => {
    const validKinds = ['event', 'command', 'query', 'service', 'domain', 'flow', 'entity', 'channel', 'team', 'user', 'doc'];
    for (const value of Object.values(pluralToSingular)) {
      expect(validKinds).toContain(value);
    }
  });
});
