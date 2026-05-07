import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import NoteForm from "./NoteForm";
import { getNote, updateNote, type Note } from "../../api/notes";

const NoteEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getNote(id).then(setNote).catch(() => setError("Note not found"));
  }, [id]);

  if (error)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate("/notes")} sx={{ mt: 2 }}>Back to list</Button>
      </Box>
    );
  if (!note) return <Box sx={{ textAlign: "center", mt: 6 }}>Loading…</Box>;

  return (
    <Box sx={{ maxWidth: 900, margin: "40px auto", padding: 3 }}>
      <Paper sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>Edit Note</Typography>
        <NoteForm
          initial={note}
          submitLabel="Save"
          onSubmit={async (data) => {
            await updateNote(note.id, data);
            navigate(`/notes/${note.id}`);
          }}
          onCancel={() => navigate(`/notes/${note.id}`)}
        />
      </Paper>
    </Box>
  );
};

export default NoteEdit;
