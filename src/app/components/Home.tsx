import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Award, BookOpen, ArrowRight } from 'lucide-react';
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
  featured?: boolean;
}

export function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  const [featuredUniversities, setFeaturedUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await fetch(`${API_URL}/universities`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (data.universities) {
        setUniversities(data.universities);
        setFeaturedUniversities(data.universities.filter((u: University) => u.featured).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/universities?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="relative bg-blue-900 text-white py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.9), rgba(30, 58, 138, 0.9)), url('https://images.unsplash.com/photo-1519664699825-ddb2c64076bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1ayUyMHVuaXZlcnNpdHklMjBjYW1wdXMlMjBzdHVkZW50c3xlbnwxfHx8fDE3NzYzNDc2Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Perfect University in the UK
            </h1>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Explore comprehensive information about all UK universities, including fees, requirements, scholarships, and more.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by university name, city, or course..."
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                to="/universities?location=London"
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                London Universities
              </Link>
              <Link
                to="/universities?fees=low"
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                Affordable Fees
              </Link>
              <Link
                to="/universities?ielts=waived"
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
              >
                <Award className="w-4 h-4 inline mr-2" />
                IELTS Waived
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{universities.length}+</div>
              <div className="text-gray-600">Universities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Courses Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Scholarships</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Updated Info</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Universities */}
      {featuredUniversities.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Universities</h2>
              <p className="text-gray-600 text-lg">Top universities handpicked for you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredUniversities.map((university) => (
                <Link
                  key={university.id}
                  to={`/universities/${university.id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={university.thumbnailUrl || 'https://images.unsplash.com/photo-1687361242200-c5122b63fe70?w=400'}
                      alt={university.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {university.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      {university.city}, {university.country}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      {university.tuitionFeesUG && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Tuition: {university.tuitionFeesUG}
                        </div>
                      )}
                      {university.ieltsScore && (
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-2" />
                          IELTS: {university.ieltsScore}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center text-blue-600 font-semibold">
                      View Details <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/universities"
                className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                View All Universities
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg">Everything you need to make an informed decision</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Search</h3>
              <p className="text-gray-600">
                Find universities by name, location, course, or specific requirements
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Detailed Information</h3>
              <p className="text-gray-600">
                Get comprehensive details about fees, requirements, intakes, and scholarships
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Updated Daily</h3>
              <p className="text-gray-600">
                Always current information maintained by our admin team
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

