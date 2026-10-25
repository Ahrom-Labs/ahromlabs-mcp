# ahromlabs-mcp

An MCP server for [Ahrom Labs](https://ahromlabs.com)' published guides: ERP requirements for Indian manufacturers and traders, IBR 2026 boiler forms and registration, interior BOQs, TallyPrime integration, and AI assistants over business data.

It runs locally over stdio, reads the hosted search endpoint from the server card at `https://ahromlabs.com/.well-known/mcp/server-card.json`, and offers its `search` tool to your client. Each result carries the URL of the page it came from. Read-only, public content only, no sign-in.

## Use it

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ahromlabs-search": { "command": "npx", "args": ["-y", "github:Ahrom-Labs/ahromlabs-mcp"] }
  }
}
```

Or run it yourself: `npm install`, then `node index.js`. Docker: `docker build -t ahromlabs-mcp . && docker run -i ahromlabs-mcp`.

Clients that speak streamable HTTP can connect to the hosted endpoint directly; see [ahromlabs.com/agents](https://ahromlabs.com/agents).

## Test

`npm test` starts the server, lists its tools and runs one real search (needs network).

## What it searches

- [ERP requirements](https://ahromlabs.com/erp): 71 testable requirements, with Indian statutory rules quoted
- [IBR 2026 guide](https://ahromlabs.com/ibr): every form, registration documents, record keeping
- [Interior BOQ guide](https://ahromlabs.com/boq): how to write one, a 41-item library
- [AI assistants guide](https://ahromlabs.com/ai-assistant): how an assistant should answer from your records without inventing numbers
- [Engineering notes](https://ahromlabs.com/notes) and [patterns](https://ahromlabs.com/patterns) from systems in production

MIT licence. Built by Ahrom Labs, Ahmedabad.
