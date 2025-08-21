// mcpEndpoints.ts
import axios from "axios";
import NodeCache from "node-cache";
import Bottleneck from "bottleneck";

const cache = new NodeCache({ stdTTL: 300 });
const limiter = new Bottleneck({ minTime: 100 });

// Hardcoded Riot API key and region
const RIOT_API_KEY = "API_KEY_HERE";
const REGION = "na1";

// --- Generic Riot API fetcher with caching ---
async function fetchRiot<T>(url: string): Promise<T> {
  const cached = cache.get<T>(url);
  if (cached) return cached;

  const res = await limiter.schedule(() =>
    axios.get<T>(url, { headers: { "X-Riot-Token": RIOT_API_KEY } })
  );

  cache.set(url, res.data);
  return res.data;
}

// --- Endpoints ---
export async function getSummoner(name: string): Promise<any> {
  const [gameName, tagLine] = name.split("#");
  if (!gameName || !tagLine) throw new Error("Use format GameName#TagLine");

  const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}`;

  return fetchRiot(url);
}

export async function getLeagueEntries(puuid: string): Promise<any[]> {
  const url = `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  return fetchRiot(url);
}

export async function getTftLeagueEntries(puuid: string): Promise<any> {
  const url = `https://${REGION}.api.riotgames.com/tft/league/v1/by-puuid/${puuid}`;
  return fetchRiot(url);
}

export async function getRecentMatches(puuid: string, limit = 5): Promise<string[]> {
  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${limit}`;
  return fetchRiot(url);
}

export async function getTftRecentMatches(puuid: string, limit = 5): Promise<any> {
  const url = `https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?start=0&count=${limit}`;
  return fetchRiot(url);
}

export async function getMatchDetails(matchId: string): Promise<any> {
  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  return fetchRiot(url);
}

export async function getTftMatchDetails(matchId: string): Promise<any> {
  const url = `https://americas.api.riotgames.com/tft/match/v1/matches/${matchId}`;
  return fetchRiot(url);
}

// --- Full context helpers for MCP tool ---
export async function getFullContext(name: string, matchLimit = 5) {
  const summoner = await getSummoner(name);
  const puuid = summoner.puuid;

  const leagueEntries = await getLeagueEntries(puuid);
  const recentMatchIds = await getRecentMatches(puuid, matchLimit);

  const recentMatches = await Promise.all(
    recentMatchIds.map((id) => getMatchDetails(id))
  );

  return { summoner, leagueEntries, recentMatches };
}

export async function getTftFullContext(name: string, matchLimit = 5) {
  const summoner = await getSummoner(name);
  const puuid = summoner.puuid;

  const leagueEntries = await getTftLeagueEntries(puuid);
  const recentMatchIds = await getTftRecentMatches(puuid, matchLimit);

  const recentMatches = await Promise.all(
    recentMatchIds.map((id: string) => getTftMatchDetails(id))
  );

  return { summoner, leagueEntries, recentMatches };
}
