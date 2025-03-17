#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerResources } from './resources/index.js';
import { registerTools } from './tools/index.js';
import { registerPrompts } from './prompts/index.js';
import { logger } from './logger.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

export async function main() {
  // Set the EventCatalog URL across all tools
  process.env.EVENTCATALOG_URL = process.argv[2] || process.env.EVENTCATALOG_URL;

  if (!process.env.EVENTCATALOG_URL || !process.argv[2]) {
    throw new McpError(ErrorCode.InvalidParams, 'EVENTCATALOG_URL is not set');
  }

  try {
    new URL(process.env.EVENTCATALOG_URL);
  } catch (error) {
    throw new McpError(ErrorCode.InvalidParams, 'EVENTCATALOG_URL is not a valid URL');
  }

  logger.log(`Using EventCatalog URL: ${process.env.EVENTCATALOG_URL}`);

  // Create an MCP server
  const server = new McpServer({
    name: 'EventCatalog MCP Server',
    version: '0.0.1',
  });

  // Register all prompts (Add these in the future)
  // registerPrompts(server);

  // Register resources
  registerResources(server);

  // Register all tools (cursor only supports tools at the moment https://docs.cursor.com/context/model-context-protocol#mcp-resources)
  registerTools(server);

  // Start the MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Only run if this file is being executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  main().catch(console.error);
}
