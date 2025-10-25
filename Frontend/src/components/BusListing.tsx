import React from 'react';
import { ArrowLeft, Clock, MapPin, Users, Wifi, Coffee, Snowflake, Star } from 'lucide-react';
import { SearchData, Bus } from '../App';

interface BusListingProps {
  searchData: SearchData;
  onBusSelect: (bus: Bus) => void;
  onBack: () => void;
}

const BusListing: React.FC<BusListingProps> = ({ searchData, onBusSelect, onBack }) => {
  const buses: Bus[] = [
    {
      id: '1',
      name: 'Super Express Luxury',
      type: 'AC Sleeper',
      departure: '06:00',
      arrival: '10:30',
      duration: '4h 30m',
      price: 1250,
      availableSeats: 12,
      totalSeats: 45,
      amenities: ['wifi', 'ac', 'refreshments', 'entertainment']
    },
    {
      id: '2',
      name: 'Comfort Plus',
      type: 'AC Semi Sleeper',
      departure: '08:15',
      arrival: '13:00',
      duration: '4h 45m',
      price: 980,
      availableSeats: 8,
      totalSeats: 40,
      amenities: ['ac', 'refreshments', 'charging']
    },
    {
      id: '3',
      name: 'Economy Express',
      type: 'Non-AC',
      departure: '09:30',
      arrival: '14:45',
      duration: '5h 15m',
      price: 650,
      availableSeats: 18,
      totalSeats: 50,
      amenities: ['charging', 'entertainment']
    },
    {
      id: '4',
      name: 'Night Rider Deluxe',
      type: 'AC Sleeper',
      departure: '22:00',
      arrival: '03:15',
      duration: '5h 15m',
      price: 1580,
      availableSeats: 5,
      totalSeats: 36,
      amenities: ['wifi', 'ac', 'blanket', 'entertainment']
    }
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'ac': return <Snowflake className="w-4 h-4" />;
      case 'refreshments': return <Coffee className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getAmenityLabel = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return 'Free WiFi';
      case 'ac': return 'AC';
      case 'refreshments': return 'Refreshments';
      case 'charging': return 'Charging Point';
      case 'entertainment': return 'Entertainment';
      case 'blanket': return 'Blanket';
      default: return amenity;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>
          <div className="text-gray-400">|</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {searchData.from} → {searchData.to}
            </h2>
            <p className="text-gray-600">
              {new Date(searchData.date).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {searchData.passengers} {searchData.passengers === 1 ? 'Passenger' : 'Passengers'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Found</p>
          <p className="text-xl font-bold text-blue-600">{buses.length} buses</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-gray-700">Sort by:</span>
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
            Departure Time
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-colors">
            Price
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-colors">
            Duration
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-colors">
            Availability
          </button>
        </div>
      </div>

      {/* Bus Cards */}
      <div className="space-y-4">
        {buses.map((bus) => (
          <div key={bus.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Bus Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{bus.name}</h3>
                      <p className="text-blue-600 font-medium">{bus.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">LKR {bus.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">per person</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-800">{bus.departure}</p>
                        <p className="text-sm text-gray-600">{searchData.from}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center">
                      <div className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-600">
                        {bus.duration}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-800">{bus.arrival}</p>
                        <p className="text-sm text-gray-600">{searchData.to}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {bus.availableSeats} seats available
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {bus.amenities.slice(0, 4).map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-1 text-gray-600">
                            {getAmenityIcon(amenity)}
                            <span className="text-xs hidden sm:inline">
                              {getAmenityLabel(amenity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onBusSelect(bus)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        bus.availableSeats > 0
                          ? 'bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={bus.availableSeats === 0}
                    >
                      {bus.availableSeats > 0 ? 'Select Seats' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-gray-600">
        <p>All times are in local time. Prices include all applicable taxes.</p>
      </div>
    </div>
  );
};

export default BusListing;