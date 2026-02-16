import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="card" style={{ borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
      <div className="container row">
        <Link to="/" style={{ fontWeight: 800, letterSpacing: 0.2 }}>
          ServiceTrack
        </Link>

        <div style={{ marginLeft: "auto" }} className="row">
          {token ? (
            <>
              <span className="muted">
                {user
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
                  : "Logged in"}
              </span>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
