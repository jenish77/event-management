import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { PrismaService } from '../database/prisma.service';

describe('AttendeesService', () => {
  let service: AttendeesService;
  let prisma: any;

  const mockEvent = {
    id: 'event-uuid-1',
    title: 'Node.js Meetup',
    capacity: 10,
    _count: { attendees: 2 },
  };

  const mockAttendee = {
    id: 'attendee-uuid-1',
    eventId: 'event-uuid-1',
    userId: 'user-uuid-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      event: {
        findUnique: jest.fn(),
      },
      eventAttendee: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendeesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AttendeesService>(AttendeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('joinEvent', () => {
    it('should register user as event attendee', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.eventAttendee.findUnique.mockResolvedValue(null);
      prisma.eventAttendee.create.mockResolvedValue(mockAttendee);

      const result = await service.joinEvent('event-uuid-1', 'user-uuid-1');
      expect(result.message).toContain('registered');
      expect(prisma.eventAttendee.create).toHaveBeenCalledWith({
        data: { eventId: 'event-uuid-1', userId: 'user-uuid-1' },
      });
    });

    it('should throw ConflictException if user is already registered', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.eventAttendee.findUnique.mockResolvedValue(mockAttendee);

      await expect(service.joinEvent('event-uuid-1', 'user-uuid-1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if capacity limit is reached', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        capacity: 2,
        _count: { attendees: 2 },
      });

      await expect(service.joinEvent('event-uuid-1', 'user-uuid-2')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.joinEvent('missing-id', 'user-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('leaveEvent', () => {
    it('should cancel attendee registration', async () => {
      prisma.eventAttendee.findUnique.mockResolvedValue(mockAttendee);
      prisma.eventAttendee.delete.mockResolvedValue(mockAttendee);

      const result = await service.leaveEvent('event-uuid-1', 'user-uuid-1');
      expect(result.message).toContain('canceled');
      expect(prisma.eventAttendee.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user was not registered', async () => {
      prisma.eventAttendee.findUnique.mockResolvedValue(null);

      await expect(service.leaveEvent('event-uuid-1', 'user-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });
});
