import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../lib/supabase';

interface Scholarship {
  id: string;
  universityId: string;
  name: string;
  amount: string;
  eligibility: string;
  deadline?: string;
  description?: string;
}

interface University {
  id: string;
  name: string;
}

interface Props {
  scholarship: Scholarship | null;
  universities: University[];
  onClose: () => void;
  onSuccess: () => void;
  getAuthToken: () => string;
}

export function ScholarshipForm({ scholarship, universities, onClose, onSuccess, getAuthToken }: Props) {
  const [formData, setFormData] = useState({
    universityId: scholarship?.universityId || '',
    name: scholarship?.name || '',
    amount: scholarship?.amount || '',
    eligibility: scholarship?.eligibility || '',
    deadline: scholarship?.deadline || '',
    description: scholarship?.description || '',
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.universityId) {
      toast.error('Please select a university');
      return;
    }

    setSaving(true);

    try {
      const url = scholarship
        ? `${API_URL}/scholarships/${scholarship.id}`
        : `${API_URL}/scholarships`;
      
      const method = scholarship ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Scholarship ${scholarship ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to save scholarship');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {scholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              University *
            </label>
            <select
              value={formData.universityId}
              onChange={(e) => handleInputChange('universityId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a university</option>
              {universities.map(uni => (
                <option key={uni.id} value={uni.id}>{uni.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scholarship Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., International Excellence Scholarship"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., £5,000 or 50% tuition waiver"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eligibility *
            </label>
            <textarea
              value={formData.eligibility}
              onChange={(e) => handleInputChange('eligibility', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Minimum GPA 3.5, International students only"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="text"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 31st May 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details about the scholarship..."
            />
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
            {saving ? 'Saving...' : (scholarship ? 'Update Scholarship' : 'Create Scholarship')}
          </button>
        </div>
      </div>
    </div>
  );
}
