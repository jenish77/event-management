import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AttendeesService {
  constructor(private readonly prisma: PrismaService) {}

  async joinEvent(eventId: string, userId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Lock the Event row FOR UPDATE to prevent race conditions during high-concurrency requests
      const lockedEvents: any[] = await tx.$queryRaw`
        SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE
      `;

      if (!lockedEvents || lockedEvents.length === 0) {
        throw new NotFoundException('Event not found.');
      }

      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          _count: { select: { attendees: true } },
        },
      });

      if (!event) {
        throw new NotFoundException('Event not found.');
      }

      if (event.capacity && event._count.attendees >= event.capacity) {
        throw new ConflictException('Event has reached maximum capacity.');
      }

      const existingAttendee = await tx.eventAttendee.findUnique({
        where: {
          eventId_userId: { eventId, userId },
        },
      });

      if (existingAttendee) {
        throw new ConflictException('You are already registered for this event.');
      }

      try {
        const attendee = await tx.eventAttendee.create({
          data: {
            eventId,
            userId,
          },
        });

        return {
          message: 'Successfully registered for event.',
          attendeeId: attendee.id,
          eventId: attendee.eventId,
        };
      } catch (error: any) {
        if (error?.code === 'P2002') {
          throw new ConflictException('You are already registered for this event.');
        }
        throw error;
      }
    });
  }

  async leaveEvent(eventId: string, userId: string) {
    const attendee = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (!attendee) {
      throw new NotFoundException('You are not registered for this event.');
    }

    await this.prisma.eventAttendee.delete({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    return { message: 'Successfully canceled event registration.' };
  }

  async getEventAttendees(eventId: string, page: number = 1, limit: number = 20) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    const skip = (page - 1) * limit;

    const [attendees, total] = await Promise.all([
      this.prisma.eventAttendee.findMany({
        where: { eventId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.eventAttendee.count({ where: { eventId } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: attendees.map((a) => ({
        id: a.id,
        user: a.user,
        joinedAt: a.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
