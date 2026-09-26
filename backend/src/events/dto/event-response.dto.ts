import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatorSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  eventDate: Date;

  @ApiProperty()
  location: string;

  @ApiPropertyOptional()
  capacity?: number;

  @ApiProperty({ type: CreatorSummaryDto })
  creator: CreatorSummaryDto;

  @ApiProperty()
  attendeeCount: number;

  @ApiPropertyOptional({ description: 'Indicates if current requesting user is attending' })
  isAttending?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedEventsResponseDto {
  @ApiProperty({ type: [EventResponseDto] })
  data: EventResponseDto[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 20,
      total: 50,
      totalPages: 3,
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
