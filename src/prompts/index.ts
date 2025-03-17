import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createNewSchemaPrompt } from './createNewSchemaPrompt.js';

/**
 * Registers all prompts with the MCP server
 * @param server The MCP server instance
 */
export function registerPrompts(server: McpServer) {
  // Register the createNewSchemaPrompt
  server.prompt('create_new_schema_prompt', 'A predefined prompt for creating a new schema', createNewSchemaPrompt);
}
