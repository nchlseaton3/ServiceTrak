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
    <div className="container stack">
      <h2 style={{ margin: 0 }}>Dashboard</h2>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Add Vehicle</h3>
        <form className="form" onSubmit={handleCreate}>
          <input
            className="input"
            value={form.nickname}
            onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
            placeholder="Nickname (optional)"
          />
          <input
            className="input"
            value={form.vin}
            onChange={(e) => setForm((p) => ({ ...p, vin: e.target.value }))}
            placeholder="VIN (17 chars)"
          />
          <button className="btn" type="submit">Add</button>
        </form>
      </div>

      <div className="card">
        <h3>Your Vehicles</h3>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : vehicles.length === 0 ? (
          <p className="muted">No vehicles yet — add one above.</p>
        ) : (
          <ul className="list">
            {vehicles.map((v) => (
              <li key={v.id}>
                <Link to={`/vehicles/${v.id}`}>
                  <b>{v.nickname || "Vehicle"}</b>{" "}
                  <span className="muted">
                    — {v.year || "Year?"} {v.make || ""} {v.model || ""} ({v.vin || "No VIN"})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
