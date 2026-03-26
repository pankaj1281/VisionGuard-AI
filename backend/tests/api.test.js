/**
 * Tests for VisionGuard AI Backend
 * Tests: health endpoint, file validation middleware, auth routes, detect route
 */

const request = require('supertest');
const { app, server } = require('../server');

afterAll(() => {
  server.close();
});

// ── Health ──────────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toMatch(/VisionGuard AI/i);
  });
});

// ── File validation middleware ──────────────────────────────────────────────

describe('POST /api/detect — file validation', () => {
  it('returns 400 when no file is uploaded', async () => {
    const res = await request(app).post('/api/detect');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 415 when an unsupported file type is uploaded', async () => {
    const res = await request(app)
      .post('/api/detect')
      .attach('image', Buffer.from('not an image'), { filename: 'test.txt', contentType: 'text/plain' });
    // Multer rejects at file filter — should be 415
    expect(res.status).toBe(415);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 503 when AI API keys are not set', async () => {
    // We send a valid image but no API keys are set in test env
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const res = await request(app)
      .post('/api/detect')
      .attach('image', pngBuffer, { filename: 'pixel.png', contentType: 'image/png' });
    // Without API keys configured, expect 503
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/not configured/i);
  });
});

// ── Auth routes ─────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});

// ── Protected routes (no auth) ───────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/dashboard/history', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/dashboard/history');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/users', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});

// ── 404 handling ────────────────────────────────────────────────────────────

describe('Unknown API endpoint', () => {
  it('returns 404 for unknown API path', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    expect(res.status).toBe(404);
  });
});
