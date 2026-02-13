import { useEffect, useState } from 'react';
import { MapPin, Clock, TrendingUp } from 'lucide-react';

function AnimatedBusBanner() {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    setAnimationClass('animate-bus-enter');
  }, []);

  return (
    <div className="relative h-[500px] bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-float"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-800 to-transparent">
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-yellow-400"></div>
        <div className="absolute bottom-2 left-0 right-0 h-1 bg-white opacity-50 animate-road-line"></div>
      </div>

      <div className={`absolute bottom-16 left-0 ${animationClass}`}>
        <svg width="200" height="100" viewBox="0 0 200 100" className="drop-shadow-2xl">
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

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in text-center">
          Travel With Comfort
        </h1>
        <p className="text-xl md:text-2xl mb-8 animate-fade-in-delayed text-center max-w-2xl">
          Book your bus tickets easily and travel to your destination safely
        </p>

        <div className="flex flex-wrap justify-center gap-8 mt-8 animate-slide-up">
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-md px-6 py-3 rounded-lg">
            <MapPin className="w-6 h-6" />
            <div>
              <p className="text-sm opacity-90">500+ Routes</p>
              <p className="font-bold">Nationwide</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-md px-6 py-3 rounded-lg">
            <Clock className="w-6 h-6" />
            <div>
              <p className="text-sm opacity-90">24/7 Service</p>
              <p className="font-bold">Always Available</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-md px-6 py-3 rounded-lg">
            <TrendingUp className="w-6 h-6" />
            <div>
              <p className="text-sm opacity-90">50k+ Bookings</p>
              <p className="font-bold">Happy Customers</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes busEnter {
          from {
            transform: translateX(-250px);
          }
          to {
            transform: translateX(calc(100vw - 200px));
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes floatDelayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes roadLine {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDelayed {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bus-enter {
          animation: busEnter 8s linear infinite;
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
