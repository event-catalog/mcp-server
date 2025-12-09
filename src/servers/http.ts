import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { type Express, type Request, type Response } from 'express';
import type { ServerConfig } from '../config.js';

/**
 * Handle MCP requests over HTTP
 * This function can be used in any HTTP framework (Express, Astro, etc.)
 */
export async function handleMcpRequest(server: McpServer, req: Request, res: Response): Promise<void> {
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
}

/**
 * Start HTTP server
 */
export function startHttpServer(server: McpServer, config: ServerConfig): void {
  const app: Express = express();

  app.use(config.basePath, async (req, res) => {
    await handleMcpRequest(server, req, res);
  });

  app
    .listen(config.port, () => {
      console.log(`EventCatalog MCP Server running on port ${config.port} at ${config.basePath}`);
    })
    .on('error', (error) => {
      console.error('Error starting server:', error);
      process.exit(1);
    });
}
