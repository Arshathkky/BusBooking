import React, { useState } from "react";
import { CreditCard as Edit, Trash2, Plus } from "lucide-react";

import { useBus } from "../contexts/busDataContexts";
import { useData } from "../contexts/DataContext";
import { useRouteData } from "../contexts/RouteDataContext";

import OwnerTab from "./ownerDashboard/OwnerTab"; // ✅ new owner tab component
import AddRouteModal from "../components/AddRouteModal";
import Overview from "../contexts/OverView";

type TabKey = "overview" | "owners" | "buses" | "routes" | "users";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);

  const { buses } = useBus();
  const { users, deleteUser } = useData();
  const { routes, deleteRoute } = useRouteData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900";
      case "active":
      case "approved":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900";
      case "suspended":
      case "rejected":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Complete system management and oversight</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 transition-colors">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { key: "overview", label: "Overview" },
            { key: "owners", label: "Bus Owners" },
            { key: "buses", label: "Buses" },
            { key: "routes", label: "Routes" },
            { key: "users", label: "Users" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "text-[#fdc106] border-b-2 border-[#fdc106]"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <Overview />}
      {activeTab === "owners" && <OwnerTab />} {/* ✅ owner tab */}
      
      {/* Users */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email} • {user.phone} • {user.role}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buses */}
      {activeTab === "buses" && (
        <div className="grid gap-4">
          {buses.map((bus) => (
            <div key={bus.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{bus.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{bus.type} • {bus.totalSeats} seats • LKR {bus.price}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bus.status)}`}>
                {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Routes */}
      {activeTab === "routes" && (
        <div className="space-y-4">
          <button onClick={() => setShowAddRouteModal(true)} className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Route</span>
          </button>
          {routes.map((route) => (
            <div key={route.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{route.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{route.startPoint} → {route.endPoint} • {route.distance} km • {route.duration}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}>
                  {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteRoute(route.id)} className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddRouteModal && <AddRouteModal onClose={() => setShowAddRouteModal(false)} />}
    </div>
  );
};

export default AdminDashboard;
