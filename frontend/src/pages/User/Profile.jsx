import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContexts";
import { api } from "../../services/api";

export default function Profile() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [status, setStatus] = useState({ error: "", success: "" });

  useEffect(() => {
    (async () => {
      setStatus({ error: "", success: "" });
      try {
        const data = await api.profile(token); // GET /auth/profile
        const u = data.user || {};
        setForm({
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          email: u.email || "",
        });
      } catch (err) {
        setStatus({ error: err.message, success: "" });
      }
    })();
  }, [token]);

  function update(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ error: "", success: "" });
    try {
      await api.updateProfile(token, form); // PUT /auth/update
      setStatus({ error: "", success: "Profile updated successfully." });
    } catch (err) {
      setStatus({ error: err.message, success: "" });
    }
  }

  return (
    <div className="profile-page">
      <div className="card profile-card">
        <h2 style={{ margin: 0 }}>Profile</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          Update your account information.
        </p>

        {status.error && <p className="error">{status.error}</p>}
        {status.success && <p>{status.success}</p>}

        <form
          className="form"
          onSubmit={handleSubmit}
          style={{ marginTop: 10 }}
        >
          <input
            className="input"
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            placeholder="First name"
          />

          <input
            className="input"
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            placeholder="Last name"
          />

          <input
            className="input"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Email"
          />

          <button className="btn" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
