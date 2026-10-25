#!/usr/bin/env node
// ahromlabs-mcp: a local (stdio) MCP server for Ahrom Labs' published content.
//
// It finds the hosted search server from the server card ahromlabs.com publishes, connects to it over
// streamable HTTP, and offers its tools to your MCP client unchanged. The site is the single source of
// truth: if the hosted endpoint moves, the card changes and this server follows, with no new release.
// Read-only; public content only; no sign-in.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const VERSION = "0.1.0";
const CARD = process.env.AHROMLABS_SERVER_CARD ?? "https://ahromlabs.com/.well-known/mcp/server-card.json";

let remote = null;

// Connect on first use, so a client can start this server offline and only pays for the network when asked.
async function connect() {
  if (remote) return remote;
  const res = await fetch(CARD, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Couldn't read the server card at ${CARD} (HTTP ${res.status})`);
  const endpoint = (await res.json())?.transport?.endpoint;
  if (!endpoint) throw new Error(`The server card at ${CARD} names no endpoint`);
  const client = new Client({ name: "ahromlabs-mcp", version: VERSION });
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
  remote = client;
  return client;
}

// One retry with a fresh connection: hosted sessions can expire while a client sits idle.
async function withRemote(fn) {
  try {
    return await fn(await connect());
  } catch (err) {
    remote = null;
    return fn(await connect()).catch((again) => {
      throw new Error(`Ahrom Labs search is unavailable: ${again.message ?? again} (first attempt: ${err.message ?? err})`);
    });
  }
}

const server = new Server(
  { name: "ahromlabs-search", title: "Ahrom Labs knowledge search", version: VERSION },
  {
    capabilities: { tools: {} },
    instructions:
      "Searches Ahrom Labs' published pages: ERP requirements for Indian manufacturers and traders, IBR 2026 boiler forms and registration, interior BOQs, TallyPrime integration, and AI assistants over business data. Each result carries the URL of its page; cite it.",
  },
);

server.setRequestHandler(ListToolsRequestSchema, (req) => withRemote((c) => c.listTools(req.params)));
server.setRequestHandler(CallToolRequestSchema, (req) => withRemote((c) => c.callTool(req.params)));

await server.connect(new StdioServerTransport());
