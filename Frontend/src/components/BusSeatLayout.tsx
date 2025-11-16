import React, { useMemo } from "react";
import { X, Save, RotateCcw } from "lucide-react";

export interface SeatLayoutItem {
  number: string;
  isOccupied?: boolean;
  isLadiesOnly?: boolean;
  assignedAgentId?: string;
}

interface BusSeatLayoutProps {
  seatLayout: SeatLayoutItem[];
  mode?: "view" | "select" | "design"; // view = read-only, select = pick seats, design = toggle ladies-only
  selectableSeats?: string[]; // for selection in select mode
  onSeatSelect?: (seatNumber: string) => void;
  onSave?: (updatedLayout: SeatLayoutItem[]) => void;
  onClose: () => void;
}

const BusSeatLayout: React.FC<BusSeatLayoutProps> = ({
  seatLayout,
  mode = "view",
  selectableSeats = [],
  onSeatSelect,
  onSave,
  onClose,
}) => {
  const isViewMode = mode === "view";
  const isSelectMode = mode === "select";
  const isDesignMode = mode === "design";

  const handleSeatClick = (seat: SeatLayoutItem) => {
    if (isViewMode || seat.isOccupied) return;

    if (isSelectMode && onSeatSelect) {
      onSeatSelect(seat.number);
    }

    if (isDesignMode) {
      seat.isLadiesOnly = !seat.isLadiesOnly;
      if (onSave) onSave([...seatLayout]); // push updated layout
    }
  };

  const getSeatClass = (seat: SeatLayoutItem) => {
    const isSelected = selectableSeats.includes(seat.number);

    const baseClass =
      "w-12 h-12 rounded-lg border-2 text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-200";

    if (seat.isOccupied) return baseClass + " bg-gray-400 text-white cursor-not-allowed";
    if (isSelected) return baseClass + " bg-yellow-300 text-black border-yellow-400 hover:bg-yellow-400";
    if (seat.isLadiesOnly) return baseClass + " bg-pink-200 dark:bg-pink-800 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-200";
    return baseClass + " bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500";
  };

  const rows = Math.ceil(seatLayout.length / 5);

  const seatComponents = useMemo(
    () =>
      seatLayout.map((seat) => (
        <button
          key={seat.number}
          onClick={() => handleSeatClick(seat)}
          className={getSeatClass(seat)}
          disabled={seat.isOccupied}
          title={
            seat.isOccupied
              ? "Occupied"
              : seat.isLadiesOnly
              ? "Ladies Only"
              : "Available"
          }
        >
          {seat.number}
        </button>
      )),
    [seatLayout, selectableSeats]
  );

  const handleReset = () => {
    if (!isDesignMode) return;
    seatLayout.forEach((s) => (s.isLadiesOnly = false));
    if (onSave) onSave([...seatLayout]);
  };

  const handleSave = () => {
    if (onSave) onSave([...seatLayout]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isSelectMode
              ? "Select Seats"
              : isViewMode
              ? "Bus Seat Layout"
              : "Bus Layout Designer"}
          </h2>
          {isDesignMode && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Click seats to toggle <b>Ladies Only</b>
            </p>
          )}
          {isSelectMode && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Click seats to select/deselect
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded" />
            <span className="text-gray-700 dark:text-gray-300">Regular</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-pink-200 dark:bg-pink-800 border border-pink-300 dark:border-pink-700 rounded" />
            <span className="text-gray-700 dark:text-gray-300">Ladies</span>
          </div>
          {isSelectMode && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-300 border border-yellow-400 rounded" />
              <span className="text-gray-700 dark:text-gray-300">Selected</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 text-white border border-gray-500 rounded" />
            <span className="text-gray-700 dark:text-gray-300">Occupied</span>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 transition-colors">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="flex items-center justify-center space-x-2 mb-2">
              <div className="flex space-x-1">
                {[0, 1, 2].map((offset) => seatComponents[rowIndex * 5 + offset])}
              </div>
              <div className="w-6" />
              <div className="flex space-x-1">
                {[3, 4].map((offset) => seatComponents[rowIndex * 5 + offset])}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          {isDesignMode && (
            <button
              onClick={handleReset}
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" /> <span>Reset</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg"
          >
            {isViewMode ? "Close" : "Cancel"}
          </button>
          {isDesignMode && (
            <button
              onClick={handleSave}
              className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <Save className="w-4 h-4" /> <span>Save</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusSeatLayout;
