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

  async function loadVehicle() {
    const data = await api.getVehicle(token, id);
    setVehicle(data.vehicle);
  }

  async function loadRecords() {
    const data = await api.listServiceRecords(token, id);
    setRecords(data.service_records || []);
  }

  async function loadAll() {
    setError("");
    try {
      await Promise.all([loadVehicle(), loadRecords()]);
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
    if (!confirm("Delete this vehicle? This will remove its records and reminders too.")) return;
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
      <h2>{vehicle.nickname || "Vehicle"} (ID {vehicle.id})</h2>

      <div style={{ display: "grid", gap: 6 }}>
        <p><b>VIN:</b> {vehicle.vin || "None"}</p>
        <p><b>Decoded:</b> {vehicle.year || "?"} {vehicle.make || ""} {vehicle.model || ""} {vehicle.trim ? `(${vehicle.trim})` : ""}</p>
        <p><b>Engine:</b> {vehicle.engine || "—"}</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={handleDecode} disabled={!vehicle.vin}>Decode VIN</button>
        <button onClick={handleDeleteVehicle}>Delete Vehicle</button>
      </div>

      <hr style={{ margin: "18px 0" }} />

      {/* Service Records */}
      <section style={{ display: "grid", gap: 14 }}>
        <h3>Service Records</h3>

        <form onSubmit={handleCreateRecord} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <input
            value={recordForm.title}
            onChange={(e) => setRecordForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Title (ex: Oil Change)"
            required
          />

          <select
            value={recordForm.category}
            onChange={(e) => setRecordForm((p) => ({ ...p, category: e.target.value }))}
          >
            <option>Maintenance</option>
            <option>Repair</option>
            <option>Inspection</option>
            <option>Other</option>
          </select>

          <input
            type="date"
            value={recordForm.service_date}
            onChange={(e) => setRecordForm((p) => ({ ...p, service_date: e.target.value }))}
            required
          />

          <input
            value={recordForm.mileage}
            onChange={(e) => setRecordForm((p) => ({ ...p, mileage: e.target.value }))}
            placeholder="Mileage (optional)"
            inputMode="numeric"
          />

          <input
            value={recordForm.cost}
            onChange={(e) => setRecordForm((p) => ({ ...p, cost: e.target.value }))}
            placeholder="Cost (optional)"
            inputMode="decimal"
          />

          <textarea
            value={recordForm.notes}
            onChange={(e) => setRecordForm((p) => ({ ...p, notes: e.target.value }))}
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
              <div key={r.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <b>{r.title}</b> <span style={{ opacity: 0.7 }}>({r.category || "—"})</span>
                    <div style={{ opacity: 0.85, marginTop: 4 }}>
                      <div>Date: {r.service_date}</div>
                      {r.mileage !== null && r.mileage !== undefined && <div>Mileage: {r.mileage}</div>}
                      {r.cost !== null && r.cost !== undefined && <div>Cost: ${r.cost}</div>}
                    </div>
                    {r.notes && <p style={{ marginTop: 8 }}>{r.notes}</p>}
                  </div>

                  <button onClick={() => handleDeleteRecord(r.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
