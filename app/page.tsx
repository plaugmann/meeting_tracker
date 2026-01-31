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

  // Fetch meeting stats
  const [weekCount, monthCount, recentMeetings] = await Promise.all([
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {session.user?.name || session.user?.email}!
          </h2>
          <p className="text-gray-600">Track your customer meetings and engagement.</p>
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

        <div className="mb-6">
          <a
            href="/meetings/new"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + New Meeting
          </a>
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
