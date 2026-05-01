import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, DollarSign, Award, Filter, X } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../lib/supabase';

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  thumbnailUrl?: string;
  tuitionFeesUG?: string;
  tuitionFeesPG?: string;
  ieltsRequired?: boolean;
  ieltsScore?: string;
  pteRequired?: boolean;
  pteScore?: string;
  intakes?: string[];
  description?: string;
}

export function UniversitiesListing() {
  const [searchParams] = useSearchParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedIntake, setSelectedIntake] = useState('');
  const [ieltsWaived, setIeltsWaived] = useState(false);
  const [pteWaived, setPteWaived] = useState(false);
  const [minFees, setMinFees] = useState('');
  const [maxFees, setMaxFees] = useState('');

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [universities, searchQuery, selectedCity, selectedIntake, ieltsWaived, pteWaived, minFees, maxFees]);

  const fetchUniversities = async () => {
    try {
      const response = await fetch(`${API_URL}/universities`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (data.universities) {
        setUniversities(data.universities);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...universities];

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(uni =>
        uni.name.toLowerCase().includes(query) ||
        uni.city.toLowerCase().includes(query) ||
        uni.description?.toLowerCase().includes(query)
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(uni => uni.city === selectedCity);
    }

    // Intake filter
    if (selectedIntake) {
      filtered = filtered.filter(uni => 
        uni.intakes?.includes(selectedIntake)
      );
    }

    // IELTS waived filter
    if (ieltsWaived) {
      filtered = filtered.filter(uni => !uni.ieltsRequired);
    }

    // PTE waived filter
    if (pteWaived) {
      filtered = filtered.filter(uni => !uni.pteRequired);
    }

    // Fees filter
    if (minFees || maxFees) {
      filtered = filtered.filter(uni => {
        const fee = parseInt(uni.tuitionFeesUG?.replace(/[^0-9]/g, '') || '0');
        const min = minFees ? parseInt(minFees) : 0;
        const max = maxFees ? parseInt(maxFees) : Infinity;
        return fee >= min && fee <= max;
      });
    }

    setFilteredUniversities(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedIntake('');
    setIeltsWaived(false);
    setPteWaived(false);
    setMinFees('');
    setMaxFees('');
  };

  const cities = Array.from(new Set(universities.map(u => u.city))).sort();
  const intakes = ['January', 'February', 'May', 'September', 'October'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading universities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">UK Universities</h1>
          <p className="text-gray-600 text-lg">
            Explore {universities.length} universities across the United Kingdom
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search universities..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {(selectedCity || selectedIntake || ieltsWaived || pteWaived || minFees || maxFees) && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Intake Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intake
                  </label>
                  <select
                    value={selectedIntake}
                    onChange={(e) => setSelectedIntake(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Intakes</option>
                    {intakes.map(intake => (
                      <option key={intake} value={intake}>{intake}</option>
                    ))}
                  </select>
                </div>

                {/* Min Fees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Fees (£)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 10000"
                    value={minFees}
                    onChange={(e) => setMinFees(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Max Fees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Fees (£)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 30000"
                    value={maxFees}
                    onChange={(e) => setMaxFees(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* English Tests */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English Tests
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ieltsWaived}
                      onChange={(e) => setIeltsWaived(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">IELTS Waived</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pteWaived}
                      onChange={(e) => setPteWaived(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">PTE Waived</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Showing {filteredUniversities.length} of {universities.length} universities
        </div>

        {/* Universities Grid */}
        {filteredUniversities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No universities found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((university) => (
              <Link
                key={university.id}
                to={`/universities/${university.id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={university.thumbnailUrl || 'https://images.unsplash.com/photo-1687361242200-c5122b63fe70?w=400'}
                    alt={university.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {university.name}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {university.city}, {university.country}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {university.tuitionFeesUG && (
                      <div className="flex items-center text-gray-700">
                        <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-semibold">UG:</span>&nbsp;{university.tuitionFeesUG}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {!university.ieltsRequired && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          IELTS Waived
                        </span>
                      )}
                      {!university.pteRequired && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          PTE Waived
                        </span>
                      )}
                      {university.ieltsScore && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          IELTS {university.ieltsScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

