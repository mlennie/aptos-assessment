class NotFoundError extends Error {
  constructor(msg = 'Note not found') {
    super(msg);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ValidationError';
  }
}

let notes = [];
let nextId = 1;

const assertValidTitle = (title) => {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new ValidationError('title is required');
  }
};

const requireIndex = (id) => {
  const i = notes.findIndex((n) => n.id === Number(id));
  if (i === -1) throw new NotFoundError();
  return i;
};

const list = () => notes.slice();

const get = (id) => notes[requireIndex(id)];

const create = ({ title, content } = {}) => {
  assertValidTitle(title);
  const now = new Date().toISOString();
  const note = {
    id: nextId++,
    title: title.trim(),
    content: typeof content === 'string' ? content : '',
    createdAt: now,
    updatedAt: now,
  };
  notes.push(note);
  return note;
};

const update = (id, { title, content } = {}) => {
  const i = requireIndex(id);
  if (title !== undefined) {
    assertValidTitle(title);
    notes[i].title = title.trim();
  }
  if (typeof content === 'string') notes[i].content = content;
  notes[i].updatedAt = new Date().toISOString();
  return notes[i];
};

const remove = (id) => {
  const i = requireIndex(id);
  const [removed] = notes.splice(i, 1);
  return removed;
};

// test-only: reset module state between tests
const __resetForTest = () => {
  notes = [];
  nextId = 1;
};

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  NotFoundError,
  ValidationError,
  __resetForTest,
};
