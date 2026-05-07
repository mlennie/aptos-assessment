import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import NoteForm from "./NoteForm";
import { createNote } from "../../api/notes";

const NoteCreate: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ maxWidth: 900, margin: "40px auto", padding: 3 }}>
      <Paper sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>New Note</Typography>
        <NoteForm
          submitLabel="Create"
          onSubmit={async (data) => {
            await createNote(data);
            navigate("/notes");
          }}
          onCancel={() => navigate("/notes")}
        />
      </Paper>
    </Box>
  );
};

export default NoteCreate;
