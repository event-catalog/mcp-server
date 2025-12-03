/**
 * Base fields for versioned resources
 */
interface VersionedBase {
  id: string;
  name: string;
  version: string;
  summary?: string;
  url: string;
}

/**
 * Base fields for non-versioned resources
 */
interface UnversionedBase {
  id: string;
  name: string;
  summary?: string;
  url: string;
}

// Versioned resource types

export interface EventResource extends VersionedBase {
  type: 'event';
}

export interface CommandResource extends VersionedBase {
  type: 'command';
}

export interface QueryResource extends VersionedBase {
  type: 'query';
}

export interface ServiceResource extends VersionedBase {
  type: 'service';
}

export interface DomainResource extends VersionedBase {
  type: 'domain';
}

export interface FlowResource extends VersionedBase {
  type: 'flow';
}

export interface EntityResource extends VersionedBase {
  type: 'entity';
}

export interface ChannelResource extends VersionedBase {
  type: 'channel';
}

// Non-versioned resource types

export interface TeamResource extends UnversionedBase {
  type: 'team';
}

export interface UserResource extends UnversionedBase {
  type: 'user';
}

export interface DocResource extends UnversionedBase {
  type: 'doc';
}

/**
 * Union of all resource types
 */
export type ParsedResource =
  | EventResource
  | CommandResource
  | QueryResource
  | ServiceResource
  | DomainResource
  | FlowResource
  | EntityResource
  | ChannelResource
  | TeamResource
  | UserResource
  | DocResource;

/**
 * Resource kind literals
 */
export type ResourceKind = ParsedResource['type'];

/**
 * Filter type including 'all'
 */
export type ResourceFilter = ResourceKind | 'all';

/**
 * Paginated response following MCP conventions
 */
export interface PaginatedResult {
  resources: ParsedResource[];
  nextCursor?: string;
}
