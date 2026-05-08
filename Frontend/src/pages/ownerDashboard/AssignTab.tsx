import React, { useState, useMemo } from "react";
import { useBus, SeatType } from "../../contexts/busDataContexts";
import { useConductor } from "../../contexts/conductorDataContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const AssignConductorTab: React.FC = () => {
  const { user } = useAuth();
  const { buses, fetchBuses, loading } = useBus();
  const { conductors } = useConductor();

  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [selectedConductorId, setSelectedConductorId] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<(string | number)[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Filter buses and conductors for this owner
  const ownerBuses = useMemo(
    () => buses.filter((b) => b.ownerId === user?.id),
    [buses, user]
  );
  const ownerConductors = useMemo(
    () => conductors.filter((c) => c.role === "conductor" && c.ownerId === user?.id),
    [conductors, user]
  );

  const selectedBus = ownerBuses.find((b) => b.id === selectedBusId);

  // Build seat layout with display info
  const seatLayout = useMemo(() => {
    if (!selectedBus) return [];
    return selectedBus.seats.map((seat) => ({
      ...seat,
      highlight: selectedConductorId ? seat.conductorId === selectedConductorId : false,
      displayName:
        seat.conductorAssigned && seat.conductorId
          ? `${seat.conductorCode?.[0] || "A"}${seat.seatNumber}`
          : "",
    }));
  }, [selectedBus, selectedConductorId]);

  const rows = Math.ceil(seatLayout.length / 5);

  // Handle seat click
  const handleSeatClick = (seat: SeatType) => {
    // Block normal occupied seats
    if (seat.isOccupied) return;

    // Allow selection if empty OR assigned to selected conductor
    if (seat.conductorAssigned && seat.conductorId !== selectedConductorId) return;

    setSelectedSeats((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((n) => n !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  // Assign seats to conductor
  const assignSeatsToConductor = async () => {
    if (!selectedBusId || !selectedConductorId || selectedSeats.length === 0) {
      alert("⚠️ Select bus, conductor, and seats first");
      return;
    }

    setAssigning(true);
    const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/buses`;
    try {
      await axios.put(`${API_URL}/${selectedBusId}/conductor-seats`, {
        conductorId: selectedConductorId,
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

  // Remove selected conductor seats
  const removeConductorSeats = async () => {
    if (!selectedBusId || !selectedConductorId || selectedSeats.length === 0) {
      alert("⚠️ Select bus, conductor, and seats to remove");
      return;
    }

    setRemoving(true);
    const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/buses`;
    try {
      await axios.patch(`${API_URL}/${selectedBusId}/conductor-seats/remove`, {
        seatNumbers: selectedSeats,
      });
      alert("✅ Conductor seat assignment removed!");
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
        Assign / Remove Conductor Seats
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

      {/* Conductor Select */}
      <select
        value={selectedConductorId}
        onChange={(e) => {
          setSelectedConductorId(e.target.value);
          setSelectedSeats([]);
        }}
        className="w-full mb-4 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
      >
        <option value="">Select Conductor</option>
        {ownerConductors.map((conductor) => (
          <option key={conductor.id} value={conductor.id}>
            {conductor.name} ({conductor.conductorCode})
          </option>
        ))}
      </select>

      {/* Seat Layout */}
      {selectedBus && selectedConductorId && (
        <div className="mb-4">
          <div className="grid gap-2">
            {Array.from({ length: rows }, (_, rowIndex) => {
              const seatsPerRow = selectedBus.seatLayout === "2x2" ? 4 : 5;
              const start = rowIndex * seatsPerRow;
              // Normally, last row might have more/less seats, but assuming standard rows here for simplicity 
              const end = Math.min(start + seatsPerRow, seatLayout.length);
              let rowSeats = seatLayout.slice(start, end);

              if (selectedBus.seatNumberingType === "door_side") {
                rowSeats = [...rowSeats].reverse();
              }

              const leftCols = 2;
              const rightCols = seatsPerRow === 4 ? 2 : 3;

              return (
              <div key={rowIndex} className="flex justify-center space-x-2">
                <div className="flex space-x-1">
                  {rowSeats.slice(0, leftCols).map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-12 h-12 rounded-lg border text-sm font-semibold flex items-center justify-center transition
                          ${
                            seat.isOccupied
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : seat.conductorAssigned && seat.conductorId !== selectedConductorId
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : seat.conductorId === selectedConductorId
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
                            : seat.conductorAssigned
                            ? `Conductor: ${seat.conductorCode}`
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
                  {rowSeats.slice(leftCols, leftCols + rightCols).map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-12 h-12 rounded-lg border text-sm font-semibold flex items-center justify-center transition
                          ${
                            seat.isOccupied
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : seat.conductorAssigned && seat.conductorId !== selectedConductorId
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : seat.conductorId === selectedConductorId
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
                            : seat.conductorAssigned
                            ? `Conductor: ${seat.conductorCode}`
                            : "Available"
                        }
                      >
                        {seat.displayName || seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={assignSeatsToConductor}
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
          onClick={removeConductorSeats}
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

export default AssignConductorTab;
