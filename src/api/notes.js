import API from "./axios";

export const fetchNotes = async () => {
  const res = await API.get("/notes");
  return res.data;
};
export const createNote = async (noteData) => {
  const res = await API.post("/notes", noteData);
  return res.data;
};

export const deleteNote = async (id) => {
  const res = await API.delete(`/notes/${id}`);
  return res.data;
};

export const updateNote = async (id, noteData) => {
  const res = await API.put(`/notes/${id}`, noteData);
  return res.data;
};

