'use client';

import Link from 'next/link';
import { EventItem } from '@/types';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, Users, User as UserIcon, CheckCircle2 } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  currentUserId?: string;
}

export function EventCard({ event, currentUserId }: EventCardProps) {
  const isOwner = currentUserId && event.creator.id === currentUserId;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1 hover:text-primary-600 transition">
            <Link href={`/events/${event.id}`}>{event.title}</Link>
          </h3>
          {event.isAttending && (
            <span className="flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Attending
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">{event.description}</p>
        )}

        <div className="space-y-2 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{formatDate(event.eventDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Organized by <strong className="font-medium text-slate-700">{event.creator.name}</strong></span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Users className="w-4 h-4 text-slate-500" />
          <span>
            {event.attendeeCount} {event.capacity ? `/ ${event.capacity}` : ''} attending
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              Owner
            </span>
          )}
          <Link
            href={`/events/${event.id}`}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
