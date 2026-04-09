export default function RemindersList({ reminders, loading, error }) {
  const numberFmt = new Intl.NumberFormat();

  if (loading) {
    return <p className="muted">Loading reminders...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!reminders || reminders.length === 0) {
    return <p className="muted">No reminders yet.</p>;
  }

  return (
    <div className="stack">
      {reminders.map((r) => (
        <div key={r.id} className="itemCard">
          <div className="itemRow">
            <div style={{ flex: 1 }}>
              <b
                style={{
                  textDecoration: r.is_completed ? "line-through" : "none",
                }}
              >
                {r.title}
              </b>

              <div className="muted" style={{ marginTop: 6 }}>
                {r.due_date && <div>Due Date: {r.due_date}</div>}
                {r.due_mileage !== null && r.due_mileage !== undefined && (
                  <div>Due Mileage: {numberFmt.format(r.due_mileage)}</div>
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