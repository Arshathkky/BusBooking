import React, { useState, useEffect, FormEvent } from "react";
import { X, Bus, DollarSign, LayoutGrid as Layout } from "lucide-react";
import { useBus, BusType, SeatType } from "../contexts/busDataContexts";
import { useAuth } from "../contexts/AuthContext";
import { useRouteData } from "../contexts/RouteDataContext";
import BusLayoutDesigner from "./BusLayoutDesigner";

// ------------------------------
// Literal Types
// ------------------------------
type SeatLayoutType = "2x2" | "2x3";
type LastRowType = number;

// ------------------------------
// Props & Form Types
// ------------------------------
interface AddBusModalProps {
  onClose: () => void;
  editingBus?: BusType | null;
}

interface FormData {
  busName: string;
  busNumber: string;
  companyName: string;
  busType: string;
  totalSeats: number;
  route: string;
  pricePerSeat: string;
  amenities: string[];
  ladiesOnlySeats: (string | number)[];
  isSpecialBus: boolean;
  specialTime: string;
  startTime: string;
  endTime: string;
  duration: string;
  seatLayout: SeatLayoutType;
  seatNumberingType: "driver_side" | "door_side";
  lastRowSeats: LastRowType;
  useCustomLayout: boolean; // 👈 NEW
}

// ------------------------------
// Component
// ------------------------------
const AddBusModal: React.FC<AddBusModalProps> = ({ onClose, editingBus }) => {
  const { addBus, updateBus } = useBus();
  const { routes } = useRouteData();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    busName: "",
    busNumber: "",
    companyName: "",
    busType: "AC Sleeper",
    totalSeats: 45,
    route: "",
    pricePerSeat: "",
    amenities: [],
    ladiesOnlySeats: [],
    isSpecialBus: false,
    specialTime: "",
    startTime: "",
    endTime: "",
    duration: "",
    seatLayout: "2x2",
    seatNumberingType: "driver_side",
    lastRowSeats: 6,
    useCustomLayout: false, // 👈 NEW
  });

  const [showLayoutDesigner, setShowLayoutDesigner] = useState(false);

  // ------------------------------
  // Load editing bus if provided
  // ------------------------------
  useEffect(() => {
    if (editingBus) {
      const routeObj = routes?.find((r) => r.id === editingBus.routeId);
      setFormData({
        busName: editingBus.name,
        busNumber: editingBus.busNumber,
        companyName: editingBus.companyName,
        busType: editingBus.type,
        totalSeats: editingBus.totalSeats,
        route: routeObj ? routeObj.name : "",
        pricePerSeat: editingBus.price.toString(),
        amenities: editingBus.amenities || [],
        ladiesOnlySeats: editingBus.ladiesOnlySeats || [],
        isSpecialBus: editingBus.isSpecial || false,
        specialTime: editingBus.specialTime || "",
        startTime: editingBus.departureTime,
        endTime: editingBus.arrivalTime,
        duration: editingBus.duration,
        seatLayout: editingBus.seatLayout || "2x2",
        seatNumberingType: editingBus.seatNumberingType || "driver_side",
        lastRowSeats: editingBus.lastRowSeats || 6,
        useCustomLayout: editingBus.useCustomLayout || false, // 👈 NEW
      });
      if (editingBus.seats) {
          setCustomSeats(editingBus.seats);
      }
    }
  }, [editingBus, routes]);

  const [customSeats, setCustomSeats] = useState<SeatType[]>([]);

  // ------------------------------
  // Options
  // ------------------------------
  const busTypes = ["AC Sleeper", "AC Semi Sleeper", "Non-AC", "Luxury", "Express", "Special"];
  const availableAmenities = ["wifi", "ac", "refreshments", "entertainment", "charging", "blanket"];

  // ------------------------------
  const computeSeatLayout = (total: number) => {
    const layout = total > 45 ? "2x3" : "2x2";
    const seatsPerRow = layout === "2x2" ? 4 : 5;
    const lastRow = total % seatsPerRow === 0 ? seatsPerRow : (total % seatsPerRow);
    const normalSeats = total - lastRow;
    const rows = Math.ceil(normalSeats / seatsPerRow);
    return { layout: layout as SeatLayoutType, lastRow, rows };
  };

  // ------------------------------
  // Handlers
  // ------------------------------
  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate layout when totalSeats changes
      if (field === "totalSeats") {
        const total = value as number;
        if (total >= 20 && total <= 80) {
          const { layout, lastRow } = computeSeatLayout(total);
          updated.seatLayout = layout;
          updated.lastRowSeats = lastRow;
        }
      }
      
      // If switching to auto-layout, clear custom seats
      if (field === "useCustomLayout" && value === false) {
          setCustomSeats([]);
      }

      return updated;
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleLayoutSave = (seats: SeatType[]) => {
    setCustomSeats(seats);
    setFormData(prev => ({ 
        ...prev, 
        totalSeats: seats.length,
        ladiesOnlySeats: seats.filter(s => s.isLadiesOnly).map(s => s.seatNumber)
    }));
  };

  // Seat Layout change handler
  const handleSeatLayoutChange = (layout: SeatLayoutType) => {
    setFormData((prev) => ({ ...prev, seatLayout: layout }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please log in first.");

    const selectedRoute = routes?.find((r) => r.name === formData.route);
    if (!selectedRoute) return alert("Please select a valid route.");

    let seats = customSeats;

    if (!formData.useCustomLayout || seats.length === 0) {
        // Fallback to auto-generated seats if not using custom layout
        seats = Array.from({ length: formData.totalSeats }, (_, i) => ({
            seatNumber: i + 1,
            isLadiesOnly: formData.ladiesOnlySeats.includes(i + 1),
            isOccupied: false,
            isOnline: false,
            isBlocked: false,
            conductorAssigned: false,
            conductorCode: null,
            conductorId: null,
        }));
    }

    const busPayload: Omit<BusType, "id"> = {
      name: formData.busName,
      busNumber: formData.busNumber,
      companyName: formData.companyName,
      type: formData.busType,
      routeId: selectedRoute.id,
      departureTime: formData.startTime,
      arrivalTime: formData.endTime,
      duration: formData.duration,
      totalSeats: formData.totalSeats,
      ladiesOnlySeats: formData.ladiesOnlySeats,
      price: parseFloat(formData.pricePerSeat),
      status: "active",
      amenities: formData.amenities,
      isSpecial: formData.isSpecialBus,
      specialTime: formData.specialTime,
      ownerId: user.id,
      seats,
      seatLayout: formData.seatLayout,
      seatNumberingType: formData.seatNumberingType,
      lastRowSeats: formData.lastRowSeats,
      useCustomLayout: formData.useCustomLayout, // 👈 NEW
    };

    try {
      if (editingBus) {
        await updateBus(editingBus.id, busPayload);
        alert("Bus updated successfully!");
      } else {
        await addBus(busPayload);
        alert("Bus added successfully!");
      }
      onClose();
    } catch (error) {
      console.error("Failed to save bus:", error);
      alert("Failed to save bus. Please try again.");
    }
  };

  // Compute display info for the user
  const seatsPerRow = formData.seatLayout === "2x2" ? 4 : 5;
  const normalSeats = formData.totalSeats - formData.lastRowSeats;
  const normalRows = Math.ceil(normalSeats / seatsPerRow);

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="bg-[#fdc106] p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bus className="w-8 h-8 text-gray-900" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingBus ? "Edit Bus" : "Add New Bus"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {editingBus ? "Update your bus details" : "Register a new bus to your fleet"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Bus Name" value={formData.busName} onChange={(e) => handleInputChange("busName", e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" required />
                <input type="text" placeholder="Bus Number" value={formData.busNumber} onChange={(e) => handleInputChange("busNumber", e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" required />
                <input type="text" placeholder="Company Name" value={formData.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" required />
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input type="time" value={formData.startTime} onChange={(e) => handleInputChange("startTime", e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" required />
                <input type="time" value={formData.endTime} onChange={(e) => handleInputChange("endTime", e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" required />
                <input type="text" placeholder="Duration" value={formData.duration} onChange={(e) => handleInputChange("duration", e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" required />
              </div>

              {/* Bus Type & Total Seats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select value={formData.busType} onChange={(e) => handleInputChange("busType", e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]">
                  {busTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>

                <input type="number" placeholder="Total Seats" value={formData.totalSeats} onChange={(e) => handleInputChange("totalSeats", Number(e.target.value))} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" min={10} max={80} />
              </div>

              {/* Auto-calculated layout info + override options */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                  Auto Layout: {formData.seatLayout} | {normalRows} rows × {seatsPerRow} seats + Last row {formData.lastRowSeats} seats
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {/* Seat Layout Override */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Row Layout (Override)</label>
                    <select value={formData.seatLayout} onChange={(e) => handleSeatLayoutChange(e.target.value as SeatLayoutType)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#fdc106]">
                      <option value="2x2">2×2 Layout (4 per row)</option>
                      <option value="2x3">2×3 Layout (5 per row)</option>
                    </select>
                  </div>

                  {/* Seat Numbering System */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Seat Numbering System</label>
                    <select value={formData.seatNumberingType} onChange={(e) => handleInputChange("seatNumberingType", e.target.value as "driver_side" | "door_side")} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#fdc106]">
                      <option value="driver_side">Starts from Driver Side</option>
                      <option value="door_side">Starts from Door Side</option>
                    </select>
                  </div>

                  {/* Last Row Seats Override */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Last Row Seats (Override)</label>
                    <input
                      type="number"
                      value={formData.lastRowSeats}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1 && val <= Math.min(formData.totalSeats, 10)) {
                          handleInputChange("lastRowSeats", val as LastRowType);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#fdc106]"
                      min={1}
                      max={10}
                    />
                  </div>
                </div>
              </div>

              {/* Price & Route */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input type="number" placeholder="Price per seat (LKR)" value={formData.pricePerSeat} onChange={(e) => handleInputChange("pricePerSeat", e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" required />
                </div>
                <select value={formData.route} onChange={(e) => handleInputChange("route", e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" required>
                  <option value="">Select Route</option>
                  {routes?.map((route) => <option key={route.id} value={route.name}>{route.name} ({route.startPoint} → {route.endPoint})</option>)}
                </select>
              </div>

              {/* Layout Designer */}
                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 transition-colors hover:border-[#fdc106]">
                    <input 
                      type="checkbox" 
                      checked={formData.useCustomLayout} 
                      onChange={(e) => handleInputChange("useCustomLayout", e.target.checked)} 
                      className="rounded border-gray-300 text-[#fdc106] w-5 h-5" 
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Use Custom Drag-and-Drop Layout</span>
                  </label>
                  
                  {formData.useCustomLayout && (
                    <button type="button" onClick={() => setShowLayoutDesigner(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                      <Layout className="w-5 h-5" /><span>Design Bus Floor Plan</span>
                    </button>
                  )}
                </div>

                {!formData.useCustomLayout && (
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold">
                      Layout Setup ({formData.ladiesOnlySeats.length} ladies-only seats)
                    </label>
                    <button type="button" onClick={() => setShowLayoutDesigner(true)} className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
                       <Layout className="w-4 h-4" /><span>Quick Setup</span>
                    </button>
                  </div>
                )}

                <div className="p-5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                  {formData.useCustomLayout ? (
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Source of Truth</p>
                            <p className="font-bold text-gray-700 dark:text-gray-200">
                                {customSeats.length > 0 ? `Custom floor plan with ${customSeats.length} seats` : "Manual Floor Plan Required"}
                            </p>
                         </div>
                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter text-gray-400">
                            <span>Auto Configuration</span>
                            <span className="text-[#fdc106]">Standard Algorithm</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="px-3 py-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 font-black text-lg italic">
                                {formData.seatLayout}
                            </div>
                            <div className="flex-1 text-sm font-bold text-gray-600 dark:text-gray-300">
                                {Math.ceil((formData.totalSeats - formData.lastRowSeats) / (formData.seatLayout === "2x2" ? 4 : 5))} Rows × {formData.seatLayout === "2x2" ? 4 : 5} Seats + Last Row {formData.lastRowSeats} Seats
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 text-[11px] font-medium text-gray-400">
                             {formData.ladiesOnlySeats.length > 0 ? `Ladies-Only blocked: ${formData.ladiesOnlySeats.join(", ")}` : "No special gender-based blocking"}
                        </div>
                    </div>
                  )}
                </div>

              {/* Special Bus */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isSpecialBus} onChange={(e) => handleInputChange("isSpecialBus", e.target.checked)} className="rounded border-gray-300 text-[#fdc106]" />
                  <span className="text-sm font-semibold">Special Bus</span>
                </label>
                {formData.isSpecialBus && (
                  <div className="mt-3">
                    <input type="time" value={formData.specialTime} onChange={(e) => handleInputChange("specialTime", e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fdc106]" />
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-semibold mb-3">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} className="rounded border-gray-300 text-[#fdc106]" />
                      <span className="text-sm capitalize">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button type="button" onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold py-3 px-4 rounded-lg">{editingBus ? "Update Bus" : "Add Bus"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Layout Designer */}
      {showLayoutDesigner && (
        <BusLayoutDesigner
          totalSeats={formData.totalSeats}
          currentSeats={customSeats.length > 0 ? customSeats : (() => {
              // Generate initial seats from auto-layout if empty
              const seatsPerRow = formData.seatLayout === "2x2" ? 4 : 5;
              const normalSeats = formData.totalSeats - formData.lastRowSeats;
              const normalRows = Math.ceil(normalSeats / seatsPerRow);
              
              const generated: SeatType[] = [];
              for(let i=0; i<formData.totalSeats; i++) {
                  const num = i + 1;
                  const isLastRow = i >= normalSeats;
                  let x, y;
                  
                  if (!isLastRow) {
                      const row = Math.floor(i / seatsPerRow);
                      const colInRow = i % seatsPerRow;
                      x = colInRow < 2 ? colInRow : colInRow + 2; // path in middle
                      y = row + 1;
                  } else {
                      x = i - normalSeats;
                      y = normalRows + 1;
                  }
                  
                  generated.push({
                      seatNumber: num,
                      x, y,
                      isLadiesOnly: formData.ladiesOnlySeats.some(l => String(l) === String(num)),
                      isOccupied: false,
                      isWindow: x === 0 || x === 5 // based on 6 cols (0-5)
                  });
              }
              return generated;
          })()}
          onSave={handleLayoutSave}
          onClose={() => setShowLayoutDesigner(false)}
        />
      )}
    </>
  );
};

export default AddBusModal;
