import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { api } from "../services/api";
import ServiceRecordsList from "../components/ServiceRecords/ServiceRecordsList";
import "../components/ServiceRecords/ServiceRecords.css";

export default function ServiceRecords() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get("vehicle_id");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRecords() {
    setError("");
    setLoading(true);

    try {
      const data = await api.listServiceRecords(
        token,
        vehicleId ? Number(vehicleId) : undefined
      );
      setRecords(data.service_records || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [vehicleId]);

  return (
    <div className="container service-records-page">
      <div className="card">
        <h2>Service Records</h2>
        <p className="muted">
          {vehicleId
            ? "Viewing service records for the selected vehicle."
            : "View all saved service history across your vehicles."}
        </p>
      </div>

      <ServiceRecordsList records={records} loading={loading} error={error} />
    </div>
  );
}