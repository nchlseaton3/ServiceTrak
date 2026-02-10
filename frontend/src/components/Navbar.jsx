import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #ddd" }}>
      <Link to="/">ServiceTrack</Link>

      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        {token ? (
          <>
            <span style={{ opacity: 0.8 }}>
              {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email : "Logged in"}
            </span>
            <button
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
    </nav>
  );
}
