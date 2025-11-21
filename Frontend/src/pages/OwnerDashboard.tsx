import React, { useState } from "react";
import {
  Plus,
  Bus,
  Users,
  DollarSign,
  Calendar,
  CreditCard as Edit,
  Trash2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AddBusModal from "../components/AddBusModal";
import AddConductorModal from "../components/AddConductorModal";
import { BusType, useBus } from "../contexts/busDataContexts";
import { useConductor, ConductorType } from "../contexts/conductorDataContext";
import { useRouteData, RouteType } from "../contexts/RouteDataContext";
import AddRouteModal from "../components/AddRouteModal";
import AssignAgentTab from "./ownerDashboard/AssignTab";
import BookingOverviewByDate from "./ownerDashboard/BookingOverviewByDate";

const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "buses" | "conductors" | "routes" | "assignAgent" | "Bookingoverview">("overview"); 
  const [editingRoute, setEditingRoute] = useState<RouteType | null>(null); // ✅ Fixed type

  const [showBusModal, setShowBusModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddConductorModal, setShowAddConductorModal] = useState(false);

  const [editingBus, setEditingBus] = useState<BusType | null>(null);
  const [editingConductor, setEditingConductor] = useState<ConductorType | null>(null);

  const { user } = useAuth();
  const { buses, deleteBus, toggleBusStatus } = useBus();
  const { routes, deleteRoute, toggleRouteStatus } = useRouteData();
  const { conductors, deleteConductor, toggleConductorStatus } = useConductor();

  // ---------------- Filter data by logged-in owner ----------------
  const ownerBuses = buses.filter((bus) => String(bus.ownerId) === String(user?.id));
  const ownerConductors = conductors.filter((conductor) => String(conductor.ownerId) === String(user?.id));
  const ownerRoutes = routes.filter((route) => String(route.ownerId) === String(user?.id));

  // ---------------- Dashboard Statistics ----------------
  const stats = {
    totalBuses: ownerBuses.length,
    activeBuses: ownerBuses.filter((b) => b.status === "active").length,
    totalConductors: ownerConductors.length,
    monthlyEarnings: 125000,
  };

  // ---------------- Helper Functions ----------------
  const getRouteName = (routeId?: string): string => {
    if (!routeId) return "Unknown Route";
    const route = routes.find((r) => r.id === routeId);
    return route ? `${route.startPoint} - ${route.endPoint}` : "Unknown Route";
  };

  const getBusName = (busId?: string): string => {
    if (!busId) return "Unassigned";
    const bus = ownerBuses.find((b) => b.id === busId);
    return bus ? bus.name : "Unknown Bus";
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case "active":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900";
      case "inactive":
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900";
    }
  };

  const formatStatus = (status?: string): string => {
    const s = status ?? "inactive";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleEditBus = (bus: BusType): void => {
    setEditingBus(bus);
    setShowBusModal(true);
  };

  const handleEditConductor = (conductor: ConductorType): void => {
    setEditingConductor(conductor);
    setShowAddConductorModal(true);
  };

  const tabs: Array<"overview" | "buses" | "conductors" | "routes" | "assignAgent"| "Bookingoverview"> =
  ["overview", "buses", "conductors", "routes", "assignAgent", "Bookingoverview"];

  return (
    <div className="max-w-6xl mx-auto">
      {/* ---------------- Header ---------------- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Owner Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your buses, routes, and conductors</p>
      </div>

      {/* ---------------- Tabs ---------------- */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 transition-colors">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-[#fdc106] border-b-2 border-[#fdc106]"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Overview ---------------- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Buses", value: stats.totalBuses, icon: Bus },
            { label: "Active Buses", value: stats.activeBuses, icon: Calendar },
            { label: "Conductors", value: stats.totalConductors, icon: Users },
            { label: "Monthly Earnings", value: `LKR ${stats.monthlyEarnings.toLocaleString()}`, icon: DollarSign },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                </div>
                <item.icon className="w-12 h-12 text-[#fdc106]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- Buses ---------------- */}
      {activeTab === "buses" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Buses</h3>
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
          </div>

          {ownerBuses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">No buses added yet.</p>
          ) : (
            ownerBuses.map((bus) => (
              <div key={bus.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{bus.name ?? "Unnamed Bus"}</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {bus.type ?? "Unknown Type"} • {getRouteName(bus.routeId)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleBusStatus(bus.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bus.status)}`}
                    >
                      {formatStatus(bus.status)}
                    </button>
                    <button onClick={() => handleEditBus(bus)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteBus(bus.id)} className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {showBusModal && (
            <AddBusModal
              onClose={() => {
                setShowBusModal(false);
                setEditingBus(null);
              }}
              editingBus={editingBus}
            />
          )}
        </div>
      )}

      {/* ---------------- Conductors ---------------- */}
      {activeTab === "conductors" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Conductors</h3>
            <button
              onClick={() => setShowAddConductorModal(true)}
              className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Conductor</span>
            </button>
          </div>

          {ownerConductors.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">No conductors added yet.</p>
          ) : (
            ownerConductors.map((conductor) => (
              <div key={conductor.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#fdc106] rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-900" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{conductor.name ?? "Unnamed"}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{conductor.phone ?? "-"}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned to: {getBusName(conductor.assignedBusId)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleConductorStatus(conductor.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(conductor.status)}`}
                    >
                      {formatStatus(conductor.status)}
                    </button>
                    <button onClick={() => handleEditConductor(conductor)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteConductor(conductor.id)} className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {showAddConductorModal && (
            <AddConductorModal
              onClose={() => {
                setShowAddConductorModal(false);
                setEditingConductor(null);
              }}
              editingConductor={editingConductor}
            />
          )}
        </div>
      )}

      {/* ---------------- Routes ---------------- */}
      {activeTab === "routes" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Route Management</h3>
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
          </div>

          {ownerRoutes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">No routes added yet.</p>
          ) : (
            ownerRoutes.map((route) => (
              <div
                key={route.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{route.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {route.startPoint} → {route.endPoint} • {route.distance} km • {route.duration}
                  </p>

                  {/* 🚏 Bus Stops */}
                  {route.stops && route.stops.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {route.stops.map((stop, i) => (
                        <li
                          key={i}
                          className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-md"
                        >
                          🚌 {stop}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No stops added</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleRouteStatus(route.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}
                  >
                    {formatStatus(route.status)}
                  </button>
                  <button
                    onClick={() => {
                      setEditingRoute(route);
                      setShowAddRouteModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
            ))
          )}

          {showAddRouteModal && (
            <AddRouteModal
              onClose={() => {
                setShowAddRouteModal(false);
                setEditingRoute(null);
              }}
              editingRoute={editingRoute}
            />
          )}
        </div>
      )}
      
      {activeTab === "assignAgent" && <AssignAgentTab />}
      {activeTab === "Bookingoverview" && <BookingOverviewByDate />}

    </div>
  );
};

export default OwnerDashboard;
