import { Link } from "react-router-dom";

export default function VehicleList({ vehicles, loading, error }) {
  if (loading) {
    return <p className="muted">Loading vehicles...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!vehicles || vehicles.length === 0) {
    return <p className="muted">No vehicles yet.</p>;
  }
  function isDecoded(vehicle) {
    return Boolean(vehicle.year && vehicle.make && vehicle.model);
  }
  return (
    <div className="vehicle-list">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="itemCard vehicle-card">
          <div className="vehicle-card-row">
            <div className="vehicle-card-info">
              <b>{vehicle.nickname || "Vehicle"}</b>

              <div className="muted vehicle-meta">
                {vehicle.year || "?"} {vehicle.make || ""} {vehicle.model || ""}
              </div>

              <div className="muted vehicle-meta">
                VIN: {vehicle.vin || "None"}
              </div>
              <div className="vehicle-status-row">
                <span
                  className={`status-pill ${isDecoded(vehicle) ? "status-success" : "status-muted"}`}
                >
                  {isDecoded(vehicle) ? "Decoded" : "Not decoded"}
                </span>

                <span className="status-pill status-muted">
                  Recalls: Not checked
                </span>

                <span className="status-pill status-muted">Reminders: --</span>
              </div>
            </div>

            <div className="vehicle-card-actions">
              <Link
                className="btn btn-secondary"
                to={`/vehicles/${vehicle.id}`}
                state={{ from: "vehicles" }}
              >
                Open
              </Link>
              <Link
                className="btn btn-secondary"
                to={`/service-records?vehicle_id=${vehicle.id}`}
              >
                Records
              </Link>

              <Link
                className="btn btn-secondary"
                to={`/reminders?vehicle_id=${vehicle.id}`}
              >
                Reminders
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
