import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bus, MapPin, Clock } from "lucide-react";

interface BusDetails {
  name: string;
  busNumber: string;
  route: string;
  departureTime: string;
}

interface DashboardData {
  bus: BusDetails;
  assignedSeats: number[];
}

const AgentDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get agent info from localStorage
  const storedAgent = localStorage.getItem("agent");
  const agent = storedAgent ? JSON.parse(storedAgent) : null;
  const agentId = agent?._id;

  useEffect(() => {
    if (!agentId) {
      setError("Agent ID is missing. Please login again.");
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await axios.get<DashboardData>(
          `http://localhost:5000/api/agent/dashboard/${agentId}`
        );
        setData(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error("Dashboard fetch error:", err.message);
        } else if (err instanceof Error) {
          console.error("Dashboard fetch error:", err.message);
        } else {
          console.error("Unknown error fetching dashboard");
        }
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [agentId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen">
        No data available
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Bus Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bus className="text-blue-600" />
            <h2 className="text-xl font-bold">Assigned Bus</h2>
          </div>

          <div className="space-y-2 text-gray-700">
            <p><strong>Name:</strong> {data.bus.name}</p>
            <p><strong>Bus Number:</strong> {data.bus.busNumber}</p>

            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{data.bus.route}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Departure: {data.bus.departureTime}</span>
            </div>
          </div>
        </div>

        {/* Assigned Seats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Assigned Seats</h2>

          {data.assignedSeats.length === 0 ? (
            <p className="text-gray-500">No seats assigned</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {data.assignedSeats.map((seat) => (
                <div
                  key={seat}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold"
                >
                  Seat {seat}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AgentDashboard;