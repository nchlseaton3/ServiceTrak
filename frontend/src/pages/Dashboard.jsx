import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { api } from "../services/api";

export default function Dashboard() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ nickname: "", vin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listVehicles(token);
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createVehicle(token, form);
      setForm({ nickname: "", vin: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
        <form onSubmit={handleCreate} style={{ display: "grid", gap: 10 }}>
          <h3>Add Vehicle</h3>
          <input
            value={form.nickname}
            onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
            placeholder="Nickname (optional)"
          />
          <input
            value={form.vin}
            onChange={(e) => setForm((p) => ({ ...p, vin: e.target.value }))}
            placeholder="VIN (17 chars)"
          />
          <button type="submit">Add</button>
        </form>

        <div>
          <h3>Your Vehicles</h3>
          {loading ? (
            <p>Loading...</p>
          ) : vehicles.length === 0 ? (
            <p>No vehicles yet.</p>
          ) : (
            <ul>
              {vehicles.map((v) => (
                <li key={v.id}>
                  <Link to={`/vehicles/${v.id}`}>
                    {v.nickname || "Vehicle"} — {v.year || "Year?"} {v.make || ""} {v.model || ""} ({v.vin || "No VIN"})
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
