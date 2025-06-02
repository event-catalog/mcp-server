#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import 'mcps-logger/console';
import { registerTools } from './tools/index.js';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { registerResources } from './resources/index.js';
import checkLicense from './license/check-license.js';

// Create an MCP server
const server = new McpServer({
  name: 'EventCatalog MCP Server',
  version: '1.0.0',
});

process.env.EVENTCATALOG_URL = process.argv[2] || process.env.EVENTCATALOG_URL;
process.env.EVENTCATALOG_SCALE_LICENSE_KEY = process.argv[3] || process.env.EVENTCATALOG_SCALE_LICENSE_KEY;

if (!process.env.EVENTCATALOG_URL || !process.argv[2]) {
  throw new McpError(ErrorCode.InvalidParams, 'EVENTCATALOG_URL is not set');
}

if (!process.env.EVENTCATALOG_SCALE_LICENSE_KEY || !process.argv[3]) {
  throw new McpError(
    ErrorCode.InvalidParams,
    'EVENTCATALOG_SCALE_LICENSE_KEY is not set. You can get a license key from https://eventcatalog.cloud'
  );
}

try {
  new URL(process.env.EVENTCATALOG_URL);
} catch (error) {
  console.error('EVENTCATALOG_URL is not a valid URL', error);
  throw new McpError(ErrorCode.InvalidParams, 'EVENTCATALOG_URL is not a valid URL');
}

await checkLicense('@eventcatalog/eventcatalog-scale', process.env.EVENTCATALOG_SCALE_LICENSE_KEY);

registerTools(server);
registerResources(server);

const transport = new StdioServerTransport();
await server.connect(transport);
