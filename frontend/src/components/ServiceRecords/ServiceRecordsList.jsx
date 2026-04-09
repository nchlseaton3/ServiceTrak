export default function ServiceRecordsList({ records, loading, error }) {
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
              <b>{r.title}</b>{" "}
              <span className="muted">({r.category || "—"})</span>

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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}