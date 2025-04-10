import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthToken } from '../common/entities/auth-tokens.entity';
import { User } from '../common/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthToken)
    private authTokenRepository: Repository<AuthToken>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...userData } = user;
    return userData;
  }

  async login(user: Partial<User>) {
    await this.authTokenRepository.delete({ user: { id: user.id } });

    const accessToken = this.jwtService.sign({ sub: user.id });
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret',
      },
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
      await this.authTokenRepository.delete({ refreshToken });
      throw new UnauthorizedException('Refresh token expired');
    }

    try {
      const payload: { sub: string } = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      await this.authTokenRepository.delete({ refreshToken });

      const newAccessToken = this.jwtService.sign({ sub: user.id });
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id },
        {
          expiresIn: '7d',
          secret: process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret',
        },
      );

      await this.authTokenRepository.save({
        user,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async logout(userId: string) {
    await this.authTokenRepository.delete({ user: { id: userId } });
  }

  async sendResetPasswordEmail(email: string) {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      // Retorna OK mesmo se usuário não existir para evitar enumeração
      return;
    }

    const token = this.jwtService.sign(
      { sub: user.id },
      {
        secret: process.env.RESET_PASSWORD_SECRET || 'reset-password-secret',
        expiresIn: '1h',
      },
    );

    await this.mailService.sendPasswordRecoveryEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string };

    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.RESET_PASSWORD_SECRET || 'reset-password-secret',
      });
    } catch (err) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.usersService.findByIdWithPassword(payload.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.save(user);
  }
}
