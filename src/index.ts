#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { parseConfig } from './config.js';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';
import { startHttpServer, startStdioServer } from './servers/index.js';
import checkLicense from './license/check-license.js';
import pkg from '../package.json' with { type: 'json' };

/**
 * Initialize the MCP server with tools and resources
 */
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'EventCatalog MCP Server',
    version: pkg.version,
  });

  registerTools(server);
  registerResources(server);

  return server;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const config = parseConfig();

  // Validate license
  await checkLicense('@eventcatalog/eventcatalog-scale', config.licenseKey);

  // Create and initialize server
  const server = createMcpServer();

  // Start appropriate transport
  switch (config.transport) {
    case 'stdio':
      await startStdioServer(server);
      break;
    case 'http':
      startHttpServer(server, config);
      break;
    default:
      throw new McpError(ErrorCode.InvalidParams, `Invalid MCP transport: ${config.transport}`);
  }
}

// Run the server
main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
