import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  fetchNotes,
  createNote,
  deleteNote,
  updateNote,
  togglePinNote,
  toggleArchiveNote,
} from "../api/notes";
import { getRelativeTime } from "../utils/timeUtils";
import {
  exportNoteAsText,
  exportNoteAsPDF,
  exportAllNotesAsText,
} from "../utils/exportUtils";

const NOTE_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Yellow", value: "#fff9c4" },
  { name: "Green", value: "#c8e6c9" },
  { name: "Blue", value: "#bbdefb" },
  { name: "Pink", value: "#f8bbd0" },
  { name: "Purple", value: "#e1bee7" },
  { name: "Orange", value: "#ffe0b2" },
];

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [],
    color: "#ffffff",
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [tagInput, setTagInput] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(null);

  const navigate = useNavigate();

  const loadNotes = async () => {
    const data = await fetchNotes(showArchived);
    setNotes(data);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
    loadNotes();
  }, [showArchived]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuOpen && !event.target.closest('[data-export-menu]')) {
        setExportMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportMenuOpen]);

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    notes.forEach((note) => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [notes]);

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === "" || (note.tags && note.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });

    // Sort notes (pinned notes always first)
    filtered = [...filtered].sort((a, b) => {
      // Pinned notes first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "recently-modified":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [notes, searchQuery, selectedTag, sortBy]);

  // Calculate word and character count
  const wordCount = useMemo(() => {
    const words = formData.content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  }, [formData.content]);

  const charCount = formData.content.length;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag],
        });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await updateNote(editId, formData);
      setEditId(null);
    } else {
      await createNote(formData);
    }

    setFormData({ title: "", content: "", tags: [], color: "#ffffff" });
    setShowForm(false);
    loadNotes();
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "", tags: [], color: "#ffffff" });
    setEditId(null);
    setShowForm(false);
    setTagInput("");
    setPreviewMode(false);
  };

  const handleEdit = (note) => {
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      color: note.color || "#ffffff",
    });
    setEditId(note._id);
    setShowForm(true);
    setPreviewMode(false);
  };

  const handlePin = async (noteId) => {
    await togglePinNote(noteId);
    loadNotes();
  };

  const handleArchive = async (noteId) => {
    await toggleArchiveNote(noteId);
    loadNotes();
  };

  const toggleExpand = (noteId) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const handleExport = (note, format) => {
    if (format === "text") {
      exportNoteAsText(note);
    } else if (format === "pdf") {
      exportNoteAsPDF(note);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 0" }}>
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: "2.5rem",
              fontWeight: "700",
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            {showArchived ? "Archived Notes" : "My Notes"} (
            {filteredAndSortedNotes.length})
          </h1>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-outline"
              onClick={() => setShowArchived(!showArchived)}
              style={{ fontSize: "1rem" }}
            >
              {showArchived ? "📝 Active Notes" : "📦 Archived Notes"}
            </button>
            {!showArchived && (
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
            )}
            {filteredAndSortedNotes.length > 0 && !showArchived && (
              <button
                className="btn btn-outline"
                onClick={() => exportAllNotesAsText(filteredAndSortedNotes)}
                style={{ fontSize: "1rem" }}
              >
                📥 Export All
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        {!showArchived && (
          <div
            className="card"
            style={{ marginBottom: "2rem", padding: "1.5rem" }}
          >
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input
                  type="text"
                  placeholder="🔍 Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid var(--border-color)",
                    borderRadius: "10px",
                    fontSize: "16px",
                    background: "var(--card-bg)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div style={{ minWidth: "150px" }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid var(--border-color)",
                    borderRadius: "10px",
                    fontSize: "16px",
                    background: "var(--card-bg)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="recently-modified">Recently Modified</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
              <div style={{ minWidth: "150px" }}>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid var(--border-color)",
                    borderRadius: "10px",
                    fontSize: "16px",
                    background: "var(--card-bg)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
              </div>
              {(searchQuery || selectedTag) && (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTag("");
                  }}
                  style={{ padding: "12px 20px" }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && !showArchived && (
          <div
            className="card"
            style={{
              marginBottom: "2rem",
              background: formData.color || "#ffffff",
            }}
          >
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
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  {previewMode ? "✏️ Edit" : "👁️ Preview"}
                </button>
                <div style={{ flex: 1, display: "flex", gap: "0.5rem" }}>
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, color: color.value })
                      }
                      style={{
                        flex: 1,
                        height: "40px",
                        background: color.value,
                        border:
                          formData.color === color.value
                            ? "3px solid #667eea"
                            : "2px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                        minWidth: "40px",
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              {previewMode ? (
                <div
                  className="markdown-content"
                  style={{
                    minHeight: "200px",
                    padding: "1rem",
                    border: "2px solid var(--border-color)",
                    borderRadius: "10px",
                    background: "white",
                    marginBottom: "1rem",
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formData.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  name="content"
                  placeholder="Write your note here... (Markdown supported: **bold**, *italic*, - lists, etc.)"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows="8"
                />
              )}

              {/* Character/Word Count */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  color: "#666",
                  marginTop: "-0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <span>
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
                <span>{charCount} characters</span>
              </div>

              {/* Tags Input */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#333",
                    fontWeight: "500",
                  }}
                >
                  Tags (Press Enter to add)
                </label>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid var(--border-color)",
                    borderRadius: "10px",
                    fontSize: "16px",
                    marginBottom: "0.5rem",
                    background: "var(--card-bg)",
                    color: "var(--text-primary)",
                  }}
                />
                {formData.tags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                        }}
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          style={{
                            background: "rgba(255,255,255,0.3)",
                            border: "none",
                            color: "white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            padding: 0,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

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

        {/* Notes Grid */}
        {filteredAndSortedNotes.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "4rem 2rem" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📝</div>
            <h3 style={{ color: "#666", marginBottom: "0.5rem" }}>
              {notes.length === 0
                ? showArchived
                  ? "No archived notes"
                  : "No notes yet"
                : "No notes match your search"}
            </h3>
            <p style={{ color: "#999" }}>
              {notes.length === 0
                ? showArchived
                  ? "Archive notes to see them here"
                  : "Create your first note to get started!"
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredAndSortedNotes.map((note) => {
              const isExpanded = expandedNotes.has(note._id);
              const shouldTruncate = note.content.length > 150;
              const displayContent = isExpanded
                ? note.content
                : truncateContent(note.content);
              const noteColor = note.color || "#ffffff";

              return (
                <div
                  key={note._id}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "200px",
                    background: noteColor,
                    border: note.pinned ? "3px solid #667eea" : "none",
                    position: "relative",
                  }}
                >
                  {note.pinned && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "#667eea",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                      }}
                    >
                      📌 Pinned
                    </div>
                  )}

                  <h3
                    style={{
                      color: "#333",
                      marginBottom: "0.5rem",
                      fontSize: "1.3rem",
                      fontWeight: "600",
                      paddingRight: note.pinned ? "80px" : "0",
                    }}
                  >
                    {note.title}
                  </h3>

                  {/* Tags Display */}
                  {note.tags && note.tags.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "15px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "transform 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.transform = "scale(1.05)")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.transform = "scale(1)")
                          }
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Note Content with Markdown */}
                  <div
                    className={isExpanded ? "markdown-content" : ""}
                    style={{
                      color: "#666",
                      flex: 1,
                      lineHeight: "1.6",
                      wordBreak: "break-word",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {isExpanded ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {note.content}
                      </ReactMarkdown>
                    ) : (
                      <p style={{ whiteSpace: "pre-wrap" }}>{displayContent}</p>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpand(note._id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#667eea",
                        cursor: "pointer",
                        padding: "0.5rem 0",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        textAlign: "left",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}

                  {/* Timestamp with Relative Time */}
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#999",
                      marginBottom: "1rem",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid #e0e0e0",
                    }}
                  >
                    <div>Created: {getRelativeTime(note.createdAt)}</div>
                    {note.updatedAt !== note.createdAt && (
                      <div>Updated: {getRelativeTime(note.updatedAt)}</div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "auto",
                      paddingTop: "1rem",
                      borderTop: "1px solid #e0e0e0",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => handlePin(note._id)}
                      className="btn btn-outline"
                      style={{
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        flex: "1",
                        minWidth: "80px",
                      }}
                      title={note.pinned ? "Unpin note" : "Pin note"}
                    >
                      {note.pinned ? "📌 Unpin" : "📌 Pin"}
                    </button>
                    <button
                      onClick={() => handleArchive(note._id)}
                      className="btn btn-outline"
                      style={{
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        flex: "1",
                        minWidth: "80px",
                      }}
                      title={note.archived ? "Restore note" : "Archive note"}
                    >
                      {note.archived ? "📦 Restore" : "📦 Archive"}
                    </button>
                    <button
                      onClick={() => handleEdit(note)}
                      className="btn btn-outline"
                      style={{
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        flex: "1",
                        minWidth: "80px",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                      }}
                      data-export-menu
                    >
                      <button
                        className="btn btn-outline"
                        onClick={() =>
                          setExportMenuOpen(
                            exportMenuOpen === note._id ? null : note._id
                          )
                        }
                        style={{
                          padding: "8px 12px",
                          fontSize: "0.85rem",
                          minWidth: "80px",
                        }}
                      >
                        📥 Export
                      </button>
                      {exportMenuOpen === note._id && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "100%",
                            left: 0,
                            marginBottom: "5px",
                            background: "var(--card-bg)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            zIndex: 10,
                            minWidth: "150px",
                          }}
                          data-export-menu
                        >
                          <button
                            onClick={() => {
                              handleExport(note, "text");
                              setExportMenuOpen(null);
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 16px",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "0.9rem",
                              color: "var(--text-primary)",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.background = "rgba(102, 126, 234, 0.1)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "transparent")
                            }
                          >
                            📄 Export as Text
                          </button>
                          <button
                            onClick={() => {
                              handleExport(note, "pdf");
                              setExportMenuOpen(null);
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 16px",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "0.9rem",
                              borderTop: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.background = "rgba(102, 126, 234, 0.1)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "transparent")
                            }
                          >
                            📑 Export as PDF
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this note?"
                          )
                        ) {
                          await deleteNote(note._id);
                          loadNotes();
                        }
                      }}
                      className="btn"
                      style={{
                        flex: "1",
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        minWidth: "80px",
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        boxShadow: "0 4px 15px rgba(245, 87, 108, 0.4)",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
