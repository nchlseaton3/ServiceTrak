import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContexts";
import { api } from "../../services/api";
import VehicleList from "../../components/Vehicles/VehicleList";

export default function Vehicles() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadVehicles() {
    setError("");
    setLoading(true);
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
    loadVehicles();
  }, []);

  return (
    <div className="container stack">
      <div className="card">
        <h2>My Vehicles</h2>
        <p className="muted">View and manage all of your saved vehicles.</p>
      </div>

      <VehicleList vehicles={vehicles} loading={loading} error={error} />
    </div>
  );
}