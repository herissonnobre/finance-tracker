import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthToken } from '../common/entities/auth-tokens.entity';
import { User } from '../common/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthToken)
    private authTokenRepository: Repository<AuthToken>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findByEmailWithPassword(email);

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (user && isPasswordValid) {
      const { passwordHash, ...userData } = user;
      return userData;
    }
    return null;
  }

  async login(user: Partial<User>) {
    const accessToken = this.jwtService.sign({ sub: user.id });
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    await this.authTokenRepository.save({
      user,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for expiration
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const existingToken = await this.authTokenRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });

    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > existingToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    try {
      const payload: { sub: string } = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const newAccessToken = this.jwtService.sign({ sub: user.id });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async logout(userId: string) {
    await this.authTokenRepository.delete({ user: { id: userId } });
  }
}
