import axios from "axios";

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  content: string;
}

const client = axios.create({
  baseURL: "/api/notes",
  headers: { "Content-Type": "application/json" },
});

export const listNotes = async (): Promise<Note[]> => {
  const res = await client.get<Note[]>("");
  return res.data;
};

export const getNote = async (id: number | string): Promise<Note> => {
  const res = await client.get<Note>(`/${id}`);
  return res.data;
};

export const createNote = async (data: NoteInput): Promise<Note> => {
  const res = await client.post<Note>("", data);
  return res.data;
};

export const updateNote = async (
  id: number | string,
  data: Partial<NoteInput>
): Promise<Note> => {
  const res = await client.put<Note>(`/${id}`, data);
  return res.data;
};

export const deleteNote = async (id: number | string): Promise<void> => {
  await client.delete(`/${id}`);
};
