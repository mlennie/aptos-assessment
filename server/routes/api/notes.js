const express = require('express');
const router = express.Router();

let notes = [];
let nextId = 1;

const findIndex = (id) => notes.findIndex((n) => n.id === Number(id));

const validateTitle = (title) => {
  if (typeof title !== 'string' || title.trim() === '') {
    return 'title is required';
  }
  return null;
};

// @route    POST api/notes
// @desc     Create a note
router.post('/', (req, res) => {
  const { title, content } = req.body || {};
  const titleError = validateTitle(title);
  if (titleError) return res.status(400).json({ msg: titleError });
  const now = new Date().toISOString();
  const note = {
    id: nextId++,
    title: title.trim(),
    content: typeof content === 'string' ? content : '',
    createdAt: now,
    updatedAt: now,
  };
  notes.push(note);
  console.log(`[notes] created id=${note.id} title="${note.title}"`);
  res.status(201).json(note);
});

// @route    GET api/notes
// @desc     List all notes
router.get('/', (req, res) => {
  res.json(notes);
});

// @route    GET api/notes/:id
// @desc     Get a single note
router.get('/:id', (req, res) => {
  const i = findIndex(req.params.id);
  if (i === -1) return res.status(404).json({ msg: 'Note not found' });
  res.json(notes[i]);
});

// @route    PUT api/notes/:id
// @desc     Update a note (partial)
router.put('/:id', (req, res) => {
  const i = findIndex(req.params.id);
  if (i === -1) return res.status(404).json({ msg: 'Note not found' });
  const { title, content } = req.body || {};
  if (title !== undefined) {
    const titleError = validateTitle(title);
    if (titleError) return res.status(400).json({ msg: titleError });
    notes[i].title = title.trim();
  }
  if (typeof content === 'string') notes[i].content = content;
  notes[i].updatedAt = new Date().toISOString();
  console.log(`[notes] updated id=${notes[i].id}`);
  res.json(notes[i]);
});

// @route    DELETE api/notes/:id
// @desc     Delete a note
router.delete('/:id', (req, res) => {
  const i = findIndex(req.params.id);
  if (i === -1) return res.status(404).json({ msg: 'Note not found' });
  const [removed] = notes.splice(i, 1);
  console.log(`[notes] deleted id=${removed.id}`);
  res.status(204).end();
});

router.__resetForTest = () => {
  notes = [];
  nextId = 1;
};

module.exports = router;
