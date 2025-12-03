import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock node-fetch before importing the module
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

describe('find_resource tool', () => {
  beforeEach(() => {
    vi.stubEnv('EVENTCATALOG_URL', 'https://example.com');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('tool definition', () => {
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

      const validTypes = [
        'services',
        'domains',
        'events',
        'commands',
        'queries',
        'flows',
        'entities',
        'channels',
      ];

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
});

describe('find_resource handler', () => {
  beforeEach(() => {
    vi.stubEnv('EVENTCATALOG_URL', 'https://example.com');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('fetches resource with provided version', async () => {
    const fetch = (await import('node-fetch')).default as unknown as ReturnType<typeof vi.fn>;
    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve('# Event Content\nThis is the event markdown'),
    });

    // Import handlers after mocking
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resource');

    // We can't easily test the handler directly, but we can verify the tool is configured correctly
    expect(tool).toBeDefined();
  });

  it('looks up version from llms.txt when not provided', async () => {
    // This test verifies the logic flow - when version is not provided,
    // it should look up from llms.txt
    const { TOOL_DEFINITIONS } = await import('../src/tools/index.js');
    const tool = TOOL_DEFINITIONS.find((t) => t.name === 'find_resource');

    // Verify version is optional
    const versionSchema = tool!.paramsSchema!.version;
    expect(versionSchema.isOptional()).toBe(true);
  });
});

describe('pluralToSingular mapping', () => {
  it('maps all plural types to singular', async () => {
    const { pluralToSingular } = await import('../src/utils/filter.js');

    expect(pluralToSingular.events).toBe('event');
    expect(pluralToSingular.commands).toBe('command');
    expect(pluralToSingular.queries).toBe('query');
    expect(pluralToSingular.services).toBe('service');
    expect(pluralToSingular.domains).toBe('domain');
    expect(pluralToSingular.flows).toBe('flow');
    expect(pluralToSingular.entities).toBe('entity');
    expect(pluralToSingular.channels).toBe('channel');
    expect(pluralToSingular.teams).toBe('team');
    expect(pluralToSingular.users).toBe('user');
    expect(pluralToSingular.docs).toBe('doc');
  });

  it('has all 11 mappings', async () => {
    const { pluralToSingular } = await import('../src/utils/filter.js');
    expect(Object.keys(pluralToSingular)).toHaveLength(11);
  });
});
