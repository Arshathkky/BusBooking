import React, { useState } from "react";
import { X, Save, RotateCcw } from "lucide-react";

type SeatLayoutType = "2x2" | "2x3";
type LastRowType = 4 | 6;

interface BusLayoutDesignerProps {
  totalSeats: number;
  currentLadiesSeats: number[];
  seatLayout: SeatLayoutType;
  seatNumberingType: "driver_side" | "door_side";
  lastRowSeats: LastRowType;
  onSave: (ladiesSeats: number[]) => void;
  onClose: () => void;
}

const BusLayoutDesigner: React.FC<BusLayoutDesignerProps> = ({
  totalSeats,
  currentLadiesSeats,
  seatLayout,
  seatNumberingType,
  lastRowSeats,
  onSave,
  onClose,
}) => {

  const [ladiesSeats, setLadiesSeats] = useState<Set<number>>(
    new Set(currentLadiesSeats)
  );

  const toggleSeat = (seatNumber: number) => {
    const newSet = new Set(ladiesSeats);

    if (newSet.has(seatNumber)) newSet.delete(seatNumber);
    else newSet.add(seatNumber);

    setLadiesSeats(newSet);
  };

  const handleReset = () => setLadiesSeats(new Set());

  const handleSave = () => {
    onSave(Array.from(ladiesSeats));
    onClose();
  };

  const seatsPerRow = seatLayout === "2x2" ? 4 : 5;

  const normalSeats = totalSeats - lastRowSeats;

  const rows = Math.ceil(normalSeats / seatsPerRow);

  const renderSeat = (seatNumber: number) => {

    const isLadies = ladiesSeats.has(seatNumber);

    const seatClass =
      "w-12 h-12 flex items-center justify-center text-xs font-semibold rounded-lg border-2 cursor-pointer transition " +
      (isLadies
        ? "bg-pink-200 border-pink-400 text-pink-800"
        : "bg-gray-200 border-gray-300 hover:bg-gray-300");

    return (
      <button
        key={seatNumber}
        className={seatClass}
        onClick={() => toggleSeat(seatNumber)}
      >
        {seatNumber}
      </button>
    );
  };

  const renderRows = () => {

    const rowsArr = [];

    let seatNumber = 1;

    for (let r = 0; r < rows; r++) {

      const rowSeats = [];

      for (let i = 0; i < seatsPerRow; i++) {

        if (seatNumber <= normalSeats) {
          rowSeats.push(renderSeat(seatNumber));
          seatNumber++;
        }

      }

      if (seatNumberingType === "door_side") {
        rowSeats.reverse();
      }

      let grid;

      if (seatLayout === "2x2") {

        grid = (
          <div className="grid grid-cols-6 gap-2">
            {rowSeats[0]}
            {rowSeats[1]}
            <div></div>
            <div></div>
            {rowSeats[2]}
            {rowSeats[3]}
          </div>
        );

      } else {

        grid = (
          <div className="grid grid-cols-6 gap-2">
            {rowSeats[0]}
            {rowSeats[1]}
            <div></div>
            {rowSeats[2]}
            {rowSeats[3]}
            {rowSeats[4]}
          </div>
        );

      }

      rowsArr.push(
        <div key={r} className="flex justify-center">
          {grid}
        </div>
      );
    }

    /* LAST ROW */

    const lastRowSeatsArr = [];

    for (let i = 0; i < lastRowSeats; i++) {

      if (seatNumber <= totalSeats) {
        lastRowSeatsArr.push(renderSeat(seatNumber));
        seatNumber++;
      }

    }

    if (seatNumberingType === "door_side") {
      lastRowSeatsArr.reverse();
    }

    let lastRowGrid;

    if (lastRowSeats === 4) {

      lastRowGrid = (
        <div className="grid grid-cols-6 gap-2">
          <div></div>
          {lastRowSeatsArr[0]}
          {lastRowSeatsArr[1]}
          {lastRowSeatsArr[2]}
          {lastRowSeatsArr[3]}
          <div></div>
        </div>
      );

    } else {

      lastRowGrid = (
        <div className="grid grid-cols-6 gap-2">
          {lastRowSeatsArr[0]}
          {lastRowSeatsArr[1]}
          {lastRowSeatsArr[2]}
          {lastRowSeatsArr[3]}
          {lastRowSeatsArr[4]}
          {lastRowSeatsArr[5]}
        </div>
      );

    }

    rowsArr.push(
      <div key="lastRow" className="flex justify-center">
        {lastRowGrid}
      </div>
    );

    return rowsArr;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          <X size={24} />
        </button>

        <div className="p-8">

          <div className="text-center mb-6">

            <h2 className="text-2xl font-bold">
              Bus Layout Designer
            </h2>

            <p className="text-gray-500">
              Click seats to toggle Ladies Only seats
            </p>

          </div>

          <div className="flex justify-center gap-6 mb-6">

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              Regular
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-300 rounded"></div>
              Ladies
            </div>

          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-6 space-y-3">

            {renderRows()}

          </div>

          <div className="text-center mb-6">

            Ladies seats:{" "}
            <span className="font-bold text-pink-600">
              {ladiesSeats.size}
            </span>{" "}
            / {totalSeats}

          </div>

          <div className="flex justify-center gap-4">

            <button
              onClick={handleReset}
              className="bg-gray-300 px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              onClick={onClose}
              className="bg-gray-400 px-6 py-3 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="bg-yellow-400 px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Save size={16} />
              Save Layout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BusLayoutDesigner;