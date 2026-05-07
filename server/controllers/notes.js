const service = require('../services/notes');

const handleError = (err, res) => {
  if (err instanceof service.NotFoundError) {
    return res.status(404).json({ msg: err.message });
  }
  if (err instanceof service.ValidationError) {
    return res.status(400).json({ msg: err.message });
  }
  console.error(err);
  return res.status(500).json({ msg: 'Server Error' });
};

exports.list = (_req, res) => res.json(service.list());

exports.get = (req, res) => {
  try {
    res.json(service.get(req.params.id));
  } catch (err) {
    handleError(err, res);
  }
};

exports.create = (req, res) => {
  try {
    const note = service.create(req.body);
    console.log(`[notes] created id=${note.id} title="${note.title}"`);
    res.status(201).json(note);
  } catch (err) {
    handleError(err, res);
  }
};

exports.update = (req, res) => {
  try {
    const note = service.update(req.params.id, req.body);
    console.log(`[notes] updated id=${note.id}`);
    res.json(note);
  } catch (err) {
    handleError(err, res);
  }
};

exports.remove = (req, res) => {
  try {
    const removed = service.remove(req.params.id);
    console.log(`[notes] deleted id=${removed.id}`);
    res.status(204).end();
  } catch (err) {
    handleError(err, res);
  }
};
