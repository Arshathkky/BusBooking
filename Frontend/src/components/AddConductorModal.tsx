import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, Bus } from "lucide-react";
import { useBus } from "../contexts/busDataContexts";
import { useConductor, ConductorType } from "../contexts/conductorDataContext";
import { useAuth } from "../contexts/AuthContext";

interface AddConductorModalProps {
  onClose: () => void;
  editingConductor?: ConductorType | null; // optional for update
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
    assignedBusId: "",
    status: "active" as "active" | "inactive",
  });

  const [error, setError] = useState<string | null>(null);

  // Filter buses that belong only to the logged-in owner
  const ownerBuses = buses.filter((bus) => bus.ownerId === user?.id);

  // Prefill form if editing
  useEffect(() => {
    if (editingConductor) {
      setFormData({
        name: editingConductor.name,
        phone: editingConductor.phone,
        email: editingConductor.email,
        assignedBusId: editingConductor.assignedBusId || "",
        status: editingConductor.status,
      });
    }
  }, [editingConductor]);

  // Handle form submission
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

    try {
      if (editingConductor) {
        // ✅ Update conductor
        await updateConductor(editingConductor.id, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          assignedBusId: formData.assignedBusId || undefined,
          status: formData.status,
        });
      } else {
        // ✅ Add new conductor
        await addConductor({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          assignedBusId: formData.assignedBusId || undefined,
          ownerId: user.id,
          status: formData.status,
        });
      }

      setError(null);
      onClose();
    } catch (err) {
      console.error("Failed to save conductor:", err);
      setError("Failed to save conductor. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-[#fdc106] p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingConductor ? "Update Conductor" : "Add New Conductor"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {editingConductor
                ? "Update details of your conductor"
                : "Add a conductor to your team"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Assigned Bus */}
            <div className="relative">
              <Bus className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={formData.assignedBusId}
                onChange={(e) => handleInputChange("assignedBusId", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Bus (Optional)</option>
                {ownerBuses.length > 0 ? (
                  ownerBuses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No buses available</option>
                )}
              </select>
            </div>

            {/* Status */}
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 
                text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
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
