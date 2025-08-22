# LolByte MCP Server

See https://modelcontextprotocol.io/docs/getting-started/intro

## Build

```bash
npm run build
```

## LLM Client Integration

### Claude Desktop

Update `/path/to/claude_desktop_config.json` as follows (change paths):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/Desktop",
        "/path/to/Downloads"
      ]
    },
    "lolbyte-mcp": {
      "command": "node",
      "args": ["/path/to/lolbyte-mcp-server/build/index.js"]
    }
  }
}
```

### LibreChat

Update `librechat.yaml`:

```yaml
mcpServers:
  lolbyte:
    command: node
    args:
      - "/app/mcp/build/index.js"
```
Update `docker-compose.override.yml`:

```yaml
services:
  api:
    volumes:
    - /path/to/lolbyte-mcp-server:/app/mcp
    - type: bind
      source: ./librechat.yaml
      target: /app/librechat.yaml
```