import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 460 }}>
        <h2 style={{ margin: 0 }}>Register</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          Create your account to start tracking vehicles, maintenance history, and reminders.
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form" style={{ marginTop: 10 }}>
          <input
            className="input"
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            placeholder="First name"
            autoComplete="given-name"
          />

          <input
            className="input"
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            placeholder="Last name"
            autoComplete="family-name"
          />

          <input
            className="input"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />

          <input
            className="input"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete="new-password"
          />

          <button className="btn" type="submit">
            Create account
          </button>
        </form>

        <p style={{ marginTop: 12 }}>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
