import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useOwner, Owner } from "../../contexts/OwnerContext";

interface OwnerModalProps {
  onClose: () => void;
  ownerData?: Owner;
}

const OwnerModal: React.FC<OwnerModalProps> = ({ onClose, ownerData }) => {
  const { addOwner, updateOwner, loading } = useOwner();

  // ✅ Typed to match Owner model
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    companyName: string;
    address: string;
    businessRegistrationNumber: string;
    taxId: string;
    registrationDocumentUrl: string;
    password: string;
    status: "pending" | "active" | "suspended";
  }>({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    address: "",
    businessRegistrationNumber: "",
    taxId: "",
    registrationDocumentUrl: "",
    password: "",
    status: "pending",
  });

  useEffect(() => {
    if (ownerData) {
      setFormData({
        name: ownerData.name ?? "",
        email: ownerData.email ?? "",
        phone: ownerData.phone ?? "",
        companyName: ownerData.companyName ?? "",
        address: ownerData.address ?? "",
        businessRegistrationNumber: ownerData.businessRegistrationNumber ?? "",
        taxId: ownerData.taxId ?? "",
        registrationDocumentUrl: ownerData.registrationDocumentUrl ?? "",
        password: "",
        status: ownerData.status ?? "pending",
      });
    }
  }, [ownerData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ownerData) {
      // ✅ Update existing owner — can send partial data
      await updateOwner(ownerData._id, {
        ...formData,
        status: formData.status,
      });
    } else {
      // ✅ Add new owner — must send *complete* data with correct types
      await addOwner({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        address: formData.address,
        businessRegistrationNumber: formData.businessRegistrationNumber,
        taxId: formData.taxId,
        registrationDocumentUrl: formData.registrationDocumentUrl,
        password: formData.password,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {ownerData ? "Edit Bus Owner" : "Add New Bus Owner"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Owner Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <input
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <input
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
            />
          </div>

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          />

          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            Business Registration (Optional)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="businessRegistrationNumber"
              placeholder="Registration Number"
              value={formData.businessRegistrationNumber}
              onChange={handleChange}
              className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <input
              name="taxId"
              placeholder="Tax ID"
              value={formData.taxId}
              onChange={handleChange}
              className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <input
              name="registrationDocumentUrl"
              placeholder="Registration Document URL"
              value={formData.registrationDocumentUrl}
              onChange={handleChange}
              className="col-span-2 p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* ✅ Status dropdown (only for editing) */}
          {ownerData && (
            <div>
              <label className="block text-gray-800 dark:text-gray-200 mb-1 font-medium">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          {/* Password */}
          <input
            name="password"
            type="password"
            placeholder={
              ownerData
                ? "New Password (leave blank to keep current)"
                : "Set Password"
            }
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white mt-2"
            required={!ownerData}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-semibold py-2 rounded-lg mt-4"
          >
            {loading
              ? ownerData
                ? "Updating..."
                : "Adding..."
              : ownerData
              ? "Update Owner"
              : "Add Owner"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerModal;
