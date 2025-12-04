#!/bin/bash

cd "$(dirname "$0")/.."

# Build the server
npm run build

# Run MCP Inspector with URL and license key as arguments
npx @modelcontextprotocol/inspector -- node dist/index.js https://demo.eventcatalog.dev
