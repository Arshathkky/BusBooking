import React, { useState, FormEvent, useEffect } from "react";
import { X, MapPin, Clock, Route as RouteIcon, Plus, Trash2 } from "lucide-react";
import { useRouteData } from "../contexts/RouteDataContext";
import { useAuth } from "../contexts/AuthContext"; // for user

// ✅ Define your Route type clearly
export interface RouteType {
  id?: string;
  name: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  duration: string;
  status: "active" | "inactive";
  stops: string[];
  ownerId: string; // ✅ required
  createdAt?: string;
  updatedAt?: string;
}

interface AddRouteModalProps {
  onClose: () => void;
  editingRoute?: RouteType | null; // ✅ no any
}

interface StopType {
  name: string;
  order: number;
  arrivalTime?: string;
}

interface NewStopType {
  name: string;
  arrivalTime: string;
}

const AddRouteModal: React.FC<AddRouteModalProps> = ({ onClose, editingRoute }) => {
  const { addRoute, updateRoute } = useRouteData();
  const { user } = useAuth(); // logged-in owner

  const isEditing = Boolean(editingRoute);

  const [formData, setFormData] = useState({
    name: "",
    startPoint: "",
    endPoint: "",
    distance: "",
    duration: "",
    status: "active" as "active" | "inactive",
  });

  const [stops, setStops] = useState<StopType[]>([]);
  const [newStop, setNewStop] = useState<NewStopType>({ name: "", arrivalTime: "" });

  const cities = [
    "Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Anuradhapura",
    "Polonnaruwa", "Nuwara Eliya", "Batticaloa", "Trincomalee",
    "Matara", "Kurunegala", "Kattankudy", "Navatkuda", "Kallady",
    "Urani", "Eravur","pasikuda","oddamavady"
  ];

  // ✅ Pre-fill form when editing
  useEffect(() => {
    if (editingRoute) {
      setFormData({
        name: editingRoute.name || "",
        startPoint: editingRoute.startPoint || "",
        endPoint: editingRoute.endPoint || "",
        distance: String(editingRoute.distance || ""),
        duration: editingRoute.duration || "",
        status: editingRoute.status || "active",
      });
      setStops(
        (editingRoute.stops || []).map((stop, index) => ({
          name: stop,
          order: index + 1,
        }))
      );
    }
  }, [editingRoute]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStop = () => {
    if (!newStop.name.trim()) return;
    const stop: StopType = {
      name: newStop.name.trim(),
      order: stops.length + 1,
      arrivalTime: newStop.arrivalTime || undefined,
    };
    setStops((prev) => [...prev, stop]);
    setNewStop({ name: "", arrivalTime: "" });
  };

  const handleRemoveStop = (index: number) => {
    const updated = stops
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setStops(updated);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;

    const routeData: Omit<RouteType, "id" | "createdAt" | "updatedAt"> = {
      name: formData.name.trim(),
      startPoint: formData.startPoint,
      endPoint: formData.endPoint,
      distance: parseFloat(formData.distance),
      duration: formData.duration.trim(),
      status: formData.status,
      stops: stops.sort((a, b) => a.order - b.order).map((s) => s.name),
      ownerId: user.id, // ✅ now always string
    };

    if (isEditing && editingRoute?.id) {
      updateRoute(editingRoute.id, routeData);
    } else {
      addRoute(routeData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-y-auto max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-[#fdc106] p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <RouteIcon className="w-8 h-8 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? "Edit Route" : "Add New Route"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isEditing
                ? "Update existing route details"
                : "Create a new bus route with multiple stops"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Name */}
            <div className="relative">
              <RouteIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Route Name (e.g., Kattankudy - Colombo)"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Start & End Points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={formData.startPoint}
                  onChange={(e) => handleInputChange("startPoint", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Start Point</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={formData.endPoint}
                  onChange={(e) => handleInputChange("endPoint", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select End Point</option>
                  {cities
                    .filter((city) => city !== formData.startPoint)
                    .map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Distance & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Distance (km)"
                value={formData.distance}
                onChange={(e) => handleInputChange("distance", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Duration (e.g., 5h 15m)"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Stops */}
            <div className="border-t border-gray-300 dark:border-gray-700 pt-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Stops
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Stop Name"
                  value={newStop.name}
                  onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                  className="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="time"
                  value={newStop.arrivalTime}
                  onChange={(e) => setNewStop({ ...newStop, arrivalTime: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-2 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Stop
              </button>

              <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {stops.map((stop, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {stop.order}. {stop.name}
                      </p>
                      {stop.arrivalTime && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Arr: {stop.arrivalTime}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {isEditing ? "Update Route" : "Add Route"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRouteModal;
