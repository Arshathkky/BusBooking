import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Bus, 
  MessageSquare, 
  RefreshCw,
  Send
} from "lucide-react";
import api from "../api/axios";

interface SeatRequest {
  _id: string;
  name: string;
  phone: string;
  from: string;
  to: string;
  date: string;
  seats: number;
  busType: string;
  time: string;
  status: "pending" | "approved" | "rejected";
  replyMessage: string;
  createdAt: string;
}

interface SeatRequestsTabProps {
  ownerId?: string;
  role: "admin" | "owner";
}

const SeatRequestsTab: React.FC<SeatRequestsTabProps> = ({ ownerId, role }) => {
  const [requests, setRequests] = useState<SeatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // State for replying
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyStatus, setReplyStatus] = useState<"approved" | "rejected">("approved");
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: SeatRequest[] }>("/seat-requests", {
        params: {
          ownerId: role === "owner" ? ownerId : undefined
        }
      });
      setRequests(response.data.data || []);
    } catch (err) {
      console.error("Error fetching seat requests:", err);
      setError("Failed to load seat requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [ownerId, role]);

  const handleOpenReplyModal = (reqId: string, status: "approved" | "rejected") => {
    setReplyingToId(reqId);
    setReplyStatus(status);
    setReplyText("");
  };

  const handleCloseReplyModal = () => {
    setReplyingToId(null);
    setReplyText("");
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingToId) return;

    setSubmittingReply(true);
    try {
      await api.patch(`/seat-requests/${replyingToId}`, {
        status: replyStatus,
        replyMessage: replyText.trim()
      });
      
      // Update state locally
      setRequests(prev =>
        prev.map(req =>
          req._id === replyingToId
            ? { ...req, status: replyStatus, replyMessage: replyText.trim() }
            : req
        )
      );
      handleCloseReplyModal();
    } catch (err) {
      console.error("Error updating seat request status:", err);
      alert("Failed to submit response. Please try again.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (statusFilter === "all") return true;
    return req.status === statusFilter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bus className="w-5 h-5 text-[#fdc106]" />
            <span>Passenger Seat Requests</span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {role === "admin" 
              ? "All seat requests submitted across the system" 
              : "Seat requests for your operated routes"}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#fdc106] transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50"
            title="Refresh Requests"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <RefreshCw className="w-10 h-10 animate-spin text-[#fdc106] mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading seat requests...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-red-500 font-semibold">{error}</p>
          <button
            onClick={fetchRequests}
            className="mt-4 px-6 py-2 bg-[#fdc106] text-gray-900 font-bold rounded-xl hover:bg-[#e6ad05] transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-bold">No seat requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            <div 
              key={req._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start gap-2 mb-4">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusBadgeClass(req.status)}`}>
                      {req.status === "pending" && <Clock className="w-3.5 h-3.5" />}
                      {req.status === "approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {req.status === "rejected" && <XCircle className="w-3.5 h-3.5" />}
                      {req.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date(req.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Passenger details */}
                <div className="flex items-center gap-3 mb-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                  <div className="w-10 h-10 bg-[#fdc106]/10 text-[#fdc106] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{req.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{req.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Request details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {req.from} → {req.to}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Travel Date</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {req.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Requested Seats</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white block mt-0.5">
                        {req.seats} {req.seats === 1 ? "seat" : "seats"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Bus Type</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mt-0.5">
                        {req.busType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Preferred Time</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mt-0.5">
                        {req.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reply message section */}
              <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4 flex flex-col justify-end">
                {req.replyMessage && (
                  <div className="mb-4 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                      <MessageSquare className="w-3 h-3 text-[#fdc106]" />
                      <span>Response Reply:</span>
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 italic font-medium">
                      "{req.replyMessage}"
                    </p>
                  </div>
                )}

                {/* Actions for Pending Requests */}
                {req.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenReplyModal(req._id, "approved")}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Request</span>
                    </button>
                    <button
                      onClick={() => handleOpenReplyModal(req._id, "rejected")}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyingToId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmitReply}>
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {replyStatus === "approved" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span>
                    {replyStatus === "approved" ? "Approve Seat Request" : "Reject Seat Request"}
                  </span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Send a response message to the passenger.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Reply Message
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      replyStatus === "approved"
                        ? "e.g., We have approved your request and held a seat on our Luxury bus departing at 8:00 AM."
                        : "e.g., Unfortunately, all luxury buses are fully booked at that time. We have standard seats available."
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fdc106] transition-all resize-none"
                    required
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseReplyModal}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="px-5 py-2 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingReply ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatRequestsTab;
