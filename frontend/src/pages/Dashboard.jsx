import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { api } from "../services/api";

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDate(value) {
  const date = parseLocalDate(value);
  if (!date) return "No date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function vehicleLabel(vehicle) {
  if (!vehicle) return "Vehicle";
  return (
    vehicle.nickname ||
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "Vehicle"
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const [vehicleData, reminderData, serviceRecordData] = await Promise.all([
        api.listVehicles(token),
        api.listReminders(token),
        api.listServiceRecords(token),
      ]);

      setVehicles(vehicleData.vehicles || []);
      setReminders(reminderData.reminders || []);
      setServiceRecords(serviceRecordData.service_records || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboardData = useMemo(() => {
    const today = startOfToday();
    const openDateReminders = reminders.filter(
      (reminder) => !reminder.is_completed && reminder.due_date
    );

    const sortByDueDate = (a, b) =>
      parseLocalDate(a.due_date) - parseLocalDate(b.due_date);

    const overdueReminders = openDateReminders
      .filter((reminder) => parseLocalDate(reminder.due_date) < today)
      .sort(sortByDueDate);

    const upcomingReminders = openDateReminders
      .filter((reminder) => parseLocalDate(reminder.due_date) >= today)
      .sort(sortByDueDate);

    const mileageOnlyReminders = reminders.filter(
      (reminder) =>
        !reminder.is_completed && !reminder.due_date && reminder.due_mileage
    );

    const vehiclesWithRecalls = vehicles.filter(
      (vehicle) => (vehicle.recall_count || 0) > 0
    );
    const vehiclesNeverChecked = vehicles.filter(
      (vehicle) => !vehicle.recall_checked_at
    );
    const totalRecalls = vehicles.reduce(
      (sum, vehicle) => sum + (vehicle.recall_count || 0),
      0
    );

    return {
      upcomingReminders,
      overdueReminders,
      mileageOnlyReminders,
      recentServiceRecords: serviceRecords.slice(0, 5),
      vehiclesWithRecalls,
      vehiclesNeverChecked,
      totalRecalls,
    };
  }, [reminders, serviceRecords, vehicles]);

  if (loading) {
    return (
      <div className="container stack">
        <div className="card">
          <h1>Dashboard</h1>
          <p className="muted">Loading your vehicles and service activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container stack">
        <div className="card">
          <h1>Dashboard</h1>
          <p className="error">{error}</p>
          <button className="btn" type="button" onClick={loadDashboard}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container stack dashboard-page">
      <section className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">
            Track your fleet, upcoming work, recent service, and recall status.
          </p>
        </div>

        <div className="row">
          <Link className="btn" to="/vehicles/new">
            Add Vehicle
          </Link>
          <Link className="btn btn-secondary" to="/vehicles">
            View Vehicles
          </Link>
        </div>
      </section>

      <section className="dashboard-summary-grid">
        <Link className="dashboard-stat card" to="/vehicles">
          <span className="dashboard-stat-label">Vehicles</span>
          <strong>{vehicles.length}</strong>
          <span className="small muted">Saved in your garage</span>
        </Link>

        <Link className="dashboard-stat card" to="/reminders">
          <span className="dashboard-stat-label">Upcoming</span>
          <strong>{dashboardData.upcomingReminders.length}</strong>
          <span className="small muted">Open reminders with future dates</span>
        </Link>

        <Link className="dashboard-stat card dashboard-stat-alert" to="/reminders">
          <span className="dashboard-stat-label">Overdue</span>
          <strong>{dashboardData.overdueReminders.length}</strong>
          <span className="small muted">Open reminders past due</span>
        </Link>

        <Link className="dashboard-stat card" to="/vehicles">
          <span className="dashboard-stat-label">Recalls</span>
          <strong>{dashboardData.totalRecalls}</strong>
          <span className="small muted">
            Across {dashboardData.vehiclesWithRecalls.length} vehicle
            {dashboardData.vehiclesWithRecalls.length === 1 ? "" : "s"}
          </span>
        </Link>
      </section>

      {vehicles.length === 0 ? (
        <section className="card dashboard-empty">
          <h2>No vehicles yet</h2>
          <p className="muted">
            Add your first vehicle to start tracking service records, reminders,
            and recalls.
          </p>
          <Link className="btn" to="/vehicles/new">
            Add Vehicle
          </Link>
        </section>
      ) : (
        <section className="dashboard-two-column">
          <DashboardReminderList
            title="Upcoming Reminders"
            emptyText="No upcoming reminders with due dates."
            reminders={dashboardData.upcomingReminders.slice(0, 5)}
          />

          <DashboardReminderList
            title="Overdue Reminders"
            emptyText="No overdue reminders. Nice and tidy."
            reminders={dashboardData.overdueReminders.slice(0, 5)}
            isOverdue
          />
        </section>
      )}

      <section className="dashboard-two-column">
        <div className="card">
          <div className="dashboard-section-header">
            <h2>Recent Service Records</h2>
            <Link className="btn btn-secondary" to="/service-records">
              View All
            </Link>
          </div>

          {dashboardData.recentServiceRecords.length === 0 ? (
            <p className="muted">No service records yet.</p>
          ) : (
            <div className="dashboard-list">
              {dashboardData.recentServiceRecords.map((record) => (
                <Link
                  key={record.id}
                  className="dashboard-list-item"
                  to={`/vehicles/${record.vehicle_id}`}
                >
                  <div>
                    <strong>{record.title}</strong>
                    <p className="small muted">
                      {vehicleLabel(record.vehicle)} ·{" "}
                      {formatDate(record.service_date)}
                    </p>
                  </div>
                  {record.cost != null && (
                    <span className="dashboard-value">
                      ${Number(record.cost).toFixed(2)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="dashboard-section-header">
            <h2>Recall Summary</h2>
            <Link className="btn btn-secondary" to="/vehicles">
              Review
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <p className="muted">Add vehicles to track recall status.</p>
          ) : (
            <div className="dashboard-recall-stack">
              <div className="dashboard-recall-row">
                <span>Vehicles with recalls</span>
                <strong>{dashboardData.vehiclesWithRecalls.length}</strong>
              </div>
              <div className="dashboard-recall-row">
                <span>Total open recall count</span>
                <strong>{dashboardData.totalRecalls}</strong>
              </div>
              <div className="dashboard-recall-row">
                <span>Never checked</span>
                <strong>{dashboardData.vehiclesNeverChecked.length}</strong>
              </div>

              {dashboardData.vehiclesWithRecalls.length > 0 ? (
                <div className="dashboard-list">
                  {dashboardData.vehiclesWithRecalls.slice(0, 3).map((vehicle) => (
                    <Link
                      key={vehicle.id}
                      className="dashboard-list-item"
                      to={`/vehicles/${vehicle.id}`}
                    >
                      <span>{vehicleLabel(vehicle)}</span>
                      <span className="status-pill status-warning">
                        {vehicle.recall_count} recall
                        {vehicle.recall_count === 1 ? "" : "s"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="muted">No cached recalls found.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {dashboardData.mileageOnlyReminders.length > 0 && (
        <section className="card">
          <div className="dashboard-section-header">
            <h2>Mileage-Based Reminders</h2>
            <Link className="btn btn-secondary" to="/reminders">
              View All
            </Link>
          </div>
          <p className="muted">
            These reminders do not have due dates, so they are not counted as
            upcoming or overdue.
          </p>
          <div className="dashboard-list">
            {dashboardData.mileageOnlyReminders.slice(0, 5).map((reminder) => (
              <Link
                key={reminder.id}
                className="dashboard-list-item"
                to={`/vehicles/${reminder.vehicle_id}`}
              >
                <span>{reminder.title}</span>
                <span className="dashboard-value">
                  {Number(reminder.due_mileage).toLocaleString()} mi
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DashboardReminderList({ title, emptyText, reminders, isOverdue = false }) {
  return (
    <div className="card">
      <div className="dashboard-section-header">
        <h2>{title}</h2>
        <Link className="btn btn-secondary" to="/reminders">
          View All
        </Link>
      </div>

      {reminders.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <div className="dashboard-list">
          {reminders.map((reminder) => (
            <Link
              key={reminder.id}
              className="dashboard-list-item"
              to={`/vehicles/${reminder.vehicle_id}`}
            >
              <div>
                <strong>{reminder.title}</strong>
                <p className="small muted">
                  {vehicleLabel(reminder.vehicle)} · {formatDate(reminder.due_date)}
                </p>
              </div>
              <span
                className={`status-pill ${
                  isOverdue ? "status-warning" : "status-info"
                }`}
              >
                {isOverdue ? "Overdue" : "Upcoming"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
