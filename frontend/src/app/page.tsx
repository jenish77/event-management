'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { PaginatedEventsResponse } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { EventListSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/providers/AuthProvider';
import { Calendar, PlusCircle, ArrowRight, Zap } from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery<PaginatedEventsResponse>({
    queryKey: ['featured-events'],
    queryFn: async () => {
      const res = await apiClient.get('/events?limit=3&sortBy=eventDate&sortOrder=asc');
      return res.data;
    },
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center sm:text-left relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30">
            ✨ Discover events that matter
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Discover & Organize Extraordinary Events
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Find exciting events, connect with communities, and join experiences happening around you.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <Link
              href="/events"
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-primary-500/30"
            >
              <Calendar className="w-4 h-4" />
              <span>Explore All Events</span>
            </Link>

            {isAuthenticated ? (
              <Link
                href="/events/new"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-medium text-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Event</span>
              </Link>
            ) : (
              <Link
                href="/register"
                className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-xl font-semibold text-sm transition"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
            <p className="text-sm text-slate-500">Discover handpicked upcoming community events</p>
          </div>

          <Link
            href="/events"
            className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <EventListSkeleton />
        ) : data?.data && data.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((event) => (
              <EventCard key={event.id} event={event} currentUserId={user?.id} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800">No upcoming events yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Be the first to create and host an event for the community!
            </p>
            {isAuthenticated && (
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create First Event</span>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
