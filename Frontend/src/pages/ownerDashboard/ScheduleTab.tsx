import React, { useState } from "react";
import { useBus, BusType } from "../../contexts/busDataContexts";
import { useAuth } from "../../contexts/AuthContext";
import { useRouteData } from "../../contexts/RouteDataContext";
import axios from "axios";
import { Calendar, Clock, MapPin, CheckSquare, Square, Plus, Trash2, Settings } from "lucide-react";

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
    const today = new Date().toISOString().split('T')[0];
    const newEntry = {
      date: today,
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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#fdc106]" />
          Advanced Bus Scheduling
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose between weekly schedules or custom date-specific assignments. Custom mode allows assigning different routes and times for specific dates.
        </p>

        <div className="space-y-6">
          {ownerBuses.length === 0 ? (
            <div className="text-center py-10 text-gray-500 italic">No buses found to schedule.</div>
          ) : (
            ownerBuses.map((bus) => (
              <div
                key={bus.id}
                className={`border rounded-xl p-5 transition-all ${updating === bus.id ? "opacity-50 pointer-events-none" : "hover:border-yellow-400"}`}
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h4 className="font-bold text-lg dark:text-white">{bus.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {bus.busNumber}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {bus.departureTime}</span>
                    </div>
                  </div>

                  {/* Schedule Mode Selector */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScheduleMode(bus, "weekly")}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        (bus.scheduleMode || "weekly") === "weekly"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setScheduleMode(bus, "custom")}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        bus.scheduleMode === "custom"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {/* Weekly Schedule */}
                {(bus.scheduleMode || "weekly") === "weekly" && (
                  <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Weekly Schedule</h5>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => {
                        const currentSchedule = bus.weeklySchedule || [];
                        const isActive = currentSchedule.includes(day);
                        return (
                          <button
                            key={day}
                            onClick={() => toggleDay(bus, day)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                              isActive
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800"
                                : "bg-gray-50 text-gray-400 border border-gray-100 dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {isActive ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Schedule */}
                {bus.scheduleMode === "custom" && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700 dark:text-gray-300">Custom Schedule</h5>
                      <button
                        onClick={() => addCustomSchedule(bus)}
                        className="flex items-center gap-2 px-3 py-1 bg-[#fdc106] text-gray-900 rounded text-sm hover:bg-[#e6ad05]"
                      >
                        <Plus className="w-4 h-4" />
                        Add Date
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(bus.customSchedule || []).length === 0 ? (
                        <p className="text-gray-500 italic text-sm">No custom schedules added yet.</p>
                      ) : (
                        (bus.customSchedule || []).map((entry, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                                <input
                                  type="date"
                                  value={entry.date}
                                  onChange={(e) => updateCustomSchedule(bus, index, { date: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Route</label>
                                <select
                                  value={entry.routeId}
                                  onChange={(e) => updateCustomSchedule(bus, index, { routeId: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                >
                                  {routes.filter(r => r.ownerId === user?.id).map(route => (
                                    <option key={route._id} value={route._id}>
                                      {route.startPoint} → {route.endPoint}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Departure</label>
                                <input
                                  type="time"
                                  value={entry.departureTime || ""}
                                  onChange={(e) => updateCustomSchedule(bus, index, { departureTime: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Price</label>
                                <input
                                  type="number"
                                  value={entry.price || ""}
                                  onChange={(e) => updateCustomSchedule(bus, index, { price: parseFloat(e.target.value) })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="Default"
                                />
                              </div>

                              <div className="flex items-center">
                                <button
                                  onClick={() => removeCustomSchedule(bus, index)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                              Route: {getRouteName(entry.routeId)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleTab;
