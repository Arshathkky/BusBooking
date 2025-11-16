// import React from 'react';
// import { CheckCircle, Download, ArrowLeft, RotateCcw, Calendar, MapPin, Clock, Users } from 'lucide-react';
// import { Booking } from '../App';

// interface BookingConfirmationProps {
//   booking: Booking;
//   onBack: () => void;
//   onNewSearch: () => void;
// }

// const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, onBack, onNewSearch }) => {
//   const bookingId = `SLTB${Date.now().toString().slice(-6)}`;
  
//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="text-center mb-8">
//         <div className="flex justify-center mb-4">
//           <div className="bg-green-100 p-4 rounded-full">
//             <CheckCircle className="w-16 h-16 text-green-600" />
//           </div>
//         </div>
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
//         <p className="text-gray-600 text-lg">Your seats have been successfully reserved</p>
//       </div>

//       {/* Booking Details Card */}
//       <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h2 className="text-2xl font-bold mb-1">SLTB e-Ticket</h2>
//               <p className="text-blue-200">Booking ID: {bookingId}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-blue-200">Total Amount</p>
//               <p className="text-3xl font-bold">LKR {booking.totalAmount.toLocaleString()}</p>
//             </div>
//           </div>
//         </div>

//         {/* Journey Details */}
//         <div className="p-8">
//           <div className="grid md:grid-cols-2 gap-8 mb-8">
//             <div>
//               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <MapPin className="w-5 h-5 mr-2 text-blue-600" />
//                 Journey Details
//               </h3>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <span className="text-gray-600">From:</span>
//                   <span className="font-semibold text-gray-800">{booking.bus.name}</span>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <span className="text-gray-600">Bus Type:</span>
//                   <span className="font-semibold text-gray-800">{booking.bus.type}</span>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <span className="text-gray-600">Departure:</span>
//                   <span className="font-semibold text-gray-800">{booking.bus.departure}</span>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <span className="text-gray-600">Arrival:</span>
//                   <span className="font-semibold text-gray-800">{booking.bus.arrival}</span>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <span className="text-gray-600">Duration:</span>
//                   <span className="font-semibold text-gray-800">{booking.bus.duration}</span>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <Users className="w-5 h-5 mr-2 text-blue-600" />
//                 Passenger Details
//               </h3>
//               <div className="space-y-3">
//                 {booking.passengerDetails.map((passenger, index) => (
//                   <div key={index} className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="font-semibold text-gray-800">{passenger.name}</span>
//                       <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                         Seat {booking.selectedSeats[index]}
//                       </span>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       {passenger.gender} • {passenger.age} years old
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Important Information */}
//           <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-8">
//             <h4 className="font-bold text-yellow-800 mb-2">Important Information:</h4>
//             <ul className="text-yellow-700 text-sm space-y-1">
//               <li>• Please arrive at the boarding point 15 minutes before departure</li>
//               <li>• Carry a valid ID proof for verification</li>
//               <li>• Keep this ticket handy for verification during travel</li>
//               <li>• For cancellation, visit nearest SLTB office or call customer care</li>
//             </ul>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2">
//               <Download className="w-5 h-5" />
//               <span>Download Ticket</span>
//             </button>
            
//             <button 
//               onClick={onNewSearch}
//               className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
//             >
//               <RotateCcw className="w-5 h-5" />
//               <span>Book Another Trip</span>
//             </button>
            
//             <button 
//               onClick={onBack}
//               className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               <span>Back</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Customer Support */}
//       <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//         <h3 className="text-lg font-bold text-gray-800 mb-2">Need Help?</h3>
//         <p className="text-gray-600 mb-4">
//           Contact our customer support for any assistance
//         </p>
//         <div className="flex justify-center space-x-8 text-sm">
//           <div>
//             <p className="font-semibold text-gray-800">Phone</p>
//             <p className="text-blue-600">+94 11 250 8888</p>
//           </div>
//           <div>
//             <p className="font-semibold text-gray-800">Email</p>
//             <p className="text-blue-600">support@sltb.lk</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingConfirmation;