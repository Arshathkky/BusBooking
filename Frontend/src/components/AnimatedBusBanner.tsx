import { useEffect, useState } from 'react';
import { MapPin, Clock, TrendingUp } from 'lucide-react';

function AnimatedBusBanner() {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    setAnimationClass('animate-bus-enter');
  }, []);

  return (
    <div className="relative h-[420px] md:h-[550px] bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 overflow-hidden">

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Floating Circles Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-6 md:left-10 w-14 md:w-20 h-14 md:h-20 bg-white rounded-full animate-float"></div>
        <div className="absolute top-32 right-10 md:right-20 w-12 md:w-16 h-12 md:h-16 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-24 left-1/4 w-10 md:w-12 h-10 md:h-12 bg-white rounded-full animate-float"></div>
      </div>

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-28 md:h-32 bg-gradient-to-t from-gray-900 to-transparent">
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-yellow-400"></div>
        <div className="absolute bottom-3 left-0 right-0 h-1 bg-white opacity-50 animate-road-line"></div>
      </div>

      {/* Bus Animation */}
      <div className={`absolute bottom-14 md:bottom-16 left-[-220px] ${animationClass}`}>
        <svg
          width="180"
          height="90"
          viewBox="0 0 200 100"
          className="drop-shadow-2xl md:w-[200px] md:h-[100px]"
        >
          <rect x="20" y="20" width="160" height="50" rx="10" fill="#FF6B6B" stroke="#C92A2A" strokeWidth="2"/>

          <rect x="30" y="28" width="30" height="20" rx="3" fill="#4FC3F7" opacity="0.8"/>
          <rect x="65" y="28" width="30" height="20" rx="3" fill="#4FC3F7" opacity="0.8"/>
          <rect x="100" y="28" width="30" height="20" rx="3" fill="#4FC3F7" opacity="0.8"/>
          <rect x="135" y="28" width="30" height="20" rx="3" fill="#4FC3F7" opacity="0.8"/>

          <rect x="25" y="52" width="20" height="15" rx="2" fill="#FFF59D"/>
          <rect x="155" y="52" width="20" height="15" rx="2" fill="#FFF59D"/>

          <circle cx="50" cy="75" r="12" fill="#2C3E50" stroke="#34495E" strokeWidth="3"/>
          <circle cx="50" cy="75" r="6" fill="#7F8C8D"/>
          <circle cx="150" cy="75" r="12" fill="#2C3E50" stroke="#34495E" strokeWidth="3"/>
          <circle cx="150" cy="75" r="6" fill="#7F8C8D"/>

          <path d="M 175 35 L 185 35 L 190 45 L 175 45 Z" fill="#C92A2A"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-4 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 animate-fade-in">
          Travel With Comfort
        </h1>

        <p className="text-base sm:text-lg md:text-2xl mb-6 md:mb-8 animate-fade-in-delayed max-w-2xl">
          Book your bus tickets easily and travel to your destination safely
        </p>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-8 mt-4 md:mt-8 animate-slide-up">

          <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-md px-5 py-3 rounded-xl">
            <MapPin className="w-5 h-5 md:w-6 md:h-6" />
            <div className="text-left">
              <p className="text-xs md:text-sm opacity-90">500+ Routes</p>
              <p className="font-bold text-sm md:text-base">Nationwide</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-md px-5 py-3 rounded-xl">
            <Clock className="w-5 h-5 md:w-6 md:h-6" />
            <div className="text-left">
              <p className="text-xs md:text-sm opacity-90">24/7 Service</p>
              <p className="font-bold text-sm md:text-base">Always Available</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-md px-5 py-3 rounded-xl">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            <div className="text-left">
              <p className="text-xs md:text-sm opacity-90">50k+ Bookings</p>
              <p className="font-bold text-sm md:text-base">Happy Customers</p>
            </div>
          </div>

        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes busEnter {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(100vw + 250px));
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes floatDelayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes roadLine {
          0% { transform: translateX(0); }
          100% { transform: translateX(100px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInDelayed {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-bus-enter {
          animation: busEnter 10s linear infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: floatDelayed 4s ease-in-out infinite;
        }

        .animate-road-line {
          animation: roadLine 2s linear infinite;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fadeInDelayed 1s ease-out 0.3s backwards;
        }

        .animate-slide-up {
          animation: slideUp 1s ease-out 0.6s backwards;
        }
      `}</style>
    </div>
  );
}

export default AnimatedBusBanner;