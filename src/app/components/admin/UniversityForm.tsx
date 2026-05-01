import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../lib/supabase';

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  thumbnailUrl?: string;
  galleryImages?: string[];
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  tuitionFeesUG?: string;
  tuitionFeesPG?: string;
  applicationFee?: string;
  intakes?: string[];
  academicRequirementsUG?: string;
  academicRequirementsPG?: string;
  ieltsRequired?: boolean;
  ieltsScore?: string;
  pteRequired?: boolean;
  pteScore?: string;
  campusSize?: string;
  facilities?: string[];
  email?: string;
  phone?: string;
  website?: string;
  featured?: boolean;
}

interface Props {
  university: University | null;
  onClose: () => void;
  onSuccess: () => void;
  getAuthToken: () => string;
}

export function UniversityForm({ university, onClose, onSuccess, getAuthToken }: Props) {
  const [formData, setFormData] = useState<Partial<University>>({
    name: '',
    city: '',
    country: 'United Kingdom',
    description: '',
    latitude: 51.5074,
    longitude: -0.1278,
    address: '',
    tuitionFeesUG: '',
    tuitionFeesPG: '',
    applicationFee: '',
    intakes: [],
    academicRequirementsUG: '',
    academicRequirementsPG: '',
    ieltsRequired: true,
    ieltsScore: '',
    pteRequired: true,
    pteScore: '',
    campusSize: '',
    facilities: [],
    email: '',
    phone: '',
    website: '',
    featured: false,
    ...university,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newIntake, setNewIntake] = useState('');
  const [newFacility, setNewFacility] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formDataObj,
      });

      const data = await response.json();
      if (data.url) {
        handleInputChange('thumbnailUrl', data.url);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const addIntake = () => {
    if (newIntake && !formData.intakes?.includes(newIntake)) {
      handleInputChange('intakes', [...(formData.intakes || []), newIntake]);
      setNewIntake('');
    }
  };

  const removeIntake = (intake: string) => {
    handleInputChange('intakes', formData.intakes?.filter(i => i !== intake));
  };

  const addFacility = () => {
    if (newFacility && !formData.facilities?.includes(newFacility)) {
      handleInputChange('facilities', [...(formData.facilities || []), newFacility]);
      setNewFacility('');
    }
  };

  const removeFacility = (facility: string) => {
    handleInputChange('facilities', formData.facilities?.filter(f => f !== facility));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Admin token missing. Please log in again.');
        return;
      }

      const url = university
        ? `${API_URL}/universities/${university.id}`
        : `${API_URL}/universities`;
      
      const method = university ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`University ${university ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        const message = data?.error || data?.message || `Failed to save university (${response.status})`;
        toast.error(message);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {university ? 'Edit University' : 'Add New University'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image
                </label>
                <div className="flex items-center gap-4">
                  {formData.thumbnailUrl && (
                    <img
                      src={formData.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured University</span>
                </label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tuition Fees */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tuition Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Undergraduate
                </label>
                <input
                  type="text"
                  value={formData.tuitionFeesUG}
                  onChange={(e) => handleInputChange('tuitionFeesUG', e.target.value)}
                  placeholder="£15,000/year"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postgraduate
                </label>
                <input
                  type="text"
                  value={formData.tuitionFeesPG}
                  onChange={(e) => handleInputChange('tuitionFeesPG', e.target.value)}
                  placeholder="£18,000/year"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Fee
                </label>
                <input
                  type="text"
                  value={formData.applicationFee}
                  onChange={(e) => handleInputChange('applicationFee', e.target.value)}
                  placeholder="£50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Intakes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Intakes</h3>
            <div className="flex gap-2 mb-2">
              <select
                value={newIntake}
                onChange={(e) => setNewIntake(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select intake</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="May">May</option>
                <option value="September">September</option>
                <option value="October">October</option>
              </select>
              <button
                type="button"
                onClick={addIntake}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.intakes?.map(intake => (
                <div key={intake} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
                  {intake}
                  <button
                    type="button"
                    onClick={() => removeIntake(intake)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Entry Requirements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Entry Requirements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Undergraduate Requirements
                </label>
                <textarea
                  value={formData.academicRequirementsUG}
                  onChange={(e) => handleInputChange('academicRequirementsUG', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postgraduate Requirements
                </label>
                <textarea
                  value={formData.academicRequirementsPG}
                  onChange={(e) => handleInputChange('academicRequirementsPG', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* English Tests */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">English Test Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ieltsRequired}
                    onChange={(e) => handleInputChange('ieltsRequired', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">IELTS Required</span>
                </label>
                {formData.ieltsRequired && (
                  <input
                    type="text"
                    value={formData.ieltsScore}
                    onChange={(e) => handleInputChange('ieltsScore', e.target.value)}
                    placeholder="e.g., 6.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pteRequired}
                    onChange={(e) => handleInputChange('pteRequired', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">PTE Required</span>
                </label>
                {formData.pteRequired && (
                  <input
                    type="text"
                    value={formData.pteScore}
                    onChange={(e) => handleInputChange('pteScore', e.target.value)}
                    placeholder="e.g., 58"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Campus */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campus Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campus Size
                </label>
                <input
                  type="text"
                  value={formData.campusSize}
                  onChange={(e) => handleInputChange('campusSize', e.target.value)}
                  placeholder="e.g., 250 acres"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facilities
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    placeholder="Add facility"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addFacility}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.facilities?.map(facility => (
                    <div key={facility} className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                      {facility}
                      <button
                        type="button"
                        onClick={() => removeFacility(facility)}
                        className="hover:text-green-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : (university ? 'Update University' : 'Create University')}
          </button>
        </div>
      </div>
    </div>
  );
}
