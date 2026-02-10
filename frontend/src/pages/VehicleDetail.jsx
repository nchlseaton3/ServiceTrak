import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { api } from "../services/api";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const data = await api.getVehicle(token, id);
      setVehicle(data.vehicle);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
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

  async function handleDelete() {
    if (!confirm("Delete this vehicle?")) return;
    setError("");
    try {
      await api.deleteVehicle(token, id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div style={{ padding: 16 }}><p style={{ color: "crimson" }}>{error}</p></div>;
  if (!vehicle) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{vehicle.nickname || "Vehicle"} (ID {vehicle.id})</h2>

      <p><b>VIN:</b> {vehicle.vin || "None"}</p>
      <p><b>Decoded:</b> {vehicle.year || "?"} {vehicle.make || ""} {vehicle.model || ""} {vehicle.trim ? `(${vehicle.trim})` : ""}</p>
      <p><b>Engine:</b> {vehicle.engine || "—"}</p>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={handleDecode} disabled={!vehicle.vin}>Decode VIN</button>
        <button onClick={handleDelete}>Delete Vehicle</button>
      </div>

      <hr style={{ margin: "16px 0" }} />
      <p>Next: we’ll add Service Records + Reminders UI here.</p>
    </div>
  );
}
