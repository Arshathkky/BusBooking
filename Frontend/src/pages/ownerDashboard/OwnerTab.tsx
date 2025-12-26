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

  // ✅ Cycle status on badge click
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

  // ✅ Refresh owners after modal close
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

      <div className="grid gap-4">
        {owners.map((owner) => (
          <div
            key={owner._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex justify-between items-center transition-colors"
          >
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {owner.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{owner.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {owner.phone} • {owner.address}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Registered:{" "}
                {new Date(owner.createdAt || "").toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* ✅ Clickable status badge */}
              <span
                onClick={() => handleStatusChange(owner)}
                title="Click to change status"
                className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${getStatusColor(
                  owner.status
                )}`}
              >
                {owner.status.charAt(0).toUpperCase() + owner.status.slice(1)}
              </span>

              <button
                onClick={() => handleEditOwner(owner)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteOwner(owner._id)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showOwnerModal && (
        <OwnerModal
          ownerData={editingOwner}
          onClose={handleModalClose} // ✅ Refresh owners after add/edit
        />
      )}
    </div>
  );
};

export default OwnerTab;
