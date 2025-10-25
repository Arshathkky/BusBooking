import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';

interface BusLayoutDesignerProps {
  totalSeats: number;
  currentLadiesSeats: number[];
  onSave: (ladiesSeats: number[]) => void;
  onClose: () => void;
}

const BusLayoutDesigner: React.FC<BusLayoutDesignerProps> = ({
  totalSeats,
  currentLadiesSeats,
  onSave,
  onClose
}) => {
  const [ladiesSeats, setLadiesSeats] = useState<Set<number>>(new Set(currentLadiesSeats));

  const toggleSeat = (seatNumber: number) => {
    const newLadiesSeats = new Set(ladiesSeats);
    if (newLadiesSeats.has(seatNumber)) {
      newLadiesSeats.delete(seatNumber);
    } else {
      newLadiesSeats.add(seatNumber);
    }
    setLadiesSeats(newLadiesSeats);
  };

  const handleSave = () => {
    onSave(Array.from(ladiesSeats));
    onClose();
  };

  const handleReset = () => {
    setLadiesSeats(new Set());
  };

  const renderSeats = () => {
    const seats = [];
    
    for (let i = 1; i <= totalSeats; i++) {
      const isLadiesOnly = ladiesSeats.has(i);
      
      let seatClass = 'w-12 h-12 rounded-lg border-2 text-xs font-semibold transition-all duration-200 cursor-pointer ';
      
      if (isLadiesOnly) {
        seatClass += 'bg-pink-200 dark:bg-pink-800 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-200';
      } else {
        seatClass += 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500';
      }

      seats.push(
        <button
          key={i}
          onClick={() => toggleSeat(i)}
          className={seatClass}
        >
          <div className="text-xs">{i}</div>
        </button>
      );
    }

    return seats;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl relative transition-colors max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bus Layout Designer</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Click seats to designate as ladies-only</p>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-8 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Regular Seat</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-pink-200 dark:bg-pink-800 border border-pink-300 dark:border-pink-700 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Ladies Only</span>
            </div>
          </div>

          {/* Bus Layout */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 transition-colors">
            <div className="space-y-3">
              {Array.from({ length: Math.ceil(totalSeats / 5) }, (_, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-center space-x-2">
                  {/* Driver side - 3 seats */}
                  <div className="flex space-x-1">
                    {[0, 1, 2].map(seatOffset => {
                      const seatNumber = rowIndex * 5 + seatOffset + 1;
                      return seatNumber <= totalSeats ? renderSeats()[seatNumber - 1] : null;
                    })}
                  </div>
                  
                  {/* Aisle */}
                  <div className="w-8"></div>
                  
                  {/* Opposite side - 2 seats */}
                  <div className="flex space-x-1">
                    {[3, 4].map(seatOffset => {
                      const seatNumber = rowIndex * 5 + seatOffset + 1;
                      return seatNumber <= totalSeats ? renderSeats()[seatNumber - 1] : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Ladies-only seats: <span className="font-bold text-pink-600 dark:text-pink-400">{ladiesSeats.size}</span> / {totalSeats}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleReset}
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={onClose}
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusLayoutDesigner;