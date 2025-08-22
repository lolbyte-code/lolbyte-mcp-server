# LolByte MCP Server

See https://modelcontextprotocol.io/docs/getting-started/intro

## Build

```bash
npm run build
```

## LLM Client Integration

### Claude Desktop

Update `/path/to/claude_desktop_config.json` as follows:

```json
{
  "mcpServers": {
    "lolbyte-mcp": {
      "command": "sh",
      "args": [
        "-c",
        "RIOT_API_KEY=YOUR_API_KEY node /Users/anthony/repos/lolbyte-mcp/build/index.js"
      ]
    }
  }
}
```

### LibreChat

Update `librechat.yaml`:

```yaml
mcpServers:
  lolbyte:
    command: sh
    args:
      - -c
      - "RIOT_API_KEY=YOUR_API_KEY node /app/mcp/build/index.js"
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