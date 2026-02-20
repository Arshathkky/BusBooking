import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface Area {
  name: string;
  agents: number;
}

function AgentLogin() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await axios.get(
        "https://bus-booking-nt91.onrender.com/api/conductors/agent-cities/list"
      );
      setAreas(res.data);
    } catch (err) {
      console.error("Failed to fetch cities", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSelect = (area: Area) => {
    navigate("/login", {
      state: { selectedCity: area.name },
    });
  };

  if (loading) {
    return <div className="text-center mt-20">Loading cities...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Select City</h1>
            <p className="text-blue-100">Choose your city to continue</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {areas.map((area, index) => (
                <button
                  key={index}
                  onClick={() => handleAreaSelect(area)}
                  className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all transform hover:scale-105 hover:shadow-lg"
                >
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold text-gray-800">{area.name}</p>
                  <p className="text-sm text-gray-500">
                    {area.agents} agents
                  </p>
                </button>
              ))}
            </div>

            {areas.length === 0 && (
              <p className="text-center text-gray-500">
                No agent cities available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentLogin;