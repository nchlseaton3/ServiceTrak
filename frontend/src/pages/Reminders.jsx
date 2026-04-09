import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { api } from "../services/api";
import RemindersList from "../components/Reminders/RemindersList";
import "../components/Reminders/Reminders.css";

export default function Reminders() {
  const { token } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReminders() {
    setError("");
    setLoading(true);

    try {
      const data = await api.listReminders(token);
      setReminders(data.reminders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReminders();
  }, []);

  return (
    <div className="container reminders-page">
      <div className="card">
        <h2>Reminders</h2>
        <p className="muted">
          View all maintenance reminders across your vehicles.
        </p>
      </div>

      <RemindersList reminders={reminders} loading={loading} error={error} />
    </div>
  );
}