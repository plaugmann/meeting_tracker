import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navbar';

export default async function Home() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Get date ranges
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get leaderboard data
  const getMeetingCounts = async (startDate: Date) => {
    const meetings = await prisma.meeting.findMany({
      where: { date: { gte: startDate } },
      select: {
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const userCounts = meetings.reduce((acc, meeting) => {
      const userId = meeting.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          name: meeting.user.name || meeting.user.email,
          email: meeting.user.email,
          image: meeting.user.image,
          count: 0,
        };
      }
      acc[userId].count++;
      return acc;
    }, {} as Record<string, { userId: string; name: string; email: string; image: string | null; count: number }>);

    return Object.values(userCounts).sort((a, b) => b.count - a.count).slice(0, 3);
  };

  // Fetch meeting stats and leaderboard
  const [weekCount, monthCount, recentMeetings, weekLeaderboard, monthLeaderboard] = await Promise.all([
    prisma.meeting.count({
      where: {
        userId: session.user.id,
        date: { gte: startOfWeek },
      },
    }),
    prisma.meeting.count({
      where: {
        userId: session.user.id,
        date: { gte: startOfMonth },
      },
    }),
    prisma.meeting.findMany({
      where: { userId: session.user.id },
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        customers: {
          include: {
            customer: {
              select: { name: true },
            },
          },
        },
      },
    }),
    getMeetingCounts(startOfWeek),
    getMeetingCounts(startOfMonth),
  ]);

  const target = session.user.target || 8;
  const progressPercent = Math.min((monthCount / target) * 100, 100);

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar
        userName={session.user?.name}
        userEmail={session.user?.email}
        userImage={session.user?.image}
        userRole={session.user?.role}
        showAdminLinks={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with New Meeting Button */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {session.user?.name || session.user?.email}!
            </h2>
            <p className="text-gray-600">Track your customer meetings and engagement.</p>
          </div>
          <a
            href="/meetings/new"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Meeting
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">This Week</h3>
            <p className="text-3xl font-bold mt-2">{weekCount}</p>
            <p className="text-xs text-gray-500 mt-1">meetings</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">This Month</h3>
            <p className="text-3xl font-bold mt-2">{monthCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              of {target} target
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Progress</h3>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(progressPercent)}% of monthly target
            </p>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* This Week Leaderboard */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Top Performers - This Week
            </h3>
            <div className="space-y-4">
              {weekLeaderboard.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No meetings this week yet</p>
              ) : (
                weekLeaderboard.map((user, index) => (
                  <div key={user.userId} className="flex items-center gap-4">
                    <div className={`flex-shrink-0 text-2xl font-bold ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      'text-amber-700'
                    }`}>
                      {index + 1}
                    </div>
                    <img
                      src={user.image || '/photos/default.jpg'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover grayscale-image"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {user.count} {user.count === 1 ? 'meeting' : 'meetings'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* This Month Leaderboard */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Top Performers - This Month
            </h3>
            <div className="space-y-4">
              {monthLeaderboard.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No meetings this month yet</p>
              ) : (
                monthLeaderboard.map((user, index) => (
                  <div key={user.userId} className="flex items-center gap-4">
                    <div className={`flex-shrink-0 text-2xl font-bold ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      'text-amber-700'
                    }`}>
                      {index + 1}
                    </div>
                    <img
                      src={user.image || '/photos/default.jpg'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover grayscale-image"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {user.count} {user.count === 1 ? 'meeting' : 'meetings'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Meetings</h3>
            <a href="/meetings" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </a>
          </div>
          <div className="divide-y divide-gray-200">
            {recentMeetings.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No meetings yet. Click "New Meeting" to get started.</p>
              </div>
            ) : (
              recentMeetings.map((meeting) => (
                <div key={meeting.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {formatDate(new Date(meeting.date))}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {meeting.customers.map((c) => c.customer.name).join(', ')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {meeting.externalParticipants}
                      </p>
                    </div>
                    <a
                      href={`/meetings/${meeting.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-700 ml-4"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
