import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Node.js Meetup', description: 'Event title' })
  @IsNotEmpty({ message: 'Event title is required.' })
  @IsString({ message: 'Event title must be a string.' })
  @MaxLength(150, { message: 'Event title cannot exceed 150 characters.' })
  title!: string;

  @ApiPropertyOptional({ example: 'Deep dive into backend architecture', description: 'Detailed event description' })
  @IsOptional()
  @IsString({ message: 'Event description must be a string.' })
  @MaxLength(2000, { message: 'Event description cannot exceed 2000 characters.' })
  description?: string;

  @ApiProperty({ example: '2026-10-15T18:30:00.000Z', description: 'Event date and time (ISO format)' })
  @IsNotEmpty({ message: 'Event date is required.' })
  @IsDateString({}, { message: 'Please provide a valid ISO date timestamp for eventDate.' })
  eventDate!: string;

  @ApiProperty({ example: 'Surat, Gujarat', description: 'Event venue or location link' })
  @IsNotEmpty({ message: 'Event location is required.' })
  @IsString({ message: 'Event location must be a string.' })
  @MaxLength(250, { message: 'Event location cannot exceed 250 characters.' })
  location!: string;

  @ApiPropertyOptional({ example: 100, description: 'Maximum allowed attendees' })
  @IsOptional()
  @IsInt({ message: 'Event capacity must be an integer.' })
  @Min(1, { message: 'Event capacity must be at least 1.' })
  capacity?: number;
}
