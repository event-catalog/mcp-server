import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

export interface ServerConfig {
  eventCatalogUrl: string;
  licenseKey: string;
  transport: 'stdio' | 'http';
  port: number;
  basePath: string;
}

/**
 * Create a server configuration programmatically
 * Useful for framework integrations like Astro, Next.js, etc.
 */
export function createConfig(options: {
  eventCatalogUrl: string;
  licenseKey: string;
  transport?: 'stdio' | 'http';
  port?: number;
  basePath?: string;
}): ServerConfig {
  const config: ServerConfig = {
    eventCatalogUrl: options.eventCatalogUrl,
    licenseKey: options.licenseKey,
    transport: options.transport || 'http',
    port: options.port || 3000,
    basePath: options.basePath || '/',
  };

  // Validate URL format
  try {
    new URL(config.eventCatalogUrl);
  } catch (error) {
    throw new McpError(ErrorCode.InvalidParams, 'eventCatalogUrl is not a valid URL');
  }

  // Validate port
  if (isNaN(config.port)) {
    throw new McpError(ErrorCode.InvalidParams, 'port is not a valid integer');
  }

  return config;
}

/**
 * Parse and validate configuration from command line arguments and environment variables
 */
export function parseConfig(): ServerConfig {
  const eventCatalogUrl = process.argv[2] || process.env.EVENTCATALOG_URL;
  const licenseKey = process.argv[3] || process.env.EVENTCATALOG_SCALE_LICENSE_KEY;
  const transport = process.argv[4] || process.env.MCP_TRANSPORT || ('stdio' as any);
  const port = parseInt(process.argv[5] || process.env.PORT || '3000', 10);
  const basePath = process.argv[6] || process.env.BASE_PATH || '/';

  // Validate required fields
  if (!eventCatalogUrl) {
    throw new McpError(ErrorCode.InvalidParams, 'EVENTCATALOG_URL is not set');
  }

  if (!licenseKey) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'EVENTCATALOG_SCALE_LICENSE_KEY is not set. You can get a license key from https://eventcatalog.cloud'
    );
  }

  // Validate URL format
  try {
    new URL(eventCatalogUrl);
  } catch (error) {
    console.error('EVENTCATALOG_URL is not a valid URL', error);
    throw new McpError(ErrorCode.InvalidParams, 'EVENTCATALOG_URL is not a valid URL');
  }

  // Validate port
  if (isNaN(port)) {
    throw new McpError(ErrorCode.InvalidParams, 'PORT is not a valid integer');
  }

  // Set environment variables for backward compatibility
  process.env.EVENTCATALOG_URL = eventCatalogUrl;
  process.env.EVENTCATALOG_SCALE_LICENSE_KEY = licenseKey;
  process.env.MCP_TRANSPORT = transport;
  process.env.PORT = port.toString();
  process.env.BASE_PATH = basePath;

  return { eventCatalogUrl, licenseKey, transport, port, basePath };
}
