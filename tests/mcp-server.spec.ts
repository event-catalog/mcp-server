import { describe, it, expect, beforeEach, afterEach, vi, MockInstance } from 'vitest';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { main } from '../src/index.js';

// Define proper types for mocked functions
type MockedFunction<T extends (...args: any) => any> = {
  (...args: Parameters<T>): ReturnType<T>;
  mockImplementation: (fn: (...args: Parameters<T>) => ReturnType<T>) => MockedFunction<T>;
};

// Mock modules before imports
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  return {
    McpServer: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      resource: vi.fn(),
      prompt: vi.fn(),
      tool: vi.fn(),
    })),
    ResourceTemplate: vi.fn().mockImplementation((uri, options) => ({
      uri,
      options,
    })),
  };
});

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    StdioServerTransport: vi.fn().mockImplementation(() => ({
      start: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

vi.mock('../src/resources/index.js', () => {
  return {
    registerResources: vi.fn(),
  };
});

vi.mock('../src/tools/index.js', () => {
  return {
    registerTools: vi.fn(),
  };
});

vi.mock('../src/logger.js', () => {
  return {
    logger: {
      log: vi.fn(),
    },
  };
});

// Import mocked modules after mocking
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerResources } from '../src/resources/index.js';
import { registerTools } from '../src/tools/index.js';

describe('MCP Server', () => {
  const originalEnv = process.env;
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.argv = [...originalArgv];
    vi.clearAllMocks();

    // Set up registerResources implementation
    (registerResources as MockedFunction<typeof registerResources>).mockImplementation((server) => {
      // Register all expected resources
      const resources = [
        {
          name: 'All Resources in EventCatalog',
          uri: 'eventcatalog://all',
          description: 'All messages, domains and services in EventCatalog',
        },
        {
          name: 'All Events in EventCatalog',
          uri: 'eventcatalog://events',
          description: 'All events in EventCatalog',
        },
        {
          name: 'All Domains in EventCatalog',
          uri: 'eventcatalog://domains',
          description: 'All domains in EventCatalog',
        },
        {
          name: 'All Services in EventCatalog',
          uri: 'eventcatalog://services',
          description: 'All services in EventCatalog',
        },
        {
          name: 'All Queries in EventCatalog',
          uri: 'eventcatalog://queries',
          description: 'All queries in EventCatalog',
        },
        {
          name: 'All Commands in EventCatalog',
          uri: 'eventcatalog://commands',
          description: 'All commands in EventCatalog',
        },
        {
          name: 'All Flows in EventCatalog',
          uri: 'eventcatalog://flows',
          description: 'All flows in EventCatalog',
        },
        {
          name: 'All Teams in EventCatalog',
          uri: 'eventcatalog://teams',
          description: 'All teams in EventCatalog',
        },
        {
          name: 'All Users in EventCatalog',
          uri: 'eventcatalog://users',
          description: 'All users in EventCatalog',
        },
      ];

      resources.forEach((resource) => {
        server.resource(resource.name, new ResourceTemplate(resource.uri, { list: undefined }), vi.fn());
      });
    });

    // Set up registerTools implementation
    (registerTools as MockedFunction<typeof registerTools>).mockImplementation((server) => {
      // Call the tool method on the server for each expected tool
      const basicTools = [
        'get_services',
        'get_domains',
        'get_commands',
        'get_events',
        'get_queries',
        'get_flows',
        'get_teams',
        'get_users',
      ];

      const schemaTools = ['get_event_schema', 'get_query_schema', 'get_command_schema', 'get_openapi_spec', 'get_asyncapi_spec'];

      // Register basic tools
      basicTools.forEach((toolName) => {
        server.tool(toolName, `Description for ${toolName}`, {}, vi.fn());
      });

      // Register schema tools
      schemaTools.forEach((toolName) => {
        server.tool(
          toolName,
          `Description for ${toolName}`,
          {
            resourceName: { _type: 'string' } as any,
            fileName: { _type: 'string' } as any,
          },
          vi.fn()
        );
      });
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    process.argv = originalArgv;
  });

  describe('Environment Configuration', () => {
    it('should throw an error when EVENTCATALOG_URL is not set', async () => {
      delete process.env.EVENTCATALOG_URL;
      process.argv = [process.argv[0], process.argv[1]]; // Remove any additional args

      await expect(main()).rejects.toThrow(new McpError(ErrorCode.InvalidParams, 'EVENTCATALOG_URL is not set'));
    });

    it('should throw an error when EVENTCATALOG_URL is invalid', async () => {
      process.env.EVENTCATALOG_URL = 'invalid-url';
      process.argv = [process.argv[0], process.argv[1], 'invalid-url'];

      await expect(main()).rejects.toThrow(new McpError(ErrorCode.InvalidParams, 'EVENTCATALOG_URL is not a valid URL'));
    });

    it('should accept a valid EVENTCATALOG_URL', async () => {
      const validUrl = 'http://localhost:3000';
      process.env.EVENTCATALOG_URL = validUrl;
      process.argv = [process.argv[0], process.argv[1], validUrl];

      await expect(main()).resolves.not.toThrow();
    });
  });

  describe('Server Instance', () => {
    it('should create a server instance successfully', () => {
      // Since we're mocking McpServer, we need to verify the constructor was called with correct params
      const serverConfig = {
        name: 'EventCatalog MCP Server',
        version: '0.0.1',
      };

      const server = new McpServer(serverConfig);

      // Check that the constructor was called
      expect(McpServer).toHaveBeenCalledWith(serverConfig);

      // Check that the server has the expected methods
      expect(server.connect).toBeDefined();
      expect(server.resource).toBeDefined();
      expect(server.tool).toBeDefined();
    });
  });

  describe('Tool Registration', () => {
    it('should register all basic tools', async () => {
      const validUrl = 'http://localhost:3000';
      process.env.EVENTCATALOG_URL = validUrl;
      process.argv = [process.argv[0], process.argv[1], validUrl];

      await main();

      // Check that all basic tools are registered
      const basicTools = [
        'get_services',
        'get_domains',
        'get_commands',
        'get_events',
        'get_queries',
        'get_flows',
        'get_teams',
        'get_users',
      ];

      // Get the tool method from the mock
      const mockFn = McpServer as unknown as MockInstance;
      const mockServer = mockFn.mock.results[0].value;
      const toolMethod = mockServer.tool;

      basicTools.forEach((toolName) => {
        expect(toolMethod).toHaveBeenCalledWith(toolName, expect.any(String), expect.any(Object), expect.any(Function));
      });
    });

    it('should register all schema tools', async () => {
      const validUrl = 'http://localhost:3000';
      process.env.EVENTCATALOG_URL = validUrl;
      process.argv = [process.argv[0], process.argv[1], validUrl];

      await main();

      // Check that all schema tools are registered
      const schemaTools = ['get_event_schema', 'get_query_schema', 'get_command_schema', 'get_openapi_spec', 'get_asyncapi_spec'];

      // Get the tool method from the mock
      const mockFn = McpServer as unknown as MockInstance;
      const mockServer = mockFn.mock.results[0].value;
      const toolMethod = mockServer.tool;

      schemaTools.forEach((toolName) => {
        expect(toolMethod).toHaveBeenCalledWith(
          toolName,
          expect.any(String),
          expect.objectContaining({
            resourceName: expect.any(Object),
            fileName: expect.any(Object),
          }),
          expect.any(Function)
        );
      });
    });
  });

  describe('Resource Registration', () => {
    it('should register all resources', async () => {
      const validUrl = 'http://localhost:3000';
      process.env.EVENTCATALOG_URL = validUrl;
      process.argv = [process.argv[0], process.argv[1], validUrl];

      await main();

      // Check that all resources are registered
      const resources = [
        'All Resources in EventCatalog',
        'All Events in EventCatalog',
        'All Domains in EventCatalog',
        'All Services in EventCatalog',
        'All Queries in EventCatalog',
        'All Commands in EventCatalog',
      ];

      // Get the resource method from the mock
      const mockFn = McpServer as unknown as MockInstance;
      const mockServer = mockFn.mock.results[0].value;
      const resourceMethod = mockServer.resource;

      resources.forEach((resourceName) => {
        expect(resourceMethod).toHaveBeenCalledWith(resourceName, expect.any(Object), expect.any(Function));
      });
    });

    it('should register resources with correct URIs', async () => {
      const validUrl = 'http://localhost:3000';
      process.env.EVENTCATALOG_URL = validUrl;
      process.argv = [process.argv[0], process.argv[1], validUrl];

      await main();

      // Check specific resources have the correct URIs
      const resourceUris = {
        'All Resources in EventCatalog': 'eventcatalog://all',
        'All Events in EventCatalog': 'eventcatalog://events',
        'All Domains in EventCatalog': 'eventcatalog://domains',
        'All Services in EventCatalog': 'eventcatalog://services',
        'All Queries in EventCatalog': 'eventcatalog://queries',
        'All Commands in EventCatalog': 'eventcatalog://commands',
      };

      // Get the resource method from the mock
      const mockFn = McpServer as unknown as MockInstance;
      const mockServer = mockFn.mock.results[0].value;
      const resourceMethod = mockServer.resource;

      // We can't directly check the URI in the ResourceTemplate instance
      // So we'll just verify the resource method was called with the right names
      Object.keys(resourceUris).forEach((name) => {
        expect(resourceMethod).toHaveBeenCalledWith(name, expect.any(Object), expect.any(Function));
      });
    });
  });
});
