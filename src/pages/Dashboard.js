import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchNotes,
  createNote,
  deleteNote,
  updateNote,
} from "../api/notes";

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [editId, setEditId] = useState(null);

  const loadNotes = async () => {
    const data = await fetchNotes();
    setNotes(data);
  };
  const navigate = useNavigate();

  useEffect(() => {
     if (!localStorage.getItem("token")) {
    navigate("/login");
  }
    loadNotes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await updateNote(editId, formData);
      setEditId(null);
    } else {
      await createNote(formData);
    }

    setFormData({ title: "", content: "" });
    loadNotes();
  };

  const handleLogout = () => {
  localStorage.removeItem("token"); // 🔑 logout
  navigate("/"); // 🔁 go to home
};


  const handleEdit = (note) => {
    setFormData({ title: note.title, content: note.content });
    setEditId(note._id);
  };

  return (
    <div>
      <button className="btn btn-outline" onClick={handleLogout}>
      Logout
      </button>
      <h2>Dashboard</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
        />
        <br />
        <textarea
          name="content"
          placeholder="Content"
          value={formData.content}
          onChange={handleChange}
        />
        <br />
        <button type="submit">
          {editId ? "Update Note" : "Add Note"}
        </button>
      </form>

      <hr />

      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            <h4>{note.title}</h4>
            <p>{note.content}</p>

            <button onClick={() => handleEdit(note)}>Edit</button>
            <button
              onClick={async () => {
                await deleteNote(note._id);
                loadNotes();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
