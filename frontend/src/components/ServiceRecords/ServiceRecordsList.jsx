import { Link } from "react-router-dom";
import ServiceRecordAttachments from "./ServiceRecordAttachments";
import ServiceRecordAttachmentList from "./ServiceRecordAttachmentList";

export default function ServiceRecordsList({ records, loading, error, token }) {
  const numberFmt = new Intl.NumberFormat();
  const moneyFmt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  });

  if (loading) return <p className="muted">Loading service records...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!records || records.length === 0) {
    return <p className="muted">No service records yet.</p>;
  }

  return (
    <div className="service-records-list">
      {records.map((r) => (
        <div key={r.id} className="service-record-card">
          <div className="service-record-row">
            <div className="service-record-info">
              <div>
                <b>{r.title}</b>{" "}
                <span className="muted">({r.category || "—"})</span>
              </div>

              {r.vehicle && (
                <div className="muted service-record-meta">
                  Vehicle: <b>{r.vehicle.nickname || "Vehicle"}</b>
                  {" — "}
                  {r.vehicle.year || "?"} {r.vehicle.make || ""}{" "}
                  {r.vehicle.model || ""}
                </div>
              )}

              <div className="muted service-record-meta">
                <div>Date: {r.service_date}</div>
                {r.mileage !== null && r.mileage !== undefined && (
                  <div>Mileage: {numberFmt.format(r.mileage)}</div>
                )}
                {r.cost !== null && r.cost !== undefined && (
                  <div>Cost: {moneyFmt.format(Number(r.cost))}</div>
                )}
              </div>

              {r.notes && <p className="service-record-notes">{r.notes}</p>}

              <ServiceRecordAttachmentList recordId={r.id} token={token} />
            </div>

            {r.vehicle && (
              <div className="service-record-actions">
                <Link
                  className="btn btn-secondary"
                  to={`/vehicles/${r.vehicle.id}`}
                  state={{ from: "service-records" }}
                >
                  Open Vehicle
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}