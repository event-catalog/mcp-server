import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchOwnerById } from '../src/utils/fetch.js';

describe('fetchOwnerById', () => {
  beforeEach(() => {
    vi.stubEnv('EVENTCATALOG_URL', 'https://example.com');
  });

  it('returns user when user endpoint responds successfully', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('# User Content\nThis is user data'),
    });

    const result = await fetchOwnerById('john-doe', mockFetch);

    expect(result).toEqual({
      type: 'user',
      id: 'john-doe',
      name: 'john-doe',
      content: '# User Content\nThis is user data',
      mimeType: 'text/markdown',
      url: 'https://example.com/docs/users/john-doe',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/docs/users/john-doe.mdx');
  });

  it('returns team when user endpoint fails but team succeeds', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false }) // user fails
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('# Team Content\nThis is team data'),
      });

    const result = await fetchOwnerById('platform-team', mockFetch);

    expect(result).toEqual({
      type: 'team',
      id: 'platform-team',
      name: 'platform-team',
      content: '# Team Content\nThis is team data',
      mimeType: 'text/markdown',
      url: 'https://example.com/docs/teams/platform-team',
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://example.com/docs/users/platform-team.mdx');
    expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://example.com/docs/teams/platform-team.mdx');
  });

  it('returns error when both user and team endpoints fail', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false }) // user fails
      .mockResolvedValueOnce({ ok: false }); // team fails

    const result = await fetchOwnerById('nonexistent', mockFetch);

    expect(result).toEqual({
      error: 'Owner not found',
      message: "No user or team found with id 'nonexistent'",
      searchedUrls: ['https://example.com/docs/users/nonexistent', 'https://example.com/docs/teams/nonexistent'],
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('tries user first before team', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('user content'),
    });

    await fetchOwnerById('asmith', mockFetch);

    // Should only call user endpoint since it succeeded
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/docs/users/asmith.mdx');
  });
});

describe('fetchOwnerById result types', () => {
  beforeEach(() => {
    vi.stubEnv('EVENTCATALOG_URL', 'https://example.com');
  });

  it('successful result has type, id, name, content, mimeType, and url', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('content'),
    });

    const result = await fetchOwnerById('test', mockFetch);

    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('mimeType');
      expect(result).toHaveProperty('url');
      expect(result.mimeType).toBe('text/markdown');
    }
  });

  it('error result has error, message, and searchedUrls', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: false });

    const result = await fetchOwnerById('test', mockFetch);

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result).toHaveProperty('error', 'Owner not found');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('searchedUrls');
      expect(result.searchedUrls).toHaveLength(2);
    }
  });
});
