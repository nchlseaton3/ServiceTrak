import { useState } from "react";
import { api } from "../services/api";

export default function AddVehicleForm({ token, onCreated }) {
  const [form, setForm] = useState({
    nickname: "",
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    engine: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDecodeVin() {
    setError("");
    const vin = form.vin.trim().toUpperCase();

    if (!vin) {
      setError("Please enter a VIN.");
      return;
    }

    if (vin.length !== 17) {
      setError("VIN must be 17 characters.");
      return;
    }

    try {
      const data = await api.decodeVinPreview(token, vin);
      const d = data.decoded || {};

      setForm((prev) => ({
        ...prev,
        vin,
        year: d.year ?? prev.year,
        make: d.make ?? prev.make,
        model: d.model ?? prev.model,
        trim: d.trim ?? prev.trim,
        engine: d.engine ?? prev.engine,
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      nickname: form.nickname.trim() || null,
      vin: form.vin.trim() ? form.vin.trim().toUpperCase() : null,
      year: form.year === "" ? null : Number(form.year),
      make: form.make.trim() || null,
      model: form.model.trim() || null,
      trim: form.trim.trim() || null,
      engine: form.engine.trim() || null,
    };

    if (payload.vin && payload.vin.length !== 17) {
      setError("VIN must be 17 characters.");
      setLoading(false);
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
      if (onCreated) await onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Add Vehicle</h2>
      {error && <p className="error">{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
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
          Decode VIN to auto-fill details, or enter them manually below.
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

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Vehicle"}
        </button>
      </form>
    </div>
  );
}