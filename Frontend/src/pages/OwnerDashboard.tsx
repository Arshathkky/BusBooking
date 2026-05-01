import React, { useState, useEffect } from "react";
import {
  Plus,
  Bus,
  Users,
  DollarSign,
  Calendar,
  CreditCard as Edit,
  Trash2,
  Activity,
  ArrowRight,
  Clock,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AddBusModal from "../components/AddBusModal";
import AddConductorModal from "../components/AddConductorModal";
import { BusType, useBus } from "../contexts/busDataContexts";
import { useConductor, ConductorType } from "../contexts/conductorDataContext";
import { useRouteData, RouteType } from "../contexts/RouteDataContext";
import AddRouteModal from "../components/AddRouteModal";
import AssignConductorTab from "./ownerDashboard/AssignTab";
import ScheduleTab from "./ownerDashboard/ScheduleTab";
import jsPDF from "jspdf";
import "jspdf-autotable";
const BASE_URL = import.meta.env.VITE_API_URL || 'https://bus-booking-nt91.onrender.com/api';
const API_URL = `${BASE_URL}/owner`;
const BOOKING_API = `${BASE_URL}/bookings`;

const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "buses" | "conductors" | "routes" | "assignConductor" | "schedule" | "portal">("overview"); 
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
  const { buses, deleteBus, toggleBusStatus } = useBus();
  const { routes, deleteRoute, toggleRouteStatus } = useRouteData();
  const { conductors, deleteConductor, toggleConductorStatus } = useConductor();

  const ownerBuses = buses.filter((bus) => String(bus.ownerId) === String(user?.id));
  const ownerConductors = conductors.filter((c) => String(c.ownerId) === String(user?.id));
  const ownerRoutes = routes.filter((r) => String(r.ownerId) === String(user?.id));


  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}`
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`
  );
  const [selectedBus, setSelectedBus] = useState<string>("all");
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [selectedBusForManifest, setSelectedBusForManifest] = useState<BusType | null>(null);

  useEffect(() => {
    if (user?.id) {
        fetchOverview(selectedMonth, selectedDate, selectedBus);
    }
  }, [user, selectedMonth, selectedDate, selectedBus]);

  useEffect(() => {
    if (ownerBuses.length > 0) {
        fetchRecentBookings();
    }
  }, [ownerBuses.length]);

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(() => {
        if (user?.id && activeTab === "overview") {
            fetchOverview(selectedMonth, selectedDate, selectedBus);
            fetchRecentBookings();
        }
    }, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [user, activeTab, selectedMonth, selectedDate, selectedBus]);

  const fetchOverview = async (month?: string, date?: string, bus?: string) => {
  if (!user?.id) return;
  setLoadingOverview(true);
  try {
    let url = `${API_URL}/${user.id}/overview?`;

    // ✅ If month is selected, use month and ignore date
    if (month) {
      url += `month=${month}`;
    } else if (date) {
      url += `date=${date}`;
    }

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

        // Show bookings/earnings depending on selection
        todayBookings: date && !month ? data.data.filteredBookings ?? 0 : data.data.todayBookings ?? 0,
        todayEarnings: date && !month ? data.data.filteredEarnings ?? 0 : data.data.todayEarnings ?? 0,

        // Monthly earnings will always update based on selected month
        monthlyEarnings: data.data.filteredEarnings ?? 0,
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

const fetchRecentBookings = async () => {
    if (ownerBuses.length === 0) return;
    try {
        const busIds = ownerBuses.map(b => b.id);
        const res = await fetch(`${BOOKING_API}/owner-recent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ busIds })
        });
        const data = await res.json();
        if (data.success) setRecentBookings(data.bookings);
    } catch (err) {
        console.error("Failed to fetch recent bookings:", err);
    }
};

  // ---------------- Modals ----------------
  const [showBusModal, setShowBusModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddConductorModal, setShowAddConductorModal] = useState(false);
  const [editingBus, setEditingBus] = useState<BusType | null>(null);
  const [editingConductor, setEditingConductor] = useState<ConductorType | null>(null);



  // ---------------- Helper ----------------
  const getRouteName = (routeId?: string) => routeId ? routes.find(r => r.id === routeId)?.name ?? "Unknown" : "Unassigned";
  const getBusName = (busId?: string) => busId ? ownerBuses.find(b => b.id === busId)?.name ?? "Unknown Bus" : "Unassigned";
  const getStatusColor = (status?: string) => status === "active" ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900" : "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
  const formatStatus = (status?: string) => (status ?? "inactive")[0].toUpperCase() + (status ?? "inactive").slice(1);

  const handleEditBus = (bus: BusType) => { setEditingBus(bus); setShowBusModal(true); };
  const handleEditConductor = (c: ConductorType) => { setEditingConductor(c); setShowAddConductorModal(true); };

  const tabs: Array<"overview" | "buses" | "conductors" | "routes" | "assignConductor" | "schedule" | "portal"> =
    ["overview", "buses", "conductors", "routes", "assignConductor", "schedule", "portal"];

  const ownerData = (user as any)?.ownerData; // Assuming auth context provides this or we fetch it
  const canAddBuses = ownerData?.canAddBuses !== false;
  const canAddConductors = ownerData?.canAddConductors !== false;
  const canManageBookings = ownerData?.canManageBookings !== false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      {/* Header with Global Date Picker */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-700 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-1 uppercase italic tracking-tighter">Owner Dashboard</h1>
          <p className="text-gray-500 font-bold text-sm tracking-tight">Intelligence & Operational Management • Surena Travels</p>
        </div>
        
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm animate-in slide-in-from-right-4 duration-500">
           <div className="pl-6 py-2">
              <p className="text-[9px] font-black uppercase text-[#fdc106] tracking-widest mb-1">Global Operational Date</p>
              <div className="flex items-center gap-3">
                 <Calendar className="w-5 h-5 text-gray-400" />
                 <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-gray-900 dark:text-white font-black uppercase text-sm tracking-tighter outline-none cursor-pointer"
                 />
              </div>
           </div>
           <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
           <button 
             onClick={() => fetchOverview(selectedMonth, selectedDate, selectedBus)}
             className="bg-[#fdc106] text-gray-900 p-4 rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#fdc106]/20"
           >
             <RefreshCw className="w-5 h-5" />
           </button>
        </div>
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
              {tab === "portal" ? "Conductor Portal" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Overview ---------------- */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
          {/* Real-time Status Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-blue-100 mb-2">
                <Activity className="w-4 h-4 animate-pulse text-[#fdc106]" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Fleet Intelligence Hub</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter">FLEET OPERATIONS</h2>
              <p className="text-blue-100 opacity-80 text-sm font-medium mt-1">Surena Travels Batticaloa • LIVE MONITORING ENABLED</p>
            </div>
            <div className="relative z-10 flex bg-black/20 backdrop-blur-xl rounded-[2rem] p-4 border border-white/10 items-center space-x-1">
              <div className="text-center px-6 border-r border-white/10">
                <div className="text-3xl font-black tracking-tighter">{overview?.activeBuses || 0}</div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-60">Active</div>
              </div>
              <div className="text-center px-6">
                <div className="text-3xl font-black tracking-tighter">{overview?.totalConductors || 0}</div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-60">Staff</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Revenue" 
                value={`${(overview?.todayEarnings || 0).toLocaleString()} LKR`} 
                trend={`${selectedMonth ? "Monthly" : "Selected Date"}`} 
                icon={<DollarSign className="w-5 h-5 text-green-600" />} 
                bg="bg-white dark:bg-gray-800"
            />
            <StatCard 
                title="Bookings" 
                value={overview?.todayBookings || 0} 
                trend="Paid Seats" 
                icon={<Users className="w-5 h-5 text-blue-600" />} 
                bg="bg-white dark:bg-gray-800"
            />
            <StatCard 
                title="Network" 
                value={overview?.totalRoutes || 0} 
                trend={`${overview?.activeRoutes} Active`} 
                icon={<MapPin className="w-5 h-5 text-orange-600" />} 
                bg="bg-white dark:bg-gray-800"
            />
            <StatCard 
                title="Utilization" 
                value={`${overview?.activeBuses}/${overview?.totalBuses}`} 
                trend="Total Fleet" 
                icon={<Bus className="w-5 h-5 text-purple-600" />} 
                bg="bg-white dark:bg-gray-800"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-2 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[200px] flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 px-6 py-3 rounded-2xl">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select 
                value={selectedMonth} 
                onChange={(e) => { setSelectedMonth(e.target.value); }} 
                className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer w-full uppercase"
              >
                <option value="">Month-wise Trend</option>
                {Array.from({ length: 6 }).map((_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
                  return <option key={val} value={val}>{d.toLocaleString('default', { month: 'long', year: 'numeric' })}</option>;
                })}
              </select>
            </div>

            <div className="flex-1 min-w-[200px] flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 px-6 py-3 rounded-2xl font-bold text-sm text-gray-400 italic">
               Viewing Data for: <span className="text-[#fdc106] ml-2 uppercase font-black tracking-tight">{selectedDate || selectedMonth || "Today"}</span>
            </div>

            <div className="flex-1 min-w-[200px] flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 px-6 py-3 rounded-2xl">
              <Bus className="w-4 h-4 text-gray-400" />
              <select 
                value={selectedBus} 
                onChange={(e) => setSelectedBus(e.target.value)} 
                className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer w-full uppercase"
              >
                <option value="all">Entire Fleet</option>
                {ownerBuses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <button 
                onClick={() => fetchOverview(selectedMonth, selectedDate, selectedBus)}
                className="bg-[#fdc106] hover:bg-black hover:text-[#fdc106] px-8 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-[#fdc106]/20 font-black text-xs uppercase tracking-widest"
            >
                Generate Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-50 dark:border-gray-700 overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center space-x-3 tracking-tighter">
                        <Activity className="w-6 h-6 text-red-500" />
                        <span>REAL-TIME BOOKINGS</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Traffic</span>
                    </div>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
                    {recentBookings.length === 0 ? (
                        <div className="p-20 text-center">
                             <div className="bg-gray-50 dark:bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-gray-300" />
                             </div>
                             <p className="text-gray-400 font-bold">No recent transactions</p>
                        </div>
                    ) : (
                        recentBookings.map((booking) => (
                            <div key={booking._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center justify-between group cursor-default">
                                <div className="flex items-center space-x-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${booking.paymentStatus === "PAID" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                                        {booking.paymentStatus === "PAID" ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="font-black text-base italic uppercase tracking-tight">{booking.passengerDetails?.name || "GUEST CUSTOMER"}</div>
                                        <div className="flex items-center space-x-3 text-xs font-bold text-gray-500 mt-0.5">
                                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[10px]">{booking.bus?.name}</span>
                                            <span>•</span>
                                            <span>{booking.selectedSeats?.length} Seats</span>
                                            <span>•</span>
                                            <span className="text-gray-400">{new Date(booking.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-xl tracking-tighter text-gray-900 dark:text-white">{booking.totalAmount?.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold">LKR</span></div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${booking.paymentStatus === "PAID" ? "text-green-500" : "text-yellow-600"}`}>{booking.paymentStatus}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-black text-lg mb-6 flex items-center space-x-3 italic uppercase tracking-tight">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        <span>Target Performance</span>
                    </h3>
                    <div className="space-y-6">
                        {ownerBuses.slice(0, 4).map((bus, idx) => (
                            <div key={bus.id} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{bus.busNumber}</div>
                                        <div className="text-sm font-bold">{bus.name}</div>
                                    </div>
                                    <div className="text-sm font-black text-indigo-600 italic">{(65 + idx * 7)}%</div>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${65 + idx * 7}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#fdc106]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="bg-[#fdc106] w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                            <Activity className="w-6 h-6 text-gray-900" />
                        </div>
                        <h4 className="text-xl font-black mb-3 italic uppercase tracking-tight">Need Operations Support?</h4>
                        <p className="text-sm text-gray-400 font-medium mb-6 leading-relaxed">Our technical team is ready to help you with multi-tenant fleet configurations.</p>
                        <button className="w-full py-4 bg-white text-gray-900 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-[#fdc106] transition-all active:scale-95">24/7 SUPPORT</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}




      {/* ---------------- Buses ---------------- */}
      {activeTab === "buses" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Buses</h3>
            {canAddBuses && (
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
            )}
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
            {canAddConductors && (
              <button
                onClick={() => setShowAddConductorModal(true)}
                className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Conductor</span>
              </button>
            )}
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
            {canAddBuses && (
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
            )}
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

      {/* ---------------- Assign Conductor Tab ---------------- */}
      {activeTab === "assignConductor" && (
        <AssignConductorTab />
      )}

      {/* ---------------- Schedule Tab ---------------- */}
      {activeTab === "schedule" && (
        <ScheduleTab />
      )}

      {/* ---------------- Portal Tab (Manifest View) ---------------- */}
      {activeTab === "portal" && (
        <div className="space-y-6">
            {selectedBusForManifest ? (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <button 
                            onClick={() => setSelectedBusForManifest(null)}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 p-2 rounded-xl flex items-center space-x-2 text-sm font-bold transition-all"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            <span>Return to Fleet List</span>
                        </button>
                        <div className="text-right">
                             <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
                                 {selectedBusForManifest.name}
                             </h2>
                             <p className="text-[10px] font-black text-[#fdc106] uppercase tracking-[0.2em] mt-1">{selectedBusForManifest.busNumber} • FLEET COMMAND</p>
                        </div>
                    </div>

                    {/* This is a simplified "Conductor Dashboard" within the Owner View */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        <div className="xl:col-span-3 space-y-6">
                           <ManifestTable busId={selectedBusForManifest.id} travelDate={selectedDate || new Date().toISOString().slice(0, 10)} />
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold mb-4 flex items-center space-x-2">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    <span>Route Checkpoints</span>
                                </h3>
                                <div className="space-y-4">
                                    <Checkpoint label="Batticaloa" time="08:00 AM" status="completed" />
                                    <Checkpoint label="Valaichchenai" time="08:45 AM" status="current" />
                                    <Checkpoint label="Polonnaruwa" time="10:30 AM" status="pending" />
                                    <Checkpoint label="Colombo" time="04:30 PM" status="pending" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-2 flex items-center space-x-3">
                                <Activity className="w-8 h-8 text-[#fdc106]" />
                                <span>OWNER OPERATIONS PORTAL</span>
                            </h3>
                            <p className="text-gray-400 max-w-lg mb-6">Access live manifests, override seat statuses, and monitor passenger check-ins directly via the operational gateway.</p>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fdc106]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ownerBuses.map(bus => (
                            <div key={bus.id} className="group bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-[#fdc106]/30 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl group-hover:bg-[#fdc106]/10 transition-colors">
                                        <Bus className="w-6 h-6 text-gray-400 group-hover:text-[#fdc106]" />
                                    </div>
                                    {bus.status === "active" && (
                                        <span className="flex items-center space-x-1 text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            <span>Live</span>
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-lg font-bold mb-1">{bus.name}</h4>
                                <p className="text-xs text-gray-500 font-bold mb-6">{bus.busNumber} • {bus.type}</p>
                                
                                <button 
                                    className="w-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all hover:bg-[#fdc106] hover:text-gray-900 active:scale-95"
                                    onClick={() => setSelectedBusForManifest(bus)}
                                >
                                    <span>Direct Manifest Management</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;

// ---------------- SUBS ----------------

const StatCard: React.FC<{ title: string; value: string | number; trend?: string; icon: React.ReactNode; bg?: string }> = ({ title, value, trend, icon, bg }) => (
  <div className={`${bg || "bg-white dark:bg-gray-800"} p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-xl hover:border-[#fdc106]/30 transition-all duration-500`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">{icon}</div>
      {trend && <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{trend}</span>}
    </div>
    <div>
      <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <div className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">{value}</div>
    </div>
  </div>
);

const Checkpoint: React.FC<{ label: string; time: string; status: "completed" | "current" | "pending" }> = ({ label, time, status }) => (
  <div className="flex items-center space-x-4">
    <div className={`w-3 h-3 rounded-full ${status === 'completed' ? 'bg-green-500' : status === 'current' ? 'bg-[#fdc106] animate-ping' : 'bg-gray-200'}`} />
    <div className="flex-1">
      <div className={`text-sm font-bold ${status === 'pending' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{label}</div>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{time}</div>
    </div>
  </div>
);

const ManifestTable: React.FC<{ busId: string; travelDate: string }> = ({ busId, travelDate }) => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [localSeats, setLocalSeats] = useState<any[]>([]);
    const [hasPending, setHasPending] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [selectedManualSeats, setSelectedManualSeats] = useState<(string | number)[]>([]);
    const [actionModal, setActionModal] = useState<{ show: boolean, type: "RESERVE" | "BLOCK" | "OFFLINE" }>({ show: false, type: "RESERVE" });
    const [actionDates, setActionDates] = useState<string[]>([travelDate]);
    const [newDate, setNewDate] = useState<string>("");
    const [passengerData, setPassengerData] = useState({ name: '', phone: '', email: '', nic: '', pickupLocation: '' });
    const { updateBus } = useBus();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // 1. Fetch Manifest
                const res2 = await fetch(`${BOOKING_API}?busId=${busId}&date=${travelDate}`);
                const data = await res2.json();
                if (data.success) {
                    const filtered = data.bookings.filter((b: any) => 
                        b.bus?.id === busId && 
                        b.searchData?.date === travelDate && 
                        (b.paymentStatus === "PAID" || b.paymentStatus === "PENDING" || b.paymentStatus === "BLOCKED" || b.paymentStatus === "OFFLINE")
                    );
                    setBookings(filtered);
                }

                // 2. Fetch Bus State (for blocks)
                const resBus = await fetch(`${BASE_URL}/buses/${busId}`);
                const busData = await resBus.json();
                if (busData.success) {
                    setLocalSeats(busData.data.seats || []);
                    setHasPending(busData.data.hasPendingChanges);
                }
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [busId, travelDate]);

    const handleQuickSave = async (updatedSeats: any[]) => {
        setUpdating(true);
        try {
            await fetch(`https://bus-booking-nt91.onrender.com/api/buses/${busId}/seats`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seats: updatedSeats, role: "owner" })
            });
            await updateBus(busId, { seats: updatedSeats });
            setLocalSeats(updatedSeats);
        } catch (err) {
            alert("Failed to update seat status");
        } finally {
            setUpdating(false);
        }
    };

    const handleApprove = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/buses/${busId}/approve-changes`, { method: "PATCH" });
            const data = await res.json();
            if (data.success) {
                setLocalSeats(data.data.seats);
                setHasPending(false);
                await updateBus(busId, { seats: data.data.seats });
                alert("Conductor's changes approved!");
            }
        } catch (err) {
            alert("Approval failed");
        } finally {
            setUpdating(false);
        }
    };

    const handleResetSeats = async () => {
        if (!window.confirm("Are you sure you want to unblock these seats for ALL DAYS? This will clear all blocks and offline assignments globally.")) return;
        
        setUpdating(true);
        try {
            // 1. Clear Global Flags in Bus model
            const updatedGlobal = localSeats.map(s => {
                if (selectedManualSeats.map(String).includes(String(s.seatNumber))) {
                    return { ...s, isOnline: true, isPermanent: false, isBlocked: false };
                }
                return s;
            });

            // Save global changes to bus model
            await fetch(`${BASE_URL}/buses/${busId}/seats`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seats: updatedGlobal, role: "owner" })
            });
            await updateBus(busId, { seats: updatedGlobal });
            setLocalSeats(updatedGlobal);
            
            // 2. Clear Date-Specific Blocks/Offline (Global Unblock)
            const resUnblock = await fetch(`${BOOKING_API}/unblock-all`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ busId, seatNumbers: selectedManualSeats })
            });
            
            const unblockData = await resUnblock.json();
            
            if (unblockData.success) {
                alert(`Seats unblocked for all days! Removed ${unblockData.deletedCount} block records.`);
            }
            
            // Refresh manifest for current date
            const res2 = await fetch(`${BOOKING_API}?busId=${busId}&date=${travelDate}`);
            const data2 = await res2.json();
            if (data2.success) {
                const filtered = data2.bookings.filter((b: any) => 
                    b.bus?.id === busId && b.searchData?.date === travelDate && 
                    (b.paymentStatus === "PAID" || b.paymentStatus === "PENDING" || b.paymentStatus === "BLOCKED" || b.paymentStatus === "OFFLINE")
                );
                setBookings(filtered);
            }
            
            setSelectedManualSeats([]);
        } catch (err) {
            console.error("Reset failed:", err);
            alert("Reset failed partially or fully.");
        } finally {
            setUpdating(false);
        }
    };

    const handleActionSubmit = async () => {
        if (selectedManualSeats.length === 0) return;
        setUpdating(true);
        try {
            // Find current bus metadata
            const resBus = await fetch(`${BASE_URL}/buses/${busId}`);
            const bD = await resBus.json();
            if (!bD.success) throw new Error("Bus not found");
            const busInfo = bD.data;

            const datesToProcess = actionDates.length > 0 ? actionDates : [travelDate];

            const promises = datesToProcess.map(date => {
                let pStatus = 'PENDING';
                if (actionModal.type === "BLOCK") pStatus = "BLOCKED";
                if (actionModal.type === "OFFLINE") pStatus = "OFFLINE";

                return fetch(`${BOOKING_API}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        bus: {
                            id: busId,
                            name: busInfo.name,
                            type: busInfo.type,
                            busNumber: busInfo.busNumber
                        },
                        searchData: { from: 'Owner Override', to: 'Owner Override', date: date },
                        selectedSeats: selectedManualSeats.map(String),
                        totalAmount: 0,
                        passengerDetails: actionModal.type === "RESERVE" ? passengerData : { name: actionModal.type, phone: 'N/A', nic: 'N/A' },
                        pickupLocation: actionModal.type === "RESERVE" ? passengerData.pickupLocation : "",
                        paymentStatus: pStatus
                    })
                });
            });

            await Promise.all(promises);
            
            alert(`${actionModal.type} operation completed successfully for ${datesToProcess.length} date(s)!`);
            setSelectedManualSeats([]);
            setActionModal({ show: false, type: "RESERVE" });
            setActionDates([travelDate]);
            setPassengerData({ name: '', phone: '', email: '', nic: '', pickupLocation: '' });
            
            // Refresh manifest
            const res2 = await fetch(`${BOOKING_API}?busId=${busId}&date=${travelDate}`);
            const data2 = await res2.json();
            if (data2.success) {
                const filtered = data2.bookings.filter((b: any) => 
                    b.bus?.id === busId && b.searchData?.date === travelDate && 
                    (b.paymentStatus === "PAID" || b.paymentStatus === "PENDING" || b.paymentStatus === "BLOCKED" || b.paymentStatus === "OFFLINE")
                );
                setBookings(filtered);
            }
        } catch (err) {
            alert("Connection error or operation failed");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelBooking = async (bookingId: string, seatNumbers: any[]) => {
        if (!window.confirm(`Are you sure you want to cancel booking for seats: ${seatNumbers.join(", ")}?`)) return;
        setUpdating(true);
        try {
            const res = await fetch(`${BOOKING_API}/${bookingId}/cancel`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ remark: "Owner Manual Cancellation", cancelledBy: 'admin' })
            });
            const data = await res.json();
            if (data.success) {
                // 1. Unblock seats (nothing to do in bus layout anymore as it's booking base)
                alert("Booking cancelled successfully!");
                // 2. Refresh manifest
                const res2 = await fetch(`${BOOKING_API}?busId=${busId}&date=${travelDate}`);
                const data2 = await res2.json();
                if (data2.success) {
                    const filtered = data2.bookings.filter((b: any) => 
                        b.bus?.id === busId && b.searchData?.date === travelDate && 
                        (b.paymentStatus === "PAID" || b.paymentStatus === "PENDING")
                    );
                    setBookings(filtered);
                }
            }
        } catch (err) {
            alert("Cancellation failed");
        } finally {
            setUpdating(false);
        }
    };

    const toggleManualSeat = (num: string | number) => {
        setSelectedManualSeats(prev => {
            const exists = prev.includes(num);
            return exists ? prev.filter(s => s !== num) : [...prev, num];
        });
    };

    const openActionModal = (type: "RESERVE" | "BLOCK" | "OFFLINE", num?: string | number) => {
        if (num && !selectedManualSeats.includes(num)) {
            setSelectedManualSeats(prev => [...prev, num]);
        }
        setActionModal({ show: true, type });
        setActionDates([travelDate]);
    };

    const generatePDF = () => {
        const doc = new jsPDF() as any;
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.text("PASSENGER MANIFEST", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`DATE: ${travelDate}`, 14, 30);
        doc.text(`BUS ID: ${busId}`, 14, 35);
        
        // Table
        const tableColumn = ["Seat(s)", "Passenger Name", "Phone Number", "NIC / ID", "Status"];
        const tableRows = bookings.map(b => [
            b.selectedSeats?.join(", "),
            b.passengerDetails?.name || "RESERVED",
            b.passengerDetails?.phone || "N/A",
            b.passengerDetails?.nic || "N/A",
            "CONFIRMED"
        ]);
        
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], textColor: [253, 193, 6] },
            styles: { fontSize: 9, font: "helvetica" }
        });
        
        doc.save(`Manifest_${travelDate}_${busId}.pdf`);
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-black italic tracking-tighter">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#fdc106]" />
        GENERATING MANIFEST...
    </div>;

    return (
        <div className="space-y-6">
            {hasPending && (
                <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce-subtle">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-amber-900 tracking-tight">PENDING CONDUCTOR REQUEST</h4>
                            <p className="text-sm text-amber-700 font-medium tracking-tight">The assigned conductor has submitted new seat operational changes for review.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={handleApprove} disabled={updating} className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-amber-300/30 transition-all">APPROVE & GO LIVE</button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Manifest for {travelDate}</h3>
                    <button 
                        onClick={generatePDF}
                        className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#fdc106] hover:text-gray-900 transition-all"
                    >Print PDF</button>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">
                            <th className="px-8 py-4">Seat</th>
                            <th className="px-8 py-4">Passenger Info</th>
                            <th className="px-8 py-4 text-right">Fare</th>
                            <th className="px-8 py-4 text-center">Ticket</th>
                            <th className="px-8 py-4 text-center">Void</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {bookings.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">No confirmed passengers for this date.</td></tr>
                        ) : (
                            bookings.map(b => (
                                <tr key={b._id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                    <td className="px-8 py-4">
                                        <div className="px-3 py-2 bg-gray-900 text-[#fdc106] rounded-xl flex items-center justify-center font-black italic shadow-lg w-fit">{b.selectedSeats?.join(", ")}</div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{b.passengerDetails?.name || "RESERVED"}</div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{b.passengerDetails?.phone || "N/A"}</div>
                                        {b.paymentStatus === "BLOCKED" && <div className="text-[10px] font-black tracking-widest text-red-500 mt-1 uppercase">OWNER BLOCKED</div>}
                                        {b.paymentStatus === "OFFLINE" && <div className="text-[10px] font-black tracking-widest text-gray-500 mt-1 uppercase">OFFLINE ASSIGNED</div>}
                                        {b.pickupLocation && <div className="text-[10px] font-black tracking-widest text-blue-600 mt-1 uppercase">📍 {b.pickupLocation}</div>}
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="font-black italic text-gray-900 dark:text-white">{b.totalAmount?.toLocaleString()} <span className="text-[10px] opacity-40">LKR</span></div>
                                        <div className="text-[8px] font-black tracking-widest text-[#fdc106] uppercase">PAID</div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <button 
                                            onClick={() => alert(`Generating Ticket for ${b.passengerDetails?.name}...`)}
                                            className="p-2 bg-gray-900 text-[#fdc106] rounded-lg hover:bg-[#fdc106] hover:text-gray-900 transition-all shadow-md group-hover:scale-110"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        </button>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <button 
                                            onClick={() => handleCancelBooking(b._id, b.selectedSeats)}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Quick Management Grid (Mirror of Conductor Grid) */}
            {/* Multi-Selection Control Bar */}
            {selectedManualSeats.length > 0 && !actionModal.show && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] bg-gray-900 border border-white/20 px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#fdc106] rounded-xl flex items-center justify-center font-black italic shadow-lg text-gray-900">{selectedManualSeats.length}</div>
                        <div className="text-white">
                            <p className="text-xs font-black uppercase tracking-widest leading-none">Seats Selected</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 italic">{selectedManualSeats.join(", ")}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedManualSeats([])} className="px-6 py-2 rounded-xl text-xs font-black text-white hover:bg-white/10 transition-all border border-white/10 uppercase tracking-widest">Clear</button>
                        
                        <button 
                            onClick={() => openActionModal("RESERVE")}
                            className="bg-[#fdc106] text-gray-900 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#fdc106]/20"
                        >Reserve</button>

                        <button 
                            onClick={() => openActionModal("BLOCK")}
                            className="bg-red-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                        >Block</button>

                        <button 
                            onClick={() => openActionModal("OFFLINE")}
                            className="bg-gray-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                        >Offline</button>

                        <button 
                            onClick={handleResetSeats}
                            className="bg-green-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                        >Reset</button>
                    </div>
                </div>
            )}

            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black uppercase text-[#fdc106] tracking-[0.3em] mb-1">Fleet Command</p>
                        <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Quick Seat Operations</h4>
                    </div>
                    <div className="flex gap-4 text-[9px] font-black uppercase tracking-tighter text-gray-400">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Online Availability</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Out of Service</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Owner Block</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                     {localSeats.map(seat => {
                       const isSelected = selectedManualSeats.includes(seat.seatNumber);
                       const isActuallyBooked = bookings.some(b => b.selectedSeats.map(String).includes(String(seat.seatNumber)));

                       return (
                        <div 
                            key={seat.seatNumber} 
                            onClick={() => toggleManualSeat(seat.seatNumber)}
                            className={`border p-4 rounded-2xl space-y-2 transition-all cursor-pointer relative overflow-hidden group ${isSelected ? 'bg-[#fdc106] border-[#fdc106] shadow-lg scale-105 z-10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                           {isSelected && (
                               <div className="absolute top-0 right-0 p-1 bg-black/20 rounded-bl-xl">
                                   <CheckCircle2 className="w-3 h-3 text-white" />
                               </div>
                           )}
                           <div className="flex justify-between items-center">
                                 <span className={`font-black text-lg italic ${isSelected ? 'text-gray-900' : 'text-white'}`}>{seat.seatNumber}</span>
                                 <div className={`w-3 h-3 rounded-full border-2 border-black/10 ${seat.isPermanent ? 'bg-red-500' : isActuallyBooked ? 'bg-indigo-500' : seat.isOnline !== false ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                           </div>
                           <div className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-gray-900/60' : 'text-gray-500'}`}>
                               {seat.isPermanent ? 'Blocked' : isActuallyBooked ? 'Booked' : seat.isOnline !== false ? 'Online' : 'Offline'}
                           </div>
                        </div>
                       );
                     })}
                </div>
            </div>

            {/* Action Modal */}
            {actionModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className={`p-8 text-white relative ${actionModal.type === 'BLOCK' ? 'bg-red-500' : actionModal.type === 'OFFLINE' ? 'bg-gray-600' : 'bg-gray-900'}`}>
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter">
                                {actionModal.type === 'BLOCK' ? 'Block Seats' : actionModal.type === 'OFFLINE' ? 'Set Offline' : 'Owner Reservation'}
                            </h4>
                            <p className="text-gray-200 text-xs font-bold uppercase tracking-widest mt-1">
                                {selectedManualSeats.length} Seats: {selectedManualSeats.join(", ")}
                            </p>
                        </div>
                        <div className="p-8 space-y-6">
                            
                            {/* Date Selection */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end px-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Global Date Selection</label>
                                    <div className="text-[10px] font-black text-[#fdc106]">{actionDates.length} Days Selected</div>
                                </div>
                                
                                <MiniCalendar 
                                    selectedDates={actionDates} 
                                    onToggleDate={(date) => {
                                        setActionDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
                                    }} 
                                />

                                <div className="flex flex-wrap gap-2 max-h-[60px] overflow-y-auto custom-scrollbar">
                                    {actionDates.map(d => (
                                        <div key={d} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                                            {d}
                                            <button onClick={() => setActionDates(actionDates.filter(x => x !== d))} className="text-red-500 hover:text-red-700">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Passenger Details ONLY for RESERVE */}
                            {actionModal.type === "RESERVE" && (
                                <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Passenger Name</label>
                                        <input 
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-sm font-bold focus:ring-[#fdc106]" 
                                            placeholder="Enter full name"
                                            value={passengerData.name}
                                            onChange={(e) => setPassengerData({...passengerData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Phone</label>
                                            <input 
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-sm font-bold focus:ring-[#fdc106]" 
                                                placeholder="07X XXX XXXX"
                                                value={passengerData.phone}
                                                onChange={(e) => setPassengerData({...passengerData, phone: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">NIC / ID Card</label>
                                            <input 
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-sm font-bold focus:ring-[#fdc106]" 
                                                placeholder="ID Number"
                                                value={passengerData.nic}
                                                onChange={(e) => setPassengerData({...passengerData, nic: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Pickup Location</label>
                                        <input 
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-sm font-bold focus:ring-[#fdc106]" 
                                            placeholder="Where to pick up? (text)"
                                            value={passengerData.pickupLocation}
                                            onChange={(e) => setPassengerData({...passengerData, pickupLocation: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setActionModal({ show: false, type: "RESERVE" })}
                                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                >Cancel</button>
                                <button 
                                    onClick={handleActionSubmit}
                                    disabled={updating || (actionModal.type === "RESERVE" && (!passengerData.name || !passengerData.phone))}
                                    className={`flex-[2] py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none ${
                                        actionModal.type === 'BLOCK' ? 'bg-red-500 text-white shadow-red-500/20' : 
                                        actionModal.type === 'OFFLINE' ? 'bg-gray-600 text-white shadow-gray-600/20' : 
                                        'bg-[#fdc106] text-gray-900 shadow-[#fdc106]/20'
                                    }`}
                                >Confirm {actionModal.type}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MINI CALENDAR COMPONENT ---
const MiniCalendar: React.FC<{ 
    selectedDates: string[]; 
    onToggleDate: (date: string) => void;
}> = ({ selectedDates, onToggleDate }) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date());
    
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    const handlePrev = () => setViewDate(new Date(year, month - 1, 1));
    const handleNext = () => setViewDate(new Date(year, month + 1, 1));
    
    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4 px-2">
                <button onClick={handlePrev} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"><ArrowRight className="w-4 h-4 rotate-180" /></button>
                <div className="text-[10px] font-black uppercase tracking-widest">{monthName} {year}</div>
                <button onClick={handleNext} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"><ArrowRight className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
                {['S','M','T','W','T','F','S'].map(d => (
                    <div key={d} className="text-[10px] font-black text-gray-400 py-1">{d}</div>
                ))}
                {days.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} />;
                    
                    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const isSelected = selectedDates.includes(dateStr);
                    const isToday = new Date().toISOString().slice(0,10) === dateStr;
                    
                    return (
                        <button
                            key={dateStr}
                            type="button"
                            onClick={() => onToggleDate(dateStr)}
                            className={`aspect-square rounded-xl text-[10px] font-bold transition-all flex items-center justify-center
                                ${isSelected 
                                    ? 'bg-[#fdc106] text-gray-900 shadow-md scale-110 z-10' 
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}
                                ${isToday ? 'ring-2 ring-[#fdc106] ring-offset-2 dark:ring-offset-gray-900' : ''}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};




