'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { EventItem } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { Edit, ArrowLeft, AlertCircle } from 'lucide-react';

const editEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event title is required')
    .max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  eventDate: z
    .string()
    .min(1, 'Event date and time is required')
    .refine(
      (val) => {
        if (!val) return false;
        const selected = new Date(val).getTime();
        return selected >= Date.now() - 60000;
      },
      { message: 'Event date and time cannot be in the past' },
    ),
  location: z
    .string()
    .min(1, 'Event location is required')
    .max(250, 'Location cannot exceed 250 characters'),
  capacity: z
    .preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().min(1, 'Capacity must be at least 1').optional(),
    ),
});

type EditEventFormValues = z.infer<typeof editEventSchema>;

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const eventId = params.id as string;

  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: event, isLoading: isEventLoading } = useQuery<EventItem>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await apiClient.get(`/events/${eventId}`);
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventSchema),
  });

  useEffect(() => {
    if (event) {
      // Format ISO string to datetime-local format YYYY-MM-DDTHH:mm
      let formattedDate = '';
      try {
        const d = new Date(event.eventDate);
        formattedDate = d.toISOString().slice(0, 16);
      } catch {
        formattedDate = '';
      }

      reset({
        title: event.title,
        description: event.description || '',
        eventDate: formattedDate,
        location: event.location,
        capacity: event.capacity,
      });
    }
  }, [event, reset]);

  const onSubmit = async (values: EditEventFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        eventDate: new Date(values.eventDate).toISOString(),
      };
      await apiClient.patch(`/events/${eventId}`, payload);
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push(`/events/${eventId}`);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update event.';
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEventLoading) {
    return <div className="text-center py-12 text-sm text-slate-500">Loading event data...</div>;
  }

  if (event && user && event.creator.id !== user.id) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white p-8 rounded-2xl border border-red-200 space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Permission Denied</h2>
        <p className="text-xs text-slate-500">You are not authorized to edit this event.</p>
        <Link href={`/events/${eventId}`} className="text-xs font-semibold text-primary-600 hover:underline">
          Back to Event
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/events/${eventId}`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Event Details</span>
      </Link>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
            <Edit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
            <p className="text-xs text-slate-500">Update event details and capacity</p>
          </div>
        </div>

        {serverError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={4}
              {...register('description')}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                min={minDateTime}
                {...register('eventDate')}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              {errors.eventDate && (
                <p className="text-xs text-red-500 mt-1">{errors.eventDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Optional)</label>
              <input
                type="number"
                min={1}
                {...register('capacity')}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              {errors.capacity && (
                <p className="text-xs text-red-500 mt-1">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
            <input
              type="text"
              {...register('location')}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {errors.location && (
              <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              href={`/events/${eventId}`}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg text-xs transition shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
