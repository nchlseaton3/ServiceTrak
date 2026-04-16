import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./ServiceRecordAttachments.css";

export default function ServiceRecordAttachmentList({ recordId, token }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, [recordId]);

  function isImage(fileType = "") {
    return fileType.startsWith("image/");
  }

  if (loading) {
    return <p className="small muted">Loading attachments...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!attachments.length) {
    return null;
  }

  return (
    <div className="stack" style={{ gap: 10, marginTop: 12 }}>
      <p className="small muted" style={{ margin: 0 }}>
        Attachments
      </p>

      {attachments.map((a) => (
        <div key={a.id} className="itemCard">
          <div className="attachment-card">
            <div className="attachment-left">
              <b>{a.file_name}</b>

              <div className="muted" style={{ marginTop: 6 }}>
                {a.file_type || "Unknown file type"}
              </div>

              {isImage(a.file_type) ? (
                <div className="attachment-image">
                  <img src={a.file_url} alt={a.file_name} />
                </div>
              ) : (
                <p style={{ marginTop: 10, marginBottom: 0 }}>
                  <a href={a.file_url} target="_blank" rel="noreferrer">
                    Open attachment
                  </a>
                </p>
              )}
            </div>

            <div className="attachment-actions">
              <a
                className="btn btn-secondary"
                href={a.file_url}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}