import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Bus, Building2 } from "lucide-react";
import { useRouteData } from "../contexts/RouteDataContext";
import { useSearch } from "../contexts/searchContext"; // ✅ NEW CONTEXT HOOK
import api from "../api/axios";

const BusSearch: React.FC = () => {
  const [focusField, setFocusField] = useState<"from" | "to" | null>(null);
  const navigate = useNavigate();

  const { routes = [] } = useRouteData() || {};
  const { searchData, setSearchData, results, searchBuses, loading } =
    useSearch();

  const today = new Date().toISOString().split("T")[0];
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  // --- Seat Request States ---
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [requestBusType, setRequestBusType] = useState("Luxury");
  const [requestTime, setRequestTime] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const availableBuses = results.buses || [];
  const companies = Object.keys(results.busesByCompany || {});

  const departureTimes = Array.from(
    new Set(availableBuses.map((b: any) => b.departureTime).filter(Boolean))
  );

  // Set default preferred time when departure times are loaded
  useEffect(() => {
    if (departureTimes.length > 0) {
      setRequestTime(departureTimes[0]);
    } else {
      setRequestTime("08:00 AM");
    }
  }, [results]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSuccess(null);
    setRequestError(null);
    setSubmittingRequest(true);

    const finalTime = requestTime === "other" ? customTime : requestTime;

    if (!finalTime) {
      setRequestError("Please specify a departure time.");
      setSubmittingRequest(false);
      return;
    }

    try {
      const response = await api.post("/seat-requests", {
        name: requestName,
        phone: requestPhone,
        from: searchData.from,
        to: searchData.to,
        date: searchData.date,
        seats: searchData.passengers || 1,
        busType: requestBusType || "Any",
        time: finalTime,
        searchData: {
          from: searchData.from,
          to: searchData.to,
          date: searchData.date,
          passengers: searchData.passengers || 1,
        },
      });

      if (response.data.success) {
        setRequestSuccess(response.data.message || "Request sent successfully!");
        setRequestName("");
        setRequestPhone("");
        setCustomTime("");
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

  // ✅ Extract all stops for autosuggestion
  const allStops = Array.from(
    new Set(
      routes.flatMap((r) => [r.startPoint, r.endPoint, ...(r.stops || [])])
    )
  ).filter(Boolean);

  const filterSuggestions = (input: string) => {
    if (!input) return [];
    return allStops.filter((stop) =>
      stop.toLowerCase().startsWith(input.toLowerCase())
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.from || !searchData.to || !searchData.date) return;
    await searchBuses(searchData);
  };

  const handleBusSelect = (busId: string) => {
    navigate(`/seat-selection/${busId}`, { state: { searchData } });
  };

  return (
    <div className="max-w-6xl mx-auto mt-[20px]">
      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 transition-colors">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Perfect Journey
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Safe, comfortable, and affordable bus travel across Sri Lanka
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-6 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* From */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchData.from}
                  onFocus={() => setFocusField("from")}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                  placeholder="Type departure location"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                {focusField === "from" && (
                  <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                    {filterSuggestions(searchData.from).map((stop) => (
                      <li
                        key={stop}
                        onClick={() => {
                          setSearchData((prev) => ({ ...prev, from: stop }));
                          setFocusField(null);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-[#fdc106]/20"
                      >
                        {stop}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* To */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchData.to}
                  onFocus={() => setFocusField("to")}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }
                  placeholder="Type destination"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                {focusField === "to" && (
                  <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                    {filterSuggestions(searchData.to).map((stop) => (
                      <li
                        key={stop}
                        onClick={() => {
                          setSearchData((prev) => ({ ...prev, to: stop }));
                          setFocusField(null);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-[#fdc106]/20"
                      >
                        {stop}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  min={today}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
                  required
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Passengers
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={searchData.passengers || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchData((prev) => ({
                      ...prev,
                      passengers: val === "" ? "" as any : Math.max(1, parseInt(val) || 1),
                    }));
                  }}
                  onBlur={() => {
                    if (!searchData.passengers) {
                      setSearchData((prev) => ({ ...prev, passengers: 1 }));
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold py-4 px-12 rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <Search className="w-5 h-5" />
              <span>{loading ? "Searching..." : "Search Buses"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results && !loading && (
        <div className="space-y-6">
          {availableBuses.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No buses found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No buses available for the selected route and date
              </p>

              {/* Option to request a seat */}
              <div className="mt-8 max-w-md mx-auto bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-6 rounded-2xl transition-colors">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Can't find your bus?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Request a seat now and we will check with available bus operators and reply to you in 15 minutes!
                </p>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Request a Seat
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {searchData.from} → {searchData.to}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {companies.length} companies • {availableBuses.length} buses found
                </p>
              </div>

              {!selectedCompany ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Select Bus Company
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.map((company) => (
                      <button
                        key={company}
                        onClick={() => setSelectedCompany(company)}
                        className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-[#fdc106] hover:bg-[#fdc106]/10 transition-all text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-[#fdc106] rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-gray-900" />
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900 dark:text-white">
                              {company}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {results.busesByCompany[company]?.length || 0} buses available
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <button
                    onClick={() => setSelectedCompany("")}
                    className="text-sm text-[#fdc106] hover:underline mb-4"
                  >
                    ← Back to Companies
                  </button>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {selectedCompany} Buses
                  </h4>
                  <div className="space-y-4">
                    {results.busesByCompany[selectedCompany]?.map((bus) => (
                      <div
                        key={bus.id}
                        onClick={() => handleBusSelect(bus.id)}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-[#fdc106]/10 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {bus.name} ({bus.type})
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Departure: {bus.departureTime} • Arrival: {bus.arrivalTime}
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              Seats: {bus.seatsAvailable}/{bus.totalSeats} available
                            </p>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Rs. {bus.price.toLocaleString()} per seat
                            </p>
                          </div>
                          <button
                              onClick={() => handleBusSelect(bus.id)}
                              className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold px-4 py-2 rounded-lg"
                            >
                              Select Seats
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Look for alternative timings/premium slots request seat banner */}
              {availableBuses.length > 0 && (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-850 dark:to-gray-800 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-gray-850">
                  <div>
                    <h4 className="text-lg font-bold text-[#fdc106]">Looking for alternative timings or premium slots?</h4>
                    <p className="text-sm text-gray-300">Submit a seat request and we'll reply with options in 15 minutes!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(true)}
                    className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold px-6 py-3 rounded-xl transition-all flex-shrink-0"
                  >
                    Request a Seat
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Request a Seat Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all animate-in zoom-in-95 duration-200">
            <form onSubmit={handleRequestSubmit}>
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Request a Seat</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    We will review and reply within 15 minutes!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestSuccess(null);
                    setRequestError(null);
                  }}
                  className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-300 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {requestSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-xl border border-green-200 dark:border-green-800 text-sm">
                    {requestSuccess}
                  </div>
                )}
                {requestError && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-xl border border-red-200 dark:border-red-800 text-sm">
                    {requestError}
                  </div>
                )}

                {/* Pre-filled info for confirmation */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-1.5 text-xs text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500 dark:text-gray-450">Route:</span>
                    <span className="font-bold text-gray-850 dark:text-gray-200">{searchData.from} → {searchData.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500 dark:text-gray-450">Date:</span>
                    <span className="font-bold text-gray-855 dark:text-gray-200">{searchData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500 dark:text-gray-450">Seats:</span>
                    <span className="font-bold text-gray-855 dark:text-gray-200">{searchData.passengers || 1} seats</span>
                  </div>
                </div>

                {!requestSuccess && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Passenger Name
                      </label>
                      <input
                        type="text"
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#fdc106] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={requestPhone}
                        onChange={(e) => setRequestPhone(e.target.value)}
                        placeholder="Enter your mobile number"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#fdc106] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Preferred Bus Type
                      </label>
                      <select
                        value={requestBusType}
                        onChange={(e) => setRequestBusType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#fdc106] transition-all font-semibold"
                      >
                        <option value="Luxury">Luxury</option>
                        <option value="Semi-Luxury">Semi-Luxury</option>
                        <option value="Super Luxury">Super Luxury</option>
                        <option value="Sleeper">Sleeper</option>
                        <option value="Standard">Standard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider mb-2">
                        Which Departure Time?
                      </label>
                      <select
                        value={requestTime}
                        onChange={(e) => setRequestTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#fdc106] transition-all font-semibold"
                      >
                        {departureTimes.map((time: any) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                        <option value="other">Other / Custom Time</option>
                      </select>
                    </div>

                    {requestTime === "other" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-205">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Specify Custom Departure Time
                        </label>
                        <input
                          type="text"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                          placeholder="e.g., 08:30 PM"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#fdc106] transition-all"
                          required
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestSuccess(null);
                    setRequestError(null);
                  }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  {requestSuccess ? "Close" : "Cancel"}
                </button>
                {!requestSuccess && (
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="px-6 py-2 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submittingRequest ? "Sending..." : "Send Request"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusSearch;
