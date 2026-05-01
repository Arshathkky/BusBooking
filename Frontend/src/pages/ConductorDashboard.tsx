import React, { useState, useMemo, useEffect } from "react";
import { useBooking } from "../contexts/BookingContext";
import { useAuth } from "../contexts/AuthContext";
import { useConductor } from "../contexts/conductorDataContext";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Download, 
  Filter, 
  XCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  CreditCard,
  ChevronRight,
  Search,
  RefreshCw,
  Bus,
  CircleDot as Steering
} from "lucide-react";
import { useBus } from "../contexts/busDataContexts";

const BASE_URL = import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api";

type SeatBookingRow = {
  id: string; // booking mongo id
  seat: string | number;
  name: string;
  phone: string;
  address: string;
  nic: string;
  bookingId: string | number;
  referenceId: string;
  remark?: string;
  status: string;
  amount: number;
};

const ConductorDashboard: React.FC = () => {
  const { bookings, fetchBookings } = useBooking();
  const { user } = useAuth();
  const { conductors } = useConductor();
  const { buses, fetchBuses, updateBus } = useBus();

  const [paymentFilter, setPaymentFilter] = useState<
    "All" | "Paid" | "Pending" | "Cancelled"
  >("Paid");

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Derive assigned bus from the logged-in conductor — read-only, set by owner
  const assignedConductor = conductors.find((c) => c.email === user?.email);
  const selectedBusId = assignedConductor?.assignedBusId ?? null;

  const [localSeats, setLocalSeats] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ id: string; remark: string } | null>(null);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    if (selectedBusId) {
      axios.get(`${BASE_URL}/buses/${selectedBusId}`)
        .then(res => {
          if (res.data.success) {
            setLocalSeats(res.data.data.seats || []);
            setSchedule(res.data.data.schedule || []);
          }
        });
    }
  }, [selectedBusId]);

  const handleApplyConfig = async () => {
    if (!selectedBusId) {
      alert("Please select a bus first");
      return;
    }
    setUpdating(true);
    try {
      // 1. Update backend
      await axios.patch(`${BASE_URL}/buses/${selectedBusId}/seats`, { seats: localSeats });
      await axios.put(`${BASE_URL}/buses/${selectedBusId}/schedule`, { schedule });
      
      // 2. Sync with Global Context so other pages/filters see the change
      await updateBus(selectedBusId, { 
        seats: localSeats,
        schedule: schedule
      });
      
      alert("✅ Configuration applied successfully for this bus!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save configuration. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const toggleDay = async (day: string) => {
    if (!selectedBusId) return;
    
    const newSchedule = schedule.includes(day) 
      ? schedule.filter(d => d !== day) 
      : [...schedule, day];
    
    // Update local state first for speed
    setSchedule(newSchedule);

    try {
      // 1. Update backend
      await axios.put(`${BASE_URL}/buses/${selectedBusId}/schedule`, { schedule: newSchedule });
      
      // 2. Update Global Context
      await updateBus(selectedBusId, { schedule: newSchedule });
      
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update schedule.");
      setSchedule(schedule); // Rollback
    }
  };

  const currentBus = buses.find(b => b.id === selectedBusId);

  // ✅ No longer needed — selectedBusId is derived directly from assignedConductor

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!selectedBusId) return false;
      if (b.bus?.id !== selectedBusId) return false;
      
      const status = b.paymentStatus?.toUpperCase() || "PENDING";
      const filter = paymentFilter.toUpperCase();

      if (filter === "ALL") {
        if (status === "PENDING") return false;
      } else {
        if (status !== filter) return false;
      }

      const bookingDate = b.searchData?.date || b.createdAt?.split("T")[0];
      if (!bookingDate) return false;
      if (selectedDate && bookingDate !== selectedDate) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          b.passengerDetails.name.toLowerCase().includes(query) ||
          b.passengerDetails.phone.includes(query) ||
          b.bookingId?.toString().includes(query)
        );
      }

      return true;
    });
  }, [bookings, paymentFilter, selectedDate, selectedBusId, searchQuery]);

  const seatBookings: SeatBookingRow[] = useMemo(() => {
    return filteredBookings.flatMap((b) =>
      b.selectedSeats.map((seat) => ({
        id: b._id || "",
        seat,
        name: b.passengerDetails.name,
        phone: b.passengerDetails.phone,
        address: b.passengerDetails.address,
        nic: b.passengerDetails.nic,
        bookingId: b.bookingId ?? "-",
        referenceId: b.referenceId ?? "-",
        remark: b.cancelRemark,
        status: (b.paymentStatus?.charAt(0).toUpperCase() || "P") + (b.paymentStatus?.slice(1).toLowerCase() || "ending"),
        amount: (b.totalAmount || 0) / (b.selectedSeats?.length || 1)
      }))
    );
  }, [filteredBookings]);

  const stats = useMemo(() => {
    // We calculate stats from ALL bookings for the selected bus/date, 
    // NOT just those restricted by the current payment filter tab.
    const allBookingsForDay = bookings.filter(b => {
      if (b.bus?.id !== selectedBusId) return false;
      const bookingDate = b.searchData?.date || b.createdAt?.split("T")[0];
      return bookingDate === selectedDate;
    });

    const paid = allBookingsForDay.filter(b => b.paymentStatus?.toUpperCase() === "PAID");
    const totalEarnings = paid.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalSeats = allBookingsForDay.reduce((sum, b) => {
      // Only count seats that aren't cancelled
      if (b.paymentStatus?.toUpperCase() === "CANCELLED") return sum;
      return sum + (b.selectedSeats?.length || 0);
    }, 0);

    return { 
      totalEarnings, 
      totalSeats, 
      paidCount: paid.length 
    };
  }, [bookings, selectedDate, selectedBusId]);



  const handleCancelBooking = async () => {
    if (!cancelModal) return;
    try {
      await axios.patch(`${BASE_URL}/bookings/${cancelModal.id}/cancel`, {
        remark: cancelModal.remark,
        cancelledBy: "conductor"
      });
      alert("✅ Booking cancelled successfully");
      setCancelModal(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to cancel booking");
    }
  };

  const exportExcel = () => {
    const data = seatBookings.map(({ seat, name, phone, nic, bookingId, status, remark }) => ({
      Seat: seat, Name: name, Phone: phone, NIC: nic, "Booking ID": bookingId, Status: status, Remark: remark || ""
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `Conductor_Bookings_${selectedDate}.xlsx`);
  };


  const exportPDF = () => {
    if (seatBookings.length === 0) {
      alert("No data to export!");
      return;
    }
    const doc = new jsPDF();
    const columns = ["Seat", "Name", "Phone", "Booking ID", "Status", "Remark"];
    const rows = seatBookings.map((row) => [
      row.seat.toString(), 
      row.name, 
      row.phone, 
      row.bookingId.toString(), 
      row.status,
      row.remark || ""
    ]);
    
    doc.setFontSize(18);
    doc.text("Booking Manifest", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date: ${selectedDate}`, 14, 28);
    doc.text(`Bus ID: ${selectedBusId || "N/A"}`, 14, 34);
    
    autoTable(doc, { 
      head: [columns], 
      body: rows,
      startY: 40,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: "#FDC106", textColor: "#000000", fontStyle: 'bold' },
      alternateRowStyles: { fillColor: "#F5F5F5" }
    } as any);

    doc.save(`Bus_Manifest_${selectedDate}.pdf`);
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen dark:bg-gray-950 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Conductor <span className="text-[#fdc106]">Dashboard</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your bus operations and passenger manifests</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* ✅ Read-only: show only the bus assigned by the owner */}
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3 border dark:border-gray-700">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Bus className="w-3 h-3"/> Assigned Bus
              </div>
              {currentBus ? (
                <span className="font-bold text-gray-800 dark:text-white text-sm">
                  {currentBus.name} <span className="text-gray-400 font-normal">({currentBus.busNumber})</span>
                </span>
              ) : (
                <span className="text-sm text-red-500 font-semibold">No bus assigned by owner</span>
              )}
            </div>

            <button 
              onClick={() => { fetchBookings(); fetchBuses(); }} 
              className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition dark:text-white"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {selectedBusId && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border dark:border-gray-700 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b dark:border-gray-700 pb-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center">
                  <Bus className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Active Bus Configuration</h3>
                  <p className="text-sm text-gray-400 font-medium">Configure range and schedule for <span className="text-blue-600">#{currentBus?.busNumber}</span></p>
                </div>
              </div>
              <button 
                onClick={handleApplyConfig}
                disabled={updating}
                className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {updating ? "SAVING..." : "APPLY ALL CHANGES"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Advanced Seat Management Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                      <Filter className="w-3 h-3" /> Seat Blocking Controls
                    </h4>
                    <div className="flex gap-4 text-[9px] font-black uppercase tracking-tighter">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Online</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Perm</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Reserve</div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-inner flex justify-center">
                    <div className="relative border-[10px] border-white dark:border-gray-800 rounded-[50px] bg-white dark:bg-gray-800 p-10 pt-16 shadow-xl" style={{ width: 'fit-content' }}>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex justify-between w-full px-12 text-gray-200 dark:text-gray-700">
                            <div className="text-[8px] font-black uppercase tracking-[0.2em] mt-2">Passenger Entry</div>
                            <Steering className="w-6 h-6" />
                        </div>

                        <div
                            className="grid gap-2"
                            style={{
                                gridTemplateColumns: `repeat(6, 45px)`,
                                gridTemplateRows: `repeat(15, 45px)`
                            }}
                        >
                            {(() => {
                                const gridMap = new Map();
                                localSeats.forEach(s => gridMap.set(`${s.x},${s.y}`, s));

                                return Array.from({ length: 15 * 6 }).map((_, i) => {
                                    const x = i % 6;
                                    const y = Math.floor(i / 6);
                                    const seat = gridMap.get(`${x},${y}`);

                                    if (!seat) return <div key={i} className="w-[45px] h-[45px]" />;

                                    return (
                                        <div 
                                            key={seat.seatNumber}
                                            className={`w-[45px] h-[45px] rounded-xl border-2 flex flex-col items-center justify-center transition-all relative group shadow-sm ${
                                                seat.isPermanent ? 'bg-red-500 border-red-600 text-white' :
                                                seat.isBlocked ? 'bg-indigo-500 border-indigo-600 text-white' :
                                                seat.isOnline !== false ? 'bg-green-500 border-green-600 text-white' : 
                                                'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400'
                                            }`}
                                        >
                                            <span className="text-[11px] font-black italic">{seat.seatNumber}</span>
                                            
                                            {/* Action Menu on Hover */}
                                            <div className="absolute inset-0 bg-black/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 p-1 z-20">
                                                <button
                                                    onClick={() => setLocalSeats(prev => prev.map(s => s.seatNumber === seat.seatNumber ? { ...s, isOnline: s.isOnline === false } : s))}
                                                    className="flex-1 bg-green-500 text-[7px] font-black uppercase rounded hover:scale-105 transition-transform"
                                                >WEB</button>
                                                <button
                                                    onClick={() => setLocalSeats(prev => prev.map(s => s.seatNumber === seat.seatNumber ? { ...s, isPermanent: !s.isPermanent } : s))}
                                                    className="flex-1 bg-red-500 text-[7px] font-black uppercase rounded hover:scale-105 transition-transform"
                                                >PERM</button>
                                                <button
                                                    onClick={() => setLocalSeats(prev => prev.map(s => s.seatNumber === seat.seatNumber ? { ...s, isBlocked: !s.isBlocked } : s))}
                                                    className="flex-1 bg-indigo-500 text-[7px] font-black uppercase rounded hover:scale-105 transition-transform"
                                                >RES</button>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
              </div>

              {/* Weekly Schedule Section */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  <Clock className="w-3 h-3" /> Active Operation Days
                </h4>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                        schedule.includes(day) 
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300" 
                        : "bg-white border-gray-100 text-gray-400 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 italic">Select the days this bus is scheduled for its route.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<CheckCircle className="text-green-500" />} label="Paid Bookings" value={stats.paidCount} />
          <StatCard icon={<Users className="text-blue-500" />} label="Total Passengers" value={stats.totalSeats} />
          <StatCard icon={<CreditCard className="text-yellow-600" />} label="Revenue" value={`LKR ${stats.totalEarnings.toLocaleString()}`} />
          <StatCard icon={<Clock className="text-orange-500" />} label="Selected Date" value={selectedDate} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search passengers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-[#fdc106] dark:text-white font-medium"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Manifest Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border-none px-5 py-3 rounded-2xl font-bold dark:text-white focus:ring-2 focus:ring-[#fdc106]"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Filter Payment</span>
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl">
                {["Paid", "Pending", "Cancelled", "All"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setPaymentFilter(f as any)}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${paymentFilter === f ? "bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 ml-auto">
              <button 
                onClick={exportExcel} 
                className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition font-black text-xs border border-green-100"
              >
                <Download className="w-4 h-4" /> EXCEL
              </button>
              <button 
                onClick={exportPDF} 
                className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition font-black text-xs border border-red-100"
              >
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          {!selectedBusId ? (
            <div className="py-20 text-center text-gray-400">
               <Bus className="w-16 h-16 mx-auto mb-4 opacity-10" />
               <p className="font-black">No bus has been assigned to you yet.</p>
               <p className="text-xs mt-2">Please contact the bus owner to get assigned.</p>
            </div>
          ) : (
            <div className="border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4">Seat Info</th>
                      <th className="px-6 py-4">Passenger Details</th>
                      <th className="px-6 py-4">Booking ID</th>
                      <th className="px-6 py-4">Financials</th>
                      <th className="px-6 py-4">Status & Remarks</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {seatBookings.map((row, index) => (
                      <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${row.status === 'Paid' ? 'bg-green-100 text-green-700' : row.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                              {row.seat}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                             {row.name}
                             <ChevronRight className="w-3 h-3 text-gray-300" />
                          </div>
                          <div className="text-xs text-gray-500">{row.phone}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">#{row.bookingId}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-sm dark:text-gray-200">LKR {row.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight mb-2 ${row.status === 'Paid' ? 'bg-green-500 text-white' : row.status === 'Pending' ? 'bg-orange-400 text-white' : 'bg-red-500 text-white'}`}>
                             {row.status}
                          </div>
                          <div className="text-[11px] font-medium text-gray-500 italic max-w-[150px] truncate">{row.remark || "No special instructions"}</div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {row.status !== "Cancelled" && (
                            <button 
                              onClick={() => setCancelModal({ id: row.id, remark: "" })}
                              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all"
                              title="Cancel Booking"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {seatBookings.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-400 group">
                    <Filter className="w-12 h-12 mb-4 opacity-10 group-hover:opacity-20 transition" />
                    <p className="font-bold tracking-tight">No records match your criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {cancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in duration-200">
          <div className="bg-white dark:bg-gray-950 p-8 rounded-3xl shadow-2xl w-full max-w-sm border dark:border-gray-800">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-black mb-2 dark:text-white">Cancel Booking?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone. Please provide a reason:</p>
            <textarea 
              value={cancelModal.remark}
              onChange={e => setCancelModal({ ...cancelModal, remark: e.target.value })}
              placeholder="e.g. Customer requested cancellation due to personal reasons"
              className="w-full border-none bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 mb-6 dark:text-white focus:ring-2 focus:ring-red-500 h-32 resize-none text-sm"
            />
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)} className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-extrabold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition">Discard</button>
              <button 
                onClick={handleCancelBooking} 
                disabled={!cancelModal.remark}
                className="flex-1 py-3 bg-red-600 text-white font-extrabold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-xl shadow-inner">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  </div>
);

export default ConductorDashboard;
