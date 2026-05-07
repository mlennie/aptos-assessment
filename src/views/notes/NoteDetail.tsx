import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getNote, deleteNote, type Note } from "../../api/notes";

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getNote(id)
      .then(setNote)
      .catch(() => setError("Note not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      navigate("/notes");
    } catch {
      setError("Failed to delete note");
    }
  };

  if (loading) return <Box sx={{ textAlign: "center", mt: 6 }}>Loading…</Box>;
  if (error || !note)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate("/notes")} sx={{ mt: 2 }}>Back to list</Button>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 900, margin: "40px auto", padding: 3 }}>
      <Button onClick={() => navigate("/notes")} sx={{ mb: 2 }}>← Back</Button>
      <Paper sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>{note.title}</Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Created: {new Date(note.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
          Updated: {new Date(note.updatedAt).toLocaleString()}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 4 }}>
          {note.content || <em>(no content)</em>}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={() => navigate(`/notes/${note.id}/edit`)}>
            Edit
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NoteDetail;
