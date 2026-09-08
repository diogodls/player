import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('backendApi environment', () => {
  it('uses localhost only as a local development fallback', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_BACKEND_URL', '');
    const { backendApi } = await import('./api');
    expect(backendApi.defaults.baseURL).toBe('http://localhost:3000');
  });

  it.each([undefined, '', '   '])('rejects a missing backend in a deployed build (%s)', async (url) => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_BACKEND_URL', url);
    await expect(import('./api')).rejects.toThrow('Configure VITE_BACKEND_URL');
  });

  it('uses the configured API and credentials in Production and Preview builds', async () => {
    vi.stubEnv('DEV', false);
    // Reserved test domain; not a deployment configuration.
    vi.stubEnv('VITE_BACKEND_URL', ' https://api.example.test ');
    const { backendApi } = await import('./api');
    expect(backendApi.defaults.baseURL).toBe('https://api.example.test');
    expect(backendApi.defaults.withCredentials).toBe(true);
  });
});
