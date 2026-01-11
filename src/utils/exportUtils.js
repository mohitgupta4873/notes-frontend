// Export note as text file
export const exportNoteAsText = (note) => {
  const content = `Title: ${note.title}\n\n${note.content}\n\nTags: ${note.tags?.join(", ") || "None"}\nCreated: ${new Date(note.createdAt).toLocaleString()}\nUpdated: ${new Date(note.updatedAt).toLocaleString()}`;
  
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${note.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export all notes as text file
export const exportAllNotesAsText = (notes) => {
  let content = "=== ALL NOTES EXPORT ===\n\n";
  
  notes.forEach((note, index) => {
    content += `\n--- Note ${index + 1} ---\n`;
    content += `Title: ${note.title}\n\n`;
    content += `${note.content}\n\n`;
    content += `Tags: ${note.tags?.join(", ") || "None"}\n`;
    content += `Created: ${new Date(note.createdAt).toLocaleString()}\n`;
    content += `Updated: ${new Date(note.updatedAt).toLocaleString()}\n`;
    content += `\n${"=".repeat(50)}\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `all_notes_${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export note as PDF (using browser print functionality)
export const exportNoteAsPDF = (note) => {
  const printWindow = window.open("", "_blank");
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${note.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          .meta { color: #666; font-size: 14px; margin-top: 20px; }
          .tags { margin-top: 10px; }
          .tag { display: inline-block; background: #667eea; color: white; padding: 4px 10px; border-radius: 15px; margin-right: 5px; font-size: 12px; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${note.title}</h1>
        <div style="white-space: pre-wrap; margin-top: 20px;">${note.content.replace(/\n/g, "<br>")}</div>
        <div class="meta">
          <div class="tags">
            ${note.tags?.map(tag => `<span class="tag">#${tag}</span>`).join("") || "No tags"}
          </div>
          <p>Created: ${new Date(note.createdAt).toLocaleString()}</p>
          <p>Updated: ${new Date(note.updatedAt).toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

