import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsDto } from './dto/list-events.dto';
import { EventResponseDto, PaginatedEventsResponseDto } from './dto/event-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully', type: EventResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.create(userId, createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'List events with filtering, search, sorting, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of events', type: PaginatedEventsResponseDto })
  async findAll(
    @Query() query: ListEventsDto,
    @Req() req: Request,
  ): Promise<PaginatedEventsResponseDto> {
    const currentUserId = this.extractUserIdFromToken(req);
    return this.eventsService.findAll(query, currentUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific event' })
  @ApiResponse({ status: 200, description: 'Event details', type: EventResponseDto })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<EventResponseDto> {
    const currentUserId = this.extractUserIdFromToken(req);
    return this.eventsService.findOne(id, currentUserId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event (Creator only)' })
  @ApiResponse({ status: 200, description: 'Event updated successfully', type: EventResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not the owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.update(id, userId, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an event (Creator only)' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not the owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.eventsService.remove(id, userId);
  }

  private extractUserIdFromToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.decode(token) as { sub?: string };
      return payload?.sub;
    } catch {
      return undefined;
    }
  }
}
