import type {
  ParsedResource,
  EventResource,
  CommandResource,
  QueryResource,
  ServiceResource,
  DomainResource,
  FlowResource,
  EntityResource,
  ChannelResource,
  TeamResource,
  UserResource,
  DocResource,
} from './types.js';

type VersionedType =
  | EventResource['type']
  | CommandResource['type']
  | QueryResource['type']
  | ServiceResource['type']
  | DomainResource['type']
  | FlowResource['type']
  | EntityResource['type']
  | ChannelResource['type'];

type UnversionedType = TeamResource['type'] | UserResource['type'] | DocResource['type'];

/**
 * Section header to resource type mapping
 */
const VERSIONED_SECTIONS: Record<string, VersionedType> = {
  events: 'event',
  commands: 'command',
  queries: 'query',
  services: 'service',
  domains: 'domain',
  flows: 'flow',
  entities: 'entity',
  channels: 'channel',
};

const UNVERSIONED_SECTIONS: Record<string, UnversionedType> = {
  teams: 'team',
  users: 'user',
  'custom docs': 'doc',
};

/**
 * Parse llms.txt content into structured resources.
 */
export function parseLlmsTxt(text: string): ParsedResource[] {
  const resources: ParsedResource[] = [];
  const lines = text.split('\n');

  let currentSection: string | null = null;

  for (const line of lines) {
    // Section header: ## Events, ## Teams, etc.
    if (line.startsWith('## ')) {
      currentSection = line.slice(3).trim().toLowerCase();
      continue;
    }

    // Resource line: - [...](...) - ...
    if (line.startsWith('- [') && currentSection) {
      const versionedType = VERSIONED_SECTIONS[currentSection];
      const unversionedType = UNVERSIONED_SECTIONS[currentSection];

      if (versionedType) {
        const resource = parseVersionedLine(line, versionedType);
        if (resource) resources.push(resource);
      } else if (unversionedType) {
        const resource = parseUnversionedLine(line, unversionedType);
        if (resource) resources.push(resource);
      }
    }
  }

  return resources;
}

/**
 * Parse versioned resource line.
 * Format: - [Name - ID - Version](url) - Summary
 */
function parseVersionedLine(line: string, type: VersionedType): ParsedResource | null {
  const match = line.match(/^- \[([^\]]+)\]\(([^)]+)\)(?:\s*-\s*(.*))?$/);
  if (!match) return null;

  const [, bracketContent, url, summary] = match;
  const parts = bracketContent.split(' - ');

  if (parts.length < 3) return null;

  const version = parts[parts.length - 1].trim();
  const id = parts[parts.length - 2].trim();
  const name = parts.slice(0, -2).join(' - ').trim();

  return {
    type,
    id,
    name,
    version,
    summary: summary?.trim(),
    url: url.trim(),
  } as ParsedResource;
}

/**
 * Parse non-versioned resource line (teams, users, docs).
 * Format: - [ID](url) - Name/Summary
 */
function parseUnversionedLine(line: string, type: UnversionedType): ParsedResource | null {
  const match = line.match(/^- \[([^\]]+)\]\(([^)]+)\)(?:\s*-\s*(.*))?$/);
  if (!match) return null;

  const [, id, url, nameOrSummary] = match;

  return {
    type,
    id: id.trim(),
    name: nameOrSummary?.trim() || id.trim(),
    url: url.trim(),
  } as ParsedResource;
}
