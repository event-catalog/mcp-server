<div align="center">

<h1>📖 EventCatalog - MCP Server</h1>
<h3>Save time and money by getting insights from your EventCatalog directly from your MCP Client (<a href="https://www.anthropic.com/claude">Claude</a>, <a href="https://www.cursor.com/">Cursor</a>, <a href="https://codeium.com/windsurf">Windsurf</a>, etc)</h3>

<!-- <img width="745" alt="Screenshot 2024-12-13 at 09 56 05" src="https://github.com/user-attachments/assets/f537ec1f-54ee-4de1-996c-c6b72191be39" /> -->
<img width="745" alt="EventCatalog" src="./images/mcp.png" />


<h4>Features: Ask about domains, services and messages. Get answers in seconds. Request schemas, who owns what and much more.</h4>

[Read the Docs](https://www.eventcatalog.dev/docs/development/getting-started/introduction) | [View Demo](https://demo.eventcatalog.dev)

</div>
<hr/>

## Why EventCatalog MCP Server?

EventCatalog is an Open Source tool that helps you document your event-driven architecture.
Using EventCatalog you can document your domains, services and messages, schemas and much more.

Using the **EventCatalog MCP Server** you can get more value from your EventCatalog by asking questions about your architecture in the tools you already use.

Example questions:

- What events do we have in our architecture?
- Tell me more about the {service} service.
- I want to create a new feature that will send emails when a user signs up, what events do we have in our architecture that are related to user signups?
- Get me the schema for the event `UserCreated` in EventCatalog.
- Here is a new version of the `UserCreated` schema, what downstream consumers will be affected by this change?

Rather then digging through your architecture to find the answers you need, you can ask the MCP server directly from your MCP Client.

---

## EventCatalog MCP Features

- 🤖 Connect to any MCP Client ([Claude](https://www.anthropic.com/claude), [Cursor](https://www.cursor.com/), [Windsurf](https://codeium.com/windsurf), etc)
- 🤖 Run MCP server locally on your machine with one command
- 🤖 Connect to your EventCatalog instances
- 🤖 Ask questions about your architectures
- 🤖 Ask questions about your OpenAPI and AsyncAPI specifications
- 🤖 Ask about domains, services and messages, and much more
- 🤖 Get the schemas for events, queries, commands and services (OpenAPI, AsyncAPI, JSON Schema)

---

# Getting Started

## Installation

First, you need to enable the [`LLMS.txt` feature](https://www.eventcatalog.dev/docs/development/developer-tools/llms.txt) in your EventCatalog instance.

1. Enable the [`LLMS.txt` feature](https://www.eventcatalog.dev/docs/development/developer-tools/llms.txt) in your EventCatalog instance, by configuring your `eventcatalog.config.js` file.
2. Deploy your EventCatalog instance with the `LLMS.txt` feature enabled.

Next, you will need to get a EventCatalog Scale license key, you can get a 14 day trial license key from [EventCatalog Cloud](https://eventcatalog.cloud).

### Installing via Smithery

To install EventCatalog for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@event-catalog/mcp-server):

```bash
npx -y @smithery/cli install @event-catalog/mcp-server --client claude
```

## Setup MCP Clients

Each MCP client has a different way of adding the MCP server.

You can find some helpful links below to get started.

- [Claude Desktop](#adding-the-mcp-server-to-claude-desktop)
- [Cursor](#adding-the-mcp-server-to-cursor)

## Adding the MCP server to Claude Desktop

To use this with Claude Desktop, add the following to your `claud_desktop_config.json` file. The full path on MacOS: `~/Library/Application Support/Claude/claud_desktop_config.json`, on Windows: `%APPDATA%\Claude\claud_desktop_config.json`

```js
{
  "mcpServers": {
    "eventcatalog": {
      "command": "npx",
      "args": [
        "-y",
        "@eventcatalog/mcp-server",
        "https://demo.eventcatalog.dev", // Replace with your EventCatalog URL
        "ABCD-1234-5678-9012-3456-7890" // Replace with your EventCatalog Scale license key
      ]
    }
  }
}
```

## Adding the MCP server to Cursor

Go to Cursor Settings -> MCP Servers -> Add MCP Server.

- Name: `eventcatalog`
- Command: `npx`
- Args: `-y @eventcatalog/mcp-server {URL_TO_YOUR_EVENTCATALOG_INSTANCE}`

### Configuration for your project

You can also create `.mcp.json` files in your project to configure the MCP server for your project using Cursor.

```json
{
  "mcpServers": {
    "eventcatalog": {
      "command": "npx",
      "args": ["-y", "@eventcatalog/mcp-server", "https://demo.eventcatalog.dev", "ABCD-1234-5678-9012-3456-7890"]
    }
  }
}
```

You can read more about configuration for your project in the [Cursor documentation](https://docs.cursor.com/context/model-context-protocol#configuration-locations).


# API

Here is a list of all the APIs that the MCP server supports.

## Tools

- `find_resources`
  - Find resources that are available in EventCatalog
- `find_resource`
  - Get more information about a service, domain, event, command, query or flow in EventCatalog using its id and version
- `find_producers_and_consumers`
  - Get the producers (sends) and consumers (receives) for a service in EventCatalog
- `get_schema`
  - Returns the schema for a service, event, command or query in EventCatalog
- `review_schema_changes`
  - Reviews schema changes for breaking changes and suggests fixes.

## Resources

- `eventcatalog://all`
  - All messages, domains and services in EventCatalog
- `eventcatalog://events`
  - All events in EventCatalog
- `eventcatalog://domains`
  - All domains in EventCatalog
- `eventcatalog://services`
  - All services in EventCatalog
- `eventcatalog://queries`
  - All queries in EventCatalog
- `eventcatalog://commands`
  - All commands in EventCatalog
- `eventcatalog://flows`
  - All flows in EventCatalog
- `eventcatalog://teams`
  - All teams in EventCatalog
- `eventcatalog://users`
  - All users in EventCatalog



## Missing an API?

We are working on adding more APIs to the MCP server. If you need something specific, please [open an issue](https://github.com/eventcatalog/mcp-server/issues) and we will add it to the server.


## Contributing

1. Clone the repository
2. Run `pnpm install` to install the dependencies
3. Run `pnpm run build`

To use the build as your MCP server you can point your MCP client to the `dist` folder.

Example for Cursor:

```json
{
  "mcpServers": {
    "eventcatalog": {
      "command": "npx",
      "args": ["-y", "tsx /PATH_TO_YOUR_REPO/src/index.ts",  "https://demo.eventcatalog.dev", "ABCD-1234-5678-9012-3456-7890"]
    }
  }
}
```
# Sponsors

Thank you to our project sponsors.

## Gold sponsors

<div align="center">
  <picture>
    <source srcset="./images/sponsors/gravitee-logo-white.webp" media="(prefers-color-scheme: dark)" />
    <img alt="hookdeck" src="./images/sponsors/gravitee-logo-black.svg" width="50%" />
  </picture>
  <p style="margin: 0; padding: 0;">Manage, secure, and govern every API in your organization</p>
  <a href="https://gravitee.io?utm_source=eventcatalog&utm_medium=web&utm_campaign=sponsorship" target="_blank">Learn more</a>
</div>

<hr />

<div align="center">
  <img alt="oso" src="./images/sponsors/oso-logo-green.png" width="30%" />
  <p style="margin: 0; padding: 0;">Delivering Apache Kafka professional services to your business
</p>
  <a href="https://oso.sh/?utm_source=eventcatalog&utm_medium=web&utm_campaign=sponsorship" target="_blank" >Learn more</a>
</div>

<hr />

_Sponsors help make EventCatalog sustainable, want to help the project? Get in touch! Or [visit our sponsor page](https://www.eventcatalog.dev/support)._

# Enterprise support

Interested in collaborating with us? Our offerings include dedicated support, priority assistance, feature development, custom integrations, and more.

Find more details on our [services page](https://eventcatalog.dev/services).

# License

Usage of this feature is part of the [EventCatalog Pro Edition](https://www.eventcatalog.dev/pricing)
