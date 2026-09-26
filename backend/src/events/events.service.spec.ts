import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../database/prisma.service';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: any;

  const mockCreator = { id: 'user-1', name: 'Jenish', email: 'jenish@example.com' };
  const mockEvent = {
    id: 'event-uuid-1',
    title: 'Node.js Meetup',
    description: 'Backend meetup',
    eventDate: new Date('2026-10-15T18:30:00.000Z'),
    location: 'Surat',
    capacity: 50,
    createdBy: 'user-1',
    creator: mockCreator,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { attendees: 5 },
    attendees: [],
  };

  beforeEach(async () => {
    prisma = {
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event associated with current user', async () => {
      prisma.event.create.mockResolvedValue(mockEvent);

      const dto = {
        title: 'Node.js Meetup',
        description: 'Backend meetup',
        eventDate: '2026-10-15T18:30:00.000Z',
        location: 'Surat',
        capacity: 50,
      };

      const result = await service.create('user-1', dto);
      expect(result.id).toBe('event-uuid-1');
      expect(result.creator.id).toBe('user-1');

    });
  });

  describe('update', () => {
    it('should update event if requesting user is the creator', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({ ...mockEvent, title: 'Updated Title' });

      const result = await service.update('event-uuid-1', 'user-1', { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.update('event-uuid-1', 'other-user-2', { title: 'Updated Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', 'user-1', { title: 'Updated Title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete event if user is the creator', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove('event-uuid-1', 'user-1');
      expect(result.message).toContain('deleted');
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 'event-uuid-1' } });
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(service.remove('event-uuid-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });
});
