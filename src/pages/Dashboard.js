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
  const [showForm, setShowForm] = useState(false);

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
    setShowForm(false);
    loadNotes();
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (note) => {
    setFormData({ title: note.title, content: note.content });
    setEditId(note._id);
    setShowForm(true);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 0" }}>
      <div className="container">
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "2rem"
        }}>
          <h1 style={{ 
            color: "white", 
            fontSize: "2.5rem", 
            fontWeight: "700",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            My Notes
          </h1>
          <button 
            className="btn" 
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) handleCancel();
            }}
            style={{ fontSize: "1rem" }}
          >
            {showForm ? "Cancel" : "+ New Note"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>
              {editId ? "Edit Note" : "Create New Note"}
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                name="title"
                placeholder="Note Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <textarea
                name="content"
                placeholder="Write your note here..."
                value={formData.content}
                onChange={handleChange}
                required
              />
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  {editId ? "Update Note" : "Add Note"}
                </button>
                {editId && (
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={handleCancel}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📝</div>
            <h3 style={{ color: "#666", marginBottom: "0.5rem" }}>No notes yet</h3>
            <p style={{ color: "#999" }}>Create your first note to get started!</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {notes.map((note) => (
              <div 
                key={note._id} 
                className="card"
                style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  minHeight: "200px"
                }}
              >
                <h3 style={{ 
                  color: "#333", 
                  marginBottom: "1rem",
                  fontSize: "1.3rem",
                  fontWeight: "600"
                }}>
                  {note.title}
                </h3>
                <p style={{ 
                  color: "#666", 
                  flex: 1,
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}>
                  {note.content}
                </p>
                <div style={{ 
                  display: "flex", 
                  gap: "0.5rem", 
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e0e0e0"
                }}>
                  <button 
                    onClick={() => handleEdit(note)}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: "10px", fontSize: "0.9rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this note?")) {
                        await deleteNote(note._id);
                        loadNotes();
                      }
                    }}
                    className="btn"
                    style={{ 
                      flex: 1, 
                      padding: "10px", 
                      fontSize: "0.9rem",
                      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      boxShadow: "0 4px 15px rgba(245, 87, 108, 0.4)"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
