import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 460 }}>
        <h2 style={{ margin: 0 }}>Login</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          Welcome back — sign in to manage your vehicles, service records, and reminders.
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form" style={{ marginTop: 10 }}>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />

          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete="current-password"
          />

          <button className="btn" type="submit">
            Sign in
          </button>
        </form>

        <p style={{ marginTop: 12 }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
