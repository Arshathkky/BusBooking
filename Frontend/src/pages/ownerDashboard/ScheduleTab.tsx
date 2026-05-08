import React, { useState } from "react";
import { useBus, BusType } from "../../contexts/busDataContexts";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { Calendar, Clock, MapPin, CheckSquare, Square } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ScheduleTab: React.FC = () => {
  const { user } = useAuth();
  const { buses, fetchBuses } = useBus();
  const [updating, setUpdating] = useState<string | null>(null);

  const ownerBuses = buses.filter((b) => b.ownerId === user?.id);

  const toggleDay = async (bus: BusType, day: string) => {
    setUpdating(bus.id);
    const currentSchedule = bus.schedule || DAYS;
    const newSchedule = currentSchedule.includes(day)
      ? currentSchedule.filter((d) => d !== day)
      : [...currentSchedule, day];

    const API_URL = `${import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api"}/buses`;
    try {
      await axios.put(`${API_URL}/${bus.id}/schedule`, {
        schedule: newSchedule,
      });
      await fetchBuses();
    } catch (err) {
      console.error(err);
      alert("Failed to update schedule");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#fdc106]" />
          Weekly Operational Schedule
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Define which days each bus is operational. Buses will only appear in search results for their active days.
        </p>

        <div className="space-y-4">
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
                </div>

                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => {
                    const isActive = (bus.schedule || DAYS).includes(day);
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleTab;
