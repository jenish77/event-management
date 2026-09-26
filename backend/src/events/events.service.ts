import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsDto } from './dto/list-events.dto';
import { EventResponseDto, PaginatedEventsResponseDto } from './dto/event-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto): Promise<EventResponseDto> {
    const event = await this.prisma.event.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim(),
        eventDate: new Date(dto.eventDate),
        location: dto.location.trim(),
        capacity: dto.capacity,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { attendees: true },
        },
      },
    });

    return this.mapToEventResponse(event, userId);
  }

  async findAll(query: ListEventsDto, currentUserId?: string): Promise<PaginatedEventsResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (query.location) {
      where.location = { contains: query.location.trim(), mode: 'insensitive' };
    }

    if (query.createdBy) {
      where.createdBy = query.createdBy;
    }

    if (query.joinedBy) {
      where.attendees = {
        some: { userId: query.joinedBy },
      };
    }


    if (query.fromDate || query.toDate) {
      where.eventDate = {};
      if (query.fromDate) {
        where.eventDate.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.eventDate.lte = new Date(query.toDate);
      }
    }

    const orderBy: Prisma.EventOrderByWithRelationInput = {
      [query.sortBy || 'eventDate']: query.sortOrder || 'asc',
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: { attendees: true },
          },
          attendees: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: events.map((event) => this.mapToEventResponse(event, currentUserId)),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string, currentUserId?: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { attendees: true },
        },
        attendees: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    return this.mapToEventResponse(event, currentUserId);
  }

  async update(id: string, userId: string, dto: UpdateEventDto): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (event.createdBy !== userId) {
      throw new ForbiddenException('You do not have permission to update this event.');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() }),
        ...(dto.eventDate && { eventDate: new Date(dto.eventDate) }),
        ...(dto.location && { location: dto.location.trim() }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { attendees: true },
        },
      },
    });

    return this.mapToEventResponse(updatedEvent, userId);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (event.createdBy !== userId) {
      throw new ForbiddenException('You do not have permission to delete this event.');
    }

    await this.prisma.event.delete({ where: { id } });

    return { message: 'Event successfully deleted.' };
  }

  private mapToEventResponse(event: any, currentUserId?: string): EventResponseDto {
    const isAttending = currentUserId && Array.isArray(event.attendees)
      ? event.attendees.length > 0
      : undefined;

    return {
      id: event.id,
      title: event.title,
      description: event.description || undefined,
      eventDate: event.eventDate,
      location: event.location,
      capacity: event.capacity || undefined,
      creator: event.creator,
      attendeeCount: event._count?.attendees || 0,
      isAttending,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

  }
}
