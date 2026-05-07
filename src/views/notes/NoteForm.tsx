import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import type { Note, NoteInput } from "../../api/notes";

interface Props {
  initial?: Note;
  submitLabel: string;
  onSubmit: (data: NoteInput) => Promise<void>;
  onCancel: () => void;
}

const NoteForm: React.FC<Props> = ({ initial, submitLabel, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), content });
    } catch (err: any) {
      setError(err?.response?.data?.msg ?? "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        multiline
        minRows={6}
        fullWidth
      />
      {error && <Typography color="error">{error}</Typography>}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outlined" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default NoteForm;
