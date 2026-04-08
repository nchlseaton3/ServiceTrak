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
            </div>

            <div className="vehicle-card-actions">
              <Link className="btn btn-secondary" to={`/vehicles/${vehicle.id}`}>
                Open
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}