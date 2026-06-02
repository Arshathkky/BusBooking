import React, { useState } from "react";
import { CreditCard as Edit, Trash2, Plus } from "lucide-react";
import { useOwner, Owner } from "../../contexts/OwnerContext";
import OwnerModal from "./AddOwnerModal";

const OwnerTab: React.FC = () => {
  const { owners, deleteOwner, updateOwner, fetchOwners } = useOwner();
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | undefined>(undefined);

  const handleEditOwner = (owner: Owner) => {
    setEditingOwner(owner);
    setShowOwnerModal(true);
  };

  const handleAddOwner = () => {
    setEditingOwner(undefined);
    setShowOwnerModal(true);
  };

  const handleStatusChange = async (owner: Owner) => {
    const nextStatus =
      owner.status === "pending"
        ? "active"
        : owner.status === "active"
        ? "suspended"
        : "pending";
    await updateOwner(owner._id, { status: nextStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900";
      case "active":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900";
      case "suspended":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900";
    }
  };

  // ✅ Refresh after modal close
  const handleModalClose = async () => {
    setShowOwnerModal(false);
    setEditingOwner(undefined);
    await fetchOwners();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Bus Owner Management
        </h3>
        <button
          onClick={handleAddOwner}
          className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Owner</span>
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Reg Number</th>
              <th className="px-6 py-3">Tax ID</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr key={owner._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{owner.name}</td>
                <td className="px-6 py-4">{owner.email}<br/>{owner.phone}</td>
                <td className="px-6 py-4">{owner.address || 'N/A'}</td>
                <td className="px-6 py-4">{owner.businessRegistrationNumber || 'N/A'}</td>
                <td className="px-6 py-4">{owner.taxId || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span onClick={() => handleStatusChange(owner)} className={`cursor-pointer px-2 py-1 rounded text-xs font-semibold ${getStatusColor(owner.status)}`}>
                    {owner.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleEditOwner(owner)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                  <button onClick={() => deleteOwner(owner._id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showOwnerModal && (
        <OwnerModal
          ownerData={editingOwner}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default OwnerTab;
