// Starts the server as a client would (stdio), lists its tools and runs one real search against the live
// endpoint. Needs network access.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("lists tools and returns a search result with a source URL", async () => {
  const client = new Client({ name: "smoke-test", version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ["index.js"] }));
  try {
    const { tools } = await client.listTools();
    assert.ok(tools.length > 0, "the hosted server offers at least one tool");
    const tool = tools.find((t) => /search/i.test(t.name)) ?? tools[0];
    const queryKey = Object.keys(tool.inputSchema?.properties ?? {}).find((k) => /query|q|text/i.test(k)) ?? "query";
    const result = await client.callTool({ name: tool.name, arguments: { [queryKey]: "IBR 2026 Form IV Part A" } });
    const text = JSON.stringify(result.content ?? result);
    assert.match(text, /ahromlabs\.com/, "results point back to ahromlabs.com pages");
  } finally {
    await client.close();
  }
});
