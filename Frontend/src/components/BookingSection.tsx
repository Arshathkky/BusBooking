
import { useNavigate } from 'react-router-dom';
import { MapPin,Users, ArrowRight } from 'lucide-react';

function BookingSection() {
  const navigate = useNavigate();

 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-2xl shadow-2xl p-8 -mt-20 relative z-20">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Book Your Journey
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Book Seat */}
          <button
            onClick={() => navigate('/search')}
            className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Users className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold">Book a Seat</p>
            <p className="text-sm mt-2 opacity-90">Reserve your bus ticket now</p>
            <ArrowRight className="w-6 h-6 mx-auto mt-4 animate-bounce" />
          </button>

          {/* Agent Login */}
          <button
            onClick={() => navigate('/agent-place')}
            className="group bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
          >
            <MapPin className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold">Login as Agent</p>
            <p className="text-sm mt-2 opacity-90">Manage your bus fleet</p>
            <ArrowRight className="w-6 h-6 mx-auto mt-4 animate-bounce" />
          </button>

        </div>

        {/* Quick Search */}
        {/* <div className="border-t pt-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Quick Search
          </h3>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <input
              type="text"
              placeholder="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-4 py-3"
            />

            <input
              type="text"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-4 py-3"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-4 py-3"
            />

            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-4 py-3"
            >
              <option value="1">1 Passenger</option>
              <option value="2">2 Passengers</option>
              <option value="3">3 Passengers</option>
              <option value="4">4 Passengers</option>
              <option value="5">5+ Passengers</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div> */}
      </div>
    </div>
  );
}

export default BookingSection;
