import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Award, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { API_URL, getAuthHeaders } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  thumbnailUrl?: string;
  galleryImages?: string[];
  description?: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  address?: string;
  
  // Fees
  tuitionFeesUG?: string;
  tuitionFeesPG?: string;
  applicationFee?: string;
  
  // Intakes
  intakes?: string[];
  
  // Entry Requirements
  academicRequirementsUG?: string;
  academicRequirementsPG?: string;
  
  // English Requirements
  ieltsRequired?: boolean;
  ieltsScore?: string;
  pteRequired?: boolean;
  pteScore?: string;
  
  // Campus
  campusSize?: string;
  facilities?: string[];
  
  // Contact
  email?: string;
  phone?: string;
  website?: string;
}

interface Scholarship {
  id: string;
  name: string;
  amount: string;
  eligibility: string;
  deadline?: string;
  description?: string;
}

export function UniversityDetails() {
  const { id } = useParams();
  const [university, setUniversity] = useState<University | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUniversityDetails();
    }
  }, [id]);

  const fetchUniversityDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/universities/${id}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (data.university) {
        setUniversity(data.university);
        setScholarships(data.scholarships || []);
      }
    } catch (error) {
      console.error('Error fetching university details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading university details...</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">University Not Found</h2>
          <Link to="/universities" className="text-blue-600 hover:text-blue-700">
            ← Back to Universities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/universities" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Universities
          </Link>
        </div>

        <div className="relative h-96 bg-gray-900">
          <img
            src={university.thumbnailUrl || 'https://images.unsplash.com/photo-1687361242200-c5122b63fe70?w=1200'}
            alt={university.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {university.name}
              </h1>
              <div className="flex items-center text-white text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                {university.city}, {university.country}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            {university.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed">{university.description}</p>
              </div>
            )}

            {/* Tuition Fees */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                Tuition Fees
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {university.tuitionFeesUG && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Undergraduate</div>
                    <div className="text-2xl font-bold text-blue-600">{university.tuitionFeesUG}</div>
                  </div>
                )}
                {university.tuitionFeesPG && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Postgraduate</div>
                    <div className="text-2xl font-bold text-purple-600">{university.tuitionFeesPG}</div>
                  </div>
                )}
                {university.applicationFee && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Application Fee</div>
                    <div className="text-xl font-bold text-gray-900">{university.applicationFee}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Intakes */}
            {university.intakes && university.intakes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-orange-600" />
                  Available Intakes
                </h2>
                <div className="flex flex-wrap gap-3">
                  {university.intakes.map((intake) => (
                    <div key={intake} className="px-6 py-3 bg-orange-100 text-orange-700 rounded-lg font-semibold">
                      {intake}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entry Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                Entry Requirements
              </h2>
              
              {university.academicRequirementsUG && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Undergraduate</h3>
                  <p className="text-gray-700">{university.academicRequirementsUG}</p>
                </div>
              )}
              
              {university.academicRequirementsPG && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Postgraduate</h3>
                  <p className="text-gray-700">{university.academicRequirementsPG}</p>
                </div>
              )}
            </div>

            {/* English Test Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-6 h-6 mr-2 text-purple-600" />
                English Test Requirements
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  {university.ieltsRequired ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">IELTS</div>
                    {university.ieltsRequired ? (
                      <div className="text-gray-700">
                        Required - Minimum score: {university.ieltsScore || 'Contact university'}
                      </div>
                    ) : (
                      <div className="text-green-700 font-semibold">Waived for eligible students</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  {university.pteRequired ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">PTE</div>
                    {university.pteRequired ? (
                      <div className="text-gray-700">
                        Required - Minimum score: {university.pteScore || 'Contact university'}
                      </div>
                    ) : (
                      <div className="text-green-700 font-semibold">Waived for eligible students</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Scholarships */}
            {scholarships.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="w-6 h-6 mr-2 text-yellow-600" />
                  Scholarships
                </h2>
                <div className="space-y-4">
                  {scholarships.map((scholarship) => (
                    <div key={scholarship.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{scholarship.name}</h3>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                          {scholarship.amount}
                        </span>
                      </div>
                      {scholarship.description && (
                        <p className="text-gray-700 mb-2">{scholarship.description}</p>
                      )}
                      <div className="text-sm text-gray-600">
                        <strong>Eligibility:</strong> {scholarship.eligibility}
                      </div>
                      {scholarship.deadline && (
                        <div className="text-sm text-gray-600 mt-1">
                          <strong>Deadline:</strong> {scholarship.deadline}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campus Information */}
            {(university.campusSize || university.facilities) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-6 h-6 mr-2 text-indigo-600" />
                  Campus Information
                </h2>
                
                {university.campusSize && (
                  <div className="mb-4">
                    <span className="font-semibold text-gray-900">Campus Size:</span>
                    <span className="text-gray-700 ml-2">{university.campusSize}</span>
                  </div>
                )}
                
                {university.facilities && university.facilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Facilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {university.facilities.map((facility, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Map */}
            {university.latitude && university.longitude && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-red-600" />
                  Location
                </h2>
                {university.address && (
                  <p className="text-gray-700 mb-4">{university.address}</p>
                )}
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapContainer
                    center={[university.latitude, university.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[university.latitude, university.longitude]}>
                      <Popup>{university.name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h3>
              
              <div className="space-y-4">
                {university.email && (
                  <a href={`mailto:${university.email}`} className="flex items-start gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{university.email}</div>
                    </div>
                  </a>
                )}
                
                {university.phone && (
                  <a href={`tel:${university.phone}`} className="flex items-start gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{university.phone}</div>
                    </div>
                  </a>
                )}
                
                {university.website && (
                  <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <Globe className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500">Website</div>
                      <div className="font-medium break-all">{university.website}</div>
                    </div>
                  </a>
                )}
              </div>

              <button className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Contact University
              </button>
              
              <button className="w-full mt-2 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors">
                Save to Favorites
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

