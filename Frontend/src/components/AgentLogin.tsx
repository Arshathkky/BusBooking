import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

// ✅ Define the Area type
interface Area {
  id: number;
  name: string;
  agents: number;
}

const areas: Area[] = [
  { id: 1, name: 'New York', agents: 5 },
  { id: 2, name: 'Los Angeles', agents: 4 },
  { id: 3, name: 'Chicago', agents: 3 },
  { id: 4, name: 'Houston', agents: 4 },
  { id: 5, name: 'Phoenix', agents: 3 },
  { id: 6, name: 'Philadelphia', agents: 2 },
  { id: 7, name: 'San Antonio', agents: 3 },
  { id: 8, name: 'San Diego', agents: 4 },
];

function AgentLogin() {
  const navigate = useNavigate();

  // ✅ Use the Area type instead of any
  const handleAreaSelect = (area: Area) => {
    navigate('/login', {
      state: { selectedArea: area }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Select Area</h1>
            <p className="text-blue-100">Choose your area to continue</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {areas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handleAreaSelect(area)}
                  className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all transform hover:scale-105 hover:shadow-lg"
                >
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold text-gray-800">{area.name}</p>
                  <p className="text-sm text-gray-500">{area.agents} agents</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentLogin;
