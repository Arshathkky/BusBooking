import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, Bus, Lock, Hash, MapPin } from "lucide-react";
import { useBus } from "../contexts/busDataContexts";
import { useConductor, ConductorType } from "../contexts/conductorDataContext";
import { useAuth } from "../contexts/AuthContext";

interface AddConductorModalProps {
  onClose: () => void;
  editingConductor?: ConductorType | null;
}

const AddConductorModal: React.FC<AddConductorModalProps> = ({
  onClose,
  editingConductor = null,
}) => {
  const { buses } = useBus();
  const { addConductor, updateConductor } = useConductor();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    assignedBusId: "",
    status: "active" as "active" | "inactive",
    role: "conductor" as "conductor" | "agent",
    agentCode: "",
    city: "", // ✅ Added
  });

  const [error, setError] = useState<string | null>(null);

  const ownerBuses = buses.filter((bus) => bus.ownerId === user?.id);

  // Prefill data when editing
  useEffect(() => {
    if (editingConductor) {
      setFormData({
        name: editingConductor.name,
        phone: editingConductor.phone,
        email: editingConductor.email,
        password: "",
        assignedBusId: editingConductor.assignedBusId || "",
        status: editingConductor.status,
        role: editingConductor.role,
        agentCode: editingConductor.agentCode || "",
        city: editingConductor.city || "",
      });
    }
  }, [editingConductor]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("User not found. Please log in again.");
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (!editingConductor && !formData.password.trim()) {
      setError("Password is required.");
      return;
    }

    // Require agent fields
    if (formData.role === "agent") {
      if (!formData.agentCode.trim()) {
        setError("Agent Code is required for agents.");
        return;
      }
      if (!formData.city.trim()) {
        setError("City is required for agents.");
        return;
      }
    }

    try {
      if (editingConductor) {
        await updateConductor(editingConductor.id, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          assignedBusId: formData.assignedBusId || undefined,
          status: formData.status,
          role: formData.role,
          agentCode: formData.agentCode || undefined,
          city: formData.city || undefined,
          ...(formData.password.trim() && { password: formData.password }),
        });
      } else {
        await addConductor({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          assignedBusId: formData.assignedBusId || undefined,
          ownerId: user.id,
          status: formData.status,
          role: formData.role,
          agentCode: formData.agentCode || undefined,
          city: formData.city || undefined,
        });
      }

      setError(null);
      onClose();
    } catch (err) {
      console.error("Failed to save conductor:", err);
      setError("Failed to save conductor. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="bg-[#fdc106] p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingConductor ? "Update Conductor" : "Add New Conductor"}
            </h2>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
                required
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder={editingConductor ? "New Password (optional)" : "Password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
                required={!editingConductor}
              />
            </div>

            {/* Assigned Bus */}
            <div className="relative">
              <Bus className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={formData.assignedBusId}
                onChange={(e) => handleInputChange("assignedBusId", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">Select Bus (Optional)</option>
                {ownerBuses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role */}
            <select
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
              required
            >
              <option value="conductor">Conductor</option>
              <option value="agent">Agent</option>
            </select>

            {/* Agent Fields */}
            {formData.role === "agent" && (
              <>
                {/* Agent Code */}
                <div className="relative">
                  <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Agent Code"
                    value={formData.agentCode}
                    onChange={(e) => handleInputChange("agentCode", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
                    required
                  />
                </div>

                {/* City */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
                    required
                  />
                </div>
              </>
            )}

            {/* Status */}
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#fdc106] py-3 rounded-lg font-bold"
              >
                {editingConductor ? "Update Conductor" : "Add Conductor"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddConductorModal;