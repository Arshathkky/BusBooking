import { useNavigate } from 'react-router-dom';
import { MapPin, Users, ArrowRight } from 'lucide-react';

function BookingSection() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 relative z-10">

        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Book Your Journey
        </h2>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Book Seat */}
          <button
            onClick={() => navigate('/search')}
            className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-10 sm:py-12 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center"
          >
            <Users className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
            <p className="text-xl sm:text-2xl font-bold">Book a Seat</p>
            <p className="text-sm mt-2 opacity-90">
              Reserve your bus ticket now
            </p>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 mt-4 group-hover:translate-x-2 transition-transform duration-300" />
          </button>

          {/* Agent Login */}
          <button
            onClick={() => navigate('/agent-place')}
            className="group bg-gradient-to-r from-orange-500 to-red-500 text-white py-10 sm:py-12 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center"
          >
            <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
            <p className="text-xl sm:text-2xl font-bold">Login as Agent</p>
            <p className="text-sm mt-2 opacity-90">
              Manage your bus fleet
            </p>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 mt-4 group-hover:translate-x-2 transition-transform duration-300" />
          </button>

        </div>

      </div>
    </div>
  );
}

export default BookingSection;