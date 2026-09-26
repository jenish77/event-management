'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { PaginatedEventsResponse } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { EventListSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/providers/AuthProvider';
import { LayoutDashboard, PlusCircle, Calendar, CheckCircle2, User } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created');

  // Query Created Events
  const { data: createdEvents, isLoading: isCreatedLoading } = useQuery<PaginatedEventsResponse>({
    queryKey: ['my-created-events', user?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/events?createdBy=${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id && activeTab === 'created',
  });

  // Query Joined Events
  const { data: joinedEvents, isLoading: isJoinedLoading } = useQuery<PaginatedEventsResponse>({
    queryKey: ['my-joined-events', user?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/events?joinedBy=${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id && activeTab === 'joined',
  });

  if (isAuthLoading) {
    return <div className="text-center py-12 text-sm text-slate-500">Loading user profile...</div>;
  }

  if (!isAuthenticated || !user) {
    router.push('/login');
    return null;
  }

  const isLoading = activeTab === 'created' ? isCreatedLoading : isJoinedLoading;
  const eventsList = activeTab === 'created' ? createdEvents?.data : joinedEvents?.data;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 font-extrabold text-xl flex items-center justify-center shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500">{user.email} &bull; {user.role}</p>
          </div>
        </div>

        <Link
          href="/events/new"
          className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Tabs Control */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('created')}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition ${
              activeTab === 'created'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Created Events ({createdEvents?.meta.total ?? 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('joined')}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition ${
              activeTab === 'joined'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>My Joined RSVPs ({joinedEvents?.meta.total ?? 0})</span>
          </button>
        </div>

        {/* Tab Content Grid */}
        {isLoading ? (
          <EventListSkeleton />
        ) : eventsList && eventsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsList.map((event) => (
              <EventCard key={event.id} event={event} currentUserId={user.id} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800">
              {activeTab === 'created' ? 'No events created yet' : 'No joined events yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'created'
                ? 'Start hosting community events by clicking Create New Event.'
                : 'Browse the events feed and RSVP to events you want to attend!'}
            </p>
            {activeTab === 'created' ? (
              <Link
                href="/events/new"
                className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            ) : (
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
              >
                <span>Explore Events</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
