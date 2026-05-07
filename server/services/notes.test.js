const test = require('node:test');
const assert = require('node:assert/strict');

const service = require('./notes');

test.beforeEach(() => {
  service.__resetForTest();
});

test('create() returns a note with id starting at 1, both timestamps equal', () => {
  const note = service.create({ title: 'first', content: 'body' });
  assert.equal(note.id, 1);
  assert.equal(note.title, 'first');
  assert.equal(note.content, 'body');
  assert.ok(note.createdAt);
  assert.equal(note.createdAt, note.updatedAt);
});

test('create() trims the title and defaults missing content to ""', () => {
  const note = service.create({ title: '  spaced  ' });
  assert.equal(note.title, 'spaced');
  assert.equal(note.content, '');
});

test('create() throws ValidationError for missing/empty/whitespace/non-string title', () => {
  for (const bad of [undefined, '', '   ', 123, null]) {
    assert.throws(() => service.create({ title: bad }), service.ValidationError);
  }
});

test('list() returns notes in insertion order, isolated from internal mutation', () => {
  service.create({ title: 'a' });
  service.create({ title: 'b' });
  const snapshot = service.list();
  assert.deepEqual(snapshot.map((n) => n.title), ['a', 'b']);
  // mutating the returned array must not affect the store
  snapshot.pop();
  assert.equal(service.list().length, 2);
});

test('get() returns the matching note', () => {
  const created = service.create({ title: 'hi' });
  assert.equal(service.get(created.id).title, 'hi');
  assert.equal(service.get(String(created.id)).title, 'hi');
});

test('get() throws NotFoundError for unknown numeric or non-numeric id', () => {
  assert.throws(() => service.get(999), service.NotFoundError);
  assert.throws(() => service.get('abc'), service.NotFoundError);
});

test('update() applies partial patches and preserves createdAt', () => {
  const created = service.create({ title: 'old', content: 'old' });
  const updated = service.update(created.id, { content: 'new' });
  assert.equal(updated.title, 'old');
  assert.equal(updated.content, 'new');
  assert.equal(updated.createdAt, created.createdAt);
  assert.ok(Date.parse(updated.updatedAt) >= Date.parse(created.updatedAt));
});

test('update() with empty body acts as a "touch" without changing fields', () => {
  const created = service.create({ title: 't', content: 'c' });
  const touched = service.update(created.id, {});
  assert.equal(touched.title, 't');
  assert.equal(touched.content, 'c');
  assert.ok(Date.parse(touched.updatedAt) >= Date.parse(created.updatedAt));
});

test('update() rejects empty/whitespace title, accepts undefined (= no change)', () => {
  const created = service.create({ title: 'keep' });
  assert.throws(() => service.update(created.id, { title: '' }), service.ValidationError);
  assert.throws(() => service.update(created.id, { title: '   ' }), service.ValidationError);
  // no title in payload → leaves title alone
  const unchanged = service.update(created.id, { content: 'x' });
  assert.equal(unchanged.title, 'keep');
});

test('update() throws NotFoundError for unknown id', () => {
  assert.throws(() => service.update(999, { title: 'x' }), service.NotFoundError);
});

test('remove() returns the removed note and subsequent get() throws', () => {
  const created = service.create({ title: 'gone' });
  const removed = service.remove(created.id);
  assert.equal(removed.id, created.id);
  assert.throws(() => service.get(created.id), service.NotFoundError);
});

test('remove() throws NotFoundError for unknown id', () => {
  assert.throws(() => service.remove(999), service.NotFoundError);
});

test('IDs are monotonic: deleting an id does not let it be reused', () => {
  const a = service.create({ title: 'a' });
  service.remove(a.id);
  const b = service.create({ title: 'b' });
  assert.equal(b.id, 2);
});
