import { useAuth } from "../contexts/AuthContexts";
import { useNavigate } from "react-router-dom";
import AddVehicleForm from "../components/AddVehicleForm";

export default function AddVehicle() {
  const { token } = useAuth();
  const navigate = useNavigate();

  async function handleCreated() {
    navigate("/vehicles");
  }

  return (
    <div className="container stack">
      <AddVehicleForm token={token} onCreated={handleCreated} />
    </div>
  );
}