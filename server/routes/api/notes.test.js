const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const notesRouter = require('./notes');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/notes', notesRouter);
  return app;
};

test.beforeEach(() => {
  notesRouter.__resetForTest();
});

test('POST /api/notes creates a note with 201', async () => {
  const app = buildApp();
  const res = await request(app)
    .post('/api/notes')
    .send({ title: 'first', content: 'hello' });
  assert.equal(res.status, 201);
  assert.equal(res.body.id, 1);
  assert.equal(res.body.title, 'first');
  assert.equal(res.body.content, 'hello');
  assert.ok(res.body.createdAt);
  assert.equal(res.body.createdAt, res.body.updatedAt);
});

test('POST /api/notes trims the title before storing', async () => {
  const app = buildApp();
  const res = await request(app)
    .post('/api/notes')
    .send({ title: '  spaced  ', content: 'x' });
  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'spaced');
});

test('POST /api/notes defaults missing content to empty string', async () => {
  const app = buildApp();
  const res = await request(app).post('/api/notes').send({ title: 't' });
  assert.equal(res.status, 201);
  assert.equal(res.body.content, '');
});

test('POST /api/notes rejects missing title with 400', async () => {
  const app = buildApp();
  const res = await request(app).post('/api/notes').send({});
  assert.equal(res.status, 400);
  assert.match(res.body.msg, /title/i);
});

test('POST /api/notes rejects empty title with 400', async () => {
  const app = buildApp();
  const res = await request(app).post('/api/notes').send({ title: '' });
  assert.equal(res.status, 400);
});

test('POST /api/notes rejects whitespace-only title with 400', async () => {
  const app = buildApp();
  const res = await request(app).post('/api/notes').send({ title: '   ' });
  assert.equal(res.status, 400);
});

test('POST /api/notes rejects non-string title with 400', async () => {
  const app = buildApp();
  const res = await request(app).post('/api/notes').send({ title: 123 });
  assert.equal(res.status, 400);
});

test('GET /api/notes returns all notes in insertion order', async () => {
  const app = buildApp();
  await request(app).post('/api/notes').send({ title: 'a' });
  await request(app).post('/api/notes').send({ title: 'b' });
  const res = await request(app).get('/api/notes');
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 2);
  assert.deepEqual(res.body.map((n) => n.title), ['a', 'b']);
});

test('GET /api/notes/:id returns the note', async () => {
  const app = buildApp();
  const created = await request(app).post('/api/notes').send({ title: 'one' });
  const res = await request(app).get(`/api/notes/${created.body.id}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.id, created.body.id);
  assert.equal(res.body.title, 'one');
});

test('GET /api/notes/:id returns 404 for unknown id', async () => {
  const app = buildApp();
  const res = await request(app).get('/api/notes/999');
  assert.equal(res.status, 404);
});

test('GET /api/notes/:id returns 404 for non-numeric id', async () => {
  const app = buildApp();
  const res = await request(app).get('/api/notes/abc');
  assert.equal(res.status, 404);
});

test('PUT /api/notes/:id updates title and content and bumps updatedAt', async () => {
  const app = buildApp();
  const created = await request(app).post('/api/notes').send({ title: 'old', content: 'old' });
  // ensure the timestamp ticks at least 1ms forward
  await new Promise((r) => setTimeout(r, 5));
  const res = await request(app)
    .put(`/api/notes/${created.body.id}`)
    .send({ title: 'new', content: 'new' });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'new');
  assert.equal(res.body.content, 'new');
  assert.equal(res.body.createdAt, created.body.createdAt);
  assert.notEqual(res.body.updatedAt, created.body.updatedAt);
});

test('PUT /api/notes/:id supports partial update (content only)', async () => {
  const app = buildApp();
  const created = await request(app).post('/api/notes').send({ title: 'keep', content: 'old' });
  const res = await request(app)
    .put(`/api/notes/${created.body.id}`)
    .send({ content: 'patched' });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'keep');
  assert.equal(res.body.content, 'patched');
});

test('PUT /api/notes/:id rejects empty title with 400', async () => {
  const app = buildApp();
  const created = await request(app).post('/api/notes').send({ title: 'old' });
  const res = await request(app)
    .put(`/api/notes/${created.body.id}`)
    .send({ title: '' });
  assert.equal(res.status, 400);
});

test('PUT /api/notes/:id rejects whitespace-only title with 400', async () => {
  const app = buildApp();
  const created = await request(app).post('/api/notes').send({ title: 'old' });
  const res = await request(app)
    .put(`/api/notes/${created.body.id}`)
    .send({ title: '   ' });
  assert.equal(res.status, 400);
});

test('PUT /api/notes/:id returns 404 for unknown id', async () => {
  const app = buildApp();
  const res = await request(app).put('/api/notes/999').send({ title: 'x' });
  assert.equal(res.status, 404);
});

test('DELETE /api/notes/:id returns 204 and removes the note', async () => {
  const app = buildApp();
  const created = await request(app).post('/api/notes').send({ title: 'gone' });
  const del = await request(app).delete(`/api/notes/${created.body.id}`);
  assert.equal(del.status, 204);
  assert.equal(del.text, '');
  const after = await request(app).get(`/api/notes/${created.body.id}`);
  assert.equal(after.status, 404);
});

test('DELETE /api/notes/:id returns 404 for unknown id', async () => {
  const app = buildApp();
  const res = await request(app).delete('/api/notes/999');
  assert.equal(res.status, 404);
});

test('IDs are stable: deleting id=1 does not renumber id=2', async () => {
  const app = buildApp();
  const a = await request(app).post('/api/notes').send({ title: 'a' });
  const b = await request(app).post('/api/notes').send({ title: 'b' });
  await request(app).delete(`/api/notes/${a.body.id}`);
  const res = await request(app).get(`/api/notes/${b.body.id}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'b');
});
