import React, { useState, useMemo } from "react";
import { useBus, SeatType } from "../../contexts/busDataContexts";
import { useConductor } from "../../contexts/conductorDataContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const AssignAgentTab: React.FC = () => {
  const { user } = useAuth();
  const { buses, fetchBuses, loading } = useBus();
  const { conductors } = useConductor();

  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Filter buses and agents for this owner
  const ownerBuses = useMemo(
    () => buses.filter((b) => b.ownerId === user?.id),
    [buses, user]
  );
  const agents = useMemo(
    () => conductors.filter((c) => c.role === "agent" && c.ownerId === user?.id),
    [conductors, user]
  );

  const selectedBus = ownerBuses.find((b) => b.id === selectedBusId);

  // Build seat layout with display info
  const seatLayout = useMemo(() => {
    if (!selectedBus) return [];
    return selectedBus.seats.map((seat) => ({
      ...seat,
      highlight: selectedAgentId ? seat.agentId === selectedAgentId : false,
      displayName:
        seat.agentAssigned && seat.agentId
          ? `${seat.agentCode?.[0] || "A"}${seat.seatNumber}`
          : "",
    }));
  }, [selectedBus, selectedAgentId]);

  const rows = Math.ceil(seatLayout.length / 5);

  // Handle seat click
  const handleSeatClick = (seat: SeatType) => {
    // Block normal occupied seats
    if (seat.isOccupied) return;

    // Allow selection if empty OR assigned to selected agent
    if (seat.agentAssigned && seat.agentId !== selectedAgentId) return;

    setSelectedSeats((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((n) => n !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  // Assign seats to agent
  const assignSeatsToAgent = async () => {
    if (!selectedBusId || !selectedAgentId || selectedSeats.length === 0) {
      alert("⚠️ Select bus, agent, and seats first");
      return;
    }

    setAssigning(true);
    try {
      await axios.put(`https://bus-booking-nt91.onrender.com/api/buses/${selectedBusId}/agent-seats`, {
        agentId: selectedAgentId,
        seatNumbers: selectedSeats,
        markAsOccupied: false,
      });
      alert("✅ Seats assigned successfully!");
      setSelectedSeats([]);
      await fetchBuses();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to assign seats");
    } finally {
      setAssigning(false);
    }
  };

  // Remove selected agent seats
  const removeAgentSeats = async () => {
    if (!selectedBusId || !selectedAgentId || selectedSeats.length === 0) {
      alert("⚠️ Select bus, agent, and seats to remove");
      return;
    }

    setRemoving(true);
    try {
      await axios.patch(`http://localhost:5000/api/buses/${selectedBusId}/agent-seats/remove`, {
        seatNumbers: selectedSeats,
      });
      alert("✅ Agent seat assignment removed!");
      setSelectedSeats([]);
      await fetchBuses();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to remove seats");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Assign / Remove Agent Seats
      </h3>

      {/* Bus Select */}
      <select
        value={selectedBusId}
        onChange={(e) => {
          setSelectedBusId(e.target.value);
          setSelectedSeats([]);
        }}
        className="w-full mb-4 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
      >
        <option value="">Select Bus</option>
        {ownerBuses.map((bus) => (
          <option key={bus.id} value={bus.id}>
            {bus.name} ({bus.type})
          </option>
        ))}
      </select>

      {/* Agent Select */}
      <select
        value={selectedAgentId}
        onChange={(e) => {
          setSelectedAgentId(e.target.value);
          setSelectedSeats([]);
        }}
        className="w-full mb-4 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
      >
        <option value="">Select Agent</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name} ({agent.agentCode})
          </option>
        ))}
      </select>

      {/* Seat Layout */}
      {selectedBus && selectedAgentId && (
        <div className="mb-4">
          <div className="grid gap-2">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex justify-center space-x-2">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => {
                    const seat = seatLayout[rowIndex * 5 + i];
                    if (!seat) return null;
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-12 h-12 rounded-lg border text-sm font-semibold flex items-center justify-center transition
                          ${
                            seat.isOccupied
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : seat.agentAssigned && seat.agentId !== selectedAgentId
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : seat.agentId === selectedAgentId
                              ? "bg-yellow-300 text-black border-yellow-500"
                              : isSelected
                              ? "bg-blue-300 border-blue-500"
                              : seat.isLadiesOnly
                              ? "bg-pink-200 text-pink-900"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100"
                          }`}
                        title={
                          seat.isOccupied
                            ? "Occupied"
                            : seat.isLadiesOnly
                            ? "Ladies Only"
                            : seat.agentAssigned
                            ? `Agent: ${seat.agentCode}`
                            : "Available"
                        }
                      >
                        {seat.displayName || seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
                <div className="w-8" />
                <div className="flex space-x-1">
                  {[3, 4].map((i) => {
                    const seat = seatLayout[rowIndex * 5 + i];
                    if (!seat) return null;
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-12 h-12 rounded-lg border text-sm font-semibold flex items-center justify-center transition
                          ${
                            seat.isOccupied
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : seat.agentAssigned && seat.agentId !== selectedAgentId
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : seat.agentId === selectedAgentId
                              ? "bg-yellow-300 text-black border-yellow-500"
                              : isSelected
                              ? "bg-blue-300 border-blue-500"
                              : seat.isLadiesOnly
                              ? "bg-pink-200 text-pink-900"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100"
                          }`}
                        title={
                          seat.isOccupied
                            ? "Occupied"
                            : seat.isLadiesOnly
                            ? "Ladies Only"
                            : seat.agentAssigned
                            ? `Agent: ${seat.agentCode}`
                            : "Available"
                        }
                      >
                        {seat.displayName || seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={assignSeatsToAgent}
          disabled={assigning || loading}
          className={`flex-1 py-2 rounded-lg font-medium ${
            assigning || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {assigning ? "Assigning..." : "Assign Seats"}
        </button>
        <button
          onClick={removeAgentSeats}
          disabled={removing || loading}
          className={`flex-1 py-2 rounded-lg font-medium ${
            removing || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {removing ? "Removing..." : "Remove Selected Seats"}
        </button>
      </div>
    </div>
  );
};

export default AssignAgentTab;
