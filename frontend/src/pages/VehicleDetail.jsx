import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { api } from "../services/api";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  const [recordForm, setRecordForm] = useState({
    title: "",
    category: "Maintenance",
    service_date: "",
    mileage: "",
    cost: "",
    notes: "",
  });

  const [reminders, setReminders] = useState([]);
  const [reminderForm, setReminderForm] = useState({
    title: "",
    due_date: "",
    due_mileage: "",
    notes: "",
  });

  async function loadVehicle() {
    const data = await api.getVehicle(token, id);
    setVehicle(data.vehicle);
  }

  async function loadRecords() {
    const data = await api.listServiceRecords(token, id);
    setRecords(data.service_records || []);
  }

  async function loadReminders() {
    const data = await api.listReminders(token, id);
    setReminders(data.reminders || []);
  }

  async function loadAll() {
    setError("");
    try {
      await Promise.all([loadVehicle(), loadRecords(), loadReminders()]);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDecode() {
    setError("");
    try {
      const data = await api.decodeVin(token, id);
      setVehicle(data.vehicle);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteVehicle() {
    if (
      !confirm(
        "Delete this vehicle? This will remove its records and reminders too.",
      )
    )
      return;
    setError("");
    try {
      await api.deleteVehicle(token, id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateRecord(e) {
    e.preventDefault();
    setError("");

    // Build payload with correct types
    const payload = {
      vehicle_id: Number(id),
      title: recordForm.title.trim(),
      category: recordForm.category.trim() || null,
      service_date: recordForm.service_date, // YYYY-MM-DD
      mileage: recordForm.mileage === "" ? null : Number(recordForm.mileage),
      cost: recordForm.cost === "" ? null : Number(recordForm.cost),
      notes: recordForm.notes.trim() || null,
    };

    try {
      await api.createServiceRecord(token, payload);
      setRecordForm({
        title: "",
        category: "Maintenance",
        service_date: "",
        mileage: "",
        cost: "",
        notes: "",
      });
      await loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteRecord(recordId) {
    if (!confirm("Delete this service record?")) return;
    setError("");
    try {
      await api.deleteServiceRecord(token, recordId);
      await loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateReminder(e) {
    e.preventDefault();
    setError("");

    const payload = {
      vehicle_id: Number(id),
      title: reminderForm.title.trim(),
      due_date: reminderForm.due_date || null,
      due_mileage:
        reminderForm.due_mileage === ""
          ? null
          : Number(reminderForm.due_mileage),
      notes: reminderForm.notes.trim() || null,
    };

    // Frontend validation: require due_date or due_mileage
    if (
      !payload.due_date &&
      (payload.due_mileage === null || Number.isNaN(payload.due_mileage))
    ) {
      setError("Please provide a due date or due mileage.");
      return;
    }

    try {
      await api.createReminder(token, payload);
      setReminderForm({ title: "", due_date: "", due_mileage: "", notes: "" });
      await loadReminders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleReminder(reminderId, currentValue) {
    setError("");
    try {
      await api.updateReminder(token, reminderId, {
        is_completed: !currentValue,
      });
      await loadReminders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteReminder(reminderId) {
    if (!confirm("Delete this reminder?")) return;
    setError("");
    try {
      await api.deleteReminder(token, reminderId);
      await loadReminders();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <p style={{ color: "crimson" }}>{error}</p>
      </div>
    );
  }

  if (!vehicle) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>
        {vehicle.nickname || "Vehicle"} (ID {vehicle.id})
      </h2>

      <div style={{ display: "grid", gap: 6 }}>
        <p>
          <b>VIN:</b> {vehicle.vin || "None"}
        </p>
        <p>
          <b>Decoded:</b> {vehicle.year || "?"} {vehicle.make || ""}{" "}
          {vehicle.model || ""} {vehicle.trim ? `(${vehicle.trim})` : ""}
        </p>
        <p>
          <b>Engine:</b> {vehicle.engine || "—"}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={handleDecode} disabled={!vehicle.vin}>
          Decode VIN
        </button>
        <button onClick={handleDeleteVehicle}>Delete Vehicle</button>
      </div>

      <hr style={{ margin: "18px 0" }} />

      {/* Service Records */}
      <section style={{ display: "grid", gap: 14 }}>
        <h3>Service Records</h3>

        <form
          onSubmit={handleCreateRecord}
          style={{ display: "grid", gap: 10, maxWidth: 520 }}
        >
          <input
            value={recordForm.title}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Title (ex: Oil Change)"
            required
          />

          <select
            value={recordForm.category}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, category: e.target.value }))
            }
          >
            <option>Maintenance</option>
            <option>Repair</option>
            <option>Inspection</option>
            <option>Other</option>
          </select>

          <input
            type="date"
            value={recordForm.service_date}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, service_date: e.target.value }))
            }
            required
          />

          <input
            value={recordForm.mileage}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, mileage: e.target.value }))
            }
            placeholder="Mileage (optional)"
            inputMode="numeric"
          />

          <input
            value={recordForm.cost}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, cost: e.target.value }))
            }
            placeholder="Cost (optional)"
            inputMode="decimal"
          />

          <textarea
            value={recordForm.notes}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Notes (optional)"
            rows={3}
          />

          <button type="submit">Add Service Record</button>
        </form>

        {records.length === 0 ? (
          <p>No service records yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {records.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <b>{r.title}</b>{" "}
                    <span style={{ opacity: 0.7 }}>({r.category || "—"})</span>
                    <div style={{ opacity: 0.85, marginTop: 4 }}>
                      <div>Date: {r.service_date}</div>
                      {r.mileage !== null && r.mileage !== undefined && (
                        <div>Mileage: {r.mileage}</div>
                      )}
                      {r.cost !== null && r.cost !== undefined && (
                        <div>Cost: ${r.cost}</div>
                      )}
                    </div>
                    {r.notes && <p style={{ marginTop: 8 }}>{r.notes}</p>}
                  </div>

                  <button onClick={() => handleDeleteRecord(r.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr style={{ margin: "18px 0" }} />

      {/* Reminders */}
      <section style={{ display: "grid", gap: 14 }}>
        <h3>Reminders</h3>

        <form
          onSubmit={handleCreateReminder}
          style={{ display: "grid", gap: 10, maxWidth: 520 }}
        >
          <input
            value={reminderForm.title}
            onChange={(e) =>
              setReminderForm((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Title (ex: Rotate tires)"
            required
          />

          <input
            type="date"
            value={reminderForm.due_date}
            onChange={(e) =>
              setReminderForm((p) => ({ ...p, due_date: e.target.value }))
            }
          />

          <input
            value={reminderForm.due_mileage}
            onChange={(e) =>
              setReminderForm((p) => ({ ...p, due_mileage: e.target.value }))
            }
            placeholder="Due mileage (optional)"
            inputMode="numeric"
          />

          <textarea
            value={reminderForm.notes}
            onChange={(e) =>
              setReminderForm((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Notes (optional)"
            rows={3}
          />

          <button type="submit">Add Reminder</button>

          <p style={{ margin: 0, opacity: 0.75, fontSize: 13 }}>
            Tip: Add a due date <b>or</b> due mileage (at least one is
            required).
          </p>
        </form>

        {reminders.length === 0 ? (
          <p>No reminders yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {reminders.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <b
                      style={{
                        textDecoration: r.is_completed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {r.title}
                    </b>

                    <div style={{ opacity: 0.85, marginTop: 6 }}>
                      {r.due_date && <div>Due Date: {r.due_date}</div>}
                      {r.due_mileage !== null &&
                        r.due_mileage !== undefined && (
                          <div>Due Mileage: {r.due_mileage}</div>
                        )}
                    </div>

                    {r.notes && <p style={{ marginTop: 8 }}>{r.notes}</p>}
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(r.id, r.is_completed)}
                    >
                      {r.is_completed ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReminder(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
