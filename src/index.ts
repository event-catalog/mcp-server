#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerTools } from './tools/index.js';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { registerResources } from './resources/index.js';
import express from 'express';

process.env.EVENTCATALOG_URL = process.argv[2] || process.env.EVENTCATALOG_URL;
process.env.EVENTCATALOG_SCALE_LICENSE_KEY = process.argv[3] || process.env.EVENTCATALOG_SCALE_LICENSE_KEY; // kept for backward compatibility
process.env.MCP_TRANSPORT = process.argv[4] || process.env.MCP_TRANSPORT || 'stdio'; // stdio default for backward compatibility
process.env.PORT = process.argv[5] || process.env.PORT || '3000';
process.env.BASE_PATH = process.argv[6] || process.env.BASE_PATH || '/';

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

if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
  throw new McpError(ErrorCode.InvalidParams, 'PORT is not a valid integer.');
}

// Create an MCP server
const server = new McpServer({
  name: 'EventCatalog MCP Server',
  version: '1.0.0',
});

registerTools(server);
registerResources(server);

switch (process.env.MCP_TRANSPORT) {
  case 'stdio':
    const transport = new StdioServerTransport();
    await server.connect(transport);
    break;
  case 'http':
    const app = express();

    app.use(process.env.BASE_PATH, async (req, res) => {
      console.log('Handling MCP request', req.url);
      try {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });

        res.on('close', () => {
          transport.close();
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error',
            },
            id: null,
          });
        }
      }
    });

    const port = parseInt(process.env.PORT);
    app
      .listen(port, () => {
        console.log(`Server is running on port ${port}`);
      })
      .on('error', (error) => {
        console.error('Error starting server:', error);
        process.exit(1);
      });
    break;
  default:
    throw new McpError(ErrorCode.InvalidParams, 'Invalid MCP transport');
}
