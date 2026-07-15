import React, { useState, useEffect } from "react";
import { CreditCard as Edit, Trash2, Plus } from "lucide-react";
import axios from "axios";

import { useBus, BusType } from "../contexts/busDataContexts";
import { useData } from "../contexts/DataContext";
import { useRouteData, RouteType } from "../contexts/RouteDataContext";

import OwnerTab from "./ownerDashboard/OwnerTab";
import AddRouteModal from "../components/AddRouteModal";
import AddBusModal from "../components/AddBusModal";
import Overview from "../contexts/OverView";

type TabKey = "overview" | "owners" | "buses" | "routes" | "users" | "requests";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  // -------- Modals --------
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteType | null>(null);

  const [showBusModal, setShowBusModal] = useState(false);
  const [editingBus, setEditingBus] = useState<BusType | null>(null);

  // -------- Data --------
  const { buses, toggleBusStatus, deleteBus } = useBus();
  const { users, deleteUser } = useData();
  const { routes, toggleRouteStatus, deleteRoute } = useRouteData();

  const fetchPendingRequestCount = async () => {
    try {
      const response = await axios.get("/bus-requests");
      if (response.data.success) {
        const count = (response.data.data || []).filter((request: any) => request.status === "pending").length;
        setPendingRequestCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch pending seat requests", err);
    }
  };

  useEffect(() => {
    fetchPendingRequestCount();
    const interval = window.setInterval(fetchPendingRequestCount, 10000);
    return () => window.clearInterval(interval);
  }, []);

  // -------- Helpers --------
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete system management and oversight
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { key: "overview", label: "Overview" },
            { key: "owners", label: "Bus Owners" },
            { key: "buses", label: "Buses" },
            { key: "routes", label: "Routes" },
            { key: "users", label: "Users" },
            { key: "requests", label: `Bus Requests${pendingRequestCount > 0 ? ` (${pendingRequestCount})` : ""}` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
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

      {/* ---------------- Overview ---------------- */}
      {activeTab === "overview" && <Overview />}

      {/* ---------------- Owners ---------------- */}
      {activeTab === "owners" && <OwnerTab />}

      {/* ---------------- Users ---------------- */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email} • {user.phone} • {user.role}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
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

      {/* ---------------- Buses (EDIT ENABLED) ---------------- */}
      {activeTab === "buses" && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setEditingBus(null);
              setShowBusModal(true);
            }}
            className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bus</span>
          </button>

          {buses.map((bus) => (
            <div key={bus.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{bus.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {bus.type} • {bus.totalSeats} seats • LKR {bus.price}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleBusStatus(bus.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bus.status)}`}
                >
                  {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                </button>
                <button
                  onClick={() => {
                    setEditingBus(bus);
                    setShowBusModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBus(bus.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- Routes (EDIT ENABLED) ---------------- */}
      {activeTab === "routes" && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setEditingRoute(null);
              setShowAddRouteModal(true);
            }}
            className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Route</span>
          </button>

          {routes.map((route) => (
            <div key={route.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{route.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {route.startPoint} → {route.endPoint} • {route.distance} km • {route.duration}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleRouteStatus(route.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}
                >
                  {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                </button>
                <button
                  onClick={() => {
                    setEditingRoute(route);
                    setShowAddRouteModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteRoute(route.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- Requests ---------------- */}
      {activeTab === "requests" && <AdminRequestsTab />}

      {/* ---------------- Modals ---------------- */}
      {showAddRouteModal && (
        <AddRouteModal
          editingRoute={editingRoute}
          onClose={() => {
            setShowAddRouteModal(false);
            setEditingRoute(null);
          }}
        />
      )}

      {showBusModal && (
        <AddBusModal
          editingBus={editingBus}
          onClose={() => {
            setShowBusModal(false);
            setEditingBus(null);
          }}
        />
      )}
    </div>
  );
};

// --- ADMIN REQUESTS TAB ---
const AdminRequestsTab: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/bus-requests");
      if (response.data.success) {
        setRequests(response.data.data);
      } else {
        setError(response.data.message || "Failed to load requests.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred fetching requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = window.setInterval(fetchRequests, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "pending" ? "processed" : "pending";
    try {
      const response = await axios.patch(`/bus-requests/${id}/status`, { status: nextStatus });
      if (response.data.success) {
        setRequests(prev => prev.map(r => r._id === id ? { ...r, status: nextStatus } : r));
      }
    } catch (err: any) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const response = await axios.delete(`/bus-requests/${id}`);
      if (response.data.success) {
        setRequests(prev => prev.filter(r => r._id !== id));
      }
    } catch (err: any) {
      alert("Failed to delete request: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusColor = (status: string) => {
    return status === "processed"
      ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900"
      : "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900";
  };

  if (loading) {
    return <div className="text-center py-10 font-bold text-gray-500">Loading requests...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">All System Bus Requests</h3>
        <button
          onClick={fetchRequests}
          className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2"
        >
          <span>Refresh</span>
        </button>
      </div>

      {requests.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">No bus requests in the system.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Passenger</th>
                <th className="px-6 py-3">Bus Details</th>
                <th className="px-6 py-3">Route Details</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Pickup</th>
                <th className="px-6 py-3">Comments</th>
                <th className="px-6 py-3">Owner ID</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {request.name}
                    <br />
                    <span className="text-xs text-gray-500">{request.phone}</span>
                  </td>
                  <td className="px-6 py-4">{request.busName}</td>
                  <td className="px-6 py-4">
                    {request.searchData.from} → {request.searchData.to}
                  </td>
                  <td className="px-6 py-4 font-bold">{request.searchData.date}</td>
                  <td className="px-6 py-4">{request.pickupPlace}</td>
                  <td className="px-6 py-4 italic text-xs max-w-xs truncate" title={request.comments}>{request.comments || "-"}</td>
                  <td className="px-6 py-4 text-xs font-semibold">{request.ownerId || "System"}</td>
                  <td className="px-6 py-4">
                    <span
                      onClick={() => handleUpdateStatus(request._id, request.status)}
                      className={`cursor-pointer px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleDelete(request._id)}
                      className="text-red-500 hover:text-red-700 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
