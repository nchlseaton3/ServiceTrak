import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContexts";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showVehiclesMenu, setShowVehiclesMenu] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav
      className="card"
      style={{ borderRadius: 0, borderLeft: 0, borderRight: 0 }}
    >
      <div className="container row" style={{ alignItems: "center", gap: 16 }}>
        <Link to="/" style={{ fontWeight: 800, letterSpacing: 0.2 }}>
          ServiceTrak
        </Link>

        {token ? (
          <>
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setShowVehiclesMenu(true)}
              onMouseLeave={() => setShowVehiclesMenu(false)}
            >
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setShowVehiclesMenu((prev) => !prev)}
              >
                My Vehicles ▾
              </button>

              {showVehiclesMenu && (
                <div
                  className="card"
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    minWidth: 180,
                    zIndex: 20,
                    padding: 8,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <Link to="/vehicles" onClick={() => setShowVehiclesMenu(false)}>
                    View Vehicles
                  </Link>
                  <Link to="/vehicles/new" onClick={() => setShowVehiclesMenu(false)}>
                    Add Vehicle
                  </Link>
                  <Link to="/service-records" onClick={() => setShowVehiclesMenu(false)}>
                    Service Records
                  </Link>
                  <Link to="/reminders" onClick={() => setShowVehiclesMenu(false)}>
                    Reminders
                  </Link>
                </div>
              )}
            </div>

            <Link to="/profile">Profile</Link>

            <span className="muted" style={{ marginLeft: "auto" }}>
              {user
                ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
                : "Logged in"}
            </span>

            <button className="btn btn-secondary" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <div style={{ marginLeft: "auto" }} className="row">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}