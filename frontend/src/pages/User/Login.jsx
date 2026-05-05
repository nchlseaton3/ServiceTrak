import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/vehicles");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />
          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="btn-spinner" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          {isSubmitting && (
            <p className="small muted demo-note">
              Waking up backend... this may take a few seconds on first load.
            </p>
          )}
        </form>

        <p className="auth-link-row">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
