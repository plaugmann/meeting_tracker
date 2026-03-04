'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Customer {
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
  customers: Customer[];
}

interface UserInfo {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  target: number;
}

export default function AdminUserMeetingsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [meetingsRes, userRes] = await Promise.all([
        fetch(`/api/meetings?userId=${userId}`),
        fetch(`/api/admin/users/${userId}`),
      ]);

      if (meetingsRes.status === 403) {
        alert('Access denied. Admin privileges required.');
        router.push('/');
        return;
      }

      if (meetingsRes.ok) {
        const data = await meetingsRes.json();
        setMeetings(data);
      }

      if (userRes.ok) {
        const data = await userRes.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">User Meetings</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                All Users
              </button>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Header */}
        {userInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center gap-4">
            {userInfo.image && (
              <img
                src={userInfo.image}
                alt={userInfo.name || 'User'}
                className="w-16 h-16 rounded-full object-cover grayscale-image"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{userInfo.name || 'No name'}</h2>
              <p className="text-gray-500">{userInfo.email}</p>
              <div className="flex gap-4 mt-1 text-sm text-gray-600">
                <span>Role: {userInfo.role}</span>
                <span>Target: {userInfo.target}/month</span>
                <span>Total meetings: {meetings.length}</span>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No meetings recorded for this user</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-lg shadow p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">{formatDate(meeting.date)}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium text-gray-700">Customers: </span>
                    {meeting.customers.map((c) => c.customer.name).join(', ')}
                  </p>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Participants: </span>
                    <span className="text-sm text-gray-600">{meeting.externalParticipants}</span>
                  </div>
                  {meeting.description && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Notes: </span>
                      <span className="text-sm text-gray-600">{meeting.description}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
