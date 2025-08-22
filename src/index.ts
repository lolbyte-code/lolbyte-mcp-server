import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import * as mcpEndpoints from "./mcpEndpoints.js";

// --- Create MCP server ---
const server = new Server(
  {
    name: "lolbyte-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

// --- Handle tool listing ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "fetch_summoner_context",
        description: "Fetch summoner info, league entries, and recent matches",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Summoner name in the format GameName#Tagline",
            },
            matchLimit: {
              type: "number",
              description: "Number of recent matches to fetch (default 5)",
              default: 5,
            },
          },
          required: ["name"],
        },
      },
      {
        name: "fetch_tft_summoner_context",
        description:
          "Fetch TFT summoner info, league entries, and recent matches",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Summoner name in the format GameName#Tagline",
            },
            matchLimit: {
              type: "number",
              description: "Number of recent matches to fetch (default 5)",
              default: 5,
            },
          },
          required: ["name"],
        },
      },
      {
        name: "get_summoner",
        description: "Fetch summoner info by name",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Summoner name",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "get_league_entries",
        description: "Fetch league entries by PUUID",
        inputSchema: {
          type: "object",
          properties: {
            puuid: {
              type: "string",
              description: "Player UUID",
            },
          },
          required: ["puuid"],
        },
      },
      {
        name: "get_tft_league_entries",
        description: "Fetch TFT league entries by PUUID",
        inputSchema: {
          type: "object",
          properties: {
            puuid: {
              type: "string",
              description: "Player UUID",
            },
          },
          required: ["puuid"],
        },
      },
      {
        name: "get_recent_matches",
        description: "Fetch recent match IDs by PUUID",
        inputSchema: {
          type: "object",
          properties: {
            puuid: {
              type: "string",
              description: "Player UUID",
            },
            limit: {
              type: "number",
              description: "Number of matches to fetch (default 5)",
              default: 5,
            },
          },
          required: ["puuid"],
        },
      },
      {
        name: "get_tft_recent_matches",
        description: "Fetch recent match IDs by PUUID",
        inputSchema: {
          type: "object",
          properties: {
            puuid: {
              type: "string",
              description: "Player UUID",
            },
            limit: {
              type: "number",
              description: "Number of TFT matches to fetch (default 5)",
              default: 5,
            },
          },
          required: ["puuid"],
        },
      },
      {
        name: "get_match_details",
        description: "Fetch match details by match ID",
        inputSchema: {
          type: "object",
          properties: {
            matchId: {
              type: "string",
              description: "Match ID",
            },
          },
          required: ["matchId"],
        },
      },
      {
        name: "get_tft_match_details",
        description: "Fetch TFT match details by match ID",
        inputSchema: {
          type: "object",
          properties: {
            matchId: {
              type: "string",
              description: "Match ID",
            },
          },
          required: ["matchId"],
        },
      },
    ],
  };
});

// --- Handle tool execution ---
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "fetch_summoner_context": {
        const { name: summonerName, matchLimit = 5 } = args as {
          name: string;
          matchLimit?: number;
        };

        if (!summonerName || typeof summonerName !== "string") {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Summoner name is required and must be a string",
          );
        }

        const result = await mcpEndpoints.getFullContext(
          summonerName,
          matchLimit,
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "fetch_tft_summoner_context": {
        const { name: summonerName, matchLimit = 5 } = args as {
          name: string;
          matchLimit?: number;
        };

        if (!summonerName || typeof summonerName !== "string") {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Summoner name is required and must be a string",
          );
        }

        const result = await mcpEndpoints.getTftFullContext(
          summonerName,
          matchLimit,
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_summoner": {
        const { name: summonerName } = args as { name: string };

        if (!summonerName || typeof summonerName !== "string") {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Summoner name is required and must be a string",
          );
        }

        const summoner = await mcpEndpoints.getSummoner(summonerName);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summoner, null, 2),
            },
          ],
        };
      }

      case "get_league_entries": {
        const { puuid } = args as { puuid: string };

        if (!puuid || typeof puuid !== "string") {
          throw new McpError(
            ErrorCode.InvalidParams,
            "PUUID is required and must be a string",
          );
        }

        const entries = await mcpEndpoints.getLeagueEntries(puuid);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(entries, null, 2),
            },
          ],
        };
      }

      case "get_tft_league_entries": {
        const { puuid } = args as { puuid: string };

        if (!puuid || typeof puuid !== "string") {
          throw new McpError(
            ErrorCode.InvalidParams,
            "PUUID is required and must be a string",
          );
        }

        const entries = await mcpEndpoints.getTftLeagueEntries(puuid);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(entries, null, 2),
            },
          ],
        };
      }

      case "get_recent_matches": {
        const { puuid, limit = 5 } = args as {
          puuid: string;
          limit?: number;
        };

        if (!puuid || typeof puuid !== "string") {
          throw new McpError(
            ErrorCode.InvalidParams,
            "PUUID is required and must be a string",
          );
        }

        const matches = await mcpEndpoints.getRecentMatches(puuid, limit);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(matches, null, 2),
            },
          ],
        };
      }

      case "get_tft_recent_matches": {
        const { puuid, limit = 5 } = args as {
          puuid: string;
          limit?: number;
        };

        if (!puuid || typeof puuid !== "string") {
          throw new McpError(
            ErrorCode.InvalidParams,
            "PUUID is required and must be a string",
          );
        }

        const matches = await mcpEndpoints.getTftRecentMatches(puuid, limit);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(matches, null, 2),
            },
          ],
        };
      }

      case "get_match_details": {
        const { matchId } = args as { matchId: string };

        if (!matchId || typeof matchId !== "string") {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Match ID is required and must be a string",
          );
        }

        const match = await mcpEndpoints.getMatchDetails(matchId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(match, null, 2),
            },
          ],
        };
      }

      case "get_tft_match_details": {
        const { matchId } = args as { matchId: string };

        if (!matchId || typeof matchId !== "string") {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Match ID is required and must be a string",
          );
        }

        const match = await mcpEndpoints.getTftMatchDetails(matchId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(match, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    // Re-throw McpErrors as-is
    if (error instanceof McpError) {
      throw error;
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${errorMessage}`,
    );
  }
});

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LoL MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
