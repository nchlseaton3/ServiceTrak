const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(token),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  profile: (token) => request("/auth/profile", { token }),
  updateProfile: (token, payload) => request("/auth/update", { method: "PUT", token, body: payload }),

  // Vehicles
  listVehicles: (token) => request("/vehicles/", { token }),
  createVehicle: (token, payload) => request("/vehicles/", { method: "POST", token, body: payload }),
  getVehicle: (token, id) => request(`/vehicles/${id}`, { token }),
  updateVehicle: (token, id, payload) => request(`/vehicles/${id}`, { method: "PUT", token, body: payload }),
  deleteVehicle: (token, id) => request(`/vehicles/${id}`, { method: "DELETE", token }),
  decodeVin: (token, id) => request(`/vehicles/${id}/decode-vin`, { method: "POST", token }),
  decodeVinPreview: (token, vin) => request("/vehicles/decode", { method: "POST", token, body: { vin } }),

  // Service Records
  listServiceRecords: (token, vehicleId) => {
    const qs = vehicleId ? `?vehicle_id=${vehicleId}` : "";
    return request(`/service-records/${qs}`, { token });
  },
  createServiceRecord: (token, payload) => request("/service-records/", { method: "POST", token, body: payload }),
  updateServiceRecord: (token, id, payload) => request(`/service-records/${id}`, { method: "PUT", token, body: payload }),
  deleteServiceRecord: (token, id) => request(`/service-records/${id}`, { method: "DELETE", token }),

  // Reminders
  listReminders: (token, vehicleId) => {
    const qs = vehicleId ? `?vehicle_id=${vehicleId}` : "";
    return request(`/reminders/${qs}`, { token });
  },
  createReminder: (token, payload) => request("/reminders/", { method: "POST", token, body: payload }),
  updateReminder: (token, id, payload) => request(`/reminders/${id}`, { method: "PUT", token, body: payload }),
  deleteReminder: (token, id) => request(`/reminders/${id}`, { method: "DELETE", token }),
};
