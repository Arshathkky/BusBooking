import React, { useState, useEffect } from "react";
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

const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "buses" | "conductors" | "routes" | "assignAgent">("overview"); 
  const [editingRoute, setEditingRoute] = useState<RouteType | null>(null);

  // ---------------- Owner Overview ----------------
  interface OwnerOverview {
    totalBuses: number;
    activeBuses: number;
    totalConductors: number;
    totalBookings: number;
    totalRoutes: number;
    activeRoutes: number;
    todayBookings: number;
    monthlyEarnings: number;
    todayEarnings: number;
    totalRevenue?: number;
    [key: string]: number | string | undefined;
  }

  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const { user } = useAuth();
  const API_URL = "https://bus-booking-nt91.onrender.com/api/owner";

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}`
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`
  );
  const [selectedBus, setSelectedBus] = useState<string>("all");

  useEffect(() => {
    if (user?.id) fetchOverview(selectedMonth, selectedDate, selectedBus);
  }, [user]);

  const fetchOverview = async (month?: string, date?: string, bus?: string) => {
    if (!user?.id) return;
    setLoadingOverview(true);
    try {
      let url = `${API_URL}/${user.id}/overview?`;
      if (date) url += `date=${date}`;
      else url += `month=${month}`;
      if (bus && bus !== "all") url += `&busId=${bus}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setOverview({
          totalBuses: data.data.totalBuses ?? 0,
          activeBuses: data.data.activeBuses ?? 0,
          totalConductors: data.data.totalConductors ?? 0,
          totalBookings: data.data.totalBookings ?? 0,
          totalRoutes: data.data.totalRoutes ?? 0,
          activeRoutes: data.data.activeRoutes ?? 0,

          // Today values: show filtered date values if a date is selected
          todayBookings: date ? data.data.filteredBookings ?? 0 : data.data.todayBookings ?? 0,
          todayEarnings: date ? data.data.filteredEarnings ?? 0 : data.data.todayEarnings ?? 0,

          // Monthly earnings always for the selected month
          monthlyEarnings: data.data.monthlyEarnings ?? 0,
          totalRevenue: data.data.totalRevenue ?? 0,
        });
        setOverviewError(null);
      } else {
        setOverviewError(data.message || "Could not load overview data.");
      }
    } catch (err) {
      console.error(err);
      setOverviewError("Network error while loading dashboard.");
    } finally {
      setLoadingOverview(false);
    }
  };

  // ---------------- Modals ----------------
  const [showBusModal, setShowBusModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddConductorModal, setShowAddConductorModal] = useState(false);
  const [editingBus, setEditingBus] = useState<BusType | null>(null);
  const [editingConductor, setEditingConductor] = useState<ConductorType | null>(null);

  const { buses, deleteBus, toggleBusStatus } = useBus();
  const { routes, deleteRoute, toggleRouteStatus } = useRouteData();
  const { conductors, deleteConductor, toggleConductorStatus } = useConductor();

  const ownerBuses = buses.filter((bus) => String(bus.ownerId) === String(user?.id));
  const ownerConductors = conductors.filter((c) => String(c.ownerId) === String(user?.id));
  const ownerRoutes = routes.filter((r) => String(r.ownerId) === String(user?.id));

  // ---------------- Helper ----------------
  const getRouteName = (routeId?: string) => routeId ? routes.find(r => r.id === routeId)?.name ?? "Unknown" : "Unassigned";
  const getBusName = (busId?: string) => busId ? ownerBuses.find(b => b.id === busId)?.name ?? "Unknown Bus" : "Unassigned";
  const getStatusColor = (status?: string) => status === "active" ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900" : "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
  const formatStatus = (status?: string) => (status ?? "inactive")[0].toUpperCase() + (status ?? "inactive").slice(1);

  const handleEditBus = (bus: BusType) => { setEditingBus(bus); setShowBusModal(true); };
  const handleEditConductor = (c: ConductorType) => { setEditingConductor(c); setShowAddConductorModal(true); };

  const tabs: Array<"overview" | "buses" | "conductors" | "routes" | "assignAgent"> =
    ["overview", "buses", "conductors", "routes", "assignAgent"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Owner Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your buses, routes, and conductors efficiently</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 sticky top-0 z-20">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === tab ? "text-[#fdc106] border-b-2 border-[#fdc106]" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Overview ---------------- */}
      {activeTab === "overview" && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-end mb-6 items-end">
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium mb-1">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium mb-1">Bus</label>
              <select
                value={selectedBus}
                onChange={e => setSelectedBus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-400 transition"
              >
                <option value="all">All Buses</option>
                {ownerBuses.map(bus => <option key={bus.id} value={bus.id}>{bus.name}</option>)}
              </select>
            </div>
            <button
              onClick={() => fetchOverview(selectedMonth, selectedDate, selectedBus)}
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-semibold shadow transition"
            >Apply</button>
          </div>

          {loadingOverview && <p className="text-center text-gray-500 dark:text-gray-400">Loading analytics...</p>}
          {overviewError && <p className="text-center text-red-500">{overviewError}</p>}

          {overview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Buses", value: overview.totalBuses, icon: Bus },
                { label: "Active Buses", value: overview.activeBuses, icon: Calendar },
                { label: "Conductors", value: overview.totalConductors, icon: Users },
                { label: "Total Routes", value: overview.totalRoutes, icon: Bus },
                { label: "Active Routes", value: overview.activeRoutes, icon: Calendar },
                { label: selectedDate ? "Bookings (Selected Date)" : "Today's Bookings", value: overview.todayBookings, icon: Users },
                { label: selectedDate ? "Earnings (Selected Date)" : "Today's Earnings", value: `LKR ${overview.todayEarnings.toLocaleString()}`, icon: DollarSign },
                { label: "Monthly Earnings", value: `LKR ${overview.monthlyEarnings.toLocaleString()}`, icon: DollarSign },
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                  <item.icon className="w-12 h-12 text-[#fdc106]" />
                </div>
              ))}
            </div>
          )}
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

      {/* ---------------- Assign Agent Tab ---------------- */}
      {activeTab === "assignAgent" && (
        <div>
          <AssignAgentTab />
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;

