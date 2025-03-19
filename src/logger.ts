// 1. appendFileSync
import { appendFileSync } from 'fs';
import { join } from 'path';

// 2. LOG_FILE
const LOG_FILE = join(import.meta.dirname, 'mcp-server.log');

// 3. formatMessage
function formatMessage(level: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}\n`;
}

// 4. logger
export const logger = {
  log(message: string, data?: unknown) {
    const logMessage = formatMessage('INFO', message, data);
    appendFileSync(LOG_FILE, logMessage);
  },
};
