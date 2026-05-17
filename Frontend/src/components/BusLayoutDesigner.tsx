import React, { useState, useEffect } from "react";
import { X, Save, RotateCcw, User, Trash2, Layout as LayoutIcon, MousePointer2, CheckCircle2, Users } from "lucide-react";
import { SeatType } from "../contexts/busDataContexts";

interface BusLayoutDesignerProps {
  totalSeats: number;
  currentSeats: SeatType[];
  onSave: (seats: SeatType[]) => void;
  onClose: () => void;
}

const BusLayoutDesigner: React.FC<BusLayoutDesignerProps> = ({
  totalSeats,
  currentSeats,
  onSave,
  onClose,
}) => {
  const [seats, setSeats] = useState<SeatType[]>(currentSeats || []);
  const [activeSeatIndex, setActiveSeatIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  
  // Grid settings
  const cols = 6;
  const rows = 15;
  
  // Ensure seats have coordinates if coming from an old layout
  useEffect(() => {
    if (seats.length > 0 && seats[0].x === undefined) {
      // provide a default layout if none exists
      const newSeats = seats.map((s, i) => {
        const x = i % 4 < 2 ? i % 4 : (i % 4) + 2; 
        const y = Math.floor(i / 4);
        return { ...s, x, y, isWindow: x === 0 || x === cols - 1 };
      });
      setSeats(newSeats);
    }
  }, []);

  const handleCellClick = (x: number, y: number) => {
    const existingSeatIndex = seats.findIndex(s => s.x === x && s.y === y);
    
    if (existingSeatIndex >= 0) {
      setActiveSeatIndex(existingSeatIndex);
    } else {
      if (seats.length < totalSeats) {
        // Find next available number
        const usedNumbers = seats.map(s => Number(s.seatNumber)).filter(n => !isNaN(n));
        let nextNum = 1;
        while (usedNumbers.includes(nextNum)) nextNum++;

        const newSeat: SeatType = {
          seatNumber: nextNum,
          x,
          y,
          isLadiesOnly: false,
          isOccupied: false,
          isWindow: x === 0 || x === cols - 1,
          isOnline: true,
          isBlocked: false,
        };
        setSeats([...seats, newSeat]);
        setActiveSeatIndex(seats.length);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.setData("seatIndex", index.toString());
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    const index = parseInt(e.dataTransfer.getData("seatIndex"));
    if (isNaN(index)) return;

    // Check if destination is occupied
    const existingSeatAtDest = seats.findIndex(s => s.x === x && s.y === y);
    if (existingSeatAtDest >= 0 && existingSeatAtDest !== index) return;

    const newSeats = [...seats];
    newSeats[index] = { ...newSeats[index], x, y, isWindow: x === 0 || x === cols - 1 };
    setSeats(newSeats);
    setActiveSeatIndex(index);
    setDraggingIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeSeat = (index: number) => {
    const newSeats = [...seats];
    newSeats.splice(index, 1);
    setSeats(newSeats);
    setActiveSeatIndex(null);
  };

  const updateActiveSeat = (updates: Partial<SeatType>) => {
    if (activeSeatIndex === null) return;
    const newSeats = [...seats];
    newSeats[activeSeatIndex] = { ...newSeats[activeSeatIndex], ...updates };
    setSeats(newSeats);
  };

  const handleSave = () => {
    onSave(seats);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden max-h-[95vh] border border-white/10">
        
        {/* Left: Designer Area */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950/50">
           <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Layout Designer
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Drag seats to reposition or click to add/edit</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <span className="w-3 h-3 rounded-full bg-[#fdc106]"></span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {seats.length} / {totalSeats} Seats
                        </span>
                    </div>
                </div>
           </div>

           <div className="relative mx-auto border-[12px] border-slate-200 dark:border-slate-800 rounded-[60px] bg-white dark:bg-gray-900 p-12 transition-all shadow-inner" style={{ width: 'fit-content' }}>
                {/* Visual context */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex justify-between w-full px-16">
                     <div className="flex flex-col items-center group">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 group-hover:border-[#fdc106] transition-colors shadow-sm">
                            <User className="w-6 h-6 text-slate-400 group-hover:text-[#fdc106]" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Driver</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center">
                            <div className="w-1 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Door</span>
                     </div>
                </div>

                {/* Grid */}
                <div 
                    className="grid gap-2.5 mt-8" 
                    style={{ 
                        gridTemplateColumns: `repeat(${cols}, 54px)`,
                        gridTemplateRows: `repeat(${rows}, 54px)` 
                    }}
                >
                    {(() => {
                        const seatMap = new Map();
                        seats.forEach((s, idx) => seatMap.set(`${s.x},${s.y}`, { ...s, idx }));

                        return Array.from({ length: rows * cols }).map((_, i) => {
                            const x = i % cols;
                            const y = Math.floor(i / cols);
                            const key = `${x},${y}`;
                            const seat = seatMap.get(key);
                            const isActive = activeSeatIndex !== null && seat && seat.idx === activeSeatIndex;
                            const isDragging = draggingIndex !== null && seat && seat.idx === draggingIndex;

                            return (
                                <div 
                                    key={i}
                                    onClick={() => handleCellClick(x, y)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, x, y)}
                                    className={`
                                        w-[54px] h-[54px] rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all relative group
                                        ${seat 
                                            ? (seat.isLadiesOnly 
                                                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-600 shadow-sm' 
                                                : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900 text-indigo-600 shadow-sm') 
                                            : 'bg-transparent border-slate-100 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/20'}
                                        ${isActive ? 'ring-4 ring-[#fdc106]/30 border-[#fdc106] scale-105 z-20 shadow-xl' : ''}
                                        ${isDragging ? 'opacity-20' : 'opacity-100'}
                                    `}
                                    draggable={!!seat}
                                    onDragStart={(e) => seat && handleDragStart(e, seat.idx)}
                                >
                                    {seat && (
                                        <>
                                            <span className="font-extrabold text-sm tracking-tight">{seat.seatNumber}</span>
                                            {seat.isWindow && (
                                                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400/50" title="Window"></div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
           </div>
        </div>

        {/* Right: Properties Sidebar */}
        <div className="w-full md:w-96 bg-white dark:bg-gray-950 p-8 flex flex-col shadow-2xl border-l border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <LayoutIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">Properties</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            {activeSeatIndex !== null ? (
                <div className="space-y-8 flex-1 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Seat Designation</label>
                        <input 
                            type="text"
                            value={seats[activeSeatIndex].seatNumber}
                            onChange={(e) => updateActiveSeat({ seatNumber: e.target.value })}
                            className="w-full p-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg focus:ring-4 focus:ring-[#fdc106]/20 focus:border-[#fdc106] transition-all outline-none"
                            placeholder="e.g. 1A, D, 45"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-rose-200 dark:hover:border-rose-900 transition-all group shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl transition-colors ${seats[activeSeatIndex].isLadiesOnly ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">Ladies Only</span>
                                    <span className="text-xs text-gray-400">Reserved for female passengers</span>
                                </div>
                            </div>
                            <input 
                                type="checkbox"
                                checked={seats[activeSeatIndex].isLadiesOnly}
                                onChange={(e) => updateActiveSeat({ isLadiesOnly: e.target.checked })}
                                className="w-6 h-6 rounded-lg border-2 border-slate-200 text-rose-500 focus:ring-rose-500/20"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-blue-200 dark:hover:border-blue-900 transition-all group shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl transition-colors ${seats[activeSeatIndex].isWindow ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <div className="w-5 h-5 border-2 border-current rounded-sm flex items-center justify-center">
                                        <div className="w-3 h-1 bg-current rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">Window Seat</span>
                                    <span className="text-xs text-gray-400">Toggle window side status</span>
                                </div>
                            </div>
                            <input 
                                type="checkbox"
                                checked={seats[activeSeatIndex].isWindow}
                                onChange={(e) => updateActiveSeat({ isWindow: e.target.checked })}
                                className="w-6 h-6 rounded-lg border-2 border-slate-200 text-blue-500 focus:ring-blue-500/20"
                            />
                        </label>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-2"></div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-4 mb-2">Operational Controls</p>

                        {/* Online Available */}
                        <div className="grid grid-cols-1 gap-3">
                            <button 
                                type="button"
                                onClick={() => updateActiveSeat({ isOnline: true, isPermanent: false, isBlocked: false })}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group shadow-sm ${seats[activeSeatIndex].isOnline !== false && !seats[activeSeatIndex].isPermanent && !seats[activeSeatIndex].isBlocked ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900' : 'bg-white dark:bg-gray-900 border-slate-100 dark:border-slate-800 hover:border-green-200'}`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${seats[activeSeatIndex].isOnline !== false && !seats[activeSeatIndex].isPermanent && !seats[activeSeatIndex].isBlocked ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <LayoutIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">Online Booking</span>
                                        <span className="text-xs text-gray-400">Available for public</span>
                                    </div>
                                </div>
                                {seats[activeSeatIndex].isOnline !== false && !seats[activeSeatIndex].isPermanent && !seats[activeSeatIndex].isBlocked && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            </button>

                            <button 
                                type="button"
                                onClick={() => updateActiveSeat({ isOnline: false, isPermanent: false, isBlocked: false })}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group shadow-sm ${seats[activeSeatIndex].isOnline === false && !seats[activeSeatIndex].isPermanent && !seats[activeSeatIndex].isBlocked ? 'bg-orange-50 border-orange-400 dark:bg-orange-950/30 dark:border-orange-900' : 'bg-white dark:bg-gray-900 border-slate-100 dark:border-slate-800 hover:border-orange-400'}`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${seats[activeSeatIndex].isOnline === false && !seats[activeSeatIndex].isPermanent && !seats[activeSeatIndex].isBlocked ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">Manual Only</span>
                                        <span className="text-xs text-gray-400">Restricted booking</span>
                                    </div>
                                </div>
                                {seats[activeSeatIndex].isOnline === false && !seats[activeSeatIndex].isPermanent && !seats[activeSeatIndex].isBlocked && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                            </button>

                            <button 
                                type="button"
                                onClick={() => updateActiveSeat({ isOnline: false, isPermanent: true, isBlocked: false })}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group shadow-sm ${seats[activeSeatIndex].isPermanent ? 'bg-slate-100 border-slate-900 dark:bg-slate-900 dark:border-black' : 'bg-white dark:bg-gray-900 border-slate-100 dark:border-slate-800 hover:border-slate-900'}`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${seats[activeSeatIndex].isPermanent ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <MousePointer2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">Permanent Block</span>
                                        <span className="text-xs text-gray-400">Out of service</span>
                                    </div>
                                </div>
                                {seats[activeSeatIndex].isPermanent && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            onClick={() => removeSeat(activeSeatIndex)}
                            className="w-full py-4 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-2xl flex items-center justify-center space-x-2 transition-all font-bold border border-red-100 dark:border-red-900/50"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span>Remove Seat</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[30px] flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                        <MousePointer2 className="w-8 h-8 text-slate-300 animate-bounce" />
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Select a cell to place a seat,<br />or drag existing seats to move them.
                    </p>
                </div>
            )}

            <div className="mt-auto space-y-4 pt-8">
                <button 
                    onClick={handleSave}
                    className="w-full bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-black py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-[#fdc106]/20 transition-all active:scale-95"
                >
                    <Save className="w-6 h-6" />
                    <span className="text-lg">Save Layout</span>
                </button>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => {
                            if (confirm("Reset everything?")) setSeats([]);
                        }}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Clear All</span>
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BusLayoutDesigner;
