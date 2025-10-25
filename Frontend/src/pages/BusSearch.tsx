import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Clock, Star, Bus, Building2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useBus } from '../contexts/busDataContexts';


const BusSearch: React.FC = () => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1
  });
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { routes } = useData();
  const { buses } = useBus();

  const cities = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura', 
    'Polonnaruwa', 'Nuwara Eliya', 'Batticaloa', 'Trincomalee', 'Matara', 'Kurunegala'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchData.from && searchData.to && searchData.date) {
      setShowResults(true);
      setSelectedCompany('');
    }
  };

  const handleBusSelect = (busId: string) => {
    navigate(`/seat-selection/${busId}`, { state: { searchData } });
  };

  const today = new Date().toISOString().split('T')[0];

  // Get available routes based on search
  const availableRoutes = routes.filter(route => 
    route.startPoint === searchData.from && 
    route.endPoint === searchData.to &&
    route.status === 'active'
  );

  // Get buses for available routes
  const availableBuses = buses.filter(bus => 
    availableRoutes.some(route => route.id === bus.routeId) &&
    bus.status === 'active'
  );

  // Group buses by company
  const busesByCompany = availableBuses.reduce((acc, bus) => {
    if (!acc[bus.companyName]) {
      acc[bus.companyName] = [];
    }
    acc[bus.companyName].push(bus);
    return acc;
  }, {} as Record<string, typeof availableBuses>);

  const companies = Object.keys(busesByCompany);

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

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={searchData.from}
                  onChange={(e) => setSearchData(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select departure city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={searchData.to}
                  onChange={(e) => setSearchData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select destination city</option>
                  {cities.filter(city => city !== searchData.from).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData(prev => ({ ...prev, date: e.target.value }))}
                  min={today}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Passengers
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={searchData.passengers}
                  onChange={(e) => setSearchData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold py-4 px-12 rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <Search className="w-5 h-5" />
              <span>Search Buses</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {searchData.from} → {searchData.to}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {companies.length} companies • {availableBuses.length} buses found
            </p>
          </div>

          {/* Company Selection */}
          {!selectedCompany && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Bus Company</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <button
                    key={company}
                    onClick={() => setSelectedCompany(company)}
                    className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-[#fdc106] hover:bg-[#fdc106] hover:bg-opacity-10 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#fdc106] rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-900" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">{company}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {busesByCompany[company].length} buses available
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <div className="flex space-x-2">
                            {busesByCompany[company].slice(0, 3).map((bus, index) => (
                              <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {bus.departureTime}
                              </span>
                            ))}
                            {busesByCompany[company].length > 3 && (
                              <span className="text-xs text-gray-500">+{busesByCompany[company].length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bus Details for Selected Company */}
          {selectedCompany && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-[#fdc106]" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCompany}</h4>
                  <span className="bg-[#fdc106] text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                    {busesByCompany[selectedCompany].length} buses
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCompany('')}
                  className="text-[#fdc106] hover:text-[#e6ad05] font-medium"
                >
                  ← Back to Companies
                </button>
              </div>

              {busesByCompany[selectedCompany].map((bus) => (
                <div key={bus.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{bus.name}</h4>
                            <p className="text-[#fdc106] font-medium">{bus.type}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Star className="w-4 h-4 text-[#fdc106] fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">4.5</span>
                              {bus.isSpecial && (
                                <span className="ml-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
                                  Special
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              LKR {bus.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">per person</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-8 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {bus.isSpecial && bus.specialTime ? bus.specialTime : bus.departureTime}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{searchData.from}</p>
                            </div>
                          </div>
                          
                          <div className="flex-1 text-center">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                              {bus.duration}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{bus.arrivalTime}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{searchData.to}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {bus.totalSeats - 10} seats available
                            </span>
                            <div className="flex items-center space-x-2">
                              {bus.amenities.slice(0, 3).map((amenity, index) => (
                                <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleBusSelect(bus.id)}
                            className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
                          >
                            Select Seats
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {availableBuses.length === 0 && (
            <div className="text-center py-12">
              <Bus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No buses found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No buses available for the selected route and date
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusSearch;