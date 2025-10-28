import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Bus, Building2 } from "lucide-react";
import { useRouteData } from "../contexts/RouteDataContext";
import { useSearch } from "../contexts/searchContext"; // ✅ NEW CONTEXT HOOK

const BusSearch: React.FC = () => {
  const [focusField, setFocusField] = useState<"from" | "to" | null>(null);
  const navigate = useNavigate();

  const { routes = [] } = useRouteData() || {};
  const { searchData, setSearchData, results, searchBuses, loading } =
    useSearch();

  const today = new Date().toISOString().split("T")[0];
  const [selectedCompany, setSelectedCompany] = useState<string>("");

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

  const availableBuses = results.buses || [];
  const companies = Object.keys(results.busesByCompany || {});

  return (
    <div className="max-w-6xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <select
                  value={searchData.passengers}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      passengers: parseInt(e.target.value),
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {[...Array(10)].map((_, i) => {
                    const num = i + 1;
                    return (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Passenger" : "Passengers"}
                      </option>
                    );
                  })}
                </select>
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
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Rs. {bus.price.toLocaleString()} per seat
                            </p>
                          </div>
                          <button className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold px-4 py-2 rounded-lg">
                            Select Seats
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BusSearch;
