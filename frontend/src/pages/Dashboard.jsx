import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="container stack">
      <div className="card">
        <h1>Dashboard</h1>
        <p className="muted">
          Welcome to ServiceTrak. Manage vehicles, service records, reminders,
          recalls, diagnostics, and attachments all in one place.
        </p>

        <div className="row" style={{ gap: 12, marginTop: 12 }}>
          <Link className="btn" to="/vehicles">
            View Vehicles
          </Link>
          <Link className="btn btn-secondary" to="/vehicles/new">
            Add Vehicle
          </Link>
        </div>
      </div>
    </div>
  );
}