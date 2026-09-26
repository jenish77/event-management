import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendeesService } from './attendees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Attendees')
@Controller('events/:eventId/attendees')
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register to attend an event' })
  @ApiResponse({ status: 201, description: 'Successfully registered for event' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 409, description: 'Already registered or event full' })
  async joinEvent(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.attendeesService.joinEvent(eventId, userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel attendance registration for an event' })
  @ApiResponse({ status: 200, description: 'Registration canceled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attendee registration not found' })
  async leaveEvent(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.attendeesService.leaveEvent(eventId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List attendees for an event' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Paginated list of attendees' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getAttendees(
    @Param('eventId') eventId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.attendeesService.getEventAttendees(eventId, page, limit);
  }
}
