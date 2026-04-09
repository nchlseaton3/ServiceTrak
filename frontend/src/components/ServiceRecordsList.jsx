export default function ServiceRecordsList({ records, loading, error }) {
  const numberFmt = new Intl.NumberFormat();
  const moneyFmt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  });

  if (loading) {
    return <p className="muted">Loading service records...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!records || records.length === 0) {
    return <p className="muted">No service records yet.</p>;
  }

  return (
    <div className="stack">
      {records.map((r) => (
        <div key={r.id} className="itemCard">
          <div className="itemRow">
            <div style={{ flex: 1 }}>
              <b>{r.title}</b>{" "}
              <span className="muted">({r.category || "—"})</span>

              <div className="muted" style={{ marginTop: 6 }}>
                <div>Date: {r.service_date}</div>
                {r.mileage !== null && r.mileage !== undefined && (
                  <div>Mileage: {numberFmt.format(r.mileage)}</div>
                )}
                {r.cost !== null && r.cost !== undefined && (
                  <div>Cost: {moneyFmt.format(Number(r.cost))}</div>
                )}
              </div>

              {r.notes && <p style={{ marginTop: 8 }}>{r.notes}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}