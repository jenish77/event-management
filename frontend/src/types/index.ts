export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface CreatorSummary {
  id: string;
  name: string;
  email: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  location: string;
  capacity?: number;
  creator: CreatorSummary;
  attendeeCount: number;
  isAttending?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEventsResponse {
  data: EventItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface EventAttendeeItem {
  id: string;
  user: CreatorSummary;
  joinedAt: string;
}

export interface PaginatedAttendeesResponse {
  data: EventAttendeeItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
