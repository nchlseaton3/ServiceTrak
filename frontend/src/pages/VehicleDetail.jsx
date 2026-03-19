import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { api } from "../services/api";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [error, setError] = useState("");
  const [recalls, setRecalls] = useState([]);
  const [recallsLoaded, setRecallsLoaded] = useState(false);
  const [recallsLoading, setRecallsLoading] = useState(false);
  const [showRecalls, setShowRecalls] = useState(true);
  const [showServiceRecords, setShowServiceRecords] = useState(true);
  const [showReminders, setShowReminders] = useState(true);

  const [recordForm, setRecordForm] = useState({
    title: "",
    category: "Maintenance",
    service_date: "",
    mileage: "",
    cost: "",
    notes: "",
  });

  const [reminderForm, setReminderForm] = useState({
    title: "",
    due_date: "",
    due_mileage: "",
    notes: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    nickname: "",
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    engine: "",
  });

  const [editRecordForm, setEditRecordForm] = useState({
    title: "",
    category: "Maintenance",
    service_date: "",
    mileage: "",
    cost: "",
    notes: "",
  });

  const [editReminderForm, setEditReminderForm] = useState({
    title: "",
    due_date: "",
    due_mileage: "",
    notes: "",
  });

  const numberFmt = new Intl.NumberFormat();
  const moneyFmt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  });

  async function loadVehicle() {
    const data = await api.getVehicle(token, id);
    setVehicle(data.vehicle);
    const v = data.vehicle;
    setVehicle(v);
    setVehicleForm({
      nickname: v.nickname || "",
      vin: v.vin || "",
      year: v.year ?? "",
      make: v.make || "",
      model: v.model || "",
      trim: v.trim || "",
      engine: v.engine || "",
    });
  }

  async function loadRecords() {
    const data = await api.listServiceRecords(token, id);
    setRecords(data.service_records || []);
  }

  async function loadReminders() {
    const data = await api.listReminders(token, id);
    setReminders(data.reminders || []);
  }

  async function loadAll() {
    setError("");
    try {
      await Promise.all([loadVehicle(), loadRecords(), loadReminders()]);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
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

  async function handleDeleteVehicle() {
    if (
      !confirm(
        "Delete this vehicle? This will remove its records and reminders too.",
      )
    )
      return;
    setError("");
    try {
      await api.deleteVehicle(token, id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateRecord(e) {
    e.preventDefault();
    setError("");

    const payload = {
      vehicle_id: Number(id),
      title: recordForm.title.trim(),
      category: recordForm.category.trim() || null,
      service_date: recordForm.service_date,
      mileage: recordForm.mileage === "" ? null : Number(recordForm.mileage),
      cost: recordForm.cost === "" ? null : Number(recordForm.cost),
      notes: recordForm.notes.trim() || null,
    };

    try {
      await api.createServiceRecord(token, payload);
      setRecordForm({
        title: "",
        category: "Maintenance",
        service_date: "",
        mileage: "",
        cost: "",
        notes: "",
      });
      await loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteRecord(recordId) {
    if (!confirm("Delete this service record?")) return;
    setError("");
    try {
      await api.deleteServiceRecord(token, recordId);
      await loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateReminder(e) {
    e.preventDefault();
    setError("");

    const payload = {
      vehicle_id: Number(id),
      title: reminderForm.title.trim(),
      due_date: reminderForm.due_date || null,
      due_mileage:
        reminderForm.due_mileage === ""
          ? null
          : Number(reminderForm.due_mileage),
      notes: reminderForm.notes.trim() || null,
    };

    if (
      !payload.due_date &&
      (payload.due_mileage === null || Number.isNaN(payload.due_mileage))
    ) {
      setError("Please provide a due date or due mileage.");
      return;
    }

    try {
      await api.createReminder(token, payload);
      setReminderForm({ title: "", due_date: "", due_mileage: "", notes: "" });
      await loadReminders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleReminder(reminderId, currentValue) {
    setError("");
    try {
      await api.updateReminder(token, reminderId, {
        is_completed: !currentValue,
      });
      await loadReminders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteReminder(reminderId) {
    if (!confirm("Delete this reminder?")) return;
    setError("");
    try {
      await api.deleteReminder(token, reminderId);
      await loadReminders();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container">
        <p className="muted">Loading...</p>
      </div>
    );
  }

  function updateVehicleForm(key, value) {
    setVehicleForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSaveVehicle(e) {
    e.preventDefault();
    setError("");

    // Build payload (only send normalized/typed values)
    const payload = {
      nickname: vehicleForm.nickname.trim() || null,
      vin: vehicleForm.vin.trim() ? vehicleForm.vin.trim().toUpperCase() : null,
      year: vehicleForm.year === "" ? null : Number(vehicleForm.year),
      make: vehicleForm.make.trim() || null,
      model: vehicleForm.model.trim() || null,
      trim: vehicleForm.trim.trim() || null,
      engine: vehicleForm.engine.trim() || null,
    };

    // Optional: basic VIN validation (matches backend)
    if (payload.vin && payload.vin.length !== 17) {
      setError("VIN must be 17 characters.");
      return;
    }

    try {
      const data = await api.updateVehicle(token, id, payload);
      setVehicle(data.vehicle);
      setIsEditingVehicle(false);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCancelVehicleEdit() {
    // reset form back to current vehicle values
    setVehicleForm({
      nickname: vehicle.nickname || "",
      vin: vehicle.vin || "",
      year: vehicle.year ?? "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      trim: vehicle.trim || "",
      engine: vehicle.engine || "",
    });
    setIsEditingVehicle(false);
    setError("");
  }

  function startEditRecord(r) {
    const rid = Number(r.id);
    if (editingRecordId === rid) return setEditingRecordId(null);

    setEditingRecordId(rid);
    setEditRecordForm({
      title: r.title || "",
      category: r.category || "Maintenance",
      service_date: r.service_date || "",
      mileage: r.mileage ?? "",
      cost: r.cost ?? "",
      notes: r.notes || "",
    });
  }

  async function handleUpdateRecordManual(recordId) {
    setError("");

    const payload = {
      title: editRecordForm.title.trim(),
      category: editRecordForm.category.trim() || null,
      service_date: editRecordForm.service_date,
      mileage:
        editRecordForm.mileage === "" ? null : Number(editRecordForm.mileage),
      cost: editRecordForm.cost === "" ? null : Number(editRecordForm.cost),
      notes: editRecordForm.notes.trim() || null,
    };

    try {
      await api.updateServiceRecord(token, recordId, payload);
      setEditingRecordId(null);
      await loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEditRecord() {
    setEditingRecordId(null);
  }

  function startEditReminder(r) {
    setEditingReminderId(Number(r.id));
    setEditReminderForm({
      title: r.title || "",
      due_date: r.due_date || "",
      due_mileage: r.due_mileage ?? "",
      notes: r.notes || "",
    });
  }

  async function handleUpdateReminder(e) {
    e.preventDefault();
    setError("");

    const payload = {
      title: editReminderForm.title.trim(),
      due_date: editReminderForm.due_date || null,
      due_mileage:
        editReminderForm.due_mileage === ""
          ? null
          : Number(editReminderForm.due_mileage),
      notes: editReminderForm.notes.trim() || null,
    };

    // require due_date or due_mileage
    if (
      !payload.due_date &&
      (payload.due_mileage === null || Number.isNaN(payload.due_mileage))
    ) {
      setError("Please provide a due date or due mileage.");
      return;
    }

    try {
      await api.updateReminder(token, editingReminderId, payload);
      setEditingReminderId(null);
      await loadReminders();
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEditReminder() {
    setEditingReminderId(null);
  }

  async function handleLookupRecalls() {
    setError("");
    setRecallsLoading(true);

    try {
      const data = await api.getVehicleRecalls(token, id);
      setRecalls(data.recalls || []);
      setRecallsLoaded(true);
      setShowRecalls(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setRecallsLoading(false);
    }
  }

  return (
    <div className="container stack">
      <div className="card">
        <h2 style={{ margin: 0 }}>
          {vehicle.nickname || "Vehicle"}{" "}
          <span className="muted">({vehicle.model})</span>
        </h2>

        {isEditingVehicle && (
          <>
            <hr className="hr" />
            <form className="form" onSubmit={handleSaveVehicle}>
              <input
                className="input"
                value={vehicleForm.nickname}
                onChange={(e) => updateVehicleForm("nickname", e.target.value)}
                placeholder="Nickname (optional)"
              />

              <input
                className="input"
                value={vehicleForm.vin}
                onChange={(e) => updateVehicleForm("vin", e.target.value)}
                placeholder="VIN (17 chars)"
              />

              <input
                className="input"
                value={vehicleForm.year}
                onChange={(e) => updateVehicleForm("year", e.target.value)}
                placeholder="Year"
                inputMode="numeric"
              />

              <input
                className="input"
                value={vehicleForm.make}
                onChange={(e) => updateVehicleForm("make", e.target.value)}
                placeholder="Make"
              />

              <input
                className="input"
                value={vehicleForm.model}
                onChange={(e) => updateVehicleForm("model", e.target.value)}
                placeholder="Model"
              />

              <input
                className="input"
                value={vehicleForm.trim}
                onChange={(e) => updateVehicleForm("trim", e.target.value)}
                placeholder="Trim"
              />

              <input
                className="input"
                value={vehicleForm.engine}
                onChange={(e) => updateVehicleForm("engine", e.target.value)}
                placeholder="Engine"
              />

              <div className="row">
                <button className="btn" type="submit">
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={handleCancelVehicleEdit}
                >
                  Cancel
                </button>
              </div>

              <p className="small muted" style={{ margin: 0 }}>
                Tip: If VIN decode doesn’t provide the engine (common on some
                vehicles), you can enter it manually here.
              </p>
            </form>
          </>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <button
            className="btn"
            type="button"
            onClick={handleDecode}
            disabled={!vehicle.vin}
          >
            Decode VIN
          </button>

          {!isEditingVehicle ? (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setIsEditingVehicle(true)}
            >
              Edit Vehicle
            </button>
          ) : null}

          <button
            className="btn btn-danger"
            type="button"
            onClick={handleDeleteVehicle}
          >
            Delete Vehicle
          </button>
        </div>
      </div>

      <div className="card">
        <div
          className="row"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Recall Lookup</h3>
            <p
              className="small muted"
              style={{ marginTop: 6, marginBottom: 0 }}
            >
              Check for open recalls using the vehicle's year, make, and model.
            </p>
          </div>

          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn"
              type="button"
              onClick={handleLookupRecalls}
              disabled={recallsLoading}
            >
              {recallsLoading ? "Checking..." : "Check Recalls"}
            </button>

            {recallsLoaded && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setShowRecalls((prev) => !prev)}
              >
                {showRecalls ? "Hide Recalls" : "Show Recalls"}
              </button>
            )}
          </div>
        </div>

        <hr className="hr" />

        {!recallsLoaded ? (
          <p className="muted">No recall search run yet.</p>
        ) : !showRecalls ? (
          <p className="muted">
            Recall results hidden. {recalls.length} result
            {recalls.length === 1 ? "" : "s"} loaded.
          </p>
        ) : recalls.length === 0 ? (
          <p className="muted">No recalls found for this vehicle.</p>
        ) : (
          <div className="stack">
            {recalls.map((recall, index) => (
              <div key={recall.campaign_number || index} className="itemCard">
                <b>{recall.component || "Recall"}</b>

                {recall.campaign_number && (
                  <div className="muted" style={{ marginTop: 6 }}>
                    Campaign: {recall.campaign_number}
                  </div>
                )}

                {recall.report_date && (
                  <div className="muted">Report Date: {recall.report_date}</div>
                )}

                {recall.summary && (
                  <p style={{ marginTop: 8 }}>{recall.summary}</p>
                )}

                {recall.remedy && (
                  <>
                    <p style={{ marginTop: 8, marginBottom: 4 }}>
                      <b>Remedy:</b>
                    </p>
                    <p style={{ marginTop: 0 }}>{recall.remedy}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div
          className="row"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <h3 style={{ margin: 0 }}>Service Records</h3>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setShowServiceRecords((prev) => !prev)}
          >
            {showServiceRecords ? "Hide Records" : "Show Records"}
          </button>
        </div>

        <form className="form" onSubmit={handleCreateRecord}>
          <input
            className="input"
            value={recordForm.title}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Title (ex: Oil Change)"
            required
          />

          <select
            className="select"
            value={recordForm.category}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, category: e.target.value }))
            }
          >
            <option>Maintenance</option>
            <option>Repair</option>
            <option>Inspection</option>
            <option>Other</option>
          </select>

          <input
            className="input"
            type="date"
            value={recordForm.service_date}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, service_date: e.target.value }))
            }
            required
          />

          <input
            className="input"
            value={recordForm.mileage}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, mileage: e.target.value }))
            }
            placeholder="Mileage (optional)"
            inputMode="numeric"
          />

          <input
            className="input"
            value={recordForm.cost}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, cost: e.target.value }))
            }
            placeholder="Cost (optional)"
            inputMode="decimal"
          />

          <textarea
            className="textarea"
            value={recordForm.notes}
            onChange={(e) =>
              setRecordForm((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Notes (optional)"
            rows={3}
          />

          <button className="btn" type="submit">
            Add Service Record
          </button>
        </form>

        <hr className="hr" />

        {!showServiceRecords ? (
          <p className="muted">
            Service records hidden. {records.length} record
            {records.length === 1 ? "" : "s"} loaded.
          </p>
        ) : records.length === 0 ? (
          <p className="muted">No service records yet.</p>
        ) : (
          <div className="stack">
            {records.map((r) => (
              <div key={r.id} className="itemCard">
                <div className="itemRow">
                  <div>
                    <b>{r.title}</b>{" "}
                    <span className="muted">({r.category || "—"})</span>
                    {editingRecordId !== Number(r.id) ? (
                      <>
                        <div className="muted" style={{ marginTop: 6 }}>
                          <div>Date: {r.service_date}</div>
                          {r.mileage !== null && r.mileage !== undefined && (
                            <div>Mileage: {numberFmt.format(r.mileage)}</div>
                          )}
                          {r.cost !== null && r.cost !== undefined && (
                            <div>Cost: {moneyFmt.format(Number(r.cost))}</div>
                          )}
                        </div>
                        {r.notes && <p style={{ marginTop: 8 }}>{r.notes}</p>}
                      </>
                    ) : null}
                    {editingRecordId === Number(r.id) && (
                      <form
                        id={`edit-record-${r.id}`}
                        className="form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateRecordManual(r.id);
                        }}
                        style={{ marginTop: 12 }}
                      >
                        <input
                          className="input"
                          value={editRecordForm.title}
                          onChange={(e) =>
                            setEditRecordForm((p) => ({
                              ...p,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Title"
                          required
                        />

                        <select
                          className="select"
                          value={editRecordForm.category}
                          onChange={(e) =>
                            setEditRecordForm((p) => ({
                              ...p,
                              category: e.target.value,
                            }))
                          }
                        >
                          <option>Maintenance</option>
                          <option>Repair</option>
                          <option>Inspection</option>
                          <option>Other</option>
                        </select>

                        <input
                          className="input"
                          type="date"
                          value={editRecordForm.service_date}
                          onChange={(e) =>
                            setEditRecordForm((p) => ({
                              ...p,
                              service_date: e.target.value,
                            }))
                          }
                          required
                        />

                        <input
                          className="input"
                          value={editRecordForm.mileage}
                          onChange={(e) =>
                            setEditRecordForm((p) => ({
                              ...p,
                              mileage: e.target.value,
                            }))
                          }
                          placeholder="Mileage (optional)"
                          inputMode="numeric"
                        />

                        <input
                          className="input"
                          value={editRecordForm.cost}
                          onChange={(e) =>
                            setEditRecordForm((p) => ({
                              ...p,
                              cost: e.target.value,
                            }))
                          }
                          placeholder="Cost (optional)"
                          inputMode="decimal"
                        />

                        <textarea
                          className="textarea"
                          value={editRecordForm.notes}
                          onChange={(e) =>
                            setEditRecordForm((p) => ({
                              ...p,
                              notes: e.target.value,
                            }))
                          }
                          placeholder="Notes (optional)"
                          rows={3}
                        />
                      </form>
                    )}
                  </div>

                  <div className="stack" style={{ gap: 8 }}>
                    {editingRecordId === Number(r.id) ? (
                      <>
                        <button
                          className="btn"
                          type="submit"
                          onClick={() => handleUpdateRecordManual(r.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={cancelEditRecord}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => startEditRecord(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => handleDeleteRecord(r.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div
          className="row"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <h3 style={{ margin: 0 }}>Reminders</h3>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setShowReminders((prev) => !prev)}
          >
            {showReminders ? "Hide Reminders" : "Show Reminders"}
          </button>
        </div>

        <form className="form" onSubmit={handleCreateReminder}>
          <input
            className="input"
            value={reminderForm.title}
            onChange={(e) =>
              setReminderForm((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Title (ex: Rotate tires)"
            required
          />

          <input
            className="input"
            type="date"
            value={reminderForm.due_date}
            onChange={(e) =>
              setReminderForm((p) => ({ ...p, due_date: e.target.value }))
            }
          />

          <input
            className="input"
            value={reminderForm.due_mileage}
            onChange={(e) =>
              setReminderForm((p) => ({ ...p, due_mileage: e.target.value }))
            }
            placeholder="Due mileage (optional)"
            inputMode="numeric"
          />

          <textarea
            className="textarea"
            value={reminderForm.notes}
            onChange={(e) =>
              setReminderForm((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Notes (optional)"
            rows={3}
          />

          <button className="btn" type="submit">
            Add Reminder
          </button>

          <p className="small muted" style={{ margin: 0 }}>
            Tip: Add a due date <b>or</b> due mileage (at least one is
            required).
          </p>
        </form>

        <hr className="hr" />

        {!showReminders ? (
          <p className="muted">
            Reminders hidden. {reminders.length} reminder
            {reminders.length === 1 ? "" : "s"} loaded.
          </p>
        ) : reminders.length === 0 ? (
          <p className="muted">No reminders yet.</p>
        ) : (
          <div className="stack">
            {reminders.map((r) => (
              <div key={r.id} className="itemCard">
                <div className="itemRow">
                  <div>
                    <b
                      style={{
                        textDecoration: r.is_completed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {r.title}
                    </b>

                    {editingReminderId !== Number(r.id) ? (
                      <>
                        <div className="muted" style={{ marginTop: 6 }}>
                          {r.due_date && <div>Due Date: {r.due_date}</div>}
                          {r.due_mileage !== null &&
                            r.due_mileage !== undefined && (
                              <div>
                                Due Mileage: {numberFmt.format(r.due_mileage)}
                              </div>
                            )}
                        </div>
                        {r.notes && <p style={{ marginTop: 8 }}>{r.notes}</p>}
                      </>
                    ) : null}

                    {editingReminderId === Number(r.id) && (
                      <form
                        id={`edit-reminder-${r.id}`}
                        className="form"
                        onSubmit={handleUpdateReminder}
                        style={{ marginTop: 12 }}
                      >
                        <input
                          className="input"
                          value={editReminderForm.title}
                          onChange={(e) =>
                            setEditReminderForm((p) => ({
                              ...p,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Title"
                          required
                        />

                        <input
                          className="input"
                          type="date"
                          value={editReminderForm.due_date}
                          onChange={(e) =>
                            setEditReminderForm((p) => ({
                              ...p,
                              due_date: e.target.value,
                            }))
                          }
                        />

                        <input
                          className="input"
                          value={editReminderForm.due_mileage}
                          onChange={(e) =>
                            setEditReminderForm((p) => ({
                              ...p,
                              due_mileage: e.target.value,
                            }))
                          }
                          placeholder="Due mileage (optional)"
                          inputMode="numeric"
                        />

                        <textarea
                          className="textarea"
                          value={editReminderForm.notes}
                          onChange={(e) =>
                            setEditReminderForm((p) => ({
                              ...p,
                              notes: e.target.value,
                            }))
                          }
                          placeholder="Notes (optional)"
                          rows={3}
                        />
                      </form>
                    )}
                  </div>

                  {/* Actions live HERE (right side), NOT inside the form */}
                  <div className="stack" style={{ gap: 8 }}>
                    {editingReminderId === Number(r.id) ? (
                      <>
                        <button
                          className="btn"
                          type="submit"
                          form={`edit-reminder-${r.id}`}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={cancelEditReminder}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() =>
                            handleToggleReminder(r.id, r.is_completed)
                          }
                        >
                          {r.is_completed ? "Mark Incomplete" : "Mark Complete"}
                        </button>

                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => startEditReminder(r)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => handleDeleteReminder(r.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
