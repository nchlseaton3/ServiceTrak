import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContexts";
import { api } from "../../services/api";
import Loader from "../../components/Loader/Loader";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const location = useLocation();
  const from = location.state?.from;
  const [vehicle, setVehicle] = useState(null);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [error, setError] = useState("");
  const [recordAttachmentFile, setRecordAttachmentFile] = useState(null);

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

  const [recalls, setRecalls] = useState([]);
  const [recallsLoaded, setRecallsLoaded] = useState(false);
  const [recallsLoading, setRecallsLoading] = useState(false);
  const [showRecalls, setShowRecalls] = useState(true);

  async function loadVehicle() {
    const data = await api.getVehicle(token, id);
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

  async function loadAll() {
    setError("");
    try {
      await loadVehicle();
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
      setVehicleForm({
        nickname: data.vehicle.nickname || "",
        vin: data.vehicle.vin || "",
        year: data.vehicle.year ?? "",
        make: data.vehicle.make || "",
        model: data.vehicle.model || "",
        trim: data.vehicle.trim || "",
        engine: data.vehicle.engine || "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteVehicle() {
    if (
      !confirm(
        "Delete this vehicle? This will remove its records and reminders too.",
      )
    ) {
      return;
    }

    setError("");
    try {
      await api.deleteVehicle(token, id);
      navigate("/vehicles");
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
      const createRes = await api.createServiceRecord(token, payload);

      // adjust this depending on your backend response shape
      const newRecord =
        createRes.service_record || createRes.record || createRes.serviceRecord;

      if (!newRecord?.id) {
        throw new Error(
          "Service record was created, but no record ID was returned.",
        );
      }

      if (recordAttachmentFile) {
        await api.uploadServiceRecordAttachment(
          token,
          newRecord.id,
          recordAttachmentFile,
        );
      }

      setRecordForm({
        title: "",
        category: "Maintenance",
        service_date: "",
        mileage: "",
        cost: "",
        notes: "",
      });
      setRecordAttachmentFile(null);

      const fileInput = document.getElementById("record-attachment-file");
      if (fileInput) fileInput.value = "";
      
      navigate(`/service-records?vehicle_id=${id}`);
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
      navigate(`/reminders?vehicle_id=${id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  function updateVehicleForm(key, value) {
    setVehicleForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSaveVehicle(e) {
    e.preventDefault();
    setError("");

    const payload = {
      nickname: vehicleForm.nickname.trim() || null,
      vin: vehicleForm.vin.trim() ? vehicleForm.vin.trim().toUpperCase() : null,
      year: vehicleForm.year === "" ? null : Number(vehicleForm.year),
      make: vehicleForm.make.trim() || null,
      model: vehicleForm.model.trim() || null,
      trim: vehicleForm.trim.trim() || null,
      engine: vehicleForm.engine.trim() || null,
    };

    if (payload.vin && payload.vin.length !== 17) {
      setError("VIN must be 17 characters.");
      return;
    }

    try {
      const data = await api.updateVehicle(token, id, payload);
      setVehicle(data.vehicle);
      setVehicleForm({
        nickname: data.vehicle.nickname || "",
        vin: data.vehicle.vin || "",
        year: data.vehicle.year ?? "",
        make: data.vehicle.make || "",
        model: data.vehicle.model || "",
        trim: data.vehicle.trim || "",
        engine: data.vehicle.engine || "",
      });
      setIsEditingVehicle(false);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCancelVehicleEdit() {
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
        <Loader text="Loading vehicle..." />
      </div>
    );
  }

  function getBackLink() {
    if (from === "service-records") return "/service-records";
    if (from === "reminders") return "/reminders";
    return "/vehicles";
  }

  return (
    <div className="container stack">
      <div className="back-link-row">
        <Link className="btn btn-secondary" to={getBackLink()}>
          ← Back
        </Link>
      </div>
      <div className="card">
        <h2 style={{ margin: 0 }}>
          {vehicle.nickname || "Vehicle"}{" "}
          <span className="muted">({vehicle.model || "Details"})</span>
        </h2>

        {isEditingVehicle ? (
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
            </form>
          </>
        ) : (
          <div className="stack" style={{ gap: 6, marginTop: 10 }}>
            <p>
              <b>VIN:</b> {vehicle.vin || "None"}
            </p>
            <p>
              <b>Decoded:</b> {vehicle.year || "?"} {vehicle.make || ""}{" "}
              {vehicle.model || ""} {vehicle.trim ? `(${vehicle.trim})` : ""}
            </p>
            <p>
              <b>Engine:</b> {vehicle.engine || "—"}
            </p>
          </div>
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

          {!isEditingVehicle && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setIsEditingVehicle(true)}
            >
              Edit Vehicle
            </button>
          )}

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
        <h3>Quick Actions</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Jump to this vehicle’s full service records or reminders pages.
        </p>

        <div className="row">
          <Link
            className="btn btn-secondary"
            to={`/service-records?vehicle_id=${vehicle.id}`}
          >
            View Service Records
          </Link>

          <Link
            className="btn btn-secondary"
            to={`/reminders?vehicle_id=${vehicle.id}`}
          >
            View Reminders
          </Link>
        </div>
      </div>

      <div className="card">
        <h3>Add Service Record</h3>

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

          <input
            id="record-attachment-file"
            className="input"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={(e) =>
              setRecordAttachmentFile(e.target.files?.[0] || null)
            }
          />

          <p className="small muted" style={{ margin: 0 }}>
            Optional: attach a receipt, invoice, image, or PDF.
          </p>

          <button className="btn" type="submit">
            Add Service Record
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Add Reminder</h3>

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
            Tip: Add a due date <b>or</b> due mileage.
          </p>
        </form>
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
              Check for open recalls using the vehicle&apos;s year, make, and
              model.
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
    </div>
  );
}
