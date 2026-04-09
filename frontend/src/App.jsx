import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages//User/Login";
import Register from "./pages/User/Register";
import Dashboard from "./pages/Dashboard";
import VehicleDetail from "./pages/Vehicle/VehicleDetail";
import NotFound from "./pages/NotFound";
import Profile from "./pages/User/Profile";
import Vehicles from "./pages/Vehicle/Vehicles";
import AddVehicle from "./pages/Vehicle/AddVehicle";
import ServiceRecords from "./pages/ServiceRecords";
import Reminders from "./pages/Reminders";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/new"
          element={
            <ProtectedRoute>
              <AddVehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:id"
          element={
            <ProtectedRoute>
              <VehicleDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/service-records"
          element={
            <ProtectedRoute>
              <ServiceRecords />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <Reminders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}