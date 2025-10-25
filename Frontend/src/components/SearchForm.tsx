import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { SearchData } from '../App';

interface SearchFormProps {
  onSearch: (data: SearchData) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  const popularRoutes = [
    { from: 'Colombo', to: 'Kandy' },
    { from: 'Colombo', to: 'Galle' },
    { from: 'Kandy', to: 'Nuwara Eliya' },
    { from: 'Colombo', to: 'Anuradhapura' },
  ];

  const cities = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura', 
    'Polonnaruwa', 'Nuwara Eliya', 'Batticaloa', 'Trincomalee'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to && date) {
      onSearch({ from, to, date, passengers });
    }
  };

  const handlePopularRoute = (route: { from: string; to: string }) => {
    setFrom(route.from);
    setTo(route.to);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Book Your Bus Journey
        </h2>
        <p className="text-xl text-gray-600">
          Safe, comfortable, and affordable bus travel across Sri Lanka
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  required
                >
                  <option value="">Select destination city</option>
                  {cities.filter(city => city !== from).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Passengers
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <Search className="w-5 h-5" />
              <span>Search Buses</span>
            </button>
          </div>
        </form>
      </div>

      {/* Popular Routes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Popular Routes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularRoutes.map((route, index) => (
            <button
              key={index}
              onClick={() => handlePopularRoute(route)}
              className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-all duration-200 text-left"
            >
              <div className="text-sm font-semibold text-gray-800">
                {route.from} → {route.to}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;