import Loader from "../Loader/Loader";
import { Link } from "react-router-dom";

export default function VehicleList({ vehicles, loading, error }) {
  if (loading) {
    return <Loader text="Loading vehicles..." />;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!vehicles || vehicles.length === 0) {
    return <p className="muted">No vehicles yet.</p>;
  }

  return (
    <div className="vehicle-list">
      {vehicles.map((vehicle) => {
        const decoded =
          vehicle.is_decoded ?? (vehicle.year && vehicle.make && vehicle.model);

        return (
          <div key={vehicle.id} className="itemCard vehicle-card">
            <div className="vehicle-card-row">
              <div className="vehicle-card-info">
                <div>
                  <b>{vehicle.nickname || "Vehicle"}</b>
                </div>

                <div className="muted vehicle-meta">
                  {vehicle.year || "?"} {vehicle.make || ""}{" "}
                  {vehicle.model || ""}
                </div>

                <div className="muted vehicle-meta small">
                  VIN: {vehicle.vin || "None"}
                </div>

                <div className="vehicle-status-row">
                  <span
                    className={`status-pill ${
                      decoded ? "status-success" : "status-muted"
                    }`}
                  >
                    {decoded ? "Decoded" : "Not decoded"}
                  </span>

                  <span className="status-pill status-info">
                    Records: {vehicle.service_record_count ?? 0}
                  </span>

                  <span
                    className={`status-pill ${
                      (vehicle.open_reminder_count ?? 0) > 0
                        ? "status-warning"
                        : "status-success"
                    }`}
                  >
                    Reminders: {vehicle.open_reminder_count ?? 0} open
                  </span>

                  <span
                    className={`status-pill ${
                      vehicle.recall_checked_at
                        ? vehicle.recall_count > 0
                          ? "status-warning"
                          : "status-success"
                        : "status-muted"
                    }`}
                  >
                    Recalls:{" "}
                    {vehicle.recall_checked_at
                      ? `${vehicle.recall_count} found`
                      : "Not checked"}
                  </span>
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
        );
      })}
    </div>
  );
}
