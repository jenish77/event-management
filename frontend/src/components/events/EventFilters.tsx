'use client';

import { Search, MapPin, X, ArrowUp, ArrowDown } from 'lucide-react';

interface EventFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (val: 'asc' | 'desc') => void;
  onReset: () => void;
}

export function EventFilters({
  search,
  setSearch,
  location,
  setLocation,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onReset,
}: EventFiltersProps) {
  const hasFilters = Boolean(search || location);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Location Filter */}
        <div className="relative">
          <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by city or location..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="eventDate">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="createdAt">Sort by Creation Date</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition shrink-0 bg-white shadow-xs"
            title={sortOrder === 'asc' ? 'Switch to Newest First' : 'Switch to Oldest First'}
          >
            {sortOrder === 'desc' ? (
              <>
                <ArrowDown className="w-3.5 h-3.5 text-primary-500" />
                <span>Newest First</span>
              </>
            ) : (
              <>
                <ArrowUp className="w-3.5 h-3.5 text-primary-500" />
                <span>Oldest First</span>
              </>
            )}
          </button>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Search & Location</span>
          </button>
        </div>
      )}
    </div>
  );
}
