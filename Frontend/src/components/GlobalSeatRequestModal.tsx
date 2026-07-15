import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import api from '../api/axios';

interface GlobalSeatRequestModalProps {
  onClose: () => void;
}

const GlobalSeatRequestModal: React.FC<GlobalSeatRequestModalProps> = ({ onClose }) => {
  const [requestName, setRequestName] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState(1);
  const [requestBusType, setRequestBusType] = useState("Any");
  const [requestTime, setRequestTime] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSuccess(null);
    setRequestError(null);
    setSubmittingRequest(true);

    try {
      const response = await api.post("/seat-requests", {
        name: requestName,
        phone: requestPhone,
        from,
        to,
        date,
        seats,
        busType: requestBusType,
        time: requestTime || "Requested",
      });

      if (response.data.success) {
        setRequestSuccess(response.data.message || "Request sent successfully!");
        setRequestName("");
        setRequestPhone("");
        setFrom("");
        setTo("");
        setDate("");
      } else {
        setRequestError(response.data.message || "Failed to submit request.");
      }
    } catch (err: any) {
      console.error(err);
      setRequestError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all animate-in zoom-in-95 duration-200">
        <form onSubmit={handleRequestSubmit}>
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#fdc106]" />
                Request a Seat
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We'll contact owners and reply within 15 minutes!
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 font-bold p-2 bg-gray-200 dark:bg-gray-800 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {requestSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-xl border border-green-200 dark:border-green-800 text-sm font-semibold">
                {requestSuccess}
              </div>
            )}
            {requestError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-xl border border-red-200 dark:border-red-800 text-sm font-semibold">
                {requestError}
              </div>
            )}

            {!requestSuccess && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">From</label>
                    <input
                      type="text"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Departure City"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">To</label>
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Destination City"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Date</label>
                    <input
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Seats</label>
                    <input
                      type="number"
                      min="1"
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Preferred Time</label>
                  <input
                    type="text"
                    value={requestTime}
                    onChange={(e) => setRequestTime(e.target.value)}
                    placeholder="e.g. Morning, 08:00 AM, Night"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Your Name</label>
                    <input
                      type="text"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                    <input
                      type="tel"
                      value={requestPhone}
                      onChange={(e) => setRequestPhone(e.target.value)}
                      placeholder="Mobile Number"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Bus Type</label>
                  <select
                    value={requestBusType}
                    onChange={(e) => setRequestBusType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdc106]"
                  >
                    <option value="Any">Any</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Semi-Luxury">Semi-Luxury</option>
                    <option value="Super Luxury">Super Luxury</option>
                    <option value="Sleeper">Sleeper</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {requestSuccess ? "Close" : "Cancel"}
            </button>
            {!requestSuccess && (
              <button
                type="submit"
                disabled={submittingRequest}
                className="px-8 py-3 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingRequest ? "Sending..." : "Submit Request"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalSeatRequestModal;
