import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
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
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>Register</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} placeholder="First name" />
        <input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} placeholder="Last name" />
        <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email" />
        <input value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Create account</button>
      </form>

      <p style={{ marginTop: 12 }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
