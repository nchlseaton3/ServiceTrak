import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./ServiceRecordAttachments.css";

export default function ServiceRecordAttachments({ recordId, token }) {
  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function loadAttachments() {
    setError("");
    setLoading(true);
    try {
      const data = await api.listServiceRecordAttachments(token, recordId);
      setAttachments(data.attachments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  async function handleUpload(e) {
    e.preventDefault();
    setError("");

    if (!selectedFile) {
      setError("Please choose a file first.");
      return;
    }

    setUploading(true);
    try {
      await api.uploadServiceRecordAttachment(token, recordId, selectedFile);
      setSelectedFile(null);
      await loadAttachments();

      const fileInput = document.getElementById(`attachment-file-${recordId}`);
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(attachmentId) {
    if (!confirm("Delete this attachment?")) return;
    setError("");

    try {
      await api.deleteServiceRecordAttachment(token, attachmentId);
      await loadAttachments();
    } catch (err) {
      setError(err.message);
    }
  }

  function isImage(fileType = "") {
    return fileType.startsWith("image/");
  }

  return (
    <div className="stack" style={{ gap: 10, marginTop: 12 }}>
      <div>
        <p className="small muted" style={{ margin: 0 }}>
          Attach receipts, invoices, photos, or PDFs.
        </p>
      </div>

      {error && <p className="error">{error}</p>}

      <form
        className="row"
        style={{ gap: 8, alignItems: "center" }}
        onSubmit={handleUpload}
      >
        <input
          id={`attachment-file-${recordId}`}
          className="input"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <button className="btn" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <p className="muted">No attachments yet.</p>
      ) : (
        <div className="stack">
          {attachments.map((a) => (
            <div key={a.id} className="itemCard">
              <div className="attachment-card">
                {/* LEFT SIDE */}
                <div className="attachment-left">
                  <b>{a.file_name}</b>

                  <div className="muted" style={{ marginTop: 6 }}>
                    {a.file_type || "Unknown file type"}
                  </div>

                  {isImage(a.file_type) && (
                    <div className="attachment-image">
                      <img src={a.file_url} alt={a.file_name} />
                    </div>
                  )}

                  {!isImage(a.file_type) && (
                    <p style={{ marginTop: 10, marginBottom: 0 }}>
                      <a href={a.file_url} target="_blank" rel="noreferrer">
                        Open attachment
                      </a>
                    </p>
                  )}
                </div>

                {/* RIGHT SIDE */}
                <div className="attachment-actions">
                  <a
                    className="btn btn-secondary"
                    href={a.file_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>

                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => handleDelete(a.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
