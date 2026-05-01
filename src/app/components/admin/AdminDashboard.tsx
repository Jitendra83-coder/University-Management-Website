import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Building2,
  Award,
  Search,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../lib/supabase';
import { UniversityForm } from './UniversityForm';
import { ScholarshipForm } from './ScholarshipForm';
import { SeedData } from './SeedData';

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  thumbnailUrl?: string;
  tuitionFeesUG?: string;
  tuitionFeesPG?: string;
}

interface Scholarship {
  id: string;
  universityId: string;
  name: string;
  amount: string;
  eligibility: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'universities' | 'scholarships'>('universities');
  const [universities, setUniversities] = useState<University[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showUniversityForm, setShowUniversityForm] = useState(false);
  const [showScholarshipForm, setShowScholarshipForm] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const getAuthToken = () => localStorage.getItem('admin_token') || '';

  const fetchData = async () => {
    setLoading(true);
    try {
      // Helper to retry fetches a few times for transient network issues
      const fetchWithRetries = async (url: string, opts: RequestInit = {}, retries = 3, delay = 500) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            const res = await fetch(url, opts);
            return res;
          } catch (err) {
            if (attempt === retries) throw err;
            await new Promise((r) => setTimeout(r, delay * attempt));
          }
        }
        // Shouldn't reach here
        throw new Error('Network error');
      };
      // Fetch universities
      const uniResponse = await fetchWithRetries(`${API_URL}/universities`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (uniResponse.status === 401) {
        toast.error('Unauthorized. Please log in again.');
        navigate('/admin/login');
        return;
      }

      const uniData = await uniResponse.json();
      if (uniData.universities) {
        setUniversities(uniData.universities);
      }

      // Fetch all scholarships
      const allScholarships: Scholarship[] = [];
      for (const uni of (uniData.universities || [])) {
        const schResponse = await fetchWithRetries(`${API_URL}/scholarships/${uni.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
          },
        });

        if (schResponse.status === 401) {
          toast.error('Unauthorized. Please log in again.');
          navigate('/admin/login');
          return;
        }

        const schData = await schResponse.json();
        if (schData.scholarships) {
          allScholarships.push(...schData.scholarships);
        }
      }
      setScholarships(allScholarships);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleDeleteUniversity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this university? This will also delete all associated scholarships.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/universities/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        toast.success('University deleted successfully');
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete university');
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      toast.error('An error occurred');
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/scholarships/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        toast.success('Scholarship deleted successfully');
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete scholarship');
      }
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      toast.error('An error occurred');
    }
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScholarships = scholarships.filter(sch =>
    sch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Universities</p>
                <p className="text-3xl font-bold text-blue-600">{universities.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Scholarships</p>
                <p className="text-3xl font-bold text-yellow-600">{scholarships.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('universities')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'universities'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Universities
              </button>
              <button
                onClick={() => setActiveTab('scholarships')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'scholarships'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Scholarships
              </button>
            </div>
          </div>

          {/* Search and Add Button */}
          <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                if (activeTab === 'universities') {
                  setEditingUniversity(null);
                  setShowUniversityForm(true);
                } else {
                  setEditingScholarship(null);
                  setShowScholarshipForm(true);
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add {activeTab === 'universities' ? 'University' : 'Scholarship'}
            </button>
          </div>

          {/* Universities Table */}
          {activeTab === 'universities' && (
            <div className="overflow-x-auto">
              {/* Seed Data Component - show until 100+ universities exist */}
              {universities.length < 100 && (
                <div className="p-6">
                  <SeedData getAuthToken={getAuthToken} onSuccess={async () => { await fetchData(); }} />
                </div>
              )}
              
              <table className="w-full">
                <thead className="bg-gray-50 border-t border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fees (UG)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUniversities.length === 0 && universities.length > 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No universities found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUniversities.map((university) => (
                      <tr key={university.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={university.thumbnailUrl || 'https://images.unsplash.com/photo-1687361242200-c5122b63fe70?w=100'}
                              alt={university.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="font-medium text-gray-900">{university.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {university.city}, {university.country}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {university.tuitionFeesUG || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUniversity(university);
                                setShowUniversityForm(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUniversity(university.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Scholarships Table */}
          {activeTab === 'scholarships' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-t border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scholarship
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScholarships.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No scholarships found. Click "Add Scholarship" to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredScholarships.map((scholarship) => {
                      const university = universities.find(u => u.id === scholarship.universityId);
                      return (
                        <tr key={scholarship.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {scholarship.name}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {university?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {scholarship.amount}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingScholarship(scholarship);
                                  setShowScholarshipForm(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteScholarship(scholarship.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* University Form Modal */}
      {showUniversityForm && (
        <UniversityForm
          university={editingUniversity}
          onClose={() => {
            setShowUniversityForm(false);
            setEditingUniversity(null);
          }}
          onSuccess={() => {
            setShowUniversityForm(false);
            setEditingUniversity(null);
            fetchData();
          }}
          getAuthToken={getAuthToken}
        />
      )}

      {/* Scholarship Form Modal */}
      {showScholarshipForm && (
        <ScholarshipForm
          scholarship={editingScholarship}
          universities={universities}
          onClose={() => {
            setShowScholarshipForm(false);
            setEditingScholarship(null);
          }}
          onSuccess={() => {
            setShowScholarshipForm(false);
            setEditingScholarship(null);
            fetchData();
          }}
          getAuthToken={getAuthToken}
        />
      )}
    </div>
  );
}
