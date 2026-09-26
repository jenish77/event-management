'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { PaginatedEventsResponse } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { EventListSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/providers/AuthProvider';
import { PlusCircle, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function EventsPage() {
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('eventDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const limit = 9;

  const { data, isLoading, isError, refetch } = useQuery<PaginatedEventsResponse>({
    queryKey: ['events', page, search, location, sortBy, sortOrder, user?.id || 'guest'],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (location) params.append('location', location);

      const res = await apiClient.get(`/events?${params.toString()}`);
      return res.data;
    },
  });

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setSortBy('eventDate');
    setSortOrder('asc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Events</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and RSVP to community meetups, workshops, and tech gatherings
          </p>
        </div>

        {isAuthenticated && (
          <Link
            href="/events/new"
            className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition shadow-sm self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        )}
      </div>

      {/* Filter Component */}
      <EventFilters
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        location={location}
        setLocation={(val) => {
          setLocation(val);
          setPage(1);
        }}
        sortBy={sortBy}
        setSortBy={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        sortOrder={sortOrder}
        setSortOrder={(val) => {
          setSortOrder(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Grid Content */}
      {isLoading ? (
        <EventListSkeleton />
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-red-600">Failed to load events.</p>
          <button
            onClick={() => refetch()}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-semibold px-4 py-2 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((event) => (
              <EventCard key={event.id} event={event} currentUserId={user?.id} />
            ))}
          </div>

          {/* Pagination Controls */}
          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Page <strong className="font-semibold text-slate-800">{data.meta.page}</strong> of{' '}
                <strong className="font-semibold text-slate-800">{data.meta.totalPages}</strong> (
                {data.meta.total} total events)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-lg text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn&apos;t find any events matching your search or filters. Try adjusting your criteria.
          </p>
          {(search || location) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-primary-600 hover:underline pt-2 inline-block"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
