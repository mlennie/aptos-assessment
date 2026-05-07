import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { listNotes, deleteNote, type Note } from "../../api/notes";

const NotesList: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setNotes(await listNotes());
      setError(null);
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      await refresh();
    } catch {
      setError("Failed to delete note");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, margin: "40px auto", padding: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">Notes</Typography>
        <Button variant="contained" onClick={() => navigate("/notes/new")}>
          New Note
        </Button>
      </Box>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Loading…</TableCell>
              </TableRow>
            ) : notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No notes yet — click "New Note".</TableCell>
              </TableRow>
            ) : (
              notes.map((n) => (
                <TableRow key={n.id} hover>
                  <TableCell>{n.id}</TableCell>
                  <TableCell>{n.title}</TableCell>
                  <TableCell>{new Date(n.updatedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/notes/${n.id}`)} aria-label="view">
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => navigate(`/notes/${n.id}/edit`)} aria-label="edit">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(n.id)} aria-label="delete" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default NotesList;
