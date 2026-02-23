import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { api } from "../services/api";

export default function Dashboard() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nickname: "",
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    engine: "",
  });

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

  async function handleDecodeVin() {
    setError("");

    const vin = form.vin.trim().toUpperCase();
    if (!vin) return setError("Please enter a VIN.");
    if (vin.length !== 17) return setError("VIN must be 17 characters.");

    try {
      const data = await api.decodeVinPreview(token, vin);
      const d = data.decoded || {};

      setForm((p) => ({
        ...p,
        vin,
        year: d.year ?? p.year,
        make: d.make ?? p.make,
        model: d.model ?? p.model,
        trim: d.trim ?? p.trim,
        engine: d.engine ?? p.engine,
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    const payload = {
      nickname: form.nickname.trim() || null,
      vin: form.vin.trim() ? form.vin.trim().toUpperCase() : null,
      year: form.year === "" ? null : Number(form.year),
      make: form.make.trim() || null,
      model: form.model.trim() || null,
      trim: form.trim.trim() || null,
      engine: form.engine.trim() || null,
    };

    // Optional: match backend VIN validation
    if (payload.vin && payload.vin.length !== 17) {
      setError("VIN must be 17 characters.");
      return;
    }

    try {
      await api.createVehicle(token, payload);

      setForm({
        nickname: "",
        vin: "",
        year: "",
        make: "",
        model: "",
        trim: "",
        engine: "",
      });

      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function update(key, value) {
  setForm((p) => ({ ...p, [key]: value }));
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
            onChange={(e) => update("nickname", e.target.value)}
            placeholder="Nickname (ex: Prelude)"
          />

          <div className="row" style={{ alignItems: "center" }}>
            <input
              className="input"
              value={form.vin}
              onChange={(e) => update("vin", e.target.value)}
              placeholder="VIN (17 characters)"
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleDecodeVin}
            >
              Decode VIN
            </button>
          </div>

          <p className="small muted" style={{ margin: 0 }}>
            Tip: Decode VIN to auto-fill details, or enter them manually below.
          </p>

          <div className="row">
            <input
              className="input"
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
              placeholder="Year"
              inputMode="numeric"
              style={{ flex: 1 }}
            />
            <input
              className="input"
              value={form.make}
              onChange={(e) => update("make", e.target.value)}
              placeholder="Make"
              style={{ flex: 1 }}
            />
          </div>

          <div className="row">
            <input
              className="input"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              placeholder="Model"
              style={{ flex: 1 }}
            />
            <input
              className="input"
              value={form.trim}
              onChange={(e) => update("trim", e.target.value)}
              placeholder="Trim"
              style={{ flex: 1 }}
            />
          </div>

          <input
            className="input"
            value={form.engine}
            onChange={(e) => update("engine", e.target.value)}
            placeholder="Engine"
          />

          <button className="btn" type="submit">
            Add Vehicle
          </button>
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
                    — {v.year || "Year?"} {v.make || ""} {v.model || ""} (
                    {v.vin || "No VIN"})
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
