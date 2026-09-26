import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let configService: any;

  const mockUser = {
    id: 'user-uuid-1',
    name: 'Jenish',
    email: 'jenish@example.com',
    passwordHash: '$2b$10$hashedpassword',
    refreshTokenHash: '$2b$10$hashedrefreshtoken',
    role: 'USER',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string, defaultValue: string) => defaultValue),
      getOrThrow: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully and return access & refresh tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => '$2b$10$hashedpassword');

      const dto = { name: 'Jenish', email: 'jenish@example.com', password: 'Password123!' };
      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'jenish@example.com' } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('jenish@example.com');
    });

    it('should throw ConflictException if user email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const dto = { name: 'Jenish', email: 'jenish@example.com', password: 'Password123!' };
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user and return access & refresh tokens on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const dto = { email: 'jenish@example.com', password: 'Password123!' };
      const result = await service.login(dto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(result.user.id).toBe('user-uuid-1');
    });

    it('should throw UnauthorizedException on invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const dto = { email: 'wrong@example.com', password: 'Password123!' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const dto = { email: 'jenish@example.com', password: 'WrongPassword' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should return new token pair on valid refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-uuid-1' });
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.refreshTokens({ refreshToken: 'valid-refresh-token' });
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });
  });

  describe('logout', () => {
    it('should set user refreshTokenHash to null on logout', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUser, refreshTokenHash: null });

      const result = await service.logout('user-uuid-1');
      expect(result.message).toContain('logged out');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { refreshTokenHash: null },
      });
    });
  });
});
