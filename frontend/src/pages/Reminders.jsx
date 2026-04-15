import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { api } from "../services/api";
import RemindersList from "../components/Reminders/RemindersList";
import "../components/Reminders/Reminders.css";

export default function Reminders() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get("vehicle_id");

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReminders() {
    setError("");
    setLoading(true);

    try {
      const data = await api.listReminders(
        token,
        vehicleId ? Number(vehicleId) : undefined
      );
      setReminders(data.reminders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReminders();
  }, [vehicleId]);

  return (
    <div className="container reminders-page">
      <div className="card">
        <h2>Reminders</h2>
        <p className="muted">
          {vehicleId
            ? "Viewing reminders for the selected vehicle."
            : "View all maintenance reminders across your vehicles."}
        </p>
      </div>

      <RemindersList reminders={reminders} loading={loading} error={error} />
    </div>
  );
}