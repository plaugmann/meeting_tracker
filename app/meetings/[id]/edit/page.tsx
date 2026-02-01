'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CustomerSearchSelect from '@/components/customer-search-select';

interface MeetingCustomer {
  customer: {
    id: string;
    name: string;
  };
}

interface Meeting {
  id: string;
  date: string;
  description: string;
  externalParticipants: string;
  customers: MeetingCustomer[];
}

export default function EditMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    customerIds: [] as string[],
    externalParticipants: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [meetingId]);

  const fetchData = async () => {
    try {
      const meetingRes = await fetch(`/api/meetings/${meetingId}`);

      if (meetingRes.ok) {
        const meetingData = await meetingRes.json();

        setMeeting(meetingData);

        setFormData({
          date: new Date(meetingData.date).toISOString().split('T')[0],
          customerIds: meetingData.customers.map((c: MeetingCustomer) => c.customer.id),
          externalParticipants: meetingData.externalParticipants,
          description: meetingData.description || '',
        });
      } else {
        alert('Failed to load meeting');
        router.push('/meetings');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Error loading meeting');
      router.push('/meetings');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCustomersChange = (customerIds: string[]) => {
    setFormData({ ...formData, customerIds });
    if (errors.customerIds) {
      setErrors((prev) => ({ ...prev, customerIds: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.customerIds.length === 0) {
      newErrors.customerIds = 'Select at least one customer';
    }

    if (!formData.externalParticipants.trim()) {
      newErrors.externalParticipants = 'Enter at least one participant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/meetings');
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to update meeting' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Edit Meeting</h1>
            <button
              onClick={() => router.push('/meetings')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Date Field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Date *
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* Customers Field */}
          <CustomerSearchSelect
            selectedCustomers={formData.customerIds}
            onCustomersChange={handleCustomersChange}
            error={errors.customerIds}
          />

          {/* External Participants Field */}
          <div>
            <label
              htmlFor="externalParticipants"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              External Participants *
            </label>
            <input
              type="text"
              id="externalParticipants"
              value={formData.externalParticipants}
              onChange={(e) =>
                setFormData({ ...formData, externalParticipants: e.target.value })
              }
              className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
                errors.externalParticipants ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.externalParticipants && (
              <p className="mt-1 text-sm text-red-600">{errors.externalParticipants}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description / Notes
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? 'Updating...' : 'Update Meeting'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/meetings')}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
