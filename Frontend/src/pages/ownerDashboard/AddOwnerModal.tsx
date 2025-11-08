// src/components/AddOwnerModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { useOwner } from "../../contexts/OwnerContext";

interface AddOwnerModalProps {
  onClose: () => void;
}

const AddOwnerModal: React.FC<AddOwnerModalProps> = ({ onClose }) => {
  const { addOwner, loading } = useOwner();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    address: "",
    businessRegistrationNumber: "",
    taxId: "",
    registrationDocumentUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addOwner(formData);
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
          Add New Bus Owner
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-semibold py-2 rounded-lg mt-4"
          >
            {loading ? "Adding..." : "Add Owner"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddOwnerModal;
