import React, { useState } from 'react';
import { X, MapPin, Clock, Route } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface AddRouteModalProps {
  onClose: () => void;
}

const AddRouteModal: React.FC<AddRouteModalProps> = ({ onClose }) => {
  const { addRoute } = useData();
  const [formData, setFormData] = useState({
    name: '',
    startPoint: '',
    endPoint: '',
    distance: '',
    duration: '',
    status: 'active' as 'active' | 'inactive'
  });

  const cities = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura', 
    'Polonnaruwa', 'Nuwara Eliya', 'Batticaloa', 'Trincomalee', 'Matara', 'Kurunegala'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRoute({
      name: formData.name,
      startPoint: formData.startPoint,
      endPoint: formData.endPoint,
      distance: parseInt(formData.distance),
      duration: formData.duration,
      status: formData.status
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="bg-[#fdc106] p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Route className="w-8 h-8 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Route</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create a new bus route</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Route className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Route Name (e.g., Colombo - Kandy Express)"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={formData.startPoint}
                onChange={(e) => handleInputChange('startPoint', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Start Point</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={formData.endPoint}
                onChange={(e) => handleInputChange('endPoint', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select End Point</option>
                {cities.filter(city => city !== formData.startPoint).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Distance (km)"
                  value={formData.distance}
                  onChange={(e) => handleInputChange('distance', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Duration (e.g., 3h 30m)"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Add Route
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRouteModal;