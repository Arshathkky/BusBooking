import React, { useState } from "react";
import { useBus, BusType } from "../../contexts/busDataContexts";
import { useAuth } from "../../contexts/AuthContext";
import { useRouteData } from "../../contexts/RouteDataContext";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Settings,
  Info,
  CalendarDays,
  Route,
  Zap,
  Bus
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ScheduleTab: React.FC = () => {
  const { user } = useAuth();
  const { buses, fetchBuses } = useBus();
  const { routes = [] } = useRouteData() || {};
  const [updating, setUpdating] = useState<string | null>(null);

  const ownerBuses = buses.filter((b) => b.ownerId === user?.id);

  const updateSchedule = async (bus: BusType, updates: Partial<BusType>) => {
    setUpdating(bus.id);
    const API_URL = `${import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api"}/buses`;
    try {
      await axios.put(`${API_URL}/${bus.id}/schedule`, updates);
      await fetchBuses();
    } catch (err) {
      console.error(err);
      alert("Failed to update schedule");
    } finally {
      setUpdating(null);
    }
  };

  const toggleDay = async (bus: BusType, day: string) => {
    const currentSchedule = bus.weeklySchedule || [];
    const newSchedule = currentSchedule.includes(day)
      ? currentSchedule.filter((d) => d !== day)
      : [...currentSchedule, day];

    await updateSchedule(bus, { weeklySchedule: newSchedule });
  };

  const setScheduleMode = async (bus: BusType, mode: "weekly" | "custom") => {
    await updateSchedule(bus, { scheduleMode: mode });
  };

  const addCustomSchedule = async (bus: BusType) => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const dateString = nextWeek.toISOString().split('T')[0];

    const newEntry = {
      date: dateString,
      routeId: bus.routeId,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      price: bus.price
    };

    const currentCustom = bus.customSchedule || [];
    await updateSchedule(bus, { customSchedule: [...currentCustom, newEntry] });
  };

  const updateCustomSchedule = async (bus: BusType, index: number, updates: any) => {
    const currentCustom = [...(bus.customSchedule || [])];
    currentCustom[index] = { ...currentCustom[index], ...updates };
    await updateSchedule(bus, { customSchedule: currentCustom });
  };

  const removeCustomSchedule = async (bus: BusType, index: number) => {
    const currentCustom = (bus.customSchedule || []).filter((_, i) => i !== index);
    await updateSchedule(bus, { customSchedule: currentCustom });
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r._id === routeId);
    return route ? `${route.startPoint} → ${route.endPoint}` : 'Unknown Route';
  };

  const getRouteColor = (routeId: string) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-red-100 text-red-800', 'bg-yellow-100 text-yellow-800'];
    const index = routes.findIndex(r => r._id === routeId) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6">
      {/* Header with Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Advanced Bus Scheduling
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Plan your bus operations with flexible scheduling options. Choose weekly patterns for regular routes or custom schedules for special trips and route variations.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <CalendarDays className="w-4 h-4" />
                <span>Weekly Mode: Perfect for regular schedules</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Route className="w-4 h-4" />
                <span>Custom Mode: Assign different routes per date</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Bus className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ownerBuses.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Buses</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ownerBuses.filter(b => (b.scheduleMode || 'weekly') === 'weekly').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Schedules</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ownerBuses.filter(b => b.scheduleMode === 'custom').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Custom Schedules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bus Schedule Cards */}
      <div className="space-y-6">
        {ownerBuses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
            <Bus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No buses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add buses to your fleet to start scheduling operations.
            </p>
          </div>
        ) : (
          ownerBuses.map((bus) => (
            <div
              key={bus.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border transition-all duration-200 ${
                updating === bus.id ? "opacity-75 pointer-events-none" : "hover:shadow-xl"
              }`}
            >
              {/* Bus Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#fdc106] rounded-full">
                      <Bus className="w-6 h-6 text-gray-900" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">{bus.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {bus.busNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {bus.departureTime}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bus.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {bus.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Mode Selector */}
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setScheduleMode(bus, "weekly")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        (bus.scheduleMode || "weekly") === "weekly"
                          ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <CalendarDays className="w-4 h-4" />
                      Weekly
                    </button>
                    <button
                      onClick={() => setScheduleMode(bus, "custom")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        bus.scheduleMode === "custom"
                          ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Custom
                    </button>
                  </div>
                </div>
              </div>

              {/* Schedule Content */}
              <div className="p-6">
                {/* Weekly Schedule */}
                {(bus.scheduleMode || "weekly") === "weekly" && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Weekly Operating Days
                      </h5>
                      <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                        {(bus.weeklySchedule || []).length} days active
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {DAYS.map((day) => {
                        const currentSchedule = bus.weeklySchedule || [];
                        const isActive = currentSchedule.includes(day);
                        return (
                          <button
                            key={day}
                            onClick={() => toggleDay(bus, day)}
                            className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                              isActive
                                ? "bg-[#fdc106] border-[#fdc106] text-gray-900 shadow-md transform scale-105"
                                : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#fdc106] hover:bg-[#fdc106]/10"
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-semibold text-sm mb-1">{day.slice(0, 3)}</div>
                              {isActive && (
                                <CheckSquare className="w-4 h-4 mx-auto text-gray-900" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          This bus will operate on the selected days with its default route: <strong>{getRouteName(bus.routeId)}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Schedule */}
                {bus.scheduleMode === "custom" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Custom Schedule
                        </h5>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({(bus.customSchedule || []).length} assignments)
                        </span>
                      </div>

                      <button
                        onClick={() => addCustomSchedule(bus)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Assignment
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(bus.customSchedule || []).length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <h6 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No custom assignments yet
                          </h6>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Add date-specific route assignments for special trips or route variations.
                          </p>
                          <button
                            onClick={() => addCustomSchedule(bus)}
                            className="px-4 py-2 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 rounded-lg font-medium transition-colors"
                          >
                            Create First Assignment
                          </button>
                        </div>
                      ) : (
                        (bus.customSchedule || [])
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((entry, index) => (
                          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={entry.date}
                                  onChange={(e) => updateCustomSchedule(bus, index, { date: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Route
                                </label>
                                <select
                                  value={entry.routeId}
                                  onChange={(e) => updateCustomSchedule(bus, index, { routeId: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                                >
                                  {routes.filter(r => r.ownerId === user?.id).map(route => (
                                    <option key={route._id} value={route._id}>
                                      {route.startPoint} → {route.endPoint}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Departure
                                </label>
                                <input
                                  type="time"
                                  value={entry.departureTime || ""}
                                  onChange={(e) => updateCustomSchedule(bus, index, { departureTime: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Price (LKR)
                                </label>
                                <input
                                  type="number"
                                  value={entry.price || ""}
                                  onChange={(e) => updateCustomSchedule(bus, index, { price: parseFloat(e.target.value) || undefined })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                                  placeholder="Default"
                                />
                              </div>

                              <div className="flex items-center pb-1">
                                <button
                                  onClick={() => removeCustomSchedule(bus, index)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Remove assignment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRouteColor(entry.routeId)}`}>
                                  {getRouteName(entry.routeId)}
                                </span>
                                {entry.departureTime && (
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Departs: {entry.departureTime}
                                  </span>
                                )}
                                {entry.price && (
                                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                    LKR {entry.price.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(entry.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          Custom schedules override the default route and timing. The bus will only appear in search results for the dates and routes specified here.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;
