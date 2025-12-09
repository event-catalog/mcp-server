/**
 * Example: Astro API Route for EventCatalog MCP Server
 * 
 * Place this file at: src/pages/api/mcp/[...path].ts
 * 
 * This example shows how to integrate the EventCatalog MCP Server
 * into an Astro application as an API route.
 */

import type { APIRoute } from 'astro';
import { createMcpServer, createConfig, handleMcpRequest } from '@eventcatalog/mcp-server';
import checkLicense from '@eventcatalog/mcp-server/dist/license/check-license.js';

// Singleton MCP server instance
let mcpServer: any = null;

/**
 * Get or create the MCP server instance
 */
async function getMcpServer() {
  if (!mcpServer) {
    // Create config programmatically
    const config = createConfig({
      eventCatalogUrl: import.meta.env.EVENTCATALOG_URL || 'https://demo.eventcatalog.dev',
      licenseKey: import.meta.env.EVENTCATALOG_SCALE_LICENSE_KEY,
      transport: 'http',
      port: 3000,
      basePath: '/api/mcp',
    });

    if (!config.licenseKey) {
      throw new Error('EVENTCATALOG_SCALE_LICENSE_KEY is not set');
    }
    
    // Validate license
    await checkLicense('@eventcatalog/eventcatalog-scale', config.licenseKey);
    
    // Create the server
    mcpServer = createMcpServer();
  }
  return mcpServer;
}

/**
 * Handle all HTTP methods for the MCP endpoint
 */
export const ALL: APIRoute = async ({ request }) => {
  try {
    const server = await getMcpServer();

    // Parse request body
    const body = await request.json();

    // Collect response data
    const chunks: Buffer[] = [];
    let statusCode = 200;
    const headers: Record<string, string> = {};

    // Create Express-compatible response mock
    const mockRes = {
      status: (code: number) => {
        statusCode = code;
        return mockRes;
      },
      json: (data: any) => {
        headers['Content-Type'] = 'application/json';
        chunks.push(Buffer.from(JSON.stringify(data)));
      },
      write: (chunk: any) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      },
      end: (chunk?: any) => {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
      },
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
      on: () => {}, // Handle close events
      headersSent: false,
    };

    // Create Express-compatible request mock
    const mockReq = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
    };

    // Handle the MCP request
    await handleMcpRequest(server, mockReq as any, mockRes as any);

    // Return the Astro response
    return new Response(Buffer.concat(chunks), {
      status: statusCode,
      headers: headers,
    });
  } catch (error) {
    console.error('Error in MCP API route:', error);
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal server error',
        },
        id: null,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

