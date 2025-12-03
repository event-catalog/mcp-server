import { describe, it, expect, beforeAll } from 'vitest';
import { parseLlmsTxt } from '../src/parser.js';
import { filterByType, filterBySearch } from '../src/utils/filter.js';
import { encodeCursor, decodeCursor } from '../src/cursor.js';
import type { ParsedResource } from '../src/types.js';

/**
 * Integration tests using real data from demo.eventcatalog.dev
 * These tests verify the full pipeline works with production-like data
 */

const DEMO_LLMS_TXT_URL = 'https://demo.eventcatalog.dev/docs/llm/llms.txt';

describe('Integration tests with demo.eventcatalog.dev', () => {
  let llmsTxt: string;
  let parsedResources: ParsedResource[];

  beforeAll(async () => {
    // Fetch real llms.txt from demo EventCatalog
    const response = await fetch(DEMO_LLMS_TXT_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch llms.txt: ${response.status}`);
    }
    llmsTxt = await response.text();
    parsedResources = parseLlmsTxt(llmsTxt);
  });

  describe('parser with real data', () => {
    it('parses llms.txt successfully', () => {
      expect(parsedResources.length).toBeGreaterThan(0);
    });

    it('parses events', () => {
      const events = parsedResources.filter((r) => r.type === 'event');
      expect(events.length).toBeGreaterThan(0);
      // All events should have version
      for (const event of events) {
        expect(event).toHaveProperty('version');
        expect(event.version).toMatch(/^\d+\.\d+\.\d+$/);
      }
    });

    it('parses services', () => {
      const services = parsedResources.filter((r) => r.type === 'service');
      expect(services.length).toBeGreaterThan(0);
      // All services should have id, name, version, url
      for (const service of services) {
        expect(service.id).toBeTruthy();
        expect(service.name).toBeTruthy();
        expect(service).toHaveProperty('version');
        expect(service.url).toBeTruthy();
      }
    });

    it('parses domains', () => {
      const domains = parsedResources.filter((r) => r.type === 'domain');
      expect(domains.length).toBeGreaterThan(0);
    });

    it('parses commands', () => {
      const commands = parsedResources.filter((r) => r.type === 'command');
      expect(commands.length).toBeGreaterThan(0);
    });

    it('parses queries', () => {
      const queries = parsedResources.filter((r) => r.type === 'query');
      expect(queries.length).toBeGreaterThan(0);
    });

    it('parses teams', () => {
      const teams = parsedResources.filter((r) => r.type === 'team');
      expect(teams.length).toBeGreaterThan(0);
      // Teams should NOT have version
      for (const team of teams) {
        expect(team).not.toHaveProperty('version');
      }
    });

    it('parses users', () => {
      const users = parsedResources.filter((r) => r.type === 'user');
      expect(users.length).toBeGreaterThan(0);
    });

    it('all resources have required fields', () => {
      for (const resource of parsedResources) {
        expect(resource.id).toBeTruthy();
        expect(resource.name).toBeTruthy();
        expect(resource.type).toBeTruthy();
        expect(resource.url).toBeTruthy();
      }
    });
  });

  describe('filtering with real data', () => {
    it('filters by plural type "events"', () => {
      const events = filterByType(parsedResources, 'events');
      expect(events.length).toBeGreaterThan(0);
      expect(events.every((r) => r.type === 'event')).toBe(true);
    });

    it('filters by plural type "services"', () => {
      const services = filterByType(parsedResources, 'services');
      expect(services.length).toBeGreaterThan(0);
      expect(services.every((r) => r.type === 'service')).toBe(true);
    });

    it('filters by "all" returns everything', () => {
      const all = filterByType(parsedResources, 'all');
      expect(all).toHaveLength(parsedResources.length);
    });

    it('search finds resources by name', () => {
      // Search for a common term that should exist
      const results = filterBySearch(parsedResources, 'Order');
      expect(results.length).toBeGreaterThan(0);
    });

    it('search is case-insensitive', () => {
      const lowercase = filterBySearch(parsedResources, 'order');
      const uppercase = filterBySearch(parsedResources, 'ORDER');
      expect(lowercase).toEqual(uppercase);
    });

    it('combined type + search filtering', () => {
      const events = filterByType(parsedResources, 'events');
      const orderEvents = filterBySearch(events, 'Order');

      // All results should be events containing "order"
      for (const event of orderEvents) {
        expect(event.type).toBe('event');
        const hasOrder =
          event.name.toLowerCase().includes('order') ||
          event.id.toLowerCase().includes('order') ||
          (event.summary && event.summary.toLowerCase().includes('order'));
        expect(hasOrder).toBe(true);
      }
    });
  });

  describe('pagination with real data', () => {
    it('paginate through all resources', () => {
      const pageSize = 50;
      const allCollected: ParsedResource[] = [];
      let position = 0;

      while (position < parsedResources.length) {
        const page = parsedResources.slice(position, position + pageSize);
        allCollected.push(...page);
        position += pageSize;
      }

      expect(allCollected).toHaveLength(parsedResources.length);
    });

    it('cursor encoding/decoding works for pagination', () => {
      const positions = [0, 50, 100, 150];

      for (const pos of positions) {
        const cursor = encodeCursor(pos);
        const decoded = decodeCursor(cursor);
        expect(decoded).toBe(pos);
      }
    });

    it('simulate paginated API response', () => {
      const pageSize = 50;
      let cursor: string | undefined = undefined;
      let position = 0;
      const pages: ParsedResource[][] = [];

      // Simulate fetching pages
      while (position < parsedResources.length) {
        const page = parsedResources.slice(position, position + pageSize);
        pages.push(page);

        position += pageSize;
        if (position < parsedResources.length) {
          cursor = encodeCursor(position);
        } else {
          cursor = undefined;
        }
      }

      // Verify we got all resources across pages
      const totalFromPages = pages.reduce((sum, page) => sum + page.length, 0);
      expect(totalFromPages).toBe(parsedResources.length);

      // Last page should have no cursor (or cursor leads to empty)
      if (cursor) {
        const lastPosition = decodeCursor(cursor);
        expect(lastPosition).toBeGreaterThanOrEqual(parsedResources.length);
      }
    });
  });

  describe('version lookup simulation', () => {
    it('can find latest version of a resource by id', () => {
      const events = filterByType(parsedResources, 'events');
      if (events.length > 0) {
        const firstEvent = events[0];

        // Simulate looking up version by id
        const found = parsedResources.find(
          (r) => r.id === firstEvent.id && r.type === 'event'
        );

        expect(found).toBeDefined();
        expect(found).toHaveProperty('version');
      }
    });

    it('can find resource by id and type', () => {
      const services = filterByType(parsedResources, 'services');
      if (services.length > 0) {
        const service = services[0];

        // Simulate the find_resource lookup
        const found = parsedResources.find(
          (r) => r.id === service.id && r.type === 'service'
        );

        expect(found).toBeDefined();
        expect(found?.id).toBe(service.id);
        expect(found?.type).toBe('service');
      }
    });
  });

  describe('URL format validation', () => {
    it('all URLs are valid format', () => {
      for (const resource of parsedResources) {
        expect(resource.url).toMatch(/^https?:\/\//);
        expect(resource.url).toContain('.mdx');
      }
    });

    it('versioned resources have version in URL path', () => {
      const versioned = parsedResources.filter((r) => 'version' in r);
      // At least some versioned resources should have version in URL
      // (some resources may have different naming schemes)
      const withVersionInUrl = versioned.filter((r) => {
        if ('version' in r) {
          return r.url.includes(r.version);
        }
        return false;
      });
      expect(withVersionInUrl.length).toBeGreaterThan(0);
    });
  });

  describe('data integrity', () => {
    it('resources have unique URLs', () => {
      // URLs should be unique identifiers
      const urls = parsedResources.map((r) => r.url);
      const uniqueUrls = new Set(urls);
      expect(uniqueUrls.size).toBe(urls.length);
    });

    it('resource types are valid', () => {
      const validTypes = ['event', 'command', 'query', 'service', 'domain', 'flow', 'entity', 'channel', 'team', 'user', 'doc'];
      for (const resource of parsedResources) {
        expect(validTypes).toContain(resource.type);
      }
    });
  });
});
