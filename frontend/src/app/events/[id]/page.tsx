'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { EventItem, PaginatedAttendeesResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import {
  Calendar,
  MapPin,
  Users,
  User as UserIcon,
  CheckCircle2,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const eventId = params.id as string;

  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userKey = user?.id || 'guest';

  // Fetch Event Details
  const {
    data: event,
    isLoading: isEventLoading,
    isError: isEventError,
  } = useQuery<EventItem>({
    queryKey: ['event', eventId, userKey],
    queryFn: async () => {
      const res = await apiClient.get(`/events/${eventId}`);
      return res.data;
    },
  });

  // Fetch Attendees List
  const { data: attendeesData } = useQuery<PaginatedAttendeesResponse>({
    queryKey: ['event-attendees', eventId],
    queryFn: async () => {
      const res = await apiClient.get(`/events/${eventId}/attendees?limit=50`);
      return res.data;
    },
    enabled: !!eventId,
  });

  // Join Event Mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/events/${eventId}/attendees`);
      return res.data;
    },
    onMutate: async () => {
      setActionError(null);
      await queryClient.cancelQueries({ queryKey: ['event', eventId, userKey] });
      const previousEvent = queryClient.getQueryData<EventItem>(['event', eventId, userKey]);

      if (previousEvent) {
        queryClient.setQueryData<EventItem>(['event', eventId, userKey], {
          ...previousEvent,
          isAttending: true,
          attendeeCount: previousEvent.attendeeCount + 1,
        });
      }

      return { previousEvent };
    },
    onError: (err: any, _newVal, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(['event', eventId, userKey], context.previousEvent);
      }
      const msg = err.response?.data?.error?.message || 'Failed to join event.';
      setActionError(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
    },
  });

  // Leave Event Mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete(`/events/${eventId}/attendees`);
      return res.data;
    },
    onMutate: async () => {
      setActionError(null);
      await queryClient.cancelQueries({ queryKey: ['event', eventId, userKey] });
      const previousEvent = queryClient.getQueryData<EventItem>(['event', eventId, userKey]);

      if (previousEvent) {
        queryClient.setQueryData<EventItem>(['event', eventId, userKey], {
          ...previousEvent,
          isAttending: false,
          attendeeCount: Math.max(0, previousEvent.attendeeCount - 1),
        });
      }

      return { previousEvent };
    },
    onError: (err: any, _newVal, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(['event', eventId, userKey], context.previousEvent);
      }
      const msg = err.response?.data?.error?.message || 'Failed to leave event.';
      setActionError(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
    },
  });

  // Confirm Delete Event
  const confirmDeleteEvent = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/events/${eventId}`);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['featured-events'] });
      queryClient.invalidateQueries({ queryKey: ['my-created-events'] });
      router.push('/events');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to delete event.';
      setActionError(msg);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isEventLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-24 bg-slate-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (isEventError || !event) {
    return (
      <div className="max-w-xl mx-auto text-center bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-sm text-slate-500">
          The event you are looking for does not exist or has been deleted.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const isOwner = user && event.creator.id === user.id;
  const isCapacityFull = event.capacity ? event.attendeeCount >= event.capacity : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </Link>

      {actionError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Event Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {event.title}
              </h1>
              {event.isAttending && (
                <span className="flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  You are Attending
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4 text-slate-400" />
                Hosted by <strong className="font-semibold text-slate-700">{event.creator.name}</strong>
              </span>
              <span>&bull;</span>
              <span>{event.creator.email}</span>
            </div>
          </div>

          {/* Action Buttons for Owner */}
          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/events/${event.id}/edit`}
                className="flex items-center gap-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Date, Location, & Attendance Meta Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Date & Time</p>
              <p className="font-semibold text-slate-800">{formatDate(event.eventDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Location</p>
              <p className="font-semibold text-slate-800 truncate">{event.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Capacity / Attendees</p>
              <p className="font-semibold text-slate-800">
                {event.attendeeCount} {event.capacity ? `/ ${event.capacity} seats` : 'attendees'}
              </p>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">About this event</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {event.description || 'No detailed description provided.'}
          </p>
        </div>

        {/* RSVP Join / Leave Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {!isAuthenticated ? (
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Log in to RSVP for this event:</span>
              <Link
                href="/login"
                className="font-semibold text-primary-600 hover:underline"
              >
                Sign In
              </Link>
            </div>
          ) : event.isAttending ? (
            <button
              onClick={() => leaveMutation.mutate()}
              disabled={leaveMutation.isPending}
              className="flex items-center justify-center min-w-[170px] gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs px-5 py-2.5 rounded-xl border border-red-200 transition disabled:opacity-50"
            >
              <UserMinus className="w-4 h-4" />
              <span>{leaveMutation.isPending ? 'Canceling...' : 'Cancel Attendance'}</span>
            </button>
          ) : (
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending || (isCapacityFull && !event.isAttending)}
              className="flex items-center justify-center min-w-[170px] gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {joinMutation.isPending
                  ? 'Registering...'
                  : isCapacityFull
                  ? 'Event Full'
                  : 'RSVP / Join Event'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Attendees List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-500" />
          <span>Registered Attendees ({event.attendeeCount})</span>
        </h3>

        {attendeesData?.data && attendeesData.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {attendeesData.data.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {item.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{item.user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{item.user.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-2">
            No attendees have registered yet. Be the first to join!
          </p>
        )}
      </div>

      {/* Custom Tailwind Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Delete Event?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>&quot;{event.title}&quot;</strong>? All registered attendees will be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteEvent}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
