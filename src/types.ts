// ============================================================================
// Resource Kind Types
// ============================================================================

/**
 * Versioned resource kinds (have id, name, version)
 */
export type VersionedKind = 'event' | 'command' | 'query' | 'service' | 'domain' | 'flow' | 'entity' | 'channel';

/**
 * Unversioned resource kinds (have id, name, no version)
 */
export type UnversionedKind = 'team' | 'user' | 'doc';

/**
 * All resource kinds (singular)
 */
export type ResourceKind = VersionedKind | UnversionedKind;

/**
 * Plural resource kinds (for API params)
 */
export type PluralResourceKind =
  | 'events'
  | 'commands'
  | 'queries'
  | 'services'
  | 'domains'
  | 'flows'
  | 'entities'
  | 'channels'
  | 'teams'
  | 'users'
  | 'docs';

/**
 * Filter type including 'all' (accepts both singular and plural)
 */
export type ResourceFilter = ResourceKind | PluralResourceKind | 'all';

// ============================================================================
// List Results (from llms.txt - summary info)
// ============================================================================

/**
 * Base fields for versioned list results
 */
interface VersionedListBase {
  id: string;
  name: string;
  version: string;
  summary?: string;
  url: string;
}

/**
 * Base fields for unversioned list results
 */
interface UnversionedListBase {
  id: string;
  name: string;
  summary?: string;
  url: string;
}

// Versioned list result types

export interface EventListResult extends VersionedListBase {
  type: 'event';
}

export interface CommandListResult extends VersionedListBase {
  type: 'command';
}

export interface QueryListResult extends VersionedListBase {
  type: 'query';
}

export interface ServiceListResult extends VersionedListBase {
  type: 'service';
}

export interface DomainListResult extends VersionedListBase {
  type: 'domain';
}

export interface FlowListResult extends VersionedListBase {
  type: 'flow';
}

export interface EntityListResult extends VersionedListBase {
  type: 'entity';
}

export interface ChannelListResult extends VersionedListBase {
  type: 'channel';
}

// Unversioned list result types

export interface TeamListResult extends UnversionedListBase {
  type: 'team';
}

export interface UserListResult extends UnversionedListBase {
  type: 'user';
}

export interface DocListResult extends UnversionedListBase {
  type: 'doc';
}

/**
 * Union of all versioned list result types
 */
export type VersionedListResult =
  | EventListResult
  | CommandListResult
  | QueryListResult
  | ServiceListResult
  | DomainListResult
  | FlowListResult
  | EntityListResult
  | ChannelListResult;

/**
 * Union of all unversioned list result types
 */
export type UnversionedListResult = TeamListResult | UserListResult | DocListResult;

/**
 * Union of all list result types (from llms.txt)
 */
export type ListResult = VersionedListResult | UnversionedListResult;

// ============================================================================
// Full Results (from fetching .mdx files - includes content)
// ============================================================================

/**
 * Valid MIME types for resource content
 */
export type ResourceMimeType = 'text/markdown' | 'text/plain' | 'application/json';

/**
 * Base fields for versioned full results (includes content)
 */
interface VersionedFullBase extends VersionedListBase {
  content: string;
  mimeType: ResourceMimeType;
}

/**
 * Base fields for unversioned full results (includes content)
 */
interface UnversionedFullBase extends UnversionedListBase {
  content: string;
  mimeType: ResourceMimeType;
}

// Versioned full result types

export interface EventFullResult extends VersionedFullBase {
  type: 'event';
}

export interface CommandFullResult extends VersionedFullBase {
  type: 'command';
}

export interface QueryFullResult extends VersionedFullBase {
  type: 'query';
}

export interface ServiceFullResult extends VersionedFullBase {
  type: 'service';
}

export interface DomainFullResult extends VersionedFullBase {
  type: 'domain';
}

export interface FlowFullResult extends VersionedFullBase {
  type: 'flow';
}

export interface EntityFullResult extends VersionedFullBase {
  type: 'entity';
}

export interface ChannelFullResult extends VersionedFullBase {
  type: 'channel';
}

// Unversioned full result types

export interface TeamFullResult extends UnversionedFullBase {
  type: 'team';
}

export interface UserFullResult extends UnversionedFullBase {
  type: 'user';
}

export interface DocFullResult extends UnversionedFullBase {
  type: 'doc';
}

/**
 * Union of all versioned full result types
 */
export type VersionedFullResult =
  | EventFullResult
  | CommandFullResult
  | QueryFullResult
  | ServiceFullResult
  | DomainFullResult
  | FlowFullResult
  | EntityFullResult
  | ChannelFullResult;

/**
 * Union of all unversioned full result types
 */
export type UnversionedFullResult = TeamFullResult | UserFullResult | DocFullResult;

/**
 * Union of all full result types (from .mdx files)
 */
export type FullResult = VersionedFullResult | UnversionedFullResult;

// ============================================================================
// Backwards Compatibility Aliases
// ============================================================================

/** @deprecated Use ListResult instead */
export type ParsedResource = ListResult;

/** @deprecated Use EventListResult instead */
export type EventResource = EventListResult;

/** @deprecated Use CommandListResult instead */
export type CommandResource = CommandListResult;

/** @deprecated Use QueryListResult instead */
export type QueryResource = QueryListResult;

/** @deprecated Use ServiceListResult instead */
export type ServiceResource = ServiceListResult;

/** @deprecated Use DomainListResult instead */
export type DomainResource = DomainListResult;

/** @deprecated Use FlowListResult instead */
export type FlowResource = FlowListResult;

/** @deprecated Use EntityListResult instead */
export type EntityResource = EntityListResult;

/** @deprecated Use ChannelListResult instead */
export type ChannelResource = ChannelListResult;

/** @deprecated Use TeamListResult instead */
export type TeamResource = TeamListResult;

/** @deprecated Use UserListResult instead */
export type UserResource = UserListResult;

/** @deprecated Use DocListResult instead */
export type DocResource = DocListResult;

// ============================================================================
// Paginated Results
// ============================================================================

/**
 * Paginated list response following MCP conventions
 */
export interface PaginatedListResult {
  resources: ListResult[];
  nextCursor?: string;
}

/** @deprecated Use PaginatedListResult instead */
export type PaginatedResult = PaginatedListResult;

// ============================================================================
// Owner Results (for find_owners tool)
// ============================================================================

/**
 * Successful owner fetch result - either a user or team with full content
 */
export type OwnerResult = UserFullResult | TeamFullResult;

/**
 * Owner not found error
 */
export interface OwnerNotFoundError {
  error: 'Owner not found';
  message: string;
  searchedUrls: string[];
}

// ============================================================================
// Resource Not Found Error
// ============================================================================

/**
 * Resource not found error
 */
export interface ResourceNotFoundError {
  error: 'Resource not found';
  message: string;
  searchedUrl: string;
}
