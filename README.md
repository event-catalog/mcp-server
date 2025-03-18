<div align="center">

<h1>📖 EventCatalog - MCP Server</h1>
<h3>Get insights from your EventCatalog directly from your MCP Client (<a href="https://www.anthropic.com/claude">Claude</a>, <a href="https://www.cursor.com/">Cursor</a>, <a href="https://codeium.com/windsurf">Windsurf</a>, etc)</h3>

<!-- <img width="745" alt="Screenshot 2024-12-13 at 09 56 05" src="https://github.com/user-attachments/assets/f537ec1f-54ee-4de1-996c-c6b72191be39" /> -->
<img width="745" alt="EventCatalog" src="./images/mcp.png" />


<h4>Features: Ask about domains, services and messages. Get answers in seconds. Request schemas, who owns what and much more.</h4>

[Read the Docs](https://www.eventcatalog.dev/docs/development/getting-started/introduction) | [View Demo](https://demo.eventcatalog.dev)

</div>
<hr/>

## Features

- 🤖 Connect to any MCP Client ([Claude](https://www.anthropic.com/claude), [Cursor](https://www.cursor.com/), [Windsurf](https://codeium.com/windsurf), etc)
- 🤖 Run MCP server locally on your machine with one command
- 🤖 Connect to your EventCatalog instances
- 🤖 Ask questions about your architectures
- 🤖 Ask questions about your OpenAPI and AsyncAPI specifications
- 🤖 Ask about domains, services and messages, and much more
- 🤖 Get the schemas for events, queries, commands and services (OpenAPI, AsyncAPI, JSON Schema)

## Using AI to get more value from EventCatalog

[EventCatalog](https://www.eventcatalog.dev/) is an Open Source tool that helps you document your event-driven architecture.
Using EventCatalog you can document your domains, services and messages, schemas and much more.

EventCatalog will visualize your architecture for you all, provide the ability to add semantic meaning for stakeholders, host your OpenPAI and AsyncAPI specifications and integrate with any broker in the world.

Using the **EventCatalog MCP Server** you can get more value from your EventCatalog by asking questions about your architecture in the tools you already use.

- Developers can integrate the MCP server with MCP supported IDES (e.g [Cursor](https://www.cursor.com/), [Windsurf](https://codeium.com/windsurf))
- Stakeholders can ask questions about your architecture in the tools they use (e.g [Claude](https://www.anthropic.com/claude))
- If you are using tools that do not support the MCP protocol, you can still use the [`llms.txt`](https://www.eventcatalog.dev/docs/development/developer-tools/llms.txt) standard to integrate with other LLLM tools (e.g [Gemini](https://www.google.com/gemini/), [GPT-4](https://openai.com/gpt-4/))

# Getting Started

## Installation

First, you need to enable the [`LLMS.txt` feature](https://www.eventcatalog.dev/docs/development/developer-tools/llms.txt) in your EventCatalog instance.

1. Enable the [`LLMS.txt` feature](https://www.eventcatalog.dev/docs/development/developer-tools/llms.txt) in your EventCatalog instance, by configuring your `eventcatalog.config.js` file.
2. Deploy your EventCatalog instance with the `LLMS.txt` feature enabled.


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
        "https://demo.eventcatalog.dev" // Replace with your EventCatalog URL
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
      "args": ["-y", "@eventcatalog/mcp-server", "https://demo.eventcatalog.dev"]
    }
  }
}
```

You can read more about configuration for your project in the [Cursor documentation](https://docs.cursor.com/context/model-context-protocol#configuration-locations).


# API

Here is a list of all the APIs that the MCP server supports.

## Resources

- `eventcatalog://all`
  - Returns all messages, domains, services in the catalog
- `eventcatalog://domains`
  - Returns all domains in the catalog
- `eventcatalog://services`
  - Returns all services in the catalog
- `eventcatalog://events`
  - Returns all events in the catalog
- `eventcatalog://queries`
  - Returns all queries in the catalog
- `eventcatalog://commands`
  - Returns all commands in the catalog


## Tools

- `get_domains`
  - Gets and returns a list of all domains in the catalog
- `get_services`
  - Gets and returns a list of all services in the catalog
- `get_events`
  - Gets and returns a list of all events in the catalog
- `get_commands`
  - Gets and returns a list of all commands in the catalog
- `get_queries`
  - Gets and returns a list of all queries in the catalog

### Schemas
- `get_event_schema`
  - Gets and returns the schema for a given event id
- `get_query_schema`
  - Gets and returns the schema for a given query id
- `get_command_schema`
  - Gets and returns the schema for a given command id

### OpenAPI

- `get_openapi_spec`
  - Gets and returns the OpenAPI spec for a given service id
- `get_asyncapi_spec`
  - Gets and returns the AsyncAPI spec for a given service id

## Missing an API?

We are working on adding more APIs to the MCP server. If you need something specific, please [open an issue](https://github.com/eventcatalog/mcp-server/issues) and we will add it to the server.

## TODO

Some ideas for the MCP server, feel free to add to the list!

- [ ] Add support for private hosted EventCatalog instances
    - We make fetch requests to EventCatalog instances, let the user specify custom headers or auth params we can add onto each request.
- [ ] Add prompts / tools to write to EventCatalog, if we get interest from the community
- [ ] Add support to get teams and users
- [ ] Add support to get flows from EventCatalog

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

Usage of this feature is part of the [EventCatalog Pro Edition](https://www.eventcatalog.dev/pricing).