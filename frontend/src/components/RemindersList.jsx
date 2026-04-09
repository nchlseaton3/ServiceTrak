export default function RemindersList({ reminders, loading, error }) {
  const numberFmt = new Intl.NumberFormat();

  if (loading) return <p className="muted">Loading reminders...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!reminders || reminders.length === 0) {
    return <p className="muted">No reminders yet.</p>;
  }

  return (
    <div className="reminders-list">
      {reminders.map((r) => (
        <div key={r.id} className="reminder-card">
          <div className="reminder-row">
            <div className="reminder-info">
              <b className={r.is_completed ? "reminder-complete" : ""}>
                {r.title}
              </b>

              <div className="muted reminder-meta">
                {r.due_date && <div>Due Date: {r.due_date}</div>}
                {r.due_mileage !== null && r.due_mileage !== undefined && (
                  <div>Due Mileage: {numberFmt.format(r.due_mileage)}</div>
                )}
              </div>

              {r.notes && <p className="reminder-notes">{r.notes}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}