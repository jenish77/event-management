import { ApiProperty } from '@nestjs/swagger';

export class UserPayloadDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Short-lived JWT access token (15m)' })
  accessToken!: string;

  @ApiProperty({ description: 'Long-lived JWT refresh token (7d)' })
  refreshToken!: string;

  @ApiProperty({ type: UserPayloadDto })
  user!: UserPayloadDto;
}
